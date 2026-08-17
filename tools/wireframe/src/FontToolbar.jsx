import { TEXT_COLOR_SWATCHES } from './colorTokens'

// Floating contextual text-style toolbar — replaces the old docked
// right-side FontPanel. Renders horizontally, centered directly above the
// selected element's own canvas-space box (Miro/Figma-style inline
// toolbar), as a plain child of .wf-canvas so it inherits the current zoom
// scale for free, same as SelectionOverlay. Only ever shown once a real
// text/rect/ellipse/triangle/arrow element (carrying text) is selected —
// App.jsx computes `box`/`value` from that selection and this component
// stays purely presentational, same division of responsibility the old
// panel had.
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

export default function FontToolbar({ box, value, onChange, showAlignment = true }) {
  return (
    <div
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
      <select
        className="wf-font-toolbar-select wf-font-toolbar-select-family"
        value={value.fontFamily}
        onChange={(e) => onChange({ fontFamily: e.target.value })}
        title="Font family"
      >
        {FONT_FAMILIES.map((f) => <option key={f} value={f}>{f}</option>)}
      </select>

      <select
        className="wf-font-toolbar-select"
        value={value.fontWeight}
        onChange={(e) => onChange({ fontWeight: Number(e.target.value) })}
        title="Font weight"
      >
        {FONT_WEIGHTS.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
      </select>

      <input
        type="number"
        className="wf-font-toolbar-input"
        min={8}
        max={96}
        value={value.fontSize}
        onChange={(e) => onChange({ fontSize: Number(e.target.value) || value.fontSize })}
        title="Font size (px)"
      />

      {showAlignment && (
        <>
          <div className="wf-font-toolbar-divider" />
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
        </>
      )}

      <div className="wf-font-toolbar-divider" />

      <div className="wf-font-toolbar-swatches">
        {TEXT_COLOR_SWATCHES.map((s) => (
          <button
            key={s.label}
            className={`wf-font-toolbar-swatch${value.textColor === s.hex ? ' active' : ''}`}
            title={s.label}
            style={{ background: s.token ? `var(${s.token})` : s.hex }}
            onClick={() => onChange({ textColor: s.hex })}
          />
        ))}
        <input
          type="color"
          className="wf-font-toolbar-color-input"
          value={value.textColor || '#333333'}
          onChange={(e) => onChange({ textColor: e.target.value })}
          title="Custom text colour"
        />
      </div>
    </div>
  )
}
