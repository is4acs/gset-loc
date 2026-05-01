'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../supabase-server';
import { ensureDbUser } from '../sync-user';
import { loginSchema, type LoginInput } from '@/lib/validation/auth';

export type LoginResult = { success: false; error: string };

export async function loginAction(input: LoginInput, next?: string): Promise<LoginResult | void> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation invalide' };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return { success: false, error: friendlyAuthError(error?.message ?? 'Identifiants invalides') };
  }

  await ensureDbUser(data.user);

  const target = next && next.startsWith('/') ? next : '/profil';
  redirect(target);
}

function friendlyAuthError(msg: string): string {
  if (/invalid login credentials|invalid grant/i.test(msg))
    return 'Email ou mot de passe incorrect.';
  if (/email.*not confirmed/i.test(msg))
    return 'Email pas encore confirmé. Vérifiez votre boîte de réception.';
  return msg;
}
