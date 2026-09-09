import { useEffect, useRef, useState } from 'react'

// Inline SVG icons for this toolbar — dev-tool chrome, not a product
// prototype icon, so (matching Components/DevEdit.jsx's own PenIcon/
// HistoryIcon/TrashIcon precedent) these live directly in the component
// rather than going through the Icons/-folder/Figma convention.
//
// Fill/Border (and their icons/popups) moved out to FontToolbar.jsx —
// Ben: "Move the fill and border options in the main menu to the
// context menu so I don't have to go to the menu at the bottom of the
// screen to apply." They're still reachable from here implicitly: the
// contextual toolbar now shows for a multi-select too (Fill/Border
// only, no font section), so nothing that used to work from this bottom
// bar stopped working — it just moved to float above the selection.
const FrameIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2v16a2 2 0 002 2h16" />
    <path d="M2 6h16a2 2 0 012 2v16" />
  </svg>
)

const ShapesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="9" width="12" height="12" rx="1.5" />
    <circle cx="16" cy="7" r="5.5" />
  </svg>
)

const RectIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="6" width="18" height="12" rx="1.5" /></svg>
)
const EllipseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><ellipse cx="12" cy="12" rx="9" ry="6.5" /></svg>
)
const TriangleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M12 3l10 18H2L12 3z" /></svg>
)
const ArrowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="20" x2="20" y2="4" />
    <path d="M12 4h8v8" />
  </svg>
)
const TextIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M4 6h16" /><path d="M12 6v14" />
  </svg>
)

const SHAPE_TOOLS = [
  { key: 'rect', label: 'Rectangle', Icon: RectIcon },
  { key: 'ellipse', label: 'Ellipse', Icon: EllipseIcon },
  { key: 'triangle', label: 'Triangle', Icon: TriangleIcon },
  { key: 'arrow', label: 'Arrow', Icon: ArrowIcon },
]

const SHAPE_TOOL_KEYS = new Set(SHAPE_TOOLS.map((t) => t.key))

export default function Toolbar({ activeTool, setActiveTool }) {
  const [openPopup, setOpenPopup] = useState(null) // null | 'shapes'
  const toolbarRef = useRef(null)

  // Close an open popup on any click outside the toolbar (e.g. clicking
  // the canvas) — otherwise it'd stay open indefinitely once shown.
  useEffect(() => {
    if (!openPopup) return
    function handleOutside(e) {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target)) setOpenPopup(null)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [openPopup])

  const shapeToolActive = SHAPE_TOOL_KEYS.has(activeTool)

  const toggleFrame = () => {
    setOpenPopup(null)
    setActiveTool(activeTool === 'frame' ? 'pointer' : 'frame')
  }

  const toggleText = () => {
    setOpenPopup(null)
    setActiveTool(activeTool === 'text' ? 'pointer' : 'text')
  }

  const toggleShapesPopup = () => {
    if (shapeToolActive) {
      // Re-clicking an already-armed shape tool's icon cancels it, same
      // as re-clicking Frame — it does not reopen the popup.
      setActiveTool('pointer')
      setOpenPopup(null)
      return
    }
    setOpenPopup((p) => (p === 'shapes' ? null : 'shapes'))
  }

  const pickShape = (key) => {
    setActiveTool(key)
    setOpenPopup(null)
  }

  return (
    <div className="wf-toolbar" ref={toolbarRef}>
      <div className="wf-toolbar-item">
        <button
          className={`wf-icon-btn${activeTool === 'frame' ? ' active' : ''}`}
          onClick={toggleFrame}
        >
          <FrameIcon />
        </button>
        {!openPopup && <span className="wf-toolbar-tooltip">Frame</span>}
      </div>

      <div className="wf-toolbar-item">
        <button
          className={`wf-icon-btn${activeTool === 'text' ? ' active' : ''}`}
          onClick={toggleText}
        >
          <TextIcon />
        </button>
        {!openPopup && <span className="wf-toolbar-tooltip">Text</span>}
      </div>

      <div className="wf-toolbar-item">
        <button
          className={`wf-icon-btn${shapeToolActive ? ' active' : ''}`}
          onClick={toggleShapesPopup}
        >
          <ShapesIcon />
        </button>
        {!openPopup && <span className="wf-toolbar-tooltip">Shapes</span>}
        {openPopup === 'shapes' && (
          <div className="wf-popup wf-popup-shapes">
            {SHAPE_TOOLS.map(({ key, label, Icon }) => (
              <button key={key} className="wf-popup-shape-btn" title={label} onClick={() => pickShape(key)}>
                <Icon />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
