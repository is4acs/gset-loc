import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePdf } from './invoice';

export interface InvoicePdfInput {
  invoiceNumber: string;
  bookingReference: string;
  issuedAt: Date;
  startAt: Date;
  endAt: Date;
  customerEmail: string;
  customerName: string | null;
  customerCompany: string | null;
  customerSiret: string | null;
  equipmentName: string;
  rentalAmount: number;
  vatAmount: number;
  totalAmount: number;
  depositAmount: number;
  hasOperator: boolean;
}

export async function generateInvoicePdf(input: InvoicePdfInput): Promise<Buffer> {
  // The cast is required because react-pdf's <Document> typing doesn't quite
  // align with React's runtime element interface in some setups.
  const buffer = await renderToBuffer(InvoicePdf(input) as never);
  return buffer;
}
