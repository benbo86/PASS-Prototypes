import { useMemo, useState } from 'react'
import PeopleListLayout, {
  PersonCard, StatusBadge, IconTip, LucideIcon, CheckGroup, RadioGroup, TagFilterSection, FilterPanel,
  buildTagGroups, matchesTags, matchesQuery, chipSearchText,
} from '../../../Components/PeopleList'
import { EMPLOYEES_LIST, STATUS_LABEL, ROLES, SENIOR_ROLES } from './employeesListData'

// The Employees list. The layout, toolbar, card and filter/sort building blocks
// are shared with the Customers list (Components/PeopleList.jsx); this file
// holds what's specific to employees: the role line, the app-activity row
// (notifications, last login and app version) and the filter, sort and search rules.

// ─── Icons (Lucide, copied inline from lucide-react 0.487.0) ──

const BellIcon = () => (
  <LucideIcon>
    <path d="M10.268 21a2 2 0 0 0 3.464 0" />
    <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
  </LucideIcon>
)
const BellOffIcon = () => (
  <LucideIcon>
    <path d="M10.268 21a2 2 0 0 0 3.464 0" />
    <path d="M17 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 .258-1.742" />
    <path d="m2 2 20 20" />
    <path d="M8.668 3.01A6 6 0 0 1 18 8c0 2.687.77 4.653 1.707 6.05" />
  </LucideIcon>
)
const CheckSmallIcon = () => <LucideIcon size={7} strokeWidth={3}><path d="M20 6 9 17l-5-5" /></LucideIcon>
const CrossSmallIcon = () => <LucideIcon size={7} strokeWidth={3}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></LucideIcon>
const CircleCheckIcon = () => (
  <LucideIcon><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></LucideIcon>
)
const CircleArrowUpIcon = () => (
  <LucideIcon><circle cx="12" cy="12" r="10" /><path d="m16 12-4-4-4 4" /><path d="M12 16V8" /></LucideIcon>
)

// ─── App activity ─────────────────────────────────────────────

// "today", "1 day ago", "16 days ago", "2 months ago"
function ago(days) {
  if (days === 0) return 'today'
  if (days === 1) return '1 day ago'
  if (days < 60) return `${days} days ago`
  return `${Math.floor(days / 30)} months ago`
}

// A login more than a month ago reads red: someone who may not be seeing their
// rota or messages. (Live shows it red; how many days counts as stale is a guess.)
const STALE_DAYS = 30

// The card's extra row: whether app notifications are on (left, as an icon with
// the meaning on hover) and, right-aligned, when they last logged in and on
// what, plus whether that's the newest version of the app. Everyone gets the
// row, so it lines up across a row of cards.
function AppActivity({ app }) {
  return (
    <>
      {app && (app.notificationsOn
        ? (
          <IconTip label="App notifications enabled">
            <span className="pl-bell"><BellIcon /><span className="pl-bell-badge pl-bell-badge--on"><CheckSmallIcon /></span></span>
          </IconTip>
        ) : (
          <IconTip label="App notifications are off">
            <span className="pl-bell"><BellOffIcon /><span className="pl-bell-badge pl-bell-badge--off"><CrossSmallIcon /></span></span>
          </IconTip>
        ))}
      <div className="pl-app-login">
        {app ? (
          <>
            <span className={app.daysAgo >= STALE_DAYS ? 'pl-app-stale' : undefined}>
              Last login {ago(app.daysAgo)} · {app.platform} {app.version}
            </span>
            {app.latest
              ? <IconTip label="Using the latest version of the PASS app" className="pl-version--latest"><CircleCheckIcon /></IconTip>
              : <IconTip label="Update available for the PASS app" className="pl-version--update"><CircleArrowUpIcon /></IconTip>}
          </>
        ) : (
          <span className="pl-app-none">No login information</span>
        )}
      </div>
    </>
  )
}

// ─── Sorting, filtering and searching ─────────────────────────

function sortEmployees(employees, by, direction) {
  const sign = direction === 'asc' ? 1 : -1
  return [...employees].sort((a, b) => {
    if (by === 'login') {
      const da = a.app ? a.app.daysAgo : null
      const db = b.app ? b.app.daysAgo : null
      // Never logged in always goes last, whichever way it's sorted
      if (da === null && db === null) return a.surname.localeCompare(b.surname)
      if (da === null) return 1
      if (db === null) return -1
      // Ascending = oldest login first (most days ago); descending = most recent first
      return sign * (db - da) || a.surname.localeCompare(b.surname)
    }
    return sign * a.surname.localeCompare(b.surname)
  })
}

const STATUS_OPTIONS = ['active', 'inactive', 'leaver'].map(key => ({ key, label: STATUS_LABEL[key] }))
const ROLE_OPTIONS = ROLES.map(r => ({ key: r, label: r }))
const NOTIFICATION_OPTIONS = [
  { key: 'on', label: 'Notifications on' },
  { key: 'off', label: 'Notifications off' },
]
const LOGIN_OPTIONS = [
  { value: 'week', label: 'Logged in this week' },
  { value: 'stale', label: `Not for ${STALE_DAYS}+ days` },
  { value: 'never', label: 'Never logged in' },
]

const NO_FILTERS = { statuses: [], roles: [], login: null, notifications: [], tags: [] }
// The list opens showing only Active employees. "Clear all" goes to everyone.
const DEFAULT_FILTERS = { ...NO_FILTERS, statuses: ['active'] }

// Status, role and notifications: any ticked value matches. App login: one
// window. Tags: any value within a group matches, but every group with
// something ticked must.
function matchesFilters(e, f) {
  if (f.statuses.length > 0 && !f.statuses.includes(e.status)) return false
  if (f.roles.length > 0 && !f.roles.includes(e.role)) return false
  if (f.login) {
    if (f.login === 'never' && e.app) return false
    if (f.login === 'week' && !(e.app && e.app.daysAgo <= 7)) return false
    if (f.login === 'stale' && !(e.app && e.app.daysAgo >= STALE_DAYS)) return false
  }
  // Someone who's never logged in has no notification setting, so neither matches
  if (f.notifications.length > 0) {
    if (!e.app) return false
    if (!f.notifications.includes(e.app.notificationsOn ? 'on' : 'off')) return false
  }
  return matchesTags(e.chips, f.tags)
}

const activeFilterCount = (f) => f.statuses.length + f.roles.length + (f.login ? 1 : 0) + f.notifications.length + f.tags.length

// Everything on a card that a search can find
const searchableText = (e) => [
  e.fullName, e.role, STATUS_LABEL[e.status], e.mobile ?? '', e.telephone ?? '', e.email ?? '',
  e.app ? `${e.app.platform} ${e.app.version} notifications ${e.app.notificationsOn ? 'on' : 'off'}` : 'no login information never logged in',
  ...chipSearchText(e.chips),
].join(' ').toLowerCase()

// ─── The card ─────────────────────────────────────────────────

function EmployeeCard({ employee: e }) {
  return (
    <PersonCard
      name={e.fullName}
      photo={e.photo}
      initials={e.initials}
      avatarColor={e.avatarColor}
      status={<StatusBadge label={STATUS_LABEL[e.status]} tone={e.status === 'active' ? 'active' : 'muted'} />}
      // The role is a line under the name. Employees have no flags row.
      subtitle={<span className={`pl-role${SENIOR_ROLES.has(e.role) ? ' pl-role--senior' : ''}`} title={e.role}>{e.role}</span>}
      details={[
        { label: 'Mobile', value: e.mobile ?? 'Not provided' },
        { label: 'Telephone', value: e.telephone ?? 'Not provided' },
        { label: 'Email', value: e.email ?? 'Not provided' },
      ]}
      extra={<AppActivity app={e.app} />}
      chips={e.chips}
    />
  )
}

// ─── Page ─────────────────────────────────────────────────────

export default function App() {
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('surname')
  const [sortDirection, setSortDirection] = useState('asc')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  const tagGroups = useMemo(() => buildTagGroups(EMPLOYEES_LIST), [])
  const items = useMemo(
    () => sortEmployees(EMPLOYEES_LIST.filter(e => matchesFilters(e, filters) && matchesQuery(searchableText(e), query)), sortBy, sortDirection),
    [query, filters, sortBy, sortDirection],
  )
  const toggle = (field, value) => {
    const current = filters[field]
    setFilters({ ...filters, [field]: current.includes(value) ? current.filter(x => x !== value) : [...current, value] })
  }

  return (
    <PeopleListLayout
      activeNav="employees"
      title="Employees" addLabel="Add employee" noun="employee" nounPlural="employees" idPrefix="employees"
      searchPlaceholder="Search employees..."
      emptyHint="a name, role, phone number, email, area or app version"
      query={query} onQueryChange={setQuery}
      filtersCount={activeFilterCount(filters)}
      onClearFilters={() => setFilters(NO_FILTERS)}
      filterPanel={
        <FilterPanel noun="employee" nounPlural="employees" resultCount={items.length} canClear={activeFilterCount(filters) > 0} onClear={() => setFilters(NO_FILTERS)}>
          <div className="pl-filter-cols">
            <CheckGroup legend="Status" options={STATUS_OPTIONS} selected={filters.statuses} onToggle={k => toggle('statuses', k)} />
            <CheckGroup legend="Role" options={ROLE_OPTIONS} selected={filters.roles} onToggle={k => toggle('roles', k)} />
            <div>
              <RadioGroup
                legend="App login" name="employees-filter-login" options={LOGIN_OPTIONS}
                value={filters.login} onChange={v => setFilters({ ...filters, login: v })}
                anyLabel="Any login" onClear={() => setFilters({ ...filters, login: null })}
              />
              <CheckGroup legend="Notifications" options={NOTIFICATION_OPTIONS} selected={filters.notifications} onToggle={k => toggle('notifications', k)} />
            </div>
          </div>
          <TagFilterSection tagGroups={tagGroups} selected={filters.tags} onToggle={k => toggle('tags', k)} />
        </FilterPanel>
      }
      sortPanel={<>
        <RadioGroup
          legend="Sort by" name="employees-sort-by" value={sortBy} onChange={setSortBy}
          options={[{ value: 'surname', label: 'Surname' }, { value: 'login', label: 'Last app login' }]}
        />
        <RadioGroup
          legend="Sort direction" name="employees-sort-direction" value={sortDirection} onChange={setSortDirection}
          // "Ascending" says little about a login time, so say which end comes first
          options={sortBy === 'login'
            ? [{ value: 'asc', label: 'Oldest login first' }, { value: 'desc', label: 'Most recent first' }]
            : [{ value: 'asc', label: 'Ascending' }, { value: 'desc', label: 'Descending' }]}
        />
      </>}
      sortDirection={sortDirection}
      sortIsDefault={sortBy === 'surname' && sortDirection === 'asc'}
      // Grouped under A-Z headings only when sorted by surname
      groupedByLetter={sortBy === 'surname'}
      items={items}
      renderCard={e => <EmployeeCard employee={e} />}
    />
  )
}
