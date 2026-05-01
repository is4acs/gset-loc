import { describe, expect, it } from 'vitest';
import { computeRate, type EquipmentRates } from './computeRate';

const RATES: EquipmentRates = {
  hourlyRate: 1200, // 12 €
  halfDayRate: 3500, // 35 €
  dayRate: 6000, // 60 €
};

describe('computeRate', () => {
  it('charges hourlyRate × 1 for HOUR_1', () => {
    expect(computeRate({ slotType: 'HOUR_1', rates: RATES })).toEqual({
      amount: 1200,
      unitPrice: 1200,
      quantity: 1,
      slotType: 'HOUR_1',
    });
  });

  it('charges hourlyRate × 2 for HOUR_2', () => {
    expect(computeRate({ slotType: 'HOUR_2', rates: RATES }).amount).toBe(2400);
  });

  it('charges halfDayRate flat for HALF_DAY', () => {
    expect(computeRate({ slotType: 'HALF_DAY', rates: RATES }).amount).toBe(3500);
  });

  it('charges dayRate flat for DAY', () => {
    expect(computeRate({ slotType: 'DAY', rates: RATES }).amount).toBe(6000);
  });

  it('charges dayRate × N for MULTI_DAY', () => {
    expect(computeRate({ slotType: 'MULTI_DAY', rates: RATES, days: 5 }).amount).toBe(30000);
  });

  it('throws when MULTI_DAY days < 2', () => {
    expect(() => computeRate({ slotType: 'MULTI_DAY', rates: RATES, days: 1 })).toThrow();
  });

  it('throws when MULTI_DAY days is missing', () => {
    expect(() => computeRate({ slotType: 'MULTI_DAY', rates: RATES })).toThrow();
  });

  it('throws when MULTI_DAY days is non-integer', () => {
    expect(() => computeRate({ slotType: 'MULTI_DAY', rates: RATES, days: 2.5 })).toThrow();
  });

  it('throws when a rate is negative', () => {
    expect(() =>
      computeRate({
        slotType: 'HOUR_1',
        rates: { ...RATES, hourlyRate: -100 },
      }),
    ).toThrow();
  });

  it('throws when a rate is non-integer (cents must be int)', () => {
    expect(() =>
      computeRate({
        slotType: 'HOUR_1',
        rates: { ...RATES, hourlyRate: 12.5 },
      }),
    ).toThrow();
  });
});
