import { useEffect, useRef, useState } from 'react'
import { AlertCircleIcon } from './TimelineIcons'
import FilterDropdown from './FilterDropdown'

// Slide-out panel listing a visit's tasks (customer + employee timelines).
// Styled like Components/EventPanel.jsx (reuses its ep-header / ep-close-btn
// classes, so import Styles/event-panel.css as well as
// Styles/visit-tasks-panel.css). The table uses main.css's .data-table.
//
// Props
//   open, onClose
//   title      visit name
//   status     complete | missed | cancelled  (the visit's status, drives the badge)
//   taskSummary  shown beside the Tasks title, e.g. "12 of 14 completed"
//   statusLabel  text for the badge ("Partial", "Cancelled", ...)
//   details    [{ label, value }] shown under the title
//   children   optional extra content below the table (alert, review note)
//   tasks      [{ id, title, instructions: string[], completed, status,
//                 statusLabel, note, alert? ('open' | 'resolved') }]
//              completed / note may be empty — shown as "—".

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <polygon points="18 7.2 16.8 6 12 10.8 7.2 6 6 7.2 10.8 12 6 16.8 7.2 18 12 13.2 16.8 18 18 16.8 13.2 12" fill="currentColor" stroke="currentColor" strokeLinejoin="round" />
  </svg>
)

// Column-header controls — same icons/classes as the other tables (main.css).
const FilterIcon = ({ active }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" className={`col-icon ${active ? 'col-icon--active' : ''}`}>
    {active ? (
      <path d="M10.5,15.7658125 L10.5,12 L10.5,12 L6.75103413,7.83448237 C6.56630462,7.62922736 6.58294383,7.31308244 6.78819884,7.12835293 C6.88001119,7.04572181 6.99916031,7 7.1226812,7 L16.8773188,7 C17.1534612,7 17.3773188,7.22385763 17.3773188,7.5 C17.3773188,7.62352089 17.331597,7.74267001 17.2489659,7.83448237 L13.5,12 L13.5,12 L13.5,17.4324792 C13.5,17.7086216 13.2761424,17.9324792 13,17.9324792 C12.8830317,17.9324792 12.7697653,17.8914711 12.6799078,17.8165898 L10.6799078,16.1499232 C10.5659115,16.0549263 10.5,15.9142024 10.5,15.7658125 Z" fill="currentColor" />
    ) : (
      <path d="M15 17c0-.552-.448-1-1-1h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1zm3-5c0-.552-.448-1-1-1H7c-.552 0-1 .448-1 1s.448 1 1 1h10c.552 0 1-.448 1-1zM4 8h16c.552 0 1-.448 1-1s-.448-1-1-1H4c-.552 0-1 .448-1 1s.448 1 1 1z" fill="currentColor" />
    )}
  </svg>
)
const SortIcon = ({ dir }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" className={`col-icon sort-icon ${dir ? 'col-icon--active' : ''}`} strokeLinecap="square">
    <polyline points="7.5,9 12,5 16.5,9" stroke="currentColor" strokeWidth="2" fill="none" opacity={dir === 'desc' ? 0.35 : 1} />
    <polyline points="7.5,19 12,15 16.5,19" stroke="currentColor" strokeWidth="2" fill="none"
      style={{ transform: 'scaleY(-1)', transformOrigin: '12px 17px' }} opacity={dir === 'asc' ? 0.35 : 1} />
  </svg>
)

const PILL_CLASS = {
  complete: 'status-completed',
  overdue: 'status-missed',
  cancelled: 'status-cancelled',
  missed: 'status-missed',
  notdone: 'vtp-pill--partial',
}

export default function VisitTasksPanel({ open, onClose, title, status, statusLabel, details = [], taskSummary, children, tasks = [] }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Column filters/sort — reset each time the panel is opened (it unmounts on close).
  const [typeFilter, setTypeFilter] = useState(() => new Set())
  const [statusFilter, setStatusFilter] = useState(() => new Set())
  const [sortDir, setSortDir] = useState(null) // null | 'asc' | 'desc' on Completed
  const [openDD, setOpenDD] = useState(null)
  const anchors = useRef({})

  if (!open) return null

  const typeItems = [...new Set(tasks.map(t => t.typeLabel).filter(Boolean))]
  const statusItems = [...new Set(tasks.map(t => t.statusLabel).filter(Boolean))]
  let shown = tasks.filter(t =>
    (typeFilter.size === 0 || typeFilter.has(t.typeLabel)) &&
    (statusFilter.size === 0 || statusFilter.has(t.statusLabel)))
  if (sortDir) {
    // Tasks with no completed time always sit at the bottom.
    const dir = sortDir === 'asc' ? 1 : -1
    shown = [...shown].sort((a, b) => {
      if (a.completedSort == null && b.completedSort == null) return 0
      if (a.completedSort == null) return 1
      if (b.completedSort == null) return -1
      return dir * (a.completedSort - b.completedSort)
    })
  }
  const cycleSort = () => setSortDir(d => (d === null ? 'asc' : d === 'asc' ? 'desc' : null))
  const filterHead = (key, label, selected, setSelected, items) => (
    <>
      <span>{label}</span>
      <button ref={el => { anchors.current[key] = el }} data-devmode-passthrough="true"
        className={`col-icon-btn ${selected.size ? 'col-icon-btn--active' : ''}`}
        aria-label={`Filter by ${label.toLowerCase()}`}
        onClick={() => setOpenDD(openDD === key ? null : key)}>
        <FilterIcon active={selected.size > 0} />
      </button>
      <FilterDropdown
        items={items} selected={selected} hasSort={false} zIndex={10900}
        onApply={sel => setSelected(new Set(sel))}
        onClear={() => setSelected(new Set())}
        isOpen={openDD === key} onClose={() => setOpenDD(null)} anchorEl={anchors.current[key]} />
    </>
  )

  return (
    <div className="vtp-overlay" onClick={onClose}>
      <div className="vtp-panel" role="dialog" aria-modal="true" aria-label={`${title} tasks`} onClick={e => e.stopPropagation()}>
        <div className="ep-header">
          <div className="ep-header__top">
            <div className="ep-header__title-row">
              <h1 className="ep-header__title">{title}</h1>
              <span className={`vtp-status vtp-status--${status}`}>
                <span className="vtp-status__stripe" />
                <span>{statusLabel}</span>
              </span>
            </div>
            <button className="ep-close-btn" onClick={onClose} aria-label="Close panel"><CloseIcon /></button>
          </div>
          <dl className="vtp-details">
            {details.map(d => (
              <div className="vtp-details__item" key={d.label}>
                <dt>{d.label}</dt>
                <dd>{d.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="vtp-body">
          <h2 className="vtp-section-title">Tasks <span className="vtp-section-count">({taskSummary || tasks.length})</span></h2>
          <div className="table-wrap">
            <table className="data-table vtp-table">
              <thead>
                <tr>
                  <th className="vtp-col-task">{filterHead('type', 'Task', typeFilter, setTypeFilter, typeItems)}</th>
                  <th>
                    <span>Completed</span>
                    <button className="col-icon-btn" data-devmode-passthrough="true" aria-label="Sort by completed time" onClick={cycleSort}>
                      <SortIcon dir={sortDir} />
                    </button>
                  </th>
                  <th>{filterHead('status', 'Status', statusFilter, setStatusFilter, statusItems)}</th>
                  <th className="vtp-col-note">Note</th>
                </tr>
              </thead>
              <tbody>
                {shown.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div className="vtp-task">
                        {t.icon && <span className="vtp-task-icon">{t.icon}</span>}
                        <div className="vtp-task-text">
                          <span className="td-name">{t.title}</span>
                          {t.instructions?.length > 0 && <span className="vtp-instructions">{t.instructions.join(' ')}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="nowrap">{t.completed || '—'}</td>
                    <td>
                      <span className="vtp-status-cell">
                        <span className={`status-pill ${PILL_CLASS[t.status] || ''}`}>{t.statusLabel}</span>
                        {t.alert && <span className={`vtp-alert${t.alert === 'resolved' ? ' vtp-alert--resolved' : ''}`} title="Alert"><AlertCircleIcon /></span>}
                      </span>
                    </td>
                    <td className="vtp-note">{t.note || '—'}</td>
                  </tr>
                ))}
                {shown.length === 0 && <tr><td colSpan={4} className="table-empty">No tasks match these filters.</td></tr>}
              </tbody>
            </table>
          </div>
          {children}
        </div>

        <div className="vtp-footer">
          <button className="round-btn tertiary-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
