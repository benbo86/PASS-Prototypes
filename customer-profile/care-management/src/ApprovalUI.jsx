import { useState, useEffect } from 'react'
import ModalPanel from '../../../Components/ModalPanel'
import Tooltip from '../../../Components/Tooltip'
import { diffTask, stepRows } from './approval'
import { SAVE_TYPES } from './data'
import { InfoIcon } from './icons.jsx'
import { Field, DateField } from './TaskDetail'

// ─── Icons ────────────────────────────────────────────────────

export const ShieldIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
  </svg>
)

const BlockIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9A7.902 7.902 0 014 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1A7.902 7.902 0 0120 12c0 4.42-3.58 8-8 8z" />
  </svg>
)

// ─── Change comparison ────────────────────────────────────────

// Before/after table for one task's change. Clinical fields (the ones that
// need a second signature) are flagged so the approver can see why it came
// to them; housekeeping fields included in the same change show unflagged.
export function ChangeTable({ before, after }) {
  const rows = diffTask(before, after)
  if (!before || !after) {
    const task = after || before
    return (
      <p className="cm-change-whole">
        {after ? 'New medication task: ' : 'Remove medication task: '}
        <strong>{task.name}</strong>
        {task.type === 'Medication' && ` (${[task.medication.dosage, task.medication.form, task.medication.route].filter(Boolean).join(', ')})`}
      </p>
    )
  }
  return (
    <table className="cm-change-table">
      <thead>
        <tr><th>Field</th><th>Current</th><th>Proposed</th></tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.key}>
            <td className="cm-change-field">
              {r.label}
            </td>
            <td className="cm-change-before">{r.before}</td>
            <td className="cm-change-after">{r.after}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ─── Task page banners ────────────────────────────────────────

// Step-by-step log of a request: one row per field each contributor changed,
// with who, when and why. Rows from the same submission share one Changed
// by / Date / Notes cell, so a note is never repeated. "From" is the value
// before that step (live, or the previous contributor's proposal), so a
// field edited twice shows both steps.
export function StepTable({ request }) {
  const groups = request.contributors
    .map(c => ({ c, rows: c.step ? stepRows(c.step) : [] }))
    .filter(g => g.rows.length)
  return (
    <table className="cm-change-table cm-step-table">
      <thead>
        <tr><th>Field</th><th>From</th><th>To</th><th>Changed by</th><th>Date</th><th>Notes</th></tr>
      </thead>
      {groups.map(({ c, rows }, gi) => (
        <tbody key={gi} className="cm-step-group">
          {rows.map((r, i) => (
            <tr key={r.key}>
              <td className="cm-change-field">{r.label}</td>
              <td className="cm-change-before">{r.from}</td>
              <td className="cm-change-after">{r.to}</td>
              {i === 0 && (
                <>
                  <td rowSpan={rows.length} className="cm-step-who">{c.name}</td>
                  <td rowSpan={rows.length} className="cm-step-when">{c.at}</td>
                  <td rowSpan={rows.length} className="cm-step-notes">
                    {c.review?.saveType && <span className="cm-step-savetype">{c.review.saveType}</span>}
                    {c.review?.notes || (c.review ? '—' : '')}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      ))}
    </table>
  )
}

// Shown at the top of a task with a pending change. Nothing is locked (except
// a pending removal): the form below shows the proposed version and anyone
// can keep editing it. An eligible approver gets Approve/Reject — unless they
// contributed to it; contributors can withdraw.
export function PendingBanner({ request, persona, onApprove, onReject, onWithdraw }) {
  const isContributor = request.contributors.some(c => c.name === persona.name)
  const canDecide = persona.canApprove && !isContributor
  const what = request.kind === 'create' ? 'New medication task' : request.kind === 'delete' ? 'Removal of this medication task' : 'Medication change'

  return (
    <section className="cm-approval-banner cm-approval-banner--pending">
      <div className="cm-approval-banner-head">
        <div className="cm-approval-banner-text">
          <h4>{what} awaiting approval</h4>
          {request.origin !== 'Edit' && <p>{request.origin}</p>}
        </div>
      </div>

      <StepTable request={request} />

      <p className="cm-approval-note">
        {request.kind === 'edit' && 'Carers see the current version until this is approved. The form below shows the proposed version: changing a clinical field updates this request and restarts approval.'}
        {request.kind === 'create' && 'This task will not appear on visits until it is approved. Any edits update this request and restart approval.'}
        {request.kind === 'delete' && 'Carers see this task until the removal is approved. It can\u2019t be edited while the removal is pending.'}
      </p>

      <div className="cm-approval-actions">
        {canDecide && (
          <>
            <button className="round-btn primary-btn" onClick={onApprove}>Approve change</button>
            <button className="round-btn cm-danger-btn" onClick={onReject}>Reject</button>
          </>
        )}
        {isContributor && (
          <button className="round-btn secondary-btn" onClick={onWithdraw}>Withdraw request</button>
        )}
        {isContributor && persona.canApprove && (
          <span className="cm-approval-hint">You contributed to this change, so another Care Manager needs to approve it.</span>
        )}
        {!persona.canApprove && !isContributor && (
          <span className="cm-approval-hint">Only a Care Manager can approve medication changes.</span>
        )}
      </div>
    </section>
  )
}

export function RejectedBanner({ request, onDismiss }) {
  return (
    <section className="cm-approval-banner cm-approval-banner--rejected">
      <div className="cm-approval-banner-head">
        <BlockIcon />
        <div className="cm-approval-banner-text">
          <h4>Change rejected</h4>
          <p>
            <strong>{request.decidedBy}</strong> rejected {[...new Set(request.contributors.map(c => c.name))].join(' and ')}'s change on {request.decidedAt}
          </p>
          <p className="cm-approval-reason">“{request.reason}”</p>
        </div>
        <button className="cm-link-btn cm-approval-dismiss" onClick={onDismiss}>Dismiss</button>
      </div>
      <StepTable request={request} />
    </section>
  )
}

// ─── Modals ───────────────────────────────────────────────────

// "Care plan review" — the dialog the live product shows on every care plan
// save (type of save, next review date, notes). When the save includes
// medication changes it adds a one-line notice of what's going for approval
// (full comparison behind "Show changes") rather than a second dialog — the
// user needs to know before writing Notes, since the approver reads them. Type of save never decides whether approval
// is needed — that's based purely on which fields changed (approval.js), so
// picking "Minor corrections / typos" can't skip the check.
// "Metformin 500mg tablets (Dosage)" — one line per change, so the dialog
// says what's going for approval without the full comparison table.
const describeChange = ({ before, after, pending }) => {
  const task = after || before
  const what = !before ? 'new task' : !after ? 'removal' : diffTask(before, after).filter(c => c.clinical).map(c => c.label).join(', ')
  const updates = pending ? ` — updates ${pending.requestedBy}'s pending change, approval restarts` : ''
  return `${task.name} (${what})${updates}`
}

// `closingChanges` = pending requests this save closes because the edits put
// every clinical field back to the live version.
export function CarePlanReviewModal({ open, approvalChanges, closingChanges = [], initialReviewDate, onCancel, onConfirm }) {
  const [saveType, setSaveType] = useState('')
  const [reviewDate, setReviewDate] = useState(initialReviewDate)
  const [notes, setNotes] = useState('')
  const [showChanges, setShowChanges] = useState(false)

  // Fresh form every time it opens.
  useEffect(() => {
    if (open) { setSaveType(''); setReviewDate(initialReviewDate); setNotes(''); setShowChanges(false) }
  }, [open, initialReviewDate])

  const needsApproval = approvalChanges.length > 0
  const valid = saveType && reviewDate

  return (
    <ModalPanel
      open={open}
      onClose={onCancel}
      title="Care plan review"
      width={760}
      footer={
        <>
          <button className="round-btn tertiary-btn" onClick={onCancel}>Cancel</button>
          <button className="round-btn primary-btn" disabled={!valid} onClick={() => onConfirm({ saveType, reviewDate, notes: notes.trim() })}>
            {needsApproval ? 'Save and send for approval' : 'OK'}
          </button>
        </>
      }
    >
      <div className="cm-modal-body">
        <div className="cm-review-info">
          <InfoIcon />
          <span>There have been changes to this care plan.</span>
        </div>

        {needsApproval && (
          <div className="cm-review-approval">
            <ShieldIcon size={20} />
            <div className="cm-review-approval-body">
              <p>
                <strong>{approvalChanges.length} medication {approvalChanges.length === 1 ? 'change' : 'changes'} will be sent for approval</strong>
                {approvalChanges.length === 1 && <>: {describeChange(approvalChanges[0])}</>}.
                {' '}Carers see the current version until approved.
              </p>
              {approvalChanges.length > 1 && (
                <ul>{approvalChanges.map(c => <li key={c.taskId}>{describeChange(c)}</li>)}</ul>
              )}
              <button type="button" className="cm-link-btn" onClick={() => setShowChanges(v => !v)}>
                {showChanges ? 'Hide changes' : 'Show changes'}
              </button>
              {showChanges && approvalChanges.map(c => (
                <div key={c.taskId} className="cm-modal-change">
                  <h5>{(c.after || c.before).name}</h5>
                  <ChangeTable before={c.before} after={c.after} />
                </div>
              ))}
            </div>
          </div>
        )}

        {closingChanges.length > 0 && (
          <p className="cm-review-closing">
            {closingChanges.map(c => (
              <span key={c.taskId}>{c.name}: {c.requestedBy}'s pending change will be withdrawn — your edits put it back to the current version. </span>
            ))}
          </p>
        )}

        <p className="cm-review-instructions">Select the type of the save, reason for the care plan change and update review date.</p>

        <Field label="Select type of save" required>
          <select className="form-select cm-select" value={saveType} onChange={e => setSaveType(e.target.value)}>
            <option value="">- Select -</option>
            {SAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Next review date" required>
          <DateField value={reviewDate} onChange={setReviewDate} />
        </Field>
        <Field label="Notes">
          <textarea className="form-textarea cm-review-notes" rows={4} value={notes} onChange={e => setNotes(e.target.value)} />
          {needsApproval && <p className="cm-review-hint">Shown to the Care Manager approving this.</p>}
        </Field>
      </div>
    </ModalPanel>
  )
}

export function RejectModal({ open, request, onCancel, onConfirm }) {
  const [reason, setReason] = useState('')
  const close = () => { setReason(''); onCancel() }
  return (
    <ModalPanel
      open={open}
      onClose={close}
      title="Reject change"
      footer={
        <>
          <button className="round-btn tertiary-btn" onClick={close}>Cancel</button>
          <button
            className="round-btn cm-danger-btn cm-danger-btn--filled"
            disabled={!reason.trim()}
            onClick={() => { onConfirm(reason.trim()); setReason('') }}
          >
            Reject change
          </button>
        </>
      }
    >
      <div className="cm-modal-body">
        <p className="cm-modal-intro">
          {request && <>The change to <strong>{(request.after || request.before).name}</strong> won't be applied. </>}
          {request?.requestedBy} will see your reason.
        </p>
        <label className="cm-label" htmlFor="cm-reject-reason">Reason<span className="cm-required">*</span></label>
        <textarea
          id="cm-reject-reason"
          className="form-textarea cm-reject-reason"
          rows={4}
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. Dosage doesn't match the latest GP letter"
          autoFocus
        />
      </div>
    </ModalPanel>
  )
}

// ─── Prototype-only persona switcher ──────────────────────────

// Reminder of what the switcher is for and the approval rules it lets you demo.
function PersonaRules() {
  return (
    <>
      <strong>Switch who you're viewing as</strong> to try the medication approval workflow.
      <ul>
        <li>Medication changes need a Care Manager's approval. The current version stays live until then.</li>
        <li>A Supervisor can make changes but can't approve them.</li>
        <li>Anyone can edit a pending change, and approval starts again.</li>
        <li>You can't approve a change you contributed to, which is why there are two Care Managers.</li>
      </ul>
    </>
  )
}

export function PersonaSwitcher({ personas, persona, onChange }) {
  return (
    <div className="cm-persona" data-devmode-passthrough="true">
      <span className="cm-persona-tag">Prototype</span>
      <label className="cm-persona-label" htmlFor="cm-persona-select">Viewing as</label>
      <select
        id="cm-persona-select"
        className="cm-persona-select"
        value={persona.id}
        onChange={e => onChange(personas.find(p => p.id === e.target.value))}
      >
        {personas.map(p => <option key={p.id} value={p.id}>{p.name} ({p.role})</option>)}
      </select>
      <Tooltip text={<PersonaRules />} wrapClassName="cm-persona-help">
        <InfoIcon />
      </Tooltip>
    </div>
  )
}
