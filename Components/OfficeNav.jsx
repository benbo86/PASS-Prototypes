const TABS = [
  { key: 'details',                  label: 'Details',                  href: '../../office/details/' },
  { key: 'checklists',               label: 'Checklists',               href: null },
  { key: 'documents',                label: 'Documents',                href: '../../office/customer-assessments/' },
  { key: 'care-groups',              label: 'Care Groups',              href: null },
  { key: 'tags',                     label: 'Tags',                     href: null },
  { key: 'roster-settings',          label: 'Roster Settings',          href: '../../roster/contactable-staff/' },
  { key: 'settings-and-permissions', label: 'Settings and Permissions', href: null },
]

export default function OfficeNav({ active }) {
  return (
    <div className="office-tab-bar">
      <ul className="office-tabs">
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
