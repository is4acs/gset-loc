/**
 * Formats an integer cents amount as a euro string ("12,50 €" / "1 200 €").
 * Always uses fr-FR locale.
 */
export function formatEurosFromCents(
  cents: number,
  options?: { hideCentsWhenZero?: boolean },
): string {
  const hideCents = options?.hideCentsWhenZero && cents % 100 === 0;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: hideCents ? 0 : 2,
    maximumFractionDigits: hideCents ? 0 : 2,
  }).format(cents / 100);
}

export function formatDateFR(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(typeof date === 'string' ? new Date(date) : date);
}
