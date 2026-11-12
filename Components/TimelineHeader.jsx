import { useRef, useLayoutEffect } from 'react'
import { FunnelIcon, ClockIcon, ExpandAllIcon, CollapseAllIcon, CalendarHeaderIcon } from './TimelineIcons'

// Refreshed timeline header (customer + employee timelines): tabs, then a
// filter bar with the date and Go to now / Expand all / Collapse all.
// Styles: Styles/timeline-header.css, plus Styles/event-panel.css for the UI kit
// tabs (.ep-tabs/.ep-tab) — import both. Sticky; publishes its live height as
// --tlh-height so day headings can pin directly beneath it.
//
// tabs: [{ id, label }]. children are the filter fields (they differ between
// timelines) — build them with TimelineFilterSelect / TimelineFilterInput.
// Pass showFilters={false} to hide the filter bar (e.g. on the Journal tab).
export default function TimelineHeader({
  tabs, activeTab, onTabChange, dateLabel, showFilters = true,
  onGoToNow, onExpandAll, onCollapseAll, children,
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
            {onExpandAll && <button className="round-btn tertiary-btn btn-icon-left" onClick={onExpandAll}><ExpandAllIcon /> Expand all</button>}
            {onCollapseAll && <button className="round-btn tertiary-btn btn-icon-left" onClick={onCollapseAll}><CollapseAllIcon /> Collapse all</button>}
          </div>
        </div>
      )}
    </div>
  )
}

// "Show: [select]" with a small label above, e.g. Event type.
export function TimelineFilterSelect({ label, prefix, value, onChange, options }) {
  return (
    <div className="tlh-field">
      <span className="tlh-field-label">{label}</span>
      <label className="tlh-show">
        {prefix}
        <select className="select-input" value={value} onChange={e => onChange(e.target.value)}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
    </div>
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
