import { useState, useEffect, useRef } from 'react'

// Ported from NewInfoNav/CustomerInfoNav.tsx (another prototype's stack:
// Tailwind + react-router + lucide). Reworked to this project's conventions:
// CSS-variable styling (customer-profile-nav.css), inline SVGs, and
// window.location navigation instead of a client-side router. Keeps the
// existing customer + tab hrefs so all customer-profile pages stay wired up.

// Font Awesome "heartbeat" (fa-heartbeat / heart-pulse), solid style
const HeartbeatIcon = () => (
  <svg viewBox="0 0 512 512" width="12" height="12" fill="currentColor" aria-hidden="true">
    <path d="M228.3 469.1L47.6 300.4c-4.2-3.9-8.2-8.1-11.9-12.4l87 0c22.6 0 43-13.6 51.7-34.5l10.5-25.2 49.3 109.5c3.8 8.5 12.1 14 21.4 14.1s17.8-5 22-13.3L320 253.7l1.7 3.4c9.5 19 28.9 31 50.1 31l104.5 0c-3.7 4.3-7.7 8.5-11.9 12.4L283.7 469.1c-7.5 7-17.4 10.9-27.7 10.9s-20.2-3.9-27.7-10.9zM503.7 240l-132 0c-3 0-5.8-1.7-7.2-4.4l-23.2-46.3c-4.1-8.1-12.4-13.3-21.5-13.3s-17.4 5.1-21.5 13.3l-41.4 82.8L205.9 158.2c-3.9-8.7-12.7-14.3-22.2-14.1s-18.1 5.9-21.8 14.8l-31.8 76.3c-1.2 3-4.2 4.9-7.4 4.9L16 240c-2.6 0-5 .4-7.3 1.1C3 225.2 0 208.2 0 190.9l0-5.8c0-69.9 50.5-129.5 119.4-141C165 36.5 211.4 51.4 244 84l12 12 12-12c32.6-32.6 79-47.5 124.6-39.9C461.5 55.6 512 115.2 512 185.1l0 5.8c0 16.9-2.8 33.5-8.3 49.1z" />
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
            <span className="ctx-badge ctx-badge--danger"><HeartbeatIcon /> DNACPR</span>
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
