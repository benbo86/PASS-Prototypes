import { useState, useMemo, useRef, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import FilterDropdown from '../../../Components/FilterDropdown';
import Pagination from '../../../Components/Pagination';
import Modal from '../../../Components/Modal';
import RowActionsMenu from '../../../Components/RowActionsMenu';
import Tooltip from '../../../Components/Tooltip';
import AuthGate from '../../../Components/AuthGate';
import ColLabel from '../../../Components/ColLabel';
import ColResizeHandle from '../../../Components/ColResizeHandle';
import useSharedColumnWidths from '../../../Components/useSharedColumnWidths';
import SideNav from '../../../Components/SideNav';
import TopNav from '../../../Components/TopNav';
import ScheduleNav from '../../../Components/ScheduleNav';
import HolidayAbsenceDialog from '../../../Components/HolidayAbsenceDialog';
import DevToolbar from '../../../Components/DevToolbar';
import DevMode from '../../../Components/DevMode';
import DevComments from '../../../Components/DevComments';
import DevEdit from '../../../Components/DevEdit';
import WireframeToggle from '../../../Components/WireframeToggle';
import AuditCapture from '../../../Components/AuditCapture';
import { fmtDate, DateRangeInput } from '../../../Components/DateRangePicker';
import { LEAVE_REQUESTS, EMPLOYEE_NAMES, LEAVE_TYPES, STATUSES, fmtD, leaveTypeTimes } from './data';

// ─── Icons ──────────────────────────────────────────────────────────────────

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15,18 9,12 15,6"/>
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
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <polygon fill="currentColor" stroke="currentColor" strokeLinejoin="round"
      points="18 7.2 16.8 6 12 10.8 7.2 6 6 7.2 10.8 12 6 16.8 7.2 18 12 13.2 16.8 18 18 16.8 13.2 12"/>
  </svg>
);

// ─── Helpers ────────────────────────────────────────────────────────────────

const statusClass = s => {
  if (s === 'Approved') return 'lr-status-approved';
  if (s === 'Declined') return 'lr-status-declined';
  if (s === 'Awaiting Cancellation') return 'lr-status-awaiting';
  if (s === 'Cancelled') return 'lr-status-cancelled';
  return 'lr-status-pending';
};

// Employee/Leave Type/Status filters + sort — see FilterDropdown itself for
// the pending/selected/sortDir/nameField shape.
const emptyCheckboxFilter = () => ({ selected: new Set(), sortDir: 'asc', nameField: 'first' });

const STRING_SORT_COLS = ['leaveType', 'status'];
const DATE_SORT_COLS = ['fromDate', 'toDate', 'submitted'];
const NUM_SORT_COLS = ['amount'];

// 8 columns: Employee, Leave Type, From Date, To Date, Amount Requested,
// Status, Submitted, Actions.
const RAW_COL_WIDTHS = [150, 150, 100, 100, 120, 150, 110, 150];

// Amount is in days for most employees, but hours for an employee on an
// hourly/zero-hours contract (see data.js's own EMPLOYEE_CONTRACTS) —
// each request already carries its own `unit`, so formatting is a plain
// per-row lookup, no separate employee/contract check needed here.
function fmtAmount(row) {
  return row.unit === 'hours' ? `${row.amount} hrs` : `${row.amount} ${row.amount === 1 ? 'day' : 'days'}`;
}

export default function LeaveRequests() {
  const pageRef = useRef(null);
  const [rows, setRows] = useState(LEAVE_REQUESTS);

  // Leave Requests tab badge — a live queue-depth count, not a "new since
  // last visit" notification (an earlier version tracked that via
  // localStorage; see [[project_leave_requests_prototype]] memory for why
  // that was the wrong model). A leave request doesn't become less urgent
  // just because someone opened the tab without deciding on it, so this
  // counts everything still awaiting a decision — Pending *and* Awaiting
  // Cancellation, both of which need someone to actually act — and reads
  // off the live `rows` state (not the static LEAVE_REQUESTS import) so
  // it decrements the moment a request is approved/cancelled, the same
  // way a real approvals-queue badge would.
  const actionRequiredCount = rows.filter((r) => r.status === 'Pending' || r.status === 'Awaiting Cancellation').length;

  // Decorative date-range header — same non-filtering convention already
  // established for Invoices/Timesheets/GPA (doesn't actually filter the
  // table below).
  const [dateRange, setDateRange] = useState([new Date(2026, 3, 1), new Date(2026, 8, 30)]);
  const [hoverDate, setHoverDate] = useState(null);
  const [startDate, endDate] = dateRange;

  const [employeeFilter, setEmployeeFilter] = useState(emptyCheckboxFilter());
  const [leaveTypeFilter, setLeaveTypeFilter] = useState(emptyCheckboxFilter());
  const [statusFilter, setStatusFilter] = useState(emptyCheckboxFilter());

  const [sort, setSort] = useState({ col: null, dir: 'asc' });
  const [openDD, setOpenDD] = useState(null);
  const anchorRefs = useRef({});
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  const [approveRow, setApproveRow] = useState(null);
  // Decline (Pending -> Declined, an initial office decision) and Cancel
  // (Approved/Awaiting Cancellation -> Cancelled, calling off something
  // already agreed) share one dialog — same reason-required shape, just a
  // different resulting status/copy — rather than duplicating the whole
  // block. See STATUSES' own comment in data.js for why these are two
  // distinct terminal states, not one.
  const [actionRow, setActionRow] = useState(null);
  const [actionMode, setActionMode] = useState('cancel'); // 'decline' | 'cancel'
  const [actionReason, setActionReason] = useState('');

  const {
    tableRef, colWidths, resizeColumn,
    widthsDirty, savingWidths, justSavedWidths, saveWidthsError, requestSaveWidths,
    gateStep, passwordInput, setPasswordInput, passwordError, signingIn,
    nameInput, setNameInput, submitPassword, submitName, closeGate,
  } = useSharedColumnWidths({
    rawWidths: RAW_COL_WIDTHS,
    storageKey: 'schedule-leave-requests-col-widths',
    prototypeId: window.location.pathname,
  });

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
    setEmployeeFilter(emptyCheckboxFilter());
    setLeaveTypeFilter(emptyCheckboxFilter());
    setStatusFilter(emptyCheckboxFilter());
    setSort({ col: null, dir: 'asc' });
    setPage(1);
  };

  const filtered = useMemo(() => {
    let r = rows;
    if (employeeFilter.selected.size) r = r.filter(rec => employeeFilter.selected.has(rec.employee));
    if (leaveTypeFilter.selected.size) r = r.filter(rec => leaveTypeFilter.selected.has(rec.leaveType));
    if (statusFilter.selected.size) r = r.filter(rec => statusFilter.selected.has(rec.status));
    return r;
  }, [rows, employeeFilter, leaveTypeFilter, statusFilter]);

  const sorted = useMemo(() => {
    const r = [...filtered];
    // Default (no explicit column sort): Submitted descending — most
    // recent first, per the explicit spec, unlike every other prototype's
    // own ascending-by-primary-date default.
    if (!sort.col) return r.sort((a, b) => b.submitted.getTime() - a.submitted.getTime());
    return r.sort((a, b) => {
      if (DATE_SORT_COLS.includes(sort.col)) {
        const av = a[sort.col].getTime(), bv = b[sort.col].getTime();
        return sort.dir === 'asc' ? av - bv : bv - av;
      }
      if (NUM_SORT_COLS.includes(sort.col)) {
        return sort.dir === 'asc' ? a[sort.col] - b[sort.col] : b[sort.col] - a[sort.col];
      }
      if (STRING_SORT_COLS.includes(sort.col)) {
        return sort.dir === 'asc' ? a[sort.col].localeCompare(b[sort.col]) : b[sort.col].localeCompare(a[sort.col]);
      }
      return 0;
    });
  }, [filtered, sort]);

  const totalRows  = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const safePage   = Math.min(page, totalPages);
  const pageRows   = sorted.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);
  const showStart  = totalRows === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const showEnd    = Math.min(safePage * rowsPerPage, totalRows);
  const anyFilter  = !!(employeeFilter.selected.size || leaveTypeFilter.selected.size || statusFilter.selected.size);

  // ── Approve flow ──────────────────────────────────────────────────────────
  // Clicking Approve does NOT change status immediately — it opens the
  // existing Add-Holiday dialog, pre-populated. The status only becomes
  // Approved once the office user actually completes that dialog's own
  // step-2 Confirm; closing/backing out leaves the request Pending.
  const handleApproveConfirm = () => {
    setRows(prev => prev.map(r => r.id === approveRow.id ? { ...r, status: 'Approved' } : r));
    setApproveRow(null);
  };

  // ── Decline / Cancel flow ───────────────────────────────────────────────────
  // Decline is the office's own initial rejection of a still-Pending
  // request; Cancel calls off something already Approved (reached via
  // Awaiting Cancellation, the care-worker-initiated withdrawal of an
  // already-approved holiday). Both require a reason.
  const openActionDialog = (row, mode) => { setActionRow(row); setActionMode(mode); setActionReason(''); };
  const closeActionDialog = () => { setActionRow(null); setActionReason(''); };
  const handleActionConfirm = () => {
    const reason = actionReason.trim();
    if (!reason) return;
    const nextStatus = actionMode === 'decline' ? 'Declined' : 'Cancelled';
    setRows(prev => prev.map(r => r.id === actionRow.id ? { ...r, status: nextStatus, reason } : r));
    closeActionDialog();
  };

  return (
    <>
      <DevToolbar>
        <DevEdit containerRef={pageRef} prototypeId={window.location.pathname} />
        <DevMode containerRef={pageRef} />
        <DevComments containerRef={pageRef} prototypeId={window.location.pathname} />
        <WireframeToggle />
        <AuditCapture containerRef={pageRef} />
      </DevToolbar>
      <div className="schedule-page" ref={pageRef}>
      <a href="../../" className="back-link"><BackIcon /> Prototypes</a>
      <SideNav activeItem="schedule" />
      <div className="page-body">
      <TopNav />
      <ScheduleNav active="leave-requests" tabBadges={{ 'leave-requests': actionRequiredCount }} />
      <main className="lr-content">

        <div className="lr-page-header">
          <h1>Leave Requests</h1>
          <div className="lr-date-nav">
            <button className="lr-nav-arrow" onClick={() => navigateRange(-1)}><ChevronLeft /></button>
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
              popperPlacement="bottom" portalId="lr-datepicker-portal"
            />
            <button className="lr-nav-arrow" onClick={() => navigateRange(1)}><ChevronRight /></button>
          </div>
        </div>

        <div className="lr-sub-row">
          {(widthsDirty || justSavedWidths) && (
            <div className="col-widths-save">
              <button className="col-widths-save-btn" disabled={savingWidths || !widthsDirty} onClick={requestSaveWidths}>
                {savingWidths ? 'Saving…' : (justSavedWidths && !widthsDirty) ? 'Saved ✓' : 'Save column widths'}
              </button>
              {saveWidthsError && <span className="col-widths-save-error">{saveWidthsError}</span>}
            </div>
          )}
          {anyFilter && <button className="clear-btn" onClick={clearAllFilters}><CloseIcon /> Clear</button>}
          <span className="count-label">Showing: {showStart} – {showEnd} of {totalRows}</span>
          <button className="lr-nav-arrow pag-inline" disabled={safePage <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}><ChevronLeft /></button>
          <button className="lr-nav-arrow pag-inline" disabled={safePage >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}><ChevronRight /></button>
        </div>

        <div className="table-wrap">
          <table className="data-table resizable-table" ref={tableRef}>
            <colgroup>
              {colWidths.map((w, i) => <col key={i} style={{ width: `${w}%` }} />)}
            </colgroup>
            <thead>
              <tr>
                {/* Employee — checkbox filter, name sort (no separate sort icon) */}
                <th>
                  <ColLabel>Employee</ColLabel>
                  <button ref={el => anchorRefs.current['employee'] = el}
                    className={`col-icon-btn ${employeeFilter.selected.size ? 'col-icon-btn--active' : ''}`}
                    data-devmode-passthrough="true"
                    onClick={() => openDropdown('employee')}>
                    <FilterIcon active={employeeFilter.selected.size > 0} />
                  </button>
                  <FilterDropdown items={EMPLOYEE_NAMES} selected={employeeFilter.selected}
                    onApply={(sel, sortDir, nameField) => { setEmployeeFilter({ selected: sel, sortDir, nameField }); setPage(1); }}
                    onClear={() => { setEmployeeFilter(emptyCheckboxFilter()); setPage(1); }}
                    hasNameSort
                    isOpen={openDD === 'employee'} onClose={closeDropdown} anchorEl={anchorRefs.current['employee']}
                  />
                  <ColResizeHandle onDrag={dx => resizeColumn(0, dx)} />
                </th>

                {/* Leave Type — checkbox filter AND a real sort icon */}
                <th className={sort.col === 'leaveType' ? 'sorted' : ''}>
                  <ColLabel>Leave Type</ColLabel>
                  <button ref={el => anchorRefs.current['leaveType'] = el}
                    className={`col-icon-btn ${leaveTypeFilter.selected.size ? 'col-icon-btn--active' : ''}`}
                    data-devmode-passthrough="true"
                    onClick={() => openDropdown('leaveType')}>
                    <FilterIcon active={leaveTypeFilter.selected.size > 0} />
                  </button>
                  <button className="col-icon-btn" onClick={() => toggleSort('leaveType')}>
                    <SortIcon dir={sort.col === 'leaveType' ? sort.dir : null} />
                  </button>
                  <FilterDropdown items={LEAVE_TYPES} selected={leaveTypeFilter.selected}
                    onApply={(sel, sortDir, nameField) => { setLeaveTypeFilter({ selected: sel, sortDir, nameField }); setPage(1); }}
                    onClear={() => { setLeaveTypeFilter(emptyCheckboxFilter()); setPage(1); }}
                    isOpen={openDD === 'leaveType'} onClose={closeDropdown} anchorEl={anchorRefs.current['leaveType']}
                  />
                  <ColResizeHandle onDrag={dx => resizeColumn(1, dx)} />
                </th>

                {/* From Date — sort only */}
                <th className={sort.col === 'fromDate' ? 'sorted' : ''}>
                  <ColLabel>From Date</ColLabel>
                  <button className="col-icon-btn" onClick={() => toggleSort('fromDate')}><SortIcon dir={sort.col === 'fromDate' ? sort.dir : null} /></button>
                  <ColResizeHandle onDrag={dx => resizeColumn(2, dx)} />
                </th>

                {/* To Date — sort only */}
                <th className={sort.col === 'toDate' ? 'sorted' : ''}>
                  <ColLabel>To Date</ColLabel>
                  <button className="col-icon-btn" onClick={() => toggleSort('toDate')}><SortIcon dir={sort.col === 'toDate' ? sort.dir : null} /></button>
                  <ColResizeHandle onDrag={dx => resizeColumn(3, dx)} />
                </th>

                {/* Amount Requested — sort only, numeric. Mixed units (days vs
                    hours, see fmtAmount) sort on the raw number regardless —
                    same as any table sorting mixed units, not a bug to fix. */}
                <th className={`th-num ${sort.col === 'amount' ? 'sorted' : ''}`}>
                  <ColLabel>Amount Requested</ColLabel>
                  <button className="col-icon-btn" onClick={() => toggleSort('amount')}><SortIcon dir={sort.col === 'amount' ? sort.dir : null} /></button>
                  <ColResizeHandle onDrag={dx => resizeColumn(4, dx)} />
                </th>

                {/* Status — checkbox filter AND a real sort icon */}
                <th className={sort.col === 'status' ? 'sorted' : ''}>
                  <ColLabel>Status</ColLabel>
                  <button ref={el => anchorRefs.current['status'] = el}
                    className={`col-icon-btn ${statusFilter.selected.size ? 'col-icon-btn--active' : ''}`}
                    data-devmode-passthrough="true"
                    onClick={() => openDropdown('status')}>
                    <FilterIcon active={statusFilter.selected.size > 0} />
                  </button>
                  <button className="col-icon-btn" onClick={() => toggleSort('status')}>
                    <SortIcon dir={sort.col === 'status' ? sort.dir : null} />
                  </button>
                  <FilterDropdown items={STATUSES} selected={statusFilter.selected}
                    onApply={(sel, sortDir, nameField) => { setStatusFilter({ selected: sel, sortDir, nameField }); setPage(1); }}
                    onClear={() => { setStatusFilter(emptyCheckboxFilter()); setPage(1); }}
                    isOpen={openDD === 'status'} onClose={closeDropdown} anchorEl={anchorRefs.current['status']}
                  />
                  <ColResizeHandle onDrag={dx => resizeColumn(5, dx)} />
                </th>

                {/* Submitted — sort only; default table order (no col sort) is this column, descending */}
                <th className={sort.col === 'submitted' ? 'sorted' : ''}>
                  <ColLabel>Submitted</ColLabel>
                  <button className="col-icon-btn" onClick={() => toggleSort('submitted')}><SortIcon dir={sort.col === 'submitted' ? sort.dir : null} /></button>
                  <ColResizeHandle onDrag={dx => resizeColumn(6, dx)} />
                </th>

                <th><span>Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map(row => (
                <tr key={row.id}>
                  <td className="td-name">{row.employee}</td>
                  <td>{row.leaveType}</td>
                  <td className="nowrap">{fmtD(row.fromDate)}</td>
                  <td className="nowrap">{fmtD(row.toDate)}</td>
                  <td className="td-num">{fmtAmount(row)}</td>
                  <td><span className={`status-pill ${statusClass(row.status)}`}>{row.status}</span></td>
                  <td className="nowrap">{fmtD(row.submitted)}</td>
                  <td>
                    {row.status === 'Pending' && (
                      <span className="lr-actions">
                        {/* All three Pending outcomes live in one kebab menu —
                            a lone visible "Approve" text link next to the "⋮"
                            read oddly as two different action styles sitting
                            side by side, so it moved in alongside Decline/
                            Cancel rather than staying split out. */}
                        <RowActionsMenu
                          items={[
                            { label: 'Approve', onClick: () => setApproveRow(row) },
                            { label: 'Decline', onClick: () => openActionDialog(row, 'decline') },
                            { label: 'Cancel', onClick: () => openActionDialog(row, 'cancel') },
                          ]}
                        />
                      </span>
                    )}
                    {(row.status === 'Approved' || row.status === 'Awaiting Cancellation') && (
                      <span className="lr-actions">
                        <button className="lr-action-btn" onClick={() => openActionDialog(row, 'cancel')}>Cancel</button>
                      </span>
                    )}
                    {(row.status === 'Declined' || row.status === 'Cancelled') && (
                      <Tooltip text={row.reason} wrapClassName="lr-cancelled-tooltip-wrap">
                        <span className="lr-cancelled-note">
                          {row.status} — {row.reason}
                        </span>
                      </Tooltip>
                    )}
                  </td>
                </tr>
              ))}
              {totalRows === 0 && (
                <tr><td colSpan={8} className="table-empty">No leave requests match the current filters</td></tr>
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
      </main>
      </div>
      </div>

      {approveRow && (() => {
        const [startTime, endTime] = leaveTypeTimes(approveRow.leaveType);
        return (
          <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setApproveRow(null) }}>
            <HolidayAbsenceDialog
              employee={{ value: approveRow.employee, label: approveRow.employee }}
              absenceType={{ value: 'holiday', label: 'Holiday' }}
              startDate={approveRow.fromDate}
              endDate={approveRow.toDate}
              startTime={startTime}
              endTime={endTime}
              daysDeducted={approveRow.amount}
              deductedLabel={approveRow.unit === 'hours' ? 'Hours deducted' : 'Days deducted'}
              onClose={() => setApproveRow(null)}
              onConfirm={handleApproveConfirm}
            />
          </div>
        );
      })()}

      {actionRow && (
        <Modal title={actionMode === 'decline' ? 'Decline leave request' : 'Cancel leave request'} onClose={closeActionDialog}>
          <div className="lr-cancel-summary">
            <div><span className="lr-cancel-label">Leave type</span><span>{actionRow.leaveType}</span></div>
            <div><span className="lr-cancel-label">Date from</span><span>{fmtD(actionRow.fromDate)}</span></div>
            <div><span className="lr-cancel-label">Date to</span><span>{fmtD(actionRow.toDate)}</span></div>
            <div><span className="lr-cancel-label">{actionRow.unit === 'hours' ? 'Hours requested' : 'Days requested'}</span><span>{actionRow.amount}</span></div>
          </div>
          <div className="field">
            <label htmlFor="action-reason">{actionMode === 'decline' ? 'Decline reason' : 'Cancellation reason'}</label>
            <textarea
              id="action-reason"
              value={actionReason}
              onChange={e => setActionReason(e.target.value)}
              rows={3}
              placeholder={actionMode === 'decline' ? 'Explain why this leave request is being declined' : 'Explain why this leave request is being cancelled'}
            />
          </div>
          <div className="btn-row">
            <button className="round-btn tertiary-btn" onClick={closeActionDialog}>Cancel</button>
            <button className="round-btn primary-btn" disabled={!actionReason.trim()} onClick={handleActionConfirm}>
              {actionMode === 'decline' ? 'Confirm decline' : 'Confirm cancellation'}
            </button>
          </div>
        </Modal>
      )}

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
    </>
  );
}
