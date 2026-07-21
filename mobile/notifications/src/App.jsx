import { useState, useEffect, useRef } from 'react'
import StatusBar from '../../../Components/StatusBar'
import AppNav from '../../../Components/AppNav'
import ScreenSlider from '../../../Components/ScreenSlider'
import { NOTIFICATIONS } from '../../../Components/notificationsData'
import { UNREAD_MESSAGES_COUNT, hasReadMessages } from '../../../Components/messagesData'

// ─── Icons ────────────────────────────────────────────────────

const ChevronLeftIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)

const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.71969 12.6255L4.73999 12.6499C4.74414 12.6548 4.74834 12.6596 4.75259 12.6644L9.75259 18.2894C10.1195 18.7022 10.7516 18.7393 11.1644 18.3724C11.5771 18.0055 11.6143 17.3734 11.2474 16.9606L7.727 13L18.5 13C19.0523 13 19.5 12.5523 19.5 12C19.5 11.4477 19.0523 11 18.5 11L7.727 11L11.2474 7.03937C11.5861 6.65834 11.5805 6.09046 11.2529 5.71676L11.1644 5.6276C10.7516 5.26068 10.1195 5.29786 9.75259 5.71065L4.75259 11.3356L4.7402 11.3498C4.73323 11.358 4.72639 11.3662 4.71969 11.3746L4.75259 11.3356C4.72265 11.3693 4.69538 11.4045 4.67076 11.441C4.65284 11.4675 4.63629 11.4947 4.62104 11.5227C4.60922 11.5452 4.59534 11.5722 4.5711 11.629C4.56169 11.6537 4.52179 11.7614 4.5 12C4.5 12.1218 4.52179 12.2386 4.56167 12.3465C4.5711 12.3998 4.59534 12.4278 4.62098 12.4771C4.63629 12.5053 4.65284 12.5325 4.67061 12.5589L4.71969 12.6255Z"/>
  </svg>
)

const ClockIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
  </svg>
)

const TimeGlassIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M13.6631555,12.8955987 C15.5379293,13.8324663 17.2297129,16.2385946 17.2301797,18.0105428 L17.2304404,19.0000631 L6.62991901,19.0000046 L6.63017963,18.0105427 C6.6306395,16.2646975 8.27776975,13.9005552 10.1456445,12.9199085 L10.1976839,12.8940314 L11.92646,12.0277319 Z M17.9301797,5.01284409 C17.9301797,5.01396235 17.9301772,5.01507448 17.9301459,5.01610948 L17.2304431,5.01610947 L17.2301797,6.01584603 C17.2297145,7.78174428 15.5446237,10.1644241 13.6624298,11.1069091 L11.930359,11.9742219 L10.1976839,11.1059686 L10.1288102,11.0714556 C8.27109448,10.0959403 6.63063794,7.75577763 6.63017963,6.01584606 L6.62991629,5.01610947 L5.93023116,5.01610948 C5.9301846,5.01503838 5.93017967,5.01394256 5.93017967,5.01284409 C5.93017967,5.00804653 5.92999677,5.00376296 5.9296185,5.00000001 L17.9300949,5.00000001 C17.9301591,5.00406577 17.9301797,5.00839948 17.9301797,5.01284409 Z"
      stroke="currentColor" strokeWidth="2" fillRule="nonzero" />
  </svg>
)

const CancelIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
  </svg>
)

const AddCircleIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
  </svg>
)

const CalendarIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
  </svg>
)

const PersonAddIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
)

const PersonRemoveIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 8c0-2.21-1.79-4-4-4S6 5.79 6 8s1.79 4 4 4 4-1.79 4-4zm-4 6c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm7-2h4v2h-4v-2z"/>
  </svg>
)

const RunIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.5316862,2.25 C19.9042089,2.25 21.8103775,4.17252165 21.8103775,6.56109363 C21.8103775,7.8496122 21.3837488,8.78195426 20.3219865,10.0738404 L20.1732443,10.2523025 L19.7081836,10.7935427 C19.1579376,11.4366344 18.7242877,11.9825709 18.3228589,12.5536133 L18.1736687,12.7691698 L18.0521069,12.9635835 C18.0043383,13.0406934 17.9396825,13.1058825 17.8632144,13.1546699 C17.5785244,13.3363048 17.2004933,13.2527621 17.0191918,12.9678594 L16.9463007,12.854717 L16.890097,12.77017 C16.5022598,12.200899 16.0833253,11.658275 15.5733798,11.0511815 L15.3490849,10.7867858 L14.8755401,10.2352557 L14.6389457,9.94903468 L14.4294845,9.68356497 C14.1341575,9.2985939 13.9203798,8.96793102 13.7430368,8.62080199 C13.4137771,7.97631297 13.25,7.31890047 13.25,6.56109363 C13.25,4.17297543 15.1583415,2.25 17.5316862,2.25 Z M17.5316862,3.47291108 C15.8362095,3.47291108 14.4729111,4.84590921 14.4729111,6.56109363 C14.4729111,7.11498404 14.585996,7.58279609 14.8320591,8.06443701 C14.9496979,8.29470185 15.0899372,8.51980245 15.2738098,8.77155709 L15.3895377,8.92606291 L15.5815192,9.16988989 L15.8033741,9.43861563 L16.27801,9.99141826 C16.7207576,10.5085118 17.0915491,10.9673927 17.427079,11.4177677 L17.5314117,11.5594769 L17.5879302,11.4818583 C17.8822707,11.0833493 18.204096,10.6790482 18.5850789,10.226845 L18.7806467,9.99655663 L19.238958,9.46323938 C20.2743722,8.2372622 20.5874665,7.54526007 20.5874665,6.56109363 C20.5874665,4.84511326 19.2259968,3.47291108 17.5316862,3.47291108 Z M17.5301888,5.61300546 C18.0342755,5.61300546 18.4473721,6.02610205 18.4473721,6.53018877 C18.4473721,7.0342755 18.0342755,7.44737208 17.5301888,7.44737208 C17.026102,7.44737208 16.6130055,7.0342755 16.6130055,6.53018877 C16.6130055,6.02610205 17.026102,5.61300546 17.5301888,5.61300546 Z"
      stroke="currentColor" strokeWidth="0.5" fillRule="nonzero" />
    <path d="M17.2801888,14.25 C17.6944023,14.25 18.0301888,14.5857864 18.0301888,15 C18.0301888,15.3796958 17.7480349,15.693491 17.3819593,15.7431534 L17.2801888,15.75 L9.72977518,15.75 C9.30206188,15.75 8.95533174,16.0967301 8.95533174,16.5244434 C8.95533174,16.916514 9.24668137,17.2405361 9.62468779,17.2918171 L9.72977518,17.2988869 L19.3963725,17.2988869 C20.7092665,17.2988869 21.7735774,18.3631977 21.7735774,19.6760918 C21.7735774,20.9342819 20.7961113,21.9641725 19.5591305,22.0478124 L19.3963725,22.0532967 L5.75,22.0532967 C5.33578644,22.0532967 5,21.7175102 5,21.3032967 C5,20.9236009 5.28215388,20.6098057 5.64822944,20.5601433 L5.75,20.5532967 L19.3963725,20.5532967 C19.8808394,20.5532967 20.2735774,20.1605586 20.2735774,19.6760918 C20.2735774,19.2288916 19.9389367,18.8598509 19.5064072,18.8057215 L19.3963725,18.7988869 L9.72977518,18.7988869 C8.47363475,18.7988869 7.45533174,17.7805839 7.45533174,16.5244434 C7.45533174,15.3206422 8.39054406,14.3352715 9.57405282,14.2552472 L9.72977518,14.25 L17.2801888,14.25 Z M3.1628418,20.5532967 C3.57705536,20.5532967 3.9128418,20.8890831 3.9128418,21.3032967 C3.9128418,21.6829924 3.63068792,21.9967876 3.26461235,22.04645 L3.1628418,22.0532967 L2.84210526,22.0532967 C2.4278917,22.0532967 2.09210526,21.7175102 2.09210526,21.3032967 C2.09210526,20.9236009 2.37425914,20.6098057 2.74033471,20.5601433 L2.84210526,20.5532967 L3.1628418,20.5532967 Z"
      fillRule="nonzero" />
  </svg>
)

const ClockDetailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
  </svg>
)

const CalendarDetailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
  </svg>
)

const PersonDetailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
)

const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
)

const AddCircleDetailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
  </svg>
)

const TimeGlassDetailIcon = () => <TimeGlassIcon size={16} />

const RunDetailIcon = () => <RunIcon size={16} />

const EventIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    <rect width="20" height="14" x="2" y="6" rx="2" />
  </svg>
)

const EventDetailIcon = () => <EventIcon size={16} />

const TrashIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
)
const TYPE_CONFIG = {
  time_changed:           { label: 'Booking time changed',       iconBg: '#fef3dc', iconColor: '#e09600', Icon: ClockIcon },
  duration_changed:       { label: 'Duration changed',           iconBg: '#fef3dc', iconColor: '#e09600', Icon: TimeGlassIcon },
  date_changed:           { label: 'Date changed',               iconBg: '#e8f0fe', iconColor: '#1a73e8', Icon: CalendarIcon },
  cancelled:              { label: 'Booking cancelled',          iconBg: '#fdeaea', iconColor: '#c0392b', Icon: CancelIcon },
  new:                    { label: 'New booking',                iconBg: '#e6f4ec', iconColor: '#27ae60', Icon: AddCircleIcon },
  shadow_added:           { label: 'Shadow careworker added',    iconBg: '#ede7f6', iconColor: '#8421b8', Icon: PersonAddIcon },
  shadow_removed:         { label: 'Shadow careworker removed',  iconBg: '#f0f0f0', iconColor: '#4d4d4d', Icon: PersonRemoveIcon },
  shift_visit_changed:    { label: 'Booking time changed',       iconBg: '#fef3dc', iconColor: '#e09600', Icon: ClockIcon },
  shift_duration_changed: { label: 'Shift duration changed',     iconBg: '#fef3dc', iconColor: '#e09600', Icon: TimeGlassIcon },
  shift_summary:          { label: 'Shift updated',              iconBg: '#f0ecf5', iconColor: '#6d1b98', Icon: RunIcon },
  shift_new:              { label: 'New shift',                  iconBg: '#e6f4ec', iconColor: '#27ae60', Icon: AddCircleIcon },
  event_date_changed:     { label: 'Event date changed',         iconBg: '#e8f0fe', iconColor: '#1a73e8', Icon: CalendarIcon },
  event_time_changed:     { label: 'Event time changed',         iconBg: '#fef3dc', iconColor: '#e09600', Icon: ClockIcon },
  event_duration_changed: { label: 'Event duration changed',     iconBg: '#fef3dc', iconColor: '#e09600', Icon: TimeGlassIcon },
}

const SHIFT_TYPES = ['shift_visit_changed', 'shift_duration_changed', 'shift_summary', 'shift_new']
const EVENT_TYPES = ['event_date_changed', 'event_time_changed', 'event_duration_changed']

const renderDetail = (notif) => {
  switch (notif.type) {
    case 'time_changed':
      return <><s>{notif.originalTime}</s>{` ${notif.newTime}, ${notif.bookingDate}`}</>
    case 'duration_changed':
      return <><s>{notif.originalDuration}</s>{` ${notif.newDuration}, ${notif.bookingDate}, ${notif.bookingTime}`}</>
    case 'date_changed':
      return <><s>{notif.originalDate}</s>{` ${notif.newDate}, ${notif.bookingTime}`}</>
    case 'cancelled':
      return <s>{`${notif.originalTime}, ${notif.bookingDate}`}</s>
    case 'new':
      return notif.bookingEndDate
        ? `${notif.newTime}, ${notif.bookingDate} – ${notif.bookingEndTime}, ${notif.bookingEndDate}`
        : `${notif.newTime}, ${notif.bookingDate}`
    case 'shadow_added':
      return `${notif.shadowName} added, ${notif.bookingTime}, ${notif.bookingDate}`
    case 'shadow_removed':
      return <><s>{notif.shadowName}</s>{` removed, ${notif.bookingTime}, ${notif.bookingDate}`}</>
    case 'shift_visit_changed':
      return notif.newVisitDate && notif.newVisitDate !== notif.shiftDate
        ? <><s>{`${notif.originalVisitTime}, ${notif.shiftDate}`}</s>{` ${notif.newVisitTime}, ${notif.newVisitDate}`}</>
        : <><s>{notif.originalVisitTime}</s>{` ${notif.newVisitTime}, ${notif.shiftDate}`}</>
    case 'shift_duration_changed':
      return <><s>{notif.originalShiftDuration}</s>{` ${notif.newShiftDuration}, ${notif.shiftStartTime}, ${notif.shiftDate}`}</>
    case 'shift_summary': {
      const durationChanged = notif.originalShiftDuration !== notif.newShiftDuration
      const total = notif.changes.length + (durationChanged ? 1 : 0)
      return `${total} changes, ${notif.shiftStartTime}, ${notif.shiftDate}`
    }
    case 'shift_new':
      return `${notif.bookings.length} bookings, ${notif.shiftStartTime}, ${notif.shiftDate}`
    case 'event_date_changed':
      return <><s>{notif.originalDate}</s>{` ${notif.newDate}, ${notif.eventTime}`}</>
    case 'event_time_changed':
      return <><s>{notif.originalTime}</s>{` ${notif.newTime}, ${notif.eventDate}`}</>
    case 'event_duration_changed':
      return <><s>{notif.originalDuration}</s>{` ${notif.newDuration}, ${notif.eventDate}, ${notif.eventTime}`}</>
    default:
      return ''
  }
}

// ─── Notification Row ──────────────────────────────────────────

function NotifRow({ notif }) {
  const config = TYPE_CONFIG[notif.type]
  const { Icon } = config
  const displayName = notif.type === 'shift_visit_changed' ? notif.customer : (notif.shiftName || notif.eventName || notif.customer)

  return (
    <div className={`notif-row${notif.read ? '' : ' unread'}`}>
      <div className="notif-avatar-wrap">
        {notif.photo
          ? <img src={notif.photo} className="notif-avatar" alt={notif.customer} />
          : <div
              className="notif-avatar notif-avatar-initials"
              style={{
                background: (notif.shiftInitials || notif.isEvent) ? '#dcd9e4' : notif.avatarColor,
                color:      (notif.shiftInitials || notif.isEvent) ? '#6d1b98' : '#fff',
              }}
            >
              {notif.shiftInitials ? <RunIcon size={22} /> : notif.isEvent ? <EventIcon size={22} /> : notif.initials}
            </div>
        }
        {notif.type !== 'shift_summary' && (
          <div className="notif-type-badge" style={{ background: config.iconBg, color: config.iconColor }}>
            <Icon size={13} />
          </div>
        )}
      </div>

      <div className="notif-body">
        <div className={`notif-title${notif.read ? '' : ' bold'}`}>{config.label}</div>
        <div className="notif-customer">{displayName}</div>
        <div className="notif-detail">{renderDetail(notif)}</div>
        {notif.type === 'shift_visit_changed' && (
          <div className="notif-shift-context">
            <RunIcon size={11} />
            {notif.shiftName}, {notif.shiftStartTime}, {notif.shiftDuration}
          </div>
        )}
      </div>

      <div className="notif-right">
        {!notif.read && <div className="notif-unread-dot" />}
        <span className="notif-time">{notif.receivedAt}</span>
      </div>
    </div>
  )
}

// ─── Swipe-to-delete wrapper ────────────────────────────────────
// Full swipe left past a distance threshold deletes the notification
// immediately (no reveal button to tap) — a short tap still opens the
// booking detail. touch-action: pan-y lets vertical list scrolling stay
// native while we own horizontal drags via pointer events.

const SWIPE_THRESHOLD_RATIO = 0.35
const SWIPE_SLIDE_MS = 200
const SWIPE_COLLAPSE_MS = 200

function SwipeableNotifRow({ notif, onOpen, onDelete }) {
  const wrapRef = useRef(null)
  const gestureRef = useRef({ startX: 0, startY: 0, width: 0, locked: null, pointerId: null })
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [collapsedHeight, setCollapsedHeight] = useState(null)
  const [collapsing, setCollapsing] = useState(false)

  const handlePointerDown = (e) => {
    if (collapsedHeight != null) return
    const g = gestureRef.current
    g.startX = e.clientX
    g.startY = e.clientY
    g.width = wrapRef.current.offsetWidth
    g.locked = null
    g.pointerId = e.pointerId
    wrapRef.current.setPointerCapture(e.pointerId)
    setDragging(true)
  }

  const handlePointerMove = (e) => {
    const g = gestureRef.current
    if (g.pointerId !== e.pointerId) return
    const dx = e.clientX - g.startX
    const dy = e.clientY - g.startY
    if (g.locked === null) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
      g.locked = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
    }
    if (g.locked !== 'x') return
    setDragX(Math.min(0, Math.max(-g.width, dx)))
  }

  const finishGesture = (e) => {
    const g = gestureRef.current
    if (g.pointerId !== e.pointerId) return
    setDragging(false)

    if (g.locked === 'x') {
      const threshold = g.width * SWIPE_THRESHOLD_RATIO
      if (Math.abs(dragX) >= threshold) {
        setDragX(-g.width)
        const height = wrapRef.current.offsetHeight
        setTimeout(() => {
          setCollapsedHeight(height)
          requestAnimationFrame(() => requestAnimationFrame(() => setCollapsing(true)))
          setTimeout(() => onDelete(notif.id), SWIPE_COLLAPSE_MS + 30)
        }, SWIPE_SLIDE_MS)
        g.locked = null
        g.pointerId = null
        return
      }
      setDragX(0)
    } else if (g.locked === null) {
      onOpen(notif)
    }
    g.locked = null
    g.pointerId = null
  }

  const armed = Math.abs(dragX) >= gestureRef.current.width * SWIPE_THRESHOLD_RATIO
  const bgOpacity = Math.min(1, Math.abs(dragX) / ((gestureRef.current.width || 1) * SWIPE_THRESHOLD_RATIO))

  return (
    <div
      className="notif-swipe-wrap"
      ref={wrapRef}
      style={collapsedHeight != null ? { height: collapsing ? 0 : collapsedHeight, opacity: collapsing ? 0 : 1 } : undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishGesture}
      onPointerCancel={finishGesture}
    >
      <div className="notif-swipe-bg" style={{ opacity: bgOpacity }}>
        <div className={`notif-swipe-bg-icon${armed ? ' armed' : ''}`}>
          <TrashIcon />
        </div>
      </div>
      <div
        className="notif-swipe-row"
        style={{ transform: `translateX(${dragX}px)`, transition: dragging ? 'none' : `transform ${SWIPE_SLIDE_MS}ms ease` }}
      >
        <NotifRow notif={notif} />
      </div>
    </div>
  )
}

// ─── Filters ──────────────────────────────────────────────────

// const FILTERS = [
//   { id: 'all',       label: 'All',         types: null },
//   { id: 'changes',   label: 'Changes',     types: ['time_changed', 'duration_changed', 'date_changed'] },
//   { id: 'shifts',    label: 'Shifts',      types: SHIFT_TYPES },
//   { id: 'new',       label: 'New',         types: ['new'] },
//   { id: 'cancelled', label: 'Cancelled',   types: ['cancelled'] },
//   { id: 'carer',     label: 'Careworker',  types: ['shadow_added', 'shadow_removed'] },
// ]

// ─── Notification Centre Screen ────────────────────────────────

function NotifCentreScreen({ notifications, onViewBooking, onDeleteNotification, unreadCount, onMarkAllRead }) {
  // const [activeFilter, setActiveFilter] = useState('all')
  // const filter = FILTERS.find(f => f.id === activeFilter)
  // const filtered = filter.types ? notifications.filter(n => filter.types.includes(n.type)) : notifications
  const filtered = notifications

  const sections = ['Today', 'Yesterday', 'Earlier']
  const grouped = sections
    .map(label => ({ label, items: filtered.filter(n => n.section === label) }))
    .filter(g => g.items.length > 0)

  return (
    <div className="screen">
      <StatusBar />
      <div className="app-header">
        <span className="app-header-title" style={{ textAlign: 'left' }}>Notifications</span>
        {unreadCount > 0 && (
          <button className="notif-header-action" onClick={onMarkAllRead}>Mark all as read</button>
        )}
      </div>
      {/* <div className="notif-filters">
        {FILTERS.map(f => (
          <button
            key={f.id}
            className={`notif-filter-pill${activeFilter === f.id ? ' active' : ''}`}
            onClick={() => setActiveFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div> */}
      <div className="notif-list">
        {grouped.length > 0 ? grouped.map(group => (
          <div key={group.label}>
            <div className="notif-section-header">{group.label}</div>
            {group.items.map(n => (
              <SwipeableNotifRow key={n.id} notif={n} onOpen={onViewBooking} onDelete={onDeleteNotification} />
            ))}
          </div>
        )) : (
          <div className="notif-empty-state">No notifications</div>
        )}
      </div>
    </div>
  )
}

// ─── Detail Screen ─────────────────────────────────────────────

const STATUS_CONFIG = {
  time_changed:           { label: 'Time changed',              bg: '#fef3dc', color: '#b37a00' },
  duration_changed:       { label: 'Duration changed',          bg: '#fef3dc', color: '#b37a00' },
  date_changed:           { label: 'Date changed',              bg: '#e8f0fe', color: '#1557b0' },
  cancelled:              { label: 'Cancelled',                 bg: '#fdeaea', color: '#c0392b' },
  new:                    { label: 'New booking',               bg: '#e6f4ec', color: '#1e7e45' },
  shadow_added:           { label: 'Shadow careworker added',   bg: '#ede7f6', color: '#6d1b98' },
  shadow_removed:         { label: 'Shadow careworker removed', bg: '#f0f0f0', color: '#4d4d4d' },
  shift_visit_changed:    { label: 'Booking time changed',      bg: '#fef3dc', color: '#b37a00' },
  shift_duration_changed: { label: 'Shift duration changed',    bg: '#fef3dc', color: '#b37a00' },
  shift_summary:          { label: 'Shift updated',             bg: '#f0ecf5', color: '#6d1b98' },
  shift_new:              { label: 'New shift',                 bg: '#e6f4ec', color: '#1e7e45' },
  event_date_changed:     { label: 'Event date changed',        bg: '#e8f0fe', color: '#1557b0' },
  event_time_changed:     { label: 'Event time changed',        bg: '#fef3dc', color: '#b37a00' },
  event_duration_changed: { label: 'Event duration changed',    bg: '#fef3dc', color: '#b37a00' },
}

function DetailRow({ icon, label, value, strikethrough = false, iconColor = '#726694' }) {
  return (
    <div className="booking-detail-row">
      <div className="booking-detail-icon-col" style={{ color: iconColor }}>{icon}</div>
      <div>
        <div className="booking-detail-label">{label}</div>
        <div className={`booking-detail-value${strikethrough ? ' strikethrough' : ''}`}>{value}</div>
      </div>
    </div>
  )
}

function DetailSectionLabel({ children }) {
  return <div className="booking-detail-section-label">{children}</div>
}

function BookingDetailScreen({ notif, onBack }) {
  const status = STATUS_CONFIG[notif.type]
  const isShift = notif.type === 'shift_duration_changed' || notif.type === 'shift_summary' || notif.type === 'shift_new'
  const isEvent = EVENT_TYPES.includes(notif.type)
  const displayName = notif.type === 'shift_visit_changed' ? notif.customer : (notif.shiftName || notif.eventName || notif.customer)
  const headerTitle = isShift ? 'Shift update' : isEvent ? 'Event update' : 'Booking update'

  return (
    <div className="screen">
      <StatusBar />
      <div className="app-header">
        <button className="app-header-back" onClick={onBack}>
          <ArrowLeftIcon />
        </button>
        <span className="app-header-title">{headerTitle}</span>
        <div style={{ width: 36 }} />
      </div>

      <div className="booking-detail-scroll">
        <div className="booking-detail-customer">
          {notif.photo
            ? <img src={notif.photo} className="booking-detail-avatar-img" alt={notif.customer} />
            : <div
                className="booking-detail-avatar"
                style={{
                  background: (notif.shiftInitials || notif.isEvent) ? '#dcd9e4' : notif.avatarColor,
                  color:      (notif.shiftInitials || notif.isEvent) ? '#6d1b98' : '#fff',
                }}
              >
                {notif.shiftInitials ? <RunIcon size={32} /> : notif.isEvent ? <EventIcon size={32} /> : notif.initials}
              </div>
          }
          <div className="booking-detail-name">{displayName}</div>
          <div className="booking-detail-status-badge" style={{ background: status.bg, color: status.color }}>
            {status.label}
          </div>
        </div>

        <div className="booking-detail-divider" />

        <div className="booking-detail-section">

          {/* ── Booking types ── */}
          {notif.type === 'time_changed' && <>
            <DetailRow icon={<ClockDetailIcon />} label="Original time" value={`${notif.originalTime}, ${notif.bookingDate}`} strikethrough iconColor="#bbb" />
            <DetailRow icon={<ClockDetailIcon />} label="Updated time"  value={`${notif.newTime}, ${notif.bookingDate}`} iconColor="#e09600" />
          </>}

          {notif.type === 'duration_changed' && <>
            <DetailRow icon={<ClockDetailIcon />} label="Booking time"        value={`${notif.bookingTime}, ${notif.bookingDate}`} />
            <DetailRow icon={<TimeGlassDetailIcon />} label="Original duration" value={notif.originalDuration} strikethrough iconColor="#bbb" />
            <DetailRow icon={<TimeGlassDetailIcon />} label="Updated duration"  value={notif.newDuration} iconColor="#e09600" />
          </>}

          {notif.type === 'date_changed' && <>
            <DetailRow icon={<CalendarDetailIcon />} label="Original date" value={`${notif.originalDate}, ${notif.bookingTime}`} strikethrough iconColor="#bbb" />
            <DetailRow icon={<CalendarDetailIcon />} label="Updated date"  value={`${notif.newDate}, ${notif.bookingTime}`} iconColor="#1a73e8" />
          </>}

          {notif.type === 'cancelled' && (
            <DetailRow icon={<ClockDetailIcon />} label="Cancelled booking" value={`${notif.originalTime}, ${notif.bookingDate}`} strikethrough iconColor="#c0392b" />
          )}

          {notif.type === 'new' && (notif.bookingEndDate ? <>
            <DetailRow icon={<ClockDetailIcon />} label="Start time" value={`${notif.newTime}, ${notif.bookingDate}`}       iconColor="#27ae60" />
            <DetailRow icon={<ClockDetailIcon />} label="End time"   value={`${notif.bookingEndTime}, ${notif.bookingEndDate}`} iconColor="#27ae60" />
          </> :
            <DetailRow icon={<ClockDetailIcon />} label="Booking time" value={`${notif.newTime}, ${notif.bookingDate}`} iconColor="#27ae60" />
          )}

          {notif.type === 'shadow_added' && <>
            <DetailRow icon={<PersonDetailIcon />} label="Shadow careworker added" value={notif.shadowName} iconColor="#8421b8" />
            <DetailRow icon={<ClockDetailIcon />}  label="Booking time" value={`${notif.bookingTime}, ${notif.bookingDate}`} />
          </>}

          {notif.type === 'shadow_removed' && <>
            <DetailRow icon={<PersonDetailIcon />} label="Shadow careworker removed" value={notif.shadowName} strikethrough iconColor="#bbb" />
            <DetailRow icon={<ClockDetailIcon />}  label="Booking time" value={`${notif.bookingTime}, ${notif.bookingDate}`} />
          </>}

          {/* ── Shift: single visit changed ── */}
          {notif.type === 'shift_visit_changed' && <>
            <DetailRow icon={<ClockDetailIcon />}  label="Original time" value={`${notif.originalVisitTime}, ${notif.shiftDate}`} strikethrough iconColor="#bbb" />
            <DetailRow icon={<ClockDetailIcon />}  label="Updated time"  value={`${notif.newVisitTime}, ${notif.newVisitDate || notif.shiftDate}`} iconColor="#e09600" />
            <DetailRow icon={<RunDetailIcon />}    label="Shift"               value={notif.shiftName} iconColor="#726694" />
            <DetailRow icon={<ClockDetailIcon />}  label="Shift time"    value={`${notif.shiftStartTime}, ${notif.shiftDate}`} />
            <DetailRow icon={<TimeGlassDetailIcon />}  label="Shift duration"      value={notif.shiftDuration} />
          </>}

          {/* ── Shift: duration only ── */}
          {notif.type === 'shift_duration_changed' && <>
            <DetailRow icon={<TimeGlassDetailIcon />}  label="Original duration" value={notif.originalShiftDuration} strikethrough iconColor="#bbb" />
            <DetailRow icon={<TimeGlassDetailIcon />}  label="Updated duration"  value={notif.newShiftDuration} iconColor="#e09600" />
            <DetailRow icon={<ClockDetailIcon />}  label="Time"        value={`${notif.shiftStartTime}, ${notif.shiftDate}`} />
            <DetailRow icon={<RunDetailIcon />}    label="Bookings"         value={notif.visitCount} iconColor="#726694" />
          </>}

          {/* ── Shift: summary (multiple changes) ── */}
          {notif.type === 'shift_summary' && <>
            <DetailSectionLabel>Booking changes ({notif.changes.length})</DetailSectionLabel>
            {notif.changes.map((c, i) => {
              if (c.changeType === 'time_changed') return (
                <DetailRow key={i} icon={<ClockDetailIcon />}      label={`Time changed, ${c.customer}`}     value={<><s>{c.originalTime}</s>{` ${c.newTime}`}</>}                   iconColor="#e09600" />
              )
              if (c.changeType === 'visit_added') return (
                <DetailRow key={i} icon={<AddCircleDetailIcon />}  label={`Booking added, ${c.customer}`}      value={`${c.time}, ${c.duration}`}                                    iconColor="#27ae60" />
              )
              if (c.changeType === 'duration_changed') return (
                <DetailRow key={i} icon={<TimeGlassDetailIcon />}      label={`Duration changed, ${c.customer}`} value={<><s>{c.originalDuration}</s>{` ${c.newDuration}`}</>}           iconColor="#e09600" />
              )
              return null
            })}
            <DetailSectionLabel>Shift</DetailSectionLabel>
            <DetailRow icon={<TimeGlassDetailIcon />} label="Original duration" value={notif.originalShiftDuration} strikethrough iconColor="#bbb" />
            <DetailRow icon={<TimeGlassDetailIcon />} label="Updated duration"  value={notif.newShiftDuration} iconColor="#e09600" />
            <DetailRow icon={<ClockDetailIcon />} label="Shift time"        value={`${notif.shiftStartTime}, ${notif.shiftDate}`} />
          </>}

          {/* ── Shift: new shift (all bookings added) ── */}
          {notif.type === 'shift_new' && <>
            <DetailSectionLabel>Bookings ({notif.bookings.length})</DetailSectionLabel>
            {notif.bookings.map((b, i) => (
              <DetailRow key={i} icon={<AddCircleDetailIcon />} label={`Booking added, ${b.customer}`} value={`${b.time}, ${b.duration}`} iconColor="#27ae60" />
            ))}
            <DetailSectionLabel>Shift</DetailSectionLabel>
            <DetailRow icon={<ClockDetailIcon />} label="Shift time"     value={`${notif.shiftStartTime}, ${notif.shiftDate}`} />
            <DetailRow icon={<TimeGlassDetailIcon />} label="Shift duration" value={notif.shiftDuration} />
          </>}

          {/* ── Non-contact event types ── */}
          {notif.type === 'event_date_changed' && <>
            <DetailRow icon={<CalendarDetailIcon />} label="Original date" value={`${notif.originalDate}, ${notif.eventTime}`} strikethrough iconColor="#bbb" />
            <DetailRow icon={<CalendarDetailIcon />} label="Updated date"  value={`${notif.newDate}, ${notif.eventTime}`} iconColor="#1a73e8" />
          </>}

          {notif.type === 'event_time_changed' && <>
            <DetailRow icon={<ClockDetailIcon />} label="Original time" value={`${notif.originalTime}, ${notif.eventDate}`} strikethrough iconColor="#bbb" />
            <DetailRow icon={<ClockDetailIcon />} label="Updated time"  value={`${notif.newTime}, ${notif.eventDate}`} iconColor="#e09600" />
          </>}

          {notif.type === 'event_duration_changed' && <>
            <DetailRow icon={<ClockDetailIcon />} label="Event time" value={`${notif.eventTime}, ${notif.eventDate}`} />
            <DetailRow icon={<TimeGlassDetailIcon />} label="Original duration" value={notif.originalDuration} strikethrough iconColor="#bbb" />
            <DetailRow icon={<TimeGlassDetailIcon />} label="Updated duration"  value={notif.newDuration} iconColor="#e09600" />
          </>}

          {notif.duration && notif.type !== 'duration_changed' && notif.type !== 'event_duration_changed' && <DetailRow icon={<TimeGlassDetailIcon />} label="Duration" value={notif.duration} />}
          {notif.address  && <DetailRow icon={<MapPinIcon />}       label="Address"  value={notif.address} />}
        </div>

      </div>
    </div>
  )
}

// ─── Root ──────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState('list')
  const [selectedNotif, setSelectedNotif] = useState(null)
  const [notifications, setNotifications] = useState(NOTIFICATIONS)
  const [badgeCount, setBadgeCount] = useState(() => NOTIFICATIONS.filter(n => !n.read).length)
  const [messagesUnread] = useState(() => hasReadMessages() ? 0 : UNREAD_MESSAGES_COUNT)

  useEffect(() => {
    setBadgeCount(0)
  }, [])

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const viewBooking = (notif) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))
    setSelectedNotif(notif)
    setView('detail')
  }

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="phone-wrap">
      <a href="../../" className="back-link">
        <ChevronLeftIcon /> Prototypes
      </a>
      <div className="phone-frame">
        <div className="screen-area">
          <ScreenSlider
            secondaryActive={view === 'detail'}
            primary={
              <NotifCentreScreen
                notifications={notifications}
                onViewBooking={viewBooking}
                onDeleteNotification={deleteNotification}
                unreadCount={unreadCount}
                onMarkAllRead={markAllRead}
              />
            }
            secondary={
              selectedNotif && (
                <BookingDetailScreen
                  notif={selectedNotif}
                  onBack={() => setView('list')}
                />
              )
            }
          />
        </div>
        <AppNav
          activeTab="notifications"
          notifCount={badgeCount}
          messagesUnread={messagesUnread}
          links={{ account: '../account/' }}
        />
      </div>
    </div>
  )
}
