export default function StatusBar() {
  return (
    <div className="status-bar">
      <span className="status-time">9:41</span>
      <div className="status-icons">
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
          <rect x="0" y="4" width="3" height="8" rx="0.5"/>
          <rect x="4.5" y="2.5" width="3" height="9.5" rx="0.5"/>
          <rect x="9" y="1" width="3" height="11" rx="0.5"/>
          <rect x="13.5" y="0" width="3" height="12" rx="0.5" opacity="0.3"/>
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <path d="M8 2.4C10.5 2.4 12.7 3.5 14.2 5.2L15.8 3.4C13.8 1.3 11 0 8 0 5 0 2.2 1.3.2 3.4l1.6 1.8C3.3 3.5 5.5 2.4 8 2.4z" opacity="0.3"/>
          <path d="M8 5C9.7 5 11.2 5.7 12.3 6.8L13.9 5C12.3 3.5 10.3 2.5 8 2.5 5.7 2.5 3.7 3.5 2.1 5l1.6 1.8C4.8 5.7 6.3 5 8 5z"/>
          <circle cx="8" cy="10" r="2"/>
        </svg>
        <svg width="26" height="13" viewBox="0 0 26 13" fill="currentColor">
          <rect x="0.5" y="0.5" width="21" height="12" rx="2.5" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
          <rect x="1.5" y="1.5" width="19" height="10" rx="2" opacity="0.9"/>
          <path d="M23 4.5v4a2 2 0 000-4z" opacity="0.5"/>
        </svg>
      </div>
    </div>
  )
}
