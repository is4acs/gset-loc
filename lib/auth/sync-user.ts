import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { db } from '@/lib/db';
import type { CustomerType } from '@prisma/client';

/**
 * Mirrors the Supabase auth user into our `User` table. Idempotent:
 * - If the row exists, it is returned untouched.
 * - Otherwise, it is created with metadata captured during signup.
 *
 * Called from the email-confirmation callback (preferred) and lazily
 * from `getCurrentUser` when a row is missing for any reason.
 */
export async function ensureDbUser(authUser: SupabaseAuthUser) {
  const existing = await db.user.findUnique({ where: { id: authUser.id } });
  if (existing) return existing;

  const meta = authUser.user_metadata ?? {};
  const customerType: CustomerType = meta.customerType === 'PRO' ? 'PRO' : 'INDIVIDUAL';

  return db.user.create({
    data: {
      id: authUser.id,
      email: authUser.email ?? '',
      firstName: typeof meta.firstName === 'string' ? meta.firstName : null,
      lastName: typeof meta.lastName === 'string' ? meta.lastName : null,
      customerType,
    },
  });
}
