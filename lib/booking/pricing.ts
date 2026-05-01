import {
  computeRate,
  computeDeposit,
  computeVat,
  type SlotType,
  type TrustLevel,
} from '@/lib/pricing';

export interface BookingPricingInput {
  slotType: SlotType;
  days?: number;
  hourlyRate: number;
  halfDayRate: number;
  dayRate: number;
  baseDeposit: number;
  requiresOperator: boolean;
  trustLevel: TrustLevel;
}

export interface BookingPricing {
  rentalAmount: number; // HT cents
  operatorAmount: number;
  insuranceAmount: number;
  deliveryAmount: number;
  vatAmount: number; // 8.5% of taxable HT
  totalAmount: number; // TTC, what the customer pays
  depositAmount: number; // hors TVA, empreinte CB
}

/**
 * Computes a complete pricing snapshot for a booking. The operator fee is
 * already included in the equipment's rate (per CLAUDE.md). Insurance and
 * delivery are reserved fields, kept at 0 for MVP.
 */
export function priceBooking(input: BookingPricingInput): BookingPricing {
  const rate = computeRate({
    slotType: input.slotType,
    rates: {
      hourlyRate: input.hourlyRate,
      halfDayRate: input.halfDayRate,
      dayRate: input.dayRate,
    },
    days: input.days,
  });

  const rentalAmount = rate.amount;
  const operatorAmount = 0; // bundled in rentalAmount per spec
  const insuranceAmount = 0;
  const deliveryAmount = 0;

  const taxable = rentalAmount + operatorAmount + insuranceAmount + deliveryAmount;
  const vatAmount = computeVat(taxable);
  const totalAmount = taxable + vatAmount;

  const depositAmount = computeDeposit({
    baseDeposit: input.baseDeposit,
    trustLevel: input.trustLevel,
    requiresOperator: input.requiresOperator,
  });

  return {
    rentalAmount,
    operatorAmount,
    insuranceAmount,
    deliveryAmount,
    vatAmount,
    totalAmount,
    depositAmount,
  };
}
