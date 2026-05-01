import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { ensureDbUser } from '@/lib/auth/sync-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = { title: 'Vérification — Retour' };

const STATUS_VIEW: Record<string, { title: string; description: string; tone: string }> = {
  VERIFIED: {
    title: 'Identité vérifiée ✓',
    description: 'Votre vérification est complète. Vous pouvez maintenant réserver du matériel.',
    tone: 'border-emerald-200 bg-emerald-50',
  },
  PENDING: {
    title: 'Vérification en cours',
    description:
      'Stripe a reçu vos documents et nous reviendrons vers vous dès que la vérification sera terminée (en général sous quelques minutes).',
    tone: 'border-amber-200 bg-amber-50',
  },
  REJECTED: {
    title: 'Vérification rejetée',
    description:
      'Les documents fournis n’ont pas été acceptés. Vous pouvez recommencer avec une autre pièce.',
    tone: 'border-red-200 bg-red-50',
  },
  NOT_STARTED: {
    title: 'Vérification annulée',
    description: 'La vérification n’a pas été effectuée. Vous pouvez la relancer.',
    tone: 'border-muted bg-muted/30',
  },
};

export default async function KycReturnPage() {
  const session = await getCurrentUser();
  if (!session) redirect('/connexion?next=/profil');

  const user = session.dbUser ?? (await ensureDbUser(session.authUser));
  const view = STATUS_VIEW[user.kycStatus] ?? STATUS_VIEW.PENDING;

  return (
    <div className="mx-auto max-w-xl">
      <Card className={view.tone}>
        <CardHeader>
          <CardTitle>{view.title}</CardTitle>
          <CardDescription>{view.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          {user.kycStatus !== 'VERIFIED' && (
            <Link
              href="/kyc"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium"
            >
              Recommencer
            </Link>
          )}
          <Link
            href="/profil"
            className="border-input hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-medium"
          >
            Retour au profil
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
