const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <polygon fill="currentColor" stroke="currentColor" strokeLinejoin="round"
      points="18 7.2 16.8 6 12 10.8 7.2 6 6 7.2 10.8 12 6 16.8 7.2 18 12 13.2 16.8 18 18 16.8 13.2 12" />
  </svg>
)

export default function Modal({ onClose, title, children }) {
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box">
        <button className="modal-close-btn" aria-label="Close" onClick={onClose}>
          <CloseIcon />
        </button>
        {title && <div className="modal-title">{title}</div>}
        {children}
      </div>
    </div>
  )
}
