import { sendEmail } from './email';
import { formatEurosFromCents, formatDateFR } from '@/lib/format';

interface BookingForEmail {
  reference: string;
  totalAmount: number;
  depositAmount: number;
  startAt: Date;
  endAt: Date;
  equipmentName: string;
  customerEmail: string;
  customerFirstName: string | null;
}

export function bookingConfirmationEmail(booking: BookingForEmail) {
  const greeting = booking.customerFirstName ? `Bonjour ${booking.customerFirstName},` : 'Bonjour,';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #1f1f1f;">
  <p style="color: #1f4e79; font-weight: 600; font-size: 14px; letter-spacing: 0.05em; text-transform: uppercase;">GSET Location</p>
  <h1 style="margin: 16px 0; font-size: 24px;">Réservation confirmée</h1>
  <p>${greeting}</p>
  <p>Votre réservation <strong>${booking.reference}</strong> est confirmée.</p>

  <table style="width: 100%; border-collapse: collapse; margin: 24px 0; background: #f8fafc; border-radius: 8px; overflow: hidden;">
    <tr><td style="padding: 12px 16px; color: #64748b;">Équipement</td><td style="padding: 12px 16px; text-align: right; font-weight: 600;">${booking.equipmentName}</td></tr>
    <tr><td style="padding: 12px 16px; color: #64748b;">Début</td><td style="padding: 12px 16px; text-align: right;">${formatDateFR(booking.startAt)}</td></tr>
    <tr><td style="padding: 12px 16px; color: #64748b;">Fin</td><td style="padding: 12px 16px; text-align: right;">${formatDateFR(booking.endAt)}</td></tr>
    <tr><td style="padding: 12px 16px; color: #64748b;">Total payé</td><td style="padding: 12px 16px; text-align: right; font-weight: 600;">${formatEurosFromCents(booking.totalAmount)}</td></tr>
    ${booking.depositAmount > 0 ? `<tr><td style="padding: 12px 16px; color: #64748b;">Empreinte CB (caution)</td><td style="padding: 12px 16px; text-align: right;">${formatEurosFromCents(booking.depositAmount)}</td></tr>` : ''}
  </table>

  <p>${booking.depositAmount > 0 ? 'L’empreinte CB a été pré-autorisée sur votre carte. Aucun débit ne sera effectué tant que le matériel revient en bon état.' : ''}</p>

  <p><a href="${appUrl}/reservation/${booking.reference}" style="display: inline-block; background: #1f4e79; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500;">Voir ma réservation</a></p>

  <p style="margin-top: 32px; color: #64748b; font-size: 14px;">À tout de suite chez GSET.</p>
</body>
</html>
`;

  return sendEmail({
    to: booking.customerEmail,
    subject: `Réservation confirmée — ${booking.reference}`,
    html,
  });
}
