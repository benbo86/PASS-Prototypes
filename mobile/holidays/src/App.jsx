import { useState, useRef, useEffect } from 'react'
import StatusBar from '../../../Components/StatusBar'
import AppHeader from '../../../Components/AppHeader'
import AppNav from '../../../Components/AppNav'
import AccountScreen from '../../../Components/AccountScreen'
import ScreenSlider from '../../../Components/ScreenSlider'
import SegmentedToggle from '../../../Components/SegmentedToggle'
import DevToolbar from '../../../Components/DevToolbar'
import DevMode from '../../../Components/DevMode'
import DevComments from '../../../Components/DevComments'
import DevEdit from '../../../Components/DevEdit'
import WireframeToggle from '../../../Components/WireframeToggle'
import AuditCapture from '../../../Components/AuditCapture'
import SplitViewToggle from '../../../Components/SplitViewToggle'
import IOSTimeKeypadPopover from '../../../Components/IOSTimeKeypadPopover'
import { UNREAD_MESSAGES_COUNT, hasReadMessages } from '../../../Components/messagesData'
import BottomSheet from '../../../Components/BottomSheet'
import HolidayNotificationBanner from '../../../Components/HolidayNotificationBanner'
import {
  DEMO_EMPLOYEE, useLeaveRequests, addLeaveRequest, updateLeaveRequest, withdrawLeaveRequest, resetLeaveRequests,
  isUnseenResponse, markResponsesSeen, useDemoScheme, setDemoScheme, useEntitlement, requestTimesText,
} from '../../../Components/leaveRequestsStore'
import {
  DAYS_ENTITLEMENT_TOTAL, fmtDays,
  HOURS_ENTITLEMENT_TOTAL, fmtHours,
  fmtDate, fmtDateShort, toAppRequest,
} from './data'

// ─── Icons ────────────────────────────────────────────────────

const ChevronLeftIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
  </svg>
)

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

const PlusIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
)

// Copied verbatim from Icons/Delete outline.svg (fill swapped to currentColor
// for theming, matching this repo's own icon convention).
const DeleteOutlineIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M17.3321482,7.55624688 L17.3321482,18.222321 C17.3321482,19.1545359 16.6150014,19.9198978 15.7004386,19.9941034 L15.5544692,20 L8.44464196,20 C7.51158269,20 6.74617855,19.2812488 6.67197078,18.3680498 L6.66607411,18.222321 L6.66607411,7.55624688 L17.3321482,7.55624688 Z M15.332,9.556 L8.666,9.556 L8.666,18 L15.332,18 L15.332,9.556 Z M14.2212099,4 L15.1109383,4.88972835 L17.3321482,4.88972835 C17.7858666,4.88972835 18.1600628,5.22902311 18.2149467,5.66642439 L18.2218766,5.77767902 L18.2218766,6.66740737 L5.77812344,6.66740737 L5.77812344,5.77767902 C5.77812344,5.32560157 6.1174182,4.95153162 6.55481948,4.89665741 L6.66607411,4.88972835 L8.88906172,4.88972835 L9.77701239,4 L14.2212099,4 Z" fill="currentColor" fillRule="nonzero" />
  </svg>
)

// Copied verbatim from Icons/Close.svg (fill swapped to currentColor for
// theming) — used for the Approved-request "request cancellation" action
// in place of the bin icon above, so the row-level trigger doesn't read as
// destructive for something that isn't a deletion at all (see the
// CAN_DELETE_STATUSES comment below for why the two cases differ).
const CloseIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <polygon points="18 7.2 16.8 6 12 10.8 7.2 6 6 7.2 10.8 12 6 16.8 7.2 18 12 13.2 16.8 18 18 16.8 13.2 12" fill="currentColor" />
  </svg>
)

const STATUS_CLASS = {
  'Awaiting approval': 'hol-request-status--awaiting-approval',
  'Awaiting cancellation': 'hol-request-status--awaiting-cancellation',
  'Approved': 'hol-request-status--approved',
  'Declined': 'hol-request-status--declined',
  // The resolved terminal state of 'Awaiting cancellation', once the office
  // confirms it (or the office cancels it). Grey, per AIOP-21563, so it
  // reads differently from Awaiting cancellation's lavender.
  'Cancelled': 'hol-request-status--cancelled',
  // She withdrew it before the office decided. Outlined grey, matching the
  // office table's Withdrawn pill.
  'Withdrawn': 'hol-request-status--withdrawn',
}

// Delete/cancel icon only appears where the care worker can actually still
// act on the request — Approved (asks the office to cancel it) or Awaiting
// approval (withdraws it outright, no office involvement) — matching
// AIOP-21563's own field list. Declined/Awaiting cancellation/Cancelled are
// already terminal-or-in-progress from the care worker's side.
const CAN_DELETE_STATUSES = ['Awaiting approval', 'Approved']

// The app can't work out what a request costs: PASS doesn't know which days
// she works, so counting every day in the range overcharges part-timers.
// The office sets the amount when approving; until then her card shows
// only what she asked for (dates and times), with no figure.
function hasConfirmedAmount(r) {
  if (r.status === 'Approved' || r.status === 'Awaiting cancellation') return true
  return r.status === 'Cancelled' && r.cancelledFrom !== 'Awaiting Approval'
}

// A Cancelled card's note, keyed by the office's status when it was
// cancelled. Records cancelled before this was tracked show no note.
const CANCELLED_NOTE = {
  'Awaiting Cancellation': 'Cancelled at your request after approval',
  'Approved': 'Cancelled by the office after approval',
  'Awaiting Approval': 'Cancelled by the office before approval',
}

const CONTRACT_TOGGLE_OPTIONS = [
  { value: 'days', label: 'Days scheme' },
  { value: 'hours', label: 'Hours scheme' },
]

// ─── Request filters ────────────────────────────────────────────
// Brought over from Ben's Figma Make prototype ("Holiday Entitlement and
// Leave Requests") — the only part of that file still current. Status
// chips are multi-select; none selected means "show everything" (the Make
// file started on Pending only, which hid approved holidays until tapped —
// agreed to start with everything showing instead). One chip per status,
// labelled exactly as the request cards show it.
const FILTER_STATUSES = ['Awaiting approval', 'Approved', 'Awaiting cancellation', 'Declined', 'Cancelled', 'Withdrawn']

// Overlap, not containment: a 23–27 Dec holiday shows for a 25 Dec–2 Jan
// filter. A single date (no end) means that day only — the Make file
// treated it as "from this date onwards", changed with Ben since a single
// tap reads as "am I off that day?". ISO strings compare as plain strings.
function matchesDateRange(r, start, end) {
  if (!start) return true
  const rangeEnd = end || start
  return r.fromDate <= rangeEnd && r.toDate >= start
}

// Shared by the sheet's hint and the filter button: one date on its own,
// two separated by ' - '.
function fmtDateRangeLabel(start, end) {
  return !end || end === start ? fmtDate(start) : `${fmtDate(start)} - ${fmtDate(end)}`
}

function isoFor(year, monthIndex, day) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

// Content for the shared BottomSheet. Tap a start day, then an end day;
// tapping before the start swaps them. Nothing applies until Apply.
// Used by both the date filter and the Request leave form, so the feature
// has one calendar on both platforms.
function DateRangeSheet({ title = 'Filter by date', start, end, initialMonth, onApply, secondaryLabel = 'Clear', onSecondary }) {
  const [draftStart, setDraftStart] = useState(start)
  const [draftEnd, setDraftEnd] = useState(end)
  const [[viewYear, viewMonth], setView] = useState(() => {
    const [y, m] = (start || initialMonth).split('-').map(Number)
    return [y, m - 1]
  })

  function shiftMonth(delta) {
    const d = new Date(viewYear, viewMonth + delta, 1)
    setView([d.getFullYear(), d.getMonth()])
  }

  // The sheet opens showing the current selection, but the first tap always
  // starts a new one: otherwise it would extend the old range.
  const [fresh, setFresh] = useState(true)

  function pick(iso) {
    if (fresh) { setDraftStart(iso); setDraftEnd(null); setFresh(false); return }
    if (!draftStart || draftEnd) { setDraftStart(iso); setDraftEnd(null) }
    else if (iso < draftStart) { setDraftEnd(draftStart); setDraftStart(iso) }
    else setDraftEnd(iso)
  }

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells = [
    ...Array.from({ length: firstWeekday }, (_, i) => <div key={`blank-${i}`} />),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const iso = isoFor(viewYear, viewMonth, i + 1)
      const isEdge = iso === draftStart || iso === draftEnd
      const inRange = draftStart && draftEnd && iso > draftStart && iso < draftEnd
      return (
        <button
          key={iso}
          type="button"
          className={`hol-range-day${isEdge ? ' hol-range-day--edge' : ''}${inRange ? ' hol-range-day--in-range' : ''}`}
          onClick={() => pick(iso)}
        >
          {i + 1}
        </button>
      )
    }),
  ]

  return (
    <>
      <div className="hol-sheet-title">{title}</div>
      <div className="hol-range-hint">
        {draftStart ? fmtDateRangeLabel(draftStart, draftEnd) : 'Choose a date or a range'}
      </div>
      <div className="hol-range-header">
        <button type="button" className="hol-range-nav" onClick={() => shiftMonth(-1)} aria-label="Previous month"><ChevronLeftIcon size={24} /></button>
        <span className="hol-range-month">{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button type="button" className="hol-range-nav hol-range-nav--next" onClick={() => shiftMonth(1)} aria-label="Next month"><ChevronLeftIcon size={24} /></button>
      </div>
      <div className="hol-range-grid">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="hol-range-weekday">{d}</div>)}
        {cells}
      </div>
      <button className="fab-square primary-btn" disabled={!draftStart} onClick={() => onApply(draftStart, draftEnd)}>Apply</button>
      <button className="fab-square tertiary-btn" onClick={onSecondary}>{secondaryLabel}</button>
    </>
  )
}

// ─── Holidays list screen ───────────────────────────────────────

function HolidaysListScreen({ contractType, requests, entitlement, onBack, onRequestLeave, onDeleteTap, dateSheetOpen, setDateSheetOpen }) {
  const [statusFilters, setStatusFilters] = useState([])
  const [dateStart, setDateStart] = useState(null)
  const [dateEnd, setDateEnd] = useState(null)

  function toggleStatus(status) {
    setStatusFilters(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status])
  }
  function clearFilters() {
    setStatusFilters([])
    setDateStart(null)
    setDateEnd(null)
  }

  const visibleRequests = requests.filter(r =>
    (statusFilters.length === 0 || statusFilters.includes(r.status)) && matchesDateRange(r, dateStart, dateEnd)
  )
  const dateLabel = dateStart ? fmtDateRangeLabel(dateStart, dateEnd) : 'Filter by date'
  // Calendar opens on the newest request's month when no range is set —
  // the demo data sits in Dec 2025–Feb 2026, so "today" would land on an
  // empty month.
  const latestRequestDate = requests.reduce((max, r) => r.fromDate > max ? r.fromDate : max, requests[0]?.fromDate ?? '2026-01-01')

  const isDays = contractType === 'days'
  const fmtAmount = isDays ? fmtDays : fmtHours
  const unitLabel = isDays ? 'days' : 'hrs'
  const available = entitlement.available

  return (
    <div className="screen">
      <StatusBar />
      <AppHeader title="Holidays" onBack={onBack} />
      <div className="hol-list-scroll">
        <div className="hol-stats-grid">
          <div className="hol-stat-card">
            {/* "Entitlement", as on the employee contract: on a pro-rata
                scheme it's what's accrued so far, so "Total" would mislead. */}
            <div className="hol-stat-label">Entitlement</div>
            <div className="hol-stat-value">{entitlement.total} {unitLabel}</div>
          </div>
          <div className="hol-stat-card">
            <div className="hol-stat-label">{isDays ? 'Days available' : 'Hours available'}</div>
            <div className="hol-stat-value">{available} {unitLabel}</div>
          </div>
          <div className="hol-stat-card">
            <div className="hol-stat-label">{isDays ? 'Days booked' : 'Hours booked'}</div>
            <div className="hol-stat-value">{entitlement.booked} {unitLabel}</div>
          </div>
          <div className="hol-stat-card">
            <div className="hol-stat-label">{isDays ? 'Days taken' : 'Hours taken'}</div>
            <div className="hol-stat-value">{entitlement.taken} {unitLabel}</div>
          </div>
        </div>

        <button className="fab-square primary-btn hol-request-btn" onClick={onRequestLeave}>
          <PlusIcon /> Request leave
        </button>

        <div className="hol-section-label hol-section-label--with-action">
          Your requests
          {(statusFilters.length > 0 || dateStart) && (
            <button type="button" className="hol-clear-filters" onClick={clearFilters}>Clear filters</button>
          )}
        </div>
        <div className="hol-filter-chips">
          {FILTER_STATUSES.map(status => (
            <button
              key={status}
              type="button"
              className={`hol-filter-chip${statusFilters.includes(status) ? ' active' : ''}`}
              aria-pressed={statusFilters.includes(status)}
              onClick={() => toggleStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="hol-date-filter-row">
          <button
            type="button"
            className={`hol-date-filter${dateStart ? ' active' : ''}`}
            onClick={() => setDateSheetOpen(true)}
          >
            <CalendarIcon size={20} /> {dateLabel}
          </button>
        </div>
        <div className="hol-requests-list">
          {requests.length === 0 && <div className="hol-empty-state">No requests yet</div>}
          {requests.length > 0 && visibleRequests.length === 0 && (
            <div className="hol-empty-state">
              No requests match these filters
              <button type="button" className="hol-empty-clear" onClick={clearFilters}>Clear filters</button>
            </div>
          )}
          {visibleRequests.map(r => (
            <div
              key={r.id}
              className={`hol-request-card${r.status === 'Awaiting cancellation' ? ' hol-request-card--awaiting-cancellation' : ''}`}
            >
              <span className={`hol-request-status ${STATUS_CLASS[r.status]}`}>{r.status}</span>
              {CAN_DELETE_STATUSES.includes(r.status) && (
                <button
                  className={`hol-request-delete${r.status === 'Approved' ? ' hol-request-delete--cancel' : ''}`}
                  onClick={() => onDeleteTap(r)}
                  aria-label={r.status === 'Approved' ? 'Request cancellation' : 'Withdraw request'}
                >
                  {r.status === 'Approved' ? <CloseIcon size={20} /> : <DeleteOutlineIcon size={20} />}
                </button>
              )}
              <div className="hol-request-date">
                <CalendarIcon size={15} />
                {fmtDateRangeLabel(r.fromDate, r.toDate)}
              </div>
              <div className="hol-request-duration">
                {requestTimesText(r, ' - ')}
              </div>
              {/* The confirmed amount, on its own labelled line: the office
                  may leave out days she doesn't work, so next to the times
                  it would look like a sum that doesn't add up. */}
              {hasConfirmedAmount(r) && r.status !== 'Cancelled' && (
                <div className="hol-request-note">From entitlement: {fmtAmount(r.amount)}</div>
              )}
              {r.status === 'Approved' && r.requestedFrom && (
                <div className="hol-request-note">Dates changed by the office. You asked for {fmtDateRangeLabel(r.requestedFrom, r.requestedTo)}.</div>
              )}
              {(r.status === 'Approved' || r.status === 'Awaiting cancellation') && r.approvalNote && (
                <div className="hol-request-note">Note: {r.approvalNote}</div>
              )}
              {r.status === 'Approved' && r.cancellationKept && (
                <div className="hol-request-note">
                  Cancellation not approved{r.keptReason ? `. Reason: ${r.keptReason}` : ''}
                </div>
              )}
              {/* "Cancelled" alone doesn't say whether it had been approved,
                  or who cancelled it. */}
              {r.status === 'Cancelled' && CANCELLED_NOTE[r.cancelledFrom] && (
                <div className="hol-request-note">{CANCELLED_NOTE[r.cancelledFrom]}</div>
              )}
              {/* After the cancelled note: what happened, then what it
                  meant for her balance. */}
              {r.status === 'Cancelled' && hasConfirmedAmount(r) && (
                <div className="hol-request-note">Returned to entitlement: {fmtAmount(r.amount)}</div>
              )}
              {(r.status === 'Declined' || r.status === 'Cancelled') && r.reason && (
                <div className="hol-request-declined-reason">Reason: {r.reason}</div>
              )}
              <div className="hol-request-meta">
                Requested on {fmtDate(r.requestedOn)}
                {r.status === 'Withdrawn' && r.withdrawnOn && ` · Withdrawn on ${fmtDate(r.withdrawnOn)}`}
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomSheet open={dateSheetOpen} onClose={() => setDateSheetOpen(false)}>
        {dateSheetOpen && (
          <DateRangeSheet
            start={dateStart}
            end={dateEnd}
            initialMonth={latestRequestDate}
            onApply={(start, end) => { setDateStart(start); setDateEnd(end); setDateSheetOpen(false) }}
            onSecondary={() => { setDateStart(null); setDateEnd(null); setDateSheetOpen(false) }}
          />
        )}
      </BottomSheet>
    </div>
  )
}

// ─── Balance on the Request leave form ───────────────────────────
// No cost is shown: the app can't know which days in the range she'd have
// worked (see hasConfirmedAmount). Her balance is shown so she can judge for
// herself; the office confirms the amount. The one safe block is a balance
// of 0 or less, since any request is then too much whatever days she works.
// pending: requests still awaiting approval, which have no amount yet.
// It sits above the form as a sentence, not a stat bar under the dates, so
// it doesn't read as a total that should change with the dates picked.
function BalanceNote({ available, pendingCount, unitWord }) {
  if (available <= 0) {
    return (
      <p className="hol-balance-note hol-office-confirm--none-left">
        You have no holiday left to request. Speak to the office if you need more.
      </p>
    )
  }
  const unit = available === 1 ? unitWord.replace(/s$/, '') : unitWord
  return (
    <p className="hol-balance-note">
      You have <strong>{available} {unit}</strong> available.
      {pendingCount > 0 && (
        <> {pendingCount} {pendingCount === 1 ? 'request is' : 'requests are'} still waiting for approval.</>
      )}
    </p>
  )
}

// ─── Dates field on the Request leave form ───────────────────────
// One field for the whole holiday: it opens the same range calendar as the
// date filter, where the first and last day are tapped.
function LeaveDateFields({ fromDate, toDate, onChange }) {
  const [open, setOpen] = useState(false)
  const value = fromDate === toDate ? fmtDateShort(fromDate) : `${fmtDateShort(fromDate)} - ${fmtDateShort(toDate)}`
  return (
    <>
      <div className="hol-field">
        <label className="hol-field-label" htmlFor="hol-dates">Dates</label>
        <div className="hol-field-input-wrap" onClick={() => setOpen(true)}>
          <input id="hol-dates" type="text" className="hol-field-input" readOnly value={value} />
          <span className="hol-field-icon"><CalendarIcon size={24} /></span>
        </div>
      </div>
      <BottomSheet open={open} onClose={() => setOpen(false)}>
        {open && (
          <DateRangeSheet
            title="Holiday dates"
            start={fromDate}
            end={toDate === fromDate ? null : toDate}
            initialMonth={fromDate}
            onApply={(start, end) => { onChange(start, end || start); setOpen(false) }}
            secondaryLabel="Cancel"
            onSecondary={() => setOpen(false)}
          />
        )}
      </BottomSheet>
    </>
  )
}

// ─── Time field on the Request leave form ────────────────────────
// Opens the iOS-style keypad (the live app uses the platform's own picker).
// Optional: empty shows the placeholder (start or end of the day), and a
// set time gets a clear button in place of the clock.
function TimeField({ id, label, placeholder, value, onChange }) {
  const [open, setOpen] = useState(false)
  // Anchor for IOSTimeKeypadPopover's own positioning.
  const wrapRef = useRef(null)
  return (
    <div className="hol-field">
      <label className="hol-field-label" htmlFor={id}>{label}</label>
      <div className="hol-field-input-wrap" ref={wrapRef} onClick={() => setOpen(true)}>
        <input id={id} type="text" className="hol-field-input" readOnly value={value} placeholder={placeholder} />
        {value ? (
          <button
            type="button"
            className="hol-field-icon hol-field-clear"
            aria-label={`Clear ${label.replace(' (optional)', '').toLowerCase()}`}
            onClick={e => { e.stopPropagation(); setOpen(false); onChange('') }}
          >
            <CloseIcon size={20} />
          </button>
        ) : (
          <span className="hol-field-icon"><ClockIcon size={24} /></span>
        )}
        {open && (
          <IOSTimeKeypadPopover anchorEl={wrapRef.current} onChange={onChange} onClose={() => setOpen(false)} />
        )}
      </div>
    </div>
  )
}

// ─── Request leave screen ────────────────────────────────────────
// The same for both schemes, and the same as the web's add-holiday form:
// dates, each with an optional time. It's one continuous span (the start
// time goes with the first date, the end time with the last), so a shift
// past midnight is just two dates. No times is the whole of each day.
// Part of the day with the same times on every date was dropped for the
// first build (AIOP-21555, 28/10/2026): it needed one absence per day.
// No amount is sent; the office sets it on approval.

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function fmtWeekday(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return `${WEEKDAYS[new Date(y, m - 1, d).getDay()]} ${d} ${MONTHS_SHORT[m - 1]}`
}

// Spells out the span the times make, since "start time" next to a date
// range could otherwise read as a daily time.
function spanSummary(fromDate, toDate, startTime, endTime) {
  if (fromDate === toDate) {
    if (!startTime && !endTime) return `You'll be off all day on ${fmtWeekday(fromDate)}.`
    return `You'll be off on ${fmtWeekday(fromDate)} from ${startTime || 'the start of the day'} until ${endTime || 'the end of the day'}.`
  }
  const from = startTime ? `${startTime} on ${fmtWeekday(fromDate)}` : `the start of ${fmtWeekday(fromDate)}`
  const until = endTime ? `${endTime} on ${fmtWeekday(toDate)}` : `the end of ${fmtWeekday(toDate)}`
  return `You'll be off from ${from} until ${until}.`
}

function RequestLeaveScreen({ unitWord, available, pendingCount, onBack, onSubmit }) {
  const [fromDate, setFromDate] = useState('2026-11-16')
  const [toDate, setToDate] = useState('2026-11-16')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  // ISO date + HH:MM strings compare correctly as plain strings.
  const endsBeforeStart = `${toDate}T${endTime || '23:59'}` <= `${fromDate}T${startTime || '00:00'}`

  return (
    <div className="screen">
      <StatusBar />
      <AppHeader title="Request leave" onBack={onBack} />
      <div className="hol-form-body">
        <BalanceNote available={available} pendingCount={pendingCount} unitWord={unitWord} />

        <div className="hol-field-group">
          <LeaveDateFields fromDate={fromDate} toDate={toDate} onChange={(from, to) => { setFromDate(from); setToDate(to) }} />
          <TimeField id="hol-start-time" label="Start time (optional)" placeholder="Start of the day" value={startTime} onChange={setStartTime} />
          <TimeField id="hol-end-time" label="End time (optional)" placeholder="End of the day" value={endTime} onChange={setEndTime} />
          {endsBeforeStart
            ? <p className="hol-span-summary hol-span-summary--error">The end must be after the start.</p>
            : <p className="hol-span-summary">{spanSummary(fromDate, toDate, startTime, endTime)}</p>}
        </div>

        <button
          className="fab-square primary-btn hol-submit-btn"
          disabled={available <= 0 || endsBeforeStart}
          onClick={() => onSubmit({ fromDate, toDate, startTime: startTime || null, endTime: endTime || null, amount: null })}
        >
          Submit request
        </button>
      </div>
    </div>
  )
}

// ─── Request sent bottom sheet ───────────────────────────────────
// Shown after Submit, on top of the list. It confirms the request went and
// says the office decides the amount: that's about what happens next, so it
// lives here rather than on the form.
function RequestSentSheet({ request, onClose }) {
  const isHours = request.contract === 'hours'
  const dates = request.fromDate === request.toDate
    ? fmtDateShort(request.fromDate)
    : `${fmtDateShort(request.fromDate)} - ${fmtDateShort(request.toDate)}`
  return (
    <>
      <div className="hol-sheet-title">Request sent</div>
      <div className="hol-sheet-subtitle">{dates}, {requestTimesText(request, ' - ')}</div>
      <div className="hol-sheet-body">
        The office will confirm how many {isHours ? 'hours' : 'days'} are taken from your entitlement when they approve your request.
      </div>
      <button className="fab-square primary-btn" onClick={onClose}>Done</button>
    </>
  )
}

// ─── Delete / cancel confirmation bottom sheet ───────────────────
// Two distinct copy variants, matching the Figma's own two bottom sheets
// exactly (Cancel Approved Request / Cancel Awaiting Approval Request) —
// withdrawing a still-undecided request is immediate with no office
// involvement; cancelling an already-Approved one goes through the office.

// Content only; Components/BottomSheet supplies the scrim, panel and
// slide up/down.
function DeleteSheet({ request, onClose, onConfirm }) {
  const isApproved = request.status === 'Approved'
  return (
    <>
      {isApproved ? (
        <div className="hol-sheet-body">
          Your line manager will be notified of the cancellation. Once approved, you will receive confirmation and your balance will be updated.
        </div>
      ) : (
        <>
          <div className="hol-sheet-title">Withdraw leave request?</div>
          <div className="hol-sheet-subtitle">It will show as Withdrawn. This can't be undone.</div>
        </>
      )}
      <button className="fab-square primary-btn" onClick={() => onConfirm(request, isApproved)}>
        {isApproved ? 'Submit cancellation' : 'Withdraw request'}
      </button>
      <button className="fab-square tertiary-btn" onClick={onClose}>Cancel</button>
    </>
  )
}

// ─── Holidays feature (list + request-leave, internal slide) ────
// Her requests live in Components/leaveRequestsStore.js, shared with the
// office's Holiday Requests table as Adrianna Janowski: anything submitted
// here appears there, and the office's decisions show up here live. The
// demo toggle switches which of her two holiday schemes is shown, on both
// sides.

function HolidaysFeature({ contractType, view, setView, deleteTarget, setDeleteTarget, sentRequest, setSentRequest, dateSheetOpen, setDateSheetOpen, onBack, listVisible }) {
  const linkedRequests = useLeaveRequests()
  const isDays = contractType === 'days'
  const entitlement = useEntitlement(contractType, isDays ? DAYS_ENTITLEMENT_TOTAL : HOURS_ENTITLEMENT_TOTAL)
  const schemeRequests = linkedRequests.filter(r => r.contract === contractType)
  const requests = schemeRequests.map(toAppRequest)
  const pendingCount = schemeRequests.filter(r => r.status === 'Awaiting Approval').length

  // While her Holidays list is on screen, office responses there count as
  // seen: the notifications about them are marked read and never reach the
  // footer bell. One arriving while she's here still shows the in-app
  // banner (HolidayNotificationBanner), so the change is noticed.
  useEffect(() => {
    if (!listVisible) return
    const ids = schemeRequests.filter(isUnseenResponse).map(r => r.id)
    if (ids.length) markResponsesSeen(ids)
  }, [listVisible, linkedRequests])

  function handleSubmit(request) {
    const full = { ...request, contract: contractType, employee: DEMO_EMPLOYEE, status: 'Awaiting Approval', submitted: new Date().toISOString() }
    addLeaveRequest(full)
    setView('list')
    setSentRequest(full)
  }

  // Withdrawing a request that's still awaiting approval marks it Withdrawn
  // on both sides; an approved one becomes a cancellation request for the
  // office to confirm.
  function handleDeleteConfirm(request, isApproved) {
    if (isApproved) updateLeaveRequest(request.id, { status: 'Awaiting Cancellation' })
    else withdrawLeaveRequest(request.id)
    setDeleteTarget(null)
  }

  return (
    <>
      <ScreenSlider
        secondaryActive={view === 'form'}
        primary={
          <HolidaysListScreen
            contractType={contractType}
            requests={requests}
            entitlement={entitlement}
            onBack={onBack}
            onRequestLeave={() => setView('form')}
            onDeleteTap={setDeleteTarget}
            dateSheetOpen={dateSheetOpen}
            setDateSheetOpen={setDateSheetOpen}
          />
        }
        secondary={
          <RequestLeaveScreen unitWord={isDays ? 'days' : 'hours'} available={entitlement.available} pendingCount={pendingCount} onBack={() => setView('list')} onSubmit={handleSubmit} />
        }
      />
      <BottomSheet open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        {deleteTarget && <DeleteSheet request={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm} />}
      </BottomSheet>
      <BottomSheet open={!!sentRequest} onClose={() => setSentRequest(null)}>
        {sentRequest && <RequestSentSheet request={sentRequest} onClose={() => setSentRequest(null)} />}
      </BottomSheet>
    </>
  )
}

// ─── Root ────────────────────────────────────────────────────────
// Embeds AccountScreen locally (mirrors mobile/mileage-pay's own Account +
// Mileage structure) so arriving from Account is a real in-page slide, not
// a faked cross-page one — and skips straight to Holidays when arriving via
// ?screen=holidays (a tap from a sibling mobile prototype's own Account).

function confirmResetLeaveRequests() {
  if (window.confirm('Reset all holiday requests (here and on the web) to the starting examples?')) resetLeaveRequests()
}

export default function App() {
  const [outerView, setOuterView] = useState(() =>
    new URLSearchParams(window.location.search).get('screen') === 'holidays' ? 'holidays' : 'account'
  )
  const [entering] = useState(() =>
    new URLSearchParams(window.location.search).get('transition') === '1'
  )
  const [messagesUnread] = useState(() => hasReadMessages() ? 0 : UNREAD_MESSAGES_COUNT)
  // Which employee-contract experience the Holidays feature currently shows
  // — a real employee has one fixed contract type and would never see this
  // switch themselves, so it's rendered entirely outside the phone mockup
  // (not inside any screen) to read unambiguously as a prototype control,
  // not part of the app's own UI.
  // Shared with the web table (Components/leaveRequestsStore.js), which
  // shows her requests for the same scheme.
  const contractType = useDemoScheme()
  const setContractType = setDemoScheme
  // Lifted up from HolidaysFeature (rather than kept local to it) so the
  // root can hide AppNav while the Request Leave form is open — same
  // "focused task, no footer nav" treatment just applied to mobile/messaging's
  // own Thread/Compose screens.
  const [view, setView] = useState('list')
  // Same lift, same reasoning, for the delete-request confirmation sheet —
  // it's a modal overlay on top of the list, not a distinct `view`, so it
  // needed its own state rather than folding into the check above.
  const [deleteTarget, setDeleteTarget] = useState(null)
  // Same again for the "Request sent" sheet shown after Submit.
  const [sentRequest, setSentRequest] = useState(null)
  // Same again for the date-filter sheet on the list screen.
  const [dateSheetOpen, setDateSheetOpen] = useState(false)
  const phoneFrameRef = useRef(null)

  return (
    <>
      <DevToolbar floating>
        <DevEdit containerRef={phoneFrameRef} prototypeId={window.location.pathname} />
        <DevMode containerRef={phoneFrameRef} />
        <DevComments containerRef={phoneFrameRef} prototypeId={window.location.pathname} />
        <WireframeToggle />
        <AuditCapture containerRef={phoneFrameRef} />
        <SplitViewToggle
          floating
          otherUrl="../../schedule/leave-requests/"
          selfLabel="Holidays (mobile app)"
          otherLabel="Holiday Requests (web)"
          defaultSelfShare={0.35}
          actions={[
            { label: contractType === 'days' ? 'Switch to hours scheme' : 'Switch to days scheme', onClick: () => setDemoScheme(contractType === 'days' ? 'hours' : 'days') },
            { label: 'Reset demo data', onClick: confirmResetLeaveRequests },
          ]}
        />
      </DevToolbar>
      <div className="phone-wrap">
        <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>
        <div className="hol-demo-stack">
          {outerView === 'holidays' && (
            <div className="hol-demo-toggle-wrap">
              <span className="hol-demo-toggle-label">Employee holiday scheme</span>
              <SegmentedToggle options={CONTRACT_TOGGLE_OPTIONS} value={contractType} onChange={setContractType} />
              <p className="hol-demo-link-note">
                Linked to <a href="../../schedule/leave-requests/" target="_blank" rel="noreferrer">Holiday Requests</a> as {DEMO_EMPLOYEE}
              </p>
              <button type="button" className="hol-demo-reset" onClick={confirmResetLeaveRequests}>
                Reset demo data
              </button>
            </div>
          )}
          <div className="phone-frame" ref={phoneFrameRef}>
            {/* Rendered here rather than by AppNav, which is hidden on the
                request form and sheets. Tapping it opens the Holidays list. */}
            <HolidayNotificationBanner onOpen={() => { setOuterView('holidays'); setView('list'); setDeleteTarget(null); setDateSheetOpen(false) }} />
            <div className={`screen-area page-slide ${entering ? 'slide-entering' : ''}`}>
              <ScreenSlider
                secondaryActive={outerView === 'holidays'}
                primary={
                  <AccountScreen
                    hideNav
                    onGoToMessages={() => { window.location.href = '../messaging/?screen=inbox&transition=1' }}
                    onGoToMileage={() => { window.location.href = '../mileage-pay/?screen=mileage&transition=1' }}
                    onGoToHolidays={() => setOuterView('holidays')}
                    messagesUnread={messagesUnread}
                  />
                }
                secondary={
                  <HolidaysFeature
                    contractType={contractType}
                    view={view}
                    setView={setView}
                    deleteTarget={deleteTarget}
                    sentRequest={sentRequest}
                    setSentRequest={setSentRequest}
                    setDeleteTarget={setDeleteTarget}
                    dateSheetOpen={dateSheetOpen}
                    setDateSheetOpen={setDateSheetOpen}
                    onBack={() => setOuterView('account')}
                    listVisible={outerView === 'holidays' && view === 'list'}
                  />
                }
              />
            </div>
            {!(outerView === 'holidays' && (view === 'form' || deleteTarget || sentRequest || dateSheetOpen)) && (
              <AppNav notificationBanner={false} activeTab="account" messagesUnread={messagesUnread} links={{ bookings: '../tag-in-out/', notifications: '../notifications/' }} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
