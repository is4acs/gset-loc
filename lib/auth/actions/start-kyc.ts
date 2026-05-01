'use server';

import { requireUser } from '../get-current-user';
import { ensureDbUser } from '../sync-user';
import { createIdentitySession } from '@/lib/stripe/identity';

export type StartKycResult = { success: true; url: string } | { success: false; error: string };

export async function startKycAction(): Promise<StartKycResult> {
  const session = await requireUser('/kyc');
  const user = session.dbUser ?? (await ensureDbUser(session.authUser));

  if (user.kycStatus === 'VERIFIED') {
    return { success: false, error: 'Identité déjà vérifiée.' };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  try {
    const { url } = await createIdentitySession(user, `${appUrl}/kyc/retour`);
    return { success: true, url };
  } catch (e) {
    const msg = (e as Error).message;
    if (/identity.*not.*activated|identity.*disabled/i.test(msg)) {
      return {
        success: false,
        error:
          'Stripe Identity n’est pas activé sur votre compte. Activez-le dans Stripe → Identity puis réessayez.',
      };
    }
    return { success: false, error: msg };
  }
}
