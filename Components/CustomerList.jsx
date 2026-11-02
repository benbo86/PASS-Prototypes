import { useMemo } from 'react'
import { LegalFlags, HighRiskBadge } from './LegalFlags'
import { CUSTOMERS } from './customersData'

// Mobile Customers list (Figma: Mobile App node 18:2592). Grouped A–Z by
// surname under sticky letter dividers. Used by mobile/customers and the
// Customers tab of mobile/messages-tab. Styles: `.customer-*` in
// Styles/mobile.css. The row is Figma's "Customer and employee list item",
// so the Employees list should reuse it.

function CustomerRow({ customer }) {
  const hasFlags = customer.highRisk || customer.legalFlags.length > 0
  return (
    <div className="customer-row">
      <div className="customer-avatar">
        <img src={customer.photo} alt="" width="35" height="35" />
        {customer.highRisk && <span className="customer-avatar-risk-ring" aria-label="High risk" />}
      </div>
      <div className="customer-row-body">
        <div className="customer-row-text">
          <span className="customer-row-name">{customer.firstName} {customer.lastName}</span>
          <span className="customer-row-address">{customer.address}</span>
        </div>
        {hasFlags && (
          <div className="customer-row-flags">
            {customer.highRisk && <HighRiskBadge />}
            <LegalFlags flags={customer.legalFlags} />
          </div>
        )}
      </div>
    </div>
  )
}

// query: filters by name or address
export default function CustomerList({ customers = CUSTOMERS, query = '' }) {
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matches = customers
      .filter(c => !q || `${c.firstName} ${c.lastName} ${c.address}`.toLowerCase().includes(q))
      .sort((a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName))
    const byLetter = []
    for (const c of matches) {
      const letter = c.lastName[0].toUpperCase()
      const last = byLetter[byLetter.length - 1]
      if (last && last.letter === letter) last.customers.push(c)
      else byLetter.push({ letter, customers: [c] })
    }
    return byLetter
  }, [customers, query])

  return (
    <div className="customers-list">
      {groups.map(g => (
        <section key={g.letter} className="customers-group">
          <div className="customers-letter">{g.letter}</div>
          {g.customers.map(c => <CustomerRow key={c.id} customer={c} />)}
        </section>
      ))}
      {groups.length === 0 && <div className="customers-empty">No customers found</div>}
    </div>
  )
}
