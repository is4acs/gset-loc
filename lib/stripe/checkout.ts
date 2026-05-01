import { getStripe } from './server';
import { ensureStripeCustomer } from './customer';
import type { Booking, Equipment, User } from '@prisma/client';

interface CheckoutInput {
  user: User;
  booking: Booking;
  equipment: Equipment;
}

/**
 * Creates a Stripe Checkout session for the rental amount. Saves the
 * payment method for off-session reuse so the deposit pre-authorization
 * (manual capture) can be created server-side from the webhook.
 */
export async function createBookingCheckoutSession(
  input: CheckoutInput,
): Promise<{ url: string; sessionId: string }> {
  const stripe = getStripe();
  const customerId = await ensureStripeCustomer(input.user);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: customerId,
    locale: 'fr',
    line_items: [
      {
        price_data: {
          currency: 'eur',
          unit_amount: input.booking.totalAmount,
          product_data: {
            name: `Location ${input.equipment.name}`,
            description: `Réservation ${input.booking.reference} (TVA 8,5 % incluse)`,
          },
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      // Re-use the saved card off-session for the deposit pre-authorization.
      setup_future_usage: 'off_session',
      metadata: {
        bookingId: input.booking.id,
        type: 'rental',
      },
    },
    metadata: {
      bookingId: input.booking.id,
      bookingReference: input.booking.reference,
      depositAmount: String(input.booking.depositAmount),
    },
    success_url: `${appUrl}/reservation/${input.booking.reference}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/reservation/nouvelle?equipment=${input.equipment.slug}&cancelled=1`,
  });

  if (!session.url) {
    throw new Error('Stripe did not return a checkout URL.');
  }
  return { url: session.url, sessionId: session.id };
}
