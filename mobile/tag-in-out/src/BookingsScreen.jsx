import StatusBar from '../../../Components/StatusBar'
import AppHeader from '../../../Components/AppHeader'
import AppNav from '../../../Components/AppNav'
import { LegalFlags, HighRiskBadge } from '../../../Components/LegalFlags'
import { ClockIcon, KeyIcon, TaskStateIcon } from './icons'
import { BOOKINGS } from './data'

// Static day strip, matching the real Figma reference (node 591:7056,
// "Date selection") — a full Sun-Sat week, single-letter day initials
// (not "Mon"/"Tue"), "today" highlighted with just a purple-5 circle
// around the number, not the whole column. Not wired to any real
// calendar/date logic; this prototype only ever shows the one day's
// worth of bookings. The Figma frame's own sample text mislabels Friday
// as "S" (should be "F") — corrected here rather than reproduced, since
// Ben's own ask was for the *real* day initials, not a byte-for-byte copy
// of that frame's placeholder content.
const DAYS = [
  { label: 'S', date: 6 },
  { label: 'M', date: 7 },
  { label: 'T', date: 8, today: true },
  { label: 'W', date: 9 },
  { label: 'T', date: 10 },
  { label: 'F', date: 11 },
  { label: 'S', date: 12 },
]

function initials(name) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2)
}

// Structure matches the real Figma reference (node 591:11011, "Booking
// cards") — a top-right avatar (not a left-aligned row like the initial
// build had), a purple clock+time row, one single-weight title combining
// visit type + customer name (not two stacked lines), an address row with
// an inline key icon to its right, a divider, then the flags row, plus a
// left-edge status marker (icons.jsx's TaskStateIcon) straddling the
// card's own left border — half in, half out, vertically centred,
// matching the source component's own -12px/24px positioning exactly.
// 'complete'/'in-progress' also recolour the whole card (green border/
// pale green fill), matching the 3 real Figma card states side by side.
function BookingCard({ booking, onClick }) {
  const clickable = !!onClick
  const hasFlags = booking.highRisk || booking.legalFlags.length > 0
  return (
    <div
      className={`booking-card booking-card--${booking.status}${clickable ? ' booking-card--clickable' : ''}`}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <span className="booking-card-status" aria-hidden="true"><TaskStateIcon status={booking.status} /></span>
      <div className="booking-card-avatar" aria-hidden="true">{initials(booking.customerName)}</div>
      <div className="booking-card-time"><ClockIcon size={16} />{booking.time}</div>
      <div className="booking-card-title"><strong>{booking.visitType}</strong> with <strong>{booking.customerName}</strong></div>
      <div className="booking-card-address-row">
        <span className="booking-card-address">{booking.address}</span>
        <span className="booking-card-key-icon"><KeyIcon size={18} /></span>
      </div>
      {booking.extra}
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

// `bookings`, each booking's optional `onSelect` and its optional `extra`
// node (rendered under the address row) let mobile/handover-notes reuse
// this screen with its own list, more than one tappable card, and a
// "Handover note" badge.
export default function BookingsScreen({ onSelectBooking, bookings = BOOKINGS }) {
  return (
    <div className="screen">
      <StatusBar />
      {/* No search — the live app's Bookings screen doesn't have one. */}
      <AppHeader title="Bookings" />
      <div className="day-strip">
        {DAYS.map(d => (
          <div key={d.date} className="day-strip-item">
            <span className="day-strip-label">{d.label}</span>
            <span className={`day-strip-date${d.today ? ' day-strip-date--active' : ''}`}>{d.date}</span>
          </div>
        ))}
      </div>
      <div className="booking-list">
        {bookings.map(b => (
          <BookingCard key={b.key} booking={b} onClick={b.onSelect || (b.key === 'real' ? onSelectBooking : undefined)} />
        ))}
      </div>
      <AppNav activeTab="bookings" links={{ notifications: '../notifications/', account: '../account/' }} />
    </div>
  )
}
