const r2 = n => Math.round(n * 100) / 100;

export function fmtGBP(n) {
  return `£${n.toFixed(2)}`;
}

export const FUNDER_NAMES = [
  'Local Authority - Riverside',
  'Local Authority - Northgate',
  'NHS Continuing Healthcare',
  'Self-funded',
  'Direct Payments',
  'Oakfield Housing Trust',
  // Deliberately long — real commissioning-body names run this long in
  // practice, and it's what actually exercises the Funder column's ellipsis
  // truncation rather than leaving it untested by only-ever-short names.
  'Adult Social Care Commissioning - Riverside & Northgate Joint Authority',
];

export const CUSTOMER_NAMES = [
  'Margaret Wilson',
  'Dorothy Hughes',
  'Helen Davies',
  'Frank Harrison',
  'Robert Taylor',
  'James Anderson',
  'Patricia Moore',
  'Susan Roberts',
  'Thomas Clarke',
  'Jean Campbell',
];

export const PAYMENT_METHODS = ['Direct Debit', 'Bacs', 'Standing Order', 'Cheque', 'Cash', 'Payment Card', 'Other'];
export const DELIVERY_METHODS = ['Email', 'Post'];
export const STATUSES = ['To approve', 'Approved', 'Sent'];
export const PAID_STATES = ['Paid', 'Unpaid'];

// Deterministic pseudo-random generator, matching the established pattern in
// gross-pay-advice/holiday-deduction/src/data.js — reproducible data on every
// load without a real dependency.
let _s = 9173;
function rnd() { _s = (_s * 16807) % 2147483647; return _s / 2147483647; }
const pick = arr => arr[Math.floor(rnd() * arr.length)];
const btw = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));

const MONTHS_2026 = [4, 5, 6, 7]; // Apr–Jul 2026
const pad = n => String(n).padStart(2, '0');
const fmtD = (d, m, y) => `${pad(d)}/${pad(m)}/${y}`;

function buildRecords() {
  const records = [];
  let seq = 100201;
  for (let i = 0; i < 46; i++) {
    const month = pick(MONTHS_2026);
    const year = 2026;
    const startDay = btw(1, 20);
    const daysInPeriod = pick([7, 14, 28, 30]);
    const startDate = new Date(year, month - 1, startDay);
    const endDate = new Date(startDate.getTime() + (daysInPeriod - 1) * 86400000);
    const invoiceDate = new Date(endDate.getTime() + btw(1, 5) * 86400000);

    const expectedCharge = r2(btw(2000, 18000) / 10);
    const chargeDelta = rnd() < 0.15 ? r2((rnd() - 0.5) * 40) : 0; // occasional variance from expected
    const charge = r2(Math.max(0, expectedCharge + chargeDelta));
    const expenses = rnd() < 0.4 ? r2(btw(0, 4500) / 10) : 0;
    const totalCharge = r2(charge + expenses);

    const status = pick(STATUSES);
    // Paid only makes sense once an invoice has actually been sent — earlier
    // statuses are always Unpaid, matching the real-world workflow this
    // table represents.
    const paid = status === 'Sent' && rnd() < 0.6 ? 'Paid' : 'Unpaid';

    records.push({
      id: i + 1,
      invoiceNo: `INV-${seq++}`,
      invoiceDate: fmtD(invoiceDate.getDate(), invoiceDate.getMonth() + 1, invoiceDate.getFullYear()),
      funder: pick(FUNDER_NAMES),
      customer: pick(CUSTOMER_NAMES),
      start: fmtD(startDate.getDate(), startDate.getMonth() + 1, startDate.getFullYear()),
      end: fmtD(endDate.getDate(), endDate.getMonth() + 1, endDate.getFullYear()),
      paymentMethod: pick(PAYMENT_METHODS),
      deliveryMethod: pick(DELIVERY_METHODS),
      expectedCharge,
      charge,
      expenses,
      totalCharge,
      status,
      paid,
    });
  }
  return records;
}

export const INVOICE_RECORDS = buildRecords();
