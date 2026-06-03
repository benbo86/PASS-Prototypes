// Park-Miller LCG — deterministic, consistent across reloads
let _seed = 1234;
function rand() {
  _seed = (_seed * 16807) % 2147483647;
  return _seed / 2147483647;
}
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const between = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));
const r2 = (n) => Math.round(n * 100) / 100;

export const CUSTOMERS = [
  { id: 1,  name: 'Margaret Wilson',  funder: 'NHS South East' },
  { id: 2,  name: 'Robert Taylor',    funder: 'Southwark Council' },
  { id: 3,  name: 'Dorothy Hughes',   funder: 'NHS South East' },
  { id: 4,  name: 'Patricia Moore',   funder: 'Private' },
  { id: 5,  name: 'James Anderson',   funder: 'Southwark Council' },
  { id: 6,  name: 'Helen Davies',     funder: 'NHS South East' },
  { id: 7,  name: 'Thomas Clarke',    funder: 'Southwark Council' },
  { id: 8,  name: 'Susan Roberts',    funder: 'Private' },
  { id: 9,  name: 'Frank Harrison',   funder: 'NHS South East' },
  { id: 10, name: 'Jean Campbell',    funder: 'Southwark Council' },
];

// Derived from customer data so it stays in sync
export const FUNDERS = [...new Set(CUSTOMERS.map(c => c.funder))].sort();

export const VISIT_TYPES = ['Personal care', 'Medication', 'Domestic', 'Social support', 'Complex care'];
export const VISIT_STATUSES = ['Completed', 'Missed', 'Cancelled'];

// customerIds: the subset of customers each employee visits
// visitRange: [min, max] visits for the period
export const EMPLOYEES = [
  { id: 1,  name: 'Stephen Nicholls', contract: 'Fixed hours',    runs: 1, holiday: '2 days',  customerIds: [1, 3, 6, 9],    visitRange: [18, 22] },
  { id: 2,  name: 'David Bukowski',   contract: 'Variable hours', runs: 0, holiday: '8 hours', customerIds: [2, 5],           visitRange: [4, 6]   },
  { id: 3,  name: 'Justin Keller',    contract: 'Fixed hours',    runs: 0, holiday: '0',        customerIds: [1, 4, 8],        visitRange: [11, 15] },
  { id: 4,  name: 'Jeffrey Henry',    contract: 'Fixed hours',    runs: 0, holiday: '0',        customerIds: [3, 7, 9],        visitRange: [9, 13]  },
  { id: 5,  name: 'Anita Bradley',    contract: 'Fixed hours',    runs: 0, holiday: '0',        customerIds: [2, 6, 10],       visitRange: [13, 17] },
  { id: 6,  name: 'Kira Oswell',      contract: 'Fixed hours',    runs: 0, holiday: '0',        customerIds: [1, 5, 8],        visitRange: [14, 18] },
  { id: 7,  name: 'Amirah Marsden',   contract: 'Fixed hours',    runs: 0, holiday: '0',        customerIds: [4, 7, 9],        visitRange: [10, 14] },
  { id: 8,  name: 'Mike Fenwick',     contract: 'Fixed hours',    runs: 0, holiday: '1 day',    customerIds: [2, 3, 6],        visitRange: [12, 16] },
  { id: 9,  name: 'Alex Jones',       contract: 'Fixed hours',    runs: 0, holiday: '0',        customerIds: [5, 8],           visitRange: [5, 8]   },
  { id: 10, name: 'John Smith',       contract: 'Fixed hours',    runs: 0, holiday: '0',        customerIds: [1, 4, 7],        visitRange: [8, 12]  },
  { id: 11, name: 'Pauline Steed',    contract: 'Fixed hours',    runs: 0, holiday: '2 days',   customerIds: [3, 9, 10],       visitRange: [15, 20] },
  { id: 12, name: 'Rachel Clarke',    contract: 'Salary',         runs: 1, holiday: '1 day',    customerIds: [2, 5, 6, 8],     visitRange: [16, 22] },
  { id: 13, name: 'Tom Briggs',       contract: 'Variable hours', runs: 0, holiday: '0',        customerIds: [7, 9],           visitRange: [5, 7]   },
  { id: 14, name: 'Louise Patel',     contract: 'Fixed hours',    runs: 0, holiday: '4 hours',  customerIds: [4, 6, 10],       visitRange: [14, 18] },
];

const VISIT_NAMES = [
  'Morning care', 'Evening care', 'Afternoon visit',
  'Medication round', 'Personal hygiene', 'Social visit',
  'Night check', 'Complex care', 'Domestic support',
];

const HALF_HOURS = [
  '07:00','07:30','08:00','08:30','09:00','09:30',
  '10:00','10:30','11:00','11:30','12:00','12:30',
  '13:00','13:30','14:00','14:30','15:00','15:30',
  '16:00','16:30','17:00','17:30','18:00','18:30',
  '19:00','19:30','20:00',
];

const OCT_DATES = Array.from({ length: 31 }, (_, i) =>
  `${String(i + 1).padStart(2, '0')}/10/2024`
);

function addSlots(time, slots) {
  const idx = HALF_HOURS.indexOf(time);
  return HALF_HOURS[Math.min(idx + slots, HALF_HOURS.length - 1)];
}

let _vid = 1;
export const VISITS = EMPLOYEES.flatMap(emp => {
  const empCustomers = CUSTOMERS.filter(c => emp.customerIds.includes(c.id));
  const [lo, hi] = emp.visitRange;
  const count = between(lo, hi);
  return Array.from({ length: count }, () => {
    const customer = pick(empCustomers);
    const statusRoll = rand();
    const status = statusRoll > 0.88 ? 'Cancelled' : statusRoll > 0.78 ? 'Missed' : 'Completed';
    const startIdx = between(0, HALF_HOURS.length - 5);
    const durSlots = between(2, 4);
    const plannedStart = HALF_HOURS[startIdx];
    const plannedEnd   = HALF_HOURS[startIdx + durSlots];
    const off = between(-1, 1);
    const actualStart  = HALF_HOURS[Math.max(0, startIdx + off)];
    const actualEnd    = HALF_HOURS[Math.min(HALF_HOURS.length - 1, startIdx + durSlots + off + between(0, 1))];
    const payVerified  = false;
    const invVerified  = false;
    return {
      id: _vid++,
      employeeId:   emp.id,
      customerId:   customer.id,
      customerName: customer.name,
      funder:       customer.funder,
      visitName:    pick(VISIT_NAMES),
      visitType:    pick(VISIT_TYPES),
      date:         pick(OCT_DATES),
      plannedStart,
      plannedEnd,
      actualStart,
      actualEnd,
      status,
      mileage:     r2(rand() * 9),
      travelMins:  between(5, 50),
      waitMins:    between(0, 35),
      expenses:    rand() > 0.68 ? r2(rand() * 20) : 0,
      payVerified,
      invVerified,
      payRef:  payVerified ? `PAY-${10000 + between(0, 89999)}` : '',
      invRef:  invVerified ? `INV-${10000 + between(0, 89999)}` : '',
    };
  });
});

// Holiday records — one per day for multi-day holidays
export const HOLIDAY_RECORDS = [
  { id: 'h1', employeeId: 1,  date: 'Mon, 07/10/24', rawDate: '07/10/2024', duration: '1d', durationLabel: '1 day',   dailyRate: 120.00, hourlyRate: null,  deduction: 120.00 },
  { id: 'h2', employeeId: 1,  date: 'Tue, 08/10/24', rawDate: '08/10/2024', duration: '1d', durationLabel: '1 day',   dailyRate: 120.00, hourlyRate: null,  deduction: 120.00 },
  { id: 'h3', employeeId: 2,  date: 'Wed, 09/10/24', rawDate: '09/10/2024', duration: '8h', durationLabel: '8 hours', dailyRate: null,   hourlyRate: 15.00, deduction: 120.00 },
  { id: 'h4', employeeId: 8,  date: 'Mon, 07/10/24', rawDate: '07/10/2024', duration: '1d', durationLabel: '1 day',   dailyRate: 110.00, hourlyRate: null,  deduction: 110.00 },
  { id: 'h5', employeeId: 11, date: 'Mon, 07/10/24', rawDate: '07/10/2024', duration: '1d', durationLabel: '1 day',   dailyRate: 125.00, hourlyRate: null,  deduction: 125.00 },
  { id: 'h6', employeeId: 11, date: 'Tue, 08/10/24', rawDate: '08/10/2024', duration: '1d', durationLabel: '1 day',   dailyRate: 125.00, hourlyRate: null,  deduction: 125.00 },
  { id: 'h7', employeeId: 12, date: 'Fri, 11/10/24', rawDate: '11/10/2024', duration: '1d', durationLabel: '1 day',   dailyRate: 130.00, hourlyRate: null,  deduction: 130.00 },
  { id: 'h8', employeeId: 14, date: 'Thu, 10/10/24', rawDate: '10/10/2024', duration: '4h', durationLabel: '4 hours', dailyRate: null,   hourlyRate: 13.50, deduction:  54.00 },
];

// Helper: format total minutes as "Xh Ym"
export function fmtMins(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

// Helper: format currency
export function fmtGBP(n) {
  return `£${n.toFixed(2)}`;
}
