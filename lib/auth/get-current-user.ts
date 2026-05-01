import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { createSupabaseServerClient } from './supabase-server';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import type { User as DbUser } from '@prisma/client';

export type Session = { authUser: SupabaseAuthUser; dbUser: DbUser | null };

/**
 * Returns the current Supabase user + the matching DB row, or null when
 * unauthenticated. Always uses `getUser()` (server-validated JWT), never
 * `getSession()` (which reads the cookie unverified).
 */
export async function getCurrentUser(): Promise<Session | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const dbUser = await db.user.findUnique({ where: { id: user.id } });
  return { authUser: user, dbUser };
}

/**
 * Like `getCurrentUser` but redirects to `/connexion` when unauthenticated,
 * and throws a clear error when the DB row is missing (sync mismatch).
 */
export async function requireUser(returnTo?: string) {
  const session = await getCurrentUser();
  if (!session) {
    const target = returnTo ? `/connexion?next=${encodeURIComponent(returnTo)}` : '/connexion';
    redirect(target);
  }
  return session;
}
