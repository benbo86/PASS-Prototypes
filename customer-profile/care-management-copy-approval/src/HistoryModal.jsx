import { useState } from 'react'
import ModalPanel from '../../../Components/ModalPanel'
import { needsApproval } from './approval'

// Recreates the live "Careplan Version History" modal. In the inactive-copy
// model every step is an ordinary care plan save, so every step is a
// version: creating a copy, editing it, approving it (Approved by filled
// in), rejecting or cancelling it. No separate request rows are needed.
// View opens the read-only care plan document for that version.
//
// Kept as close to the live modal as possible (Ben, 2026-10-22): its own
// columns plus just Approved by, the second-signature record. No Status
// (the current version is the top row, the only one without Revert) and no
// Change column (View shows what each version holds).

const PAGE_SIZE = 10

function buildRows(versions) {
  const latest = Math.max(...versions.map(v => v.version))
  return versions.map(v => ({
    key: `v${v.version}`,
    modifiedAt: v.modifiedAt,
    receivedAt: v.receivedAt,
    employee: v.employee,
    source: v.source,
    version: v.version,
    isLatest: v.version === latest,
    approvedBy: v.approval ? v.approval.by : '—',
    data: v,
  }))
}

export default function HistoryModal({ open, onClose, versions, onRevert, onView }) {
  const [page, setPage] = useState(1)
  const rows = buildRows(versions)
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const pageRows = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
  const start = (current - 1) * PAGE_SIZE + 1
  const end = Math.min(current * PAGE_SIZE, rows.length)

  return (
    <ModalPanel
      open={open}
      onClose={onClose}
      title="Careplan Version History"
      width={1240}
      footer={<><span /><button className="round-btn tertiary-btn" onClick={onClose}>Close</button></>}
    >
      <div className="cm-history">
        <table className="cm-history-table">
          <thead>
            <tr>
              <th>Date Modified</th>
              <th>Date Received</th>
              <th>Employee</th>
              <th>Source</th>
              <th>Version</th>
              <th>Approved by</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {pageRows.map(row => (
                <tr key={row.key}>
                  <td>{row.modifiedAt}</td>
                  <td>{row.receivedAt}</td>
                  <td className="cm-history-name" title={row.employee}>{row.employee}</td>
                  <td>{row.source}</td>
                  <td>{row.version}</td>
                  <td className="cm-history-name" title={row.approvedBy}>{row.approvedBy}</td>
                  <td className="cm-history-actions">
                    <button className="cm-outline-btn" onClick={() => onView(row.data)}>View</button>
                    {!row.isLatest
                      ? <button className="cm-outline-btn cm-outline-btn--danger" onClick={() => onRevert(row.data)}>Revert</button>
                      : <span className="cm-outline-btn-spacer" />}
                  </td>
                </tr>
            ))}
          </tbody>
        </table>

        <div className="cm-history-pager">
          <span>{start} to {end} of {rows.length}</span>
          <button onClick={() => setPage(1)} disabled={current === 1} aria-label="First page">|‹</button>
          <button onClick={() => setPage(current - 1)} disabled={current === 1} aria-label="Previous page">‹</button>
          <span>Page {current} of {totalPages}</span>
          <button onClick={() => setPage(current + 1)} disabled={current === totalPages} aria-label="Next page">›</button>
          <button onClick={() => setPage(totalPages)} disabled={current === totalPages} aria-label="Last page">›|</button>
        </div>
      </div>
    </ModalPanel>
  )
}

// Confirmation shown before a revert: what saves straight away, and which
// medication changes become inactive copies awaiting approval. Tasks that
// are locked (a change or removal already awaiting approval) are skipped.
const itemName = it => (it.task || it.original || it.after || it.before || it.copy).name
export function RevertModal({ open, version, items = [], dirty, onCancel, onConfirm }) {
  if (!version) return null
  const approval = items.filter(needsApproval)
  const direct = items.filter(it => it.kind === 'direct')
  const skipped = items.filter(it => it.kind === 'skipped')
  const nothing = !approval.length && !direct.length
  return (
    <ModalPanel
      open={open}
      onClose={onCancel}
      title={`Revert to version ${version.version}?`}
      width={760}
      stacked
      footer={
        <>
          <button className="round-btn tertiary-btn" onClick={onCancel}>Cancel</button>
          <button className="round-btn primary-btn" disabled={dirty || nothing} onClick={onConfirm}>
            {approval.length ? 'Revert and send for approval' : 'Revert'}
          </button>
        </>
      }
    >
      <div className="cm-modal-body">
        {dirty && (
          <div className="warning-banner orange">
            <div><h4>Unsaved changes</h4><p>Save or discard your unsaved changes before reverting.</p></div>
          </div>
        )}
        {nothing && <p className="cm-modal-intro">Version {version.version} matches the current care plan — there's nothing to revert.</p>}
        {approval.length > 0 && (
          <p className="cm-modal-intro">
            Reverting would change {approval.length === 1 ? 'a medication task' : `${approval.length} medication tasks`}:{' '}
            {approval.map(itemName).join(', ')}. {approval.length === 1 ? 'It’s saved as an inactive copy, and the current version stays' : 'They’re saved as inactive copies, and the current versions stay'} live until a Care Manager approves.
          </p>
        )}
        {direct.length > 0 && (
          <p className="cm-modal-note">
            {direct.length} other {direct.length === 1 ? 'change' : 'changes'} will be reverted straight away:{' '}
            {direct.map(itemName).join(', ')}.
          </p>
        )}
        {skipped.length > 0 && (
          <p className="cm-modal-note">
            Skipped because a change is already awaiting approval: {skipped.map(itemName).join(', ')}.
          </p>
        )}
      </div>
    </ModalPanel>
  )
}
