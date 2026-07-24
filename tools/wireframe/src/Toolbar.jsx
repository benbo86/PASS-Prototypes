import { useEffect, useRef, useState } from 'react'
import { FILL_SWATCH_GROUPS, NONE_SWATCH } from './colorTokens'

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

const RectIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="6" width="18" height="12" rx="1.5" /></svg>
)
const EllipseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><ellipse cx="12" cy="12" rx="9" ry="6.5" /></svg>
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
  { key: 'arrow', label: 'Arrow', Icon: ArrowIcon },
]

const SHAPE_TOOL_KEYS = new Set(SHAPE_TOOLS.map((t) => t.key))

export default function Toolbar({ activeTool, setActiveTool, canFill, currentFill, onFillChange }) {
  const [openPopup, setOpenPopup] = useState(null) // null | 'shapes' | 'fill'
  const [fillTab, setFillTab] = useState('picker') // 'picker' | 'swatches'
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

  const applyFill = (hex) => {
    onFillChange(hex)
    setOpenPopup(null)
  }

  return (
    <div className="wf-toolbar" ref={toolbarRef}>
      <div className="wf-toolbar-item">
        <button
          className={`wf-icon-btn${activeTool === 'frame' ? ' active' : ''}`}
          title="Frame"
          onClick={toggleFrame}
        >
          <FrameIcon />
        </button>
      </div>

      <div className="wf-toolbar-item">
        <button
          className={`wf-icon-btn${activeTool === 'text' ? ' active' : ''}`}
          title="Text"
          onClick={toggleText}
        >
          <TextIcon />
        </button>
      </div>

      <div className="wf-toolbar-item">
        <button
          className={`wf-icon-btn${shapeToolActive ? ' active' : ''}`}
          title="Shapes"
          onClick={toggleShapesPopup}
        >
          <ShapesIcon />
        </button>
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
          title="Colour Fill"
          disabled={!canFill}
          onClick={toggleFillPopup}
        >
          <FillIcon />
        </button>
        {openPopup === 'fill' && (
          <div className="wf-popup wf-popup-fill">
            <div className="wf-popup-tabs">
              <button className={`wf-popup-tab${fillTab === 'picker' ? ' active' : ''}`} onClick={() => setFillTab('picker')}>Picker</button>
              <button className={`wf-popup-tab${fillTab === 'swatches' ? ' active' : ''}`} onClick={() => setFillTab('swatches')}>Swatches</button>
            </div>
            {fillTab === 'picker' ? (
              <div className="wf-popup-picker">
                <input
                  type="color"
                  className="wf-color-input"
                  value={currentFill || '#ffffff'}
                  onChange={(e) => applyFill(e.target.value)}
                />
                <button className="wf-swatch-row wf-swatch-row-none" onClick={() => applyFill(null)}>
                  <span className="wf-swatch-dot wf-swatch-none" />
                  <span>None</span>
                </button>
              </div>
            ) : (
              <div className="wf-popup-swatches">
                <button key={NONE_SWATCH.label} className="wf-swatch-row" onClick={() => applyFill(NONE_SWATCH.hex)}>
                  <span className="wf-swatch-dot wf-swatch-none" />
                  <span>{NONE_SWATCH.label}</span>
                </button>
                {FILL_SWATCH_GROUPS.map((group) => (
                  <div key={group.category} className="wf-swatch-group">
                    <div className="wf-swatch-group-label">{group.category}</div>
                    {group.swatches.map((s) => (
                      <button key={s.label} className="wf-swatch-row" onClick={() => applyFill(s.hex)}>
                        <span
                          className={`wf-swatch-dot${s.hex === null ? ' wf-swatch-none' : ''}`}
                          // Prefer a live var(--token) link (stays accurate
                          // if the token's value ever changes) but fall
                          // back to the plain hex for an entry with no
                          // matching token — without this fallback, a
                          // hex-only swatch would render with no
                          // background at all.
                          style={s.hex === null ? undefined : { background: s.token ? `var(${s.token})` : s.hex }}
                        />
                        <span>{s.label}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
