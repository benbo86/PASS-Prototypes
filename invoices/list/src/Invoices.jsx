import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import FilterDropdown from '../../../Components/FilterDropdown';
import ActionsMenu from '../../../Components/ActionsMenu';
import Pagination from '../../../Components/Pagination';
import AuthGate from '../../../Components/AuthGate';
import ColLabel from '../../../Components/ColLabel';
import ColResizeHandle from '../../../Components/ColResizeHandle';
import useSharedColumnWidths from '../../../Components/useSharedColumnWidths';
import DevToolbar from '../../../Components/DevToolbar'
import DevMode from '../../../Components/DevMode';
import DevComments from '../../../Components/DevComments';
import DevEdit from '../../../Components/DevEdit'
import WireframeToggle from '../../../Components/WireframeToggle'
import AuditCapture from '../../../Components/AuditCapture'
import { fmtDate, DateRangeInput } from '../../../Components/DateRangePicker';
import { INVOICE_RECORDS, FUNDER_NAMES, CUSTOMER_NAMES, PAYMENT_METHODS, DELIVERY_METHODS, STATUSES, PAID_STATES, fmtGBP } from './data';
import samplePdfUrl from './sample-invoice.pdf';

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
const DocumentIcon = () => (
  <svg width="20" height="20" viewBox="-5.07 -3 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M8.10373 0C8.60602 0 9.08992 0.189001 9.45925 0.529434L13.22 3.99599C13.6308 4.37464 13.8645 4.90786 13.8645 5.46655V14.6896C13.8645 16.5169 12.3773 17.9986 10.5417 18H3.32534C1.48881 18 0 16.5179 0 14.6896V3.31042C0 1.48212 1.48881 0 3.32534 0H8.10373ZM7.94685 1.98153H3.41796C2.58954 1.98153 1.91796 2.6531 1.91796 3.48153V14.5127C1.91796 15.3411 2.58954 16.0127 3.41796 16.0127H10.4075C11.2359 16.0127 11.9075 15.3411 11.9075 14.5127V6.06202H9.73742C8.74852 6.06202 7.94685 5.26395 7.94685 4.27948V1.98153ZM6.88131 10.5C7.43359 10.5 7.88131 10.9477 7.88131 11.5C7.88131 12.0523 7.43359 12.5 6.88131 12.5H3.88131C3.32902 12.5 2.88131 12.0523 2.88131 11.5C2.88131 10.9477 3.32902 10.5 3.88131 10.5H6.88131ZM9.88131 7.5C10.4336 7.5 10.8813 7.94772 10.8813 8.5C10.8813 9.05228 10.4336 9.5 9.88131 9.5H3.88131C3.32902 9.5 2.88131 9.05228 2.88131 8.5C2.88131 7.94772 3.32902 7.5 3.88131 7.5H9.88131Z"/>
  </svg>
);

// ─── Helpers ────────────────────────────────────────────────────────────────

const toDateSortKey = (ddmmyyyy) => {
  const [d, m, y] = ddmmyyyy.split('/');
  return `${y}${m}${d}`;
};

const statusClass = s => s === 'Approved' ? 'inv-status-approved' : s === 'Sent' ? 'inv-status-sent' : 'inv-status-to-approve';
const paidClass = p => p === 'Paid' ? 'inv-paid-yes' : 'inv-paid-no';

// Starting proportions only — converted to percentages inside
// useSharedColumnWidths so the table always renders at exactly the
// container's own width (table-layout:fixed + .data-table's existing
// width:100%), never wider. Dragging a resize handle then trades
// percentage-points between two neighbouring columns, so the total stays
// at 100% no matter how the user resizes things.
const RAW_COL_WIDTHS = [100, 90, 230, 140, 90, 90, 130, 110, 120, 110, 110, 110, 110, 90, 48, 60];

function downloadFile(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function csvEscape(v) {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const DATE_COLS = ['invoiceDate', 'start', 'end'];
const NUM_COLS  = ['expectedCharge', 'charge', 'expenses', 'totalCharge'];

const emptyCheckboxFilter = () => ({ selected: new Set(), sortDir: 'asc', nameField: 'first' });

// ─── Invoices ───────────────────────────────────────────────────────────────

export default function Invoices() {
  const pageRef = useRef(null);
  const [rows, setRows] = useState(INVOICE_RECORDS);

  const [dateRange, setDateRange] = useState([new Date(2026, 6, 1), new Date(2026, 6, 31)]);
  const [hoverDate, setHoverDate] = useState(null);

  const [invNoFilter, setInvNoFilter]     = useState({ search: '' });
  const [funderFilter, setFunderFilter]   = useState(emptyCheckboxFilter());
  const [custFilter, setCustFilter]       = useState(emptyCheckboxFilter());
  const [paymentFilter, setPaymentFilter] = useState(emptyCheckboxFilter());
  const [deliveryFilter, setDeliveryFilter] = useState(emptyCheckboxFilter());
  const [statusFilter, setStatusFilter]   = useState(emptyCheckboxFilter());
  const [paidFilter, setPaidFilter]       = useState(emptyCheckboxFilter());

  const [sort, setSort]     = useState({ col: null, dir: 'asc' });
  const [openDD, setOpenDD] = useState(null);
  const anchorRefs           = useRef({});
  const [page, setPage]             = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [previewRow, setPreviewRow] = useState(null);

  const {
    tableRef, colWidths, resizeColumn,
    widthsDirty, savingWidths, justSavedWidths, saveWidthsError, requestSaveWidths,
    gateStep, passwordInput, setPasswordInput, passwordError, signingIn,
    nameInput, setNameInput, submitPassword, submitName, closeGate,
  } = useSharedColumnWidths({
    rawWidths: RAW_COL_WIDTHS,
    storageKey: 'invoices-list-col-widths',
    prototypeId: window.location.pathname,
  });

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
    setInvNoFilter({ search: '' });
    setFunderFilter(emptyCheckboxFilter());
    setCustFilter(emptyCheckboxFilter());
    setPaymentFilter(emptyCheckboxFilter());
    setDeliveryFilter(emptyCheckboxFilter());
    setStatusFilter(emptyCheckboxFilter());
    setPaidFilter(emptyCheckboxFilter());
    setSort({ col: null, dir: 'asc' });
    setPage(1);
  };

  const filtered = useMemo(() => {
    let r = rows;
    if (invNoFilter.search) r = r.filter(rec => rec.invoiceNo.toLowerCase().includes(invNoFilter.search.toLowerCase()));
    if (funderFilter.selected.size) r = r.filter(rec => funderFilter.selected.has(rec.funder));
    if (custFilter.selected.size) r = r.filter(rec => custFilter.selected.has(rec.customer));
    if (paymentFilter.selected.size) r = r.filter(rec => paymentFilter.selected.has(rec.paymentMethod));
    if (deliveryFilter.selected.size) r = r.filter(rec => deliveryFilter.selected.has(rec.deliveryMethod));
    if (statusFilter.selected.size) r = r.filter(rec => statusFilter.selected.has(rec.status));
    if (paidFilter.selected.size) r = r.filter(rec => paidFilter.selected.has(rec.paid));
    return r;
  }, [rows, invNoFilter, funderFilter, custFilter, paymentFilter, deliveryFilter, statusFilter, paidFilter]);

  const sorted = useMemo(() => {
    const r = [...filtered];
    if (!sort.col) {
      return r.sort((a, b) => toDateSortKey(a.invoiceDate).localeCompare(toDateSortKey(b.invoiceDate)));
    }
    return r.sort((a, b) => {
      if (DATE_COLS.includes(sort.col)) {
        const av = toDateSortKey(a[sort.col]), bv = toDateSortKey(b[sort.col]);
        return sort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      if (NUM_COLS.includes(sort.col)) {
        return sort.dir === 'asc' ? a[sort.col] - b[sort.col] : b[sort.col] - a[sort.col];
      }
      return 0;
    });
  }, [filtered, sort]);

  useEffect(() => { setPage(1); }, [invNoFilter, funderFilter, custFilter, paymentFilter, deliveryFilter, statusFilter, paidFilter]);

  const totalRows  = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const safePage   = Math.min(page, totalPages);
  const pageRows   = sorted.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);
  const showStart  = totalRows === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const showEnd    = Math.min(safePage * rowsPerPage, totalRows);
  const anyFilter  = !!(invNoFilter.search || funderFilter.selected.size || custFilter.selected.size ||
    paymentFilter.selected.size || deliveryFilter.selected.size || statusFilter.selected.size || paidFilter.selected.size);

  // ── Selection ──────────────────────────────────────────────────────────
  const toggleSelectRow = id => setSelectedIds(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const allPageSelected = pageRows.length > 0 && pageRows.every(r => selectedIds.has(r.id));

  const toggleSelectPage = () => setSelectedIds(prev => {
    const next = new Set(prev);
    if (allPageSelected) pageRows.forEach(r => next.delete(r.id));
    else pageRows.forEach(r => next.add(r.id));
    return next;
  });

  const selectAllPage     = () => setSelectedIds(prev => { const next = new Set(prev); pageRows.forEach(r => next.add(r.id)); return next; });
  const selectAllFiltered = () => setSelectedIds(new Set(sorted.map(r => r.id)));
  const clearSelection    = () => setSelectedIds(new Set());

  // ── Bulk actions ────────────────────────────────────────────────────────
  const selectedRows = useMemo(() => rows.filter(r => selectedIds.has(r.id)), [rows, selectedIds]);
  const allSelectedApproved = selectedRows.length > 0 && selectedRows.every(r => r.status === 'Approved');

  const mutateSelected = patch => setRows(prev => prev.map(r => selectedIds.has(r.id) ? { ...r, ...patch(r) } : r));

  const handleDownloadPdf = () => {
    selectedRows.forEach(r => downloadFile(samplePdfUrl, `${r.invoiceNo}.pdf`));
  };

  const handleDownloadCsv = () => {
    const header = ['Invoice no', 'Invoice date', 'Funder', 'Customer', 'Start', 'End', 'Payment method', 'Delivery method', 'Expected charge', 'Charge', 'Expenses', 'Total charge', 'Status', 'Paid'];
    const csvRows = selectedRows.map(r => [
      r.invoiceNo, r.invoiceDate, r.funder, r.customer, r.start, r.end, r.paymentMethod, r.deliveryMethod,
      r.expectedCharge.toFixed(2), r.charge.toFixed(2), r.expenses.toFixed(2), r.totalCharge.toFixed(2), r.status, r.paid,
    ]);
    const csv = [header, ...csvRows].map(row => row.map(csvEscape).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    downloadFile(url, 'invoices-export.csv');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const disabledReason = 'Only available once every selected invoice is Approved';
  const bulkActionItems = [
    { label: 'Approve',        onClick: () => mutateSelected(() => ({ status: 'Approved' })) },
    { label: 'Unapprove',      onClick: () => mutateSelected(() => ({ status: 'To approve' })) },
    { label: 'Send',           onClick: () => mutateSelected(() => ({ status: 'Sent' })) },
    { label: 'Unsend',         onClick: () => mutateSelected(() => ({ status: 'Approved' })) },
    { label: 'Mark as Paid',   onClick: () => mutateSelected(() => ({ paid: 'Paid' })) },
    { label: 'Mark as Unpaid', onClick: () => mutateSelected(() => ({ paid: 'Unpaid' })) },
    { label: 'Download PDF', onClick: handleDownloadPdf, disabled: !allSelectedApproved, disabledReason },
    { label: 'Download CSV', onClick: handleDownloadCsv, disabled: !allSelectedApproved, disabledReason },
  ];

  const selectItems = [
    { label: 'Select all (this page)', onClick: selectAllPage },
    { label: 'Select all (all matching)', onClick: selectAllFiltered },
    { label: 'Clear selection', onClick: clearSelection, disabled: selectedIds.size === 0 },
  ];

  return (
    <>
      <DevToolbar>
        <DevEdit containerRef={pageRef} prototypeId={window.location.pathname} />
        <DevMode containerRef={pageRef} />
        <DevComments containerRef={pageRef} prototypeId={window.location.pathname} />
        <WireframeToggle />
        <AuditCapture containerRef={pageRef} />
      </DevToolbar>
      <div className="inv-page" ref={pageRef}>
      <a href="../../" className={`back-link${previewRow ? ' inv-back-link--elevated' : ''}`}><BackIcon /> Prototypes</a>
      <div className="inv-body">

        <div className="inv-page-header">
          <h1>Invoices</h1>
          <div className="inv-date-nav">
            <button className="inv-nav-arrow" onClick={() => navigateRange(-1)}><ChevronLeft /></button>
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
              popperPlacement="bottom" portalId="inv-datepicker-portal"
            />
            <button className="inv-nav-arrow" onClick={() => navigateRange(1)}><ChevronRight /></button>
          </div>
          <div className="inv-header-controls">
            <button className="round-btn primary-btn">Generate</button>
            <ActionsMenu
              items={selectItems}
              trigger={({ toggle }) => (
                <button className="round-btn secondary-btn btn-icon-right" onClick={toggle}>Select <ChevronDown size={24} /></button>
              )}
            />
            <ActionsMenu
              disabled={selectedIds.size === 0}
              items={bulkActionItems}
              trigger={({ toggle }) => (
                <button className="round-btn tertiary-btn btn-icon-left btn-icon-right" disabled={selectedIds.size === 0} onClick={toggle}>
                  <SettingsIcon size={20} /> Actions <ChevronDown size={24} />
                </button>
              )}
            />
          </div>
        </div>

        <div className="inv-sub-row">
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
          <button className="inv-nav-arrow pag-inline" disabled={safePage <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}><ChevronLeft /></button>
          <button className="inv-nav-arrow pag-inline" disabled={safePage >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}><ChevronRight /></button>
        </div>

        <div className="table-wrap">
          <table className="data-table resizable-table" ref={tableRef}>
            <colgroup>
              {colWidths.map((w, i) => <col key={i} style={{ width: `${w}%` }} />)}
            </colgroup>
            <thead>
              <tr>
                {/* Invoice no — search-only filter */}
                <th>
                  <ColLabel>Invoice no</ColLabel>
                  <button ref={el => anchorRefs.current['invNo'] = el}
                    className={`col-icon-btn ${invNoFilter.search ? 'col-icon-btn--active' : ''}`}
                    data-devmode-passthrough="true"
                    onClick={() => openDropdown('invNo')}>
                    <FilterIcon active={!!invNoFilter.search} />
                  </button>
                  <FilterDropdown items={[]} selected={new Set()}
                    onApply={(_, __, ___, search) => { setInvNoFilter({ search: search || '' }); setPage(1); }}
                    onClear={() => { setInvNoFilter({ search: '' }); setPage(1); }}
                    searchOnly hasSort={false}
                    isOpen={openDD === 'invNo'} onClose={closeDropdown} anchorEl={anchorRefs.current['invNo']}
                  />
                  <ColResizeHandle onDrag={dx => resizeColumn(0, dx)} />
                </th>

                {/* Invoice date — sort */}
                <th className={sort.col === 'invoiceDate' ? 'sorted' : ''}>
                  <ColLabel>Invoice date</ColLabel>
                  <button className="col-icon-btn" onClick={() => toggleSort('invoiceDate')}><SortIcon dir={sort.col === 'invoiceDate' ? sort.dir : null} /></button>
                  <ColResizeHandle onDrag={dx => resizeColumn(1, dx)} />
                </th>

                {/* Funder — checkbox filter */}
                <th>
                  <ColLabel>Funder</ColLabel>
                  <button ref={el => anchorRefs.current['funder'] = el}
                    className={`col-icon-btn ${funderFilter.selected.size ? 'col-icon-btn--active' : ''}`}
                    data-devmode-passthrough="true"
                    onClick={() => openDropdown('funder')}>
                    <FilterIcon active={funderFilter.selected.size > 0} />
                  </button>
                  <FilterDropdown items={FUNDER_NAMES} selected={funderFilter.selected}
                    onApply={(sel, sortDir, nameField) => { setFunderFilter({ selected: sel, sortDir, nameField }); setPage(1); }}
                    onClear={() => { setFunderFilter(emptyCheckboxFilter()); setPage(1); }}
                    isOpen={openDD === 'funder'} onClose={closeDropdown} anchorEl={anchorRefs.current['funder']}
                  />
                  <ColResizeHandle onDrag={dx => resizeColumn(2, dx)} />
                </th>

                {/* Customer — checkbox filter, name sort */}
                <th>
                  <ColLabel>Customer</ColLabel>
                  <button ref={el => anchorRefs.current['cust'] = el}
                    className={`col-icon-btn ${custFilter.selected.size ? 'col-icon-btn--active' : ''}`}
                    data-devmode-passthrough="true"
                    onClick={() => openDropdown('cust')}>
                    <FilterIcon active={custFilter.selected.size > 0} />
                  </button>
                  <FilterDropdown items={CUSTOMER_NAMES} selected={custFilter.selected}
                    onApply={(sel, sortDir, nameField) => { setCustFilter({ selected: sel, sortDir, nameField }); setPage(1); }}
                    onClear={() => { setCustFilter(emptyCheckboxFilter()); setPage(1); }}
                    hasNameSort
                    isOpen={openDD === 'cust'} onClose={closeDropdown} anchorEl={anchorRefs.current['cust']}
                  />
                  <ColResizeHandle onDrag={dx => resizeColumn(3, dx)} />
                </th>

                {/* Start — sort */}
                <th className={sort.col === 'start' ? 'sorted' : ''}>
                  <ColLabel>Start</ColLabel>
                  <button className="col-icon-btn" onClick={() => toggleSort('start')}><SortIcon dir={sort.col === 'start' ? sort.dir : null} /></button>
                  <ColResizeHandle onDrag={dx => resizeColumn(4, dx)} />
                </th>

                {/* End — sort */}
                <th className={sort.col === 'end' ? 'sorted' : ''}>
                  <ColLabel>End</ColLabel>
                  <button className="col-icon-btn" onClick={() => toggleSort('end')}><SortIcon dir={sort.col === 'end' ? sort.dir : null} /></button>
                  <ColResizeHandle onDrag={dx => resizeColumn(5, dx)} />
                </th>

                {/* Payment method — checkbox filter */}
                <th>
                  <ColLabel>Payment method</ColLabel>
                  <button ref={el => anchorRefs.current['payment'] = el}
                    className={`col-icon-btn ${paymentFilter.selected.size ? 'col-icon-btn--active' : ''}`}
                    data-devmode-passthrough="true"
                    onClick={() => openDropdown('payment')}>
                    <FilterIcon active={paymentFilter.selected.size > 0} />
                  </button>
                  <FilterDropdown items={PAYMENT_METHODS} selected={paymentFilter.selected}
                    onApply={(sel, sortDir, nameField) => { setPaymentFilter({ selected: sel, sortDir, nameField }); setPage(1); }}
                    onClear={() => { setPaymentFilter(emptyCheckboxFilter()); setPage(1); }}
                    isOpen={openDD === 'payment'} onClose={closeDropdown} anchorEl={anchorRefs.current['payment']}
                  />
                  <ColResizeHandle onDrag={dx => resizeColumn(6, dx)} />
                </th>

                {/* Delivery method — checkbox filter */}
                <th>
                  <ColLabel>Delivery method</ColLabel>
                  <button ref={el => anchorRefs.current['delivery'] = el}
                    className={`col-icon-btn ${deliveryFilter.selected.size ? 'col-icon-btn--active' : ''}`}
                    data-devmode-passthrough="true"
                    onClick={() => openDropdown('delivery')}>
                    <FilterIcon active={deliveryFilter.selected.size > 0} />
                  </button>
                  <FilterDropdown items={DELIVERY_METHODS} selected={deliveryFilter.selected}
                    onApply={(sel, sortDir, nameField) => { setDeliveryFilter({ selected: sel, sortDir, nameField }); setPage(1); }}
                    onClear={() => { setDeliveryFilter(emptyCheckboxFilter()); setPage(1); }}
                    isOpen={openDD === 'delivery'} onClose={closeDropdown} anchorEl={anchorRefs.current['delivery']}
                  />
                  <ColResizeHandle onDrag={dx => resizeColumn(7, dx)} />
                </th>

                {/* Expected charge — sort */}
                <th className={`th-num ${sort.col === 'expectedCharge' ? 'sorted' : ''}`}>
                  <ColLabel>Expected charge</ColLabel>
                  <button className="col-icon-btn" onClick={() => toggleSort('expectedCharge')}><SortIcon dir={sort.col === 'expectedCharge' ? sort.dir : null} /></button>
                  <ColResizeHandle onDrag={dx => resizeColumn(8, dx)} />
                </th>

                {/* Charge — sort */}
                <th className={`th-num ${sort.col === 'charge' ? 'sorted' : ''}`}>
                  <ColLabel>Charge</ColLabel>
                  <button className="col-icon-btn" onClick={() => toggleSort('charge')}><SortIcon dir={sort.col === 'charge' ? sort.dir : null} /></button>
                  <ColResizeHandle onDrag={dx => resizeColumn(9, dx)} />
                </th>

                {/* Expenses — sort */}
                <th className={`th-num ${sort.col === 'expenses' ? 'sorted' : ''}`}>
                  <ColLabel>Expenses</ColLabel>
                  <button className="col-icon-btn" onClick={() => toggleSort('expenses')}><SortIcon dir={sort.col === 'expenses' ? sort.dir : null} /></button>
                  <ColResizeHandle onDrag={dx => resizeColumn(10, dx)} />
                </th>

                {/* Total charge — sort */}
                <th className={`th-num ${sort.col === 'totalCharge' ? 'sorted' : ''}`}>
                  <ColLabel>Total charge</ColLabel>
                  <button className="col-icon-btn" onClick={() => toggleSort('totalCharge')}><SortIcon dir={sort.col === 'totalCharge' ? sort.dir : null} /></button>
                  <ColResizeHandle onDrag={dx => resizeColumn(11, dx)} />
                </th>

                {/* Status — checkbox filter */}
                <th>
                  <ColLabel>Status</ColLabel>
                  <button ref={el => anchorRefs.current['status'] = el}
                    className={`col-icon-btn ${statusFilter.selected.size ? 'col-icon-btn--active' : ''}`}
                    data-devmode-passthrough="true"
                    onClick={() => openDropdown('status')}>
                    <FilterIcon active={statusFilter.selected.size > 0} />
                  </button>
                  <FilterDropdown items={STATUSES} selected={statusFilter.selected}
                    onApply={(sel, sortDir, nameField) => { setStatusFilter({ selected: sel, sortDir, nameField }); setPage(1); }}
                    onClear={() => { setStatusFilter(emptyCheckboxFilter()); setPage(1); }}
                    isOpen={openDD === 'status'} onClose={closeDropdown} anchorEl={anchorRefs.current['status']}
                  />
                  <ColResizeHandle onDrag={dx => resizeColumn(12, dx)} />
                </th>

                {/* Paid — checkbox filter */}
                <th>
                  <ColLabel>Paid</ColLabel>
                  <button ref={el => anchorRefs.current['paid'] = el}
                    className={`col-icon-btn ${paidFilter.selected.size ? 'col-icon-btn--active' : ''}`}
                    data-devmode-passthrough="true"
                    onClick={() => openDropdown('paid')}>
                    <FilterIcon active={paidFilter.selected.size > 0} />
                  </button>
                  <FilterDropdown items={PAID_STATES} selected={paidFilter.selected}
                    onApply={(sel, sortDir, nameField) => { setPaidFilter({ selected: sel, sortDir, nameField }); setPage(1); }}
                    onClear={() => { setPaidFilter(emptyCheckboxFilter()); setPage(1); }}
                    isOpen={openDD === 'paid'} onClose={closeDropdown} anchorEl={anchorRefs.current['paid']}
                  />
                  <ColResizeHandle onDrag={dx => resizeColumn(13, dx)} />
                </th>

                <th className="icon-col">
                  <ColResizeHandle onDrag={dx => resizeColumn(14, dx)} />
                </th>

                <th className="check-col">
                  <div className="header-check">
                    <label className="checkbox-wrap">
                      <input type="checkbox" checked={allPageSelected} onChange={toggleSelectPage} />
                      <span className="checkbox-box" />
                    </label>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map(row => (
                <tr key={row.id}>
                  <td className="td-ref" title={row.invoiceNo}>{row.invoiceNo}</td>
                  <td className="nowrap">{row.invoiceDate}</td>
                  <td title={row.funder}>{row.funder}</td>
                  <td className="td-name" title={row.customer}>{row.customer}</td>
                  <td className="nowrap">{row.start}</td>
                  <td className="nowrap">{row.end}</td>
                  <td title={row.paymentMethod}>{row.paymentMethod}</td>
                  <td title={row.deliveryMethod}>{row.deliveryMethod}</td>
                  <td className="td-num">{fmtGBP(row.expectedCharge)}</td>
                  <td className="td-num">{fmtGBP(row.charge)}</td>
                  <td className="td-num">{row.expenses > 0 ? fmtGBP(row.expenses) : '—'}</td>
                  <td className="td-num">{fmtGBP(row.totalCharge)}</td>
                  <td><span className={`status-pill ${statusClass(row.status)}`}>{row.status}</span></td>
                  <td><span className={`status-pill ${paidClass(row.paid)}`}>{row.paid}</span></td>
                  <td className="icon-col">
                    <button className="edit-icon-btn" aria-label={`Preview invoice ${row.invoiceNo}`} onClick={() => setPreviewRow(row)}>
                      <DocumentIcon />
                    </button>
                  </td>
                  <td className="check-col">
                    <label className="checkbox-wrap">
                      <input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleSelectRow(row.id)} />
                      <span className="checkbox-box" />
                    </label>
                  </td>
                </tr>
              ))}
              {totalRows === 0 && (
                <tr><td colSpan={16} className="table-empty">No records match the current filters</td></tr>
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

      {previewRow && (
        <div className="inv-preview-overlay" onClick={e => { if (e.target === e.currentTarget) setPreviewRow(null); }}>
          <div className="inv-preview-panel">
            <div className="inv-preview-header">
              <h2>Invoice {previewRow.invoiceNo}</h2>
              <button className="inv-preview-close" aria-label="Close preview" onClick={() => setPreviewRow(null)}>
                <CloseIcon />
              </button>
            </div>
            {/* #toolbar=0&navpanes=0&scrollbar=0 is a browser-native-PDF-viewer
                convention (Chrome/Firefox both honour it) — a best-effort hint
                via the URL, not something the page can enforce; it hides the
                built-in toolbar/sidebar/scrollbar chrome so only the document
                itself shows inside the panel. */}
            <iframe className="inv-preview-iframe" src={`${samplePdfUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={`Invoice ${previewRow.invoiceNo} preview`} />
          </div>
        </div>
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
      </div>
    </>
  );
}
