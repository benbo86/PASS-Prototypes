// ─── Gross Pay Advice document customisation model ─────────────
// Mirrors customer-profile/funders/src/data.js's own invoice-customisation
// model, minus the Layout concept — a Gross Pay Advice only ever has one
// document shape (unlike invoices' Visit list/Weekly totals choice), so
// there's no layout picker here at all, just two independent checklists.
// Also, unlike per-funder invoice config, this is a single office-wide
// setting (Roster Settings → Contracts and pay), so there's no array of
// records — just one config object held directly in App.jsx's own state.
//
// Date is back to being reorderable — Ben, 2026-09-05: "Date (fixed,
// cannot be reordered or unselected)," then corrected the same round:
// "Lets make the date reorderable, my mistake." So `date` is a real entry
// in GPA_TABLE_FIELDS (positioned first by default, not pinned), carrying
// `locked: true` so CustomiseGpaModal keeps its checkbox permanently
// checked+disabled while its drag handle stays fully functional — the
// exact same shape customer-profile/funders' own Date field ended up with.
//
// Header fields are split into two groups (Ben: "split out the header
// fields, one for company details and the other employee summary which
// contains the new fields I requested") — `group` tags which section of
// CustomiseGpaModal's picker a field renders under. Kept as one flat
// array (not two separate config keys) since toggling only ever needs to
// find-and-update by key regardless of group, and it's simpler for
// defaultGpaConfig()/the draft shape to stay a single ordered list.
export const GPA_COMPANY_FIELDS = [
  { key: 'officeLogo', label: 'Office logo', group: 'company' },
  { key: 'officeName', label: 'Office name', group: 'company' },
  { key: 'companyName', label: 'Company name', group: 'company' },
  { key: 'addressLine1', label: 'Address line 1', group: 'company' },
  { key: 'addressLine2', label: 'Address line 2', group: 'company' },
  { key: 'city', label: 'City', group: 'company' },
  { key: 'county', label: 'County', group: 'company' },
  { key: 'country', label: 'Country', group: 'company' },
  { key: 'postcode', label: 'Postcode', group: 'company' },
]

export const GPA_EMPLOYEE_SUMMARY_FIELDS = [
  { key: 'totalVisits', label: 'Total visits', group: 'employeeSummary' },
  { key: 'totalWeekdayHours', label: 'Total weekday hours', group: 'employeeSummary' },
  { key: 'totalWeekendHours', label: 'Total weekend hours', group: 'employeeSummary' },
  { key: 'totalHours', label: 'Total hours', group: 'employeeSummary' },
  { key: 'totalHolidays', label: 'Total holidays', group: 'employeeSummary' },
]

export const GPA_HEADER_FIELDS = [...GPA_COMPANY_FIELDS, ...GPA_EMPLOYEE_SUMMARY_FIELDS]

export const GPA_TABLE_FIELDS = [
  { key: 'date', label: 'Date', locked: true },
  { key: 'type', label: 'Type' },
  { key: 'customer', label: 'Customer' },
  { key: 'time', label: 'Time' },
  { key: 'pay', label: 'Pay' },
  { key: 'mileage', label: 'Mileage' },
  { key: 'travel', label: 'Travel' },
]

export function defaultGpaConfig() {
  return {
    header: GPA_HEADER_FIELDS.map(f => ({ ...f, enabled: true })),
    tableFields: GPA_TABLE_FIELDS.map(f => ({ ...f, enabled: true })),
  }
}

export const fmtGBP = (n) => `£${Number(n).toFixed(2)}`

// ─── Sample GPA for the "Customise layout" preview ─────────────
// Static, hand-authored (not a deterministic-RNG generator, matching
// customer-profile/funders' own SAMPLE_PREVIEW_INVOICE reasoning — this
// only ever backs a live preview inside a modal). Deliberately includes a
// non-zero totalHolidays/totalHolidayPay so the preview demonstrates the
// one real case where summaryTotalPay and tableTotalPay genuinely diverge
// (holiday pay has no visit line item of its own).
export const SAMPLE_PREVIEW_GPA = {
  gpaRef: 'GPA-260901',
  payrollId: 'PR-20391',
  // Dummy employee — Ben: "can we use dummy content in the document rather
  // than what I supplied" (his own reference PDF named a real employee).
  // "Stephen Nicholls" matches the dummy name already established
  // elsewhere for a Gross Pay Advice example (gross-pay-advice/
  // holiday-deduction, the original recurring-expense-document EXAMPLE).
  employeeName: 'Stephen Nicholls',
  employeeRef: 'EMP-2201',
  payDate: '10/09/26',
  printDate: '10/09/26',
  start: '01/09/2026',
  end: '07/09/2026',

  totalVisits: 4,
  totalWeekdayHours: '1h 15m',
  totalWeekendHours: '3h 0m',
  totalHours: '4h 15m',
  totalHolidays: 1,

  totalPay: 58.65,
  totalMileage: 2.43,
  totalTravel: 1.90,
  totalExpenses: 14.70,
  totalHolidayPay: 45.00,
  summaryTotalPay: 122.68,
  tableTotalPay: 77.68,

  lineItems: [
    {
      date: '01/09/2026', type: 'Personal Care', customer: 'Margaret Wilson',
      timeLabel: '09:00, 30m', pay: 6.90, mileage: 0.18, travel: 0.21,
      expenses: [], totalPay: 7.29,
    },
    {
      date: '02/09/2026', type: 'Domestic', customer: 'Dorothy Hughes',
      timeLabel: '10:00, 45m', pay: 10.35, mileage: 0.53, travel: 0.42,
      expenses: [{ type: 'Mileage', amount: 4.50 }], totalPay: 15.80,
    },
    {
      date: '05/09/2026', type: 'Personal Care', customer: 'Helen Davies',
      timeLabel: '14:00, 1h', pay: 13.80, mileage: 0.39, travel: 0.21,
      expenses: [{ type: 'Parking Fee', amount: 2.00 }, { type: 'Customer Shopping', amount: 8.20 }],
      totalPay: 24.60,
    },
    {
      date: '06/09/2026', type: 'Companionship', customer: 'Frank Harrison',
      timeLabel: '16:00, 2h', pay: 27.60, mileage: 1.33, travel: 1.06,
      expenses: [], totalPay: 29.99,
    },
  ],
}
