import { db } from '@/lib/db';
import { getStripe } from './server';
import type { User } from '@prisma/client';

/**
 * Returns the Stripe customer id for the user, creating it on first access.
 * Idempotent: subsequent calls reuse the stored id.
 */
export async function ensureStripeCustomer(user: User): Promise<string> {
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: user.email,
    name: [user.firstName, user.lastName].filter(Boolean).join(' ') || undefined,
    phone: user.phone ?? undefined,
    metadata: { userId: user.id, customerType: user.customerType },
  });

  await db.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}
