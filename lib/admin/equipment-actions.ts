'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/require-admin';

export async function toggleEquipmentActiveAction(slug: string): Promise<{ ok: boolean }> {
  await requireAdmin('/admin/flotte');
  const eq = await db.equipment.findUnique({ where: { slug } });
  if (!eq) return { ok: false };
  await db.equipment.update({
    where: { slug },
    data: { isActive: !eq.isActive },
  });
  revalidatePath('/admin/flotte');
  revalidatePath('/catalogue');
  return { ok: true };
}
