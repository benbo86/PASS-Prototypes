import { useState } from 'react'
import WebNav from '../../../Components/WebNav'
import OfficeNav from '../../../Components/OfficeNav'
import SlidePanel from '../../../Components/SlidePanel'

// ─── Icons ────────────────────────────────────────────────────

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)

const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>
)

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
)

const RemoveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
)

// Sidebar nav icons — SVG paths from live product
const VisitTypesIcon = () => (
  <svg width="25" height="25" viewBox="0 0 25 25" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd">
      <path d="M.395.846h24v24h-24z"/>
      <path d="M12.398 5c1.661 0 3.16.673 4.243 1.764a6.06 6.06 0 0 1 1.754 4.287c0 1.978-.731 3.366-2.436 5.385l-.762.886c-1.01 1.182-1.787 2.169-2.514 3.228-1.488-1.295-2.207-2.202-3.096-3.24l-.769-.895-.373-.452-.332-.42a10.117 10.117 0 0 1-1.021-1.579 6.193 6.193 0 0 1-.697-2.913c0-1.677.669-3.192 1.756-4.286A5.96 5.96 0 0 1 12.398 5z" stroke="currentColor" strokeWidth="2"/>
      <path d="M12.395 9.5c-.824 0-1.5.676-1.5 1.5s.676 1.5 1.5 1.5 1.5-.676 1.5-1.5-.676-1.5-1.5-1.5z" fill="currentColor"/>
    </g>
  </svg>
)

const ContractsIcon = () => (
  <svg width="25" height="25" viewBox="0 0 25 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd">
      <path d="M.395 0h24v24h-24z"/>
      <path d="M8.84 3a3.318 3.318 0 0 0-3.326 3.31v11.38A3.318 3.318 0 0 0 8.839 21h7.216a3.318 3.318 0 0 0 3.323-3.31V8.467a2 2 0 0 0-.644-1.471l-3.761-3.467A2 2 0 0 0 13.617 3zm.092 1.982h4.529v2.297c0 .985.801 1.783 1.79 1.783h2.17v8.45a1.5 1.5 0 0 1-1.5 1.5h-6.99a1.5 1.5 0 0 1-1.5-1.5V6.483a1.5 1.5 0 0 1 1.5-1.5zm3.463 8.898a1.44 1.44 0 1 1 0-2.88 1.44 1.44 0 0 1 0 2.88zm-1.008.6h.188a1.96 1.96 0 0 0 1.64 0h.188c.835 0 1.512.87 1.512 1.705v.275a.54.54 0 0 1-.54.54h-3.96a.54.54 0 0 1-.54-.54v-.275c0-.835.677-1.705 1.512-1.705z" fill="currentColor" fillRule="nonzero"/>
    </g>
  </svg>
)

const ChargingIcon = () => (
  <svg width="25" height="25" viewBox="0 0 25 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd">
      <path d="M.395 0h24v24h-24z"/>
      <path d="m20.543 14.608-3.208 2.566a2.21 2.21 0 0 1-1.39.486H11.84a.556.556 0 0 1 0-1.111h2.719c.552 0 1.066-.379 1.154-.924a1.111 1.111 0 0 0-1.095-1.299h-4.555c-.937 0-1.846.323-2.573.913l-1.615 1.31H3.951a.556.556 0 0 0-.556.555v3.334c0 .306.249.555.556.555h11.387c.505 0 .995-.17 1.389-.486l5.251-4.201a1.111 1.111 0 0 0 .044-1.698c-.41-.372-1.049-.347-1.48 0z" fill="currentColor" fillRule="nonzero"/>
      <g stroke="currentColor" strokeLinecap="round" strokeWidth="2">
        <path d="M15.395 10.5V12h-6 1V6.284c.01-.955.398-1.637 1.167-2.049.768-.411 1.712-.283 2.833.387" strokeLinejoin="round"/>
        <path d="M9.395 8h3"/>
      </g>
    </g>
  </svg>
)

const TimeThresholdsIcon = () => (
  <svg width="25" height="25" viewBox="0 0 25 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd">
      <path d="M.395 0h24v24h-24z"/>
      <path d="M14.395 1h-4c-.55 0-1 .45-1 1s.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1zm-2 13c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1zm7.03-6.61.75-.75a.993.993 0 0 0 0-1.4l-.01-.01a.993.993 0 0 0-1.4 0l-.75.75A8.962 8.962 0 0 0 12.395 4c-4.8 0-8.88 3.96-9 8.76a8.998 8.998 0 0 0 9 9.24 8.994 8.994 0 0 0 7.03-14.61zM12.395 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" fill="currentColor"/>
    </g>
  </svg>
)

const ExpenseTypesIcon = () => (
  <svg width="25" height="25" viewBox="0 0 25 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd">
      <path d="M.395 0h24v24h-24z"/>
      <path d="M17.658 9c.553 0 1.053.224 1.415.586.362.362.585.862.585 1.414v6c0 .552-.223 1.052-.585 1.414a1.994 1.994 0 0 1-1.415.586H8.132a2.99 2.99 0 0 1-2.122-.879A2.99 2.99 0 0 1 5.132 16v-6a.997.997 0 0 1 1-1z" stroke="currentColor" strokeWidth="2"/>
      <g stroke="currentColor" strokeLinecap="round">
        <path d="M12.007 15.25V16H8.908h.517v-2.858c.005-.477.205-.819.602-1.024.397-.206.885-.142 1.463.193" strokeLinejoin="round"/>
        <path d="M8.908 14h1.55"/>
      </g>
      <path d="M18.467 6a3.552 3.552 0 0 0-2.471-1H7.165a2 2 0 1 0 0 4h6.316" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path fill="currentColor" d="M4.132 7h2.066v4H4.132z"/>
    </g>
  </svg>
)

const CancellationIcon = () => (
  <svg width="25" height="25" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd">
      <path d="M0 .795h32v32H0z"/>
      <path d="M13.337 5c4.707 0 8.572 3.47 9.23 8.02a8.686 8.686 0 0 0-2.664.236c-.53-3.189-3.257-5.59-6.566-5.59-3.698 0-6.67 2.995-6.67 6.735 0 1.208.246 2.228.783 3.278.308.602.686 1.189 1.215 1.879l.42.531.483.586 1.035 1.206a58.441 58.441 0 0 1 2.505 3.11l.228.309.123-.17c.127-.17.256-.343.388-.516.337.93.827 1.786 1.441 2.536-.187.26-.37.522-.552.788l-.265.424a1.332 1.332 0 0 1-2.252.01l-.159-.247-.122-.185c-.967-1.419-2.022-2.761-3.36-4.325l-1.033-1.202-.516-.625-.457-.578c-.644-.84-1.11-1.561-1.497-2.318A9.547 9.547 0 0 1 4 14.401C4 9.193 8.161 5 13.337 5zm-.004 7.333c1.1 0 2 .901 2 2 0 1.1-.9 2-2 2-1.099 0-2-.9-2-2 0-1.099.901-2 2-2z" fill="currentColor" fillRule="nonzero"/>
      <path d="M22 14.333A7.333 7.333 0 1 1 22 29a7.333 7.333 0 0 1 0-14.667zm3.58 2.785a.667.667 0 0 0-.851.077L22 19.924l-2.729-2.729a.667.667 0 0 0-.942 0l-.8.8-.078.093c-.18.26-.154.619.078.85l2.728 2.729-2.728 2.728a.667.667 0 0 0 0 .943l.8.8.092.077c.26.18.619.154.85-.077L22 23.41l2.729 2.73c.26.26.682.26.942 0l.8-.8.078-.093a.667.667 0 0 0-.078-.85l-2.728-2.73 2.728-2.728a.667.667 0 0 0 0-.943l-.8-.8z" fill="currentColor"/>
    </g>
  </svg>
)

const HolidaysIcon = () => (
  <svg width="25" height="25" viewBox="0 0 25 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd">
      <path d="M0 0h24.79v24H0z"/>
      <path d="M19.626 4h-1.033V3c0-.55-.465-1-1.033-1-.568 0-1.033.45-1.033 1v1H8.263V3c0-.55-.464-1-1.033-1-.568 0-1.032.45-1.032 1v1H5.165c-1.147 0-2.056.9-2.056 2L3.1 20c0 1.1.92 2 2.066 2h14.46c1.137 0 2.066-.9 2.066-2V6c0-1.1-.93-2-2.065-2zm0 15c0 .55-.465 1-1.033 1H6.198c-.569 0-1.033-.45-1.033-1V9h14.46v10zM7.23 11h2.066v2H7.23v-2zm4.132 0h2.066v2h-2.066v-2zm4.132 0h2.066v2h-2.066v-2zM7.23 15h2.066v2H7.23v-2zm4.132 0h2.066v2h-2.066v-2zm4.132 0h2.066v2h-2.066v-2z" fill="currentColor"/>
    </g>
  </svg>
)

const OfficeCalendarIcon = () => (
  <svg width="25" height="25" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd">
      <path d="M0 0h24v24H0z"/>
      <path d="M16 3a1 1 0 0 1 1 1v1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1V4a1 1 0 1 1 2 0v1h6V4a1 1 0 0 1 1-1zm1.5 6h-11a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5zm-6 2a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5h3z" fill="currentColor"/>
    </g>
  </svg>
)

const CommunicationsIcon = ({ size = 25 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd">
      <path d="M0 0h32v32H0z"/>
      <path d="M26.667 5.333H5.333A2.663 2.663 0 0 0 2.68 8l-.013 16c0 1.467 1.2 2.667 2.666 2.667h21.334c1.466 0 2.666-1.2 2.666-2.667V8c0-1.467-1.2-2.667-2.666-2.667zM25.333 24H6.667c-.734 0-1.334-.6-1.334-1.333v-12l9.254 5.786c.866.547 1.96.547 2.826 0l9.254-5.786v12c0 .733-.6 1.333-1.334 1.333zM16 14.667 5.333 8h21.334L16 14.667z" fill="currentColor"/>
    </g>
  </svg>
)

const AdvancedSettingsIcon = () => (
  <svg width="25" height="25" viewBox="0 0 25 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" fillRule="evenodd">
      <path d="M8 5C9.657 5 11 6.343 11 8c0 1.657-1.343 3-3 3-1.306 0-2.417-.834-2.829-2.001L4 9C3.448 9 3 8.552 3 8s.448-1 1-1l1.171.001C5.583 5.834 6.694 5 8 5zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm8 6c1.306 0 2.418.835 2.829 2.001L20 15c.552 0 1 .448 1 1s-.448 1-1 1l-1.171-.001C18.418 18.165 17.306 19 16 19c-1.657 0-3-1.343-3-3s1.343-3 3-3zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM13 7l7-.001C20.552 7 21 7.448 21 8s-.448 1-1 1l-7-.001V7zM11 15l-7 .001C3.448 15 3 15.448 3 16s.448 1 1 1l7-.001V15z" fill="currentColor"/>
    </g>
  </svg>
)

// ─── Data ─────────────────────────────────────────────────────

const NAV_ITEMS = [
  { key: 'visit-types',     label: 'Visit and event types',  Icon: VisitTypesIcon },
  { key: 'contracts',       label: 'Contracts and pay',      Icon: ContractsIcon },
  { key: 'charging',        label: 'Charging and invoicing', Icon: ChargingIcon },
  { key: 'time-thresholds', label: 'Time thresholds',        Icon: TimeThresholdsIcon },
  { key: 'expense-types',   label: 'Expense types',          Icon: ExpenseTypesIcon },
  { key: 'cancellation',    label: 'Cancellation reasons',   Icon: CancellationIcon },
  { key: 'holidays',        label: 'Holidays and absences',  Icon: HolidaysIcon },
  { key: 'office-calendar', label: 'Office calendar',        Icon: OfficeCalendarIcon },
  { key: 'communications',  label: 'Communications',         Icon: CommunicationsIcon },
  { key: 'advanced',        label: 'Advanced settings',      Icon: AdvancedSettingsIcon },
]

const AVATAR_COLORS = [
  { bg: '#e8e0f0', fg: '#5a3878' },
  { bg: '#ddeef8', fg: '#1a4a6e' },
  { bg: '#ddf0e8', fg: '#1a5a36' },
  { bg: '#f8eedc', fg: '#6e4210' },
  { bg: '#f0dde8', fg: '#6e1a3c' },
  { bg: '#ddf0ee', fg: '#1a5a52' },
]

const INITIAL_CONTACTS = [
  { id: 1, name: 'Rachel Simmons', role: 'Care Coordinator',     initials: 'RS', reachMeFor: 'Rota queries, shift swaps and cover' },
  { id: 2, name: 'Paul Griffiths', role: 'Branch Manager',       initials: 'PG', reachMeFor: 'Complaints and HR matters' },
  { id: 3, name: 'Jennifer Walsh', role: 'Finance',              initials: 'JW', reachMeFor: 'Pay queries and expenses' },
  { id: 4, name: 'Mark Thompson',  role: 'Training Coordinator', initials: 'MT', reachMeFor: '' },
]

const ALL_STAFF = [
  ...INITIAL_CONTACTS,
  { id: 5,  name: 'Sarah Mitchell',  role: 'Care Coordinator', initials: 'SM' },
  { id: 6,  name: 'David Chen',      role: 'HR Manager',       initials: 'DC' },
  { id: 7,  name: 'Linda Peters',    role: 'Branch Manager',   initials: 'LP' },
  { id: 8,  name: 'Tom Harris',      role: 'Finance',          initials: 'TH' },
  { id: 9,  name: 'Emma Richardson', role: 'Administrator',    initials: 'ER' },
  { id: 10, name: 'James Okafor',    role: 'Care Coordinator', initials: 'JO' },
]

// ─── Avatar ───────────────────────────────────────────────────

function ContactAvatar({ contact }) {
  const palette = AVATAR_COLORS[contact.id % AVATAR_COLORS.length]
  return (
    <div className="cs-avatar" style={{ background: palette.bg, color: palette.fg }}>
      {contact.initials}
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────

export default function App() {
  const [contacts, setContacts] = useState(INITIAL_CONTACTS)
  const [panelOpen, setPanelOpen] = useState(false)
  const [pendingContacts, setPendingContacts] = useState([])
  const [search, setSearch] = useState('')

  const openPanel = () => {
    setPendingContacts(contacts.map(c => ({ ...c })))
    setSearch('')
    setPanelOpen(true)
  }

  const handleSave = () => {
    setContacts(pendingContacts)
    setPanelOpen(false)
  }

  const handleCancel = () => setPanelOpen(false)

  const searchResults = search.length > 0
    ? ALL_STAFF.filter(s => {
        if (pendingContacts.some(c => c.id === s.id)) return false
        const q = search.toLowerCase()
        const parts = s.name.toLowerCase().split(' ')
        return parts.some(p => p.startsWith(q))
      })
    : []

  const addContact = (staff) => {
    setPendingContacts(prev => [...prev, { ...staff, reachMeFor: '' }])
    setSearch('')
  }

  const removeContact = (id) =>
    setPendingContacts(prev => prev.filter(c => c.id !== id))

  const updateReachMeFor = (id, value) =>
    setPendingContacts(prev => prev.map(c => c.id === id ? { ...c, reachMeFor: value } : c))

  return (
    <div className="settings-page">
      <a href="../../" className="back-link">
        <ChevronLeftIcon /> Prototypes
      </a>
      <WebNav />

      <OfficeNav active="roster-settings" />

      <div className="settings-layout">

        {/* Settings sidebar */}
        <aside className="settings-sidebar">
          <ul className="settings-nav-list">
            {NAV_ITEMS.map(({ key, label, Icon }) => (
              <li key={key}>
                <a
                  href="#"
                  className={`settings-nav-item${key === 'communications' ? ' active' : ''}`}
                  onClick={e => e.preventDefault()}
                >
                  <Icon />
                  <span>{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main content */}
        <main className="settings-content">
          <div className="settings-section">
            <div className="settings-section-header">
              <div className="settings-section-icon-title">
                <CommunicationsIcon size={32} />
                <h2 className="settings-section-title">Communications</h2>
              </div>
              <button className="settings-edit-btn" onClick={openPanel} title="Edit">
                <EditIcon />
              </button>
            </div>

            <div className="settings-subsection">
              <h3 className="settings-subsection-title">Contactable employees</h3>
              <p className="settings-subsection-desc">
                These employees can be contacted by care workers through the mobile app
              </p>
              {contacts.length > 0 ? (
                <table className="settings-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Available for</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map(c => (
                      <tr key={c.id}>
                        <td>{c.name}</td>
                        <td>{c.reachMeFor || <span className="settings-value-empty">Not set</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="settings-value-empty">No contactable employees configured.</p>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Edit panel */}
      <SlidePanel
        open={panelOpen}
        onClose={handleCancel}
        title="Communications"
        footer={
          <>
            <button className="round-btn tertiary-btn" onClick={handleCancel}>Cancel</button>
            <button className="round-btn primary-btn" onClick={handleSave}>Save</button>
          </>
        }
      >
        <div className="cs-section-header">
          <h3 className="cs-subheading">Contactable employees</h3>
          <p className="cs-explainer">The 'Available for' text is shown to employees in the mobile app to help them choose the right person to contact.</p>
        </div>

        {/* Search to add */}
        <div className="cs-field-group">
          <label className="cs-field-label">Add employee</label>
          <div className="cs-search-bar">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {searchResults.length > 0 && (
            <div className="cs-search-results">
              {searchResults.map(s => (
                <div key={s.id} className="cs-search-result" onClick={() => addContact(s)}>
                  <ContactAvatar contact={s} />
                  <div>
                    <div className="cs-result-name">{s.name}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {search.length > 0 && searchResults.length === 0 && (
            <div className="cs-no-results">No employees found</div>
          )}
        </div>

        {/* Configured contacts */}
        {pendingContacts.map(c => (
          <div key={c.id} className="cs-contact-row">
            <ContactAvatar contact={c} />
            <div className="cs-contact-info">
              <div className="cs-contact-name">{c.name}</div>
              <div className="cs-reach-wrap">
                <label className="cs-reach-label">
                  Available for <span className="cs-optional">(optional)</span>
                </label>
                <input
                  className="form-input"
                  placeholder="e.g. Rota queries and shift swaps"
                  value={c.reachMeFor}
                  onChange={e => updateReachMeFor(c.id, e.target.value)}
                />
              </div>
            </div>
            <button className="cs-remove-btn" onClick={() => removeContact(c.id)} title={`Remove ${c.name}`}>
              <RemoveIcon />
            </button>
          </div>
        ))}

        {pendingContacts.length === 0 && search === '' && (
          <div className="cs-empty-state">
            No contactable employees configured. Search for an employee above to add them.
          </div>
        )}
      </SlidePanel>
    </div>
  )
}
