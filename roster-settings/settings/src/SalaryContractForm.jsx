import { useState } from 'react'
import Tooltip from '../../../Components/Tooltip'
import SegmentedToggle from '../../../Components/SegmentedToggle'
import { MILEAGE_PAID_OPTIONS, BREAK_PAY_OPTIONS, HOLIDAY_SCHEME_OPTIONS, salaryContractRow } from './salaryContract'

const InfoIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,2 C17.52,2 22,6.48 22,12 C22,17.52 17.52,22 12,22 C6.48,22 2,17.52 2,12 C2,6.48 6.48,2 12,2 Z M10.6662105,9.93690394 L10.581437,9.93690394 C10.1076337,9.93690394 9.72611507,10.3209137 9.72611507,10.7922258 C9.72611507,11.2660291 10.1101248,11.6475478 10.581437,11.6475478 L10.6662105,11.6475478 L10.6662105,16.6348056 L10.5826825,16.6348056 C10.1096134,16.6348056 9.72611507,17.0183039 9.72611507,17.491373 C9.72611507,17.9644422 10.1096134,18.3479405 10.5826825,18.3479405 L13.4173175,18.3479405 C13.8903866,18.3479405 14.2738849,17.9644422 14.2738849,17.491373 C14.2738849,17.0183039 13.8903866,16.6348056 13.4173175,16.6348056 L13.3387717,16.6348056 L13.3362805,10.936904 C13.3360752,10.3847645 12.8884201,9.93727594 12.3362806,9.93727594 L10.6662105,9.93690394 Z M11.8678197,5.65205952 C11.0006244,5.65205952 10.2992557,6.35342819 10.2992557,7.22062354 C10.2992557,8.08781889 11.0006244,8.78918756 11.8678197,8.78918756 C12.7350151,8.78918756 13.4363837,8.08781889 13.4363837,7.22062354 C13.4363837,6.35342819 12.7350151,5.65205952 11.8678197,5.65205952 Z"/>
  </svg>
)

const EditIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <polygon stroke="currentColor" strokeLinejoin="round" points="9.29090299 15.7925373 5.47272117 12.0313433 4.1999939 13.2850746 9.29090299 18.3 20.1999939 7.55373134 18.9272666 6.3"/>
  </svg>
)

const ENABLED_OPTIONS = [{ value: false, label: 'No' }, { value: true, label: 'Yes', tone: 'green' }]

const YES_NO = [{ value: true, label: 'Yes' }, { value: false, label: 'No' }]

// Tooltip copy covers the scenarios AIOP-23745 asks the info icon to explain.
const TRAVEL_TIP = (
  <div className="ct-tip">
    <p>Travel between visits counts towards the employee’s contracted hours. Travel within contracted hours and normal availability is covered by their salary.</p>
    <ul>
      <li>If a journey or visit takes total working time above contracted hours, or into optional overtime availability, only the time after that point is paid: travel at the travel time rate, visits at the overtime rate.</li>
      <li>Commute journeys don’t count towards salaried hours. If commuting is paid, it’s always paid in addition to salary.</li>
    </ul>
  </div>
)
const WAIT_TIP = (
  <div className="ct-tip">
    <p>Waiting time between visits counts towards the employee’s contracted hours, up to the maximum waiting time threshold. Wait time is not paid.</p>
  </div>
)

function RadioField({ title, desc, tip, name, options, value, onChange }) {
  return (
    <div className="ct-field">
      <h4 className="ct-field-title">
        {title}
        {tip && <Tooltip text={tip} wrapClassName="ct-tip-wrap"><InfoIcon /></Tooltip>}
      </h4>
      {desc && <p className="ct-field-desc">{desc}</p>}
      <div className="ct-radio-list">
        {options.map(opt => (
          <label className="comms-radio-option" key={String(opt.value)}>
            <input type="radio" name={name} checked={value === opt.value} onChange={() => onChange(opt.value)} />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  )
}

function RateField({ title, desc, label, value, onChange }) {
  return (
    <div className="ct-field">
      <h4 className="ct-field-title">{title}</h4>
      <p className="ct-field-desc">{desc}</p>
      <label className="ct-input-label">{label}</label>
      <input type="number" step="0.01" min="0" className="form-input ct-rate-input" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  )
}

// Salary contract-type row: read-only by default, matching the live
// product. The pencil turns the row into edit mode (Description cell becomes
// the form); the tick returns it to read-only. Changes are only committed by
// the panel's own Save.
export default function SalaryContractForm({ draft, onPatch }) {
  const [editing, setEditing] = useState(false)
  const set = key => value => onPatch({ [key]: value })
  const row = salaryContractRow(draft)

  return (
    <table className="settings-table ct-edit-table">
      <thead>
        <tr>
          <th>Contract name &amp; color</th>
          <th>Description</th>
          <th>Enabled</th>
          <th className="ct-action-col"></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div className="contract-name-cell">
              <span className="contract-swatch" style={{ background: draft.color }} />
              Salary
            </div>
          </td>
          <td className="contract-description-cell">
            {!editing ? (
              <>
                <p className="ct-readonly-desc">{row.description}</p>
                {row.detailGroups.map((group, i) => (
                  <div className="contract-detail-group" key={i}>
                    {group.map(r => (
                      <div className="contract-detail-row" key={r.label}>
                        <strong>{r.label}:</strong>
                        <span>{r.value}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </>
            ) : (
            <>
            <div className="ct-field">
              <label className="ct-input-label">Description</label>
              <textarea className="form-input ct-textarea" rows={2} value={draft.description} onChange={e => onPatch({ description: e.target.value })} />
            </div>

            <RadioField name="mileagePaid" title="What mileage will be paid?"
              desc="This determines if mileage expenses are paid to employees in addition to their contracted pay"
              options={MILEAGE_PAID_OPTIONS} value={draft.mileagePaid} onChange={set('mileagePaid')} />
            <RadioField name="mileageBreak" title="Mileage pay during a break"
              desc="How will mileage be paid when the employee is on a break and travels home between visits?"
              options={BREAK_PAY_OPTIONS} value={draft.mileageBreak} onChange={set('mileageBreak')} />
            <RateField title="Mileage rate" desc="What is the rate of pay per mile?" label="Rate per mile (£)"
              value={draft.mileageRate} onChange={set('mileageRate')} />

            <RadioField name="travelTime" title="Travel time" desc="Will travel time be paid?"
              options={MILEAGE_PAID_OPTIONS} value={draft.travelTime} onChange={set('travelTime')} />
            <RadioField name="travelBreak" title="Travel time pay during a break"
              desc="How will travel time be paid when the employee is on a break and travels home between visits?"
              options={BREAK_PAY_OPTIONS} value={draft.travelBreak} onChange={set('travelBreak')} />
            <RateField title="Travel time rate" desc="What is the rate of pay per hour?" label="Per hour (£)"
              value={draft.travelRate} onChange={set('travelRate')} />

            {/* New — AIOP-23745 */}
            <RadioField name="includeTravelInHours" title="Include travel time in salaried hours"
              desc="Count travel time between visits towards the employee’s contracted hours"
              tip={TRAVEL_TIP} options={YES_NO} value={draft.includeTravelInHours} onChange={set('includeTravelInHours')} />
            <RadioField name="includeWaitInHours" title="Include wait time in salaried hours"
              desc="Count waiting time between visits towards the employee’s contracted hours"
              tip={WAIT_TIP} options={YES_NO} value={draft.includeWaitInHours} onChange={set('includeWaitInHours')} />

            <RadioField name="overtime" title="Overtime" desc="Allow overtime availability?"
              options={YES_NO} value={draft.overtime} onChange={set('overtime')} />
            <RadioField name="expensePay" title="Expense pay"
              desc="Pay expense to employees? This determines if expenses that are added to the timesheet or GPA record can be paid to the employee. When this option is set to ‘No’ there will not be the option on the timesheet to pay an expense to the employee, and expenses will not be shown on the GPA document."
              options={YES_NO} value={draft.expensePay} onChange={set('expensePay')} />

            <div className="ct-field">
              <h4 className="ct-field-title">Holiday scheme</h4>
              <p className="ct-field-desc">Choose a holiday scheme for this contract (optional)</p>
              <label className="ct-input-label">Holiday scheme</label>
              <select className="select-input ct-select" value={draft.holidayScheme} onChange={e => onPatch({ holidayScheme: e.target.value })}>
                {HOLIDAY_SCHEME_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            </>
            )}
          </td>
          <td>
            <SegmentedToggle options={ENABLED_OPTIONS} value={draft.enabled} onChange={editing ? set('enabled') : undefined} />
          </td>
          <td className="ct-action-col">
            <button type="button" className="ct-icon-btn" title={editing ? 'Done' : 'Edit'} onClick={() => setEditing(e => !e)}>
              {editing ? <CheckIcon /> : <EditIcon />}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  )
}
