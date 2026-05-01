import Link from 'next/link';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateFR, formatEurosFromCents } from '@/lib/format';

export const metadata = { title: 'Dashboard admin' };

export default async function AdminDashboardPage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    bookingsToday,
    bookingsActive,
    revenueMonthAgg,
    pendingPayment,
    recentBookings,
    totalEquipments,
    inactiveEquipments,
  ] = await Promise.all([
    db.booking.count({
      where: { status: { not: 'CANCELLED' }, createdAt: { gte: startOfDay } },
    }),
    db.booking.count({ where: { status: 'IN_PROGRESS' } }),
    db.booking.aggregate({
      where: {
        status: { in: ['CONFIRMED', 'IN_PROGRESS', 'RETURNED', 'COMPLETED'] },
        createdAt: { gte: startOfMonth },
      },
      _sum: { totalAmount: true },
    }),
    db.booking.count({ where: { status: 'PENDING_PAYMENT' } }),
    db.booking.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        items: { include: { equipmentUnit: { include: { equipment: true } } } },
      },
    }),
    db.equipment.count(),
    db.equipment.count({ where: { isActive: false } }),
  ]);

  const revenueMonth = revenueMonthAgg._sum.totalAmount ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Vue d’ensemble des locations et de la flotte.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Réservations aujourd’hui" value={bookingsToday.toString()} />
        <Kpi
          label="CA du mois"
          value={formatEurosFromCents(revenueMonth, { hideCentsWhenZero: true })}
        />
        <Kpi label="Locations en cours" value={bookingsActive.toString()} />
        <Kpi
          label="En attente de paiement"
          value={pendingPayment.toString()}
          tone={pendingPayment > 0 ? 'warning' : undefined}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Dernières réservations</CardTitle>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucune réservation.</p>
            ) : (
              <ul className="divide-border divide-y text-sm">
                {recentBookings.map((b) => {
                  const eq = b.items[0]?.equipmentUnit.equipment;
                  return (
                    <li key={b.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="font-mono text-xs">{b.reference}</p>
                        <p className="text-foreground truncate font-medium">{eq?.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {b.user.firstName} {b.user.lastName} · {b.user.email}
                        </p>
                      </div>
                      <div className="text-right text-xs">
                        <p className="font-semibold">{formatEurosFromCents(b.totalAmount)}</p>
                        <p className="text-muted-foreground">{formatDateFR(b.createdAt)}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <Link
              href="/admin/reservations"
              className="text-primary mt-4 inline-block text-sm font-medium hover:underline"
            >
              Toutes les réservations →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Flotte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Équipements" value={totalEquipments.toString()} />
            <Row
              label="Désactivés"
              value={inactiveEquipments.toString()}
              tone={inactiveEquipments > 0 ? 'warning' : 'muted'}
            />
            <Link
              href="/admin/flotte"
              className="text-primary mt-2 inline-block text-sm font-medium hover:underline"
            >
              Gérer la flotte →
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'warning' | undefined;
}) {
  return (
    <Card>
      <CardContent className="py-5">
        <p className="text-muted-foreground text-xs uppercase">{label}</p>
        <p
          className={`mt-1 text-2xl font-semibold tracking-tight ${
            tone === 'warning' ? 'text-amber-600' : 'text-foreground'
          }`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: 'warning' | 'muted' }) {
  const cls =
    tone === 'warning'
      ? 'text-amber-600 font-semibold'
      : tone === 'muted'
        ? 'text-muted-foreground'
        : 'text-foreground font-medium';
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cls}>{value}</span>
    </div>
  );
}
