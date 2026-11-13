import { useRef, useState, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import FilterDropdown from './FilterDropdown'
import { FunnelIcon, FilterLinesIcon, ClockIcon, ExpandAllIcon, CollapseAllIcon, CalendarHeaderIcon } from './TimelineIcons'

// Refreshed timeline header (customer + employee timelines): tabs, then a
// filter bar with the date and Go to now / Expand all / Collapse all.
// Styles: Styles/timeline-header.css, plus Styles/event-panel.css for the UI kit
// tabs (.ep-tabs/.ep-tab) — import both. Sticky; publishes its live height as
// --tlh-height so day headings can pin directly beneath it.
//
// tabs: [{ id, label }]. children are the filter fields (they differ between
// timelines) — build them with TimelineFilterPill (current) or the original
// TimelineFilterSelect / TimelineFilterInput (kept so the old look can be restored).
// Pass showFilters={false} to hide the filter bar (e.g. on the Journal tab).
// onToggleAll + allExpanded give one "Expand all" / "Collapse all" toggle button
// (used instead of onExpandAll / onCollapseAll, which render two buttons).
export default function TimelineHeader({
  tabs, activeTab, onTabChange, dateLabel, showFilters = true,
  onGoToNow, onExpandAll, onCollapseAll, onToggleAll, allExpanded, children,
}) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const setVar = () => document.documentElement.style.setProperty('--tlh-height', `${el.offsetHeight}px`)
    setVar()
    const ro = new ResizeObserver(setVar)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="tlh-header" ref={ref}>
      <div className="tlh-tabs ep-tabs" role="tablist">
        {tabs.map(t => (
          <button key={t.id} className={`ep-tab${activeTab === t.id ? ' ep-tab--active' : ''}`} role="tab" aria-selected={activeTab === t.id} onClick={() => onTabChange(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {showFilters && (
        <div className="tlh-filters">
          {children}
          <button className="tlh-date" type="button">{dateLabel} <CalendarHeaderIcon /></button>
          <div className="tlh-actions">
            <button className="round-btn primary-btn btn-icon-left" onClick={onGoToNow}><ClockIcon /> Go to now</button>
            {onToggleAll && (
              <button className="round-btn tertiary-btn btn-icon-left tlh-toggle-all" onClick={onToggleAll}>
                {allExpanded ? <><CollapseAllIcon /> Collapse all</> : <><ExpandAllIcon /> Expand all</>}
              </button>
            )}
            {onExpandAll && <button className="round-btn tertiary-btn btn-icon-left" onClick={onExpandAll}><ExpandAllIcon /> Expand all</button>}
            {onCollapseAll && <button className="round-btn tertiary-btn btn-icon-left" onClick={onCollapseAll}><CollapseAllIcon /> Collapse all</button>}
          </div>
        </div>
      )}
    </div>
  )
}

// Select with a small label above it (e.g. Event type), left-aligned with the
// select itself, and an optional prefix ("Show:") to the left of the field.
export function TimelineFilterSelect({ label, prefix, value, onChange, options }) {
  return (
    <label className="tlh-field tlh-show">
      <span className="tlh-field-label">{label}</span>
      {prefix && <span className="tlh-show-prefix">{prefix}</span>}
      <select className="select-input" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  )
}

// Text filter with a funnel icon (turns purple once something is typed).
export function TimelineFilterInput({ label, value, onChange, placeholder = 'Filter by name' }) {
  return (
    <div className="tlh-field">
      <span className="tlh-field-label">{label}</span>
      <div className={`tlh-name-filter${value ? ' has-value' : ''}`}>
        <input className="form-input" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
        <FunnelIcon />
      </div>
    </div>
  )
}

const PillChevron = () => (
  <svg className="tlh-pill-chevron" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="16.6 8.6 12 13.2 7.4 8.6 6 10 12 16 18 10" /></svg>
)

// Filter pill: click to open Components/FilterDropdown (search + tick list +
// Apply/Clear). Once something is applied the pill turns purple and shows how
// many options are selected. items: string[]; selected: Set<string>;
// onChange(Set) is called on Apply (and with an empty Set on Clear).
export function TimelineFilterPill({ label, items, selected, onChange }) {
  const [open, setOpen] = useState(false)
  const anchor = useRef(null)
  const count = selected.size
  return (
    <>
      <button
        ref={anchor} type="button" data-devmode-passthrough="true"
        className={`tlh-pill${count ? ' tlh-pill--active' : ''}${open ? ' tlh-pill--open' : ''}`}
        aria-haspopup="listbox" aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        <span>{label}</span>
        {count > 0 && <span className="tlh-pill-count">{count}</span>}
        <PillChevron />
      </button>
      <FilterDropdown
        items={items} selected={selected} hasSort={false}
        onApply={sel => onChange(new Set(sel))}
        onClear={() => onChange(new Set())}
        isOpen={open} onClose={() => setOpen(false)} anchorEl={anchor.current} />
    </>
  )
}

const MenuChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
)

// Single "Filters" pill. Opens a menu listing each filter type (with how many
// options are applied); picking one drills into Components/FilterDropdown for
// that type (search + tick list, applied as you tick) with a back arrow. "Clear all"
// sits at the bottom of the menu. The pill shows the total applied count.
// filters: [{ key, label, items: string[], selected: Set<string>, onChange(Set) }]
export function TimelineFiltersMenu({ filters, onClearAll }) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(null) // null = menu, else a filter key
  const anchor = useRef(null)
  const menuRef = useRef(null)
  const total = filters.reduce((n, f) => n + f.selected.size, 0)
  const close = () => { setOpen(false); setView(null) }

  useEffect(() => {
    if (!open || view) return
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && anchor.current && !anchor.current.contains(e.target)) close()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open, view])

  const rect = open && anchor.current ? anchor.current.getBoundingClientRect() : null
  const current = filters.find(f => f.key === view)

  return (
    <>
      <button
        ref={anchor} type="button" data-devmode-passthrough="true"
        className={`tlh-pill${total ? ' tlh-pill--active' : ''}${open ? ' tlh-pill--open' : ''}`}
        aria-haspopup="menu" aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <FilterLinesIcon />
        <span>Filters</span>
        {total > 0 && <span className="tlh-pill-count">{total}</span>}
        <PillChevron />
      </button>

      {open && !view && rect && createPortal(
        <div className="fd-wrap tlh-menu" ref={menuRef} style={{ position: 'fixed', top: rect.bottom + 6, left: rect.left, zIndex: 9999 }}>
          {filters.map(f => (
            <button key={f.key} type="button" className="tlh-menu-row" onClick={() => setView(f.key)}>
              <span>{f.label}</span>
              {f.selected.size > 0 && <span className="tlh-pill-count">{f.selected.size}</span>}
              <MenuChevronRight />
            </button>
          ))}
          <div className="tlh-menu-footer">
            <button type="button" className="tlh-clear-all" disabled={total === 0} onClick={() => { onClearAll(); close() }}>Clear all</button>
          </div>
        </div>,
        document.body
      )}

      {current && (
        <FilterDropdown
          key={current.key} title={current.label} onBack={() => setView(null)}
          items={current.items} selected={current.selected} hasSort={false} instant
          onApply={sel => current.onChange(new Set(sel))}
          onClear={() => current.onChange(new Set())}
          isOpen onClose={close} anchorEl={anchor.current} />
      )}
    </>
  )
}

// Separate Sort pill: shows the current choice ("Sort: Newest first") and opens
// a single-choice list. options: [{ value, label }]; onChange(value) applies at once.
export function TimelineSortPill({ options, value, onChange }) {
  const [open, setOpen] = useState(false)
  const anchor = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && anchor.current && !anchor.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const rect = open && anchor.current ? anchor.current.getBoundingClientRect() : null
  const current = options.find(o => o.value === value)
  return (
    <>
      <button
        ref={anchor} type="button" data-devmode-passthrough="true"
        className={`tlh-pill${open ? ' tlh-pill--open' : ''}`}
        aria-haspopup="listbox" aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        <span>Sort: {current?.label}</span>
        <PillChevron />
      </button>
      {rect && createPortal(
        <div className="fd-wrap tlh-menu" ref={menuRef} role="listbox" style={{ position: 'fixed', top: rect.bottom + 6, left: rect.left, zIndex: 9999 }}>
          {options.map(o => (
            <button key={o.value} type="button" role="option" aria-selected={o.value === value} className="tlh-menu-row"
              onClick={() => { onChange(o.value); setOpen(false) }}>
              <span>{o.label}</span>
              {o.value === value && <span className="tlh-menu-tick" aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}
