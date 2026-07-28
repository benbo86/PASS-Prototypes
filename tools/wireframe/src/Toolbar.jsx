import { useEffect, useRef, useState } from 'react'
import ColorPickerPopup from './ColorPickerPopup'

// Inline SVG icons for this toolbar — dev-tool chrome, not a product
// prototype icon, so (matching Components/DevEdit.jsx's own PenIcon/
// HistoryIcon/TrashIcon precedent) these live directly in the component
// rather than going through the Icons/-folder/Figma convention.
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

const FillIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12l8-8 8 8-8 8-8-8z" />
    <path d="M4 15.5s-2 2-2 3.5a2 2 0 004 0c0-1.5-2-3.5-2-3.5z" fill="currentColor" stroke="none" />
  </svg>
)

// Distinct from FillIcon (a solid paint-bucket-adjacent diamond) — this is
// the same diamond outline only, unfilled, with a dashed inner square to
// read as "the edge/border," not the interior.
const BorderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="1.5" strokeDasharray="3.5 3" />
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

export default function Toolbar({
  activeTool, setActiveTool,
  canFill, currentFill, onFillChange,
  canBorderFill, currentStroke, onStrokeChange, currentStrokeWidth, onStrokeWidthChange,
}) {
  const [openPopup, setOpenPopup] = useState(null) // null | 'shapes' | 'fill' | 'border'
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

  const toggleFillPopup = () => {
    if (!canFill) return
    setOpenPopup((p) => (p === 'fill' ? null : 'fill'))
  }

  const toggleBorderPopup = () => {
    if (!canBorderFill) return
    setOpenPopup((p) => (p === 'border' ? null : 'border'))
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

      <div className="wf-toolbar-item">
        <button
          className={`wf-icon-btn${openPopup === 'fill' ? ' active' : ''}`}
          disabled={!canFill}
          onClick={toggleFillPopup}
        >
          <FillIcon />
        </button>
        {!openPopup && <span className="wf-toolbar-tooltip">Colour Fill</span>}
        {openPopup === 'fill' && (
          <div className="wf-popup wf-popup-fill">
            <ColorPickerPopup
              value={currentFill}
              onChange={onFillChange}
              onApply={(hex) => { onFillChange(hex); setOpenPopup(null) }}
            />
          </div>
        )}
      </div>

      <div className="wf-toolbar-item">
        <button
          className={`wf-icon-btn${openPopup === 'border' ? ' active' : ''}`}
          disabled={!canBorderFill}
          onClick={toggleBorderPopup}
        >
          <BorderIcon />
        </button>
        {!openPopup && <span className="wf-toolbar-tooltip">Border</span>}
        {openPopup === 'border' && (
          <div className="wf-popup wf-popup-fill">
            <ColorPickerPopup
              value={currentStroke}
              onChange={onStrokeChange}
              onApply={(hex) => { onStrokeChange(hex); setOpenPopup(null) }}
            />
            <div className="wf-thickness-row">
              <label className="wf-thickness-label" htmlFor="wf-thickness-input">Thickness</label>
              <input
                id="wf-thickness-input"
                type="number"
                className="wf-thickness-input"
                min={1}
                max={20}
                value={currentStrokeWidth}
                onChange={(e) => onStrokeWidthChange(Math.max(1, Number(e.target.value) || 1))}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
