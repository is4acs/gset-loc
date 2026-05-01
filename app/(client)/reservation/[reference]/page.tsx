import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateFR, formatEurosFromCents } from '@/lib/format';

export const metadata = { title: 'Réservation' };

type Params = Promise<{ reference: string }>;

const STATUS_VIEW: Record<string, { label: string; tone: string; description: string }> = {
  PENDING_PAYMENT: {
    label: 'En attente de paiement',
    tone: 'bg-amber-100 text-amber-800',
    description:
      'Votre réservation est en cours de finalisation. Si vous avez payé, le statut se met à jour sous quelques secondes.',
  },
  CONFIRMED: {
    label: 'Confirmée',
    tone: 'bg-emerald-100 text-emerald-800',
    description: 'Votre réservation est confirmée. Vous recevrez un email récapitulatif.',
  },
  IN_PROGRESS: {
    label: 'En cours',
    tone: 'bg-blue-100 text-blue-800',
    description: 'La location est en cours.',
  },
  RETURNED: {
    label: 'Retourné',
    tone: 'bg-muted text-muted-foreground',
    description: 'Le matériel a été rendu, en attente de validation.',
  },
  COMPLETED: {
    label: 'Terminée',
    tone: 'bg-muted text-muted-foreground',
    description: 'Location terminée et facturée.',
  },
  CANCELLED: {
    label: 'Annulée',
    tone: 'bg-red-100 text-red-800',
    description: 'Cette réservation a été annulée.',
  },
  DISPUTED: {
    label: 'Litige',
    tone: 'bg-red-100 text-red-800',
    description: 'Réservation en cours de revue par GSET.',
  },
};

export default async function BookingPage({ params }: { params: Params }) {
  const { reference } = await params;
  const session = await getCurrentUser();
  if (!session) redirect(`/connexion?next=${encodeURIComponent(`/reservation/${reference}`)}`);

  const booking = await db.booking.findUnique({
    where: { reference },
    include: {
      items: { include: { equipmentUnit: { include: { equipment: true } } } },
      invoice: true,
    },
  });

  if (!booking) notFound();
  if (booking.userId !== session.authUser.id) notFound();

  const view = STATUS_VIEW[booking.status] ?? STATUS_VIEW.PENDING_PAYMENT;
  const equipment = booking.items[0]?.equipmentUnit.equipment;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-xs uppercase">Réservation</p>
          <h1 className="font-mono text-2xl font-semibold">{booking.reference}</h1>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${view.tone}`}>
          {view.label}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{equipment?.name ?? 'Réservation'}</CardTitle>
          <CardDescription>{view.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Début" value={formatDateFR(booking.startAt)} />
          <Row label="Fin" value={formatDateFR(booking.endAt)} />
          {booking.interventionAddress && (
            <Row label="Adresse d’intervention" value={booking.interventionAddress} />
          )}
          <div className="bg-border my-2 h-px" />
          <Row label="Location HT" value={formatEurosFromCents(booking.rentalAmount)} />
          <Row label="TVA Guyane (8,5 %)" value={formatEurosFromCents(booking.vatAmount)} />
          <Row label="Total payé" value={formatEurosFromCents(booking.totalAmount)} bold />
          {booking.depositAmount > 0 && (
            <Row
              label="Empreinte CB"
              value={`${formatEurosFromCents(booking.depositAmount)} (non débitée)`}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Link
          href="/mes-locations"
          className="border-input hover:bg-muted inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium"
        >
          ← Toutes mes locations
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? 'font-semibold' : 'text-foreground'}>{value}</span>
    </div>
  );
}
