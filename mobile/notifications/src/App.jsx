import { useState } from 'react'
import StatusBar from '../../../Components/StatusBar'
import AppNav from '../../../Components/AppNav'

import maryImg     from '../../../Images/Customer=Mary McCarthy.png'
import anthonyImg  from '../../../Images/Customer=Anthony Brown.png'
import hilaryImg   from '../../../Images/Customer=Hilary Buxton.png'
import lilyImg     from '../../../Images/Customer=Lily.png'
import sanjeezImg  from '../../../Images/Customer=Sanjeez Chaundry.png'
import harryImg    from '../../../Images/Customer=Harinder Kulkarni.png'
import samImg      from '../../../Images/Customer=Sam Malone.png'

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

const ExternalLinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
  </svg>
)

// ─── Data ─────────────────────────────────────────────────────

const NOTIFICATIONS = [
  {
    id: 1, type: 'time_changed', read: false, receivedAt: '1 hour ago', section: 'Today',
    customer: 'Mary McCarthy', initials: 'MM', photo: maryImg,
    bookingDate: 'Tue 24 Jun', bookingTime: '9:00am',
    originalTime: '9:00am', newTime: '10:30am',
    duration: '1 hour', address: '14 Meadow Lane, Sheffield, S6 4RN',
  },
  {
    id: 2, type: 'cancelled', read: false, receivedAt: '2 hours ago', section: 'Today',
    customer: 'Anthony Brown', initials: 'AB', photo: anthonyImg,
    bookingDate: 'Wed 25 Jun', bookingTime: '2:00pm',
    originalTime: '2:00pm',
    duration: '45 minutes', address: '7 Park Road, Sheffield, S10 2TH',
  },
  {
    id: 3, type: 'shadow_added', read: false, receivedAt: '3 hours ago', section: 'Today',
    customer: 'Hilary Buxton', initials: 'HB', photo: hilaryImg,
    bookingDate: 'Thu 26 Jun', bookingTime: '10:00am',
    shadowName: 'James Okafor', shadowInitials: 'JO',
    duration: '1 hr 30 min', address: '32 Oak Avenue, Sheffield, S11 8LG',
  },
  {
    id: 4, type: 'duration_changed', read: true, receivedAt: 'Yesterday', section: 'Yesterday',
    customer: 'Harinder Kulkarni', initials: 'HK', photo: harryImg,
    bookingDate: 'Mon 23 Jun', bookingTime: '11:00am',
    originalDuration: '1 hour', newDuration: '45 minutes',
    duration: '45 minutes', address: '89 Birch Street, Sheffield, S2 4PQ',
  },
  {
    id: 5, type: 'date_changed', read: true, receivedAt: 'Yesterday', section: 'Yesterday',
    customer: 'Lily', initials: 'LY', photo: lilyImg,
    originalDate: 'Fri 27 Jun', newDate: 'Sat 28 Jun', bookingTime: '8:00am',
    bookingDate: 'Sat 28 Jun',
    duration: '1 hour', address: '5 Elm Close, Sheffield, S7 1NP',
  },
  {
    id: 6, type: 'shadow_removed', read: true, receivedAt: 'Yesterday', section: 'Yesterday',
    customer: 'Sanjeez Chaundry', initials: 'SC', photo: sanjeezImg,
    bookingDate: 'Fri 27 Jun', bookingTime: '9:30am',
    shadowName: 'Sarah Mitchell', shadowInitials: 'SM',
    duration: '1 hour', address: '41 Manor Drive, Sheffield, S8 0YT',
  },
  {
    id: 7, type: 'new', read: true, receivedAt: '3 days ago', section: 'Earlier',
    customer: 'Sam Malone', initials: 'SM', photo: samImg,
    bookingDate: 'Wed 18 Jun', bookingTime: '3:30pm',
    newTime: '3:30pm',
    duration: '1 hour', address: '22 Castle Road, Sheffield, S1 2GH',
  },
]

const TYPE_CONFIG = {
  time_changed:     { label: 'Booking time changed',       iconBg: '#fef3dc', iconColor: '#e09000', Icon: ClockIcon },
  duration_changed: { label: 'Duration changed',           iconBg: '#fef3dc', iconColor: '#e09000', Icon: ClockIcon },
  date_changed:     { label: 'Date changed',               iconBg: '#e8f0fe', iconColor: '#1a73e8', Icon: CalendarIcon },
  cancelled:        { label: 'Booking cancelled',          iconBg: '#fdeaea', iconColor: '#c0392b', Icon: CancelIcon },
  new:              { label: 'New booking',                iconBg: '#e6f4ec', iconColor: '#27ae60', Icon: AddCircleIcon },
  shadow_added:     { label: 'Shadow careworker added',    iconBg: '#ede7f6', iconColor: '#7b1fa2', Icon: PersonAddIcon },
  shadow_removed:   { label: 'Shadow careworker removed',  iconBg: '#f0f0f0', iconColor: '#555',    Icon: PersonRemoveIcon },
}

const renderDetail = (notif) => {
  switch (notif.type) {
    case 'time_changed':
      return <><s>{notif.originalTime}</s>{` ${notif.newTime} · ${notif.bookingDate}`}</>
    case 'duration_changed':
      return <><s>{notif.originalDuration}</s>{` ${notif.newDuration} · ${notif.bookingDate}, ${notif.bookingTime}`}</>
    case 'date_changed':
      return <><s>{notif.originalDate}</s>{` ${notif.newDate} · ${notif.bookingTime}`}</>
    case 'cancelled':
      return <s>{`${notif.originalTime} · ${notif.bookingDate}`}</s>
    case 'new':
      return `${notif.newTime} · ${notif.bookingDate}`
    case 'shadow_added':
      return `${notif.shadowName} added · ${notif.bookingDate}, ${notif.bookingTime}`
    case 'shadow_removed':
      return <><s>{notif.shadowName}</s>{` removed · ${notif.bookingDate}, ${notif.bookingTime}`}</>
    default:
      return ''
  }
}

// ─── Notification Row ──────────────────────────────────────────

function NotifRow({ notif }) {
  const config = TYPE_CONFIG[notif.type]
  const { Icon } = config

  return (
    <div className={`notif-row${notif.read ? '' : ' unread'}`}>
      <div className="notif-avatar-wrap">
        {notif.photo
          ? <img src={notif.photo} className="notif-avatar" alt={notif.customer} />
          : <div className="notif-avatar notif-avatar-initials" style={{ background: notif.avatarColor }}>{notif.initials}</div>
        }
        <div className="notif-type-badge" style={{ background: config.iconBg, color: config.iconColor }}>
          <Icon size={13} />
        </div>
      </div>

      <div className="notif-body">
        <div className={`notif-title${notif.read ? '' : ' bold'}`}>{config.label}</div>
        <div className="notif-customer">{notif.customer}</div>
        <div className="notif-detail">{renderDetail(notif)}</div>
      </div>

      <div className="notif-right">
        {!notif.read && <div className="notif-unread-dot" />}
        <span className="notif-time">{notif.receivedAt}</span>
      </div>
    </div>
  )
}

// ─── Filters ──────────────────────────────────────────────────

const FILTERS = [
  { id: 'all',       label: 'All',         types: null },
  { id: 'changes',   label: 'Changes',     types: ['time_changed', 'duration_changed', 'date_changed'] },
  { id: 'new',       label: 'New',         types: ['new'] },
  { id: 'cancelled', label: 'Cancelled',   types: ['cancelled'] },
  { id: 'carer',     label: 'Careworker',  types: ['shadow_added', 'shadow_removed'] },
]

// ─── Notification Centre Screen ────────────────────────────────

function NotifCentreScreen({ notifications, onViewBooking, unreadCount, onMarkAllRead }) {
  const [activeFilter, setActiveFilter] = useState('all')

  const filter = FILTERS.find(f => f.id === activeFilter)
  const filtered = filter.types
    ? notifications.filter(n => filter.types.includes(n.type))
    : notifications

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
      <div className="notif-filters">
        {FILTERS.map(f => (
          <button
            key={f.id}
            className={`notif-filter-pill${activeFilter === f.id ? ' active' : ''}`}
            onClick={() => setActiveFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="notif-list">
        {grouped.length > 0 ? grouped.map(group => (
          <div key={group.label}>
            <div className="notif-section-header">{group.label}</div>
            {group.items.map(n => (
              <div key={n.id} onClick={() => onViewBooking(n)} style={{ cursor: 'pointer' }}>
                <NotifRow notif={n} />
              </div>
            ))}
          </div>
        )) : (
          <div className="notif-empty-state">No notifications</div>
        )}
      </div>
    </div>
  )
}

// ─── Booking Detail Screen ─────────────────────────────────────

const STATUS_CONFIG = {
  time_changed:     { label: 'Time changed',              bg: '#fef3dc', color: '#b37a00' },
  duration_changed: { label: 'Duration changed',          bg: '#fef3dc', color: '#b37a00' },
  date_changed:     { label: 'Date changed',              bg: '#e8f0fe', color: '#1557b0' },
  cancelled:        { label: 'Cancelled',                 bg: '#fdeaea', color: '#c0392b' },
  new:              { label: 'New booking',               bg: '#e6f4ec', color: '#1e7e45' },
  shadow_added:     { label: 'Shadow careworker added',   bg: '#ede7f6', color: '#6a1b9a' },
  shadow_removed:   { label: 'Shadow careworker removed', bg: '#f0f0f0', color: '#555'    },
}

function DetailRow({ icon, label, value, strikethrough = false, iconColor = '#aaa' }) {
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

function BookingDetailScreen({ notif, onBack, unreadCount }) {
  const status = STATUS_CONFIG[notif.type]

  return (
    <div className="screen">
      <StatusBar />
      <div className="app-header">
        <button className="app-header-back" onClick={onBack}>
          <ArrowLeftIcon />
        </button>
        <span className="app-header-title">Booking update</span>
        <div style={{ width: 36 }} />
      </div>

      <div className="booking-detail-scroll">
        <div className="booking-detail-customer">
          {notif.photo
            ? <img src={notif.photo} className="booking-detail-avatar-img" alt={notif.customer} />
            : <div className="booking-detail-avatar" style={{ background: notif.avatarColor }}>{notif.initials}</div>
          }
          <div className="booking-detail-name">{notif.customer}</div>
          <div className="booking-detail-status-badge" style={{ background: status.bg, color: status.color }}>
            {status.label}
          </div>
        </div>

        <div className="booking-detail-divider" />

        <div className="booking-detail-section">
          {notif.type === 'time_changed' && <>
            <DetailRow icon={<ClockDetailIcon />} label="Original time" value={`${notif.originalTime} · ${notif.bookingDate}`} strikethrough iconColor="#bbb" />
            <DetailRow icon={<ClockDetailIcon />} label="Updated time"  value={`${notif.newTime} · ${notif.bookingDate}`} iconColor="#e09000" />
          </>}

          {notif.type === 'duration_changed' && <>
            <DetailRow icon={<ClockDetailIcon />} label="Original duration" value={`${notif.originalDuration} · ${notif.bookingDate}, ${notif.bookingTime}`} strikethrough iconColor="#bbb" />
            <DetailRow icon={<ClockDetailIcon />} label="Updated duration"  value={`${notif.newDuration} · ${notif.bookingDate}, ${notif.bookingTime}`} iconColor="#e09000" />
          </>}

          {notif.type === 'date_changed' && <>
            <DetailRow icon={<CalendarDetailIcon />} label="Original date" value={`${notif.originalDate} · ${notif.bookingTime}`} strikethrough iconColor="#bbb" />
            <DetailRow icon={<CalendarDetailIcon />} label="Updated date"  value={`${notif.newDate} · ${notif.bookingTime}`} iconColor="#1a73e8" />
          </>}

          {notif.type === 'cancelled' && (
            <DetailRow icon={<ClockDetailIcon />} label="Cancelled booking" value={`${notif.originalTime} · ${notif.bookingDate}`} strikethrough iconColor="#c0392b" />
          )}

          {notif.type === 'new' && (
            <DetailRow icon={<ClockDetailIcon />} label="Booking time" value={`${notif.newTime} · ${notif.bookingDate}`} iconColor="#27ae60" />
          )}

          {notif.type === 'shadow_added' && <>
            <DetailRow icon={<PersonDetailIcon />} label="Shadow careworker added" value={notif.shadowName} iconColor="#7b1fa2" />
            <DetailRow icon={<ClockDetailIcon />}  label="Booking time" value={`${notif.bookingTime} · ${notif.bookingDate}`} />
          </>}

          {notif.type === 'shadow_removed' && <>
            <DetailRow icon={<PersonDetailIcon />} label="Shadow careworker removed" value={notif.shadowName} strikethrough iconColor="#bbb" />
            <DetailRow icon={<ClockDetailIcon />}  label="Booking time" value={`${notif.bookingTime} · ${notif.bookingDate}`} />
          </>}

          <DetailRow icon={<ClockDetailIcon />} label="Duration" value={notif.duration} />
          <DetailRow icon={<MapPinIcon />}       label="Address"  value={notif.address} />
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

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const viewBooking = (notif) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))
    setSelectedNotif(notif)
    setView('detail')
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="phone-wrap">
      <a href="../../" className="back-link">
        <ChevronLeftIcon /> Prototypes
      </a>
      <div className="phone-frame">
        <div className="screen-area">
          <div className={`screen-slide ${view === 'list' ? 'slide-active' : 'slide-out-left'}`}>
            <NotifCentreScreen
              notifications={notifications}
              onViewBooking={viewBooking}
              unreadCount={unreadCount}
              onMarkAllRead={markAllRead}
            />
          </div>
          <div className={`screen-slide ${view === 'detail' ? 'slide-active' : 'slide-out-right'}`}>
            {selectedNotif && (
              <BookingDetailScreen
                notif={selectedNotif}
                onBack={() => setView('list')}
                unreadCount={unreadCount}
              />
            )}
          </div>
        </div>
        <AppNav
          activeTab="notifications"
          notifCount={unreadCount}
          totalUnread={4}
          links={{ messages: '../messaging/' }}
        />
      </div>
    </div>
  )
}
