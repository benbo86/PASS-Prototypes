// Status wording matches AIOP-21563 ("Holiday in the app: App behaviour")
// and the Figma screens built from it. The office's Leave Requests table
// (schedule/leave-requests/) uses the same words in title case.
export const STATUSES = ['Awaiting approval', 'Awaiting cancellation', 'Approved', 'Declined', 'Cancelled', 'Withdrawn']

// Two entirely different request experiences depending on the employee's
// own contract — not a single form that adapts a few fields. A days-scheme
// employee only ever thinks in All day / Part of the day; there's no "day" concept
// at all for an hourly-scheme employee, so those choices genuinely
// don't apply to them — they just state real start/end date+time. The
// mobile/holidays/ prototype's own toggle switches between these two full
// experiences for demo purposes; a real employee would only ever see one.
export const CONTRACT_TYPES = ['days', 'hours']

// Requests are stored in Components/leaveRequestsStore.js (shared with the
// office's schedule/leave-requests table) using the office's wording, so
// they're translated to this app's wording when read.
const STATUS_FROM_OFFICE = {
  'Awaiting Approval': 'Awaiting approval',
  'Awaiting Cancellation': 'Awaiting cancellation',
  'Approved': 'Approved',
  'Declined': 'Declined',
  'Cancelled': 'Cancelled',
  'Withdrawn': 'Withdrawn',
}

// Shared record -> the shape the request cards read.
export function toAppRequest(r) {
  return {
    id: r.id,
    status: STATUS_FROM_OFFICE[r.status] ?? r.status,
    fromDate: r.fromDate,
    toDate: r.toDate,
    amount: r.amount,
    // What she asked for (days scheme), shown on the card.
    leaveType: r.leaveType ? daysLeaveTypeText(r) : null,
    startTime: r.startTime || null,
    endTime: r.endTime || null,
    requestedOn: r.submitted.slice(0, 10),
    reason: r.reason,
    // Approved for different dates from those she asked for.
    requestedFrom: r.requestedFrom || null,
    requestedTo: r.requestedTo || null,
    // She asked to cancel and the office kept the holiday.
    cancellationKept: !!r.cancellationKept,
    keptReason: r.keptReason || null,
    // Optional message from the office when it approved.
    approvalNote: r.approvalNote || null,
    // The office's status when it was cancelled (see recordOfficeDecision).
    cancelledFrom: r.cancelledFrom || null,
    // She withdrew it before the office decided.
    withdrawnOn: r.withdrawnAt ? r.withdrawnAt.slice(0, 10) : null,
  }
}

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
// All day, or part of one day with its times (stored as the office's
// 'Full Day' / 'Part Day').
export const DAYS_LEAVE_TYPES = ['All day', 'Part of the day']

// A days-scheme request in the app's words, from a shared store record.
export function daysLeaveTypeText(r) {
  if (r.leaveType === 'Part Day') return `Part of the day, ${r.startTime} - ${r.endTime}`
  if (r.leaveType === 'Full Day') return 'All day'
  return r.leaveType
}

// Booked/taken/available are worked out from her requests
// (useEntitlement in Components/leaveRequestsStore.js).
export const DAYS_ENTITLEMENT_TOTAL = 28

export function fmtDays(n) {
  return `${n} ${n === 1 ? 'day' : 'days'}`
}

// ── Hours-scheme employee ────────────────────────────────────────
// No All day/Part of the day choice at all — just real Start/End date + real
// Start/End time. Total hours = the date span x the daily time window,
// since the same start/end time is worked on every day in the range.
export const HOURS_ENTITLEMENT_TOTAL = 224

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
