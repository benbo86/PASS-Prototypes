// Status wording matches AIOP-21563 ("Holiday in the app: App behaviour")
// and the Figma screens built from it — "Awaiting approval", not
// "Pending". This is the CARE WORKER's own view of the request; the
// office/web side (schedule/leave-requests/) uses "Pending" for the same
// underlying state — deliberately different vocabulary for two different
// audiences of the same record, not an inconsistency to reconcile.
export const STATUSES = ['Awaiting approval', 'Awaiting cancellation', 'Approved', 'Declined']

// Two entirely different request experiences depending on the employee's
// own contract — not a single form that adapts a few fields. A days-scheme
// employee only ever thinks in Full day/Half day; there's no "day" concept
// at all for an hourly-scheme employee, so Full day/Half day genuinely
// don't apply to them — they just state real start/end date+time. The
// mobile/holidays/ prototype's own toggle switches between these two full
// experiences for demo purposes; a real employee would only ever see one.
export const CONTRACT_TYPES = ['days', 'hours']

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export function fmtDate(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number)
  return `${String(d).padStart(2, '0')} ${MONTHS[m - 1]} ${y}`
}

// DD/MM/YYYY — matches Components/HolidayAbsenceDialog.jsx's own DateInput
// display format (react-datepicker's dateFormat="dd/MM/yyyy") exactly,
// since the field styling here is copied from that same web dialog.
export function fmtDateShort(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number)
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`
}

export function spanDays(fromDate, toDate) {
  return Math.max(1, Math.round((new Date(toDate) - new Date(fromDate)) / 86400000) + 1)
}

// ── Days-scheme employee ─────────────────────────────────────────
// Full day / Half day (AM/PM) only — no time-of-day capture at all.
export const DAYS_LEAVE_TYPES = ['Full day', 'Half day']
export const HALF_DAY_OPTIONS = ['AM', 'PM']

export const DAYS_ENTITLEMENT = { total: 28, booked: 5.5, taken: 0 }

export const DAYS_INITIAL_REQUESTS = [
  { id: 1, status: 'Awaiting approval', fromDate: '2026-02-02', toDate: '2026-02-02', amount: 1, requestedOn: '2025-12-18' },
  { id: 2, status: 'Awaiting cancellation', fromDate: '2026-01-15', toDate: '2026-01-15', amount: 0.5, requestedOn: '2025-12-01' },
  { id: 3, status: 'Approved', fromDate: '2025-12-23', toDate: '2025-12-27', amount: 5, requestedOn: '2025-12-15' },
  { id: 4, status: 'Declined', fromDate: '2026-01-05', toDate: '2026-01-05', amount: 1, requestedOn: '2025-12-10' },
]

export function fmtDays(n) {
  return `${n} ${n === 1 ? 'day' : 'days'}`
}

// ── Hours-scheme employee ────────────────────────────────────────
// No Full day/Half day concept at all — just real Start/End date + real
// Start/End time. Total hours = the date span x the daily time window,
// since the same start/end time is worked on every day in the range.
export const HOURS_ENTITLEMENT = { total: 224, booked: 44, taken: 0 }

export const HOURS_INITIAL_REQUESTS = [
  { id: 1, status: 'Awaiting approval', fromDate: '2026-02-02', toDate: '2026-02-02', amount: 4, requestedOn: '2025-12-18' },
  { id: 2, status: 'Awaiting cancellation', fromDate: '2026-01-15', toDate: '2026-01-15', amount: 4, requestedOn: '2025-12-01' },
  { id: 3, status: 'Approved', fromDate: '2025-12-23', toDate: '2025-12-27', amount: 40, requestedOn: '2025-12-15' },
  { id: 4, status: 'Declined', fromDate: '2026-01-05', toDate: '2026-01-05', amount: 8, requestedOn: '2025-12-10' },
]

export function hoursBetween(start, end) {
  if (!start || !end) return 0
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const mins = (eh * 60 + em) - (sh * 60 + sm)
  return Math.max(0, Math.round((mins / 60) * 10) / 10)
}

export function fmtHours(h) {
  return `${h} hr${h === 1 ? '' : 's'}`
}
