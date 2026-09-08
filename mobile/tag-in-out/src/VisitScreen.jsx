import { useEffect, useState } from 'react'
import StatusBar from '../../../Components/StatusBar'
import AppHeader from '../../../Components/AppHeader'
import { LegalFlags, HighRiskBadge } from '../../../Components/LegalFlags'
import { ClockIcon, KeyIcon, TaskTypeBadge, TaskStateIcon, NoteIcon, CancelIcon } from './icons'
import { TASKS } from './data'

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
)

function initials(name) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2)
}

function fmtElapsed(totalSeconds) {
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
export default function VisitScreen({ booking, onBack, onTagIn, inProgress, onCancelVisit }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!inProgress) return
    const id = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [inProgress])

  return (
    <div className="screen">
      <StatusBar />
      <AppHeader
        title={booking.visitType}
        subtitle={inProgress ? <><ClockIcon size={12} /> Visit in progress ({fmtElapsed(elapsed)})</> : undefined}
        onBack={onBack}
      />
      <div className="visit-body">
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

        <div className="visit-task-list">
          {TASKS.map(t => (
            <div className="visit-task-row" key={t.key}>
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
          <button className="fab-square visit-notes-btn" onClick={() => {}}>
            <NoteIcon size={20} />
            <span>Add notes</span>
          </button>
          <button className="fab-square visit-cancel-btn" onClick={onCancelVisit}>
            <CancelIcon size={20} />
            <span>Cancel visit</span>
          </button>
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
