import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { Card, CardContent } from '@/components/ui/card';
import { formatDateFR, formatEurosFromCents } from '@/lib/format';

export const metadata = { title: 'Mes factures' };

export default async function InvoicesPage() {
  const session = await getCurrentUser();
  if (!session) redirect('/connexion?next=/factures');

  const invoices = await db.invoice.findMany({
    where: { booking: { userId: session.authUser.id } },
    include: { booking: true },
    orderBy: { issuedAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mes factures</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {invoices.length} facture{invoices.length > 1 ? 's' : ''}.
        </p>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground text-sm">
              Aucune facture. Vous en recevrez une après chaque réservation confirmée.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {invoices.map((inv) => (
            <Card key={inv.id}>
              <CardContent className="flex flex-wrap items-center gap-4 py-4 text-sm">
                <div className="flex-1">
                  <p className="font-mono text-xs">{inv.number}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    Réservation{' '}
                    <Link
                      href={`/reservation/${inv.booking.reference}`}
                      className="hover:text-primary underline"
                    >
                      {inv.booking.reference}
                    </Link>{' '}
                    · {formatDateFR(inv.issuedAt)}
                  </p>
                </div>
                <p className="font-semibold">{formatEurosFromCents(inv.amount)}</p>
                {inv.pdfUrl ? (
                  <a
                    href={inv.pdfUrl}
                    target="_blank"
                    rel="noopener"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center rounded-md px-3 text-xs font-medium"
                  >
                    Télécharger PDF
                  </a>
                ) : (
                  <span className="text-muted-foreground text-xs">PDF en cours</span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
