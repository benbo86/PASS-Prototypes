import { useState, forwardRef } from 'react'
import Select, { components } from 'react-select'
import DatePicker from 'react-datepicker'

// Extracted from holiday-absences/assign-visits-on-holiday/src/HolidayAbsenceDialog.jsx
// (now that prototype's src/AddHolidayOrAbsencePage.jsx) so it can be reused
// and pre-populated from other flows (e.g. schedule/leave-requests' Approve
// action) — the original was a standalone demo with zero props and no real
// close/confirm callbacks. All props default to that original's own
// hardcoded values, so a caller that renders this with no props at all gets
// byte-for-byte the same look/behaviour as before this extraction.
//
// Renders only the modal box itself (`.modal.modal-add-absence`) — no
// scrim/overlay/page chrome — so callers decide how to frame it: a full-page
// `.modal-page-wrap` for a bare demo page, or a `.modal-overlay` scrim over
// real page content elsewhere.

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <polygon fill="currentColor" stroke="currentColor" strokeLinejoin="round"
      points="18 7.2 16.8 6 12 10.8 7.2 6 6 7.2 10.8 12 6 16.8 7.2 18 12 13.2 16.8 18 18 16.8 13.2 12" />
  </svg>
)

const CalendarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0.9024, 0.7143)" fillRule="nonzero">
      <path fill="currentColor" d="M8.4375,13.5 L6.5625,13.5 C6.253125,13.5 6,13.246875 6,12.9375 L6,11.0625
        C6,10.753125 6.253125,10.5 6.5625,10.5 L8.4375,10.5 C8.746875,10.5 9,10.753125 9,11.0625 L9,12.9375
        C9,13.246875 8.746875,13.5 8.4375,13.5 Z M13.5,12.9375 L13.5,11.0625 C13.5,10.753125 13.246875,10.5
        12.9375,10.5 L11.0625,10.5 C10.753125,10.5 10.5,10.753125 10.5,11.0625 L10.5,12.9375
        C10.5,13.246875 10.753125,13.5 11.0625,13.5 L12.9375,13.5 C13.246875,13.5 13.5,13.246875
        13.5,12.9375 Z M18,12.9375 L18,11.0625 C18,10.753125 17.746875,10.5 17.4375,10.5 L15.5625,10.5
        C15.253125,10.5 15,10.753125 15,11.0625 L15,12.9375 C15,13.246875 15.253125,13.5 15.5625,13.5
        L17.4375,13.5 C17.746875,13.5 18,13.246875 18,12.9375 Z M13.5,17.4375 L13.5,15.5625
        C13.5,15.253125 13.246875,15 12.9375,15 L11.0625,15 C10.753125,15 10.5,15.253125 10.5,15.5625
        L10.5,17.4375 C10.5,17.746875 10.753125,18 11.0625,18 L12.9375,18 C13.246875,18 13.5,17.746875
        13.5,17.4375 Z M9,17.4375 L9,15.5625 C9,15.253125 8.746875,15 8.4375,15 L6.5625,15
        C6.253125,15 6,15.253125 6,15.5625 L6,17.4375 C6,17.746875 6.253125,18 6.5625,18 L8.4375,18
        C8.746875,18 9,17.746875 9,17.4375 Z M18,17.4375 L18,15.5625 C18,15.253125 17.746875,15
        17.4375,15 L15.5625,15 C15.253125,15 15,15.253125 15,15.5625 L15,17.4375
        C15,17.746875 15.253125,18 15.5625,18 L17.4375,18 C17.746875,18 18,17.746875 18,17.4375 Z
        M22.5,5.25 L22.5,21.75 C22.5,22.9921875 21.4921875,24 20.25,24 L3.75,24
        C2.5078125,24 1.5,22.9921875 1.5,21.75 L1.5,5.25 C1.5,4.0078125 2.5078125,3 3.75,3 L6,3
        L6,0.5625 C6,0.253125 6.253125,0 6.5625,0 L8.4375,0 C8.746875,0 9,0.253125 9,0.5625 L9,3
        L15,3 L15,0.5625 C15,0.253125 15.253125,0 15.5625,0 L17.4375,0 C17.746875,0 18,0.253125
        18,0.5625 L18,3 L20.25,3 C21.4921875,3 22.5,4.0078125 22.5,5.25 Z M20.25,21.46875
        L20.25,7.5 L3.75,7.5 L3.75,21.46875 C3.75,21.6234375 3.8765625,21.75 4.03125,21.75
        L19.96875,21.75 C20.1234375,21.75 20.25,21.6234375 20.25,21.46875 Z" />
    </g>
  </svg>
)

const ClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0.0374, 0.7143)" fillRule="nonzero">
      <path fill="currentColor" d="M12,0.375 C5.578125,0.375 0.375,5.578125 0.375,12
        C0.375,18.421875 5.578125,23.625 12,23.625 C18.421875,23.625 23.625,18.421875 23.625,12
        C23.625,5.578125 18.421875,0.375 12,0.375 Z M12,21.375 C6.8203125,21.375 2.625,17.1796875
        2.625,12 C2.625,6.8203125 6.8203125,2.625 12,2.625 C17.1796875,2.625 21.375,6.8203125
        21.375,12 C21.375,17.1796875 17.1796875,21.375 12,21.375 Z M14.896875,16.48125
        L10.9171875,13.5890625 C10.771875,13.48125 10.6875,13.3125 10.6875,13.134375
        L10.6875,5.4375 C10.6875,5.128125 10.940625,4.875 11.25,4.875 L12.75,4.875
        C13.059375,4.875 13.3125,5.128125 13.3125,5.4375 L13.3125,12.0796875
        L16.44375,14.3578125 C16.696875,14.540625 16.7484375,14.8921875 16.565625,15.1453125
        L15.684375,16.359375 C15.5015625,16.6078125 15.15,16.6640625 14.896875,16.48125 Z" />
    </g>
  </svg>
)

const WarningIcon = () => (
  <svg className="warning-icon" width="24" height="24" viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path fill="currentColor" d="M10.27,3.99 C11.04,2.66 12.96,2.66 13.73,3.99 L21.26,17
      C22.03,18.33 21.07,20 19.53,20 L4.47,20 C2.93,20 1.97,18.33 2.74,17 Z M12,15
      C11.45,15 11,15.45 11,16 C11,16.55 11.45,17 12,17 C12.55,17 13,16.55 13,16
      C13,15.45 12.55,15 12,15 Z M12,7 C11.45,7 11,7.45 11,8 L11,12 C11,12.55 11.45,13
      12,13 C12.55,13 13,12.55 13,12 L13,8 C13,7.45 12.55,7 12,7 Z" />
  </svg>
)

const DropdownIndicator = (props) => (
  <components.DropdownIndicator {...props}>
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <polygon fill="currentColor" points="16.6 8.6 12 13.2 7.4 8.6 6 10 12 16 18 10" />
    </svg>
  </components.DropdownIndicator>
)

const DateInput = forwardRef(({ value, onClick }, ref) => (
  <div className="input-wrap">
    <input ref={ref} type="text" value={value || ''} onClick={onClick} onChange={() => {}} readOnly />
    <span className="input-icon" onClick={onClick}><CalendarIcon /></span>
  </div>
))
DateInput.displayName = 'DateInput'

const TimeInput = forwardRef(({ value, onClick }, ref) => (
  <div className="input-wrap">
    <input ref={ref} type="text" value={value || ''} onClick={onClick} onChange={() => {}} readOnly />
    <span className="input-icon" onClick={onClick}><ClockIcon /></span>
  </div>
))
TimeInput.displayName = 'TimeInput'

const SELECT_STYLES = {
  control: (base, { isFocused }) => ({
    ...base,
    border: `1.5px solid ${isFocused ? '#9a26d6' : '#cac6d7'}`,
    borderRadius: 8,
    boxShadow: 'none',
    fontFamily: 'inherit',
    fontSize: 16,
    fontWeight: 500,
    cursor: 'pointer',
    '&:hover': { borderColor: isFocused ? '#9a26d6' : '#cac6d7' },
  }),
  valueContainer: (base) => ({ ...base, padding: '10px 14px' }),
  singleValue: (base) => ({ ...base, color: '#333', margin: 0 }),
  placeholder: (base) => ({ ...base, color: '#333' }),
  input: (base) => ({ ...base, margin: 0, padding: 0, color: '#333' }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({
    ...base,
    color: '#968caf',
    padding: '8px 10px 8px 0',
    '&:hover': { color: '#968caf' },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 8,
    border: '1.5px solid #cac6d7',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    marginTop: 4,
  }),
  menuList: (base) => ({ ...base, padding: 0 }),
  option: (base, { isSelected, isFocused }) => ({
    ...base,
    fontSize: 16,
    fontWeight: 500,
    color: isSelected ? '#fff' : '#333',
    backgroundColor: isSelected ? '#9a26d6' : isFocused ? '#f3f4f6' : '#fff',
    cursor: 'pointer',
    '&:active': { backgroundColor: '#8421b8' },
  }),
}

export const EMPLOYEES = [
  { value: 'amirah', label: 'Amirah Marsden' },
  { value: 'sarah',  label: 'Sarah Mitchell' },
  { value: 'james',  label: 'James Okafor' },
]

export const ABSENCE_TYPES = [
  { value: 'holiday',   label: 'Holiday' },
  { value: 'sickness',  label: 'Sickness' },
  { value: 'other',     label: 'Other' },
]

export default function HolidayAbsenceDialog({
  employee: employeeProp,
  absenceType: absenceTypeProp,
  startDate: startDateProp,
  endDate: endDateProp,
  startTime: startTimeProp,
  endTime: endTimeProp,
  daysDeducted = 1,
  deductedLabel = 'Days deducted',
  showVisitsStep = true,
  onClose,
  onConfirm,
}) {
  const [step,        setStep]        = useState(1)
  const [employee,    setEmployee]    = useState(employeeProp || EMPLOYEES[0])
  const [absenceType, setAbsenceType] = useState(absenceTypeProp || ABSENCE_TYPES[0])
  const [startDate,   setStartDate]   = useState(startDateProp || new Date(2026, 3, 30))
  const [endDate,     setEndDate]     = useState(endDateProp || new Date(2026, 4, 1))
  const [startTime,   setStartTime]   = useState(startTimeProp || new Date(2026, 0, 1, 0, 0))
  const [endTime,     setEndTime]     = useState(endTimeProp || new Date(2026, 0, 1, 0, 0))
  const [option,      setOption]      = useState('keep')

  // Skips straight to confirming when the visits-affected warning/choice
  // (step 2) doesn't apply to the calling flow — e.g. a leave request being
  // approved has no "visits already assigned" context to weigh in on.
  const handlePrimary = () => {
    if (showVisitsStep) {
      setStep(2)
    } else {
      onConfirm?.({ employee, absenceType, startDate, endDate, startTime, endTime, option: null })
    }
  }

  return (
    <div className="modal modal-add-absence">
      <button className="modal-close-btn" aria-label="Close" onClick={onClose}><CloseIcon /></button>

      {step === 1 && (
        <div>
          <h1>Add a Holiday or Absence</h1>

          <div className="field">
            <label htmlFor="employee">Employee</label>
            <Select
              inputId="employee"
              options={EMPLOYEES}
              value={employee}
              onChange={setEmployee}
              styles={SELECT_STYLES}
              components={{ DropdownIndicator }}
            />
          </div>

          <div className="field">
            <label htmlFor="absence-type">Absence type</label>
            <Select
              inputId="absence-type"
              options={ABSENCE_TYPES}
              value={absenceType}
              onChange={setAbsenceType}
              styles={SELECT_STYLES}
              components={{ DropdownIndicator }}
            />
          </div>

          <div className="entitlement PASSBodyBody-Std">
            <div>Holiday entitlement year: 2026 – 2027</div>
            <div>Scheme name: Everylife</div>
            <div>Entitlement: 28 days</div>
            <div>Adjustment: 0 days</div>
            <div>Booked &amp; taken: 0 days</div>
            <div>Remaining: 28 days</div>
          </div>

          <div className="date-row field">
            <div>
              <label>Start date</label>
              <DatePicker
                selected={startDate}
                onChange={setStartDate}
                dateFormat="dd/MM/yyyy"
                customInput={<DateInput />}
              />
            </div>
            <div>
              <label>End date</label>
              <DatePicker
                selected={endDate}
                onChange={setEndDate}
                dateFormat="dd/MM/yyyy"
                customInput={<DateInput />}
              />
            </div>
          </div>

          <div className="time-row field">
            <div>
              <label>Start time</label>
              <DatePicker
                selected={startTime}
                onChange={setStartTime}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="HH:mm"
                timeFormat="HH:mm"
                customInput={<TimeInput />}
              />
            </div>
            <div>
              <label>End time</label>
              <DatePicker
                selected={endTime}
                onChange={setEndTime}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="HH:mm"
                timeFormat="HH:mm"
                customInput={<TimeInput />}
              />
            </div>
            <div>
              <label htmlFor="days-deducted">{deductedLabel}</label>
              <input type="text" id="days-deducted" value={daysDeducted} readOnly />
            </div>
          </div>

          <div className="btn-row">
            <button className="round-btn primary-btn" onClick={handlePrimary}>Add absence</button>
          </div>
        </div>
      )}

      {step === 2 && showVisitsStep && (
        <div>
          <h2>Add a Holiday or Absence</h2>

          <div className="warning-banner">
            <WarningIcon />
            <div>
              <h4>Warning</h4>
              <ul>
                <li>4 visits are assigned during this period. What would you like to do with them?</li>
              </ul>
            </div>
          </div>

          {['keep', 'unassign'].map((key) => (
            <div
              key={key}
              className={`option-card${option === key ? ' selected' : ''}`}
              onClick={() => setOption(key)}
              role="radio"
              aria-checked={option === key}
            >
              <div className={`radio${option === key ? ' checked' : ''}`} />
              <div>
                <p className="opt-title">
                  {key === 'keep' ? 'Keep assigned' : 'Move to unassigned'}
                </p>
                <p className="opt-desc PASSBodyBody-Sml">
                  {key === 'keep'
                    ? 'The employee will still carry out these visits during their holiday period.'
                    : 'Visits are unassigned to be allocated to another carer.'}
                </p>
              </div>
            </div>
          ))}

          <div className="btn-row">
            <button className="round-btn secondary-btn" onClick={() => setStep(1)}>Back</button>
            <button
              className="round-btn primary-btn"
              onClick={() => onConfirm?.({ employee, absenceType, startDate, endDate, startTime, endTime, option })}
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
