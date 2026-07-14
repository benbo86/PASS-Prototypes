import { useState, useEffect, useRef } from 'react'

// Ported from NewInfoNav/CustomerInfoNav.tsx (another prototype's stack:
// Tailwind + react-router + lucide). Reworked to this project's conventions:
// CSS-variable styling (customer-profile-nav.css), inline SVGs, and
// window.location navigation instead of a client-side router. Keeps the
// existing customer + tab hrefs so all customer-profile pages stay wired up.

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
    <path d="M12 21s-7.5-4.9-10-9.5C.5 8.2 2.2 4.5 5.8 4.5c2 0 3.4 1.1 4.2 2.3.8-1.2 2.2-2.3 4.2-2.3 3.6 0 5.3 3.7 3.8 7C19.5 16.1 12 21 12 21Z" />
  </svg>
)

const PRIMARY_TABS = [
  { label: 'Dashboard', href: null },
  { label: 'Care Management', href: null },
  { label: 'Care Notes', href: null },
  { label: 'MAR Chart', href: '../mar-chart/' },
  { label: 'Timeline', href: '../timeline/' },
  { label: 'Documents', href: '../assessments/' },
  { label: 'About Me', href: null },
  { label: 'Details', href: null },
  { label: 'Checklists', href: null },
  { label: 'Rostering', href: null },
  { label: 'Communications', href: null },
  { label: 'Medical History', href: null },
  { label: 'Customer File', href: null },
  { label: 'openPASS', href: null },
]

export default function CustomerProfileNav({ activeTab }) {
  // Condense the customer info once the page scrolls past the header.
  const [scrolled, setScrolled] = useState(false)
  const barRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Publish the bar's live height as --ctx-bar-height so pages that pin
  // content below it (e.g. the timeline's sticky day headers) can track it
  // through both the full and condensed states instead of hard-coding an
  // offset. ResizeObserver catches the condense transition frame-by-frame.
  useEffect(() => {
    const el = barRef.current
    if (!el) return
    const setVar = () =>
      document.documentElement.style.setProperty('--ctx-bar-height', `${el.offsetHeight}px`)
    setVar()
    const ro = new ResizeObserver(setVar)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={barRef} className={`context-bar${scrolled ? ' context-bar--scrolled' : ''}`}>
      <div className="context-top">
        <div className="context-avatar">PA</div>
        <div className="context-info">
          <div className="context-name-row">
            <h1 className="context-name">Mrs Patricia 'Pat' Allin</h1>
            <span className="ctx-badge ctx-badge--danger"><HeartIcon /> DNACPR</span>
            <span className="ctx-badge ctx-badge--danger">HIGH RISK</span>
            <span className="ctx-badge ctx-badge--success">ACTIVE</span>
          </div>

          {/* Full details (two rows) — shown when not scrolled */}
          <div className="context-details-full">
            <div className="context-details">
              <span><span className="detail-label">Tel:</span> 0208 505 0682</span>
              <span className="detail-sep">•</span>
              <span><span className="detail-label">DOB:</span> 12/12/1945</span>
            </div>
            <div className="context-address">3 Morgan Way, Woodford Green, IG8 8DL</div>
          </div>

          {/* Condensed single line — shown when scrolled */}
          <div className="context-details-condensed">
            <p>0208 505 0682 &nbsp;·&nbsp; DOB: 12/12/1945 &nbsp;·&nbsp; 3 Morgan Way, Woodford Green, IG8 8DL</p>
          </div>
        </div>
      </div>

      <div className="primary-tabs-wrap">
        <ul className="primary-tabs">
          {PRIMARY_TABS.map(({ label, href }) => (
            <li key={label} className={label === activeTab ? 'active' : ''}>
              <button
                onClick={() => href && (window.location.href = href)}
                style={!href ? { opacity: 0.4, cursor: 'default' } : undefined}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
