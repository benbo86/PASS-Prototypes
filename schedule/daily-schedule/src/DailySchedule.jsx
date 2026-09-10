import { Fragment, useState, useMemo, useRef } from 'react'
import DatePicker from 'react-datepicker'
import SideNav from '../../../Components/SideNav'
import TopNav from '../../../Components/TopNav'
import ScheduleNav from '../../../Components/ScheduleNav'
import EventPanel from '../../../Components/EventPanel'
import SegmentedToggle from '../../../Components/SegmentedToggle'
import Tooltip from '../../../Components/Tooltip'
import ScheduleFilterDropdown from '../../../Components/ScheduleFilterDropdown'
import { fmtDate, DateRangeInput } from '../../../Components/DateRangePicker'
import DevToolbar from '../../../Components/DevToolbar'
import DevMode from '../../../Components/DevMode'
import DevComments from '../../../Components/DevComments'
import DevEdit from '../../../Components/DevEdit'
import WireframeToggle from '../../../Components/WireframeToggle'
import AuditCapture from '../../../Components/AuditCapture'
import { AreaTag, VisitTypeTag } from './Tags'
import {
  UNASSIGNED_VISITS, RECOMMENDED_EMPLOYEES, SAMPLE_EMPLOYEES, AREAS,
  toMinutes, fmtDuration,
} from './data'

const CURRENT_OFFICE_USER = 'Alex Morgan'

// ─── Icons ──────────────────────────────────────────────────────────────────

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15,18 9,12 15,6" />
  </svg>
)
const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="16.6 8.6 12 13.2 7.4 8.6 6 10 12 16 18 10" />
  </svg>
)
// Matches component-demos/ui-kit's own "Actions" button exactly (round-btn
// tertiary-btn btn-icon-left <CogIcon/> Actions) — that reference button
// also carries a trailing ChevronDownIcon, but Schedule's own Actions
// button doesn't show one, hence no btn-icon-right/ChevronDown pairing
// here despite otherwise copying the UI Kit pattern verbatim. Named
// CogIcon (not SettingsIcon) to avoid colliding with this file's own
// SettingsIcon (Icons/controls.svg, a different icon used by the header's
// standalone settings button).
const CogIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.5759 2.85953C14.1433 1.88245 15.341 1.47271 16.3181 1.88245C17.1375 2.22915 17.894 2.67041 18.6189 3.20623C19.4699 3.8366 19.7221 5.06583 19.1547 6.04291C18.8395 6.61024 18.8395 7.30365 19.1547 7.87099C19.4699 8.43832 20.0688 8.78503 20.7307 8.78503C21.8653 8.78503 22.8109 9.63603 22.937 10.7392C23 11.1489 23 11.5902 23 11.9999C23 12.4097 23 12.8509 22.937 13.2607C22.8109 14.3638 21.8653 15.2148 20.7307 15.2148C20.1003 15.2148 19.4699 15.5615 19.1547 16.1289C18.8395 16.6962 18.8395 17.3896 19.1547 17.9569C19.7221 18.934 19.4699 20.1317 18.6189 20.7936C17.894 21.3294 17.1375 21.7707 16.3181 22.1174C16.0344 22.212 15.7822 22.275 15.4986 22.275C14.7421 22.275 13.9857 21.8653 13.5759 21.1403C13.2607 20.573 12.6304 20.2263 12 20.2263C11.3696 20.2263 10.7393 20.573 10.4241 21.1403C9.85673 22.1174 8.65903 22.5271 7.68195 22.1174C6.86246 21.7707 6.10602 21.3294 5.38109 20.7936C4.53009 20.1633 4.27794 18.934 4.84527 17.9569C5.16046 17.3896 5.16046 16.6962 4.84527 16.1289C4.53009 15.5615 3.93123 15.2148 3.26934 15.2148C2.13467 15.2148 1.18911 14.3638 1.06304 13.2607C1.03152 12.8509 1 12.4097 1 11.9999C1 11.5902 1 11.1489 1.06304 10.7392C1.18911 9.63603 2.13467 8.78503 3.26934 8.78503C3.89971 8.78503 4.53009 8.43832 4.84527 7.87099C5.16046 7.30365 5.16046 6.61024 4.84527 6.04291C4.27794 5.06583 4.53009 3.86812 5.38109 3.20623C6.10602 2.67041 6.86246 2.22915 7.68195 1.88245C8.69054 1.47271 9.85673 1.88245 10.4241 2.85953C10.7393 3.42686 11.3696 3.77357 12 3.77357C12.6304 3.77357 13.2607 3.42686 13.5759 2.85953ZM15.6246 3.58445C15.4355 3.4899 15.2779 3.61597 15.1834 3.77357C14.5215 4.90824 13.3238 5.60165 12 5.60165C10.6762 5.60165 9.47851 4.90824 8.81662 3.77357C8.72206 3.64749 8.53295 3.52142 8.37536 3.58445C7.68195 3.86812 7.05158 4.24635 6.45272 4.68761C6.32665 4.78216 6.32665 5.00279 6.4212 5.16039C7.08309 6.29506 7.08309 7.68188 6.4212 8.81655C5.79083 9.9197 4.5616 10.6446 3.26934 10.6446C3.08023 10.6446 2.92264 10.7707 2.89112 10.9598C2.8596 11.3065 2.82808 11.6532 2.82808 11.9999C2.82808 12.3466 2.8596 12.6933 2.89112 13.04C2.89112 13.2292 3.04871 13.3552 3.26934 13.3552C4.5616 13.3552 5.75931 14.0486 6.4212 15.1833C7.05158 16.318 7.08309 17.7048 6.4212 18.8395C6.32665 18.9971 6.29513 19.2177 6.45272 19.3122C7.05158 19.7535 7.68195 20.1317 8.37536 20.4154C8.56447 20.51 8.72206 20.3839 8.81662 20.2263C9.47851 19.0916 10.6762 18.3982 12 18.3982C13.3238 18.3982 14.5215 19.0916 15.1834 20.2263C15.2779 20.3524 15.467 20.4784 15.6246 20.4154C16.3181 20.1317 16.9484 19.7535 17.5473 19.3122C17.6734 19.2177 17.6734 18.9971 17.5788 18.8395C16.9169 17.7048 16.9169 16.318 17.5788 15.1833C18.2092 14.0802 19.4384 13.3552 20.7307 13.3552C20.9198 13.3552 21.0774 13.2292 21.1089 13.04C21.1719 12.6933 21.1719 12.3466 21.1719 11.9999C21.1719 11.6532 21.1404 11.3065 21.1089 10.9598C21.1089 10.7707 20.9513 10.6446 20.7307 10.6446C19.4384 10.6446 18.2407 9.95122 17.5788 8.81655C16.9484 7.68188 16.9169 6.29506 17.5788 5.16039C17.6734 5.00279 17.7049 4.78216 17.5473 4.68761C16.9484 4.24635 16.2865 3.86812 15.6246 3.58445ZM12 8.34377C14.0172 8.34377 15.6562 9.98274 15.6562 11.9999C15.6562 14.0171 14.0172 15.6561 12 15.6561C9.98281 15.6561 8.34384 14.0171 8.34384 11.9999C8.34384 9.98274 9.98281 8.34377 12 8.34377ZM12 10.1718C10.9914 10.1718 10.1719 10.9913 10.1719 11.9999C10.1719 13.0085 10.9914 13.828 12 13.828C13.0086 13.828 13.8281 13.0085 13.8281 11.9999C13.8281 10.9913 13.0086 10.1718 12 10.1718Z" />
  </svg>
)
const SettingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <g stroke="currentColor" fill="none" fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <line x1="20" y1="7" x2="11" y2="7" />
      <line x1="14" y1="17" x2="5" y2="17" />
      <circle cx="17" cy="17" r="3" />
      <circle cx="7" cy="7" r="3" />
    </g>
  </svg>
)
const ExpandIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M3.964,21 C3.70623169,21.0078306 3.45663148,20.9090757 3.274,20.727 C3.09130121,20.5442963 2.99215492,20.2942595 3,20.036 L3,15.76 C3,15.481 3.091,15.25 3.273,15.069 C3.45570372,14.8863012 3.70574054,14.7871549 3.964,14.795 C4.22190782,14.7874548 4.47151339,14.8865938 4.65395978,15.0690402 C4.83640617,15.2514866 4.93554523,15.5010922 4.928,15.759 L4.928,19.07 L8.24,19.07 C8.49790782,19.0624548 8.74751339,19.1615938 8.92995978,19.3440402 C9.11240617,19.5264866 9.21154523,19.7760922 9.204,20.034 C9.21238705,20.2924554 9.11358977,20.5428866 8.931,20.726 C8.74836852,20.9080757 8.49876831,21.0068306 8.241,20.999 L3.963,20.999 L3.964,21 Z M3.964,9.204 C3.70608429,9.21156701 3.45646287,9.11244198 3.274,8.93 C3.09155802,8.74753713 2.99243299,8.49791571 3,8.24 L3,3.963 C3,3.685 3.091,3.454 3.273,3.273 C3.45587251,3.09066747 3.70588809,2.99189142 3.964,3 L8.24,3 C8.519,3 8.75,3.091 8.931,3.273 C9.11369879,3.45570372 9.21284508,3.70574054 9.205,3.964 C9.21284508,4.22225946 9.11369879,4.47229628 8.931,4.655 C8.74853713,4.83744198 8.49891571,4.93656701 8.241,4.929 L4.928,4.929 L4.928,8.239 C4.93584508,8.49725946 4.83669879,8.74729628 4.654,8.93 C4.47153713,9.11244198 4.22191571,9.21156701 3.964,9.204 Z M15.761,21 C15.5028881,21.0081086 15.2528725,20.9093325 15.07,20.727 C14.8873012,20.5442963 14.7881549,20.2942595 14.796,20.036 C14.7884548,19.7780922 14.8875938,19.5284866 15.0700402,19.3460402 C15.2524866,19.1635938 15.5020922,19.0644548 15.76,19.072 L19.071,19.072 L19.071,15.76 C19.0634548,15.5020922 19.1625938,15.2524866 19.3450402,15.0700402 C19.5274866,14.8875938 19.7770922,14.7884548 20.035,14.796 C20.315,14.796 20.545,14.886 20.727,15.069 C20.9090757,15.2516315 21.0078306,15.5012317 21,15.759 L21,20.035 C21.0078306,20.2927683 20.9090757,20.5423685 20.727,20.725 C20.5442963,20.9076988 20.2942595,21.0068451 20.036,20.999 L15.76,20.999 L15.761,21 Z M20.036,9.204 C19.7777405,9.21184508 19.5277037,9.11269879 19.345,8.93 C19.162558,8.74753713 19.063433,8.49791571 19.071,8.24 L19.071,4.928 L15.761,4.928 C15.5027405,4.93584508 15.2527037,4.83669879 15.07,4.654 C14.887558,4.47153713 14.788433,4.22191571 14.796,3.964 C14.7884548,3.70609218 14.8875938,3.45648661 15.0700402,3.27404022 C15.2524866,3.09159383 15.5020922,2.99245477 15.76,3 L20.036,2.999 C20.314,2.999 20.545,3.09 20.726,3.272 C20.9086988,3.45470372 21.0078451,3.70474054 21,3.963 L21,8.24 C21.0081086,8.49811191 20.9093325,8.74812749 20.727,8.931 C20.5442963,9.11369879 20.2942595,9.21284508 20.036,9.205 L20.036,9.204 Z" />
  </svg>
)
// Calendar/Map Pin — the 20×20 (viewBox 24×24) variants from PASS Icons
// specifically, not any of the library's other Calendar/Map Pin sizes.
const CalendarViewIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
)
const MapPinViewIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
  </svg>
)
// Icons/Ellipsis 2.svg, copied verbatim (fill swapped to currentColor).
const EllipsisIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" fillRule="evenodd" d="M12 6.5c.825 0 1.5-.675 1.5-1.5s-.675-1.5-1.5-1.5-1.5.675-1.5 1.5.675 1.5 1.5 1.5zm0 4c-.825 0-1.5.675-1.5 1.5s.675 1.5 1.5 1.5 1.5-.675 1.5-1.5-.675-1.5-1.5-1.5zm0 7c-.825 0-1.5.675-1.5 1.5s.675 1.5 1.5 1.5 1.5-.675 1.5-1.5-.675-1.5-1.5-1.5z" />
  </svg>
)
// Timeline/List view-toggle icons — deliberately distinct from every other
// icon set in the repo (this is a new, narrow concept: "how is the
// Unassigned area itself rendered", not a filter/sort on a column).
const TimelineViewIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" className="col-icon">
    <rect x="3" y="5" width="13" height="3" rx="1" fill="currentColor" />
    <rect x="3" y="10.5" width="9" height="3" rx="1" fill="currentColor" />
    <rect x="3" y="16" width="16" height="3" rx="1" fill="currentColor" />
  </svg>
)
const ListViewIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" className="col-icon">
    <circle cx="4.5" cy="6.5" r="1.5" fill="currentColor" />
    <circle cx="4.5" cy="12" r="1.5" fill="currentColor" />
    <circle cx="4.5" cy="17.5" r="1.5" fill="currentColor" />
    <rect x="8" y="5.2" width="13" height="2.6" rx="1" fill="currentColor" />
    <rect x="8" y="10.7" width="13" height="2.6" rx="1" fill="currentColor" />
    <rect x="8" y="16.2" width="13" height="2.6" rx="1" fill="currentColor" />
  </svg>
)
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <polygon fill="currentColor" stroke="currentColor" strokeLinejoin="round"
      points="18 7.2 16.8 6 12 10.8 7.2 6 6 7.2 10.8 12 6 16.8 7.2 18 12 13.2 16.8 18 18 16.8 13.2 12" />
  </svg>
)
const SortIcon = ({ dir }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" className={`col-icon sort-icon ${dir ? 'col-icon--active' : ''}`} strokeLinecap="square">
    <polyline points="7.5,9 12,5 16.5,9" stroke="currentColor" strokeWidth="2" fill="none" opacity={dir === 'desc' ? 0.35 : 1} />
    <polyline points="7.5,19 12,15 16.5,19" stroke="currentColor" strokeWidth="2" fill="none"
      style={{ transform: 'scaleY(-1)', transformOrigin: '12px 17px' }} opacity={dir === 'asc' ? 0.35 : 1} />
  </svg>
)

// ─── Helpers ────────────────────────────────────────────────────────────────

// 'YYYY-MM-DD', for Components/EventPanel's own `initialDateISO` prop —
// built from local Y/M/D (not toISOString, which would shift by the
// browser's UTC offset and can land on the wrong calendar day).
const toISODate = (d) => `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`

const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)

// Greedy interval-lane packing (sort by start, place in first lane whose
// last visit already ends by this one's start, else open a new lane) —
// same technique the live product's own overlap-stacking uses, needed so
// concurrent unassigned visits don't visually collide on one row.
function packLanes(visits) {
  const sorted = [...visits].sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
  const lanes = []
  for (const v of sorted) {
    const lane = lanes.find(l => toMinutes(l[l.length - 1].end) <= toMinutes(v.start))
    if (lane) lane.push(v)
    else lanes.push([v])
  }
  return lanes
}

const barStyle = (start, end) => {
  const left = (toMinutes(start) / 1440) * 100
  const width = ((toMinutes(end) - toMinutes(start)) / 1440) * 100
  return { left: `${left}%`, width: `${width}%` }
}

function sortVisits(visits, sort) {
  if (!sort.col) return [...visits].sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
  const dir = sort.dir === 'asc' ? 1 : -1
  return [...visits].sort((a, b) => {
    switch (sort.col) {
      case 'time':       return dir * (toMinutes(a.start) - toMinutes(b.start))
      case 'customer':   return dir * a.customer.localeCompare(b.customer)
      case 'duration':   return dir * ((toMinutes(a.end) - toMinutes(a.start)) - (toMinutes(b.end) - toMinutes(b.start)))
      case 'area':       return dir * a.area.localeCompare(b.area)
      case 'visitType':  return dir * a.visitType.localeCompare(b.visitType)
      case 'assigned':   return dir * (a.employeesRequired - b.employeesRequired)
      default: return 0
    }
  })
}

// "Sleeping night" (the tag's own sentence-case label) → "Sleeping Night"
// for the assign panel's own title line — Components/EventPanel.jsx's
// `visitLabel` prop is rendered verbatim, so casing is this file's call.
const titleCase = (s) => s.replace(/\b\w/g, c => c.toUpperCase())

// Feeds the assign panel's own `recurrenceText` prop (the "10 days,
// bi-weekly" chip Components/EventPanel.jsx already renders for the
// absent-employee prototype) — this data model has no real per-visit
// recurrence, so it's derived from visit type, same static-chrome
// treatment the original prototype's own fixed recurrence text has.
const RECURRENCE_TEXT = {
  'Personal care': 'Daily',
  'Sleeping night': 'Daily',
  'Waking night': 'Daily',
  'Medication support': 'Daily',
  'Domiciliary': '7 days, weekly',
  'Companionship': '7 days, weekly',
  'Wellbeing check': '14 days, fortnightly',
}

// ─── Toolbar filters ────────────────────────────────────────────────────────

// Option lists for the toolbar's own 7 filters. Customers/Employees are
// derived from this prototype's own sample data; Area reuses data.js's
// own AREAS list (already the real field on every unassigned visit).
// Shifts/Medical Conditions/More have no corresponding field on either
// data set in this prototype, so their own dropdowns are fully functional
// (search, select, badge, Clear) but — unlike Customers/Employees/Area/
// Contract types below — selecting an item there has no filtering effect,
// same "decorative but real chrome" treatment already used elsewhere in
// this file (Show clashes, Daily/Weekly, Employees/Customers view mode).
const CUSTOMER_NAMES = [...new Set(UNASSIGNED_VISITS.map(v => v.customer))].sort()
const EMPLOYEE_NAMES = SAMPLE_EMPLOYEES.map(e => e.name)
const CONTRACT_TYPE_OPTIONS = ['Fulltime', 'Part time', 'Variable', 'Bank']
const SHIFT_OPTIONS = ['Morning', 'Afternoon', 'Evening', 'Overnight']
const MEDICAL_CONDITION_OPTIONS = ['Dementia', 'Diabetes', 'Mobility support', 'Epilepsy', 'Allergies']
const MORE_OPTIONS = ['Recently added', 'High priority', 'Recurring visits']

const FILTER_DEFS = [
  { key: 'customers', label: 'Customers', items: CUSTOMER_NAMES },
  { key: 'employees', label: 'Employees', items: EMPLOYEE_NAMES },
  { key: 'shifts', label: 'Shifts', items: SHIFT_OPTIONS },
  { key: 'area', label: 'Area', items: AREAS },
  { key: 'medicalConditions', label: 'Medical Conditions', items: MEDICAL_CONDITION_OPTIONS },
  { key: 'contractTypes', label: 'Contract types', items: CONTRACT_TYPE_OPTIONS },
  { key: 'more', label: 'More', items: MORE_OPTIONS },
]
const EMPTY_FILTERS = FILTER_DEFS.reduce((acc, f) => { acc[f.key] = new Set(); return acc }, {})

// ─── Main component ──────────────────────────────────────────────────────────

export default function DailySchedule() {
  const pageRef = useRef(null)

  const [visitDate, setVisitDate] = useState(() => new Date())
  const [viewBy, setViewBy] = useState('employees')       // 'employees' | 'customers'
  const [period, setPeriod] = useState('daily')           // 'daily' | 'weekly'
  const [showClashes, setShowClashes] = useState(false)
  const [scheduleViewMode, setScheduleViewMode] = useState('timeline') // 'timeline' | 'map' — decorative, no map view built

  const [visits, setVisits] = useState(UNASSIGNED_VISITS)
  const [unassignedView, setUnassignedView] = useState('timeline') // 'timeline' | 'list'
  const [sort, setSort] = useState({ col: null, dir: 'asc' })

  const [activeFilters, setActiveFilters] = useState(EMPTY_FILTERS)
  const [openFilterKey, setOpenFilterKey] = useState(null)
  const filterAnchorRefs = useRef({})

  const [assignVisit, setAssignVisit] = useState(null)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  const toggleSort = (col) => setSort(prev => prev.col === col ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' })

  const setFilter = (key, set) => setActiveFilters(prev => ({ ...prev, [key]: set }))
  const clearAllFilters = () => setActiveFilters(EMPTY_FILTERS)
  const anyFilterActive = Object.values(activeFilters).some(s => s.size > 0)

  // Only Customers/Area (real fields on every unassigned visit) and
  // Employees/Contract types (real fields on the sample employees below)
  // actually narrow anything down — see the FILTER_DEFS comment above for
  // why Shifts/Medical Conditions/More don't.
  const filteredVisits = useMemo(() => visits.filter(v =>
    (activeFilters.customers.size === 0 || activeFilters.customers.has(v.customer)) &&
    (activeFilters.area.size === 0 || activeFilters.area.has(v.area))
  ), [visits, activeFilters.customers, activeFilters.area])

  const filteredEmployees = useMemo(() => SAMPLE_EMPLOYEES.filter(e =>
    (activeFilters.employees.size === 0 || activeFilters.employees.has(e.name)) &&
    (activeFilters.contractTypes.size === 0 || activeFilters.contractTypes.has(e.type))
  ), [activeFilters.employees, activeFilters.contractTypes])

  const lanes = useMemo(() => packLanes(filteredVisits), [filteredVisits])
  const sortedVisits = useMemo(() => sortVisits(filteredVisits, sort), [filteredVisits, sort])

  // Fires from Components/EventPanel's own Save/Accept-assignment action
  // (never on a lone "+ Add" — that only fills a slot locally within the
  // panel, same as the original absent-employee prototype's own flow).
  // Per the ticket's own scope, "unassigned" means zero carers at all, so
  // the visit leaves this list the moment Save completes with anyone in a
  // slot — regardless of whether every required slot got filled.
  const handleAssignSave = (slots) => {
    const assignedNames = slots.filter(Boolean).map(s => s.name)
    setVisits(prev => prev.filter(v => v.id !== assignVisit.id))
    setAssignVisit(null)
    clearTimeout(toastTimer.current)
    setToast(`Assigned ${assignedNames.join(' and ')} to ${assignVisit.customer}'s visit`)
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }

  const isDailyEmployeesView = viewBy === 'employees' && period === 'daily'

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
          <TopNav userName={CURRENT_OFFICE_USER} appName="Bluebird Care Coleraine" />
          <ScheduleNav active="schedule" />

          <main className="ds-content">
            <div className="ds-page-header">
              <h6>Daily Schedule</h6>
              <div className="ds-date-center">
                <DatePicker
                  selected={visitDate}
                  onChange={d => d && setVisitDate(d)}
                  customInput={<DateRangeInput label={fmtDate(visitDate)} />}
                  calendarStartDay={1}
                  popperPlacement="bottom"
                  portalId="ds-datepicker-portal"
                />
              </div>
              <div className="ds-header-actions">
                <button className="round-btn tertiary-btn btn-icon-left"><CogIcon /> Actions</button>
                <button className="round-btn primary-btn">Publish</button>
                <button className="ds-icon-btn ds-icon-btn--badge" aria-label="Settings">
                  <SettingsIcon /><span className="ds-icon-badge">2</span>
                </button>
                <button className="ds-icon-btn" aria-label="Expand"><ExpandIcon /></button>
              </div>
            </div>

            <div className="ds-toolbar">
              <SegmentedToggle
                options={[{ value: 'employees', label: 'Employees' }, { value: 'customers', label: 'Customers' }]}
                value={viewBy}
                onChange={setViewBy}
              />
              <SegmentedToggle
                options={[{ value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }]}
                value={period}
                onChange={setPeriod}
              />
              <div className="ds-filters">
                {FILTER_DEFS.map(f => (
                  <Fragment key={f.key}>
                    <button
                      ref={el => { filterAnchorRefs.current[f.key] = el }}
                      className="ds-filter-btn"
                      onClick={() => setOpenFilterKey(prev => prev === f.key ? null : f.key)}
                    >
                      {f.label}
                      {activeFilters[f.key].size > 0 && <span className="ds-filter-badge">{activeFilters[f.key].size}</span>}
                      <ChevronDown />
                    </button>
                    <ScheduleFilterDropdown
                      items={f.items}
                      selected={activeFilters[f.key]}
                      onChange={(next) => setFilter(f.key, next)}
                      isOpen={openFilterKey === f.key}
                      onClose={() => setOpenFilterKey(null)}
                      anchorEl={filterAnchorRefs.current[f.key]}
                    />
                  </Fragment>
                ))}
                {anyFilterActive && (
                  <button className="clear-btn" onClick={clearAllFilters}><CloseIcon /> Clear</button>
                )}
              </div>
              <label className="checkbox-wrap ds-clashes">
                <input type="checkbox" checked={showClashes} onChange={e => setShowClashes(e.target.checked)} />
                <span className="checkbox-box" />
                Show clashes
              </label>
              <div className="ds-view-mode-toggle">
                <SegmentedToggle
                  options={[
                    { value: 'timeline', label: <Tooltip text="Timeline"><CalendarViewIcon /></Tooltip> },
                    { value: 'map', label: <Tooltip text="Map"><MapPinViewIcon /></Tooltip> },
                  ]}
                  value={scheduleViewMode}
                  onChange={setScheduleViewMode}
                />
              </div>
            </div>

            {!isDailyEmployeesView ? (
              <div className="ds-placeholder">
                {period === 'weekly' ? 'Weekly' : 'Customers'} view isn't built in this prototype — the Unassigned Visits list toggle (this ticket's focus) lives in the Daily / Employees view. Switch back to see it.
              </div>
            ) : (
              <div className="ds-grid">
                <div className="ds-row ds-timeline-header-row">
                  <div className="ds-row-label"><span>Employees<span className="ds-count">({filteredEmployees.length})</span></span></div>
                  <div className="ds-row-track ds-hour-marks">
                    {HOURS.map(h => <span key={h} className="ds-hour-mark">{h}</span>)}
                  </div>
                </div>

                <div className="ds-unassigned">
                  <div className="ds-row ds-unassigned-row">
                    <div className="ds-row-label ds-unassigned-label">
                      <span>Unassigned<span className="ds-count">({filteredVisits.length})</span></span>
                      <div className="ds-view-toggle">
                        <Tooltip text="Timeline">
                          <button
                            className={`ds-view-toggle-btn ${unassignedView === 'timeline' ? 'active' : ''}`}
                            onClick={() => setUnassignedView('timeline')}
                          >
                            <TimelineViewIcon />
                          </button>
                        </Tooltip>
                        <Tooltip text="List">
                          <button
                            className={`ds-view-toggle-btn ${unassignedView === 'list' ? 'active' : ''}`}
                            onClick={() => setUnassignedView('list')}
                          >
                            <ListViewIcon />
                          </button>
                        </Tooltip>
                      </div>
                    </div>

                    {unassignedView === 'timeline' ? (
                      <div className="ds-row-track ds-unassigned-lanes">
                        {lanes.map((lane, i) => (
                          <div key={i} className="ds-lane">
                            {lane.map(v => (
                              <button
                                key={v.id}
                                className="ds-unassigned-bar"
                                style={barStyle(v.start, v.end)}
                                onClick={() => setAssignVisit(v)}
                                title={`${v.customer} · ${v.start}–${v.end}`}
                              >
                                {v.customer}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="ds-row-track ds-row-track--plain ds-unassigned-list">
                        <div className="table-wrap">
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th className={sort.col === 'time' ? 'sorted' : ''}>
                                  <span>Time</span>
                                  <button className="col-icon-btn" onClick={() => toggleSort('time')}><SortIcon dir={sort.col === 'time' ? sort.dir : null} /></button>
                                </th>
                                <th className={`th-name ${sort.col === 'customer' ? 'sorted' : ''}`}>
                                  <span>Customer</span>
                                  <button className="col-icon-btn" onClick={() => toggleSort('customer')}><SortIcon dir={sort.col === 'customer' ? sort.dir : null} /></button>
                                </th>
                                <th className={sort.col === 'duration' ? 'sorted' : ''}>
                                  <span>Duration</span>
                                  <button className="col-icon-btn" onClick={() => toggleSort('duration')}><SortIcon dir={sort.col === 'duration' ? sort.dir : null} /></button>
                                </th>
                                <th className={sort.col === 'area' ? 'sorted' : ''}>
                                  <span>Area</span>
                                  <button className="col-icon-btn" onClick={() => toggleSort('area')}><SortIcon dir={sort.col === 'area' ? sort.dir : null} /></button>
                                </th>
                                <th className={sort.col === 'visitType' ? 'sorted' : ''}>
                                  <span>Visit Type</span>
                                  <button className="col-icon-btn" onClick={() => toggleSort('visitType')}><SortIcon dir={sort.col === 'visitType' ? sort.dir : null} /></button>
                                </th>
                                <th className={`th-num ${sort.col === 'assigned' ? 'sorted' : ''}`}>
                                  <span>Assigned</span>
                                  <button className="col-icon-btn" onClick={() => toggleSort('assigned')}><SortIcon dir={sort.col === 'assigned' ? sort.dir : null} /></button>
                                </th>
                                <th><span>Actions</span></th>
                              </tr>
                            </thead>
                            <tbody>
                              {sortedVisits.map(v => (
                                <tr key={v.id} className="data-row" onClick={() => setAssignVisit(v)}>
                                  <td className="nowrap">{v.start} – {v.end}</td>
                                  <td className="td-name">{v.customer}</td>
                                  <td className="nowrap">{fmtDuration(v.start, v.end)}</td>
                                  <td><AreaTag area={v.area} /></td>
                                  <td><VisitTypeTag visitType={v.visitType} /></td>
                                  <td className="td-num">0/{v.employeesRequired}</td>
                                  <td>
                                    <button className="round-btn secondary-btn ds-assign-btn" onClick={(e) => { e.stopPropagation(); setAssignVisit(v) }}>Assign</button>
                                  </td>
                                </tr>
                              ))}
                              {sortedVisits.length === 0 && (
                                <tr><td colSpan={7} className="table-empty">All sample unassigned visits have been assigned</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {filteredEmployees.map(emp => (
                  <div key={emp.id} className="ds-row">
                    <div className="ds-row-label ds-employee-label">
                      <div className="ds-avatar ds-avatar--employee">{emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                      <div>
                        <p className="ds-employee-name">{emp.name}</p>
                        <p className="ds-employee-hours">{emp.hoursDone} / {emp.hoursTotal}</p>
                      </div>
                      <button className="ds-employee-menu-btn" aria-label="More options">
                        <EllipsisIcon />
                      </button>
                    </div>
                    <div className="ds-row-track" />
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>

        {/* Rendered inside the pageRef-wrapped subtree (not as a sibling
            after it) so DevMode/DevEdit's own "is this click inside our
            recognized scope" check (container.contains(target)) includes
            it — matches how the original assign-visit-absent-employee-
            event-panel prototype already nests this same component inside
            its own pageRef wrapper. Rendering it as an outside sibling
            (as an earlier version of this file did) made every click
            inside the panel get swallowed as "outside scope" the moment
            any dev tool was active — position:fixed means moving it here
            in the DOM doesn't change where it visually renders. */}
        {assignVisit && (
          <EventPanel
            key={assignVisit.id}
            onClose={() => setAssignVisit(null)}
            statusBadge={{ label: 'Unassigned', tone: 'amber' }}
            customerInitials={assignVisit.customer.split(' ').map(n => n[0]).join('')}
            customerAvatarBg="var(--availability-3-green-tint)"
            customerName={assignVisit.customer}
            visitLabel={titleCase(assignVisit.visitType)}
            initialDateISO={toISODate(visitDate)}
            initialStart={assignVisit.start}
            initialEnd={assignVisit.end}
            recurrenceText={RECURRENCE_TEXT[assignVisit.visitType]}
            tabs={['Assign Employee']}
            employeesRequired={assignVisit.employeesRequired}
            initialSlots={Array(assignVisit.employeesRequired).fill(null)}
            recommendedEmployees={RECOMMENDED_EMPLOYEES}
            requireAtLeastOneAssigned
            onSave={handleAssignSave}
          />
        )}

        {toast && <div className="ds-toast">{toast}</div>}
      </div>
    </>
  )
}
