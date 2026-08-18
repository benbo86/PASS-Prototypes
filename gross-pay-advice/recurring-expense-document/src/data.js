const r2 = n => Math.round(n * 100) / 100;

export function fmtGBP(n) {
  return `£${n.toFixed(2)}`;
}

// Matches customer-profile/service-agreement/src/data.js's own recurring
// expense taxonomy (also reused by invoices/recurring-expense-document) —
// declared locally rather than imported, per this repo's convention that
// each prototype owns its own data.js.
export const EXPENSE_TYPES = ['Customer Shopping', 'Mileage', 'Parking Fee'];

// Deterministic pseudo-random generator, matching the established pattern in
// gross-pay-advice/holiday-deduction/src/data.js and
// invoices/recurring-expense-document/src/data.js — reproducible data on
// every load without a real dependency.
let _s = 7331;
function rnd() { _s = (_s * 16807) % 2147483647; return _s / 2147483647; }
const pick = arr => arr[Math.floor(rnd() * arr.length)];
const btw = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));

const pad = n => String(n).padStart(2, '0');
const fmtD = (d, m, y) => `${pad(d)}/${pad(m)}/${y}`;
const fmtD2 = (d, m, y) => `${pad(d)}/${pad(m)}/${pad(y % 100)}`;

function fmtDuration(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// Same VISIT_TYPES_L2 taxonomy as gross-pay-advice/holiday-deduction's own
// L2 visit data, and the same employee/customer set as its example record
// (Stephen Nicholls, GPA-241001, October 2024 cycle) — this document
// represents that same GPA's own visit + recurring-expense breakdown, not a
// disconnected example.
const VISIT_TYPES = ['Personal Care', 'Medication', 'Domestic', 'Companionship', 'Complex Care'];
const CUSTOMERS = ['Margaret Wilson', 'Dorothy Hughes', 'Helen Davies', 'Frank Harrison'];
const START_TIMES = ['07:20', '08:30', '09:05', '15:45', '16:10', '16:50', '17:30', '19:10', '19:30', '20:05', '20:25', '21:10'];
const DURATIONS_MIN = [15, 20, 30, 40, 45];
const RATE = 13; // £/hr, visit pay

function buildLineItems(startDate, endDate) {
  const count = 10;
  const spanDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86400000));
  const items = [];
  for (let i = 0; i < count; i++) {
    const offset = btw(0, spanDays);
    const date = new Date(startDate.getTime() + offset * 86400000);
    const durationMin = pick(DURATIONS_MIN);
    const start = pick(START_TIMES);
    const pay = r2(RATE * (durationMin / 60));
    const mileage = r2(btw(0, 300) / 100);
    const travel = r2(btw(0, 200) / 100);

    // Row 2 (index 2) always carries two expenses, of different types, so
    // that scenario is visible without hunting for it — same convention as
    // invoices/recurring-expense-document/src/data.js.
    const expenseCount = i === 2 ? 2 : (rnd() < 0.3 ? 1 : 0);
    const usedTypes = [];
    const expenses = [];
    for (let e = 0; e < expenseCount; e++) {
      let type = pick(EXPENSE_TYPES);
      while (usedTypes.includes(type) && usedTypes.length < EXPENSE_TYPES.length) type = pick(EXPENSE_TYPES);
      usedTypes.push(type);
      expenses.push({ type, amount: r2(btw(30, 250) / 10) });
    }
    const expenseTotal = r2(expenses.reduce((sum, exp) => sum + exp.amount, 0));

    items.push({
      date: fmtD(date.getDate(), date.getMonth() + 1, date.getFullYear()),
      sortKey: date.getTime(),
      type: pick(VISIT_TYPES),
      customer: pick(CUSTOMERS),
      timeLabel: `${start}, ${fmtDuration(durationMin)}`,
      durationMin,
      pay,
      mileage,
      travel,
      expenses,
      expenseTotal,
      totalPay: r2(pay + mileage + travel + expenseTotal),
    });
  }
  return items.sort((a, b) => a.sortKey - b.sortKey);
}

const startDate = new Date(2024, 9, 1);
const endDate = new Date(2024, 9, 31);
const payDate = new Date(2024, 10, 5);
const printDate = new Date(2024, 10, 6);

const lineItems = buildLineItems(startDate, endDate);

const totalVisitMinutes = lineItems.reduce((sum, item) => sum + item.durationMin, 0);
const totalVisitHoursH = Math.floor(totalVisitMinutes / 60);
const totalVisitHoursM = totalVisitMinutes % 60;

// Visit pay / Mileage / Travel time columns, summed straight from the table
// rows — these are the same figures shown both in the Document Summary
// (top) and as the table's own column sub-totals (bottom), since they're
// literally the same data. Holiday pay has no line items in this document
// (holiday isn't a visit), so it's a fixed dummy 0, matching the real
// sample Gross Pay Advice this was modelled on.
const totalPay = r2(lineItems.reduce((sum, item) => sum + item.pay, 0));
const totalMileage = r2(lineItems.reduce((sum, item) => sum + item.mileage, 0));
const totalTravel = r2(lineItems.reduce((sum, item) => sum + item.travel, 0));
const totalExpenses = r2(lineItems.reduce((sum, item) => sum + item.expenseTotal, 0));
const totalHolidayPay = 0;

export const EXAMPLE = {
  gpaRef: 'GPA-241001',
  payrollId: 'PR-10842',
  employeeName: 'Stephen Nicholls',
  employeeRef: 'EMP-1042',
  payDate: fmtD2(payDate.getDate(), payDate.getMonth() + 1, payDate.getFullYear()),
  printDate: fmtD2(printDate.getDate(), printDate.getMonth() + 1, printDate.getFullYear()),
  start: fmtD(startDate.getDate(), startDate.getMonth() + 1, startDate.getFullYear()),
  end: fmtD(endDate.getDate(), endDate.getMonth() + 1, endDate.getFullYear()),

  totalVisits: lineItems.length,
  totalVisitHours: `${totalVisitHoursH}h ${pad(totalVisitHoursM)}m`,
  totalHoliday: 0,

  totalPay,
  totalMileage,
  totalTravel,
  totalExpenses,
  totalHolidayPay,
  // Now includes totalExpenses, so this matches tableTotalPay below exactly
  // whenever totalHolidayPay is 0 (true in this example) — both are built
  // from the same underlying per-row figures, just summed by column here
  // vs. by row there.
  summaryTotalPay: r2(totalPay + totalMileage + totalTravel + totalExpenses + totalHolidayPay),

  // The table's own "Total pay" column total, summed per row (Pay +
  // Mileage + Travel + Expenses per visit) rather than by column — kept as
  // its own calculation since it would genuinely diverge from
  // summaryTotalPay if totalHolidayPay were ever non-zero (holiday isn't a
  // visit, so it never appears as a table row/column).
  tableTotalPay: r2(lineItems.reduce((sum, item) => sum + item.totalPay, 0)),

  lineItems,
};
