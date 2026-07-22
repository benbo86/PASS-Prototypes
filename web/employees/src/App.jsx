import { useRef } from 'react'
import SideNav from '../../../Components/SideNav'
import TopNav from '../../../Components/TopNav'
import LegacyEmployeeCard from '../../../Components/LegacyEmployeeCard'
import DevMode from '../../../Components/DevMode'

// ─── Icons ────────────────────────────────────────────────────

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)
const PlusIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
)
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

// ─── Data ─────────────────────────────────────────────────────

const TINTS = ['var(--availability-3-green-tint)', 'var(--availability-4-blue-tint)', 'var(--availability-6-mauve-tint)']

const EMPLOYEES = [
  { name: 'Madam Nus Alam',          role: 'Care Manager', mobile: '07831 308649', email: 'everylifetest+redbridge+cw+nusalam@gmail.com',        lastLogin: '6 days ago',   platform: 'iOS',     version: '3.19.0', onLatestApp: true,  notificationsEnabled: true },
  { name: 'Miss Audrey Asiedu',      role: 'Careworker',   mobile: '07700 900001', email: 'everylifetest+redbridge+cw+audreyasiedu@gmail.com',    lastLogin: '2 months ago', platform: 'iOS',     version: '3.18.0', onLatestApp: false, notificationsEnabled: true },
  { name: 'Miss Maribel Avellano',   role: 'Careworker',   mobile: '07700 900002', email: 'everylifetest+redbridge+cw+maribelavellano@gmail.com', lastLogin: '2 months ago', platform: 'iOS',     version: '3.18.0', onLatestApp: false, notificationsEnabled: true },
  { name: 'Mrs Nasima Begum',        role: 'Careworker',   mobile: '07700 900003', email: 'everylifetest+redbridge+cw+nasimabegum@gmail.com',     lastLogin: '2 months ago', platform: 'Android', version: '2.37.1', onLatestApp: true,  notificationsEnabled: false },
  { name: 'Miss Maria Birhala',      role: 'Careworker',   mobile: '07700 900004', email: 'everylifetest+redbridge+cw+mariabirhala@gmail.com',    lastLogin: '2 months ago', platform: 'iOS',     version: '3.18.0', onLatestApp: false, notificationsEnabled: true },
  { name: 'Mrs Hayley Bolitho-Webb', role: 'Careworker',   mobile: '07700 900005', email: 'everylifetest+redbridge+cw+hayleybw@gmail.com',        lastLogin: '2 months ago', platform: 'Android', version: '2.37.1', onLatestApp: true,  notificationsEnabled: true },
  { name: 'Mrs Maryann Cleaver',     role: 'Care Manager', mobile: '07700 900006', email: 'everylifetest+redbridge+cw+maryanncleaver@gmail.com',  lastLogin: 'a year ago',   platform: 'iOS',     version: '3.6.0',  onLatestApp: false, notificationsEnabled: false },
  { name: 'Mrs Josephine Cockle',    role: 'Careworker',   mobile: '07700 900007', email: 'everylifetest+redbridge+cw+josephinecockle@gmail.com', lastLogin: '2 months ago', platform: 'Android', version: '2.37.1', onLatestApp: true,  notificationsEnabled: true },
  { name: 'Mrs Dorina Eperjesi',     role: 'Careworker',   mobile: '07700 900008', email: 'everylifetest+redbridge+cw+dorinaeperjesi@gmail.com',  lastLogin: '2 months ago', platform: 'Android', version: '2.37.1', onLatestApp: true,  notificationsEnabled: true },
  { name: 'Mr Jonathan Fenton',      role: 'Careworker',   mobile: '07700 900009', email: 'everylifetest+redbridge+cw+jonathanfenton@gmail.com',  lastLogin: '2 months ago', platform: 'iOS',     version: '3.18.0', onLatestApp: false, notificationsEnabled: true },
  { name: 'Prof Essex Finance',      role: 'Care Manager', mobile: '07700 900010', email: 'everylifetest+redbridge+cw+essexfinance@gmail.com',    lastLogin: null,           platform: null,      version: null,     onLatestApp: false, notificationsEnabled: false },
  { name: 'Mr Holiday Geez',         role: 'Careworker',   mobile: '07700 900011', email: 'everylifetest+redbridge+cw+holidaygeez@gmail.com',     lastLogin: null,           platform: null,      version: null,     onLatestApp: false, notificationsEnabled: false },
  { name: 'Ms Julie Gregory',        role: 'Careworker',   mobile: '07700 900012', email: 'everylifetest+redbridge+cw+juliegregory@gmail.com',    lastLogin: '2 months ago', platform: 'iOS',     version: '3.18.0', onLatestApp: false, notificationsEnabled: true },
  { name: 'Miss Theresa Hayles',     role: 'Careworker',   mobile: '07700 900013', email: 'everylifetest+redbridge+cw+theresahayles@gmail.com',   lastLogin: '2 months ago', platform: 'Android', version: '2.37.1', onLatestApp: true,  notificationsEnabled: false },
  { name: 'Mrs Kelly Hockett',       role: 'Care Manager', mobile: '07700 900014', email: 'everylifetest+redbridge+cw+kellyhockett@gmail.com',    lastLogin: '15 days ago',  platform: 'iOS',     version: '3.19.0', onLatestApp: true,  notificationsEnabled: true },
  { name: 'Ms Koli Hussain',         role: 'Careworker',   mobile: '07700 900015', email: 'everylifetest+redbridge+cw+kolihussain@gmail.com',     lastLogin: '2 months ago', platform: 'Android', version: '2.37.1', onLatestApp: true,  notificationsEnabled: true },
  { name: 'Miss Layla Ismail',       role: 'Care Manager', mobile: '07700 900016', email: 'everylifetest+redbridge+cw+laylaismail@gmail.com',     lastLogin: '2 months ago', platform: 'iOS',     version: '3.18.0', onLatestApp: false, notificationsEnabled: true },
  { name: 'Mrs Victoria John',       role: 'Careworker',   mobile: '07700 900017', email: 'everylifetest+redbridge+cw+victoriajohn@gmail.com',    lastLogin: '2 months ago', platform: 'Android', version: '2.37.1', onLatestApp: true,  notificationsEnabled: true },
].map((e, i) => ({ ...e, id: i + 1, status: 'ACTIVE', tint: TINTS[i % TINTS.length] }))

function initials(name) {
  const parts = name.split(' ').filter(p => !/^(Mr|Mrs|Miss|Ms|Prof|Madam)\.?$/i.test(p))
  return ((parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '')).toUpperCase()
}

// ─── Employee card ──────────────────────────────────────────────

function EmployeeCard({ employee }) {
  const { name, role, mobile, email, lastLogin, platform, version, onLatestApp, notificationsEnabled, status, tint } = employee

  return (
    <div className="emp-card">
      <div className="emp-card-header">
        <div className="emp-avatar" style={{ background: tint }}>{initials(name)}</div>
        <div className="emp-card-heading">
          <h3 className="emp-name">{name}</h3>
          <span className={`emp-role-badge ${role === 'Care Manager' ? 'emp-role-manager' : 'emp-role-other'}`}>{role}</span>
        </div>
        <span className={`emp-status-pill ${status === 'ACTIVE' ? 'emp-status-active' : 'emp-status-inactive'}`}>{status}</span>
      </div>

      <div className="emp-card-body">
        <div className="emp-contact-row"><span className="emp-contact-label">Mob:</span> {mobile}</div>
        <div className="emp-contact-row"><span className="emp-contact-label">Email:</span> {email}</div>
      </div>

      <div className="emp-card-footer">
        <span className={`emp-notification-status ${notificationsEnabled ? 'emp-notif-on' : 'emp-notif-off'}`}>
          {notificationsEnabled ? <BellIcon /> : <BellOffIcon />}
          {notificationsEnabled ? 'Notifications on' : 'Notifications off'}
        </span>
        <span className="emp-last-login">
          {lastLogin ? (
            <>
              last logged in <b>{lastLogin}</b>{platform && ` on ${platform} ${version}`}
              {onLatestApp && <StarIcon />}
            </>
          ) : 'no login information'}
        </span>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────

export default function App() {
  const newDesignEmployee = EMPLOYEES[0]
  const legacyOffEmployee = EMPLOYEES[3]
  const legacyOnEmployee = EMPLOYEES[1]
  const pageRef = useRef(null)

  return (
    <div className="emp-page" ref={pageRef}>
      <a href="../../" className="back-link">
        <ChevronLeftIcon /> Prototypes
      </a>
      <SideNav activeItem="employees" />

      <div className="page-body">
      <TopNav />
      <div className="emp-content">
        <div className="emp-page-header">
          <h1>Employees</h1>
          <button className="round-btn primary-btn btn-icon-left">
            <PlusIcon /> Add employee
          </button>
        </div>

        <div className="emp-compare-stack">
          <div className="emp-compare-row">
            <span className="emp-compare-label">Current (legacy) card design</span>
            <div className="emp-compare-cards">
              <LegacyEmployeeCard employee={legacyOffEmployee} />
              <LegacyEmployeeCard employee={legacyOnEmployee} />
            </div>
          </div>
          <div className="emp-compare-row">
            <span className="emp-compare-label">New card design</span>
            <div className="emp-compare-cards">
              <EmployeeCard employee={newDesignEmployee} />
            </div>
          </div>
        </div>
      </div>
      </div>
      <DevMode containerRef={pageRef} />
    </div>
  )
}
