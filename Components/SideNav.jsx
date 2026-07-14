import { useState } from 'react'
import passEmblemUrl from '../Images/PASS Emblem.png'

// ─── Nav icons ────────────────────────────────────────────────
// Copied verbatim from Icons/PASS side nav/*.svg (Lucide icons), just
// with the per-path hardcoded stroke="#9CA3AF" removed so they inherit
// stroke="currentColor" from the wrapping <svg> — needed so the active
// nav item can recolor to purple. Static reference files are unchanged.

const CustomersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)
const EmployeesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <path d="M16 3.128a4 4 0 0 1 0 7.744" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <circle cx="9" cy="7" r="4" />
  </svg>
)
const BookingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </svg>
)
const ScheduleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 14v2.2l1.6 1" />
    <path d="M16 2v4" />
    <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" />
    <path d="M3 10h5" />
    <path d="M8 2v4" />
    <circle cx="16" cy="16" r="6" />
  </svg>
)
const FinanceIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 7h6v6" />
    <path d="m22 7-8.5 8.5-5-5L2 17" />
  </svg>
)
const ReportingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v16a2 2 0 0 0 2 2h16" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </svg>
)
const AlertsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
)
const EnquiriesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
    <path d="M14 2v5a1 1 0 0 0 1 1h5" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
)
const TimelineIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 22h14" />
    <path d="M5 2h14" />
    <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
    <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
  </svg>
)
const OfficeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 12h4" />
    <path d="M10 8h4" />
    <path d="M14 21v-3a2 2 0 0 0-4 0v3" />
    <path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2" />
    <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
  </svg>
)
const AdminIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z" />
  </svg>
)
// Chevrons-right (Icons/PASS side nav/expand.svg) — reused for both the
// collapsed rail's expand button and the expanded header's collapse
// button, mirrored via CSS (.side-nav-toggle svg) rather than needing a
// second exported icon for the opposite direction.
const ChevronsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 17 5-5-5-5" />
    <path d="m13 17 5-5-5-5" />
  </svg>
)
// Not exported with the rest of the set — a Lucide-style map-pin built to
// match the same visual language, not copied from a supplied source file.
// Swap for a real export if/when one is provided.
const LocationPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const NAV_ITEMS = [
  { key: 'customers', label: 'Customers', Icon: CustomersIcon },
  { key: 'employees', label: 'Employees', Icon: EmployeesIcon },
  { key: 'bookings', label: 'Bookings', Icon: BookingsIcon },
  { key: 'schedule', label: 'Schedule', Icon: ScheduleIcon },
  { key: 'finance', label: 'Finance', Icon: FinanceIcon },
  { key: 'reporting', label: 'Reporting', Icon: ReportingIcon },
  { key: 'alerts', label: 'Alerts', Icon: AlertsIcon },
  { key: 'enquiries', label: 'Enquiries', Icon: EnquiriesIcon },
  { key: 'timeline', label: 'Timeline', Icon: TimelineIcon },
  { key: 'office', label: 'Office', Icon: OfficeIcon },
  { key: 'admin', label: 'Admin', Icon: AdminIcon },
]

// Each prototype is its own page (no client-side router), so the default
// behaviour for items with a real destination is a full navigation — same
// as the old WebNav's NAV_LINKS. Pass onSelectItem to override (e.g. the
// component demo, which just updates local state instead of navigating).
const NAV_LINKS = {
  employees: '../../web/employees/',
  office: '../../office/details/',
}

export default function SideNav({
  activeItem,
  onSelectItem,
  appName = 'PASS for Care',
  officeName = 'roster office',
  officeAddress = 'A1, East Wing, Cody Technology Park, Ively Road, Farnborough, GU14 0LX',
  defaultCollapsed = true,
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  const handleSelect = (key) => {
    if (onSelectItem) { onSelectItem(key); return }
    if (NAV_LINKS[key]) window.location.href = NAV_LINKS[key]
  }

  return (
    <nav className={`side-nav${collapsed ? ' collapsed' : ''}`}>
      <div className="side-nav-header">
        <img className="side-nav-logo" src={passEmblemUrl} alt="" />
        {!collapsed && <span className="side-nav-title">{appName}</span>}
        <button
          className="side-nav-toggle"
          onClick={() => setCollapsed(v => !v)}
          title={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          <ChevronsIcon />
        </button>
      </div>

      <div className="side-nav-divider" />

      <div className="side-nav-list">
        {NAV_ITEMS.map(({ key, label, Icon }) => (
          <button
            key={key}
            className={`side-nav-item${activeItem === key ? ' active' : ''}`}
            title={collapsed ? label : undefined}
            onClick={() => handleSelect(key)}
          >
            <span className="side-nav-item-icon"><Icon /></span>
            {!collapsed && <span className="side-nav-item-label">{label}</span>}
          </button>
        ))}
      </div>

      <div className="side-nav-footer-wrap">
        <div className="side-nav-divider" />
        <div className="side-nav-footer">
          <span className="side-nav-footer-icon"><LocationPinIcon /></span>
          <div className="side-nav-footer-text">
            <div className="side-nav-footer-name">{officeName}</div>
            <div className="side-nav-footer-address">{officeAddress}</div>
          </div>
        </div>
      </div>
    </nav>
  )
}
