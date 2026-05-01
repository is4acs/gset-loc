import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateFR, formatEurosFromCents } from '@/lib/format';

export const metadata = { title: 'Mes locations' };

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'En attente',
  CONFIRMED: 'Confirmée',
  IN_PROGRESS: 'En cours',
  RETURNED: 'Retourné',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
  DISPUTED: 'Litige',
};

const STATUS_TONES: Record<string, string> = {
  PENDING_PAYMENT: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-emerald-100 text-emerald-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  RETURNED: 'bg-slate-100 text-slate-700',
  COMPLETED: 'bg-slate-100 text-slate-700',
  CANCELLED: 'bg-red-100 text-red-800',
  DISPUTED: 'bg-red-100 text-red-800',
};

export default async function MyBookingsPage() {
  const session = await getCurrentUser();
  if (!session) redirect('/connexion?next=/mes-locations');

  const bookings = await db.booking.findMany({
    where: { userId: session.authUser.id },
    orderBy: { createdAt: 'desc' },
    include: {
      items: { include: { equipmentUnit: { include: { equipment: true } } } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mes locations</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {bookings.length} réservation{bookings.length > 1 ? 's' : ''}.
          </p>
        </div>
        <Link
          href="/catalogue"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center rounded-md px-4 text-sm font-medium"
        >
          Nouvelle réservation
        </Link>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground text-sm">Aucune réservation pour le moment.</p>
            <Link href="/catalogue" className="text-primary mt-3 inline-block text-sm underline">
              Voir le catalogue
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const eq = b.items[0]?.equipmentUnit.equipment;
            return (
              <Link key={b.id} href={`/reservation/${b.reference}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base">{eq?.name ?? 'Réservation'}</CardTitle>
                        <p className="text-muted-foreground mt-1 font-mono text-xs">
                          {b.reference}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_TONES[b.status] ?? 'bg-muted'}`}
                      >
                        {STATUS_LABELS[b.status] ?? b.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="text-muted-foreground flex flex-wrap gap-4 text-xs">
                    <span>{formatDateFR(b.startAt)}</span>
                    <span>·</span>
                    <span className="text-foreground font-medium">
                      {formatEurosFromCents(b.totalAmount, { hideCentsWhenZero: true })}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
