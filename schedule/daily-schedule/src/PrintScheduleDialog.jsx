import { useState, useRef, useLayoutEffect } from 'react'
import SlidePanel from '../../../Components/SlidePanel'
import ModalPanel from '../../../Components/ModalPanel'
import SegmentedToggle from '../../../Components/SegmentedToggle'
import SchedulePdfPreview, { PAGE } from './SchedulePdfPreview'

// Print / email dialog for the customer schedule (AIOP-25799 — large text option).
// Opened from the Actions menu, customer view only.
function Radio({ name, value, current, onChange, label }) {
  return (
    <label className="ps-choice">
      <input type="radio" className="form-radio" name={name} checked={current === value} onChange={() => onChange(value)} />
      {label}
    </label>
  )
}

function Check({ checked, onChange, label }) {
  return (
    <label className="checkbox-wrap">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="checkbox-box" />
      {label}
    </label>
  )
}

// mode: 'print' | 'email' — the two dialogs share every setting, only the
// footer actions differ. The email footer is an assumption (no screenshot of
// the live email dialog yet).
// Scales the page with transform, not CSS zoom: browsers disagree on what
// getBoundingClientRect() returns inside a zoomed element, which made Dev Edit /
// Dev Mode highlight the wrong place. A transform doesn't take up scaled space,
// so the wrapper's height is measured and set explicitly.
function ScaledPage({ scale, width, children }) {
  const ref = useRef(null)
  const [h, setH] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setH(el.offsetHeight)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div className="ps-preview-frame" style={{ width: width * scale, height: h * scale }}>
      <div ref={ref} style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width }}>{children}</div>
    </div>
  )
}

// Parked card layouts, kept for reference: they still render in SchedulePdfPreview, they're
// just not offered in the toggle. Flip to true to compare.
//   ×2: wider cards, no wrapping, but nothing the 3-column layout doesn't do.
//   ×4: every name wraps (hyphenated names split) and it still needs 2 pages.
const SHOW_TWO_COLUMN_CARDS = false
const SHOW_FOUR_COLUMN_CARDS = false

export default function PrintScheduleDialog({ mode, weekLabel, customers, appliedFilters, onClose }) {
  const CUSTOMERS = customers
  const [selected, setSelected] = useState(() => new Set(customers))
  const [range, setRange] = useState('weekly')
  const [orientation, setOrientation] = useState('portrait')
  const [textSize, setTextSize] = useState('standard')
  const [cancelled, setCancelled] = useState(false)
  const [pending, setPending] = useState(true)
  const [unassigned, setUnassigned] = useState(true)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [largeSize, setLargeSize] = useState(16) // prototype-only: the AC says 16pt minimum; 14pt for Product to compare
  const [largeLayout, setLargeLayout] = useState('cards') // prototype-only: compares the large-text layouts

  const allSelected = selected.size === CUSTOMERS.length
  const toggle = name => setSelected(s => {
    const next = new Set(s)
    next.has(name) ? next.delete(name) : next.add(name)
    return next
  })
  const isPrint = mode === 'print'
  const previewCustomer = CUSTOMERS.find(c => selected.has(c))
  // Always A4 at 100% on screen (1pt = 96/72 px, so 595pt ≈ 794px wide).
  const pageW = PAGE[orientation].w
  const scale = 96 / 72
  const modalW = Math.min(pageW * scale + 96, window.innerWidth - 48)

  const footer = (
    <>
      <button className="round-btn tertiary-btn" onClick={onClose}>Cancel</button>
      <div className="ps-footer-right">
        {isPrint ? (
          <>
            <button className="round-btn secondary-btn" disabled={selected.size === 0}>Download PDF</button>
            <button className="round-btn primary-btn" disabled={selected.size === 0}>Print selected</button>
          </>
        ) : (
          <button className="round-btn primary-btn" disabled={selected.size === 0}>Email selected</button>
        )}
      </div>
    </>
  )

  return (
    <>
    <SlidePanel
      open
      onClose={onClose}
      className="ps-panel"
      title={`${isPrint ? 'Print' : 'Email'} schedule (${weekLabel})`}
      footer={footer}
    >
      <div className="ps-col">
        <div className="ps-count"><b>Selected:</b> {selected.size} - {CUSTOMERS.length} <b>Showing:</b> 1 - {CUSTOMERS.length} of {CUSTOMERS.length}</div>
        <table className="ps-table">
          <thead>
            <tr>
              <th className="ps-check">
                <Check checked={allSelected} onChange={c => setSelected(new Set(c ? CUSTOMERS : []))} label="" />
              </th>
              <th>Customer name</th>
            </tr>
          </thead>
          <tbody>
            {CUSTOMERS.map(name => (
              <tr key={name}>
                <td className="ps-check"><Check checked={selected.has(name)} onChange={() => toggle(name)} label="" /></td>
                <td>{name}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="ps-section" style={{ marginTop: 40 }}>
          <h2>Applied filters</h2>
          {appliedFilters.length === 0
            ? <p className="ps-hint">No filters applied</p>
            : appliedFilters.map(f => <span key={f} className="ps-pill">{f}</span>)}
        </div>
      </div>

      <div className="ps-col">
        <div className="ps-section">
          <h2>Schedule date range</h2>
          <div className="ps-choices">
            <Radio name="range" value="weekly" current={range} onChange={setRange} label="Weekly" />
            <Radio name="range" value="biweekly" current={range} onChange={setRange} label="Bi-weekly" />
          </div>
        </div>

        <div className="ps-section">
          <h2>Schedule orientation</h2>
          <div className="ps-choices">
            <Radio name="orientation" value="portrait" current={orientation} onChange={setOrientation} label="Portrait" />
            <Radio name="orientation" value="landscape" current={orientation} onChange={setOrientation} label="Landscape" />
          </div>
          <p className="ps-hint">The address will appear in the window of C5 and DL envelopes portrait only</p>
        </div>

        <div className="ps-section">
          <h2>Text size</h2>
          <div className="ps-choices">
            <Radio name="textSize" value="standard" current={textSize} onChange={setTextSize} label="Standard" />
            <Radio name="textSize" value="large" current={textSize} onChange={setTextSize} label="Large" />
          </div>
          <p className="ps-hint">Large text makes the schedule easier to read for customers with a visual impairment.</p>
          <button className="round-btn secondary-btn ps-preview-btn" disabled={selected.size === 0} onClick={() => setPreviewOpen(true)}>Preview</button>
          {previewCustomer && <p className="ps-hint ps-preview-note">Shows the schedule for {previewCustomer}{selected.size > 1 ? ' (first selected customer)' : ''}.</p>}
        </div>

        <div className="ps-section">
          <h2>Visibility</h2>
          <div className="ps-checks">
            <Check checked={cancelled} onChange={setCancelled} label="Include cancelled visits" />
            <Check checked={pending} onChange={setPending} label="Include pending visits" />
            <Check checked={unassigned} onChange={setUnassigned} label="Include unassigned visits" />
          </div>
          <p className="ps-hint">Select visit states you wish to include with the customer</p>
        </div>
      </div>
    </SlidePanel>
    <ModalPanel
      open={previewOpen}
      stacked
      onClose={() => setPreviewOpen(false)}
      title={`Preview — ${previewCustomer || ''}`}
      width={modalW}
    >
      {textSize === 'large' && (
        <div className="ps-preview-bar">
          <span>Text size (prototype option)</span>
          <SegmentedToggle options={[{ value: 16, label: '16pt' }, { value: 14, label: '14pt' }]} value={largeSize} onChange={setLargeSize} />
          <span>Layout</span>
          <SegmentedToggle options={[{ value: 'cards', label: 'Cards' }, ...(SHOW_FOUR_COLUMN_CARDS ? [{ value: 'cards4', label: 'Cards ×4' }] : []), ...(SHOW_TWO_COLUMN_CARDS ? [{ value: 'cards2', label: 'Cards ×2' }] : []), { value: 'list', label: 'List' }]} value={largeLayout} onChange={setLargeLayout} />
        </div>
      )}
      <ScaledPage scale={scale} width={pageW}>
        <SchedulePdfPreview customer={previewCustomer || ''} weekLabel={weekLabel} textSize={textSize} orientation={orientation} largeLayout={largeLayout} largeSize={largeSize} showPending={pending} showCancelled={cancelled} />
      </ScaledPage>
    </ModalPanel>
    </>
  )
}

