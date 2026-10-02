import { useState, useEffect } from 'react'
import ModalPanel from '../../../Components/ModalPanel'
import { diffTask } from './approval'
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

// Shown at the top of a task with a pending change. What it offers depends
// on who's looking: an eligible approver gets Approve/Reject, the requester
// can withdraw, anyone else just sees that it's waiting.
// The requester's Care plan review answers — gives the approver the "why"
// (notes) alongside the "what" (the change table). Also used in History.
export function ReviewDetails({ review }) {
  if (!review) return null
  return (
    <dl className="cm-review-details">
      <div><dt>Type of save</dt><dd>{review.saveType}</dd></div>
      <div><dt>Notes</dt><dd>{review.notes || '—'}</dd></div>
    </dl>
  )
}

export function PendingBanner({ request, persona, onApprove, onReject, onWithdraw }) {
  const isRequester = persona.name === request.requestedBy
  const canDecide = persona.canApprove && !isRequester
  const what = !request.before ? 'New medication task' : !request.after ? 'Removal of this medication task' : 'Medication change'

  return (
    <section className="cm-approval-banner cm-approval-banner--pending">
      <div className="cm-approval-banner-head">
        <div className="cm-approval-banner-text">
          <h4>{what} awaiting approval</h4>
          <p>
            Requested by <strong>{request.requestedBy}</strong> on {request.requestedAt}
            {request.origin !== 'Edit' && <> · {request.origin}</>}
          </p>
        </div>
      </div>

      <ReviewDetails review={request.review} />

      <ChangeTable before={request.before} after={request.after} />

      <p className="cm-approval-note">
        {request.before
          ? 'Until this is approved, carers continue to see the current version. The form below shows the current version and is locked.'
          : 'This task will not appear on visits until it is approved.'}
      </p>

      <div className="cm-approval-actions">
        {canDecide && (
          <>
            <button className="round-btn primary-btn" onClick={onApprove}>Approve change</button>
            <button className="round-btn cm-danger-btn" onClick={onReject}>Reject</button>
          </>
        )}
        {isRequester && (
          <button className="round-btn secondary-btn" onClick={onWithdraw}>Withdraw request</button>
        )}
        {!canDecide && !isRequester && (
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
            <strong>{request.decidedBy}</strong> rejected {request.requestedBy}'s change on {request.decidedAt}
          </p>
          <p className="cm-approval-reason">“{request.reason}”</p>
        </div>
        <button className="cm-link-btn cm-approval-dismiss" onClick={onDismiss}>Dismiss</button>
      </div>
      <ChangeTable before={request.before} after={request.after} />
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
const describeChange = ({ before, after }) => {
  const task = after || before
  if (!before) return `${task.name} (new task)`
  if (!after) return `${task.name} (removal)`
  return `${task.name} (${diffTask(before, after).filter(c => c.clinical).map(c => c.label).join(', ')})`
}

export function CarePlanReviewModal({ open, approvalChanges, immediateCount, initialReviewDate, onCancel, onConfirm }) {
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
                {' '}{immediateCount > 0 ? 'Other changes save straight away.' : 'Carers see the current version until approved.'}
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
    </div>
  )
}
