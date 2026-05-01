import { z } from 'zod';
import { customerTypeSchema } from './auth';

export const profileSchema = z
  .object({
    firstName: z.string().min(1, 'Prénom requis').max(80),
    lastName: z.string().min(1, 'Nom requis').max(80),
    phone: z
      .string()
      .trim()
      .regex(/^[+0-9 ().-]{6,30}$/, 'Numéro invalide')
      .optional()
      .or(z.literal('')),
    customerType: customerTypeSchema,
    companyName: z.string().max(120).optional().or(z.literal('')),
    siret: z
      .string()
      .trim()
      .regex(/^\d{14}$/, 'SIRET = 14 chiffres')
      .optional()
      .or(z.literal('')),
  })
  .refine(
    (d) =>
      d.customerType !== 'PRO' ||
      (d.companyName && d.companyName.length > 0 && d.siret && d.siret.length === 14),
    { message: 'Raison sociale et SIRET requis pour les pros', path: ['companyName'] },
  );
export type ProfileInput = z.infer<typeof profileSchema>;
