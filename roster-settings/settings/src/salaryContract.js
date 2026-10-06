// Salary contract type — the one contract type editable in the Contracts and
// pay panel. Only Salary is shown there because the two "salaried hours"
// settings (AIOP-23745) only apply to it.
//
// Field options mirror the live product's contract-type edit form.

export const MILEAGE_PAID_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'between', label: 'Travel between visits' },
  { value: 'commuting', label: 'Commuting and travel between visits' },
]

export const BREAK_PAY_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'both', label: 'From the last visit to home and from home to the next visit' },
  { value: 'toHome', label: 'From last visit to home' },
  { value: 'fromHome', label: 'From home to the next visit' },
]

export const HOLIDAY_SCHEME_OPTIONS = ['-', '3.5 Days Flex', '5 Days Full Time']

export const INITIAL_SALARY_CONTRACT = {
  color: '#f2f2f4',
  enabled: true,
  description: 'Full-time salaried staff, paid based on contracted hours',
  mileagePaid: 'between',
  mileageBreak: 'none',
  mileageRate: '0.35',
  travelTime: 'between',
  travelBreak: 'none',
  travelRate: '12.21',
  // New (AIOP-23745) — both default off.
  includeTravelInHours: false,
  includeWaitInHours: false,
  overtime: true,
  expensePay: true,
  holidayScheme: '-',
}

const labelOf = (options, value) => options.find(o => o.value === value)?.label ?? value
const yesNo = b => (b ? 'Yes' : 'No')
const money = v => `£${Number(v || 0).toFixed(2)}`

// Read-only shape for the Contract types table (same detailGroups shape the
// Fixed/Variable rows use).
export function salaryContractRow(c) {
  return {
    name: 'Salary',
    color: c.color,
    description: c.description,
    enabled: c.enabled,
    detailGroups: [
      [
        { label: 'What mileage will be paid?', value: labelOf(MILEAGE_PAID_OPTIONS, c.mileagePaid) },
        { label: 'Mileage pay during a break', value: labelOf(BREAK_PAY_OPTIONS, c.mileageBreak) },
        { label: 'Mileage rate', value: `${money(c.mileageRate)} per mile` },
      ],
      [
        { label: 'Travel time', value: labelOf(MILEAGE_PAID_OPTIONS, c.travelTime) },
        { label: 'Travel time pay during a break', value: labelOf(BREAK_PAY_OPTIONS, c.travelBreak) },
        { label: 'Travel time rate', value: `${money(c.travelRate)} per hour` },
      ],
      [
        { label: 'Include travel time in salaried hours', value: yesNo(c.includeTravelInHours) },
        { label: 'Include wait time in salaried hours', value: yesNo(c.includeWaitInHours) },
      ],
      [{ label: 'Overtime', value: yesNo(c.overtime) }],
      [{ label: 'Expense pay', value: yesNo(c.expensePay) }],
      [{ label: 'Holiday scheme', value: c.holidayScheme === '-' ? 'n/a' : c.holidayScheme }],
    ],
  }
}
