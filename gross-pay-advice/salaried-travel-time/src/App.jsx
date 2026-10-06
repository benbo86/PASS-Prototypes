import { useRef, useState, useMemo, useCallback, useEffect } from 'react'
import Tooltip from '../../../Components/Tooltip'
import FilterDropdown from '../../../Components/FilterDropdown'
import Pagination from '../../../Components/Pagination'
import DevToolbar from '../../../Components/DevToolbar'
import DevMode from '../../../Components/DevMode'
import DevComments from '../../../Components/DevComments'
import DevEdit from '../../../Components/DevEdit'
import WireframeToggle from '../../../Components/WireframeToggle'
import AuditCapture from '../../../Components/AuditCapture'
import { EMPLOYEE, CONTRACT, SCENARIOS, buildGpa, fmtDur, fmtGBP } from './data'

// ─── Icons ──────────────────────────────────────────────────────────────────

const ChevronLeft = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.7 16.9L11.1 12.3L15.7 7.70005L14.3 6.30005L8.30001 12.3L14.3 18.3L15.7 16.9Z"/>
  </svg>
)
const ChevronRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8.29999 7.70005L12.9 12.3L8.29999 16.9L9.69999 18.3L15.7 12.3L9.69999 6.30005L8.29999 7.70005Z"/>
  </svg>
)
const ChevronDown = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <polygon points="16.6,8.6 12,13.2 7.4,8.6 6,10 12,16 18,10" fill="currentColor"/>
  </svg>
)
const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15,18 9,12 15,6"/>
  </svg>
)
const FilterIcon = ({ active }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" className={`col-icon ${active ? 'col-icon--active' : ''}`}>
    {active ? (
      <path d="M10.5,15.7658125 L10.5,12 L6.75103413,7.83448237 C6.56630462,7.62922736 6.58294383,7.31308244 6.78819884,7.12835293 C6.88001119,7.04572181 6.99916031,7 7.1226812,7 L16.8773188,7 C17.1534612,7 17.3773188,7.22385763 17.3773188,7.5 C17.3773188,7.62352089 17.331597,7.74267001 17.2489659,7.83448237 L13.5,12 L13.5,17.4324792 C13.5,17.7086216 13.2761424,17.9324792 13,17.9324792 C12.8830317,17.9324792 12.7697653,17.8914711 12.6799078,17.8165898 L10.6799078,16.1499232 C10.5659115,16.0549263 10.5,15.9142024 10.5,15.7658125 Z" fill="currentColor"/>
    ) : (
      <path d="M15 17c0-.552-.448-1-1-1h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1zm3-5c0-.552-.448-1-1-1H7c-.552 0-1 .448-1 1s.448 1 1 1h10c.552 0 1-.448 1-1zM4 8h16c.552 0 1-.448 1-1s-.448-1-1-1H4c-.552 0-1 .448-1 1s.448 1 1 1z" fill="currentColor"/>
    )}
  </svg>
)
const SortIcon = ({ dir }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" className={`col-icon sort-icon ${dir ? 'col-icon--active' : ''}`} strokeLinecap="square">
    <polyline points="7.5,9 12,5 16.5,9" stroke="currentColor" strokeWidth="2" fill="none" opacity={dir === 'desc' ? 0.35 : 1}/>
    <polyline points="7.5,19 12,15 16.5,19" stroke="currentColor" strokeWidth="2" fill="none"
      style={{ transform: 'scaleY(-1)', transformOrigin: '12px 17px' }} opacity={dir === 'asc' ? 0.35 : 1}/>
  </svg>
)
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <polygon fill="currentColor" stroke="currentColor" strokeLinejoin="round"
      points="18 7.2 16.8 6 12 10.8 7.2 6 6 7.2 10.8 12 6 16.8 7.2 18 12 13.2 16.8 18 18 16.8 13.2 12"/>
  </svg>
)
const InfoIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,2 C17.52,2 22,6.48 22,12 C22,17.52 17.52,22 12,22 C6.48,22 2,17.52 2,12 C2,6.48 6.48,2 12,2 Z M10.6662105,9.93690394 L10.581437,9.93690394 C10.1076337,9.93690394 9.72611507,10.3209137 9.72611507,10.7922258 C9.72611507,11.2660291 10.1101248,11.6475478 10.581437,11.6475478 L10.6662105,11.6475478 L10.6662105,16.6348056 L10.5826825,16.6348056 C10.1096134,16.6348056 9.72611507,17.0183039 9.72611507,17.491373 C9.72611507,17.9644422 10.1096134,18.3479405 10.5826825,18.3479405 L13.4173175,18.3479405 C13.8903866,18.3479405 14.2738849,17.9644422 14.2738849,17.491373 C14.2738849,17.0183039 13.8903866,16.6348056 13.4173175,16.6348056 L13.3387717,16.6348056 L13.3362805,10.936904 C13.3360752,10.3847645 12.8884201,9.93727594 12.3362806,9.93727594 L10.6662105,9.93690394 Z M11.8678197,5.65205952 C11.0006244,5.65205952 10.2992557,6.35342819 10.2992557,7.22062354 C10.2992557,8.08781889 11.0006244,8.78918756 11.8678197,8.78918756 C12.7350151,8.78918756 13.4363837,8.08781889 13.4363837,7.22062354 C13.4363837,6.35342819 12.7350151,5.65205952 11.8678197,5.65205952 Z"/>
  </svg>
)
const SettingsIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.5759 2.85953C14.1433 1.88245 15.341 1.47271 16.3181 1.88245C17.1375 2.22915 17.894 2.67041 18.6189 3.20623C19.4699 3.8366 19.7221 5.06583 19.1547 6.04291C18.8395 6.61024 18.8395 7.30365 19.1547 7.87099C19.4699 8.43832 20.0688 8.78503 20.7307 8.78503C21.8653 8.78503 22.8109 9.63603 22.937 10.7392C23 11.1489 23 11.5902 23 11.9999C23 12.4097 23 12.8509 22.937 13.2607C22.8109 14.3638 21.8653 15.2148 20.7307 15.2148C20.1003 15.2148 19.4699 15.5615 19.1547 16.1289C18.8395 16.6962 18.8395 17.3896 19.1547 17.9569C19.7221 18.934 19.4699 20.1317 18.6189 20.7936C17.894 21.3294 17.1375 21.7707 16.3181 22.1174C16.0344 22.212 15.7822 22.275 15.4986 22.275C14.7421 22.275 13.9857 21.8653 13.5759 21.1403C13.2607 20.573 12.6304 20.2263 12 20.2263C11.3696 20.2263 10.7393 20.573 10.4241 21.1403C9.85673 22.1174 8.65903 22.5271 7.68195 22.1174C6.86246 21.7707 6.10602 21.3294 5.38109 20.7936C4.53009 20.1633 4.27794 18.934 4.84527 17.9569C5.16046 17.3896 5.16046 16.6962 4.84527 16.1289C4.53009 15.5615 3.93123 15.2148 3.26934 15.2148C2.13467 15.2148 1.18911 14.3638 1.06304 13.2607C1.03152 12.8509 1 12.4097 1 11.9999C1 11.5902 1 11.1489 1.06304 10.7392C1.18911 9.63603 2.13467 8.78503 3.26934 8.78503C3.89971 8.78503 4.53009 8.43832 4.84527 7.87099C5.16046 7.30365 5.16046 6.61024 4.84527 6.04291C4.27794 5.06583 4.53009 3.86812 5.38109 3.20623C6.10602 2.67041 6.86246 2.22915 7.68195 1.88245C8.69054 1.47271 9.85673 1.88245 10.4241 2.85953C10.7393 3.42686 11.3696 3.77357 12 3.77357C12.6304 3.77357 13.2607 3.42686 13.5759 2.85953ZM15.6246 3.58445C15.4355 3.4899 15.2779 3.61597 15.1834 3.77357C14.5215 4.90824 13.3238 5.60165 12 5.60165C10.6762 5.60165 9.47851 4.90824 8.81662 3.77357C8.72206 3.64749 8.53295 3.52142 8.37536 3.58445C7.68195 3.86812 7.05158 4.24635 6.45272 4.68761C6.32665 4.78216 6.32665 5.00279 6.4212 5.16039C7.08309 6.29506 7.08309 7.68188 6.4212 8.81655C5.79083 9.9197 4.5616 10.6446 3.26934 10.6446C3.08023 10.6446 2.92264 10.7707 2.89112 10.9598C2.8596 11.3065 2.82808 11.6532 2.82808 11.9999C2.82808 12.3466 2.8596 12.6933 2.89112 13.04C2.89112 13.2292 3.04871 13.3552 3.26934 13.3552C4.5616 13.3552 5.75931 14.0486 6.4212 15.1833C7.05158 16.318 7.08309 17.7048 6.4212 18.8395C6.32665 18.9971 6.29513 19.2177 6.45272 19.3122C7.05158 19.7535 7.68195 20.1317 8.37536 20.4154C8.56447 20.51 8.72206 20.3839 8.81662 20.2263C9.47851 19.0916 10.6762 18.3982 12 18.3982C13.3238 18.3982 14.5215 19.0916 15.1834 20.2263C15.2779 20.3524 15.467 20.4784 15.6246 20.4154C16.3181 20.1317 16.9484 19.7535 17.5473 19.3122C17.6734 19.2177 17.6734 18.9971 17.5788 18.8395C16.9169 17.7048 16.9169 16.318 17.5788 15.1833C18.2092 14.0802 19.4384 13.3552 20.7307 13.3552C20.9198 13.3552 21.0774 13.2292 21.1089 13.04C21.1719 12.6933 21.1719 12.3466 21.1719 11.9999C21.1719 11.6532 21.1404 11.3065 21.1089 10.9598C21.1089 10.7707 20.9513 10.6446 20.7307 10.6446C19.4384 10.6446 18.2407 9.95122 17.5788 8.81655C16.9484 7.68188 16.9169 6.29506 17.5788 5.16039C17.6734 5.00279 17.7049 4.78216 17.5473 4.68761C16.9484 4.24635 16.2865 3.86812 15.6246 3.58445ZM12 8.34377C14.0172 8.34377 15.6562 9.98274 15.6562 11.9999C15.6562 14.0171 14.0172 15.6561 12 15.6561C9.98281 15.6561 8.34384 14.0171 8.34384 11.9999C8.34384 9.98274 9.98281 8.34377 12 8.34377ZM12 10.1718C10.9914 10.1718 10.1719 10.9913 10.1719 11.9999C10.1719 13.0085 10.9914 13.828 12 13.828C13.0086 13.828 13.8281 13.0085 13.8281 11.9999C13.8281 10.9913 13.0086 10.1718 12 10.1718Z"/>
  </svg>
)
const ExternalLinkIcon = () => (
  <svg width="24" height="24" viewBox="0 0 25 25" fill="currentColor">
    <g transform="translate(0, 1)">
      <polygon transform="translate(14.5583, 9.4417) rotate(-45) translate(-14.5583, -9.4417)"
        points="15.1829434 2.85587799 13.7829434 4.25587799 17.9687298 8.44166442 7.34794132 8.57316725 7.34794132 10.5731672 17.9687298 10.4416644 13.7829434 14.6274509 15.1829434 16.0274509 21.7687298 9.44166442"/>
      <path fillRule="nonzero" d="M9.5,9 L9.5,11 L6.8,11 C6.3581722,11 6,11.3581722 6,11.8 L6,17.2 C6,17.6418278 6.3581722,18 6.8,18 L12.2,18 C12.6418278,18 13,17.6418278 13,17.2 L13,14.5 L15,14.5 L15,17.2 C15,18.7463973 13.7463973,20 12.2,20 L6.8,20 C5.2536027,20 4,18.7463973 4,17.2 L4,11.8 C4,10.2536027 5.2536027,9 6.8,9 L9.5,9 Z"/>
    </g>
  </svg>
)
const EditIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5.00125,16.245799 L5.00125,18.6099151 C5.00125,18.8276627 5.17233735,18.99875 5.39008488,18.99875 L7.75420098,18.99875 C7.85529805,18.99875 7.95639512,18.9598665 8.0263854,18.8820995 L16.5185393,10.3977224 L13.6022776,7.48146073 L5.11790047,15.9658379 C5.04013349,16.0436049 5.00125,16.1369253 5.00125,16.245799 Z M18.7737816,8.14248004 C19.0770728,7.83918883 19.0770728,7.34925687 18.7737816,7.04596566 L16.9540343,5.22621841 C16.6507431,4.9229272 16.1608112,4.9229272 15.85752,5.22621841 L14.4343843,6.64935408 L17.3506459,9.56561571 L18.7737816,8.14248004 Z"/>
  </svg>
)

// ─── Threshold indicator ────────────────────────────────────────────────────

// The one line the contracted-hours threshold falls in: only the part above
// it is paid. Explains the partial amount (AIOP-23746, last AC).
function partialText(row) {
  const { partial } = row
  const contracted = fmtDur(CONTRACT.contractedMins)
  if (partial.kind === 'visit') {
    return `Contracted hours (${contracted}) were reached at ${partial.reachedAt}, part way through this visit. `
      + `Only the ${fmtDur(partial.paidMins)} above contracted hours is paid, at the overtime rate of ${fmtGBP(CONTRACT.overtimeRate)}/hr. `
      + `The first ${fmtDur(partial.coveredMins)} is covered by salary.`
  }
  return `Contracted hours (${contracted}) were reached at ${partial.reachedAt}, part way through the travel to this visit. `
    + `Only the ${fmtDur(partial.paidMins)} of travel above contracted hours is paid, at the travel rate of ${fmtGBP(CONTRACT.travelRate)}/hr. `
    + `The first ${fmtDur(partial.coveredMins)} is covered by salary.`
}

function Amount({ value, row, kind }) {
  const flagged = row.partial?.kind === kind
  return (
    <span className="sth-amount">
      {flagged && (
        <Tooltip text={partialText(row)} wrapClassName="sth-threshold-tip">
          <InfoIcon size={20} />
        </Tooltip>
      )}
      <span>{fmtGBP(value)}</span>
    </span>
  )
}

// ─── Prototype-only scenario switcher ───────────────────────────────────────

function ScenarioSwitcher({ scenario, onChange }) {
  return (
    <div className="sth-scenario" data-devmode-passthrough="true">
      <span className="sth-scenario-tag">Prototype</span>
      <label className="sth-scenario-label" htmlFor="sth-scenario-select">Contracted hours reached</label>
      <select id="sth-scenario-select" className="sth-scenario-select" value={scenario} onChange={e => onChange(e.target.value)}>
        {Object.entries(SCENARIOS).map(([id, sc]) => <option key={id} value={id}>{sc.label}</option>)}
      </select>
    </div>
  )
}

// ─── Table filtering & sorting (same as the other employee GPA tables) ─────

const NUM_COLS = ['pay', 'mileage', 'travelPay', 'total']
const toDateSortKey = ddmmyyyy => { const [d, m, y] = ddmmyyyy.split('/'); return `${y}${m}${d}` }
// Date + start time, so same-day visits stay in time order.
const whenKey = row => toDateSortKey(row.date) + row.from

// Sortable column header — mirrors the GPA detail table's header markup.
function SortTh({ col, label, sort, onSort, num }) {
  const sorted = sort.col === col
  return (
    <th className={`${num ? 'th-num ' : ''}${sorted ? 'sorted' : ''}`}>
      <span>{label}</span>
      <button className="col-icon-btn" onClick={() => onSort(col)}><SortIcon dir={sorted ? sort.dir : null} /></button>
    </th>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function App() {
  const pageRef = useRef(null)
  const [scenario, setScenario] = useState('visit')
  const gpa = useMemo(() => buildGpa(scenario), [scenario])

  const [custFilter, setCustFilter] = useState({ selected: new Set(), sortDir: 'asc', nameField: 'first' })
  const [typeFilter, setTypeFilter] = useState({ search: '' })
  const [sort, setSort]             = useState({ col: null, dir: 'asc' })
  const [openDD, setOpenDD]         = useState(null)
  const anchorRefs                  = useRef({})
  const [page, setPage]             = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(50)

  const allCustomers = useMemo(() => [...new Set(gpa.rows.map(r => r.customerName))].sort(), [gpa])

  const openDropdown  = useCallback(id => setOpenDD(prev => prev === id ? null : id), [])
  const closeDropdown = useCallback(() => setOpenDD(null), [])
  const toggleSort    = col => setSort(prev => prev.col === col ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' })

  const filtered = useMemo(() => {
    let r = gpa.rows
    if (custFilter.selected.size) r = r.filter(v => custFilter.selected.has(v.customerName))
    if (typeFilter.search) r = r.filter(v => v.type.toLowerCase().includes(typeFilter.search.toLowerCase()))
    return r
  }, [gpa, custFilter, typeFilter])

  const sorted = useMemo(() => {
    const r = [...filtered]
    const dir = sort.dir === 'asc' ? 1 : -1
    // Default: newest first, so the line that crosses the threshold (late in
    // the period) sits near the top rather than at the bottom of a long list.
    if (!sort.col) return r.sort((a, b) => whenKey(b).localeCompare(whenKey(a)))
    return r.sort((a, b) => {
      if (sort.col === 'date') return dir * whenKey(a).localeCompare(whenKey(b))
      if (sort.col === 'duration') return dir * (a.durationMins - b.durationMins)
      if (NUM_COLS.includes(sort.col)) return dir * (a[sort.col] - b[sort.col])
      return dir * (a[sort.col] || '').localeCompare(b[sort.col] || '')
    })
  }, [filtered, sort])

  const clearFilters = () => {
    setCustFilter({ selected: new Set(), sortDir: 'asc', nameField: 'first' })
    setTypeFilter({ search: '' })
    setSort({ col: null, dir: 'asc' })
    setPage(1)
  }

  useEffect(() => { setPage(1) }, [custFilter, typeFilter, scenario])

  const totalRows  = sorted.length
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage))
  const safePage   = Math.min(page, totalPages)
  const pageRows   = sorted.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage)
  const showStart  = totalRows === 0 ? 0 : (safePage - 1) * rowsPerPage + 1
  const showEnd    = Math.min(safePage * rowsPerPage, totalRows)
  const anyFilter  = !!(custFilter.selected.size || typeFilter.search)

  return (
    <>
      <DevToolbar>
        <DevEdit containerRef={pageRef} prototypeId={window.location.pathname} />
        <DevMode containerRef={pageRef} />
        <DevComments containerRef={pageRef} prototypeId={window.location.pathname} />
        <WireframeToggle />
        <AuditCapture containerRef={pageRef} />
      </DevToolbar>
      <div className="gpa-page" ref={pageRef}>
        <a href="../../" className="back-link"><BackIcon /> Prototypes</a>
        <div className="gpa-body">

          <div className="ts-l2-header">
            <div className="ts-breadcrumbs">
              <a href="../holiday-deduction/" className="ts-breadcrumb-link">Gross Pay Advice</a>
              <ChevronRight />
              <span>{EMPLOYEE.name}</span>
            </div>

            <div className="ts-header-name-row">
              <div className="ts-header-name-group">
                <h1>{EMPLOYEE.name}</h1>
                <span className="ts-status-badge gpa-status-ready">{EMPLOYEE.status}</span>
              </div>
              <div className="ts-header-controls">
                <button className="round-btn secondary-btn" onClick={() => { window.location.href = '../holiday-deduction/' }}>Back</button>
                <button className="round-btn secondary-btn btn-icon-right">Select <ChevronDown size={24} /></button>
                <button className="round-btn tertiary-btn btn-icon-left btn-icon-right">
                  <SettingsIcon size={20} /> Actions <ChevronDown size={24} />
                </button>
              </div>
            </div>

            <div className="ts-header-sub-row">
              <div className="ts-header-sub-left">
                <div className="ts-sub-item">
                  <span className="ts-sub-label">Period:</span>
                  <span className="ts-sub-value">{EMPLOYEE.cycleFrom} – {EMPLOYEE.cycleTo}</span>
                </div>
                <div className="ts-sub-item">
                  <span className="ts-sub-label">Ref:</span>
                  <span className="ts-sub-value">{EMPLOYEE.gpaRef}</span>
                </div>
                <div className="ts-sub-item">
                  <span className="ts-sub-label">Contract:</span>
                  <span className="ts-sub-value">{EMPLOYEE.contract}</span>
                </div>
              </div>
              <div className="ts-header-sub-right">
                <div className="ts-sub-item">
                  <span className="ts-sub-label">Contracted hours:</span>
                  <span className="ts-sub-value">{fmtDur(CONTRACT.contractedMins)}</span>
                </div>
                <div className="ts-sub-item">
                  <span className="ts-sub-label">Working time:</span>
                  <span className="ts-sub-value">{fmtDur(gpa.workedMins)}</span>
                </div>
                <div className="ts-sub-item">
                  <span className="ts-sub-label">Gross pay:</span>
                  <span className="ts-sub-value">{fmtGBP(gpa.pay)}</span>
                </div>
                {anyFilter && (
                  <button className="clear-btn" onClick={clearFilters}><CloseIcon /> Clear</button>
                )}
                <span className="count-label">Showing: {showStart} – {showEnd} of {totalRows}</span>
                <button className="gpa-nav-arrow pag-inline" disabled={safePage <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}><ChevronLeft /></button>
                <button className="gpa-nav-arrow pag-inline" disabled={safePage >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}><ChevronRight /></button>
              </div>
            </div>
          </div>

          <div className="table-wrap">
            <table className="data-table sth-table">
              <thead>
                <tr>
                  {/* Customer — checkbox filter */}
                  <th>
                    <span>Customer</span>
                    <button ref={el => anchorRefs.current['cust'] = el}
                      className={`col-icon-btn ${custFilter.selected.size ? 'col-icon-btn--active' : ''}`}
                      data-devmode-passthrough="true"
                      onClick={() => openDropdown('cust')}>
                      <FilterIcon active={custFilter.selected.size > 0} />
                    </button>
                    <FilterDropdown
                      items={allCustomers} selected={custFilter.selected}
                      onApply={(sel, sortDir, nameField) => setCustFilter({ selected: sel, sortDir, nameField })}
                      onClear={() => setCustFilter({ selected: new Set(), sortDir: 'asc', nameField: 'first' })}
                      hasNameSort
                      isOpen={openDD === 'cust'} onClose={closeDropdown} anchorEl={anchorRefs.current['cust']}
                    />
                  </th>
                  <SortTh col="date" label="Date" sort={sort} onSort={toggleSort} />
                  <SortTh col="visitName" label="Visit Name" sort={sort} onSort={toggleSort} />
                  {/* Type — search filter */}
                  <th>
                    <span>Type</span>
                    <button ref={el => anchorRefs.current['type'] = el}
                      className={`col-icon-btn ${typeFilter.search ? 'col-icon-btn--active' : ''}`}
                      data-devmode-passthrough="true"
                      onClick={() => openDropdown('type')}>
                      <FilterIcon active={!!typeFilter.search} />
                    </button>
                    <FilterDropdown
                      items={[]} selected={new Set()}
                      onApply={(_, __, ___, search) => setTypeFilter({ search: search || '' })}
                      onClear={() => setTypeFilter({ search: '' })}
                      searchOnly hasSort={false}
                      isOpen={openDD === 'type'} onClose={closeDropdown} anchorEl={anchorRefs.current['type']}
                    />
                  </th>
                  <SortTh col="from" label="From" sort={sort} onSort={toggleSort} />
                  <SortTh col="to" label="To" sort={sort} onSort={toggleSort} />
                  <SortTh col="duration" label="Duration" sort={sort} onSort={toggleSort} />
                  <th><span>Status</span></th>
                  <SortTh col="pay" label="Pay" sort={sort} onSort={toggleSort} num />
                  <SortTh col="mileage" label="Mileage" sort={sort} onSort={toggleSort} num />
                  <SortTh col="travelPay" label="Travel pay" sort={sort} onSort={toggleSort} num />
                  <SortTh col="total" label="Total" sort={sort} onSort={toggleSort} num />
                  <th className="icon-col"><span>TS</span></th>
                  <th className="icon-col"></th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map(row => (
                  <tr key={row.id} className="data-row">
                    <td className="td-name">{row.customerName}</td>
                    <td className="nowrap">{row.date}</td>
                    <td>{row.visitName}</td>
                    <td>{row.type}</td>
                    <td className="nowrap">{row.from}</td>
                    <td className="nowrap">{row.to}</td>
                    <td>{row.duration}</td>
                    <td><span className="status-pill status-completed">{row.status}</span></td>
                    <td className="td-num"><Amount value={row.pay} row={row} kind="visit" /></td>
                    <td className="td-num">{row.mileage > 0 ? fmtGBP(row.mileage) : '—'}</td>
                    <td className="td-num"><Amount value={row.travelPay} row={row} kind="travel" /></td>
                    <td className="td-num">{fmtGBP(row.total)}</td>
                    <td className="icon-col">
                      <a href="#" className="gpa-ts-link" onClick={e => e.preventDefault()}><ExternalLinkIcon /></a>
                    </td>
                    <td className="icon-col">
                      <button className="edit-icon-btn"><EditIcon /></button>
                    </td>
                  </tr>
                ))}
                {totalRows === 0 && (
                  <tr><td colSpan={14} className="table-empty">No records match the current filters</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            page={safePage} totalPages={totalPages} rowsPerPage={rowsPerPage}
            showStart={showStart} showEnd={showEnd} totalRows={totalRows}
            onPageChange={setPage}
            onRowsPerPageChange={n => { setRowsPerPage(n); setPage(1) }}
          />
        </div>
        <ScenarioSwitcher scenario={scenario} onChange={setScenario} />
      </div>
    </>
  )
}
