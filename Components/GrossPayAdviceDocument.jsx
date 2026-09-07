// Recreates invoices/recurring-expense-document's own InvoiceDocument.jsx
// layout as closely as possible (same header/meta/table/page shape, same
// plain black-on-white styling, same font sizes/padding/margins), adapted
// for a Gross Pay Advice shown to an employee rather than an invoice shown
// to a customer. Shows the visits for the pay cycle, each carrying its own
// recurring expenses (mileage, parking, etc.) — not the flat recurring-
// expenses-only table an earlier version of this document had.
//
// Originally lived at gross-pay-advice/recurring-expense-document/src/
// GrossPayAdviceDocument.jsx (still the only place it's imported from at
// that path — that prototype's own App.jsx now imports it from here
// instead). Extracted into Components/ and given three new OPTIONAL config
// props — headerFields/visitTableFields/fmtGBP — so roster-settings/settings'
// "Contracts and pay" → "Pay advice document" customisation can render a
// live preview driven by its own draft config, same extraction discipline
// as Components/InvoiceDocument.jsx. Every prop defaults to reproducing
// the exact original fixed-column, fixed-stats markup byte-for-byte — the
// recurring-expense-document page passes none of these and is completely
// unaffected by this extension.
const GPA_TABLE_COLUMN_RENDERERS = {
  // Locked (always enabled, checkbox disabled in the picker — see
  // gpaCustomisation.js) but still a real, reorderable field, not a
  // hardcoded leading column — Ben, 2026-09-05: "Date (fixed, cannot be
  // reordered or unselected)," then "Lets make the date reorderable, my
  // mistake." Positioned first only via DEFAULT_GPA_TABLE_FIELDS' own
  // array order / gpaCustomisation.js's own field order — nothing pins it
  // here, same as Components/InvoiceDocument.jsx's own `date` field.
  date: { label: 'Date', render: (item) => item.date },
  type: { label: 'Type', render: (item) => item.type },
  customer: { label: 'Customer', render: (item) => item.customer },
  time: { label: 'Time', render: (item) => item.timeLabel },
  pay: { label: 'Pay', render: (item, fmtGBP) => fmtGBP(item.pay), footerValue: (gpa, fmtGBP) => fmtGBP(gpa.totalPay) },
  mileage: { label: 'Mileage', render: (item, fmtGBP) => fmtGBP(item.mileage), footerValue: (gpa, fmtGBP) => fmtGBP(gpa.totalMileage) },
  travel: { label: 'Travel', render: (item, fmtGBP) => fmtGBP(item.travel), footerValue: (gpa, fmtGBP) => fmtGBP(gpa.totalTravel) },
}
const DEFAULT_GPA_TABLE_FIELDS = ['date', 'type', 'customer', 'time', 'pay', 'mileage', 'travel']
  .map(key => ({ key, enabled: true }))

function OfficeAddressBlock({ headerFields }) {
  if (!headerFields) {
    // Exact original hardcoded block — unconfigured usage never changes.
    return (
      <div className="gpa-doc-address">
        <div className="gpa-doc-address-name">Sample Care Provider</div>
        <div>123 Example Street</div>
        <div>Sampletown</div>
        <div>AB1 2CD</div>
        <div>United Kingdom</div>
        <div>0000 000 0000</div>
        <div>payroll@example-care.co.uk</div>
      </div>
    )
  }
  const enabled = (key) => headerFields.find(f => f.key === key)?.enabled
  const lines = (
    <>
      {enabled('officeName') && <div className="gpa-doc-address-name">Sample Care Provider</div>}
      {enabled('companyName') && <div>Sample Care Provider Ltd</div>}
      {enabled('addressLine1') && <div>123 Example Street</div>}
      {enabled('addressLine2') && <div>Unit 4</div>}
      {enabled('city') && <div>Sampletown</div>}
      {enabled('county') && <div>Greater Sampleshire</div>}
      {enabled('postcode') && <div>AB1 2CD</div>}
      {enabled('country') && <div>United Kingdom</div>}
      <div>0000 000 0000</div>
      <div>payroll@example-care.co.uk</div>
    </>
  )
  if (!enabled('officeLogo')) {
    return <div className="gpa-doc-address">{lines}</div>
  }
  return (
    <div className="gpa-doc-address gpa-doc-address--with-logo">
      <div className="gpa-doc-logo-placeholder">LOGO</div>
      <div>{lines}</div>
    </div>
  )
}

// The 5 configurable stats (Total visits/weekday hours/weekend hours/
// hours/holidays) vs. the original fixed 3 (Total visits/visit hours/
// holiday) — genuinely different fields, not a relabelling, so the
// unconfigured branch keeps reading the original gpa.totalVisitHours/
// gpa.totalHoliday untouched while the configured branch reads the 3 new
// fields a sample/real GPA needs to supply once this is in use.
function StatsBlock({ gpa, headerFields }) {
  if (!headerFields) {
    return (
      <div className="gpa-doc-summary">
        <div><span>Total visits</span><span>{gpa.totalVisits}</span></div>
        <div><span>Total visit hours</span><span>{gpa.totalVisitHours}</span></div>
        <div><span>Total holiday</span><span>{gpa.totalHoliday}</span></div>
      </div>
    )
  }
  const enabled = (key) => headerFields.find(f => f.key === key)?.enabled
  return (
    <div className="gpa-doc-summary">
      {enabled('totalVisits') && <div><span>Total visits</span><span>{gpa.totalVisits}</span></div>}
      {enabled('totalWeekdayHours') && <div><span>Total weekday hours</span><span>{gpa.totalWeekdayHours}</span></div>}
      {enabled('totalWeekendHours') && <div><span>Total weekend hours</span><span>{gpa.totalWeekendHours}</span></div>}
      {enabled('totalHours') && <div><span>Total hours</span><span>{gpa.totalHours}</span></div>}
      {enabled('totalHolidays') && <div><span>Total holidays</span><span>{gpa.totalHolidays}</span></div>}
    </div>
  )
}

export default function GrossPayAdviceDocument({
  gpa,
  fmtGBP,
  headerFields = null,
  visitTableFields = null,
}) {
  const items = gpa.lineItems
  const activeTableFields = (visitTableFields ?? DEFAULT_GPA_TABLE_FIELDS)
    .filter(f => f.enabled && GPA_TABLE_COLUMN_RENDERERS[f.key])

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
          <OfficeAddressBlock headerFields={headerFields} />

          {/* Two stat blocks side by side, directly left-of/adjacent to
              each other — Total visits/hours/holiday on the left, the pay
              breakdown on the right — both using the exact same
              .gpa-doc-summary row formatting (label left, value right).
              Total pay is nested inside the same column as the pay
              breakdown (not a sibling spanning the full row) so it lines
              up under Visit pay/Mileage/etc., not under the visit-count
              block on the left. */}
          <div className="gpa-doc-stats-row">
            <StatsBlock gpa={gpa} headerFields={headerFields} />
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
            {activeTableFields.map(f => <th key={f.key}>{GPA_TABLE_COLUMN_RENDERERS[f.key].label}</th>)}
            <th>Expenses</th>
            <th>Total pay</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              {activeTableFields.map(f => (
                <td key={f.key}>{GPA_TABLE_COLUMN_RENDERERS[f.key].render(item, fmtGBP)}</td>
              ))}
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
            {activeTableFields.map(f => (
              <td key={f.key}>{GPA_TABLE_COLUMN_RENDERERS[f.key].footerValue?.(gpa, fmtGBP)}</td>
            ))}
            <td>{fmtGBP(gpa.totalExpenses)}</td>
            <td>{fmtGBP(gpa.tableTotalPay)}</td>
          </tr>
        </tfoot>
      </table>

      <div className="gpa-doc-page">Page 1 of 1</div>
    </div>
  )
}
