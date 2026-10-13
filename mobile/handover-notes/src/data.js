// ─── ET-66 — Handover notes (previous carer → next carer) ─────────
// Same customer as Tag In/Out, so the two prototypes read as one flow.
// Stephen has two visits today: finishing the afternoon one (and leaving a
// handover note) makes the note appear on the evening one.
import { CUSTOMER, TASKS } from '../../tag-in-out/src/data'

// The carer who leaves the note on the afternoon visit. Adrianna is the
// app's signed-in carer (Components/AccountScreen.jsx), so she's writing a
// note to her own evening visit: unusual, but a carer might leave herself
// a reminder.
export const WRITER = { name: 'Adrianna Janowski' }

export const VISITS = {
  afternoon: {
    key: 'afternoon',
    ...CUSTOMER, // Afternoon visit, 16:00 – 17:00
    tasks: TASKS,
  },
  evening: {
    key: 'evening',
    ...CUSTOMER,
    visitType: 'Evening visit',
    time: '19:00 – 19:30 (30m)',
    tasks: [
      { key: 'meal', label: 'Prepare evening meal', time: '19:00', type: 'other', status: 'pending' },
      { key: 'meds', label: 'Metformin 500mg tablets', time: '19:00', type: 'medication', status: 'pending' },
      { key: 'bed', label: 'Help to get ready for bed', time: '19:20', type: 'other', status: 'pending' },
    ],
  },
}

// Which visit's handover note is shown on which visit.
export const NEXT_VISIT_KEY = { afternoon: 'evening' }

// Filler bookings around Stephen's two visits. Not tappable.
export const FILLER_BOOKINGS = [
  {
    key: 'filler-1',
    time: '09:00 – 09:30 (30m)',
    visitType: 'Morning tea visit',
    customerName: 'Hilary Buxton',
    address: '22 Dunlop Street, Farnham, GU23 4EE',
    highRisk: false,
    legalFlags: [],
    status: 'complete',
  },
  {
    key: 'filler-2',
    time: '20:00 – 20:30 (30m)',
    visitType: 'Companionship visit',
    customerName: 'Lily Finch',
    address: '22 Dunlop Street, Farnham, GU23 4EE',
    highRisk: false,
    legalFlags: [],
    status: 'pending',
  },
]
