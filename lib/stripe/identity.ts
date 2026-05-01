import { db } from '@/lib/db';
import { getStripe } from './server';
import { ensureStripeCustomer } from './customer';
import type { User } from '@prisma/client';

/**
 * Creates a Stripe Identity VerificationSession for the user and returns its
 * hosted-page URL. Sets `kycStatus = PENDING` so the UI knows a session is
 * in flight even before the webhook lands.
 */
export async function createIdentitySession(
  user: User,
  returnUrl: string,
): Promise<{ id: string; url: string }> {
  const stripe = getStripe();
  await ensureStripeCustomer(user);

  const session = await stripe.identity.verificationSessions.create({
    type: 'document',
    metadata: { userId: user.id },
    return_url: returnUrl,
    options: {
      document: {
        require_id_number: false,
        require_live_capture: true,
        require_matching_selfie: true,
      },
    },
  });

  if (!session.url) {
    throw new Error('Stripe did not return a verification URL.');
  }

  await db.user.update({
    where: { id: user.id },
    data: { kycStatus: 'PENDING' },
  });

  return { id: session.id, url: session.url };
}
