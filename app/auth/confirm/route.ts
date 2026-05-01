import { type NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/auth/supabase-server';
import { ensureDbUser } from '@/lib/auth/sync-user';

type EmailOtpType = 'signup' | 'recovery' | 'invite' | 'magiclink' | 'email_change' | 'email';

const VALID_TYPES = new Set<EmailOtpType>([
  'signup',
  'recovery',
  'invite',
  'magiclink',
  'email_change',
  'email',
]);

/**
 * Handles Supabase email-based redirects: signup confirmation, password
 * recovery, magic links, etc. The link in the email points here with
 * `?token_hash=...&type=...&next=...`.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get('token_hash');
  const rawType = url.searchParams.get('type');
  const next = url.searchParams.get('next') ?? '/profil';

  if (!tokenHash || !rawType || !VALID_TYPES.has(rawType as EmailOtpType)) {
    return NextResponse.redirect(new URL('/connexion?error=lien-invalide', url));
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.verifyOtp({
    type: rawType as EmailOtpType,
    token_hash: tokenHash,
  });

  if (error || !data.user) {
    const params = new URLSearchParams({ error: error?.message ?? 'verification-echouee' });
    return NextResponse.redirect(new URL(`/connexion?${params.toString()}`, url));
  }

  await ensureDbUser(data.user);

  const safeNext = next.startsWith('/') ? next : '/profil';
  return NextResponse.redirect(new URL(safeNext, url));
}
