const r2 = n => Math.round(n * 100) / 100;

export function fmtGBP(n) {
  return `£${n.toFixed(2)}`;
}

// Matches customer-profile/service-agreement/src/data.js's own recurring
// expense taxonomy — declared locally rather than imported, per this repo's
// convention that each prototype owns its own data.js.
export const EXPENSE_TYPES = ['Customer Shopping', 'Mileage', 'Parking Fee'];

// Deterministic pseudo-random generator, matching the established pattern in
// gross-pay-advice/holiday-deduction/src/data.js — reproducible data on
// every load without a real dependency.
let _s = 4213;
function rnd() { _s = (_s * 16807) % 2147483647; return _s / 2147483647; }
const pick = arr => arr[Math.floor(rnd() * arr.length)];
const btw = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));

const pad = n => String(n).padStart(2, '0');
const fmtD = (d, m, y) => `${pad(d)}/${pad(m)}/${y}`;

function fmtDurationMin(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}${h === 1 ? 'hr' : 'hrs'} ${m}m`;
}

const CARE_TYPES = ['Home Care', 'Domestic Support'];
const CARER_NAMES = ['Sarah Whitfield', 'Michael Osei'];
const START_TIMES = ['09:00', '10:00', '14:30'];
const DURATIONS_MIN = [60, 90, 120];
const RATE = 28; // £/hr

// Line items for the example invoice, dated within its start/end period —
// same shape as the original sample-invoice.pdf's table (Date/Type/Carer/
// Start/Duration/Status/Charge/Expenses/Total Charge), plus Rate. The
// second row always carries a recurring expense so the feature this
// prototype demonstrates is visible without hunting for it.
function buildLineItems(startDate, endDate) {
  const count = 5;
  const spanDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86400000));

  const items = [];
  for (let i = 0; i < count; i++) {
    const offset = btw(0, spanDays);
    const date = new Date(startDate.getTime() + offset * 86400000);
    const durationMin = pick(DURATIONS_MIN);
    const charge = r2(RATE * (durationMin / 60));

    const hasExpense = i === 1 ? true : rnd() < 0.3;
    const expenseType = hasExpense ? pick(EXPENSE_TYPES) : null;
    const expenseAmount = hasExpense ? r2(btw(30, 250) / 10) : 0;

    items.push({
      date: fmtD(date.getDate(), date.getMonth() + 1, date.getFullYear()),
      sortKey: date.getTime(),
      type: pick(CARE_TYPES),
      carer: pick(CARER_NAMES),
      start: pick(START_TIMES),
      duration: fmtDurationMin(durationMin),
      status: 'Complete',
      rate: RATE,
      charge,
      expenseType,
      expenseAmount,
      totalCharge: r2(charge + expenseAmount),
    });
  }
  return items.sort((a, b) => a.sortKey - b.sortKey);
}

const startDate = new Date(2026, 3, 1);
const endDate = new Date(startDate.getTime() + 6 * 86400000);
const invoiceDate = new Date(endDate.getTime() + 2 * 86400000);
const paymentDueDate = new Date(invoiceDate.getTime() + 7 * 86400000);

export const EXAMPLE = {
  invoiceNo: 'INV-100301',
  invoiceDate: fmtD(invoiceDate.getDate(), invoiceDate.getMonth() + 1, invoiceDate.getFullYear()),
  paymentDue: fmtD(paymentDueDate.getDate(), paymentDueDate.getMonth() + 1, paymentDueDate.getFullYear()),
  paymentMethod: 'Standing Order',
  customer: 'James Anderson',
  customerId: 'CUST-4821',
  start: fmtD(startDate.getDate(), startDate.getMonth() + 1, startDate.getFullYear()),
  end: fmtD(endDate.getDate(), endDate.getMonth() + 1, endDate.getFullYear()),
  lineItems: buildLineItems(startDate, endDate),
};
