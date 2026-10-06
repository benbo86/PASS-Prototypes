import { useEffect } from 'react'

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <polygon points="18 7.2 16.8 6 12 10.8 7.2 6 6 7.2 10.8 12 6 16.8 7.2 18 12 13.2 16.8 18 18 16.8 13.2 12" fill="currentColor" stroke="currentColor" strokeLinejoin="round"/>
  </svg>
)

// className is optional — added to .slide-panel for a per-prototype width
// override (e.g. roster-settings' 70%-wide panels). Defaults to the 937px panel.
export default function SlidePanel({ open, onClose, title, children, footer, className }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="slide-panel-overlay" onClick={onClose}>
      <div className={`slide-panel${className ? ` ${className}` : ''}`} onClick={e => e.stopPropagation()}>
        <div className="slide-panel-header">
          <h1 className="slide-panel-title">{title}</h1>
          <button className="slide-panel-close" onClick={onClose} aria-label="Close panel">
            <CloseIcon />
          </button>
        </div>
        <div className="slide-panel-body">
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
