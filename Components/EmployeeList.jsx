import { useMemo } from 'react'
import { EMPLOYEES, CURRENT_EMPLOYEE_ID } from './employeesData'

// Mobile Employees list (no Figma yet; built from a screenshot of the live
// app). Like the Customers list (Components/CustomerList.jsx) it's grouped
// A–Z by surname under sticky dividers, but the row differs: placeholder
// avatar, name + role, full-width divider lines. The signed-in employee is
// pinned under "You" and shown in bold, and also appears in their own
// letter group. Styles: `.employee-*` / `.employees-*` in Styles/mobile.css.

// Icons/Avatar Placeholder.svg
const AvatarPlaceholder = () => (
  <svg className="employee-avatar" width="40" height="40" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="12" fill="#BDBDBD" />
    <circle cx="12" cy="8.4" r="3.8" fill="currentColor" />
    <ellipse cx="12" cy="17.4" rx="6.6" ry="3.8" fill="currentColor" />
  </svg>
)

function EmployeeRow({ employee, isYou, onSelect }) {
  return (
    <div
      className={`employee-row${isYou ? ' employee-row--you' : ''}${onSelect ? ' employee-row--tappable' : ''}`}
      onClick={onSelect ? () => onSelect(employee) : undefined}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={onSelect ? (e) => { if (e.key === 'Enter') onSelect(employee) } : undefined}
    >
      <AvatarPlaceholder />
      <div className="employee-row-text">
        <span className="employee-row-name">{employee.firstName} {employee.lastName}</span>
        <span className="employee-row-role">{employee.role}</span>
      </div>
    </div>
  )
}

// query: filters by name or role. onSelect: optional; when given, rows are tappable
// (the Messages tab opens the employee's profile).
export default function EmployeeList({ employees = EMPLOYEES, currentId = CURRENT_EMPLOYEE_ID, query = '', onSelect }) {
  const q = query.trim().toLowerCase()
  const me = employees.find(e => e.id === currentId)
  const showMe = me && !q

  const groups = useMemo(() => {
    const matches = employees
      .filter(e => !q || `${e.firstName} ${e.lastName} ${e.role}`.toLowerCase().includes(q))
      .sort((a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName))
    const byLetter = []
    for (const e of matches) {
      const letter = e.lastName[0].toUpperCase()
      const last = byLetter[byLetter.length - 1]
      if (last && last.letter === letter) last.employees.push(e)
      else byLetter.push({ letter, employees: [e] })
    }
    return byLetter
  }, [employees, q])

  return (
    <div className="employees-list">
      {showMe && (
        <section>
          <div className="employees-divider employees-divider--you">You</div>
          <EmployeeRow employee={me} isYou onSelect={onSelect} />
        </section>
      )}
      {groups.map(g => (
        <section key={g.letter}>
          <div className="employees-divider">{g.letter}</div>
          {g.employees.map(e => <EmployeeRow key={e.id} employee={e} isYou={e.id === currentId} onSelect={onSelect} />)}
        </section>
      ))}
      {groups.length === 0 && <div className="customers-empty">No employees found</div>}
    </div>
  )
}
