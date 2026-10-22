// Medication-change approval, "inactive copy" model — pure logic (no React).
//
// Alternative to ../care-management (approval requests). Suggested by
// engineering (2026-10-22): the care plan is saved in one go and has to work
// offline, so a pending change is stored as part of the care plan itself
// rather than as a separate request:
// - A clinical edit to a medication task saves a COPY of the task holding
//   the edits, set to inactive (`approval` on the copy). The original stays
//   live and untouched, so carers' devices keep using it.
// - Approving is one ordinary care plan save: the copy becomes active and
//   the original inactive (`replacedBy`). Rejecting deletes the copy.
// - A new medication task is saved inactive until approved; removing one
//   flags it (`pendingRemoval`) and it stays live until approved.
// - While a copy is pending, the original is read-only: all edits go on the
//   copy, so nothing has to be merged on approval. Anyone can edit the copy;
//   every editor is recorded and none of them can approve it.
// - Housekeeping-only edits to a medication task save straight away.

import { VISITS, fmtDate, fmtCadence, fmtScheduleTimes } from './data'
import { zoneLabel } from './BodyMap'

const yesNo = v => (v ? 'Yes' : 'No')

// [key, label, clinical, path into the task, format(value)]
const FIELDS = [
  ['name', 'Name', true, ['name']],
  ['status', 'Status', true, ['status'], v => (v === 'active' ? 'Active' : 'Inactive')],
  ['beginsOn', 'Begins on', true, ['beginsOn'], fmtDate],
  ['endsOn', 'Ends on', true, ['endsOn'], v => (v ? fmtDate(v) : 'Ongoing')],
  ['cadence', 'Cadence', true, ['cadence'], fmtCadence],
  ['scheduleTimes', 'Scheduled times', true, ['scheduleTimes'], fmtScheduleTimes],
  ['visitIds', 'Visits', true, ['visitIds'],
    v => VISITS.filter(x => v.includes(x.id)).map(x => x.label).join(', ')],
  ['bodyZones', 'Bodymap', true, ['bodyZones'],
    v => v.map(z => { const [view, id] = z.split(':'); return `${zoneLabel(id)} (${view})` }).join(', ')],
  ['requireWitness', 'Require witness', true, ['requireWitness'], yesNo],
  ['form', 'Form', true, ['medication', 'form']],
  ['route', 'Route', true, ['medication', 'route']],
  ['dosage', 'Dosage', true, ['medication', 'dosage']],
  ['controlCategory', 'Control category', true, ['medication', 'controlCategory']],
  ['support', 'Support required', true, ['medication', 'support']],
  ['prn', 'PRN', true, ['medication', 'prn'], yesNo],
  ['location', 'Location', false, ['medication', 'location']],
  ['allowRetry', 'Allow retry', true, ['allowRetry'], yesNo],
  ['outcomes', 'Outcomes aided', false, ['outcomes'], v => v.join(', ')],
  ['alerts', 'Alerts', false, ['alerts'],
    v => [v.missed && 'Missed', v.notDone && 'Not done', v.incomplete && 'Incomplete'].filter(Boolean).join(', ')],
  ['description', 'Description', true, ['description']],
]

const MED_ONLY = new Set(['form', 'route', 'dosage', 'controlCategory', 'support', 'prn', 'location', 'bodyZones'])

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const clone = x => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)))
const getPath = (t, path) => path.reduce((o, k) => (o == null ? undefined : o[k]), t) ?? null
function setPath(t, path, value) {
  let o = t
  path.slice(0, -1).forEach(k => { o[k] = { ...o[k] }; o = o[k] })
  o[path[path.length - 1]] = clone(value)
}
const fieldByKey = Object.fromEntries(FIELDS.map(f => [f[0], f]))
const display = (fmt, v) => {
  const out = fmt ? fmt(v) : v
  return out === '' || out == null ? '—' : String(out)
}

export const isMedication = t => t?.type === 'Medication'

// Field-by-field changes between two versions of one task. `before` null =
// a new task, `after` null = a removal (both listed as a single row).
export function diffTask(before, after) {
  if (!before || !after) {
    return [{ key: '_task', label: 'Task', clinical: true, before: before ? 'Exists' : '—', after: after ? 'Added' : 'Removed' }]
  }
  const med = isMedication(after)
  return FIELDS
    .filter(([key]) => med || !MED_ONLY.has(key))
    .filter(([, , , path]) => !same(getPath(before, path), getPath(after, path)))
    .map(([key, label, clinical, path, fmt]) => ({
      key, label, clinical: clinical && med,
      before: display(fmt, getPath(before, path)),
      after: display(fmt, getPath(after, path)),
    }))
}

// Keys of the fields that differ, split into clinical / housekeeping.
export function splitKeys(before, after) {
  const rows = diffTask(before, after)
  return { clinical: rows.filter(r => r.clinical).map(r => r.key), other: rows.filter(r => !r.clinical).map(r => r.key) }
}

// `base` with the listed fields copied over from `source`.
export function withFields(base, source, keys) {
  const out = clone(base)
  keys.forEach(k => setPath(out, fieldByKey[k][3], getPath(source, fieldByKey[k][3])))
  return out
}

// Compare a working/target task list against the live one.
// Returns [{ taskId, before, after }] for every task that differs.
export function diffTaskLists(live, target) {
  const liveById = Object.fromEntries(live.map(t => [t.id, t]))
  const targetById = Object.fromEntries(target.map(t => [t.id, t]))
  const changes = []
  target.forEach(t => {
    const before = liveById[t.id] || null
    if (!before || !same(before, t)) changes.push({ taskId: t.id, before, after: t })
  })
  live.forEach(t => { if (!targetById[t.id]) changes.push({ taskId: t.id, before: t, after: null }) })
  return changes
}

// Apply a set of { taskId, after } changes to a task list.
export function applyChanges(tasks, changes) {
  let next = [...tasks]
  changes.forEach(({ taskId, after }) => {
    const i = next.findIndex(t => t.id === taskId)
    if (!after) next = next.filter(t => t.id !== taskId)
    else if (i === -1) next.push(after)
    else next[i] = after
  })
  return next
}

// Short summary for a history row: "SHOE COVERS — updated". No field names,
// as everywhere in History (View shows the version's detail).
export function summariseChange({ before, after }) {
  const task = after || before
  if (!before) return `${task.name} — added`
  if (!after) return `${task.name} — removed`
  return `${task.name} — updated`
}

export function fmtDateTime(d) {
  const pad = n => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ─── Inactive copy model ──────────────────────────────────────

const byId = list => Object.fromEntries(list.map(t => [t.id, t]))
let copyCounter = 10
const nextCopyId = id => `${id}-c${++copyCounter}`

export const isCopy = t => !!t?.approval
export const copyOf = (tasks, id) => tasks.find(t => t.approval?.replaces === id) || null
// A copy as it will look once approved — its own status is always inactive;
// the status it will take is held on `approval.intendedStatus`.
export const asProposed = copy => (isCopy(copy) ? { ...copy, status: copy.approval.intendedStatus } : copy)
// Tasks nobody can edit: an old version replaced by an approved copy, a task
// waiting on its removal, and an original whose copy is waiting for approval.
export const lockReason = (task, tasks) => {
  if (!task) return null
  if (task.replacedBy) return 'replaced'
  if (task.pendingRemoval) return 'removal'
  if (copyOf(tasks, task.id)) return 'copy'
  return null
}
export const awaitingApproval = t => isCopy(t) || !!t.pendingRemoval

const labels = (before, after) => diffTask(before, after).map(r => r.label)

// Turn live → target into the care plan save. Item kinds:
// - direct:       saved as is (non-medication, or housekeeping only)
// - copy:         clinical edit to a live medication task → new inactive copy
// - create:       new medication task → saved inactive until approved
// - updateCopy:   edit to a copy already awaiting approval (approval restarts)
// - removal:      medication task flagged for removal, stays live until approved
// - withdrawCopy: a pending copy discarded (the change is cancelled)
// - skipped:      edits to a locked task (only reachable via Revert)
// Decisions, staged on the task by Approve/Reject (`decision` on the copy's
// `approval`, or on `pendingRemoval`) and applied by this save:
// - approve / reject:               a copy (reject deletes it)
// - approveRemoval / rejectRemoval: a pending removal
// - cancelRemoval:                  a pending removal withdrawn
export function planSave({ live, target }) {
  const items = []
  diffTaskLists(live, target).forEach(({ before, after }) => {
    if (before && after && isCopy(before) && after.approval?.decision) {
      // An approver can edit the copy and approve it in the same save: the
      // edits are applied (and recorded) first, then approved. A rejected
      // copy is deleted, so any edits to it don't matter.
      const { decision, ...approval } = after.approval
      const edited = { ...after, approval }
      const fields = labels(asProposed(before), asProposed(edited))
      items.push({ kind: decision, copy: decision === 'approve' && fields.length ? edited : before, fields, contributors: before.approval.contributors })
      return
    }
    if (before?.pendingRemoval && after) {
      if (after.pendingRemoval?.decision) {
        items.push({ kind: `${after.pendingRemoval.decision}Removal`, task: before, contributors: before.pendingRemoval.contributors })
      } else if (!after.pendingRemoval) {
        items.push({ kind: 'cancelRemoval', task: before })
      }
      return
    }
    if (before && lockReason(before, live)) { items.push({ kind: 'skipped', task: before }); return }
    if (!after) {
      if (isCopy(before)) items.push({ kind: 'withdrawCopy', copy: before })
      else if (isMedication(before)) items.push({ kind: 'removal', task: before })
      else items.push({ kind: 'direct', before, after: null })
      return
    }
    if (!before) {
      items.push(isMedication(after) ? { kind: 'create', task: after } : { kind: 'direct', before: null, after })
      return
    }
    if (isCopy(before)) {
      items.push({ kind: 'updateCopy', before, after, fields: labels(asProposed(before), asProposed(after)) })
      return
    }
    if (!isMedication(after) || !splitKeys(before, after).clinical.length) {
      items.push({ kind: 'direct', before, after })
      return
    }
    items.push({ kind: 'copy', original: before, edited: after, fields: labels(before, after) })
  })
  return items
}

export const needsApproval = item => ['copy', 'create', 'updateCopy', 'removal'].includes(item.kind)
export const isDecision = item => ['approve', 'reject', 'approveRemoval', 'rejectRemoval'].includes(item.kind)

// Apply a save plan. `who` = { name, at, review } — recorded on every copy
// and removal it raises or updates, and as the approver of any decision.
// Returns the new care plan, one history summary line per item, and the
// rejections made (their reason is the save's Notes).
// History says what happened to the change, not which fields (View opens
// that version's care plan) and never "copy", which is just how V2 stores it:
// "— change awaiting approval" (raised, or edited while pending), then
// "— change approved / rejected / cancelled". Same for new tasks and removals.

export function applyPlan(live, items, who) {
  let next = [...live]
  const summary = []
  const rejections = []
  const reject = (taskId, what, contributors) => rejections.push({
    taskId, what, by: who.name, at: who.at, reason: who.review?.notes || '', contributors,
  })
  const contributor = fields => ({ name: who.name, at: who.at, review: who.review, fields })
  const replace = (id, task) => { next = next.map(t => (t.id === id ? task : t)) }
  items.forEach(it => {
    if (it.kind === 'direct') {
      next = applyChanges(next, [{ taskId: (it.after || it.before).id, after: it.after }])
      summary.push(summariseChange(it))
    } else if (it.kind === 'copy') {
      const copy = {
        ...clone(it.edited), id: nextCopyId(it.original.id), status: 'inactive',
        approval: { kind: 'edit', replaces: it.original.id, intendedStatus: it.edited.status, contributors: [contributor(it.fields)] },
      }
      const i = next.findIndex(t => t.id === it.original.id)
      next = [...next.slice(0, i + 1), copy, ...next.slice(i + 1)]
      summary.push(`${copy.name} — change awaiting approval`)
    } else if (it.kind === 'create') {
      next = [...next, {
        ...it.task, status: 'inactive',
        approval: { kind: 'create', replaces: null, intendedStatus: it.task.status, contributors: [contributor(['New task'])] },
      }]
      summary.push(`${it.task.name} — new task awaiting approval`)
    } else if (it.kind === 'updateCopy') {
      replace(it.after.id, {
        ...it.after,
        approval: { ...it.after.approval, contributors: [...it.before.approval.contributors, contributor(it.fields)] },
      })
      summary.push(`${it.after.name} — ${it.after.approval.kind === 'create' ? 'new task' : 'change'} awaiting approval`)
    } else if (it.kind === 'removal') {
      replace(it.task.id, { ...it.task, pendingRemoval: { contributors: [contributor(['Removal'])] } })
      summary.push(`${it.task.name} — removal awaiting approval`)
    } else if (it.kind === 'withdrawCopy') {
      next = next.filter(t => t.id !== it.copy.id)
      summary.push(`${it.copy.name} — ${it.copy.approval.kind === 'create' ? 'new task' : 'change'} cancelled`)
    } else if (it.kind === 'approve') {
      next = approveCopy(next, it.copy, who.at)
      summary.push(it.copy.approval.replaces
        ? `${it.copy.name} — change approved`
        : `${it.copy.name} — new task approved`)
    } else if (it.kind === 'reject') {
      next = removeTask(next, it.copy.id)
      reject(it.copy.approval.replaces, 'Change', it.contributors)
      summary.push(`${it.copy.name} — ${it.copy.approval.kind === 'create' ? 'new task' : 'change'} rejected`)
    } else if (it.kind === 'approveRemoval') {
      next = removeTask(next, it.task.id)
      summary.push(`${it.task.name} — removal approved`)
    } else if (it.kind === 'rejectRemoval') {
      next = clearRemoval(next, it.task.id)
      reject(it.task.id, 'Removal', it.contributors)
      summary.push(`${it.task.name} — removal rejected`)
    } else if (it.kind === 'cancelRemoval') {
      next = clearRemoval(next, it.task.id)
      summary.push(`${it.task.name} — removal cancelled`)
    }
  })
  return { nextLive: next, summary, rejections }
}

// Approving a copy: one save that makes the copy active and the original
// inactive. A new task just becomes active. The original's Ends on is set to
// the approval date (unless it already ended earlier), so dates show when
// the old version stopped and the new one took over.
export function approveCopy(live, copy, at) {
  const { approval, ...rest } = copy
  const [d, m, y] = at.split(' ')[0].split('/')
  const today = `${y}-${m}-${d}`
  return live.map(t => {
    if (t.id === copy.id) return { ...rest, status: approval.intendedStatus }
    if (t.id === approval.replaces) {
      const endsOn = t.endsOn && t.endsOn < today ? t.endsOn : today
      return { ...t, status: 'inactive', endsOn, replacedBy: copy.id, replacedAt: at }
    }
    return t
  })
}
export const removeTask = (live, id) => live.filter(t => t.id !== id)
export const clearRemoval = (live, id) => live.map(t => {
  if (t.id !== id) return t
  const { pendingRemoval, ...rest } = t
  return rest
})

// Revert target: an old snapshot mapped onto today's task ids. An approved
// copy has a new id, so a snapshot's task is matched to whatever replaced it
// (following `replacedBy`). Copies and replaced versions are left as they
// are — a revert only changes the current versions of tasks.
export function revertTarget(live, snapshot) {
  const liveById = byId(live)
  const head = id => {
    let t = liveById[id]
    while (t?.replacedBy) t = liveById[t.replacedBy]
    return t
  }
  const isCurrent = t => !isCopy(t) && !t.replacedBy
  const wanted = {}
  snapshot.filter(isCurrent).forEach(t => {
    const h = head(t.id)
    const { pendingRemoval, ...old } = clone(t)
    wanted[h ? h.id : t.id] = { ...old, id: h ? h.id : t.id }
  })
  const out = []
  live.forEach(t => {
    if (!isCurrent(t)) { out.push(t); return }
    if (wanted[t.id]) {
      // Keep today's lock markers so a locked task shows as skipped, not changed.
      out.push(t.pendingRemoval ? { ...wanted[t.id], pendingRemoval: t.pendingRemoval } : wanted[t.id])
      delete wanted[t.id]
    }
  })
  return [...out, ...Object.values(wanted)]
}
