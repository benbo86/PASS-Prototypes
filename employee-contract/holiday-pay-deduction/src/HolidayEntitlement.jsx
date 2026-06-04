import { useState, useRef, forwardRef } from 'react'
import DatePicker from 'react-datepicker'
import { CalendarIcon } from '../../../Components/DateRangePicker'
import Tooltip from '../../../Components/Tooltip'
import Modal from '../../../Components/Modal'

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

const TickIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <polygon stroke="currentColor" fill="currentColor" strokeLinejoin="round" points="9.29090299 15.7925373 5.47272117 12.0313433 4.1999939 13.2850746 9.29090299 18.3 20.1999939 7.55373134 18.9272666 6.3" />
  </svg>
)


// ── Date picker custom input ───────────────────────────────────────────────────

const FinishDateInput = forwardRef(({ value, onClick }, ref) => (
  <button type="button" className="he-finish-date" ref={ref} onClick={onClick}>
    <span>{value || 'Select date'}</span>
    <span className="he-finish-date-icon"><CalendarIcon /></span>
  </button>
))
FinishDateInput.displayName = 'FinishDateInput'

// ── Data ──────────────────────────────────────────────────────────────────────

// Year 2 = leaver scenario: 7 days entitlement, 9 days booked → 2 days overpaid
const LEAVER_YEAR = { entitlement: 7.0, adjustment: 0.0, booked: 9.0 }
const AVG_DAILY_PAY = 250.00

// ── Deduction content (shared between inline and modal) ───────────────────────

function DeductionBody({ overpaidDays, deduction, finishDate, deductionAdded, onAdd, onDismiss }) {
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
          {onDismiss && !deductionAdded && (
            <button className="round-btn tertiary-btn" onClick={onDismiss}>
              Don't add deduction
            </button>
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
          The deduction record in timesheets will use the employee's finish date {fmtDate(finishDate)}
          {deductionAdded && <a href="#" className="he-link he-deduction-view-link">View in timesheet</a>}
        </span>
      </div>
    </>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function HolidayEntitlement() {
  const [finishDate, setFinishDate] = useState(new Date(2023, 5, 15))
  const [showModal, setShowModal] = useState(false)
  const [deductionAdded, setDeductionAdded] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const toastTimer = useRef(null)

  const remaining    = LEAVER_YEAR.entitlement + LEAVER_YEAR.adjustment - LEAVER_YEAR.booked
  const isOverpaid   = remaining < 0
  const overpaidDays = isOverpaid ? Math.abs(remaining) : 0
  const deduction    = overpaidDays * AVG_DAILY_PAY

  const handleDateChange = (d) => {
    setFinishDate(d)
    setDeductionAdded(false)
    setShowModal(false)
  }

  const triggerToast = () => {
    setShowToast(true)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setShowToast(false), 3000)
  }

  const handleSave = () => {
    setDeductionAdded(false)
    triggerToast()
    if (isOverpaid) setShowModal(true)
  }

  return (
    <div className="he-page">
      <a href="../../" className="back-link"><ChevronLeft /> Prototypes</a>

      <div className="he-contract-form">
        <div className="he-contract-fields">
          <div className="he-contract-field">
            <div className="he-contract-field-label">Contract type</div>
            <div className="he-contract-field-value">Permanent</div>
          </div>
          <div className="he-contract-field">
            <div className="he-contract-field-label">Start date</div>
            <div className="he-contract-field-value">01/04/2020</div>
          </div>
          <div className="he-contract-field">
            <div className="he-contract-field-label">Weekly contracted hours</div>
            <div className="he-contract-field-value">37.5 hrs</div>
          </div>
          <div className="he-contract-field">
            <div className="he-contract-field-label">Employee finish date</div>
            <div className="he-datepicker-wrap">
              <DatePicker
                selected={finishDate}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                calendarStartDay={1}
                popperPlacement="bottom"
                customInput={<FinishDateInput />}
              />
            </div>
          </div>
        </div>
        <div className="he-contract-footer">
          <button className="round-btn secondary-btn" onClick={() => {}}>Cancel</button>
          <button className="round-btn primary-btn" onClick={handleSave}>Save contract</button>
        </div>
      </div>

      {showModal && (
        <Modal title="Leaver holiday deduction" onClose={() => setShowModal(false)}>
          <DeductionBody
            overpaidDays={overpaidDays}
            deduction={deduction}
            finishDate={finishDate}
            deductionAdded={deductionAdded}
            onAdd={() => setDeductionAdded(true)}
            onDismiss={() => setShowModal(false)}
          />
        </Modal>
      )}

      {showToast && (
        <div className="he-toast">
          <TickIcon /> Contract saved
        </div>
      )}
    </div>
  )
}


/* ─────────────────────────────────────────────────────────────────────────────
   PRESERVED — Holiday entitlement sections available for future prototypes
   ─────────────────────────────────────────────────────────────────────────────

// Summary stat cards
// <div className="he-summary">
//   <StatCard label="Entitlement"    value={`${year.entitlement.toFixed(1)} days`} />
//   <StatCard label="Adjustment"     value={`${year.adjustment.toFixed(1)} days`} />
//   <StatCard label="Booked & taken" value={`${year.booked.toFixed(1)} days`} />
//   {isOverpaid
//     ? <StatCard label="Overpaid"  value={`${overpaidDays.toFixed(1)} days`} variant="overpaid" />
//     : <StatCard label="Remaining" value={`${Math.max(0, remaining).toFixed(1)} days`} />
//   }
// </div>

// Year navigator
// <div className="he-year-nav">
//   <button className="he-nav-btn" onClick={() => setYearIdx(i => Math.max(0, i-1))} disabled={yearIdx===0}>
//     <ChevronLeft />
//   </button>
//   <span className="he-year-range">{year.range}</span>
//   <button className="he-nav-btn" onClick={() => setYearIdx(i => Math.min(HOLIDAY_YEARS.length-1, i+1))} disabled={yearIdx===HOLIDAY_YEARS.length-1}>
//     <ChevronRight />
//   </button>
// </div>

// Adjustments table (with inline add-row and DatePicker)
// See git history or previous component version for full implementation.
// Requires: PlusIcon, EditIcon, DeleteIcon, XIcon, TableDateInput, fmtAdjDate,
//           addingRow/newAmount/newReason/newDate state, handleSaveRow/handleCancelRow.

// Holiday pay section (Average daily pay card, GPA totals, upload historic pay)
// <section className="he-section">
//   <h1>Holiday pay</h1>
//   <div className="he-info-banner">...</div>
//   <div className="he-pay-row">
//     <div className="he-pay-card">...</div>
//     <div className="he-gpa-card">...</div>
//   </div>
//   <div className="he-upload">...</div>
// </section>

   ───────────────────────────────────────────────────────────────────────────── */
