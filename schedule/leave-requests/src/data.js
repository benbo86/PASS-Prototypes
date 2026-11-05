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

// Area tags (an employee can have several, or none). The Approve dialog's
// clash warning defaults to employees who share an area with the person
// requesting. Adrianna Janowski isn't in EMPLOYEE_NAMES (see LeaveRequests.jsx),
// so she's listed here directly. Mixed on purpose: single, multiple, none.
export const EMPLOYEE_AREAS = {
  'Adrianna Janowski': ['North Yorkshire', 'York'],
  'Stephen Nicholls': ['North Yorkshire'],
  'David Bukowski': ['Leeds'],
  'Justin Keller': ['North Yorkshire', 'Leeds'],
  'Jeffrey Henry': [],
  'Anita Bradley': ['York'],
  'Kira Oswell': ['Leeds'],
  'Amirah Marsden': ['North Yorkshire'],
  'Mike Fenwick': [],
  'Alex Jones': ['York'],
  'John Smith': ['Leeds', 'York'],
};

// A crunch week for the clash warning's long-list case: Stephen Nicholls asks
// for 14-18 Dec and 20 colleagues who share his area are already off (18 extra
// employees who only appear here), plus three elsewhere.
const CRUNCH_EXTRA = [
  'Priya Nair', 'Tom Ashworth', 'Hannah Brooks', 'Marcus Webb', 'Sophie Clarke', 'Daniel Okoro',
  'Leah Fraser', 'Callum Reid', 'Nadia Hussain', 'Owen Parry', 'Grace Tanner', 'Ibrahim Sheikh',
  'Chloe Barnett', 'Ravi Patel', 'Ellie Marsh', 'Jamal Ford', 'Beth Hollis', 'Sam Ibbotson',
];
const CRUNCH_AREA_SETS = [['North Yorkshire'], ['North Yorkshire', 'York'], ['Leeds', 'North Yorkshire']];
CRUNCH_EXTRA.forEach((name, i) => { EMPLOYEE_AREAS[name] = CRUNCH_AREA_SETS[i % 3]; });

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

// The employee's own (optional) reason when asking the office to cancel an
// approved holiday (AIOP-25140). Indexed by row, not rnd(), so adding these
// doesn't reshuffle the rest of the generated data. A null shows a request
// with no reason given.
const CANCELLATION_REQUEST_REASONS = [
  "Family emergency, I need to be at home that week.",
  null,
  "My partner's leave was refused, so we can't go away now.",
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
    // Picked from three so the seeded data doesn't reshuffle. A request is
    // dates with optional times (one continuous span); a morning or
    // afternoon off is a single date with times. An hours-scheme full day
    // is a standard 09:00–17:00 (matching its 8 hrs).
    const period = pick(['Full Day', 'AM', 'PM']);
    const [startTime, endTime] = period === 'AM' ? ['09:00', '13:00']
      : period === 'PM' ? ['13:00', '17:00']
      : contract.unit === 'hours' ? ['09:00', '17:00'] : [null, null];
    const month = btw(3, 8); // Apr–Sep 2026 (0-indexed)
    const startDay = btw(1, 25);
    const fromDate = new Date(2026, month, startDay);

    let toDate, amount;
    if (period === 'Full Day') {
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
      toDate = fromDate;
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

    // Awaiting Cancellation: when she asked, and why (optional). actionedBy/At
    // above is still the approval, so it's also the approval stamp.
    let cancellationRequestedAt = null, cancellationReason = null;
    if (status === 'Awaiting Cancellation') {
      cancellationRequestedAt = new Date(actionedAt.getTime() + (2 + i % 5) * 86400000);
      cancellationRequestedAt.setHours(18, 30, 0, 0);
      cancellationReason = CANCELLATION_REQUEST_REASONS[i % CANCELLATION_REQUEST_REASONS.length];
    }
    const approved = status === 'Approved' || status === 'Awaiting Cancellation';

    requests.push({
      id: i + 1,
      employee,
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
      approvedBy: approved ? actionedBy : null,
      approvedAt: approved ? actionedAt : null,
      cancellationRequestedAt,
      cancellationReason,
    });
  }
  return requests;
}

// Hand-written requests around Adrianna's Awaiting Approval request (2 Nov) and
// her Approved ones, so approving them shows the clash warning. Fixed values,
// no rnd(), so the generated rows above don't reshuffle. Six share an area
// with her (enough to show the "+ more" cap), two are elsewhere, two have no
// area tag.
const clash = (id, employee, from, to, status, submittedDay) => {
  const contract = EMPLOYEE_CONTRACTS[employee] || { unit: 'days' };
  const fromDate = new Date(2026, from[0] - 1, from[1]);
  const toDate = new Date(2026, to[0] - 1, to[1]);
  const days = Math.round((toDate - fromDate) / 86400000) + 1;
  const submitted = new Date(2026, 9, submittedDay, 9 + (id % 6), (id * 7) % 60);
  const decided = status === 'Approved';
  const actionedAt = decided ? new Date(submitted.getTime() + 86400000) : null;
  return {
    id, employee, startTime: contract.unit === 'hours' ? '09:00' : null, endTime: contract.unit === 'hours' ? '17:00' : null,
    fromDate, toDate, amount: contract.unit === 'hours' ? days * 8 : days, unit: contract.unit,
    status, submitted, reason: null,
    actionedBy: decided ? 'Priya Shah' : null, actionedAt,
    approvedBy: decided ? 'Priya Shah' : null, approvedAt: actionedAt,
    cancellationRequestedAt: null, cancellationReason: null,
  };
};
const CLASH_REQUESTS = [
  clash(101, 'Stephen Nicholls', [11, 2], [11, 6], 'Approved', 2),
  clash(102, 'Justin Keller', [11, 2], [11, 2], 'Awaiting Approval', 20),
  clash(103, 'Amirah Marsden', [11, 1], [11, 4], 'Awaiting Approval', 18),
  clash(104, 'Anita Bradley', [11, 2], [11, 3], 'Approved', 6),
  clash(105, 'Alex Jones', [10, 30], [11, 3], 'Approved', 1),
  clash(106, 'John Smith', [11, 2], [11, 2], 'Approved', 8),
  clash(107, 'David Bukowski', [11, 2], [11, 5], 'Approved', 4),
  clash(108, 'Kira Oswell', [11, 2], [11, 3], 'Awaiting Approval', 22),
  clash(109, 'Jeffrey Henry', [11, 2], [11, 2], 'Approved', 12),
  clash(110, 'Mike Fenwick', [11, 3], [11, 4], 'Approved', 14),
  // Around her approved 30 Nov – 2 Dec and 21–25 Dec holidays, for when those
  // are edited or a new request is made for similar dates.
  clash(111, 'Stephen Nicholls', [11, 30], [12, 1], 'Approved', 9),
  clash(112, 'Justin Keller', [12, 22], [12, 24], 'Awaiting Approval', 25),
];

const CRUNCH_DATES = [[[12, 14], [12, 18]], [[12, 14], [12, 15]], [[12, 16], [12, 18]], [[12, 17], [12, 17]], [[12, 15], [12, 16]], [[12, 14], [12, 14]]];
const CRUNCH_REQUESTS = [
  clash(120, 'Stephen Nicholls', [12, 14], [12, 18], 'Awaiting Approval', 29),
  ...['Justin Keller', 'Amirah Marsden', ...CRUNCH_EXTRA, 'David Bukowski', 'Kira Oswell', 'Jeffrey Henry'].map((name, i) => {
    const [from, to] = CRUNCH_DATES[i % CRUNCH_DATES.length];
    return clash(121 + i, name, from, to, i % 3 === 2 ? 'Awaiting Approval' : 'Approved', 5 + (i % 20));
  }),
];

// Every request still Awaiting Approval should show a busy clash warning in the
// demo, so the generated ones are moved into the mid-December crunch window
// (keeping their length), and Adrianna's 2 Nov request gets the same crowd.
const CRUNCH_START = new Date(2026, 11, 14);
const GENERATED_REQUESTS = buildRequests().map((r) => {
  if (r.status !== 'Awaiting Approval') return r;
  const span = r.toDate - r.fromDate;
  return { ...r, fromDate: CRUNCH_START, toDate: new Date(CRUNCH_START.getTime() + span) };
});
const NOV_CRUNCH_REQUESTS = CRUNCH_EXTRA.slice(0, 14).map((name, i) =>
  clash(140 + i, name, [11, 2], [11, i % 2 ? 3 : 2], i % 3 === 2 ? 'Awaiting Approval' : 'Approved', 3 + i));

const XMAS_CRUNCH_REQUESTS = CRUNCH_EXTRA.map((name, i) =>
  clash(160 + i, name, [12, 22], [12, i % 2 ? 24 : 23], i % 4 === 3 ? 'Awaiting Approval' : 'Approved', 4 + i));

export const LEAVE_REQUESTS = [...GENERATED_REQUESTS, ...CLASH_REQUESTS, ...NOV_CRUNCH_REQUESTS, ...XMAS_CRUNCH_REQUESTS, ...CRUNCH_REQUESTS];
