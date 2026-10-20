import { useEffect, useRef, useState } from 'react'
import Tooltip from './Tooltip'
import { IS_SPLIT_PANE, SPLIT_PANE_NAME } from './splitPane'

// Shows two linked prototypes side by side in one tab, e.g. the mobile
// Holidays app next to the web Leave Requests table (both read the same
// Components/leaveRequestsStore.js, so an action in one pane updates the
// other live). A dev toolbar button opens it; the divider drags to resize,
// "Swap sides" flips which prototype is on the left, Close returns to the
// page.
//
// Each pane is an iframe: this page itself and the linked page. Both are
// named SPLIT_PANE_NAME (see Components/splitPane.js), which hides each
// pane's own dev toolbar and back-link and scales the mobile phone mockup
// to fit, even after the pane navigates to another prototype.
//
//   <SplitViewToggle
//     otherUrl="../../mobile/holidays/?screen=holidays"
//     selfLabel="Leave Requests" otherLabel="Holidays app"
//     defaultSelfShare={0.65}
//     actions={[{ label: 'Reset demo data', onClick: ... }]}
//   />
//
// defaultOpen: open the split on every page load, whatever the viewer last
// chose. Close still hides it for the rest of that visit; divider position
// and sides are still remembered.
//
// floating: for mobile prototypes, whose toolbar is a floating pill — the
// split then covers the whole window (pill included) rather than sitting
// below a full-width bar, and is closed from its own Close button.

const SplitIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M12 4v16" />
  </svg>
)
const ChevronLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
  </svg>
)
const SwapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 7h12l-3-3M17 17H5l3 3" />
  </svg>
)
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="18 7.2 16.8 6 12 10.8 7.2 6 6 7.2 10.8 12 6 16.8 7.2 18 12 13.2 16.8 18 18 16.8 13.2 12" />
  </svg>
)

const MIN_PANE_PX = 280
const STORAGE_PREFIX = 'split-view:'

function withSplitPaneFlag(url) {
  const u = new URL(url, window.location.href)
  u.searchParams.set('splitpane', '1')
  return u.pathname + u.search
}

// Per-viewer convenience only (open state, divider position, sides), so a
// blocked/empty storage just means the defaults.
function loadPrefs(key, fallback) {
  try { return { ...fallback, ...JSON.parse(localStorage.getItem(STORAGE_PREFIX + key) || '{}') } } catch { return fallback }
}
function savePrefs(key, prefs) {
  try { localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(prefs)) } catch { /* ignore */ }
}

export default function SplitViewToggle({ otherUrl, selfLabel, otherLabel, defaultSelfShare = 0.5, actions = [], floating = false, defaultOpen = false }) {
  const prefsKey = window.location.pathname
  const [prefs, setPrefs] = useState(() => {
    const saved = loadPrefs(prefsKey, { open: false, selfShare: defaultSelfShare, selfOnLeft: true })
    return defaultOpen ? { ...saved, open: true } : saved
  })
  const [dragging, setDragging] = useState(false)
  const bodyRef = useRef(null)

  // Inside a pane this page reads the same saved prefs as the page hosting
  // the split, so both effects must skip there — otherwise the pane locks
  // its own scrolling (it sees "open") and rewrites the host's prefs.
  useEffect(() => { if (!IS_SPLIT_PANE) savePrefs(prefsKey, prefs) }, [prefsKey, prefs])

  // The page underneath doesn't scroll while the split covers it.
  useEffect(() => {
    if (!prefs.open || IS_SPLIT_PANE) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [prefs.open])

  if (IS_SPLIT_PANE) return null

  const update = patch => setPrefs(p => ({ ...p, ...patch }))
  const leftShare = prefs.selfOnLeft ? prefs.selfShare : 1 - prefs.selfShare

  function setLeftShare(share) {
    const width = bodyRef.current?.clientWidth || window.innerWidth
    const min = Math.min(0.45, MIN_PANE_PX / width)
    const clamped = Math.min(1 - min, Math.max(min, share))
    update({ selfShare: prefs.selfOnLeft ? clamped : 1 - clamped })
  }

  function onDividerPointerDown(e) {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
  }
  function onDividerPointerMove(e) {
    if (!dragging) return
    const rect = bodyRef.current.getBoundingClientRect()
    setLeftShare((e.clientX - rect.left) / rect.width)
  }
  function onDividerKeyDown(e) {
    const step = e.shiftKey ? 0.1 : 0.02
    if (e.key === 'ArrowLeft') { e.preventDefault(); setLeftShare(leftShare - step) }
    if (e.key === 'ArrowRight') { e.preventDefault(); setLeftShare(leftShare + step) }
  }

  // Panes keep their DOM order and swap visually via CSS `order` — moving
  // an iframe in the DOM would reload it.
  const selfOrder = prefs.selfOnLeft ? 0 : 2
  const otherOrder = prefs.selfOnLeft ? 2 : 0

  return (
    <>
      <Tooltip text="Split view — show the linked prototype alongside" placement="bottom">
        <button
          className={`dev-toolbar-icon-btn split-view-toggle${prefs.open ? ' active' : ''}`}
          aria-label="Split view"
          onClick={() => update({ open: !prefs.open })}
        >
          <SplitIcon />
        </button>
      </Tooltip>

      {prefs.open && (
        <div className={`split-view${floating ? ' split-view--floating' : ''}${dragging ? ' split-view--dragging' : ''}`} data-devtoolbar-ui="true">
          <div className="split-view-bar">
            {/* The split covers the page's own back link (and each pane hides
                its own, which would only navigate that half), so the way back
                to the index lives here. Every prototype sits two levels deep. */}
            <a href="../../" className="split-view-back"><ChevronLeftIcon /> Prototypes</a>
            <button className="split-view-btn" onClick={() => update({ selfOnLeft: !prefs.selfOnLeft })}>
              <SwapIcon /> Swap sides
            </button>
            {actions.map(a => (
              <button key={a.label} className="split-view-btn" onClick={a.onClick}>{a.label}</button>
            ))}
            <button className="split-view-btn" onClick={() => update({ open: false })}>
              <CloseIcon /> Close
            </button>
          </div>
          <div className="split-view-body" ref={bodyRef}>
            <iframe
              className="split-view-pane"
              name={SPLIT_PANE_NAME}
              title={selfLabel}
              src={withSplitPaneFlag(window.location.href)}
              style={{ order: selfOrder, flexBasis: `${prefs.selfShare * 100}%` }}
            />
            <div
              className="split-view-divider"
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize panes"
              tabIndex={0}
              style={{ order: 1 }}
              onPointerDown={onDividerPointerDown}
              onPointerMove={onDividerPointerMove}
              onPointerUp={() => setDragging(false)}
              onPointerCancel={() => setDragging(false)}
              onKeyDown={onDividerKeyDown}
            >
              <span className="split-view-grip" />
            </div>
            <iframe
              className="split-view-pane"
              name={SPLIT_PANE_NAME}
              title={otherLabel}
              src={withSplitPaneFlag(otherUrl)}
              style={{ order: otherOrder, flexBasis: `${(1 - prefs.selfShare) * 100}%` }}
            />
          </div>
        </div>
      )}
    </>
  )
}
