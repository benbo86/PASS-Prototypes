import { useRef, useState, useMemo, useEffect } from 'react'
import SideNav from '../../../Components/SideNav'
import TopNav from '../../../Components/TopNav'
import CustomerProfileNav from '../../../Components/CustomerProfileNav'
import Modal from '../../../Components/Modal'
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
const NotesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
  </svg>
)
// 'employee' threads are visible to a group (Care Managers / All care
// staff), not one fixed person — this group glyph stands in for that,
// same shape web/messaging already uses for its own "employees" concept.
const GroupIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M6.34529323,13.6992001 C6.98659064,13.9861115 7.69403084,14.1492572 8.44173186,14.1492572 C8.83563565,14.1492572 9.21916363,14.1039779 9.58727007,14.0191771 C8.13951251,14.6947293 7.11265435,16.3547899 7.11265435,17.9622169 L7.11265435,18.6498286 C7.11265435,19.3952357 7.73094558,20 8.49302546,20 L3.38037111,20 C2.61829123,20 2,19.3952357 2,18.6498286 L2,17.9622169 C2,15.8750769 3.73121544,13.6992001 5.86503911,13.6992001 L6.34529323,13.6992001 Z M13.3845982,13.6992001 C14.0316964,13.9861115 14.7455357,14.1492572 15.5,14.1492572 C16.2544643,14.1492572 16.9712054,13.9861115 17.6154018,13.6992001 L18.1,13.6992001 C20.253125,13.6992001 22,15.8750769 22,17.9622169 L22,18.6498286 C22,19.3952357 21.3761161,20 20.6071429,20 L10.3928571,20 C9.62388393,20 9,19.3952357 9,18.6498286 L9,17.9622169 C9,15.8750769 10.746875,13.6992001 12.9,13.6992001 Z M19.6758297,16.8496 L17.2371129,16.8496 C16.9609705,16.8496 16.7371129,17.0734577 16.7371129,17.3496 L16.7371129,18.2311353 C16.7371129,18.5072776 16.9609705,18.7311353 17.2371129,18.7311353 L19.6758297,18.7311353 C19.9519721,18.7311353 20.1758297,18.5072776 20.1758297,18.2311353 L20.1758297,17.3496 C20.1758297,17.0734577 19.9519721,16.8496 19.6758297,16.8496 Z M8.44173186,5 C9.43518456,5 10.3366335,5.384812 10.9988003,6.01037989 C10.3047346,6.66418301 9.87339658,7.5829878 9.87339658,8.60045709 C9.87339658,9.61792638 10.3047346,10.5367312 10.9983346,11.1914945 C10.3366335,11.8161022 9.43518456,12.2009142 8.44173186,12.2009142 C6.40856024,12.2009142 4.76074222,10.5891471 4.76074222,8.60045709 C4.76074222,6.61176712 6.40856024,5 8.44173186,5 Z M15.5,5 C17.5515625,5 19.2142857,6.61176712 19.2142857,8.60045709 C19.2142857,10.5891471 17.5515625,12.2009142 15.5,12.2009142 C13.4484375,12.2009142 11.7857143,10.5891471 11.7857143,8.60045709 C11.7857143,6.61176712 13.4484375,5 15.5,5 Z" />
  </svg>
)

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

function Avatar({ name, size = 40 }) {
  const { bg, fg } = nameToColor(name)
  return (
    <div className="cc-avatar" style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.35 }}>
      {getInitials(name)}
    </div>
  )
}

// 'employee' threads are visible to a group, not one fixed person, so they
// get a neutral group icon rather than a name-hashed initials avatar — an
// initials avatar would need to pick one arbitrary person to represent an
// audience, which is exactly the "who is this thread with" confusion the
// audience model exists to avoid. See data.js's own comment on 'employee'.
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
// or the visibility audience label for an 'employee' thread — there's no
// single fixed person to name there, see data.js's own comment.
function threadTitle(thread) {
  if (thread.kind === 'employee') return AUDIENCE_LABELS[thread.audience]
  return thread.personName
}

// The one line shown between the name and the last-message preview — what
// it shows depends entirely on the thread's kind, not any shared field:
// a visit label, a subject, or the audience for an employee thread (shown
// as "Visible to: ..." since the title above it is already the audience
// name, not a person's — repeating it bare would read as a duplicate).
function ThreadSubtitle({ thread }) {
  if (thread.kind === 'openpass-visit') return <div className="cc-thread-subtitle">{thread.visitLabel}</div>
  if (thread.kind === 'openpass-general') return <div className="cc-thread-subtitle">{thread.subject}</div>
  if (thread.kind === 'employee') return <div className="cc-thread-subtitle">Visible to: {AUDIENCE_LABELS[thread.audience]}</div>
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
        {thread.kind === 'employee' && <span className="cc-thread-header-sub">Visible to this group only</span>}
      </div>
      {thread.kind === 'openpass-visit' && (
        <button className="round-btn secondary-btn btn-icon-left cc-header-action-btn" onClick={onViewCareNotes}>
          <NotesIcon /> View care notes
        </button>
      )}
    </div>
  )
}

// showSender: an 'employee' thread has no single fixed "them" — different
// people can post into the same audience — so incoming messages there need
// their own sender label. The other two kinds are always exactly two
// participants (the named openPASS user and "Office"), already identified
// by the thread header, so labelling every bubble there would be noise.
function MessageBubble({ message, showSender }) {
  return (
    <div className={`cc-message-group ${message.isMe ? 'from-me' : 'from-them'}`}>
      {showSender && !message.isMe && <div className="cc-bubble-sender">{message.sender}</div>}
      <div className={`cc-bubble ${message.isMe ? 'sent' : 'received'}`}>
        <span className="cc-bubble-text">{message.text}</span>
      </div>
      <div className="cc-meta">{message.time}</div>
    </div>
  )
}

function ThreadView({ thread, messages, onViewCareNotes }) {
  const [replyText, setReplyText] = useState('')

  return (
    <div className="cc-thread-view">
      <ThreadHeader thread={thread} onViewCareNotes={onViewCareNotes} />
      <div className="cc-message-list">
        <div className="cc-day-sep"><span>Today</span></div>
        {messages.map((m) => <MessageBubble key={m.id} message={m} showSender={thread.kind === 'employee'} />)}
      </div>
      <div className="cc-compose-bar">
        <div className="cc-compose-input-wrap">
          <input
            className="cc-compose-input"
            placeholder="Reply to this thread..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
        </div>
        <button className={`cc-send-btn${replyText.trim() ? ' active' : ''}`}>
          <SendIcon />
        </button>
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
  const [filters, setFilters] = useState({ openpass: false, office: false })
  const [activeThreadId, setActiveThreadId] = useState(THREADS[0].id)
  const [careNotesVisit, setCareNotesVisit] = useState(null)
  // Local, mutable copy of THREADS so opening a thread can clear its own
  // unread flag (bold name + purple dot) — THREADS itself is just the
  // static seed data, never mutated directly.
  const [threads, setThreads] = useState(THREADS)
  const filterWrapRef = useRef(null)

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

  const anyFilterActive = filters.openpass || filters.office

  const visibleThreads = useMemo(() => {
    const q = search.trim().toLowerCase()
    return threads.filter((t) => {
      if (anyFilterActive) {
        const isOpenPass = t.kind === 'openpass-visit' || t.kind === 'openpass-general'
        if (isOpenPass && !filters.openpass) return false
        if (!isOpenPass && !filters.office) return false
      }
      if (!q) return true
      const haystacks = [
        t.personName, t.visitLabel, t.subject, t.lastMessage,
        t.kind === 'employee' ? AUDIENCE_LABELS[t.audience] : null,
        ...(THREAD_MESSAGES[t.id] || []).map((m) => m.text),
      ].filter(Boolean).map((s) => s.toLowerCase())
      return haystacks.some((s) => s.includes(q))
    })
  }, [search, filters, anyFilterActive, threads])

  const activeThread = threads.find((t) => t.id === activeThreadId)
  const activeMessages = THREAD_MESSAGES[activeThreadId] || []

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
          <CustomerProfileNav activeTab="Communications" />

          <div className="cc-page">
            <div className="cc-layout">
              <div className="cc-sidebar">
                <div className="cc-sidebar-search">
                  <div className="cc-search-bar">
                    <SearchIcon />
                    <input
                      placeholder="Search by title, visit, user, or message..."
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
                        </div>
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
              </div>
              <div className="cc-main">
                {activeThread ? (
                  <ThreadView
                    key={activeThread.id}
                    thread={activeThread}
                    messages={activeMessages}
                    onViewCareNotes={() => setCareNotesVisit(activeThread.visitLabel)}
                  />
                ) : <EmptyState />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {careNotesVisit && (
        <Modal title="Care notes" onClose={() => setCareNotesVisit(null)}>
          <p className="cc-care-notes-visit">{careNotesVisit}</p>
          <div className="cc-care-notes-list">
            {(CARE_NOTES_BY_VISIT[careNotesVisit] || []).map((note) => (
              <div className="cc-care-notes-row" key={note.label}>
                <div className="cc-care-notes-label">{note.label}</div>
                <div className="cc-care-notes-value">{note.value}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </>
  )
}
