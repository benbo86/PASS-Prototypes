import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAllHolidayNotifications, useDemoScheme, markNotificationRead } from './leaveRequestsStore'

// A push notification as it appears while the app is already open: when the
// office responds to one of Adrianna's holiday requests (schedule/leave-
// requests), a banner slides down at the top of the phone for a few
// seconds. Tapping it opens Holidays.
//
// Shown by every mobile prototype's AppNav (and directly by mobile/holidays,
// which hides AppNav on some screens). Only notifications that arrive while
// the page is open trigger it, not ones already there on load. Whether the
// bell counts it is decided elsewhere: if she's looking at her Holidays
// list the response is marked seen there, otherwise it waits in the bell.

const SHOW_MS = 5000

const TYPES = {
  holiday_approved: { label: 'Holiday request approved', tone: 'green' },
  holiday_declined: { label: 'Holiday request declined', tone: 'red' },
  holiday_cancelled: { label: 'Holiday request cancelled', tone: 'grey' },
  holiday_cancellation_declined: { label: 'Holiday cancellation declined', tone: 'red' },
}

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
  </svg>
)

// onOpen: what tapping the banner does. Defaults to going to the Holidays
// prototype; mobile/holidays passes its own (it's already there).
export default function HolidayNotificationBanner({ onOpen }) {
  // All schemes, so switching the demo scheme doesn't make the other
  // scheme's existing notifications look new.
  const notifications = useAllHolidayNotifications()
  const scheme = useDemoScheme()
  const knownIdsRef = useRef(null)
  const anchorRef = useRef(null)
  const [frame, setFrame] = useState(null)
  const [shown, setShown] = useState(null)
  const [leaving, setLeaving] = useState(false)
  const timersRef = useRef([])

  // Render into the phone mockup itself, so the banner sits at the top of
  // the screen whatever component this is mounted inside.
  useEffect(() => {
    setFrame(anchorRef.current?.closest('.phone-frame') || null)
  }, [])

  useEffect(() => {
    if (knownIdsRef.current === null) {
      knownIdsRef.current = new Set(notifications.map(n => n.id))
      return
    }
    const fresh = notifications.filter(n => !knownIdsRef.current.has(n.id) && n.contract === scheme)
    notifications.forEach(n => knownIdsRef.current.add(n.id))
    if (!fresh.length) return
    timersRef.current.forEach(clearTimeout)
    setLeaving(false)
    setShown(fresh[0])
    timersRef.current = [
      setTimeout(() => setLeaving(true), SHOW_MS),
      setTimeout(() => setShown(null), SHOW_MS + 300),
    ]
  }, [notifications, scheme])

  useEffect(() => () => timersRef.current.forEach(clearTimeout), [])

  function open() {
    const n = shown
    timersRef.current.forEach(clearTimeout)
    setShown(null)
    markNotificationRead(n.id)
    if (onOpen) onOpen(n)
    else window.location.href = '../holidays/?screen=holidays&transition=1'
  }

  const type = shown && TYPES[shown.type]
  return (
    <>
      <span ref={anchorRef} hidden />
      {shown && type && frame && createPortal(
        <button type="button" className={`push-banner${leaving ? ' push-banner--leaving' : ''}`} onClick={open}>
          <span className={`push-banner-icon push-banner-icon--${type.tone}`}><CalendarIcon /></span>
          <span className="push-banner-body">
            <span className="push-banner-title">{type.label}</span>
            <span className="push-banner-detail">
              {shown.dateRange} · {shown.amount}
              {shown.reason ? ` — ${shown.reason}` : ''}
            </span>
          </span>
          <span className="push-banner-time">now</span>
        </button>,
        frame,
      )}
    </>
  )
}
