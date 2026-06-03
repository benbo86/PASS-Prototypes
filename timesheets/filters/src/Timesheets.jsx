import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import FilterDropdown from './FilterDropdown';
import Pagination from '../../../Components/Pagination';
import { CalendarIcon, fmtDate, DateRangeInput } from '../../../Components/DateRangePicker';
import {
  EMPLOYEES, VISITS, FUNDERS, CUSTOMERS, VISIT_STATUSES, VISIT_TYPES,
  HOLIDAY_RECORDS, fmtMins, fmtGBP,
} from './data';

// ─── SVG icons ─────────────────────────────────────────────────────────────

const FilterIcon = ({ active }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" className={`col-icon ${active ? 'col-icon--active' : ''}`}>
    {active ? (
      <path d="M10.5,15.7658125 L10.5,12 L10.5,12 L6.75103413,7.83448237 C6.56630462,7.62922736 6.58294383,7.31308244 6.78819884,7.12835293 C6.88001119,7.04572181 6.99916031,7 7.1226812,7 L16.8773188,7 C17.1534612,7 17.3773188,7.22385763 17.3773188,7.5 C17.3773188,7.62352089 17.331597,7.74267001 17.2489659,7.83448237 L13.5,12 L13.5,12 L13.5,17.4324792 C13.5,17.7086216 13.2761424,17.9324792 13,17.9324792 C12.8830317,17.9324792 12.7697653,17.8914711 12.6799078,17.8165898 L10.6799078,16.1499232 C10.5659115,16.0549263 10.5,15.9142024 10.5,15.7658125 Z" fill="currentColor"/>
    ) : (
      <path d="M15 17c0-.552-.448-1-1-1h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1zm3-5c0-.552-.448-1-1-1H7c-.552 0-1 .448-1 1s.448 1 1 1h10c.552 0 1-.448 1-1zM4 8h16c.552 0 1-.448 1-1s-.448-1-1-1H4c-.552 0-1 .448-1 1s.448 1 1 1z" fill="currentColor"/>
    )}
  </svg>
);

const SortIcon = ({ dir }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" className={`col-icon sort-icon ${dir ? 'col-icon--active' : ''}`} strokeLinecap="square">
    <polyline points="7.5,9 12,5 16.5,9" stroke="currentColor" strokeWidth="2" fill="none"
      opacity={dir === 'desc' ? 0.35 : 1}/>
    <polyline points="7.5,19 12,15 16.5,19" stroke="currentColor" strokeWidth="2" fill="none"
      style={{ transform: 'scaleY(-1)', transformOrigin: '12px 17px' }}
      opacity={dir === 'asc' ? 0.35 : 1}/>
  </svg>
);

const ChevronDown = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <polygon points="16.6,8.6 12,13.2 7.4,8.6 6,10 12,16 18,10" fill="currentColor"/>
  </svg>
);

const ChevronLeft = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.7 16.9L11.1 12.3L15.7 7.70005L14.3 6.30005L8.30001 12.3L14.3 18.3L15.7 16.9Z"/>
  </svg>
);

const ChevronRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8.29999 7.70005L12.9 12.3L8.29999 16.9L9.69999 18.3L15.7 12.3L9.69999 6.30005L8.29999 7.70005Z"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <polygon fill="currentColor" stroke="currentColor" strokeLinejoin="round"
      points="18 7.2 16.8 6 12 10.8 7.2 6 6 7.2 10.8 12 6 16.8 7.2 18 12 13.2 16.8 18 18 16.8 13.2 12"/>
  </svg>
);

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15,18 9,12 15,6"/>
  </svg>
);

const SettingsIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.5759 2.85953C14.1433 1.88245 15.341 1.47271 16.3181 1.88245C17.1375 2.22915 17.894 2.67041 18.6189 3.20623C19.4699 3.8366 19.7221 5.06583 19.1547 6.04291C18.8395 6.61024 18.8395 7.30365 19.1547 7.87099C19.4699 8.43832 20.0688 8.78503 20.7307 8.78503C21.8653 8.78503 22.8109 9.63603 22.937 10.7392C23 11.1489 23 11.5902 23 11.9999C23 12.4097 23 12.8509 22.937 13.2607C22.8109 14.3638 21.8653 15.2148 20.7307 15.2148C20.1003 15.2148 19.4699 15.5615 19.1547 16.1289C18.8395 16.6962 18.8395 17.3896 19.1547 17.9569C19.7221 18.934 19.4699 20.1317 18.6189 20.7936C17.894 21.3294 17.1375 21.7707 16.3181 22.1174C16.0344 22.212 15.7822 22.275 15.4986 22.275C14.7421 22.275 13.9857 21.8653 13.5759 21.1403C13.2607 20.573 12.6304 20.2263 12 20.2263C11.3696 20.2263 10.7393 20.573 10.4241 21.1403C9.85673 22.1174 8.65903 22.5271 7.68195 22.1174C6.86246 21.7707 6.10602 21.3294 5.38109 20.7936C4.53009 20.1633 4.27794 18.934 4.84527 17.9569C5.16046 17.3896 5.16046 16.6962 4.84527 16.1289C4.53009 15.5615 3.93123 15.2148 3.26934 15.2148C2.13467 15.2148 1.18911 14.3638 1.06304 13.2607C1.03152 12.8509 1 12.4097 1 11.9999C1 11.5902 1 11.1489 1.06304 10.7392C1.18911 9.63603 2.13467 8.78503 3.26934 8.78503C3.89971 8.78503 4.53009 8.43832 4.84527 7.87099C5.16046 7.30365 5.16046 6.61024 4.84527 6.04291C4.27794 5.06583 4.53009 3.86812 5.38109 3.20623C6.10602 2.67041 6.86246 2.22915 7.68195 1.88245C8.69054 1.47271 9.85673 1.88245 10.4241 2.85953C10.7393 3.42686 11.3696 3.77357 12 3.77357C12.6304 3.77357 13.2607 3.42686 13.5759 2.85953ZM15.6246 3.58445C15.4355 3.4899 15.2779 3.61597 15.1834 3.77357C14.5215 4.90824 13.3238 5.60165 12 5.60165C10.6762 5.60165 9.47851 4.90824 8.81662 3.77357C8.72206 3.64749 8.53295 3.52142 8.37536 3.58445C7.68195 3.86812 7.05158 4.24635 6.45272 4.68761C6.32665 4.78216 6.32665 5.00279 6.4212 5.16039C7.08309 6.29506 7.08309 7.68188 6.4212 8.81655C5.79083 9.9197 4.5616 10.6446 3.26934 10.6446C3.08023 10.6446 2.92264 10.7707 2.89112 10.9598C2.8596 11.3065 2.82808 11.6532 2.82808 11.9999C2.82808 12.3466 2.8596 12.6933 2.89112 13.04C2.89112 13.2292 3.04871 13.3552 3.26934 13.3552C4.5616 13.3552 5.75931 14.0486 6.4212 15.1833C7.05158 16.318 7.08309 17.7048 6.4212 18.8395C6.32665 18.9971 6.29513 19.2177 6.45272 19.3122C7.05158 19.7535 7.68195 20.1317 8.37536 20.4154C8.56447 20.51 8.72206 20.3839 8.81662 20.2263C9.47851 19.0916 10.6762 18.3982 12 18.3982C13.3238 18.3982 14.5215 19.0916 15.1834 20.2263C15.2779 20.3524 15.467 20.4784 15.6246 20.4154C16.3181 20.1317 16.9484 19.7535 17.5473 19.3122C17.6734 19.2177 17.6734 18.9971 17.5788 18.8395C16.9169 17.7048 16.9169 16.318 17.5788 15.1833C18.2092 14.0802 19.4384 13.3552 20.7307 13.3552C20.9198 13.3552 21.0774 13.2292 21.1089 13.04C21.1719 12.6933 21.1719 12.3466 21.1719 11.9999C21.1719 11.6532 21.1404 11.3065 21.1089 10.9598C21.1089 10.7707 20.9513 10.6446 20.7307 10.6446C19.4384 10.6446 18.2407 9.95122 17.5788 8.81655C16.9484 7.68188 16.9169 6.29506 17.5788 5.16039C17.6734 5.00279 17.7049 4.78216 17.5473 4.68761C16.9484 4.24635 16.2865 3.86812 15.6246 3.58445ZM12 8.34377C14.0172 8.34377 15.6562 9.98274 15.6562 11.9999C15.6562 14.0171 14.0172 15.6561 12 15.6561C9.98281 15.6561 8.34384 14.0171 8.34384 11.9999C8.34384 9.98274 9.98281 8.34377 12 8.34377ZM12 10.1718C10.9914 10.1718 10.1719 10.9913 10.1719 11.9999C10.1719 13.0085 10.9914 13.828 12 13.828C13.0086 13.828 13.8281 13.0085 13.8281 11.9999C13.8281 10.9913 13.0086 10.1718 12 10.1718Z"/>
  </svg>
);

// ─── Verified badge ─────────────────────────────────────────────────────────

function VerifiedBadge({ verified, total }) {
  if (total === 0) return <span className="verified-badge verified-none">0/0</span>;
  const cls = verified === total ? 'verified-full' : verified === 0 ? 'verified-none' : 'verified-partial';
  return <span className={`verified-badge ${cls}`}>{verified}/{total}</span>;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function verifiedStatus(verified, total) {
  if (total === 0 || verified === 0) return 'Unverified';
  if (verified === total) return 'Verified';
  return 'Partially verified';
}

const SORTABLE_COLS = ['visits', 'runs', 'travelMins', 'waitMins', 'mileage', 'expenses', 'holiday'];
const COL_LABELS = {
  visits: 'Visits', runs: 'Runs', travelMins: 'Travel time',
  waitMins: 'Wait time', mileage: 'Mileage', expenses: 'Expenses', holiday: 'Holidays',
};

// ─── Holiday Panel ───────────────────────────────────────────────────────────

const TABS = ['Details', 'Finance', 'Notes', 'History'];

function HolidayPanel({ record, onClose }) {
  const [activeTab, setActiveTab] = useState('finance');
  const [deduction, setDeduction] = useState(record.deduction.toFixed(2));
  const [savedDeduction, setSavedDeduction] = useState(record.deduction);
  const [editHistory, setEditHistory] = useState([]);

  const isDirty = parseFloat(deduction) !== savedDeduction;

  const handleSave = () => {
    const newVal = parseFloat(deduction);
    const now = new Date();
    setEditHistory(prev => [{
      user: 'Karen Bailey',
      time: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      date: now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }),
      from: savedDeduction,
      to: newVal,
    }, ...prev]);
    setSavedDeduction(newVal);
  };

  const rateLabel = record.dailyRate
    ? `${record.durationLabel} × £${record.dailyRate.toFixed(2)} daily rate`
    : `${record.durationLabel} × £${record.hourlyRate.toFixed(2)}/hr rate`;

  return (
    <>
      <div className="hp-scrim" onClick={onClose} />
      <div className="hp-panel">

        {/* Header */}
        <div className="hp-header">
          <button className="hp-close" onClick={onClose}><CloseIcon /></button>
          <h2>Holiday — {record.date}</h2>
          <div className="hp-tabs">
            {TABS.map(t => (
              <button
                key={t}
                className={`hp-tab ${activeTab === t.toLowerCase() ? 'active' : ''}`}
                onClick={() => setActiveTab(t.toLowerCase())}
              >{t}</button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="hp-body">
          {activeTab === 'finance' && (
            <div className="hp-finance">

              <div className="hp-field">
                <label className="hp-label">Holiday deduction (£)</label>
                <input
                  className="hp-input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={deduction}
                  onKeyDown={e => (e.key === '-' || e.key === 'e') && e.preventDefault()}
                  onChange={e => { const v = e.target.value; if (v === '' || parseFloat(v) >= 0) setDeduction(v); }}
                />
                {editHistory.length > 0 && (
                  <span className="hp-last-edit">
                    Last edited by {editHistory[0].user} at {editHistory[0].time}, {editHistory[0].date}
                  </span>
                )}
              </div>

              <div className="hp-field">
                <label className="hp-label">Duration deducted</label>
                <div className="hp-read-only">{record.durationLabel}</div>
              </div>

              <div className="hp-calc-card">
                <span className={`hp-calc-label${savedDeduction !== record.deduction ? ' hp-calc-struck' : ''}`}>{rateLabel}</span>
                <span className={`hp-calc-total${savedDeduction !== record.deduction ? ' hp-calc-struck' : ''}`}>
                  = £{record.deduction.toFixed(2)} deduction
                </span>
                <a
                  href="#"
                  className="hp-contract-link"
                  onClick={e => e.preventDefault()}
                >View contract →</a>
              </div>

            </div>
          )}
          {activeTab === 'history' && (
            editHistory.length === 0
              ? <p className="hp-placeholder">No changes have been recorded.</p>
              : <div className="hp-history-list">
                  {editHistory.map((e, i) => (
                    <div key={i} className="hp-history-entry">
                      <div className="hp-history-meta">{e.user} · {e.time}, {e.date}</div>
                      <div className="hp-history-detail">
                        Holiday deduction changed from £{e.from.toFixed(2)} to £{e.to.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
          )}
          {activeTab !== 'finance' && activeTab !== 'history' && (
            <p className="hp-placeholder">No content for this tab in the prototype.</p>
          )}
        </div>

        {/* Footer */}
        <div className="hp-footer">
          <button className="round-btn tertiary-btn" onClick={onClose}>Cancel</button>
          <button className="round-btn primary-btn" disabled={!isDirty} onClick={handleSave}>Save changes</button>
        </div>

      </div>
    </>
  );
}

// ─── Level 2 – Visit Detail ─────────────────────────────────────────────────

function VisitDetail({ employee, visits, onBack, period = '' }) {
  const [payAll,  setPayAll]  = useState(false);
  const [invAll,  setInvAll]  = useState(false);
  const [payRows, setPayRows] = useState({});
  const [invRows, setInvRows] = useState({});
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [copies, setCopies] = useState(false);

  // Filter + sort state
  const [sort,            setSort]            = useState({ col: null, dir: 'asc' });
  const [customerFilter,  setCustomerFilter]  = useState({ selected: new Set(), sortDir: 'asc', nameField: 'first' });
  const [typeFilter,      setTypeFilter]      = useState({ selected: new Set() });
  const [statusFilter,    setStatusFilter]    = useState({ selected: new Set() });
  const [payRefFilter,    setPayRefFilter]    = useState({ search: '', sortDir: null });
  const [invRefFilter,    setInvRefFilter]    = useState({ search: '', sortDir: null });
  const [page,            setPage]            = useState(1);
  const [rowsPerPage,     setRowsPerPage]     = useState(12);
  const [openDD,          setOpenDD]          = useState(null);
  const anchorRefs = useRef({});

  const openDropdown  = useCallback((id) => setOpenDD(prev => prev === id ? null : id), []);
  const closeDropdown = useCallback(() => setOpenDD(null), []);

  const clearAllFilters = () => {
    setCustomerFilter({ selected: new Set(), sortDir: 'asc', nameField: 'first' });
    setTypeFilter({ selected: new Set() });
    setStatusFilter({ selected: new Set() });
    setPayRefFilter({ search: '', sortDir: null });
    setInvRefFilter({ search: '', sortDir: null });
    setSort({ col: null, dir: 'asc' });
    setPage(1);
  };

  const toggleSort    = (col) => setSort(prev =>
    prev.col === col ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' }
  );

  // Base data for this employee
  const baseVisits = useMemo(() =>
    visits.filter(v => v.employeeId === employee.id),
    [visits, employee.id]
  );
  const empHolidays = useMemo(() =>
    HOLIDAY_RECORDS.filter(h => h.employeeId === employee.id)
      .sort((a, b) => a.rawDate.localeCompare(b.rawDate)),
    [employee.id]
  );

  const payVerCount = useMemo(() => baseVisits.filter(v => v.payVerified).length, [baseVisits]);
  const invVerCount = useMemo(() => baseVisits.filter(v => v.invVerified).length, [baseVisits]);
  const verStatus = payVerCount === 0 ? 'unverified' : payVerCount === baseVisits.length ? 'verified' : 'partial';
  const verLabel  = verStatus === 'verified' ? 'Verified' : verStatus === 'partial' ? 'Partially verified' : 'Unverified';
  const anyFilter = !!(customerFilter.selected.size || typeFilter.selected.size || statusFilter.selected.size || payRefFilter.search || invRefFilter.search);

  // Filter value lists
  const allCustomers = useMemo(() => [...new Set(baseVisits.map(v => v.customerName))].sort(), [baseVisits]);
  const allTypes     = useMemo(() => {
    const t = [...new Set(baseVisits.map(v => v.visitType))].sort();
    return empHolidays.length > 0 ? [...t, 'Holiday deduction'] : t;
  }, [baseVisits, empHolidays]);

  // Apply filters to visits
  const filteredVisits = useMemo(() => {
    let r = baseVisits;
    if (customerFilter.selected.size) r = r.filter(v => customerFilter.selected.has(v.customerName));
    if (typeFilter.selected.size)     r = r.filter(v => typeFilter.selected.has(v.visitType));
    if (statusFilter.selected.size)   r = r.filter(v => statusFilter.selected.has(v.status));
    if (payRefFilter.search)          r = r.filter(v => (v.payRef || '').toLowerCase().includes(payRefFilter.search.toLowerCase()));
    if (invRefFilter.search)          r = r.filter(v => (v.invRef || '').toLowerCase().includes(invRefFilter.search.toLowerCase()));
    return r;
  }, [baseVisits, customerFilter, typeFilter, statusFilter, payRefFilter, invRefFilter]);

  // Hide holiday rows if Type filter is active without 'Holiday deduction'
  const filteredHolidays = useMemo(() => {
    if (typeFilter.selected.size && !typeFilter.selected.has('Holiday deduction')) return [];
    return empHolidays;
  }, [empHolidays, typeFilter]);

  // Sort visits
  const sortedVisits = useMemo(() => {
    const r = [...filteredVisits];
    if (sort.col === 'customerName') {
      const key = name => {
        const parts = name.trim().split(/\s+/);
        return customerFilter.nameField === 'last' ? parts[parts.length - 1] : parts[0];
      };
      return r.sort((a, b) => sort.dir === 'asc'
        ? key(a.customerName).localeCompare(key(b.customerName))
        : key(b.customerName).localeCompare(key(a.customerName)));
    }
    if (sort.col) {
      return r.sort((a, b) => {
        const av = a[sort.col] ?? '', bv = b[sort.col] ?? '';
        if (typeof av === 'number' && typeof bv === 'number')
          return sort.dir === 'asc' ? av - bv : bv - av;
        return sort.dir === 'asc'
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      });
    }
    return r.sort((a, b) => a.date.localeCompare(b.date) || a.plannedStart.localeCompare(b.plannedStart));
  }, [filteredVisits, sort, customerFilter.nameField]);

  // Reset to page 1 whenever any filter changes
  useEffect(() => { setPage(1); }, [customerFilter, typeFilter, statusFilter, payRefFilter, invRefFilter]);

  // Combine holiday + visit rows for unified pagination
  const allRows = useMemo(() => [
    ...filteredHolidays.map(h => ({ ...h, _isHoliday: true })),
    ...sortedVisits,
  ], [filteredHolidays, sortedVisits]);

  const totalRows  = allRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const safePage   = Math.min(page, totalPages);
  const pageRows   = allRows.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);
  const showStart  = totalRows === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const showEnd    = Math.min(safePage * rowsPerPage, totalRows);
  const selectedCount = Object.values(payRows).filter(Boolean).length + (payAll ? pageRows.length : 0);

  const statusClass = (s) =>
    s === 'Completed' ? 'status-completed' : s === 'Missed' ? 'status-missed' : 'status-cancelled';

  return (
    <div className="ts-page">
      <a href="../../" className="back-link"><BackIcon /> Prototypes</a>
      <div className="ts-body">
        <div className="ts-l2-header">

          {/* Breadcrumbs */}
          <div className="ts-breadcrumbs">
            <button className="ts-breadcrumb-link" onClick={onBack}>Timesheets</button>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--ui-purple-3-grape-grey)', flexShrink: 0 }}>
              <path d="M8.29999 7.70005L12.9 12.3L8.29999 16.9L9.69999 18.3L15.7 12.3L9.69999 6.30005L8.29999 7.70005Z"/>
            </svg>
            <span>{employee.name}</span>
          </div>

          {/* Name + status + action buttons */}
          <div className="ts-header-name-row">
            <div className="ts-header-name-group">
              <h1>{employee.name}</h1>
              <span className={`ts-status-badge ts-status-${verStatus}`}>{verLabel}</span>
            </div>
            <div className="ts-header-controls">
              <button className="round-btn secondary-btn" onClick={onBack}>Back</button>
              <button className="round-btn secondary-btn btn-icon-right">Select <ChevronDown size={24} /></button>
              <button className="round-btn tertiary-btn btn-icon-left btn-icon-right"><SettingsIcon size={20} /> Actions <ChevronDown size={24} /></button>
            </div>
          </div>

          {/* Sub-row: stats left, selected/showing right */}
          <div className="ts-header-sub-row">
            <div className="ts-header-sub-left">
              <label className="checkbox-wrap ts-filter-copies">
                <input type="checkbox" checked={copies} onChange={e => setCopies(e.target.checked)} />
                <span className="checkbox-box" />
                <span>Copies</span>
              </label>
              <div className="ts-sub-item">
                <span className="ts-sub-label">Period:</span>
                <span className="ts-sub-value">{period || '—'}</span>
              </div>
              <div className="ts-sub-item">
                <span className="ts-sub-label">Total visits:</span>
                <span className="ts-sub-value">{baseVisits.length}</span>
              </div>
              <div className="ts-sub-item">
                <span className="ts-sub-label">Total shifts:</span>
                <span className="ts-sub-value">{employee.runs > 0 ? `${employee.runs} day${employee.runs !== 1 ? 's' : ''}` : '0'}</span>
              </div>
              <div className="ts-sub-item">
                <span className="ts-sub-label">Total holidays</span>
                <span className="ts-sub-value">{employee.holiday !== '0' ? employee.holiday : '0'}</span>
              </div>
              <div className="ts-sub-item">
                <span className="ts-sub-label">Verified payroll:</span>
                <span className="ts-sub-value">{payVerCount}</span>
              </div>
              <div className="ts-sub-item">
                <span className="ts-sub-label">Verified invoice:</span>
                <span className="ts-sub-value">{invVerCount}</span>
              </div>
            </div>
            <div className="ts-header-sub-right">
              {anyFilter && (
                <button className="clear-btn" onClick={clearAllFilters}>
                  <CloseIcon /> Clear
                </button>
              )}
              <div className="ts-sub-item">
                <span className="ts-sub-label">Selected:</span>
                <span className="ts-sub-value">{selectedCount} – {totalRows}</span>
              </div>
              <div className="ts-sub-item">
                <span className="ts-sub-label">Showing:</span>
                <span className="ts-sub-value">{showStart} – {showEnd} of {totalRows}</span>
              </div>
              <button className="ts-nav-arrow pag-inline" disabled={safePage <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}><ChevronLeft /></button>
              <button className="ts-nav-arrow pag-inline" disabled={safePage >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}><ChevronRight /></button>
            </div>
          </div>

        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>

                {/* Customer — filter + name sort */}
                <th>
                  <span>Customer</span>
                  <button
                    ref={el => anchorRefs.current['customer'] = el}
                    className={`col-icon-btn ${customerFilter.selected.size ? 'col-icon-btn--active' : ''}`}
                    onClick={() => openDropdown('customer')}
                  >
                    <FilterIcon active={customerFilter.selected.size > 0} />
                  </button>
                  <FilterDropdown
                    items={allCustomers}
                    selected={customerFilter.selected}
                    onApply={(sel, sortDir, nameField) => {
                      setCustomerFilter({ selected: sel, sortDir, nameField });
                      setSort({ col: 'customerName', dir: sortDir });
                    }}
                    onClear={() => { setCustomerFilter({ selected: new Set(), sortDir: 'asc', nameField: 'first' }); setSort({ col: null, dir: 'asc' }); }}
                    hasNameSort
                    isOpen={openDD === 'customer'}
                    onClose={closeDropdown}
                    anchorEl={anchorRefs.current['customer']}
                  />
                </th>

                {/* Visit / Shift — sort */}
                <th className={sort.col === 'visitName' ? 'sorted' : ''}>
                  <span>Visit / Shift</span>
                  <button className="col-icon-btn" onClick={() => toggleSort('visitName')}>
                    <SortIcon dir={sort.col === 'visitName' ? sort.dir : null} />
                  </button>
                </th>

                {/* Type — filter */}
                <th>
                  <span>Type</span>
                  <button
                    ref={el => anchorRefs.current['type'] = el}
                    className={`col-icon-btn ${typeFilter.selected.size ? 'col-icon-btn--active' : ''}`}
                    onClick={() => openDropdown('type')}
                  >
                    <FilterIcon active={typeFilter.selected.size > 0} />
                  </button>
                  <FilterDropdown
                    items={allTypes}
                    selected={typeFilter.selected}
                    onApply={(sel, sortDir) => { setTypeFilter({ selected: sel }); if (sortDir) setSort({ col: 'visitType', dir: sortDir }); }}
                    onClear={() => setTypeFilter({ selected: new Set() })}
                    hasSort={false}
                    isOpen={openDD === 'type'}
                    onClose={closeDropdown}
                    anchorEl={anchorRefs.current['type']}
                  />
                </th>

                {/* Date — sort */}
                <th className={sort.col === 'date' ? 'sorted' : ''}>
                  <span>Date</span>
                  <button className="col-icon-btn" onClick={() => toggleSort('date')}>
                    <SortIcon dir={sort.col === 'date' ? sort.dir : null} />
                  </button>
                </th>

                {/* Planned time — sort */}
                <th className={sort.col === 'plannedStart' ? 'sorted' : ''}>
                  <span>Planned time</span>
                  <button className="col-icon-btn" onClick={() => toggleSort('plannedStart')}>
                    <SortIcon dir={sort.col === 'plannedStart' ? sort.dir : null} />
                  </button>
                </th>

                {/* Actual time — sort */}
                <th className={sort.col === 'actualStart' ? 'sorted' : ''}>
                  <span>Actual time</span>
                  <button className="col-icon-btn" onClick={() => toggleSort('actualStart')}>
                    <SortIcon dir={sort.col === 'actualStart' ? sort.dir : null} />
                  </button>
                </th>

                {/* Status — filter */}
                <th>
                  <span>Status</span>
                  <button
                    ref={el => anchorRefs.current['status'] = el}
                    className={`col-icon-btn ${statusFilter.selected.size ? 'col-icon-btn--active' : ''}`}
                    onClick={() => openDropdown('status')}
                  >
                    <FilterIcon active={statusFilter.selected.size > 0} />
                  </button>
                  <FilterDropdown
                    items={VISIT_STATUSES}
                    selected={statusFilter.selected}
                    onApply={(sel, sortDir) => { setStatusFilter({ selected: sel }); if (sortDir) setSort({ col: 'status', dir: sortDir }); }}
                    onClear={() => setStatusFilter({ selected: new Set() })}
                    hasSort={false}
                    isOpen={openDD === 'status'}
                    onClose={closeDropdown}
                    anchorEl={anchorRefs.current['status']}
                  />
                </th>

                {/* Mileage — sort */}
                <th className={sort.col === 'mileage' ? 'sorted' : ''}>
                  <span>Mileage</span>
                  <button className="col-icon-btn" onClick={() => toggleSort('mileage')}>
                    <SortIcon dir={sort.col === 'mileage' ? sort.dir : null} />
                  </button>
                </th>

                {/* Travel time — sort */}
                <th className={sort.col === 'travelMins' ? 'sorted' : ''}>
                  <span>Travel time</span>
                  <button className="col-icon-btn" onClick={() => toggleSort('travelMins')}>
                    <SortIcon dir={sort.col === 'travelMins' ? sort.dir : null} />
                  </button>
                </th>

                {/* Wait time — sort */}
                <th className={sort.col === 'waitMins' ? 'sorted' : ''}>
                  <span>Wait time</span>
                  <button className="col-icon-btn" onClick={() => toggleSort('waitMins')}>
                    <SortIcon dir={sort.col === 'waitMins' ? sort.dir : null} />
                  </button>
                </th>

                {/* Expenses — sort */}
                <th className={sort.col === 'expenses' ? 'sorted' : ''}>
                  <span>Expenses</span>
                  <button className="col-icon-btn" onClick={() => toggleSort('expenses')}>
                    <SortIcon dir={sort.col === 'expenses' ? sort.dir : null} />
                  </button>
                </th>

                {/* Pay ref — sort + search */}
                <th>
                  <span>Pay ref</span>
                  <button
                    ref={el => anchorRefs.current['payRef'] = el}
                    className={`col-icon-btn ${payRefFilter.search || payRefFilter.sortDir ? 'col-icon-btn--active' : ''}`}
                    onClick={() => openDropdown('payRef')}
                  >
                    <FilterIcon active={!!(payRefFilter.search || payRefFilter.sortDir)} />
                  </button>
                  <FilterDropdown
                    items={[]}
                    selected={new Set()}
                    onApply={(_, sortDir, __, search) => {
                      setPayRefFilter({ search: search || '', sortDir: sortDir || null });
                      if (sortDir) setSort({ col: 'payRef', dir: sortDir });
                    }}
                    onClear={() => { setPayRefFilter({ search: '', sortDir: null }); setSort(s => s.col === 'payRef' ? { col: null, dir: 'asc' } : s); }}
                    searchOnly
                    isOpen={openDD === 'payRef'}
                    onClose={closeDropdown}
                    anchorEl={anchorRefs.current['payRef']}
                  />
                </th>

                {/* Invoice ref — sort + search */}
                <th>
                  <span>Invoice ref</span>
                  <button
                    ref={el => anchorRefs.current['invRef'] = el}
                    className={`col-icon-btn ${invRefFilter.search || invRefFilter.sortDir ? 'col-icon-btn--active' : ''}`}
                    onClick={() => openDropdown('invRef')}
                  >
                    <FilterIcon active={!!(invRefFilter.search || invRefFilter.sortDir)} />
                  </button>
                  <FilterDropdown
                    items={[]}
                    selected={new Set()}
                    onApply={(_, sortDir, __, search) => {
                      setInvRefFilter({ search: search || '', sortDir: sortDir || null });
                      if (sortDir) setSort({ col: 'invRef', dir: sortDir });
                    }}
                    onClear={() => { setInvRefFilter({ search: '', sortDir: null }); setSort(s => s.col === 'invRef' ? { col: null, dir: 'asc' } : s); }}
                    searchOnly
                    isOpen={openDD === 'invRef'}
                    onClose={closeDropdown}
                    anchorEl={anchorRefs.current['invRef']}
                  />
                </th>

                <th className="check-col">
                  <div className="header-check">
                    <label className="checkbox-wrap">
                      <input type="checkbox" checked={payAll} onChange={e => setPayAll(e.target.checked)} />
                      <span className="checkbox-box" />
                    </label>
                    <span>Pay</span>
                  </div>
                </th>
                <th className="check-col">
                  <div className="header-check">
                    <label className="checkbox-wrap">
                      <input type="checkbox" checked={invAll} onChange={e => setInvAll(e.target.checked)} />
                      <span className="checkbox-box" />
                    </label>
                    <span>Inv</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map(row => row._isHoliday ? (
                <tr key={row.id} className="holiday-row" onClick={() => setSelectedHoliday(row)}>
                  <td className="td-dash">—</td>
                  <td className="td-dash">—</td>
                  <td>Holiday deduction</td>
                  <td className="nowrap">{row.date}</td>
                  <td className="nowrap">{row.duration}</td>
                  <td className="td-dash">—</td>
                  <td className="td-dash">—</td>
                  <td className="td-dash">—</td>
                  <td className="td-dash">—</td>
                  <td className="td-dash">—</td>
                  <td className="td-dash">—</td>
                  <td className="td-ref">—</td>
                  <td className="td-ref">—</td>
                  <td className="check-col" onClick={e => e.stopPropagation()}>
                    <label className="checkbox-wrap">
                      <input type="checkbox" checked={payAll || !!payRows[row.id]}
                        onChange={e => setPayRows(p => ({ ...p, [row.id]: e.target.checked }))} />
                      <span className="checkbox-box" />
                    </label>
                  </td>
                  <td className="check-col">
                    <label className="checkbox-wrap checkbox-disabled">
                      <input type="checkbox" disabled />
                      <span className="checkbox-box" />
                    </label>
                  </td>
                </tr>
              ) : (
                <tr key={row.id}>
                  <td>{row.customerName}</td>
                  <td>{row.visitName}</td>
                  <td>{row.visitType}</td>
                  <td className="nowrap">{row.date}</td>
                  <td className="nowrap">{row.plannedStart}–{row.plannedEnd}</td>
                  <td className="nowrap">{row.actualStart}–{row.actualEnd}</td>
                  <td><span className={`status-pill ${statusClass(row.status)}`}>{row.status}</span></td>
                  <td>{row.mileage}</td>
                  <td>{fmtMins(row.travelMins)}</td>
                  <td>{fmtMins(row.waitMins)}</td>
                  <td>{fmtGBP(row.expenses)}</td>
                  <td className="td-ref">{row.payRef || '—'}</td>
                  <td className="td-ref">{row.invRef || '—'}</td>
                  <td className="check-col">
                    <label className="checkbox-wrap">
                      <input type="checkbox" checked={payAll || !!payRows[row.id]}
                        onChange={e => setPayRows(p => ({ ...p, [row.id]: e.target.checked }))} />
                      <span className="checkbox-box" />
                    </label>
                  </td>
                  <td className="check-col">
                    <label className="checkbox-wrap">
                      <input type="checkbox" checked={invAll || !!invRows[row.id]}
                        onChange={e => setInvRows(p => ({ ...p, [row.id]: e.target.checked }))} />
                      <span className="checkbox-box" />
                    </label>
                  </td>
                </tr>
              ))}
              {totalRows === 0 && (
                <tr><td colSpan={15} className="table-empty">No records match the current filters</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={safePage}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          showStart={showStart}
          showEnd={showEnd}
          totalRows={totalRows}
          onPageChange={setPage}
          onRowsPerPageChange={n => { setRowsPerPage(n); setPage(1); }}
        />
      </div>

      {selectedHoliday && (
        <HolidayPanel record={selectedHoliday} onClose={() => setSelectedHoliday(null)} />
      )}
    </div>
  );
}

// ─── Level 1 – Timesheets ───────────────────────────────────────────────────

export default function Timesheets() {
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    const id = parseInt(new URLSearchParams(window.location.search).get('employee'));
    if (id) {
      const emp = EMPLOYEES.find(e => e.id === id);
      if (emp) setSelectedEmployee(emp);
    }
  }, []);

  // Date range picker — default to current week Mon–Sun
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const mon = new Date(today.getFullYear(), today.getMonth(), today.getDate() + diff);
    const sun = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 6);
    return [mon, sun];
  });
  const [startDate, endDate] = dateRange;
  const [hoverDate, setHoverDate] = useState(null);

  const backwardHighlight = useMemo(() => {
    if (!startDate || endDate || !hoverDate || hoverDate >= startDate) return [];
    const dates = [];
    const cur = new Date(hoverDate);
    while (cur < startDate) {
      dates.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return [{ 'react-datepicker__day--in-selecting-range': dates }];
  }, [startDate, endDate, hoverDate]);

  const rangeLabel = startDate && endDate
    ? startDate.toDateString() === endDate.toDateString()
      ? fmtDate(startDate)
      : `${fmtDate(startDate)} – ${fmtDate(endDate)}`
    : startDate ? fmtDate(startDate) : 'Select dates';

  const navigateRange = (dir) => {
    if (!startDate || !endDate) return;
    const ms = endDate.getTime() - startDate.getTime() + 86400000;
    setDateRange([new Date(startDate.getTime() + dir * ms), new Date(endDate.getTime() + dir * ms)]);
  };

  // Above-table filters (filter the underlying visits, changing totals)
  const [funderFilter,   setFunderFilter]   = useState(new Set());
  const [customerFilter, setCustomerFilter] = useState(new Set());
  const [statusFilter,   setStatusFilter]   = useState(new Set());

  // Column header filters (filter employee rows)
  const [empColFilter,     setEmpColFilter]     = useState({ selected: new Set(), sortDir: 'asc', nameField: 'first' });
  const [contractFilter,   setContractFilter]   = useState({ selected: new Set() });
  const [payVerFilter,     setPayVerFilter]     = useState({ selected: new Set() });
  const [invVerFilter,     setInvVerFilter]     = useState({ selected: new Set() });

  // Column sort for numeric columns
  const [sort, setSort] = useState({ col: null, dir: 'asc' });

  // Open dropdown id
  const [openDD, setOpenDD] = useState(null);
  const anchorRefs = useRef({});

  // Pagination
  const [page,       setPage]       = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  // Filter bar checkbox
  const [copies, setCopies] = useState(false);

  // Select checkboxes
  const [payAll, setPayAll]   = useState(false);
  const [invAll, setInvAll]   = useState(false);
  const [payRows, setPayRows] = useState({});
  const [invRows, setInvRows] = useState({});

  const toggleSort = (col) => setSort(prev =>
    prev.col === col ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' }
  );

  const openDropdown = useCallback((id) => setOpenDD(prev => prev === id ? null : id), []);
  const closeDropdown = useCallback(() => setOpenDD(null), []);

  // Step 1: filter visits by above-table filters
  const filteredVisits = useMemo(() => {
    const hasAbove = funderFilter.size || customerFilter.size || statusFilter.size;
    if (!hasAbove) return VISITS;
    return VISITS.filter(v => {
      if (funderFilter.size   && !funderFilter.has(v.funder))       return false;
      if (customerFilter.size && !customerFilter.has(v.customerName)) return false;
      if (statusFilter.size   && !statusFilter.has(v.status))       return false;
      return true;
    });
  }, [funderFilter, customerFilter, statusFilter]);

  // Step 2: aggregate filtered visits per employee
  const employeeRows = useMemo(() => {
    const hasAbove = funderFilter.size || customerFilter.size || statusFilter.size;
    const byEmp = new Map(EMPLOYEES.map(e => [e.id, {
      ...e,
      visits: 0, travelMins: 0, waitMins: 0,
      mileage: 0, expenses: 0,
      payVerCount: 0, invVerCount: 0,
    }]));
    filteredVisits.forEach(v => {
      const row = byEmp.get(v.employeeId);
      if (!row) return;
      row.visits++;
      row.travelMins += v.travelMins;
      row.waitMins   += v.waitMins;
      row.mileage     = Math.round((row.mileage + v.mileage) * 10) / 10;
      row.expenses    = Math.round((row.expenses + v.expenses) * 100) / 100;
      if (v.payVerified) row.payVerCount++;
      if (v.invVerified) row.invVerCount++;
    });
    return [...byEmp.values()].filter(r => !hasAbove || r.visits > 0);
  }, [filteredVisits, funderFilter.size, customerFilter.size, statusFilter.size]);

  // Step 3: apply column filters
  const colFiltered = useMemo(() => {
    return employeeRows.filter(r => {
      if (empColFilter.selected.size && !empColFilter.selected.has(r.name)) return false;
      if (contractFilter.selected.size && !contractFilter.selected.has(r.contract)) return false;
      if (payVerFilter.selected.size) {
        const s = verifiedStatus(r.payVerCount, r.visits);
        if (!payVerFilter.selected.has(s)) return false;
      }
      if (invVerFilter.selected.size) {
        const s = verifiedStatus(r.invVerCount, r.visits);
        if (!invVerFilter.selected.has(s)) return false;
      }
      return true;
    });
  }, [employeeRows, empColFilter, contractFilter, payVerFilter, invVerFilter]);

  // Step 4: sort — numeric column sort takes priority, otherwise sort by employee name
  const sorted = useMemo(() => {
    if (sort.col) {
      return [...colFiltered].sort((a, b) => {
        const av = a[sort.col] ?? 0, bv = b[sort.col] ?? 0;
        return sort.dir === 'asc' ? av - bv : bv - av;
      });
    }
    const { sortDir, nameField } = empColFilter;
    const key = (name) => {
      const parts = name.trim().split(/\s+/);
      return nameField === 'last' ? parts[parts.length - 1] : parts[0];
    };
    return [...colFiltered].sort((a, b) =>
      sortDir === 'asc' ? key(a.name).localeCompare(key(b.name)) : key(b.name).localeCompare(key(a.name))
    );
  }, [colFiltered, sort, empColFilter]);

  // Paginate
  const totalRows  = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const safePage   = Math.min(page, totalPages);
  const pageRows   = sorted.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);
  const showStart  = totalRows === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const showEnd    = Math.min(safePage * rowsPerPage, totalRows);

  // Dropdown item lists (derived from actual data)
  const allFunders    = FUNDERS;
  const allCustomers  = [...new Set(CUSTOMERS.map(c => c.name))].sort();
  const allStatuses   = VISIT_STATUSES;
  const allContracts  = [...new Set(EMPLOYEES.map(e => e.contract))].sort();
  const allEmpNames   = EMPLOYEES.map(e => e.name);
  const verStatuses   = ['Verified', 'Partially verified', 'Unverified'];

  const anyAboveFilter  = funderFilter.size || customerFilter.size || statusFilter.size;
  const anyColFilter    = empColFilter.selected.size || contractFilter.selected.size || payVerFilter.selected.size || invVerFilter.selected.size;
  const anyActiveFilter = !!(anyAboveFilter || anyColFilter);

  const clearAll = () => {
    setFunderFilter(new Set());
    setCustomerFilter(new Set());
    setStatusFilter(new Set());
    setEmpColFilter({ selected: new Set(), sortDir: 'asc', nameField: 'first' });
    setContractFilter({ selected: new Set() });
    setPayVerFilter({ selected: new Set() });
    setInvVerFilter({ selected: new Set() });
    setPage(1);
  };

  const selectedCount = Object.values(payRows).filter(Boolean).length + (payAll ? pageRows.length : 0);

  if (selectedEmployee) {
    return (
      <VisitDetail
        employee={selectedEmployee}
        visits={filteredVisits}
        onBack={() => setSelectedEmployee(null)}
        period={rangeLabel}
      />
    );
  }

  return (
    <div className="ts-page">
      <a href="../../" className="back-link"><BackIcon /> Prototypes</a>

      <div className="ts-body">
        {/* Page header */}
        <div className="ts-page-header">
          <div className="ts-date-nav">
            <button className="ts-nav-arrow" onClick={() => navigateRange(-1)}><ChevronLeft /></button>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => {
                const [newStart, newEnd] = update;
                if (startDate && !endDate && newStart && !newEnd && newStart < startDate) {
                  setDateRange([newStart, startDate]);
                } else {
                  setDateRange(update);
                }
              }}
              customInput={<DateRangeInput label={rangeLabel} />}
              calendarStartDay={1}
              formatWeekDay={d => d.slice(0, 1)}
              highlightDates={backwardHighlight}
              renderDayContents={(day, date) => (
                <span
                  onMouseEnter={() => { if (startDate && !endDate) setHoverDate(date); }}
                  onMouseLeave={() => setHoverDate(null)}
                >{day}</span>
              )}
              popperPlacement="bottom"
              portalId="ts-datepicker-portal"
            />
            <button className="ts-nav-arrow" onClick={() => navigateRange(1)}><ChevronRight /></button>
          </div>
          <div className="ts-header-controls">
            <button className="round-btn secondary-btn btn-icon-right">Select <ChevronDown size={24} /></button>
            <button className="round-btn secondary-btn btn-icon-right" disabled>Actions <ChevronDown size={24} /></button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="filter-bar">
          <div className="filter-bar-left">
            <label className="checkbox-wrap ts-filter-copies">
              <input type="checkbox" checked={copies} onChange={e => setCopies(e.target.checked)} />
              <span className="checkbox-box" />
              <span>Copies</span>
            </label>
            <span className="filter-icon-btn">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M15 17c0-.552-.448-1-1-1h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1zm3-5c0-.552-.448-1-1-1H7c-.552 0-1 .448-1 1s.448 1 1 1h10c.552 0 1-.448 1-1zM4 8h16c.552 0 1-.448 1-1s-.448-1-1-1H4c-.552 0-1 .448-1 1s.448 1 1 1z" fill="currentColor"/>
              </svg>
            </span>

            {/* Funder filter */}
            <div className="filter-pill-wrap">
              <button
                ref={el => anchorRefs.current['funder'] = el}
                className={`filter-pill ${funderFilter.size ? 'active' : ''}`}
                onClick={() => openDropdown('funder')}
              >
                <span>Funder</span>
                {funderFilter.size > 0 && <span className="filter-count">{funderFilter.size}</span>}
                <ChevronDown size={20} />
              </button>
              <FilterDropdown
                items={allFunders}
                selected={funderFilter}
                onApply={(sel) => { setFunderFilter(sel); setPage(1); }}
                onClear={() => { setFunderFilter(new Set()); setPage(1); }}
                hasSort={false} /* hasNameSort */
                isOpen={openDD === 'funder'}
                onClose={closeDropdown}
                anchorEl={anchorRefs.current['funder']}
              />
            </div>

            {/* Customer filter */}
            <div className="filter-pill-wrap">
              <button
                ref={el => anchorRefs.current['customer'] = el}
                className={`filter-pill ${customerFilter.size ? 'active' : ''}`}
                onClick={() => openDropdown('customer')}
              >
                <span>Customer</span>
                {customerFilter.size > 0 && <span className="filter-count">{customerFilter.size}</span>}
                <ChevronDown size={20} />
              </button>
              <FilterDropdown
                items={allCustomers}
                selected={customerFilter}
                onApply={(sel) => { setCustomerFilter(sel); setPage(1); }}
                onClear={() => { setCustomerFilter(new Set()); setPage(1); }}
                hasSort={false} /* hasNameSort */
                isOpen={openDD === 'customer'}
                onClose={closeDropdown}
                anchorEl={anchorRefs.current['customer']}
              />
            </div>

            {/* Visit status filter */}
            <div className="filter-pill-wrap">
              <button
                ref={el => anchorRefs.current['status'] = el}
                className={`filter-pill ${statusFilter.size ? 'active' : ''}`}
                onClick={() => openDropdown('status')}
              >
                <span>Visit status</span>
                {statusFilter.size > 0 && <span className="filter-count">{statusFilter.size}</span>}
                <ChevronDown size={20} />
              </button>
              <FilterDropdown
                items={allStatuses}
                selected={statusFilter}
                onApply={(sel) => { setStatusFilter(sel); setPage(1); }}
                onClear={() => { setStatusFilter(new Set()); setPage(1); }}
                hasSort={false}
                isOpen={openDD === 'status'}
                onClose={closeDropdown}
                anchorEl={anchorRefs.current['status']}
              />
            </div>

            {anyActiveFilter && (
              <button className="clear-btn" onClick={clearAll}>
                <CloseIcon /> Clear
              </button>
            )}
          </div>

          <div className="filter-bar-right">
            <span className="count-label">
              Selected: {selectedCount} – {totalRows}
            </span>
            <span className="count-label">
              Showing: {showStart} – {showEnd} of {totalRows}
            </span>
            <button className="ts-nav-arrow pag-inline" disabled={safePage <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}><ChevronLeft /></button>
            <button className="ts-nav-arrow pag-inline" disabled={safePage >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}><ChevronRight /></button>
          </div>
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {/* Employee — filterable */}
                <th className="th-name">
                  <span>Employee</span>
                  <button
                    ref={el => anchorRefs.current['emp'] = el}
                    className={`col-icon-btn ${empColFilter.selected.size ? 'col-icon-btn--active' : ''}`}
                    onClick={() => openDropdown('emp')}
                  >
                    <FilterIcon active={empColFilter.selected.size > 0} />
                  </button>
                  <FilterDropdown
                    items={allEmpNames}
                    selected={empColFilter.selected}
                    onApply={(sel, sortDir, nameField) => { setEmpColFilter({ selected: sel, sortDir, nameField }); setPage(1); }}
                    onClear={() => { setEmpColFilter({ selected: new Set(), sortDir: 'asc', nameField: 'first' }); setPage(1); }}
                    hasNameSort
                    isOpen={openDD === 'emp'}
                    onClose={closeDropdown}
                    anchorEl={anchorRefs.current['emp']}
                  />
                </th>

                {/* Contract — filterable */}
                <th>
                  <span>Contract</span>
                  <button
                    ref={el => anchorRefs.current['contract'] = el}
                    className={`col-icon-btn ${contractFilter.selected.size ? 'col-icon-btn--active' : ''}`}
                    onClick={() => openDropdown('contract')}
                  >
                    <FilterIcon active={contractFilter.selected.size > 0} />
                  </button>
                  <FilterDropdown
                    items={allContracts}
                    selected={contractFilter.selected}
                    onApply={(sel) => { setContractFilter({ selected: sel }); setPage(1); }}
                    onClear={() => { setContractFilter({ selected: new Set() }); setPage(1); }}
                    isOpen={openDD === 'contract'}
                    onClose={closeDropdown}
                    anchorEl={anchorRefs.current['contract']}
                  />
                </th>

                {/* Sortable numeric columns */}
                {SORTABLE_COLS.map(col => (
                  <th key={col} className={`th-num ${sort.col === col ? 'sorted' : ''}`}>
                    <span>{COL_LABELS[col]}</span>
                    <button className="col-icon-btn" onClick={() => toggleSort(col)}>
                      <SortIcon dir={sort.col === col ? sort.dir : null} />
                    </button>
                  </th>
                ))}

                {/* Pay verified — filterable */}
                <th>
                  <span>Pay verified</span>
                  <button
                    ref={el => anchorRefs.current['payVer'] = el}
                    className={`col-icon-btn ${payVerFilter.selected.size ? 'col-icon-btn--active' : ''}`}
                    onClick={() => openDropdown('payVer')}
                  >
                    <FilterIcon active={payVerFilter.selected.size > 0} />
                  </button>
                  <FilterDropdown
                    items={verStatuses}
                    selected={payVerFilter.selected}
                    onApply={(sel) => { setPayVerFilter({ selected: sel }); setPage(1); }}
                    onClear={() => { setPayVerFilter({ selected: new Set() }); setPage(1); }}
                    hasSort={false}
                    isOpen={openDD === 'payVer'}
                    onClose={closeDropdown}
                    anchorEl={anchorRefs.current['payVer']}
                  />
                </th>

                {/* Invoice verified — filterable */}
                <th>
                  <span>Invoice verified</span>
                  <button
                    ref={el => anchorRefs.current['invVer'] = el}
                    className={`col-icon-btn ${invVerFilter.selected.size ? 'col-icon-btn--active' : ''}`}
                    onClick={() => openDropdown('invVer')}
                  >
                    <FilterIcon active={invVerFilter.selected.size > 0} />
                  </button>
                  <FilterDropdown
                    items={verStatuses}
                    selected={invVerFilter.selected}
                    onApply={(sel) => { setInvVerFilter({ selected: sel }); setPage(1); }}
                    onClear={() => { setInvVerFilter({ selected: new Set() }); setPage(1); }}
                    hasSort={false}
                    isOpen={openDD === 'invVer'}
                    onClose={closeDropdown}
                    anchorEl={anchorRefs.current['invVer']}
                  />
                </th>

                {/* Pay checkbox */}
                <th className="check-col">
                  <div className="header-check">
                    <label className="checkbox-wrap">
                      <input type="checkbox" checked={payAll} onChange={e => setPayAll(e.target.checked)} />
                      <span className="checkbox-box" />
                    </label>
                    <span>Pay</span>
                  </div>
                </th>

                {/* Invoice checkbox */}
                <th className="check-col">
                  <div className="header-check">
                    <label className="checkbox-wrap">
                      <input type="checkbox" checked={invAll} onChange={e => setInvAll(e.target.checked)} />
                      <span className="checkbox-box" />
                    </label>
                    <span>Inv</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {pageRows.map(row => (
                <tr key={row.id} className="data-row" onClick={() => setSelectedEmployee(row)}>
                  <td className="td-name">{row.name}</td>
                  <td>{row.contract}</td>
                  <td className="td-num">{row.visits}</td>
                  <td className="td-num">{row.runs}</td>
                  <td className="td-num">{fmtMins(row.travelMins)}</td>
                  <td className="td-num">{fmtMins(row.waitMins)}</td>
                  <td className="td-num">{row.mileage.toFixed(1)}</td>
                  <td className="td-num">{fmtGBP(row.expenses)}</td>
                  <td className="td-num">{row.holiday}</td>
                  <td className="td-num">
                    <VerifiedBadge verified={row.payVerCount} total={row.visits} />
                  </td>
                  <td className="td-num">
                    <VerifiedBadge verified={row.invVerCount} total={row.visits} />
                  </td>
                  <td className="check-col" onClick={e => e.stopPropagation()}>
                    <label className="checkbox-wrap">
                      <input type="checkbox" checked={payAll || !!payRows[row.id]}
                        onChange={e => setPayRows(p => ({ ...p, [row.id]: e.target.checked }))} />
                      <span className="checkbox-box" />
                    </label>
                  </td>
                  <td className="check-col" onClick={e => e.stopPropagation()}>
                    <label className="checkbox-wrap">
                      <input type="checkbox" checked={invAll || !!invRows[row.id]}
                        onChange={e => setInvRows(p => ({ ...p, [row.id]: e.target.checked }))} />
                      <span className="checkbox-box" />
                    </label>
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr><td colSpan={13} className="table-empty">No employees match the current filters</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          page={safePage}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          showStart={showStart}
          showEnd={showEnd}
          totalRows={totalRows}
          onPageChange={setPage}
          onRowsPerPageChange={n => { setRowsPerPage(n); setPage(1); }}
        />
      </div>
    </div>
  );
}
