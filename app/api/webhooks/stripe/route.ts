import { type NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Stripe webhook entry point. Verifies the signature against
 * STRIPE_WEBHOOK_SECRET, then dispatches by event type.
 *
 * Local dev: run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
 * and copy the printed `whsec_...` into STRIPE_WEBHOOK_SECRET.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get('stripe-signature');

  if (!secret) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'webhook-not-configured' }, { status: 503 });
  }
  if (!signature) {
    return NextResponse.json({ error: 'missing-signature' }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (e) {
    console.error('[stripe-webhook] signature verification failed:', (e as Error).message);
    return NextResponse.json({ error: 'invalid-signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'identity.verification_session.verified':
        await handleIdentityVerified(event.data.object as Stripe.Identity.VerificationSession);
        break;
      case 'identity.verification_session.requires_input':
        await handleIdentityRequiresInput(event.data.object as Stripe.Identity.VerificationSession);
        break;
      case 'identity.verification_session.canceled':
        await handleIdentityCanceled(event.data.object as Stripe.Identity.VerificationSession);
        break;
      default:
        // Ignore unknown event types — Stripe retries only on 5xx, so we
        // acknowledge with 200 to skip retries for events we don't care about.
        break;
    }
  } catch (e) {
    console.error('[stripe-webhook] handler error for', event.type, ':', (e as Error).message);
    return NextResponse.json({ error: 'handler-failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleIdentityVerified(s: Stripe.Identity.VerificationSession) {
  const userId = s.metadata?.userId;
  if (!userId) {
    console.warn('[stripe-webhook] verified session has no userId metadata, id=', s.id);
    return;
  }
  await db.user.update({
    where: { id: userId },
    data: { kycStatus: 'VERIFIED', kycVerifiedAt: new Date() },
  });
}

async function handleIdentityRequiresInput(s: Stripe.Identity.VerificationSession) {
  const userId = s.metadata?.userId;
  if (!userId) return;
  // requires_input is sent on document/selfie failure with details in last_error.
  // Mark as REJECTED so the user has to start a fresh session; alternative is
  // PENDING + a banner showing s.last_error.reason.
  const code = s.last_error?.code;
  await db.user.update({
    where: { id: userId },
    data: {
      kycStatus: code ? 'REJECTED' : 'PENDING',
      kycVerifiedAt: null,
    },
  });
}

async function handleIdentityCanceled(s: Stripe.Identity.VerificationSession) {
  const userId = s.metadata?.userId;
  if (!userId) return;
  await db.user.update({
    where: { id: userId },
    data: { kycStatus: 'NOT_STARTED', kycVerifiedAt: null },
  });
}
