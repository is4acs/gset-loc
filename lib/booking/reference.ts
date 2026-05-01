import { db } from '@/lib/db';

/**
 * Generates a sequential booking reference per year: `GSET-{YYYY}-{NNNNN}`.
 *
 * Note: uses count(*) which has a small race-condition window under heavy
 * concurrent inserts — acceptable for MVP volume. Replace by a Postgres
 * SEQUENCE if collisions become an issue.
 */
export async function generateBookingReference(): Promise<string> {
  const year = new Date().getFullYear();
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year + 1, 0, 1);

  const count = await db.booking.count({
    where: { createdAt: { gte: yearStart, lt: yearEnd } },
  });

  const seq = String(count + 1).padStart(5, '0');
  return `GSET-${year}-${seq}`;
}

/**
 * Generates a sequential invoice number: `F-{YYYY}-{NNNNN}`.
 */
export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year + 1, 0, 1);

  const count = await db.invoice.count({
    where: { issuedAt: { gte: yearStart, lt: yearEnd } },
  });

  const seq = String(count + 1).padStart(5, '0');
  return `F-${year}-${seq}`;
}
