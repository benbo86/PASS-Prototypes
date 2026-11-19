import { useState, useRef, useLayoutEffect } from 'react'
import SlidePanel from '../../../Components/SlidePanel'
import ModalPanel from '../../../Components/ModalPanel'
import SegmentedToggle from '../../../Components/SegmentedToggle'
import Pagination from '../../../Components/Pagination'
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

const ChevronLeft = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.7 16.9L11.1 12.3L15.7 7.70005L14.3 6.30005L8.30001 12.3L14.3 18.3L15.7 16.9Z"/>
  </svg>
)
const ChevronRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8.3 16.9L12.9 12.3L8.3 7.7L9.7 6.3L15.7 12.3L9.7 18.3L8.3 16.9Z"/>
  </svg>
)

const SortIcon = ({ dir }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" className={`col-icon sort-icon ${dir ? 'col-icon--active' : ''}`} strokeLinecap="square">
    <polyline points="7.5,9 12,5 16.5,9" stroke="currentColor" strokeWidth="2" fill="none" opacity={dir === 'desc' ? 0.35 : 1} />
    <polyline points="7.5,19 12,15 16.5,19" stroke="currentColor" strokeWidth="2" fill="none"
      style={{ transform: 'scaleY(-1)', transformOrigin: '12px 17px' }} opacity={dir === 'asc' ? 0.35 : 1} />
  </svg>
)

// Email only: when each customer was last sent a schedule (sample data; every
// sixth customer has never been sent one).
const LAST_SENT = '30/10/2026 - 13:11'
const LAST_PERIOD = 'Mon 2 Nov - Sun 8 Nov'

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
  const isPrint = mode === 'print'
  const CUSTOMERS = customers
  const [selected, setSelected] = useState(() => new Set(customers))
  const [range, setRange] = useState('weekly')
  const [orientation, setOrientation] = useState('portrait')
  const [textSize, setTextSize] = useState('standard')
  const [cancelled, setCancelled] = useState(false)
  const [pending, setPending] = useState(isPrint)
  const [unassigned, setUnassigned] = useState(isPrint)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [largeSize, setLargeSize] = useState(16) // prototype-only: the AC says 16pt minimum; 14pt for Product to compare
  const [standardSize, setStandardSize] = useState('current') // prototype-only: Standard as it is today, or the same layout at ~11pt (Nourish's size)
  const [largeLayout, setLargeLayout] = useState('cards') // prototype-only: compares the large-text layouts

  const [page, setPage] = useState(1)
  const rowsPerPage = 15
  const totalRows = CUSTOMERS.length
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage))
  const safePage = Math.min(page, totalPages)
  const showStart = totalRows === 0 ? 0 : (safePage - 1) * rowsPerPage + 1
  const showEnd = Math.min(safePage * rowsPerPage, totalRows)
  const [sort, setSort] = useState({ col: 'name', dir: 'asc' })
  const neverSent = name => CUSTOMERS.indexOf(name) % 6 === 3
  const sortedCustomers = [...CUSTOMERS].sort((a, b) => {
    const val = n => sort.col === 'name' ? n : neverSent(n) ? '~' : sort.col === 'sent' ? LAST_SENT : LAST_PERIOD
    return val(a).localeCompare(val(b)) * (sort.dir === 'asc' ? 1 : -1) || a.localeCompare(b)
  })
  const toggleSort = col => setSort(s => ({ col, dir: s.col === col && s.dir === 'asc' ? 'desc' : 'asc' }))
  const sortHead = (col, label) => (
    <th className="th-name">
      <div className="ps-th">
        <span>{label}</span>
        <button className="col-icon-btn" aria-label={`Sort by ${label}`} onClick={() => toggleSort(col)}>
          <SortIcon dir={sort.col === col ? sort.dir : null} />
        </button>
      </div>
    </th>
  )
  const pageCustomers = (isPrint ? CUSTOMERS : sortedCustomers).slice(showStart - 1, showEnd)

  const allSelected = selected.size === CUSTOMERS.length
  const toggle = name => setSelected(s => {
    const next = new Set(s)
    next.has(name) ? next.delete(name) : next.add(name)
    return next
  })
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
          <button className="round-btn primary-btn" disabled={selected.size === 0}>Email schedule</button>
        )}
      </div>
    </>
  )

  return (
    <>
    <SlidePanel
      open
      onClose={onClose}
      className={`ps-panel${isPrint ? '' : ' ps-panel--email'}`}
      title={`${isPrint ? 'Print' : 'Email'} schedule (${weekLabel})`}
      footer={footer}
    >
      <div className="ps-col">
        <div className="filter-bar">
          <div className="filter-bar-left" />
          <div className="filter-bar-right">
            <span className="count-label">Selected: {selected.size} – {totalRows}</span>
            <span className="count-label">Showing: {showStart} – {showEnd} of {totalRows}</span>
            <button className="ps-nav-arrow pag-inline" disabled={safePage <= 1}
              onClick={() => setPage(safePage - 1)}><ChevronLeft /></button>
            <button className="ps-nav-arrow pag-inline" disabled={safePage >= totalPages}
              onClick={() => setPage(safePage + 1)}><ChevronRight /></button>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th className="check-col">
                  <label className="checkbox-wrap">
                    <input type="checkbox" checked={allSelected} onChange={e => setSelected(new Set(e.target.checked ? CUSTOMERS : []))} />
                    <span className="checkbox-box" />
                  </label>
                </th>
                {isPrint ? <th className="th-name">Customer name</th> : (
                  <>
                    {sortHead('name', 'Customer name')}
                    {sortHead('sent', 'Last sent')}
                    {sortHead('period', 'Period')}
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {pageCustomers.map(name => (
                <tr key={name}>
                  <td className="check-col"><Check checked={selected.has(name)} onChange={() => toggle(name)} label="" /></td>
                  <td className="td-name">{name}</td>
                  {!isPrint && (
                    <>
                      <td className="nowrap">{neverSent(name) ? '-' : LAST_SENT}</td>
                      <td className="nowrap">{neverSent(name) ? '-' : LAST_PERIOD}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={safePage} totalPages={totalPages} rowsPerPage={rowsPerPage}
          showRowsPerPage={false}
          showStart={showStart} showEnd={showEnd} totalRows={totalRows}
          onPageChange={setPage}
          onRowsPerPageChange={() => {}}
        />
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
          <h2>{isPrint ? 'Schedule orientation' : 'PDF orientation'}</h2>
          <div className="ps-choices">
            <Radio name="orientation" value="portrait" current={orientation} onChange={setOrientation} label="Portrait" />
            <Radio name="orientation" value="landscape" current={orientation} onChange={setOrientation} label="Landscape" />
          </div>
          {isPrint && <p className="ps-hint">The address will appear in the window of C5 and DL envelopes portrait only</p>}
        </div>

        <div className="ps-section">
          <h2>Text size</h2>
          <div className="ps-choices">
            <Radio name="textSize" value="standard" current={textSize} onChange={setTextSize} label="Standard" />
            <Radio name="textSize" value="large" current={textSize} onChange={setTextSize} label="Large" />
          </div>
          <p className="ps-hint">Large text makes the schedule easier to read for customers with a visual impairment.</p>
          <button className="round-btn secondary-btn ps-preview-btn" disabled={selected.size === 0} onClick={() => setPreviewOpen(true)}>Preview</button>
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

        {!isPrint && (
          <div className="ps-section">
            <h2>Email content</h2>
            <p className="ps-hint ps-email-intro">Selected customers will be sent a copy of their {range === 'weekly' ? 'weekly' : 'bi-weekly'} schedule</p>
            <dl className="ps-email-fields">
              <dt>From address</dt>
              <dd>everylifetest+schedule@gmail.com</dd>
              <dt>Email subject</dt>
              <dd>Weekly Roster [period-from] to [period-to]</dd>
              <dt>Email text</dt>
              <dd>Dear [customer-name] Please view the attachment for your schedule visits for the period [period-from] to [period-to] If you have any queries or concerns please contact Bluebird Care Redbridge on adminredbridge@bluebirdcare.co.uk or call our office on 02089898444 Thank you in advance, we hope you have a lovely week. The Bluebird Care Redbridge Team</dd>
            </dl>
          </div>
        )}
      </div>
    </SlidePanel>
    <ModalPanel
      open={previewOpen}
      stacked
      onClose={() => setPreviewOpen(false)}
      title={`Preview - ${textSize === 'large' ? 'Large' : 'Standard'} Text Size`}
      width={modalW}
    >
      {textSize === 'standard' && (
        <div className="ps-preview-bar">
          <span>Text size (prototype option)</span>
          <SegmentedToggle options={[{ value: 'current', label: 'Current' }, { value: '11', label: '11pt' }]} value={standardSize} onChange={setStandardSize} />
        </div>
      )}
      {textSize === 'large' && (
        <div className="ps-preview-bar">
          <span>Text size (prototype option)</span>
          <SegmentedToggle options={[{ value: 16, label: '16pt' }, { value: 14, label: '14pt' }]} value={largeSize} onChange={setLargeSize} />
          <span>Layout</span>
          <SegmentedToggle options={[{ value: 'cards', label: 'Cards' }, ...(SHOW_FOUR_COLUMN_CARDS ? [{ value: 'cards4', label: 'Cards ×4' }] : []), ...(SHOW_TWO_COLUMN_CARDS ? [{ value: 'cards2', label: 'Cards ×2' }] : []), { value: 'list', label: 'List' }]} value={largeLayout} onChange={setLargeLayout} />
        </div>
      )}
      <ScaledPage scale={scale} width={pageW}>
        <SchedulePdfPreview customer={previewCustomer || ''} weekLabel={weekLabel} textSize={textSize} orientation={orientation} largeLayout={largeLayout} largeSize={largeSize} standardSize={standardSize} showPending={pending} showCancelled={cancelled} />
      </ScaledPage>
    </ModalPanel>
    </>
  )
}

