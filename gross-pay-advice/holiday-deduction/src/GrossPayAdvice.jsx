import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import FilterDropdown from '../../../Components/FilterDropdown';
import Pagination from '../../../Components/Pagination';
import DevMode from '../../../Components/DevMode';
import DevComments from '../../../Components/DevComments';
import { fmtDate, DateRangeInput } from '../../../Components/DateRangePicker';
import { GPA_RECORDS, GPA_EMPLOYEE_NAMES, GPA_L2_VISITS, HOLIDAY_RECORDS_L2, fmtGBP } from './data';

// ─── Icons ──────────────────────────────────────────────────────────────────

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
const ChevronDown = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <polygon points="16.6,8.6 12,13.2 7.4,8.6 6,10 12,16 18,10" fill="currentColor"/>
  </svg>
);
const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15,18 9,12 15,6"/>
  </svg>
);
const FilterIcon = ({ active }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" className={`col-icon ${active ? 'col-icon--active' : ''}`}>
    {active ? (
      <path d="M10.5,15.7658125 L10.5,12 L6.75103413,7.83448237 C6.56630462,7.62922736 6.58294383,7.31308244 6.78819884,7.12835293 C6.88001119,7.04572181 6.99916031,7 7.1226812,7 L16.8773188,7 C17.1534612,7 17.3773188,7.22385763 17.3773188,7.5 C17.3773188,7.62352089 17.331597,7.74267001 17.2489659,7.83448237 L13.5,12 L13.5,17.4324792 C13.5,17.7086216 13.2761424,17.9324792 13,17.9324792 C12.8830317,17.9324792 12.7697653,17.8914711 12.6799078,17.8165898 L10.6799078,16.1499232 C10.5659115,16.0549263 10.5,15.9142024 10.5,15.7658125 Z" fill="currentColor"/>
    ) : (
      <path d="M15 17c0-.552-.448-1-1-1h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1zm3-5c0-.552-.448-1-1-1H7c-.552 0-1 .448-1 1s.448 1 1 1h10c.552 0 1-.448 1-1zM4 8h16c.552 0 1-.448 1-1s-.448-1-1-1H4c-.552 0-1 .448-1 1s.448 1 1 1z" fill="currentColor"/>
    )}
  </svg>
);
const SortIcon = ({ dir }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" className={`col-icon sort-icon ${dir ? 'col-icon--active' : ''}`} strokeLinecap="square">
    <polyline points="7.5,9 12,5 16.5,9" stroke="currentColor" strokeWidth="2" fill="none" opacity={dir === 'desc' ? 0.35 : 1}/>
    <polyline points="7.5,19 12,15 16.5,19" stroke="currentColor" strokeWidth="2" fill="none"
      style={{ transform: 'scaleY(-1)', transformOrigin: '12px 17px' }} opacity={dir === 'asc' ? 0.35 : 1}/>
  </svg>
);
const SettingsIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.5759 2.85953C14.1433 1.88245 15.341 1.47271 16.3181 1.88245C17.1375 2.22915 17.894 2.67041 18.6189 3.20623C19.4699 3.8366 19.7221 5.06583 19.1547 6.04291C18.8395 6.61024 18.8395 7.30365 19.1547 7.87099C19.4699 8.43832 20.0688 8.78503 20.7307 8.78503C21.8653 8.78503 22.8109 9.63603 22.937 10.7392C23 11.1489 23 11.5902 23 11.9999C23 12.4097 23 12.8509 22.937 13.2607C22.8109 14.3638 21.8653 15.2148 20.7307 15.2148C20.1003 15.2148 19.4699 15.5615 19.1547 16.1289C18.8395 16.6962 18.8395 17.3896 19.1547 17.9569C19.7221 18.934 19.4699 20.1317 18.6189 20.7936C17.894 21.3294 17.1375 21.7707 16.3181 22.1174C16.0344 22.212 15.7822 22.275 15.4986 22.275C14.7421 22.275 13.9857 21.8653 13.5759 21.1403C13.2607 20.573 12.6304 20.2263 12 20.2263C11.3696 20.2263 10.7393 20.573 10.4241 21.1403C9.85673 22.1174 8.65903 22.5271 7.68195 22.1174C6.86246 21.7707 6.10602 21.3294 5.38109 20.7936C4.53009 20.1633 4.27794 18.934 4.84527 17.9569C5.16046 17.3896 5.16046 16.6962 4.84527 16.1289C4.53009 15.5615 3.93123 15.2148 3.26934 15.2148C2.13467 15.2148 1.18911 14.3638 1.06304 13.2607C1.03152 12.8509 1 12.4097 1 11.9999C1 11.5902 1 11.1489 1.06304 10.7392C1.18911 9.63603 2.13467 8.78503 3.26934 8.78503C3.89971 8.78503 4.53009 8.43832 4.84527 7.87099C5.16046 7.30365 5.16046 6.61024 4.84527 6.04291C4.27794 5.06583 4.53009 3.86812 5.38109 3.20623C6.10602 2.67041 6.86246 2.22915 7.68195 1.88245C8.69054 1.47271 9.85673 1.88245 10.4241 2.85953C10.7393 3.42686 11.3696 3.77357 12 3.77357C12.6304 3.77357 13.2607 3.42686 13.5759 2.85953ZM15.6246 3.58445C15.4355 3.4899 15.2779 3.61597 15.1834 3.77357C14.5215 4.90824 13.3238 5.60165 12 5.60165C10.6762 5.60165 9.47851 4.90824 8.81662 3.77357C8.72206 3.64749 8.53295 3.52142 8.37536 3.58445C7.68195 3.86812 7.05158 4.24635 6.45272 4.68761C6.32665 4.78216 6.32665 5.00279 6.4212 5.16039C7.08309 6.29506 7.08309 7.68188 6.4212 8.81655C5.79083 9.9197 4.5616 10.6446 3.26934 10.6446C3.08023 10.6446 2.92264 10.7707 2.89112 10.9598C2.8596 11.3065 2.82808 11.6532 2.82808 11.9999C2.82808 12.3466 2.8596 12.6933 2.89112 13.04C2.89112 13.2292 3.04871 13.3552 3.26934 13.3552C4.5616 13.3552 5.75931 14.0486 6.4212 15.1833C7.05158 16.318 7.08309 17.7048 6.4212 18.8395C6.32665 18.9971 6.29513 19.2177 6.45272 19.3122C7.05158 19.7535 7.68195 20.1317 8.37536 20.4154C8.56447 20.51 8.72206 20.3839 8.81662 20.2263C9.47851 19.0916 10.6762 18.3982 12 18.3982C13.3238 18.3982 14.5215 19.0916 15.1834 20.2263C15.2779 20.3524 15.467 20.4784 15.6246 20.4154C16.3181 20.1317 16.9484 19.7535 17.5473 19.3122C17.6734 19.2177 17.6734 18.9971 17.5788 18.8395C16.9169 17.7048 16.9169 16.318 17.5788 15.1833C18.2092 14.0802 19.4384 13.3552 20.7307 13.3552C20.9198 13.3552 21.0774 13.2292 21.1089 13.04C21.1719 12.6933 21.1719 12.3466 21.1719 11.9999C21.1719 11.6532 21.1404 11.3065 21.1089 10.9598C21.1089 10.7707 20.9513 10.6446 20.7307 10.6446C19.4384 10.6446 18.2407 9.95122 17.5788 8.81655C16.9484 7.68188 16.9169 6.29506 17.5788 5.16039C17.6734 5.00279 17.7049 4.78216 17.5473 4.68761C16.9484 4.24635 16.2865 3.86812 15.6246 3.58445ZM12 8.34377C14.0172 8.34377 15.6562 9.98274 15.6562 11.9999C15.6562 14.0171 14.0172 15.6561 12 15.6561C9.98281 15.6561 8.34384 14.0171 8.34384 11.9999C8.34384 9.98274 9.98281 8.34377 12 8.34377ZM12 10.1718C10.9914 10.1718 10.1719 10.9913 10.1719 11.9999C10.1719 13.0085 10.9914 13.828 12 13.828C13.0086 13.828 13.8281 13.0085 13.8281 11.9999C13.8281 10.9913 13.0086 10.1718 12 10.1718Z"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <polygon fill="currentColor" stroke="currentColor" strokeLinejoin="round"
      points="18 7.2 16.8 6 12 10.8 7.2 6 6 7.2 10.8 12 6 16.8 7.2 18 12 13.2 16.8 18 18 16.8 13.2 12"/>
  </svg>
);
const EditIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5.00125,16.245799 L5.00125,18.6099151 C5.00125,18.8276627 5.17233735,18.99875 5.39008488,18.99875 L7.75420098,18.99875 C7.85529805,18.99875 7.95639512,18.9598665 8.0263854,18.8820995 L16.5185393,10.3977224 L13.6022776,7.48146073 L5.11790047,15.9658379 C5.04013349,16.0436049 5.00125,16.1369253 5.00125,16.245799 Z M18.7737816,8.14248004 C19.0770728,7.83918883 19.0770728,7.34925687 18.7737816,7.04596566 L16.9540343,5.22621841 C16.6507431,4.9229272 16.1608112,4.9229272 15.85752,5.22621841 L14.4343843,6.64935408 L17.3506459,9.56561571 L18.7737816,8.14248004 Z"/>
  </svg>
);
const ExternalLinkIcon = () => (
  <svg width="24" height="24" viewBox="0 0 25 25" fill="currentColor">
    <g transform="translate(0, 1)">
      <polygon transform="translate(14.5583, 9.4417) rotate(-45) translate(-14.5583, -9.4417)"
        points="15.1829434 2.85587799 13.7829434 4.25587799 17.9687298 8.44166442 7.34794132 8.57316725 7.34794132 10.5731672 17.9687298 10.4416644 13.7829434 14.6274509 15.1829434 16.0274509 21.7687298 9.44166442"/>
      <path fillRule="nonzero" d="M9.5,9 L9.5,11 L6.8,11 C6.3581722,11 6,11.3581722 6,11.8 L6,17.2 C6,17.6418278 6.3581722,18 6.8,18 L12.2,18 C12.6418278,18 13,17.6418278 13,17.2 L13,14.5 L15,14.5 L15,17.2 C15,18.7463973 13.7463973,20 12.2,20 L6.8,20 C5.2536027,20 4,18.7463973 4,17.2 L4,11.8 C4,10.2536027 5.2536027,9 6.8,9 L9.5,9 Z"/>
    </g>
  </svg>
);

// ─── Helpers ────────────────────────────────────────────────────────────────

const toDateSortKey = (ddmmyyyy) => {
  const [d, m, y] = ddmmyyyy.split('/');
  return `${y}${m}${d}`;
};

// ─── Holiday Panel ───────────────────────────────────────────────────────────

const HP_TABS = ['Finance'];

function HolidayPanel({ record, onClose }) {
  const [activeTab, setActiveTab]     = useState('finance');
  const [deduction, setDeduction]     = useState(record.deduction.toFixed(2));
  const [savedDeduction, setSaved]    = useState(record.deduction);
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
    setSaved(newVal);
  };

  const rateLabel = record.dailyRate
    ? `${record.durationLabel} × £${record.dailyRate.toFixed(2)} daily rate`
    : `${record.durationLabel} × £${record.hourlyRate.toFixed(2)}/hr rate`;

  return (
    <>
      <div className="hp-scrim" onClick={onClose} />
      <div className="hp-panel">
        <div className="hp-header">
          <button className="hp-close" onClick={onClose}><CloseIcon /></button>
          <h2>Holiday — {record.date}</h2>
          <div className="hp-tabs">
            {HP_TABS.map(t => (
              <button key={t}
                className={`hp-tab ${activeTab === t.toLowerCase() ? 'active' : ''}`}
                onClick={() => setActiveTab(t.toLowerCase())}
              >{t}</button>
            ))}
          </div>
        </div>
        <div className="hp-body">
          {activeTab === 'finance' && (
            <div className="hp-finance">
              <div className="hp-field">
                <label className="hp-label">Holiday deduction (£)</label>
                <input
                  className="hp-input" type="number" min="0" step="0.01" value={deduction}
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
                {savedDeduction !== record.deduction && (
                  <span className="hp-edited-note">Amount manually edited</span>
                )}
                <a href="#" className="hp-contract-link" onClick={e => e.preventDefault()}>View contract →</a>
              </div>
            </div>
          )}
          {activeTab !== 'finance' && (
            <p className="hp-placeholder">No content for this tab in the prototype.</p>
          )}
        </div>
        <div className="hp-footer">
          <button className="round-btn tertiary-btn" onClick={onClose}>Cancel</button>
          <button className="round-btn primary-btn" disabled={!isDirty} onClick={handleSave}>Save changes</button>
        </div>
      </div>
    </>
  );
}

// ─── Level 2 ─────────────────────────────────────────────────────────────────

const L2_NUM_COLS = ['pay', 'mileage', 'total'];
const statusClass = s => s === 'Completed' ? 'status-completed' : s === 'Missed' ? 'status-missed' : 'status-cancelled';

function GPADetail({ record, onBack }) {
  const pageRef = useRef(null);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [custFilter, setCustFilter] = useState({ selected: new Set(), sortDir: 'asc', nameField: 'first' });
  const [typeFilter, setTypeFilter] = useState({ search: '' });
  const [sort, setSort]             = useState({ col: null, dir: 'asc' });
  const [openDD, setOpenDD]         = useState(null);
  const anchorRefs                  = useRef({});
  const [page, setPage]             = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  const allVisits  = GPA_L2_VISITS[record.id] || [];
  const allCustomers = useMemo(() =>
    [...new Set(allVisits.filter(v => v.customerName !== '—').map(v => v.customerName))].sort(),
    [allVisits]
  );

  const openDropdown  = useCallback(id => setOpenDD(prev => prev === id ? null : id), []);
  const closeDropdown = useCallback(() => setOpenDD(null), []);
  const toggleSort    = col => setSort(prev => prev.col === col ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' });

  const filtered = useMemo(() => {
    let r = allVisits;
    if (custFilter.selected.size) r = r.filter(v => custFilter.selected.has(v.customerName));
    if (typeFilter.search) r = r.filter(v => v.type.toLowerCase().includes(typeFilter.search.toLowerCase()));
    return r;
  }, [allVisits, custFilter, typeFilter]);

  const sorted = useMemo(() => {
    const r = [...filtered];
    if (!sort.col) return r.sort((a, b) => toDateSortKey(a.date).localeCompare(toDateSortKey(b.date)));
    return r.sort((a, b) => {
      if (sort.col === 'date') {
        const av = toDateSortKey(a.date), bv = toDateSortKey(b.date);
        return sort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      if (sort.col === 'duration') {
        return sort.dir === 'asc' ? a.durationMins - b.durationMins : b.durationMins - a.durationMins;
      }
      if (L2_NUM_COLS.includes(sort.col)) {
        return sort.dir === 'asc' ? a[sort.col] - b[sort.col] : b[sort.col] - a[sort.col];
      }
      const av = a[sort.col] || '', bv = b[sort.col] || '';
      return sort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [filtered, sort]);

  const clearFilters = () => {
    setCustFilter({ selected: new Set(), sortDir: 'asc', nameField: 'first' });
    setTypeFilter({ search: '' });
    setSort({ col: null, dir: 'asc' });
    setPage(1);
  };

  useEffect(() => { setPage(1); }, [custFilter, typeFilter]);

  const totalRows  = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const safePage   = Math.min(page, totalPages);
  const pageRows   = sorted.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);
  const showStart  = totalRows === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const showEnd    = Math.min(safePage * rowsPerPage, totalRows);
  const anyFilter  = !!(custFilter.selected.size || typeFilter.search);

  return (
    <div className="gpa-page" ref={pageRef}>
      <a href="../../" className="back-link"><BackIcon /> Prototypes</a>
      <div className="gpa-body">

        <div className="ts-l2-header">
          <div className="ts-breadcrumbs">
            <button className="ts-breadcrumb-link" onClick={onBack}>Gross Pay Advice</button>
            <ChevronRight />
            <span>{record.employeeName}</span>
          </div>

          <div className="ts-header-name-row">
            <div className="ts-header-name-group">
              <h1>{record.employeeName}</h1>
              <span className={`ts-status-badge gpa-status-${record.status.toLowerCase()}`}>{record.status}</span>
            </div>
            <div className="ts-header-controls">
              <button className="round-btn secondary-btn" onClick={onBack}>Back</button>
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
                <span className="ts-sub-value">{record.cycleFrom} – {record.cycleTo}</span>
              </div>
              <div className="ts-sub-item">
                <span className="ts-sub-label">Ref:</span>
                <span className="ts-sub-value">{record.gpaRef}</span>
              </div>
            </div>
            <div className="ts-header-sub-right">
              <div className="ts-sub-item">
                <span className="ts-sub-label">Gross pay:</span>
                <span className="ts-sub-value">{fmtGBP(record.total)}</span>
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
          <table className="data-table">
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
                    onApply={(sel, sortDir, nameField) => { setCustFilter({ selected: sel, sortDir, nameField }); setPage(1); }}
                    onClear={() => { setCustFilter({ selected: new Set(), sortDir: 'asc', nameField: 'first' }); setPage(1); }}
                    hasNameSort
                    isOpen={openDD === 'cust'} onClose={closeDropdown} anchorEl={anchorRefs.current['cust']}
                  />
                </th>

                {/* Date — sort */}
                <th className={sort.col === 'date' ? 'sorted' : ''}>
                  <span>Date</span>
                  <button className="col-icon-btn" onClick={() => toggleSort('date')}><SortIcon dir={sort.col === 'date' ? sort.dir : null} /></button>
                </th>

                {/* Visit Name — sort */}
                <th className={sort.col === 'visitName' ? 'sorted' : ''}>
                  <span>Visit Name</span>
                  <button className="col-icon-btn" onClick={() => toggleSort('visitName')}><SortIcon dir={sort.col === 'visitName' ? sort.dir : null} /></button>
                </th>

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
                    onApply={(_, __, ___, search) => { setTypeFilter({ search: search || '' }); setPage(1); }}
                    onClear={() => { setTypeFilter({ search: '' }); setPage(1); }}
                    searchOnly hasSort={false}
                    isOpen={openDD === 'type'} onClose={closeDropdown} anchorEl={anchorRefs.current['type']}
                  />
                </th>

                {/* From — sort */}
                <th className={sort.col === 'from' ? 'sorted' : ''}>
                  <span>From</span>
                  <button className="col-icon-btn" onClick={() => toggleSort('from')}><SortIcon dir={sort.col === 'from' ? sort.dir : null} /></button>
                </th>

                {/* To — sort */}
                <th className={sort.col === 'to' ? 'sorted' : ''}>
                  <span>To</span>
                  <button className="col-icon-btn" onClick={() => toggleSort('to')}><SortIcon dir={sort.col === 'to' ? sort.dir : null} /></button>
                </th>

                {/* Duration — sort */}
                <th className={sort.col === 'duration' ? 'sorted' : ''}>
                  <span>Duration</span>
                  <button className="col-icon-btn" onClick={() => toggleSort('duration')}><SortIcon dir={sort.col === 'duration' ? sort.dir : null} /></button>
                </th>

                {/* Status */}
                <th><span>Status</span></th>

                {/* Pay — sort */}
                <th className={`th-num ${sort.col === 'pay' ? 'sorted' : ''}`}>
                  <span>Pay</span>
                  <button className="col-icon-btn" onClick={() => toggleSort('pay')}><SortIcon dir={sort.col === 'pay' ? sort.dir : null} /></button>
                </th>

                {/* Mileage — sort */}
                <th className={`th-num ${sort.col === 'mileage' ? 'sorted' : ''}`}>
                  <span>Mileage</span>
                  <button className="col-icon-btn" onClick={() => toggleSort('mileage')}><SortIcon dir={sort.col === 'mileage' ? sort.dir : null} /></button>
                </th>

                {/* Total — sort */}
                <th className={`th-num ${sort.col === 'total' ? 'sorted' : ''}`}>
                  <span>Total</span>
                  <button className="col-icon-btn" onClick={() => toggleSort('total')}><SortIcon dir={sort.col === 'total' ? sort.dir : null} /></button>
                </th>

                {/* Timesheet link */}
                <th className="icon-col"><span>TS</span></th>

                {/* Edit */}
                <th className="icon-col"></th>

              </tr>
            </thead>
            <tbody>
              {pageRows.map(row => (
                <tr key={row.id}
                    className={row.isHoliday ? 'holiday-row' : 'data-row'}
                    onClick={() => row.isHoliday && setSelectedHoliday(row.holidayRecord)}>
                  <td className="td-name">{row.customerName}</td>
                  <td className="nowrap">{row.date}</td>
                  <td>{row.visitName}</td>
                  <td>{row.type}</td>
                  <td className="nowrap">{row.from}</td>
                  <td className="nowrap">{row.to}</td>
                  <td>{row.duration}</td>
                  <td>
                    {!row.isHoliday && (
                      <span className={`status-pill ${statusClass(row.status)}`}>{row.status}</span>
                    )}
                  </td>
                  <td className={`td-num${row.isHoliday ? ' td-neg' : ''}`}>
                    {row.isHoliday ? `-${fmtGBP(row.pay)}` : fmtGBP(row.pay)}
                  </td>
                  <td className="td-num">{row.mileage > 0 ? fmtGBP(row.mileage) : '—'}</td>
                  <td className={`td-num${row.isHoliday ? ' td-neg' : ''}`}>
                    {row.isHoliday ? `-${fmtGBP(row.total)}` : fmtGBP(row.total)}
                  </td>
                  <td className="icon-col">
                    <a href="#" className="gpa-ts-link" onClick={e => e.preventDefault()}>
                      <ExternalLinkIcon />
                    </a>
                  </td>
                  <td className="icon-col">
                    <button className="edit-icon-btn">
                      <EditIcon />
                    </button>
                  </td>
                </tr>
              ))}
              {totalRows === 0 && (
                <tr><td colSpan={13} className="table-empty">No records match the current filters</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={safePage} totalPages={totalPages} rowsPerPage={rowsPerPage}
          showStart={showStart} showEnd={showEnd} totalRows={totalRows}
          onPageChange={setPage}
          onRowsPerPageChange={n => { setRowsPerPage(n); setPage(1); }}
        />
      </div>

      {selectedHoliday && (
        <HolidayPanel record={selectedHoliday} onClose={() => setSelectedHoliday(null)} />
      )}
      <DevMode containerRef={pageRef} />
      <DevComments containerRef={pageRef} prototypeId={window.location.pathname} />
    </div>
  );
}

// ─── Level 1 ─────────────────────────────────────────────────────────────────

const L1_SORTABLE_COLS = ['cycleFrom', 'cycleTo', 'visitShiftPay', 'holidayPay', 'mileagePay', 'total'];
const DATE_COLS = ['cycleFrom', 'cycleTo'];

export default function GrossPayAdvice() {
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('employee');
    if (slug) {
      const rec = GPA_RECORDS.find(r => r.employeeName.toLowerCase().replace(/\s+/g, '-') === slug);
      if (rec) setSelectedRecord(rec);
    }
  }, []);

  const navigateTo = (record) => {
    history.pushState(null, '', `?employee=${record.employeeName.toLowerCase().replace(/\s+/g, '-')}`);
    setSelectedRecord(record);
  };

  const navigateBack = () => {
    history.pushState(null, '', window.location.pathname);
    setSelectedRecord(null);
  };

  const [dateRange, setDateRange] = useState([new Date(2024, 9, 1), new Date(2024, 9, 31)]);
  const [hoverDate, setHoverDate]           = useState(null);
  const [gpaRefFilter, setGpaRefFilter]     = useState({ search: '' });
  const [empFilter, setEmpFilter]           = useState({ selected: new Set(), sortDir: 'asc', nameField: 'first' });
  const [sort, setSort]                     = useState({ col: null, dir: 'asc' });
  const [openDD, setOpenDD]                 = useState(null);
  const anchorRefs                          = useRef({});
  const [page, setPage]                     = useState(1);
  const [rowsPerPage, setRowsPerPage]       = useState(12);
  const pageRef = useRef(null);

  const [startDate, endDate] = dateRange;

  const openDropdown  = useCallback(id => setOpenDD(prev => prev === id ? null : id), []);
  const closeDropdown = useCallback(() => setOpenDD(null), []);
  const toggleSort    = col => setSort(prev => prev.col === col ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' });

  const backwardHighlight = useMemo(() => {
    if (!startDate || endDate || !hoverDate || hoverDate >= startDate) return [];
    const dates = [], cur = new Date(hoverDate);
    while (cur < startDate) { dates.push(new Date(cur)); cur.setDate(cur.getDate() + 1); }
    return [{ 'react-datepicker__day--in-selecting-range': dates }];
  }, [startDate, endDate, hoverDate]);

  const rangeLabel = startDate && endDate
    ? startDate.toDateString() === endDate.toDateString() ? fmtDate(startDate) : `${fmtDate(startDate)} – ${fmtDate(endDate)}`
    : startDate ? fmtDate(startDate) : 'Select dates';

  const navigateRange = dir => {
    if (!startDate || !endDate) return;
    const ms = endDate.getTime() - startDate.getTime() + 86400000;
    setDateRange([new Date(startDate.getTime() + dir * ms), new Date(endDate.getTime() + dir * ms)]);
  };

  const clearAllFilters = () => {
    setGpaRefFilter({ search: '' });
    setEmpFilter({ selected: new Set(), sortDir: 'asc', nameField: 'first' });
    setSort({ col: null, dir: 'asc' });
    setPage(1);
  };

  const filtered = useMemo(() => {
    let r = GPA_RECORDS;
    if (gpaRefFilter.search) r = r.filter(rec => rec.gpaRef.toLowerCase().includes(gpaRefFilter.search.toLowerCase()));
    if (empFilter.selected.size) r = r.filter(rec => empFilter.selected.has(rec.employeeName));
    return r;
  }, [gpaRefFilter, empFilter]);

  const sorted = useMemo(() => {
    const r = [...filtered];
    if (!sort.col) {
      const key = name => { const p = name.trim().split(/\s+/); return empFilter.nameField === 'last' ? p[p.length - 1] : p[0]; };
      return r.sort((a, b) => empFilter.sortDir === 'asc'
        ? key(a.employeeName).localeCompare(key(b.employeeName))
        : key(b.employeeName).localeCompare(key(a.employeeName)));
    }
    return r.sort((a, b) => {
      if (DATE_COLS.includes(sort.col)) {
        const av = toDateSortKey(a[sort.col]), bv = toDateSortKey(b[sort.col]);
        return sort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sort.dir === 'asc' ? a[sort.col] - b[sort.col] : b[sort.col] - a[sort.col];
    });
  }, [filtered, sort, empFilter]);

  useEffect(() => { setPage(1); }, [gpaRefFilter, empFilter]);

  const totalRows  = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const safePage   = Math.min(page, totalPages);
  const pageRows   = sorted.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);
  const showStart  = totalRows === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const showEnd    = Math.min(safePage * rowsPerPage, totalRows);
  const anyFilter  = !!(gpaRefFilter.search || empFilter.selected.size);

  if (selectedRecord) {
    return <GPADetail record={selectedRecord} onBack={navigateBack} />;
  }

  return (
    <div className="gpa-page" ref={pageRef}>
      <a href="../../" className="back-link"><BackIcon /> Prototypes</a>
      <div className="gpa-body">

        <div className="gpa-page-header">
          <h1>Gross Pay Advice</h1>
          <div className="gpa-date-nav">
            <button className="gpa-nav-arrow" onClick={() => navigateRange(-1)}><ChevronLeft /></button>
            <DatePicker
              selectsRange startDate={startDate} endDate={endDate}
              onChange={update => {
                const [ns, ne] = update;
                if (startDate && !endDate && ns && !ne && ns < startDate) setDateRange([ns, startDate]);
                else setDateRange(update);
              }}
              customInput={<DateRangeInput label={rangeLabel} />}
              calendarStartDay={1} formatWeekDay={d => d.slice(0, 1)}
              highlightDates={backwardHighlight}
              renderDayContents={(day, date) => (
                <span onMouseEnter={() => { if (startDate && !endDate) setHoverDate(date); }} onMouseLeave={() => setHoverDate(null)}>{day}</span>
              )}
              popperPlacement="bottom" portalId="gpa-datepicker-portal"
            />
            <button className="gpa-nav-arrow" onClick={() => navigateRange(1)}><ChevronRight /></button>
          </div>
          <div className="gpa-header-controls">
            <button className="round-btn primary-btn">Generate</button>
            <button className="round-btn secondary-btn btn-icon-right">Select <ChevronDown size={24} /></button>
            <button className="round-btn tertiary-btn btn-icon-left btn-icon-right"><SettingsIcon size={20} /> Actions <ChevronDown size={24} /></button>
          </div>
        </div>

        <div className="gpa-sub-row">
          {anyFilter && <button className="clear-btn" onClick={clearAllFilters}><CloseIcon /> Clear</button>}
          <span className="count-label">Showing: {showStart} – {showEnd} of {totalRows}</span>
          <button className="gpa-nav-arrow pag-inline" disabled={safePage <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}><ChevronLeft /></button>
          <button className="gpa-nav-arrow pag-inline" disabled={safePage >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}><ChevronRight /></button>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  <span>GPA Reference</span>
                  <button ref={el => anchorRefs.current['gpaRef'] = el}
                    className={`col-icon-btn ${gpaRefFilter.search ? 'col-icon-btn--active' : ''}`}
                    data-devmode-passthrough="true"
                    onClick={() => openDropdown('gpaRef')}>
                    <FilterIcon active={!!gpaRefFilter.search} />
                  </button>
                  <FilterDropdown items={[]} selected={new Set()}
                    onApply={(_, __, ___, search) => { setGpaRefFilter({ search: search || '' }); setPage(1); }}
                    onClear={() => { setGpaRefFilter({ search: '' }); setPage(1); }}
                    searchOnly hasSort={false}
                    isOpen={openDD === 'gpaRef'} onClose={closeDropdown} anchorEl={anchorRefs.current['gpaRef']}
                  />
                </th>
                <th>
                  <span>Employee</span>
                  <button ref={el => anchorRefs.current['emp'] = el}
                    className={`col-icon-btn ${empFilter.selected.size ? 'col-icon-btn--active' : ''}`}
                    data-devmode-passthrough="true"
                    onClick={() => openDropdown('emp')}>
                    <FilterIcon active={empFilter.selected.size > 0} />
                  </button>
                  <FilterDropdown items={GPA_EMPLOYEE_NAMES} selected={empFilter.selected}
                    onApply={(sel, sortDir, nameField) => { setEmpFilter({ selected: sel, sortDir, nameField }); setPage(1); }}
                    onClear={() => { setEmpFilter({ selected: new Set(), sortDir: 'asc', nameField: 'first' }); setPage(1); }}
                    hasNameSort
                    isOpen={openDD === 'emp'} onClose={closeDropdown} anchorEl={anchorRefs.current['emp']}
                  />
                </th>
                {[['cycleFrom','Cycle from'],['cycleTo','Cycle to'],['visitShiftPay','Visit / Shift pay'],['holidayPay','Holiday pay'],['mileagePay','Mileage'],['total','Total']].map(([col, label]) => (
                  <th key={col} className={`${['visitShiftPay','holidayPay','mileagePay','total'].includes(col) ? 'th-num ' : ''}${sort.col === col ? 'sorted' : ''}`}>
                    <span>{label}</span>
                    <button className="col-icon-btn" onClick={() => toggleSort(col)}>
                      <SortIcon dir={sort.col === col ? sort.dir : null} />
                    </button>
                  </th>
                ))}
                <th><span>Status</span></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map(row => (
                <tr key={row.id} className="data-row" onClick={() => navigateTo(row)}>
                  <td className="td-ref">{row.gpaRef}</td>
                  <td className="td-name">{row.employeeName}</td>
                  <td className="nowrap">{row.cycleFrom}</td>
                  <td className="nowrap">{row.cycleTo}</td>
                  <td className="td-num">{fmtGBP(row.visitShiftPay)}</td>
                  <td className={`td-num${row.holidayPay > 0 ? ' td-neg' : ''}`}>
                    {row.holidayPay > 0 ? `-${fmtGBP(row.holidayPay)}` : '—'}
                  </td>
                  <td className="td-num">{fmtGBP(row.mileagePay)}</td>
                  <td className="td-num">{fmtGBP(row.total)}</td>
                  <td><span className={`status-pill ${row.status === 'Ready' ? 'status-ready' : 'status-sent'}`}>{row.status}</span></td>
                </tr>
              ))}
              {totalRows === 0 && (
                <tr><td colSpan={9} className="table-empty">No records match the current filters</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={safePage} totalPages={totalPages} rowsPerPage={rowsPerPage}
          showStart={showStart} showEnd={showEnd} totalRows={totalRows}
          onPageChange={setPage}
          onRowsPerPageChange={n => { setRowsPerPage(n); setPage(1); }}
        />
      </div>
      <DevMode containerRef={pageRef} />
      <DevComments containerRef={pageRef} prototypeId={window.location.pathname} />
    </div>
  );
}
