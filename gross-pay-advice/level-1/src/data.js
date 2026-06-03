const r2 = n => Math.round(n * 100) / 100;

const raw = [
  { id: 1,  gpaRef: 'GPA-241001', employeeId: 1,  employeeName: 'Stephen Nicholls', cycleFrom: '01/10/2024', cycleTo: '31/10/2024', visitShiftPay: 1284.50, holidayPay: 240.00, mileagePay:  38.25, status: 'Ready' },
  { id: 2,  gpaRef: 'GPA-241002', employeeId: 2,  employeeName: 'David Bukowski',   cycleFrom: '01/10/2024', cycleTo: '31/10/2024', visitShiftPay:  487.00, holidayPay: 120.00, mileagePay:  14.85, status: 'Ready' },
  { id: 3,  gpaRef: 'GPA-241003', employeeId: 3,  employeeName: 'Justin Keller',    cycleFrom: '01/10/2024', cycleTo: '31/10/2024', visitShiftPay:  976.00, holidayPay:   0.00, mileagePay:  29.70, status: 'Sent'  },
  { id: 4,  gpaRef: 'GPA-241004', employeeId: 4,  employeeName: 'Jeffrey Henry',    cycleFrom: '01/10/2024', cycleTo: '31/10/2024', visitShiftPay:  842.50, holidayPay:   0.00, mileagePay:  22.50, status: 'Ready' },
  { id: 5,  gpaRef: 'GPA-241005', employeeId: 5,  employeeName: 'Anita Bradley',    cycleFrom: '01/10/2024', cycleTo: '31/10/2024', visitShiftPay: 1143.00, holidayPay:   0.00, mileagePay:  31.50, status: 'Ready' },
  { id: 6,  gpaRef: 'GPA-241006', employeeId: 6,  employeeName: 'Kira Oswell',      cycleFrom: '01/10/2024', cycleTo: '31/10/2024', visitShiftPay: 1218.50, holidayPay:   0.00, mileagePay:  35.10, status: 'Sent'  },
  { id: 7,  gpaRef: 'GPA-241007', employeeId: 7,  employeeName: 'Amirah Marsden',   cycleFrom: '01/10/2024', cycleTo: '31/10/2024', visitShiftPay:  936.00, holidayPay:   0.00, mileagePay:  27.00, status: 'Ready' },
  { id: 8,  gpaRef: 'GPA-241008', employeeId: 8,  employeeName: 'Mike Fenwick',     cycleFrom: '01/10/2024', cycleTo: '31/10/2024', visitShiftPay: 1067.50, holidayPay: 110.00, mileagePay:  33.30, status: 'Ready' },
  { id: 9,  gpaRef: 'GPA-241009', employeeId: 9,  employeeName: 'Alex Jones',       cycleFrom: '01/10/2024', cycleTo: '31/10/2024', visitShiftPay:  563.00, holidayPay:   0.00, mileagePay:  17.55, status: 'Sent'  },
  { id: 10, gpaRef: 'GPA-241010', employeeId: 10, employeeName: 'John Smith',       cycleFrom: '01/10/2024', cycleTo: '31/10/2024', visitShiftPay:  789.50, holidayPay:   0.00, mileagePay:  24.75, status: 'Ready' },
  { id: 11, gpaRef: 'GPA-241011', employeeId: 11, employeeName: 'Pauline Steed',    cycleFrom: '01/10/2024', cycleTo: '31/10/2024', visitShiftPay: 1398.00, holidayPay: 250.00, mileagePay:  42.30, status: 'Ready' },
  { id: 12, gpaRef: 'GPA-241012', employeeId: 12, employeeName: 'Rachel Clarke',    cycleFrom: '01/10/2024', cycleTo: '31/10/2024', visitShiftPay: 1512.00, holidayPay: 130.00, mileagePay:  44.55, status: 'Sent'  },
  { id: 13, gpaRef: 'GPA-241013', employeeId: 13, employeeName: 'Tom Briggs',       cycleFrom: '01/10/2024', cycleTo: '31/10/2024', visitShiftPay:  478.50, holidayPay:   0.00, mileagePay:  13.50, status: 'Sent'  },
  { id: 14, gpaRef: 'GPA-241014', employeeId: 14, employeeName: 'Louise Patel',     cycleFrom: '01/10/2024', cycleTo: '31/10/2024', visitShiftPay: 1176.00, holidayPay:  54.00, mileagePay:  36.45, status: 'Ready' },
];

export const GPA_RECORDS = raw.map(r => ({
  ...r,
  total: r2(r.visitShiftPay + r.holidayPay + r.mileagePay),
}));

export const GPA_EMPLOYEE_NAMES = raw.map(r => r.employeeName);

export function fmtGBP(n) {
  return `£${n.toFixed(2)}`;
}

// ── Level 2 visit data ────────────────────────────────────────────────────────

const VISIT_TYPES_L2  = ['Personal care', 'Medication', 'Domestic', 'Companionship', 'Complex care'];
const VISIT_NAMES_L2  = ['Morning care', 'Evening care', 'Afternoon visit', 'Medication round', 'Personal hygiene', 'Social visit', 'Night check', 'Complex care', 'Domestic support'];
const HALF_HOURS      = ['07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00'];
const OCT_DATES       = Array.from({ length: 31 }, (_, i) => `${String(i + 1).padStart(2, '0')}/10/2024`);

const EMP_CUSTOMERS = {
  1:  ['Margaret Wilson', 'Dorothy Hughes', 'Helen Davies', 'Frank Harrison'],
  2:  ['Robert Taylor', 'James Anderson'],
  3:  ['Margaret Wilson', 'Patricia Moore', 'Susan Roberts'],
  4:  ['Dorothy Hughes', 'Thomas Clarke', 'Frank Harrison'],
  5:  ['Robert Taylor', 'Helen Davies', 'Jean Campbell'],
  6:  ['Margaret Wilson', 'James Anderson', 'Susan Roberts'],
  7:  ['Patricia Moore', 'Thomas Clarke', 'Frank Harrison'],
  8:  ['Robert Taylor', 'Dorothy Hughes', 'Helen Davies'],
  9:  ['James Anderson', 'Susan Roberts'],
  10: ['Margaret Wilson', 'Patricia Moore', 'Thomas Clarke'],
  11: ['Dorothy Hughes', 'Frank Harrison', 'Jean Campbell'],
  12: ['Robert Taylor', 'James Anderson', 'Helen Davies', 'Susan Roberts'],
  13: ['Thomas Clarke', 'Frank Harrison'],
  14: ['Patricia Moore', 'Helen Davies', 'Jean Campbell'],
};

export const HOLIDAY_RECORDS_L2 = [
  { id: 'h1', employeeId: 1,  date: '07/10/2024', duration: '1d', durationLabel: '1 day',   dailyRate: 120.00, hourlyRate: null,  deduction: 120.00 },
  { id: 'h2', employeeId: 1,  date: '08/10/2024', duration: '1d', durationLabel: '1 day',   dailyRate: 120.00, hourlyRate: null,  deduction: 120.00 },
  { id: 'h3', employeeId: 2,  date: '09/10/2024', duration: '8h', durationLabel: '8 hours', dailyRate: null,   hourlyRate: 15.00, deduction: 120.00 },
  { id: 'h4', employeeId: 8,  date: '07/10/2024', duration: '1d', durationLabel: '1 day',   dailyRate: 110.00, hourlyRate: null,  deduction: 110.00 },
  { id: 'h5', employeeId: 11, date: '07/10/2024', duration: '1d', durationLabel: '1 day',   dailyRate: 125.00, hourlyRate: null,  deduction: 125.00 },
  { id: 'h6', employeeId: 11, date: '08/10/2024', duration: '1d', durationLabel: '1 day',   dailyRate: 125.00, hourlyRate: null,  deduction: 125.00 },
  { id: 'h7', employeeId: 12, date: '11/10/2024', duration: '1d', durationLabel: '1 day',   dailyRate: 130.00, hourlyRate: null,  deduction: 130.00 },
  { id: 'h8', employeeId: 14, date: '10/10/2024', duration: '4h', durationLabel: '4 hours', dailyRate: null,   hourlyRate: 13.50, deduction:  54.00 },
];

function durToMins(dur) {
  if (dur.endsWith('d')) return parseFloat(dur) * 480;
  if (dur.endsWith('h')) return parseFloat(dur) * 60;
  return 60;
}

let _s = 5432;
function rnd() { _s = (_s * 16807) % 2147483647; return _s / 2147483647; }
const pick  = arr => arr[Math.floor(rnd() * arr.length)];
const btw   = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));

let _vid = 1;
function buildVisits() {
  const result = {};
  GPA_RECORDS.forEach(gpa => {
    const customers = EMP_CUSTOMERS[gpa.employeeId] || ['Unknown'];
    const count = btw(8, 20);
    const visits = [];

    for (let i = 0; i < count; i++) {
      const startIdx  = btw(0, HALF_HOURS.length - 6);
      const durSlots  = btw(1, 5);
      const from      = HALF_HOURS[startIdx];
      const to        = HALF_HOURS[startIdx + durSlots];
      const durHrs    = durSlots * 0.5;
      const durStr    = durHrs % 1 === 0 ? `${durHrs}h` : `${durHrs}h`;
      const sr        = rnd();
      const status    = sr > 0.88 ? 'Cancelled' : sr > 0.78 ? 'Missed' : 'Completed';
      const pay       = r2(durHrs * (35 + rnd() * 30) + 25);
      const mileage   = r2(rnd() * 4.5 + 0.5);
      visits.push({
        id: `v${_vid++}`,
        customerName: pick(customers),
        date: pick(OCT_DATES),
        visitName: pick(VISIT_NAMES_L2),
        type: pick(VISIT_TYPES_L2),
        from,
        to,
        duration: durStr,
        durationMins: durSlots * 30,
        status,
        pay,
        mileage,
        total: r2(pay + mileage),
        isHoliday: false,
      });
    }

    HOLIDAY_RECORDS_L2
      .filter(h => h.employeeId === gpa.employeeId)
      .forEach(h => {
        visits.push({
          id: h.id,
          customerName: '—',
          date: h.date,
          visitName: 'Holiday deduction',
          type: 'Holiday',
          from: '—',
          to: '—',
          duration: h.duration,
          durationMins: durToMins(h.duration),
          status: 'Completed',
          pay: h.deduction,
          mileage: 0,
          total: h.deduction,
          isHoliday: true,
          holidayRecord: h,
        });
      });

    result[gpa.id] = visits;
  });
  return result;
}

export const GPA_L2_VISITS = buildVisits();
