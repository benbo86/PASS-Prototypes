// Seed data for the Service Agreement prototype — scoped to one customer
// (Mrs Patricia 'Pat' Allin, matching Components/CustomerProfileNav.jsx's
// own hardcoded context bar, so this page reads as the same person every
// other customer-profile prototype shows).

export const CUSTOMER_NAME = 'Patricia Allin'

export const CARE_TYPES = ['Home Care', 'Personal Care', 'Complex Care', 'Live-in Care', 'Respite Care']

// A self-payer's own funder is themselves — same established convention as
// the Funders timesheet view (AIOP-23432): "Private" isn't a real funder,
// it's a funder *type*.
export const FUNDERS = ['Patricia Allin', 'Southwark Council', 'NHS South East']

export const CHARGE_RATE_SHEETS = ['Private 2026', 'Southwark Council 2026', 'NHS South East 2026']
export const PAY_RATE_SHEETS = ['Standard Pay 2026', 'Weekend Enhanced 2026', 'Bank Holiday 2026']

export const EXPENSE_TYPES = ['Customer Shopping', 'Mileage', 'Parking Fee']

export const CARE_WORKERS = [
  { id: 1, name: 'Amirah Marsden' },
  { id: 2, name: 'Sarah Mitchell' },
  { id: 3, name: 'James Okafor' },
  { id: 4, name: 'David Chen' },
  { id: 5, name: 'Linda Peters' },
  { id: 6, name: 'Tom Harris' },
  { id: 7, name: 'Emma Richardson' },
  { id: 8, name: 'Stephen Nicholls' },
]

// Half-hour slots, 06:00–22:00 — same shape as timesheets/filters' own
// HALF_HOURS array, just a fuller day range (care visits run earlier/later).
export const HALF_HOURS = Array.from({ length: 33 }, (_, i) => {
  const totalMins = 6 * 60 + i * 30
  const h = Math.floor(totalMins / 60)
  const m = totalMins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
})

export const CADENCE_OPTIONS = ['Daily', 'Weekly', 'Bi-weekly', 'Custom']

export const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function fmtGBP(n) {
  return `£${Number(n).toFixed(2)}`
}

export function fmtDate(d) {
  if (!d) return null
  const dt = new Date(d)
  return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`
}

// Adds a duration (hours/minutes) to a "HH:mm" start time, returning "HH:mm".
// Simple prototype-grade math — doesn't need to handle day rollover.
export function addDuration(startTime, hours, minutes) {
  const [h, m] = startTime.split(':').map(Number)
  const total = h * 60 + m + hours * 60 + minutes
  const eh = Math.floor(total / 60) % 24
  const em = total % 60
  return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`
}

export function fmtDuration(hours, minutes) {
  const parts = []
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`)
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`)
  return parts.length ? parts.join(' ') : '0 minutes'
}

let _vid = 1
export const INITIAL_VISITS = [
  {
    id: _vid++,
    title: 'Personal care',
    startDate: new Date(2026, 2, 11),   // 11/03/2026
    endDate: new Date(2026, 5, 24),     // 24/06/2026
    careType: 'Home Care',
    startTime: '09:30',
    durationHours: 1,
    durationMinutes: 0,
    careWorkers: 1,
    preferredCareWorkerIds: [],
    cadence: 'Weekly',
    cadenceDays: [true, false, true, true, false, false, false], // M W T
    funder: 'Patricia Allin',
    chargeRateSheet: 'Private 2026',
    depositPaid: false,
    payRateSheet: null,
    status: 'active',
    recurringExpenses: [],
  },
  {
    id: _vid++,
    title: 'Personal care',
    startDate: new Date(2026, 5, 25),   // 25/06/2026
    endDate: null,                       // Ongoing
    careType: 'Home Care',
    startTime: '09:30',
    durationHours: 0,
    durationMinutes: 45,
    careWorkers: 1,
    preferredCareWorkerIds: [],
    cadence: 'Weekly',
    cadenceDays: [true, false, true, true, false, false, false], // M W T
    funder: 'Patricia Allin',
    chargeRateSheet: 'Private 2026',
    depositPaid: false,
    payRateSheet: null,
    status: 'active',
    recurringExpenses: [],
  },
]

export function nextVisitId() { return _vid++ }
