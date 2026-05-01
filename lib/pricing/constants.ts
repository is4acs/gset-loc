/**
 * VAT rate for French Guiana (DOM dérogatoire). All rentals, operator fees,
 * insurance and delivery use this rate. Security deposits are NOT taxable.
 */
export const VAT_RATE_GUYANE = 0.085;

/**
 * Buffer between two consecutive bookings on the same equipment unit, in
 * minutes. Covers cleaning, check-in/out, and operator transition.
 */
export const BOOKING_BUFFER_MINUTES = 30;

/**
 * Trust-level multiplier applied to the equipment's base deposit. PREMIUM
 * cuts deposits in half; CONFIRMED applies a 25% discount.
 */
export const DEPOSIT_MULTIPLIER = {
  STANDARD: 1.0,
  CONFIRMED: 0.75,
  PREMIUM: 0.5,
} as const;

/**
 * Promotion thresholds for the trust-level engine.
 */
export const TRUST_LEVEL_THRESHOLDS = {
  CONFIRMED_MIN_BOOKINGS: 3,
  PREMIUM_MIN_BOOKINGS: 10,
} as const;
