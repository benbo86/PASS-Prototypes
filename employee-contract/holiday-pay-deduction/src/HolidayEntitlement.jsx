import { useState, useRef } from 'react'
import Tooltip from '../../../Components/Tooltip'
import DevMode from '../../../Components/DevMode'
import DevComments from '../../../Components/DevComments'

// ── Icons ──────────────────────────────────────────────────────────────────────

const ChevronLeft = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <polygon fill="currentColor" points="15.4,17.4 10.8,12 15.4,6.6 14,5.2 8,12 14,18.8" />
  </svg>
)

const InfoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path fill="currentColor" fillRule="evenodd" d="M12,2 C17.52,2 22,6.48 22,12 C22,17.52 17.52,22 12,22 C6.48,22 2,17.52 2,12 C2,6.48 6.48,2 12,2 Z M10.6662105,9.93690394 L10.581437,9.93690394 C10.1076337,9.93690394 9.72611507,10.3209137 9.72611507,10.7922258 C9.72611507,11.2660291 10.1101248,11.6475478 10.581437,11.6475478 L10.6662105,11.6475478 L10.6662105,16.6348056 L10.5826825,16.6348056 C10.1096134,16.6348056 9.72611507,17.0183039 9.72611507,17.491373 C9.72611507,17.9644422 10.1096134,18.3479405 10.5826825,18.3479405 L13.4173175,18.3479405 C13.8903866,18.3479405 14.2738849,17.9644422 14.2738849,17.491373 C14.2738849,17.0183039 13.8903866,16.6348056 13.4173175,16.6348056 L13.3387717,16.6348056 L13.3362805,10.936904 C13.3360752,10.3847645 12.8884201,9.93727594 12.3362806,9.93727594 L10.6662105,9.93690394 Z M11.8678197,5.65205952 C11.0006244,5.65205952 10.2992557,6.35342819 10.2992557,7.22062354 C10.2992557,8.08781889 11.0006244,8.78918756 11.8678197,8.78918756 C12.7350151,8.78918756 13.4363837,8.08781889 13.4363837,7.22062354 C13.4363837,6.35342819 12.7350151,5.65205952 11.8678197,5.65205952 Z" />
  </svg>
)

const TickIcon = ({ className }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" className={className}>
    <polygon stroke="currentColor" fill="currentColor" strokeLinejoin="round" points="9.29090299 15.7925373 5.47272117 12.0313433 4.1999939 13.2850746 9.29090299 18.3 20.1999939 7.55373134 18.9272666 6.3" />
  </svg>
)

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <polygon fill="currentColor" stroke="currentColor" strokeLinejoin="round"
      points="18 7.2 16.8 6 12 10.8 7.2 6 6 7.2 10.8 12 6 16.8 7.2 18 12 13.2 16.8 18 18 16.8 13.2 12" />
  </svg>
)

const WarningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" className="warning-icon">
    <path fill="currentColor" fillRule="evenodd" d="M10.27,3.99 C11.04,2.66 12.96,2.66 13.73,3.99 L21.26,17 C22.03,18.33 21.07,20 19.53,20 L4.47,20 C2.93,20 1.97,18.33 2.74,17 Z M12,15 C11.4477153,15 11,15.4477153 11,16 C11,16.5522847 11.4477153,17 12,17 C12.5522847,17 13,16.5522847 13,16 C13,15.4477153 12.5522847,15 12,15 Z M12,7 C11.4477153,7 11,7.44771525 11,8 L11,12 C11,12.5522847 11.4477153,13 12,13 C12.5522847,13 13,12.5522847 13,12 L13,8 C13,7.44771525 12.5522847,7 12,7 Z" />
  </svg>
)

// ── Data ──────────────────────────────────────────────────────────────────────

// Leaver scenario: 7 days entitlement, 9 days booked → 2 days overpaid
const LEAVER_YEAR = { entitlement: 7.0, adjustment: 0.0, booked: 9.0 }
const AVG_DAILY_PAY = 250.00
const STATIC_FINISH_DATE = new Date(2023, 5, 15)

// ── Deduction modal content ───────────────────────────────────────────────────

function DeductionBody({ overpaidDays, deduction, deductionAdded, onAdd }) {
  const fmtDate = (d) => d
    ? `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
    : '—'

  return (
    <>
      <p className="he-deduction-desc">
        This employee has taken more holiday than their pro-rated entitlement for this period.
        The following amount should be deducted from their final pay.
      </p>
      <div className="calc-card">
        <span className="calc-label">{overpaidDays.toFixed(1)} days × £{AVG_DAILY_PAY.toFixed(2)} avg daily pay</span>
        <span className="calc-total">= £{deduction.toFixed(2)} deduction</span>
      </div>
      <div className="he-deduction-action">
        <div className="he-deduction-action-row">
          {!deductionAdded && (
            <button className="round-btn tertiary-btn">Close</button>
          )}
          {deductionAdded ? (
            <button className="round-btn btn-icon-left he-btn-confirmed" disabled>
              <TickIcon /> Deduction added
            </button>
          ) : (
            <button className="round-btn primary-btn btn-icon-right" onClick={onAdd}>
              Add deduction
              <Tooltip text="Creates a timesheet record for verification. Once verified and the gross pay advice generated, the deduction will be taken off the total.">
                <InfoIcon />
              </Tooltip>
            </button>
          )}
        </div>
        <span className="he-deduction-date-note">
          The deduction record in timesheets will use the employee's finish date {fmtDate(STATIC_FINISH_DATE)}. <a href="#" className="he-link">View in timesheets</a>
        </span>
      </div>
    </>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function HolidayEntitlement() {
  const [deductionAdded, setDeductionAdded] = useState(false)
  const pageRef = useRef(null)

  const remaining    = LEAVER_YEAR.entitlement + LEAVER_YEAR.adjustment - LEAVER_YEAR.booked
  const overpaidDays = Math.abs(remaining)
  const deduction    = overpaidDays * AVG_DAILY_PAY

  return (
    <div className="he-page" ref={pageRef}>
      <a href="../../" className="back-link"><ChevronLeft /> Prototypes</a>

      <div className="he-scenarios">

        <div className="he-scenario">
          <p className="he-scenario-label">
            On save of Contract Summary — employee has taken more holiday than their pro-rated entitlement
          </p>
          <div className="he-modal-card">
            <button className="modal-close-btn"><CloseIcon /></button>
            <div className="he-modal-title">Leaver holiday deduction</div>
            <div className="he-modal-body">
              <DeductionBody
                overpaidDays={overpaidDays}
                deduction={deduction}
                deductionAdded={deductionAdded}
                onAdd={() => setDeductionAdded(true)}
              />
            </div>
          </div>
        </div>

        <div className="he-scenario">
          <p className="he-scenario-label">
            On save of Contract Summary — finish date changed or removed and the existing deduction record has already been verified in timesheets
          </p>
          <div className="he-modal-card">
            <button className="modal-close-btn"><CloseIcon /></button>
            <div className="he-modal-title">Leaver holiday deduction</div>
            <div className="he-modal-body">
              <div className="warning-banner orange">
                <WarningIcon />
                <p className="he-warning-text">The finish date has changed but a verified holiday pay deduction already exists. Review and update the deduction in timesheets.</p>
              </div>
              <div className="he-modal-footer">
                <button className="round-btn tertiary-btn">Close</button>
                <button className="round-btn primary-btn">View in timesheets</button>
              </div>
            </div>
          </div>
        </div>

        <div className="he-scenario">
          <p className="he-scenario-label">
            In the Holiday section — after a deduction has been added
          </p>
          <div className="warning-banner green">
            <TickIcon className="success-icon" />
            <div>
              <h4>Holiday pay deduction added</h4>
              <p>£{(overpaidDays * AVG_DAILY_PAY).toFixed(2)} deduction record created. <a href="#" className="he-link">View in timesheets</a></p>
            </div>
          </div>
        </div>

      </div>
      <DevMode containerRef={pageRef} />
      <DevComments containerRef={pageRef} prototypeId={window.location.pathname} />
    </div>
  )
}
