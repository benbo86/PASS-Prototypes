import { fmtGBP } from './data'

// Recreates invoices/recurring-expense-document's own InvoiceDocument.jsx
// layout as closely as possible (same header/meta/table/page shape, same
// plain black-on-white styling, same font sizes/padding/margins), adapted
// for a Gross Pay Advice shown to an employee rather than an invoice shown
// to a customer. Shows the visits for the pay cycle, each carrying its own
// recurring expenses (mileage, parking, etc.) — not the flat recurring-
// expenses-only table an earlier version of this document had.
export default function GrossPayAdviceDocument({ gpa }) {
  const items = gpa.lineItems

  return (
    <div className="gpa-doc">
      <div className="gpa-doc-header">
        <div className="gpa-doc-header-col">
          <h1 className="gpa-doc-title">Gross Pay Advice</h1>
          <div className="gpa-doc-address">
            <div className="gpa-doc-address-name">{gpa.employeeName}</div>
            <div>1 Example Road</div>
            <div>Sampleford</div>
            <div>Greater London</div>
            <div>AB2 3CD</div>
            <div>United Kingdom</div>
          </div>
        </div>

        <div className="gpa-doc-header-col">
          <div className="gpa-doc-address">
            <div className="gpa-doc-address-name">Sample Care Provider</div>
            <div>123 Example Street</div>
            <div>Sampletown</div>
            <div>AB1 2CD</div>
            <div>United Kingdom</div>
            <div>0000 000 0000</div>
            <div>payroll@example-care.co.uk</div>
          </div>

          {/* Two stat blocks side by side, directly left-of/adjacent to
              each other — Total visits/hours/holiday on the left, the pay
              breakdown on the right — both using the exact same
              .gpa-doc-summary row formatting (label left, value right).
              Total pay is nested inside the same column as the pay
              breakdown (not a sibling spanning the full row) so it lines
              up under Visit pay/Mileage/etc., not under the visit-count
              block on the left. */}
          <div className="gpa-doc-stats-row">
            <div className="gpa-doc-summary">
              <div><span>Total visits</span><span>{gpa.totalVisits}</span></div>
              <div><span>Total visit hours</span><span>{gpa.totalVisitHours}</span></div>
              <div><span>Total holiday</span><span>{gpa.totalHoliday}</span></div>
            </div>
            <div className="gpa-doc-header-col">
              <div className="gpa-doc-summary">
                <div><span>Visit pay</span><span>{fmtGBP(gpa.totalPay)}</span></div>
                <div><span>Mileage</span><span>{fmtGBP(gpa.totalMileage)}</span></div>
                <div><span>Travel time</span><span>{fmtGBP(gpa.totalTravel)}</span></div>
                <div><span>Total expenses</span><span>{fmtGBP(gpa.totalExpenses)}</span></div>
                <div><span>Holiday pay</span><span>{fmtGBP(gpa.totalHolidayPay)}</span></div>
              </div>
              <div className="gpa-doc-total-payable">
                <span>Total pay</span><span>{fmtGBP(gpa.summaryTotalPay)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="gpa-doc-meta">
        <div className="gpa-doc-meta-col">
          <div><span>Employee</span>{gpa.employeeName}</div>
        </div>
        <div className="gpa-doc-meta-col">
          <div><span>Ref</span>{gpa.employeeRef}</div>
        </div>
        <div className="gpa-doc-meta-col">
          <div><span>Payroll ID</span>{gpa.payrollId}</div>
        </div>
        <div className="gpa-doc-meta-col">
          <div><span>Period</span>{gpa.start} - {gpa.end}</div>
        </div>
        <div className="gpa-doc-meta-col">
          <div><span>Print date</span>{gpa.printDate}</div>
        </div>
      </div>

      <table className="gpa-doc-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Customer</th>
            <th>Time</th>
            <th>Pay</th>
            <th>Mileage</th>
            <th>Travel</th>
            <th>Expenses</th>
            <th>Total pay</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td>{item.date}</td>
              <td>{item.type}</td>
              <td>{item.customer}</td>
              <td>{item.timeLabel}</td>
              <td>{fmtGBP(item.pay)}</td>
              <td>{fmtGBP(item.mileage)}</td>
              <td>{fmtGBP(item.travel)}</td>
              <td>
                {item.expenses.length > 0 ? item.expenses.map((exp, j) => (
                  <div key={j} className={j > 0 ? 'gpa-doc-cell-extra' : undefined}>
                    <div>{fmtGBP(exp.amount)}</div>
                    <div className="gpa-doc-cell-note">{exp.type}</div>
                  </div>
                )) : 'N/A'}
              </td>
              <td>{fmtGBP(item.totalPay)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="gpa-doc-totals-row">
            <td></td><td></td><td></td><td></td>
            <td>{fmtGBP(gpa.totalPay)}</td>
            <td>{fmtGBP(gpa.totalMileage)}</td>
            <td>{fmtGBP(gpa.totalTravel)}</td>
            <td>{fmtGBP(gpa.totalExpenses)}</td>
            <td>{fmtGBP(gpa.tableTotalPay)}</td>
          </tr>
        </tfoot>
      </table>

      <div className="gpa-doc-page">Page 1 of 1</div>
    </div>
  )
}
