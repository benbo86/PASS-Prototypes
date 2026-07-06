const PRIMARY_TABS = [
  { label: 'Dashboard', href: null },
  { label: 'Care Management', href: null },
  { label: 'Care Notes', href: null },
  { label: 'MAR Chart', href: '../mar-chart/' },
  { label: 'Timeline', href: null },
  { label: 'Documents', href: '../assessments/' },
  { label: 'About Me', href: null },
  { label: 'Details', href: null },
  { label: 'Checklists', href: null },
  { label: 'Rostering', href: null },
  { label: 'Communications', href: null },
  { label: 'Medical History', href: null },
  { label: 'Customer File', href: null },
  { label: 'openPASS', href: null },
]

export default function CustomerProfileNav({ activeTab }) {
  return (
    <div className="context-bar">
      <div className="context-top">
        <div className="context-avatar">PA</div>
        <div className="context-info">
          <div className="context-name-row">
            <h1 className="context-name">Mrs Patricia 'Pat' Allin</h1>
            <span className="ctx-badge ctx-badge--danger">HIGH RISK</span>
            <span className="ctx-badge ctx-badge--success">ACTIVE</span>
          </div>
          <div className="context-details">
            <span><span className="detail-label">Tel:</span> 0208 505 0682</span>
            <span><span className="detail-label">DOB:</span> 12/12/1945</span>
            <span>3 Morgan Way, Woodford Green, IG8 8DL</span>
          </div>
        </div>
      </div>

      <div className="primary-tabs-wrap">
        <ul className="primary-tabs">
          {PRIMARY_TABS.map(({ label, href }) => (
            <li key={label} className={label === activeTab ? 'active' : ''}>
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
    </div>
  )
}
