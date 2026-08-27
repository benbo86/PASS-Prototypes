import { useState, useRef } from 'react'
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
import IOSCalendarPopover from '../../../Components/IOSCalendarPopover'
import IOSTimeKeypadPopover from '../../../Components/IOSTimeKeypadPopover'
import { UNREAD_MESSAGES_COUNT, hasReadMessages } from '../../../Components/messagesData'
import {
  DAYS_LEAVE_TYPES, HALF_DAY_OPTIONS, DAYS_ENTITLEMENT, DAYS_INITIAL_REQUESTS, fmtDays,
  HOURS_ENTITLEMENT, HOURS_INITIAL_REQUESTS, hoursBetween, fmtHours,
  spanDays, fmtDate, fmtDateShort,
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

const STATUS_CLASS = {
  'Awaiting approval': 'hol-request-status--awaiting-approval',
  'Awaiting cancellation': 'hol-request-status--awaiting-cancellation',
  'Approved': 'hol-request-status--approved',
  'Declined': 'hol-request-status--declined',
  // The resolved terminal state of 'Awaiting cancellation', once the office
  // confirms it — reuses that same status's own purple/lavender tone
  // (rather than Declined's red) since this is a care worker-initiated,
  // neutral outcome, not a rejection.
  'Cancelled': 'hol-request-status--cancelled',
}

// Delete/cancel icon only appears where the care worker can actually still
// act on the request — Approved (asks the office to cancel it) or Awaiting
// approval (withdraws it outright, no office involvement) — matching
// AIOP-21563's own field list. Declined/Awaiting cancellation/Cancelled are
// already terminal-or-in-progress from the care worker's side.
const CAN_DELETE_STATUSES = ['Awaiting approval', 'Approved']

const CONTRACT_TOGGLE_OPTIONS = [
  { value: 'days', label: 'Days scheme' },
  { value: 'hours', label: 'Hours scheme' },
]

// ─── Holidays list screen ───────────────────────────────────────

function HolidaysListScreen({ contractType, requests, onBack, onRequestLeave, onDeleteTap }) {
  const isDays = contractType === 'days'
  const entitlement = isDays ? DAYS_ENTITLEMENT : HOURS_ENTITLEMENT
  const fmtAmount = isDays ? fmtDays : fmtHours
  const unitLabel = isDays ? 'days' : 'hrs'
  const available = entitlement.total - entitlement.booked - entitlement.taken

  return (
    <div className="screen">
      <StatusBar />
      <AppHeader title="Holidays" onBack={onBack} />
      <div className="hol-list-scroll">
        <div className="hol-stats-grid">
          <div className="hol-stat-card">
            <div className="hol-stat-label">Total entitlement</div>
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

        <div className="hol-section-label">Your requests</div>
        <div className="hol-requests-list">
          {requests.length === 0 && <div className="hol-empty-state">No requests yet</div>}
          {requests.map(r => (
            <div
              key={r.id}
              className={`hol-request-card${r.status === 'Awaiting cancellation' ? ' hol-request-card--awaiting-cancellation' : ''}`}
            >
              <span className={`hol-request-status ${STATUS_CLASS[r.status]}`}>{r.status}</span>
              {CAN_DELETE_STATUSES.includes(r.status) && (
                <button className="hol-request-delete" onClick={() => onDeleteTap(r)} aria-label="Delete request">
                  <DeleteOutlineIcon size={20} />
                </button>
              )}
              <div className="hol-request-date">
                <CalendarIcon size={15} />
                {r.fromDate === r.toDate ? fmtDate(r.fromDate) : `${fmtDate(r.fromDate)} – ${fmtDate(r.toDate)}`}
              </div>
              <div className="hol-request-duration">{fmtAmount(r.amount)}</div>
              {r.status === 'Declined' && r.declinedReason && (
                <div className="hol-request-declined-reason">Reason: {r.declinedReason}</div>
              )}
              <div className="hol-request-meta">Requested on {fmtDate(r.requestedOn)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Request leave screen — days-scheme employee ─────────────────
// Full day / Half day (AM/PM) only, no time-of-day capture at all.

function DaysRequestLeaveScreen({ onBack, onSubmit }) {
  const [leaveType, setLeaveType] = useState('Full day')
  const [halfDayPeriod, setHalfDayPeriod] = useState('AM')
  const [fromDate, setFromDate] = useState('2025-12-18')
  const [toDate, setToDate] = useState('2025-12-18')
  // Which date field's iOS wheel sheet is currently open — 'from' | 'to' | null.
  const [activeField, setActiveField] = useState(null)
  // Anchor DOM nodes for IOSCalendarPopover's own getBoundingClientRect()
  // positioning — see Components/IOSCalendarPopover.jsx's header comment.
  const fromWrapRef = useRef(null)
  const toWrapRef = useRef(null)

  const isHalfDay = leaveType === 'Half day'

  function handleFromDateChange(value) {
    setFromDate(value)
    // Keep the range valid from this side too — End date's own calendar
    // already refuses to select a day before Start (minDate), but moving
    // Start itself past the existing End needs its own correction, or the
    // range would silently become inverted the other way.
    if (isHalfDay || value > toDate) setToDate(value)
  }

  function selectLeaveType(type) {
    setLeaveType(type)
    if (type === 'Half day') setToDate(fromDate)
  }

  const amount = isHalfDay ? 0.5 : spanDays(fromDate, toDate)

  return (
    <div className="screen">
      <StatusBar />
      <AppHeader title="Request leave" onBack={onBack} />
      <div className="hol-form-body">
        <div className="hol-form-label">Leave type</div>
        <div className="hol-pill-row">
          {DAYS_LEAVE_TYPES.map(type => (
            <button
              key={type}
              type="button"
              className={`hol-pill${leaveType === type ? ' active' : ''}`}
              onClick={() => selectLeaveType(type)}
            >
              {type}
            </button>
          ))}
        </div>

        {isHalfDay && (
          <div className="hol-pill-row">
            {HALF_DAY_OPTIONS.map(period => (
              <button
                key={period}
                type="button"
                className={`hol-pill${halfDayPeriod === period ? ' active' : ''}`}
                onClick={() => setHalfDayPeriod(period)}
              >
                {period}
              </button>
            ))}
          </div>
        )}

        <div className="hol-field-group">
          <div className="hol-field">
            <label className="hol-field-label" htmlFor="hol-from-date">Start date</label>
            <div className="hol-field-input-wrap" ref={fromWrapRef} onClick={() => setActiveField('from')}>
              <input id="hol-from-date" type="text" className="hol-field-input" readOnly value={fmtDateShort(fromDate)} />
              <span className="hol-field-icon"><CalendarIcon size={24} /></span>
              {activeField === 'from' && (
                <IOSCalendarPopover
                  value={fromDate}
                  anchorEl={fromWrapRef.current}
                  onClose={() => setActiveField(null)}
                  onSelect={iso => { handleFromDateChange(iso); setActiveField(null) }}
                />
              )}
            </div>
          </div>
          <div className="hol-field">
            <label className="hol-field-label" htmlFor="hol-to-date">End date</label>
            <div className="hol-field-input-wrap" ref={toWrapRef} onClick={() => { if (!isHalfDay) setActiveField('to') }}>
              <input id="hol-to-date" type="text" className="hol-field-input" readOnly disabled={isHalfDay} value={fmtDateShort(toDate)} />
              <span className="hol-field-icon"><CalendarIcon size={24} /></span>
              {activeField === 'to' && (
                <IOSCalendarPopover
                  value={toDate}
                  minDate={fromDate}
                  anchorEl={toWrapRef.current}
                  onClose={() => setActiveField(null)}
                  onSelect={iso => { setToDate(iso); setActiveField(null) }}
                />
              )}
            </div>
          </div>
        </div>

        <div className="hol-summary-bar">
          <span className="hol-summary-label">Requested</span>
          <span className="hol-summary-value">{fmtDays(amount)}</span>
        </div>
        <div className="hol-remaining-text">
          {DAYS_ENTITLEMENT.total - DAYS_ENTITLEMENT.booked - DAYS_ENTITLEMENT.taken - amount} days remaining
        </div>

        <button
          className="fab-square primary-btn hol-submit-btn"
          onClick={() => onSubmit({ fromDate, toDate, amount })}
        >
          Submit request
        </button>
      </div>
    </div>
  )
}

// ─── Request leave screen — hours-scheme employee ────────────────
// No Full day/Half day concept at all — a "day" isn't a meaningful unit
// for this employee's leave, so they just state real start/end date+time.

function HoursRequestLeaveScreen({ onBack, onSubmit }) {
  const [fromDate, setFromDate] = useState('2025-12-18')
  const [toDate, setToDate] = useState('2025-12-18')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  // Which field's picker is open — 'from'|'to'|'start'|'end'|null.
  const [activeField, setActiveField] = useState(null)
  // Anchor DOM nodes for IOSCalendarPopover/IOSTimeKeypadPopover's own
  // getBoundingClientRect() positioning — see IOSCalendarPopover.jsx's
  // header comment.
  const fromWrapRef = useRef(null)
  const toWrapRef = useRef(null)
  const startWrapRef = useRef(null)
  const endWrapRef = useRef(null)

  const amount = spanDays(fromDate, toDate) * hoursBetween(startTime, endTime)

  return (
    <div className="screen">
      <StatusBar />
      <AppHeader title="Request leave" onBack={onBack} />
      <div className="hol-form-body">
        <div className="hol-field-group">
          <div className="hol-field">
            <label className="hol-field-label" htmlFor="hol-from-date">Start date</label>
            <div className="hol-field-input-wrap" ref={fromWrapRef} onClick={() => setActiveField('from')}>
              <input id="hol-from-date" type="text" className="hol-field-input" readOnly value={fmtDateShort(fromDate)} />
              <span className="hol-field-icon"><CalendarIcon size={24} /></span>
              {activeField === 'from' && (
                <IOSCalendarPopover
                  value={fromDate}
                  anchorEl={fromWrapRef.current}
                  onClose={() => setActiveField(null)}
                  onSelect={iso => {
                    setFromDate(iso)
                    // Moving Start past the existing End would otherwise
                    // silently invert the range — End's own calendar
                    // already refuses to go the other way via minDate.
                    if (iso > toDate) setToDate(iso)
                    setActiveField(null)
                  }}
                />
              )}
            </div>
          </div>
          <div className="hol-field">
            <label className="hol-field-label" htmlFor="hol-to-date">End date</label>
            <div className="hol-field-input-wrap" ref={toWrapRef} onClick={() => setActiveField('to')}>
              <input id="hol-to-date" type="text" className="hol-field-input" readOnly value={fmtDateShort(toDate)} />
              <span className="hol-field-icon"><CalendarIcon size={24} /></span>
              {activeField === 'to' && (
                <IOSCalendarPopover value={toDate} minDate={fromDate} anchorEl={toWrapRef.current} onClose={() => setActiveField(null)} onSelect={iso => { setToDate(iso); setActiveField(null) }} />
              )}
            </div>
          </div>
          <div className="hol-field">
            <label className="hol-field-label" htmlFor="hol-start-time">Start time</label>
            <div className="hol-field-input-wrap" ref={startWrapRef} onClick={() => setActiveField('start')}>
              <input id="hol-start-time" type="text" className="hol-field-input" readOnly value={startTime} />
              <span className="hol-field-icon"><ClockIcon size={24} /></span>
              {activeField === 'start' && (
                <IOSTimeKeypadPopover anchorEl={startWrapRef.current} onChange={setStartTime} onClose={() => setActiveField(null)} />
              )}
            </div>
          </div>
          <div className="hol-field">
            <label className="hol-field-label" htmlFor="hol-end-time">End time</label>
            <div className="hol-field-input-wrap" ref={endWrapRef} onClick={() => setActiveField('end')}>
              <input id="hol-end-time" type="text" className="hol-field-input" readOnly value={endTime} />
              <span className="hol-field-icon"><ClockIcon size={24} /></span>
              {activeField === 'end' && (
                <IOSTimeKeypadPopover anchorEl={endWrapRef.current} onChange={setEndTime} onClose={() => setActiveField(null)} />
              )}
            </div>
          </div>
        </div>

        <div className="hol-summary-bar">
          <span className="hol-summary-label">Requested</span>
          <span className="hol-summary-value">{fmtHours(amount)}</span>
        </div>
        <div className="hol-remaining-text">
          {HOURS_ENTITLEMENT.total - HOURS_ENTITLEMENT.booked - HOURS_ENTITLEMENT.taken - amount} hrs remaining
        </div>

        <button
          className="fab-square primary-btn hol-submit-btn"
          onClick={() => onSubmit({ fromDate, toDate, amount })}
        >
          Submit request
        </button>
      </div>
    </div>
  )
}

// ─── Delete / cancel confirmation bottom sheet ───────────────────
// Two distinct copy variants, matching the Figma's own two bottom sheets
// exactly (Cancel Approved Request / Cancel Awaiting Approval Request) —
// withdrawing a still-undecided request is immediate with no office
// involvement; cancelling an already-Approved one goes through the office.

function DeleteSheet({ request, onClose, onConfirm }) {
  const isApproved = request.status === 'Approved'
  return (
    <div className="hol-sheet-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="hol-sheet-panel">
        {isApproved ? (
          <div className="hol-sheet-body">
            Your line manager will be notified of the cancellation. Once approved, you will receive confirmation and your balance will be updated.
          </div>
        ) : (
          <>
            <div className="hol-sheet-title">Delete leave request?</div>
            <div className="hol-sheet-subtitle">This action cannot be undone</div>
          </>
        )}
        <button className="fab-square primary-btn hol-sheet-btn" onClick={() => onConfirm(request, isApproved)}>
          {isApproved ? 'Submit cancellation' : 'Delete request'}
        </button>
        <button className="fab-square tertiary-btn hol-sheet-btn" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}

// ─── Holidays feature (list + request-leave, internal slide) ────
// Days-scheme and hours-scheme each keep their own independent request
// list — switching the demo toggle never loses either one's in-progress
// state, and a submitted request always lands in whichever list matches
// the mode it was actually submitted under.

function HolidaysFeature({ contractType, view, setView, deleteTarget, setDeleteTarget, onBack }) {
  const [daysRequests, setDaysRequests] = useState(DAYS_INITIAL_REQUESTS)
  const [hoursRequests, setHoursRequests] = useState(HOURS_INITIAL_REQUESTS)

  const isDays = contractType === 'days'
  const requests = isDays ? daysRequests : hoursRequests
  const setRequests = isDays ? setDaysRequests : setHoursRequests

  function handleSubmit({ fromDate, toDate, amount }) {
    const now = new Date()
    const requestedOn = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    setRequests(prev => [
      { id: (prev.at(-1)?.id ?? 0) + 1, status: 'Awaiting approval', fromDate, toDate, amount, requestedOn },
      ...prev,
    ])
    setView('list')
  }

  function handleDeleteConfirm(request, isApproved) {
    setRequests(prev => isApproved
      ? prev.map(r => r.id === request.id ? { ...r, status: 'Awaiting cancellation' } : r)
      : prev.filter(r => r.id !== request.id))
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
            onBack={onBack}
            onRequestLeave={() => setView('form')}
            onDeleteTap={setDeleteTarget}
          />
        }
        secondary={
          isDays
            ? <DaysRequestLeaveScreen onBack={() => setView('list')} onSubmit={handleSubmit} />
            : <HoursRequestLeaveScreen onBack={() => setView('list')} onSubmit={handleSubmit} />
        }
      />
      {deleteTarget && (
        <DeleteSheet request={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm} />
      )}
    </>
  )
}

// ─── Root ────────────────────────────────────────────────────────
// Embeds AccountScreen locally (mirrors mobile/mileage-pay's own Account +
// Mileage structure) so arriving from Account is a real in-page slide, not
// a faked cross-page one — and skips straight to Holidays when arriving via
// ?screen=holidays (a tap from a sibling mobile prototype's own Account).

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
  const [contractType, setContractType] = useState('days')
  // Lifted up from HolidaysFeature (rather than kept local to it) so the
  // root can hide AppNav while the Request Leave form is open — same
  // "focused task, no footer nav" treatment just applied to mobile/messaging's
  // own Thread/Compose screens.
  const [view, setView] = useState('list')
  // Same lift, same reasoning, for the delete-request confirmation sheet —
  // it's a modal overlay on top of the list, not a distinct `view`, so it
  // needed its own state rather than folding into the check above.
  const [deleteTarget, setDeleteTarget] = useState(null)
  const phoneFrameRef = useRef(null)

  return (
    <>
      <DevToolbar floating>
        <DevEdit containerRef={phoneFrameRef} prototypeId={window.location.pathname} />
        <DevMode containerRef={phoneFrameRef} />
        <DevComments containerRef={phoneFrameRef} prototypeId={window.location.pathname} />
        <WireframeToggle />
        <AuditCapture containerRef={phoneFrameRef} />
      </DevToolbar>
      <div className="phone-wrap">
        <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>
        <div className="hol-demo-stack">
          {outerView === 'holidays' && (
            <div className="hol-demo-toggle-wrap">
              <span className="hol-demo-toggle-label">Employee holiday scheme</span>
              <SegmentedToggle options={CONTRACT_TOGGLE_OPTIONS} value={contractType} onChange={setContractType} />
            </div>
          )}
          <div className="phone-frame" ref={phoneFrameRef}>
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
                    setDeleteTarget={setDeleteTarget}
                    onBack={() => setOuterView('account')}
                  />
                }
              />
            </div>
            {!(outerView === 'holidays' && (view === 'form' || deleteTarget)) && (
              <AppNav activeTab="account" messagesUnread={messagesUnread} links={{ notifications: '../notifications/' }} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
