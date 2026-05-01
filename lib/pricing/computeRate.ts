export type SlotType = 'HOUR_1' | 'HOUR_2' | 'HALF_DAY' | 'DAY' | 'MULTI_DAY';

export interface EquipmentRates {
  hourlyRate: number;
  halfDayRate: number;
  dayRate: number;
}

export interface ComputeRateInput {
  slotType: SlotType;
  rates: EquipmentRates;
  /** Number of days for MULTI_DAY (>= 2). Ignored for other slot types. */
  days?: number;
}

export interface ComputeRateResult {
  amount: number;
  unitPrice: number;
  quantity: number;
  slotType: SlotType;
}

export function computeRate(input: ComputeRateInput): ComputeRateResult {
  const { slotType, rates } = input;
  assertNonNegativeInt(rates.hourlyRate, 'hourlyRate');
  assertNonNegativeInt(rates.halfDayRate, 'halfDayRate');
  assertNonNegativeInt(rates.dayRate, 'dayRate');

  switch (slotType) {
    case 'HOUR_1':
      return { amount: rates.hourlyRate, unitPrice: rates.hourlyRate, quantity: 1, slotType };
    case 'HOUR_2':
      return {
        amount: rates.hourlyRate * 2,
        unitPrice: rates.hourlyRate,
        quantity: 2,
        slotType,
      };
    case 'HALF_DAY':
      return { amount: rates.halfDayRate, unitPrice: rates.halfDayRate, quantity: 1, slotType };
    case 'DAY':
      return { amount: rates.dayRate, unitPrice: rates.dayRate, quantity: 1, slotType };
    case 'MULTI_DAY': {
      const days = input.days ?? 0;
      if (!Number.isInteger(days) || days < 2) {
        throw new Error('MULTI_DAY requires an integer days >= 2');
      }
      return {
        amount: rates.dayRate * days,
        unitPrice: rates.dayRate,
        quantity: days,
        slotType,
      };
    }
  }
}

function assertNonNegativeInt(value: number, name: string) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer (cents). Got: ${value}`);
  }
}
