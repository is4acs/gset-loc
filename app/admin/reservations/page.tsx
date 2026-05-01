import Link from 'next/link';
import { db } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { formatDateFR, formatEurosFromCents } from '@/lib/format';
import type { BookingStatus } from '@prisma/client';

export const metadata = { title: 'Admin · Réservations' };

const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING_PAYMENT: 'En attente',
  CONFIRMED: 'Confirmée',
  IN_PROGRESS: 'En cours',
  RETURNED: 'Retourné',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
  DISPUTED: 'Litige',
};

const STATUS_TONES: Record<BookingStatus, string> = {
  PENDING_PAYMENT: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-emerald-100 text-emerald-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  RETURNED: 'bg-slate-100 text-slate-700',
  COMPLETED: 'bg-slate-100 text-slate-700',
  CANCELLED: 'bg-red-100 text-red-800',
  DISPUTED: 'bg-red-100 text-red-800',
};

const STATUS_OPTIONS: { value: BookingStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Toutes' },
  { value: 'PENDING_PAYMENT', label: 'En attente' },
  { value: 'CONFIRMED', label: 'Confirmées' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'COMPLETED', label: 'Terminées' },
  { value: 'CANCELLED', label: 'Annulées' },
];

type SearchParams = Promise<{ status?: string }>;

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { status } = await searchParams;
  const filter = status as BookingStatus | undefined;
  const where = filter && filter !== ('ALL' as unknown as BookingStatus) ? { status: filter } : {};

  const bookings = await db.booking.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      user: { select: { email: true, firstName: true, lastName: true } },
      items: { include: { equipmentUnit: { include: { equipment: true } } } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Réservations</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {bookings.length} réservation{bookings.length > 1 ? 's' : ''} affichée
          {bookings.length > 1 ? 's' : ''}.
        </p>
      </div>

      <nav aria-label="Filtres" className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => {
          const active =
            opt.value === 'ALL' ? !filter : (filter as string | undefined) === opt.value;
          const href =
            opt.value === 'ALL' ? '/admin/reservations' : `/admin/reservations?status=${opt.value}`;
          return (
            <Link
              key={opt.value}
              href={href}
              className={`inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors ${
                active
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'hover:border-foreground/30 hover:bg-muted bg-background'
              }`}
            >
              {opt.label}
            </Link>
          );
        })}
      </nav>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Référence</th>
                <th className="px-4 py-3 text-left">Client</th>
                <th className="px-4 py-3 text-left">Équipement</th>
                <th className="px-4 py-3 text-left">Début</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {bookings.length === 0 ? (
                <tr>
                  <td className="text-muted-foreground px-4 py-8 text-center" colSpan={6}>
                    Aucune réservation.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => {
                  const eq = b.items[0]?.equipmentUnit.equipment;
                  return (
                    <tr key={b.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs">
                        <Link href={`/reservation/${b.reference}`} className="hover:text-primary">
                          {b.reference}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {b.user.firstName ?? ''} {b.user.lastName ?? ''}
                        <p className="text-muted-foreground text-xs">{b.user.email}</p>
                      </td>
                      <td className="px-4 py-3">{eq?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-xs">{formatDateFR(b.startAt)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_TONES[b.status]}`}
                        >
                          {STATUS_LABELS[b.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatEurosFromCents(b.totalAmount, { hideCentsWhenZero: true })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
