import { useRef, useState } from 'react'
import StatusBar from '../../../Components/StatusBar'
import AccountScreen from '../../../Components/AccountScreen'
import SegmentedToggle from '../../../Components/SegmentedToggle'
import { LegalFlags, HighRiskBadge } from '../../../Components/LegalFlags'
import { THREADS, UNREAD_MESSAGES_COUNT } from '../../../Components/messagesData'
import DevToolbar from '../../../Components/DevToolbar'
import DevMode from '../../../Components/DevMode'
import DevComments from '../../../Components/DevComments'
import DevEdit from '../../../Components/DevEdit'
import WireframeToggle from '../../../Components/WireframeToggle'
import AuditCapture from '../../../Components/AuditCapture'
import { ClockIcon, KeyIcon, TaskStateIcon } from '../../tag-in-out/src/icons'
import { BOOKINGS } from '../../tag-in-out/src/data'
import {
  BookingsIcon, CustomersIcon, EmployeesIcon, MessagesIcon, BellIcon,
  FiltersIcon, PersonAddIcon, SearchIcon, AddCircleIcon, BroadcastIcon,
  PersonIcon, ChevronLeftIcon,
} from './icons'

// Proposal: Messages moves out of Account into its own footer tab, and
// Notifications moves out of the footer into a bell in the header. Native
// tab bars allow 5 tabs; Employees is Care Manager and above only, so
// carers see 4. Kept separate from the other mobile prototypes until
// Product agree the approach.

const NOTIFICATION_COUNT = 3

const ROLE_OPTIONS = [
  { value: 'carer', label: 'Careworker' },
  { value: 'manager', label: 'Care Manager' },
]

const DEVICE_OPTIONS = [
  { value: 'standard', label: 'iPhone 16' },
  { value: 'se', label: 'iPhone SE' },
]

const DAYS = [
  { label: 'S', date: 6 },
  { label: 'M', date: 7 },
  { label: 'T', date: 8, today: true },
  { label: 'W', date: 9 },
  { label: 'T', date: 10 },
  { label: 'F', date: 11 },
  { label: 'S', date: 12 },
]

function readParam(name, allowed, fallback) {
  const v = new URLSearchParams(window.location.search).get(name)
  return allowed.includes(v) ? v : fallback
}

function writeParam(name, value) {
  const params = new URLSearchParams(window.location.search)
  params.set(name, value)
  window.history.replaceState(null, '', `${window.location.pathname}?${params}`)
}

// ─── Header ─────────────────────────────────────────────────────
// The bell is always the last (right-most) action, so it stays pinned to
// the same spot on every tab however many other actions sit beside it.
function HeaderAction({ label, children }) {
  return (
    <button type="button" className="app-header-action" aria-label={label}>{children}</button>
  )
}

function TabHeader({ title, left, actions }) {
  return (
    <div className="app-header mt-header">
      <div className="mt-header-side">{left}</div>
      <span className="app-header-title">{title}</span>
      <div className="mt-header-side mt-header-side--right">
        {actions}
        <button type="button" className="app-header-action mt-bell" aria-label={`Notifications, ${NOTIFICATION_COUNT} new`}>
          <BellIcon />
          {NOTIFICATION_COUNT > 0 && <span className="nav-badge">{NOTIFICATION_COUNT}</span>}
        </button>
      </div>
    </div>
  )
}

// ─── Footer tabs ────────────────────────────────────────────────
// Bottom-nav tab switches are instant, never slide.
function TabBar({ tabs, activeTab, onSelect }) {
  return (
    <div className="app-nav mt-nav">
      {tabs.map(t => (
        <button
          key={t.id}
          type="button"
          className={`nav-item${activeTab === t.id ? ' active' : ''}`}
          onClick={() => onSelect(t.id)}
        >
          <div className="nav-messages-wrap">
            {t.icon}
            {t.badge > 0 && <span className="nav-badge">{t.badge}</span>}
          </div>
          {t.label && <span className="nav-label">{t.label}</span>}
        </button>
      ))}
    </div>
  )
}

// ─── Bookings ───────────────────────────────────────────────────
// Card markup copied from mobile/tag-in-out's BookingsScreen (styles come
// from its tag-in-out.css). No search in the header — the live app has none.
function initials(name) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2)
}

function BookingCard({ booking }) {
  const hasFlags = booking.highRisk || booking.legalFlags.length > 0
  return (
    <div className={`booking-card booking-card--${booking.status}`}>
      <span className="booking-card-status" aria-hidden="true"><TaskStateIcon status={booking.status} /></span>
      <div className="booking-card-avatar" aria-hidden="true">{initials(booking.customerName)}</div>
      <div className="booking-card-time"><ClockIcon size={16} />{booking.time}</div>
      <div className="booking-card-title"><strong>{booking.visitType}</strong> with <strong>{booking.customerName}</strong></div>
      <div className="booking-card-address-row">
        <span className="booking-card-address">{booking.address}</span>
        <span className="booking-card-key-icon"><KeyIcon size={18} /></span>
      </div>
      {hasFlags && <hr className="booking-card-divider" />}
      {hasFlags && (
        <div className="booking-card-flags">
          {booking.highRisk && <HighRiskBadge />}
          <LegalFlags flags={booking.legalFlags} />
        </div>
      )}
    </div>
  )
}

function BookingsTab() {
  return (
    <>
      <StatusBar />
      <TabHeader title="Bookings" />
      <div className="day-strip">
        {DAYS.map(d => (
          <div key={d.date} className="day-strip-item">
            <span className="day-strip-label">{d.label}</span>
            <span className={`day-strip-date${d.today ? ' day-strip-date--active' : ''}`}>{d.date}</span>
          </div>
        ))}
      </div>
      <div className="booking-list">
        {BOOKINGS.map(b => <BookingCard key={b.key} booking={b} />)}
      </div>
    </>
  )
}

// ─── Customers / Employees — left blank, header only ────────────
function CustomersTab() {
  return (
    <>
      <StatusBar />
      <TabHeader
        title="Customers"
        left={<HeaderAction label="Filter customers"><FiltersIcon /></HeaderAction>}
        actions={(
          <>
            <HeaderAction label="Add customer"><PersonAddIcon /></HeaderAction>
            <HeaderAction label="Search customers"><SearchIcon /></HeaderAction>
          </>
        )}
      />
      <div className="mt-blank" />
    </>
  )
}

function EmployeesTab() {
  return (
    <>
      <StatusBar />
      <TabHeader
        title="Employees"
        left={<HeaderAction label="Filter employees"><FiltersIcon /></HeaderAction>}
        actions={<HeaderAction label="Search employees"><SearchIcon /></HeaderAction>}
      />
      <div className="mt-blank" />
    </>
  )
}

// ─── Messages ───────────────────────────────────────────────────
// Same inbox content as mobile/messaging (shared Components/messagesData),
// now a top-level tab: no back arrow to Account.
function MessagesTab() {
  const [search, setSearch] = useState('')
  const q = search.trim().toLowerCase()
  const threads = THREADS.filter(t => !t.archivedByCarer).filter(t =>
    !q || t.title.toLowerCase().includes(q) || t.lastMessage.toLowerCase().includes(q)
  )
  return (
    <>
      <StatusBar />
      <TabHeader
        title="Messages"
        actions={<HeaderAction label="New message"><AddCircleIcon size={28} /></HeaderAction>}
      />
      <div className="mt-inbox-search">
        <div className="search-bar">
          <SearchIcon size={18} />
          <input type="text" placeholder="Search messages..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="mt-thread-list">
        {threads.map(t => (
          <div key={t.id} className="mt-thread-row">
            <div className={`mt-thread-avatar${t.isBroadcast ? ' broadcast' : ''}`}>
              {t.isBroadcast ? <BroadcastIcon /> : <PersonIcon />}
            </div>
            <div className="mt-thread-body">
              <div className="mt-thread-top">
                <span className={`mt-thread-name${t.unread ? ' unread' : ''}`}>{t.title}</span>
                <span className={`mt-thread-time${t.unread ? ' unread' : ''}`}>{t.time}</span>
              </div>
              <div className="mt-thread-preview-row">
                <span className={`mt-thread-preview${t.unread ? ' unread' : ''}`}>
                  {t.sentByMe && 'You: '}{t.lastMessage}
                </span>
                {t.unread && <span className="mt-unread-dot" aria-label="Unread" />}
              </div>
            </div>
          </div>
        ))}
        {threads.length === 0 && <div className="mt-empty">No messages found</div>}
      </div>
    </>
  )
}

// ─── Account — Messages row removed (now its own tab) ───────────
function AccountTab() {
  return <AccountScreen hideNav showMessagesRow={false} headerRight={<TabHeaderBellOnly />} />
}

// AccountScreen renders the shared AppHeader, so only the right-hand slot
// is ours: same bell, same position.
function TabHeaderBellOnly() {
  return (
    <div className="mt-header-side mt-header-side--right">
      <button type="button" className="app-header-action mt-bell" aria-label={`Notifications, ${NOTIFICATION_COUNT} new`}>
        <BellIcon />
        {NOTIFICATION_COUNT > 0 && <span className="nav-badge">{NOTIFICATION_COUNT}</span>}
      </button>
    </div>
  )
}

export default function App() {
  const pageRef = useRef(null)
  const [role, setRoleState] = useState(() => readParam('role', ['carer', 'manager'], 'manager'))
  const [device, setDeviceState] = useState(() => readParam('device', ['standard', 'se'], 'standard'))
  const [activeTab, setActiveTab] = useState('bookings')

  const setRole = r => {
    setRoleState(r)
    writeParam('role', r)
    if (r === 'carer' && activeTab === 'employees') setActiveTab('bookings')
  }
  const setDevice = d => { setDeviceState(d); writeParam('device', d) }

  const tabs = [
    { id: 'bookings', label: 'Bookings', icon: <BookingsIcon /> },
    { id: 'customers', label: 'Customers', icon: <CustomersIcon /> },
    role === 'manager' && { id: 'employees', label: 'Employees', icon: <EmployeesIcon /> },
    { id: 'messages', label: 'Messages', icon: <MessagesIcon />, badge: UNREAD_MESSAGES_COUNT },
    { id: 'account', icon: <div className="nav-avatar">AJ</div> },
  ].filter(Boolean)

  return (
    <>
      <DevToolbar floating>
        <DevEdit containerRef={pageRef} prototypeId={window.location.pathname} />
        <DevMode containerRef={pageRef} />
        <DevComments containerRef={pageRef} prototypeId={window.location.pathname} />
        <WireframeToggle />
        <AuditCapture containerRef={pageRef} />
      </DevToolbar>
      <div className="phone-wrap">
        <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>
        <div className="mt-stack">
          <div className="mt-demo-controls">
            <span className="mt-demo-label">Role</span>
            <SegmentedToggle options={ROLE_OPTIONS} value={role} onChange={setRole} />
            <span className="mt-demo-label">Screen size</span>
            <SegmentedToggle options={DEVICE_OPTIONS} value={device} onChange={setDevice} />
          </div>
          <div className={`phone-frame${device === 'se' ? ' mt-phone-se' : ''}`} ref={pageRef}>
            <div className="screen-area">
              <div className="screen">
                {activeTab === 'bookings' && <BookingsTab />}
                {activeTab === 'customers' && <CustomersTab />}
                {activeTab === 'employees' && <EmployeesTab />}
                {activeTab === 'messages' && <MessagesTab />}
                {activeTab === 'account' && <AccountTab />}
              </div>
            </div>
            <TabBar tabs={tabs} activeTab={activeTab} onSelect={setActiveTab} />
          </div>
        </div>
      </div>
    </>
  )
}
