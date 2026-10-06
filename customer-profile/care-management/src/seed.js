// Seeded approval/version history for the prototype.
//
// Versions 20–29 mirror the live "Careplan Version History" modal Ben shared
// (same dates/names/sources). Each version carries a full task snapshot so
// Revert has something real to revert to — older snapshots are derived from
// the current care plan by undoing each later version's change.

import { INITIAL_TASKS } from './data'

// Prototype-only "viewing as" personas (see PersonaSwitcher).
export const PERSONAS = [
  { id: 'priya', name: 'Priya Shah', role: 'Care Manager', canApprove: true },
  { id: 'sam', name: 'Sam Patel', role: 'Care Manager', canApprove: true },
  { id: 'jane', name: 'Jane Smith', role: 'Supervisor', canApprove: false },
]

export const SOURCE_WEB = 'Web 1.206.1'

const clone = x => JSON.parse(JSON.stringify(x))
const patchTask = (tasks, id, fn) => tasks.map(t => (t.id === id ? fn(clone(t)) : t))

// v29 = live.
const v29 = clone(INITIAL_TASKS)
// v29 changed the Shoe covers description.
const v28 = patchTask(v29, 't3', t => ({ ...t, description: 'Please wear shoe covers when visiting. I have very light carpets.' }))
// v28 changed Metformin's dosage (approved — the workflow's first real use).
const v27 = patchTask(v28, 't1', t => { t.medication.dosage = '1 x 500mg tablet'; return t })
// v27 (PASSroster) moved Prepare lunch onto the lunch visit.
const v26 = patchTask(v27, 't5', t => ({ ...t, visitIds: ['morning'] }))
// v26 added Paracetamol (before the approval workflow was switched on).
const v25 = v26.filter(t => t.id !== 't4')

const metforminBefore = v27.find(t => t.id === 't1')
const metforminAfter = v28.find(t => t.id === 't1')

export const INITIAL_VERSIONS = [
  { version: 29, modifiedAt: '16/05/2026 09:59', receivedAt: '16/05/2026 09:59', employee: 'Jessica Ross', source: 'Web 1.206.1',
    summary: ['SHOE COVERS — Description'], approval: null, snapshot: v29,
    review: { saveType: 'Minor corrections / typos', reviewDate: '2026-08-26', notes: 'Clarified where the shoe covers are kept.' } },
  { version: 28, modifiedAt: '14/05/2026 18:18', receivedAt: '14/05/2026 18:18', employee: 'Adhoc Support', source: 'Web 1.206.1',
    summary: ['Metformin 500mg tablets — Dosage'], approval: { by: 'Priya Shah', at: '14/05/2026 18:42' },
    changes: [{ taskId: 't1', before: metforminBefore, after: metforminAfter }], snapshot: v28,
    review: { saveType: 'Unscheduled review', reviewDate: '2026-08-26', notes: 'GP letter 13/05 — Metformin to be taken AM only.' } },
  { version: 27, modifiedAt: '31/03/2026 13:19', receivedAt: '31/03/2026 13:19', employee: 'pass roster', source: 'PASSroster',
    summary: ['Prepare lunch — Visits'], approval: null, snapshot: v27 },
  { version: 26, modifiedAt: '24/02/2026 14:06', receivedAt: '24/02/2026 14:02', employee: 'Karin Venter', source: 'Web 1.204.3',
    summary: ['Paracetamol 500mg tablets — added'], approval: null, preWorkflow: true, snapshot: v26 },
  { version: 25, modifiedAt: '24/02/2026 13:50', receivedAt: '24/02/2026 13:47', employee: 'Karin Venter', source: 'Web 1.204.3',
    summary: ['Care plan review — no task changes'], approval: null, preWorkflow: true, snapshot: v25,
    review: { saveType: 'Scheduled review', reviewDate: '2026-05-24', notes: '' } },
  { version: 24, modifiedAt: '24/02/2026 13:47', receivedAt: '24/02/2026 13:44', employee: 'Karin Venter', source: 'Web 1.204.3',
    summary: ['Outcomes updated'], approval: null, preWorkflow: true, snapshot: v25 },
  { version: 23, modifiedAt: '29/01/2026 16:06', receivedAt: '29/01/2026 16:06', employee: 'Jessica Ross', source: 'Web 1.204.0',
    summary: ['Prepare lunch — Description'], approval: null, preWorkflow: true, snapshot: v25 },
  { version: 22, modifiedAt: '13/06/2025 16:13', receivedAt: '13/06/2025 16:13', employee: 'Jenna Killens', source: 'Web 1.194.0',
    summary: ['Rivaroxaban 15mg tablets — Location'], approval: null, preWorkflow: true, snapshot: v25 },
  { version: 21, modifiedAt: '26/03/2025 15:48', receivedAt: '26/03/2025 15:48', employee: 'Natasha Scott', source: 'Web 1.192.3',
    summary: ['Metformin 500mg tablets — added'], approval: null, preWorkflow: true, snapshot: v25 },
  { version: 20, modifiedAt: '24/03/2025 14:38', receivedAt: '24/03/2025 14:38', employee: 'pass roster', source: 'PASSroster',
    summary: ['Visits synced from PASSroster'], approval: null, preWorkflow: true, snapshot: v25 },
]

const metformin = INITIAL_TASKS.find(t => t.id === 't1')
const rivaroxaban = INITIAL_TASKS.find(t => t.id === 't2')

// Request shape (no-lock model, 2026-10-05): `kind` edit/create/delete;
// `keys` = the clinical fields it changes (only these are applied on
// approval); `contributors` = everyone who submitted or updated it, each with
// their own Care plan review answers and `step` (the fields they changed,
// from → to) — none of them can approve it.
export const INITIAL_REQUESTS = [
  {
    id: 'r1', taskId: 't1', origin: 'Edit', kind: 'edit', keys: ['dosage', 'visitIds'],
    before: metformin,
    after: { ...clone(metformin), visitIds: ['morning', 'evening'], medication: { ...metformin.medication, dosage: '1 x 500mg tablet twice daily - with breakfast and evening meal' } },
    requestedBy: 'Jane Smith', requestedAt: '30/09/2026 15:12', source: SOURCE_WEB,
    status: 'pending',
    review: { saveType: 'Unscheduled review', reviewDate: '2026-08-26', notes: 'GP letter 29/09: Metformin increased to twice daily following a high HbA1c result. Added the evening visit for the second dose.' },
  },
  {
    id: 'r2', taskId: 't2', origin: 'Edit', kind: 'edit', keys: ['visitIds'],
    before: rivaroxaban,
    after: { ...clone(rivaroxaban), visitIds: ['lunch'] },
    requestedBy: 'Sam Patel', requestedAt: '02/10/2026 09:41', source: SOURCE_WEB,
    status: 'pending',
    review: { saveType: 'Unscheduled review', reviewDate: '2026-08-26', notes: 'Pat often skips breakfast, so moving Rivaroxaban to the lunch visit when she has her main meal. Agreed with the pharmacy.' },
  },
].map(withContributor)

function withContributor(r) {
  return { ...r, contributors: [{ name: r.requestedBy, at: r.requestedAt, review: r.review, step: { before: r.before, after: r.after, keys: r.keys } }] }
}

const INITIAL_REQUESTS_DECIDED = [
  {
    id: 'r0', taskId: 't2', origin: 'Edit', kind: 'edit', keys: ['dosage'],
    before: rivaroxaban,
    after: { ...clone(rivaroxaban), medication: { ...rivaroxaban.medication, dosage: 'TWO 15mg tablets' } },
    requestedBy: 'Jane Smith', requestedAt: '15/05/2026 10:04', source: SOURCE_WEB,
    review: { saveType: 'Minor corrections / typos', reviewDate: '2026-08-26', notes: 'Dosage was wrong.' },
    status: 'rejected', decidedBy: 'Priya Shah', decidedAt: '15/05/2026 11:30',
    reason: "This doesn't match the latest GP letter (ONE 15mg tablet daily). Please check with the pharmacy before resubmitting.",
  },
].map(withContributor)
INITIAL_REQUESTS.unshift(...INITIAL_REQUESTS_DECIDED)
