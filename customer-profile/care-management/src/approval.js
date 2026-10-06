// Medication-change approval — pure logic (no React).
//
// Prototype defaults (agreed 2026-10-01, revised 2026-10-05 — "no lock"):
// - Only CLINICAL fields on a medication task need a second signature;
//   housekeeping fields (location, description, outcomes, alerts) always
//   save immediately — even while a clinical change is pending.
// - Adding or removing a medication task always needs approval.
// - Nothing is locked while a change is pending. The task page shows the
//   proposed version; anyone can keep editing it. A further clinical edit
//   updates the pending request (approval restarts, every contributor is
//   recorded, and no contributor can approve it). A request only holds its
//   clinical fields (`keys`), so approving merges just those into whatever
//   is live by then — a housekeeping edit saved meanwhile is never undone.
// - The current version stays live until a change is approved.
// - Exception: a task with a pending REMOVAL stays read-only.

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
  ['description', 'Description', false, ['description']],
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

// What a pending request would make the task look like if approved now.
export function proposedTask(liveTask, request) {
  if (request.kind === 'create') return request.after
  if (request.kind === 'delete') return liveTask
  return withFields(liveTask, request.after, request.keys)
}

// Live care plan with every pending proposal shown in place — what the task
// list and task page display, and the baseline unsaved edits compare to.
export function overlayPending(live, pendingRequests) {
  const byTask = Object.fromEntries(pendingRequests.map(r => [r.taskId, r]))
  const shown = live.map(t => (byTask[t.id] ? proposedTask(t, byTask[t.id]) : t))
  const creates = pendingRequests.filter(r => r.kind === 'create').map(r => r.after)
  return [...shown, ...creates]
}

// Turn "baseline → target" into what saves now and what goes to (or
// updates, or closes) an approval request. Used by Save, Delete and Revert.
// - immediate: [{ taskId, before, after }] applied to live straight away
// - ops: [{ type: 'request', kind, taskId, before, after, keys, pending, step }]
//        `step` = just this submission ({ before, after, keys }: the fields
//        this person changed, from → to) — the approver's step-by-step log.
//        [{ type: 'close', pending, note }]
// - skipped: changes to a task with a pending removal (read-only)
export function planSave({ live, baseline, target, pendingByTask }) {
  const liveById = Object.fromEntries(live.map(t => [t.id, t]))
  const immediate = []
  const ops = []
  const skipped = []
  diffTaskLists(baseline, target).forEach(({ taskId, before, after }) => {
    const liveTask = liveById[taskId] || null
    const pending = pendingByTask[taskId] || null
    if (pending?.kind === 'delete') { skipped.push({ taskId, before, after }); return }

    if (!after) {
      if (!liveTask) { if (pending) ops.push({ type: 'close', pending, note: 'New task discarded' }); return }
      if (isMedication(liveTask)) ops.push({ type: 'request', kind: 'delete', taskId, before: liveTask, after: null, keys: [], pending, step: { before, after: null, keys: null } })
      else immediate.push({ taskId, before: liveTask, after: null })
      return
    }

    if (!liveTask) {
      if (isMedication(after)) ops.push({ type: 'request', kind: 'create', taskId, before: null, after, keys: [], pending, step: { before: pending ? before : null, after, keys: null } })
      else immediate.push({ taskId, before: null, after })
      return
    }

    if (!isMedication(after)) { immediate.push({ taskId, before: liveTask, after }); return }

    const { clinical, other } = splitKeys(before, after)
    const nextLive = other.length ? withFields(liveTask, after, other) : liveTask
    if (other.length) immediate.push({ taskId, before: liveTask, after: nextLive })
    if (!clinical.length) return
    // Clinical fields still different from live, after this edit.
    const keys = splitKeys(nextLive, after).clinical
    if (!keys.length) {
      if (pending) ops.push({ type: 'close', pending, note: 'Edited back to the current version' })
      return
    }
    ops.push({ type: 'request', kind: 'edit', taskId, before: nextLive, after: withFields(nextLive, after, keys), keys, pending, step: { before, after, keys: clinical } })
  })
  return { immediate, ops, skipped }
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

// Rows for one contributor's step: [{ key, label, from, to }]. A create or
// removal is one whole-task row; `keys` null = every field that differs (an
// edit to a pending new task, where the whole task is pending).
export function stepRows({ before, after, keys }) {
  if (!before || !after) {
    const task = after || before
    const meds = isMedication(task) ? ` (${[task.medication.dosage, task.medication.form, task.medication.route].filter(Boolean).join(', ')})` : ''
    return [{ key: '_task', label: 'Task', from: before ? task.name : '—', to: after ? `New: ${task.name}${meds}` : 'Removed' }]
  }
  return diffTask(before, after)
    .filter(r => !keys || keys.includes(r.key))
    .map(r => ({ key: r.key, label: r.label, from: r.before, to: r.after }))
}

// Short summary for a history row: "Metformin 500mg tablets — Dosage".
export function summariseChange({ before, after }) {
  const task = after || before
  if (!before) return `${task.name} — added`
  if (!after) return `${task.name} — removed`
  return `${task.name} — ${diffTask(before, after).map(c => c.label).join(', ')}`
}

export function fmtDateTime(d) {
  const pad = n => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
