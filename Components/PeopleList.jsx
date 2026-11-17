import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import SideNav from './SideNav'
import TopNav from './TopNav'
import Tooltip from './Tooltip'
import DevToolbar from './DevToolbar'
import DevMode from './DevMode'
import DevComments from './DevComments'
import DevEdit from './DevEdit'
import WireframeToggle from './WireframeToggle'
import AuditCapture from './AuditCapture'
import { useDevEditActive, useDevEditStickyDismiss, isDevToolUi } from './devEditHoverSticky'

// The Customers and Employees lists (customers/list, employees/list) share this:
// the pinned toolbar (title, add button, filter / sort / search, A-Z jump bar),
// the letter-grouped card grid, the card itself and the filter / sort panel
// building blocks. Each list supplies its own data, filter and sort rules, and
// what goes in the card's flags / details / extra row.
// Styles: Styles/people-list.css (import it in the prototype's main.jsx).

// ─── Icons ────────────────────────────────────────────────────

// The product uses Lucide icons (https://lucide.dev, ISC licence). These are
// copied inline from lucide-react 0.487.0, the version the design team's
// prototype uses, so there's no extra dependency.
export const LucideIcon = ({ size = 16, strokeWidth = 2, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)
const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
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

// ─── Sections, tags and search (plain functions) ──────────────

export const LETTERS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '#']
const COLUMNS = 3

const letterOf = (surname) => {
  const ch = surname.trim()[0]?.toUpperCase() ?? '#'
  return /[A-Z]/.test(ch) ? ch : '#'
}

// One section per letter, except that neighbouring letters merge ("E · F")
// while the merged group still fits in a single row of cards, so a lone card
// doesn't sit under its own heading.
export function buildSections(items, direction) {
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

export const chipGroup = (chip) => (chip.type === 'region' ? 'Area' : chip.key)
export const chipValue = (chip) => (chip.type === 'region' ? chip.label : chip.value)

// Tags are ticked as `${group}::${value}`. Any value within a group matches,
// but every group with something ticked must.
export function matchesTags(chips, selectedTags) {
  if (selectedTags.length === 0) return true
  const mine = new Set(chips.map(chip => `${chipGroup(chip)}::${chipValue(chip)}`))
  const byGroup = new Map()
  selectedTags.forEach(t => {
    const group = t.split('::')[0]
    byGroup.set(group, [...(byGroup.get(group) ?? []), t])
  })
  for (const selected of byGroup.values()) {
    if (!selected.some(t => mine.has(t))) return false
  }
  return true
}

export function buildTagGroups(people) {
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

// Every space-separated term must match somewhere in the text, in any order ("lichfield dnacpr")
export function matchesQuery(haystack, query) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  return terms.every(t => haystack.includes(t))
}

export const chipSearchText = (chips) => chips.map(chip => (chip.type === 'region' ? chip.label : `${chip.key} ${chip.value}`))

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
  useDevEditStickyDismiss(devEditActive, open, setOpen, '.pl-popover')

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
        className={`pl-icon-btn${open ? ' pl-icon-btn--open' : ''}`}
        aria-label={label} aria-haspopup="dialog" aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        {icon}
        {dot && <span className="pl-icon-btn-dot" aria-hidden="true" />}
      </button>
      {open && createPortal(
        <div
          ref={panelRef} role="dialog" aria-label={label}
          className={`fd-wrap pl-popover ${panelClassName ?? ''}`}
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
      <span className="pl-tag" style={{ backgroundColor: chip.bg, color: chip.fg, borderColor: chip.border }}>
        <MapPinIcon />{chip.label}
      </span>
    )
  }
  return <span className="pl-tag pl-tag--attr"><b>{chip.key}:</b>{chip.value}</span>
}

// Area tags first, since area is what coordinators scan by. Only the first tag
// shows; the rest are one hover away.
function TagsFooter({ chips }) {
  // Always rendered, even empty: it's the card's last grid row, which has to
  // exist for the rows to line up across a row of cards.
  if (chips.length === 0) return <div className="pl-card-tags" aria-hidden="true" />
  const ordered = [...chips].sort((a, b) => Number(b.type === 'region') - Number(a.type === 'region'))
  const [first, ...rest] = ordered
  return (
    <div className="pl-card-tags">
      <Chip chip={first} />
      {rest.length > 0 && (
        <Tooltip
          wrapClassName="pl-alltags-tip"
          text={
            <div className="pl-alltags">
              <p>All tags</p>
              <div>{ordered.map((chip, i) => <Chip key={i} chip={chip} />)}</div>
            </div>
          }
        >
          <button type="button" className="pl-tag pl-tag--more" aria-label={`Show all ${chips.length} tags`}>
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
  const dd = <dd ref={ref} className="pl-detail-value">{text}</dd>
  return truncated ? <Tooltip text={text} wrapClassName="pl-detail-tip">{dd}</Tooltip> : dd
}

// tone: 'active' (green), 'pending' (amber) or 'muted' (grey)
export function StatusBadge({ label, tone }) {
  return <span className={`pl-badge pl-status pl-status--${tone}`}>{label}</span>
}

// An icon whose meaning is on hover (and its screen-reader label)
export function IconTip({ label, className = '', children }) {
  return (
    <Tooltip text={label}>
      <span tabIndex={0} role="img" aria-label={label} className={`pl-icon-tip ${className}`}>{children}</span>
    </Tooltip>
  )
}

// name, photo/initials and the status badge sit in the header row. `subtitle`
// is a line under the name. `flags` is the row of badges under the header: pass
// it (even empty) to reserve the row so details line up across cards, or leave
// it out to have no row. `extra` goes under the details, above the tags.
export function PersonCard({ name, photo, initials, avatarColor, status, subtitle, flags, details, extra, chips }) {
  return (
    <div className="pl-card-slot">
      <div className="pl-card">
        <div className="pl-card-head">
          {photo
            ? <img className="pl-avatar pl-avatar--photo" src={photo} alt="" />
            : <div className="pl-avatar" style={{ backgroundColor: avatarColor }} aria-hidden="true">{initials}</div>}
          <div className="pl-card-name">
            <span className="pl-card-name-text" title={name}>{name}</span>
            {subtitle}
          </div>
          {status}
        </div>

        <div className={`pl-card-flags${flags === undefined ? ' pl-card-flags--off' : ''}`}>{flags}</div>

        <div className="pl-card-body">
          <dl className="pl-card-details">
            {details.map(d => (
              <div key={d.label}><dt>{d.label}:</dt><DetailValue text={d.value} /></div>
            ))}
          </dl>
          {extra && <div className="pl-card-extra">{extra}</div>}
        </div>

        <TagsFooter chips={chips} />
      </div>
    </div>
  )
}

// ─── Filter and sort panel pieces ─────────────────────────────

export function CheckGroup({ legend, options, selected, onToggle }) {
  return (
    <fieldset className="pl-fieldset">
      <legend>{legend}</legend>
      {options.map(o => (
        <label key={o.key} className="checkbox-wrap pl-check">
          <input type="checkbox" checked={selected.includes(o.key)} onChange={() => onToggle(o.key)} />
          <span className="checkbox-box" />
          <span>{o.label}</span>
        </label>
      ))}
    </fieldset>
  )
}

// One-of group with an explicit way back to "any" (a radio can't be un-picked)
export function RadioGroup({ legend, name, value, onChange, options, anyLabel, onClear }) {
  return (
    <fieldset className="pl-fieldset">
      <legend>{legend}</legend>
      {options.map(o => (
        <label key={o.value} className="pl-check pl-radio">
          <input type="radio" name={name} className="form-radio" checked={value === o.value} onChange={() => onChange(o.value)} />
          <span>{o.label}</span>
        </label>
      ))}
      {anyLabel && value && (
        <button type="button" className="pl-link-btn" onClick={onClear}>{anyLabel}</button>
      )}
    </fieldset>
  )
}

export function TagFilterSection({ tagGroups, selected, onToggle }) {
  // A group opens by default if something in it is already ticked
  const [open, setOpen] = useState(() => new Set(selected.map(t => t.split('::')[0])))
  const toggleOpen = (g) => setOpen(prev => {
    const next = new Set(prev)
    next.has(g) ? next.delete(g) : next.add(g)
    return next
  })
  return (
    <>
      <h3 className="pl-tags-title">Tags</h3>
      {tagGroups.map(({ group, values }) => {
        const isOpen = open.has(group)
        const ticked = values.filter(v => selected.includes(`${group}::${v}`)).length
        return (
          <div key={group} className="pl-tag-group">
            <button type="button" className="pl-tag-group-btn" aria-expanded={isOpen} onClick={() => toggleOpen(group)}>
              <span className={`pl-tag-group-chev${isOpen ? ' pl-tag-group-chev--open' : ''}`}><ChevronRightIcon /></span>
              {group}
              {ticked > 0 && <span className="pl-tag-group-count">({ticked})</span>}
            </button>
            {isOpen && (
              <div className="pl-tag-group-values">
                {values.map(v => (
                  <label key={v} className="checkbox-wrap pl-check">
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

// The panel shell: scrolling content, then a footer with the live count and Clear all
export function FilterPanel({ noun, nounPlural, resultCount, canClear, onClear, children }) {
  return (
    <div className="pl-filter-panel">
      <div className="pl-filter-scroll">{children}</div>
      <div className="pl-filter-footer">
        <span aria-live="polite">{resultCount} {resultCount === 1 ? noun : nounPlural}</span>
        <button type="button" className="round-btn tertiary-btn" disabled={!canClear} onClick={onClear}>Clear all</button>
      </div>
    </div>
  )
}

// ─── The page ─────────────────────────────────────────────────

// Everything from the dev toolbar down: side nav, top nav, pinned toolbar,
// A-Z bar and the sections of cards. `items` is already filtered and sorted;
// `renderCard(item)` returns a <PersonCard>. Each item needs `id` and `surname`.
export default function PeopleListLayout({
  activeNav, title, addLabel, noun, nounPlural, idPrefix, searchPlaceholder, emptyHint,
  query, onQueryChange, filtersCount, filterPanel, onClearFilters,
  sortPanel, sortDirection, sortIsDefault, groupedByLetter, items, renderCard,
}) {
  const pageRef = useRef(null)
  const toolbarRef = useRef(null)
  const total = items.length
  // Sections and the A-Z bar come from the matches, so letters with nobody in
  // them grey out as you type.
  const { sections, byLetter } = buildSections(items, sortDirection)
  const displaySections = groupedByLetter ? sections : [{ letters: [], items }]

  // The pinned toolbar's height, so sticky letter headings and letter jumps
  // can stop below it rather than sliding underneath.
  useLayoutEffect(() => {
    const el = toolbarRef.current
    const page = pageRef.current
    if (!el || !page) return
    const measure = () => page.style.setProperty('--pl-toolbar-h', `${el.getBoundingClientRect().height}px`)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const jumpTo = (letter) => document.getElementById(`${idPrefix}-section-${letter}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <>
      <DevToolbar>
        <DevEdit containerRef={pageRef} prototypeId={window.location.pathname} />
        <DevMode containerRef={pageRef} />
        <DevComments containerRef={pageRef} prototypeId={window.location.pathname} />
        <WireframeToggle />
        <AuditCapture containerRef={pageRef} />
      </DevToolbar>
      <div className="pl-page" ref={pageRef}>
        <a href="../../" className="back-link">
          <ChevronLeftIcon /> Prototypes
        </a>
        <SideNav activeItem={activeNav} />

        <div className="page-body">
          <TopNav />
          <main className="pl-container">
            <div className="pl-toolbar" ref={toolbarRef}>
              <div className="pl-title-row">
                <h1>{title}</h1>
                <button type="button" className="round-btn primary-btn btn-icon-left"><PlusIcon /> {addLabel}</button>
              </div>

              <div className="pl-filterbar">
                <Popover
                  label={filtersCount > 0 ? `Filter (${filtersCount} applied)` : 'Filter'}
                  icon={<SlidersHorizontalIcon />} dot={filtersCount > 0} panelClassName="pl-popover--filter"
                >
                  {filterPanel}
                </Popover>
                <Popover
                  label="Sort" icon={sortDirection === 'asc' ? <ArrowDownAZIcon /> : <ArrowDownZAIcon />}
                  dot={!sortIsDefault}
                >
                  <div className="pl-sort-panel">{sortPanel}</div>
                </Popover>
                <div className="pl-search" role="search">
                  <span className="pl-search-icon"><SearchIcon /></span>
                  <input
                    type="text" value={query} placeholder={searchPlaceholder} aria-label={searchPlaceholder.replace(/\.+$/, '')}
                    onChange={e => onQueryChange(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Escape') onQueryChange('') }}
                  />
                  <div className="pl-search-end">
                    {query && (
                      <button type="button" className="pl-search-clear" aria-label="Clear search" onClick={() => onQueryChange('')}><CloseIcon /></button>
                    )}
                    <span aria-live="polite">{total} {total === 1 ? noun : nounPlural}</span>
                  </div>
                </div>
              </div>

              {/* A-Z jump bar. Letters with nobody in them are disabled, and so is
                  the whole bar when the list isn't grouped by surname. */}
              <div
                className="pl-letters" role="navigation" aria-label="Jump to letter"
                title={groupedByLetter ? undefined : 'Letters are only available when sorted by surname'}
              >
                {LETTERS.map(l => {
                  const count = byLetter.get(l)?.length ?? 0
                  return (
                    <button key={l} type="button" className="pl-letter" disabled={!groupedByLetter || count === 0} aria-label={`${l} (${count})`} onClick={() => jumpTo(l)}>{l}</button>
                  )
                })}
              </div>
            </div>

            {total === 0 && (
              <div className="pl-empty">
                <p className="pl-empty-title">
                  {query.trim()
                    ? <>No {nounPlural} match “{query.trim()}”{filtersCount > 0 && ' with these filters'}</>
                    : `No ${nounPlural} match these filters`}
                </p>
                <p className="pl-empty-hint">Try {emptyHint}, or loosen the filters.</p>
                <div className="pl-empty-actions">
                  {query && <button type="button" className="round-btn tertiary-btn" onClick={() => onQueryChange('')}>Clear search</button>}
                  {filtersCount > 0 && <button type="button" className="round-btn tertiary-btn" onClick={onClearFilters}>Clear filters</button>}
                </div>
              </div>
            )}

            {displaySections.map(section => (
              <section key={section.letters.join('') || 'all'} className="pl-section">
                {section.letters.length > 0 && (
                  <h2 className="pl-section-title">
                    {section.letters.map((l, i) => (
                      <span key={l}>
                        {i > 0 && <span className="pl-section-sep">·</span>}
                        <span id={`${idPrefix}-section-${l}`} className="pl-section-letter">{l}</span>
                      </span>
                    ))}
                  </h2>
                )}
                {/* Each card spans 4 rows of this grid via subgrid (header / flags /
                    details / tags), so those rows are as tall as the tallest card in
                    the row. That's what lines details and tags up across cards. */}
                <div className="pl-grid">
                  {section.items.map(item => <div key={item.id} className="pl-grid-item">{renderCard(item)}</div>)}
                </div>
              </section>
            ))}
          </main>
        </div>
      </div>
    </>
  )
}
