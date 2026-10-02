import { useState, Fragment } from 'react'
import ModalPanel from '../../../Components/ModalPanel'
import { ChangeTable, ReviewDetails } from './ApprovalUI'

// Recreates the live "Careplan Version History" modal, extended for the
// approval workflow:
// - Status + Approved by columns (the dual-signature record).
// - Pending/rejected/withdrawn requests listed alongside real versions so the
//   audit trail is complete — they have no version number and can't be
//   reverted to.
// - View on a version opens the read-only care plan document for it (as the
//   live product does). Requests have no version/document, so their View
//   expands the row to show the proposed change and its outcome.
// - Revert is handled by the caller, which routes any medication change it
//   would cause through approval.

const PAGE_SIZE = 10

// Seeded rows only have a dd/mm/yyyy hh:mm string; rows created in the
// session also carry an exact `ts` so same-minute entries keep their order.
const toTime = (row) => {
  if (row.data.ts) return row.data.ts
  const [d, m, rest] = row.modifiedAt.split('/')
  const [y, time] = rest.split(' ')
  return new Date(`${y}-${m}-${d}T${time}:00`).getTime()
}

const STATUS = {
  live: { label: 'Live', tone: 'live' },
  superseded: { label: 'Inactive', tone: 'muted' },
  pending: { label: 'Pending approval', tone: 'pending' },
  rejected: { label: 'Rejected', tone: 'rejected' },
  withdrawn: { label: 'Withdrawn', tone: 'muted' },
}

function buildRows(versions, requests) {
  const latest = Math.max(...versions.map(v => v.version))
  const versionRows = versions.map(v => ({
    key: `v${v.version}`,
    kind: 'version',
    modifiedAt: v.modifiedAt,
    receivedAt: v.receivedAt,
    employee: v.employee,
    source: v.source,
    version: v.version,
    status: v.version === latest ? 'live' : 'superseded',
    approvedBy: v.approval ? v.approval.by : '—',
    data: v,
  }))
  const requestRows = requests
    .filter(r => r.status !== 'approved')
    .map(r => ({
      key: r.id,
      kind: 'request',
      modifiedAt: r.requestedAt,
      receivedAt: r.requestedAt,
      employee: r.requestedBy,
      source: r.source,
      version: '—',
      status: r.status,
      approvedBy: '—',
      data: r,
    }))
  return [...versionRows, ...requestRows].sort((a, b) => toTime(b) - toTime(a))
}

function RequestDetail({ request: r }) {
  return (
    <div className="cm-history-detail">
      <p className="cm-history-detail-meta">
        {r.origin !== 'Edit' && <>{r.origin} · </>}
        {r.status === 'pending' && 'Waiting for a Care Manager to approve. The current version stays live until then.'}
        {r.status === 'rejected' && <>Rejected by <strong>{r.decidedBy}</strong> on {r.decidedAt}: “{r.reason}”</>}
        {r.status === 'withdrawn' && <>Withdrawn by {r.requestedBy} on {r.decidedAt}.</>}
      </p>
      <ReviewDetails review={r.review} />
      <ChangeTable before={r.before} after={r.after} />
    </div>
  )
}

export default function HistoryModal({ open, onClose, versions, requests, onRevert, onView }) {
  const [page, setPage] = useState(1)
  const [expanded, setExpanded] = useState(null)
  const rows = buildRows(versions, requests)
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
              <th>Status</th>
              <th>Approved by</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {pageRows.map(row => {
              const s = STATUS[row.status]
              const isOpen = expanded === row.key
              return (
                <Fragment key={row.key}>
                  <tr className={isOpen ? 'open' : ''}>
                    <td>{row.modifiedAt}</td>
                    <td>{row.receivedAt}</td>
                    <td className="cm-history-name" title={row.employee}>{row.employee}</td>
                    <td>{row.source}</td>
                    <td>{row.version}</td>
                    <td><span className={`cm-history-status cm-history-status--${s.tone}`}>{s.label}</span></td>
                    <td className="cm-history-name" title={row.approvedBy}>{row.approvedBy}</td>
                    <td className="cm-history-actions">
                      {row.kind === 'version'
                        ? <button className="cm-outline-btn" onClick={() => onView(row.data)}>View</button>
                        : (
                          <button className="cm-outline-btn" onClick={() => setExpanded(isOpen ? null : row.key)}>
                            {isOpen ? 'Hide' : 'View'}
                          </button>
                        )}
                      {row.kind === 'version' && row.status !== 'live'
                        ? <button className="cm-outline-btn cm-outline-btn--danger" onClick={() => onRevert(row.data)}>Revert</button>
                        : <span className="cm-outline-btn-spacer" />}
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="cm-history-detail-row">
                      <td colSpan={8}><RequestDetail request={row.data} /></td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
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

// Confirmation shown before a revert: splits what would change into what
// applies straight away and what goes for approval.
export function RevertModal({ open, version, immediate, approval, blocked, dirty, onCancel, onConfirm }) {
  if (!version) return null
  const nothing = !immediate.length && !approval.length
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
          <>
            <p className="cm-modal-intro">
              Reverting would change {approval.length === 1 ? 'a medication task' : `${approval.length} medication tasks`}.
              {approval.length === 1 ? ' This needs' : ' These need'} approval from a Care Manager before going live:
            </p>
            {approval.map(c => (
              <div key={c.taskId} className="cm-modal-change">
                <h4>{(c.after || c.before).name}</h4>
                <ChangeTable before={c.before} after={c.after} />
              </div>
            ))}
          </>
        )}
        {immediate.length > 0 && (
          <p className="cm-modal-note">
            {immediate.length} other {immediate.length === 1 ? 'change' : 'changes'} will be reverted straight away:{' '}
            {immediate.map(c => (c.after || c.before).name).join(', ')}.
          </p>
        )}
        {blocked.length > 0 && (
          <p className="cm-modal-note">
            Skipped because {blocked.length === 1 ? 'it already has' : 'they already have'} a change awaiting approval:{' '}
            {blocked.map(c => (c.after || c.before).name).join(', ')}.
          </p>
        )}
      </div>
    </ModalPanel>
  )
}
