import { useMemo, useState } from 'react'
import PeopleListLayout, {
  PersonCard, StatusBadge, LucideIcon, CheckGroup, RadioGroup, TagFilterSection, FilterPanel,
  buildTagGroups, matchesTags, matchesQuery, chipSearchText,
} from '../../../Components/PeopleList'
import { CUSTOMERS_LIST, STATUS_LABEL, reviewTimeOf } from './customersListData'

// The Customers list. The layout, toolbar, card and filter/sort building blocks
// are shared with the Employees list (Components/PeopleList.jsx); this file
// holds what's specific to customers: the flags on a card and the filter, sort
// and search rules.

// ─── Icons (Lucide, copied inline from lucide-react 0.487.0) ──

const HeartPulseIcon = () => (
  <LucideIcon>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
  </LucideIcon>
)
const LockIcon = () => (
  <LucideIcon><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></LucideIcon>
)
const TriangleAlertIcon = () => (
  <LucideIcon>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" />
  </LucideIcon>
)

// ─── Sorting, filtering and searching ─────────────────────────

function sortCustomers(customers, by, direction) {
  const sign = direction === 'asc' ? 1 : -1
  return [...customers].sort((a, b) => {
    if (by === 'review') {
      const ta = reviewTimeOf(a)
      const tb = reviewTimeOf(b)
      // No review date always goes last, whichever way it's sorted
      if (ta === null && tb === null) return a.surname.localeCompare(b.surname)
      if (ta === null) return 1
      if (tb === null) return -1
      return sign * (ta - tb) || a.surname.localeCompare(b.surname)
    }
    return sign * a.surname.localeCompare(b.surname)
  })
}

const STATUS_OPTIONS = ['assessment-booked', 'assessment-completed', 'active', 'inactive', 'finished']
  .map(key => ({ key, label: STATUS_LABEL[key] }))
const ALERT_OPTIONS = [
  { key: 'highRisk', label: 'High risk' },
  { key: 'dnacpr', label: 'DNACPR' },
  { key: 'dols', label: 'DoLS' },
  { key: 'allergies', label: 'Allergies' },
]
const REVIEW_OPTIONS = [
  { value: 'today', label: 'Due today' },
  { value: '7days', label: 'Due in the next 7 days' },
  { value: '4weeks', label: 'Due in the next 4 weeks' },
]

const NO_FILTERS = { statuses: [], alerts: [], review: null, tags: [] }
// The list opens showing only Active customers. "Clear all" goes to everyone.
const DEFAULT_FILTERS = { ...NO_FILTERS, statuses: ['active'] }

const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime() }

function inReviewWindow(c, window) {
  const t = reviewTimeOf(c)
  if (t === null) return false
  const days = Math.round((t - startOfToday()) / 86_400_000)
  if (window === 'today') return days === 0
  if (window === '7days') return days >= 0 && days <= 7
  return days >= 0 && days <= 28
}

// Status and alerts: any ticked value matches. Review date: one window. Tags:
// any value within a group matches, but every group with something ticked must.
function matchesFilters(c, f) {
  if (f.statuses.length > 0 && !f.statuses.includes(c.status)) return false
  if (f.alerts.length > 0 && !f.alerts.some(k => c[k])) return false
  if (f.review && !inReviewWindow(c, f.review)) return false
  return matchesTags(c.chips, f.tags)
}

const activeFilterCount = (f) => f.statuses.length + f.alerts.length + (f.review ? 1 : 0) + f.tags.length

// Everything on a card that a search can find
const searchableText = (c) => [
  c.fullName, STATUS_LABEL[c.status], c.dob, c.telephone ?? '', c.address,
  c.highRisk ? 'high risk' : '', c.dnacpr ? 'dnacpr' : '', c.dols ? 'dols' : '', c.allergies ? 'allergies' : '',
  c.reviewDate ? `review ${c.reviewDate}` : '',
  ...chipSearchText(c.chips),
].join(' ').toLowerCase()

const STATUS_TONE = {
  active: 'active',
  'assessment-booked': 'pending',
  'assessment-completed': 'pending',
  inactive: 'muted',
  finished: 'muted',
}

// ─── The card ─────────────────────────────────────────────────

function CustomerCard({ customer: c }) {
  return (
    <PersonCard
      name={c.fullName}
      photo={c.photo}
      initials={c.initials}
      avatarColor={c.avatarColor}
      status={<StatusBadge label={STATUS_LABEL[c.status]} tone={STATUS_TONE[c.status]} />}
      flags={<>
        {c.highRisk && <span className="pl-badge pl-flag pl-flag--high-risk">HIGH RISK</span>}
        {c.dnacpr && <span className="pl-badge pl-flag"><HeartPulseIcon />DNACPR</span>}
        {c.dols && <span className="pl-badge pl-flag"><LockIcon />DoLS</span>}
        {c.allergies && <span className="pl-badge pl-flag"><TriangleAlertIcon />Allergies</span>}
        {c.reviewDate && (
          <span
            className={`pl-badge pl-review${c.reviewOverdue ? ' pl-review--overdue' : ''}`}
            title={c.reviewOverdue ? 'Care plan review overdue' : 'Care plan review date'}
          >
            Review {c.reviewDate}
          </span>
        )}
      </>}
      details={[
        { label: 'Date of Birth', value: c.dob },
        { label: 'Telephone', value: c.telephone ?? 'Not provided' },
        { label: 'Address', value: c.address },
      ]}
      chips={c.chips}
    />
  )
}

// ─── Page ─────────────────────────────────────────────────────

export default function App() {
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('surname')
  const [sortDirection, setSortDirection] = useState('asc')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  const tagGroups = useMemo(() => buildTagGroups(CUSTOMERS_LIST), [])
  const items = useMemo(
    () => sortCustomers(CUSTOMERS_LIST.filter(c => matchesFilters(c, filters) && matchesQuery(searchableText(c), query)), sortBy, sortDirection),
    [query, filters, sortBy, sortDirection],
  )
  const toggle = (field, value) => {
    const current = filters[field]
    setFilters({ ...filters, [field]: current.includes(value) ? current.filter(x => x !== value) : [...current, value] })
  }

  return (
    <PeopleListLayout
      activeNav="customers"
      title="Customers" addLabel="Add customer" noun="customer" nounPlural="customers" idPrefix="customers"
      searchPlaceholder="Search customers..."
      emptyHint="a name, address, phone number, area or flag like DNACPR"
      query={query} onQueryChange={setQuery}
      filtersCount={activeFilterCount(filters)}
      onClearFilters={() => setFilters(NO_FILTERS)}
      filterPanel={
        <FilterPanel noun="customer" nounPlural="customers" resultCount={items.length} canClear={activeFilterCount(filters) > 0} onClear={() => setFilters(NO_FILTERS)}>
          <div className="pl-filter-cols">
            <CheckGroup legend="Status" options={STATUS_OPTIONS} selected={filters.statuses} onToggle={k => toggle('statuses', k)} />
            <RadioGroup
              legend="Review date" name="customers-filter-review" options={REVIEW_OPTIONS}
              value={filters.review} onChange={v => setFilters({ ...filters, review: v })}
              anyLabel="Any review date" onClear={() => setFilters({ ...filters, review: null })}
            />
            <CheckGroup legend="Alerts" options={ALERT_OPTIONS} selected={filters.alerts} onToggle={k => toggle('alerts', k)} />
          </div>
          <TagFilterSection tagGroups={tagGroups} selected={filters.tags} onToggle={k => toggle('tags', k)} />
        </FilterPanel>
      }
      sortPanel={<>
        <RadioGroup
          legend="Sort by" name="customers-sort-by" value={sortBy} onChange={setSortBy}
          options={[{ value: 'surname', label: 'Surname' }, { value: 'review', label: 'Review date' }]}
        />
        <RadioGroup
          legend="Sort direction" name="customers-sort-direction" value={sortDirection} onChange={setSortDirection}
          options={[{ value: 'asc', label: 'Ascending' }, { value: 'desc', label: 'Descending' }]}
        />
      </>}
      sortDirection={sortDirection}
      sortIsDefault={sortBy === 'surname' && sortDirection === 'asc'}
      // Grouped under A-Z headings only when sorted by surname: a review-date
      // order has no letters to group by, so it's one flat run of cards.
      groupedByLetter={sortBy === 'surname'}
      items={items}
      renderCard={c => <CustomerCard customer={c} />}
    />
  )
}
