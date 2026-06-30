import { useEffect } from 'react'

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
)

export default function SlidePanel({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="slide-panel-overlay" onClick={onClose}>
      <div className="slide-panel" onClick={e => e.stopPropagation()}>
        <div className="slide-panel-header">
          <h2 className="slide-panel-title">{title}</h2>
          <button className="slide-panel-close" onClick={onClose} aria-label="Close panel">
            <CloseIcon />
          </button>
        </div>
        <div className="slide-panel-body" style={{ background: 'var(--ui-purple-7-lightest-lavendar)' }}>
          {children}
        </div>
        {footer && (
          <div className="slide-panel-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
