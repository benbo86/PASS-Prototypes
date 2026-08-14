import { useState, useRef, useEffect } from 'react'
import StatusBar from '../../../Components/StatusBar'
import ScreenSlider from '../../../Components/ScreenSlider'
import DevToolbar from '../../../Components/DevToolbar'
import DevMode from '../../../Components/DevMode'
import DevComments from '../../../Components/DevComments'
import DevEdit from '../../../Components/DevEdit'
import WireframeToggle from '../../../Components/WireframeToggle'
import AuditCapture from '../../../Components/AuditCapture'
import {
  CUSTOMER, ASSESSMENTS, ASSESSMENT_FOLDERS, OPTIONAL_ASSESSMENT_TEMPLATES,
  OTHER_DOCUMENTS, OTHER_DOCUMENT_FOLDERS,
  nextAssessmentId, nextOtherDocId, nextFolderId,
} from './customerDocumentsData'

// ─── Icons ───────────────────────────────────────────────────

const ArrowLeftIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.71969 12.6255L4.73999 12.6499C4.74414 12.6548 4.74834 12.6596 4.75259 12.6644L9.75259 18.2894C10.1195 18.7022 10.7516 18.7393 11.1644 18.3724C11.5771 18.0055 11.6143 17.3734 11.2474 16.9606L7.727 13L18.5 13C19.0523 13 19.5 12.5523 19.5 12C19.5 11.4477 19.0523 11 18.5 11L7.727 11L11.2474 7.03937C11.5861 6.65834 11.5805 6.09046 11.2529 5.71676L11.1644 5.6276C10.7516 5.26068 10.1195 5.29786 9.75259 5.71065L4.75259 11.3356L4.7402 11.3498C4.73323 11.358 4.72639 11.3662 4.71969 11.3746L4.75259 11.3356C4.72265 11.3693 4.69538 11.4045 4.67076 11.441C4.65284 11.4675 4.63629 11.4947 4.62104 11.5227C4.60922 11.5452 4.59534 11.5722 4.5711 11.629C4.56169 11.6537 4.52179 11.7614 4.5 12C4.5 12.1218 4.52179 12.2386 4.56167 12.3465C4.5711 12.3998 4.59534 12.4278 4.62098 12.4771C4.63629 12.5053 4.65284 12.5325 4.67061 12.5589L4.71969 12.6255Z"/>
  </svg>
)
const ChevronLeftIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)
const ChevronRightIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
  </svg>
)
const CloseIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
)
const PlusIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
)
const EditActionIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>
)
const DeleteActionIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
  </svg>
)
const FolderIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
  </svg>
)
const FolderMinusIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <path d="M14.9999 23.3333H24.9999M36.6666 31.6667C36.6666 32.5507 36.3154 33.3986 35.6903 34.0237C35.0652 34.6488 34.2173 35 33.3333 35H6.66659C5.78253 35 4.93468 34.6488 4.30956 34.0237C3.68444 33.3986 3.33325 32.5507 3.33325 31.6667V8.33333C3.33325 7.44928 3.68444 6.60143 4.30956 5.97631C4.93468 5.35119 5.78253 5 6.66659 5H14.9999L18.3333 10H33.3333C34.2173 10 35.0652 10.3512 35.6903 10.9763C36.3154 11.6014 36.6666 12.4493 36.6666 13.3333V31.6667Z" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const DocumentIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="-5.07 -3 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M8.10373 0C8.60602 0 9.08992 0.189001 9.45925 0.529434L13.22 3.99599C13.6308 4.37464 13.8645 4.90786 13.8645 5.46655V14.6896C13.8645 16.5169 12.3773 17.9986 10.5417 18H3.32534C1.48881 18 0 16.5179 0 14.6896V3.31042C0 1.48212 1.48881 0 3.32534 0H8.10373ZM7.94685 1.98153H3.41796C2.58954 1.98153 1.91796 2.6531 1.91796 3.48153V14.5127C1.91796 15.3411 2.58954 16.0127 3.41796 16.0127H10.4075C11.2359 16.0127 11.9075 15.3411 11.9075 14.5127V6.06202H9.73742C8.74852 6.06202 7.94685 5.26395 7.94685 4.27948V1.98153ZM6.88131 10.5C7.43359 10.5 7.88131 10.9477 7.88131 11.5C7.88131 12.0523 7.43359 12.5 6.88131 12.5H3.88131C3.32902 12.5 2.88131 12.0523 2.88131 11.5C2.88131 10.9477 3.32902 10.5 3.88131 10.5H6.88131ZM9.88131 7.5C10.4336 7.5 10.8813 7.94772 10.8813 8.5C10.8813 9.05228 10.4336 9.5 9.88131 9.5H3.88131C3.32902 9.5 2.88131 9.05228 2.88131 8.5C2.88131 7.94772 3.32902 7.5 3.88131 7.5H9.88131Z"/>
  </svg>
)
const KeyIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
  </svg>
)
const GridMenuIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M4 8H8V4H4V8ZM10 20H14V16H10V20ZM4 20H8V16H4V20ZM4 14H8V10H4V14ZM10 14H14V10H10V14ZM16 4V8H20V4H16ZM10 8H14V4H10V8ZM16 14H20V10H16V14ZM16 20H20V16H16V20Z"/>
  </svg>
)
// Copied verbatim from Icons/Search.svg, Icons/Filters.svg, Icons/Filter
// Active.svg — literal fill swapped for currentColor per this repo's icon-
// copy-fidelity convention. Filters/FilterActive swap based on whether any
// filter is currently applied (established convention already used by
// timesheets/gross-pay-advice's own FilterDropdown).
const SearchIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M10.8488372,18.6872093 C12.627907,18.6872093 14.2813953,18.0802326 15.6,17.0755814 L19.2209302,20.6965116 C19.4302326,20.905814 19.7023256,21.0104651 19.9534884,21.0104651 C20.2046512,21.0104651 20.4976744,20.905814 20.6860465,20.6965116 C21.1046512,20.277907 21.1046512,19.6290698 20.6860465,19.2104651 L17.0860465,15.5895349 C18.0906977,14.2709302 18.6976744,12.6174419 18.6976744,10.8383721 C18.6976744,6.50581395 15.1813953,2.98953488 10.8488372,2.98953488 C6.51627907,2.98953488 3,6.50581395 3,10.8383721 C3,15.1709302 6.51627907,18.6872093 10.8488372,18.6872093 Z M10.8488372,5.08255814 C14.0093023,5.08255814 16.6046512,7.65697674 16.6046512,10.8383721 C16.6046512,14.0197674 14.0093023,16.594186 10.8488372,16.594186 C7.68837209,16.594186 5.09302326,13.9988372 5.09302326,10.8383721 C5.09302326,7.67790698 7.66744186,5.08255814 10.8488372,5.08255814 Z" fill="currentColor"/>
  </svg>
)
const FiltersIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M15,17 C15,16.4477153 14.5522847,16 14,16 L10,16 C9.44771525,16 9,16.4477153 9,17 C9,17.5522847 9.44771525,18 10,18 L14,18 C14.5522847,18 15,17.5522847 15,17 Z M18,12 C18,11.4477153 17.5522847,11 17,11 L7,11 C6.44771525,11 6,11.4477153 6,12 C6,12.5522847 6.44771525,13 7,13 L17,13 C17.5522847,13 18,12.5522847 18,12 Z M4,8 L20,8 C20.5522847,8 21,7.55228475 21,7 C21,6.44771525 20.5522847,6 20,6 L4,6 C3.44771525,6 3,6.44771525 3,7 C3,7.55228475 3.44771525,8 4,8 Z" fill="currentColor"/>
  </svg>
)
const FilterActiveIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M10.5,15.7658125 L10.5,12 L10.5,12 L6.75103413,7.83448237 C6.56630462,7.62922736 6.58294383,7.31308244 6.78819884,7.12835293 C6.88001119,7.04572181 6.99916031,7 7.1226812,7 L16.8773188,7 C17.1534612,7 17.3773188,7.22385763 17.3773188,7.5 C17.3773188,7.62352089 17.331597,7.74267001 17.2489659,7.83448237 L13.5,12 L13.5,12 L13.5,17.4324792 C13.5,17.7086216 13.2761424,17.9324792 13,17.9324792 C12.8830317,17.9324792 12.7697653,17.8914711 12.6799078,17.8165898 L10.6799078,16.1499232 C10.5659115,16.0549263 10.5,15.9142024 10.5,15.7658125 Z" fill="currentColor"/>
  </svg>
)

// Uploaded via the Mobile Icons library's "Upload icon" feature (Icons/
// Mobile Uploads/Used across multiple mobile screens/), copied in verbatim
// per this repo's icon-copy-fidelity convention — colours are baked into
// these files (green/amber/red), not currentColor, so StatusIcon just
// picks the right one rather than colouring a shape itself.
const DocumentCompleteIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="11" fill="#21A621" stroke="#21A621" strokeWidth="2" />
    <path d="M8 12.1732L10.6095 15L16 9" stroke="white" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const DocumentIncompleteIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="11" fill="#E09600" stroke="#E09600" strokeWidth="2" />
    <path d="M16.2129 7.7866C16.5871 8.16077 16.5877 8.76785 16.2136 9.14212L13.3555 12.0002L16.2129 14.8577C16.5871 15.2318 16.5877 15.8389 16.2136 16.2132C15.8394 16.5874 15.2317 16.5874 14.8574 16.2132L12 13.3558L9.14257 16.2132C8.76832 16.5874 8.16061 16.5874 7.78636 16.2132C7.41234 15.8389 7.41288 15.2318 7.78705 14.8577L10.6445 12.0002L7.78636 9.14212C7.41234 8.76785 7.41288 8.16077 7.78705 7.7866C8.16125 7.41265 8.76769 7.41265 9.14188 7.7866L12 10.6447L14.8581 7.7866C15.2323 7.41265 15.8388 7.41265 16.2129 7.7866Z" fill="white" stroke="white" strokeWidth="0.25" />
  </svg>
)
const DocumentNotStartedIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="11" fill="#E61C1C" stroke="#E61C1C" strokeWidth="2" />
    <path d="M16.2129 7.78617C16.5871 8.16035 16.5877 8.76742 16.2136 9.14169L13.3555 11.9998L16.2129 14.8572C16.5871 15.2314 16.5877 15.8385 16.2136 16.2128C15.8394 16.587 15.2317 16.587 14.8574 16.2128L12 13.3553L9.14257 16.2128C8.76832 16.587 8.16061 16.587 7.78636 16.2128C7.41234 15.8385 7.41288 15.2314 7.78705 14.8572L10.6445 11.9998L7.78636 9.14169C7.41234 8.76742 7.41288 8.16035 7.78705 7.78617C8.16125 7.41223 8.76769 7.41223 9.14188 7.78617L12 10.6443L14.8581 7.78617C15.2323 7.41223 15.8388 7.41223 16.2129 7.78617Z" fill="white" stroke="white" strokeWidth="0.25" />
  </svg>
)

const STATUS_ICONS = {
  complete: DocumentCompleteIcon,
  partial: DocumentIncompleteIcon,
  notStarted: DocumentNotStartedIcon,
}

function StatusIcon({ status, size = 24 }) {
  const Icon = STATUS_ICONS[status] || DocumentNotStartedIcon
  return <Icon size={size} />
}

// ─── Helpers ─────────────────────────────────────────────────

const initials = (name) => name.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase()

// ─── Shared: search & filter (Assessments / Other Documents) ────────
// Date ranges are cumulative windows counted back from today (real
// wall-clock date) — "Last 30 days" includes anything within the last 7
// too. An item with no date (not yet completed) only ever matches "All
// time", never a specific range — there's no completion date to compare it
// against.
const DATE_RANGES = [
  { key: 'all', label: 'All time' },
  { key: '7d',  label: 'Last 7 days',   days: 7 },
  { key: '30d', label: 'Last 30 days',  days: 30 },
  { key: '3m',  label: 'Last 3 months', days: 90 },
  { key: '6m',  label: 'Last 6 months', days: 182 },
  { key: '1y',  label: 'Last year',     days: 365 },
]

const STATUS_FILTER_OPTIONS = [
  { key: 'complete',   label: 'Complete' },
  { key: 'partial',    label: 'Partially complete' },
  { key: 'notStarted', label: 'Outstanding' },
]

function parseDMY(str) {
  if (!str) return null
  const [d, m, y] = str.split('/').map(Number)
  return new Date(y, m - 1, d)
}

function isWithinDays(date, days, now) {
  if (!date) return false
  const diffDays = (now - date) / (1000 * 60 * 60 * 24)
  return diffDays >= 0 && diffDays <= days
}

// Counts are against every item in the section (loose + inside every
// folder), independent of any other filter/search currently applied — a
// fixed total per range, not a live "of your current results" count that
// would shift confusingly as other filters change.
function computeDateRangeCounts(items, getDate) {
  const now = new Date()
  return DATE_RANGES.map(range => ({
    ...range,
    count: range.days == null ? items.length : items.filter(i => isWithinDays(getDate(i), range.days, now)).length,
  }))
}

// Same "fixed total against every item in the section, independent of
// other filters" convention as computeDateRangeCounts above.
function computeStatusCounts(items) {
  return STATUS_FILTER_OPTIONS.map(opt => ({
    ...opt,
    count: items.filter(i => i.status === opt.key).length,
  }))
}

// Backs the search bar + filter drawer on a section root (Assessments /
// Other Documents). Search/filter results are flattened across every
// folder (folders are hidden while active) rather than staying scoped to
// whichever folder you're currently browsing — see FilterDrawer/
// SearchFilterBar below for the rendering side of this.
function useDocumentSearchFilter() {
  const [searchText, setSearchText] = useState('')
  const [statuses, setStatuses] = useState([])
  const [types, setTypes] = useState([])
  const [dateRange, setDateRange] = useState('all')
  const [drawerOpen, setDrawerOpen] = useState(false)

  const hasActiveFilters = statuses.length > 0 || types.length > 0 || dateRange !== 'all'
  const isActive = searchText.trim() !== '' || hasActiveFilters

  const applyFilters = (next) => {
    setStatuses(next.statuses)
    setTypes(next.types)
    setDateRange(next.dateRange)
    setDrawerOpen(false)
  }
  const clearFilters = () => {
    setStatuses([])
    setTypes([])
    setDateRange('all')
    setDrawerOpen(false)
  }

  return {
    searchText, setSearchText,
    statuses, types, dateRange,
    hasActiveFilters, isActive,
    drawerOpen, setDrawerOpen,
    applyFilters, clearFilters,
  }
}

// ─── Shared: SearchFilterBar ─────────────────────────────────────────

function SearchFilterBar({ searchText, onSearchChange, onFilterClick, filterActive }) {
  return (
    <div className="docs-search-filter-bar">
      <div className="docs-search-input-wrap">
        <SearchIcon size={18} />
        <input
          type="text"
          placeholder="Search"
          value={searchText}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
      <button className={`docs-filter-btn${filterActive ? ' docs-filter-btn--active' : ''}`} onClick={onFilterClick} aria-label="Filter">
        {filterActive ? <FilterActiveIcon /> : <FiltersIcon />}
      </button>
    </div>
  )
}

// ─── Shared: FilterDrawer ────────────────────────────────────────────
// Staged/pending selection, same convention as the web FilterDropdown
// (Components/FilterDropdown.jsx) — changes only take effect on Apply;
// closing any other way (X, backdrop, Clear all) discards or resets rather
// than committing a half-made selection.

function FilterDrawer({ statusOptions, typeOptions, dateOptions, initialFilters, onApply, onClear, onClose }) {
  const [pending, setPending] = useState(initialFilters)
  const [typeSearch, setTypeSearch] = useState('')
  const [typeListOpen, setTypeListOpen] = useState(false)

  const toggleStatus = (key) => setPending(p => ({
    ...p,
    statuses: p.statuses.includes(key) ? p.statuses.filter(s => s !== key) : [...p.statuses, key],
  }))
  const toggleType = (name) => setPending(p => ({
    ...p,
    types: p.types.includes(name) ? p.types.filter(t => t !== name) : [...p.types, name],
  }))
  // Picking a result turns it into a chip and closes the list back down —
  // the chip itself is the "selected" representation from then on, rather
  // than leaving the full results list open underneath it.
  const selectType = (name) => {
    toggleType(name)
    setTypeSearch('')
    setTypeListOpen(false)
  }

  // Already-selected types move out into their own chip row, so the
  // browsable list only ever shows things you haven't picked yet.
  const visibleTypeOptions = typeOptions
    .filter(t => !pending.types.includes(t))
    .filter(t => !typeSearch.trim() || t.toLowerCase().includes(typeSearch.trim().toLowerCase()))

  return (
    <div className="docs-sheet-overlay" onClick={onClose}>
      <div className="docs-sheet-panel docs-filter-panel" onClick={e => e.stopPropagation()}>
        <div className="docs-sheet-handle" />
        <div className="docs-sheet-header">
          <h2>Filter</h2>
          <button className="docs-sheet-close-btn" onClick={onClose}><CloseIcon /></button>
        </div>
        <div className="docs-filter-body">
          <div className="docs-filter-section">
            <h3>Status</h3>
            {statusOptions.map(opt => (
              <label key={opt.key} className="docs-filter-row">
                <input
                  type="checkbox"
                  checked={pending.statuses.includes(opt.key)}
                  onChange={() => toggleStatus(opt.key)}
                />
                <span>{opt.label} ({opt.count})</span>
              </label>
            ))}
          </div>

          <div className="docs-filter-section">
            <h3>Document type</h3>
            <div className="docs-filter-type-search">
              <SearchIcon size={16} />
              <input
                type="text"
                placeholder="Search types"
                value={typeSearch}
                onFocus={() => setTypeListOpen(true)}
                onChange={e => setTypeSearch(e.target.value)}
              />
            </div>
            {pending.types.length > 0 && (
              <div className="docs-filter-chip-row">
                {pending.types.map(name => (
                  <span key={name} className="docs-filter-chip">
                    {name}
                    <button type="button" onClick={() => toggleType(name)} aria-label={`Remove ${name}`}>
                      <CloseIcon size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {typeListOpen && (
              <div className="docs-filter-type-list">
                {visibleTypeOptions.length === 0 ? (
                  <p className="docs-checklist-empty">No matching types.</p>
                ) : visibleTypeOptions.map(name => (
                  <label key={name} className="docs-filter-row">
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => selectType(name)}
                    />
                    <span>{name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="docs-filter-section">
            <h3>Date</h3>
            {dateOptions.map(opt => (
              <label key={opt.key} className="docs-filter-row">
                <input
                  type="radio"
                  name="docs-filter-date"
                  checked={pending.dateRange === opt.key}
                  onChange={() => setPending(p => ({ ...p, dateRange: opt.key }))}
                />
                <span>{opt.label}{opt.key !== 'all' ? ` (${opt.count})` : ''}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="docs-sheet-footer">
          <button className="fab-square primary-btn" onClick={() => onApply(pending)}>Apply</button>
          <button className="fab-square tertiary-btn" onClick={onClear}>Clear all</button>
        </div>
      </div>
    </div>
  )
}

// ─── Shared: useFolderSelection ──────────────────────────────
// Backs the header "Select" mode on both a section root (moving loose
// documents INTO a folder) and a folder detail screen (moving that
// folder's documents OUT — to no folder, or to a different one). Same
// state shape either way; `folderId` (the currently-open folder, or null
// when at the section root) is all that changes which move targets make
// sense.

function useFolderSelection({ setItems, folders, folderId }) {
  const [selecting, setSelecting] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [pickerOpen, setPickerOpen] = useState(false)

  const resetSelection = () => {
    setSelecting(false)
    setSelectedIds(new Set())
    setPickerOpen(false)
  }

  const toggleSelecting = () => {
    setSelecting(s => !s)
    setSelectedIds(new Set())
  }

  const toggleSelectItem = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // At a folder's own detail view: offer every other folder, plus "Remove
  // from folder". At the section root (folderId null): only real folders
  // make sense as a target, since everything there is already loose.
  const folderPickerOptions = folderId
    ? [{ id: null, label: 'Remove from folder' }, ...folders.filter(f => f.id !== folderId).map(f => ({ id: f.id, label: f.name }))]
    : folders.map(f => ({ id: f.id, label: f.name }))

  const handleMoveSelected = (targetFolderId) => {
    setItems(prev => prev.map(item => selectedIds.has(item.id) ? { ...item, folderId: targetFolderId } : item))
    resetSelection()
  }

  return { selecting, selectedIds, toggleSelecting, toggleSelectItem, pickerOpen, setPickerOpen, folderPickerOptions, handleMoveSelected, resetSelection }
}

// ─── Shared: FolderCard ──────────────────────────────────────

function FolderCard({ folder, count, disabled, onOpen, onRename, onDelete }) {
  return (
    <div
      className={`docs-folder-card${disabled ? ' docs-folder-card--disabled' : ''}`}
      onClick={disabled ? undefined : onOpen}
      role="button"
      tabIndex={0}
    >
      <span className="docs-folder-card-icon"><FolderIcon /></span>
      <span className="docs-folder-card-body">
        <span className="docs-folder-card-name">{folder.name}</span>
        <div className="docs-folder-card-count">{count} document{count === 1 ? '' : 's'}</div>
      </span>
      {!disabled && (
        <span className="docs-folder-card-actions" onClick={e => e.stopPropagation()}>
          <button className="docs-folder-icon-btn" onClick={onRename} aria-label={`Rename ${folder.name}`}>
            <EditActionIcon size={16} />
          </button>
          <button className="docs-folder-icon-btn docs-folder-icon-btn--delete" onClick={onDelete} aria-label={`Delete ${folder.name}`}>
            <DeleteActionIcon size={16} />
          </button>
        </span>
      )}
    </div>
  )
}

// ─── Shared: SelectionBar (replaces the Fab while selecting) ────────

function SelectionBar({ count, onMove }) {
  return (
    <div className="docs-fab-wrap">
      <button className="docs-fab" onClick={onMove} disabled={count === 0}>
        <FolderIcon size={18} /><span>Move{count > 0 ? ` (${count})` : ''}</span>
      </button>
    </div>
  )
}

// ─── Shared: FolderPickerSheet (choose a move destination) ──────────

function FolderPickerSheet({ options, onPick, onClose }) {
  return (
    <div className="docs-sheet-overlay" onClick={onClose}>
      <div className="docs-sheet-panel" onClick={e => e.stopPropagation()}>
        <div className="docs-sheet-handle" />
        <div className="docs-sheet-header">
          <h2>Move</h2>
          <button className="docs-sheet-close-btn" onClick={onClose}><CloseIcon /></button>
        </div>
        <div className="docs-checklist">
          {options.length === 0 ? (
            <p className="docs-checklist-empty">No folders yet — create one first.</p>
          ) : options.map(opt => (
            <button
              key={opt.id ?? '__remove__'}
              className={`docs-folder-picker-item${opt.id === null ? ' docs-folder-picker-item--remove' : ''}`}
              onClick={() => onPick(opt.id)}
            >
              <span className="docs-folder-picker-icon">{opt.id !== null ? <FolderIcon size={20} /> : <FolderMinusIcon size={20} />}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Shared: Fab ─────────────────────────────────────────────
// A pill button that opens a small stacked action list above it, modeled
// on messaging's existing .attach-picker/.attach-option pattern.

function Fab({ label, menuItems }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handleOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  return (
    <div className="docs-fab-wrap" ref={wrapRef}>
      {open && (
        <div className="docs-fab-menu">
          {menuItems.map(item => (
            <button
              key={item.label}
              className="docs-fab-menu-item"
              onClick={() => { setOpen(false); item.onClick() }}
            >
              {item.icon}<span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
      <button className="docs-fab" onClick={() => setOpen(o => !o)}>
        <PlusIcon size={18} /><span>{label}</span>
      </button>
    </div>
  )
}

// ─── Shared: NameEntrySheet (create/rename folder, add document) ────

function NameEntrySheet({ title, label, placeholder, initialValue = '', submitLabel, onSubmit, onClose }) {
  const [name, setName] = useState(initialValue)
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Please enter a name.')
      return
    }
    onSubmit(name.trim())
  }

  return (
    <div className="docs-sheet-overlay" onClick={onClose}>
      <div className="docs-sheet-panel" onClick={e => e.stopPropagation()}>
        <div className="docs-sheet-handle" />
        <div className="docs-sheet-header">
          <h2>{title}</h2>
          <button className="docs-sheet-close-btn" onClick={onClose}><CloseIcon /></button>
        </div>
        <div className="docs-sheet-field">
          <label>{label}</label>
          <input
            className="form-input"
            type="text"
            placeholder={placeholder}
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
            autoFocus
          />
          {error && <div className="docs-sheet-error">{error}</div>}
        </div>
        <div className="docs-sheet-footer">
          <button className="fab-square primary-btn" onClick={handleSubmit}>{submitLabel}</button>
          <button className="fab-square tertiary-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ─── Shared: ConfirmSheet (delete folder) ───────────────────────────
// Same shell as NameEntrySheet — a message in place of the input field,
// same stacked fab-square footer, primary action on top.

function ConfirmSheet({ title, message, confirmLabel, onConfirm, onClose }) {
  return (
    <div className="docs-sheet-overlay" onClick={onClose}>
      <div className="docs-sheet-panel" onClick={e => e.stopPropagation()}>
        <div className="docs-sheet-handle" />
        <div className="docs-sheet-header">
          <h2>{title}</h2>
          <button className="docs-sheet-close-btn" onClick={onClose}><CloseIcon /></button>
        </div>
        <p className="docs-sheet-message">{message}</p>
        <div className="docs-sheet-footer">
          <button className="fab-square primary-btn" onClick={onConfirm}>{confirmLabel}</button>
          <button className="fab-square tertiary-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ─── Shared: AddAssessmentScreen ─────────────────────────────────────
// A full screen (slides up over Assessments, see docs-modal-slide) rather
// than a bottom sheet — same row style as the Assessments list itself
// (icon + name only, no classification/review pill/status), with the same
// multi-select checkbox styling as Assessments' own Select mode. Closed via
// the header's X only — no separate Cancel, the FAB is the one action.

function AddAssessmentScreen({ templates, onAdd, onClose }) {
  const [selected, setSelected] = useState(new Set())

  const toggle = (id) => setSelected(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  return (
    <div className="screen">
      <StatusBar />
      <div className="docs-screen">
        <div className="app-header">
          <button className="app-header-back" onClick={onClose}><CloseIcon /></button>
          <span className="app-header-title">Add assessment</span>
          <div style={{ width: 36 }} />
        </div>
        <div className="docs-screen-body">
          {templates.length === 0 ? (
            <div className="docs-empty-state">No more assessments to add.</div>
          ) : templates.map(item => (
            <div
              key={item.id}
              className={`docs-doc-row docs-doc-row--selectable${selected.has(item.id) ? ' docs-doc-row--selected' : ''}`}
              onClick={() => toggle(item.id)}
            >
              <span className="docs-doc-row-checkbox">
                <input
                  type="checkbox"
                  checked={selected.has(item.id)}
                  onChange={() => toggle(item.id)}
                  onClick={e => e.stopPropagation()}
                />
              </span>
              <span className="docs-doc-row-icon"><DocumentIcon size={22} /></span>
              <span className="docs-doc-row-body">
                <div className="docs-doc-row-title">{item.name}</div>
              </span>
            </div>
          ))}
        </div>
        <div className="docs-fab-wrap">
          <button className="docs-fab" onClick={() => onAdd(selected)} disabled={selected.size === 0}>
            <PlusIcon size={18} /><span>Add{selected.size > 0 ? ` (${selected.size})` : ''}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Shared: FolderDetailScreen (Level 3) ───────────────────────────

function FolderDetailScreen({ folder, items, renderRow, selecting, selectedCount, onBack, onToggleSelecting, onMoveSelected }) {
  if (!folder) return <div className="screen" />
  return (
    <div className="screen">
      <StatusBar />
      <div className="docs-screen">
        <div className="app-header">
          <button className="app-header-back" onClick={onBack}><ChevronLeftIcon /></button>
          <span className="app-header-title">{selecting ? `${selectedCount} selected` : folder.name}</span>
          <button className="app-header-action-text" onClick={onToggleSelecting}>{selecting ? 'Cancel' : 'Select'}</button>
        </div>
        <div className="docs-screen-body">
          {items.length === 0 ? (
            <div className="docs-empty-state">This folder is empty.</div>
          ) : items.map(renderRow)}
        </div>
        {selecting && <SelectionBar count={selectedCount} onMove={onMoveSelected} />}
      </div>
    </div>
  )
}

// ─── Level 1: DocumentsRootScreen ────────────────────────────────────

function DocumentsRootScreen({ onOpenSection }) {
  return (
    <div className="screen">
      <StatusBar />
      <div className="app-header">
        <a className="app-header-back" href="../../"><ArrowLeftIcon /></a>
        <span className="app-header-title">All customers</span>
        <div style={{ width: 36 }} />
      </div>

      <div className="docs-customer-card">
        <h2 className="docs-customer-name">{CUSTOMER.name}</h2>
        <div className="docs-customer-meta">
          <div className="docs-customer-meta-item">
            <span className="docs-customer-meta-label">Address</span>
            <span>{CUSTOMER.addressLine1}, {CUSTOMER.addressLine2}</span>
          </div>
        </div>
        <div className="docs-customer-meta">
          <div className="docs-customer-meta-item">
            <span className="docs-customer-meta-label">Date of Birth</span>
            <span>{CUSTOMER.dob}</span>
          </div>
        </div>
        <div className="docs-customer-chips">
          {CUSTOMER.legalChips.map(chip => (
            <span key={chip.id} className="docs-legal-chip">{chip.label}</span>
          ))}
        </div>
        <div className="docs-customer-avatar">{initials(CUSTOMER.name)}</div>
        {CUSTOMER.highRisk && <span className="docs-high-risk-badge">HIGH RISK</span>}
        <span className="docs-key-icon"><KeyIcon size={20} /></span>
      </div>

      <div className="docs-menu-bar">
        <h1>Documents</h1>
        <button className="docs-menu-action" type="button"><GridMenuIcon size={18} /> Menu</button>
      </div>

      <div className="docs-section-list">
        <button className="docs-section-row" onClick={() => onOpenSection('assessments')}>
          <span className="docs-section-row-icon"><DocumentIcon /></span>
          <span className="docs-section-row-body"><span className="docs-section-row-title">Assessments</span></span>
          <span className="docs-section-row-chevron"><ChevronRightIcon size={20} /></span>
        </button>
        <button className="docs-section-row" onClick={() => onOpenSection('other-documents')}>
          <span className="docs-section-row-icon"><DocumentIcon /></span>
          <span className="docs-section-row-body"><span className="docs-section-row-title">Other Documents</span></span>
          <span className="docs-section-row-chevron"><ChevronRightIcon size={20} /></span>
        </button>
        <button className="docs-section-row" onClick={() => onOpenSection('incidents')}>
          <span className="docs-section-row-icon"><DocumentIcon /></span>
          <span className="docs-section-row-body"><span className="docs-section-row-title">Incidents</span></span>
          <span className="docs-section-row-chevron"><ChevronRightIcon size={20} /></span>
        </button>
      </div>
    </div>
  )
}

// ─── Level 2: AssessmentsScreen ──────────────────────────────────────

// A classification on the document itself (not the folder it may sit in —
// folders carry no classification of their own).
function ClassificationTag({ group }) {
  return (
    <span className={`docs-classification-tag docs-classification-tag--${group}`}>
      {group === 'mandatory' ? 'Mandatory' : 'Optional'}
    </span>
  )
}

function AssessmentRow({ item, selecting, selected, onToggle, folderName }) {
  return (
    <div
      className={`docs-doc-row${selecting ? ' docs-doc-row--selectable' : ''}${selected ? ' docs-doc-row--selected' : ''}`}
      onClick={selecting ? onToggle : undefined}
    >
      {selecting && (
        <span className="docs-doc-row-checkbox">
          <input type="checkbox" checked={!!selected} onChange={onToggle} onClick={e => e.stopPropagation()} />
        </span>
      )}
      <span className="docs-doc-row-icon"><DocumentIcon size={22} /></span>
      <span className="docs-doc-row-body">
        <div className="docs-doc-row-title">{item.name}</div>
        <ClassificationTag group={item.group} />
        {folderName && <span className="docs-folder-tag"><FolderIcon size={12} />{folderName}</span>}
        {item.reviewDue && <span className="docs-review-pill">Review due {item.reviewDue}</span>}
      </span>
      <span className="docs-doc-row-status"><StatusIcon status={item.status} /></span>
    </div>
  )
}

function AssessmentsScreen({ assessments, setAssessments, folders, setFolders, onClose }) {
  const [folderId, setFolderId] = useState(() => {
    const p = new URLSearchParams(window.location.search)
    return p.get('section') === 'assessments' ? p.get('folder') : null
  })
  const [sheet, setSheet] = useState(null)
  const sel = useFolderSelection({ setItems: setAssessments, folders, folderId })

  // "Add assessment" is its own full screen (slides up over Assessments,
  // same mechanic as Assessments sliding up over Level 1) rather than a
  // bottom sheet — kept mounted a moment past `addAssessmentActive` turning
  // off so its content is still visible sliding away, not blank.
  const [addAssessmentActive, setAddAssessmentActive] = useState(false)
  const [addAssessmentMounted, setAddAssessmentMounted] = useState(false)
  const addAssessmentTimeoutRef = useRef(null)
  const openAddAssessment = () => {
    clearTimeout(addAssessmentTimeoutRef.current)
    setAddAssessmentMounted(true)
    setAddAssessmentActive(true)
  }
  const closeAddAssessment = () => {
    setAddAssessmentActive(false)
    addAssessmentTimeoutRef.current = setTimeout(() => setAddAssessmentMounted(false), 300)
  }

  const openFolder = (id) => {
    history.pushState(null, '', `?section=assessments&folder=${id}`)
    setFolderId(id)
    sel.resetSelection()
  }
  const closeFolder = () => {
    history.pushState(null, '', '?section=assessments')
    setFolderId(null)
    sel.resetSelection()
  }

  const openFolderObj = folders.find(f => f.id === folderId) || null

  const handleCreateFolder = (name) => {
    setFolders(prev => [...prev, { id: nextFolderId(), name }])
    setSheet(null)
  }
  const handleRenameFolder = (folder, name) => {
    setFolders(prev => prev.map(f => f.id === folder.id ? { ...f, name } : f))
    setSheet(null)
  }
  const performDeleteFolder = (folder) => {
    setAssessments(prev => prev.map(a => a.folderId === folder.id ? { ...a, folderId: null } : a))
    setFolders(prev => prev.filter(f => f.id !== folder.id))
    setSheet(null)
  }
  const handleAddAssessments = (selectedIds) => {
    const newItems = OPTIONAL_ASSESSMENT_TEMPLATES
      .filter(t => selectedIds.has(t.id))
      .map(t => ({ id: nextAssessmentId(), name: t.name, group: 'optional', status: 'notStarted', date: null, folderId: null }))
    setAssessments(prev => [...prev, ...newItems])
    closeAddAssessment()
  }

  const availableTemplates = OPTIONAL_ASSESSMENT_TEMPLATES.filter(t => !assessments.some(a => a.name === t.name))
  const looseAssessments = assessments.filter(a => !a.folderId)

  const fabMenuItems = [
    { label: 'Add assessment', icon: <PlusIcon size={16} />, onClick: openAddAssessment },
    { label: 'New folder', icon: <FolderIcon size={16} />, onClick: () => setSheet({ type: 'create' }) },
  ]

  const sf = useDocumentSearchFilter()
  const assessmentTypeOptions = [...new Set(assessments.map(a => a.name))].sort()
  const assessmentStatusOptions = computeStatusCounts(assessments)
  const assessmentDateOptions = computeDateRangeCounts(assessments, a => parseDMY(a.date))
  const flatFilteredAssessments = !sf.isActive ? [] : assessments
    .map(a => ({ ...a, folderName: folders.find(f => f.id === a.folderId)?.name || null }))
    .filter(item => {
      const q = sf.searchText.trim().toLowerCase()
      if (q && !item.name.toLowerCase().includes(q)) return false
      if (sf.statuses.length && !sf.statuses.includes(item.status)) return false
      if (sf.types.length && !sf.types.includes(item.name)) return false
      if (sf.dateRange !== 'all') {
        const range = DATE_RANGES.find(r => r.key === sf.dateRange)
        if (!isWithinDays(parseDMY(item.date), range.days, new Date())) return false
      }
      return true
    })

  return (
    <>
      <ScreenSlider
        secondaryActive={!!folderId}
        primary={
          <div className="screen">
            <StatusBar />
            <div className="docs-screen">
              <div className="app-header">
                <button className="app-header-back" onClick={onClose}><CloseIcon /></button>
                <span className="app-header-title">{sel.selecting ? `${sel.selectedIds.size} selected` : 'Assessments'}</span>
                <button className="app-header-action-text" onClick={sel.toggleSelecting}>{sel.selecting ? 'Cancel' : 'Select'}</button>
              </div>
              <SearchFilterBar
                searchText={sf.searchText}
                onSearchChange={sf.setSearchText}
                onFilterClick={() => sf.setDrawerOpen(true)}
                filterActive={sf.hasActiveFilters}
              />
              <div className="docs-screen-body">
                {sf.isActive ? (
                  flatFilteredAssessments.length === 0 ? (
                    <div className="docs-empty-state">No assessments match your search or filters.</div>
                  ) : flatFilteredAssessments.map(item => (
                    <AssessmentRow
                      key={item.id}
                      item={item}
                      folderName={item.folderName}
                      selecting={sel.selecting}
                      selected={sel.selectedIds.has(item.id)}
                      onToggle={() => sel.toggleSelectItem(item.id)}
                    />
                  ))
                ) : (
                  <>
                    {folders.map(folder => (
                      <FolderCard
                        key={folder.id}
                        folder={folder}
                        count={assessments.filter(a => a.folderId === folder.id).length}
                        disabled={sel.selecting}
                        onOpen={() => openFolder(folder.id)}
                        onRename={() => setSheet({ type: 'rename', folder })}
                        onDelete={() => setSheet({ type: 'delete', folder })}
                      />
                    ))}
                    {looseAssessments.map(item => (
                      <AssessmentRow
                        key={item.id}
                        item={item}
                        selecting={sel.selecting}
                        selected={sel.selectedIds.has(item.id)}
                        onToggle={() => sel.toggleSelectItem(item.id)}
                      />
                    ))}
                  </>
                )}
              </div>
              {sel.selecting
                ? <SelectionBar count={sel.selectedIds.size} onMove={() => sel.setPickerOpen(true)} />
                : <Fab label="Add" menuItems={fabMenuItems} />
              }
            </div>
          </div>
        }
        secondary={
          <FolderDetailScreen
            folder={openFolderObj}
            items={openFolderObj ? assessments.filter(a => a.folderId === openFolderObj.id) : []}
            renderRow={item => (
              <AssessmentRow
                key={item.id}
                item={item}
                selecting={sel.selecting}
                selected={sel.selectedIds.has(item.id)}
                onToggle={() => sel.toggleSelectItem(item.id)}
              />
            )}
            selecting={sel.selecting}
            selectedCount={sel.selectedIds.size}
            onBack={closeFolder}
            onToggleSelecting={sel.toggleSelecting}
            onMoveSelected={() => sel.setPickerOpen(true)}
          />
        }
      />

      <div className={`docs-modal-slide${addAssessmentActive ? ' docs-modal-active' : ''}`}>
        {addAssessmentMounted && (
          <AddAssessmentScreen
            templates={availableTemplates}
            onAdd={handleAddAssessments}
            onClose={closeAddAssessment}
          />
        )}
      </div>
      {sheet && sheet.type === 'create' && (
        <NameEntrySheet
          title="New folder"
          label="Folder name"
          placeholder="e.g. Falls Risk Review"
          submitLabel="Create"
          onSubmit={handleCreateFolder}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet && sheet.type === 'rename' && (
        <NameEntrySheet
          title="Rename folder"
          label="Folder name"
          initialValue={sheet.folder.name}
          submitLabel="Save"
          onSubmit={(name) => handleRenameFolder(sheet.folder, name)}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet && sheet.type === 'delete' && (
        <ConfirmSheet
          title="Delete folder"
          message={`Delete "${sheet.folder.name}"? Its documents will move back to the main list.`}
          confirmLabel="Delete"
          onConfirm={() => performDeleteFolder(sheet.folder)}
          onClose={() => setSheet(null)}
        />
      )}
      {sel.pickerOpen && (
        <FolderPickerSheet
          options={sel.folderPickerOptions}
          onPick={sel.handleMoveSelected}
          onClose={() => sel.setPickerOpen(false)}
        />
      )}
      {sf.drawerOpen && (
        <FilterDrawer
          statusOptions={assessmentStatusOptions}
          typeOptions={assessmentTypeOptions}
          dateOptions={assessmentDateOptions}
          initialFilters={{ statuses: sf.statuses, types: sf.types, dateRange: sf.dateRange }}
          onApply={sf.applyFilters}
          onClear={sf.clearFilters}
          onClose={() => sf.setDrawerOpen(false)}
        />
      )}
    </>
  )
}

// ─── Level 2: OtherDocumentsScreen ───────────────────────────────────

function OtherDocumentRow({ item, selecting, selected, onToggle, folderName }) {
  return (
    <div
      className={`docs-doc-row${selecting ? ' docs-doc-row--selectable' : ''}${selected ? ' docs-doc-row--selected' : ''}`}
      onClick={selecting ? onToggle : undefined}
    >
      {selecting && (
        <span className="docs-doc-row-checkbox">
          <input type="checkbox" checked={!!selected} onChange={onToggle} onClick={e => e.stopPropagation()} />
        </span>
      )}
      <span className="docs-doc-row-icon"><DocumentIcon size={22} /></span>
      <span className="docs-doc-row-body">
        <div className="docs-doc-row-title">{item.title}</div>
        <div className="docs-doc-row-sub">{item.code}</div>
        {folderName && <span className="docs-folder-tag"><FolderIcon size={12} />{folderName}</span>}
      </span>
      <span className="docs-doc-row-status"><StatusIcon status={item.status} /></span>
    </div>
  )
}

function OtherDocumentsScreen({ documents, setDocuments, folders, setFolders, onClose }) {
  const [folderId, setFolderId] = useState(() => {
    const p = new URLSearchParams(window.location.search)
    return p.get('section') === 'other-documents' ? p.get('folder') : null
  })
  const [sheet, setSheet] = useState(null)
  const sel = useFolderSelection({ setItems: setDocuments, folders, folderId })

  const openFolder = (id) => {
    history.pushState(null, '', `?section=other-documents&folder=${id}`)
    setFolderId(id)
    sel.resetSelection()
  }
  const closeFolder = () => {
    history.pushState(null, '', '?section=other-documents')
    setFolderId(null)
    sel.resetSelection()
  }

  const openFolderObj = folders.find(f => f.id === folderId) || null

  const handleCreateFolder = (name) => {
    setFolders(prev => [...prev, { id: nextFolderId(), name }])
    setSheet(null)
  }
  const handleRenameFolder = (folder, name) => {
    setFolders(prev => prev.map(f => f.id === folder.id ? { ...f, name } : f))
    setSheet(null)
  }
  const performDeleteFolder = (folder) => {
    setDocuments(prev => prev.map(d => d.folderId === folder.id ? { ...d, folderId: null } : d))
    setFolders(prev => prev.filter(f => f.id !== folder.id))
    setSheet(null)
  }
  const handleAddDocument = (name) => {
    setDocuments(prev => [...prev, { id: nextOtherDocId(), title: name, code: 'Added via ADD DOCUMENT', status: 'complete', folderId: null }])
    setSheet(null)
  }

  const looseDocuments = documents.filter(d => !d.folderId)

  const fabMenuItems = [
    { label: 'Add document', icon: <DocumentIcon size={16} />, onClick: () => setSheet('add-document') },
    { label: 'New folder', icon: <FolderIcon size={16} />, onClick: () => setSheet({ type: 'create' }) },
  ]

  const sf = useDocumentSearchFilter()
  const documentTypeOptions = [...new Set(documents.map(d => d.title))].sort()
  const documentStatusOptions = computeStatusCounts(documents)
  const documentDateOptions = computeDateRangeCounts(documents, d => parseDMY(d.date))
  const flatFilteredDocuments = !sf.isActive ? [] : documents
    .map(d => ({ ...d, folderName: folders.find(f => f.id === d.folderId)?.name || null }))
    .filter(item => {
      const q = sf.searchText.trim().toLowerCase()
      if (q && !item.title.toLowerCase().includes(q) && !item.code.toLowerCase().includes(q)) return false
      if (sf.statuses.length && !sf.statuses.includes(item.status)) return false
      if (sf.types.length && !sf.types.includes(item.title)) return false
      if (sf.dateRange !== 'all') {
        const range = DATE_RANGES.find(r => r.key === sf.dateRange)
        if (!isWithinDays(parseDMY(item.date), range.days, new Date())) return false
      }
      return true
    })

  return (
    <>
      <ScreenSlider
        secondaryActive={!!folderId}
        primary={
          <div className="screen">
            <StatusBar />
            <div className="docs-screen">
              <div className="app-header">
                <button className="app-header-back" onClick={onClose}><CloseIcon /></button>
                <span className="app-header-title">{sel.selecting ? `${sel.selectedIds.size} selected` : 'Other Documents'}</span>
                <button className="app-header-action-text" onClick={sel.toggleSelecting}>{sel.selecting ? 'Cancel' : 'Select'}</button>
              </div>
              <SearchFilterBar
                searchText={sf.searchText}
                onSearchChange={sf.setSearchText}
                onFilterClick={() => sf.setDrawerOpen(true)}
                filterActive={sf.hasActiveFilters}
              />
              <div className="docs-screen-body">
                {sf.isActive ? (
                  flatFilteredDocuments.length === 0 ? (
                    <div className="docs-empty-state">No documents match your search or filters.</div>
                  ) : flatFilteredDocuments.map(item => (
                    <OtherDocumentRow
                      key={item.id}
                      item={item}
                      folderName={item.folderName}
                      selecting={sel.selecting}
                      selected={sel.selectedIds.has(item.id)}
                      onToggle={() => sel.toggleSelectItem(item.id)}
                    />
                  ))
                ) : (
                  <>
                    {folders.map(folder => (
                      <FolderCard
                        key={folder.id}
                        folder={folder}
                        count={documents.filter(d => d.folderId === folder.id).length}
                        disabled={sel.selecting}
                        onOpen={() => openFolder(folder.id)}
                        onRename={() => setSheet({ type: 'rename', folder })}
                        onDelete={() => setSheet({ type: 'delete', folder })}
                      />
                    ))}
                    {looseDocuments.map(item => (
                      <OtherDocumentRow
                        key={item.id}
                        item={item}
                        selecting={sel.selecting}
                        selected={sel.selectedIds.has(item.id)}
                        onToggle={() => sel.toggleSelectItem(item.id)}
                      />
                    ))}
                  </>
                )}
              </div>
              {sel.selecting
                ? <SelectionBar count={sel.selectedIds.size} onMove={() => sel.setPickerOpen(true)} />
                : <Fab label="Add" menuItems={fabMenuItems} />
              }
            </div>
          </div>
        }
        secondary={
          <FolderDetailScreen
            folder={openFolderObj}
            items={openFolderObj ? documents.filter(d => d.folderId === openFolderObj.id) : []}
            renderRow={item => (
              <OtherDocumentRow
                key={item.id}
                item={item}
                selecting={sel.selecting}
                selected={sel.selectedIds.has(item.id)}
                onToggle={() => sel.toggleSelectItem(item.id)}
              />
            )}
            selecting={sel.selecting}
            selectedCount={sel.selectedIds.size}
            onBack={closeFolder}
            onToggleSelecting={sel.toggleSelecting}
            onMoveSelected={() => sel.setPickerOpen(true)}
          />
        }
      />

      {sheet === 'add-document' && (
        <NameEntrySheet
          title="Add document"
          label="Document name"
          placeholder="e.g. GP Letter"
          submitLabel="Add"
          onSubmit={handleAddDocument}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet && sheet.type === 'create' && (
        <NameEntrySheet
          title="New folder"
          label="Folder name"
          placeholder="e.g. Best Interest Decisions"
          submitLabel="Create"
          onSubmit={handleCreateFolder}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet && sheet.type === 'rename' && (
        <NameEntrySheet
          title="Rename folder"
          label="Folder name"
          initialValue={sheet.folder.name}
          submitLabel="Save"
          onSubmit={(name) => handleRenameFolder(sheet.folder, name)}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet && sheet.type === 'delete' && (
        <ConfirmSheet
          title="Delete folder"
          message={`Delete "${sheet.folder.name}"? Its documents will move back to the main list.`}
          confirmLabel="Delete"
          onConfirm={() => performDeleteFolder(sheet.folder)}
          onClose={() => setSheet(null)}
        />
      )}
      {sel.pickerOpen && (
        <FolderPickerSheet
          options={sel.folderPickerOptions}
          onPick={sel.handleMoveSelected}
          onClose={() => sel.setPickerOpen(false)}
        />
      )}
      {sf.drawerOpen && (
        <FilterDrawer
          statusOptions={documentStatusOptions}
          typeOptions={documentTypeOptions}
          dateOptions={documentDateOptions}
          initialFilters={{ statuses: sf.statuses, types: sf.types, dateRange: sf.dateRange }}
          onApply={sf.applyFilters}
          onClear={sf.clearFilters}
          onClose={() => sf.setDrawerOpen(false)}
        />
      )}
    </>
  )
}

// ─── Level 2: IncidentsScreen ────────────────────────────────────────
// Functionality deferred to a later round (folders/documents/etc. — see
// Assessments/Other Documents for that pattern) — this is a placeholder
// shell only, styled and slid in identically to its two siblings.

function IncidentsScreen({ onClose }) {
  return (
    <div className="screen">
      <StatusBar />
      <div className="docs-screen">
        <div className="app-header">
          <button className="app-header-back" onClick={onClose}><CloseIcon /></button>
          <span className="app-header-title">Incidents</span>
          <div style={{ width: 36 }} />
        </div>
        <div className="docs-screen-body">
          <div className="docs-empty-state">No incidents recorded.</div>
        </div>
      </div>
    </div>
  )
}

// ─── Root ────────────────────────────────────────────────────

export default function App() {
  const pageRef = useRef(null)

  const [section, setSection] = useState(() => new URLSearchParams(window.location.search).get('section'))
  // What's actually mounted inside the modal sheet — kept one step behind
  // `section` on close, so the sheet's own content is still visible sliding
  // down rather than going blank mid-animation (matches the shared
  // ScreenSlider's own "both sides always mounted" approach one level down,
  // for the folder drill-down inside each of these screens).
  const [renderedSection, setRenderedSection] = useState(section)
  const closeTimeoutRef = useRef(null)

  const [assessments, setAssessments] = useState(ASSESSMENTS)
  const [assessmentFolders, setAssessmentFolders] = useState(ASSESSMENT_FOLDERS)
  const [otherDocuments, setOtherDocuments] = useState(OTHER_DOCUMENTS)
  const [otherDocumentFolders, setOtherDocumentFolders] = useState(OTHER_DOCUMENT_FOLDERS)

  const openSection = (sec) => {
    history.pushState(null, '', `?section=${sec}`)
    clearTimeout(closeTimeoutRef.current)
    setRenderedSection(sec)
    setSection(sec)
  }
  const closeSection = () => {
    history.pushState(null, '', window.location.pathname)
    setSection(null)
    closeTimeoutRef.current = setTimeout(() => setRenderedSection(null), 300)
  }

  return (
    <>
      <DevToolbar floating>
        <DevEdit containerRef={pageRef} prototypeId={window.location.pathname + window.location.search} />
        <DevMode containerRef={pageRef} />
        <DevComments containerRef={pageRef} prototypeId={window.location.pathname + window.location.search} />
        <WireframeToggle />
        <AuditCapture containerRef={pageRef} />
      </DevToolbar>
      <div className="phone-wrap">
        <a href="../../" className="back-link"><ChevronLeftIcon size={16} /> Prototypes</a>
        <div className="phone-frame" ref={pageRef}>
          <div className="screen-area">
            <DocumentsRootScreen onOpenSection={openSection} />
            {/* Assessments/Other Documents/Incidents present as a modal sheet
                (closed via an X, not a back-chevron) sliding up from the
                bottom, distinct from the horizontal .screen-slide drill-down
                used one level deeper (into a folder) inside each of these. */}
            <div className={`docs-modal-slide${section !== null ? ' docs-modal-active' : ''}`}>
              {renderedSection === 'assessments' ? (
                <AssessmentsScreen
                  assessments={assessments}
                  setAssessments={setAssessments}
                  folders={assessmentFolders}
                  setFolders={setAssessmentFolders}
                  onClose={closeSection}
                />
              ) : renderedSection === 'other-documents' ? (
                <OtherDocumentsScreen
                  documents={otherDocuments}
                  setDocuments={setOtherDocuments}
                  folders={otherDocumentFolders}
                  setFolders={setOtherDocumentFolders}
                  onClose={closeSection}
                />
              ) : renderedSection === 'incidents' ? (
                <IncidentsScreen onClose={closeSection} />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
