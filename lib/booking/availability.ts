import { db } from '@/lib/db';
import { BOOKING_BUFFER_MINUTES } from '@/lib/pricing';
import type { EquipmentUnit } from '@prisma/client';

export interface AvailabilityWindow {
  startAt: Date;
  endAt: Date;
}

const BUFFER_MS = BOOKING_BUFFER_MINUTES * 60 * 1000;

/**
 * True if the unit is bookable for the requested window. Considers:
 * - the unit's status (must be AVAILABLE)
 * - any non-cancelled booking that would overlap, with a 30-minute buffer
 *   on each side.
 */
export async function isUnitAvailable(
  unitId: string,
  window: AvailabilityWindow,
): Promise<boolean> {
  const bufferStart = new Date(window.startAt.getTime() - BUFFER_MS);
  const bufferEnd = new Date(window.endAt.getTime() + BUFFER_MS);

  const unit = await db.equipmentUnit.findUnique({ where: { id: unitId } });
  if (!unit || unit.status !== 'AVAILABLE') return false;

  const overlap = await db.bookingItem.findFirst({
    where: {
      equipmentUnitId: unitId,
      booking: {
        status: { not: 'CANCELLED' },
        // existing booking overlaps if existing.startAt < bufferEnd AND existing.endAt > bufferStart
        startAt: { lt: bufferEnd },
        endAt: { gt: bufferStart },
      },
    },
    select: { id: true },
  });

  return !overlap;
}

/**
 * Picks the first available unit for a given equipment in the requested
 * window. Returns null if all units are busy.
 */
export async function findAvailableUnit(
  equipmentId: string,
  window: AvailabilityWindow,
): Promise<EquipmentUnit | null> {
  const units = await db.equipmentUnit.findMany({
    where: { equipmentId, status: 'AVAILABLE' },
    orderBy: { internalCode: 'asc' },
  });

  for (const unit of units) {
    if (await isUnitAvailable(unit.id, window)) {
      return unit;
    }
  }
  return null;
}

/**
 * Slot type → window length in milliseconds. MULTI_DAY is computed
 * separately because it depends on the chosen number of days.
 */
export const SLOT_DURATION_MS: Record<string, number> = {
  HOUR_1: 1 * 60 * 60 * 1000,
  HOUR_2: 2 * 60 * 60 * 1000,
  HALF_DAY: 4 * 60 * 60 * 1000,
  DAY: 8 * 60 * 60 * 1000,
};
