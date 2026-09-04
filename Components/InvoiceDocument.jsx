// Recreates invoices/list/src/sample-invoice.pdf's own layout/copy as
// closely as possible (plain black-on-white, no colour), plus a Rate column
// and a leaner Customer/Customer ID/Period row. The one real addition to
// the original document's own logic is the small grey recurring-expense-
// type note under an Expenses value, so a visit line item never needs a new
// column or row to show it — a visit can carry more than one recurring
// expense (e.g. Mileage and a Parking Fee on the same trip), so each one
// stacks as its own value+note pair within the same cell.
//
// Originally lived at invoices/recurring-expense-document/src/InvoiceDocument.jsx
// (still the only place it's imported from at that path — that prototype's
// own App.jsx now imports it from here instead). Extracted into Components/
// and given three new OPTIONAL config props — headerFields/visitListFields/
// fmtGBP — so customer-profile/funders' "Customise document" modal can
// render a live preview driven by its own draft config. Every prop defaults
// to reproducing the exact original fixed-column, fixed-header markup
// byte-for-byte — the recurring-expense-document page passes none of these
// and is completely unaffected by this extension.
//
// Visit list only — there's no real Weekly totals document design yet
// (Ben, 2026-09-04: "lets leave the preview for the weekly totals as we
// don't have this yet"), so this component doesn't speculatively invent
// one; customer-profile/funders' own Preview button is disabled whenever
// that layout is selected.
const initials = (name) => name
  .split(' ')
  .filter(Boolean)
  .map(part => part[0].toUpperCase())
  .join('')

// Toggleable visit-list columns, in the order they'd fall back to if no
// config is supplied — matches the original component's own fixed order.
const VISIT_LIST_COLUMN_RENDERERS = {
  // Locked (always enabled, checkbox disabled in the picker — data.js) but
  // still a real, reorderable field, not a hardcoded leading column — Ben,
  // 2026-09-04: "add Date as a field option to Visit list, positioned
  // first, this should be locked (cannot uncheck)," then "you can still
  // re-order Date." Positioned first only via DEFAULT_VISIT_LIST_FIELDS'
  // own array order / data.js's own field order — nothing pins it here.
  date: { label: 'Date', render: (item) => item.date },
  type: { label: 'Type', render: (item) => item.type },
  carer: { label: 'Carer', render: (item) => item.carer },
  carerInitials: { label: 'Carer initials', render: (item) => initials(item.carer) },
  start: { label: 'Start', render: (item) => item.start },
  duration: { label: 'Duration', render: (item) => item.duration },
  status: { label: 'Status', render: (item) => item.status },
  // `item.rate` is null for a visit spanning two rates (see visitCharge
  // below) — there's no single rate to show, so this renders "—" rather
  // than a broken "£NaN/hr".
  rate: { label: 'Rate', render: (item, fmtGBP) => item.rate != null ? `${fmtGBP(item.rate)}/hr` : '—' },
  // Visit charge used to be a locked, always-shown column (hardcoded as
  // "Charge" outside the toggle system entirely) — Ben, 2026-09-04, made it
  // a real toggleable/orderable field instead, positioned after Rate.
  // `footerValue` is what lets it keep showing a totals-row sum (the one
  // thing a locked column got "for free" that a plain toggle doesn't).
  // Column header text stays "Charge" (its original, pre-toggle wording) —
  // deliberately distinct from the picker's own checklist label ("Visit
  // charge", data.js's INVOICE_LAYOUTS), which is what keeps
  // invoices/recurring-expense-document's unconfigured page byte-for-byte
  // unaffected by this becoming a real field.
  //
  // A visit spanning two rates (e.g. crossing into a bank holiday rate
  // mid-visit) shows a rate-segment breakdown under the total, using the
  // exact same value+note visual language as the Expenses cell below —
  // Ben, 2026-09-04, agreed with product not to add a second row for this
  // ("we didn't think two visit rows would cause confusion" was the
  // alternative considered and rejected). The bold headline value stays
  // the real total (never just the segments alone, unlike Expenses' own
  // per-item amounts) — an invoice line needs to be scannable for its
  // actual cost without the reader doing mental arithmetic.
  visitCharge: {
    label: 'Charge',
    render: (item, fmtGBP) => item.rateSegments ? (
      <>
        <div>{fmtGBP(item.charge)}</div>
        {item.rateSegments.map((seg, i) => (
          <div key={i} className={`inv-doc-cell-note${i > 0 ? ' inv-doc-cell-extra' : ''}`}>
            {seg.hours}h@{fmtGBP(seg.rate)}/hr
          </div>
        ))}
      </>
    ) : fmtGBP(item.charge),
    footerValue: (totals, fmtGBP) => fmtGBP(totals.charge),
  },
}
const DEFAULT_VISIT_LIST_FIELDS = ['date', 'type', 'carer', 'start', 'duration', 'status', 'rate', 'visitCharge']
  .map(key => ({ key, enabled: true }))

function OfficeAddressBlock({ headerFields }) {
  if (!headerFields) {
    // Exact original hardcoded block — unconfigured usage never changes.
    return (
      <div className="inv-doc-address">
        <div className="inv-doc-address-name">Sample Care Provider</div>
        <div>123 Example Street</div>
        <div>Sampletown</div>
        <div>AB1 2CD</div>
        <div>United Kingdom</div>
        <div>0000 000 0000</div>
        <div>invoices@example-care.co.uk</div>
      </div>
    )
  }
  const enabled = (key) => headerFields.find(f => f.key === key)?.enabled
  const lines = (
    <>
      {enabled('officeName') && <div className="inv-doc-address-name">Sample Care Provider</div>}
      {enabled('companyName') && <div>Sample Care Provider Ltd</div>}
      {enabled('addressLine1') && <div>123 Example Street</div>}
      {enabled('addressLine2') && <div>Unit 4</div>}
      {enabled('city') && <div>Sampletown</div>}
      {enabled('county') && <div>Greater Sampleshire</div>}
      {enabled('postcode') && <div>AB1 2CD</div>}
      {enabled('country') && <div>United Kingdom</div>}
      <div>0000 000 0000</div>
      <div>invoices@example-care.co.uk</div>
    </>
  )
  // Logo sits to the left of the office name/address/contact block, not
  // stacked above it — Ben, 2026-09-04: "move the logo to the left of the
  // office name, address and contact details, and make it square."
  if (!enabled('officeLogo')) {
    return <div className="inv-doc-address">{lines}</div>
  }
  return (
    <div className="inv-doc-address inv-doc-address--with-logo">
      <div className="inv-doc-logo-placeholder">LOGO</div>
      <div>{lines}</div>
    </div>
  )
}

export default function InvoiceDocument({
  invoice,
  fmtGBP,
  headerFields = null,
  visitListFields = null,
}) {
  const items = invoice.lineItems
  const totals = items.reduce((acc, item) => ({
    charge: acc.charge + item.charge,
    expenses: acc.expenses + item.expenseTotal,
    totalCharge: acc.totalCharge + item.totalCharge,
  }), { charge: 0, expenses: 0, totalCharge: 0 })

  const activeVisitListFields = (visitListFields ?? DEFAULT_VISIT_LIST_FIELDS)
    .filter(f => f.enabled && VISIT_LIST_COLUMN_RENDERERS[f.key])

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
          <OfficeAddressBlock headerFields={headerFields} />

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
            {activeVisitListFields.map(f => <th key={f.key}>{VISIT_LIST_COLUMN_RENDERERS[f.key].label}</th>)}
            <th>Expenses</th>
            <th>Total Charge</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              {activeVisitListFields.map(f => (
                <td key={f.key}>{VISIT_LIST_COLUMN_RENDERERS[f.key].render(item, fmtGBP)}</td>
              ))}
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
            {activeVisitListFields.map(f => (
              <td key={f.key}>{VISIT_LIST_COLUMN_RENDERERS[f.key].footerValue?.(totals, fmtGBP)}</td>
            ))}
            <td>{fmtGBP(totals.expenses)}</td>
            <td>{fmtGBP(totals.totalCharge)}</td>
          </tr>
        </tfoot>
      </table>

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
