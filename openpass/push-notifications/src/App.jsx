import { useRef, useState } from 'react'
import DevToolbar from '../../../Components/DevToolbar'
import DevMode from '../../../Components/DevMode'
import DevComments from '../../../Components/DevComments'
import DevEdit from '../../../Components/DevEdit'
import WireframeToggle from '../../../Components/WireframeToggle'
import AuditCapture from '../../../Components/AuditCapture'
import openPassInfoIcon from '../../../Icons/openpass-info-icon.png'
import { CellularIcon, WifiIcon, BatteryIcon } from '../../../Components/StatusBar'

// ─── Icons ────────────────────────────────────────────────────

const ChevronLeftIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
  </svg>
)

// Copied verbatim from Icons/openpass-emblem.svg — a complete two-tone
// badge (circle + ring + heart baked in), not a plain monochrome icon, so
// its literal fills are kept as-is rather than swapped to currentColor.
const OpenPassEmblemIcon = ({ size = 38 }) => (
  <svg width={size} height={size} viewBox="0 0 38 38" fill="none">
    <rect width="38" height="38" rx="19" fill="#688FC4" />
    <path fillRule="evenodd" clipRule="evenodd" d="M27.5782 12.4177C25.6831 10.5274 22.6106 10.5274 20.7155 12.4177L18.9997 14.1288L17.2845 12.4177C15.3894 10.5274 12.3162 10.5274 10.4218 12.4177C8.52606 14.308 8.52606 17.3716 10.4218 19.2619L18.9997 27.8179L27.5782 19.2619C29.4739 17.3716 29.4739 14.308 27.5782 12.4177Z" fill="white" />
    <circle cx="19" cy="19" r="15.5" stroke="white" />
  </svg>
)

const RestartIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 1 2.64 6.36" />
    <path d="M3 21v-6h6" />
  </svg>
)

const HamburgerIcon = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
    <rect width="20" height="2" rx="1" fill="currentColor" />
    <rect y="6" width="20" height="2" rx="1" fill="currentColor" />
    <rect y="12" width="20" height="2" rx="1" fill="currentColor" />
  </svg>
)

// Copied verbatim from Icons/openpass-app-icon.svg — a complete app-icon
// badge (rounded-square background, circle, checkmark all baked in), so
// kept as literal fills rather than swapped to currentColor, same
// reasoning as OpenPassEmblemIcon above.
const OpenPassAppIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 38 38" fill="none">
    <g clipPath="url(#opn-app-icon-clip0)">
      <rect width="38" height="38" rx="10" fill="#9A26D6" />
      <g clipPath="url(#opn-app-icon-clip1)">
        <path fillRule="evenodd" clipRule="evenodd" d="M6.24693 0C2.79639 0 0 2.75229 0 6.14786V31.8528C0 35.2484 2.79639 38 6.24693 38H31.7524C35.2029 38 38 35.2484 38 31.8528V6.14786C38 2.75229 35.2029 0 31.7524 0H6.24693Z" fill="#5D91C9" />
        <path fillRule="evenodd" clipRule="evenodd" d="M19 4.75146C11.1299 4.75146 4.75 11.1307 4.75 19.0015C4.75 26.8715 11.1299 33.2515 19 33.2515C26.8707 33.2515 33.25 26.8715 33.25 19.0015C33.25 11.1307 26.8707 4.75146 19 4.75146Z" fill="white" />
        <path fillRule="evenodd" clipRule="evenodd" d="M15.7705 27.0727L28.6844 14.1588L25.455 10.9302L15.7705 20.6154L12.5418 17.3875L9.3125 20.6154L15.7705 27.0727Z" fill="#5D91C9" />
      </g>
    </g>
    <defs>
      <clipPath id="opn-app-icon-clip0"><rect width="38" height="38" rx="10" fill="white" /></clipPath>
      <clipPath id="opn-app-icon-clip1"><rect width="38" height="38" fill="white" /></clipPath>
    </defs>
  </svg>
)

const CameraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 3l-1.83 2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3.17L15 3H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8a3 3 0 100 6 3 3 0 000-6z" />
  </svg>
)

const FlashlightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 2h10v5l-2 3v10a2 2 0 01-2 2h-2a2 2 0 01-2-2V10L7 7V2zm2 2v2.4l2 3V20h2v-10.6l2-3V4H9z" />
  </svg>
)

// Bottom-nav icons — plain, consistent thin-stroke glyphs (24x24).
const NoteIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 3h13l3 3v15H4z" />
    <path d="M8 9h9M8 13h9M8 17h6" />
  </svg>
)

const SpeechIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H8l-4 4V5a2 2 0 012-2h13a2 2 0 012 2z" />
  </svg>
)

const CalendarGridIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
)

const ClipboardIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9 3h6v3H9zM8.5 12.5l2 2 4.5-4.5" />
  </svg>
)

const QuestionIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5a2.5 2.5 0 114 2c-.7.6-1.5 1-1.5 2.2" />
    <circle cx="12" cy="17.2" r="0.15" fill="currentColor" stroke="none" />
  </svg>
)

// ─── Dummy data (matches the established openPASS Figma content) ──────
const CUSTOMER_NAME = 'Margaret Collins'
const CUSTOMER_NICKNAME = 'Maggie'

const BOOKINGS = [
  { time: '08:00', duration: '1 hour', carer: 'Sarah Johnson' },
  { time: '12:00', duration: '30 min', carer: 'David Patel' },
  { time: '17:00', duration: '1 hour', carer: 'Sarah Johnson' },
]

const WEEK_DAYS = [
  { label: 'M', date: 16 }, { label: 'T', date: 17 }, { label: 'W', date: 18 },
  { label: 'T', date: 19 }, { label: 'F', date: 20 }, { label: 'S', date: 21 }, { label: 'S', date: 22 },
]

const CARE_NOTE_TASKS = [
  'Assistance with washing and dressing',
  'Breakfast prepared and eaten',
  'Morning medication administered',
  'Blood pressure recorded',
]

const MESSAGES = [
  {
    from: 'office',
    timestamp: '16 Jun 2026 09:51',
    text: 'Hi. Yes, Margaret raised the issue during her visit, we gave her some pain relief.',
  },
  {
    from: 'mine',
    timestamp: '16 Jun 2026 09:46',
    text: 'I noticed Margaret mentioned her knee — has this been flagged to the district nurse? Many thanks',
  },
]

// ─── Lock screen ────────────────────────────────────────────────────
// The whole point of this prototype: two push notifications sitting on an
// iOS-style lock screen, each tappable straight into the openPASS screen
// it's actually about — see the App component's own screen-routing below
// for why "new message" goes to the Care Note Details screen specifically,
// not a generic Messages list.
function LockScreen({ onOpenBooking, onOpenMessage }) {
  return (
    <div className="opn-lockscreen">
      <div className="opn-lock-statusbar">
        <span>9:41</span>
        <div className="opn-lock-statusicons">
          <CellularIcon />
          <WifiIcon />
          <BatteryIcon />
        </div>
      </div>

      <div className="opn-lock-date">Tue 16 Jun</div>
      <div className="opn-lock-time">9:41</div>

      <div className="opn-lock-notifications">
        <button type="button" className="opn-notification" onClick={onOpenBooking}>
          <div className="opn-app-icon"><OpenPassAppIcon size={28} /></div>
          <div className="opn-notification-body">
            <div className="opn-notification-top">
              <span className="opn-notification-title">Booking updated</span>
              <span className="opn-notification-time">now</span>
            </div>
            <p className="opn-notification-text">{CUSTOMER_NAME}'s 07:00 booking has been updated to 08:00</p>
          </div>
        </button>

        <button type="button" className="opn-notification" onClick={onOpenMessage}>
          <div className="opn-app-icon"><OpenPassAppIcon size={28} /></div>
          <div className="opn-notification-body">
            <div className="opn-notification-top">
              <span className="opn-notification-title">Office</span>
              <span className="opn-notification-time">now</span>
            </div>
            <p className="opn-notification-text">Yes that's no problem, we look forwards to seeing Margaret for her evening visit.</p>
          </div>
        </button>
      </div>

      <div className="opn-lock-bottom-icons">
        <div className="opn-lock-icon-btn"><CameraIcon /></div>
        <div className="opn-lock-icon-btn"><FlashlightIcon /></div>
      </div>
    </div>
  )
}

// ─── Shared openPASS chrome ─────────────────────────────────────────
// Purely decorative, matching the real design — neither icon navigates.
// Getting back to the lock screen is handled by a dedicated control
// outside the phone shell instead (see App's own "Back to lock screen"
// button below), not by overloading these in-app icons with a demo-only
// behaviour they don't really have.
function OpenPassHeader({ title, showBackChevron }) {
  return (
    <div className="opn-header">
      {showBackChevron ? (
        <div className="opn-header-icon-btn" aria-hidden="true">
          <ChevronLeftIcon size={28} />
        </div>
      ) : (
        <div className="opn-header-icon-btn opn-header-heart" aria-hidden="true">
          <OpenPassEmblemIcon size={38} />
        </div>
      )}
      <div className="opn-header-title">{title}</div>
      {showBackChevron ? <div className="opn-header-spacer" /> : <div className="opn-header-icon-btn opn-header-hamburger"><HamburgerIcon /></div>}
    </div>
  )
}

function CustomerRow() {
  return (
    <div className="opn-customer-row">
      <div className="opn-customer-avatar">MC</div>
      <div className="opn-customer-name">{CUSTOMER_NAME} ({CUSTOMER_NICKNAME})</div>
      <img className="opn-customer-info-icon" src={openPassInfoIcon} width="33" height="33" alt="Info" />
    </div>
  )
}

function BottomNav() {
  return (
    <div className="opn-bottom-nav">
      <div className="opn-nav-item"><NoteIcon /><span>Care Notes</span></div>
      <div className="opn-nav-item"><SpeechIcon /><span>Messages</span></div>
      <div className="opn-nav-item opn-nav-item--active"><CalendarGridIcon /><span>Bookings</span></div>
      <div className="opn-nav-item"><ClipboardIcon /><span>Care Plan</span></div>
      <div className="opn-nav-item"><QuestionIcon /><span>Support</span></div>
    </div>
  )
}

// ─── Bookings screen — destination for the "booking updated" tap ──────
function BookingsScreen() {
  return (
    <div className="opn-screen">
      <OpenPassHeader title="Bookings" />
      <CustomerRow />
      <div className="opn-screen-body">
        <div className="opn-calendar-card">
          <div className="opn-calendar-range">16 - 22 Jun 2026</div>
          <div className="opn-calendar-week">
            {WEEK_DAYS.map(d => (
              <div key={d.date} className="opn-calendar-day">
                <span className="opn-calendar-day-label">{d.label}</span>
                <span className={`opn-calendar-day-date${d.date === 17 ? ' opn-calendar-day-date--selected' : ''}`}>{d.date}</span>
                <span className="opn-calendar-day-dot" />
              </div>
            ))}
          </div>
        </div>

        {BOOKINGS.map(b => (
          <div className="opn-booking-card" key={b.time}>
            <div className="opn-booking-time">{b.time} - {b.duration}</div>
            <div className="opn-booking-carer">{b.carer}</div>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  )
}

// ─── Care Note Details screen — destination for the "new message" tap ──
// Ben: message threads in openPASS aren't all direct-with-the-office —
// a thread started from a visit's care notes lives on that visit's own
// Care Note Details screen, not a generic Messages list. This notification
// is a reply on exactly that kind of thread, so it opens here.
function CareNoteScreen() {
  return (
    <div className="opn-screen">
      <OpenPassHeader title="Mon 16 Jun 2026" showBackChevron />
      <CustomerRow />
      <div className="opn-screen-body opn-screen-body--scroll">
        <div className="opn-details-card">
          <div className="opn-details-header">
            <span className="opn-details-accent" />
            <div className="opn-details-header-text">
              <div className="opn-details-date">Mon 16 Jun 2026</div>
              <div className="opn-details-visit">08:00 – 1 hour, Morning Care</div>
              <div className="opn-details-carer">Sarah Johnson 07:52 – 09:05</div>
            </div>
          </div>
          <p className="opn-details-notes">
            <strong>Notes:</strong> Margaret had a lovely morning and was happy to chat. She enjoyed her
            breakfast and all tasks were completed. Maggie mentioned her left knee has been a little
            uncomfortable this week.
          </p>
          <div className="opn-details-divider" />
          <div className="opn-task-list">
            {CARE_NOTE_TASKS.map(t => (
              <div className="opn-task-row" key={t}>
                <span className="opn-task-dot" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="opn-messages">
          {MESSAGES.map(m => (
            <div className={`opn-message-row${m.from === 'mine' ? ' opn-message-row--mine' : ''}`} key={m.timestamp}>
              <span className="opn-message-ts">{m.timestamp}</span>
              <div className={`opn-bubble opn-bubble--${m.from}`}>{m.text}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="opn-message-input">
        <input className="opn-message-input-field" placeholder="…" disabled />
        <span className="opn-message-input-send">Send</span>
      </div>
    </div>
  )
}

// ─── App ────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('lock')
  const pageRef = useRef(null)

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
        <a href="../../" className="back-link"><ChevronLeftIcon size={20} /> Prototypes</a>
        {/* Deliberately outside the phone shell, not one of the in-app
            header icons — those are purely decorative, matching the real
            design (see OpenPassHeader's own comment). Getting back to the
            start of the journey is a demo-only affordance, so it gets its
            own demo-only control instead of overloading the app chrome. */}
        {screen !== 'lock' && (
          <button type="button" className="opn-restart-btn" onClick={() => setScreen('lock')}>
            <RestartIcon /> Back to lock screen
          </button>
        )}
        <div className="phone-frame opn-phone-frame" ref={pageRef}>
          {screen === 'lock' && (
            <LockScreen
              onOpenBooking={() => setScreen('bookings')}
              onOpenMessage={() => setScreen('careNote')}
            />
          )}
          {screen === 'bookings' && <BookingsScreen />}
          {screen === 'careNote' && <CareNoteScreen />}
        </div>
      </div>
    </>
  )
}
