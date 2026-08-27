import { useState, useRef } from 'react'
import SideNav from '../../../Components/SideNav'
import TopNav from '../../../Components/TopNav'
import OfficeNav from '../../../Components/OfficeNav'
import SlidePanel from '../../../Components/SlidePanel'
import SegmentedToggle from '../../../Components/SegmentedToggle'
import DevToolbar from '../../../Components/DevToolbar'
import DevMode from '../../../Components/DevMode'
import DevComments from '../../../Components/DevComments'
import DevEdit from '../../../Components/DevEdit'
import WireframeToggle from '../../../Components/WireframeToggle'
import AuditCapture from '../../../Components/AuditCapture'
// ─── Icons ────────────────────────────────────────────────────

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)

const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>
)

const RemoveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
)

const WarningIcon = () => (
  <svg className="warning-icon" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M10.27,3.99 C11.04,2.66 12.96,2.66 13.73,3.99 L21.26,17 C22.03,18.33 21.07,20 19.53,20 L4.47,20 C2.93,20 1.97,18.33 2.74,17 Z M12,15 C11.45,15 11,15.45 11,16 C11,16.55 11.45,17 12,17 C12.55,17 13,16.55 13,16 C13,15.45 12.55,15 12,15 Z M12,7 C11.45,7 11,7.45 11,8 L11,12 C11,12.55 11.45,13 12,13 C12.55,13 13,12.55 13,12 L13,8 C13,7.45 12.55,7 12,7 Z" />
  </svg>
)

// Sidebar nav icons — SVG paths from live product
const VisitTypesIcon = () => (
  <svg width="25" height="25" viewBox="0 0 25 25" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd">
      <path d="M.395.846h24v24h-24z"/>
      <path d="M12.398 5c1.661 0 3.16.673 4.243 1.764a6.06 6.06 0 0 1 1.754 4.287c0 1.978-.731 3.366-2.436 5.385l-.762.886c-1.01 1.182-1.787 2.169-2.514 3.228-1.488-1.295-2.207-2.202-3.096-3.24l-.769-.895-.373-.452-.332-.42a10.117 10.117 0 0 1-1.021-1.579 6.193 6.193 0 0 1-.697-2.913c0-1.677.669-3.192 1.756-4.286A5.96 5.96 0 0 1 12.398 5z" stroke="currentColor" strokeWidth="2"/>
      <path d="M12.395 9.5c-.824 0-1.5.676-1.5 1.5s.676 1.5 1.5 1.5 1.5-.676 1.5-1.5-.676-1.5-1.5-1.5z" fill="currentColor"/>
    </g>
  </svg>
)

const ContractsIcon = () => (
  <svg width="25" height="25" viewBox="0 0 25 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd">
      <path d="M.395 0h24v24h-24z"/>
      <path d="M8.84 3a3.318 3.318 0 0 0-3.326 3.31v11.38A3.318 3.318 0 0 0 8.839 21h7.216a3.318 3.318 0 0 0 3.323-3.31V8.467a2 2 0 0 0-.644-1.471l-3.761-3.467A2 2 0 0 0 13.617 3zm.092 1.982h4.529v2.297c0 .985.801 1.783 1.79 1.783h2.17v8.45a1.5 1.5 0 0 1-1.5 1.5h-6.99a1.5 1.5 0 0 1-1.5-1.5V6.483a1.5 1.5 0 0 1 1.5-1.5zm3.463 8.898a1.44 1.44 0 1 1 0-2.88 1.44 1.44 0 0 1 0 2.88zm-1.008.6h.188a1.96 1.96 0 0 0 1.64 0h.188c.835 0 1.512.87 1.512 1.705v.275a.54.54 0 0 1-.54.54h-3.96a.54.54 0 0 1-.54-.54v-.275c0-.835.677-1.705 1.512-1.705z" fill="currentColor" fillRule="nonzero"/>
    </g>
  </svg>
)

const ChargingIcon = () => (
  <svg width="25" height="25" viewBox="0 0 25 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd">
      <path d="M.395 0h24v24h-24z"/>
      <path d="m20.543 14.608-3.208 2.566a2.21 2.21 0 0 1-1.39.486H11.84a.556.556 0 0 1 0-1.111h2.719c.552 0 1.066-.379 1.154-.924a1.111 1.111 0 0 0-1.095-1.299h-4.555c-.937 0-1.846.323-2.573.913l-1.615 1.31H3.951a.556.556 0 0 0-.556.555v3.334c0 .306.249.555.556.555h11.387c.505 0 .995-.17 1.389-.486l5.251-4.201a1.111 1.111 0 0 0 .044-1.698c-.41-.372-1.049-.347-1.48 0z" fill="currentColor" fillRule="nonzero"/>
      <g stroke="currentColor" strokeLinecap="round" strokeWidth="2">
        <path d="M15.395 10.5V12h-6 1V6.284c.01-.955.398-1.637 1.167-2.049.768-.411 1.712-.283 2.833.387" strokeLinejoin="round"/>
        <path d="M9.395 8h3"/>
      </g>
    </g>
  </svg>
)

const TimeThresholdsIcon = () => (
  <svg width="25" height="25" viewBox="0 0 25 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd">
      <path d="M.395 0h24v24h-24z"/>
      <path d="M14.395 1h-4c-.55 0-1 .45-1 1s.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1zm-2 13c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1zm7.03-6.61.75-.75a.993.993 0 0 0 0-1.4l-.01-.01a.993.993 0 0 0-1.4 0l-.75.75A8.962 8.962 0 0 0 12.395 4c-4.8 0-8.88 3.96-9 8.76a8.998 8.998 0 0 0 9 9.24 8.994 8.994 0 0 0 7.03-14.61zM12.395 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" fill="currentColor"/>
    </g>
  </svg>
)

const ExpenseTypesIcon = () => (
  <svg width="25" height="25" viewBox="0 0 25 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd">
      <path d="M.395 0h24v24h-24z"/>
      <path d="M17.658 9c.553 0 1.053.224 1.415.586.362.362.585.862.585 1.414v6c0 .552-.223 1.052-.585 1.414a1.994 1.994 0 0 1-1.415.586H8.132a2.99 2.99 0 0 1-2.122-.879A2.99 2.99 0 0 1 5.132 16v-6a.997.997 0 0 1 1-1z" stroke="currentColor" strokeWidth="2"/>
      <g stroke="currentColor" strokeLinecap="round">
        <path d="M12.007 15.25V16H8.908h.517v-2.858c.005-.477.205-.819.602-1.024.397-.206.885-.142 1.463.193" strokeLinejoin="round"/>
        <path d="M8.908 14h1.55"/>
      </g>
      <path d="M18.467 6a3.552 3.552 0 0 0-2.471-1H7.165a2 2 0 1 0 0 4h6.316" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path fill="currentColor" d="M4.132 7h2.066v4H4.132z"/>
    </g>
  </svg>
)

const CancellationIcon = () => (
  <svg width="25" height="25" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd">
      <path d="M0 .795h32v32H0z"/>
      <path d="M13.337 5c4.707 0 8.572 3.47 9.23 8.02a8.686 8.686 0 0 0-2.664.236c-.53-3.189-3.257-5.59-6.566-5.59-3.698 0-6.67 2.995-6.67 6.735 0 1.208.246 2.228.783 3.278.308.602.686 1.189 1.215 1.879l.42.531.483.586 1.035 1.206a58.441 58.441 0 0 1 2.505 3.11l.228.309.123-.17c.127-.17.256-.343.388-.516.337.93.827 1.786 1.441 2.536-.187.26-.37.522-.552.788l-.265.424a1.332 1.332 0 0 1-2.252.01l-.159-.247-.122-.185c-.967-1.419-2.022-2.761-3.36-4.325l-1.033-1.202-.516-.625-.457-.578c-.644-.84-1.11-1.561-1.497-2.318A9.547 9.547 0 0 1 4 14.401C4 9.193 8.161 5 13.337 5zm-.004 7.333c1.1 0 2 .901 2 2 0 1.1-.9 2-2 2-1.099 0-2-.9-2-2 0-1.099.901-2 2-2z" fill="currentColor" fillRule="nonzero"/>
      <path d="M22 14.333A7.333 7.333 0 1 1 22 29a7.333 7.333 0 0 1 0-14.667zm3.58 2.785a.667.667 0 0 0-.851.077L22 19.924l-2.729-2.729a.667.667 0 0 0-.942 0l-.8.8-.078.093c-.18.26-.154.619.078.85l2.728 2.729-2.728 2.728a.667.667 0 0 0 0 .943l.8.8.092.077c.26.18.619.154.85-.077L22 23.41l2.729 2.73c.26.26.682.26.942 0l.8-.8.078-.093a.667.667 0 0 0-.078-.85l-2.728-2.73 2.728-2.728a.667.667 0 0 0 0-.943l-.8-.8z" fill="currentColor"/>
    </g>
  </svg>
)

const HolidaysIcon = () => (
  <svg width="25" height="25" viewBox="0 0 25 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd">
      <path d="M0 0h24.79v24H0z"/>
      <path d="M19.626 4h-1.033V3c0-.55-.465-1-1.033-1-.568 0-1.033.45-1.033 1v1H8.263V3c0-.55-.464-1-1.033-1-.568 0-1.032.45-1.032 1v1H5.165c-1.147 0-2.056.9-2.056 2L3.1 20c0 1.1.92 2 2.066 2h14.46c1.137 0 2.066-.9 2.066-2V6c0-1.1-.93-2-2.065-2zm0 15c0 .55-.465 1-1.033 1H6.198c-.569 0-1.033-.45-1.033-1V9h14.46v10zM7.23 11h2.066v2H7.23v-2zm4.132 0h2.066v2h-2.066v-2zm4.132 0h2.066v2h-2.066v-2zM7.23 15h2.066v2H7.23v-2zm4.132 0h2.066v2h-2.066v-2zm4.132 0h2.066v2h-2.066v-2z" fill="currentColor"/>
    </g>
  </svg>
)

const OfficeCalendarIcon = () => (
  <svg width="25" height="25" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd">
      <path d="M0 0h24v24H0z"/>
      <path d="M16 3a1 1 0 0 1 1 1v1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1V4a1 1 0 1 1 2 0v1h6V4a1 1 0 0 1 1-1zm1.5 6h-11a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5zm-6 2a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5h3z" fill="currentColor"/>
    </g>
  </svg>
)

const CommunicationsIcon = ({ size = 25 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd">
      <path d="M0 0h32v32H0z"/>
      <path d="M26.667 5.333H5.333A2.663 2.663 0 0 0 2.68 8l-.013 16c0 1.467 1.2 2.667 2.666 2.667h21.334c1.466 0 2.666-1.2 2.666-2.667V8c0-1.467-1.2-2.667-2.666-2.667zM25.333 24H6.667c-.734 0-1.334-.6-1.334-1.333v-12l9.254 5.786c.866.547 1.96.547 2.826 0l9.254-5.786v12c0 .733-.6 1.333-1.334 1.333zM16 14.667 5.333 8h21.334L16 14.667z" fill="currentColor"/>
    </g>
  </svg>
)

const AdvancedSettingsIcon = () => (
  <svg width="25" height="25" viewBox="0 0 25 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd">
      <path d="M8 5C9.657 5 11 6.343 11 8c0 1.657-1.343 3-3 3-1.306 0-2.417-.834-2.829-2.001L4 9C3.448 9 3 8.552 3 8s.448-1 1-1l1.171.001C5.583 5.834 6.694 5 8 5zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm8 6c1.306 0 2.418.835 2.829 2.001L20 15c.552 0 1 .448 1 1s-.448 1-1 1l-1.171-.001C18.418 18.165 17.306 19 16 19c-1.657 0-3-1.343-3-3s1.343-3 3-3zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM13 7l7-.001C20.552 7 21 7.448 21 8s-.448 1-1 1l-7-.001V7zM11 15l-7 .001C3.448 15 3 15.448 3 16s.448 1 1 1l7-.001V15z" fill="currentColor"/>
    </g>
  </svg>
)

// Lightweight practical check, not full RFC 5322 — matches the level of
// fidelity this prototype's other validation already uses (e.g. required-
// field asterisks) rather than pulling in a validation library.
const isValidEmail = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim())

// ─── Data ─────────────────────────────────────────────────────

const NAV_ITEMS = [
  { key: 'visit-types',     label: 'Visit and event types',  Icon: VisitTypesIcon },
  { key: 'contracts',       label: 'Contracts and pay',      Icon: ContractsIcon },
  { key: 'charging',        label: 'Charging and invoicing', Icon: ChargingIcon },
  { key: 'time-thresholds', label: 'Time thresholds',        Icon: TimeThresholdsIcon },
  { key: 'expense-types',   label: 'Expense types',          Icon: ExpenseTypesIcon },
  { key: 'cancellation',    label: 'Cancellation reasons',   Icon: CancellationIcon },
  { key: 'holidays',        label: 'Holidays and absences',  Icon: HolidaysIcon },
  { key: 'office-calendar', label: 'Office calendar',        Icon: OfficeCalendarIcon },
  { key: 'communications',  label: 'Communications',         Icon: CommunicationsIcon },
  { key: 'advanced',        label: 'Advanced settings',      Icon: AdvancedSettingsIcon },
]

// Real blocks from the live Communications section — each independently
// editable (its own pencil), matching how it's actually implemented (not
// one edit action for the whole section). Copy/defaults for Invoicing are
// taken verbatim from Ben's own reference screenshots; the other three use
// the same established pattern with placeholder copy, since this round's
// focus is the new Holiday requests block, not rebuilding these faithfully.
const COMMS_BLOCKS = [
  {
    key: 'invoicing',
    title: 'Invoicing',
    description: 'Define the from email address and subject you would like when sending an invoice.',
    tags: ['funder-name', 'office-name', 'payment-method'],
  },
  {
    key: 'credit-notes',
    title: 'Credit notes',
    description: 'Define the from email address and subject you would like when sending a credit note.',
    tags: ['funder-name', 'office-name'],
  },
  {
    key: 'draw-pay-advice',
    title: 'Draw pay advice',
    description: 'Define the from email address and subject you would like when sending pay advice.',
    tags: ['employee-name', 'office-name'],
  },
  {
    key: 'schedule',
    title: 'Schedule to employees and customers',
    description: 'Define the from email address and subject you would like when sending a rota to employees and customers.',
    tags: ['recipient-name', 'office-name'],
  },
]

// Subject and body are fixed, not editable — see Ben's own reasoning in
// HolidayRequestsPanelBody's comment below. Kept as plain constants (not
// part of holidayConfig/draft) since there's nothing to save/patch about
// them.
// "Update" (subject and body's own opening line) was wrong for a brand-new
// request — this notification fires for both a fresh submission and a
// cancellation request (see HolidayRequestsPanelBody's own "Enable" copy),
// and "update" only reads naturally for the second. Kept deliberately
// neutral instead — [request-status] already states which one it actually
// is ("Awaiting approval" vs "Awaiting cancellation"), so the opener
// doesn't need to guess.
const HOLIDAY_FIXED_SUBJECT = 'Holiday request — [employee-name]'
// No "please log in to PASS to review" call-to-action here — that's exactly
// the kind of instruction the note field below now exists for an office to
// add themselves if they want it, not something baked into the fixed part.
// No "Dear Coordinator" greeting either — a recipient isn't necessarily a
// coordinator by role, just whoever's been added to the recipients list.
//
// Two body variants, not one body trying to cover both — a days-scheme
// request has a real Full day/Half day AM/Half day PM distinction but no
// genuinely captured clock times; an hours-scheme request has real
// start/end times but no such distinction at all. This mirrors how
// mobile/holidays itself already treats these as two genuinely different
// request experiences (DaysRequestLeaveScreen/HoursRequestLeaveScreen),
// not one form/template that adapts a few fields — a single [start-time]/
// [end-time] pair shown unconditionally would have nothing real to
// substitute for a days-scheme request. [amount-requested] doesn't need
// the same split — it's already unit-aware elsewhere in the app ("1 day"
// vs "8 hrs"), so one tag covers both here too.
//
// [day-type], not "leave type" — this repo's own Roster Settings already
// has a real "Absence types" concept (Holiday/Sick day/Appointment/etc.),
// and "leave type" reads as exactly that. This tag is much narrower — just
// Full day vs Half day (AM)/(PM) — and this whole notification only ever
// fires for Holiday requests specifically anyway, never other absence
// types, so there's nothing to disambiguate on that front.
const HOLIDAY_FIXED_BODY_DAYS = '[employee-name] has a holiday request that requires your review.\n\nStatus: [request-status]\nDates: [start-date] – [end-date]\nDay type: [day-type]\nAmount: [amount-requested]'
const HOLIDAY_FIXED_BODY_HOURS = '[employee-name] has a holiday request that requires your review.\n\nStatus: [request-status]\nDates: [start-date] – [end-date]\nTimes: [start-time] – [end-time]\nAmount: [amount-requested]'

const INITIAL_COMMS_CONFIGS = {
  invoicing: {
    source: 'custom', customAddress: 'everylifetest+invoice@gmail.com', verified: true, verifying: false,
    subject: 'Care Invoice',
    body: 'Dear [funder-name]\n\nPlease find attached your invoice for the previous two week period. Your payment method is: [payment-method]\n\nThe payment due date is shown on the right hand side, for customers paying via direct debit, your payment will be collected on or shortly after the date shown next to the payment due date.',
  },
  'credit-notes': {
    source: 'pass', customAddress: '', verified: false, verifying: false,
    subject: 'Credit Note',
    body: 'Dear [funder-name]\n\nPlease find attached a credit note relating to your account. If you have any questions, please contact [office-name].',
  },
  'draw-pay-advice': {
    source: 'pass', customAddress: '', verified: false, verifying: false,
    subject: 'Your Pay Advice',
    body: 'Dear [employee-name]\n\nPlease find attached your pay advice for the most recent pay period.',
  },
  schedule: {
    source: 'pass', customAddress: '', verified: false, verifying: false,
    subject: 'Your Schedule',
    body: 'Dear [recipient-name]\n\nPlease find attached your schedule for the upcoming period.',
  },
}

const INITIAL_HOLIDAY_CONFIG = {
  enabled: false,
  // No From Address choice here (deliberately — see HolidayRequestsPanelBody's
  // own comment for why, and how to restore it): recipients, the optional
  // note, and enabled state are the only configurable pieces.
  recipients: [],
  // Appended below the fixed subject/body, not merged into them — an office
  // can add local context (an escalation contact, their own response-time
  // expectation) without any way to edit away the actionable core (status/
  // dates/amount) the fixed template always includes.
  note: '',
}

// ─── Communications edit-panel pieces ──────────────────────────
// Shared by every comms block (the 4 real ones + Holiday requests) — each
// draft object keeps source/customAddress/verified/verifying at its own
// top level (even Holiday requests', alongside its extra enabled/recipients
// fields), so this one field can stay genuinely shared via a flat onPatch.

function EmailFromAddressField({ value, onPatch, onVerify }) {
  const { source, customAddress, verified, verifying } = value
  const [touched, setTouched] = useState(false)
  const addressInvalid = customAddress.trim() !== '' && !isValidEmail(customAddress)

  return (
    <div className="comms-panel-block">
      <h3 className="comms-panel-heading">Email From Address</h3>
      <p className="comms-panel-desc">Choose the From Address when sending these emails</p>
      <div className="comms-radio-row">
        <label className="comms-radio-option">
          <input type="radio" checked={source === 'pass'} onChange={() => onPatch({ source: 'pass' })} />
          PASS email address
        </label>
        <label className="comms-radio-option">
          <input type="radio" checked={source === 'custom'} onChange={() => onPatch({ source: 'custom' })} />
          Custom email address
        </label>
      </div>

      {source === 'custom' && (
        verified ? (
          <div className="comms-verified-block">
            <span className="comms-field-label">From Address</span>
            <div className="comms-verified-address">{customAddress}</div>
            <div className="comms-verified-status">Verification status: <strong>Verified</strong></div>
            <button type="button" className="comms-link-btn" onClick={() => onPatch({ verified: false })}>Change address</button>
          </div>
        ) : (
          <>
            <div className="cs-field-group">
              <label className="cs-field-label">* From Address</label>
              <div className="comms-from-input-row">
                <input
                  type="email"
                  className={`form-input${touched && addressInvalid ? ' comms-input-invalid' : ''}`}
                  value={customAddress}
                  placeholder="name@example.com"
                  onChange={e => onPatch({ customAddress: e.target.value })}
                  onBlur={() => setTouched(true)}
                />
                <button
                  type="button"
                  className="round-btn secondary-btn"
                  disabled={!customAddress.trim() || addressInvalid || verifying}
                  onClick={onVerify}
                >
                  {verifying ? 'Verifying…' : 'Verify'}
                </button>
              </div>
              {touched && addressInvalid && (
                <p className="comms-field-error">Enter a valid email address</p>
              )}
            </div>
            <div className="warning-banner orange">
              <WarningIcon />
              <div><p>This address must be verified before it can be used as the From Address</p></div>
            </div>
          </>
        )
      )}
    </div>
  )
}

function MailTagsBox({ tags }) {
  return (
    <div className="comms-tags-box">
      <p>In the following fields, you can use these mail-tags:</p>
      <div className="comms-tags-list">{tags.map(t => `[${t}]`).join(' ')}</div>
    </div>
  )
}

function CommsPanelBody({ block, draft, onPatch, onVerify }) {
  return (
    <>
      <EmailFromAddressField value={draft} onPatch={onPatch} onVerify={onVerify} />
      <div className="comms-panel-block">
        <h3 className="comms-panel-heading">Email content</h3>
        <MailTagsBox tags={block.tags} />
        <div className="cs-field-group">
          <label className="cs-field-label">* Email subject</label>
          <input className="form-input comms-field-narrow" value={draft.subject} onChange={e => onPatch({ subject: e.target.value })} />
        </div>
        <div className="cs-field-group">
          <label className="cs-field-label">* Email body</label>
          <textarea className="form-input comms-textarea" rows={8} value={draft.body} onChange={e => onPatch({ body: e.target.value })} />
        </div>
      </div>
    </>
  )
}

function HolidayRequestsPanelBody({ draft, onPatch, recipientInput, setRecipientInput, onAddRecipient, onRemoveRecipient, onVerifyRecipient }) {
  const [recipientTouched, setRecipientTouched] = useState(false)
  const recipientInvalid = recipientInput.trim() !== '' && !isValidEmail(recipientInput)
  // Hidden by default — nothing here is editable, so it's a check-if-you-
  // want-to reference rather than something that needs to stay in view.
  const [previewOpen, setPreviewOpen] = useState(false)
  // Which of the two body variants the preview is currently showing — the
  // real email sent depends on the requesting employee's own scheme, not
  // on anything configured here, so the preview lets you check either.
  const [previewScheme, setPreviewScheme] = useState('days')

  const handleAdd = () => {
    if (!isValidEmail(recipientInput)) { setRecipientTouched(true); return }
    onAddRecipient()
    setRecipientTouched(false)
  }

  return (
    <>
      <div className="comms-panel-block">
        <h3 className="comms-panel-heading">Enable holiday request notifications</h3>
        <p className="comms-panel-desc">When enabled, an email is sent to the recipients below whenever an employee submits or cancels a holiday request.</p>
        <SegmentedToggle
          options={[{ value: false, label: 'Disabled' }, { value: true, label: 'Enabled', tone: 'green' }]}
          value={draft.enabled}
          onChange={v => onPatch({ enabled: v })}
        />
      </div>

      {draft.enabled && (
        <>
          {/* From Address deliberately parked, not deleted — Ben wants to
              discuss with product whether this block should get the same
              PASS/Custom choice the 4 real blocks have. Restoring it is just
              re-adding <EmailFromAddressField value={draft} onPatch={onPatch}
              onVerify={...} /> here, exactly as CommsPanelBody above already
              does — the shared component and its verify plumbing are
              untouched. */}

          <div className="comms-panel-block">
            <h3 className="comms-panel-heading">Recipients</h3>
            <p className="comms-panel-desc">Add the email addresses of the coordinators who should receive these notifications. Recipients aren't required to be existing PASS users.</p>
            <div className="comms-recipients-list">
              <div className="comms-from-input-row">
                <input
                  type="email"
                  className={`form-input${recipientTouched && recipientInvalid ? ' comms-input-invalid' : ''}`}
                  placeholder="name@example.com"
                  value={recipientInput}
                  onChange={e => setRecipientInput(e.target.value)}
                  onBlur={() => setRecipientTouched(true)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } }}
                />
                <button type="button" className="round-btn secondary-btn" disabled={!recipientInput.trim() || recipientInvalid} onClick={handleAdd}>Add</button>
              </div>
              {recipientTouched && recipientInvalid && (
                <p className="comms-field-error">Enter a valid email address</p>
              )}

              {draft.recipients.length === 0 && (
                <p className="settings-value-empty comms-recipients-empty">No recipients added yet.</p>
              )}

              {draft.recipients.map(r => (
                <div key={r.id} className="comms-recipient-row">
                  <div className="comms-recipient-info">
                    <span className="comms-recipient-email">{r.email}</span>
                    <span className={`comms-recipient-status comms-recipient-status--${r.verified ? 'verified' : 'unverified'}`}>
                      {r.verified ? 'Verified' : 'Not verified'}
                    </span>
                  </div>
                  <div className="comms-recipient-action">
                    {!r.verified && (
                      <button type="button" className="round-btn secondary-btn comms-verify-btn" disabled={r.verifying} onClick={() => onVerifyRecipient(r.id)}>
                        {r.verifying ? 'Verifying…' : 'Verify'}
                      </button>
                    )}
                  </div>
                  <button type="button" className="cs-remove-btn" onClick={() => onRemoveRecipient(r.id)} title={`Remove ${r.email}`}>
                    <RemoveIcon />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="comms-panel-block">
            <h3 className="comms-panel-heading">Email content</h3>
            <button type="button" className="comms-link-btn comms-preview-toggle" onClick={() => setPreviewOpen(o => !o)}>
              {previewOpen ? 'Hide preview' : 'Preview email content'}
            </button>
            {previewOpen && (
              <>
                <p className="comms-panel-desc">The wording below adapts to the requesting employee's own holiday scheme — preview either.</p>
                <SegmentedToggle
                  options={[{ value: 'days', label: 'Days scheme' }, { value: 'hours', label: 'Hours scheme' }]}
                  value={previewScheme}
                  onChange={setPreviewScheme}
                />
                <div className="comms-preview-box">
                  <div className="comms-preview-label">Subject</div>
                  <div className="comms-preview-subject">{HOLIDAY_FIXED_SUBJECT}</div>
                  <div className="comms-preview-label">Message</div>
                  <div className="comms-preview-body">{previewScheme === 'days' ? HOLIDAY_FIXED_BODY_DAYS : HOLIDAY_FIXED_BODY_HOURS}</div>
                </div>
              </>
            )}

            <div className="cs-field-group">
              <label className="cs-field-label">Note from your organisation <span className="comms-optional">(optional)</span></label>
              <p className="comms-panel-desc">Appended to the email below the details above — use this for anything specific to your organisation, like an escalation contact or your own response-time expectation.</p>
              <textarea
                className="form-input comms-textarea comms-note-textarea"
                rows={4}
                placeholder="e.g. Please action within 48 hours. Questions? Contact rota@example.com."
                value={draft.note}
                onChange={e => onPatch({ note: e.target.value })}
              />
            </div>
          </div>
        </>
      )}
    </>
  )
}

// ─── App ──────────────────────────────────────────────────────

export default function App() {
  const pageRef = useRef(null)

  // ─── Communications: the 4 real blocks + Holiday requests ──────
  // `activePanel` is one of a COMMS_BLOCKS key, 'holiday-requests', or null.
  const [commsConfigs, setCommsConfigs] = useState(INITIAL_COMMS_CONFIGS)
  const [holidayConfig, setHolidayConfig] = useState(INITIAL_HOLIDAY_CONFIG)
  const [activePanel, setActivePanel] = useState(null)
  const [commsDraft, setCommsDraft] = useState(null)
  const [holidayDraft, setHolidayDraft] = useState(null)
  const [recipientInput, setRecipientInput] = useState('')

  const openCommsPanel = (key) => {
    setCommsDraft({ ...commsConfigs[key] })
    setActivePanel(key)
  }

  const openHolidayPanel = () => {
    setHolidayDraft({ ...holidayConfig, recipients: holidayConfig.recipients.map(r => ({ ...r })) })
    setRecipientInput('')
    setActivePanel('holiday-requests')
  }

  const closeCommsPanel = () => {
    setActivePanel(null)
    setCommsDraft(null)
    setHolidayDraft(null)
  }

  const saveCommsPanel = () => {
    setCommsConfigs(prev => ({ ...prev, [activePanel]: commsDraft }))
    closeCommsPanel()
  }

  const saveHolidayPanel = () => {
    setHolidayConfig(holidayDraft)
    closeCommsPanel()
  }

  const patchCommsDraft = (partial) => setCommsDraft(d => d && ({ ...d, ...partial }))
  const patchHolidayDraft = (partial) => setHolidayDraft(d => d && ({ ...d, ...partial }))

  // Verify is simulated — no real address to actually confirm in a
  // prototype, so this just demonstrates the same pending→verified
  // transition shown in the real product's own screenshots.
  const verifyCommsAddress = () => {
    setCommsDraft(d => d && ({ ...d, verifying: true }))
    setTimeout(() => setCommsDraft(d => d && ({ ...d, verifying: false, verified: true })), 900)
  }

  const addRecipient = () => {
    const email = recipientInput.trim()
    if (!email) return
    setHolidayDraft(d => d && ({ ...d, recipients: [...d.recipients, { id: Date.now(), email, verified: false, verifying: false }] }))
    setRecipientInput('')
  }

  const removeRecipient = (id) =>
    setHolidayDraft(d => d && ({ ...d, recipients: d.recipients.filter(r => r.id !== id) }))

  const verifyRecipient = (id) => {
    setHolidayDraft(d => d && ({ ...d, recipients: d.recipients.map(r => r.id === id ? { ...r, verifying: true } : r) }))
    setTimeout(() => {
      setHolidayDraft(d => d && ({ ...d, recipients: d.recipients.map(r => r.id === id ? { ...r, verifying: false, verified: true } : r) }))
    }, 900)
  }

  // Save requires the From Address to actually be verified when Custom is
  // chosen (matching the real product's own hard requirement) — for
  // Holiday requests specifically, only while Enabled, alongside at least
  // one fully-verified recipient.
  const commsCanSave = !!commsDraft
    && (commsDraft.source === 'pass' || commsDraft.verified)
    && commsDraft.subject.trim() !== '' && commsDraft.body.trim() !== ''

  // Subject/body are fixed, not draft fields — nothing to validate there.
  // The note is optional, so it's never part of this check either.
  const holidayCanSave = !!holidayDraft && (
    !holidayDraft.enabled || (
      holidayDraft.recipients.length > 0
      && holidayDraft.recipients.every(r => r.verified)
    )
  )

  const activeCommsBlock = activePanel && activePanel !== 'holiday-requests'
    ? COMMS_BLOCKS.find(b => b.key === activePanel)
    : null

  return (
    <>
      <DevToolbar>
        <DevEdit containerRef={pageRef} prototypeId={window.location.pathname} />
        <DevMode containerRef={pageRef} />
        <DevComments containerRef={pageRef} prototypeId={window.location.pathname} />
        <WireframeToggle />
        <AuditCapture containerRef={pageRef} />
      </DevToolbar>
      <div className="settings-page" ref={pageRef}>
      <a href="../../" className="back-link">
        <ChevronLeftIcon /> Prototypes
      </a>
      <SideNav activeItem="office" />

      <div className="page-body">
      <TopNav />
      <OfficeNav active="roster-settings" />

      <div className="settings-layout">

        {/* Settings sidebar */}
        <aside className="settings-sidebar">
          <ul className="settings-nav-list">
            {NAV_ITEMS.map(({ key, label, Icon }) => (
              <li key={key}>
                <a
                  href="#"
                  className={`settings-nav-item${key === 'communications' ? ' active' : ''}`}
                  onClick={e => e.preventDefault()}
                >
                  <Icon />
                  <span>{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main content */}
        <main className="settings-content">
          <div className="settings-section">
            <div className="settings-section-header">
              <div className="settings-section-icon-title">
                <CommunicationsIcon size={32} />
                <h2 className="settings-section-title">Communications</h2>
              </div>
            </div>

            {COMMS_BLOCKS.map(block => {
              const cfg = commsConfigs[block.key]
              return (
                <div className="settings-subsection" key={block.key}>
                  <div className="settings-subsection-header">
                    <div>
                      <h3 className="settings-subsection-title">{block.title}</h3>
                      <p className="settings-subsection-desc">{block.description}</p>
                    </div>
                    <button className="settings-edit-btn" onClick={() => openCommsPanel(block.key)} title="Edit">
                      <EditIcon />
                    </button>
                  </div>
                  <div className="comms-summary-row">
                    <span className="comms-summary-label">From address</span>
                    <span className="comms-summary-value">{cfg.source === 'pass' ? 'PASS email address' : cfg.customAddress}</span>
                  </div>
                  <div className="comms-summary-row">
                    <span className="comms-summary-label">Email subject and body</span>
                    <span className="comms-summary-value comms-configured">Configured</span>
                  </div>
                </div>
              )
            })}

            <div className="settings-subsection">
              <div className="settings-subsection-header">
                <div>
                  <h3 className="settings-subsection-title">Holiday requests</h3>
                  <p className="settings-subsection-desc">Define who should be notified by email when an employee submits or cancels a holiday request.</p>
                </div>
                <button className="settings-edit-btn" onClick={openHolidayPanel} title="Edit">
                  <EditIcon />
                </button>
              </div>
              <div className="comms-summary-row">
                <span className="comms-summary-label">Status</span>
                <span className={`comms-summary-value${holidayConfig.enabled ? ' comms-configured' : ''}`}>
                  {holidayConfig.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              {holidayConfig.enabled && (
                <>
                  <div className="comms-summary-row">
                    <span className="comms-summary-label">Recipients</span>
                    <span className="comms-summary-value">
                      {holidayConfig.recipients.length > 0
                        ? holidayConfig.recipients.map(r => r.email).join(', ')
                        : <span className="settings-value-empty">None added</span>}
                    </span>
                  </div>
                  <div className="comms-summary-row">
                    <span className="comms-summary-label">Note from your organisation</span>
                    <span className="comms-summary-value">
                      {holidayConfig.note.trim() ? holidayConfig.note : <span className="settings-value-empty">None added</span>}
                    </span>
                  </div>
                </>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* Communications / Holiday requests edit panel — one shared panel
          for whichever block's own pencil was clicked */}
      <SlidePanel
        open={activePanel !== null}
        onClose={closeCommsPanel}
        title={activePanel === 'holiday-requests' ? 'Holiday request communications' : activeCommsBlock ? `${activeCommsBlock.title} communications` : ''}
        footer={
          <>
            <button className="round-btn tertiary-btn" onClick={closeCommsPanel}>Cancel</button>
            <button
              className="round-btn primary-btn"
              disabled={activePanel === 'holiday-requests' ? !holidayCanSave : !commsCanSave}
              onClick={activePanel === 'holiday-requests' ? saveHolidayPanel : saveCommsPanel}
            >
              Save changes
            </button>
          </>
        }
      >
        {activePanel === 'holiday-requests' && holidayDraft && (
          <HolidayRequestsPanelBody
            draft={holidayDraft}
            onPatch={patchHolidayDraft}
            recipientInput={recipientInput}
            setRecipientInput={setRecipientInput}
            onAddRecipient={addRecipient}
            onRemoveRecipient={removeRecipient}
            onVerifyRecipient={verifyRecipient}
          />
        )}
        {activeCommsBlock && commsDraft && (
          <CommsPanelBody block={activeCommsBlock} draft={commsDraft} onPatch={patchCommsDraft} onVerify={verifyCommsAddress} />
        )}
      </SlidePanel>
      </div>
      </div>
    </>
  )
}
