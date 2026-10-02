import { VISITS, OUTCOMES, fmtDate } from './data'
import { PrintIcon } from './icons'

// Read-only care plan document for one careplan version — what the live
// product's Version History "View" opens (on the Customer File page). Lists
// that version's visits, outcomes and tasks, built from the version's own
// task snapshot rather than the current care plan.

const visitLabel = id => VISITS.find(v => v.id === id)?.label || id

function Field({ label, children }) {
  if (children === null || children === undefined || children === '') return null
  return (
    <div className="cm-doc-field">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

function TaskEntry({ task }) {
  const m = task.medication
  const isMed = task.type === 'Medication'
  return (
    <article className="cm-doc-task">
      <header className="cm-doc-task-head">
        <h4>{task.name}</h4>
        <span className="cm-doc-task-type">{task.type}</span>
        {task.status !== 'active' && <span className="cm-doc-task-inactive">Inactive</span>}
      </header>
      {task.description && <p className="cm-doc-task-desc">{task.description}</p>}
      <dl className="cm-doc-fields">
        <Field label="Begins">{fmtDate(task.beginsOn)}</Field>
        <Field label="Ends">{task.endsOn ? fmtDate(task.endsOn) : 'Ongoing'}</Field>
        <Field label="Visits">{task.visitIds.map(visitLabel).join(', ') || 'None'}</Field>
        <Field label="Outcomes">{task.outcomes.join(', ') || 'None'}</Field>
        {isMed && (
          <>
            <Field label="Support">{m.support}</Field>
            <Field label="Dosage">{m.dosage}</Field>
            <Field label="Form">{m.form}</Field>
            <Field label="Route">{m.route}</Field>
            <Field label="Control category">{m.controlCategory}</Field>
            <Field label="Location">{m.location}</Field>
            <Field label="PRN">{m.prn ? 'Yes' : 'No'}</Field>
            <Field label="Require witness">{task.requireWitness ? 'Yes' : 'No'}</Field>
          </>
        )}
      </dl>
    </article>
  )
}

export default function CarePlanDocument({ version, latestVersion, onBack }) {
  const tasks = version.snapshot
  const isLive = version.version === latestVersion
  const approvedBy = version.approval ? version.approval.by : '—'
  const usedOutcomes = OUTCOMES.filter(o => tasks.some(t => t.outcomes.includes(o)))

  return (
    <main className="cm-container cm-main cm-doc-page">
      <div className="cm-doc-toolbar">
        <button className="round-btn secondary-btn" onClick={onBack}>Back to version history</button>
        <button className="round-btn tertiary-btn btn-icon-left" onClick={() => window.print()}>
          <PrintIcon /> Print
        </button>
      </div>

      <div className="cm-doc">
        <header className="cm-doc-header">
          <div className="cm-doc-title">
            <h1>Care Plan</h1>
            <span className="cm-doc-readonly">Read only</span>
          </div>
          <p className="cm-doc-customer">Mrs Patricia 'Pat' Allin</p>
          <dl className="cm-doc-fields cm-doc-meta">
            <Field label="Version">{version.version}</Field>
            <Field label="Status">{isLive ? 'Live' : 'Inactive'}</Field>
            <Field label="Date modified">{version.modifiedAt}</Field>
            <Field label="Modified by">{version.employee}</Field>
            <Field label="Source">{version.source}</Field>
            <Field label="Approved by">{approvedBy}</Field>
            {version.review && (
              <>
                <Field label="Type of save">{version.review.saveType}</Field>
                <Field label="Next review date">{fmtDate(version.review.reviewDate)}</Field>
              </>
            )}
          </dl>
          {version.review?.notes && (
            <dl className="cm-doc-fields cm-doc-notes"><Field label="Notes">{version.review.notes}</Field></dl>
          )}
          {!isLive && (
            <p className="cm-doc-note">
              This is a past version. The current care plan is version {latestVersion}.
            </p>
          )}
        </header>

        <section className="cm-doc-section">
          <h2>Visits</h2>
          <ul className="cm-doc-list">
            {VISITS.map(v => {
              const onVisit = tasks.filter(t => t.visitIds.includes(v.id))
              return (
                <li key={v.id}>
                  <div className="cm-doc-list-head">
                    <strong>{v.label}</strong>
                    <span>{v.detail}</span>
                    {!v.active && <span className="cm-doc-task-inactive">Inactive</span>}
                  </div>
                  <p>{onVisit.length ? onVisit.map(t => t.name).join(' · ') : 'No tasks'}</p>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="cm-doc-section">
          <h2>Outcomes</h2>
          {usedOutcomes.length ? (
            <ul className="cm-doc-list">
              {usedOutcomes.map(o => (
                <li key={o}>
                  <div className="cm-doc-list-head"><strong>{o}</strong></div>
                  <p>{tasks.filter(t => t.outcomes.includes(o)).map(t => t.name).join(' · ')}</p>
                </li>
              ))}
            </ul>
          ) : <p className="cm-doc-empty">No outcomes.</p>}
        </section>

        <section className="cm-doc-section">
          <h2>Tasks</h2>
          {tasks.map(t => <TaskEntry key={t.id} task={t} />)}
        </section>
      </div>
    </main>
  )
}
