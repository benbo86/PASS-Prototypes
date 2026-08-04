// Tab bar under TopNav for the Schedule area — modeled directly on
// Components/OfficeNav.jsx (same shape: flat {key,label,href} list,
// href:null renders disabled). Only Leave Requests has a real page today;
// the other 4 stay inert placeholders until they're built.
const TABS = [
  { key: 'schedule',              label: 'Schedule',              href: null },
  { key: 'shifts',                label: 'Shifts',                href: null },
  { key: 'holidays-absences',     label: 'Holidays & Absences',   href: null },
  { key: 'leave-requests',        label: 'Leave Requests',        href: '../../schedule/leave-requests/' },
  { key: 'timesheets',            label: 'Timesheets',            href: null },
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
