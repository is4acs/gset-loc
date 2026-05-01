'use server';

import { createSupabaseServerClient } from '../supabase-server';
import { signupSchema, type SignupInput } from '@/lib/validation/auth';

export type SignupResult =
  | { success: true; emailSent: boolean }
  | { success: false; error: string };

export async function signupAction(input: SignupInput): Promise<SignupResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation invalide' };
  }

  const supabase = await createSupabaseServerClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${appUrl}/auth/confirm`,
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        customerType: parsed.data.customerType,
      },
    },
  });

  if (error) {
    return { success: false, error: friendlyAuthError(error.message) };
  }

  // Supabase returns `user` with no session when email confirmation is required.
  return { success: true, emailSent: !data.session };
}

function friendlyAuthError(msg: string): string {
  if (/already registered|user already/i.test(msg)) return 'Un compte existe déjà avec cet email.';
  if (/password/i.test(msg) && /weak/i.test(msg)) return 'Mot de passe trop faible.';
  return msg;
}
