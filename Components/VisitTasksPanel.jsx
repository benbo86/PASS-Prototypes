import { useEffect } from 'react'
import VisitTasksTable from './VisitTasksTable'

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

export default function VisitTasksPanel({ open, onClose, title, status, statusLabel, details = [], taskSummary, children, tasks = [] }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

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
          <VisitTasksTable tasks={tasks} />
          {children}
        </div>

        <div className="vtp-footer">
          <button className="round-btn tertiary-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
