import { useState, useRef } from 'react'
import PhoneFrame from '../../../Components/PhoneFrame'
import StatusBar from '../../../Components/StatusBar'
import AppHeader from '../../../Components/AppHeader'
import AppNav from '../../../Components/AppNav'
import ScreenSlider from '../../../Components/ScreenSlider'
import SegmentedToggle from '../../../Components/SegmentedToggle'
import IOSCalendarPopover from '../../../Components/IOSCalendarPopover'
import IOSTimeKeypadPopover from '../../../Components/IOSTimeKeypadPopover'
import DevToolbar from '../../../Components/DevToolbar'
import DevMode from '../../../Components/DevMode'
import DevComments from '../../../Components/DevComments'
import DevEdit from '../../../Components/DevEdit'
import WireframeToggle from '../../../Components/WireframeToggle'
import AuditCapture from '../../../Components/AuditCapture'

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)
// Copied verbatim from mobile/holidays/src/App.jsx's own inline icons — not
// promoted to Icons/ or a shared component, matching this repo's existing
// convention of copying rather than sharing a one-off icon definition.
const CalendarIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
  </svg>
)
const ClockIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
  </svg>
)

function fmtDateShort(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number)
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`
}

// ─── "Shell" story — PhoneFrame + StatusBar + AppHeader + AppNav +
// ScreenSlider, the five pieces every mobile prototype is built from. ────

function HomeScreen({ onOpenDetail }) {
  return (
    <>
      <StatusBar />
      <AppHeader title="Home" />
      <div className="shell-demo-body">
        <p>Primary screen — StatusBar + AppHeader (no back button). AppNav sits outside the slider, fixed at the bottom.</p>
        <button className="round-btn primary-btn" onClick={onOpenDetail}>Open detail screen</button>
      </div>
    </>
  )
}

function DetailScreen({ onBack }) {
  return (
    <>
      <StatusBar />
      <AppHeader title="Detail" onBack={onBack} />
      <div className="shell-demo-body">
        <p>Secondary screen — same shell, AppHeader now shows a back button. ScreenSlider handles the slide transition between the two; AppNav stays put.</p>
      </div>
    </>
  )
}

function ShellStory() {
  const [detailOpen, setDetailOpen] = useState(false)
  return (
    <>
      <div className="screen">
        <ScreenSlider
          secondaryActive={detailOpen}
          primary={<HomeScreen onOpenDetail={() => setDetailOpen(true)} />}
          secondary={<DetailScreen onBack={() => setDetailOpen(false)} />}
        />
      </div>
      <AppNav activeTab="bookings" />
    </>
  )
}

// ─── "Pickers" story — Components/IOSCalendarPopover.jsx +
// Components/IOSTimeKeypadPopover.jsx, built for mobile/holidays' Request
// Leave form (see that prototype's own history for the full design
// reasoning — reference-image-driven, portaled to document.body). ───────

function PickersStory() {
  const [date, setDate] = useState('2025-12-18')
  const [time, setTime] = useState('09:00')
  // Which field's popover is open — 'date' | 'time' | null.
  const [activeField, setActiveField] = useState(null)
  const dateWrapRef = useRef(null)
  const timeWrapRef = useRef(null)

  return (
    <>
      <StatusBar />
      <AppHeader title="Pickers" />
      <div className="shell-demo-body">
        <p>Tap a field below — the date picker docks under the field, the time keypad docks full-width at the bottom of the device, matching the real iOS conventions each was built from.</p>

        <div className="demo-field">
          <label className="demo-field-label">Date</label>
          <div className="demo-field-input-wrap" ref={dateWrapRef} onClick={() => setActiveField('date')}>
            <span className="demo-field-value">{fmtDateShort(date)}</span>
            <span className="demo-field-icon"><CalendarIcon size={24} /></span>
            {activeField === 'date' && (
              <IOSCalendarPopover
                value={date}
                anchorEl={dateWrapRef.current}
                onClose={() => setActiveField(null)}
                onSelect={iso => { setDate(iso); setActiveField(null) }}
              />
            )}
          </div>
        </div>

        <div className="demo-field">
          <label className="demo-field-label">Time</label>
          <div className="demo-field-input-wrap" ref={timeWrapRef} onClick={() => setActiveField('time')}>
            <span className="demo-field-value">{time}</span>
            <span className="demo-field-icon"><ClockIcon size={24} /></span>
            {activeField === 'time' && (
              <IOSTimeKeypadPopover
                anchorEl={timeWrapRef.current}
                onChange={setTime}
                onClose={() => setActiveField(null)}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Root ────────────────────────────────────────────────────────────

const STORIES = [
  {
    key: 'shell',
    label: 'Shell',
    description: 'PhoneFrame + StatusBar + AppHeader + AppNav + ScreenSlider — the five pieces every mobile prototype is built from, always used together rather than standalone.',
  },
  {
    key: 'pickers',
    label: 'Pickers',
    description: 'Components/IOSCalendarPopover.jsx + Components/IOSTimeKeypadPopover.jsx — the iOS-style date/time pickers built for mobile/holidays.',
  },
]

export default function App() {
  const [story, setStory] = useState('shell')
  const current = STORIES.find(s => s.key === story)

  const pageRef = useRef(null)

  return (
    <>
      <DevToolbar>
        <DevEdit containerRef={pageRef} prototypeId={window.location.pathname} />
        <DevMode containerRef={pageRef} />
        <DevComments containerRef={pageRef} prototypeId={window.location.pathname} />
        <WireframeToggle />
        <AuditCapture containerRef={pageRef} />
      </DevToolbar>
      <div className="mobile-shell-demo" ref={pageRef}>
      <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>
      <div className="mobile-shell-demo-content">
        <h1>Mobile Components</h1>
        <p>{current.description}</p>
        <SegmentedToggle
          options={STORIES.map(s => ({ value: s.key, label: s.label }))}
          value={story}
          onChange={setStory}
        />
      </div>
      <PhoneFrame>
        {story === 'shell' && <ShellStory />}
        {story === 'pickers' && <PickersStory />}
      </PhoneFrame>
    </div>
    </>
  )
}
