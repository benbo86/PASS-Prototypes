import { useEffect, useRef, useState } from 'react'
import { researchForCurrentPage, researchHref } from './researchLinks'

const ResearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    <path d="M9 7h7" />
    <path d="M9 11h5" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
)

// Dev toolbar link to this prototype's research pages (see
// researchLinks.js). Rendered by DevToolbar itself, so prototypes don't
// wire it: at the far left of the web bar, kept apart from the tools as
// it's something to read rather than a mode, and labelled, since an icon
// alone was easy to miss. Hidden when the page has no research. One page
// opens directly in a new tab; several open a small menu.
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
      <a className="dev-toolbar-text-btn research-link" href={researchHref(links[0])} target="_blank" rel="noreferrer">
        <ResearchIcon />
        Research
      </a>
    )
  }

  return (
    <div className="research-link-wrap" ref={wrapRef}>
      <button type="button" className={`dev-toolbar-text-btn research-link${open ? ' active' : ''}`} onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <ResearchIcon />
        Research
        <ChevronDownIcon />
      </button>
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
