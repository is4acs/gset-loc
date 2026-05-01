'use server';

import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth/get-current-user';
import { ensureDbUser } from '@/lib/auth/sync-user';
import { bookingDraftSchema, type BookingDraft } from '@/lib/validation/booking';
import { createBooking } from '../create-booking';
import { createBookingCheckoutSession } from '@/lib/stripe/checkout';

export type StartBookingResult =
  | { ok: true; checkoutUrl: string; reference: string }
  | { ok: false; error: string; code?: string };

export async function startBookingAction(input: BookingDraft): Promise<StartBookingResult> {
  const parsed = bookingDraftSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Données invalides' };
  }
  const draft = parsed.data;

  const session = await requireUser('/reservation/nouvelle');
  const user = session.dbUser ?? (await ensureDbUser(session.authUser));

  const equipment = await db.equipment.findUnique({ where: { slug: draft.equipmentSlug } });
  if (!equipment || !equipment.isActive) {
    return { ok: false, error: 'Équipement introuvable.' };
  }

  const result = await createBooking({
    user,
    equipment,
    slotType: draft.slotType,
    startAt: new Date(draft.startAt),
    days: draft.days,
    interventionAddress: draft.interventionAddress || undefined,
  });

  if (!result.ok) {
    return mapError(result.error);
  }

  const booking = await db.booking.findUniqueOrThrow({ where: { id: result.bookingId } });
  try {
    const checkout = await createBookingCheckoutSession({ user, booking, equipment });
    return { ok: true, checkoutUrl: checkout.url, reference: booking.reference };
  } catch (e) {
    // Roll back the booking row when Stripe failed so we don't leak an
    // orphaned PENDING_PAYMENT booking.
    await db.booking.delete({ where: { id: booking.id } }).catch(() => undefined);
    return { ok: false, error: (e as Error).message };
  }
}

function mapError(err: { code: string; message?: string }): StartBookingResult {
  switch (err.code) {
    case 'KYC_REQUIRED':
      return {
        ok: false,
        code: err.code,
        error: 'Vous devez d’abord vérifier votre identité (KYC).',
      };
    case 'NO_UNIT_AVAILABLE':
      return {
        ok: false,
        code: err.code,
        error: 'Aucune unité disponible sur ce créneau. Choisissez un autre horaire.',
      };
    case 'INTERVENTION_ADDRESS_REQUIRED':
      return {
        ok: false,
        code: err.code,
        error: 'Pour un engin avec opérateur, l’adresse d’intervention est obligatoire.',
      };
    default:
      return { ok: false, code: err.code, error: err.message ?? 'Erreur lors de la réservation.' };
  }
}
