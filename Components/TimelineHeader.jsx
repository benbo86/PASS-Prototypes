import { useDevEditActive, useDevEditStickyDismiss, isDevToolUi } from './devEditHoverSticky'
import { useRef, useState, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import FilterDropdown from './FilterDropdown'
import Tooltip from './Tooltip'
import { ViewSettingsIcon, FunnelIcon, FilterLinesIcon, ClockIcon, ExpandAllIcon, CollapseAllIcon, CalendarHeaderIcon } from './TimelineIcons'

// Refreshed timeline header (customer + employee timelines): tabs, then a
// filter bar with the date and Go to now / Expand all / Collapse all.
// Styles: Styles/timeline-header.css, plus Styles/event-panel.css for the UI kit
// tabs (.ep-tabs/.ep-tab) — import both. Sticky; publishes its live height as
// --tlh-height so day headings can pin directly beneath it.
//
// tabs: [{ id, label }] (leave empty for no tab bar). children are the filter fields (they differ between
// timelines) — build them with TimelineFilterPill (current) or the original
// TimelineFilterSelect / TimelineFilterInput (kept so the old look can be restored).
// Pass showFilters={false} to hide the filter bar (e.g. on the Journal tab).
// onToggleAll + allExpanded give one "Expand all" / "Collapse all" toggle button
// (used instead of onExpandAll / onCollapseAll, which render two buttons).
export default function TimelineHeader({
  tabs, activeTab, onTabChange, dateLabel, showFilters = true,
  onGoToNow, onExpandAll, onCollapseAll, onToggleAll, allExpanded, viewSettings, filtersClassName, chips, children,
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
      {tabs?.length > 0 && <div className="tlh-tabs ep-tabs" role="tablist">
        {tabs.map(t => (
          <button key={t.id} className={`ep-tab${activeTab === t.id ? ' ep-tab--active' : ''}`} role="tab" aria-selected={activeTab === t.id} onClick={() => onTabChange(t.id)}>
            {t.label}
          </button>
        ))}
      </div>}

      {showFilters && (
        <div className={`tlh-filters${filtersClassName ? ` ${filtersClassName}` : ''}`}>
          {children}
          <button className="tlh-date" type="button">{dateLabel} <CalendarHeaderIcon /></button>
          <div className="tlh-actions">
            {viewSettings}
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
      {showFilters && chips}
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
// commitOnEnter: as on live, the typed term is applied when Enter is pressed (the input then
// clears; show the applied term with TimelineFilterChips). value is just the applied term here.
export function TimelineFilterInput({ label, value, onChange, placeholder = 'Filter by name', commitOnEnter }) {
  const [draft, setDraft] = useState('')
  const shown = commitOnEnter ? draft : value
  const change = commitOnEnter ? setDraft : onChange
  const onKeyDown = commitOnEnter ? (e) => { if (e.key === 'Enter' && draft.trim()) { onChange(draft.trim()); setDraft('') } } : undefined
  return (
    <div className="tlh-field">
      <span className="tlh-field-label">{label}</span>
      <div className={`tlh-name-filter${value ? ' has-value' : ''}`}>
        <input className="form-input" placeholder={placeholder} value={shown} onChange={e => change(e.target.value)} onKeyDown={onKeyDown} />
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
// filters: [{ key, label, group?, items: string[], selected: Set<string>, onChange(Set) }]
// or, for a free-text filter, { key, label, text: true, value: string, onChange(string), placeholder? }: a search box row
// in the menu (focused when the menu opens). As on live, the term is applied on Enter, the box clears and the term shows
// as a chip (TimelineFilterChips); the menu stays open.
// A filter's optional `group` (e.g. "Visit", "Task") adds a small heading in the menu
// whenever it changes from the previous filter's.
function MenuSearchRow({ filter }) {
  const [draft, setDraft] = useState('')
  const placeholder = filter.placeholder || 'Filter by name'
  return (
    <div className="tlh-menu-search">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><line x1="16" y1="16" x2="20" y2="20" /></svg>
      <input className="form-input" autoFocus={!filter.noAutoFocus} placeholder={placeholder} aria-label={placeholder} value={draft} onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && draft.trim()) { filter.onChange(draft.trim()); setDraft('') } }} />
    </div>
  )
}

export function TimelineFiltersMenu({ filters, onClearAll }) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(null) // null = menu, else a filter key
  const anchor = useRef(null)
  const menuRef = useRef(null)
  const total = filters.reduce((n, f) => n + (f.text ? (f.value.trim() ? 1 : 0) : f.selected.size), 0)
  const close = () => { setOpen(false); setView(null) }

  useEffect(() => {
    if (!open || view) return
    const onDown = (e) => {
    if (isDevToolUi(e.target)) return // a click on dev-tool chrome isn't a click away
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
          {filters.map((f, i) => (
            <div key={f.key}>
              {f.group && f.group !== filters[i - 1]?.group && <div className="tlh-menu-group">{f.group}</div>}
              {f.text ? (
                <MenuSearchRow filter={f} />
              ) : (
                <button type="button" className="tlh-menu-row" onClick={() => setView(f.key)}>
                  <span>{f.label}</span>
                  {f.selected.size > 0 && <span className="tlh-pill-count">{f.selected.size}</span>}
                  <MenuChevronRight />
                </button>
              )}
            </div>
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
// The third level of TimelineCombinedFilter: one filter's options as a tick list, shown beside the
// filters panel. Applied as you tick (no Apply button). A search box appears for long lists.
function ComboOptions({ filter, maxHeight, onChange, onKeyDown }) {
  const [search, setSearch] = useState('')
  const items = filter.items || []
  const visible = search.trim() ? items.filter(i => i.toLowerCase().includes(search.trim().toLowerCase())) : items
  const toggle = (item) => {
    const next = new Set(filter.selected)
    if (next.has(item)) next.delete(item); else next.add(item)
    onChange(next)
  }
  return (
    <div className="tlh-opt-panel" style={{ maxHeight }} onKeyDown={onKeyDown}>
      {items.length > 8 && (
        <div className="tlh-menu-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><line x1="16" y1="16" x2="20" y2="20" /></svg>
          <input className="form-input" placeholder="Search" aria-label={`Search ${filter.label}`} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      )}
      <div className="tlh-opt-list" role="group" aria-label={filter.label}>
        {visible.map(item => (
          <button key={item} type="button" role="checkbox" aria-checked={filter.selected.has(item)} className="tlh-opt" onClick={() => toggle(item)}>
            <span className={`fd-checkbox ${filter.selected.has(item) ? 'checked' : ''}`}>
              {filter.selected.has(item) && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              )}
            </span>
            <span className="fd-item-label">{item}</span>
          </button>
        ))}
        {visible.length === 0 && <span className="fd-empty">No results</span>}
      </div>
    </div>
  )
}

// One pill (named for the ticked types) that combines Event type with the rest of the filters (one control instead of
// the Event type dropdown plus a Filters menu). It opens up to three panels side by side, each shown by
// pointing at (or clicking, or focusing) a row in the one before:
//   1. a search box (applied on Enter, as on live) and the event types as checkboxes (tick several;
//      nothing ticked means all types);
//   2. the filters for the type you are pointing at;
//   3. the options for the filter you are pointing at, as a tick list applied as you tick.
// Picking one of a type's own filters ticks that type too. Filters marked `shared` (Done for, Done by)
// apply to everything shown, so they never tick a type. Clear, at the bottom of the first panel, unticks every type and
// clears every filter (the chips row's Clear all keeps the ticked types).
// types: [{ value, label }]; selected: Set of ticked type values; onToggleType(value); onEnsureType(value)
// (tick it if it isn't); search: the free-text filter shaped as for TimelineFiltersMenu ({ text: true, value,
// onChange, placeholder }); defsByType: { [type]: filters } for the non-text filters, shaped as for
// TimelineFiltersMenu, with `shared: true` on the ones that aren't specific to the type; appliedCount: how many
// filters are applied (shown on the pill).
export function TimelineCombinedFilter({ types, selected, onToggleType, onEnsureType, search, defsByType, appliedCount, onClear }) {
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState(null) // the type whose filters panel 2 shows; none until you point at one
  const [previewTop, setPreviewTop] = useState(0) // how far down panel 2 sits, so it lines up with the type row it belongs to
  const [active, setActive] = useState(null) // { key, top } the filter whose options panel 3 shows
  const anchor = useRef(null)
  const wrapRef = useRef(null)
  const timer = useRef(null)
  const devEditActive = useDevEditActive()
  useDevEditStickyDismiss(devEditActive, open, setOpen, '.tlh-combined')

  const close = () => { clearTimeout(timer.current); setOpen(false); setActive(null) }
  const ticked = types.filter(t => selected.has(t.value))
  const pillLabel = ticked.length === 0 ? 'All timeline events' : ticked.length <= 2 ? ticked.map(t => t.label).join(', ') : `${ticked.length} event types`
  // What's applied to one type: every option ticked in its filters panel, shared ones (Done for, Done by)
  // included since they apply to it too, so the number on its row matches what that panel shows.
  const typeCount = (type) => (defsByType[type] || []).reduce((n, f) => n + (f.selected ? f.selected.size : 0), 0)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (isDevToolUi(e.target)) return // a click on dev-tool chrome isn't a click away
      if (wrapRef.current && !wrapRef.current.contains(e.target) && anchor.current && !anchor.current.contains(e.target)) close()
    }
    const onKey = (e) => { if (e.key === 'Escape') close() }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])
  useEffect(() => () => clearTimeout(timer.current), [])

  const openMenu = () => { setPreview(null); setActive(null); setOpen(true) }
  // A short delay before a panel switches, so moving the pointer diagonally across a list towards the next
  // panel doesn't flip it on the way. Entering a later panel cancels a pending switch.
  const later = (fn) => { clearTimeout(timer.current); timer.current = setTimeout(fn, 120) }
  const showType = (t, el) => { setPreviewTop(Math.max(0, el.offsetTop - 4)); if (t !== preview) { setPreview(t); setActive(null) } }
  const showFilter = (key, el) => setActive({ key, top: Math.max(0, el.offsetTop - 4) })
  const focusRow = (sel, i, step) => {
    const rows = [...wrapRef.current.querySelectorAll(sel)]
    rows[(i + step + rows.length) % rows.length]?.focus()
  }

  const typeKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); wrapRef.current?.querySelector('.tlh-filter-row')?.focus() }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const rows = [...wrapRef.current.querySelectorAll('.tlh-type-row')]
      if (e.key === 'ArrowUp' && rows.indexOf(e.currentTarget) === 0) wrapRef.current.querySelector('.tlh-combined-types input')?.focus()
      else focusRow('.tlh-type-row', rows.indexOf(e.currentTarget), e.key === 'ArrowDown' ? 1 : -1)
    }
  }
  const filterKeyDown = (e, key) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); wrapRef.current?.querySelector(`.tlh-type-row[data-type="${preview}"]`)?.focus() }
    if (e.key === 'ArrowRight') {
      e.preventDefault(); showFilter(key, e.currentTarget)
      requestAnimationFrame(() => wrapRef.current?.querySelector('.tlh-opt')?.focus())
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const rows = [...wrapRef.current.querySelectorAll('.tlh-filter-row')]
      focusRow('.tlh-filter-row', rows.indexOf(e.currentTarget), e.key === 'ArrowDown' ? 1 : -1)
    }
  }
  const optionsKeyDown = (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); wrapRef.current?.querySelector(`.tlh-filter-row[data-key="${active?.key}"]`)?.focus() }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const opts = [...wrapRef.current.querySelectorAll('.tlh-opt')]
      if (opts.includes(document.activeElement)) { e.preventDefault(); focusRow('.tlh-opt', opts.indexOf(document.activeElement), e.key === 'ArrowDown' ? 1 : -1) }
    }
  }
  const searchKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); wrapRef.current?.querySelector('.tlh-type-row')?.focus() }
  }

  const rect = open && anchor.current ? anchor.current.getBoundingClientRect() : null
  const filters = preview ? defsByType[preview] || [] : []
  const activeFilter = active ? filters.find(f => f.key === active.key) : null
  const panelTop = rect ? rect.bottom + 6 + (active?.top ?? 0) : 0
  const optionsMax = rect ? Math.max(180, Math.min(360, window.innerHeight - panelTop - 16)) : 360
  const changeOptions = (f, next) => { if (!f.shared) onEnsureType(preview); f.onChange(next) }

  return (
    <>
      <button
        ref={anchor} type="button" data-devmode-passthrough="true"
        className={`tlh-pill${appliedCount ? ' tlh-pill--active' : ''}${open ? ' tlh-pill--open' : ''}`}
        aria-haspopup="menu" aria-expanded={open}
        onClick={() => (open ? close() : openMenu())}
      >
        <FilterLinesIcon />
        <span>{pillLabel}</span>
        {appliedCount > 0 && <span className="tlh-pill-count">{appliedCount}</span>}
        <PillChevron />
      </button>

      {open && rect && createPortal(
        <div className="tlh-combined" ref={wrapRef} style={{ position: 'fixed', top: rect.bottom + 6, left: rect.left, zIndex: 9999 }}>
          <div className="fd-wrap tlh-menu tlh-combined-types" role="group" aria-label="Event type">
            <div onKeyDown={searchKeyDown}><MenuSearchRow filter={search} /></div>
            {types.map(t => (
              <button
                key={t.value} type="button" role="checkbox" aria-checked={selected.has(t.value)} data-type={t.value}
                className={`tlh-menu-row tlh-type-row${preview === t.value ? ' tlh-type-row--preview' : ''}`}
                onMouseEnter={e => { const el = e.currentTarget; later(() => showType(t.value, el)) }} onFocus={e => showType(t.value, e.currentTarget)}
                onClick={e => { showType(t.value, e.currentTarget); onToggleType(t.value) }} onKeyDown={typeKeyDown}
              >
                <span className="checkbox-wrap" aria-hidden="true">
                  <input type="checkbox" checked={selected.has(t.value)} readOnly tabIndex={-1} />
                  <span className="checkbox-box" />
                </span>
                <span>{t.label}</span>
                {selected.has(t.value) && typeCount(t.value) > 0 && <span className="tlh-pill-count">{typeCount(t.value)}</span>}
              </button>
            ))}
            <div className="tlh-menu-footer">
              <button type="button" className="tlh-clear-all" disabled={appliedCount === 0 && selected.size === 0} onClick={onClear}>Clear</button>
            </div>
          </div>
          {preview && <div className="fd-wrap tlh-menu tlh-combined-filters" style={{ marginTop: previewTop }} onMouseEnter={() => clearTimeout(timer.current)}>
            {filters.map(f => (
              <button
                key={f.key} type="button" data-key={f.key}
                className={`tlh-menu-row tlh-filter-row${active?.key === f.key ? ' tlh-filter-row--active' : ''}`}
                onMouseEnter={e => { const el = e.currentTarget; later(() => showFilter(f.key, el)) }}
                onFocus={e => showFilter(f.key, e.currentTarget)}
                onClick={e => showFilter(f.key, e.currentTarget)} onKeyDown={e => filterKeyDown(e, f.key)}
              >
                <span>{f.label}</span>
                {f.selected.size > 0 && <span className="tlh-pill-count">{f.selected.size}</span>}
                <MenuChevronRight />
              </button>
            ))}
          </div>}
          {activeFilter && (
            <div className="fd-wrap tlh-menu tlh-combined-options" style={{ marginTop: active.top }} onMouseEnter={() => clearTimeout(timer.current)}>
              <ComboOptions key={`${preview}-${activeFilter.key}`} filter={activeFilter} maxHeight={optionsMax} onChange={next => changeOptions(activeFilter, next)} onKeyDown={optionsKeyDown} />
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  )
}

export function TimelineSortPill({ options, value, onChange }) {
  const [open, setOpen] = useState(false)
  const anchor = useRef(null)
  const menuRef = useRef(null)

  // While Dev Edit is on, the menu stays open so its contents can be selected and styled
  // (turning Dev Edit on is a click outside the menu, which would otherwise close it).
  // Click-away and Escape still dismiss it, via the shared sticky-dismiss hook.
  const devEditActive = useDevEditActive()
  useDevEditStickyDismiss(devEditActive, open, setOpen, '.tlh-view-menu')
  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
    if (isDevToolUi(e.target)) return // a click on dev-tool chrome isn't a click away
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

const TickIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="5 12.5 10 17.5 19 7" /></svg>
)

// Labelled dropdown matching the live timeline filters: a field with the label
// above it that opens a list, applied at once.
//   multiple (default): checkbox list with an "All …" row at the top (ticked while
//     nothing is picked; ticking it clears the rest). selected: Set<string>;
//     onChange(Set). The field shows the allLabel, the one pick, or "N selected".
//   single: radio list (e.g. Event type). items [{ value, label }]; value; onChange(value).
//   prefix (optional): small text left of the field, e.g. "Show:".
// items for multiple: string[].
export function TimelineFilterDropdown({ label, prefix, items, allLabel, selected, onChange, single, value }) {
  const [open, setOpen] = useState(false)
  const anchor = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
    if (isDevToolUi(e.target)) return // a click on dev-tool chrome isn't a click away
      if (menuRef.current && !menuRef.current.contains(e.target) && anchor.current && !anchor.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const rect = open && anchor.current ? anchor.current.getBoundingClientRect() : null
  let text
  if (single) text = items.find(o => o.value === value)?.label
  else text = selected.size === 0 ? allLabel : selected.size === 1 ? [...selected][0] : `${selected.size} selected`

  const toggle = (item) => {
    const next = new Set(selected)
    next.has(item) ? next.delete(item) : next.add(item)
    onChange(next)
  }

  return (
    <div className={`tlh-field${prefix ? ' tlh-show' : ''}`}>
      <span className="tlh-field-label">{label}</span>
      {prefix && <span className="tlh-show-prefix">{prefix}</span>}
      <button
        ref={anchor} type="button" data-devmode-passthrough="true"
        className={`select-input tlh-dropdown-btn${!single && selected.size ? ' tlh-dropdown-btn--active' : ''}`}
        aria-haspopup="listbox" aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        {text}
      </button>
      {rect && createPortal(
        <div className="fd-wrap tlh-menu tlh-dropdown-menu" ref={menuRef} role="listbox" style={{ position: 'fixed', top: rect.bottom + 6, left: rect.left, zIndex: 9999 }}>
          {single ? items.map(o => (
            <button key={o.value} type="button" role="option" aria-selected={o.value === value} className="tlh-dropdown-row"
              onClick={() => { onChange(o.value); setOpen(false) }}>
              <span className={`tlh-radio${o.value === value ? ' checked' : ''}`} />
              <span>{o.label}</span>
            </button>
          )) : (
            <>
              <button type="button" role="option" aria-selected={selected.size === 0} className="tlh-dropdown-row" onClick={() => onChange(new Set())}>
                <span className={`fd-checkbox${selected.size === 0 ? ' checked' : ''}`}>{selected.size === 0 && <TickIcon />}</span>
                <span>{allLabel}</span>
              </button>
              {items.map(item => (
                <button key={item} type="button" role="option" aria-selected={selected.has(item)} className="tlh-dropdown-row" onClick={() => toggle(item)}>
                  <span className={`fd-checkbox${selected.has(item) ? ' checked' : ''}`}>{selected.has(item) && <TickIcon />}</span>
                  <span>{item}</span>
                </button>
              ))}
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  )
}

// View settings button (opens a small popover of on/off switches), modelled on the
// roster daily schedule's settings button. choice (optional): a pick-one radio group shown above the switches,
// { title, value, onChange(value), options: [{ value, label, hint? }] } (the first option is the default). The button gets a purple outline and dot while any switch is on. options: [{ key, label, hint?, checked, onChange(bool) }]
export function TimelineViewSettings({ options = [], choice }) {
  const [open, setOpen] = useState(false)
  const anchor = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
    if (isDevToolUi(e.target)) return // a click on dev-tool chrome isn't a click away
      if (menuRef.current && !menuRef.current.contains(e.target) && anchor.current && !anchor.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const rect = open && anchor.current ? anchor.current.getBoundingClientRect() : null
  return (
    <>
      <button
        ref={anchor} type="button" data-devmode-passthrough="true" aria-haspopup="dialog" aria-expanded={open}
        className={`round-btn tertiary-btn btn-icon-left tlh-view-btn${open ? ' tlh-view-btn--open' : ''}${options.some(o => o.checked) || (choice && choice.value !== choice.options[0].value) ? ' tlh-view-btn--active' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <ViewSettingsIcon /> View settings
      </button>
      {rect && createPortal(
        <div className="fd-wrap tlh-menu tlh-view-menu" ref={menuRef} role="dialog" aria-label="View settings"
          style={{ position: 'fixed', top: rect.bottom + 6, right: window.innerWidth - rect.right, zIndex: 9999 }}>
          <div className="tlh-view-title">View settings</div>
          {choice && (
            <div role="radiogroup" aria-label={choice.title}>
              {choice.options.map(o => (
                <label key={o.value} className="tlh-view-row">
                  <input type="radio" className="form-radio" name="tlh-view-choice" checked={choice.value === o.value} onChange={() => choice.onChange(o.value)} />
                  <span className="tlh-view-text">
                    <span className="tlh-view-label">{o.label}</span>
                    {o.hint && <span className="tlh-view-hint">{o.hint}</span>}
                  </span>
                </label>
              ))}
            </div>
          )}
          {options.map(o => (
            <label key={o.key} className="tlh-view-row">
              <span className="tlh-view-text">
                <span className="tlh-view-label">{o.label}</span>
                {o.hint && <span className="tlh-view-hint">{o.hint}</span>}
              </span>
              <input type="checkbox" role="switch" className="tlh-switch" checked={o.checked} onChange={e => o.onChange(e.target.checked)} />
            </label>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}

// Inline on/off switch with a label, for a setting that deserves to sit on the bar
// itself (an alternative to TimelineViewSettings). The hint shows in a tooltip on hover.
export function TimelineSwitch({ label, hint, checked, onChange }) {
  const field = (
    <label className="tlh-switch-field">
      <span>{label}</span>
      <input type="checkbox" role="switch" className="tlh-switch" checked={checked} onChange={e => onChange(e.target.checked)} />
    </label>
  )
  return hint ? <Tooltip text={hint} placement="bottom">{field}</Tooltip> : field
}

// Removable chips for every applied filter (one per ticked option, one per text filter),
// shown under the filter bar so applied filters stay visible while the menu is closed.
// Takes the same filters array as TimelineFiltersMenu. Pass as TimelineHeader's `chips`.
export function TimelineFilterChips({ filters, onClearAll }) {
  const chips = filters.flatMap(f => f.text
    ? (f.value.trim() ? [{ key: f.key, label: `${f.label}: ${f.value.trim()}`, remove: () => f.onChange('') }] : [])
    : [...f.selected].map(v => ({
        key: `${f.key}:${v}`, label: `${f.label}: ${v}`,
        remove: () => { const next = new Set(f.selected); next.delete(v); f.onChange(next) },
      })))
  if (!chips.length) return null
  return (
    <div className="tlh-chips">
      {chips.map(c => (
        <span className="tlh-chip" key={c.key}>
          {c.label}
          <button type="button" data-devmode-passthrough="true" aria-label={`Remove ${c.label}`} onClick={c.remove}>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="18 7.2 16.8 6 12 10.8 7.2 6 6 7.2 10.8 12 6 16.8 7.2 18 12 13.2 16.8 18 18 16.8 13.2 12" /></svg>
          </button>
        </span>
      ))}
      {onClearAll && <button type="button" className="tlh-clear-all" onClick={onClearAll}>Clear all</button>}
    </div>
  )
}

// Always-visible search box with a magnifier (e.g. "Search events"), for free-text filtering
// next to the Filters menu. Turns purple once something is typed.
// As on live, the term is applied when Enter is pressed; the box then clears and the term shows
// as a chip (TimelineFilterChips). value is the applied term.
export function TimelineSearch({ value, onChange, placeholder = 'Search events' }) {
  const [draft, setDraft] = useState('')
  return (
    <div className={`tlh-search${value ? ' has-value' : ''}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><line x1="16" y1="16" x2="20" y2="20" /></svg>
      <input className="form-input" placeholder={placeholder} aria-label={placeholder} value={draft} onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && draft.trim()) { onChange(draft.trim()); setDraft('') } }} />
    </div>
  )
}
