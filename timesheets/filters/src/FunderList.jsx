import { useState, useMemo, useRef, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import FilterDropdown from '../../../Components/FilterDropdown';
import Pagination from '../../../Components/Pagination';
import AuthGate from '../../../Components/AuthGate';
import ColLabel from '../../../Components/ColLabel';
import ColResizeHandle from '../../../Components/ColResizeHandle';
import useSharedColumnWidths from '../../../Components/useSharedColumnWidths';
import ActionsMenu from '../../../Components/ActionsMenu';
import DevToolbar from '../../../Components/DevToolbar';
import DevMode from '../../../Components/DevMode';
import DevComments from '../../../Components/DevComments';
import DevEdit from '../../../Components/DevEdit';
import WireframeToggle from '../../../Components/WireframeToggle';
import AuditCapture from '../../../Components/AuditCapture';
import SideNav from '../../../Components/SideNav';
import TopNav from '../../../Components/TopNav';
import ScheduleNav from '../../../Components/ScheduleNav';
import ViewToggle from './ViewToggle';
import PublishToggle from './PublishToggle';
import { DateRangeInput } from '../../../Components/DateRangePicker';
import { FUNDERS, fmtGBP, summarizeFunders } from './data';

const VERIFIED_STATUSES = ['Verified', 'Partially verified', 'Unverified'];

// ─── SVG icons (copied verbatim from Timesheets.jsx, matching this repo's
// own per-file icon convention rather than a shared icons import) ─────────

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

const SettingsIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.5759 2.85953C14.1433 1.88245 15.341 1.47271 16.3181 1.88245C17.1375 2.22915 17.894 2.67041 18.6189 3.20623C19.4699 3.8366 19.7221 5.06583 19.1547 6.04291C18.8395 6.61024 18.8395 7.30365 19.1547 7.87099C19.4699 8.43832 20.0688 8.78503 20.7307 8.78503C21.8653 8.78503 22.8109 9.63603 22.937 10.7392C23 11.1489 23 11.5902 23 11.9999C23 12.4097 23 12.8509 22.937 13.2607C22.8109 14.3638 21.8653 15.2148 20.7307 15.2148C20.1003 15.2148 19.4699 15.5615 19.1547 16.1289C18.8395 16.6962 18.8395 17.3896 19.1547 17.9569C19.7221 18.934 19.4699 20.1317 18.6189 20.7936C17.894 21.3294 17.1375 21.7707 16.3181 22.1174C16.0344 22.212 15.7822 22.275 15.4986 22.275C14.7421 22.275 13.9857 21.8653 13.5759 21.1403C13.2607 20.573 12.6304 20.2263 12 20.2263C11.3696 20.2263 10.7393 20.573 10.4241 21.1403C9.85673 22.1174 8.65903 22.5271 7.68195 22.1174C6.86246 21.7707 6.10602 21.3294 5.38109 20.7936C4.53009 20.1633 4.27794 18.934 4.84527 17.9569C5.16046 17.3896 5.16046 16.6962 4.84527 16.1289C4.53009 15.5615 3.93123 15.2148 3.26934 15.2148C2.13467 15.2148 1.18911 14.3638 1.06304 13.2607C1.03152 12.8509 1 12.4097 1 11.9999C1 11.5902 1 11.1489 1.06304 10.7392C1.18911 9.63603 2.13467 8.78503 3.26934 8.78503C3.89971 8.78503 4.53009 8.43832 4.84527 7.87099C5.16046 7.30365 5.16046 6.61024 4.84527 6.04291C4.27794 5.06583 4.53009 3.86812 5.38109 3.20623C6.10602 2.67041 6.86246 2.22915 7.68195 1.88245C8.69054 1.47271 9.85673 1.88245 10.4241 2.85953C10.7393 3.42686 11.3696 3.77357 12 3.77357C12.6304 3.77357 13.2607 3.42686 13.5759 2.85953ZM15.6246 3.58445C15.4355 3.4899 15.2779 3.61597 15.1834 3.77357C14.5215 4.90824 13.3238 5.60165 12 5.60165C10.6762 5.60165 9.47851 4.90824 8.81662 3.77357C8.72206 3.64749 8.53295 3.52142 8.37536 3.58445C7.68195 3.86812 7.05158 4.24635 6.45272 4.68761C6.32665 4.78216 6.32665 5.00279 6.4212 5.16039C7.08309 6.29506 7.08309 7.68188 6.4212 8.81655C5.79083 9.9197 4.5616 10.6446 3.26934 10.6446C3.08023 10.6446 2.92264 10.7707 2.89112 10.9598C2.8596 11.3065 2.82808 11.6532 2.82808 11.9999C2.82808 12.3466 2.8596 12.6933 2.89112 13.04C2.89112 13.2292 3.04871 13.3552 3.26934 13.3552C4.5616 13.3552 5.75931 14.0486 6.4212 15.1833C7.05158 16.318 7.08309 17.7048 6.4212 18.8395C6.32665 18.9971 6.29513 19.2177 6.45272 19.3122C7.05158 19.7535 7.68195 20.1317 8.37536 20.4154C8.56447 20.51 8.72206 20.3839 8.81662 20.2263C9.47851 19.0916 10.6762 18.3982 12 18.3982C13.3238 18.3982 14.5215 19.0916 15.1834 20.2263C15.2779 20.3524 15.467 20.4784 15.6246 20.4154C16.3181 20.1317 16.9484 19.7535 17.5473 19.3122C17.6734 19.2177 17.6734 18.9971 17.5788 18.8395C16.9169 17.7048 16.9169 16.318 17.5788 15.1833C18.2092 14.0802 19.4384 13.3552 20.7307 13.3552C20.9198 13.3552 21.0774 13.2292 21.1089 13.04C21.1719 12.6933 21.1719 12.3466 21.1719 11.9999C21.1719 11.6532 21.1404 11.3065 21.1089 10.9598C21.1089 10.7707 20.9513 10.6446 20.7307 10.6446C19.4384 10.6446 18.2407 9.95122 17.5788 8.81655C16.9484 7.68188 16.9169 6.29506 17.5788 5.16039C17.6734 5.00279 17.7049 4.78216 17.5473 4.68761C16.9484 4.24635 16.2865 3.86812 15.6246 3.58445ZM12 8.34377C14.0172 8.34377 15.6562 9.98274 15.6562 11.9999C15.6562 14.0171 14.0172 15.6561 12 15.6561C9.98281 15.6561 8.34384 14.0171 8.34384 11.9999C8.34384 9.98274 9.98281 8.34377 12 8.34377ZM12 10.1718C10.9914 10.1718 10.1719 10.9913 10.1719 11.9999C10.1719 13.0085 10.9914 13.828 12 13.828C13.0086 13.828 13.8281 13.0085 13.8281 11.9999C13.8281 10.9913 13.0086 10.1718 12 10.1718Z"/>
  </svg>
);

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15,18 9,12 15,6"/>
  </svg>
);

// ─── Helpers ────────────────────────────────────────────────────────────────

function verifiedStatus(verified, total) {
  if (total === 0 || verified === 0) return 'Unverified';
  if (verified === total) return 'Verified';
  return 'Partially verified';
}

function VerifiedBadge({ verified, total }) {
  if (total === 0) return <span className="verified-badge verified-none">0/0</span>;
  const cls = verified === total ? 'verified-full' : verified === 0 ? 'verified-none' : 'verified-partial';
  return <span className={`verified-badge ${cls}`}>{verified}/{total}</span>;
}

// Funder, Visits, Shifts, Expenses, Invoice verified, Invoice checkbox
const RAW_COL_WIDTHS = [180, 110, 110, 120, 150, 80];

export default function FunderList({
  visits, onVerify, onUnverify, onSelectFunder, onSelectEmployees,
  dateRange, setDateRange, hoverDate, setHoverDate, rangeLabel, navigateRange, backwardHighlight,
}) {
  const pageRef = useRef(null);
  const [startDate, endDate] = dateRange;

  const {
    tableRef, colWidths, resizeColumn,
    widthsDirty, savingWidths, justSavedWidths, saveWidthsError, requestSaveWidths,
    gateStep, passwordInput, setPasswordInput, passwordError, signingIn,
    nameInput, setNameInput, submitPassword, submitName, closeGate,
  } = useSharedColumnWidths({
    rawWidths: RAW_COL_WIDTHS,
    storageKey: 'timesheets-funders-l1-col-widths',
    prototypeId: window.location.pathname + window.location.search,
  });

  const [funderFilter, setFunderFilter] = useState({ selected: new Set(), sortDir: 'asc' });
  const [invVerFilter, setInvVerFilter] = useState({ selected: new Set() });
  const [sort, setSort] = useState({ col: null, dir: 'asc' });
  const [openDD, setOpenDD] = useState(null);
  const anchorRefs = useRef({});
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [selected, setSelected] = useState({});
  const [selectAll, setSelectAll] = useState(false);

  const openDropdown = useCallback(id => setOpenDD(prev => prev === id ? null : id), []);
  const closeDropdown = useCallback(() => setOpenDD(null), []);
  const toggleSort = col => setSort(prev => prev.col === col ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' });

  // Aggregate visits per funder
  const funderRows = useMemo(() => summarizeFunders(visits), [visits]);

  const colFiltered = useMemo(() => funderRows.filter(r => {
    if (funderFilter.selected.size && !funderFilter.selected.has(r.funder)) return false;
    if (invVerFilter.selected.size && !invVerFilter.selected.has(verifiedStatus(r.invVerCount, r.visits))) return false;
    return true;
  }), [funderRows, funderFilter, invVerFilter]);

  const sorted = useMemo(() => {
    if (sort.col) {
      return [...colFiltered].sort((a, b) => {
        const av = sort.col === 'invVerCount' ? a.invVerCount / (a.visits || 1) : a[sort.col];
        const bv = sort.col === 'invVerCount' ? b.invVerCount / (b.visits || 1) : b[sort.col];
        return sort.dir === 'asc' ? av - bv : bv - av;
      });
    }
    return [...colFiltered].sort((a, b) =>
      funderFilter.sortDir === 'desc' ? b.funder.localeCompare(a.funder) : a.funder.localeCompare(b.funder)
    );
  }, [colFiltered, sort, funderFilter.sortDir]);

  const totalRows  = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const safePage   = Math.min(page, totalPages);
  const pageRows   = sorted.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);
  const showStart  = totalRows === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const showEnd    = Math.min(safePage * rowsPerPage, totalRows);
  const anyFilter  = !!(funderFilter.selected.size || invVerFilter.selected.size);
  const selectedFunders = pageRows.filter(r => selectAll || selected[r.funder]).map(r => r.funder);

  const clearAllFilters = () => {
    setFunderFilter({ selected: new Set(), sortDir: 'asc' });
    setInvVerFilter({ selected: new Set() });
    setSort({ col: null, dir: 'asc' });
    setPage(1);
  };

  // Select/Actions — matching the Employees timesheet's own header buttons
  // exactly (same round-btn classes/labels), rather than a one-off "Verify
  // selected" button.
  const selectItems = [
    { label: 'All', onClick: () => setSelectAll(true) },
    { label: 'All pay', onClick: () => {}, disabled: true, disabledReason: 'No pay verification in the Funders view' },
    { label: 'All invoice', onClick: () => setSelectAll(true) },
    { label: 'None', onClick: () => { setSelectAll(false); setSelected({}); } },
  ];

  // Verify/Unverify genuinely flip invVerified on every visit belonging to
  // the selected funders (real mutation, not decorative) — the checkbox for
  // a fully-verified funder then renders checked+green regardless of
  // selection, and can still be re-selected (its own checkbox toggles the
  // ordinary `selected` flag either way) to be unverified back.
  const clearSelection = () => { setSelected({}); setSelectAll(false); };
  const bulkActionItems = [
    { label: 'Verify', onClick: () => { onVerify(selectedFunders); clearSelection(); } },
    { label: 'Unverify', onClick: () => { onUnverify(selectedFunders); clearSelection(); } },
  ];

  return (
    <>
      <DevToolbar>
        <DevEdit containerRef={pageRef} prototypeId={window.location.pathname + window.location.search} />
        <DevMode containerRef={pageRef} />
        <DevComments containerRef={pageRef} prototypeId={window.location.pathname + window.location.search} />
        <WireframeToggle />
        <AuditCapture containerRef={pageRef} />
      </DevToolbar>
      <div className="ts-shell" ref={pageRef}>
      <a href="../../" className="back-link"><BackIcon /> Prototypes</a>
      <SideNav activeItem="finance" />
      <div className="page-body">
      <TopNav />
      <ScheduleNav active="timesheets" />
      <div className="ts-page">

      <div className="ts-body">
        <div className="ts-page-header">
          <div className="ts-page-header-left">
            <PublishToggle />
            <ViewToggle active="funders" onSelectEmployees={onSelectEmployees} onSelectFunders={() => {}} />
          </div>

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
            <ActionsMenu
              items={selectItems}
              trigger={({ toggle }) => (
                <button className="round-btn secondary-btn btn-icon-right" onClick={toggle}>Select <ChevronDown size={24} /></button>
              )}
            />
            <ActionsMenu
              disabled={selectedFunders.length === 0}
              items={bulkActionItems}
              trigger={({ toggle }) => (
                <button className="round-btn tertiary-btn btn-icon-left btn-icon-right" disabled={selectedFunders.length === 0} onClick={toggle}>
                  <SettingsIcon size={20} /> Actions <ChevronDown size={24} />
                </button>
              )}
            />
          </div>
        </div>

        <div className="filter-bar">
          <div className="filter-bar-left">
            {anyFilter && (
              <button className="clear-btn" onClick={clearAllFilters}>
                <CloseIcon /> Clear
              </button>
            )}
            {(widthsDirty || justSavedWidths) && (
              <div className="col-widths-save">
                <button className="col-widths-save-btn" disabled={savingWidths || !widthsDirty} onClick={requestSaveWidths}>
                  {savingWidths ? 'Saving…' : (justSavedWidths && !widthsDirty) ? 'Saved ✓' : 'Save column widths'}
                </button>
                {saveWidthsError && <span className="col-widths-save-error">{saveWidthsError}</span>}
              </div>
            )}
          </div>
          <div className="filter-bar-right">
            <span className="count-label">Showing: {showStart} – {showEnd} of {totalRows}</span>
            <button className="ts-nav-arrow pag-inline" disabled={safePage <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}><ChevronLeft /></button>
            <button className="ts-nav-arrow pag-inline" disabled={safePage >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}><ChevronRight /></button>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table resizable-table" ref={tableRef}>
            <colgroup>
              {colWidths.map((w, i) => <col key={i} style={{ width: `${w}%` }} />)}
            </colgroup>
            <thead>
              <tr>
                <th className="th-name">
                  <ColLabel>Funders</ColLabel>
                  <button ref={el => anchorRefs.current['funder'] = el}
                    className={`col-icon-btn ${funderFilter.selected.size ? 'col-icon-btn--active' : ''}`}
                    data-devmode-passthrough="true"
                    onClick={() => openDropdown('funder')}>
                    <FilterIcon active={funderFilter.selected.size > 0} />
                  </button>
                  <button className="col-icon-btn" onClick={() => toggleSort('funder')}>
                    <SortIcon dir={sort.col === 'funder' ? sort.dir : null} />
                  </button>
                  <FilterDropdown items={FUNDERS} selected={funderFilter.selected}
                    onApply={(sel, sortDir) => { setFunderFilter({ selected: sel, sortDir }); setPage(1); }}
                    onClear={() => { setFunderFilter({ selected: new Set(), sortDir: 'asc' }); setPage(1); }}
                    hasSort={false}
                    isOpen={openDD === 'funder'} onClose={closeDropdown} anchorEl={anchorRefs.current['funder']}
                  />
                  <ColResizeHandle onDrag={dx => resizeColumn(0, dx)} />
                </th>

                <th className={`th-num ${sort.col === 'visits' ? 'sorted' : ''}`}>
                  <ColLabel>Visits total</ColLabel>
                  <button className="col-icon-btn" onClick={() => toggleSort('visits')}>
                    <SortIcon dir={sort.col === 'visits' ? sort.dir : null} />
                  </button>
                  <ColResizeHandle onDrag={dx => resizeColumn(1, dx)} />
                </th>

                <th className={`th-num ${sort.col === 'shifts' ? 'sorted' : ''}`}>
                  <ColLabel>Shifts total</ColLabel>
                  <button className="col-icon-btn" onClick={() => toggleSort('shifts')}>
                    <SortIcon dir={sort.col === 'shifts' ? sort.dir : null} />
                  </button>
                  <ColResizeHandle onDrag={dx => resizeColumn(2, dx)} />
                </th>

                <th className={`th-num ${sort.col === 'expenses' ? 'sorted' : ''}`}>
                  <ColLabel>Expenses</ColLabel>
                  <button className="col-icon-btn" onClick={() => toggleSort('expenses')}>
                    <SortIcon dir={sort.col === 'expenses' ? sort.dir : null} />
                  </button>
                  <ColResizeHandle onDrag={dx => resizeColumn(3, dx)} />
                </th>

                <th>
                  <ColLabel>Invoice verified</ColLabel>
                  <button ref={el => anchorRefs.current['invVer'] = el}
                    className={`col-icon-btn ${invVerFilter.selected.size ? 'col-icon-btn--active' : ''}`}
                    data-devmode-passthrough="true"
                    onClick={() => openDropdown('invVer')}>
                    <FilterIcon active={invVerFilter.selected.size > 0} />
                  </button>
                  <button className="col-icon-btn" onClick={() => toggleSort('invVerCount')}>
                    <SortIcon dir={sort.col === 'invVerCount' ? sort.dir : null} />
                  </button>
                  <FilterDropdown items={VERIFIED_STATUSES} selected={invVerFilter.selected}
                    onApply={(sel) => { setInvVerFilter({ selected: sel }); setPage(1); }}
                    onClear={() => { setInvVerFilter({ selected: new Set() }); setPage(1); }}
                    hasSort={false}
                    isOpen={openDD === 'invVer'} onClose={closeDropdown} anchorEl={anchorRefs.current['invVer']}
                  />
                  <ColResizeHandle onDrag={dx => resizeColumn(4, dx)} />
                </th>

                <th className="check-col">
                  <div className="header-check">
                    <label className="checkbox-wrap">
                      <input type="checkbox" checked={selectAll} onChange={e => setSelectAll(e.target.checked)} />
                      <span className="checkbox-box" />
                    </label>
                    <span>Inv</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map(row => {
                const fullyVerified = row.visits > 0 && row.invVerCount === row.visits;
                const isSelected = selectAll || !!selected[row.funder];
                // Green means "genuinely verified, not currently selected." The
                // moment a verified row is (re-)selected for the next bulk
                // action, it reverts to the ordinary purple checked state —
                // matching how a plain unverified row looks once checked —
                // so "selected" always reads the same regardless of what it's
                // selected *for* (Verify or Unverify).
                const showVerifiedGreen = fullyVerified && !isSelected;
                return (
                <tr key={row.funder} className="data-row" onClick={() => onSelectFunder(row.funder)}>
                  <td className="td-name">{row.funder}</td>
                  <td className="td-num">{row.visits}</td>
                  <td className="td-num">—</td>
                  <td className="td-num">{fmtGBP(row.expenses)}</td>
                  <td className="td-num">
                    <VerifiedBadge verified={row.invVerCount} total={row.visits} />
                  </td>
                  <td className="check-col" onClick={e => e.stopPropagation()}>
                    <label className={`checkbox-wrap ${showVerifiedGreen ? 'checkbox-verified' : ''}`}>
                      <input type="checkbox" checked={isSelected || fullyVerified}
                        onChange={() => setSelected(p => ({ ...p, [row.funder]: !p[row.funder] }))} />
                      <span className="checkbox-box" />
                    </label>
                  </td>
                </tr>
                );
              })}
              {totalRows === 0 && (
                <tr><td colSpan={6} className="table-empty">No funders match the current filters</td></tr>
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
      </div>

      {gateStep && (
        <AuthGate
          step={gateStep}
          passwordTitle="Enter password to save column widths"
          password={passwordInput} setPassword={setPasswordInput}
          passwordError={passwordError} signingIn={signingIn}
          onSubmitPassword={submitPassword}
          name={nameInput} setName={setNameInput}
          onSubmitName={submitName}
          onClose={closeGate}
        />
      )}
      </div>
      </div>
    </>
  );
}
