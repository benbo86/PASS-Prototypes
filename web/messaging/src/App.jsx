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
const ArchiveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/>
  </svg>
)
const MailUnreadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
)
const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M12,2 C17.52,2 22,6.48 22,12 C22,17.52 17.52,22 12,22 C6.48,22 2,17.52 2,12 C2,6.48 6.48,2 12,2 Z M10.67,9.94 L10.58,9.94 C10.11,9.94 9.73,10.32 9.73,10.79 C9.73,11.27 10.11,11.65 10.58,11.65 L10.67,11.65 L10.67,16.63 L10.58,16.63 C10.11,16.63 9.73,17.02 9.73,17.49 C9.73,17.96 10.11,18.35 10.58,18.35 L13.42,18.35 C13.89,18.35 14.27,17.96 14.27,17.49 C14.27,17.02 13.89,16.63 13.42,16.63 L13.34,16.63 L13.34,10.94 C13.34,10.38 12.89,9.94 12.34,9.94 L10.67,9.94 Z M11.87,5.65 C11,5.65 10.3,6.35 10.3,7.22 C10.3,8.09 11,8.79 11.87,8.79 C12.74,8.79 13.44,8.09 13.44,7.22 C13.44,6.35 12.74,5.65 11.87,5.65 Z"/>
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
const ChevronDownIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
  </svg>
)
const ChevronUpIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"/>
  </svg>
)
const TickIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
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

const THREADS = [
  {
    id: 1,
    title: 'Blue Bird Sheffield — Team Update',
    isGroup: true,
    participants: 'Sarah M., Karen B. +13',
    participantList: ['Sarah Mitchell', 'Karen Bailey', 'Tom Harris', 'Priya Sharma', 'James Okafor', 'Linda Peters', 'David Chen', 'Emma Richardson', 'Michael Hughes', 'Olivia Brooks', 'Nathan Wells', 'Chloe Barker', 'Ryan Sutton', 'Fiona Marsh', 'Callum Reid'],
    lastSender: 'Sarah Mitchell',
    lastMessage: "Just a reminder the weekly handover meeting is Thursday at 4pm. Please make sure your visit notes are up to date beforehand.",
    time: '10:42 AM',
    unread: 3,
    archived: false,
  },
  {
    id: 2,
    title: 'Medication Query',
    isGroup: false,
    participants: 'Adrianna Jackson',
    participantList: ['Adrianna Jackson'],
    lastSender: 'Adrianna Jackson',
    lastMessage: "Hi Karen, yes I was there until 5pm and she did take all her medication.",
    time: '9:15 AM',
    unread: 1,
    archived: false,
  },
  {
    id: 3,
    title: 'Friday Shift — Swap Request',
    isGroup: false,
    participants: 'Adrianna Jackson',
    participantList: ['Adrianna Jackson'],
    lastSender: 'Office',
    lastMessage: "No problem at all Adrianna, we'll sort it. Tom will cover your Friday 6th visit.",
    time: 'Yesterday',
    unread: 0,
    archived: false,
  },
  {
    id: 4,
    title: 'Annual Leave — July',
    isGroup: false,
    participants: 'Adrianna Jackson',
    participantList: ['Adrianna Jackson'],
    lastSender: 'Adrianna Jackson',
    lastMessage: "I'd like to request annual leave from 14th July to 18th July if possible.",
    time: 'Mon',
    unread: 0,
    archived: false,
  },
  {
    id: 5,
    title: 'Attachment Examples',
    isGroup: false,
    participants: 'Adrianna Jackson',
    participantList: ['Adrianna Jackson'],
    lastSender: 'Office',
    lastMessage: 'Please see the training video above.',
    time: '10:35 AM',
    unread: 0,
    archived: false,
  },
]

const THREAD_MESSAGES = {
  1: [
    { id: 1, isMe: true, text: "Hi team, just a reminder that we have a new care plan in place for all Blue Bird residents. Please review the updated notes before your next visits.", time: '2:00 PM', day: 'Monday' },
    { id: 2, isMe: true, text: "Also, please note that parking on Station Road is restricted from next week. Plan your journeys accordingly.", time: '2:01 PM', day: 'Monday' },
    { id: 3, isMe: false, sender: 'Sarah Mitchell', text: "Thanks, noted. Will there be updated route suggestions shared?", time: '3:14 PM', day: 'Monday', receipt: 'read' },
    { id: 4, isMe: true, text: "Yes, we'll share those by end of the week.", time: '3:20 PM', day: 'Monday' },
    { id: 5, isMe: false, sender: 'Sarah Mitchell', text: "Just a reminder the weekly handover meeting is Thursday at 4pm. Please make sure your visit notes are up to date beforehand.", time: '10:42 AM', day: 'Today' },
  ],
  2: [
    { id: 1, isMe: true, text: "Hi Adrianna, I wanted to check in about Margaret Thompson's care visit yesterday. Did she take her evening medication? She mentioned to her son that she thought she might have missed it.", time: '2:34 PM', day: 'Yesterday' },
    { id: 2, isMe: false, sender: 'Adrianna Jackson', text: "Hi Karen, yes I was there until 5pm and she did take all her medication. I've attached my signed visit notes for reference.", time: '2:47 PM', day: 'Yesterday', receipt: 'read' },
    { id: 3, isMe: true, text: "That's great, thank you! Her son has been a bit worried. Could you also let me know if she mentions any pain during your next visit? She has a GP appointment on Thursday.", time: '2:52 PM', day: 'Yesterday' },
    { id: 4, isMe: true, text: "Morning Adrianna, just a follow up on Margaret. Did you manage to speak with her son at the visit? We received a call from him this morning.", time: '9:15 AM', day: 'Today' },
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
    { id: 1, isMe: true, text: "Photo from our CQC inspection, well done everyone.", time: '10:01 AM', day: 'Today' },
    { id: 2, isMe: true, text: "Please make sure everyone watches the Moving and Handling Guide for Carers.", time: '10:30 AM', day: 'Today' },
    { id: 3, isMe: true, text: 'Please see the training video above.', time: '10:35 AM', day: 'Today' },
  ],
}

// ─── Thread Row ────────────────────────────────────────────────

function ThreadRow({ thread, isActive, onClick }) {
  const isUnread = thread.unread > 0
  return (
    <div
      className={`msg-thread-row${isActive ? ' active' : ''}${isUnread ? ' unread' : ''}`}
      onClick={onClick}
    >
      <div className={`msg-thread-avatar${thread.isGroup ? ' group' : ''}`}>
        {thread.isGroup ? <GroupIcon size={18} /> : <PersonIcon size={18} />}
      </div>
      <div className="msg-thread-body">
        <div className="msg-thread-top">
          <span className="msg-thread-name">{thread.title}</span>
          <span className="msg-thread-time">{thread.time}</span>
        </div>
        <div className="msg-thread-preview-row">
          <span className="msg-thread-preview">
            {!thread.isGroup && <span className="msg-thread-sender">{thread.lastSender}: </span>}
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
    const matchesTab = tab === 'inbox' ? !t.archived : t.archived
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
          className={`msg-sidebar-tab${tab === 'archived' ? ' active' : ''}`}
          onClick={() => setTab('archived')}
        >Archived</button>
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
            {tab === 'archived' ? 'No archived messages' : 'No messages found'}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Thread View ───────────────────────────────────────────────

function ThreadView({ thread, messages, onSend, onArchive, onMarkUnread }) {
  const [inputText, setInputText] = useState('')
  const [localMsgs, setLocalMsgs] = useState(messages)
  const [replyTo, setReplyTo] = useState(null)
  const [editing, setEditing] = useState(null)
  const [actionTarget, setActionTarget] = useState(null)
  const [showInfo, setShowInfo] = useState(false)
  const [participantList, setParticipantList] = useState(thread.participantList)
  const [addSearch, setAddSearch] = useState('')
  const [showAddDropdown, setShowAddDropdown] = useState(false)
  const endRef = useRef(null)
  const inputRef = useRef(null)
  const addRef = useRef(null)

  useEffect(() => {
    setLocalMsgs(messages)
    setParticipantList(thread.participantList)
    setEditing(null)
    setInputText('')
    setReplyTo(null)
  }, [thread.id])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [localMsgs.length, thread.id])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (addRef.current && !addRef.current.contains(e.target)) {
        setShowAddDropdown(false)
        setAddSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const availableCarers = CARERS.filter(c =>
    c.name.toLowerCase().includes(addSearch.toLowerCase()) &&
    !participantList.includes(c.name)
  )

  const appendEvent = (text) => {
    setLocalMsgs(prev => [...prev, { id: Date.now(), type: 'event', text, time: 'Just now', day: 'Today' }])
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  const handleAddParticipant = (carer) => {
    setParticipantList(prev => [...prev, carer.name])
    setAddSearch('')
    setShowAddDropdown(false)
    appendEvent(`You added ${carer.name}`)
  }

  const handleRemoveParticipant = (name) => {
    setParticipantList(prev => prev.filter(n => n !== name))
    appendEvent(`You removed ${name}`)
  }

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
    <div className="msg-thread-view" onClick={() => { setActionTarget(null); setShowInfo(false) }}>
      {/* Header */}
      <div className="msg-thread-header">
        <div className={`msg-thread-header-avatar${thread.isGroup ? ' group' : ''}`}>
          {thread.isGroup ? <GroupIcon size={20} /> : <PersonIcon size={20} />}
        </div>
        <div className="msg-thread-header-info">
          <span className="msg-thread-header-title">{thread.title}</span>
          <span className="msg-thread-header-sub">{thread.participants}</span>
        </div>
        <div className="msg-thread-header-actions">
          <button
            className="msg-header-action-btn"
            title="Mark as unread"
            onClick={e => { e.stopPropagation(); onMarkUnread?.() }}
          >
            <MailUnreadIcon />
            <span>Mark unread</span>
          </button>
          <button
            className="msg-header-action-btn"
            title={thread.archived ? 'Unarchive thread' : 'Archive thread'}
            onClick={e => { e.stopPropagation(); onArchive?.() }}
          >
            <ArchiveIcon />
            <span>{thread.archived ? 'Unarchive' : 'Archive'}</span>
          </button>
          <button
            className={`msg-header-action-btn icon-only${showInfo ? ' active' : ''}`}
            title="Thread info"
            onClick={e => { e.stopPropagation(); setShowInfo(s => !s) }}
          >
            <InfoIcon />
          </button>
        </div>
      </div>

      {/* Info panel */}
      {showInfo && (
        <div className="msg-info-panel" onClick={e => e.stopPropagation()}>
          <div className="msg-info-section">
            <span className="msg-info-label">Participants</span>
            <div className="msg-info-participants">
              {participantList.map((name, i) => (
                <span key={i} className="msg-info-chip">
                  {name}
                  {participantList.length > 1 && (
                    <button className="msg-chip-remove" onClick={() => handleRemoveParticipant(name)}>
                      <CloseIcon size={11} />
                    </button>
                  )}
                </span>
              ))}
              <div className="msg-add-participant" ref={addRef}>
                  <input
                    className="msg-add-participant-input"
                    placeholder="Add participant..."
                    value={addSearch}
                    onChange={e => { setAddSearch(e.target.value); setShowAddDropdown(true) }}
                    onFocus={() => setShowAddDropdown(true)}
                  />
                  {showAddDropdown && availableCarers.length > 0 && (
                    <div className="msg-carer-dropdown msg-add-dropdown">
                      {availableCarers.map(c => {
                        const palette = INITIALS_COLORS[c.id % INITIALS_COLORS.length]
                        return (
                          <div key={c.id} className="msg-carer-option" onClick={() => handleAddParticipant(c)}>
                            <div className="msg-carer-avatar" style={{ background: palette.bg, color: palette.fg }}>
                              {c.initials}
                            </div>
                            <span>{c.name}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="msg-messages-area" onClick={e => e.stopPropagation()}>
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
              const prev = group.msgs[i - 1]
              const showSender = !msg.isMe && thread.isGroup && (!prev || prev.sender !== msg.sender || prev.isMe)
              return (
                <div
                  key={msg.id}
                  className={`msg-message-group ${msg.isMe ? 'from-me' : 'from-them'}`}
                  onClick={e => { e.stopPropagation(); setActionTarget(actionTarget?.id === msg.id ? null : msg) }}
                >
                  {showSender && <div className="msg-sender-label">{msg.sender}</div>}
                  {replyTo?.id === msg.id && (
                    <div className="msg-reply-indicator" />
                  )}
                  <div className={`msg-bubble ${msg.isMe ? 'sent' : 'received'}`}>
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
                      <button onClick={() => { setReplyTo(msg); setActionTarget(null); inputRef.current?.focus() }}>
                        <ReplyIcon /> Reply
                      </button>
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

      {/* Compose bar */}
      <div className="msg-compose-bar" onClick={e => e.stopPropagation()}>
        <button className="msg-compose-attach" title="Attach file">
          <AttachIcon />
        </button>
        <div className="msg-compose-input-wrap">
          <input
            ref={inputRef}
            className="msg-compose-input"
            placeholder="Reply to this thread..."
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
  const [recipientSearch, setRecipientSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [attachments, setAttachments] = useState([])
  const dropdownRef = useRef(null)
  const fileInputRef = useRef(null)

  const filteredCarers = CARERS.filter(c =>
    c.name.toLowerCase().includes(recipientSearch.toLowerCase()) &&
    !selectedCarers.some(s => s.id === c.id)
  )

  const canSend = title.trim() && message.trim() && selectedCarers.length > 0

  const handleFileAttach = (e) => {
    const files = Array.from(e.target.files)
    setAttachments(prev => [...prev, ...files.map(f => ({ name: f.name }))])
    e.target.value = ''
  }

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const toggleCarer = (carer) => {
    setSelectedCarers(prev =>
      prev.some(c => c.id === carer.id)
        ? prev.filter(c => c.id !== carer.id)
        : [...prev, carer]
    )
    setRecipientSearch('')
    setShowDropdown(false)
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
              {selectedCarers.map((c, i) => (
                <span key={c.id} className="msg-compose-chip">
                  {c.name}
                  <button onClick={() => toggleCarer(c)} className="msg-chip-remove">
                    <CloseIcon size={12} />
                  </button>
                </span>
              ))}
              <input
                className="msg-compose-to-input"
                placeholder={selectedCarers.length === 0 ? 'Search for a carer...' : ''}
                value={recipientSearch}
                onChange={e => { setRecipientSearch(e.target.value); setShowDropdown(true) }}
                onFocus={() => setShowDropdown(true)}
              />
            </div>
            {showDropdown && filteredCarers.length > 0 && (
              <div className="msg-carer-dropdown">
                {filteredCarers.map(c => {
                  const palette = INITIALS_COLORS[c.id % INITIALS_COLORS.length]
                  return (
                    <div key={c.id} className="msg-carer-option" onClick={() => toggleCarer(c)}>
                      <div className="msg-carer-avatar" style={{ background: palette.bg, color: palette.fg }}>
                        {c.initials}
                      </div>
                      <span>{c.name}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
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

        {/* Attachments */}
        <div className="msg-compose-attachments">
          <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileAttach} multiple />
          <button type="button" className="msg-compose-attach-btn" onClick={() => fileInputRef.current.click()}>
            <AttachIcon /> Attach
          </button>
          {attachments.map((att, i) => (
            <span key={i} className="msg-compose-attachment-chip">
              <AttachIcon />
              <span className="msg-compose-attachment-name">{att.name}</span>
              <button className="msg-chip-remove" onClick={() => removeAttachment(i)}>
                <CloseIcon size={12} />
              </button>
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="msg-compose-actions">
          <button className="round-btn tertiary-btn" onClick={onCancel}>Cancel</button>
          <button
            className="round-btn primary-btn btn-icon-right"
            disabled={!canSend}
            onClick={() => canSend && onSend({ title, recipients: selectedCarers, message })}
          >
            Send <SendIcon />
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
    setThreads(prev => prev.map(t =>
      t.id === activeThreadId
        ? { ...t, lastSender: 'Office', lastMessage: text, time: 'Just now', unread: 0 }
        : t
    ))
    setThreadMessages(prev => ({
      ...prev,
      [activeThreadId]: [
        ...(prev[activeThreadId] || []),
        { id: Date.now(), isMe: true, text, time: 'Just now', day: 'Today' },
      ],
    }))
  }

  const handleArchive = () => {
    setThreads(prev => prev.map(t =>
      t.id === activeThreadId ? { ...t, archived: !t.archived } : t
    ))
    setActiveThreadId(null)
    setRightPanel('empty')
  }

  const handleMarkUnread = () => {
    setThreads(prev => prev.map(t =>
      t.id === activeThreadId ? { ...t, unread: 1 } : t
    ))
  }

  const handleNewMessage = ({ title, recipients, message }) => {
    const newId = Math.max(...threads.map(t => t.id)) + 1
    const newThread = {
      id: newId,
      title,
      isGroup: recipients.length > 1,
      participants: recipients.map(r => r.name).join(', '),
      participantList: recipients.map(r => r.name),
      lastSender: 'Office',
      lastMessage: message,
      time: 'Just now',
      unread: 0,
      archived: false,
    }
    setThreads(prev => [newThread, ...prev])
    setThreadMessages(prev => ({
      ...prev,
      [newId]: [{ id: 1, isMe: true, text: message, time: 'Just now', day: 'Today' }],
    }))
    setActiveThreadId(newId)
    setRightPanel('thread')
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
              onArchive={handleArchive}
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
