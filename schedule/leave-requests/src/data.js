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

// Exact counts, not weighted-random luck — a weighted-pool approach still
// leaves the actual outcome up to how this file's single shared
// deterministic PRNG sequence happens to land, which shifted the result
// unpredictably (including once producing zero Awaiting Cancellation
// rows) every time an unrelated bit of generation logic changed. This
// guarantees "only a couple of Awaiting Cancellation" holds regardless of
// what else in this generator changes later. Must sum to REQUEST_COUNT
// below (Pending/Approved make up the bulk — an earlier version picked
// uniformly across all 4 statuses, producing an unrealistically large
// Awaiting Cancellation count, 19 of 42, for what's meant to be a rare
// in-flight state).
const REQUEST_COUNT = 18;
const STATUS_COUNTS = {
  Pending: 6,
  Approved: 8,
  'Awaiting Cancellation': 2,
  Cancelled: 2,
};

// Whether a request's amount is measured in days or hours depends on the
// EMPLOYEE's contract, not the individual request — a fixed-schedule
// employee's leave is booked in days, while an hourly/zero-hours contract
// employee's leave is booked in the hours they'd actually have worked.
// Explicit per-employee assignment (not randomly rolled) — guarantees a
// handful of real hourly examples every load rather than leaving it to
// chance across a now-smaller total request count.
const HOURLY_EMPLOYEES = new Set(['Anita Bradley', 'Kira Oswell', 'Alex Jones']);
const EMPLOYEE_CONTRACTS = Object.fromEntries(
  EMPLOYEE_NAMES.map(name => [name, { unit: HOURLY_EMPLOYEES.has(name) ? 'hours' : 'days' }])
);

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

// Fisher-Yates using the same seeded rnd — deterministic across reloads
// like the rest of this generator, but the exact per-row status is now
// just "which shuffled slot landed here", not itself a source of count
// drift the way re-rolling per row was.
function shuffledStatuses() {
  const seq = Object.entries(STATUS_COUNTS).flatMap(([status, count]) => Array(count).fill(status));
  for (let i = seq.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [seq[i], seq[j]] = [seq[j], seq[i]];
  }
  return seq;
}

function buildRequests() {
  const requests = [];
  const statuses = shuffledStatuses();
  for (let i = 0; i < REQUEST_COUNT; i++) {
    const employee = pick(EMPLOYEE_NAMES);
    const contract = EMPLOYEE_CONTRACTS[employee];
    const leaveType = pick(LEAVE_TYPES);
    const month = btw(3, 8); // Apr–Sep 2026 (0-indexed)
    const startDay = btw(1, 25);
    const fromDate = new Date(2026, month, startDay);

    let toDate, amount;
    if (leaveType === 'Full Day') {
      // Hourly employees get a narrower, smaller span pool — the point
      // was more examples reading as "obviously a half day or a day"
      // (4/8 hours), not large multi-week hour totals that are technically
      // correct but don't read as clearly at a glance.
      const span = contract.unit === 'hours' ? pick([1, 1, 1, 2]) : pick([1, 1, 1, 2, 3, 5]); // calendar days, inclusive
      toDate = new Date(fromDate.getTime() + (span - 1) * 86400000);
      // A standard 8-hour working day per day of leave — clean, round
      // numbers (8/16) that read as obviously "a day's/two days' worth"
      // rather than an arbitrary per-employee hourly rate.
      amount = contract.unit === 'hours' ? span * 8 : span;
    } else {
      toDate = fromDate; // half-day requests are always a single date
      amount = contract.unit === 'hours' ? 4 : 0.5;
    }

    const submitted = new Date(fromDate.getTime() - btw(1, 30) * 86400000);
    const status = statuses[i];
    const cancellationReason = status === 'Cancelled' ? pick(CANCELLATION_REASONS) : null;

    requests.push({
      id: i + 1,
      employee,
      leaveType,
      fromDate,
      toDate,
      amount,
      unit: contract.unit,
      status,
      submitted,
      cancellationReason,
    });
  }
  return requests;
}

export const LEAVE_REQUESTS = buildRequests();
