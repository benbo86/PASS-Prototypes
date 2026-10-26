import { useEffect, useRef, useState } from 'react'
import Tooltip from './Tooltip'
import { researchForCurrentPage, researchHref } from './researchLinks'

const ResearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    <path d="M9 7h7" />
    <path d="M9 11h5" />
  </svg>
)

// Dev toolbar button linking to this prototype's research pages (see
// researchLinks.js). Rendered by DevToolbar itself, so prototypes don't
// wire it. Hidden when the page has no research. One page opens directly
// in a new tab; several open a small menu.
export default function ResearchLink() {
  const links = researchForCurrentPage()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function onDown(e) { if (!wrapRef.current?.contains(e.target)) setOpen(false) }
    function onKey(e) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (links.length === 0) return null

  if (links.length === 1) {
    return (
      <Tooltip text={`Research — ${links[0].title}`} placement="bottom">
        <a className="dev-toolbar-icon-btn research-link" href={researchHref(links[0])} target="_blank" rel="noreferrer" aria-label="Research">
          <ResearchIcon />
        </a>
      </Tooltip>
    )
  }

  return (
    <div className="research-link-wrap" ref={wrapRef}>
      <Tooltip text="Research" placement="bottom">
        <button type="button" className={`dev-toolbar-icon-btn research-link${open ? ' active' : ''}`} onClick={() => setOpen(o => !o)} aria-label="Research">
          <ResearchIcon />
        </button>
      </Tooltip>
      {open && (
        <div className="research-menu">
          {links.map(link => (
            <a key={link.href} className="research-menu-item" href={researchHref(link)} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>
              {link.title}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
