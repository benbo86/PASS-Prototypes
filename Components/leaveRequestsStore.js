// Shared holiday-request records linking mobile/holidays (the employee's app)
// and schedule/leave-requests (the office's Holiday Requests table), so a
// demo can submit a request on one and action it on the other — plus the
// holiday notifications those office decisions send her (shown in
// mobile/notifications and counted on every mobile prototype's bell).
//
// Lives in localStorage, so every page sees the same data when open in the
// same browser. Other tabs pick changes up live via the `storage` event, and
// a same-tab change notifies via a custom event. Not shared across devices or
// people (that would need Firestore), which suits a facilitated demo:
// nothing one session does leaks into anyone else's.
//
// Records use the office's status vocabulary (Awaiting Approval,
// Awaiting Cancellation…). The mobile app maps to its own sentence-case
// wording (Awaiting approval…) when it reads them — see mobile/holidays/src/data.js.
import { useSyncExternalStore } from 'react'

const REQUESTS_KEY = 'pass-demo-leave-requests-v9'
const NOTIFICATIONS_KEY = 'pass-demo-holiday-notifications-v3'
const SCHEME_KEY = 'pass-demo-holiday-scheme'
const CHANGE_EVENT = 'pass-demo-leave-requests-change'

// The employee the mobile app is signed in as (Components/AccountScreen.jsx).
export const DEMO_EMPLOYEE = 'Adrianna Janowski'

// A real employee has one holiday scheme. The mobile app's demo toggle
// switches Adrianna between the two, and the web table shows her requests
// for whichever scheme is selected, so both sides always tell one story.
export const SCHEMES = ['days', 'hours']

// Seed = one request in each status, per scheme, plus a second Approved one.
// Dated just before "today" in the prototypes (mid-Oct 2026) so they're the
// most recently submitted rows and sit at the top of the web table, which
// sorts newest first.
// The two Approved ones show the office approving less than she asked for,
// with a note: 3 keeps her dates but only takes the days she works
// (workedDays); 7 shortens the dates (requestedFrom/To is what she asked for).
const at = (iso, time = '10:30') => `${iso}T${time}:00`
const SEED_SHAPES = [
  { n: 1, fromDate: '2026-11-02', toDate: '2026-11-02', status: 'Awaiting Approval', submitted: at('2026-10-12', '08:47') },
  { n: 2, fromDate: '2026-10-23', toDate: '2026-10-23', status: 'Awaiting Cancellation', submitted: at('2026-09-28', '19:22'), actionedBy: 'Priya Shah', actionedAt: at('2026-09-29', '09:15') },
  { n: 3, fromDate: '2026-12-21', toDate: '2026-12-25', status: 'Approved', submitted: at('2026-10-05', '13:05'), actionedBy: 'Grace Okafor', actionedAt: at('2026-10-06', '14:00'), workedDays: 3, approvalNote: "You don't work Wednesdays or Thursdays, so those days aren't taken from your entitlement." },
  { n: 7, fromDate: '2026-11-30', toDate: '2026-12-02', requestedFrom: '2026-11-30', requestedTo: '2026-12-04', status: 'Approved', submitted: at('2026-10-09', '11:20'), actionedBy: 'Priya Shah', actionedAt: at('2026-10-10', '10:05'), workedDays: 3, approvalNote: 'We can only cover your visits Monday to Wednesday that week.' },
  { n: 4, fromDate: '2026-10-30', toDate: '2026-10-30', status: 'Declined', submitted: at('2026-10-01', '07:58'), reason: 'Insufficient staff cover for the requested date', actionedBy: 'Priya Shah', actionedAt: at('2026-10-02', '11:45') },
  { n: 5, fromDate: '2026-11-06', toDate: '2026-11-06', status: 'Cancelled', submitted: at('2026-09-24', '16:41'), reason: 'Employee requested different dates', actionedBy: 'Alex Morgan', actionedAt: at('2026-09-30', '16:30'), cancelledFrom: 'Awaiting Cancellation' },
  { n: 6, fromDate: '2026-11-13', toDate: '2026-11-13', status: 'Withdrawn', submitted: at('2026-10-07', '18:12'), withdrawnAt: at('2026-10-08', '07:40') },
]
// Request 2 is part of a day (09:00–13:00); the rest are full days.
const DAYS_AMOUNTS = { 1: 1, 2: 0.5, 3: 5, 4: 1, 5: 1, 6: 1 }
const SEED_REQUESTS = SEED_SHAPES.flatMap(({ n, workedDays, ...s }) => {
  const halfDay = n === 2
  return [
    {
      ...s, id: `days-${n}`, contract: 'days', leaveType: halfDay ? 'Part Day' : 'Full Day',
      ...(halfDay ? { startTime: '09:00', endTime: '13:00' } : {}),
      amount: workedDays ?? DAYS_AMOUNTS[n],
    },
    {
      ...s, id: `hours-${n}`, contract: 'hours', leaveType: halfDay ? 'Part Day' : 'Full Day',
      startTime: '09:00', endTime: halfDay ? '13:00' : '17:00',
      amount: (workedDays ?? spanDays(s.fromDate, s.toDate)) * (halfDay ? 4 : 8),
    },
  ]
}).map(r => ({ reason: null, actionedBy: null, actionedAt: null, ...r, employee: DEMO_EMPLOYEE }))

export function spanDays(fromIso, toIso) {
  return Math.max(1, Math.round((new Date(toIso) - new Date(fromIso)) / 86400000) + 1)
}

// ── Notifications ──────────────────────────────────────────────────
// One per office decision, snapshotting the request as it was then (a
// request can be approved and later cancelled — two notifications).
//   seen: counted on the bell until she opens the Notification Centre.
//   read: the centre's unread dot, cleared by tapping it / Mark all as read.
// Opening her Holidays list does both for that request's notifications.
const NOTIFICATION_TYPES = {
  Approved: 'holiday_approved',
  Declined: 'holiday_declined',
  Cancelled: 'holiday_cancelled',
  Kept: 'holiday_cancellation_declined',
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function fmtIso(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return `${String(d).padStart(2, '0')} ${MONTHS[m - 1]} ${y}`
}
export function fmtIsoRange(fromIso, toIso) {
  return fromIso === toIso ? fmtIso(fromIso) : `${fmtIso(fromIso)} – ${fmtIso(toIso)}`
}
export function fmtAmount(amount, contract) {
  return contract === 'hours' ? `${amount} hr${amount === 1 ? '' : 's'}` : `${amount} ${amount === 1 ? 'day' : 'days'}`
}

// outcome: Approved / Declined / Cancelled, or Kept (a cancellation request
// the office turned down — the holiday stays).
function notificationFor(request, outcome, atIso, flags) {
  return {
    id: `n-${request.id}-${outcome}-${Date.parse(atIso)}`,
    requestId: request.id,
    contract: request.contract,
    type: NOTIFICATION_TYPES[outcome],
    at: atIso,
    dateRange: fmtIsoRange(request.fromDate, request.toDate),
    amount: fmtAmount(request.amount, request.contract),
    // Approved with different dates from those she asked for.
    requestedRange: outcome === 'Approved' && request.requestedFrom ? fmtIsoRange(request.requestedFrom, request.requestedTo) : null,
    reason: outcome === 'Approved' ? request.approvalNote || null : outcome === 'Kept' ? request.keptReason : request.reason,
    ...flags,
  }
}

// The seed requests' own past decisions, already read.
const SEED_NOTIFICATIONS = SEED_REQUESTS
  .filter(r => NOTIFICATION_TYPES[r.status])
  .map(r => notificationFor(r, r.status, r.actionedAt, { seen: true, read: true }))
  .sort((a, b) => b.at.localeCompare(a.at))

// ── Storage ────────────────────────────────────────────────────────
// useSyncExternalStore needs the same value back until the data actually
// changes, so each key's parsed value is cached against its raw string.
const cache = {}

function read(key, fallback) {
  let raw = null
  try { raw = localStorage.getItem(key) } catch { /* storage blocked: fall back to seed */ }
  const c = cache[key]
  if (c && c.raw === raw) return c.value
  let value = fallback
  try { if (raw) value = JSON.parse(raw) } catch { /* corrupt: fall back to seed */ }
  cache[key] = { raw, value }
  return value
}

function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* storage blocked */ }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

const readRequests = () => read(REQUESTS_KEY, SEED_REQUESTS)
const readNotifications = () => read(NOTIFICATIONS_KEY, SEED_NOTIFICATIONS)
const readScheme = () => read(SCHEME_KEY, 'days')

function subscribe(callback) {
  const keys = [REQUESTS_KEY, NOTIFICATIONS_KEY, SCHEME_KEY]
  const onStorage = e => { if (e.key === null || keys.includes(e.key)) callback() }
  window.addEventListener('storage', onStorage)
  window.addEventListener(CHANGE_EVENT, callback)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(CHANGE_EVENT, callback)
  }
}

// ── Scheme ─────────────────────────────────────────────────────────
export function useDemoScheme() {
  return useSyncExternalStore(subscribe, readScheme, () => 'days')
}

export function setDemoScheme(scheme) {
  write(SCHEME_KEY, scheme)
}

// ── Requests ───────────────────────────────────────────────────────
// All of Adrianna's requests, both schemes. Callers filter by
// useDemoScheme() for what to show.
export function useLeaveRequests() {
  return useSyncExternalStore(subscribe, readRequests, () => SEED_REQUESTS)
}

export function addLeaveRequest(record) {
  const id = `demo-${Date.now()}`
  write(REQUESTS_KEY, [{ reason: null, actionedBy: null, actionedAt: null, ...record, id }, ...readRequests()])
  return id
}

export function updateLeaveRequest(id, patch) {
  write(REQUESTS_KEY, readRequests().map(r => (r.id === id ? { ...r, ...patch } : r)))
}

// She withdraws a request the office hasn't decided on yet. It leaves her
// list, but the office keeps it as "Withdrawn" rather than it vanishing
// from under them.
export function withdrawLeaveRequest(id) {
  updateLeaveRequest(id, { status: 'Withdrawn', withdrawnAt: new Date().toISOString() })
}

// The office approving, declining, cancelling, or keeping a holiday whose
// cancellation she asked for. Updates the request, flags it as an unseen
// response (cleared when she opens her Holidays list), and sends her a
// notification.
//
// Approve may come with different dates/times/amount from the request
// (`approved`); the request then takes the approved values and remembers
// what she asked for, so her app can show the change.
export function recordOfficeDecision(id, { status, reason = null, note = null, actionedBy, actionedAt, approved = null, kept = false }) {
  const request = readRequests().find(r => r.id === id)
  if (!request) return
  let updated = { ...request, status, actionedBy, actionedAt, responseSeen: false }
  // Optional message to her when approving (e.g. why fewer days).
  if (status === 'Approved' && !kept) updated.approvalNote = note
  if (kept) {
    updated.keptReason = reason
    updated.cancellationKept = true
  } else {
    updated.reason = reason
  }
  // What it was when cancelled: Awaiting Cancellation (she asked), Approved
  // (the office cancelled her holiday), or Awaiting Approval (the office
  // cancelled it before deciding). Her app words the card from this.
  if (status === 'Cancelled') updated.cancelledFrom = request.status
  if (approved) {
    const datesChanged = approved.fromDate !== request.fromDate || approved.toDate !== request.toDate
    updated = {
      ...updated,
      ...approved,
      requestedFrom: datesChanged ? request.fromDate : null,
      requestedTo: datesChanged ? request.toDate : null,
    }
  }
  // The notification is saved before the request: another tab (the app)
  // reacts to the request changing by marking its notifications seen, so
  // the notification has to be there already or that tab could save its
  // older list over it.
  const outcome = kept ? 'Kept' : status
  if (NOTIFICATION_TYPES[outcome]) {
    write(NOTIFICATIONS_KEY, [notificationFor(updated, outcome, actionedAt, { seen: false, read: false }), ...readNotifications()])
  }
  write(REQUESTS_KEY, readRequests().map(r => (r.id === id ? updated : r)))
}

// Records without the field (the seed) count as seen.
export function isUnseenResponse(r) {
  return r.responseSeen === false
}

// She's opened her Holidays list: these requests' responses are seen, and
// so are (and read) the notifications about them.
// Only rewrites the notifications when one actually changes, so a tab
// working from a slightly stale list never saves it over a newer one.
export function markResponsesSeen(ids) {
  const set = new Set(ids)
  write(REQUESTS_KEY, readRequests().map(r => (set.has(r.id) ? { ...r, responseSeen: true } : r)))
  const notifications = readNotifications()
  if (notifications.some(n => set.has(n.requestId) && (!n.seen || !n.read))) {
    write(NOTIFICATIONS_KEY, notifications.map(n => (set.has(n.requestId) ? { ...n, seen: true, read: true } : n)))
  }
}

// Entitlement figures for one scheme, from her requests: an approved
// holiday (including one awaiting cancellation, which still stands) counts
// as taken once it's over, booked until then.
export function useEntitlement(contract, total) {
  const requests = useLeaveRequests()
  const today = new Date().toISOString().slice(0, 10)
  let booked = 0, taken = 0, pending = 0
  for (const r of requests) {
    if (r.contract !== contract) continue
    if (r.status === 'Awaiting Approval') { pending += r.amount; continue }
    if (r.status !== 'Approved' && r.status !== 'Awaiting Cancellation') continue
    if (r.toDate < today) taken += r.amount
    else booked += r.amount
  }
  // pending: requests awaiting approval. Not in available (the summary
  // cards), but a new request is checked against available minus pending.
  return { total, booked, taken, pending, available: total - booked - taken }
}

// ── Notifications ──────────────────────────────────────────────────
// Every scheme's notifications.
export function useAllHolidayNotifications() {
  return useSyncExternalStore(subscribe, readNotifications, () => SEED_NOTIFICATIONS)
}

// For the scheme currently selected in the app's demo toggle.
export function useHolidayNotifications() {
  const all = useAllHolidayNotifications()
  const scheme = useDemoScheme()
  return all.filter(n => n.contract === scheme)
}

// The bell count on every mobile prototype's footer (Components/AppNav.jsx).
export function useUnseenNotificationCount() {
  return useHolidayNotifications().filter(n => !n.seen).length
}

export function markNotificationsSeen() {
  const list = readNotifications()
  if (list.some(n => !n.seen)) write(NOTIFICATIONS_KEY, list.map(n => ({ ...n, seen: true })))
}

export function markNotificationRead(id) {
  write(NOTIFICATIONS_KEY, readNotifications().map(n => (n.id === id ? { ...n, read: true, seen: true } : n)))
}

export function markAllNotificationsRead() {
  write(NOTIFICATIONS_KEY, readNotifications().map(n => ({ ...n, read: true, seen: true })))
}

export function removeNotification(id) {
  write(NOTIFICATIONS_KEY, readNotifications().filter(n => n.id !== id))
}

export function resetLeaveRequests() {
  try {
    localStorage.removeItem(REQUESTS_KEY)
    localStorage.removeItem(NOTIFICATIONS_KEY)
  } catch { /* storage blocked */ }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}
