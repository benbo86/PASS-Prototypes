import { useEffect, useRef } from 'react'

// Replaces the old top-right FileControls bar (Save/Load dropdown/New) per
// Ben's own wireframe (wireframes/wireframe-nav.json): a hamburger toggle +
// editable name field at the top-left, opening a slide-out panel with New
// at the top and a single merged, newest-first list of saved wireframes
// below it — clicking a row loads it directly (no separate Load step), and
// each row has its own delete action. There's deliberately no Save button
// anywhere in this component — saving only ever happens via the existing
// unsaved-changes prompt in App.jsx (on exit, or now also when switching to
// a different saved wireframe), never a standalone click here.
const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" />
  </svg>
)

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7h16" /><path d="M10 11v6" /><path d="M14 11v6" />
    <path d="M6 7l1 13a2 2 0 002 2h6a2 2 0 002-2l1-13" />
    <path d="M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
  </svg>
)

// "3 Jul 2026, 14:05" — an actual date + time, per the wireframe's own
// annotation ("Have time stamps against them date and time"), not a vague
// relative "2 hours ago." ms === 0 means the timestamp couldn't be
// determined at all (only possible for a local file whose stat() lookup
// itself failed) — shown as an em dash rather than a misleading epoch date.
function formatTimestamp(ms) {
  if (!ms) return '—'
  const d = new Date(ms)
  const date = d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  return `${date}, ${time}`
}

// One row — shared between the grouped and flat rendering below so the
// two never drift out of sync visually.
function WireframeMenuRow({ f, currentFileKey, onSelectFile, onDelete }) {
  const key = `${f.source}:${f.id}`
  return (
    <div
      className={`wf-menu-list-item${key === currentFileKey ? ' wf-menu-list-item-active' : ''}`}
      onClick={() => onSelectFile(f.source, f.id)}
    >
      <div className="wf-menu-list-item-text">
        <div className="wf-menu-list-item-name">{f.name}</div>
        <div className="wf-menu-list-item-date">
          {f.authorName ? `${f.authorName} · ` : ''}{formatTimestamp(f.updatedAtMs)}
        </div>
      </div>
      <button
        className="wf-menu-list-item-delete"
        onClick={(e) => { e.stopPropagation(); onDelete(f.source, f.id, f.name) }}
        aria-label={`Delete ${f.name}`}
      >
        <TrashIcon />
      </button>
    </div>
  )
}

export default function WireframeMenu({
  wireframeName,
  setWireframeName,
  menuOpen,
  setMenuOpen,
  cloudFiles,
  localFiles,
  currentFileKey,
  onSelectFile,
  onNew,
  onDelete,
  error,
}) {
  const toggleRef = useRef(null)
  const panelRef = useRef(null)

  // Click-outside-closes — a plain catcher, not a dimmed backdrop like the
  // exit-prompt/gate use, since this is a browsing drawer the canvas should
  // stay fully visible behind, not a blocking modal. Excludes the toggle
  // button itself so this listener and the button's own onClick don't fight
  // over the open/closed state on the same click.
  useEffect(() => {
    if (!menuOpen) return
    function handleMouseDown(e) {
      if (panelRef.current?.contains(e.target)) return
      if (toggleRef.current?.contains(e.target)) return
      setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [menuOpen, setMenuOpen])

  return (
    <>
      <div className="wf-menu-bar">
        <button
          ref={toggleRef}
          className={`wf-menu-toggle${menuOpen ? ' wf-menu-toggle-active' : ''}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close wireframe menu' : 'Open wireframe menu'}
        >
          <MenuIcon />
        </button>
        <input
          className="wf-name-input"
          placeholder="Wireframe name"
          value={wireframeName}
          onChange={(e) => setWireframeName(e.target.value)}
        />
        {error && <span className="wf-toolbar-error">{error}</span>}
      </div>

      <div ref={panelRef} className={`wf-menu-panel${menuOpen ? ' wf-menu-panel-open' : ''}`}>
        <div className="wf-menu-panel-header">
          <button className="wf-tool-btn wf-primary" onClick={onNew}>New</button>
        </div>
        <div className="wf-menu-list">
          {cloudFiles.length === 0 && localFiles.length === 0 && (
            <div className="wf-menu-list-empty">No saved wireframes yet</div>
          )}
          {localFiles.length > 0 ? (
            // Local saves only exist at all when running `vite dev` on this
            // machine — the deployed site has no local files to list, ever.
            // So grouping under headings only kicks in once there's
            // actually a "Local" section to distinguish from "Shared";
            // otherwise (the normal deployed-site case) it'd just be one
            // heading over the only list that ever exists there, adding
            // nothing.
            <>
              {cloudFiles.length > 0 && (
                <div className="wf-menu-group">
                  <div className="wf-menu-group-label">Shared</div>
                  {cloudFiles.map((f) => (
                    <WireframeMenuRow key={`${f.source}:${f.id}`} f={f} currentFileKey={currentFileKey} onSelectFile={onSelectFile} onDelete={onDelete} />
                  ))}
                </div>
              )}
              <div className="wf-menu-group">
                <div className="wf-menu-group-label">Local (this machine)</div>
                {localFiles.map((f) => (
                  <WireframeMenuRow key={`${f.source}:${f.id}`} f={f} currentFileKey={currentFileKey} onSelectFile={onSelectFile} onDelete={onDelete} />
                ))}
              </div>
            </>
          ) : (
            cloudFiles.map((f) => (
              <WireframeMenuRow key={`${f.source}:${f.id}`} f={f} currentFileKey={currentFileKey} onSelectFile={onSelectFile} onDelete={onDelete} />
            ))
          )}
        </div>
      </div>
    </>
  )
}
