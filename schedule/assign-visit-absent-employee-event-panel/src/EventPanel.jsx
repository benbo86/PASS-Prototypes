import { useState, useEffect, useRef } from 'react'
import DevMode from '../../../Components/DevMode'
import DevComments from '../../../Components/DevComments'

// ── Icons (all 24×24 unless noted) ───────────────────────────────────────────

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <polygon fill="currentColor" stroke="currentColor" strokeLinejoin="round"
      points="18 7.2 16.8 6 12 10.8 7.2 6 6 7.2 10.8 12 6 16.8 7.2 18 12 13.2 16.8 18 18 16.8 13.2 12" />
  </svg>
)

const EditIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M5.001 16.246v2.364c0 .218.171.389.39.389h2.364c.1 0 .201-.04.271-.117l8.493-8.485-2.916-2.916-8.484 8.485c-.078.077-.117.17-.117.28zm13.773-7.849a.996.996 0 000-1.414L16.954 5.163a.996.996 0 00-1.414 0l-1.423 1.423 2.916 2.916 1.74-1.705z" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <polygon fill="currentColor" points="16.6 8.6 12 13.2 7.4 8.6 6 10 12 16 18 10" />
  </svg>
)

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <polygon fill="currentColor" points="15.4 7.4 14 6 8 12 14 18 15.4 16.6 10.8 12" />
  </svg>
)

const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z" />
  </svg>
)

const CarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
  </svg>
)

const RecurIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" fill="currentColor" d="M19.0724 12.2816C19.4735 12.1034 19.9436 12.284 20.1217 12.6853C21.0674 14.8134 20.6238 17.243 18.9916 18.8745C17.9288 19.9375 16.5287 20.4965 15.0942 20.4965C14.3645 20.4965 13.6269 20.35 12.9196 20.0537L13.1458 21.1382C13.2263 21.5254 12.9777 21.9043 12.5908 21.9851C12.5417 21.9949 12.4925 22 12.4443 22C12.1123 22 11.8146 21.7679 11.7442 21.4301L11.253 19.0716C11.1973 18.8053 11.2978 18.5305 11.5119 18.3627L13.4015 16.8804C13.7125 16.6362 14.1625 16.6907 14.4065 17.0017C14.6507 17.3129 14.5962 17.7627 14.2852 18.0067L13.5413 18.59C15.0397 19.2136 16.7271 18.8906 17.8671 17.7507C19.0302 16.5878 19.3448 14.8527 18.6686 13.3309C18.4902 12.9295 18.671 12.4597 19.0724 12.2816ZM17.6566 7.94832C18.0445 7.8678 18.423 8.11633 18.5035 8.50299L18.995 10.8615C19.0504 11.1281 18.9502 11.4029 18.7361 11.5707L16.8469 13.0527C16.7158 13.1556 16.5603 13.2055 16.4056 13.2055C16.1932 13.2055 15.9832 13.1113 15.842 12.9314C15.5978 12.6202 15.6523 12.1704 15.9632 11.9265L16.7086 11.3417L16.6647 11.3272C15.1434 10.6503 13.4075 10.9649 12.2437 12.1282C11.0804 13.2923 10.766 15.0272 11.4429 16.5475C11.6215 16.9487 11.4412 17.4187 11.0399 17.5973C10.935 17.6441 10.8251 17.6663 10.7171 17.6663C10.4124 17.6663 10.1219 17.4906 9.99032 17.1945C9.04345 15.0677 9.48651 12.6378 11.1192 11.004C12.7536 9.37103 15.1834 8.92797 17.311 9.8746L17.3288 9.88473L17.1017 8.79515C17.0212 8.40801 17.2698 8.02883 17.6566 7.94832ZM7.39004 2C7.8061 2 8.14575 2.34037 8.14575 2.75547V3.36872H12.6981V2.75547C12.6981 2.34061 13.0378 2 13.4538 2H14.0111C14.4262 2 14.7669 2.34037 14.7669 2.75547V3.36872H16.6285C17.0844 3.36872 17.4571 3.74067 17.4571 4.19651V6.93347H16.2156L4.62849 6.93178V16.0358H8.1026V17.4385H4.21508C3.75996 17.4385 3.38729 17.0658 3.38729 16.61V4.19651C3.38729 3.74067 3.76021 3.36872 4.21508 3.36872H6.077V2.75547C6.077 2.34061 6.41762 2 6.83272 2H7.39004Z" />
  </svg>
)

const PersonIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="var(--ui-purple-3-grape-grey)"
      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
)

const EllipsisCircleIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="15" fill="none" stroke="var(--ui-purple-5-languid-lavendar)" strokeWidth="1.5" />
    <circle cx="10" cy="16" r="2" fill="#4d4d4d" />
    <circle cx="16" cy="16" r="2" fill="#4d4d4d" />
    <circle cx="22" cy="16" r="2" fill="#4d4d4d" />
  </svg>
)

const WarningIcon = () => (
  <svg className="warning-icon" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M10.27,3.99 C11.04,2.66 12.96,2.66 13.73,3.99 L21.26,17 C22.03,18.33 21.07,20 19.53,20 L4.47,20 C2.93,20 1.97,18.33 2.74,17 Z M12,15 C11.45,15 11,15.45 11,16 C11,16.55 11.45,17 12,17 C12.55,17 13,16.55 13,16 C13,15.45 12.55,15 12,15 Z M12,7 C11.45,7 11,7.45 11,8 L11,12 C11,12.55 11.45,13 12,13 C12.55,13 13,12.55 13,12 L13,8 C13,7.45 12.55,7 12,7 Z" />
  </svg>
)

const DocumentIcon = ({ size = 24 }) => {
  // Path content is 13.8645×18. Figma insets it 12.5% top/bottom and ~21% left/right
  // so we shift the viewBox origin to include that padding.
  const pad = size * 0.2133
  const padV = size * 0.125
  return (
    <svg width={size} height={size} viewBox={`${-pad} ${-padV} ${size} ${size}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M8.10373 0C8.60602 0 9.08992 0.189001 9.45925 0.529434L13.22 3.99599C13.6308 4.37464 13.8645 4.90786 13.8645 5.46655V14.6896C13.8645 16.5169 12.3773 17.9986 10.5417 18H3.32534C1.48881 18 0 16.5179 0 14.6896V3.31042C0 1.48212 1.48881 0 3.32534 0H8.10373ZM7.94685 1.98153H3.41796C2.58954 1.98153 1.91796 2.6531 1.91796 3.48153V14.5127C1.91796 15.3411 2.58954 16.0127 3.41796 16.0127H10.4075C11.2359 16.0127 11.9075 15.3411 11.9075 14.5127V6.06202H9.73742C8.74852 6.06202 7.94685 5.26395 7.94685 4.27948V1.98153ZM6.88131 10.5C7.43359 10.5 7.88131 10.9477 7.88131 11.5C7.88131 12.0523 7.43359 12.5 6.88131 12.5H3.88131C3.32902 12.5 2.88131 12.0523 2.88131 11.5C2.88131 10.9477 3.32902 10.5 3.88131 10.5H6.88131ZM9.88131 7.5C10.4336 7.5 10.8813 7.94772 10.8813 8.5C10.8813 9.05228 10.4336 9.5 9.88131 9.5H3.88131C3.32902 9.5 2.88131 9.05228 2.88131 8.5C2.88131 7.94772 3.32902 7.5 3.88131 7.5H9.88131Z" />
    </svg>
  )
}

const DeleteIcon = () => (
  <svg width="24" height="24" viewBox="-4 -3 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M3 18C2.45 18 1.97917 17.8042 1.5875 17.4125C1.19583 17.0208 1 16.55 1 16V3H0V1H5V0H11V1H16V3H15V16C15 16.55 14.8042 17.0208 14.4125 17.4125C14.0208 17.8042 13.55 18 13 18H3ZM13 3H3V16H13V3ZM5 14H7V5H5V14ZM9 14H11V5H9V14Z" />
  </svg>
)

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDisplayDate = (iso) => {
  const d = new Date(iso + 'T12:00:00')
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const day = d.getDate()
  const s = [11, 12, 13].includes(day) ? 'th' : (['st', 'nd', 'rd'][(day % 10) - 1] || 'th')
  return `${days[d.getDay()]} ${day}${s} ${months[d.getMonth()]}`
}

const calcDuration = (start, end) => {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const total = (eh * 60 + em) - (sh * 60 + sm)
  if (total <= 0) return '0m'
  const h = Math.floor(total / 60)
  const m = total % 60
  return h > 0 ? `${h}hr ${m.toString().padStart(2, '0')}m` : `${m}m`
}

const formatNoteDate = (date) => {
  const d = date.getDate().toString().padStart(2, '0')
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const y = date.getFullYear()
  const h = date.getHours().toString().padStart(2, '0')
  const min = date.getMinutes().toString().padStart(2, '0')
  return `${d}/${m}/${y} ${h}:${min}`
}

// ── Data ──────────────────────────────────────────────────────────────────────

const CUSTOMER_PORTRAIT = 'https://www.figma.com/api/mcp/asset/c836424c-78f6-40fe-a96c-5526bcc2f9f9'

const TABS = ['Assigned Today', 'Recurring Employees', 'Care Required', 'History', 'Customer Details']

const EMPLOYEES = [
  {
    id: 1, name: 'Katheryn Perry', title: 'Mrs', type: 'Fulltime',
    visited: '66 in last 30d', travel: '1.2 miles', fill: 68,
    avatarBg: 'var(--availability-3-green-tint)',
    onHoliday: true,
  },
  {
    id: 2, name: 'Sarah Mitchell', title: 'Ms', type: 'Part time',
    visited: '42 in last 30d', travel: '0.8 miles', fill: 45,
    avatarBg: 'var(--availability-4-blue-tint)',
  },
  {
    id: 3, name: 'James Thornton', title: 'Mr', type: 'Variable',
    visited: '31 in last 30d', travel: '2.1 miles', fill: 30,
    avatarBg: 'var(--availability-6-mauve-tint)',
  },
]

const TOTAL_SLOTS = 2
const PLANNED_START = '12:00'
const PLANNED_END = '13:00'

// ── Sub-components ────────────────────────────────────────────────────────────

function BookedBadge() {
  return (
    <div className="ep-booked-badge">
      <div className="ep-booked-badge__stripe" />
      <span>Booked</span>
    </div>
  )
}

function InitialsAvatar({ name, bg }) {
  const initials = name.split(' ').map(n => n[0]).join('')
  return (
    <div className="ep-avatar ep-avatar--initials" style={{ background: bg }}>
      {initials}
    </div>
  )
}

function AvailabilityIndicator({ fill }) {
  return (
    <div className="ep-indicator">
      <div className="ep-indicator__fill" style={{ width: `${fill}%` }} />
    </div>
  )
}

function EmployeeStats({ employee }) {
  return (
    <div className="ep-bar__stats">
      <div className="ep-stat">
        <span className="ep-stat__label">Type</span>
        <span className="ep-stat__value">{employee.type}</span>
      </div>
      <div className="ep-stat">
        <span className="ep-stat__label">Visited</span>
        <span className="ep-stat__value">{employee.visited}</span>
      </div>
      <div className="ep-stat">
        <span className="ep-stat__label">Travel</span>
        <span className="ep-stat__value ep-stat__value--travel">
          <CarIcon /> {employee.travel}
        </span>
      </div>
    </div>
  )
}

function UnassignedBar({ slotNumber }) {
  return (
    <div className="ep-bar ep-bar--unassigned">
      <div className="ep-avatar ep-avatar--placeholder">
        <PersonIcon />
      </div>
      <p className="ep-bar__name">Employee {slotNumber}</p>
    </div>
  )
}

function FilledSlotBar({ employee, slotIndex, menuOpen, onMenuToggle, onUnassign }) {
  return (
    <div className="ep-bar ep-bar--filled">
      <InitialsAvatar name={employee.name} bg={employee.avatarBg} />
      <div className="ep-bar__info">
        <p className="ep-bar__title">{employee.title}</p>
        <p className="ep-bar__name">{employee.name}</p>
        <AvailabilityIndicator fill={employee.fill} />
      </div>
      <EmployeeStats employee={employee} />
      <div className="ep-slot-action">
        <button
          className="ep-ellipsis-btn"
          aria-label="More options"
          onClick={e => { e.stopPropagation(); onMenuToggle(slotIndex) }}
        >
          <EllipsisCircleIcon />
        </button>
        {menuOpen && (
          <div className="ep-slot-menu">
            <button
              className="ep-slot-menu__item"
              onClick={e => { e.stopPropagation(); onUnassign(slotIndex) }}
            >
              Unassign
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function AssignBar({ employee, onAssign, disabled }) {
  return (
    <div className="ep-bar ep-bar--assign">
      <InitialsAvatar name={employee.name} bg={employee.avatarBg} />
      <div className="ep-bar__info">
        <p className="ep-bar__title">{employee.title}</p>
        <p className="ep-bar__name">{employee.name}</p>
        <AvailabilityIndicator fill={employee.fill} />
      </div>
      <EmployeeStats employee={employee} />
      {employee.onHoliday && <span className="ep-holiday-badge">On holiday</span>}
      <button
        className="round-btn secondary-btn btn-icon-left ep-bar__cta"
        onClick={() => onAssign(employee)}
        disabled={disabled}
      >
        <PlusIcon /> Add
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function EventPanel() {
  const pageRef = useRef(null)
  const [activeTab, setActiveTab] = useState('Assigned Today')
  const [slots, setSlots] = useState(Array(TOTAL_SLOTS).fill(null))
  const [openMenu, setOpenMenu] = useState(null)

  // Date / time editing
  const [visitDateISO, setVisitDateISO] = useState('2024-09-26')
  const [visitStart, setVisitStart] = useState(PLANNED_START)
  const [visitEnd, setVisitEnd] = useState(PLANNED_END)
  const [editingDate, setEditingDate] = useState(false)
  const [editingTime, setEditingTime] = useState(false)

  // Holiday warning
  const [showWarning, setShowWarning] = useState(false)

  // Visit note
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [draftText, setDraftText] = useState('')
  const [savedNote, setSavedNote] = useState(null)
  const [editingNote, setEditingNote] = useState(false)

  const handleSaveNote = () => {
    setSavedNote({ text: draftText.trim(), savedAt: new Date() })
    setDraftText('')
    setShowNoteInput(false)
    setEditingNote(false)
  }

  const handleEditNote = () => {
    setDraftText(savedNote.text)
    setEditingNote(true)
  }

  const handleDeleteNote = () => {
    setSavedNote(null)
    setEditingNote(false)
    setDraftText('')
  }

  const handleNoteBtnClick = () => {
    if (savedNote) return
    setShowNoteInput(prev => !prev)
    setDraftText('')
  }

  const assignedCount = slots.filter(Boolean).length
  const allFilled = assignedCount === TOTAL_SLOTS

  const assignEmployee = (employee) => {
    const firstEmpty = slots.findIndex(s => s === null)
    if (firstEmpty === -1) return
    setSlots(prev => prev.map((s, i) => i === firstEmpty ? employee : s))
  }

  const unassignEmployee = (slotIndex) => {
    setSlots(prev => prev.map((s, i) => i === slotIndex ? null : s))
    setOpenMenu(null)
  }

  const toggleMenu = (slotIndex) => {
    setOpenMenu(prev => prev === slotIndex ? null : slotIndex)
  }

  const handleSave = () => {
    const hasHolidayEmployee = slots.some(s => s && s.onHoliday)
    if (hasHolidayEmployee) {
      setShowWarning(true)
    }
    // Would save and close in real app if no warning
  }

  const handleAssignAnyway = () => {
    setShowWarning(false)
    // Would save and close in real app
  }

  // Close slot menu on click outside
  useEffect(() => {
    if (openMenu === null) return
    const close = () => setOpenMenu(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [openMenu])

  // Close edit popovers on click outside
  useEffect(() => {
    if (!editingDate && !editingTime) return
    const close = () => { setEditingDate(false); setEditingTime(false) }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [editingDate, editingTime])

  const holidayNames = slots
    .filter(s => s && s.onHoliday)
    .map(s => s.name)
    .join(' and ')

  return (
    <div ref={pageRef} style={{ display: 'contents' }}>
      <a href="../../" className="back-link ep-back-link">
        <ChevronLeftIcon /> Prototypes
      </a>

      <div className="ep-scrim" />

      <div className="ep-panel" role="dialog" aria-modal="true" aria-label="Event panel">

        {/* ── Header ── */}
        <div className="ep-header">
          <div className="ep-header__top">
            <div className="ep-header__title-row">
              <h1 className="ep-header__title">Lunchtime visit with Mr David Farrington</h1>
              <BookedBadge />
            </div>
            <button className="ep-close-btn" aria-label="Close panel">
              <CloseIcon />
            </button>
          </div>

          <div className="ep-header__details">
            <img
              src={CUSTOMER_PORTRAIT}
              alt="Mr David Farrington"
              className="ep-avatar ep-avatar--customer"
            />
            <div className="ep-header__meta">
              <div className="ep-header__meta-row">
                <div className="ep-header__name-group">
                  <span className="ep-header__meta-label">Customer</span>
                  <strong className="ep-header__meta-name">Mr David Farrington</strong>
                </div>

                <span>Care visit</span>

                {/* Editable date */}
                {editingDate ? (
                  <div className="ep-inline-edit" onClick={e => e.stopPropagation()}>
                    <input
                      type="date"
                      className="ep-edit-input"
                      value={visitDateISO}
                      onChange={e => setVisitDateISO(e.target.value)}
                      autoFocus
                    />
                    <button className="ep-edit-done" onClick={() => setEditingDate(false)}>Done</button>
                  </div>
                ) : (
                  <span className="ep-inline-row">
                    {formatDisplayDate(visitDateISO)}
                    <button
                      className="ep-icon-btn"
                      onClick={e => { e.stopPropagation(); setEditingDate(true); setEditingTime(false) }}
                    >
                      <EditIcon />
                    </button>
                  </span>
                )}

                {/* Editable time */}
                <div className="ep-time-col">
                  <span className="ep-planned">
                    Planned time: <s>{PLANNED_START} - {PLANNED_END}</s>
                  </span>
                  {editingTime ? (
                    <div className="ep-inline-edit" onClick={e => e.stopPropagation()}>
                      <input
                        type="time"
                        className="ep-edit-input ep-edit-input--time"
                        value={visitStart}
                        onChange={e => setVisitStart(e.target.value)}
                        autoFocus
                      />
                      <span>–</span>
                      <input
                        type="time"
                        className="ep-edit-input ep-edit-input--time"
                        value={visitEnd}
                        onChange={e => setVisitEnd(e.target.value)}
                      />
                      <button className="ep-edit-done" onClick={() => setEditingTime(false)}>Done</button>
                    </div>
                  ) : (
                    <span className="ep-inline-row">
                      {visitStart} - {visitEnd}{' '}
                      <span className="ep-duration">({calcDuration(visitStart, visitEnd)})</span>
                      <button
                        className="ep-icon-btn"
                        onClick={e => { e.stopPropagation(); setEditingTime(true); setEditingDate(false) }}
                      >
                        <EditIcon />
                      </button>
                    </span>
                  )}
                </div>

                <span className="ep-recurrence">
                  <RecurIcon /> 10 days, bi-weekly <ChevronDownIcon />
                </span>

                <button
                  className={`ep-note-btn${savedNote ? ' ep-note-btn--has-note' : ''}${showNoteInput ? ' ep-note-btn--active' : ''}`}
                  onClick={handleNoteBtnClick}
                >
                  <DocumentIcon size={16} /> Visit note
                </button>
              </div>
            </div>
          </div>

          {/* ── Note input / saved note ── */}
          {(showNoteInput || editingNote || savedNote) && (
            <div className="ep-note-area">
              {savedNote && !editingNote ? (
                <div className="ep-note-saved">
                  <span className="ep-note-saved__icon"><DocumentIcon size={24} /></span>
                  <div className="ep-note-saved__content">
                    <span className="ep-note-saved__label">Visit note</span>
                    <span className="ep-note-saved__text">{savedNote.text}</span>
                  </div>
                  <div className="ep-note-saved__meta">
                    <span className="ep-note-saved__updated">Updated by admin</span>
                    <span className="ep-note-saved__date">{formatNoteDate(savedNote.savedAt)}</span>
                  </div>
                  <div className="ep-note-saved__actions">
                    <button className="ep-note-action-btn" onClick={handleEditNote} aria-label="Edit note">
                      <EditIcon />
                    </button>
                    <button className="ep-note-action-btn" onClick={handleDeleteNote} aria-label="Delete note">
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <textarea
                    className="form-textarea ep-note-textarea"
                    placeholder="Add a visit note…"
                    value={draftText}
                    onChange={e => setDraftText(e.target.value)}
                    autoFocus
                  />
                  <div className="ep-note-btns">
                    <button
                      className="round-btn tertiary-btn"
                      onClick={() => { setShowNoteInput(false); setEditingNote(false); setDraftText('') }}
                    >
                      Cancel
                    </button>
                    <button
                      className="round-btn primary-btn"
                      disabled={!draftText.trim()}
                      onClick={handleSaveNote}
                    >
                      Save note
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="ep-tabs" role="tablist">
            {TABS.map(tab => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                className={`ep-tab${activeTab === tab ? ' ep-tab--active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="ep-body">
          {activeTab === 'Assigned Today' && (
            <>
              <h2 className='ep-section-title'>
                {TOTAL_SLOTS} Employees required{' '}
                <span className="ep-section-count">({assignedCount}/{TOTAL_SLOTS} assigned)</span>
              </h2>
              <div className="ep-bars">
                {slots.map((employee, i) =>
                  employee
                    ? <FilledSlotBar
                        key={i}
                        employee={employee}
                        slotIndex={i}
                        menuOpen={openMenu === i}
                        onMenuToggle={toggleMenu}
                        onUnassign={unassignEmployee}
                      />
                    : <UnassignedBar key={i} slotNumber={i + 1} />
                )}
              </div>

              <h2 className="ep-section-title">Recommended</h2>
              <div className="ep-bars">
                {EMPLOYEES.map(emp => (
                  <AssignBar
                    key={emp.id}
                    employee={emp}
                    onAssign={assignEmployee}
                    disabled={allFilled || slots.some(s => s && s.id === emp.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="ep-footer">
          {showWarning && (
            <div className="ep-footer__warning-content">
              <h6>Assignment warnings</h6>
              <div className="warning-banner orange">
                <WarningIcon />
                <div>
                  <h4>Warnings</h4>
                  <ul>
                    <li>{holidayNames} is on holiday on {formatDisplayDate(visitDateISO)}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          <div className={`ep-footer__actions${showWarning ? ' ep-footer__actions--warning' : ''}`}>
            {!showWarning && (
              <button className="round-btn secondary-btn" onClick={() => setShowWarning(false)}>
                Cancel
              </button>
            )}
            <div className="ep-footer__btn-group">
              {showWarning && (
                <button className="round-btn secondary-btn" onClick={() => setShowWarning(false)}>
                  Cancel
                </button>
              )}
              {showWarning ? (
                <button className="round-btn primary-btn" onClick={handleAssignAnyway}>
                  Accept assignment
                </button>
              ) : (
                <button className="round-btn primary-btn" onClick={handleSave}>
                  Save
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
      <DevMode containerRef={pageRef} />
      <DevComments containerRef={pageRef} prototypeId={window.location.pathname} />
    </div>
  )
}
