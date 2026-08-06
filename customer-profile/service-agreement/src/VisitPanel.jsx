import { useState, useEffect, forwardRef } from 'react'
import DatePicker from 'react-datepicker'
import SlidePanel from '../../../Components/SlidePanel'
import NumberStepper from '../../../Components/NumberStepper'
import SearchMultiSelect from '../../../Components/SearchMultiSelect'
import {
  CARE_TYPES, FUNDERS, CHARGE_RATE_SHEETS, PAY_RATE_SHEETS, CARE_WORKERS,
  HALF_HOURS, CADENCE_OPTIONS, EXPENSE_TYPES,
} from './data'

// ─── Icons ────────────────────────────────────────────────────

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
)

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" /><path d="M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
  </svg>
)

const DateInput = forwardRef(({ value, onClick, placeholder }, ref) => (
  <div className="input-wrap">
    <input ref={ref} type="text" className="form-input" value={value || ''} onClick={onClick} onChange={() => {}} readOnly placeholder={placeholder} />
    <span className="input-icon" onClick={onClick}><CalendarIcon /></span>
  </div>
))
DateInput.displayName = 'DateInput'

// ─── Empty visit (add mode) ────────────────────────────────────

function emptyVisit() {
  return {
    id: null,
    title: '',
    startDate: new Date(),
    endDate: null,
    careType: CARE_TYPES[0],
    startTime: '09:00',
    durationHours: 1,
    durationMinutes: 0,
    careWorkers: 1,
    preferredCareWorkerIds: [],
    cadence: 'Daily',
    cadenceDays: [false, false, false, false, false, false, false],
    funder: FUNDERS[0],
    chargeRateSheet: CHARGE_RATE_SHEETS[0],
    depositPaid: false,
    payRateSheet: null,
    status: 'active',
    recurringExpense: null,
  }
}

// ─── Panel ──────────────────────────────────────────────────────

export default function VisitPanel({ open, visit, onClose, onSave }) {
  const [pending, setPending] = useState(emptyVisit())
  const [hasExpense, setHasExpense] = useState(false)

  // VisitPanel never unmounts (SlidePanel just returns null while closed),
  // so the pending copy has to be (re)seeded here rather than at mount —
  // same reasoning as roster/contactable-staff's own openPanel(), just as
  // an effect since open/visit are controlled by the parent.
  useEffect(() => {
    if (open) {
      setPending(visit ? { ...visit } : emptyVisit())
      setHasExpense(!!(visit && visit.recurringExpense))
    }
  }, [open, visit])

  const update = (key, value) => setPending(prev => ({ ...prev, [key]: value }))

  const handleExpenseToggle = (checked) => {
    setHasExpense(checked)
    update('recurringExpense', checked
      ? (pending.recurringExpense || { title: EXPENSE_TYPES[0], amount: 0, payEmployee: false, chargeFunder: false })
      : null)
  }

  const updateExpense = (key, value) =>
    update('recurringExpense', { ...pending.recurringExpense, [key]: value })

  // Live-truncates to a maximum of 2 decimal places as the user types —
  // `step="0.01"` alone only affects the up/down arrows, not what can be
  // typed, so "12.345" would otherwise be accepted as-is.
  const updateExpenseAmount = (raw) => {
    const match = raw.match(/^\d*\.?\d{0,2}/)
    updateExpense('amount', match ? match[0] : '')
  }

  const handleSave = () => {
    const finalExpense = hasExpense && pending.recurringExpense
      ? { ...pending.recurringExpense, amount: Number(pending.recurringExpense.amount) || 0 }
      : null
    onSave({ ...pending, recurringExpense: finalExpense })
  }

  const expense = pending.recurringExpense || { title: EXPENSE_TYPES[0], amount: 0, payEmployee: false, chargeFunder: false }

  return (
    <SlidePanel
      open={open}
      onClose={onClose}
      title={visit ? `Edit visit - ${pending.title}` : 'Add new visit'}
      footer={
        <>
          <button className="round-btn tertiary-btn" onClick={onClose}>Cancel</button>
          <button className="round-btn primary-btn" onClick={handleSave}>Save</button>
        </>
      }
    >
      <div className="sa-form-fields">
      <h2 className="sa-section-title">Visit details</h2>

      {/* 1. Visit title */}
      <div className="sa-field-group">
        <label className="sa-field-label">Visit title <span className="sa-required">*</span></label>
        <input className="form-input" type="text" value={pending.title} onChange={e => update('title', e.target.value)} />
      </div>

      {/* 2. Start date / End date */}
      <div className="sa-field-group">
        <div className="sa-date-row">
          <div>
            <label className="sa-field-label">Start date <span className="sa-required">*</span></label>
            <DatePicker
              selected={pending.startDate}
              onChange={d => update('startDate', d)}
              dateFormat="dd/MM/yyyy"
              customInput={<DateInput />}
            />
          </div>
          <div>
            <label className="sa-field-label">End date <span className="sa-required">*</span></label>
            <DatePicker
              selected={pending.endDate}
              onChange={d => update('endDate', d)}
              dateFormat="dd/MM/yyyy"
              customInput={<DateInput placeholder="Ongoing" />}
              isClearable
            />
          </div>
        </div>
      </div>

      {/* 3. Care type */}
      <div className="sa-field-group">
        <label className="sa-field-label">Care type <span className="sa-required">*</span></label>
        <select className="select-input" value={pending.careType} onChange={e => update('careType', e.target.value)}>
          {CARE_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* 4. Start time / Duration */}
      <div className="sa-field-group">
        <div className="sa-date-row">
          <div>
            <label className="sa-field-label">Start time <span className="sa-required">*</span></label>
            <select className="select-input" value={pending.startTime} onChange={e => update('startTime', e.target.value)}>
              {HALF_HOURS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="sa-field-label">Duration <span className="sa-required">*</span></label>
            <div className="sa-duration-row">
              <div className="sa-duration-field">
                <input
                  className="form-input" type="number" min="0"
                  value={pending.durationHours}
                  onChange={e => update('durationHours', Math.max(0, Number(e.target.value) || 0))}
                />
                <span className="sa-duration-suffix">hr</span>
              </div>
              <div className="sa-duration-field">
                <input
                  className="form-input" type="number" min="0" max="59"
                  value={pending.durationMinutes}
                  onChange={e => update('durationMinutes', Math.min(59, Math.max(0, Number(e.target.value) || 0)))}
                />
                <span className="sa-duration-suffix">min</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Care workers */}
      <div className="sa-field-group">
        <label className="sa-field-label">Care workers <span className="sa-required">*</span></label>
        <NumberStepper value={pending.careWorkers} onChange={n => update('careWorkers', n)} min={1} max={6} />
      </div>

      {/* 6. Preferred care workers */}
      <div className="sa-field-group">
        <label className="sa-field-label">Preferred care workers</label>
        <SearchMultiSelect
          items={CARE_WORKERS}
          selected={pending.preferredCareWorkerIds}
          onChange={ids => update('preferredCareWorkerIds', ids)}
          placeholder="Search care workers..."
        />
      </div>

      {/* 7. Cadence */}
      <div className="sa-field-group">
        <label className="sa-field-label">Cadence <span className="sa-required">*</span></label>
        <div className="sa-radio-row">
          {CADENCE_OPTIONS.map(opt => (
            <label key={opt} className="fd-radio-row">
              <input type="radio" className="form-radio" name="sa-cadence" checked={pending.cadence === opt} onChange={() => update('cadence', opt)} />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      </div>

      <h2 className="sa-section-title">Charge details</h2>

      {/* 8. Funder */}
      <div className="sa-field-group">
        <label className="sa-field-label">Funder <span className="sa-required">*</span></label>
        <div className="sa-radio-row">
          {FUNDERS.map(f => (
            <label key={f} className="fd-radio-row">
              <input type="radio" className="form-radio" name="sa-funder" checked={pending.funder === f} onChange={() => update('funder', f)} />
              <span>{f}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 9. Charge rate sheet */}
      <div className="sa-field-group">
        <label className="sa-field-label">Charge rate sheet <span className="sa-required">*</span></label>
        <select className="select-input" value={pending.chargeRateSheet} onChange={e => update('chargeRateSheet', e.target.value)}>
          {CHARGE_RATE_SHEETS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* 10. Deposit */}
      <div className="sa-field-group">
        <label className="sa-field-label">Deposit</label>
        <label className="checkbox-wrap">
          <input type="checkbox" checked={pending.depositPaid} onChange={e => update('depositPaid', e.target.checked)} />
          <span className="checkbox-box" />
          <span>Paid</span>
        </label>
      </div>

      {/* Recurring expense — part of Charge details, after Deposit */}
      <div className="sa-field-group">
        <label className="sa-field-label">Recurring expense</label>
        <label className="checkbox-wrap">
          <input type="checkbox" checked={hasExpense} onChange={e => handleExpenseToggle(e.target.checked)} />
          <span className="checkbox-box" />
          <span>Add recurring expense</span>
        </label>
      </div>

      {hasExpense && (
        <div className="calc-card sa-expense-card">
          <div className="sa-expense-header">
            <span className="sa-expense-title">Recurring expense</span>
            <button
              type="button" className="sa-expense-delete-btn"
              onClick={() => handleExpenseToggle(false)}
              aria-label="Delete recurring expense" title="Delete recurring expense"
            >
              <TrashIcon />
            </button>
          </div>

          <div className="sa-field-group">
            <label className="sa-field-label">Expense type</label>
            <select className="select-input" value={expense.title} onChange={e => updateExpense('title', e.target.value)}>
              {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="sa-field-group">
            <label className="sa-field-label">Amount (£)</label>
            <div className="sa-amount-wrap">
              <span className="sa-amount-prefix">£</span>
              <input
                className="form-input sa-amount-input" type="number" step="0.01" min="0"
                value={expense.amount} onChange={e => updateExpenseAmount(e.target.value)}
              />
            </div>
          </div>

          <label className="checkbox-wrap">
            <input type="checkbox" checked={expense.payEmployee} onChange={e => updateExpense('payEmployee', e.target.checked)} />
            <span className="checkbox-box" />
            <span>Pay employee</span>
          </label>
          <label className="checkbox-wrap sa-expense-checkbox-second">
            <input type="checkbox" checked={expense.chargeFunder} onChange={e => updateExpense('chargeFunder', e.target.checked)} />
            <span className="checkbox-box" />
            <span>Charge funder</span>
          </label>
        </div>
      )}

      <h2 className="sa-section-title">Pay details</h2>

      {/* 11. Pay rate sheet */}
      <div className="sa-field-group">
        <label className="sa-field-label">Pay rate sheet (optional)</label>
        <select className="select-input" value={pending.payRateSheet || ''} onChange={e => update('payRateSheet', e.target.value || null)}>
          <option value="">—</option>
          {PAY_RATE_SHEETS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      </div>
    </SlidePanel>
  )
}
