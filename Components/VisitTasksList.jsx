import { BellIcon, ResolvedAlertIcon, NoteIcon, MedFormIcon, MedDosageIcon, MedSupportIcon, ReasonIcon, EmployeeIcon, DueIcon } from './TimelineIcons'

// A visit's tasks as a plain list (no table header, no filters), for visit
// items that expand inline. The table version, with filters and sort, is
// Components/VisitTasksTable.jsx (used by the slide-out VisitTasksPanel).
// Styles: Styles/visit-tasks-panel.css (.vtl-*).
//
// tasks: same shape as VisitTasksTable — [{ id, title, instructions: string[],
//   cancelledAt? (cancelled tasks: the Care note section becomes "Cancelled", with when, why and any note),
//   completed, completedBy?, form?/dosage?/support? (medication), reason? (why a task was partly done), status, statusLabel, note, alert? ('open' | 'resolved'), icon (node) }]
// Each task is split into labelled sections: Care plan (instructions, medication details),
// Care note (reason, who/when, carer note) and Alert (type, review note), as on the live timeline.
// Care plan sits in a left column; Care note and Alert stack in a right column.
//   reviewNote? { by, date, text } shows under a resolved alert.
// statusInNote (optional): drop the status pill and show the status as the first line of the Care note, with an icon.
// onAddReviewNote (optional): shows a "+ Review note" link on every task that has no review note yet, whatever its status.

const PILL_CLASS = {
  complete: 'status-completed',
  overdue: 'status-missed',
  cancelled: 'status-cancelled',
  missed: 'status-missed',
  partial: 'vtp-pill--partial',
}

// Status glyphs (eltico, loaded by Styles/legacy.css) for the status line in the care note.
const STATUS_GLYPH = { complete: ['\uE90B', 'complete'], partial: ['\uE909', 'partial'], overdue: ['\uE90C', 'missed'], missed: ['\uE90C', 'missed'] }

const ALERT_LABEL = 'Not done'

// A cancelled visit's body: Care plan (due times) and Cancelled (when, reason, note) columns.
export function CancelledVisitDetails({ plan, at, reason, note }) {
  return (
    <div className="vtl-cols vtl-cols--visit">
      <div className="vtl-col">
        <section className="vtl-section">
          <h4 className="vtl-section-title">Care plan</h4>
          <span className="vtl-meta"><span className="vtl-meta-item"><DueIcon />{plan}</span></span>
        </section>
      </div>
      <div className="vtl-col">
        <section className="vtl-section">
          <h4 className="vtl-section-title">Cancelled</h4>
          {at && <span className="vtl-meta"><span className="vtl-meta-item" title="Cancelled"><DueIcon />{at}</span></span>}
          {reason && <span className="vtl-meta"><span className="vtl-meta-item" title="Reason"><ReasonIcon />{reason}</span></span>}
          {note && <span className="vtl-note"><NoteIcon /><span>{note}</span></span>}
        </section>
      </div>
    </div>
  )
}

// compact: just icon, title and status, for tasks inside a cancelled visit.
export default function VisitTasksList({ tasks = [], onAddReviewNote, compact, statusInNote }) {
  return (
    <ul className="vtl-list">
      {tasks.map(t => {
        // "+ Review note" on a task in any status; not once it already has a review note.
        const reviewLink = (task) => onAddReviewNote && !task.reviewNote && (
          <button type="button" className="vtl-review-link" onClick={() => onAddReviewNote(task)}>+ Review note</button>
        )
        const hasPlan = t.instructions?.length > 0 || t.form || t.dosage || t.support
        const cancelled = t.status === 'cancelled'
        if (compact) return (
          <li className="vtl-item vtl-item--compact" key={t.id}>
            {t.icon && <span className="vtl-icon">{t.icon}</span>}
            <div className="vtl-main"><span className="vtl-title vtl-title--cancelled">{t.title}</span>{reviewLink(t)}</div>
            <div className="vtl-side"><span className="vtl-status"><span className={`status-pill ${PILL_CLASS[t.status] || ''}`}>{t.statusLabel}</span></span></div>
          </li>
        )
        const hasNote = statusInNote || t.reason || t.note || t.completed || t.cancelledAt
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
                  <h4 className="vtl-section-title">{cancelled ? 'Cancelled' : 'Care note'}</h4>
                  {statusInNote && STATUS_GLYPH[t.status] && (
                    <span className="vtl-meta"><span className="vtl-meta-item" title="Status"><span className={`vtl-status-glyph vtl-status-glyph--${STATUS_GLYPH[t.status][1]}`} aria-hidden="true">{STATUS_GLYPH[t.status][0]}</span>{t.statusLabel}</span></span>
                  )}
                  {t.cancelledAt && <span className="vtl-meta"><span className="vtl-meta-item" title="Cancelled"><DueIcon />{t.cancelledAt}</span></span>}
                  {t.reason && <span className="vtl-meta"><span className="vtl-meta-item" title="Reason"><ReasonIcon />{t.reason}</span></span>}
                  {t.completed && (
                    <span className="vtl-meta"><span className="vtl-meta-item" title="Completed by"><EmployeeIcon />{t.completedBy ? `${t.completedBy} · ` : ''}{t.completed}</span></span>
                  )}
                  {t.note && <span className="vtl-note"><NoteIcon /><span>{t.note}</span></span>}
                </section>
              )}
              {!t.alert && t.reviewNote && (
                <section className="vtl-section">
                  <h4 className="vtl-section-title">Review note</h4>
                  <span className="vtl-note"><NoteIcon /><span>{t.reviewNote.text}<span className="vtl-note-meta">{t.reviewNote.by} · {t.reviewNote.date}</span></span></span>
                </section>
              )}
              {t.alert && (
                <section className="vtl-section">
                  <h4 className="vtl-section-title">Alert</h4>
                  <span className="vtl-meta-item"><span className={`vtl-alert${t.alert === 'resolved' ? ' vtl-alert--resolved' : ''}`}>{t.alert === 'resolved' ? <ResolvedAlertIcon /> : <BellIcon />}</span>{ALERT_LABEL}{t.alert === 'resolved' ? ' (resolved)' : ''}</span>
                  {t.alert === 'resolved' && t.reviewNote && (
                    <span className="vtl-note"><NoteIcon /><span>{t.reviewNote.text}<span className="vtl-note-meta">{t.reviewNote.by} · {t.reviewNote.date}</span></span></span>
                  )}
                </section>
              )}
              </div>
              </div>
              {reviewLink(t)}
            </div>
            {!statusInNote && (
              <div className="vtl-side">
                <span className="vtl-status">
                  <span className={`status-pill ${PILL_CLASS[t.status] || ''}`}>{t.statusLabel}</span>
                  {t.alert && <span className={`vtl-alert${t.alert === 'resolved' ? ' vtl-alert--resolved' : ''}`} title={t.alert === 'resolved' ? 'Alert resolved' : 'Alert'}>{t.alert === 'resolved' ? <ResolvedAlertIcon /> : <BellIcon />}</span>}
                </span>
              </div>
            )}
          </li>
        )
      })}
      {tasks.length === 0 && <li className="vtl-empty">No tasks.</li>}
    </ul>
  )
}
