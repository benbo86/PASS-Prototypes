import { useState } from 'react'
import SlidePanel from '../../../Components/SlidePanel'
import ModalPanel from '../../../Components/ModalPanel'
import Pagination from '../../../Components/Pagination'
import SchedulePdfPreview, { PAGE, ScaledPage } from '../../customer-schedule-text-size/src/SchedulePdfPreview'

// Print / email dialog for the customer schedule (AIOP-25799 — 11pt text, choice of layout).
// Opened from the Actions menu, customer view only.
function Radio({ name, value, current, onChange, label }) {
  return (
    <label className="ps-choice">
      <input type="radio" className="form-radio" name={name} checked={current === value} onChange={() => onChange(value)} />
      {label}
    </label>
  )
}

const ListIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12h.01M3 18h.01M3 6h.01M8 12h13M8 18h13M8 6h13" />
  </svg>
)
const ColumnsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18M15 3v18" />
  </svg>
)

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

export default function PrintScheduleDialog({ mode, weekLabel, customers, appliedFilters, onClose }) {
  const isPrint = mode === 'print'
  const CUSTOMERS = customers
  const [selected, setSelected] = useState(() => new Set(customers))
  const [range, setRange] = useState('weekly')
  const [orientation, setOrientation] = useState('portrait')
  const [layout, setLayout] = useState('list') // 'list' = one row per visit (the default), 'cards' = the seven-day columns layout (both at 11pt)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const [pending, setPending] = useState(isPrint)
  const [unassigned, setUnassigned] = useState(isPrint)

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

  const previewCustomer = CUSTOMERS.find(c => selected.has(c))
  const pageW = PAGE[orientation].w
  const scale = 96 / 72
  const thumbScale = 160 / pageW
  const modalW = Math.min(pageW * scale + 96, window.innerWidth - 48)

  const allSelected = selected.size === CUSTOMERS.length
  const toggle = name => setSelected(s => {
    const next = new Set(s)
    next.has(name) ? next.delete(name) : next.add(name)
    return next
  })

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
          <h2>Schedule layout</h2>
          <div className="ps-layout-row">
            <div className="ps-layout-cards">
              {[
                { key: 'list', label: 'List', isNew: true, icon: <ListIcon />, desc: 'One row per visit, grouped by day. Runs over as many pages as it needs.' },
                { key: 'cards', label: 'Weekly columns', icon: <ColumnsIcon />, desc: 'Each day side by side in seven columns, all on one page.' },
              ].map(o => (
                <label key={o.key} className={`radio-card${layout === o.key ? ' selected' : ''}`}>
                  <input type="radio" className="form-radio" name="layout" checked={layout === o.key} onChange={() => setLayout(o.key)} />
                  {o.icon}
                  <span className="ps-layout-text">
                    <span className="ps-layout-label">{o.label}{o.isNew && <span className="ps-new-badge">NEW</span>}</span>
                    <span className="ps-layout-desc">{o.desc}</span>
                  </span>
                </label>
              ))}
            </div>
            <button type="button" className="ps-thumb" disabled={selected.size === 0} onClick={() => setPreviewOpen(true)}
              aria-label={`Open full preview - ${layout === 'list' ? 'List' : 'Weekly columns'}`}>
              <span className="ps-thumb-page" style={{ width: pageW * thumbScale, height: PAGE[orientation].h * thumbScale }}>
                <span className="ps-thumb-inner" style={{ transform: `scale(${thumbScale})`, width: pageW }}>
                  <SchedulePdfPreview customer={previewCustomer || ''} weekLabel={weekLabel} orientation={orientation} textSize="11" layout={layout} showPending={pending} showCancelled={cancelled} />
                </span>
              </span>
              <span className="ps-thumb-hint">Click to view full preview</span>
            </button>
          </div>
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
      title={`Preview - ${layout === 'list' ? 'List' : 'Weekly columns'}`}
      width={modalW}
    >
      <ScaledPage scale={scale} width={pageW}>
        <SchedulePdfPreview customer={previewCustomer || ''} weekLabel={weekLabel} orientation={orientation} textSize="11" layout={layout} showPending={pending} showCancelled={cancelled} />
      </ScaledPage>
    </ModalPanel>
    </>
  )
}

