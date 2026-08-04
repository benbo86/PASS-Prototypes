export const EMPLOYEE_NAMES = [
  'Stephen Nicholls',
  'David Bukowski',
  'Justin Keller',
  'Jeffrey Henry',
  'Anita Bradley',
  'Kira Oswell',
  'Amirah Marsden',
  'Mike Fenwick',
  'Alex Jones',
  'John Smith',
];

export const LEAVE_TYPES = ['Full Day', 'Half Day (AM)', 'Half Day (PM)'];
export const STATUSES = ['Pending', 'Approved', 'Awaiting Cancellation', 'Cancelled'];

const pad = n => String(n).padStart(2, '0');
// DD/MM/YY per this prototype's own explicit spec — deliberately different
// from every other prototype's DD/MM/YYYY.
export function fmtD(date) {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${pad(date.getFullYear() % 100)}`;
}

const CANCELLATION_REASONS = [
  'Change of plans — no longer needed',
  'Cover no longer available for these dates',
  'Employee requested different dates',
  'Submitted in error',
];

// Deterministic pseudo-random generator, matching the established pattern in
// gross-pay-advice/holiday-deduction/src/data.js and invoices/list/src/data.js.
let _s = 4471;
function rnd() { _s = (_s * 16807) % 2147483647; return _s / 2147483647; }
const pick = arr => arr[Math.floor(rnd() * arr.length)];
const btw = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));

function buildRequests() {
  const requests = [];
  for (let i = 0; i < 42; i++) {
    const leaveType = pick(LEAVE_TYPES);
    const month = btw(3, 8); // Apr–Sep 2026 (0-indexed)
    const startDay = btw(1, 25);
    const fromDate = new Date(2026, month, startDay);

    let toDate, daysRequested;
    if (leaveType === 'Full Day') {
      const span = pick([1, 2, 3, 5]); // calendar days, inclusive
      toDate = new Date(fromDate.getTime() + (span - 1) * 86400000);
      daysRequested = span;
    } else {
      toDate = fromDate; // half-day requests are always a single date
      daysRequested = 0.5;
    }

    const submitted = new Date(fromDate.getTime() - btw(1, 30) * 86400000);
    const status = pick(STATUSES);
    const cancellationReason = status === 'Cancelled' ? pick(CANCELLATION_REASONS) : null;

    requests.push({
      id: i + 1,
      employee: pick(EMPLOYEE_NAMES),
      leaveType,
      fromDate,
      toDate,
      daysRequested,
      status,
      submitted,
      cancellationReason,
    });
  }
  return requests;
}

export const LEAVE_REQUESTS = buildRequests();
