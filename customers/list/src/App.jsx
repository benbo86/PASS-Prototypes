import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import SideNav from '../../../Components/SideNav'
import TopNav from '../../../Components/TopNav'
import Tooltip from '../../../Components/Tooltip'
import DevToolbar from '../../../Components/DevToolbar'
import DevMode from '../../../Components/DevMode'
import DevComments from '../../../Components/DevComments'
import DevEdit from '../../../Components/DevEdit'
import WireframeToggle from '../../../Components/WireframeToggle'
import AuditCapture from '../../../Components/AuditCapture'
import { useDevEditActive, useDevEditStickyDismiss, isDevToolUi } from '../../../Components/devEditHoverSticky'
import { CUSTOMERS_LIST, STATUS_LABEL, reviewTimeOf } from './customersListData'

// ─── Icons ────────────────────────────────────────────────────

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
  </svg>
)

// The product now uses Lucide icons (https://lucide.dev, ISC licence). These are
// copied inline from lucide-react 0.487.0, the version the design team's
// prototype uses, so there's no extra dependency.
const LucideIcon = ({ size = 16, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)
const PlusIcon = () => (
  <LucideIcon><path d="M5 12h14" /><path d="M12 5v14" /></LucideIcon>
)
const SearchIcon = () => (
  <LucideIcon><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></LucideIcon>
)
const SlidersHorizontalIcon = () => (
  <LucideIcon size={20}>
    <line x1="21" x2="14" y1="4" y2="4" /><line x1="10" x2="3" y1="4" y2="4" />
    <line x1="21" x2="12" y1="12" y2="12" /><line x1="8" x2="3" y1="12" y2="12" />
    <line x1="21" x2="16" y1="20" y2="20" /><line x1="12" x2="3" y1="20" y2="20" />
    <line x1="14" x2="14" y1="2" y2="6" /><line x1="8" x2="8" y1="10" y2="14" /><line x1="16" x2="16" y1="18" y2="22" />
  </LucideIcon>
)
const ArrowDownAZIcon = () => (
  <LucideIcon size={20}>
    <path d="m3 16 4 4 4-4" /><path d="M7 20V4" /><path d="M20 8h-5" /><path d="M15 10V6.5a2.5 2.5 0 0 1 5 0V10" /><path d="M15 14h5l-5 6h5" />
  </LucideIcon>
)
const ArrowDownZAIcon = () => (
  <LucideIcon size={20}>
    <path d="m3 16 4 4 4-4" /><path d="M7 4v16" /><path d="M15 4h5l-5 6h5" /><path d="M15 20v-3.5a2.5 2.5 0 0 1 5 0V20" /><path d="M20 18h-5" />
  </LucideIcon>
)
const CloseIcon = () => (
  <LucideIcon><path d="M18 6 6 18" /><path d="m6 6 12 12" /></LucideIcon>
)
const ChevronRightIcon = () => (
  <LucideIcon><path d="m9 18 6-6-6-6" /></LucideIcon>
)
const MapPinIcon = () => (
  <LucideIcon>
    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" />
  </LucideIcon>
)
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

const LETTERS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '#']
const COLUMNS = 3

const letterOf = (surname) => {
  const ch = surname.trim()[0]?.toUpperCase() ?? '#'
  return /[A-Z]/.test(ch) ? ch : '#'
}

// One section per letter, except that neighbouring letters merge ("E · F")
// while the merged group still fits in a single row of cards, so a lone card
// doesn't sit under its own heading.
function buildSections(items, direction) {
  const byLetter = new Map()
  items.forEach(c => {
    const l = letterOf(c.surname)
    byLetter.set(l, [...(byLetter.get(l) ?? []), c])
  })
  const sections = []
  ;(direction === 'asc' ? LETTERS : [...LETTERS].reverse()).filter(l => byLetter.has(l)).forEach(l => {
    const group = byLetter.get(l)
    const last = sections[sections.length - 1]
    if (last && last.items.length + group.length <= COLUMNS) {
      last.letters.push(l)
      last.items.push(...group)
    } else {
      sections.push({ letters: [l], items: [...group] })
    }
  })
  return { sections, byLetter }
}

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

const chipGroup = (chip) => (chip.type === 'region' ? 'Area' : chip.key)
const chipValue = (chip) => (chip.type === 'region' ? chip.label : chip.value)

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
  if (f.tags.length > 0) {
    const mine = new Set(c.chips.map(chip => `${chipGroup(chip)}::${chipValue(chip)}`))
    const byGroup = new Map()
    f.tags.forEach(t => {
      const group = t.split('::')[0]
      byGroup.set(group, [...(byGroup.get(group) ?? []), t])
    })
    for (const selected of byGroup.values()) {
      if (!selected.some(t => mine.has(t))) return false
    }
  }
  return true
}

const activeFilterCount = (f) => f.statuses.length + f.alerts.length + (f.review ? 1 : 0) + f.tags.length

// Everything on a card that a search can find
function searchableText(c) {
  return [
    c.fullName, STATUS_LABEL[c.status], c.dob, c.telephone ?? '', c.address,
    c.highRisk ? 'high risk' : '', c.dnacpr ? 'dnacpr' : '', c.dols ? 'dols' : '', c.allergies ? 'allergies' : '',
    c.reviewDate ? `review ${c.reviewDate}` : '',
    ...c.chips.map(chip => (chip.type === 'region' ? chip.label : `${chip.key} ${chip.value}`)),
  ].join(' ').toLowerCase()
}

// Every space-separated term must match somewhere, in any order ("lichfield dnacpr")
function matchesQuery(c, query) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return true
  const haystack = searchableText(c)
  return terms.every(t => haystack.includes(t))
}

function buildTagGroups(people) {
  const groups = new Map()
  people.forEach(c => c.chips.forEach(chip => {
    const g = chipGroup(chip)
    if (!groups.has(g)) groups.set(g, new Set())
    groups.get(g).add(chipValue(chip))
  }))
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([group, values]) => ({ group, values: [...values].sort((a, b) => a.localeCompare(b)) }))
}

// ─── Popover (filter / sort panels) ───────────────────────────

// A trigger button that opens a panel under it. The panel is portaled to <body>
// (like the other dropdowns here) and stays open while Dev Edit is on so its
// contents can be selected and styled.
function Popover({ label, icon, dot, panelClassName, children }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState(null)
  const anchor = useRef(null)
  const panelRef = useRef(null)
  const devEditActive = useDevEditActive()
  useDevEditStickyDismiss(devEditActive, open, setOpen, '.cl-popover')

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (isDevToolUi(e.target)) return
      if (panelRef.current?.contains(e.target) || anchor.current?.contains(e.target)) return
      setOpen(false)
    }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Sit under the button, nudged left if the panel would run off the right edge
  useLayoutEffect(() => {
    if (!open || !anchor.current) return
    const place = () => {
      const r = anchor.current.getBoundingClientRect()
      const w = panelRef.current?.offsetWidth ?? 0
      setPos({ top: r.bottom + 8, left: Math.max(8, Math.min(r.left, window.innerWidth - w - 8)) })
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => { window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true) }
  }, [open])

  return (
    <>
      <button
        ref={anchor} type="button" data-devmode-passthrough="true"
        className={`cl-icon-btn${open ? ' cl-icon-btn--open' : ''}`}
        aria-label={label} aria-haspopup="dialog" aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        {icon}
        {dot && <span className="cl-icon-btn-dot" aria-hidden="true" />}
      </button>
      {open && createPortal(
        <div
          ref={panelRef} role="dialog" aria-label={label}
          className={`fd-wrap cl-popover ${panelClassName ?? ''}`}
          style={{ position: 'fixed', top: pos?.top ?? -9999, left: pos?.left ?? -9999 }}
        >
          {children}
        </div>,
        document.body
      )}
    </>
  )
}

// ─── Card pieces ──────────────────────────────────────────────

function Chip({ chip }) {
  if (chip.type === 'region') {
    return (
      <span className="cl-tag" style={{ backgroundColor: chip.bg, color: chip.fg, borderColor: chip.border }}>
        <MapPinIcon />{chip.label}
      </span>
    )
  }
  return <span className="cl-tag cl-tag--attr"><b>{chip.key}:</b>{chip.value}</span>
}

// Area tags first, since area is what coordinators scan by. Only the first tag
// shows; the rest are one hover away.
function TagsFooter({ chips }) {
  // Always rendered, even empty: it's the card's last grid row, which has to
  // exist for the rows to line up across a row of cards.
  if (chips.length === 0) return <div className="cl-card-tags" aria-hidden="true" />
  const ordered = [...chips].sort((a, b) => Number(b.type === 'region') - Number(a.type === 'region'))
  const [first, ...rest] = ordered
  return (
    <div className="cl-card-tags">
      <Chip chip={first} />
      {rest.length > 0 && (
        <Tooltip
          wrapClassName="cl-alltags-tip"
          text={
            <div className="cl-alltags">
              <p>All tags</p>
              <div>{ordered.map((chip, i) => <Chip key={i} chip={chip} />)}</div>
            </div>
          }
        >
          <button type="button" className="cl-tag cl-tag--more" aria-label={`Show all ${chips.length} tags`}>
            +{rest.length} more
          </button>
        </Tooltip>
      )}
    </div>
  )
}

// A detail value that ellipsises when it doesn't fit, and only then shows the
// full text in a tooltip, so a short value never gets a pointless one.
function DetailValue({ text }) {
  const ref = useRef(null)
  const [truncated, setTruncated] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setTruncated(el.scrollWidth > el.clientWidth)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [text])
  const dd = <dd ref={ref} className="cl-detail-value">{text}</dd>
  return truncated ? <Tooltip text={text} wrapClassName="cl-detail-tip">{dd}</Tooltip> : dd
}

function StatusBadge({ status }) {
  return <span className={`cl-badge cl-status cl-status--${status}`}>{STATUS_LABEL[status]}</span>
}

function CustomerCard({ customer: c }) {
  return (
    <div className="cl-card-slot">
      <div className="cl-card">
        <div className="cl-card-head">
          {c.photo
            ? <img className="cl-avatar cl-avatar--photo" src={c.photo} alt="" />
            : <div className="cl-avatar" style={{ backgroundColor: c.avatarColor }} aria-hidden="true">{c.initials}</div>}
          <div className="cl-card-name"><span title={c.fullName}>{c.fullName}</span></div>
          <StatusBadge status={c.status} />
        </div>

        {/* Always rendered so details line up across neighbouring cards */}
        <div className="cl-card-flags">
          {c.highRisk && <span className="cl-badge cl-flag cl-flag--high-risk">HIGH RISK</span>}
          {c.dnacpr && <span className="cl-badge cl-flag"><HeartPulseIcon />DNACPR</span>}
          {c.dols && <span className="cl-badge cl-flag"><LockIcon />DoLS</span>}
          {c.allergies && <span className="cl-badge cl-flag"><TriangleAlertIcon />Allergies</span>}
          {c.reviewDate && (
            <span
              className={`cl-badge cl-review${c.reviewOverdue ? ' cl-review--overdue' : ''}`}
              title={c.reviewOverdue ? 'Care plan review overdue' : 'Care plan review date'}
            >
              Review {c.reviewDate}
            </span>
          )}
        </div>

        <dl className="cl-card-details">
          <div><dt>Date of Birth:</dt><DetailValue text={c.dob} /></div>
          <div><dt>Telephone:</dt><DetailValue text={c.telephone ?? 'Not provided'} /></div>
          <div><dt>Address:</dt><DetailValue text={c.address} /></div>
        </dl>

        <TagsFooter chips={c.chips} />
      </div>
    </div>
  )
}

// ─── Filter and sort panels ───────────────────────────────────

function CheckGroup({ legend, options, selected, onToggle }) {
  return (
    <fieldset className="cl-fieldset">
      <legend>{legend}</legend>
      {options.map(o => (
        <label key={o.key} className="checkbox-wrap cl-check">
          <input type="checkbox" checked={selected.includes(o.key)} onChange={() => onToggle(o.key)} />
          <span className="checkbox-box" />
          <span>{o.label}</span>
        </label>
      ))}
    </fieldset>
  )
}

function TagFilterSection({ tagGroups, selected, onToggle }) {
  // A group opens by default if something in it is already ticked
  const [open, setOpen] = useState(() => new Set(selected.map(t => t.split('::')[0])))
  const toggleOpen = (g) => setOpen(prev => {
    const next = new Set(prev)
    next.has(g) ? next.delete(g) : next.add(g)
    return next
  })
  return (
    <>
      <h3 className="cl-tags-title">Tags</h3>
      {tagGroups.map(({ group, values }) => {
        const isOpen = open.has(group)
        const ticked = values.filter(v => selected.includes(`${group}::${v}`)).length
        return (
          <div key={group} className="cl-tag-group">
            <button type="button" className="cl-tag-group-btn" aria-expanded={isOpen} onClick={() => toggleOpen(group)}>
              <span className={`cl-tag-group-chev${isOpen ? ' cl-tag-group-chev--open' : ''}`}><ChevronRightIcon /></span>
              {group}
              {ticked > 0 && <span className="cl-tag-group-count">({ticked})</span>}
            </button>
            {isOpen && (
              <div className="cl-tag-group-values">
                {values.map(v => (
                  <label key={v} className="checkbox-wrap cl-check">
                    <input type="checkbox" checked={selected.includes(`${group}::${v}`)} onChange={() => onToggle(`${group}::${v}`)} />
                    <span className="checkbox-box" />
                    <span>{v}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}

function FilterPanel({ filters, onChange, tagGroups, resultCount }) {
  const toggle = (field, value) => {
    const current = filters[field]
    onChange({ ...filters, [field]: current.includes(value) ? current.filter(x => x !== value) : [...current, value] })
  }
  return (
    <div className="cl-filter-panel">
      <div className="cl-filter-scroll">
        <div className="cl-filter-cols">
          <CheckGroup legend="Status" options={STATUS_OPTIONS} selected={filters.statuses} onToggle={k => toggle('statuses', k)} />
          <fieldset className="cl-fieldset">
            <legend>Review date</legend>
            {REVIEW_OPTIONS.map(o => (
              <label key={o.value} className="cl-check cl-radio">
                <input type="radio" name="customers-filter-review" className="form-radio" checked={filters.review === o.value} onChange={() => onChange({ ...filters, review: o.value })} />
                <span>{o.label}</span>
              </label>
            ))}
            {/* A radio can't be un-picked, so there's an explicit way back to "any" */}
            {filters.review && (
              <button type="button" className="cl-link-btn" onClick={() => onChange({ ...filters, review: null })}>Any review date</button>
            )}
          </fieldset>
          <CheckGroup legend="Alerts" options={ALERT_OPTIONS} selected={filters.alerts} onToggle={k => toggle('alerts', k)} />
        </div>
        <TagFilterSection tagGroups={tagGroups} selected={filters.tags} onToggle={k => toggle('tags', k)} />
      </div>
      <div className="cl-filter-footer">
        <span aria-live="polite">{resultCount} {resultCount === 1 ? 'customer' : 'customers'}</span>
        <button type="button" className="round-btn tertiary-btn" disabled={activeFilterCount(filters) === 0} onClick={() => onChange(NO_FILTERS)}>Clear all</button>
      </div>
    </div>
  )
}

function RadioGroup({ legend, name, value, onChange, options }) {
  return (
    <fieldset className="cl-fieldset">
      <legend>{legend}</legend>
      {options.map(o => (
        <label key={o.value} className="cl-check cl-radio">
          <input type="radio" name={name} className="form-radio" checked={value === o.value} onChange={() => onChange(o.value)} />
          <span>{o.label}</span>
        </label>
      ))}
    </fieldset>
  )
}

// ─── Page ─────────────────────────────────────────────────────

export default function App() {
  const pageRef = useRef(null)
  const toolbarRef = useRef(null)
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('surname')
  const [sortDirection, setSortDirection] = useState('asc')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  const tagGroups = useMemo(() => buildTagGroups(CUSTOMERS_LIST), [])
  const filtersCount = activeFilterCount(filters)
  const items = useMemo(
    () => sortCustomers(CUSTOMERS_LIST.filter(c => matchesFilters(c, filters) && matchesQuery(c, query)), sortBy, sortDirection),
    [query, filters, sortBy, sortDirection],
  )
  const groupedByLetter = sortBy === 'surname'
  // Sections and the A-Z bar come from the matches, so letters with nobody in
  // them grey out as you type.
  const { sections, byLetter } = buildSections(items, sortDirection)
  const displaySections = groupedByLetter ? sections : [{ letters: [], items }]
  const total = items.length

  // The pinned toolbar's height, so sticky letter headings and letter jumps
  // can stop below it rather than sliding underneath.
  useLayoutEffect(() => {
    const el = toolbarRef.current
    const page = pageRef.current
    if (!el || !page) return
    const measure = () => page.style.setProperty('--cl-toolbar-h', `${el.getBoundingClientRect().height}px`)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const jumpTo = (letter) => document.getElementById(`customers-section-${letter}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <>
      <DevToolbar>
        <DevEdit containerRef={pageRef} prototypeId={window.location.pathname} />
        <DevMode containerRef={pageRef} />
        <DevComments containerRef={pageRef} prototypeId={window.location.pathname} />
        <WireframeToggle />
        <AuditCapture containerRef={pageRef} />
      </DevToolbar>
      <div className="cl-page" ref={pageRef}>
        <a href="../../" className="back-link">
          <ChevronLeftIcon /> Prototypes
        </a>
        <SideNav activeItem="customers" />

        <div className="page-body">
          <TopNav />
          <main className="cl-container">
            <div className="cl-toolbar" ref={toolbarRef}>
              <div className="cl-title-row">
                <h1>Customers</h1>
                <button type="button" className="round-btn primary-btn btn-icon-left"><PlusIcon /> Add customer</button>
              </div>

              <div className="cl-filterbar">
                <Popover
                  label={filtersCount > 0 ? `Filter (${filtersCount} applied)` : 'Filter'}
                  icon={<SlidersHorizontalIcon />} dot={filtersCount > 0} panelClassName="cl-popover--filter"
                >
                  <FilterPanel filters={filters} onChange={setFilters} tagGroups={tagGroups} resultCount={total} />
                </Popover>
                <Popover
                  label="Sort" icon={sortDirection === 'asc' ? <ArrowDownAZIcon /> : <ArrowDownZAIcon />}
                  dot={!(sortBy === 'surname' && sortDirection === 'asc')}
                >
                  <div className="cl-sort-panel">
                    <RadioGroup
                      legend="Sort by" name="customers-sort-by" value={sortBy} onChange={setSortBy}
                      options={[{ value: 'surname', label: 'Surname' }, { value: 'review', label: 'Review date' }]}
                    />
                    <RadioGroup
                      legend="Sort direction" name="customers-sort-direction" value={sortDirection} onChange={setSortDirection}
                      options={[{ value: 'asc', label: 'Ascending' }, { value: 'desc', label: 'Descending' }]}
                    />
                  </div>
                </Popover>
                <div className="cl-search" role="search">
                  <span className="cl-search-icon"><SearchIcon /></span>
                  <input
                    type="text" value={query} placeholder="Search customers..." aria-label="Search customers"
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Escape') setQuery('') }}
                  />
                  <div className="cl-search-end">
                    {query && (
                      <button type="button" className="cl-search-clear" aria-label="Clear search" onClick={() => setQuery('')}><CloseIcon /></button>
                    )}
                    <span aria-live="polite">{total} {total === 1 ? 'customer' : 'customers'}</span>
                  </div>
                </div>
              </div>

              {/* A-Z jump bar. Letters with nobody in them are disabled, and so is
                  the whole bar when the list isn't grouped by surname. */}
              <div
                className="cl-letters" role="navigation" aria-label="Jump to letter"
                title={groupedByLetter ? undefined : 'Letters are only available when sorted by surname'}
              >
                {LETTERS.map(l => {
                  const count = byLetter.get(l)?.length ?? 0
                  return (
                    <button key={l} type="button" className="cl-letter" disabled={!groupedByLetter || count === 0} aria-label={`${l} (${count})`} onClick={() => jumpTo(l)}>{l}</button>
                  )
                })}
              </div>
            </div>

            {total === 0 && (
              <div className="cl-empty">
                <p className="cl-empty-title">
                  {query.trim()
                    ? <>No customers match “{query.trim()}”{filtersCount > 0 && ' with these filters'}</>
                    : 'No customers match these filters'}
                </p>
                <p className="cl-empty-hint">Try a name, address, phone number, area or flag like DNACPR, or loosen the filters.</p>
                <div className="cl-empty-actions">
                  {query && <button type="button" className="round-btn tertiary-btn" onClick={() => setQuery('')}>Clear search</button>}
                  {filtersCount > 0 && <button type="button" className="round-btn tertiary-btn" onClick={() => setFilters(NO_FILTERS)}>Clear filters</button>}
                </div>
              </div>
            )}

            {displaySections.map(section => (
              <section key={section.letters.join('') || 'all'} className="cl-section">
                {section.letters.length > 0 && (
                  <h2 className="cl-section-title">
                    {section.letters.map((l, i) => (
                      <span key={l}>
                        {i > 0 && <span className="cl-section-sep">·</span>}
                        <span id={`customers-section-${l}`} className="cl-section-letter">{l}</span>
                      </span>
                    ))}
                  </h2>
                )}
                {/* Each card spans its rows of this grid (header / flags / details /
                    tags) via subgrid, so those rows are as tall as the tallest card
                    in the row. That's what lines details and tags up across cards. */}
                <div className="cl-grid">
                  {section.items.map(c => <CustomerCard key={c.id} customer={c} />)}
                </div>
              </section>
            ))}
          </main>
        </div>
      </div>
    </>
  )
}
