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
import SplitViewToggle from '../../../Components/SplitViewToggle';
import { fmtDate, DateRangeInput } from '../../../Components/DateRangePicker';
import { LEAVE_REQUESTS, EMPLOYEE_NAMES, LEAVE_TYPES, STATUSES, fmtD, fmtDT, fmtDTShort, leaveTypeTimes } from './data';
import { DEMO_EMPLOYEE, useLeaveRequests, recordOfficeDecision, resetLeaveRequests, useDemoScheme, setDemoScheme, useEntitlement } from '../../../Components/leaveRequestsStore';

// The signed-in office user — matches Components/TopNav.jsx's own default
// `userName` ("Alex Morgan"), declared explicitly here (rather than left
// implicit) and passed into <TopNav> below, so the nav's own identity and
// every audit-trail attribution this page records can never drift apart —
// same reasoning/pattern as web/messaging's own CURRENT_OFFICE_USER.
const CURRENT_OFFICE_USER = 'Alex Morgan';

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

// Requests still waiting on an office decision, each status with its own
// quick filter above the table (styled like its status pill). Same set the
// tab badge counts.
const NEEDS_ACTION = new Set(['Awaiting Approval', 'Awaiting Cancellation']);

const statusClass = s => {
  if (s === 'Approved') return 'lr-status-approved';
  if (s === 'Declined') return 'lr-status-declined';
  if (s === 'Awaiting Cancellation') return 'lr-status-awaiting-cancellation';
  if (s === 'Cancelled') return 'lr-status-cancelled';
  if (s === 'Withdrawn') return 'lr-status-withdrawn';
  return 'lr-status-awaiting-approval';
};

// Employee/Leave Type/Status filters + sort — see FilterDropdown itself for
// the pending/selected/sortDir/nameField shape.
const emptyCheckboxFilter = () => ({ selected: new Set(), sortDir: 'asc', nameField: 'first' });

const STRING_SORT_COLS = ['leaveTypeLabel', 'status'];
const DATE_SORT_COLS = ['fromDate', 'toDate', 'submitted'];
const NUM_SORT_COLS = ['amount'];

// 8 columns: Employee, Leave Type, From Date, To Date, Amount Requested,
// Status, Submitted, Actions.
const RAW_COL_WIDTHS = [150, 150, 100, 100, 120, 150, 110, 150];

// Amount is in days for most employees, but hours for an employee on an
// hourly/zero-hours contract (see data.js's own EMPLOYEE_CONTRACTS) —
// each request already carries its own `unit`, so formatting is a plain
// per-row lookup, no separate employee/contract check needed here.
// Adrianna Janowski is the employee signed in to the mobile Holidays app;
// her requests come from the shared store (Components/leaveRequestsStore.js)
// rather than this page's generated data. She's added to the filter list
// only — adding her to EMPLOYEE_NAMES itself would reshuffle the generated
// rows.
const FILTER_EMPLOYEES = [...EMPLOYEE_NAMES, DEMO_EMPLOYEE];

const isoToDate = iso => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
const dateToIso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const hhmmToDate = hhmm => { const [h, m] = hhmm.split(':').map(Number); return new Date(2026, 0, 1, h, m); };
const dateToHhmm = d => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
const hoursBetweenDates = (a, b) => Math.max(0, Math.round(((b - a) / 3600000) * 10) / 10);

// An hours-scheme employee doesn't pick Full/Half day — they give start and
// end times — so their Leave Type shows those times. They filter together
// under "Hours".
function leaveTypeLabel(row) {
  if (row.unit !== 'hours') return row.leaveType;
  const [start, end] = row.startTime ? [row.startTime, row.endTime] : leaveTypeTimes(row.leaveType).map(dateToHhmm);
  return `${start} – ${end}`;
}
const withLeaveTypeLabel = row => ({
  ...row,
  leaveTypeLabel: leaveTypeLabel(row),
  leaveCategory: row.unit === 'hours' ? 'Hours' : row.leaveType,
});
const LEAVE_TYPE_FILTER_ITEMS = [...LEAVE_TYPES, 'Hours'];

// Shared store record -> this table's row shape.
function toLinkedRow(r) {
  return withLeaveTypeLabel({
    ...r,
    linked: true,
    fromDate: isoToDate(r.fromDate),
    toDate: isoToDate(r.toDate),
    unit: r.contract === 'hours' ? 'hours' : 'days',
    submitted: new Date(r.submitted),
    actionedAt: r.actionedAt ? new Date(r.actionedAt) : null,
    withdrawnAt: r.withdrawnAt ? new Date(r.withdrawnAt) : null,
  });
}
const GENERATED_ROWS = LEAVE_REQUESTS.map(withLeaveTypeLabel);


function fmtAmount(row) {
  return row.unit === 'hours' ? `${row.amount} hrs` : `${row.amount} ${row.amount === 1 ? 'day' : 'days'}`;
}

// Copy for the shared reason dialog. Decline and Cancel need a reason; Keep
// holiday's is optional (the holiday simply stands).
const ACTION_COPY = {
  decline: { title: 'Decline holiday request', label: 'Decline reason', placeholder: 'Explain why this holiday request is being declined', confirm: 'Confirm decline' },
  cancel: { title: 'Cancel holiday request', label: 'Cancellation reason', placeholder: 'Explain why this holiday request is being cancelled', confirm: 'Confirm cancellation' },
  keep: { title: 'Keep holiday', label: 'Reason (optional)', placeholder: 'Explain why the cancellation isn\'t being approved', confirm: 'Keep holiday' },
};

function confirmResetLeaveRequests() {
  if (window.confirm('Reset all holiday requests (here and on the mobile app) to the starting examples?')) resetLeaveRequests();
}

export default function LeaveRequests() {
  const pageRef = useRef(null);
  const [localRows, setLocalRows] = useState(GENERATED_ROWS);
  // Requests from the mobile Holidays prototype — submitted, withdrawn and
  // decided on in either place, updating the other live. Only her requests
  // for the holiday scheme currently selected in the app are shown.
  const linkedRecords = useLeaveRequests();
  const scheme = useDemoScheme();
  // Adrianna's figures, for the approve dialog's entitlement summary
  // (matching what her app shows).
  const entitlement = useEntitlement(scheme, scheme === 'hours' ? 224 : 28);
  const rows = useMemo(
    () => [...localRows, ...linkedRecords.filter(r => r.contract === scheme).map(toLinkedRow)],
    [localRows, linkedRecords, scheme],
  );

  // A decision on a linked row is written to the shared store, which also
  // sends Adrianna a notification in the mobile app; anything else is just
  // this page's own state.
  const updateRow = (row, patch) => {
    if (row.linked) {
      recordOfficeDecision(row.id, { ...patch, actionedAt: patch.actionedAt.toISOString() });
    } else {
      const { approved, kept, ...rest } = patch;
      setLocalRows(prev => prev.map(r => r.id === row.id ? withLeaveTypeLabel({
        ...r,
        ...rest,
        ...(kept ? { reason: r.reason } : {}),
        ...(approved ? {
          fromDate: isoToDate(approved.fromDate), toDate: isoToDate(approved.toDate),
          amount: approved.amount, startTime: approved.startTime, endTime: approved.endTime,
        } : {}),
      }) : r));
    }
  };

  // Leave Requests tab badge — a live queue-depth count, not a "new since
  // last visit" notification (an earlier version tracked that via
  // localStorage; see [[project_leave_requests_prototype]] memory for why
  // that was the wrong model). A leave request doesn't become less urgent
  // just because someone opened the tab without deciding on it, so this
  // counts everything still awaiting a decision — Awaiting Approval *and* Awaiting
  // Cancellation, both of which need someone to actually act — and reads
  // off the live `rows` state (not the static LEAVE_REQUESTS import) so
  // it decrements the moment a request is approved/cancelled, the same
  // way a real approvals-queue badge would.
  const actionRequiredCount = rows.filter((r) => NEEDS_ACTION.has(r.status)).length;
  const awaitingApprovalCount = rows.filter((r) => r.status === 'Awaiting Approval').length;
  const awaitingCancellationCount = actionRequiredCount - awaitingApprovalCount;
  // Quick filters: 'Awaiting Approval' and/or 'Awaiting Cancellation'. Both
  // on shows either kind.
  const [quickStatuses, setQuickStatuses] = useState(() => new Set());
  const toggleQuickStatus = status => {
    setQuickStatuses(prev => { const next = new Set(prev); next.has(status) ? next.delete(status) : next.add(status); return next; });
    setPage(1);
  };

  // Lists requests whose dates overlap the range. Defaults to the holiday
  // entitlement year (1 Apr – 31 Mar, matching the Add Holiday dialog's
  // "2026 – 2027"); the arrows move by the range's own length.
  const [dateRange, setDateRange] = useState([new Date(2026, 3, 1), new Date(2027, 2, 31)]);
  const [hoverDate, setHoverDate] = useState(null);
  const [startDate, endDate] = dateRange;

  const [employeeFilter, setEmployeeFilter] = useState(emptyCheckboxFilter());
  const [leaveTypeFilter, setLeaveTypeFilter] = useState(emptyCheckboxFilter());
  const [statusFilter, setStatusFilter] = useState(emptyCheckboxFilter());

  const [sort, setSort] = useState({ col: null, dir: 'asc' });
  const [openDD, setOpenDD] = useState(null);
  const anchorRefs = useRef({});
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [approveRow, setApproveRow] = useState(null);
  // Decline (Awaiting Approval -> Declined, an initial office decision) and Cancel
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
    // A range of whole months (like the default holiday year) moves by that
    // many months, so it stays 1 Apr – 31 Mar rather than drifting by a day.
    const endIsMonthEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1).getDate() === 1;
    if (startDate.getDate() === 1 && endIsMonthEnd) {
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + endDate.getMonth() - startDate.getMonth() + 1;
      const ns = new Date(startDate.getFullYear(), startDate.getMonth() + dir * months, 1);
      setDateRange([ns, new Date(ns.getFullYear(), ns.getMonth() + months, 0)]);
      return;
    }
    const ms = endDate.getTime() - startDate.getTime() + 86400000;
    setDateRange([new Date(startDate.getTime() + dir * ms), new Date(endDate.getTime() + dir * ms)]);
  };

  const clearAllFilters = () => {
    setEmployeeFilter(emptyCheckboxFilter());
    setLeaveTypeFilter(emptyCheckboxFilter());
    setStatusFilter(emptyCheckboxFilter());
    setQuickStatuses(new Set());
    setSort({ col: null, dir: 'asc' });
    setPage(1);
  };

  const filtered = useMemo(() => {
    let r = rows;
    if (startDate) {
      const rangeEnd = endDate || startDate;
      r = r.filter(rec => rec.fromDate <= rangeEnd && rec.toDate >= startDate);
    }
    if (employeeFilter.selected.size) r = r.filter(rec => employeeFilter.selected.has(rec.employee));
    if (leaveTypeFilter.selected.size) r = r.filter(rec => leaveTypeFilter.selected.has(rec.leaveCategory));
    if (statusFilter.selected.size) r = r.filter(rec => statusFilter.selected.has(rec.status));
    if (quickStatuses.size) r = r.filter(rec => quickStatuses.has(rec.status));
    return r;
  }, [rows, startDate, endDate, employeeFilter, leaveTypeFilter, statusFilter, quickStatuses]);

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
  const anyFilter  = !!(employeeFilter.selected.size || leaveTypeFilter.selected.size || statusFilter.selected.size || quickStatuses.size);

  // ── Approve flow ──────────────────────────────────────────────────────────
  // Clicking Approve does NOT change status immediately — it opens the
  // existing Add-Holiday dialog, pre-populated. The status only becomes
  // Approved once the office user actually completes that dialog's own
  // step-2 Confirm; closing/backing out leaves the request Awaiting Approval.
  // The office may change the dates/times; whatever they confirm is what's
  // booked, and her app shows that it differs from what she asked for.
  const handleApproveConfirm = ({ startDate: s, endDate: e, startTime: st, endTime: et, daysDeducted }) => {
    updateRow(approveRow, {
      status: 'Approved', actionedBy: CURRENT_OFFICE_USER, actionedAt: new Date(),
      approved: { fromDate: dateToIso(s), toDate: dateToIso(e), startTime: dateToHhmm(st), endTime: dateToHhmm(et), amount: daysDeducted },
    });
    setApproveRow(null);
  };

  // ── Decline / Cancel flow ───────────────────────────────────────────────────
  // Decline is the office's own initial rejection of a still-undecided
  // request; Cancel calls off something already Approved (reached via
  // Awaiting Cancellation, the care-worker-initiated withdrawal of an
  // already-approved holiday). Both require a reason. "Keep holiday" turns
  // down her cancellation request: the holiday stands and goes back to
  // Approved, with an optional reason.
  const openActionDialog = (row, mode) => { setActionRow(row); setActionMode(mode); setActionReason(''); };
  const closeActionDialog = () => { setActionRow(null); setActionReason(''); };
  const handleActionConfirm = () => {
    const reason = actionReason.trim();
    if (actionMode === 'keep') {
      updateRow(actionRow, { status: 'Approved', reason: reason || null, kept: true, actionedBy: CURRENT_OFFICE_USER, actionedAt: new Date() });
      closeActionDialog();
      return;
    }
    if (!reason) return;
    const nextStatus = actionMode === 'decline' ? 'Declined' : 'Cancelled';
    updateRow(actionRow, { status: nextStatus, reason, actionedBy: CURRENT_OFFICE_USER, actionedAt: new Date() });
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
        <SplitViewToggle
          otherUrl="../../mobile/holidays/?screen=holidays"
          selfLabel="Holiday Requests (web)"
          otherLabel="Holidays (mobile app)"
          defaultSelfShare={0.65}
          defaultOpen
          actions={[
            { label: scheme === 'days' ? 'Switch to hours scheme' : 'Switch to days scheme', onClick: () => setDemoScheme(scheme === 'days' ? 'hours' : 'days') },
            { label: 'Reset demo data', onClick: confirmResetLeaveRequests },
          ]}
        />
      </DevToolbar>
      <div className="schedule-page" ref={pageRef}>
      <a href="../../" className="back-link"><BackIcon /> Prototypes</a>
      <SideNav activeItem="schedule" />
      <div className="page-body">
      <TopNav userName={CURRENT_OFFICE_USER} />
      <ScheduleNav active="leave-requests" tabBadges={{ 'leave-requests': actionRequiredCount }} />
      <main className="lr-content">

        <div className="lr-page-header">
          <h1>Holiday Requests</h1>
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
          <div className="lr-sub-row-left">
            {/* Each looks like its status pill in the table, with a count. */}
            {[
              { status: 'Awaiting Approval', count: awaitingApprovalCount },
              { status: 'Awaiting Cancellation', count: awaitingCancellationCount },
            ].map(({ status, count }) => (
              <button
                key={status}
                type="button"
                className={`status-pill ${statusClass(status)} lr-quick-filter${quickStatuses.has(status) ? ' active' : ''}`}
                aria-pressed={quickStatuses.has(status)}
                onClick={() => toggleQuickStatus(status)}
              >
                {status}
                <span className="lr-quick-count">{count}</span>
              </button>
            ))}
            {(widthsDirty || justSavedWidths) && (
              <div className="col-widths-save">
                <button className="col-widths-save-btn" disabled={savingWidths || !widthsDirty} onClick={requestSaveWidths}>
                  {savingWidths ? 'Saving…' : (justSavedWidths && !widthsDirty) ? 'Saved ✓' : 'Save column widths'}
                </button>
                {saveWidthsError && <span className="col-widths-save-error">{saveWidthsError}</span>}
              </div>
            )}
          </div>
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
                  <FilterDropdown items={FILTER_EMPLOYEES} selected={employeeFilter.selected}
                    onApply={(sel, sortDir, nameField) => { setEmployeeFilter({ selected: sel, sortDir, nameField }); setPage(1); }}
                    onClear={() => { setEmployeeFilter(emptyCheckboxFilter()); setPage(1); }}
                    hasNameSort
                    isOpen={openDD === 'employee'} onClose={closeDropdown} anchorEl={anchorRefs.current['employee']}
                  />
                  <ColResizeHandle onDrag={dx => resizeColumn(0, dx)} />
                </th>

                {/* Leave Type — checkbox filter AND a real sort icon */}
                <th className={sort.col === 'leaveTypeLabel' ? 'sorted' : ''}>
                  <ColLabel>Leave Type</ColLabel>
                  <button ref={el => anchorRefs.current['leaveType'] = el}
                    className={`col-icon-btn ${leaveTypeFilter.selected.size ? 'col-icon-btn--active' : ''}`}
                    data-devmode-passthrough="true"
                    onClick={() => openDropdown('leaveType')}>
                    <FilterIcon active={leaveTypeFilter.selected.size > 0} />
                  </button>
                  <button className="col-icon-btn" onClick={() => toggleSort('leaveTypeLabel')}>
                    <SortIcon dir={sort.col === 'leaveTypeLabel' ? sort.dir : null} />
                  </button>
                  <FilterDropdown items={LEAVE_TYPE_FILTER_ITEMS} selected={leaveTypeFilter.selected}
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
                  <td>{row.leaveTypeLabel}</td>
                  <td className="nowrap">{fmtD(row.fromDate)}</td>
                  <td className="nowrap">{fmtD(row.toDate)}</td>
                  <td className="td-num">{fmtAmount(row)}</td>
                  <td><span className={`status-pill ${statusClass(row.status)}`}>{row.status}</span></td>
                  <td className="nowrap">{fmtDTShort(row.submitted)}</td>
                  <td>
                    {row.status === 'Awaiting Approval' && (
                      <span className="lr-actions">
                        {/* All three Awaiting Approval outcomes live in one kebab menu —
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
                    {row.status === 'Approved' && (
                      <span className="lr-actions">
                        <button className="lr-action-btn" onClick={() => openActionDialog(row, 'cancel')}>Cancel</button>
                      </span>
                    )}
                    {row.status === 'Awaiting Cancellation' && (
                      <span className="lr-actions">
                        <RowActionsMenu
                          items={[
                            { label: 'Cancel', onClick: () => openActionDialog(row, 'cancel') },
                            { label: 'Keep holiday', onClick: () => openActionDialog(row, 'keep') },
                          ]}
                        />
                      </span>
                    )}
                    {row.status === 'Withdrawn' && (
                      <span className="lr-cancelled-note">
                        Withdrawn by employee{row.withdrawnAt ? ` on ${fmtD(row.withdrawnAt)}` : ''}
                      </span>
                    )}
                    {(row.status === 'Declined' || row.status === 'Cancelled') && (
                      <Tooltip
                        wrapClassName="lr-cancelled-tooltip-wrap lr-audit-popover"
                        text={
                          <>
                            <div className="lr-popover-reason">{row.reason}</div>
                            <div className="lr-popover-meta">{row.status} by {row.actionedBy} on {fmtDT(row.actionedAt)}</div>
                          </>
                        }
                      >
                        <span className="lr-cancelled-note">
                          {row.status} — {row.reason}
                        </span>
                      </Tooltip>
                    )}
                  </td>
                </tr>
              ))}
              {totalRows === 0 && (
                <tr><td colSpan={8} className="table-empty">No holiday requests match the current filters</td></tr>
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
        // An hours request from the app carries its real times.
        const [startTime, endTime] = approveRow.startTime
          ? [hhmmToDate(approveRow.startTime), hhmmToDate(approveRow.endTime)]
          : leaveTypeTimes(approveRow.leaveType);
        return (
          <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setApproveRow(null) }}>
            <HolidayAbsenceDialog
              employee={{ value: approveRow.employee, label: approveRow.employee }}
              absenceType={{ value: 'holiday', label: 'Holiday' }}
              employeeLocked
              absenceTypeLocked
              startDate={approveRow.fromDate}
              endDate={approveRow.toDate}
              startTime={startTime}
              endTime={endTime}
              showDayBreakdown
              defaultVisitsOption="unassign"
              primaryLabel="Approve holiday"
              confirmLabel="Approve holiday"
              unit={approveRow.unit}
              // Each day starts at what she asked for: a half day's 0.5, or
              // an hours request's time window; the office adjusts any day.
              dayDeductionDefault={approveRow.unit === 'hours'
                ? ({ startTime: st, endTime: et }) => hoursBetweenDates(st, et)
                : (approveRow.leaveType.startsWith('Half Day') ? 0.5 : 1)}
              entitlement={approveRow.linked
                ? { total: entitlement.total, alreadyBooked: entitlement.booked + entitlement.taken }
                : { total: approveRow.unit === 'hours' ? 224 : 28, alreadyBooked: 0 }}
              onClose={() => setApproveRow(null)}
              onConfirm={handleApproveConfirm}
            />
          </div>
        );
      })()}

      {actionRow && (
        <Modal title={ACTION_COPY[actionMode].title} onClose={closeActionDialog}>
          <div className="lr-cancel-summary">
            <div><span className="lr-cancel-label">Leave type</span><span>{actionRow.leaveTypeLabel}</span></div>
            <div><span className="lr-cancel-label">Date from</span><span>{fmtD(actionRow.fromDate)}</span></div>
            <div><span className="lr-cancel-label">Date to</span><span>{fmtD(actionRow.toDate)}</span></div>
            <div><span className="lr-cancel-label">{actionRow.unit === 'hours' ? 'Hours requested' : 'Days requested'}</span><span>{actionRow.amount}</span></div>
          </div>
          <div className="field">
            <label htmlFor="action-reason">{ACTION_COPY[actionMode].label}</label>
            <textarea
              id="action-reason"
              value={actionReason}
              onChange={e => setActionReason(e.target.value)}
              rows={3}
              placeholder={ACTION_COPY[actionMode].placeholder}
            />
          </div>
          <div className="btn-row">
            <button className="round-btn tertiary-btn" onClick={closeActionDialog}>Cancel</button>
            <button className="round-btn primary-btn" disabled={actionMode !== 'keep' && !actionReason.trim()} onClick={handleActionConfirm}>
              {ACTION_COPY[actionMode].confirm}
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
