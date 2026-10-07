// Salaried GPA with "Include travel time" + "Include wait time in salaried
// hours" enabled (AIOP-23746). Weekly pay period, so contracted hours map
// straight onto the period (the monthly/fortnightly case is still undefined
// on the ticket).
//
// Working time builds up in time order: travel between visits, then wait
// (capped), then the visit. Everything up to contracted hours is covered by
// salary (£0 on the GPA). Once the threshold is crossed:
//   - visits are paid at the overtime rate
//   - travel between visits is paid at the travel rate
//   - wait still counts as working time but is unpaid
// The line the threshold falls in is paid only for the part above it.
//
// The commute (first journey of the day) isn't working time, and this
// contract only pays travel between visits, so it's never paid here.
// A gap longer than the break threshold is a rest break: the journey after
// it gets no travel time or mileage, and the gap doesn't count as working time.

const r2 = n => Math.round(n * 100) / 100

export const EMPLOYEE = {
  name: 'Sophie Turner',
  contract: 'Salaried — Domiciliary',
  gpaRef: 'GPA-260928-07',
  cycleFrom: '28/09/2026',
  cycleTo: '04/10/2026',
  status: 'Ready',
}

export const CONTRACT = {
  contractedMins: 30 * 60,
  overtimeRate: 16.5,   // £/hr, from the visit type's rate
  travelRate: 12.71,    // £/hr, from the contract
  maxWaitMins: 30,      // "Maximum waiting time threshold"
  breakThresholdMins: 120, // gap longer than this = rest break, nothing counts
}

// [date, from, to, customer, visit name, type, travel mins from previous visit, mileage £]
const BASE_SCHEDULE = [
  ['28/09/2026', '07:30', '08:30', 'Margaret Wilson', 'Morning care',     'Personal care', 0,  0],
  ['28/09/2026', '08:45', '09:30', 'Dorothy Hughes',  'Medication round', 'Medication',    10, 1.35],
  ['28/09/2026', '09:45', '11:15', 'Helen Davies',    'Personal hygiene', 'Personal care', 15, 2.25],
  ['28/09/2026', '11:30', '12:30', 'Frank Harrison',  'Domestic support', 'Domestic',      10, 1.80],
  ['28/09/2026', '15:00', '16:00', 'Jean Campbell',   'Social visit',     'Companionship', 20, 3.15],

  ['29/09/2026', '07:30', '08:30', 'Margaret Wilson', 'Morning care',     'Personal care', 0,  0],
  ['29/09/2026', '08:50', '09:35', 'Dorothy Hughes',  'Medication round', 'Medication',    10, 1.35],
  ['29/09/2026', '09:45', '11:15', 'Robert Taylor',   'Complex care',     'Complex care',  10, 1.80],
  ['29/09/2026', '11:30', '12:15', 'Helen Davies',    'Afternoon visit',  'Personal care', 15, 2.25],
  ['29/09/2026', '12:30', '13:30', 'Frank Harrison',  'Domestic support', 'Domestic',      10, 1.80],

  ['30/09/2026', '07:30', '08:30', 'Margaret Wilson', 'Morning care',     'Personal care', 0,  0],
  ['30/09/2026', '08:45', '09:30', 'Dorothy Hughes',  'Medication round', 'Medication',    10, 1.35],
  ['30/09/2026', '09:45', '11:15', 'Helen Davies',    'Personal hygiene', 'Personal care', 10, 1.80],
  ['30/09/2026', '11:30', '12:30', 'Jean Campbell',   'Social visit',     'Companionship', 15, 2.25],
  ['30/09/2026', '12:45', '13:45', 'Frank Harrison',  'Domestic support', 'Domestic',      10, 1.80],

  ['01/10/2026', '07:30', '08:30', 'Margaret Wilson', 'Morning care',     'Personal care', 0,  0],
  ['01/10/2026', '08:45', '09:30', 'Dorothy Hughes',  'Medication round', 'Medication',    10, 1.35],
  ['01/10/2026', '09:45', '11:15', 'Robert Taylor',   'Complex care',     'Complex care',  10, 1.80],
  ['01/10/2026', '11:30', '12:30', 'Helen Davies',    'Afternoon visit',  'Personal care', 15, 2.25],
  ['01/10/2026', '17:00', '18:00', 'Jean Campbell',   'Evening care',     'Personal care', 20, 3.15],

  ['02/10/2026', '07:30', '08:30', 'Margaret Wilson', 'Morning care',     'Personal care', 0,  0],
  ['02/10/2026', '08:45', '09:30', 'Dorothy Hughes',  'Medication round', 'Medication',    10, 1.35],
  ['02/10/2026', '09:45', '11:15', 'Helen Davies',    'Personal hygiene', 'Personal care', 10, 1.80],
  ['02/10/2026', '11:30', '12:30', 'Frank Harrison',  'Domestic support', 'Domestic',      15, 2.25],
  ['02/10/2026', '12:45', '13:45', 'Jean Campbell',   'Social visit',     'Companionship', 10, 1.80],
  ['02/10/2026', '14:00', '15:00', 'Robert Taylor',   'Complex care',     'Complex care',  10, 1.80],

  ['03/10/2026', '08:00', '09:00', 'Margaret Wilson', 'Morning care',     'Personal care', 0,  0],
  ['03/10/2026', '09:15', '10:00', 'Dorothy Hughes',  'Medication round', 'Medication',    15, 2.25],
]

// Two prototype scenarios — a real period only crosses the threshold once.
// They differ only on Friday afternoon: in 'travel' the Social visit is
// shorter and the journey to the next visit longer, so contracted hours run
// out part way through that journey instead of during the visit.
const FRIDAY_TRAVEL = [
  ['02/10/2026', '12:45', '13:05', 'Jean Campbell',   'Social visit',     'Companionship', 10, 1.80],
  ['02/10/2026', '13:30', '14:30', 'Robert Taylor',   'Complex care',     'Complex care',  20, 3.15],
]
const isFridayPm = row => row[0] === '02/10/2026' && row[1] >= '12:45' && row[1] <= '14:00'

export const SCENARIOS = {
  visit: { label: 'During a visit', schedule: BASE_SCHEDULE },
  travel: {
    label: 'During travel between visits',
    schedule: [
      ...BASE_SCHEDULE.slice(0, BASE_SCHEDULE.findIndex(isFridayPm)),
      ...FRIDAY_TRAVEL,
      ...BASE_SCHEDULE.slice(BASE_SCHEDULE.findIndex(isFridayPm) + 2),
    ],
  },
}

const toMins = hhmm => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m }
const toHHMM = mins => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`

export const fmtDur = mins => {
  const h = Math.floor(mins / 60), m = mins % 60
  if (!h) return `${m}m`
  return m ? `${h}h ${String(m).padStart(2, '0')}m` : `${h}h`
}

export const fmtGBP = n => `£${n.toFixed(2)}`

function buildRows(schedule) {
  const { contractedMins, overtimeRate, travelRate, maxWaitMins, breakThresholdMins } = CONTRACT
  let worked = 0
  let prev = null

  return schedule.map(([date, from, to, customerName, visitName, type, travel, mileage], i) => {
    const start = toMins(from), end = toMins(to)
    const visitMins = end - start
    const sameDay = prev && prev.date === date
    const gap = sameDay ? start - prev.end : null
    const isBreak = sameDay && gap > breakThresholdMins

    // Only travel/wait between visits (not the commute, not across a rest break) counts.
    const travelMins = sameDay && !isBreak ? travel : 0
    // Same for mileage: nothing is paid for the journey after a rest break
    // ("Mileage pay during a break: None" on this contract).
    const paidMileage = isBreak ? 0 : mileage
    const waitMins = sameDay && !isBreak ? Math.min(Math.max(gap - travel, 0), maxWaitMins) : 0

    // Paid minutes = the part of each segment that sits above contracted hours.
    const above = mins => {
      const before = worked
      worked += mins
      return Math.max(0, worked - Math.max(before, contractedMins))
    }
    const startedBelow = worked < contractedMins
    const travelStartWorked = worked
    const paidTravelMins = above(travelMins)
    above(waitMins) // counts towards working time, never paid
    const visitStartWorked = worked
    const paidVisitMins = above(visitMins)

    // The threshold falls inside this visit: some of it is covered by salary.
    let partial = null
    if (paidVisitMins > 0 && paidVisitMins < visitMins) {
      partial = {
        kind: 'visit',
        paidMins: paidVisitMins,
        coveredMins: visitMins - paidVisitMins,
        reachedAt: toHHMM(start + (contractedMins - visitStartWorked)),
      }
    } else if (paidTravelMins > 0 && paidTravelMins < travelMins) {
      partial = {
        kind: 'travel',
        paidMins: paidTravelMins,
        coveredMins: travelMins - paidTravelMins,
        reachedAt: toHHMM(prev.end + (contractedMins - travelStartWorked)),
      }
    }

    const pay = r2((paidVisitMins / 60) * overtimeRate)
    const travelPay = r2((paidTravelMins / 60) * travelRate)
    prev = { date, end }

    return {
      id: `v${i + 1}`,
      customerName, date, visitName, type, from, to,
      duration: fmtDur(visitMins), durationMins: visitMins,
      status: 'Completed',
      travelMins, waitMins, paidVisitMins, paidTravelMins,
      pay, mileage: paidMileage, travelPay,
      total: r2(pay + paidMileage + travelPay),
      workedAfter: worked,
      salaried: startedBelow && paidVisitMins === 0 && paidTravelMins === 0,
      partial,
    }
  })
}

export function buildGpa(scenario) {
  const rows = buildRows(SCENARIOS[scenario].schedule)
  return {
    rows,
    workedMins: rows[rows.length - 1].workedAfter,
    pay: r2(rows.reduce((sum, r) => sum + r.total, 0)),
  }
}
