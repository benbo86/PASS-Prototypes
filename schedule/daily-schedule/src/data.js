// Sample data for the Daily Schedule grid. Times are 'HH:MM' 24hr strings —
// helpers below convert to minutes-since-midnight for timeline positioning
// and sorting, matching the live product's own daily (00:00–23:00) view.

export const AREAS = ['Coleraine Central', 'Portstewart', 'Portrush', 'Ballymoney', 'Castlerock'];

// Visit type is a property of the visit itself (what kind of call it is),
// distinct from an employee's own contract type — see Tags.jsx for the
// colour/icon each one renders with (user-configurable in Roster Settings
// in the real product; a fixed lookup here since that settings screen
// isn't built).
export const VISIT_TYPES = ['Personal care', 'Sleeping night', 'Waking night', 'Domiciliary', 'Companionship', 'Wellbeing check', 'Medication support'];

export const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export const fmtDuration = (start, end) => {
  const total = toMinutes(end) - toMinutes(start);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}hr`;
  return `${h}hr ${m}m`;
};

// A representative slice of the real product's 117-strong backlog — enough
// to demonstrate every sortable field and realistic lane-stacking/overlap
// in the timeline view, without literally rendering all 117.
//
// `employeesRequired` — most visits need one carer, a handful (double-up
// calls, e.g. manual handling or overnight cover) need two. Every entry
// here is unassigned by definition (0 assigned) per the ticket's own scope
// ("unassigned" = zero carers, not just under-staffed), so there's no
// separate `employeesAssigned` field to track.
//
// `timeAdjusted` — flags a visit whose time has been manually moved from
// its originally scheduled slot, shown as a small icon to the right of the
// time in the list view. `planStart`/`planEnd` (only present alongside
// `timeAdjusted: true`) are that original scheduled slot, shown struck
// through beneath the current time in the visit hover card — nothing else
// in this prototype reads them (the list view's own icon is happy with
// just the boolean), they exist purely for that one card.
export const UNASSIGNED_VISITS = [
  { id: 1,  customer: 'James McKeegan',    start: '00:00', end: '12:00', area: 'Coleraine Central', visitType: 'Sleeping night',     employeesRequired: 1 },
  { id: 2,  customer: 'May Halsey',        start: '00:00', end: '12:00', area: 'Portstewart',       visitType: 'Sleeping night',     employeesRequired: 1 },
  { id: 3,  customer: 'May Halsey',        start: '00:00', end: '17:00', area: 'Portstewart',       visitType: 'Sleeping night',     employeesRequired: 2 },
  { id: 4,  customer: 'Rachel Doak',       start: '12:00', end: '13:00', area: 'Ballymoney',        visitType: 'Personal care',      employeesRequired: 1 },
  { id: 5,  customer: 'Sandra Wray',       start: '12:00', end: '14:00', area: 'Coleraine Central', visitType: 'Medication support', employeesRequired: 1, timeAdjusted: true, planStart: '11:00', planEnd: '13:00' },
  { id: 6,  customer: 'Jean Brown',        start: '13:00', end: '17:00', area: 'Castlerock',        visitType: 'Companionship',      employeesRequired: 1 },
  { id: 7,  customer: 'Frances O\'Connor', start: '14:00', end: '17:00', area: 'Portrush',           visitType: 'Wellbeing check',    employeesRequired: 1 },
  { id: 8,  customer: 'James McKeegan',    start: '17:00', end: '23:00', area: 'Coleraine Central', visitType: 'Waking night',       employeesRequired: 1 },
  { id: 9,  customer: 'Alan Beattie',      start: '07:00', end: '07:30', area: 'Portstewart',       visitType: 'Personal care',      employeesRequired: 1, timeAdjusted: true, planStart: '06:30', planEnd: '07:00' },
  { id: 10, customer: 'Betty Carson',      start: '07:15', end: '08:00', area: 'Ballymoney',        visitType: 'Personal care',      employeesRequired: 2, timeAdjusted: true, planStart: '08:30', planEnd: '09:15' },
  { id: 11, customer: 'Colin Dunlop',      start: '08:00', end: '08:30', area: 'Coleraine Central', visitType: 'Personal care',      employeesRequired: 1 },
  { id: 12, customer: 'Diane Elliott',     start: '08:30', end: '09:15', area: 'Portrush',           visitType: 'Medication support', employeesRequired: 1, timeAdjusted: true, planStart: '08:00', planEnd: '08:45' },
  { id: 13, customer: 'Eamon Feeney',      start: '09:00', end: '10:00', area: 'Castlerock',        visitType: 'Domiciliary',        employeesRequired: 1 },
  { id: 14, customer: 'Fiona Gault',       start: '10:00', end: '10:45', area: 'Coleraine Central', visitType: 'Medication support', employeesRequired: 1 },
  { id: 15, customer: 'Gerry Hutton',      start: '11:00', end: '12:00', area: 'Portstewart',       visitType: 'Companionship',      employeesRequired: 1 },
  { id: 16, customer: 'Heather Irwin',     start: '11:30', end: '12:15', area: 'Ballymoney',        visitType: 'Wellbeing check',    employeesRequired: 2 },
  { id: 17, customer: 'Ian Jamison',       start: '13:00', end: '13:30', area: 'Portrush',           visitType: 'Personal care',      employeesRequired: 1, timeAdjusted: true, planStart: '12:30', planEnd: '13:00' },
  { id: 18, customer: 'Julie Kane',        start: '14:15', end: '15:00', area: 'Coleraine Central', visitType: 'Personal care',      employeesRequired: 2 },
  { id: 19, customer: 'Keith Lowry',       start: '15:00', end: '16:30', area: 'Castlerock',        visitType: 'Domiciliary',        employeesRequired: 1 },
  { id: 20, customer: 'Linda Mullan',      start: '16:00', end: '16:30', area: 'Portstewart',       visitType: 'Medication support', employeesRequired: 1 },
  { id: 21, customer: 'Martin Neill',      start: '18:00', end: '18:30', area: 'Ballymoney',        visitType: 'Personal care',      employeesRequired: 1 },
  { id: 22, customer: 'Nuala O\'Hara',     start: '19:00', end: '19:45', area: 'Coleraine Central', visitType: 'Medication support', employeesRequired: 1 },
  { id: 23, customer: 'Owen Prentice',     start: '20:00', end: '20:30', area: 'Portrush',           visitType: 'Personal care',      employeesRequired: 1 },
  { id: 24, customer: 'Paula Quinn',       start: '21:00', end: '22:00', area: 'Castlerock',        visitType: 'Wellbeing check',    employeesRequired: 1 },
];

// Shifts/runs — a single carer working several visits back-to-back as one
// piece of work, rather than each visit being separately unassigned. Reuses
// the same field names a plain visit uses (`customer`/`start`/`end`/`area`/
// `visitType`/`employeesRequired`) so a shift can flow through the exact
// same sort/filter code as a visit in the list view — `customer` holds the
// shift's own name (it's what renders in the Customer/Shift column), and
// `visitType` is the fixed value 'Run' rather than one of VISIT_TYPES,
// distinguishing a shift row from a plain visit row at a glance. Each
// shift's own `visits` array is its constituent unassigned visits — deliberately
// using customer names that don't otherwise appear in UNASSIGNED_VISITS
// above, so a name never appears to be both a standalone unassigned visit
// and part of a shift at once.
//
// `template`/`defaultEmployee` back the shift hover card (the live product's
// own hover-preview, reproduced here with this prototype's own shift
// examples) — `template` is the shift's own recurring-schedule metadata
// (whether it posts pay/an invoice line, and its cadence), `defaultEmployee`
// is whoever this shift's template normally assigns, shown as a plain name
// here since there's no separate "employee lookup by name" data structure
// in this prototype worth building for one hover card.
export const UNASSIGNED_SHIFTS = [
  {
    id: 'shift-1', kind: 'shift',
    customer: 'Coleraine Morning Run', start: '07:00', end: '09:15',
    area: 'Coleraine Central', visitType: 'Run', employeesRequired: 1,
    template: { payable: true, chargeable: true, cadence: 'Daily' },
    defaultEmployee: 'Katheryn Perry',
    visits: [
      { id: 101, customer: 'Robert Adair',    start: '07:00', end: '07:30', visitType: 'Personal care',      employeesRequired: 1 },
      { id: 102, customer: 'Susan Boyd',      start: '07:45', end: '08:15', visitType: 'Medication support', employeesRequired: 1, timeAdjusted: true, planStart: '07:30', planEnd: '08:00' },
      { id: 103, customer: 'Thomas Crawford', start: '08:30', end: '09:15', visitType: 'Personal care',      employeesRequired: 1 },
    ],
  },
  {
    id: 'shift-2', kind: 'shift',
    customer: 'Portstewart Evening Run', start: '18:00', end: '20:30',
    area: 'Portstewart', visitType: 'Run', employeesRequired: 1,
    template: { payable: true, chargeable: false, cadence: 'Weekly' },
    defaultEmployee: 'Sarah Mitchell',
    visits: [
      { id: 104, customer: 'Valerie Dunbar',  start: '18:00', end: '18:30', visitType: 'Personal care',   employeesRequired: 1 },
      { id: 105, customer: 'William Erskine', start: '18:45', end: '19:15', visitType: 'Companionship',   employeesRequired: 1 },
      { id: 106, customer: 'Yvonne Fulton',   start: '19:30', end: '20:30', visitType: 'Wellbeing check', employeesRequired: 1 },
    ],
  },
];

// Static "who's available" list for the assign panel — same shape/fields
// as schedule/assign-visit-absent-employee-event-panel's own EMPLOYEES,
// reused rather than reinvented (avatarBg tints, fill %, travel distance).
export const RECOMMENDED_EMPLOYEES = [
  {
    id: 1, name: 'Katheryn Perry', title: 'Mrs', type: 'Fulltime',
    visited: '66 in last 30d', travel: '1.2 miles', fill: 68,
    avatarBg: 'var(--availability-3-green-tint)',
  },
  {
    id: 2, name: 'Sarah Mitchell', title: 'Ms', type: 'Part time',
    visited: '42 in last 30d', travel: '0.8 miles', fill: 45,
    avatarBg: 'var(--availability-4-blue-tint)',
  },
  {
    id: 3, name: 'James Thornton', title: 'Mr', type: 'Variable',
    visited: '31 in last 30d', travel: '2.1 miles', fill: 30,
    avatarBg: 'var(--availability-6-mauve-tint)',
  },
];

// Sample employee rows below the Unassigned section — the exact names/
// hours visible in the live product screenshot, kept for continuity. No
// shift/visit/absence bars on the timeline itself — those aren't styled
// correctly and aren't important for this prototype's own focus (the
// Unassigned Visits list toggle above).
export const SAMPLE_EMPLOYEES = [
  { id: 'e1', name: 'Abigail Harbison', hoursDone: '14 hrs', hoursTotal: '20 hrs scheduled', type: 'Fulltime' },
  { id: 'e2', name: 'Amanda McCullough', hoursDone: '9 hrs', hoursTotal: '24 hrs scheduled', type: 'Part time' },
  { id: 'e3', name: 'Amy - Leigh McKinney', hoursDone: '0 hrs', hoursTotal: '37 hrs 30 m scheduled', type: 'Variable' },
  { id: 'e4', name: 'Amy McFetridge', hoursDone: '0 hrs', hoursTotal: '30 hrs scheduled', type: 'Bank' },
  { id: 'e5', name: 'Andrea Lappin', hoursDone: '3 hrs 50 m', hoursTotal: '16 hrs scheduled', type: 'Fulltime' },
];
