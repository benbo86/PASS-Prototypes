import { useMemo, useState } from 'react'
import PeopleListLayout, {
  PersonCard, StatusBadge, CheckGroup, RadioGroup, FilterPanel, matchesQuery, chipSearchText,
} from '../../../Components/PeopleList'
import Tooltip from '../../../Components/Tooltip'
import Modal from '../../../Components/Modal'
import ActionsMenu from '../../../Components/ActionsMenu'
import { EMPLOYEES_LIST, STATUS_LABEL } from '../../list/src/employeesListData'

// Employees list with magic-link password links (AIOP-25862). Same list as employees/list, plus a
// Select mode (checkboxes), an Actions menu with "Send password link", and a password link status line.
//
// Who can invite (decided, not yet in the ticket): whoever can already edit employees,
// and only employees whose role is below their own. The "Viewing as" switch is
// prototype-only, to show how the rule changes what you can invite.

const ROLES = ['Super user', 'Care Manager', 'Supervisor', 'Careworker']
const RANK = { Careworker: 1, Supervisor: 2, 'Care Manager': 3, 'Super user': 4 }
const SENIOR = new Set(['Supervisor', 'Care Manager', 'Super user'])
const VIEWERS = ['Care Manager', 'Super user']
const TODAY = '26 Nov 2026'

const WarningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="warning-icon">
    <path d="M10.27,3.99 C11.04,2.66 12.96,2.66 13.73,3.99 L21.26,17 C22.03,18.33 21.07,20 19.53,20 L4.47,20 C2.93,20 1.97,18.33 2.74,17 Z M12,15 C11.4477153,15 11,15.4477153 11,16 C11,16.5522847 11.4477153,17 12,17 C12.5522847,17 13,16.5522847 13,16 C13,15.4477153 12.5522847,15 12,15 Z M12,7 C11.4477153,7 11,7.44771525 11,8 L11,12 C11,12.5522847 11.4477153,13 12,13 C12.5522847,13 13,12.5522847 13,12 L13,8 C13,7.44771525 12.5522847,7 12,7 Z"/>
  </svg>
)

const ChevronDown = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="16.6 8.6 12 13.2 7.4 8.6 6 10 12 16 18 10" />
  </svg>
)

// Same as the UI kit's Actions button icon
const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.5759 2.85953C14.1433 1.88245 15.341 1.47271 16.3181 1.88245C17.1375 2.22915 17.894 2.67041 18.6189 3.20623C19.4699 3.8366 19.7221 5.06583 19.1547 6.04291C18.8395 6.61024 18.8395 7.30365 19.1547 7.87099C19.4699 8.43832 20.0688 8.78503 20.7307 8.78503C21.8653 8.78503 22.8109 9.63603 22.937 10.7392C23 11.1489 23 11.5902 23 11.9999C23 12.4097 23 12.8509 22.937 13.2607C22.8109 14.3638 21.8653 15.2148 20.7307 15.2148C20.1003 15.2148 19.4699 15.5615 19.1547 16.1289C18.8395 16.6962 18.8395 17.3896 19.1547 17.9569C19.7221 18.934 19.4699 20.1317 18.6189 20.7936C17.894 21.3294 17.1375 21.7707 16.3181 22.1174C16.0344 22.212 15.7822 22.275 15.4986 22.275C14.7421 22.275 13.9857 21.8653 13.5759 21.1403C13.2607 20.573 12.6304 20.2263 12 20.2263C11.3696 20.2263 10.7393 20.573 10.4241 21.1403C9.85673 22.1174 8.65903 22.5271 7.68195 22.1174C6.86246 21.7707 6.10602 21.3294 5.38109 20.7936C4.53009 20.1633 4.27794 18.934 4.84527 17.9569C5.16046 17.3896 5.16046 16.6962 4.84527 16.1289C4.53009 15.5615 3.93123 15.2148 3.26934 15.2148C2.13467 15.2148 1.18911 14.3638 1.06304 13.2607C1.03152 12.8509 1 12.4097 1 11.9999C1 11.5902 1 11.1489 1.06304 10.7392C1.18911 9.63603 2.13467 8.78503 3.26934 8.78503C3.89971 8.78503 4.53009 8.43832 4.84527 7.87099C5.16046 7.30365 5.16046 6.61024 4.84527 6.04291C4.27794 5.06583 4.53009 3.86812 5.38109 3.20623C6.10602 2.67041 6.86246 2.22915 7.68195 1.88245C8.69054 1.47271 9.85673 1.88245 10.4241 2.85953C10.7393 3.42686 11.3696 3.77357 12 3.77357C12.6304 3.77357 13.2607 3.42686 13.5759 2.85953ZM15.6246 3.58445C15.4355 3.4899 15.2779 3.61597 15.1834 3.77357C14.5215 4.90824 13.3238 5.60165 12 5.60165C10.6762 5.60165 9.47851 4.90824 8.81662 3.77357C8.72206 3.64749 8.53295 3.52142 8.37536 3.58445C7.68195 3.86812 7.05158 4.24635 6.45272 4.68761C6.32665 4.78216 6.32665 5.00279 6.4212 5.16039C7.08309 6.29506 7.08309 7.68188 6.4212 8.81655C5.79083 9.9197 4.5616 10.6446 3.26934 10.6446C3.08023 10.6446 2.92264 10.7707 2.89112 10.9598C2.8596 11.3065 2.82808 11.6532 2.82808 11.9999C2.82808 12.3466 2.8596 12.6933 2.89112 13.04C2.89112 13.2292 3.04871 13.3552 3.26934 13.3552C4.5616 13.3552 5.75931 14.0486 6.4212 15.1833C7.05158 16.318 7.08309 17.7048 6.4212 18.8395C6.32665 18.9971 6.29513 19.2177 6.45272 19.3122C7.05158 19.7535 7.68195 20.1317 8.37536 20.4154C8.56447 20.51 8.72206 20.3839 8.81662 20.2263C9.47851 19.0916 10.6762 18.3982 12 18.3982C13.3238 18.3982 14.5215 19.0916 15.1834 20.2263C15.2779 20.3524 15.467 20.4784 15.6246 20.4154C16.3181 20.1317 16.9484 19.7535 17.5473 19.3122C17.6734 19.2177 17.6734 18.9971 17.5788 18.8395C16.9169 17.7048 16.9169 16.318 17.5788 15.1833C18.2092 14.0802 19.4384 13.3552 20.7307 13.3552C20.9198 13.3552 21.0774 13.2292 21.1089 13.04C21.1719 12.6933 21.1719 12.3466 21.1719 11.9999C21.1719 11.6532 21.1404 11.3065 21.1089 10.9598C21.1089 10.7707 20.9513 10.6446 20.7307 10.6446C19.4384 10.6446 18.2407 9.95122 17.5788 8.81655C16.9484 7.68188 16.9169 6.29506 17.5788 5.16039C17.6734 5.00279 17.7049 4.78216 17.5473 4.68761C16.9484 4.24635 16.2865 3.86812 15.6246 3.58445ZM12 8.34377C14.0172 8.34377 15.6562 9.98274 15.6562 11.9999C15.6562 14.0171 14.0172 15.6561 12 15.6561C9.98281 15.6561 8.34384 14.0171 8.34384 11.9999C8.34384 9.98274 9.98281 8.34377 12 8.34377ZM12 10.1718C10.9914 10.1718 10.1719 10.9913 10.1719 11.9999C10.1719 13.0085 10.9914 13.828 12 13.828C13.0086 13.828 13.8281 13.0085 13.8281 11.9999C13.8281 10.9913 13.0086 10.1718 12 10.1718Z" />
  </svg>
)

// The shared fixture still has roles PASS doesn't have (Manager, Care Coordinator, Test). Map them here.
const ROLE_MAP = { Manager: 'Care Manager', 'Care Coordinator': 'Care Manager', Test: 'Careworker' }
// A few people without contact details, so the "can't invite" cases show
const CONTACT = {
  'e-mr-contract-backdate': { mobile: null, email: null },
  'e-mr-tom-evans': { email: null },
  'e-mr-sean-o-brien': { mobile: null },
}
const EMPLOYEES = EMPLOYEES_LIST.map(e => ({ ...e, role: ROLE_MAP[e.role] ?? e.role, ...CONTACT[e.id] }))

const SEED_INVITES = {
  'e-mrs-priya-chambers': { status: 'invited', date: '24 Nov 2026' },
  'e-mr-paul-hall': { status: 'invited', date: '25 Nov 2026' },
  'e-mr-dean-cooper': { status: 'expired', date: '10 Nov 2026' },
  'e-mr-raj-dhillon': { status: 'accepted', date: '3 Nov 2026' },
}
const INVITE_LABEL = { none: 'Not sent', invited: 'Password link sent', expired: 'Password link expired', accepted: 'Password link accepted' }

// Careworkers and Supervisors: SMS and email (both if they have both). Everyone else: email, or SMS if no email.
function channelOf(e) {
  const both = e.role === 'Careworker' || e.role === 'Supervisor'
  if (both) return [e.mobile && 'SMS', e.email && 'email'].filter(Boolean).join(' and ')
  return e.email ? 'email' : e.mobile ? 'SMS' : ''
}

function blockReason(e, viewer, invite) {
  if (!(RANK[e.role] < RANK[viewer])) return `A ${viewer} can only invite employees in a lower role`
  if (!e.email && !e.mobile) return 'No email or mobile number, so there is nowhere to send the invite'
  if (invite?.status === 'invited') return 'A password link has already been sent. You can resend it once it has expired'
  return null
}
const hasPassword = (e, invite) => Boolean(e.app) || invite?.status === 'accepted'

const searchable = e => [e.fullName, e.role, STATUS_LABEL[e.status], e.mobile ?? '', e.email ?? '', ...chipSearchText(e.chips)].join(' ').toLowerCase()

const STATUS_OPTIONS = ['active', 'inactive', 'leaver'].map(key => ({ key, label: STATUS_LABEL[key] }))
const ROLE_OPTIONS = ROLES.map(r => ({ key: r, label: r }))
const INVITE_OPTIONS = ['none', 'invited', 'expired', 'accepted'].map(key => ({ key, label: INVITE_LABEL[key] }))
const NO_FILTERS = { statuses: [], roles: [], invites: [] }
const DEFAULT_FILTERS = { ...NO_FILTERS, statuses: ['active'] }
const filterCount = f => f.statuses.length + f.roles.length + f.invites.length

export default function App() {
  const [viewer, setViewer] = useState('Care Manager')
  const [query, setQuery] = useState('')
  const [direction, setDirection] = useState('asc')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [invites, setInvites] = useState(SEED_INVITES)
  const [selected, setSelected] = useState(() => new Set())
  const [confirm, setConfirm] = useState(null) // { ids, withPassword: [names] }
  const [toast, setToast] = useState(null)
  const [showWho, setShowWho] = useState(false) // the confirmation's list of who already has a password

  const statusOf = e => invites[e.id]?.status ?? 'none'
  const items = useMemo(() => EMPLOYEES
    .filter(e => (!filters.statuses.length || filters.statuses.includes(e.status))
      && (!filters.roles.length || filters.roles.includes(e.role))
      && (!filters.invites.length || filters.invites.includes(invites[e.id]?.status ?? 'none'))
      && matchesQuery(searchable(e), query))
    .sort((a, b) => (direction === 'asc' ? 1 : -1) * a.surname.localeCompare(b.surname)),
  [filters, query, direction, invites])

  const eligible = items.filter(e => !blockReason(e, viewer, invites[e.id]))
  const selectedIds = [...selected].filter(id => { const e = EMPLOYEES.find(x => x.id === id); return e && !blockReason(e, viewer, invites[id]) })

  const toggleIn = (field, value) => setFilters(f => ({ ...f, [field]: f[field].includes(value) ? f[field].filter(x => x !== value) : [...f[field], value] }))
  const toggleSelect = id => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const changeViewer = v => { setViewer(v); setSelected(new Set()) }

  const flash = text => { setToast(text); setTimeout(() => setToast(null), 3500) }
  const send = ids => {
    setInvites(prev => ({ ...prev, ...Object.fromEntries(ids.map(id => [id, { status: 'invited', date: TODAY }])) }))
    setSelected(new Set())
    setConfirm(null)
    flash(ids.length === 1 ? 'Password link sent' : `Password links sent to ${ids.length} employees`)
  }
  // Always confirm first, saying what the invite is. Anyone who already has a password is called out (their old one stops working).
  const request = ids => {
    const people = ids.map(id => EMPLOYEES.find(e => e.id === id))
    setShowWho(false)
    setConfirm({
      ids,
      withPassword: people.filter(e => hasPassword(e, invites[e.id])).map(e => e.fullName),
      appOnly: people.filter(e => e.role === 'Careworker' || e.role === 'Supervisor').length,
      other: people.filter(e => !(e.role === 'Careworker' || e.role === 'Supervisor')).length,
    })
  }

  const selectAll = () => setSelected(new Set(eligible.map(e => e.id)))
  const selectNone = () => setSelected(new Set())
  const bar = (
    <div className="inv-bar">
      <div className="inv-bar-left"><span className="count-label">Selected: {selectedIds.length} – {items.length}</span></div>
      <div className="inv-bar-right">
        <ActionsMenu
          align="left"
          trigger={({ toggle }) => (
            <button type="button" className="round-btn secondary-btn btn-icon-right" onClick={toggle}>Select <ChevronDown /></button>
          )}
          items={[
            { label: `All (${eligible.length})`, onClick: selectAll, disabled: eligible.length === 0, disabledReason: 'There is nobody here you can send a password link to' },
            { label: 'None', onClick: selectNone },
          ]}
        />
        <ActionsMenu
          disabled={selectedIds.length === 0}
          trigger={({ toggle }) => (
            <button type="button" className="round-btn tertiary-btn btn-icon-left btn-icon-right" disabled={selectedIds.length === 0} onClick={toggle}>
              <SettingsIcon /> Actions <ChevronDown />
            </button>
          )}
          items={[{
            label: 'Send password link',
            info: 'Sends each employee a link to set their own password. The link works once and expires after 7 days.',
            onClick: () => request(selectedIds),
          }]}
        />
      </div>
    </div>
  )

  function Card({ e }) {
    const invite = invites[e.id]
    const status = statusOf(e)
    const reason = blockReason(e, viewer, invite)
    const isSelected = selected.has(e.id) && !reason
    const channel = status === 'invited' ? channelOf(e) : ''
    const selector = (
      <span className="inv-selector">
        {reason
          ? <Tooltip text={reason}><label className="checkbox-wrap"><input type="checkbox" disabled aria-label={`Select ${e.fullName}`} /><span className="checkbox-box" style={{ opacity: 0.4 }} /></label></Tooltip>
          : <label className="checkbox-wrap"><input type="checkbox" checked={isSelected} onChange={() => toggleSelect(e.id)} aria-label={`Select ${e.fullName}`} /><span className="checkbox-box" /></label>}
      </span>
    )
    return (
      <PersonCard
        name={e.fullName} photo={e.photo} initials={e.initials} avatarColor={e.avatarColor}
        selector={selector}
        cardClassName={`${isSelected ? 'inv-selected' : ''}${reason && status !== 'invited' ? ' inv-blocked' : ''}`}
        status={<StatusBadge label={STATUS_LABEL[e.status]} tone={e.status === 'active' ? 'active' : 'muted'} />}
        subtitle={<span className={`pl-role${SENIOR.has(e.role) ? ' pl-role--senior' : ''}`} title={e.role}>{e.role}</span>}
        details={[
          { label: 'Mobile', value: e.mobile ?? 'Not provided' },
          { label: 'Telephone', value: e.telephone ?? 'Not provided' },
          { label: 'Email', value: e.email ?? 'Not provided' },
        ]}
        extra={status === 'none' ? undefined : (
          <div className="inv-row">
            <div className={`inv-status inv-status--${status}`}>
              <strong>{INVITE_LABEL[status]} {invite.date}</strong>
              {channel && <span>By {channel}</span>}
              {status === 'expired' && !reason && <span>Select to resend</span>}
            </div>
          </div>
        )}
        chips={e.chips}
      />
    )
  }

  return (
    <>
      <PeopleListLayout
        activeNav="employees"
        title="Employees" addLabel="Add employee" noun="employee" nounPlural="employees" idPrefix="invites"
        searchPlaceholder="Search employees..."
        emptyHint="a name, role, phone number, email or area"
        query={query} onQueryChange={setQuery}
        filtersCount={filterCount(filters)}
        onClearFilters={() => setFilters(NO_FILTERS)}
        filterPanel={
          <FilterPanel noun="employee" nounPlural="employees" resultCount={items.length} canClear={filterCount(filters) > 0} onClear={() => setFilters(NO_FILTERS)}>
            <div className="pl-filter-cols">
              <CheckGroup legend="Status" options={STATUS_OPTIONS} selected={filters.statuses} onToggle={k => toggleIn('statuses', k)} />
              <CheckGroup legend="Role" options={ROLE_OPTIONS} selected={filters.roles} onToggle={k => toggleIn('roles', k)} />
              <CheckGroup legend="Password link" options={INVITE_OPTIONS} selected={filters.invites} onToggle={k => toggleIn('invites', k)} />
            </div>
          </FilterPanel>
        }
        sortPanel={
          <RadioGroup legend="Sort direction" name="invites-sort-direction" value={direction} onChange={setDirection}
            options={[{ value: 'asc', label: 'Ascending' }, { value: 'desc', label: 'Descending' }]} />
        }
        sortDirection={direction}
        sortIsDefault={direction === 'asc'}
        groupedByLetter
        items={items}
        renderCard={e => <Card e={e} />}
        toolbarExtra={bar}
      >
      {confirm && (
        <Modal title={`Send password link to ${confirm.ids.length === 1 ? '1 employee' : `${confirm.ids.length} employees`}?`} onClose={() => setConfirm(null)}>
          <div className="inv-modal-text">
            <p>{confirm.ids.length === 1 ? 'The employee gets' : 'Each employee gets'} a password link to set their own password.</p>
            <ul>
              {confirm.appOnly > 0 && <li>Applies to Careworkers and Supervisor roles: the link goes by SMS and email, and opens in the PASSforcare app to finish setting up.</li>}
              {confirm.other > 0 && <li>{confirm.appOnly > 0 && 'Applies to all other roles: '}{confirm.appOnly > 0 ? 'the' : 'The'} link goes by email, or SMS if there is no email. They set one password for PASS Web and PASSforcare.</li>}
              <li>The link works once and expires after 7 days.</li>
            </ul>
          </div>
          {confirm.withPassword.length > 0 && (
            <div className="warning-banner orange inv-modal-banner">
              <WarningIcon />
              <div>
                <h4>{confirm.withPassword.length === 1 ? '1 employee already has a password' : `${confirm.withPassword.length} employees already have a password`}</h4>
                <p>
                  Their old password stops working once they set a new one, and they will need to set up MFA again.{' '}
                  <button type="button" className="inv-link" aria-expanded={showWho} onClick={() => setShowWho(v => !v)}>
                    {showWho ? 'Hide who' : 'Show who'}
                  </button>
                </p>
                {showWho && <ul className="inv-who">{confirm.withPassword.map(n => <li key={n}>{n}</li>)}</ul>}
              </div>
            </div>
          )}
          <div className="inv-modal-actions">
            <button type="button" className="round-btn tertiary-btn" onClick={() => setConfirm(null)}>Cancel</button>
            <button type="button" className="round-btn primary-btn" onClick={() => send(confirm.ids)}>Send {confirm.ids.length === 1 ? 'password link' : 'password links'}</button>
          </div>
        </Modal>
      )}
      <div className="inv-proto" data-devmode-passthrough="true">
        <span className="inv-proto-tag">Prototype</span>
        <label className="inv-proto-label" htmlFor="inv-viewing-as">Viewing as</label>
        <select id="inv-viewing-as" className="inv-proto-select" value={viewer} onChange={e => changeViewer(e.target.value)}>
          {VIEWERS.map(v => <option key={v}>{v}</option>)}
        </select>
      </div>
      {toast && <div className="inv-toast" role="status">{toast}</div>}
      </PeopleListLayout>
    </>
  )
}
