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

// Office users, not care workers — who a decision on a request is
// attributed to (the audit trail). 'Alex Morgan' matches
// Components/TopNav.jsx's own default `userName`, and LeaveRequests.jsx
// declares the same name as its own CURRENT_OFFICE_USER constant, so a
// live Approve/Decline/Cancel always attributes to whoever the nav shows as
// signed in — the rest of the pool is only ever used to seed plausible
// *historical* attributions on rows that already started in a decided
// state.
const OFFICE_USERS = ['Alex Morgan', 'Priya Shah', 'Grace Okafor'];

export const LEAVE_TYPES = ['Full Day', 'Part Day'];
// 'Declined' and 'Cancelled' are deliberately distinct terminal states, not
// one status doing double duty — see AIOP-21555/21563 comparison, 2026-08-21
// (memory: project_leave_requests_prototype). 'Declined' is the office's own
// initial decision on a request still Awaiting Approval (mirrors AIOP-21563's own
// status vocabulary); 'Cancelled' only ever finalizes an already-Approved
// holiday being called off (reached via 'Awaiting Cancellation'). A request
// still Awaiting Approval being withdrawn by the care worker themselves, before any office
// decision, is modelled as happening entirely on the app side (never
// reaches this table at all) — see the same memory entry for why.
// 'Withdrawn': she withdrew it in the app before the office decided. Only
// reached by requests from the mobile app (the generated rows never use it).
export const STATUSES = ['Awaiting Approval', 'Approved', 'Declined', 'Awaiting Cancellation', 'Cancelled', 'Withdrawn'];

// Exact counts, not weighted-random luck — a weighted-pool approach still
// leaves the actual outcome up to how this file's single shared
// deterministic PRNG sequence happens to land, which shifted the result
// unpredictably (including once producing zero Awaiting Cancellation
// rows) every time an unrelated bit of generation logic changed. This
// guarantees "only a couple of Awaiting Cancellation" holds regardless of
// what else in this generator changes later. Must sum to REQUEST_COUNT
// below (Awaiting Approval/Approved make up the bulk — an earlier version picked
// uniformly across all statuses, producing an unrealistically large
// Awaiting Cancellation count, 19 of 42, for what's meant to be a rare
// in-flight state).
const REQUEST_COUNT = 18;
const STATUS_COUNTS = {
  'Awaiting Approval': 5,
  Approved: 7,
  Declined: 2,
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

// Submitted column — date + time, so same-day requests can be told apart
// (offices approve first come, first served).
export function fmtDTShort(date) {
  return `${fmtD(date)}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Audit-trail stamp — date + time, for the "who actioned this and when"
// tooltip on the status pill (LeaveRequests.jsx).
export function fmtDT(date) {
  return `${fmtD(date)} at ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const CANCELLATION_REASONS = [
  'Change of plans — no longer needed',
  'Cover no longer available for these dates',
  'Employee requested different dates',
  'Submitted in error',
];

// Distinct pool from CANCELLATION_REASONS above — a decline is the office's
// own initial rejection of a request (worded from that perspective), not a
// withdrawal of something already agreed.
const DECLINE_REASONS = [
  'Insufficient cover available for these dates',
  'Too many employees already on leave over this period',
  'Request submitted too close to the start date',
  'Dates clash with existing scheduled visits',
];

// A days-scheme "all day" request mapped onto start/end times — feeds
// HolidayAbsenceDialog's own time-picker fields when a request is approved
// (see LeaveRequests.jsx). Midnight to midnight: PASS doesn't reliably know
// her working hours, and the whole day catches every visit on it. The
// office can still change the times in the dialog. Hours-scheme requests
// always carry their own times.
export function leaveTypeTimes(leaveType) {
  const t = (h, m = 0) => new Date(2026, 0, 1, h, m);
  // A part day always carries its own times, so only a full day gets here.
  return [t(0), t(23, 59)];
}

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
    // Picked from three so the seeded data doesn't reshuffle; a part day
    // keeps the morning/afternoon times it used to have as a half day.
    const period = pick(['Full Day', 'AM', 'PM']);
    const leaveType = period === 'Full Day' ? 'Full Day' : 'Part Day';
    // An hours-scheme full day is a standard 09:00–17:00 (matching its 8 hrs).
    const [startTime, endTime] = period === 'AM' ? ['09:00', '13:00']
      : period === 'PM' ? ['13:00', '17:00']
      : contract.unit === 'hours' ? ['09:00', '17:00'] : [null, null];
    const month = btw(3, 8); // Apr–Sep 2026 (0-indexed)
    const startDay = btw(1, 25);
    const fromDate = new Date(2026, month, startDay);

    let toDate, amount;
    if (leaveType === 'Full Day') {
      // Hourly employees get a narrower, smaller span pool — the point
      // was more examples reading as "obviously part of a day or a day"
      // (4/8 hours), not large multi-week hour totals that are technically
      // correct but don't read as clearly at a glance.
      const span = contract.unit === 'hours' ? pick([1, 1, 1, 2]) : pick([1, 1, 1, 2, 3, 5]); // calendar days, inclusive
      toDate = new Date(fromDate.getTime() + (span - 1) * 86400000);
      // A standard 8-hour working day per day of leave — clean, round
      // numbers (8/16) that read as obviously "a day's/two days' worth"
      // rather than an arbitrary per-employee hourly rate.
      amount = contract.unit === 'hours' ? span * 8 : span;
    } else {
      toDate = fromDate; // the demo's part-day requests are single dates
      amount = contract.unit === 'hours' ? 4 : 0.5;
    }

    const submitted = new Date(fromDate.getTime() - btw(1, 30) * 86400000);
    // Derived from i, not rnd(), so adding a time doesn't reshuffle the rest
    // of the seeded data.
    submitted.setHours(7 + (i * 7) % 12, ((i * 13) % 60), 0, 0);
    const status = statuses[i];
    let reason = null;
    if (status === 'Declined') reason = pick(DECLINE_REASONS);
    else if (status === 'Cancelled') reason = pick(CANCELLATION_REASONS);

    // Audit trail — who actioned this request, and when. Awaiting Approval has no
    // entry (never decided on yet). 'Awaiting Cancellation' keeps the
    // original *approval's* stamp — nobody has actually decided on the
    // cancellation itself yet, so there's nothing newer to attribute; the
    // tooltip in LeaveRequests.jsx reads this as "Approved by ... on ..."
    // for that status specifically, not "Awaiting Cancellation by ...".
    let actionedBy = null, actionedAt = null;
    if (status !== 'Awaiting Approval') {
      actionedBy = pick(OFFICE_USERS);
      actionedAt = new Date(submitted.getTime() + btw(1, 4) * 86400000);
      actionedAt.setHours(btw(8, 17), pick([0, 15, 30, 45]), 0, 0);
    }

    requests.push({
      id: i + 1,
      employee,
      leaveType,
      startTime,
      endTime,
      fromDate,
      toDate,
      amount,
      unit: contract.unit,
      status,
      submitted,
      reason,
      actionedBy,
      actionedAt,
    });
  }
  return requests;
}

export const LEAVE_REQUESTS = buildRequests();
