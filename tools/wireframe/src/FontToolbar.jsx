import { useEffect, useRef, useState } from 'react'
import ColorPickerPopup from './ColorPickerPopup'

// Floating contextual toolbar — replaces the old docked right-side
// FontPanel, and absorbs Fill/Border out of the bottom Toolbar too, per
// Ben's "so I don't have to go to the menu at the bottom of the screen
// to apply" ask. Renders horizontally, centered directly above the
// selection's own canvas-space box (Miro/Figma-style inline toolbar), as
// a plain child of .wf-canvas so it inherits the current zoom scale for
// free, same as SelectionOverlay.
//
// Shown for ANY single selected element (Fill/Border sections gated by
// that element's own type; Frame gets Fill/Border only, no font section
// at all — its `label` is a name badge, not styleable body text), AND
// for a multi-select where at least one member is fillable/strokeable/
// font-capable — a multi-select now shows the SAME font/alignment/text-
// colour sections a single selection does (Ben: "have the same options
// when multiple elements"), bulk-applying to every selected font-capable
// member via the same "single is just N=1" pattern Fill/Border already
// use. App.jsx computes all of this and stays the source of truth; this
// component is purely presentational.
//
// Left-to-right order (Ben's own ask): font family, font weight, font
// size, text/vertical alignment, [align objects, multi-select only],
// text colour, border, fill.
//
// Two distinct "alignment" concepts live in this toolbar, never confused
// with each other despite sharing the word: Text/Vertical align (the
// AlignIcon button) always sets the selected element(s)' own textAlign/
// verticalAlign field — Ben corrected an earlier version of this that
// made these same buttons reposition elements on a multi-select ("I
// think the alignment options should be specific to text... what I was
// really asking for was a new align objects option"). Align objects (the
// AlignObjLeftIcon button, shown only for 2+ selected) is the actual
// Figma-style "align these elements relative to each other" action,
// calling onAlignElements to reposition via geometry.js's alignElements.
const FONT_FAMILIES = ['Barlow', 'Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana']
const FONT_WEIGHTS = [
  { value: 400, label: 'Regular' },
  { value: 500, label: 'Medium' },
  { value: 600, label: 'Semibold' },
  { value: 700, label: 'Bold' },
]
const ALIGNMENTS = [
  { value: 'left', label: 'L', title: 'Align left' },
  { value: 'center', label: 'C', title: 'Align center' },
  { value: 'right', label: 'R', title: 'Align right' },
]
const VERTICAL_ALIGNMENTS = [
  { value: 'top', label: 'T', title: 'Align top' },
  { value: 'middle', label: 'M', title: 'Align middle' },
  { value: 'bottom', label: 'B', title: 'Align bottom' },
]

// "Align objects" (below) reuses the same left/top -> 'start',
// center/middle -> 'center', right/bottom -> 'end' vocabulary
// alignElements (geometry.js) expects — its 6 icon buttons share these
// mode names with the (unrelated) Text/Vertical align buttons above.
const ALIGN_OBJECTS_H = [
  { mode: 'start', label: 'Align left' },
  { mode: 'center', label: 'Align horizontally' },
  { mode: 'end', label: 'Align right' },
]
const ALIGN_OBJECTS_V = [
  { mode: 'start', label: 'Align top' },
  { mode: 'center', label: 'Align vertically' },
  { mode: 'end', label: 'Align bottom' },
]

// Moved here from Toolbar.jsx now that Fill/Border live in this toolbar
// instead of the bottom one — same icons, unchanged.
const FillIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12l8-8 8 8-8 8-8-8z" />
    <path d="M4 15.5s-2 2-2 3.5a2 2 0 004 0c0-1.5-2-3.5-2-3.5z" fill="currentColor" stroke="none" />
  </svg>
)

const BorderIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="1.5" strokeDasharray="3.5 3" />
  </svg>
)

// A single "underlined A" replaces the old inline swatch row — clicking
// it opens the same Picker/Swatches popup Fill/Border use. The underline
// is a fixed white bar (not a live preview of the current text colour —
// Ben asked for it plain white), matching the icon convention most text
// editors use for a "text colour" action.
const TextColorIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <text x="12" y="15" textAnchor="middle" fontFamily="Georgia, serif" fontSize="14" fontWeight="700" fill="currentColor">A</text>
    <rect x="4" y="19" width="16" height="3" rx="1" fill="#ffffff" />
  </svg>
)

// Single collapsed alignment button — opens a popup with two sections
// (Text align / Vertical align), replacing the two inline button groups
// that used to always sit directly in the toolbar. The icon itself reads
// as "align center" (three centered bars of varying width).
const AlignIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <line x1="6" y1="6" x2="18" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="7" y1="18" x2="17" y2="18" />
  </svg>
)

// "Align objects" icon set — a dashed reference line plus bars of varying
// length/position sitting against it, the standard Figma/Illustrator
// align-objects glyph language (distinct from the Text/Vertical align
// icons above, which show plain centered text lines with no reference
// line). AlignObjLeftIcon doubles as the toolbar button's own icon (Ben's
// own ask: "represented by a left align icon").
const AlignObjLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <line x1="4" y1="3" x2="4" y2="21" />
    <line x1="4" y1="7" x2="18" y2="7" />
    <line x1="4" y1="12" x2="14" y2="12" />
    <line x1="4" y1="17" x2="20" y2="17" />
  </svg>
)
const AlignObjHCenterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <line x1="12" y1="3" x2="12" y2="21" />
    <line x1="7" y1="7" x2="17" y2="7" />
    <line x1="9" y1="12" x2="15" y2="12" />
    <line x1="5" y1="17" x2="19" y2="17" />
  </svg>
)
const AlignObjRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <line x1="20" y1="3" x2="20" y2="21" />
    <line x1="6" y1="7" x2="20" y2="7" />
    <line x1="10" y1="12" x2="20" y2="12" />
    <line x1="4" y1="17" x2="20" y2="17" />
  </svg>
)
const AlignObjTopIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <line x1="3" y1="4" x2="21" y2="4" />
    <line x1="7" y1="4" x2="7" y2="18" />
    <line x1="12" y1="4" x2="12" y2="14" />
    <line x1="17" y1="4" x2="17" y2="20" />
  </svg>
)
const AlignObjVCenterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="7" y1="7" x2="7" y2="17" />
    <line x1="12" y1="9" x2="12" y2="15" />
    <line x1="17" y1="5" x2="17" y2="19" />
  </svg>
)
const AlignObjBottomIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <line x1="3" y1="20" x2="21" y2="20" />
    <line x1="7" y1="6" x2="7" y2="20" />
    <line x1="12" y1="10" x2="12" y2="20" />
    <line x1="17" y1="4" x2="17" y2="20" />
  </svg>
)
const ALIGN_OBJ_ICONS_H = [AlignObjLeftIcon, AlignObjHCenterIcon, AlignObjRightIcon]
const ALIGN_OBJ_ICONS_V = [AlignObjTopIcon, AlignObjVCenterIcon, AlignObjBottomIcon]

export default function FontToolbar({
  box, value, onChange, showFontControls = false, showAlignment = true,
  isMultiSelect = false, onAlignElements,
  canFill, currentFill, onFillChange,
  canBorderFill, currentStroke, onStrokeChange, currentStrokeWidth, onStrokeWidthChange,
}) {
  const [openPopup, setOpenPopup] = useState(null) // null | 'fill' | 'border' | 'textColor' | 'align'
  const wrapRef = useRef(null)

  // Close an open popup on any click outside this whole toolbar (e.g.
  // clicking the canvas) — same pattern Toolbar.jsx's own popups use.
  useEffect(() => {
    if (!openPopup) return
    function handleOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpenPopup(null)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [openPopup])

  const toggleAlignPopup = () => setOpenPopup((p) => (p === 'align' ? null : 'align'))
  const toggleAlignObjectsPopup = () => setOpenPopup((p) => (p === 'alignObjects' ? null : 'alignObjects'))
  const toggleTextColorPopup = () => setOpenPopup((p) => (p === 'textColor' ? null : 'textColor'))
  const toggleBorderPopup = () => { if (!canBorderFill) return; setOpenPopup((p) => (p === 'border' ? null : 'border')) }
  const toggleFillPopup = () => { if (!canFill) return; setOpenPopup((p) => (p === 'fill' ? null : 'fill')) }

  return (
    <div
      ref={wrapRef}
      className="wf-font-toolbar"
      // Horizontally centered above the element's box, with a fixed gap —
      // canvas-space coordinates, exactly like SelectionOverlay's own
      // left/top/width/height, so this needs no DOM measurement of its own.
      style={{ left: box.x + box.w / 2, top: box.y }}
      // Never let a mousedown here start a canvas drag/marquee/deselect —
      // this toolbar sits inside .wf-canvas, which owns its own mousedown
      // handler for exactly that.
      onMouseDown={(e) => e.stopPropagation()}
    >
      {showFontControls && (
        <>
          <div className="wf-font-toolbar-item">
            <select
              className="wf-font-toolbar-select wf-font-toolbar-select-family"
              value={value.fontFamily}
              onChange={(e) => onChange({ fontFamily: e.target.value })}
            >
              {FONT_FAMILIES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            {!openPopup && <span className="wf-font-toolbar-tooltip">Font family</span>}
          </div>

          <div className="wf-font-toolbar-item">
            <select
              className="wf-font-toolbar-select"
              value={value.fontWeight}
              onChange={(e) => onChange({ fontWeight: Number(e.target.value) })}
            >
              {FONT_WEIGHTS.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
            </select>
            {!openPopup && <span className="wf-font-toolbar-tooltip">Font weight</span>}
          </div>

          <div className="wf-font-toolbar-item">
            <input
              type="number"
              className="wf-font-toolbar-input"
              min={8}
              max={96}
              value={value.fontSize}
              onChange={(e) => onChange({ fontSize: Number(e.target.value) || value.fontSize })}
            />
            {!openPopup && <span className="wf-font-toolbar-tooltip">Font size</span>}
          </div>

          {showAlignment && (
            <>
              <div className="wf-font-toolbar-divider" />
              <div className="wf-font-toolbar-item">
                <button
                  className={`wf-font-toolbar-icon-btn${openPopup === 'align' ? ' active' : ''}`}
                  onClick={toggleAlignPopup}
                >
                  <AlignIcon />
                </button>
                {!openPopup && <span className="wf-font-toolbar-tooltip">Alignment</span>}
                {openPopup === 'align' && (
                  <div className="wf-font-toolbar-popup wf-popup-align">
                    <div className="wf-popup-align-section-label">Text align</div>
                    <div className="wf-font-toolbar-align-group">
                      {ALIGNMENTS.map((a) => (
                        <button
                          key={a.value}
                          className={`wf-font-toolbar-align-btn${value.textAlign === a.value ? ' active' : ''}`}
                          title={a.title}
                          onClick={() => onChange({ textAlign: a.value })}
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>

                    <div className="wf-popup-align-section-label">Vertical align</div>
                    <div className="wf-font-toolbar-align-group">
                      {VERTICAL_ALIGNMENTS.map((a) => (
                        <button
                          key={a.value}
                          className={`wf-font-toolbar-align-btn${value.verticalAlign === a.value ? ' active' : ''}`}
                          title={a.title}
                          onClick={() => onChange({ verticalAlign: a.value })}
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="wf-font-toolbar-divider" />

          <div className="wf-font-toolbar-item">
            <button
              className={`wf-font-toolbar-icon-btn${openPopup === 'textColor' ? ' active' : ''}`}
              onClick={toggleTextColorPopup}
            >
              <TextColorIcon />
            </button>
            {!openPopup && <span className="wf-font-toolbar-tooltip">Text colour</span>}
            {openPopup === 'textColor' && (
              <div className="wf-font-toolbar-popup wf-popup-fill">
                <ColorPickerPopup
                  value={value.textColor}
                  onChange={(hex) => onChange({ textColor: hex })}
                  onApply={(hex) => { onChange({ textColor: hex }); setOpenPopup(null) }}
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* Align objects — a genuinely different action from Text/Vertical
          align above (which set that ONE element's own text/vertical-align
          field): with 2+ elements selected, this repositions them relative
          to each other (Figma-style align-left/center/right/top/middle/
          bottom). Independent of showFontControls — two selected frames
          (no font section at all) can still be aligned to each other. */}
      {isMultiSelect && (
        <>
          {showFontControls && <div className="wf-font-toolbar-divider" />}
          <div className="wf-font-toolbar-item">
            <button
              className={`wf-font-toolbar-icon-btn${openPopup === 'alignObjects' ? ' active' : ''}`}
              onClick={toggleAlignObjectsPopup}
            >
              <AlignObjLeftIcon />
            </button>
            {!openPopup && <span className="wf-font-toolbar-tooltip">Align objects</span>}
            {openPopup === 'alignObjects' && (
              <div className="wf-font-toolbar-popup wf-popup-align">
                <div className="wf-font-toolbar-align-group">
                  {ALIGN_OBJECTS_H.map((a, i) => {
                    const Icon = ALIGN_OBJ_ICONS_H[i]
                    return (
                      <button
                        key={a.mode}
                        className="wf-font-toolbar-align-btn"
                        title={a.label}
                        onClick={() => { onAlignElements('x', a.mode); setOpenPopup(null) }}
                      >
                        <Icon />
                      </button>
                    )
                  })}
                </div>
                <div className="wf-font-toolbar-align-group">
                  {ALIGN_OBJECTS_V.map((a, i) => {
                    const Icon = ALIGN_OBJ_ICONS_V[i]
                    return (
                      <button
                        key={a.mode}
                        className="wf-font-toolbar-align-btn"
                        title={a.label}
                        onClick={() => { onAlignElements('y', a.mode); setOpenPopup(null) }}
                      >
                        <Icon />
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {((showFontControls || isMultiSelect) && (canBorderFill || canFill)) && <div className="wf-font-toolbar-divider" />}

      {canBorderFill && (
        <div className="wf-font-toolbar-item">
          <button
            className={`wf-font-toolbar-icon-btn${openPopup === 'border' ? ' active' : ''}`}
            onClick={toggleBorderPopup}
          >
            <BorderIcon />
          </button>
          {!openPopup && <span className="wf-font-toolbar-tooltip">Border</span>}
          {openPopup === 'border' && (
            <div className="wf-font-toolbar-popup wf-popup-fill">
              <ColorPickerPopup
                value={currentStroke}
                onChange={onStrokeChange}
                onApply={(hex) => { onStrokeChange(hex); setOpenPopup(null) }}
              />
              <div className="wf-thickness-row">
                <label className="wf-thickness-label" htmlFor="wf-font-toolbar-thickness">Thickness</label>
                <input
                  id="wf-font-toolbar-thickness"
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
      )}

      {canBorderFill && canFill && <div className="wf-font-toolbar-divider" />}

      {canFill && (
        <div className="wf-font-toolbar-item">
          <button
            className={`wf-font-toolbar-icon-btn${openPopup === 'fill' ? ' active' : ''}`}
            onClick={toggleFillPopup}
          >
            <FillIcon />
          </button>
          {!openPopup && <span className="wf-font-toolbar-tooltip">Fill</span>}
          {openPopup === 'fill' && (
            <div className="wf-font-toolbar-popup wf-popup-fill">
              <ColorPickerPopup
                value={currentFill}
                onChange={onFillChange}
                onApply={(hex) => { onFillChange(hex); setOpenPopup(null) }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
