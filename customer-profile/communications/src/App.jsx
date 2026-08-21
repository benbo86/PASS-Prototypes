import { useRef, useState, useMemo, useEffect, useLayoutEffect, Fragment } from 'react'
import SideNav from '../../../Components/SideNav'
import TopNav from '../../../Components/TopNav'
import CustomerProfileNav from '../../../Components/CustomerProfileNav'
import DevToolbar from '../../../Components/DevToolbar'
import DevMode from '../../../Components/DevMode'
import DevComments from '../../../Components/DevComments'
import DevEdit from '../../../Components/DevEdit'
import WireframeToggle from '../../../Components/WireframeToggle'
import AuditCapture from '../../../Components/AuditCapture'
import { THREADS, THREAD_MESSAGES, CARE_NOTES_BY_VISIT, AUDIENCE_LABELS } from './data'

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
  </svg>
)
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
)
const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
  </svg>
)
const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
)
// Matches web/messaging's own CloseIcon exactly (used on its read-status
// panel's close button, which this Care notes panel mirrors).
const CloseIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
)
const NotesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
  </svg>
)
// The 'employee' ("Office messages") thread has no single fixed person —
// this group glyph stands in for that, same shape web/messaging already
// uses for its own "employees" concept.
const GroupIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M6.34529323,13.6992001 C6.98659064,13.9861115 7.69403084,14.1492572 8.44173186,14.1492572 C8.83563565,14.1492572 9.21916363,14.1039779 9.58727007,14.0191771 C8.13951251,14.6947293 7.11265435,16.3547899 7.11265435,17.9622169 L7.11265435,18.6498286 C7.11265435,19.3952357 7.73094558,20 8.49302546,20 L3.38037111,20 C2.61829123,20 2,19.3952357 2,18.6498286 L2,17.9622169 C2,15.8750769 3.73121544,13.6992001 5.86503911,13.6992001 L6.34529323,13.6992001 Z M13.3845982,13.6992001 C14.0316964,13.9861115 14.7455357,14.1492572 15.5,14.1492572 C16.2544643,14.1492572 16.9712054,13.9861115 17.6154018,13.6992001 L18.1,13.6992001 C20.253125,13.6992001 22,15.8750769 22,17.9622169 L22,18.6498286 C22,19.3952357 21.3761161,20 20.6071429,20 L10.3928571,20 C9.62388393,20 9,19.3952357 9,18.6498286 L9,17.9622169 C9,15.8750769 10.746875,13.6992001 12.9,13.6992001 Z M19.6758297,16.8496 L17.2371129,16.8496 C16.9609705,16.8496 16.7371129,17.0734577 16.7371129,17.3496 L16.7371129,18.2311353 C16.7371129,18.5072776 16.9609705,18.7311353 17.2371129,18.7311353 L19.6758297,18.7311353 C19.9519721,18.7311353 20.1758297,18.5072776 20.1758297,18.2311353 L20.1758297,17.3496 C20.1758297,17.0734577 19.9519721,16.8496 19.6758297,16.8496 Z M8.44173186,5 C9.43518456,5 10.3366335,5.384812 10.9988003,6.01037989 C10.3047346,6.66418301 9.87339658,7.5829878 9.87339658,8.60045709 C9.87339658,9.61792638 10.3047346,10.5367312 10.9983346,11.1914945 C10.3366335,11.8161022 9.43518456,12.2009142 8.44173186,12.2009142 C6.40856024,12.2009142 4.76074222,10.5891471 4.76074222,8.60045709 C4.76074222,6.61176712 6.40856024,5 8.44173186,5 Z M15.5,5 C17.5515625,5 19.2142857,6.61176712 19.2142857,8.60045709 C19.2142857,10.5891471 17.5515625,12.2009142 15.5,12.2009142 C13.4484375,12.2009142 11.7857143,10.5891471 11.7857143,8.60045709 C11.7857143,6.61176712 13.4484375,5 15.5,5 Z" />
  </svg>
)

// Task-chip icons — reusing customer-profile/timeline's own icon-font
// mechanism exactly (same @font-face/class names, from Styles/legacy.css
// + this component's own .cc-fa-icon/.cc-eltico-icon rules in
// communications.css), not a copy of Timeline's inline SVGs, since these
// aren't SVGs at all — each is a single codepoint rendered in an icon
// font. Only 'medication' and 'nutrition' have a real dedicated icon in
// Timeline; 'general' is that prototype's own catch-all, reused here for
// mobility/wellbeing tasks since Timeline has no icon of its own for
// either (confirmed, not assumed — see data.js's own comment on
// CARE_NOTES_BY_VISIT).
const FaIcon = ({ code, weight = 'solid' }) => <span className={`cc-fa-icon cc-fa-icon-${weight}`}>{code}</span>
const TASK_TYPE_ICON = {
  medication: () => <FaIcon code={''} weight="regular" />, // fa-plus, matches timeline's MedicationIcon
  nutrition: () => <FaIcon code={''} />, // fa-utensils, matches timeline's NutritionIcon
  general: () => <FaIcon code={''} />, // fa-check, matches timeline's GeneralIcon
}

// Solid-fill status colour, not timeline's own light-tint style — matches
// the live product's own task-chip screenshot (Ben supplied it): a solid
// coloured pill with a white icon+text, not a tinted background with
// coloured text. 'complete'/'partial' happen to already match timeline's
// own --legacy-status-complete/--legacy-status-partial tokens exactly;
// 'cancelled' uses Ben's own explicit #999 rather than timeline's
// slightly different --legacy-status-cancelled (#757575) — his spec, not
// a mismatch to fix.
function TaskChip({ note }) {
  const Icon = TASK_TYPE_ICON[note.type] || TASK_TYPE_ICON.general
  return (
    <span className={`cc-task-chip cc-task-chip--${note.status}`}>
      <Icon />
      {note.task}
    </span>
  )
}

// Colour palette + hash, mirroring web/messaging's own nameToColor — a
// deterministic name -> {bg, fg} pair so the same person always gets the
// same avatar colour without storing it anywhere.
const INITIALS_COLORS = [
  { bg: '#e6d9f5', fg: '#7b3fa6' },
  { bg: '#d9ecf5', fg: '#2a7ba0' },
  { bg: '#d9f5e2', fg: '#2f9e5c' },
  { bg: '#f5e9d9', fg: '#a06a2a' },
  { bg: '#f5d9df', fg: '#a02a54' },
]
function nameToColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return INITIALS_COLORS[Math.abs(hash) % INITIALS_COLORS.length]
}
function getInitials(name) {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
}

// Day-separator labelling, computed from each message's real `date`
// (YYYY-MM-DD) rather than a hardcoded literal — this is what actually
// gives an office user clear visibility into when older messages were
// sent, for a thread that can genuinely span weeks (e.g. Office messages).
// Matches web/messaging's own Today/Yesterday/weekday-name scheme for
// anything in the last week, then adds an absolute date beyond that —
// a gap neither web/messaging nor an earlier version of this page actually
// covered (both only ever showed sample data within the current week).
const WEEKDAY_FORMATTER = new Intl.DateTimeFormat('en-GB', { weekday: 'long' })
const ABSOLUTE_DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

function parseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function dayLabel(dateStr) {
  const date = parseLocalDate(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.round((today - date) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays > 1 && diffDays < 7) return WEEKDAY_FORMATTER.format(date)
  return ABSOLUTE_DATE_FORMATTER.format(date)
}

// Groups consecutive messages sharing the same `date` under one separator
// — messages already arrive in chronological order, so this never needs
// to sort, only to notice when the date actually changes.
function groupMessagesByDay(messages) {
  const groups = []
  for (const m of messages) {
    const last = groups[groups.length - 1]
    if (last && last.date === m.date) last.messages.push(m)
    else groups.push({ date: m.date, messages: [m] })
  }
  return groups
}

function Avatar({ name, size = 40 }) {
  const { bg, fg } = nameToColor(name)
  return (
    <div className="cc-avatar" style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.35 }}>
      {getInitials(name)}
    </div>
  )
}

// 'employee' ("Office messages") has no single fixed person, so it gets a
// neutral group icon rather than a name-hashed initials avatar — an
// initials avatar would need to pick one arbitrary person to represent the
// whole thread, which is exactly the "who is this thread with" confusion
// this avoids. See data.js's own comment on 'employee'.
function GroupAvatar({ size = 40 }) {
  return (
    <div className="cc-avatar cc-avatar-group" style={{ width: size, height: size }}>
      <GroupIcon size={size * 0.5} />
    </div>
  )
}

function ThreadAvatar({ thread, size }) {
  if (thread.kind === 'employee') return <GroupAvatar size={size} />
  return <Avatar name={thread.personName} size={size} />
}

// A thread's displayed name: a person's name for the two openPASS kinds,
// or the fixed "Office messages" label — matching the live product's own
// nav label exactly (Communications -> Office messages). Not an audience
// label — a single Office messages thread mixes messages of different
// audiences over time, see data.js's own comment on 'employee'.
function threadTitle(thread) {
  if (thread.kind === 'employee') return 'Office messages'
  return thread.personName
}

// The one line shown between the name and the last-message preview — what
// it shows depends entirely on the thread's kind: a visit label or a
// subject for the two openPASS kinds. 'employee' has none — its messages
// can carry different audiences over time, so there's no single fixed
// subtitle to show at the thread level any more (each message shows its
// own audience tag instead, see MessageBubble).
function ThreadSubtitle({ thread }) {
  if (thread.kind === 'openpass-visit') return <div className="cc-thread-subtitle">{thread.visitLabel}</div>
  if (thread.kind === 'openpass-general') return <div className="cc-thread-subtitle">{thread.subject}</div>
  return null
}

function ThreadRow({ thread, isActive, onClick }) {
  return (
    <div className={`cc-thread-row${isActive ? ' active' : ''}${thread.unread ? ' unread' : ''}`} onClick={onClick}>
      <ThreadAvatar thread={thread} />
      <div className="cc-thread-row-body">
        <div className="cc-thread-row-top">
          <span className="cc-thread-name">{threadTitle(thread)}</span>
          <span className="cc-thread-time">{thread.time}</span>
        </div>
        <ThreadSubtitle thread={thread} />
        <div className="cc-thread-preview-row">
          <span className="cc-thread-preview">
            <span className="cc-thread-sender">{thread.lastSender}:</span> {thread.lastMessage}
          </span>
          {thread.unread && <span className="cc-unread-dot" />}
        </div>
      </div>
    </div>
  )
}

function ThreadHeader({ thread, onViewCareNotes }) {
  return (
    <div className="cc-thread-header">
      <ThreadAvatar thread={thread} />
      <div className="cc-thread-header-info">
        <h2 className="cc-thread-header-title">{threadTitle(thread)}</h2>
        {thread.kind === 'openpass-visit' && <span className="cc-thread-header-sub">{thread.visitLabel}</span>}
        {thread.kind === 'openpass-general' && <span className="cc-thread-header-sub">{thread.subject}</span>}
      </div>
      {thread.kind === 'openpass-visit' && (
        <button className="round-btn secondary-btn btn-icon-left cc-header-action-btn" onClick={onViewCareNotes}>
          <NotesIcon /> View care notes
        </button>
      )}
    </div>
  )
}

// showSender: the 'employee' ("Office messages") thread has no single
// fixed "them" — different care workers can reply into it — so incoming
// messages there need their own sender label. The other two kinds are
// always exactly two participants (the named openPASS user and "Office"),
// already identified by the thread header, so labelling every bubble
// there would be noise.
//
// message.audience: only ever set on an office-sent message (never on a
// care worker's reply — a reply doesn't re-declare who can see it, see
// data.js's own comment) — shown as a small "To: ..." tag above the
// bubble, matching the live product's own per-message visibility label.
function MessageBubble({ message, showSender }) {
  return (
    <div className={`cc-message-group ${message.isMe ? 'from-me' : 'from-them'}`}>
      {showSender && !message.isMe && <div className="cc-bubble-sender">{message.sender}</div>}
      {message.audience && <div className="cc-audience-tag">To: {AUDIENCE_LABELS[message.audience]}</div>}
      <div className={`cc-bubble ${message.isMe ? 'sent' : 'received'}`}>
        <span className="cc-bubble-text">{message.text}</span>
      </div>
      <div className="cc-meta">{message.time}</div>
    </div>
  )
}

function ThreadView({ thread, messages, onSend }) {
  const [replyText, setReplyText] = useState('')
  // Whether the Care notes panel is open — local to this thread's own
  // ThreadView instance (remounted per thread switch, see the parent's
  // key={activeThread.id}), so it naturally resets rather than needing to
  // be lifted/reset from App.
  const [showCareNotes, setShowCareNotes] = useState(false)
  // Only meaningful for the 'employee' (Office messages) thread — every
  // office-sent message there needs a declared audience (see data.js's own
  // comment on why this isn't 1:1 or per-thread). Defaults to the broader
  // option; resets automatically on every thread switch since ThreadView
  // is remounted per thread (parent keys it by thread id).
  const [audience, setAudience] = useState('all-care-staff')
  const dayGroups = useMemo(() => groupMessagesByDay(messages), [messages])
  const messageListRef = useRef(null)

  function handleSend() {
    if (!replyText.trim()) return
    onSend(thread.id, replyText, thread.kind === 'employee' ? audience : undefined)
    setReplyText('')
  }

  // Jump straight to the latest message on open — the message list now has
  // a genuinely bounded, scrollable height (see .cc-layout's fixed 640px),
  // so without this it defaults to scrollTop 0 and a thread with real
  // history (e.g. Office messages) opens showing its oldest message
  // instead of the latest. useLayoutEffect (not useEffect) so the jump
  // happens before paint — no visible flash of the top of the thread.
  //
  // Keyed on `messages`, not mount-only — sending a reply appends to this
  // same open thread without remounting ThreadView (only a thread *switch*
  // remounts it), so a mount-only effect never re-fired for a message sent
  // into the thread already open, leaving the new bubble sitting below the
  // fold, visually hidden behind the compose bar. `messages` only changes
  // reference when this thread's own messages actually change (see
  // activeMessages in App), so this doesn't re-fire on unrelated renders.
  useLayoutEffect(() => {
    const el = messageListRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  return (
    <div className="cc-thread-view">
      <ThreadHeader thread={thread} onViewCareNotes={() => setShowCareNotes(true)} />
      {/* Mirrors web/messaging's own .msg-thread-content-row/.msg-thread-main-col
          nesting exactly — Care notes is a static third column here (see
          .cc-care-notes-panel below), never a modal/overlay, matching that
          prototype's real read-status panel rather than the generic
          SlidePanel component used for editor-style forms elsewhere. */}
      <div className="cc-thread-content-row">
        <div className="cc-thread-main-col">
          <div className="cc-message-list" ref={messageListRef}>
            {dayGroups.map((group) => (
              <Fragment key={group.date}>
                <div className="cc-day-sep"><span>{dayLabel(group.date)}</span></div>
                {group.messages.map((m) => <MessageBubble key={m.id} message={m} showSender={thread.kind === 'employee'} />)}
              </Fragment>
            ))}
          </div>
          <div className="cc-compose-bar">
            {thread.kind === 'employee' && (
              <div className="cc-audience-picker">
                <span className="cc-audience-picker-label">Visible to:</span>
                <button
                  type="button"
                  className={`cc-audience-option${audience === 'all-care-staff' ? ' active' : ''}`}
                  onClick={() => setAudience('all-care-staff')}
                >
                  All care staff
                </button>
                <button
                  type="button"
                  className={`cc-audience-option${audience === 'care-managers' ? ' active' : ''}`}
                  onClick={() => setAudience('care-managers')}
                >
                  Care Managers
                </button>
              </div>
            )}
            <div className="cc-compose-row">
              <div className="cc-compose-input-wrap">
                <input
                  className="cc-compose-input"
                  placeholder="Reply to this thread..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
                />
              </div>
              <button className={`cc-send-btn${replyText.trim() ? ' active' : ''}`} onClick={handleSend}>
                <SendIcon />
              </button>
            </div>
          </div>
        </div>
        {showCareNotes && (
          <div className="cc-care-notes-panel">
            <div className="cc-care-notes-panel-header">
              <div className="cc-care-notes-panel-titles">
                <h3>Care notes</h3>
                <span className="cc-care-notes-panel-subtitle">{thread.visitLabel}</span>
              </div>
              <button className="cc-care-notes-close" onClick={() => setShowCareNotes(false)} aria-label="Close">
                <CloseIcon size={20} />
              </button>
            </div>
            <div className="cc-care-notes-panel-body">
              <div className="cc-care-notes-list">
                {(CARE_NOTES_BY_VISIT[thread.id] || []).map((note, i) => (
                  <TaskChip key={i} note={note} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return <div className="cc-empty-state">Select a conversation</div>
}

export default function App() {
  const pageRef = useRef(null)
  const [search, setSearch] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState({ openpass: false, office: false, unread: false })
  // Local, mutable copy of THREADS so opening a thread can clear its own
  // unread flag (bold name + purple dot) — THREADS itself is just the
  // static seed data, never mutated directly.
  const [threads, setThreads] = useState(THREADS)
  // Local, mutable copy of THREAD_MESSAGES so a sent reply actually lands
  // in the thread (see sendMessage below) instead of just sitting in the
  // compose input — same reasoning as lifting THREADS into state above.
  const [threadMessages, setThreadMessages] = useState(THREAD_MESSAGES)
  const filterWrapRef = useRef(null)

  // Most-recent-activity first — not unread-first. Matches how mainstream
  // messaging apps (e.g. WhatsApp) actually order a chat list: sorted by
  // recency, with unread shown only as a status (bold name + dot), never
  // as something that reorders the list out from under you the moment you
  // open and read it. Sorted by each thread's true last message (date +
  // time combined — a bare time-of-day string alone would wrongly rank an
  // old thread's late-evening message above a newer thread's early-morning
  // one), not the thread's own display `time`/`lastMessage` fields, which
  // are just a cached copy of that same last message for the row preview.
  function lastMessageKey(threadId) {
    const last = (threadMessages[threadId] || []).at(-1)
    return last ? `${last.date}T${last.time}` : ''
  }

  // Lands on whichever thread actually has the most recent activity
  // (Office messages, at the time this was built) rather than a hardcoded
  // thread — a lazy initializer so this is only ever computed once, off
  // the real seed data, matching the same recency ordering used for the
  // sidebar list below.
  const [activeThreadId, setActiveThreadId] = useState(() => {
    const sorted = [...THREADS].sort((a, b) => lastMessageKey(b.id).localeCompare(lastMessageKey(a.id)))
    return sorted[0]?.id ?? THREADS[0].id
  })

  // Appends a real message to the thread (isMe: true, sender 'Office' —
  // this whole page is the office's own view) and refreshes that thread's
  // sidebar preview to match, exactly like every other last-message field
  // in this file is kept in sync with the true last message. `audience`
  // is only ever passed for the 'employee' thread (see ThreadView) — every
  // other kind sends a plain, untagged reply.
  function sendMessage(threadId, text, audience) {
    const trimmed = text.trim()
    if (!trimmed) return
    const existing = threadMessages[threadId] || []
    const last = existing.at(-1)
    const now = new Date()
    let time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    // This prototype's own seed data uses fixed "later today" demo
    // timestamps (e.g. 19:47) so the day-separator/recency-sort features
    // have something to show — those can easily be ahead of whichever
    // real wall-clock time this actually runs at. A message genuinely
    // being sent right now must still land as the newest thing in its own
    // thread, so nudge forward a minute past the last message rather than
    // let a real "now" that's earlier than the demo data quietly sort
    // behind it.
    if (last && last.date === date && time <= last.time) {
      const [h, m] = last.time.split(':').map(Number)
      const bumped = new Date(2000, 0, 1, h, m + 1)
      time = `${String(bumped.getHours()).padStart(2, '0')}:${String(bumped.getMinutes()).padStart(2, '0')}`
    }
    const nextId = (last?.id ?? 0) + 1
    const newMessage = { id: nextId, isMe: true, sender: 'Office', text: trimmed, time, date, ...(audience ? { audience } : {}) }
    setThreadMessages((prev) => ({ ...prev, [threadId]: [...(prev[threadId] || []), newMessage] }))
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, lastSender: 'Office', lastMessage: trimmed, time } : t)))
  }

  // Resizable sidebar — same drag mechanics and 240–480px clamp as
  // web/messaging's own .msg-sidebar-resize-handle (plain document-level
  // mousemove/mouseup listeners added on mousedown, removed on mouseup;
  // no persistence, matching that reference implementation exactly).
  const [sidebarWidth, setSidebarWidth] = useState(360)

  function handleSidebarResizeStart(e) {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = sidebarWidth
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    function handleMouseMove(moveEvent) {
      const newWidth = startWidth + (moveEvent.clientX - startX)
      setSidebarWidth(Math.min(480, Math.max(240, newWidth)))
    }
    function handleMouseUp() {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  function openThread(id) {
    setActiveThreadId(id)
    setThreads((prev) => prev.map((t) => (t.id === id && t.unread ? { ...t, unread: false } : t)))
  }

  useEffect(() => {
    if (!filterOpen) return
    function handleClickOutside(e) {
      if (filterWrapRef.current && !filterWrapRef.current.contains(e.target)) setFilterOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [filterOpen])

  // OpenPASS/Office narrow by thread *kind* (OR'd together); Unread is a
  // separate dimension (thread *status*) applied on top, not folded into
  // the same kind-matching branch below — a thread can be both "Office"
  // and "unread" at once, so these two checks need to compose, not compete.
  const anyKindFilterActive = filters.openpass || filters.office
  const anyFilterActive = anyKindFilterActive || filters.unread
  const unreadCount = threads.filter((t) => t.unread).length
  const activeFilterCount = [filters.openpass, filters.office, filters.unread].filter(Boolean).length

  const visibleThreads = useMemo(() => {
    const q = search.trim().toLowerCase()
    return threads
      .filter((t) => {
        if (anyKindFilterActive) {
          const isOpenPass = t.kind === 'openpass-visit' || t.kind === 'openpass-general'
          if (isOpenPass && !filters.openpass) return false
          if (!isOpenPass && !filters.office) return false
        }
        if (filters.unread && !t.unread) return false
        if (!q) return true
        const haystacks = [
          t.personName, t.visitLabel, t.subject, t.lastMessage,
          // Audience now lives per-message, not on the thread itself — flatten
          // every message's own audience label in too, so e.g. searching "care
          // managers" still finds the Office messages thread via whichever of
          // its messages actually carries that audience.
          ...(threadMessages[t.id] || []).flatMap((m) => [m.text, m.audience ? AUDIENCE_LABELS[m.audience] : null]),
        ].filter(Boolean).map((s) => s.toLowerCase())
        return haystacks.some((s) => s.includes(q))
      })
      .sort((a, b) => lastMessageKey(b.id).localeCompare(lastMessageKey(a.id)))
  }, [search, filters, anyKindFilterActive, threads, threadMessages])

  const activeThread = threads.find((t) => t.id === activeThreadId)
  const activeMessages = threadMessages[activeThreadId] || []

  return (
    <>
      <DevToolbar>
        <DevEdit containerRef={pageRef} prototypeId={window.location.pathname} />
        <DevMode containerRef={pageRef} />
        <DevComments containerRef={pageRef} prototypeId={window.location.pathname} />
        <WireframeToggle />
        <AuditCapture containerRef={pageRef} />
      </DevToolbar>
      <div className="page" ref={pageRef}>
        <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>
        <SideNav activeItem="customers" />
        <div className="page-body">
          <TopNav />
          <CustomerProfileNav activeTab="Communications" tabBadges={{ Communications: unreadCount }} />

          <div className="cc-page">
            <div className="cc-layout">
              <div className="cc-sidebar" style={{ width: sidebarWidth }}>
                <div className="cc-sidebar-search">
                  <div className="cc-search-bar">
                    <SearchIcon />
                    <input
                      placeholder="Search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="cc-filter-wrap" ref={filterWrapRef}>
                    <button
                      className={`cc-filter-icon-btn${anyFilterActive ? ' active' : ''}`}
                      data-devmode-passthrough="true"
                      onClick={() => setFilterOpen((v) => !v)}
                    >
                      <FilterIcon />
                      {activeFilterCount > 0 && <span className="cc-filter-badge">{activeFilterCount}</span>}
                    </button>
                    {filterOpen && (
                      <div className="cc-filter-menu">
                        <div className="fd-list">
                          <div
                            className="fd-item"
                            onClick={() => setFilters((f) => ({ ...f, openpass: !f.openpass }))}
                          >
                            <span className={`fd-checkbox${filters.openpass ? ' checked' : ''}`}>
                              {filters.openpass && (
                                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                  <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </span>
                            <span className="fd-item-label">OpenPASS</span>
                          </div>
                          <div
                            className="fd-item"
                            onClick={() => setFilters((f) => ({ ...f, office: !f.office }))}
                          >
                            <span className={`fd-checkbox${filters.office ? ' checked' : ''}`}>
                              {filters.office && (
                                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                  <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </span>
                            <span className="fd-item-label">Office</span>
                          </div>
                          <div
                            className="fd-item"
                            onClick={() => setFilters((f) => ({ ...f, unread: !f.unread }))}
                          >
                            <span className={`fd-checkbox${filters.unread ? ' checked' : ''}`}>
                              {filters.unread && (
                                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                  <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </span>
                            <span className="fd-item-label">Unread</span>
                          </div>
                        </div>
                        {activeFilterCount > 0 && (
                          <button
                            className="cc-filter-menu-clear"
                            onClick={() => { setFilters({ openpass: false, office: false, unread: false }); setFilterOpen(false) }}
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="cc-thread-list">
                  {visibleThreads.length === 0 && <div className="cc-empty-list">No conversations match.</div>}
                  {visibleThreads.map((t) => (
                    <ThreadRow
                      key={t.id}
                      thread={t}
                      isActive={t.id === activeThreadId}
                      onClick={() => openThread(t.id)}
                    />
                  ))}
                </div>
                <div className="cc-sidebar-resize-handle" onMouseDown={handleSidebarResizeStart} />
              </div>
              <div className="cc-main">
                {activeThread ? (
                  <ThreadView
                    key={activeThread.id}
                    thread={activeThread}
                    messages={activeMessages}
                    onSend={sendMessage}
                  />
                ) : <EmptyState />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
