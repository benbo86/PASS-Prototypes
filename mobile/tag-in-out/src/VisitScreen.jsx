import { useEffect, useState } from 'react'
import StatusBar from '../../../Components/StatusBar'
import AppHeader from '../../../Components/AppHeader'
import { LegalFlags, HighRiskBadge } from '../../../Components/LegalFlags'
import { ClockIcon, KeyIcon, TaskTypeBadge, TaskStateIcon, NoteIcon, CancelIcon, FinishVisitIcon } from './icons'
import { TASKS } from './data'

export const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
)

function initials(name) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2)
}

export function fmtElapsed(totalSeconds) {
  const mm = Math.floor(totalSeconds / 60)
  const ss = totalSeconds % 60
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}

// `inProgress` switches this same screen into the post-tag-in state
// (node 533:5814, "Visit - Tasks") rather than duplicating the whole
// customer-card/task-list markup into a second component — the only
// real differences are the header's elapsed-time subtitle, each task
// row's left-hand status marker, and the footer's two actions in place
// of the single Tag In FAB. Reached only via TagScreen's own onComplete
// (see App.jsx) — there's no way back from here to the "not tagged in"
// version except Cancel visit, matching Ben's own confirmation that this
// prototype only needs to show what the screen looks like right after
// tagging in, not a real path onward to Tag Out.
// The purple customer header card — exported so mobile/handover-notes can
// reuse it on its own Visit notes screen without duplicating the markup.
export function CustomerCard({ booking }) {
  return (
    <div className="visit-customer-card">
      <h2 className="visit-customer-name">{booking.name}</h2>
      <div className="visit-customer-meta">
        <div className="visit-customer-meta-item">
          <span className="visit-customer-meta-label">Address</span>
          <span>{booking.address}</span>
        </div>
      </div>
      <div className="visit-customer-meta">
        <div className="visit-customer-meta-item">
          <span className="visit-customer-meta-label">Date of Birth</span>
          <span>{booking.dob}</span>
        </div>
      </div>
      <LegalFlags flags={booking.legalFlags} />
      <div className="visit-customer-avatar">{initials(booking.name)}</div>
      {booking.highRisk && <div className="visit-high-risk-badge-wrap"><HighRiskBadge /></div>}
      <span className="visit-key-icon"><KeyIcon size={20} /></span>
    </div>
  )
}

// Optional props, all added so mobile/handover-notes can reuse this screen:
// - `tasks` / `onToggleTask`: tapping a task while in progress marks it
//   complete (a prototype shortcut for opening and completing the task).
// - `onFinishVisit`: once every task is complete, the footer swaps Cancel
//   visit for a green Finish visit button, matching the live app.
// - `startElapsed`: seconds already on the visit timer when this mounts.
// - `title`: overrides booking.visitType in the header.
// - `children`: rendered between the customer card and the task list
//   (the handover card).
export default function VisitScreen({
  booking, onBack, onTagIn, inProgress, onCancelVisit, onAddNotes,
  tasks = TASKS, onToggleTask, onFinishVisit, startElapsed = 0, title, children,
}) {
  const [elapsed, setElapsed] = useState(startElapsed)

  useEffect(() => {
    if (!inProgress) return
    const id = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [inProgress])

  const allComplete = tasks.every(t => t.status === 'complete')

  return (
    <div className="screen">
      <StatusBar />
      <AppHeader
        title={title || booking.visitType}
        subtitle={inProgress ? <><ClockIcon size={12} /> Visit in progress ({fmtElapsed(elapsed)})</> : undefined}
        onBack={onBack}
      />
      <div className="visit-body">
        <CustomerCard booking={booking} />
        {children}
        <div className="visit-task-list">
          {tasks.map(t => (
            <div
              className={`visit-task-row${inProgress && onToggleTask ? ' visit-task-row--tappable' : ''}`}
              key={t.key}
              onClick={inProgress && onToggleTask ? () => onToggleTask(t.key) : undefined}
            >
              {inProgress && <span className="visit-task-status"><TaskStateIcon status={t.status} /></span>}
              <div className="visit-task-body">
                <span className="visit-task-label">{t.label}</span>
                <span className="visit-task-time">{t.time}</span>
              </div>
              <span className="visit-task-badge"><TaskTypeBadge type={t.type} /></span>
            </div>
          ))}
        </div>
      </div>
      {inProgress ? (
        <div className="visit-fab-wrap visit-fab-wrap--split">
          <button className="fab-square visit-notes-btn" onClick={onAddNotes || (() => {})}>
            <NoteIcon size={20} />
            <span>Add notes</span>
          </button>
          {allComplete && onFinishVisit ? (
            <button key="finish" className="fab-square visit-finish-btn" onClick={onFinishVisit}>
              <FinishVisitIcon size={20} />
              <span>Finish visit</span>
            </button>
          ) : (
            <button key="cancel" className="fab-square visit-cancel-btn" onClick={onCancelVisit}>
              <CancelIcon size={20} />
              <span>Cancel visit</span>
            </button>
          )}
        </div>
      ) : (
        <div className="visit-fab-wrap">
          <button className="fab-square visit-fab" onClick={onTagIn}>
            <PlayIcon />
            <span>Tag in and start visit</span>
          </button>
        </div>
      )}
    </div>
  )
}
