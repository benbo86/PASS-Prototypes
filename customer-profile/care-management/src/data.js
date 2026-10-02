// Mock data for the Care Management → Tasks prototype.

export const NEXT_REVIEW = '2026-08-26'

// "Select type of save" options in the live Care plan review dialog.
export const SAVE_TYPES = ['Care Plan created', 'Minor corrections / typos', 'Scheduled review', 'Unscheduled review']

export const TASK_TYPES = ['Medication', 'General']

export const OUTCOMES = [
  'Continence & Dignity Support & Assistance',
  'Maintain Adequate Dietary & Fluid intake',
  'Maintain Social Interaction',
  'Management of Medical Conditions and Medication',
  'Support with Daily Living to Remain at Home',
  'Support with Mobility while Ensuring Safety',
]

export const VISITS = [
  { id: 'morning', label: 'Morning', detail: '10:30 - 11:15, Weekly', active: true },
  { id: 'lunch', label: 'Lunch', detail: '13:00 - 13:30, Weekly', active: true },
  { id: 'evening', label: 'Evening', detail: '18:00 - 18:45, Weekly', active: true },
  { id: 'night', label: 'Night', detail: '21:00 - 21:30, Weekly', active: false },
]

export const SUPPORT_OPTIONS = ['Self-administer', 'Prompt', 'Assist', 'Administer']

export const CONTROL_CATEGORIES = ['N/A', 'Schedule 2', 'Schedule 3', 'Schedule 4', 'Schedule 5']

const MEDICATION_DEFAULTS = {
  form: '', route: '', dosage: '', controlCategory: 'N/A', location: '',
  support: 'Prompt', prn: false,
}

export function blankTask() {
  return {
    id: null,
    type: 'Medication',
    name: '',
    status: 'active',
    beginsOn: new Date().toISOString().slice(0, 10),
    endsOn: null,
    allowRetry: false,
    requireWitness: false,
    visitIds: [],
    outcomes: [],
    alerts: { missed: true, notDone: true, incomplete: true },
    bodyZones: [],
    medication: { ...MEDICATION_DEFAULTS },
    description: '',
  }
}

export const INITIAL_TASKS = [
  {
    ...blankTask(),
    id: 't1',
    name: 'Metformin 500mg tablets',
    beginsOn: '2025-03-26',
    bodyZones: ['front:zone-mouth_and_chin'],
    visitIds: ['morning'],
    outcomes: ['Management of Medical Conditions and Medication'],
    medication: {
      form: 'Tablet', route: 'Oral', dosage: '1 x 500mg tablet - AM ONLY',
      controlCategory: 'N/A', location: 'This is kept in the kitchen',
      support: 'Prompt', prn: false,
    },
    description: 'Please ensure that I take this with food or just after - AM only.  This has been prescribed to support my diabetes and ensure that my blood sugars are kept at a safe level for me.  You must witness me swallow this, never leave it for me to take later.  Please remove this from the original packaging using the clean technique into a cup provided.  I will take this with a little fresh water.  Please follow the infection control measures to include handwashing and PPE.  If I experience any side effects, they may present as: Abdominal pain; appetite decreased; diarrhoea; gastrointestinal disorder; nausea; taste altered; vitamin B12 deficiency; vomiting, if this occurs, please talk to me and contact the office team.  They will help us seek the right medical support and advice.',
  },
  {
    ...blankTask(),
    id: 't2',
    name: 'Rivaroxaban 15mg tablets **MUST BE TAKEN WITH FOOD**',
    beginsOn: '2024-04-26',
    visitIds: ['morning'],
    outcomes: ['Management of Medical Conditions and Medication'],
    medication: {
      form: 'Tablet', route: 'Orally', dosage: 'ONE 15mg tablet',
      controlCategory: 'N/A', location: 'Blister pack, kitchen cupboard',
      support: 'Prompt', prn: false,
    },
    description: "Please prompt me to take ONE 15mg tablet if I haven't already done so. **It must be taken with food** This is an anticoagulant to reduce my risk of blood clots. Please let the office know if you notice any unusual bruising or bleeding.",
  },
  {
    ...blankTask(),
    id: 't3',
    type: 'General',
    name: 'SHOE COVERS',
    beginsOn: '2024-04-30',
    visitIds: ['morning'],
    outcomes: [],
    description: 'Please wear shoes covers when visiting. I have very light carpets and like to maintain the level of cleanliness in my home. Shoe covers are kept in the basket by the front door.',
  },
  {
    ...blankTask(),
    id: 't4',
    name: 'Paracetamol 500mg tablets',
    beginsOn: '2025-01-14',
    visitIds: ['lunch', 'evening'],
    outcomes: ['Management of Medical Conditions and Medication'],
    medication: {
      form: 'Tablet', route: 'Oral', dosage: '2 x 500mg tablets when required',
      controlCategory: 'N/A', location: 'Bathroom cabinet',
      support: 'Assist', prn: true,
    },
    description: 'Please offer me two tablets if I tell you I am in pain. Do not give more than 8 tablets in 24 hours and leave at least 4 hours between doses. Record the time given on my MAR chart.',
  },
  {
    ...blankTask(),
    id: 't5',
    type: 'General',
    name: 'Prepare lunch',
    beginsOn: '2024-04-30',
    visitIds: ['lunch'],
    outcomes: ['Maintain Adequate Dietary & Fluid intake'],
    description: 'Please help me prepare a light lunch of my choosing and make sure I have a drink within reach before you leave.',
  },
  {
    ...blankTask(),
    id: 't6',
    name: 'Amlodipine 5mg tablets',
    status: 'inactive',
    beginsOn: '2023-06-01',
    endsOn: '2024-02-12',
    visitIds: ['morning'],
    outcomes: ['Management of Medical Conditions and Medication'],
    medication: {
      form: 'Tablet', route: 'Oral', dosage: 'ONE 5mg tablet',
      controlCategory: 'N/A', location: 'Kitchen',
      support: 'Prompt', prn: false,
    },
    description: 'Stopped by GP February 2024. Please prompt me to take one tablet each morning.',
  },
]

let idCounter = 100
export const nextTaskId = () => `t${++idCounter}`

export const fmtDate = (iso) => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

// The chips shown under a task's description on the list card.
export function taskTags(task) {
  if (task.type !== 'Medication') return []
  const m = task.medication
  return [m.support, m.dosage, m.form, m.route, m.prn && 'PRN'].filter(Boolean)
}
