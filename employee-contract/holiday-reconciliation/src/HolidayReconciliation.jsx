import { useState, useRef } from 'react'
import DevToolbar from '../../../Components/DevToolbar'
import DevMode from '../../../Components/DevMode'
import DevComments from '../../../Components/DevComments'
import DevEdit from '../../../Components/DevEdit'
import WireframeToggle from '../../../Components/WireframeToggle'
import AuditCapture from '../../../Components/AuditCapture'

// ── Icons ──────────────────────────────────────────────────────────────────────

const ChevronLeft = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <polygon fill="currentColor" points="15.4,17.4 10.8,12 15.4,6.6 14,5.2 8,12 14,18.8" />
  </svg>
)

const WarningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" className="warning-icon">
    <path fill="currentColor" fillRule="evenodd" d="M10.27,3.99 C11.04,2.66 12.96,2.66 13.73,3.99 L21.26,17 C22.03,18.33 21.07,20 19.53,20 L4.47,20 C2.93,20 1.97,18.33 2.74,17 Z M12,15 C11.4477153,15 11,15.4477153 11,16 C11,16.5522847 11.4477153,17 12,17 C12.5522847,17 13,16.5522847 13,16 C13,15.4477153 12.5522847,15 12,15 Z M12,7 C11.4477153,7 11,7.44771525 11,8 L11,12 C11,12.5522847 11.4477153,13 12,13 C12.5522847,13 13,12.5522847 13,12 L13,8 C13,7.44771525 12.5522847,7 12,7 Z" />
  </svg>
)

// ── Data ──────────────────────────────────────────────────────────────────────
// Dummy scenario: the naive Entitlement + Adjustment − Booked & taken figure
// (15.4) is what the box row would show with no reconciliation applied. The
// reconciliation is triggered by an end date being added to the employee's
// contract (a leaver event) and is a separate stored result — not derived
// from those three numbers — that overrides Remaining to a new, independent
// figure (0, matching the real screenshot).
//
// This scenario has unused days remaining, so the reconciliation here means
// those 15.4 days are paid out to the employee (holiday pay in lieu), not
// forfeited — the complementary, opposite-direction case from the sibling
// employee-contract/holiday-pay-deduction prototype, where booked & taken
// exceeds entitlement and the employee owes days back instead.
const ENTITLEMENT = 16.4
const ADJUSTMENT = 0
const BOOKED_AND_TAKEN = 1
const RECONCILED_REMAINING = 0

const fmtDays = (n) => {
  const rounded = Math.round(n * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

// ── Main component ────────────────────────────────────────────────────────────

export default function HolidayReconciliation() {
  const pageRef = useRef(null)
  const [reconciled, setReconciled] = useState(true)

  const naiveRemaining = ENTITLEMENT + ADJUSTMENT - BOOKED_AND_TAKEN
  const remaining = reconciled ? RECONCILED_REMAINING : naiveRemaining
  const daysPaidInLieu = naiveRemaining - RECONCILED_REMAINING

  return (
    <>
      <DevToolbar>
        <DevEdit containerRef={pageRef} prototypeId={window.location.pathname} />
        <DevMode containerRef={pageRef} />
        <DevComments containerRef={pageRef} prototypeId={window.location.pathname} />
        <WireframeToggle />
        <AuditCapture containerRef={pageRef} />
      </DevToolbar>
      <div className="hr-page" ref={pageRef}>
      <a href="../../" className="back-link"><ChevronLeft /> Prototypes</a>

      <label className="hr-toggle">
        <input
          type="checkbox"
          checked={reconciled}
          onChange={(e) => setReconciled(e.target.checked)}
        />
        Simulate: contract end date added (reconciliation created)
      </label>

      <div className="hr-section">
        <h1>Holiday</h1>

        <div className="hr-summary">
          <div className="hr-stat-card">
            <span className="hr-stat-label">Entitlement</span>
            <span className="hr-stat-value">{fmtDays(ENTITLEMENT)} Days</span>
          </div>
          <div className="hr-stat-card">
            <span className="hr-stat-label">Adjustment</span>
            <span className="hr-stat-value">{fmtDays(ADJUSTMENT)} Days</span>
          </div>
          <div className="hr-stat-card">
            <span className="hr-stat-label">Booked &amp; taken</span>
            <span className="hr-stat-value">{fmtDays(BOOKED_AND_TAKEN)} Days</span>
          </div>
          <div className="hr-stat-card">
            <span className="hr-stat-label">Remaining</span>
            <span className="hr-stat-value">{fmtDays(remaining)} Days</span>
            {reconciled && (
              <span className="hr-stat-note">Reconciliation: {fmtDays(daysPaidInLieu)} Days paid in lieu</span>
            )}
          </div>
        </div>

        {reconciled && (
          <div className="warning-banner orange">
            <WarningIcon />
            <p>
              Holiday and holiday adjustments cannot be added, edited or deleted because a holiday
              reconciliation has been created for this employee. Remove the reconciliation to make changes.
            </p>
          </div>
        )}
      </div>
      </div>
    </>
  )
}
