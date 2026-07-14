import LegacyEmployeeCard from '../../../Components/LegacyEmployeeCard'

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)

const SAMPLE_EMPLOYEES = [
  { name: 'Miss Audrey Asiedu', role: 'Careworker', mobile: '07700 900001', email: 'everylifetest+redbridge+cw+audreyasiedu@gmail.com', lastLogin: '2 months ago', platform: 'iOS', version: '3.18.0', onLatestApp: false, notificationsEnabled: true, status: 'ACTIVE' },
  { name: 'Mrs Nasima Begum', role: 'Careworker', mobile: '07700 900003', email: 'everylifetest+redbridge+cw+nasimabegum@gmail.com', lastLogin: '2 months ago', platform: 'Android', version: '2.37.1', onLatestApp: true, notificationsEnabled: false, status: 'ACTIVE' },
  { name: 'Prof Essex Finance', role: 'Care Manager', mobile: '07700 900010', email: 'everylifetest+redbridge+cw+essexfinance@gmail.com', lastLogin: null, platform: null, version: null, onLatestApp: false, notificationsEnabled: false, status: 'ACTIVE' },
]

export default function App() {
  return (
    <div className="demo-page">
      <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>
      <div className="demo-content">
        <h1>Employee Card (legacy)</h1>
        <p>Recreates the production #employeesContainer card exactly, with a notifications-on/off indicator retrofitted into the last-login row. Superseded by the new employee card design in web/employees; kept here for reference/comparison only.</p>
        <div className="demo-cards">
          {SAMPLE_EMPLOYEES.map(employee => (
            <LegacyEmployeeCard key={employee.name} employee={employee} />
          ))}
        </div>
      </div>
    </div>
  )
}
