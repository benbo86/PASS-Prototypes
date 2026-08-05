// Tab bar under TopNav for the Schedule area — modeled directly on
// Components/OfficeNav.jsx (same shape: flat {key,label,href} list,
// href:null renders disabled). A real, reusable "schedule menu" shared
// across every prototype that needs it — currently schedule/leave-requests/
// and timesheets/filters/ (both Employee and Funders views). Timesheets
// always links to the Employee view specifically (no ?view=funders query),
// since that's this menu's own definition of "the Timesheets page" — the
// Funders toggle is a page-internal concern, not a separate destination.
// Schedule/Shifts/Holidays & Absences stay inert placeholders until built.
const TABS = [
  { key: 'schedule',              label: 'Schedule',              href: null },
  { key: 'shifts',                label: 'Shifts',                href: null },
  { key: 'holidays-absences',     label: 'Holidays & Absences',   href: null },
  { key: 'leave-requests',        label: 'Leave Requests',        href: '../../schedule/leave-requests/' },
  { key: 'timesheets',            label: 'Timesheets',            href: '../../timesheets/filters/' },
]

export default function ScheduleNav({ active }) {
  return (
    <div className="schedule-tab-bar">
      <ul className="schedule-tabs">
        {TABS.map(({ key, label, href }) => (
          <li key={key} className={active === key ? 'active' : ''}>
            <button
              onClick={() => href && (window.location.href = href)}
              style={!href ? { opacity: 0.4, cursor: 'default' } : undefined}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
