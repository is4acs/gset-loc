import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const PRIMARY = '#1F4E79';
const ACCENT = '#D9822B';
const MUTED = '#64748B';

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10, fontFamily: 'Helvetica', color: '#1f2937' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  brand: { color: PRIMARY, fontSize: 16, fontWeight: 700, letterSpacing: 1 },
  brandTagline: { color: MUTED, fontSize: 8, marginTop: 4 },
  invoiceMeta: { textAlign: 'right' },
  invoiceMetaLabel: { color: MUTED, fontSize: 8, textTransform: 'uppercase' },
  invoiceMetaValue: { color: PRIMARY, fontSize: 14, fontWeight: 700 },
  block: { marginTop: 16 },
  blockTitle: {
    color: MUTED,
    fontSize: 8,
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  blockBody: { fontSize: 10, lineHeight: 1.5 },
  separator: { borderTopWidth: 0.5, borderTopColor: '#e2e8f0', marginVertical: 16 },
  table: { marginTop: 12 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
  },
  colDesc: { flex: 3 },
  colQty: { flex: 1, textAlign: 'right' },
  colAmount: { flex: 1.4, textAlign: 'right' },
  totals: { marginTop: 16, alignItems: 'flex-end' },
  totalRow: { flexDirection: 'row', width: 220, paddingVertical: 3 },
  totalLabel: { flex: 1, color: MUTED },
  totalValue: { flex: 1, textAlign: 'right' },
  totalGrand: { fontWeight: 700, color: PRIMARY, fontSize: 12 },
  footer: { marginTop: 32, color: MUTED, fontSize: 8, lineHeight: 1.5 },
  pill: {
    backgroundColor: ACCENT,
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    fontSize: 8,
    fontWeight: 700,
  },
});

interface InvoiceProps {
  invoiceNumber: string;
  bookingReference: string;
  issuedAt: Date;
  startAt: Date;
  endAt: Date;

  // Customer
  customerEmail: string;
  customerName: string | null;
  customerCompany: string | null;
  customerSiret: string | null;

  // Lines
  equipmentName: string;
  rentalAmount: number; // cents HT
  vatAmount: number;
  totalAmount: number;

  depositAmount: number;
  hasOperator: boolean;
}

const fmt = (cents: number) =>
  `${(cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

const fmtDate = (d: Date) =>
  d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

const fmtDateTime = (d: Date) =>
  d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export function InvoicePdf(props: InvoiceProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brand}>GSET LOCATION</Text>
            <Text style={styles.brandTagline}>Location de matériel BTP en Guyane française</Text>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceMetaLabel}>Facture</Text>
            <Text style={styles.invoiceMetaValue}>{props.invoiceNumber}</Text>
            <Text style={[styles.blockBody, { color: MUTED, marginTop: 4 }]}>
              Émise le {fmtDate(props.issuedAt)}
            </Text>
          </View>
        </View>

        {/* Customer block */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Facturé à</Text>
          <Text style={styles.blockBody}>
            {props.customerCompany
              ? props.customerCompany
              : (props.customerName ?? props.customerEmail)}
            {'\n'}
            {props.customerName && props.customerCompany ? `${props.customerName}\n` : ''}
            {props.customerEmail}
            {props.customerSiret ? `\nSIRET ${props.customerSiret}` : ''}
          </Text>
        </View>

        {/* Booking block */}
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Réservation</Text>
          <Text style={styles.blockBody}>
            {props.bookingReference}
            {'\n'}Du {fmtDateTime(props.startAt)} au {fmtDateTime(props.endAt)}
            {props.hasOperator ? '\nAvec opérateur GSET' : ''}
          </Text>
        </View>

        <View style={styles.separator} />

        {/* Lines */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Désignation</Text>
            <Text style={styles.colQty}>Qté</Text>
            <Text style={styles.colAmount}>Montant HT</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.colDesc}>Location {props.equipmentName}</Text>
            <Text style={styles.colQty}>1</Text>
            <Text style={styles.colAmount}>{fmt(props.rentalAmount)}</Text>
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total HT</Text>
            <Text style={styles.totalValue}>{fmt(props.rentalAmount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TVA Guyane (8,5 %)</Text>
            <Text style={styles.totalValue}>{fmt(props.vatAmount)}</Text>
          </View>
          <View
            style={[
              styles.totalRow,
              { marginTop: 4, borderTopWidth: 0.5, borderTopColor: '#cbd5e1', paddingTop: 4 },
            ]}
          >
            <Text style={[styles.totalLabel, styles.totalGrand]}>Total TTC</Text>
            <Text style={[styles.totalValue, styles.totalGrand]}>{fmt(props.totalAmount)}</Text>
          </View>
        </View>

        {props.depositAmount > 0 && (
          <View style={[styles.block, { marginTop: 24 }]}>
            <Text style={styles.blockTitle}>Empreinte CB</Text>
            <Text style={styles.blockBody}>
              Une empreinte de {fmt(props.depositAmount)} a été pré-autorisée sur votre carte au
              titre de la caution. Aucun débit n’est effectué tant que le matériel revient en bon
              état.
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            GSET Guyane — Location de matériel BTP{'\n'}
            TVA dérogatoire DOM 8,5 % conformément à l’article 296 du CGI{'\n'}
            En cas de retard de paiement, indemnité forfaitaire de 40 € (art. L441-10 du Code de
            commerce).
          </Text>
        </View>
      </Page>
    </Document>
  );
}
