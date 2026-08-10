import { useState } from 'react'
import { EXPENSE_TYPES, makeExpense } from './data'

const PenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
)
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
)
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z" />
  </svg>
)
const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.4c-3.3 0-9.8 1.6-9.8 4.9v2.5h19.6v-2.5c0-3.3-6.5-4.9-9.8-4.9z" />
  </svg>
)

const emptyDraft = () => ({ type: '', amount: '', note: '', payEmployee: false, chargeFunder: false })

function ExpenseForm({ draft, onChange, onConfirm, onCancel }) {
  const canConfirm = draft.type && Number(draft.amount) > 0 && (draft.payEmployee || draft.chargeFunder)
  return (
    <div className="ve-form">
      <div className="ve-form-row">
        <div className="ve-field">
          <label className="ve-label">* Expense type</label>
          <select className="select-input" value={draft.type} onChange={e => onChange({ ...draft, type: e.target.value })}>
            <option value="" disabled>Select</option>
            {EXPENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="ve-field">
          <label className="ve-label">* Amount (£)</label>
          <input
            className="form-input" type="number" step="0.01" min="0"
            value={draft.amount} onChange={e => onChange({ ...draft, amount: e.target.value })}
          />
        </div>
        <div className="ve-field ve-field-note">
          <label className="ve-label">Note</label>
          <textarea
            className="form-input ve-note-input" placeholder="Add note"
            value={draft.note} onChange={e => onChange({ ...draft, note: e.target.value })}
          />
        </div>
      </div>

      <label className="ve-label">* Pay employee and/or charge funder</label>
      <label className="checkbox-wrap">
        <input type="checkbox" checked={draft.payEmployee} onChange={e => onChange({ ...draft, payEmployee: e.target.checked })} />
        <span className="checkbox-box" /><span>Pay employee</span>
      </label>
      <label className="checkbox-wrap">
        <input type="checkbox" checked={draft.chargeFunder} onChange={e => onChange({ ...draft, chargeFunder: e.target.checked })} />
        <span className="checkbox-box" /><span>Charge funder</span>
      </label>

      <button type="button" className="ve-attachment-btn">
        <PlusIcon /> Add attachment
      </button>

      <div className="ve-form-actions">
        <button type="button" className="round-btn tertiary-btn" onClick={onCancel}>Cancel</button>
        <button type="button" className="round-btn primary-btn" disabled={!canConfirm} onClick={onConfirm}>Confirm</button>
      </div>
    </div>
  )
}

function ExpenseCard({ expense, onEdit, onDelete }) {
  return (
    <div className="ve-card">
      <div className="ve-card-actions">
        <button className="ve-icon-btn" onClick={onEdit} aria-label="Edit expense" title="Edit expense"><PenIcon /></button>
        <button className="ve-icon-btn" onClick={onDelete} aria-label="Delete expense" title="Delete expense"><TrashIcon /></button>
      </div>
      <div className="ve-card-row"><span>Expense type</span>{expense.type}</div>
      <div className="ve-card-row"><span>Amount (£)</span>{expense.amount}</div>
      <div className="ve-card-row"><span>Pay employee</span>{expense.payEmployee ? 'Yes' : 'No'}</div>
      <div className="ve-card-row"><span>Charge funder</span>{expense.chargeFunder ? 'Yes' : 'No'}</div>
      {expense.note && <div className="ve-card-row"><span>Note</span>{expense.note}</div>}
      <div className="ve-card-author"><UserIcon /> {expense.addedBy}</div>
    </div>
  )
}

// Ad-hoc expenses are added/edited/deleted directly here; recurring
// expenses only ever originate from a visit's Service Agreement config
// (customer-profile/service-agreement/src/VisitPanel.jsx) — so this tab
// never offers an "Add" affordance for the recurring section, only
// edit/delete on whatever's already there, matching how existing ad-hoc
// expenses are already editable today.
export default function ExpensesTab({ visit, onChange }) {
  const [formTarget, setFormTarget] = useState(null) // { section, id: number|null } | null
  const [draft, setDraft] = useState(emptyDraft())

  const openAdd = () => { setFormTarget({ section: 'adhoc', id: null }); setDraft(emptyDraft()) }
  const openEdit = (section, expense) => {
    setFormTarget({ section, id: expense.id })
    setDraft({ type: expense.type, amount: String(expense.amount), note: expense.note, payEmployee: expense.payEmployee, chargeFunder: expense.chargeFunder })
  }
  const cancel = () => setFormTarget(null)

  const confirm = () => {
    const { section, id } = formTarget
    const key = section === 'adhoc' ? 'adhocExpenses' : 'recurringExpenses'
    const amount = Number(draft.amount)
    if (id === null) {
      onChange({ ...visit, [key]: [...visit[key], makeExpense({ ...draft, amount })] })
    } else {
      onChange({
        ...visit,
        [key]: visit[key].map(e => e.id === id ? { ...e, type: draft.type, amount, note: draft.note, payEmployee: draft.payEmployee, chargeFunder: draft.chargeFunder } : e),
      })
    }
    setFormTarget(null)
  }

  const deleteExpense = (section, id) => {
    if (!window.confirm('Delete this expense?')) return
    const key = section === 'adhoc' ? 'adhocExpenses' : 'recurringExpenses'
    onChange({ ...visit, [key]: visit[key].filter(e => e.id !== id) })
  }

  const renderList = (section, expenses) => expenses.map(exp => (
    formTarget?.section === section && formTarget.id === exp.id
      ? <ExpenseForm key={exp.id} draft={draft} onChange={setDraft} onConfirm={confirm} onCancel={cancel} />
      : <ExpenseCard key={exp.id} expense={exp} onEdit={() => openEdit(section, exp)} onDelete={() => deleteExpense(section, exp.id)} />
  ))

  return (
    <div className="ve-tab">
      <div className="ve-section">
        <h3 className="ve-section-title">Ad-hoc expenses</h3>
        {renderList('adhoc', visit.adhocExpenses)}
        {formTarget?.section === 'adhoc' && formTarget.id === null && (
          <ExpenseForm draft={draft} onChange={setDraft} onConfirm={confirm} onCancel={cancel} />
        )}
        {!(formTarget?.section === 'adhoc' && formTarget.id === null) && (
          <button type="button" className="round-btn secondary-btn btn-icon-left ve-add-btn" onClick={openAdd}>
            <PlusIcon /> Add an expense
          </button>
        )}
      </div>

      {visit.recurringExpenses.length > 0 && (
        <div className="ve-section">
          <h3 className="ve-section-title">Recurring expenses</h3>
          {renderList('recurring', visit.recurringExpenses)}
        </div>
      )}
    </div>
  )
}
