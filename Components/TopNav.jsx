import { useState, useEffect, useRef } from 'react'

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
const PassGeniusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 18V5" />
    <path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4" />
    <path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5" />
    <path d="M17.997 5.125a4 4 0 0 1 2.526 5.77" />
    <path d="M18 18a4 4 0 0 0 2-7.464" />
    <path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517" />
    <path d="M6 18a4 4 0 0 1-2-7.464" />
    <path d="M6.003 5.125a4 4 0 0 0-2.526 5.77" />
  </svg>
)
const HelpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
)
const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.925 20.056a6 6 0 0 0-11.851.001" />
    <circle cx="12" cy="11" r="4" />
    <circle cx="12" cy="12" r="10" />
  </svg>
)
// Carried over from the legacy WebNav (not part of the "PASS nav new" export set).
const MessagesIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
  </svg>
)

// ─── Component ─────────────────────────────────────────────────

export default function TopNav({ activeItem, unreadMessages = 0, onLogout }) {
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
      <button className="top-nav-icon-btn" title="PASSgenius">
        <PassGeniusIcon />
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
      <div className="top-nav-profile" ref={menuRef}>
        <button
          className={`top-nav-icon-btn${menuOpen ? ' active' : ''}`}
          title="Profile"
          onClick={() => setMenuOpen(o => !o)}
        >
          <ProfileIcon />
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
