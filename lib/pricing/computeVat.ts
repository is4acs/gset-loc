import { VAT_RATE_GUYANE } from './constants';

/**
 * Computes the VAT amount (in cents) applied to a HT (excluding tax) amount.
 * Caution / security deposit is NOT taxable and should not be passed here.
 */
export function computeVat(amountHt: number, rate: number = VAT_RATE_GUYANE): number {
  if (!Number.isInteger(amountHt) || amountHt < 0) {
    throw new Error('amountHt must be a non-negative integer (cents).');
  }
  if (rate < 0 || rate > 1) {
    throw new Error('rate must be in [0, 1].');
  }
  return Math.round(amountHt * rate);
}

/**
 * Convert HT amount to TTC (HT + VAT).
 */
export function htToTtc(amountHt: number, rate: number = VAT_RATE_GUYANE): number {
  return amountHt + computeVat(amountHt, rate);
}
