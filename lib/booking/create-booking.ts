import type { User, Equipment, BookingStatus, SlotType } from '@prisma/client';
import { db } from '@/lib/db';
import { findAvailableUnit, SLOT_DURATION_MS } from './availability';
import { generateBookingReference } from './reference';
import { priceBooking } from './pricing';

export interface CreateBookingInput {
  user: User;
  equipment: Equipment;
  slotType: SlotType;
  startAt: Date;
  /** For MULTI_DAY only */
  days?: number;
  interventionAddress?: string;
}

export type CreateBookingError =
  | { code: 'KYC_REQUIRED' }
  | { code: 'NO_UNIT_AVAILABLE' }
  | { code: 'INVALID_INPUT'; message: string }
  | { code: 'INTERVENTION_ADDRESS_REQUIRED' };

export async function createBooking(
  input: CreateBookingInput,
): Promise<
  { ok: true; bookingId: string; reference: string } | { ok: false; error: CreateBookingError }
> {
  if (input.user.kycStatus !== 'VERIFIED') {
    return { ok: false, error: { code: 'KYC_REQUIRED' } };
  }

  if (input.equipment.requiresOperator && !input.interventionAddress?.trim()) {
    return { ok: false, error: { code: 'INTERVENTION_ADDRESS_REQUIRED' } };
  }

  // Compute end date
  const endAt = computeEndDate(input.slotType, input.startAt, input.days);
  if (!endAt) {
    return { ok: false, error: { code: 'INVALID_INPUT', message: 'Slot type non supporté' } };
  }

  // Pick an available unit
  const unit = await findAvailableUnit(input.equipment.id, { startAt: input.startAt, endAt });
  if (!unit) {
    return { ok: false, error: { code: 'NO_UNIT_AVAILABLE' } };
  }

  const pricing = priceBooking({
    slotType: input.slotType,
    days: input.days,
    hourlyRate: input.equipment.hourlyRate,
    halfDayRate: input.equipment.halfDayRate,
    dayRate: input.equipment.dayRate,
    baseDeposit: input.equipment.baseDeposit,
    requiresOperator: input.equipment.requiresOperator,
    trustLevel: input.user.trustLevel,
  });

  const reference = await generateBookingReference();

  const status: BookingStatus = 'PENDING_PAYMENT';
  const booking = await db.booking.create({
    data: {
      reference,
      userId: input.user.id,
      startAt: input.startAt,
      endAt,
      slotType: input.slotType,
      status,
      rentalAmount: pricing.rentalAmount,
      operatorAmount: pricing.operatorAmount,
      insuranceAmount: pricing.insuranceAmount,
      deliveryAmount: pricing.deliveryAmount,
      vatAmount: pricing.vatAmount,
      totalAmount: pricing.totalAmount,
      depositAmount: pricing.depositAmount,
      interventionAddress: input.interventionAddress?.trim() || null,
      items: {
        create: {
          equipmentUnitId: unit.id,
          unitPrice: pricing.rentalAmount,
        },
      },
    },
  });

  return { ok: true, bookingId: booking.id, reference };
}

function computeEndDate(slotType: SlotType, startAt: Date, days?: number): Date | null {
  if (slotType === 'MULTI_DAY') {
    if (!days || days < 2) return null;
    const end = new Date(startAt);
    end.setDate(end.getDate() + days);
    return end;
  }
  const ms = SLOT_DURATION_MS[slotType];
  if (!ms) return null;
  return new Date(startAt.getTime() + ms);
}
