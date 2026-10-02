// Medication-change approval — pure logic (no React).
//
// Prototype defaults (agreed 2026-10-01, pending Care South's answers):
// - Only CLINICAL fields on a medication task need a second signature;
//   housekeeping fields (location, description, outcomes, alerts, allow
//   retry) save immediately.
// - Adding or removing a medication task always needs approval.
// - A medication task with a clinical change goes for approval as a whole,
//   including any housekeeping edits made alongside it.
// - The current version stays live until a change is approved.

import { VISITS, fmtDate } from './data'
import { zoneLabel } from './BodyMap'

const yesNo = v => (v ? 'Yes' : 'No')

// [key, label, clinical, read(task), format(value)]
const FIELDS = [
  ['name', 'Name', true, t => t.name],
  ['status', 'Status', true, t => t.status, v => (v === 'active' ? 'Active' : 'Inactive')],
  ['beginsOn', 'Begins on', true, t => t.beginsOn, fmtDate],
  ['endsOn', 'Ends on', true, t => t.endsOn, v => (v ? fmtDate(v) : 'Ongoing')],
  ['visitIds', 'Visits', true, t => t.visitIds,
    v => VISITS.filter(x => v.includes(x.id)).map(x => x.label).join(', ')],
  ['bodyZones', 'Bodymap', true, t => t.bodyZones,
    v => v.map(z => { const [view, id] = z.split(':'); return `${zoneLabel(id)} (${view})` }).join(', ')],
  ['requireWitness', 'Require witness', true, t => t.requireWitness, yesNo],
  ['form', 'Form', true, t => t.medication.form],
  ['route', 'Route', true, t => t.medication.route],
  ['dosage', 'Dosage', true, t => t.medication.dosage],
  ['controlCategory', 'Control category', true, t => t.medication.controlCategory],
  ['support', 'Support required', true, t => t.medication.support],
  ['prn', 'PRN', true, t => t.medication.prn, yesNo],
  ['location', 'Location', false, t => t.medication.location],
  ['allowRetry', 'Allow retry', false, t => t.allowRetry, yesNo],
  ['outcomes', 'Outcomes aided', false, t => t.outcomes, v => v.join(', ')],
  ['alerts', 'Alerts', false, t => t.alerts,
    v => [v.missed && 'Missed', v.notDone && 'Not done', v.incomplete && 'Incomplete'].filter(Boolean).join(', ')],
  ['description', 'Description', false, t => t.description],
]

const MED_ONLY = new Set(['form', 'route', 'dosage', 'controlCategory', 'support', 'prn', 'location', 'bodyZones'])

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
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
    .filter(([, , , read]) => !same(read(before), read(after)))
    .map(([key, label, clinical, read, fmt]) => ({
      key, label, clinical: clinical && med,
      before: display(fmt, read(before)),
      after: display(fmt, read(after)),
    }))
}

export function needsApproval(before, after) {
  const task = after || before
  if (!isMedication(task)) return false
  if (!before || !after) return true
  return diffTask(before, after).some(c => c.clinical)
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
