import { type NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe/server';
import { db } from '@/lib/db';
import { bookingConfirmationEmail } from '@/lib/notifications/booking-emails';
import { issueInvoiceForBooking } from '@/lib/booking/issue-invoice';

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
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'checkout.session.expired':
        await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        // Acknowledge unknown event types so Stripe doesn't retry.
        break;
    }
  } catch (e) {
    console.error('[stripe-webhook] handler error for', event.type, ':', (e as Error).message);
    return NextResponse.json({ error: 'handler-failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ──────────────────────────────────────────────────────────────────────
// Identity (KYC)
// ──────────────────────────────────────────────────────────────────────

async function handleIdentityVerified(s: Stripe.Identity.VerificationSession) {
  const userId = s.metadata?.userId;
  if (!userId) return;
  await db.user.update({
    where: { id: userId },
    data: { kycStatus: 'VERIFIED', kycVerifiedAt: new Date() },
  });
}

async function handleIdentityRequiresInput(s: Stripe.Identity.VerificationSession) {
  const userId = s.metadata?.userId;
  if (!userId) return;
  const code = s.last_error?.code;
  await db.user.update({
    where: { id: userId },
    data: { kycStatus: code ? 'REJECTED' : 'PENDING', kycVerifiedAt: null },
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

// ──────────────────────────────────────────────────────────────────────
// Bookings (rental + deposit pre-authorization)
// ──────────────────────────────────────────────────────────────────────

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) return;

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: true,
      items: { include: { equipmentUnit: { include: { equipment: true } } } },
    },
  });
  if (!booking || booking.status !== 'PENDING_PAYMENT') return;

  const stripe = getStripe();

  // Retrieve the rental PaymentIntent to get the saved payment method.
  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id;
  if (!paymentIntentId) return;
  const rentalPi = await stripe.paymentIntents.retrieve(paymentIntentId);
  const paymentMethodId =
    typeof rentalPi.payment_method === 'string'
      ? rentalPi.payment_method
      : rentalPi.payment_method?.id;

  // Create the deposit pre-authorization (manual capture) when applicable.
  let depositAuthId: string | null = null;
  if (booking.depositAmount > 0 && paymentMethodId && booking.user.stripeCustomerId) {
    try {
      const depositPi = await stripe.paymentIntents.create({
        amount: booking.depositAmount,
        currency: 'eur',
        customer: booking.user.stripeCustomerId,
        payment_method: paymentMethodId,
        capture_method: 'manual',
        confirm: true,
        off_session: true,
        metadata: { bookingId: booking.id, type: 'deposit' },
      });
      depositAuthId = depositPi.id;
    } catch (e) {
      // Deposit pre-auth failure does not block confirmation but is logged.
      console.error('[stripe-webhook] deposit pre-auth failed:', (e as Error).message);
    }
  }

  await db.booking.update({
    where: { id: booking.id },
    data: {
      status: 'CONFIRMED',
      paymentIntentId,
      depositAuthId,
    },
  });

  // Generate the invoice (best-effort; upload to Supabase Storage may fail
  // silently if the bucket isn't created yet — the row is still inserted).
  try {
    await issueInvoiceForBooking(booking.id);
  } catch (e) {
    console.error('[stripe-webhook] invoice issuance failed:', (e as Error).message);
  }

  const equipment = booking.items[0]?.equipmentUnit.equipment;
  if (equipment) {
    await bookingConfirmationEmail({
      reference: booking.reference,
      totalAmount: booking.totalAmount,
      depositAmount: booking.depositAmount,
      startAt: booking.startAt,
      endAt: booking.endAt,
      equipmentName: equipment.name,
      customerEmail: booking.user.email,
      customerFirstName: booking.user.firstName,
    });
  }
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) return;
  await db.booking.updateMany({
    where: { id: bookingId, status: 'PENDING_PAYMENT' },
    data: { status: 'CANCELLED', cancelledAt: new Date() },
  });
}

async function handlePaymentFailed(pi: Stripe.PaymentIntent) {
  const bookingId = pi.metadata?.bookingId;
  const type = pi.metadata?.type;
  if (!bookingId) return;

  if (type === 'deposit') {
    // Deposit pre-auth failed: keep the booking confirmed but flag the issue.
    console.warn('[stripe-webhook] deposit pre-auth failed for booking', bookingId);
    return;
  }

  // Rental payment failed
  await db.booking.updateMany({
    where: { id: bookingId, status: 'PENDING_PAYMENT' },
    data: { status: 'CANCELLED', cancelledAt: new Date() },
  });
}
