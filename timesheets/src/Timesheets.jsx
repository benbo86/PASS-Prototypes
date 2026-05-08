import { useState, useMemo, useRef, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import FilterDropdown from './FilterDropdown';
import { CalendarIcon, fmtDate, DateRangeInput } from '../../Components/DateRangePicker';
import {
  EMPLOYEES, VISITS, FUNDERS, CUSTOMERS, VISIT_STATUSES, VISIT_TYPES,
  fmtMins, fmtGBP,
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
  <svg width="24" height="24" viewBox="0 0 24 24">
    <polygon points="15.4,8.6 10.8,13.2 15.4,17.8 14,19.2 8,13.2 14,7.2" fill="currentColor"/>
  </svg>
);

const ChevronRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <polygon points="8.6,8.6 13.2,13.2 8.6,17.8 10,19.2 16,13.2 10,7.2" fill="currentColor"/>
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

// ─── Level 2 – Visit Detail ─────────────────────────────────────────────────

function VisitDetail({ employee, visits, onBack }) {
  const [payAll,  setPayAll]  = useState(false);
  const [invAll,  setInvAll]  = useState(false);
  const [payRows, setPayRows] = useState({});
  const [invRows, setInvRows] = useState({});

  const empVisits = visits.filter(v => v.employeeId === employee.id)
    .sort((a, b) => a.date.localeCompare(b.date) || a.plannedStart.localeCompare(b.plannedStart));

  const statusClass = (s) =>
    s === 'Completed' ? 'status-completed' : s === 'Missed' ? 'status-missed' : 'status-cancelled';

  return (
    <div className="ts-page">
      <div className="ts-body">
        <div className="ts-page-header">
          <h1>{employee.name}</h1>
          <div className="ts-header-controls">
            <button className="round-btn secondary-btn btn-icon-left" onClick={onBack}><BackIcon /> Back</button>
            <button className="round-btn secondary-btn btn-icon-right">Select <ChevronDown size={24} /></button>
            <button className="round-btn secondary-btn btn-icon-right" disabled>Actions <ChevronDown size={24} /></button>
          </div>
        </div>

        <div className="ts-table-wrap">
          <table className="ts-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Visit name</th>
                <th>Visit type</th>
                <th>Date</th>
                <th>Planned time</th>
                <th>Actual time</th>
                <th>Status</th>
                <th>Mileage</th>
                <th>Travel time</th>
                <th>Wait time</th>
                <th>Expenses</th>
                <th>Pay ref</th>
                <th>Invoice ref</th>
                <th className="ts-check-col">
                  <div className="ts-header-check">
                    <label className="checkbox-wrap">
                      <input type="checkbox" checked={payAll} onChange={e => setPayAll(e.target.checked)} />
                      <span className="checkbox-box" />
                    </label>
                    <span>Pay</span>
                  </div>
                </th>
                <th className="ts-check-col">
                  <div className="ts-header-check">
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
              {empVisits.map(v => (
                <tr key={v.id}>
                  <td>{v.customerName}</td>
                  <td>{v.visitName}</td>
                  <td>{v.visitType}</td>
                  <td className="ts-nowrap">{v.date}</td>
                  <td className="ts-nowrap">{v.plannedStart}–{v.plannedEnd}</td>
                  <td className="ts-nowrap">{v.actualStart}–{v.actualEnd}</td>
                  <td><span className={`visit-status ${statusClass(v.status)}`}>{v.status}</span></td>
                  <td>{v.mileage}</td>
                  <td>{fmtMins(v.travelMins)}</td>
                  <td>{fmtMins(v.waitMins)}</td>
                  <td>{fmtGBP(v.expenses)}</td>
                  <td className="ts-ref">{v.payRef || '—'}</td>
                  <td className="ts-ref">{v.invRef || '—'}</td>
                  <td className="ts-check-col">
                    <label className="checkbox-wrap">
                      <input type="checkbox" checked={payAll || !!payRows[v.id]}
                        onChange={e => setPayRows(p => ({ ...p, [v.id]: e.target.checked }))} />
                      <span className="checkbox-box" />
                    </label>
                  </td>
                  <td className="ts-check-col">
                    <label className="checkbox-wrap">
                      <input type="checkbox" checked={invAll || !!invRows[v.id]}
                        onChange={e => setInvRows(p => ({ ...p, [v.id]: e.target.checked }))} />
                      <span className="checkbox-box" />
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Level 1 – Timesheets ───────────────────────────────────────────────────

export default function Timesheets() {
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Date range picker
  const [dateRange, setDateRange] = useState([new Date(2026, 8, 1), new Date(2026, 9, 30)]);
  const [startDate, endDate] = dateRange;

  const rangeLabel = startDate && endDate
    ? `${fmtDate(startDate)} – ${fmtDate(endDate)}`
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
      />
    );
  }

  return (
    <div className="ts-page">
      <a href="../" className="back-link"><BackIcon /> Prototypes</a>

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
        <div className="ts-filter-bar">
          <div className="ts-filter-bar-left">
            <label className="checkbox-wrap ts-filter-copies">
              <input type="checkbox" checked={copies} onChange={e => setCopies(e.target.checked)} />
              <span className="checkbox-box" />
              <span>Copies</span>
            </label>
            <span className="ts-filter-icon-btn">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M15 17c0-.552-.448-1-1-1h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1zm3-5c0-.552-.448-1-1-1H7c-.552 0-1 .448-1 1s.448 1 1 1h10c.552 0 1-.448 1-1zM4 8h16c.552 0 1-.448 1-1s-.448-1-1-1H4c-.552 0-1 .448-1 1s.448 1 1 1z" fill="currentColor"/>
              </svg>
            </span>

            {/* Funder filter */}
            <div className="ts-filter-pill-wrap">
              <button
                ref={el => anchorRefs.current['funder'] = el}
                className={`ts-filter-pill ${funderFilter.size ? 'active' : ''}`}
                onClick={() => openDropdown('funder')}
              >
                <span>Funder</span>
                {funderFilter.size > 0 && <span className="ts-filter-count">{funderFilter.size}</span>}
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
            <div className="ts-filter-pill-wrap">
              <button
                ref={el => anchorRefs.current['customer'] = el}
                className={`ts-filter-pill ${customerFilter.size ? 'active' : ''}`}
                onClick={() => openDropdown('customer')}
              >
                <span>Customer</span>
                {customerFilter.size > 0 && <span className="ts-filter-count">{customerFilter.size}</span>}
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
            <div className="ts-filter-pill-wrap">
              <button
                ref={el => anchorRefs.current['status'] = el}
                className={`ts-filter-pill ${statusFilter.size ? 'active' : ''}`}
                onClick={() => openDropdown('status')}
              >
                <span>Visit status</span>
                {statusFilter.size > 0 && <span className="ts-filter-count">{statusFilter.size}</span>}
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
              <button className="ts-clear-btn" onClick={clearAll}>
                <CloseIcon /> Clear
              </button>
            )}
          </div>

          <div className="ts-filter-bar-right">
            <span className="ts-count-label">
              Selected: {selectedCount} – {totalRows}
            </span>
            <span className="ts-count-label">
              Showing: {showStart} – {showEnd} of {totalRows}
            </span>
            <button className="ts-nav-arrow ts-pag-inline" disabled={safePage <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}><ChevronLeft /></button>
            <button className="ts-nav-arrow ts-pag-inline" disabled={safePage >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}><ChevronRight /></button>
          </div>
        </div>

        {/* Table */}
        <div className="ts-table-wrap">
          <table className="ts-table">
            <thead>
              <tr>
                {/* Employee — filterable */}
                <th className="ts-th-name">
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
                  <th key={col} className={`ts-th-num ${sort.col === col ? 'sorted' : ''}`}>
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
                <th className="ts-check-col">
                  <div className="ts-header-check">
                    <label className="checkbox-wrap">
                      <input type="checkbox" checked={payAll} onChange={e => setPayAll(e.target.checked)} />
                      <span className="checkbox-box" />
                    </label>
                    <span>Pay</span>
                  </div>
                </th>

                {/* Invoice checkbox */}
                <th className="ts-check-col">
                  <div className="ts-header-check">
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
                <tr key={row.id} className="ts-row" onClick={() => setSelectedEmployee(row)}>
                  <td className="ts-td-name">{row.name}</td>
                  <td>{row.contract}</td>
                  <td className="ts-td-num">{row.visits}</td>
                  <td className="ts-td-num">{row.runs}</td>
                  <td className="ts-td-num">{fmtMins(row.travelMins)}</td>
                  <td className="ts-td-num">{fmtMins(row.waitMins)}</td>
                  <td className="ts-td-num">{row.mileage.toFixed(1)}</td>
                  <td className="ts-td-num">{fmtGBP(row.expenses)}</td>
                  <td className="ts-td-num">{row.holiday}</td>
                  <td className="ts-td-num">
                    <VerifiedBadge verified={row.payVerCount} total={row.visits} />
                  </td>
                  <td className="ts-td-num">
                    <VerifiedBadge verified={row.invVerCount} total={row.visits} />
                  </td>
                  <td className="ts-check-col" onClick={e => e.stopPropagation()}>
                    <label className="checkbox-wrap">
                      <input type="checkbox" checked={payAll || !!payRows[row.id]}
                        onChange={e => setPayRows(p => ({ ...p, [row.id]: e.target.checked }))} />
                      <span className="checkbox-box" />
                    </label>
                  </td>
                  <td className="ts-check-col" onClick={e => e.stopPropagation()}>
                    <label className="checkbox-wrap">
                      <input type="checkbox" checked={invAll || !!invRows[row.id]}
                        onChange={e => setInvRows(p => ({ ...p, [row.id]: e.target.checked }))} />
                      <span className="checkbox-box" />
                    </label>
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr><td colSpan={13} className="ts-empty">No employees match the current filters</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="ts-pagination">
          <div className="ts-pag-left">
            <button className="ts-pag-btn" onClick={() => setPage(1)} disabled={safePage <= 1}>First</button>
            <button className="ts-pag-arrow" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage <= 1}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`ts-pag-btn ts-pag-num ${p === safePage ? 'current' : ''}`}
                onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="ts-pag-arrow" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages}>›</button>
            <button className="ts-pag-btn" onClick={() => setPage(totalPages)} disabled={safePage >= totalPages}>Last</button>
          </div>
          <div className="ts-pag-right">
            <span className="ts-count-label">Rows per page</span>
            <select className="ts-rows-select" value={rowsPerPage}
              onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }}>
              {[10, 12, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <span className="ts-count-label">{showStart}–{showEnd} of {totalRows}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
