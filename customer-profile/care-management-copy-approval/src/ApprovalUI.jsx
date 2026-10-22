import { useState, useEffect } from 'react'
import ModalPanel from '../../../Components/ModalPanel'
import Tooltip from '../../../Components/Tooltip'
import { diffTask, needsApproval, isDecision } from './approval'
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
export function ChangeTable({ before, after, labels = ['Current', 'Proposed'] }) {
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
        <tr><th>Field</th><th>{labels[0]}</th><th>{labels[1]}</th></tr>
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

// Everyone who saved an edit to a pending copy (or raised a removal), with
// the fields they changed and their Care plan review notes. None of them can
// approve it.
export function ContributorTable({ contributors }) {
  return (
    <table className="cm-change-table cm-contrib-table">
      <thead>
        <tr><th>Changed by</th><th>Date</th><th>Fields</th><th>Notes</th></tr>
      </thead>
      <tbody>
        {contributors.map((c, i) => (
          <tr key={i}>
            <td className="cm-step-who">{c.name}</td>
            <td className="cm-step-when">{c.at}</td>
            <td>{c.fields.join(', ')}</td>
            <td className="cm-step-notes">
              {c.review?.saveType && <span className="cm-step-savetype">{c.review.saveType}</span>}
              {c.review?.notes || '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// Approve / Reject don't save anything: like any other edit they're staged
// as unsaved changes and go live with the next care plan save (the Care plan
// review dialog lists them, and a rejection needs its reason in Notes).
// `decision` = the staged 'approve' | 'reject', if any.
const STAGED = {
  approve: 'You’ve approved this.',
  reject: 'You’ve rejected this.',
  cancel: 'You’ve cancelled this removal.',
}

function DecisionActions({ contributors, persona, decision, onApprove, onReject, onUndo, onCancel, cancelLabel }) {
  // Only the person who raised it can't approve; an approver who edited it
  // can still sign it off (Ben, 2026-10-22).
  const isRequester = contributors[0].name === persona.name
  const canDecide = !isRequester
  if (decision) {
    return (
      <div className={`cm-decision-staged cm-decision-staged--${decision}`}>
        <p>
          <strong>{STAGED[decision]}</strong>
          {' '}Save the care plan to {decision === 'approve' ? 'make it live' : 'confirm'}
          {decision === 'reject' && ', and add your reason in the Notes'}.
        </p>
        <button className="round-btn secondary-btn" onClick={onUndo}>Undo</button>
      </div>
    )
  }
  return (
    <div className="cm-approval-actions">
      {canDecide && (
        <>
          <button className="round-btn primary-btn" onClick={onApprove}>Approve</button>
          <button className="round-btn cm-danger-btn" onClick={onReject}>Reject</button>
        </>
      )}
      <button className="round-btn secondary-btn" onClick={onCancel}>{cancelLabel}</button>
      {isRequester && (
        <span className="cm-approval-hint">You raised this change, so another Care Manager needs to approve it.</span>
      )}
    </div>
  )
}

// Top of a copy awaiting approval (an edit to a live task, or a new task).
// The copy itself is editable by anyone: each save is recorded and restarts
// approval. Approving is part of a care plan save: this copy becomes active
// and the current version inactive.
export function CopyBanner({ copy, original, persona, decision, onOpenOriginal, onApprove, onReject, onUndo, onCancel }) {
  const { approval } = copy
  const isNew = approval.kind === 'create'
  const proposed = { ...copy, status: approval.intendedStatus }
  return (
    <section className="cm-approval-banner cm-approval-banner--pending">
      <div className="cm-approval-banner-head">
        <div className="cm-approval-banner-text">
          <h4>{isNew ? 'New medication task awaiting approval' : 'Change awaiting approval'}</h4>
          <p>
            {isNew
              ? 'This task is saved as inactive and won’t appear on visits until it’s approved.'
              : <>This is an inactive copy of <button type="button" className="cm-link-btn cm-inline-link" onClick={onOpenOriginal}>the current version</button>, holding the edits. Carers keep seeing the current version until this is approved.</>}
          </p>
        </div>
      </div>

      {!isNew && original && <ChangeTable before={original} after={proposed} labels={['Current version', 'This copy']} />}
      <ContributorTable contributors={approval.contributors} />

      <p className="cm-approval-note">
        {isNew
          ? 'Approving makes this task active.'
          : 'Approving makes this copy active and the current version inactive.'}
        {' '}Anyone can keep editing this copy, and every edit is recorded. Only the person who raised it can’t approve it.
      </p>

      <DecisionActions
        contributors={approval.contributors}
        persona={persona}
        decision={decision}
        onApprove={onApprove}
        onReject={onReject}
        onUndo={onUndo}
        onCancel={onCancel}
        cancelLabel="Cancel change"
      />
    </section>
  )
}

// Top of a task that can't be edited: the original of a pending copy, or an
// old version replaced by an approved one.
// `cancelled` = the copy was cancelled but not saved yet (Undo restores it).
export function LockedBanner({ reason, task, cancelled, onUndo, onOpen }) {
  if (reason === 'copy' && cancelled) {
    return (
      <section className="cm-approval-banner cm-approval-banner--pending">
        <div className="cm-decision-staged cm-decision-staged--reject">
          <p><strong>You’ve cancelled the change to this task.</strong> Save the care plan to confirm. This version stays as it is.</p>
          <button className="round-btn secondary-btn" onClick={onUndo}>Undo</button>
        </div>
      </section>
    )
  }
  return (
    <section className="cm-approval-banner cm-approval-banner--pending">
      <div className="cm-approval-banner-head">
        <div className="cm-approval-banner-text">
          {reason === 'copy' ? (
            <>
              <h4>Change awaiting approval</h4>
              <p>This is the current version carers see. It can’t be edited until the change is approved or rejected. Make any further edits on the copy.</p>
            </>
          ) : (
            <>
              <h4>Replaced by an approved change</h4>
              <p>This version was made inactive on {task.replacedAt} when a change to it was approved. It can’t be edited.</p>
            </>
          )}
        </div>
      </div>
      <div className="cm-approval-actions">
        <button className="round-btn secondary-btn" onClick={onOpen}>
          {reason === 'copy' ? 'Open the copy' : 'Open current version'}
        </button>
      </div>
    </section>
  )
}

export function RemovalBanner({ task, persona, decision, onApprove, onReject, onUndo, onCancel }) {
  return (
    <section className="cm-approval-banner cm-approval-banner--pending">
      <div className="cm-approval-banner-head">
        <div className="cm-approval-banner-text">
          <h4>Removal awaiting approval</h4>
          <p>Carers see this task until the removal is approved. It can’t be edited while the removal is pending.</p>
        </div>
      </div>
      <ContributorTable contributors={task.pendingRemoval.contributors} />
      <DecisionActions
        contributors={task.pendingRemoval.contributors}
        persona={persona}
        decision={decision}
        onApprove={onApprove}
        onReject={onReject}
        onUndo={onUndo}
        onCancel={onCancel}
        cancelLabel="Cancel removal"
      />
    </section>
  )
}

// `rejection` = { by, at, reason, contributors } from the history version.
export function RejectedBanner({ rejection, onDismiss }) {
  return (
    <section className="cm-approval-banner cm-approval-banner--rejected">
      <div className="cm-approval-banner-head">
        <BlockIcon />
        <div className="cm-approval-banner-text">
          <h4>{rejection.what} rejected</h4>
          <p>
            <strong>{rejection.by}</strong> rejected {[...new Set(rejection.contributors.map(c => c.name))].join(' and ')}'s change on {rejection.at}.
            {rejection.what === 'Change' && ' The copy was deleted.'}
          </p>
          <p className="cm-approval-reason">“{rejection.reason}”</p>
        </div>
        <button className="cm-link-btn cm-approval-dismiss" onClick={onDismiss}>Dismiss</button>
      </div>
    </section>
  )
}

// ─── Modals ───────────────────────────────────────────────────

// "Care plan review" — the dialog the live product shows on every care plan
// save (type of save, next review date, notes). When the save includes
// medication changes it explains the inactive-copy approach up front (Ben's
// wording, 2026-10-22), before the user writes Notes the approver will read.
// Type of save never decides whether approval is needed.
const describeItem = it => {
  if (it.kind === 'copy') return `${it.original.name} (${it.fields.join(', ')})`
  if (it.kind === 'updateCopy') return `${it.after.name} (${it.fields.join(', ')}) — updates the copy already awaiting approval`
  if (it.kind === 'create') return `${it.task.name} (new task)`
  return `${it.task.name} (removal)`
}
const changedBy = it => [...new Set(it.contributors.map(c => c.name))].join(' and ')
const describeDecision = it => {
  const verb = it.kind === 'approve' || it.kind === 'approveRemoval' ? 'Approving' : 'Rejecting'
  const what = it.kind === 'approveRemoval' || it.kind === 'rejectRemoval' ? ' (removal)' : ''
  const edits = it.kind === 'approve' && it.fields?.length ? `, with your edits (${it.fields.join(', ')})` : ''
  return `${verb}: ${(it.copy || it.task).name}${what}, changed by ${changedBy(it)}${edits}`
}
const beforeAfter = it => {
  if (it.kind === 'copy') return [it.original, it.edited]
  if (it.kind === 'updateCopy') return [{ ...it.before, status: it.before.approval.intendedStatus }, { ...it.after, status: it.after.approval.intendedStatus }]
  if (it.kind === 'create') return [null, it.task]
  return [it.task, null]
}

export function CarePlanReviewModal({ open, items = [], initialReviewDate, onCancel, onConfirm }) {
  const [saveType, setSaveType] = useState('')
  const [reviewDate, setReviewDate] = useState(initialReviewDate)
  const [notes, setNotes] = useState('')
  const [showChanges, setShowChanges] = useState(false)

  // Fresh form every time it opens.
  useEffect(() => {
    if (open) {
      // A save that approves or rejects is typed "Approval" automatically, so
      // approvals are easy to find in Version History.
      setSaveType(items.some(isDecision) ? 'Approval' : '')
      setReviewDate(initialReviewDate); setNotes(''); setShowChanges(false)
    }
  }, [open, initialReviewDate]) // eslint-disable-line react-hooks/exhaustive-deps

  const approvalItems = items.filter(needsApproval)
  const decisions = items.filter(isDecision)
  const rejecting = decisions.filter(it => it.kind === 'reject' || it.kind === 'rejectRemoval')
  const withdrawn = items.filter(it => it.kind === 'withdrawCopy')
  const cancelledRemovals = items.filter(it => it.kind === 'cancelRemoval')
  const needs = approvalItems.length > 0
  const has = kind => approvalItems.some(it => it.kind === kind)
  // A rejection's reason is the save's Notes, so they're required then.
  const valid = saveType && reviewDate && (!rejecting.length || notes.trim())
  const saveTypes = decisions.length ? [...SAVE_TYPES, 'Approval'] : SAVE_TYPES

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
            {needs ? 'Save and send for approval' : 'OK'}
          </button>
        </>
      }
    >
      <div className="cm-modal-body">
        <div className="cm-review-info">
          <InfoIcon />
          <span>There have been changes to this care plan.</span>
        </div>

        {decisions.length > 0 && (
          <div className="cm-review-approval cm-review-decisions">
            <ShieldIcon size={20} />
            <div className="cm-review-approval-body">
              <p><strong>Approvals in this save</strong></p>
              <ul>{decisions.map((it, i) => <li key={i}>{describeDecision(it)}</li>)}</ul>
              {decisions.some(it => it.kind === 'approve') && <p>Approved changes go live when you save: each copy becomes active and its current version inactive.</p>}
              {rejecting.length > 0 && (
                <p>Add your reason for rejecting in the Notes. {[...new Set(rejecting.flatMap(it => it.contributors.map(c => c.name)))].join(' and ')} will see it.</p>
              )}
            </div>
          </div>
        )}

        {needs && (
          <div className="cm-review-approval">
            <ShieldIcon size={20} />
            <div className="cm-review-approval-body">
              <p><strong>{approvalItems.length === 1 ? 'A medication change needs' : 'Medication changes need'} approval</strong></p>
              <ul>{approvalItems.map((it, i) => <li key={i}>{describeItem(it)}</li>)}</ul>
              {(has('copy') || has('updateCopy')) && (
                <p>
                  Your changes will be saved as {has('copy') ? 'a copy of the task' : 'part of the copy'}, set to inactive.
                  {' '}Carers will keep seeing the current version until it’s approved.
                </p>
              )}
              {has('create') && <p>New medication tasks are saved as inactive until approved.</p>}
              {has('removal') && <p>A task being removed stays live until the removal is approved.</p>}
              <p>
                Ask another Care Manager to approve it. You can’t approve your own change.
                {(has('copy') || has('updateCopy')) && ' Approving activates the new version and deactivates the current one.'}
              </p>
              <button type="button" className="cm-link-btn" onClick={() => setShowChanges(v => !v)}>
                {showChanges ? 'Hide changes' : 'Show changes'}
              </button>
              {showChanges && approvalItems.map((it, i) => {
                const [before, after] = beforeAfter(it)
                return (
                  <div key={i} className="cm-modal-change">
                    <h5>{(after || before).name}</h5>
                    <ChangeTable before={before} after={after} />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {withdrawn.length > 0 && (
          <p className="cm-review-closing">
            {withdrawn.map(it => <span key={it.copy.id}>{it.copy.name}: the copy awaiting approval will be deleted, cancelling that change. </span>)}
          </p>
        )}
        {cancelledRemovals.length > 0 && (
          <p className="cm-review-closing">
            {cancelledRemovals.map(it => <span key={it.task.id}>{it.task.name}: the removal awaiting approval will be cancelled. </span>)}
          </p>
        )}

        <p className="cm-review-instructions">Select the type of the save, reason for the care plan change and update review date.</p>

        <Field label="Select type of save" required>
          <select className="form-select cm-select" value={saveType} onChange={e => setSaveType(e.target.value)}>
            <option value="">- Select -</option>
            {saveTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Next review date" required>
          <DateField value={reviewDate} onChange={setReviewDate} />
        </Field>
        <Field label="Notes" required={rejecting.length > 0}>
          <textarea className="form-textarea cm-review-notes" rows={4} value={notes} onChange={e => setNotes(e.target.value)} />
          {rejecting.length > 0
            ? <p className="cm-review-hint">Your reason for rejecting. Shown to whoever made the change.</p>
            : needs && <p className="cm-review-hint">Shown to the Care Manager approving this.</p>}
        </Field>
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
        <li>A medication change is saved as an inactive copy of the task. The current version stays live until a Care Manager approves it.</li>
        <li>Approve and Reject are unsaved changes: they go live when you save the care plan. Approving makes the copy active and the current version inactive.</li>
        <li>Anyone can edit the copy. The person who raised a change can't approve it, which is why you can switch between two Care Managers. Someone who only edited it can still approve it.</li>
      </ul>
    </>
  )
}

// `contributors` = names of whoever made the change awaiting approval on the
// open task (null elsewhere); the first raised it. Only that person can't
// approve, so the hint says whether you can, or who to switch to.
function personaHint(personas, persona, contributors, onChange) {
  if (!contributors) return null
  const requester = contributors[0]
  if (persona.name !== requester) return <>You can approve this change.</>
  const other = personas.find(p => p.name !== requester)
  return (
    <>
      You raised this change.{' '}
      <button type="button" className="cm-link-btn cm-persona-switch" onClick={() => onChange(other)}>
        Switch to {other.name}
      </button>{' '}
      to approve it.
    </>
  )
}

export function PersonaSwitcher({ personas, persona, onChange, contributors = null }) {
  const hint = personaHint(personas, persona, contributors, onChange)
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
      {hint && <p className="cm-persona-hint">{hint}</p>}
    </div>
  )
}

// Recreates the live product's prompt when leaving the care plan with
// unsaved changes (Ben's screenshot, 2026-10-22).
export function UnsavedChangesModal({ open, onStay, onDiscard }) {
  return (
    <ModalPanel
      open={open}
      onClose={onStay}
      title="Unsaved changes"
      footer={
        <>
          <span />
          <div className="cm-footer-pair">
            <button className="round-btn tertiary-btn" onClick={onStay}>Stay on page</button>
            <button className="round-btn cm-danger-btn cm-danger-btn--filled" onClick={onDiscard}>Discard changes</button>
          </div>
        </>
      }
    >
      <div className="cm-modal-body">
        <p className="cm-modal-intro">There are unsaved changes on the page, do you want to discard the changes?</p>
      </div>
    </ModalPanel>
  )
}
