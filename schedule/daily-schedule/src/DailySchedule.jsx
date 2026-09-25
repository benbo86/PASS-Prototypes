import { Fragment, useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import DatePicker from 'react-datepicker'
import SideNav from '../../../Components/SideNav'
import TopNav from '../../../Components/TopNav'
import ScheduleNav from '../../../Components/ScheduleNav'
import EventPanel from '../../../Components/EventPanel'
import ModalPanel from '../../../Components/ModalPanel'
import SegmentedToggle from '../../../Components/SegmentedToggle'
import Tooltip from '../../../Components/Tooltip'
import ScheduleFilterDropdown from '../../../Components/ScheduleFilterDropdown'
import Pagination from '../../../Components/Pagination'
import { fmtDate, DateRangeInput } from '../../../Components/DateRangePicker'
import DevToolbar from '../../../Components/DevToolbar'
import DevMode from '../../../Components/DevMode'
import DevComments from '../../../Components/DevComments'
import DevEdit from '../../../Components/DevEdit'
import WireframeToggle from '../../../Components/WireframeToggle'
import AuditCapture from '../../../Components/AuditCapture'
import { useDevEditActive, useDevEditStickyDismiss } from '../../../Components/devEditHoverSticky'
import { AreaTag } from './Tags'
import {
  UNASSIGNED_VISITS, UNASSIGNED_SHIFTS, RECOMMENDED_EMPLOYEES, SAMPLE_EMPLOYEES, AREAS,
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
// Icons/Check.svg, copied verbatim (fill swapped to currentColor) — the
// Publish button's left icon.
const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <polygon fill="currentColor" points="9.29090299 15.7925373 5.47272117 12.0313433 4.1999939 13.2850746 9.29090299 18.3 20.1999939 7.55373134 18.9272666 6.3" />
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
// Calendar/Map Pin — the 24×24-viewBox variants from PASS Icons, rendered
// at 16×16px (Ben's own follow-up size request).
const CalendarViewIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
)
const MapPinViewIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
  </svg>
)
// Icons/Ellipsis 2.svg, copied verbatim (fill swapped to currentColor).
const EllipsisIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" fillRule="evenodd" d="M12 6.5c.825 0 1.5-.675 1.5-1.5s-.675-1.5-1.5-1.5-1.5.675-1.5 1.5.675 1.5 1.5 1.5zm0 4c-.825 0-1.5.675-1.5 1.5s.675 1.5 1.5 1.5 1.5-.675 1.5-1.5-.675-1.5-1.5-1.5zm0 7c-.825 0-1.5.675-1.5 1.5s.675 1.5 1.5 1.5 1.5-.675 1.5-1.5-.675-1.5-1.5-1.5z" />
  </svg>
)
// List-view button icon — opens the Unassigned list as a modal (see the
// listModalOpen state comment further down); no longer paired with a
// timeline-view icon since this stopped being a toggle.
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
// A generic swap/repeat pictogram (not sourced from Figma, same "kept
// local and minimal" treatment as the hover-card icons below) — the
// time-adjusted indicator next to a visit's time, replacing an earlier
// plain edit-pencil version per Ben's own attached reference (two curved
// arrows swapping direction, reading more clearly as "this time changed"
// than a generic edit icon did). Coloured amber via CSS, matching the
// reference image's own colouring rather than inheriting currentColor.
const TimeAdjustedIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 10 3 6l4-4" />
    <path d="M3 6h13a4 4 0 0 1 4 4v1" />
    <path d="M17 14l4 4-4 4" />
    <path d="M21 18H8a4 4 0 0 1-4-4v-1" />
  </svg>
)
// Small clock/calendar/person glyphs for the shift hover card only — kept
// local and minimal (not promoted to Icons/) since they're not sourced
// from Figma, just plain generic pictograms for this one card.
const HoverClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)
const HoverCalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
)
const HoverPersonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
  </svg>
)
const HoverPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
  </svg>
)
const HoverPhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8 10a16 16 0 0 0 6 6l1.3-1.4a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" />
  </svg>
)
const HoverHomeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" />
  </svg>
)
// Icons/Warning.svg, copied verbatim (fill swapped to currentColor) — the
// visit hover card's own bottom "requires N employees" banner.
const HoverWarningIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M10.27,3.99 C11.04,2.66 12.96,2.66 13.73,3.99 L21.26,17 C22.03,18.33 21.07,20 19.53,20 L4.47,20 C2.93,20 1.97,18.33 2.74,17 Z M12,15
      C11.4477153,15 11,15.4477153 11,16 C11,16.5522847 11.4477153,17 12,17 C12.5522847,17 13,16.5522847 13,16 C13,15.4477153 12.5522847,15 12,15 Z M12,7
      C11.4477153,7 11,7.44771525 11,8 L11,12 C11,12.5522847 11.4477153,13 12,13 C12.5522847,13 13,12.5522847 13,12 L13,8 C13,7.44771525 12.5522847,7 12,7 Z" />
  </svg>
)
// Icons/Run.svg, copied verbatim (fill swapped to currentColor) — the
// shift hover card's own top badge icon, per Ben's own request to use the
// existing Run icon rather than the Recurs icon this originally reused.
const ShiftBadgeIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" fillRule="nonzero" d="M17.5316862,2.25 C19.9042089,2.25 21.8103775,4.17252165 21.8103775,6.56109363 C21.8103775,7.8496122 21.3837488,8.78195426 20.3219865,10.0738404 L20.1732443,10.2523025 L19.7081836,10.7935427 C19.1579376,11.4366344 18.7242877,11.9825709 18.3228589,12.5536133 L18.1736687,12.7691698 L18.0521069,12.9635835 C18.0043383,13.0406934 17.9396825,13.1058825 17.8632144,13.1546699 C17.5785244,13.3363048 17.2004933,13.2527621 17.0191918,12.9678594 L16.9463007,12.854717 L16.890097,12.77017 C16.5022598,12.200899 16.0833253,11.658275 15.5733798,11.0511815 L15.3490849,10.7867858 L14.8755401,10.2352557 L14.6389457,9.94903468 L14.4294845,9.68356497 C14.1341575,9.2985939 13.9203798,8.96793102 13.7430368,8.62080199 C13.4137771,7.97631297 13.25,7.31890047 13.25,6.56109363 C13.25,4.17297543 15.1583415,2.25 17.5316862,2.25 Z M17.5316862,3.47291108 C15.8362095,3.47291108 14.4729111,4.84590921 14.4729111,6.56109363 C14.4729111,7.11498404 14.585996,7.58279609 14.8320591,8.06443701 C14.9496979,8.29470185 15.0899372,8.51980245 15.2738098,8.77155709 L15.3895377,8.92606291 L15.5815192,9.16988989 L15.8033741,9.43861563 L16.27801,9.99141826 C16.7207576,10.5085118 17.0915491,10.9673927 17.427079,11.4177677 L17.5314117,11.5594769 L17.5879302,11.4818583 C17.8822707,11.0833493 18.204096,10.6790482 18.5850789,10.226845 L18.7806467,9.99655663 L19.238958,9.46323938 C20.2743722,8.2372622 20.5874665,7.54526007 20.5874665,6.56109363 C20.5874665,4.84511326 19.2259968,3.47291108 17.5316862,3.47291108 Z M17.5301888,5.61300546 C18.0342755,5.61300546 18.4473721,6.02610205 18.4473721,6.53018877 C18.4473721,7.0342755 18.0342755,7.44737208 17.5301888,7.44737208 C17.026102,7.44737208 16.6130055,7.0342755 16.6130055,6.53018877 C16.6130055,6.02610205 17.026102,5.61300546 17.5301888,5.61300546 Z" />
    <path fill="currentColor" fillRule="nonzero" d="M17.2801888,14.25 C17.6944023,14.25 18.0301888,14.5857864 18.0301888,15 C18.0301888,15.3796958 17.7480349,15.693491 17.3819593,15.7431534 L17.2801888,15.75 L9.72977518,15.75 C9.30206188,15.75 8.95533174,16.0967301 8.95533174,16.5244434 C8.95533174,16.916514 9.24668137,17.2405361 9.62468779,17.2918171 L9.72977518,17.2988869 L19.3963725,17.2988869 C20.7092665,17.2988869 21.7735774,18.3631977 21.7735774,19.6760918 C21.7735774,20.9342819 20.7961113,21.9641725 19.5591305,22.0478124 L19.3963725,22.0532967 L5.75,22.0532967 C5.33578644,22.0532967 5,21.7175102 5,21.3032967 C5,20.9236009 5.28215388,20.6098057 5.64822944,20.5601433 L5.75,20.5532967 L19.3963725,20.5532967 C19.8808394,20.5532967 20.2735774,20.1605586 20.2735774,19.6760918 C20.2735774,19.2288916 19.9389367,18.8598509 19.5064072,18.8057215 L19.3963725,18.7988869 L9.72977518,18.7988869 C8.47363475,18.7988869 7.45533174,17.7805839 7.45533174,16.5244434 C7.45533174,15.3206422 8.39054406,14.3352715 9.57405282,14.2552472 L9.72977518,14.25 L17.2801888,14.25 Z M3.1628418,20.5532967 C3.57705536,20.5532967 3.9128418,20.8890831 3.9128418,21.3032967 C3.9128418,21.6829924 3.63068792,21.9967876 3.26461235,22.04645 L3.1628418,22.0532967 L2.84210526,22.0532967 C2.4278917,22.0532967 2.09210526,21.7175102 2.09210526,21.3032967 C2.09210526,20.9236009 2.37425914,20.6098057 2.74033471,20.5601433 L2.84210526,20.5532967 L3.1628418,20.5532967 Z" />
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

// "Tuesday, Sept 8th, 2026" — the shift hover card's own long-date format
// (matches the live product screenshot exactly, including "Sept" rather
// than the more usual 3-letter "Sep"), always reflecting whichever date
// is currently selected at the top of the page — a shift preview only
// ever means "this shift, on the day currently being viewed".
const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
const WEEKDAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
function ordinalSuffix(n) {
  const j = n % 10, k = n % 100
  if (j === 1 && k !== 11) return 'st'
  if (j === 2 && k !== 12) return 'nd'
  if (j === 3 && k !== 13) return 'rd'
  return 'th'
}
function fmtLongDate(date) {
  const day = date.getDate()
  return `${WEEKDAY_FULL[date.getDay()]}, ${MONTH_ABBR[date.getMonth()]} ${day}${ordinalSuffix(day)}, ${date.getFullYear()}`
}

// "Morning with Roger Sadgrove" — the visit hover card's own heading,
// reproduced from Ben's attached reference. Derived from the visit's own
// start time rather than a stored field, same "decorative but real chrome"
// treatment RECURRENCE_TEXT above already uses.
function timeOfDayLabel(start) {
  const hour = toMinutes(start) / 60
  if (hour < 12) return 'Morning'
  if (hour < 17) return 'Afternoon'
  if (hour < 21) return 'Evening'
  return 'Night'
}

// Address/phone number aren't real fields anywhere in this prototype's
// data — both are derived deterministically from the visit's own id/area
// so the same visit always shows the same plausible-looking (but entirely
// fictional) contact details, without needing to hand-author ~30 addresses
// and phone numbers that would never be read anywhere else.
const HOVER_STREET_NAMES = ['Grove Park', 'Mill Road', 'Church Street', 'Station Road', 'Kings Avenue', 'Highfield Drive', 'Orchard Close', 'Willow Way']
const HOVER_AREA_POSTCODE = {
  'Coleraine Central': 'BT52', 'Portstewart': 'BT55', 'Portrush': 'BT56', 'Ballymoney': 'BT53', 'Castlerock': 'BT51',
}
function deriveAddress(visit) {
  const n = typeof visit.id === 'number' ? visit.id : visit.id.length
  const houseNumber = (n * 7) % 90 + 1
  const street = HOVER_STREET_NAMES[n % HOVER_STREET_NAMES.length]
  const prefix = HOVER_AREA_POSTCODE[visit.area] || 'BT1'
  return `${houseNumber}${n % 3 === 0 ? 'A' : ''} ${street}, ${prefix} ${(n % 9) + 1}${String.fromCharCode(65 + (n % 26))}${String.fromCharCode(65 + ((n * 3) % 26))}`
}
function derivePhone(visit) {
  const n = typeof visit.id === 'number' ? visit.id : visit.id.length
  const digits = String(100000000 + (n * 137) % 799999999)
  return `07${digits}`
}

// ─── Shift hover card ───────────────────────────────────────────────────────

// Reproduces the live product's own shift hover-preview (see the attached
// screenshot this was built from), with this prototype's own shift data
// substituted in. Portaled to document.body — a plain `position:fixed`
// child of the shift row would be clipped by Components/ModalPanel's own
// `overflow-y:auto` body, since the card needs to render fully visible
// above (and clear of) that scroll container. `rect`/`cursorX` are both
// captured once on mouseenter (viewport-relative, so they stay correct
// regardless of the modal's internal scroll position) — no live-follow
// needed for a hover card that disappears the moment the mouse actually
// leaves the row. Horizontal position follows the cursor (per Ben's own
// follow-up ask), vertical stays anchored to the row's own top edge so
// the card is reliably above the row regardless of where in it the mouse
// entered — the two axes are deliberately independent. `cardWidth` mirrors
// .ds-shift-hover-card's own CSS width — kept in sync by hand since the
// clamp below needs it before the card has ever actually rendered.
const HOVER_CARD_WIDTH = 240
const HOVER_CARD_GAP = 8

// Prefers 'above' (the established default), but flips to 'below' when
// there genuinely isn't room above and there is below — and the reverse,
// for a row low enough that 'below' would itself run off the bottom of
// the viewport. Needs the card's own actual rendered height, which isn't
// known until it's already in the DOM (its content varies — a shift's
// Template section, a visit's optional Plan time line, etc. — so it can't
// be hardcoded), hence the two-step "render once, measure via ref, correct
// before paint" approach every position-flipping popover in this repo uses
// (Components/Tooltip.jsx's own updatePosition does the same for its
// width). useLayoutEffect specifically — it runs synchronously after the
// DOM update but before the browser paints, so a correction here is never
// visible as a flicker the way a plain useEffect's (paint-then-correct)
// would be. No dependency array: cheap (one offsetHeight read plus a
// comparison) and needs to re-check on every render of a given card
// instance, not just its first — safe because setPlacement is a no-op
// once the computed value stops changing, so this can't loop.
function useCardPlacement(cardRef, rect) {
  const [placement, setPlacement] = useState('above')
  useLayoutEffect(() => {
    if (!cardRef.current) return
    const cardHeight = cardRef.current.offsetHeight
    const fitsAbove = rect.top >= cardHeight + HOVER_CARD_GAP
    const fitsBelow = (window.innerHeight - rect.bottom) >= cardHeight + HOVER_CARD_GAP
    // 'above' unless it's cropped at the top and 'below' genuinely has
    // room; if 'below' would ALSO be cropped (at the bottom), fall back to
    // 'above' regardless — matching "above" being the one true default,
    // with "below" only ever a deliberate exception for the one case it
    // actually solves (a row too close to the top of the window).
    const next = (!fitsAbove && fitsBelow) ? 'below' : 'above'
    setPlacement(prev => prev === next ? prev : next)
  })
  return placement
}

function cardPlacementStyle(placement, rect) {
  return placement === 'below'
    ? { top: rect.bottom + HOVER_CARD_GAP }
    : { bottom: window.innerHeight - rect.top + HOVER_CARD_GAP }
}

function ShiftHoverCard({ shift, rect, cursorX, visitDate, interactive }) {
  const cardRef = useRef(null)
  const placement = useCardPlacement(cardRef, rect)
  const left = Math.min(cursorX, window.innerWidth - HOVER_CARD_WIDTH - 16)
  return createPortal(
    <div ref={cardRef} className="ds-shift-hover-card" style={{ ...cardPlacementStyle(placement, rect), left, pointerEvents: interactive ? 'auto' : 'none' }}>
      <div className="ds-shift-hover-badge"><ShiftBadgeIcon /></div>
      <div className="ds-shift-hover-row"><HoverClockIcon /> {shift.start} – {shift.end}</div>
      <div className="ds-shift-hover-row"><HoverCalendarIcon /> {fmtLongDate(visitDate)}</div>
      <div className="ds-shift-hover-assigned">0/{shift.employeesRequired} employees assigned</div>
      <div className="ds-shift-hover-divider" />
      <div className="ds-shift-hover-heading">Template</div>
      <div className="ds-shift-hover-line">Payable: {shift.template.payable ? 'Yes' : 'No'}</div>
      <div className="ds-shift-hover-line">Chargeable: {shift.template.chargeable ? 'Yes' : 'No'}</div>
      <div className="ds-shift-hover-line">{shift.template.cadence}, {shift.visits.length} visits</div>
      <div className="ds-shift-hover-divider" />
      <div className="ds-shift-hover-heading">Default employee</div>
      <div className="ds-shift-hover-row"><HoverPersonIcon /> {shift.defaultEmployee}</div>
    </div>,
    document.body,
  )
}

// ─── Visit hover card ───────────────────────────────────────────────────────

// Same portal/positioning approach as ShiftHoverCard just above, reused for
// a plain (or shift-nested) visit row instead of a shift row — see that
// component's own comment for why it's portaled and how positioning works.
// Deliberately a separate component rather than one merged/branching card:
// the two show almost entirely different fields (a shift's Template/
// Default-employee sections have no visit equivalent, and a visit's own
// address/phone/plan-time have no shift equivalent), so a shared shell
// would end up as more conditionals than actual sharing.
function VisitHoverCard({ visit, rect, cursorX, visitDate, interactive }) {
  const cardRef = useRef(null)
  const placement = useCardPlacement(cardRef, rect)
  const initials = visit.customer.split(' ').map(n => n[0]).join('').slice(0, 2)
  const left = Math.min(cursorX, window.innerWidth - HOVER_CARD_WIDTH - 16)
  return createPortal(
    <div ref={cardRef} className="ds-visit-hover-card" style={{ ...cardPlacementStyle(placement, rect), left, pointerEvents: interactive ? 'auto' : 'none' }}>
      <div className="ds-visit-hover-top">
        <div className="ds-avatar ds-avatar--employee ds-visit-hover-avatar">{initials}</div>
        <span className="ep-unassigned-badge">Unassigned</span>
      </div>
      <div className="ds-visit-hover-heading">{timeOfDayLabel(visit.start)} with <strong>{visit.customer}</strong></div>
      <div className="ds-visit-hover-tags">
        <span className="ds-visit-hover-tag ds-visit-hover-tag--service"><HoverHomeIcon /> Home Care</span>
        <AreaTag area={visit.area} />
      </div>
      <div className="ds-shift-hover-divider" />
      {visit.timeAdjusted ? (
        <>
          <div className="ds-shift-hover-row ds-visit-hover-adjusted-row">
            <HoverClockIcon /> Adjusted time
            <span className="ds-time-adjusted-icon"><TimeAdjustedIcon /></span>
            {visit.start} – {visit.end}
          </div>
          <div className="ds-visit-hover-plan-row">Plan time: <span className="ds-visit-hover-plan-strike">{visit.planStart} – {visit.planEnd}</span></div>
        </>
      ) : (
        <div className="ds-shift-hover-row"><HoverClockIcon /> {visit.start} – {visit.end}</div>
      )}
      <div className="ds-shift-hover-row"><HoverCalendarIcon /> {fmtLongDate(visitDate)}</div>
      <div className="ds-shift-hover-row"><HoverPinIcon /> {deriveAddress(visit)}</div>
      <div className="ds-shift-hover-row"><HoverPhoneIcon /> {derivePhone(visit)}</div>
      <div className="ds-shift-hover-divider" />
      <div className="ds-shift-hover-assigned">0/{visit.employeesRequired} employees assigned</div>
      <div className="ds-shift-hover-row"><HoverPersonIcon /> Unassigned</div>
      <div className="ds-visit-hover-warning">
        <HoverWarningIcon /> Visit requires {visit.employeesRequired} employee{visit.employeesRequired > 1 ? 's' : ''}
      </div>
    </div>,
    document.body,
  )
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
  const [shifts, setShifts] = useState(UNASSIGNED_SHIFTS)
  const [expandedShiftIds, setExpandedShiftIds] = useState(() => new Set())
  // Opened via the same button as before, but no longer a toggle — the
  // Unassigned area itself always shows the timeline/lanes view now (the
  // engineering team flagged the inline-list-view approach as hard to
  // reconcile with the FullCalendar plugin this row's timeline is actually
  // built on), and the list is its own modal instead.
  const [listModalOpen, setListModalOpen] = useState(false)
  // A single slot for whichever hover card is currently showing (a shift
  // row's or a plain/shift-visit row's) — one state rather than two so
  // moving the cursor straight from a shift row onto a visit row (or vice
  // versa) naturally replaces one card with the other, with no possibility
  // of both being considered "current" at once.
  const [hoverCard, setHoverCard] = useState(null) // { type: 'shift', shift, rect, cursorX } | { type: 'visit', visit, rect, cursorX } | null
  const [sort, setSort] = useState({ col: null, dir: 'asc' })

  // Whenever Dev Edit is active, the shift/visit hover cards switch from
  // their normal transient behavior to staying open past mouseleave and
  // becoming clickable — the whole point of Dev Edit being active is to
  // select/style things, and a card that vanishes the instant you try to
  // move the cursor into it can never be reached otherwise. An earlier
  // version gated this behind its own separate "Show hover elements"
  // checkbox on top of Dev Edit already being active — removed as a
  // redundant extra step once it was clear Dev Edit active is already the
  // only signal that matters here. Hovering a different row still swaps to
  // that row's card rather than stacking multiple at once; turning Dev
  // Edit off, Escape, or a click elsewhere all still dismiss whichever
  // card is currently pinned — see Components/devEditHoverSticky.js for
  // the shared mechanism (originally hand-rolled here first, then
  // extracted once Components/Tooltip.jsx needed the identical behavior;
  // consolidated back onto the shared version once a real bug surfaced in
  // the exclusion list — see that file's own comment on the fix).
  const devEditActive = useDevEditActive()
  const hoverCardSticky = devEditActive
  useDevEditStickyDismiss(devEditActive, !!hoverCard, () => setHoverCard(null), '.ds-shift-hover-card, .ds-visit-hover-card')

  const [activeFilters, setActiveFilters] = useState(EMPTY_FILTERS)
  const [openFilterKey, setOpenFilterKey] = useState(null)
  const filterAnchorRefs = useRef({})

  const [assignVisit, setAssignVisit] = useState(null)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  // Clicking a row hides the list modal (see the ModalPanel's own `open`
  // prop below) to make room for the assign flow — but that click never
  // fires the row's own onMouseLeave, since the row itself is what
  // disappears. Without this, the hover card captured from that hover
  // stays floating on screen indefinitely, with nothing left to hide it.
  // Clearing it whenever the modal isn't actually visible (closed outright,
  // or hidden behind the assign panel) covers both that path and the
  // "closed the modal by some other means while still hovering a row" case
  // uniformly, rather than duplicating a setHoverCard(null) call at every
  // click handler that can make the modal disappear.
  useEffect(() => {
    if (!listModalOpen || assignVisit) setHoverCard(null)
  }, [listModalOpen, assignVisit])

  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const toggleSort = (col) => setSort(prev => prev.col === col ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' })

  const setFilter = (key, set) => { setActiveFilters(prev => ({ ...prev, [key]: set })); setPage(1) }
  const clearAllFilters = () => { setActiveFilters(EMPTY_FILTERS); setPage(1) }
  const anyFilterActive = Object.values(activeFilters).some(s => s.size > 0)

  // Only Customers/Area (real fields on every unassigned visit) and
  // Employees/Contract types (real fields on the sample employees below)
  // actually narrow anything down — see the FILTER_DEFS comment above for
  // why Shifts/Medical Conditions/More don't.
  const filteredVisits = useMemo(() => visits.filter(v =>
    (activeFilters.customers.size === 0 || activeFilters.customers.has(v.customer)) &&
    (activeFilters.area.size === 0 || activeFilters.area.has(v.area))
  ), [visits, activeFilters.customers, activeFilters.area])

  // A shift has no single customer (it covers several), so only Area
  // narrows it down — the Customers filter is deliberately skipped for
  // shift rows rather than hiding a shift because one of its several
  // customers doesn't match.
  const filteredShifts = useMemo(() => shifts.filter(s =>
    (activeFilters.area.size === 0 || activeFilters.area.has(s.area))
  ), [shifts, activeFilters.area])

  const filteredEmployees = useMemo(() => SAMPLE_EMPLOYEES.filter(e =>
    (activeFilters.employees.size === 0 || activeFilters.employees.has(e.name)) &&
    (activeFilters.contractTypes.size === 0 || activeFilters.contractTypes.has(e.type))
  ), [activeFilters.employees, activeFilters.contractTypes])

  // The timeline view (bars on the hour grid) is deliberately unchanged by
  // this round — it stays scoped to plain visits only, same as before.
  // Shifts are a list-view-only concept for now (an expandable row needs a
  // row to expand); representing a shift as a single bar covering several
  // non-contiguous visits on the hour grid is a different, bigger design
  // problem this round doesn't attempt to solve.
  const lanes = useMemo(() => packLanes(filteredVisits), [filteredVisits])

  // Shifts and plain visits share the exact same field names (customer/
  // start/end/area/visitType/employeesRequired — see data.js's own comment
  // on UNASSIGNED_SHIFTS), so they combine into one sortable/paginatable
  // list with no special-casing in sortVisits itself.
  const combinedRows = useMemo(() => [...filteredVisits, ...filteredShifts], [filteredVisits, filteredShifts])
  const sortedRows = useMemo(() => sortVisits(combinedRows, sort), [combinedRows, sort])

  // "Unassigned (N)" counts individual visits still needing cover, whether
  // shown as their own row or nested inside a shift — a more meaningful
  // number than "rows in the list", which would shrink misleadingly the
  // moment 3 visits collapse into 1 shift row.
  const totalUnassignedVisits = filteredVisits.length + filteredShifts.reduce((sum, s) => sum + s.visits.length, 0)

  // List view pagination — Components/Pagination.jsx, same wiring as
  // schedule/leave-requests' own table. Paginates top-level rows only — a
  // shift's own nested visit rows render as part of their parent shift's
  // row and aren't separately counted/paged, same as any other expandable
  // table convention.
  const totalRows = sortedRows.length
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage))
  const safePage = Math.min(page, totalPages)
  const pageRows = sortedRows.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage)
  const showStart = totalRows === 0 ? 0 : (safePage - 1) * rowsPerPage + 1
  const showEnd = Math.min(safePage * rowsPerPage, totalRows)

  const toggleShiftExpanded = (id) => setExpandedShiftIds(prev => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id); else next.add(id)
    return next
  })

  // Assigning the shift as a whole vs. assigning one visit within it are
  // two different actions with two different outcomes on Save (see
  // handleAssignSave below) — both open the same EventPanel, distinguished
  // only by `assignKind` (and `shiftId` for the nested-visit case) carried
  // on the synthesized object passed to setAssignVisit.
  const handleAssignShift = (shift) => setAssignVisit({
    id: shift.id, customer: shift.customer, start: shift.start, end: shift.end,
    visitType: shift.visitType, employeesRequired: shift.employeesRequired,
    assignKind: 'shift',
  })
  const handleAssignShiftVisit = (shiftId, visit) => setAssignVisit({ ...visit, assignKind: 'shiftVisit', shiftId })

  // Fires from Components/EventPanel's own Save/Accept-assignment action
  // (never on a lone "+ Add" — that only fills a slot locally within the
  // panel, same as the original absent-employee prototype's own flow).
  // Per the ticket's own scope, "unassigned" means zero carers at all, so
  // the visit leaves this list the moment Save completes with anyone in a
  // slot — regardless of whether every required slot got filled. A shift
  // assignment removes the whole shift (every visit in it is now covered
  // by whoever was just assigned); a single shift-visit assignment only
  // removes that one visit from its shift, and the shift itself disappears
  // too once its last remaining visit has been individually assigned.
  const handleAssignSave = (slots) => {
    const assignedNames = slots.filter(Boolean).map(s => s.name)
    if (assignVisit.assignKind === 'shift') {
      setShifts(prev => prev.filter(s => s.id !== assignVisit.id))
    } else if (assignVisit.assignKind === 'shiftVisit') {
      setShifts(prev => prev
        .map(s => s.id === assignVisit.shiftId ? { ...s, visits: s.visits.filter(sv => sv.id !== assignVisit.id) } : s)
        .filter(s => s.visits.length > 0))
    } else {
      setVisits(prev => prev.filter(v => v.id !== assignVisit.id))
    }
    setAssignVisit(null)
    clearTimeout(toastTimer.current)
    const target = assignVisit.assignKind === 'shift' ? `${assignVisit.customer} shift` : `${assignVisit.customer}'s visit`
    setToast(`Assigned ${assignedNames.join(' and ')} to ${target}`)
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
                <button className="round-btn primary-btn btn-icon-left"><CheckIcon /> Publish</button>
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
                      <div className="ds-unassigned-heading">
                        <span>Unassigned<span className="ds-count">({totalUnassignedVisits})</span></span>
                        {/* No longer a toggle (see the listModalOpen state comment
                            above for why) — this always opens the list as a modal,
                            so it always shows the same icon/tooltip regardless of
                            whether the modal happens to be open right now. */}
                        <Tooltip text="View as list">
                          <button className="ds-view-switch-btn" onClick={() => setListModalOpen(true)}>
                            <ListViewIcon />
                          </button>
                        </Tooltip>
                      </div>
                    </div>

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

        {/* Components/ModalPanel.jsx's own overlay (z-index 10850) sits
            well above Components/EventPanel.jsx's (100/200 — it was only
            ever designed to layer over this page's own plain content, not
            another modal) — opening the assign flow from a row inside this
            modal would otherwise render EventPanel invisibly behind it.
            `open` is gated on `!assignVisit` rather than closing the modal
            outright, so it reappears automatically once the assign flow
            finishes (Save or Close) and the office user can carry on
            working through the rest of the list without re-opening it. */}
        <ModalPanel
          open={listModalOpen && !assignVisit}
          onClose={() => setListModalOpen(false)}
          title="Unassigned visits"
          width={1160}
          footer={
            <Pagination
              page={safePage} totalPages={totalPages} rowsPerPage={rowsPerPage}
              showStart={showStart} showEnd={showEnd} totalRows={totalRows}
              onPageChange={setPage}
              onRowsPerPageChange={n => { setRowsPerPage(n); setPage(1) }}
            />
          }
        >
          <div className="ds-list-modal-body table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th className={sort.col === 'time' ? 'sorted' : ''}>
                    <span>Time</span>
                    <button className="col-icon-btn" onClick={() => toggleSort('time')}><SortIcon dir={sort.col === 'time' ? sort.dir : null} /></button>
                  </th>
                  <th className={`th-name ${sort.col === 'customer' ? 'sorted' : ''}`}>
                    <span>Customer/Shift</span>
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
                    <span>Visit/Shift type</span>
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
                {pageRows.map(row => row.kind === 'shift' ? (
                  <Fragment key={row.id}>
                    <tr
                      className="data-row ds-shift-row"
                      onClick={() => handleAssignShift(row)}
                      onMouseEnter={(e) => setHoverCard({ type: 'shift', shift: row, rect: e.currentTarget.getBoundingClientRect(), cursorX: e.clientX })}
                      onMouseLeave={() => { if (!hoverCardSticky) setHoverCard(null) }}
                    >
                      <td className="nowrap">{row.start} – {row.end}</td>
                      <td className="td-name">
                        <button
                          className={`ds-shift-expand-btn${expandedShiftIds.has(row.id) ? ' expanded' : ''}`}
                          onClick={(e) => { e.stopPropagation(); toggleShiftExpanded(row.id) }}
                          aria-label={expandedShiftIds.has(row.id) ? 'Collapse shift' : 'Expand shift'}
                        >
                          <ChevronDown />
                        </button>
                        {row.customer}
                        <span className="ds-shift-visit-count">({row.visits.length} visits)</span>
                      </td>
                      <td className="nowrap">{fmtDuration(row.start, row.end)}</td>
                      <td><AreaTag area={row.area} /></td>
                      <td>{row.visitType}</td>
                      <td className="td-num">0/{row.employeesRequired}</td>
                      <td>
                        <button className="round-btn secondary-btn ds-assign-btn" onClick={(e) => { e.stopPropagation(); handleAssignShift(row) }}>Assign</button>
                      </td>
                    </tr>
                    {expandedShiftIds.has(row.id) && row.visits.map(sv => (
                      <tr
                        key={sv.id}
                        className="data-row ds-shift-visit-row"
                        onClick={() => handleAssignShiftVisit(row.id, sv)}
                        onMouseEnter={(e) => setHoverCard({ type: 'visit', visit: { ...sv, area: row.area }, rect: e.currentTarget.getBoundingClientRect(), cursorX: e.clientX })}
                        onMouseLeave={() => { if (!hoverCardSticky) setHoverCard(null) }}
                      >
                        <td className="nowrap">
                          {sv.start} – {sv.end}
                          {sv.timeAdjusted && (
                            <Tooltip text="Time adjusted from the original schedule">
                              <span className="ds-time-adjusted-icon"><TimeAdjustedIcon /></span>
                            </Tooltip>
                          )}
                        </td>
                        <td className="td-name ds-shift-visit-name">{sv.customer}</td>
                        <td className="nowrap">{fmtDuration(sv.start, sv.end)}</td>
                        <td><AreaTag area={row.area} /></td>
                        <td>{sv.visitType}</td>
                        <td className="td-num">0/{sv.employeesRequired}</td>
                        <td>
                          <button className="round-btn secondary-btn ds-assign-btn" onClick={(e) => { e.stopPropagation(); handleAssignShiftVisit(row.id, sv) }}>Assign</button>
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ) : (
                  <tr
                    key={row.id}
                    className="data-row"
                    onClick={() => setAssignVisit({ ...row, assignKind: 'visit' })}
                    onMouseEnter={(e) => setHoverCard({ type: 'visit', visit: row, rect: e.currentTarget.getBoundingClientRect(), cursorX: e.clientX })}
                    onMouseLeave={() => { if (!hoverCardSticky) setHoverCard(null) }}
                  >
                    <td className="nowrap">
                      {row.start} – {row.end}
                      {row.timeAdjusted && (
                        <Tooltip text="Time adjusted from the original schedule">
                          <span className="ds-time-adjusted-icon"><TimeAdjustedIcon /></span>
                        </Tooltip>
                      )}
                    </td>
                    <td className="td-name">{row.customer}</td>
                    <td className="nowrap">{fmtDuration(row.start, row.end)}</td>
                    <td><AreaTag area={row.area} /></td>
                    <td>{row.visitType}</td>
                    <td className="td-num">0/{row.employeesRequired}</td>
                    <td>
                      <button className="round-btn secondary-btn ds-assign-btn" onClick={(e) => { e.stopPropagation(); setAssignVisit({ ...row, assignKind: 'visit' }) }}>Assign</button>
                    </td>
                  </tr>
                ))}
                {totalRows === 0 && (
                  <tr><td colSpan={7} className="table-empty">All sample unassigned visits have been assigned</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </ModalPanel>

        {/* key forces a fresh mount (and therefore a fresh 'above'-first
            placement guess) whenever the hovered row genuinely changes,
            rather than carrying over whichever placement the previous
            target's card settled on. */}
        {hoverCard?.type === 'shift' && <ShiftHoverCard key={hoverCard.shift.id} shift={hoverCard.shift} rect={hoverCard.rect} cursorX={hoverCard.cursorX} visitDate={visitDate} interactive={hoverCardSticky} />}
        {hoverCard?.type === 'visit' && <VisitHoverCard key={hoverCard.visit.id} visit={hoverCard.visit} rect={hoverCard.rect} cursorX={hoverCard.cursorX} visitDate={visitDate} interactive={hoverCardSticky} />}

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
