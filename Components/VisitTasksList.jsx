import { AlertCircleIcon, NoteIcon } from './TimelineIcons'

// A visit's tasks as a plain list (no table header, no filters), for visit
// items that expand inline. The table version, with filters and sort, is
// Components/VisitTasksTable.jsx (used by the slide-out VisitTasksPanel).
// Styles: Styles/visit-tasks-panel.css (.vtl-*).
//
// tasks: same shape as VisitTasksTable — [{ id, title, instructions: string[],
//   completed, status, statusLabel, note, alert? ('open' | 'resolved'), icon (node) }]

const PILL_CLASS = {
  complete: 'status-completed',
  overdue: 'status-missed',
  cancelled: 'status-cancelled',
  missed: 'status-missed',
  notdone: 'vtp-pill--partial',
}

export default function VisitTasksList({ tasks = [] }) {
  return (
    <ul className="vtl-list">
      {tasks.map(t => (
        <li className="vtl-item" key={t.id}>
          {t.icon && <span className="vtl-icon">{t.icon}</span>}
          <div className="vtl-main">
            <span className="vtl-title">{t.title}</span>
            {t.instructions?.length > 0 && <span className="vtl-instructions">{t.instructions.join(' ')}</span>}
            {t.note && <span className="vtl-note"><NoteIcon /><span>{t.note}</span></span>}
          </div>
          <div className="vtl-side">
            <span className="vtl-status">
              {t.alert && <span className={`vtp-alert${t.alert === 'resolved' ? ' vtp-alert--resolved' : ''}`} title="Alert"><AlertCircleIcon /></span>}
              <span className={`status-pill ${PILL_CLASS[t.status] || ''}`}>{t.statusLabel}</span>
            </span>
            <span className="vtl-completed">{t.completed || '—'}</span>
          </div>
        </li>
      ))}
      {tasks.length === 0 && <li className="vtl-empty">No tasks.</li>}
    </ul>
  )
}
