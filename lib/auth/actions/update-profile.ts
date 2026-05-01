'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireUser } from '../get-current-user';
import { profileSchema, type ProfileInput } from '@/lib/validation/profile';

export type UpdateProfileResult = { success: true } | { success: false; error: string };

export async function updateProfileAction(input: ProfileInput): Promise<UpdateProfileResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation invalide' };
  }

  const session = await requireUser('/profil');
  const data = parsed.data;

  await db.user.update({
    where: { id: session.authUser.id },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || null,
      customerType: data.customerType,
      companyName: data.customerType === 'PRO' ? data.companyName || null : null,
      siret: data.customerType === 'PRO' ? data.siret || null : null,
    },
  });

  revalidatePath('/profil');
  return { success: true };
}
