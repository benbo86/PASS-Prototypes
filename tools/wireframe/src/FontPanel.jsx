import { TEXT_COLOR_SWATCHES } from './colorTokens'

// Right-side text styling panel — visually mirrors Components/DevMode.jsx's
// own inspector panel (dark, fixed to the right, Barlow font, section
// dividers) rather than this tool's own light toolbar/popup look, per the
// explicit "similar to dev mode" ask. Shown either while the Text tool is
// armed (editing the *pending* defaults for the next text element about to
// be placed) or while exactly one text/rect/ellipse/arrow element carrying
// text is selected (editing that element directly, live) — App.jsx decides
// which via `value`/`onChange`/`showAlignment` (the last hidden for an
// arrow, whose single floating label has no meaningful alignment).
const FONT_FAMILIES = ['Barlow', 'Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana']
const FONT_WEIGHTS = [
  { value: 400, label: 'Regular' },
  { value: 500, label: 'Medium' },
  { value: 600, label: 'Semibold' },
  { value: 700, label: 'Bold' },
]
const ALIGNMENTS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
]

export default function FontPanel({ value, onChange, showAlignment = true }) {
  return (
    <div className="wf-font-panel">
      <div className="wf-font-panel-header">Text style</div>
      <div className="wf-font-panel-body">
        <div className="wf-font-panel-section">
          <div className="wf-font-panel-label">Font</div>
          <select
            className="wf-font-panel-select"
            value={value.fontFamily}
            onChange={(e) => onChange({ fontFamily: e.target.value })}
          >
            {FONT_FAMILIES.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div className="wf-font-panel-section">
          <div className="wf-font-panel-label">Weight</div>
          <select
            className="wf-font-panel-select"
            value={value.fontWeight}
            onChange={(e) => onChange({ fontWeight: Number(e.target.value) })}
          >
            {FONT_WEIGHTS.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
          </select>
        </div>

        <div className="wf-font-panel-section">
          <div className="wf-font-panel-label">Size (px)</div>
          <input
            type="number"
            className="wf-font-panel-input"
            min={8}
            max={96}
            value={value.fontSize}
            onChange={(e) => onChange({ fontSize: Number(e.target.value) || value.fontSize })}
          />
        </div>

        {showAlignment && (
          <div className="wf-font-panel-section">
            <div className="wf-font-panel-label">Alignment</div>
            <div className="wf-font-panel-align-group">
              {ALIGNMENTS.map((a) => (
                <button
                  key={a.value}
                  className={`wf-font-panel-align-btn${value.textAlign === a.value ? ' active' : ''}`}
                  onClick={() => onChange({ textAlign: a.value })}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="wf-font-panel-section">
          <div className="wf-font-panel-label">Text colour</div>
          <div className="wf-font-panel-swatches">
            {TEXT_COLOR_SWATCHES.map((s) => (
              <button
                key={s.label}
                className={`wf-font-panel-swatch${value.textColor === s.hex ? ' active' : ''}`}
                title={s.label}
                style={{ background: s.token ? `var(${s.token})` : s.hex }}
                onClick={() => onChange({ textColor: s.hex })}
              />
            ))}
            <input
              type="color"
              className="wf-font-panel-color-input"
              value={value.textColor || '#333333'}
              onChange={(e) => onChange({ textColor: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
