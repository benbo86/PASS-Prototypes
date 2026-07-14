import { useState, useEffect, useRef } from 'react'
import passgeniusUrl from '../Images/passgenius.svg'

// ─── Nav icons ────────────────────────────────────────────────
// Copied verbatim from Icons/PASS nav new/*.svg (Lucide icons), just with
// the per-path hardcoded stroke="#9CA3AF" removed so they inherit
// stroke="currentColor" from the wrapping <svg>.

const JournalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 21h8" />
    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
  </svg>
)
const HelpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
)
// Profile avatar initials — mirrors the employees card convention
// (web/employees): strip titles, then first initial of first + last name.
function initials(name) {
  const parts = name.split(' ').filter(p => !/^(Mr|Mrs|Miss|Ms|Prof|Madam)\.?$/i.test(p))
  return ((parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '')).toUpperCase()
}
// Carried over from the legacy WebNav (not part of the "PASS nav new" export set).
const MessagesIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
  </svg>
)

// ─── Component ─────────────────────────────────────────────────

export default function TopNav({ activeItem, unreadMessages = 0, onLogout, userName = 'Alex Morgan', userAvatar }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  return (
    <div className="top-nav">
      <button className="top-nav-icon-btn" title="Journal">
        <JournalIcon />
      </button>
      <button
        className={`top-nav-icon-btn${activeItem === 'messages' ? ' active' : ''}`}
        title="Messages"
        onClick={() => { window.location.href = '../../web/messaging/' }}
      >
        <MessagesIcon />
        {unreadMessages > 0 && (
          <span className="top-nav-badge">{unreadMessages}</span>
        )}
      </button>
      <button className="top-nav-icon-btn" title="Help & training">
        <HelpIcon />
      </button>
      <button className="top-nav-icon-btn top-nav-genius-btn" title="PASSgenius">
        <object
          className="top-nav-genius"
          type="image/svg+xml"
          data={passgeniusUrl}
          aria-label="PASSgenius"
          tabIndex={-1}
        />
      </button>
      <div className="top-nav-profile" ref={menuRef}>
        <button
          className={`top-nav-icon-btn top-nav-profile-btn${menuOpen ? ' active' : ''}`}
          title={userName}
          onClick={() => setMenuOpen(o => !o)}
        >
          {userAvatar
            ? <img className="top-nav-avatar" src={userAvatar} alt="" />
            : <span className="top-nav-avatar">{initials(userName)}</span>}
        </button>
        {menuOpen && (
          <div className="top-nav-profile-menu">
            <button
              className="top-nav-profile-item"
              onClick={() => { setMenuOpen(false); onLogout?.() }}
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
