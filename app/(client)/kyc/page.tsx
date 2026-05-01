import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { ensureDbUser } from '@/lib/auth/sync-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KycLauncher } from './kyc-launcher';

export const metadata = { title: 'Vérification d’identité' };

export default async function KycPage() {
  const session = await getCurrentUser();
  if (!session) redirect('/connexion?next=/kyc');

  const user = session.dbUser ?? (await ensureDbUser(session.authUser));

  if (user.kycStatus === 'VERIFIED') {
    redirect('/profil');
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Vérification d’identité</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Avant votre première location, nous vérifions votre identité via Stripe (norme eIDAS,
          conforme RGPD).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ce dont vous avez besoin</CardTitle>
          <CardDescription>
            Une pièce d&apos;identité officielle (CNI, passeport ou permis) et un téléphone ou
            webcam.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
            <li>Photo recto/verso de votre pièce</li>
            <li>Selfie pour vérifier la correspondance</li>
            <li>Durée : ~2 minutes</li>
          </ul>
          <KycLauncher
            currentStatus={user.kycStatus}
            customerType={user.customerType}
            companyName={user.companyName}
            siret={user.siret}
          />
        </CardContent>
      </Card>
    </div>
  );
}
