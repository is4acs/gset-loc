import { z } from 'zod';

export const slotTypeSchema = z.enum(['HOUR_1', 'HOUR_2', 'HALF_DAY', 'DAY', 'MULTI_DAY']);
export type SlotType = z.infer<typeof slotTypeSchema>;

export const bookingDraftSchema = z
  .object({
    equipmentSlug: z.string().min(1),
    slotType: slotTypeSchema,
    /** ISO 8601 date string, time always at minute granularity */
    startAt: z
      .string()
      .datetime({ offset: true })
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)),
    days: z.number().int().min(2).max(30).optional(),
    /** Optional intervention address for equipments with operator */
    interventionAddress: z.string().max(500).optional().or(z.literal('')),
  })
  .refine((d) => d.slotType !== 'MULTI_DAY' || (d.days !== undefined && d.days >= 2), {
    message: 'Nombre de jours requis (min 2) pour le créneau multi-jours',
    path: ['days'],
  });
export type BookingDraft = z.infer<typeof bookingDraftSchema>;
