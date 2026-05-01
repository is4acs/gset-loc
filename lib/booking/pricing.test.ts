import { describe, expect, it } from 'vitest';
import { priceBooking } from './pricing';

const SELF_SERVICE = {
  hourlyRate: 1200, // 12 €
  halfDayRate: 3500,
  dayRate: 6000,
  baseDeposit: 30000, // 300 €
  requiresOperator: false,
} as const;

describe('priceBooking — self-service tool', () => {
  it('1h booking, STANDARD trust', () => {
    const p = priceBooking({ ...SELF_SERVICE, slotType: 'HOUR_1', trustLevel: 'STANDARD' });
    expect(p.rentalAmount).toBe(1200);
    expect(p.vatAmount).toBe(102); // 1200 × 0.085
    expect(p.totalAmount).toBe(1302);
    expect(p.depositAmount).toBe(30000);
  });

  it('half-day booking, CONFIRMED trust applies 25% deposit discount', () => {
    const p = priceBooking({ ...SELF_SERVICE, slotType: 'HALF_DAY', trustLevel: 'CONFIRMED' });
    expect(p.rentalAmount).toBe(3500);
    expect(p.depositAmount).toBe(22500);
    expect(p.vatAmount).toBe(298); // 3500 × 0.085 = 297.5 → 298
  });

  it('multi-day 5 days, PREMIUM trust', () => {
    const p = priceBooking({
      ...SELF_SERVICE,
      slotType: 'MULTI_DAY',
      days: 5,
      trustLevel: 'PREMIUM',
    });
    expect(p.rentalAmount).toBe(30000);
    expect(p.depositAmount).toBe(15000);
    expect(p.totalAmount).toBe(30000 + Math.round(30000 * 0.085));
  });
});

describe('priceBooking — equipment with operator', () => {
  const WITH_OP = {
    hourlyRate: 11000,
    halfDayRate: 40000,
    dayRate: 65000,
    baseDeposit: 0,
    requiresOperator: true,
  } as const;

  it('day booking with operator: deposit always 0, regardless of trust', () => {
    const p1 = priceBooking({ ...WITH_OP, slotType: 'DAY', trustLevel: 'STANDARD' });
    const p2 = priceBooking({ ...WITH_OP, slotType: 'DAY', trustLevel: 'PREMIUM' });
    expect(p1.depositAmount).toBe(0);
    expect(p2.depositAmount).toBe(0);
    expect(p1.rentalAmount).toBe(65000);
  });
});
