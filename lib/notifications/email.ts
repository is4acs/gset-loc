import { Resend } from 'resend';

let cached: Resend | null = null;

function getResend(): Resend | null {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  cached = new Resend(key);
  return cached;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends a transactional email through Resend. Returns false (and logs a
 * warning) when RESEND_API_KEY is not configured — the rest of the app
 * keeps working in that case.
 */
export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping email to', input.to);
    return false;
  }

  const from = process.env.RESEND_FROM_EMAIL ?? 'GSET Location <onboarding@resend.dev>';
  try {
    await resend.emails.send({ from, to: input.to, subject: input.subject, html: input.html });
    return true;
  } catch (e) {
    console.error('[email] resend error:', (e as Error).message);
    return false;
  }
}
