import { describe, expect, it } from 'vitest';
import { computeVat, htToTtc } from './computeVat';
import { VAT_RATE_GUYANE } from './constants';

describe('computeVat', () => {
  it('uses 8.5% Guyane DOM rate by default', () => {
    expect(VAT_RATE_GUYANE).toBe(0.085);
  });

  it('returns the right VAT for round amounts', () => {
    expect(computeVat(10000)).toBe(850); // 100 € × 8.5% = 8.50 €
    expect(computeVat(1000)).toBe(85); // 10 € × 8.5% = 0.85 €
    expect(computeVat(100000)).toBe(8500); // 1000 € × 8.5% = 85.00 €
  });

  it('rounds half-cents up', () => {
    // 1234 cents × 0.085 = 104.89 → 105
    expect(computeVat(1234)).toBe(105);
  });

  it('returns 0 for amount=0', () => {
    expect(computeVat(0)).toBe(0);
  });

  it('throws on negative or non-integer amount', () => {
    expect(() => computeVat(-100)).toThrow();
    expect(() => computeVat(99.99)).toThrow();
  });

  it('accepts a custom rate (e.g., metropolitan 20%)', () => {
    expect(computeVat(10000, 0.2)).toBe(2000);
  });

  it('throws on out-of-range rate', () => {
    expect(() => computeVat(10000, -0.1)).toThrow();
    expect(() => computeVat(10000, 1.1)).toThrow();
  });
});

describe('htToTtc', () => {
  it('adds the VAT to the HT amount', () => {
    expect(htToTtc(10000)).toBe(10850);
    expect(htToTtc(1000)).toBe(1085);
  });

  it('returns the HT amount when rate is 0', () => {
    expect(htToTtc(10000, 0)).toBe(10000);
  });
});
