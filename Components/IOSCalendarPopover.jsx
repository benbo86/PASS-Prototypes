import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

// The iOS "compact" date-picker popover — a calendar grid, NOT a wheel
// (wheels are the time-picker convention; date uses this instead). Built
// from a direct visual reference Ben supplied, not guessed from docs —
// see Styles/ios-picker.css's own header comment for the exact mapping.
// Renders as a small floating card docked directly under whichever field
// opened it, matching the reference image exactly (no scrim, no Cancel/
// Done — tapping a day both selects and closes; tapping outside closes
// without changing anything).
//
// Portaled to document.body and positioned from `anchorEl`'s own
// getBoundingClientRect() — the exact same fix Components/FilterDropdown.jsx
// already uses for this identical problem. Real bug this fixes: this used
// to render position:absolute inside the field's own `.hol-field-input-wrap`,
// which sits inside `.hol-form-body` (overflow-y:auto) and
// `.phone-frame`/`.screen-area` (overflow:hidden, required for the phone
// mockup + the ScreenSlider slide transition — can't be removed) — any
// ancestor with overflow other than visible clips an absolutely-positioned
// descendant the moment it extends past that ancestor's own box, which is
// what was cutting the calendar off. Position is computed once at open
// time (same as FilterDropdown — no scroll-tracking needed here either).

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 6l6 6-6 6" />
  </svg>
)
const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 6l-6 6 6 6" />
  </svg>
)

function todayIso() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

// value/onSelect use plain 'YYYY-MM-DD' — matches every other date value
// already flowing through this repo's own data.js files. `anchorEl` is the
// field's own `.hol-field-input-wrap` DOM node (the caller passes it via a
// ref), used only to compute where to dock the popover. `minDate` (optional,
// same 'YYYY-MM-DD' shape) disables every day strictly before it — e.g. an
// End date field passing the current Start date, so a range can't be
// selected backwards in the first place, mirroring `react-datepicker`'s own
// `minDate` prop (the web modal this mobile field's own styling was copied
// from uses that library, just never wired minDate — see mobile/holidays'
// own history for why the mobile side needed a real fix here regardless).
export default function IOSCalendarPopover({ value, onSelect, onClose, anchorEl, minDate }) {
  const [y, m] = value.split('-').map(Number)
  const [viewYear, setViewYear] = useState(y)
  const [viewMonth, setViewMonth] = useState(m - 1) // 0-indexed
  const [pos, setPos] = useState(null)

  useEffect(() => {
    if (!anchorEl) return
    const rect = anchorEl.getBoundingClientRect()
    // A fixed estimate, not a live measurement — a month grid is always
    // 5-6 rows, so its rendered height barely varies between opens. Real
    // bug this avoids, caught while building IOSTimeKeypadPopover.jsx's
    // own version of this same fix: portaling to document.body fixed the
    // ancestor-overflow clipping, but a field low enough in the form can
    // still put rect.bottom + this height past the real browser viewport's
    // bottom edge — docking upward instead when there isn't room below.
    const height = 360
    const margin = 8
    const top = (rect.bottom + 8 + height > window.innerHeight - margin)
      ? Math.max(margin, rect.top - 8 - height)
      : rect.bottom + 8
    setPos({ top, left: rect.left, width: rect.width })
  }, [anchorEl])

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay()
  const numDays = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: numDays }, (_, i) => i + 1)]
  const today = todayIso()

  function goPrevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) } else { setViewMonth(viewMonth - 1) }
  }
  function goNextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) } else { setViewMonth(viewMonth + 1) }
  }

  if (!pos) return null

  return createPortal(
    // Even though this is portaled, it's still nested (in the React tree,
    // not the DOM tree) inside whichever field wrapper opened it — that
    // wrapper has its own onClick={() => setActiveField(...)} to open it.
    // Portals don't change React's synthetic event bubbling (it follows the
    // React tree, not the rendered DOM position), so without stopping
    // propagation here, a click on a day/nav button would still bubble up
    // to that handler right after onSelect runs and immediately re-open
    // what was just closed (real bug, caught in testing before the portal
    // change existed). stopPropagation runs after the backdrop's/cell's own
    // onClick, so onClose/onSelect still fire — it only blocks the bubble
    // beyond this point.
    <span onClick={e => e.stopPropagation()}>
      <div className="ios-cal-backdrop" onClick={onClose} />
      <div className="ios-cal-popover" style={{ top: pos.top, left: pos.left, width: pos.width }}>
        <div className="ios-cal-header">
          <span className="ios-cal-month-label">
            {MONTH_NAMES[viewMonth]} {viewYear} <ChevronRightIcon />
          </span>
          <div className="ios-cal-nav">
            <button type="button" className="ios-cal-nav-btn" onClick={goPrevMonth} aria-label="Previous month"><ChevronLeftIcon /></button>
            <button type="button" className="ios-cal-nav-btn" onClick={goNextMonth} aria-label="Next month"><ChevronRightIcon /></button>
          </div>
        </div>
        <div className="ios-cal-weekdays">
          {WEEKDAY_LABELS.map(d => <span key={d}>{d}</span>)}
        </div>
        <div className="ios-cal-grid">
          {cells.map((day, i) => {
            if (day === null) return <span key={i} className="ios-cal-cell ios-cal-cell--empty" />
            const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isSelected = iso === value
            const isToday = iso === today
            const isDisabled = minDate ? iso < minDate : false
            return (
              <button
                key={i}
                type="button"
                disabled={isDisabled}
                className={`ios-cal-cell${isSelected ? ' selected' : ''}${isToday && !isSelected ? ' today' : ''}${isDisabled ? ' disabled' : ''}`}
                onClick={() => onSelect(iso)}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>
    </span>,
    document.body
  )
}
