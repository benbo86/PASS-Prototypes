// Shared leave-request records linking mobile/holidays (the employee's app)
// and schedule/leave-requests (the office's web table), so a demo can submit
// a request on one and action it on the other — plus the holiday
// notifications those office decisions send her (shown in
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

const REQUESTS_KEY = 'pass-demo-leave-requests-v4'
const NOTIFICATIONS_KEY = 'pass-demo-holiday-notifications-v1'
const CHANGE_EVENT = 'pass-demo-leave-requests-change'

// The employee the mobile app is signed in as (Components/AccountScreen.jsx).
// Only her days-scheme requests are linked; the app's hours-scheme example
// keeps its own unlinked data.
export const DEMO_EMPLOYEE = 'Adrianna Janowski'

// Seed = one request in each status. Dated just before "today" in the
// prototypes (mid-Oct 2026) so they're the most recently submitted rows and
// sit at the top of the web table, which sorts newest first.
const at = (iso, time = '10:30') => `${iso}T${time}:00`
const SEED_REQUESTS = [
  { id: 'days-1', contract: 'days', leaveType: 'Full Day', fromDate: '2026-11-02', toDate: '2026-11-02', amount: 1, status: 'Awaiting Approval', submitted: at('2026-10-12') },
  { id: 'days-2', contract: 'days', leaveType: 'Half Day (AM)', fromDate: '2026-10-23', toDate: '2026-10-23', amount: 0.5, status: 'Awaiting Cancellation', submitted: at('2026-09-28'), actionedBy: 'Priya Shah', actionedAt: at('2026-09-29', '09:15') },
  { id: 'days-3', contract: 'days', leaveType: 'Full Day', fromDate: '2026-12-21', toDate: '2026-12-25', amount: 5, status: 'Approved', submitted: at('2026-10-05'), actionedBy: 'Grace Okafor', actionedAt: at('2026-10-06', '14:00') },
  { id: 'days-4', contract: 'days', leaveType: 'Full Day', fromDate: '2026-10-30', toDate: '2026-10-30', amount: 1, status: 'Declined', submitted: at('2026-10-01'), reason: 'Insufficient staff cover for the requested date', actionedBy: 'Priya Shah', actionedAt: at('2026-10-02', '11:45') },
  { id: 'days-5', contract: 'days', leaveType: 'Full Day', fromDate: '2026-11-06', toDate: '2026-11-06', amount: 1, status: 'Cancelled', submitted: at('2026-09-24'), reason: 'Employee requested different dates', actionedBy: 'Alex Morgan', actionedAt: at('2026-09-30', '16:30') },
].map(r => ({ reason: null, actionedBy: null, actionedAt: null, ...r, employee: DEMO_EMPLOYEE }))

// ── Notifications ──────────────────────────────────────────────────
// One per office decision, snapshotting the request as it was then (a
// request can be approved and later cancelled — two notifications).
//   seen: counted on the bell until she opens the Notification Centre.
//   read: the centre's unread dot, cleared by tapping it / Mark all as read.
// Opening her Holidays list does both for that request's notifications.
const NOTIFICATION_TYPES = { Approved: 'holiday_approved', Declined: 'holiday_declined', Cancelled: 'holiday_cancelled' }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function fmtIso(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return `${String(d).padStart(2, '0')} ${MONTHS[m - 1]} ${y}`
}

function notificationFor(request, status, atIso, flags) {
  return {
    id: `n-${request.id}-${status}-${Date.parse(atIso)}`,
    requestId: request.id,
    type: NOTIFICATION_TYPES[status],
    at: atIso,
    dateRange: request.fromDate === request.toDate ? fmtIso(request.fromDate) : `${fmtIso(request.fromDate)} – ${fmtIso(request.toDate)}`,
    amount: `${request.amount} ${request.amount === 1 ? 'day' : 'days'}`,
    reason: status === 'Approved' ? null : request.reason,
    ...flags,
  }
}

// The seed requests' own past decisions, already read.
const SEED_NOTIFICATIONS = SEED_REQUESTS
  .filter(r => NOTIFICATION_TYPES[r.status])
  .map(r => notificationFor(r, r.status, r.actionedAt, { seen: true, read: true }))
  .sort((a, b) => b.at.localeCompare(a.at))

// ── Storage ────────────────────────────────────────────────────────
// useSyncExternalStore needs the same array back until the data actually
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

function subscribe(callback) {
  const onStorage = e => {
    if (e.key === REQUESTS_KEY || e.key === NOTIFICATIONS_KEY || e.key === null) callback()
  }
  window.addEventListener('storage', onStorage)
  window.addEventListener(CHANGE_EVENT, callback)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(CHANGE_EVENT, callback)
  }
}

// ── Requests ───────────────────────────────────────────────────────
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

export function removeLeaveRequest(id) {
  write(REQUESTS_KEY, readRequests().filter(r => r.id !== id))
}

// The office approving, declining or cancelling one of her requests: updates
// the request, flags it as an unseen response (cleared when she opens her
// Holidays list), and sends her a notification.
export function recordOfficeDecision(id, { status, reason = null, actionedBy, actionedAt }) {
  const request = readRequests().find(r => r.id === id)
  if (!request) return
  const updated = { ...request, status, reason, actionedBy, actionedAt, responseSeen: false }
  write(REQUESTS_KEY, readRequests().map(r => (r.id === id ? updated : r)))
  if (NOTIFICATION_TYPES[status]) {
    write(NOTIFICATIONS_KEY, [notificationFor(updated, status, actionedAt, { seen: false, read: false }), ...readNotifications()])
  }
}

// Records without the field (the seed) count as seen.
export function isUnseenResponse(r) {
  return r.responseSeen === false
}

// She's opened her Holidays list: these requests' responses are seen, and
// so are (and read) the notifications about them.
export function markResponsesSeen(ids) {
  const set = new Set(ids)
  write(REQUESTS_KEY, readRequests().map(r => (set.has(r.id) ? { ...r, responseSeen: true } : r)))
  write(NOTIFICATIONS_KEY, readNotifications().map(n => (set.has(n.requestId) ? { ...n, seen: true, read: true } : n)))
}

// ── Notifications ──────────────────────────────────────────────────
export function useHolidayNotifications() {
  return useSyncExternalStore(subscribe, readNotifications, () => SEED_NOTIFICATIONS)
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
