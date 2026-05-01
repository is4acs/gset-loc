import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { ensureDbUser } from '@/lib/auth/sync-user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookingForm } from './booking-form';

export const metadata = { title: 'Nouvelle réservation' };

type SearchParams = Promise<{ equipment?: string; cancelled?: string }>;

export default async function NewBookingPage({ searchParams }: { searchParams: SearchParams }) {
  const { equipment: equipmentSlug, cancelled } = await searchParams;
  if (!equipmentSlug) redirect('/catalogue');

  const session = await getCurrentUser();
  if (!session)
    redirect(
      `/connexion?next=${encodeURIComponent(`/reservation/nouvelle?equipment=${equipmentSlug}`)}`,
    );
  const user = session.dbUser ?? (await ensureDbUser(session.authUser));

  const equipment = await db.equipment.findUnique({
    where: { slug: equipmentSlug },
    include: { category: true },
  });
  if (!equipment || !equipment.isActive) redirect('/catalogue');

  if (user.kycStatus !== 'VERIFIED') {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-semibold tracking-tight">Vérification d’identité requise</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Avant votre première réservation, vous devez vérifier votre identité (Stripe Identity).
        </p>
        <Link
          href="/kyc"
          className="bg-primary text-primary-foreground hover:bg-primary/90 mt-6 inline-flex h-11 items-center rounded-md px-6 text-sm font-medium"
        >
          Démarrer la vérification
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-muted-foreground text-xs uppercase">{equipment.category.name}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{equipment.name}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{equipment.shortDesc}</p>
      </div>

      {cancelled && (
        <Alert>
          <AlertDescription>Paiement annulé. Vous pouvez relancer la réservation.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Choisissez votre créneau</CardTitle>
        </CardHeader>
        <CardContent>
          <BookingForm
            equipmentSlug={equipment.slug}
            requiresOperator={equipment.requiresOperator}
            hourlyRate={equipment.hourlyRate}
            halfDayRate={equipment.halfDayRate}
            dayRate={equipment.dayRate}
            baseDeposit={equipment.baseDeposit}
            trustLevel={user.trustLevel}
          />
        </CardContent>
      </Card>
    </div>
  );
}
