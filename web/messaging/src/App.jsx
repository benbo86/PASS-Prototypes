import { useState, useRef, useEffect } from 'react'
import WebNav from '../../../Components/WebNav'

// ─── Icons ────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
)
const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5.00125 16.2458L5.00125 18.6099C5.00125 18.8277 5.17234 18.9988 5.39008 18.9988L7.7542 18.9988C7.8553 18.9988 7.9564 18.9599 8.02639 18.8821L16.5185 10.3977L13.6023 7.48146L5.1179 15.9658C5.04013 16.0436 5.00125 16.1369 5.00125 16.2458ZM18.7738 8.1425C19.0771 7.83919 19.0771 7.34926 18.7738 7.04597L16.954 5.22622C16.6507 4.92293 16.1608 4.92293 15.8575 5.22622L14.4344 6.64935L17.3506 9.56562L18.7738 8.1425Z"/>
  </svg>
)
const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
)
const CloseIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
)
const GroupIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
)
const PersonIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
)
const BroadcastIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM19.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v4h2v-4h1l5 3V6L8 9H4zm11.5 3c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.01 1.5-3.34z"/>
  </svg>
)
const AttachIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 015 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 005 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
  </svg>
)
const CheckDoubleIcon = ({ read }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className={`receipt-icon ${read ? 'receipt-read' : 'receipt-delivered'}`}>
    <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/>
  </svg>
)
const CheckSentIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="receipt-icon receipt-sent">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
)
const UnreadBubbleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
    <circle cx="19" cy="5" r="3.5"/>
  </svg>
)
const ReplyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>
  </svg>
)
const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
  </svg>
)
const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)
const PlusIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
)

// ─── Data ─────────────────────────────────────────────────────

const CARERS = [
  { id: 1,  name: 'Sarah Mitchell',  initials: 'SM' },
  { id: 2,  name: 'Karen Bailey',    initials: 'KB' },
  { id: 3,  name: 'Tom Harris',      initials: 'TH' },
  { id: 4,  name: 'Priya Sharma',    initials: 'PS' },
  { id: 5,  name: 'James Okafor',    initials: 'JO' },
  { id: 6,  name: 'Linda Peters',    initials: 'LP' },
  { id: 7,  name: 'David Chen',      initials: 'DC' },
  { id: 8,  name: 'Emma Richardson', initials: 'ER' },
  { id: 9,  name: 'Michael Hughes',  initials: 'MH' },
  { id: 10, name: 'Olivia Brooks',   initials: 'OB' },
  { id: 11, name: 'Nathan Wells',    initials: 'NW' },
  { id: 12, name: 'Chloe Barker',    initials: 'CB' },
  { id: 13, name: 'Ryan Sutton',     initials: 'RS' },
  { id: 14, name: 'Fiona Marsh',     initials: 'FM' },
  { id: 15, name: 'Callum Reid',     initials: 'CR' },
]

const TAG_TYPES = [
  { id: 1, name: 'Care Home' },
  { id: 2, name: 'Area' },
  { id: 3, name: 'Shift Pattern' },
]

const TAGS = [
  { id: 101, typeId: 1, name: 'Blue Bird Sheffield',  memberCount: 15 },
  { id: 102, typeId: 1, name: 'Sunrise Rotherham',    memberCount: 8  },
  { id: 103, typeId: 1, name: 'Meadow View Leeds',    memberCount: 6  },
  { id: 104, typeId: 2, name: 'North Sheffield',      memberCount: 11 },
  { id: 105, typeId: 2, name: 'South Sheffield',      memberCount: 9  },
  { id: 106, typeId: 2, name: 'Rotherham Central',    memberCount: 14 },
  { id: 107, typeId: 3, name: 'Early Shift',          memberCount: 12 },
  { id: 108, typeId: 3, name: 'Late Shift',           memberCount: 10 },
  { id: 109, typeId: 3, name: 'Weekend',              memberCount: 7  },
]

const THREADS = [
  {
    id: 1,
    title: 'Blue Bird Sheffield — Team Update',
    isGroup: false,
    isBroadcast: true,
    replyAllowed: false,
    participants: 'Blue Bird Sheffield · 15 employees',
    participantList: ['Blue Bird Sheffield'],
    lastSender: 'Office',
    lastMessage: "Just a reminder the weekly handover meeting is Thursday at 4pm.",
    time: '10:42 AM',
    unread: 0,
    closed: false,
  },
  {
    id: 2,
    title: 'Medication Query',
    isGroup: false,
    isBroadcast: false,
    replyAllowed: true,
    participants: 'Adrianna Jackson',
    participantList: ['Adrianna Jackson'],
    lastSender: 'Adrianna Jackson',
    lastMessage: "Hi Karen, yes I was there until 5pm and she did take all her medication.",
    time: '9:15 AM',
    unread: 1,
    closed: false,
  },
  {
    id: 3,
    title: 'Friday Shift — Swap Request',
    isGroup: false,
    isBroadcast: false,
    replyAllowed: true,
    participants: 'Adrianna Jackson',
    participantList: ['Adrianna Jackson'],
    lastSender: 'Office',
    lastMessage: "No problem at all Adrianna, we'll sort it. Tom will cover your Friday 6th visit.",
    time: 'Yesterday',
    unread: 0,
    closed: false,
  },
  {
    id: 4,
    title: 'Annual Leave — July',
    isGroup: false,
    isBroadcast: false,
    replyAllowed: true,
    participants: 'Adrianna Jackson',
    participantList: ['Adrianna Jackson'],
    lastSender: 'Adrianna Jackson',
    lastMessage: "I'd like to request annual leave from 14th July to 18th July if possible.",
    time: 'Mon',
    unread: 0,
    closed: false,
  },
  {
    id: 5,
    title: 'Road Closures — This Week',
    isGroup: false,
    isBroadcast: true,
    replyAllowed: false,
    participants: 'All employees · 47 employees',
    participantList: [],
    lastSender: 'Office',
    lastMessage: "Please be aware of road closures on the A57 this week due to utility works.",
    time: 'Yesterday',
    unread: 0,
    closed: false,
  },
]

const THREAD_MESSAGES = {
  1: [
    { id: 1, isMe: true, text: "Hi team, just a reminder that we have a new care plan in place for all Blue Bird residents. Please review the updated notes before your next visits.", time: '2:00 PM', day: 'Monday' },
    { id: 2, isMe: true, text: "Also, please note that parking on Station Road is restricted from next week. Plan your journeys accordingly.", time: '2:01 PM', day: 'Monday' },
    { id: 3, isMe: true, text: "Just a reminder the weekly handover meeting is Thursday at 4pm. Please make sure your visit notes are up to date beforehand.", time: '10:42 AM', day: 'Today' },
  ],
  2: [
    { id: 1, isMe: true, text: "Hi Adrianna, I wanted to check in about Margaret Thompson's care visit yesterday. Did she take her evening medication? She mentioned to her son that she thought she might have missed it.", time: '2:34 PM', day: 'Yesterday', receipt: 'read' },
    { id: 2, isMe: false, sender: 'Adrianna Jackson', text: "Hi Karen, yes I was there until 5pm and she did take all her medication. I've attached my signed visit notes for reference.", time: '2:47 PM', day: 'Yesterday' },
    { id: 3, isMe: true, text: "That's great, thank you! Her son has been a bit worried. Could you also let me know if she mentions any pain during your next visit? She has a GP appointment on Thursday.", time: '2:52 PM', day: 'Yesterday', receipt: 'read' },
    { id: 4, isMe: true, text: "Morning Adrianna, just a follow up on Margaret. Did you manage to speak with her son at the visit? We received a call from him this morning.", time: '9:15 AM', day: 'Today', receipt: 'delivered' },
  ],
  3: [
    { id: 1, isMe: false, sender: 'Adrianna Jackson', text: "Hi, I was wondering if it would be possible to swap my Friday 6th shift? I have a family commitment that afternoon.", time: 'Fri 11:02 AM', day: 'Friday', receipt: 'read' },
    { id: 2, isMe: true, text: "Hi Adrianna, thanks for letting us know. Let me check who's available to cover and get back to you.", time: 'Fri 11:45 AM', day: 'Friday' },
    { id: 3, isMe: true, text: "No problem at all Adrianna, we'll sort it. Tom will cover your Friday 6th visit.", time: '4:02 PM', day: 'Yesterday' },
  ],
  4: [
    { id: 1, isMe: false, sender: 'Adrianna Jackson', text: "Hi, I'd like to request annual leave from 14th July to 18th July if possible. Happy to discuss if needed.", time: 'Mon 9:20 AM', day: 'Monday', receipt: 'delivered' },
  ],
  5: [
    { id: 1, isMe: true, text: "Please be aware of road closures on the A57 this week due to utility works near Hillsborough. Please allow extra travel time on visits in that area.", time: '9:10 AM', day: 'Yesterday' },
    { id: 2, isMe: true, text: "Affected roads: A57 Penistone Road, Herries Road, and parts of Middlewood Road. Works are expected to run until Friday.", time: '9:11 AM', day: 'Yesterday' },
  ],
}

// ─── Helpers ──────────────────────────────────────────────────

function getInitials(name) {
  const parts = name.trim().split(' ')
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

function nameToColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return INITIALS_COLORS[Math.abs(hash) % INITIALS_COLORS.length]
}

// ─── Thread Row ────────────────────────────────────────────────

function ThreadRow({ thread, isActive, onClick }) {
  const isUnread = thread.unread > 0
  const firstName = thread.participantList[0] || ''
  const palette = !thread.isBroadcast && firstName ? nameToColor(firstName) : null
  const extraCount = !thread.isBroadcast && thread.participantList.length > 1
    ? thread.participantList.length - 1
    : 0

  return (
    <div
      className={`msg-thread-row${isActive ? ' active' : ''}${isUnread ? ' unread' : ''}`}
      onClick={onClick}
    >
      <div
        className={`msg-thread-avatar${thread.isBroadcast ? ' broadcast' : ''}`}
        style={palette ? { background: palette.bg, color: palette.fg } : {}}
      >
        {thread.isBroadcast
          ? <BroadcastIcon size={18} />
          : <span className="msg-thread-initials">{getInitials(firstName)}</span>
        }
        {extraCount > 0 && <span className="msg-thread-extra">+{extraCount}</span>}
      </div>
      <div className="msg-thread-body">
        <div className="msg-thread-top">
          <span className="msg-thread-name">{thread.title}</span>
          <span className="msg-thread-time">{thread.time}</span>
        </div>
        <div className="msg-thread-preview-row">
          <span className="msg-thread-preview">
            <span className="msg-thread-sender">{thread.lastSender}: </span>
            {thread.lastMessage}
          </span>
          {isUnread
            ? <span className="msg-unread-badge">{thread.unread}</span>
            : null
          }
        </div>
      </div>
    </div>
  )
}

// ─── Sidebar ───────────────────────────────────────────────────

function Sidebar({ threads, activeThreadId, search, onSearch, onSelectThread, onCompose }) {
  const [tab, setTab] = useState('inbox')

  const filtered = threads.filter(t => {
    const matchesTab = tab === 'inbox' ? !t.closed : t.closed
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.lastMessage.toLowerCase().includes(search.toLowerCase()) ||
      t.participants.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  return (
    <div className="msg-sidebar">
      <div className="msg-sidebar-header">
        <h2 className="msg-sidebar-title">Messages</h2>
        <button className="msg-compose-btn" onClick={onCompose} title="New message">
          <EditIcon />
          <span>New message</span>
        </button>
      </div>
      <div className="msg-sidebar-search">
        <div className="msg-search-bar">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={e => onSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="msg-sidebar-tabs">
        <button
          className={`msg-sidebar-tab${tab === 'inbox' ? ' active' : ''}`}
          onClick={() => setTab('inbox')}
        >Inbox</button>
        <button
          className={`msg-sidebar-tab${tab === 'closed' ? ' active' : ''}`}
          onClick={() => setTab('closed')}
        >Closed</button>
      </div>
      <div className="msg-thread-list">
        {filtered.map(t => (
          <ThreadRow
            key={t.id}
            thread={t}
            isActive={t.id === activeThreadId}
            onClick={() => onSelectThread(t.id)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="msg-empty-list">
            {tab === 'closed' ? 'No closed threads' : 'No messages found'}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Thread View ───────────────────────────────────────────────

function ThreadView({ thread, messages, onSend, onClose, onMarkUnread }) {
  const [inputText, setInputText] = useState('')
  const [localMsgs, setLocalMsgs] = useState(messages)
  const [replyTo, setReplyTo] = useState(null)
  const [editing, setEditing] = useState(null)
  const [actionTarget, setActionTarget] = useState(null)
  const endRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    setLocalMsgs(messages)
    setEditing(null)
    setInputText('')
    setReplyTo(null)
  }, [thread.id])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [localMsgs.length, thread.id])

  const appendEvent = (text) => {
    setLocalMsgs(prev => [...prev, { id: Date.now(), type: 'event', text, time: 'Just now', day: 'Today' }])
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  const headerFirstName = thread.participantList[0] || ''
  const headerInitials = !thread.isBroadcast && headerFirstName ? getInitials(headerFirstName) : ''
  const headerPalette = !thread.isBroadcast && headerFirstName ? nameToColor(headerFirstName) : null

  const byDay = localMsgs.reduce((acc, msg) => {
    const last = acc[acc.length - 1]
    if (last && last.day === msg.day) last.msgs.push(msg)
    else acc.push({ day: msg.day, msgs: [msg] })
    return acc
  }, [])

  const handleSend = () => {
    const text = inputText.trim()
    if (!text) return
    if (editing) {
      setLocalMsgs(prev => prev.map(m => m.id === editing.id ? { ...m, text, edited: true } : m))
      setEditing(null)
    } else {
      const newMsg = {
        id: localMsgs.length + 1,
        isMe: true,
        text,
        time: 'Just now',
        day: 'Today',
        ...(replyTo ? { replyTo } : {}),
      }
      setLocalMsgs(prev => [...prev, newMsg])
      onSend?.(text)
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
    setInputText('')
    setReplyTo(null)
  }

  return (
    <div className="msg-thread-view" onClick={() => setActionTarget(null)}>
      {/* Header */}
      <div className="msg-thread-header">
        <div
          className={`msg-thread-header-avatar${thread.isBroadcast ? ' broadcast' : ''}`}
          style={headerPalette ? { background: headerPalette.bg, color: headerPalette.fg } : {}}
        >
          {thread.isBroadcast
            ? <BroadcastIcon size={20} />
            : <span className="msg-thread-initials">{headerInitials}</span>
          }
        </div>
        <div className="msg-thread-header-info">
          <span className="msg-thread-header-title">{thread.title}</span>
          <span className="msg-thread-header-sub">{thread.participants}</span>
        </div>
        <div className="msg-thread-header-actions">
          {!thread.closed && thread.replyAllowed && (
            <button
              className="msg-header-action-btn"
              title="Mark as unread"
              onClick={e => { e.stopPropagation(); onMarkUnread?.() }}
            >
              <UnreadBubbleIcon />
              <span>Mark unread</span>
            </button>
          )}
          <button
            className="msg-header-action-btn"
            title={thread.closed ? 'Reopen thread' : 'Close thread'}
            onClick={e => { e.stopPropagation(); onClose?.() }}
          >
            {!thread.closed && <CloseIcon size={18} />}
            <span>{thread.closed ? 'Reopen' : 'Close thread'}</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="msg-messages-area" onClick={() => setActionTarget(null)}>
        {byDay.map(group => (
          <div key={group.day}>
            <div className="msg-day-sep"><span>{group.day}</span></div>
            {group.msgs.map((msg, i) => {
              if (msg.type === 'event') {
                return (
                  <div key={msg.id} className="msg-event-message">
                    <span>{msg.text}</span>
                  </div>
                )
              }
              return (
                <div
                  key={msg.id}
                  className={`msg-message-group ${msg.isMe ? 'from-me' : 'from-them'}`}
                >
                  <div
                    className={`msg-bubble ${msg.isMe ? 'sent' : 'received'}`}
                    onClick={e => { e.stopPropagation(); setActionTarget(actionTarget?.id === msg.id ? null : msg) }}
                  >
                    {msg.replyTo && (
                      <div className={`msg-reply-quote${msg.isMe ? ' me' : ''}`}>
                        <span className="msg-reply-author">{msg.replyTo.isMe ? 'You' : msg.replyTo.sender}</span>
                        <span className="msg-reply-text">{msg.replyTo.text.slice(0, 80)}{msg.replyTo.text.length > 80 ? '…' : ''}</span>
                      </div>
                    )}
                    <span className="msg-bubble-text">{msg.text}</span>
                    {msg.edited && <span className="msg-edited">(edited)</span>}
                  </div>
                  <div className="msg-meta">
                    <span className="msg-time">{msg.time}</span>
                    {msg.isMe && msg.receipt === 'read' && <CheckDoubleIcon read={true} />}
                    {msg.isMe && msg.receipt === 'delivered' && <CheckDoubleIcon read={false} />}
                    {msg.isMe && !msg.receipt && <CheckSentIcon />}
                  </div>

                  {/* Inline action menu on click */}
                  {actionTarget?.id === msg.id && (
                    <div className={`msg-action-menu${msg.isMe ? ' from-me' : ' from-them'}`} onClick={e => e.stopPropagation()}>
                      {thread.replyAllowed && (
                        <button onClick={() => { setReplyTo(msg); setActionTarget(null); inputRef.current?.focus() }}>
                          <ReplyIcon /> Reply
                        </button>
                      )}
                      {msg.isMe && (
                        <button onClick={() => { setEditing(msg); setInputText(msg.text); setReplyTo(null); setActionTarget(null); inputRef.current?.focus() }}>
                          <EditIcon /> Edit
                        </button>
                      )}
                      {msg.isMe && (
                        <button className="danger" onClick={() => {
                          setLocalMsgs(prev => prev.filter(m => m.id !== msg.id))
                          setActionTarget(null)
                        }}>
                          <DeleteIcon /> Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Reply strip */}
      {replyTo && !editing && (
        <div className="msg-context-strip">
          <div className="msg-context-bar reply" />
          <div className="msg-context-body">
            <span className="msg-context-label">Replying to {replyTo.isMe ? 'yourself' : replyTo.sender}</span>
            <span className="msg-context-preview">{replyTo.text.slice(0, 100)}{replyTo.text.length > 100 ? '…' : ''}</span>
          </div>
          <button className="msg-context-close" onClick={() => setReplyTo(null)}>
            <CloseIcon size={16} />
          </button>
        </div>
      )}

      {/* Edit strip */}
      {editing && (
        <div className="msg-context-strip editing">
          <div className="msg-context-bar edit" />
          <div className="msg-context-body">
            <span className="msg-context-label">Editing message</span>
            <span className="msg-context-preview">{editing.text.slice(0, 100)}{editing.text.length > 100 ? '…' : ''}</span>
          </div>
          <button className="msg-context-close" onClick={() => { setEditing(null); setInputText('') }}>
            <CloseIcon size={16} />
          </button>
        </div>
      )}

      {/* One-way notice */}
      {!thread.replyAllowed && (
        <div className="msg-broadcast-notice">
          <BroadcastIcon size={16} />
          <span>Employee replies will appear as new threads in your inbox.</span>
        </div>
      )}

      {/* Compose bar */}
      <div className="msg-compose-bar" onClick={e => e.stopPropagation()}>
        <div className="msg-compose-input-wrap">
          <input
            ref={inputRef}
            className="msg-compose-input"
            placeholder={thread.isBroadcast ? 'Send another broadcast message...' : 'Reply to this thread...'}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          />
        </div>
        <button
          className={`msg-send-btn${inputText.trim() ? ' active' : ''}`}
          onClick={handleSend}
          disabled={!inputText.trim()}
        >
          <SendIcon />
        </button>
      </div>
    </div>
  )
}

// ─── Compose View ──────────────────────────────────────────────

const INITIALS_COLORS = [
  { bg: '#e8e0f0', fg: '#5a3878' },
  { bg: '#ddeef8', fg: '#1a4a6e' },
  { bg: '#ddf0e8', fg: '#1a5a36' },
  { bg: '#f8eedc', fg: '#6e4210' },
  { bg: '#f0dde8', fg: '#6e1a3c' },
  { bg: '#ddf0ee', fg: '#1a5a52' },
]

function ComposeView({ onSend, onCancel }) {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [selectedCarers, setSelectedCarers] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [recipientSearch, setRecipientSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [dropdownTab, setDropdownTab] = useState('carers')
  const dropdownRef = useRef(null)

  const allCarersSelected = selectedCarers.length === CARERS.length
  const isBroadcast = allCarersSelected || selectedTags.length > 0

  const filteredCarers = CARERS
    .filter(c => c.name.toLowerCase().includes(recipientSearch.toLowerCase()))
    .sort((a, b) => a.name.split(' ').at(-1).localeCompare(b.name.split(' ').at(-1)))

  const filteredTagTypes = TAG_TYPES.map(type => ({
    ...type,
    tags: TAGS.filter(tag =>
      tag.typeId === type.id &&
      tag.name.toLowerCase().includes(recipientSearch.toLowerCase())
    ),
  })).filter(type => type.tags.length > 0)

  const hasRecipients = selectedCarers.length > 0 || isBroadcast
  const canSend = title.trim() && message.trim() && hasRecipients

  // Selecting individual employees: multi-select allowed, clears tags (mutually exclusive with broadcast)
  const toggleCarer = (carer) => {
    setSelectedTags([])
    setSelectedCarers(prev =>
      prev.some(c => c.id === carer.id) ? prev.filter(c => c.id !== carer.id) : [...prev, carer]
    )
  }

  // Selecting a group switches to broadcast mode (clears individual selection)
  const toggleTag = (tag) => {
    setSelectedCarers([])
    setSelectedTags(prev =>
      prev.some(t => t.id === tag.id) ? prev.filter(t => t.id !== tag.id) : [...prev, tag]
    )
  }

  // Selecting all employees switches to broadcast mode (clears tags)
  const selectAllCarers = () => {
    setSelectedTags([])
    setSelectedCarers(allCarersSelected ? [] : CARERS)
  }

  const clearAll = () => {
    setSelectedCarers([])
    setSelectedTags([])
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="msg-compose-view">
      <div className="msg-compose-header">
        <h2>New Message</h2>
        <button className="msg-compose-cancel" onClick={onCancel}>
          <CloseIcon size={20} />
        </button>
      </div>

      <div className="msg-compose-form">

        {/* To field */}
        <div className="msg-compose-field">
          <label className="msg-compose-label">To</label>
          <div className="msg-compose-to-wrap" ref={dropdownRef}>
            <div className="msg-compose-to-inner">
              {/* All employees chip */}
              {allCarersSelected && (
                <span className="msg-compose-chip msg-compose-chip-broadcast">
                  <BroadcastIcon size={11} />
                  All employees
                  <button onClick={() => setSelectedCarers([])} className="msg-chip-remove">
                    <CloseIcon size={12} />
                  </button>
                </span>
              )}
              {/* Tag chips */}
              {!allCarersSelected && selectedTags.map(tag => (
                <span key={tag.id} className="msg-compose-chip msg-compose-chip-broadcast">
                  <BroadcastIcon size={11} />
                  {tag.name} · {tag.memberCount}
                  <button onClick={() => toggleTag(tag)} className="msg-chip-remove">
                    <CloseIcon size={12} />
                  </button>
                </span>
              ))}
              {/* Individual employee chips */}
              {!allCarersSelected && selectedTags.length === 0 && (() => {
                const LIMIT = 4
                const visible = selectedCarers.slice(0, LIMIT)
                const overflow = selectedCarers.length - LIMIT
                return (
                  <>
                    {visible.map(c => (
                      <span key={c.id} className="msg-compose-chip">
                        {c.name}
                        <button onClick={() => toggleCarer(c)} className="msg-chip-remove">
                          <CloseIcon size={12} />
                        </button>
                      </span>
                    ))}
                    {overflow > 0 && <span className="msg-compose-chip msg-chip-overflow">+{overflow} more</span>}
                  </>
                )
              })()}
              <input
                className="msg-compose-to-input"
                placeholder={!hasRecipients ? 'Search for an employee or group...' : ''}
                value={recipientSearch}
                onChange={e => { setRecipientSearch(e.target.value); setShowDropdown(true) }}
                onFocus={() => setShowDropdown(true)}
              />
            </div>
            {showDropdown && (
              <div className="msg-carer-dropdown">
                <div className="msg-dropdown-tabs">
                  <button
                    className={`msg-dropdown-tab${dropdownTab === 'carers' ? ' active' : ''}`}
                    onMouseDown={e => { e.preventDefault(); setDropdownTab('carers') }}
                  ><PersonIcon size={16} />Individual</button>
                  <button
                    className={`msg-dropdown-tab${dropdownTab === 'groups' ? ' active' : ''}`}
                    onMouseDown={e => { e.preventDefault(); setDropdownTab('groups') }}
                  ><BroadcastIcon size={16} />Broadcast</button>
                </div>

                {dropdownTab === 'carers' && (
                  <>
                    {filteredCarers.map(c => {
                      const palette = INITIALS_COLORS[c.id % INITIALS_COLORS.length]
                      const isSelected = selectedCarers.some(s => s.id === c.id)
                      return (
                        <div key={c.id} className="msg-carer-option" onClick={() => toggleCarer(c)}>
                          <input type="checkbox" className="msg-option-checkbox" checked={isSelected} onChange={() => {}} />
                          <div className="msg-carer-avatar" style={{ background: palette.bg, color: palette.fg }}>
                            {c.initials}
                          </div>
                          <span>{c.name}</span>
                        </div>
                      )
                    })}
                    {filteredCarers.length === 0 && <div className="msg-dropdown-empty">No employees found</div>}
                  </>
                )}

                {dropdownTab === 'groups' && (
                  <>
                    {!recipientSearch && (
                      <div className="msg-carer-option msg-carer-option-all" onClick={selectAllCarers}>
                        <input type="checkbox" className="msg-option-checkbox" checked={allCarersSelected} onChange={() => {}} />
                        <div className="msg-carer-avatar" style={{ background: '#e8e0f0', color: '#5a3878' }}>
                          <BroadcastIcon size={16} />
                        </div>
                        <div className="msg-tag-option-body">
                          <span>All employees</span>
                          <span className="msg-tag-member-count">{CARERS.length} employees</span>
                        </div>
                      </div>
                    )}
                    {filteredTagTypes.length > 0 ? filteredTagTypes.map(type => (
                      <div key={type.id}>
                        <div className="msg-dropdown-type-header">{type.name}</div>
                        {type.tags.map(tag => {
                          const isSelected = selectedTags.some(s => s.id === tag.id)
                          return (
                            <div key={tag.id} className="msg-carer-option" onClick={() => toggleTag(tag)}>
                              <input type="checkbox" className="msg-option-checkbox" checked={isSelected} onChange={() => {}} />
                              <div className="msg-carer-avatar" style={{ background: '#e8e0f0', color: '#5a3878' }}>
                                <GroupIcon size={16} />
                              </div>
                              <div className="msg-tag-option-body">
                                <span>{tag.name}</span>
                                <span className="msg-tag-member-count">{tag.memberCount} employees</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )) : (
                      recipientSearch && <div className="msg-dropdown-empty">No groups found</div>
                    )}
                  </>
                )}

                {hasRecipients && (
                  <div className="msg-dropdown-clear">
                    <button onMouseDown={e => { e.preventDefault(); clearAll() }}>Clear</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Multi-carer notice */}
          {!isBroadcast && selectedCarers.length > 1 && (
            <div className="msg-broadcast-mode-notice">
              <PersonIcon size={14} />
              <span>Sending to {selectedCarers.length} employees as separate conversations. Each will receive their own thread and replies will come back individually.</span>
            </div>
          )}
          {/* Broadcast mode notice */}
          {isBroadcast && (
            <div className="msg-broadcast-mode-notice">
              <BroadcastIcon size={14} />
              <span>Broadcast — employees will receive this individually. Replies will start new threads in your inbox.</span>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="msg-compose-field">
          <label className="msg-compose-label">Subject <span className="msg-required">*</span></label>
          <input
            className="form-input"
            placeholder="What is this message about?"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        {/* Message */}
        <div className="msg-compose-field msg-compose-field-grow">
          <label className="msg-compose-label">Message <span className="msg-required">*</span></label>
          <textarea
            className="msg-compose-textarea"
            placeholder="Write your message..."
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="msg-compose-actions">
          <button className="round-btn tertiary-btn" onClick={onCancel}>Cancel</button>
          <button
            className="round-btn primary-btn btn-icon-right"
            disabled={!canSend}
            onClick={() => canSend && onSend({ title, recipients: selectedCarers, tags: selectedTags, message, isBroadcast })}
          >
            {isBroadcast ? 'Send broadcast' : 'Send'} <SendIcon />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Empty State ───────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="msg-empty-state">
      <div className="msg-empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
      </div>
      <p>Select a conversation or start a new message</p>
    </div>
  )
}

// ─── Root ──────────────────────────────────────────────────────

export default function App() {
  const [threads, setThreads] = useState(THREADS)
  const [threadMessages, setThreadMessages] = useState(THREAD_MESSAGES)
  const [activeThreadId, setActiveThreadId] = useState(null)
  const [rightPanel, setRightPanel] = useState('empty')
  const [search, setSearch] = useState('')

  const totalUnread = threads.reduce((sum, t) => sum + t.unread, 0)
  const activeThread = threads.find(t => t.id === activeThreadId)
  const activeMessages = activeThread ? (threadMessages[activeThreadId] || []) : []

  const handleSelectThread = (id) => {
    setActiveThreadId(id)
    setRightPanel('thread')
    setThreads(prev => prev.map(t => t.id === id ? { ...t, unread: 0 } : t))
  }

  const handleSend = (text) => {
    const wasClosed = threads.find(t => t.id === activeThreadId)?.closed
    const now = Date.now()
    setThreads(prev => prev.map(t =>
      t.id === activeThreadId
        ? { ...t, lastSender: 'Office', lastMessage: text, time: 'Just now', unread: 0, ...(wasClosed ? { closed: false } : {}) }
        : t
    ))
    setThreadMessages(prev => {
      const existing = prev[activeThreadId] || []
      const additions = wasClosed
        ? [
            { id: now, type: 'event', text: 'This thread has been reopened', time: 'Just now', day: 'Today' },
            { id: now + 1, isMe: true, text, time: 'Just now', day: 'Today' },
          ]
        : [{ id: now, isMe: true, text, time: 'Just now', day: 'Today' }]
      return { ...prev, [activeThreadId]: [...existing, ...additions] }
    })
  }

  const handleClose = () => {
    const isClosed = threads.find(t => t.id === activeThreadId)?.closed
    setThreads(prev => prev.map(t =>
      t.id === activeThreadId ? { ...t, closed: !t.closed } : t
    ))
    setThreadMessages(prev => ({
      ...prev,
      [activeThreadId]: [
        ...(prev[activeThreadId] || []),
        { id: Date.now(), type: 'event', text: isClosed ? 'This thread has been reopened' : 'This thread has been closed', time: 'Just now', day: 'Today' },
      ],
    }))
    setActiveThreadId(null)
    setRightPanel('empty')
  }

  const handleMarkUnread = () => {
    setThreads(prev => prev.map(t =>
      t.id === activeThreadId ? { ...t, unread: 1 } : t
    ))
  }

  const handleNewMessage = ({ title, recipients, tags, message, isBroadcast }) => {
    const baseId = Math.max(...threads.map(t => t.id)) + 1

    if (isBroadcast) {
      const participantsSummary = tags.length > 0
        ? tags.map(t => `${t.name} · ${t.memberCount} employees`).join(', ')
        : `All employees · ${CARERS.length} employees`
      const newThread = {
        id: baseId,
        title,
        isGroup: false,
        isBroadcast: true,
        replyAllowed: false,
        participants: participantsSummary,
        participantList: tags.map(t => t.name),
        lastSender: 'Office',
        lastMessage: message,
        time: 'Just now',
        unread: 0,
        closed: false,
      }
      setThreads(prev => [newThread, ...prev])
      setThreadMessages(prev => ({
        ...prev,
        [baseId]: [{ id: 1, isMe: true, text: message, time: 'Just now', day: 'Today' }],
      }))
      setActiveThreadId(baseId)
      setRightPanel('thread')
    } else {
      // Create one 1:1 thread per recipient
      const newThreads = recipients.map((r, i) => ({
        id: baseId + i,
        title,
        isGroup: false,
        isBroadcast: false,
        replyAllowed: recipients.length === 1,
        participants: r.name,
        participantList: [r.name],
        lastSender: 'Office',
        lastMessage: message,
        time: 'Just now',
        unread: 0,
        closed: false,
      }))
      const newMessages = Object.fromEntries(
        newThreads.map(t => [t.id, [{ id: 1, isMe: true, text: message, time: 'Just now', day: 'Today' }]])
      )
      setThreads(prev => [...newThreads, ...prev])
      setThreadMessages(prev => ({ ...prev, ...newMessages }))
      // Open the first thread
      setActiveThreadId(baseId)
      setRightPanel('thread')
    }
  }

  return (
    <div className="messages-page">
      <a href="../../" className="back-link">
        <ChevronLeftIcon /> Prototypes
      </a>
      <WebNav activePage="messages" unreadMessages={totalUnread} />
      <div className="messages-layout">
        <Sidebar
          threads={threads}
          activeThreadId={activeThreadId}
          search={search}
          onSearch={setSearch}
          onSelectThread={handleSelectThread}
          onCompose={() => { setActiveThreadId(null); setRightPanel('compose') }}
        />
        <div className="msg-main">
          {rightPanel === 'empty' && <EmptyState />}
          {rightPanel === 'thread' && activeThread && (
            <ThreadView
              key={activeThreadId}
              thread={activeThread}
              messages={activeMessages}
              onSend={handleSend}
              onClose={handleClose}
              onMarkUnread={handleMarkUnread}
            />
          )}
          {rightPanel === 'compose' && (
            <ComposeView
              onSend={handleNewMessage}
              onCancel={() => setRightPanel('empty')}
            />
          )}
        </div>
      </div>
    </div>
  )
}
