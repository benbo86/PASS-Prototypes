import { BellIcon, NoteIcon, MedFormIcon, MedDosageIcon, MedSupportIcon, ReasonIcon, EmployeeIcon } from './TimelineIcons'

// A visit's tasks as a plain list (no table header, no filters), for visit
// items that expand inline. The table version, with filters and sort, is
// Components/VisitTasksTable.jsx (used by the slide-out VisitTasksPanel).
// Styles: Styles/visit-tasks-panel.css (.vtl-*).
//
// tasks: same shape as VisitTasksTable — [{ id, title, instructions: string[],
//   completed, completedBy?, form?/dosage?/support? (medication), reason? (why a task was partly done), status, statusLabel, note, alert? ('open' | 'resolved'), icon (node) }]
// Each task is split into labelled sections: Care plan (instructions, medication details),
// Care note (reason, who/when, carer note) and Alert (type, review note), as on the live timeline.
// Care plan sits in a left column; Care note and Alert stack in a right column.
//   reviewNote? { by, date, text } shows under a resolved alert.
// onAddReviewNote (optional): shows an "Add review note" link under a task with an open alert.

const PILL_CLASS = {
  complete: 'status-completed',
  overdue: 'status-missed',
  cancelled: 'status-cancelled',
  missed: 'status-missed',
  partial: 'vtp-pill--partial',
}

const ALERT_LABEL = 'Not done'

export default function VisitTasksList({ tasks = [], onAddReviewNote }) {
  return (
    <ul className="vtl-list">
      {tasks.map(t => {
        const hasPlan = t.instructions?.length > 0 || t.form || t.dosage || t.support
        const hasNote = t.reason || t.note || t.completed
        return (
          <li className="vtl-item" key={t.id}>
            {t.icon && <span className="vtl-icon">{t.icon}</span>}
            <div className="vtl-main">
              <span className="vtl-title">{t.title}</span>
              <div className="vtl-cols">
              <div className="vtl-col">
              {hasPlan && (
                <section className="vtl-section">
                  <h4 className="vtl-section-title">Care plan</h4>
                  {t.instructions?.length > 0 && <span className="vtl-instructions">{t.instructions.join(' ')}</span>}
                  {(t.form || t.dosage || t.support) && (
                    <span className="vtl-meta">
                      {t.form && <span className="vtl-meta-item" title="Form"><MedFormIcon />{t.form}</span>}
                      {t.dosage && <span className="vtl-meta-item" title="Dosage"><MedDosageIcon />{t.dosage}</span>}
                      {t.support && <span className="vtl-meta-item" title="Support required"><MedSupportIcon />{t.support}</span>}
                    </span>
                  )}
                </section>
              )}
              </div>
              <div className="vtl-col">
              {hasNote && (
                <section className="vtl-section">
                  <h4 className="vtl-section-title">Care note</h4>
                  {t.reason && <span className="vtl-meta"><span className="vtl-meta-item" title="Reason"><ReasonIcon />{t.reason}</span></span>}
                  {t.completed && (
                    <span className="vtl-meta"><span className="vtl-meta-item" title="Completed by"><EmployeeIcon />{t.completedBy ? `${t.completedBy} · ` : ''}{t.completed}</span></span>
                  )}
                  {t.note && <span className="vtl-note"><NoteIcon /><span>{t.note}</span></span>}
                </section>
              )}
              {t.alert && (
                <section className="vtl-section">
                  <h4 className="vtl-section-title">Alert</h4>
                  <span className="vtl-meta-item"><span className={`vtl-alert${t.alert === 'resolved' ? ' vtl-alert--resolved' : ''}`}><BellIcon /></span>{ALERT_LABEL}{t.alert === 'resolved' ? ' (resolved)' : ''}</span>
                  {t.alert === 'resolved' && t.reviewNote && (
                    <span className="vtl-note"><NoteIcon /><span>{t.reviewNote.text}<span className="vtl-note-meta">{t.reviewNote.by} · {t.reviewNote.date}</span></span></span>
                  )}
                  {t.alert === 'open' && onAddReviewNote && (
                    <button type="button" className="vtl-review-link" onClick={() => onAddReviewNote(t)}>+ Add review note</button>
                  )}
                </section>
              )}
              </div>
              </div>
            </div>
            <div className="vtl-side">
              <span className="vtl-status">
                <span className={`status-pill ${PILL_CLASS[t.status] || ''}`}>{t.statusLabel}</span>
                {t.alert && <span className={`vtl-alert${t.alert === 'resolved' ? ' vtl-alert--resolved' : ''}`} title={t.alert === 'resolved' ? 'Alert resolved' : 'Alert'}><BellIcon /></span>}
              </span>
            </div>
          </li>
        )
      })}
      {tasks.length === 0 && <li className="vtl-empty">No tasks.</li>}
    </ul>
  )
}
