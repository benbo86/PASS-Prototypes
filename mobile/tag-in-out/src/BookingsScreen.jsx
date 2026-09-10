import StatusBar from '../../../Components/StatusBar'
import AppHeader from '../../../Components/AppHeader'
import AppNav from '../../../Components/AppNav'
import { LegalFlags, HighRiskBadge } from '../../../Components/LegalFlags'
import { ClockIcon, KeyIcon, TaskStateIcon } from './icons'
import { BOOKINGS } from './data'

// Copied verbatim from mobile/customer-documents/src/App.jsx's own
// SearchIcon, per this repo's icon-copy-fidelity convention — this
// prototype doesn't wire up real search, the button is just there to
// match the Figma header (node 591:7034).
const SearchIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M10.8488372,18.6872093 C12.627907,18.6872093 14.2813953,18.0802326 15.6,17.0755814 L19.2209302,20.6965116 C19.4302326,20.905814 19.7023256,21.0104651 19.9534884,21.0104651 C20.2046512,21.0104651 20.4976744,20.905814 20.6860465,20.6965116 C21.1046512,20.277907 21.1046512,19.6290698 20.6860465,19.2104651 L17.0860465,15.5895349 C18.0906977,14.2709302 18.6976744,12.6174419 18.6976744,10.8383721 C18.6976744,6.50581395 15.1813953,2.98953488 10.8488372,2.98953488 C6.51627907,2.98953488 3,6.50581395 3,10.8383721 C3,15.1709302 6.51627907,18.6872093 10.8488372,18.6872093 Z M10.8488372,5.08255814 C14.0093023,5.08255814 16.6046512,7.65697674 16.6046512,10.8383721 C16.6046512,14.0197674 14.0093023,16.594186 10.8488372,16.594186 C7.68837209,16.594186 5.09302326,13.9988372 5.09302326,10.8383721 C5.09302326,7.67790698 7.66744186,5.08255814 10.8488372,5.08255814 Z" fill="currentColor" />
  </svg>
)

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

export default function BookingsScreen({ onSelectBooking }) {
  return (
    <div className="screen">
      <StatusBar />
      <AppHeader
        title="Bookings"
        right={<button className="bookings-search-btn" aria-label="Search"><SearchIcon /></button>}
      />
      <div className="day-strip">
        {DAYS.map(d => (
          <div key={d.date} className="day-strip-item">
            <span className="day-strip-label">{d.label}</span>
            <span className={`day-strip-date${d.today ? ' day-strip-date--active' : ''}`}>{d.date}</span>
          </div>
        ))}
      </div>
      <div className="booking-list">
        {BOOKINGS.map(b => (
          <BookingCard key={b.key} booking={b} onClick={b.key === 'real' ? onSelectBooking : undefined} />
        ))}
      </div>
      <AppNav activeTab="bookings" links={{ notifications: '../notifications/', account: '../account/' }} />
    </div>
  )
}
