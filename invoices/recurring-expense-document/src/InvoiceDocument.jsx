import { fmtGBP } from './data'

// Recreates invoices/list/src/sample-invoice.pdf's own layout/copy as
// closely as possible (plain black-on-white, no colour), plus a Rate column
// and a leaner Customer/Customer ID/Period row. The one real addition to
// the original document's own logic is the small grey recurring-expense-
// type note under an Expenses value, so a visit line item never needs a new
// column or row to show it — a visit can carry more than one recurring
// expense (e.g. Mileage and a Parking Fee on the same trip), so each one
// stacks as its own value+note pair within the same cell, and a summary
// below the table totals each expense type across the whole invoice.
export default function InvoiceDocument({ invoice }) {
  const items = invoice.lineItems
  const totals = items.reduce((acc, item) => ({
    charge: acc.charge + item.charge,
    expenses: acc.expenses + item.expenseTotal,
    totalCharge: acc.totalCharge + item.totalCharge,
  }), { charge: 0, expenses: 0, totalCharge: 0 })

  const expenseTotalsByType = []
  items.forEach(item => {
    item.expenses.forEach(exp => {
      const existing = expenseTotalsByType.find(e => e.type === exp.type)
      if (existing) existing.amount += exp.amount
      else expenseTotalsByType.push({ type: exp.type, amount: exp.amount })
    })
  })

  return (
    <div className="inv-doc">
      <div className="inv-doc-header">
        <div className="inv-doc-header-col">
          <h1 className="inv-doc-title">Invoice</h1>
          <div className="inv-doc-address">
            <div className="inv-doc-address-name">{invoice.customer}</div>
            <div>1 Example Road</div>
            <div>Sampleford</div>
            <div>Greater London</div>
            <div>AB2 3CD</div>
            <div>United Kingdom</div>
          </div>
        </div>

        <div className="inv-doc-header-col">
          <div className="inv-doc-address">
            <div className="inv-doc-address-name">Sample Care Provider</div>
            <div>123 Example Street</div>
            <div>Sampletown</div>
            <div>AB1 2CD</div>
            <div>United Kingdom</div>
            <div>0000 000 0000</div>
            <div>invoices@example-care.co.uk</div>
          </div>

          <div className="inv-doc-summary">
            <div><span>Invoice Ref</span><span>{invoice.invoiceNo}</span></div>
            <div><span>Date</span><span>{invoice.invoiceDate}</span></div>
            <div><span>Payment Due</span><span>{invoice.paymentDue}</span></div>
            <div><span>Payment Method</span><span>{invoice.paymentMethod}</span></div>
          </div>
          <div className="inv-doc-total-payable">
            <span>Total Payable</span><span>{fmtGBP(totals.totalCharge)}</span>
          </div>
        </div>
      </div>

      <div className="inv-doc-meta">
        <div className="inv-doc-meta-col">
          <div><span>Customer</span>{invoice.customer}</div>
        </div>
        <div className="inv-doc-meta-col">
          <div><span>Customer ID</span>{invoice.customerId}</div>
        </div>
        <div className="inv-doc-meta-col">
          <div><span>Period</span>{invoice.start} - {invoice.end}</div>
        </div>
      </div>

      <table className="inv-doc-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Carer</th>
            <th>Start</th>
            <th>Duration</th>
            <th>Status</th>
            <th>Rate</th>
            <th>Charge</th>
            <th>Expenses</th>
            <th>Total Charge</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td>{item.date}</td>
              <td>{item.type}</td>
              <td>{item.carer}</td>
              <td>{item.start}</td>
              <td>{item.duration}</td>
              <td>{item.status}</td>
              <td>{fmtGBP(item.rate)}/hr</td>
              <td>{fmtGBP(item.charge)}</td>
              <td>
                {item.expenses.length > 0 ? item.expenses.map((exp, j) => (
                  <div key={j} className={j > 0 ? 'inv-doc-cell-extra' : undefined}>
                    <div>{fmtGBP(exp.amount)}</div>
                    <div className="inv-doc-cell-note">{exp.type}</div>
                  </div>
                )) : 'N/A'}
              </td>
              <td>{fmtGBP(item.totalCharge)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="inv-doc-totals-row">
            <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            <td>{fmtGBP(totals.charge)}</td>
            <td>{fmtGBP(totals.expenses)}</td>
            <td>{fmtGBP(totals.totalCharge)}</td>
          </tr>
        </tfoot>
      </table>

      {expenseTotalsByType.length > 0 && (
        <div className="inv-doc-expense-summary">
          <div className="inv-doc-footer-title">Recurring Expenses</div>
          {expenseTotalsByType.map(e => (
            <div key={e.type}><span>{e.type}</span><span>{fmtGBP(e.amount)}</span></div>
          ))}
        </div>
      )}

      <div className="inv-doc-footer">
        <div className="inv-doc-footer-title">Payment Details:</div>
        <div>Sample Care Provider</div>
        <div>Account Number: 00000000</div>
        <div>Sort Code: 00-00-00</div>
        <div className="inv-doc-footer-gap">Or call 0000 000 0000</div>
        <div className="inv-doc-footer-gap">Payment Terms: 7 Days</div>
        {invoice.paymentMethod === 'Standing Order' && (
          <div>If payment method is via Standing Order, payment will be collected 10 days from the date of the invoice.</div>
        )}
        <div className="inv-doc-footer-gap">Thank you</div>
      </div>

      <div className="inv-doc-page">Page 1 of 1</div>
    </div>
  )
}
