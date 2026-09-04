// ─── Invoice document customisation model ──────────────────────
// Per funder, not global (see CLAUDE.md's own history of this feature
// moving from a roster-settings-level control to here). Two independent
// pieces: a shared, non-reorderable "header fields" checklist, and a
// per-layout, reorderable "field" list — array order IS display/column
// order, toggling never changes position (an unchecked field stays where
// it was if re-checked later).
//
// Deliberately excluded from both lists — genuinely locked, not just
// defaulted-on, so they're never shown as toggles at all: Date, Visit
// charge and Total charge (the visit-list family), Week start and Total
// charge (Weekly totals). Removing any of these breaks what the layout
// structurally *is*.
//
// Expenses / Expense name deliberately NOT offered anywhere either —
// Ben, 2026-09-04: "This was my mistake, it was discussed with product
// that we will show expenses if there are expenses on a visit so we
// don't feel these options make sense to have." Expense visibility is
// automatic/data-driven (shown when a visit actually has one), not a
// finance-manager toggle — so unlike the locked fields above, there's no
// "always show this" row for it either; it simply isn't part of this
// model at all.

export const INVOICE_HEADER_FIELDS = [
  { key: 'officeLogo', label: 'Office logo' },
  { key: 'officeName', label: 'Office name' },
  { key: 'companyName', label: 'Company name' },
  { key: 'addressLine1', label: 'Address line 1' },
  { key: 'addressLine2', label: 'Address line 2' },
  { key: 'city', label: 'City' },
  { key: 'county', label: 'County' },
  { key: 'country', label: 'Country' },
  { key: 'postcode', label: 'Postcode' },
]

// Three of the original four templates (basic details / full details /
// by week) shared enough of their own field pool that they're now one
// consolidated "Visit list" layout — a funder no longer picks between
// three near-identical variants, just which fields it shows and in what
// order. Weekly totals stays its own distinct layout (a genuinely
// different grain — per-week aggregate, not per-visit).
// description text matches the live product verbatim (Ben, 2026-09-04) —
// surfaced via an info-icon tooltip on each layout's own radio card.
export const INVOICE_LAYOUTS = [
  {
    key: 'visitList',
    name: 'Visit list',
    description: 'Displays details for each visit as a separate line item',
    fields: [
      { key: 'type', label: 'Type' },
      { key: 'carer', label: 'Carer' },
      { key: 'carerInitials', label: 'Carer initials' },
      { key: 'start', label: 'Start' },
      { key: 'duration', label: 'Duration' },
      { key: 'status', label: 'Status' },
      { key: 'rate', label: 'Rate' },
    ],
  },
  {
    key: 'weeklyTotals',
    name: 'Weekly totals',
    description: 'Displays visit totals for each week of the invoice period',
    fields: [
      { key: 'totalVisits', label: 'Total visits' },
      { key: 'totalDuration', label: 'Total duration' },
    ],
  },
]

const layoutName = (key) => INVOICE_LAYOUTS.find(l => l.key === key)?.name || null

export const invoiceLayoutName = layoutName

// Every funder gets a real, selected layout from the start (Visit list) —
// there's no "unconfigured" state any more, matching Ben's own "lets have
// one selected by default." Office logo defaults *on* (pre-selected).
// Carer initials defaults off — a genuinely new field, not something the
// current real invoice document already shows.
export function defaultInvoiceConfig() {
  return {
    header: INVOICE_HEADER_FIELDS.map(f => ({ ...f, enabled: true })),
    layout: 'visitList',
    fieldOrders: Object.fromEntries(
      INVOICE_LAYOUTS.map(l => [l.key, l.fields.map(f => ({
        ...f,
        enabled: f.key !== 'carerInitials',
      }))])
    ),
  }
}

// ─── Funders ────────────────────────────────────────────────────

export const INITIAL_FUNDERS = [
  {
    id: 1,
    name: "Patricia Allin",
    type: 'Private',
    flatNoHouseName: '',
    addressLine1: '3 Morgan Way',
    addressLine2: 'Woodford Bridge',
    townCity: 'Woodford Green',
    county: 'Greater London',
    postcode: 'IG8 8DL',
    status: 'Active',
    accountsReference: 'RPALL001X',
    costCentre: '1',
    contactName: 'David Allin',
    email: 'everylifetest+fc+davidallin@gmail.com',
    contactNumber: '07362 287 804',
    customerIdNumber: 'Private',
    chargeMethod: 'Planned time',
    chargeRounding: 'Round visit charges',
    paymentMethod: 'Direct Debit',
    weeklyFundingLimit: 0,
    invoiceDeliveryMethod: 'Email to main contact',
    invoiceFormat: 'PDF',
    invoiceConfig: defaultInvoiceConfig(),
  },
  {
    id: 2,
    name: 'Redbridge Council',
    type: 'Local Authority',
    flatNoHouseName: '',
    addressLine1: '128 High Road',
    addressLine2: '',
    townCity: 'Ilford',
    county: 'Greater London',
    postcode: 'IG1 1DD',
    status: 'Active',
    accountsReference: 'LARED002',
    costCentre: '4',
    contactName: 'Finance Team',
    email: 'everylifetest+fc+redbridge@gmail.com',
    contactNumber: '020 8554 5000',
    customerIdNumber: 'LA-00218',
    chargeMethod: 'Planned time',
    chargeRounding: 'Round visit charges',
    paymentMethod: 'BACS',
    weeklyFundingLimit: 350,
    invoiceDeliveryMethod: 'Email to main contact',
    invoiceFormat: 'PDF',
    invoiceConfig: defaultInvoiceConfig(),
  },
]

export const fmtGBP = (n) => `£${Number(n).toFixed(2)}`

// ─── Sample invoice for the "Customise document" preview ──────────
// Static, hand-authored (not the deterministic-RNG generator
// invoices/recurring-expense-document/src/data.js uses — this only ever
// backs a live preview inside a modal, not a full invoice-list page, so a
// small fixed dataset is enough). Feeds Components/InvoiceDocument.jsx
// directly — same shape that component already expects.
export const SAMPLE_PREVIEW_INVOICE = {
  invoiceNo: 'INV-100301',
  invoiceDate: '09/04/2026',
  paymentDue: '09/11/2026',
  paymentMethod: 'Direct Debit',
  customer: 'Patricia Allin',
  customerId: 'RPALL001X',
  start: '01/04/2026',
  end: '07/04/2026',
  lineItems: [
    {
      date: '01/04/2026', type: 'Home Care', carer: 'Sarah Whitfield',
      start: '09:00', duration: '1hr 0m', status: 'Complete',
      rate: 28, charge: 28,
      expenses: [{ type: 'Mileage', amount: 4.50 }, { type: 'Parking Fee', amount: 2.00 }],
      expenseTotal: 6.50, totalCharge: 34.50,
    },
    {
      date: '02/04/2026', type: 'Domestic Support', carer: 'Michael Osei',
      start: '10:00', duration: '1hr 30m', status: 'Complete',
      rate: 28, charge: 42,
      expenses: [], expenseTotal: 0, totalCharge: 42,
    },
    {
      date: '04/04/2026', type: 'Home Care', carer: 'Sarah Whitfield',
      start: '14:30', duration: '2hr 0m', status: 'Complete',
      rate: 28, charge: 56,
      expenses: [{ type: 'Customer Shopping', amount: 12.30 }],
      expenseTotal: 12.30, totalCharge: 68.30,
    },
    {
      date: '06/04/2026', type: 'Home Care', carer: 'Michael Osei',
      start: '09:00', duration: '1hr 0m', status: 'Complete',
      rate: 28, charge: 28,
      expenses: [], expenseTotal: 0, totalCharge: 28,
    },
  ],
}
