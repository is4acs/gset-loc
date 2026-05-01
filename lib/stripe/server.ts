import Stripe from 'stripe';

let cached: Stripe | null = null;

/**
 * Server-only Stripe client. Never import from a client component.
 * The constructor is lazy so the module can be imported in code paths that
 * don't actually call Stripe (avoids requiring the secret at build time).
 */
export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set.');
  }
  cached = new Stripe(key);
  return cached;
}
