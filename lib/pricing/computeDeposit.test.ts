import { describe, expect, it } from 'vitest';
import { computeDeposit } from './computeDeposit';

describe('computeDeposit', () => {
  it('STANDARD trust level applies the full base deposit', () => {
    expect(
      computeDeposit({ baseDeposit: 30000, trustLevel: 'STANDARD', requiresOperator: false }),
    ).toBe(30000);
  });

  it('CONFIRMED applies a 25% discount', () => {
    expect(
      computeDeposit({ baseDeposit: 30000, trustLevel: 'CONFIRMED', requiresOperator: false }),
    ).toBe(22500);
  });

  it('PREMIUM applies a 50% discount', () => {
    expect(
      computeDeposit({ baseDeposit: 30000, trustLevel: 'PREMIUM', requiresOperator: false }),
    ).toBe(15000);
  });

  it('returns 0 when equipment requires an operator (regardless of trust)', () => {
    expect(
      computeDeposit({ baseDeposit: 50000, trustLevel: 'STANDARD', requiresOperator: true }),
    ).toBe(0);
    expect(
      computeDeposit({ baseDeposit: 50000, trustLevel: 'PREMIUM', requiresOperator: true }),
    ).toBe(0);
  });

  it('returns 0 for free equipment (baseDeposit=0)', () => {
    expect(
      computeDeposit({ baseDeposit: 0, trustLevel: 'STANDARD', requiresOperator: false }),
    ).toBe(0);
  });

  it('rounds half-cents up to nearest integer cent', () => {
    expect(
      computeDeposit({ baseDeposit: 33333, trustLevel: 'CONFIRMED', requiresOperator: false }),
    ).toBe(25000); // 33333 * 0.75 = 24999.75 → 25000
  });

  it('throws on negative base deposit', () => {
    expect(() =>
      computeDeposit({ baseDeposit: -100, trustLevel: 'STANDARD', requiresOperator: false }),
    ).toThrow();
  });

  it('throws on non-integer base deposit', () => {
    expect(() =>
      computeDeposit({ baseDeposit: 99.99, trustLevel: 'STANDARD', requiresOperator: false }),
    ).toThrow();
  });
});
