import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { ensureDbUser } from '@/lib/auth/sync-user';
import { ProfileForm } from './profile-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = { title: 'Profil' };

const KYC_LABEL: Record<string, { label: string; tone: string }> = {
  NOT_STARTED: { label: 'Non démarré', tone: 'bg-muted text-muted-foreground' },
  PENDING: { label: 'En cours de vérification', tone: 'bg-amber-100 text-amber-800' },
  VERIFIED: { label: 'Vérifié', tone: 'bg-emerald-100 text-emerald-800' },
  REJECTED: { label: 'Rejeté', tone: 'bg-red-100 text-red-800' },
};

export default async function ProfilePage() {
  const session = await getCurrentUser();
  if (!session) redirect('/connexion?next=/profil');

  // Ensure the DB row exists (defensive — the email-confirm callback already
  // creates it, but this covers manual login or trigger gaps).
  const user = session.dbUser ?? (await ensureDbUser(session.authUser));
  const kyc = KYC_LABEL[user.kycStatus] ?? KYC_LABEL.NOT_STARTED;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Profil</h1>
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${kyc.tone}`}>
          KYC : {kyc.label}
        </span>
      </div>

      {user.kycStatus !== 'VERIFIED' && (
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader>
            <CardTitle className="text-base">Vérification d&apos;identité</CardTitle>
            <CardDescription>
              Avant votre première location, vous devrez vérifier votre identité (Stripe Identity).
              Ça prend 2 minutes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/kyc"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium"
            >
              {user.kycStatus === 'PENDING'
                ? 'Reprendre la vérification'
                : 'Démarrer la vérification'}
            </Link>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            defaultValues={{
              firstName: user.firstName ?? '',
              lastName: user.lastName ?? '',
              phone: user.phone ?? '',
              customerType: user.customerType,
              companyName: user.companyName ?? '',
              siret: user.siret ?? '',
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
