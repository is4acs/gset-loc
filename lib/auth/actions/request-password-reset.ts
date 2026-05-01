'use server';

import { createSupabaseServerClient } from '../supabase-server';
import { requestPasswordResetSchema, type RequestPasswordResetInput } from '@/lib/validation/auth';

export type RequestResetResult = { success: true } | { success: false; error: string };

export async function requestPasswordResetAction(
  input: RequestPasswordResetInput,
): Promise<RequestResetResult> {
  const parsed = requestPasswordResetSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Email invalide' };
  }

  const supabase = await createSupabaseServerClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${appUrl}/auth/confirm?next=/profil/securite`,
  });

  // We always return success to avoid leaking which emails exist.
  if (error) {
    console.error('[reset-password] supabase error:', error.message);
  }
  return { success: true };
}
