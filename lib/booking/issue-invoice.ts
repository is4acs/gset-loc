import { db } from '@/lib/db';
import { generateInvoiceNumber } from './reference';
import { generateInvoicePdf } from '@/lib/pdf/generate-invoice';
import { uploadToStorage, INVOICES_BUCKET } from '@/lib/storage/supabase-storage';

/**
 * Issues an invoice for a booking once it is CONFIRMED. Idempotent: if an
 * invoice already exists, returns the existing one.
 *
 * Steps:
 *   1. Bail out early when an invoice already exists.
 *   2. Generate the invoice number (`F-YYYY-NNNNN`).
 *   3. Render the PDF in-memory and upload to Supabase Storage.
 *   4. Create the Invoice row.
 */
export async function issueInvoiceForBooking(bookingId: string) {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: true,
      items: { include: { equipmentUnit: { include: { equipment: true } } } },
      invoice: true,
    },
  });
  if (!booking) throw new Error(`Booking ${bookingId} not found`);
  if (booking.invoice) return booking.invoice;

  const equipment = booking.items[0]?.equipmentUnit.equipment;
  if (!equipment) throw new Error(`Booking ${bookingId} has no equipment`);

  const invoiceNumber = await generateInvoiceNumber();

  const pdfBuffer = await generateInvoicePdf({
    invoiceNumber,
    bookingReference: booking.reference,
    issuedAt: new Date(),
    startAt: booking.startAt,
    endAt: booking.endAt,
    customerEmail: booking.user.email,
    customerName: [booking.user.firstName, booking.user.lastName].filter(Boolean).join(' ') || null,
    customerCompany: booking.user.companyName,
    customerSiret: booking.user.siret,
    equipmentName: equipment.name,
    rentalAmount: booking.rentalAmount,
    vatAmount: booking.vatAmount,
    totalAmount: booking.totalAmount,
    depositAmount: booking.depositAmount,
    hasOperator: equipment.requiresOperator,
  });

  const path = `${booking.userId}/${invoiceNumber}.pdf`;
  let pdfUrl: string | null = null;
  try {
    pdfUrl = await uploadToStorage({
      bucket: INVOICES_BUCKET,
      path,
      buffer: pdfBuffer,
      contentType: 'application/pdf',
    });
  } catch (e) {
    // Storage misconfigured? Persist the invoice row anyway with no URL —
    // the user can still see the line item, and we can re-render later.
    console.error('[invoice] storage upload failed:', (e as Error).message);
  }

  return db.invoice.create({
    data: {
      bookingId: booking.id,
      number: invoiceNumber,
      pdfUrl,
      amount: booking.totalAmount,
      vatAmount: booking.vatAmount,
    },
  });
}
