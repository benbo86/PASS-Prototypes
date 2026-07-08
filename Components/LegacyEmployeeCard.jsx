import employeePlaceholder from '../Images/Employee Placeholder.png'

// Recreates the production #employeesContainer employee card (see
// web/employees for the source export this was verified against),
// with a notifications-on/off indicator retrofitted into the
// existing last-login footer row. Icons copied verbatim from the
// new-design EmployeeCard so both cards render the feature identically.

const BellIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill="currentColor"/>
  </svg>
)
const BellOffIcon = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill="currentColor"/>
    <path d="M3 3L21 21" stroke="#fff" strokeWidth="4" strokeLinecap="round"/>
    <path d="M3 3L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)
const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>
)

function lastLoginSeverity(lastLogin) {
  if (!lastLogin) return 'none'
  if (/month|year/.test(lastLogin)) return 'danger'
  if (/week/.test(lastLogin)) return 'warning'
  return 'success'
}

export default function LegacyEmployeeCard({ employee }) {
  const { name, role, mobile, email, lastLogin, platform, version, onLatestApp, notificationsEnabled, status } = employee

  return (
    <div className="legacy-employee-card">
      <div className="legacy-employee-card-header">
        <span className="legacy-employee-card-title">{name}</span>
        <span className={`legacy-employee-card-badge ${role === 'Care Manager' ? 'legacy-role-manager' : 'legacy-role-other'}`}>{role}</span>
        <span className={`legacy-employee-card-status legacy-status-${status.toLowerCase()}`}>{status}</span>
      </div>

      <div className="legacy-employee-card-body">
        <img className="legacy-employee-card-photo" src={employeePlaceholder} alt="" />
        <div className="legacy-employee-card-contact">
          <div><span className="legacy-employee-card-label">Mob:</span>{mobile}</div>
          <div><span className="legacy-employee-card-label">Email:</span>{email}</div>
        </div>
      </div>

      <div className="legacy-employee-card-footer">
        <span className={`legacy-employee-card-notification ${notificationsEnabled ? 'legacy-notif-on' : 'legacy-notif-off'}`}>
          {notificationsEnabled ? <BellIcon size={14} /> : <BellOffIcon size={14} />}
          {notificationsEnabled ? 'Notifications on' : 'Notifications off'}
        </span>
        {lastLogin ? (
          <span className={`legacy-employee-card-lastlogin legacy-lastlogin-${lastLoginSeverity(lastLogin)}`}>
            last logged in {lastLogin}{platform && ` on ${platform} ${version}`}
            {onLatestApp && <StarIcon />}
          </span>
        ) : (
          <span className="legacy-employee-card-lastlogin legacy-lastlogin-none">no login information</span>
        )}
      </div>
    </div>
  )
}
