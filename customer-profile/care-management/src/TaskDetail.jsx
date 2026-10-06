import { forwardRef, useState } from 'react'
import DatePicker from 'react-datepicker'
import BodyMap from './BodyMap'
import { TaskTypeIcon, FaPlusIcon, InfoIcon } from './icons.jsx'
import {
  TASK_TYPES, OUTCOMES, VISITS, SUPPORT_OPTIONS, CONTROL_CATEGORIES,
  WEEKDAYS, MONTH_DATES, CADENCE_UNITS, CADENCE_INTERVALS, blankCadence, blankScheduledTime,
  untilTime, toMinutes, cadenceUsesDays, invalidScheduleRows, SCHEDULE_TIME_WARNING,
} from './data'

// ─── Icons ────────────────────────────────────────────────────

// CalendarIcon from the PASS icon library (customer-profile/service-agreement/
// src/VisitPanel.jsx) — copied verbatim.
const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
)

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
)

const AddCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
  </svg>
)

// Icons/Remove Circle.svg
const RemoveCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 11v2h10v-2H7zm5-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
  </svg>
)

// Icons/Warning Outline.svg
const WarningOutlineIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z" />
  </svg>
)

// ─── Small local components ───────────────────────────────────

function Checkbox({ checked, onChange, children }) {
  return (
    <label className="checkbox-wrap cm-check">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="checkbox-box" />
      <span>{children}</span>
    </label>
  )
}

export function Field({ label, required, children, className = '' }) {
  return (
    <div className={`cm-field ${className}`}>
      <label className="cm-label">{label}{required && <span className="cm-required">*</span>}</label>
      {children}
    </div>
  )
}

// Matches the live task page's status control: a full-width outlined box
// split in two, the selected half filled (green for Active).
function StatusToggle({ value, onChange }) {
  const options = [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]
  return (
    <div className="cm-status-toggle" role="radiogroup" aria-label="Status">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          className={`cm-status-option cm-status-option--${opt.value}${value === opt.value ? ' selected' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

const toDate = (iso) => (iso ? new Date(`${iso}T00:00:00`) : null)
const toIso = (d) => {
  if (!d) return null
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const DateTrigger = forwardRef(({ value, onClick }, ref) => (
  <button ref={ref} type="button" className="cm-date-trigger" onClick={onClick}>
    <span>{value}</span>
    <CalendarIcon />
  </button>
))

export function DateField({ value, onChange }) {
  return (
    <DatePicker
      selected={toDate(value)}
      onChange={d => onChange(toIso(d))}
      dateFormat="dd/MM/yyyy"
      customInput={<DateTrigger />}
    />
  )
}

// ─── Task schedule: cadence + scheduled times ─────────────────

function DayPicker({ days, onChange, label, options = WEEKDAYS, grid = false }) {
  const toggle = d => onChange(days.includes(d) ? days.filter(x => x !== d) : [...days, d])
  return (
    <div className="cm-cadence-week">
      {label && <div className="cm-label">{label}</div>}
      <div className={`cm-cadence-days${grid ? ' cm-cadence-days--grid' : ''}`} role="group" aria-label={label || 'Days'}>
        {options.map(d => (
          <button
            key={d}
            type="button"
            className={`cm-day${days.includes(d) ? ' selected' : ''}`}
            aria-pressed={days.includes(d)}
            onClick={() => toggle(d)}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  )
}

function CadenceEditor({ cadence, onChange }) {
  const set = patch => onChange({ ...cadence, ...patch })
  const days2 = cadence.days2 || []
  const monthDays = cadence.monthDays || []
  const alternate = cadence.unit === 'alternate week'
  const month = cadence.unit === 'month'
  const noDays = month
    ? monthDays.length === 0
    : cadenceUsesDays(cadence.unit) && cadence.days.length === 0 && (!alternate || days2.length === 0)
  return (
    <div className="cm-cadence">
      <div className="cm-cadence-every">
        <span>Every</span>
        <select className="form-select cm-select cm-cadence-interval" value={cadence.every} onChange={e => set({ every: Number(e.target.value) })}>
          {CADENCE_INTERVALS.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <select className="form-select cm-select cm-cadence-unit" value={cadence.unit} onChange={e => set({ unit: e.target.value })}>
          {CADENCE_UNITS.map(u => <option key={u}>{u}</option>)}
        </select>
      </div>
      {cadenceUsesDays(cadence.unit) && (
        <>
          <DayPicker days={cadence.days} onChange={days => set({ days })} label={alternate ? 'Week 1' : null} />
          {alternate && <DayPicker days={days2} onChange={d => set({ days2: d })} label="Week 2" />}
        </>
      )}
      {month && <DayPicker days={monthDays} onChange={d => set({ monthDays: d })} options={MONTH_DATES} grid />}
      {noDays && <div className="cm-field-error">At least one day must be selected</div>}
    </div>
  )
}

const nowMinutes = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes() }
const todayIso = () => new Date().toISOString().slice(0, 10)

function ScheduleTimesEditor({ times, beginsOn, onChange }) {
  const setRow = (i, patch) => onChange(times.map((t, j) => (j === i ? { ...t, ...patch } : t)))
  const removeRow = i => onChange(times.filter((_, j) => j !== i))
  // Live shows this under the rows when the task is already running today
  // and a time has passed.
  const invalidRows = invalidScheduleRows(times)
  const passedToday = beginsOn <= todayIso() && times.some(t => toMinutes(t.at) < nowMinutes())
  return (
    <div className="cm-sched-times">
      <div className="cm-label">Scheduled Times</div>
      <button type="button" className="cm-link-btn cm-link-btn--small" onClick={() => onChange([...times, blankScheduledTime()])}>
        <AddCircleIcon /> Add scheduled time
      </button>
      {times.map((t, i) => {
        const invalid = invalidRows.has(i)
        return (
          <div key={i} className={`cm-sched-row${invalid ? ' invalid' : ''}`}>
            {times.length > 1 && (
              <button type="button" className="cm-sched-remove" onClick={() => removeRow(i)} aria-label="Remove scheduled time">
                <RemoveCircleIcon />
              </button>
            )}
            <span>at</span>
            <input type="time" className="cm-time-input" value={t.at} onChange={e => setRow(i, { at: e.target.value || '00:00' })} aria-label="Start time" />
            <span>for</span>
            <input type="time" className="cm-time-input" value={t.for} onChange={e => setRow(i, { for: e.target.value || '00:00' })} aria-label="Duration" />
            <span>until {untilTime(t)}</span>
            {invalid && <span className="cm-sched-warning" title={SCHEDULE_TIME_WARNING}><WarningOutlineIcon /></span>}
          </div>
        )
      })}
      {passedToday && (
        <div className="cm-sched-note">Occurrences above will not take effect today because they are before the current time</div>
      )}
    </div>
  )
}

// ─── Task detail ──────────────────────────────────────────────

export default function TaskDetail({ task, onChange, readOnly = false }) {
  const [hideInactiveVisits, setHideInactiveVisits] = useState(true)
  const set = (patch) => onChange({ ...task, ...patch })
  const setMed = (patch) => set({ medication: { ...task.medication, ...patch } })
  const toggleIn = (list, item, on) => (on ? [...list, item] : list.filter(x => x !== item))

  const isMed = task.type === 'Medication'
  const typeLocked = task.id !== null
  const shownVisits = hideInactiveVisits ? VISITS.filter(v => v.active) : VISITS

  return (
    // `readOnly` (a change awaiting approval): a disabled <fieldset> locks
    // every native control inside it in one go; the body map's SVG zones
    // aren't form controls, so BodyMap gets its own flag.
    <fieldset className="cm-detail-card" disabled={readOnly}>
      {/* ── Left column ─────────────────────────────────────── */}
      <div className="cm-detail-col">
        <Field label="Task Type">
          {/* Locked once a task exists (matches the live page, where the
              type shows greyed out); only a new task can pick its type. */}
          <div className={`cm-type-select${typeLocked ? ' locked' : ''}`}>
            <span className={`cm-type-select-icon cm-type-select-icon--${task.type.toLowerCase()}`}>
              {isMed ? <FaPlusIcon /> : <TaskTypeIcon type={task.type} size={18} />}
            </span>
            <select
              className="cm-type-select-input"
              value={task.type}
              disabled={typeLocked}
              onChange={e => set({ type: e.target.value })}
            >
              {TASK_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <span className="cm-type-select-caret" aria-hidden="true" />
          </div>
        </Field>

        <Field label={isMed ? 'Medication Name' : 'Task Name'} required>
          <div className="cm-input-clear-wrap">
            <input className="form-input" value={task.name} onChange={e => set({ name: e.target.value })} />
            {task.name && (
              <button type="button" className="cm-input-clear" onClick={() => set({ name: '' })} aria-label="Clear">
                <CloseIcon />
              </button>
            )}
          </div>
        </Field>

        <Field label="Task Schedule">
          <div className="cm-box cm-schedule">
            <div className="cm-schedule-row">
              <div>
                <div className="cm-label">Begins on</div>
                <DateField value={task.beginsOn} onChange={v => set({ beginsOn: v })} />
              </div>
              <Checkbox checked={!!task.endsOn} onChange={on => set({ endsOn: on ? task.beginsOn : null })}>End?</Checkbox>
              {task.endsOn && (
                <div>
                  <div className="cm-label">Ends on</div>
                  <DateField value={task.endsOn} onChange={v => set({ endsOn: v })} />
                </div>
              )}
            </div>
            {task.cadence ? (
              <>
                <button type="button" className="cm-link-btn" onClick={() => set({ cadence: null })}><RemoveCircleIcon /> Remove cadence</button>
                <CadenceEditor cadence={task.cadence} onChange={cadence => set({ cadence })} />
              </>
            ) : (
              <button type="button" className="cm-link-btn" onClick={() => set({ cadence: blankCadence() })}><AddCircleIcon /> Add cadence</button>
            )}
            {task.scheduleTimes ? (
              <>
                <button type="button" className="cm-link-btn" onClick={() => set({ scheduleTimes: null })}><RemoveCircleIcon /> Remove schedule times</button>
                <ScheduleTimesEditor times={task.scheduleTimes} beginsOn={task.beginsOn} onChange={scheduleTimes => set({ scheduleTimes })} />
              </>
            ) : (
              <button type="button" className="cm-link-btn" onClick={() => set({ scheduleTimes: [blankScheduledTime()] })}><AddCircleIcon /> Add schedule times</button>
            )}
          </div>
        </Field>

        {isMed && (
          <Field label="Bodymap">
            <BodyMap zones={task.bodyZones} onChange={bodyZones => set({ bodyZones })} readOnly={readOnly} />
          </Field>
        )}

        {isMed && (
          <Field label="Medication" required>
            <div className="cm-box cm-med-grid">
              <Field label="Form" required>
                <input className="form-input" value={task.medication.form} onChange={e => setMed({ form: e.target.value })} />
              </Field>
              <Field label="Route" required>
                <input className="form-input" value={task.medication.route} onChange={e => setMed({ route: e.target.value })} />
              </Field>
              <Field label="Dosage" required>
                <input className="form-input" value={task.medication.dosage} onChange={e => setMed({ dosage: e.target.value })} />
              </Field>
              <Field label="Control Category">
                <select className="form-select cm-select" value={task.medication.controlCategory} onChange={e => setMed({ controlCategory: e.target.value })}>
                  {CONTROL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Location" className="cm-span-2">
                <input className="form-input" value={task.medication.location} onChange={e => setMed({ location: e.target.value })} />
              </Field>
              <Field label="Support required" required className="cm-support">
                <div className="cm-radio-group">
                  {SUPPORT_OPTIONS.map(opt => (
                    <label key={opt} className="cm-radio">
                      <input
                        type="radio"
                        className="form-radio"
                        name="support"
                        checked={task.medication.support === opt}
                        onChange={() => setMed({ support: opt })}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="Schedule">
                <Checkbox checked={task.medication.prn} onChange={prn => setMed({ prn })}>PRN</Checkbox>
              </Field>
            </div>
          </Field>
        )}

        <Field label="Description">
          <textarea
            className="form-textarea cm-description"
            rows={10}
            value={task.description}
            onChange={e => set({ description: e.target.value })}
          />
        </Field>
      </div>

      {/* ── Right column ────────────────────────────────────── */}
      <div className="cm-detail-col">
        <Field label="Status">
          <StatusToggle value={task.status} onChange={status => set({ status })} />
        </Field>

        <Field label="Completion options">
          <div className="cm-box cm-stack">
            <Checkbox checked={task.allowRetry} onChange={allowRetry => set({ allowRetry })}>Allow Retry</Checkbox>
            <Checkbox checked={task.requireWitness} onChange={requireWitness => set({ requireWitness })}>Require Witness</Checkbox>
          </div>
        </Field>

        <Field label="Visits">
          <div className="cm-box cm-visits">
            <div className="cm-stack">
              {shownVisits.map(v => (
                <Checkbox
                  key={v.id}
                  checked={task.visitIds.includes(v.id)}
                  onChange={on => set({ visitIds: toggleIn(task.visitIds, v.id, on) })}
                >
                  <span className="cm-visit-label">
                    {v.label} ({v.detail}){!v.active && ' — Inactive'}
                    <span className="cm-info" title="Visit details"><InfoIcon /></span>
                  </span>
                </Checkbox>
              ))}
            </div>
            <div className="cm-visits-meta">
              <Checkbox checked={hideInactiveVisits} onChange={setHideInactiveVisits}>Hide inactive visits</Checkbox>
              <span className="cm-muted">Displaying {shownVisits.length} out of {VISITS.length} visits</span>
            </div>
          </div>
        </Field>

        <Field label="Outcomes aided">
          <div className="cm-box cm-stack">
            {OUTCOMES.map(o => (
              <Checkbox
                key={o}
                checked={task.outcomes.includes(o)}
                onChange={on => set({ outcomes: toggleIn(task.outcomes, o, on) })}
              >
                {o}
              </Checkbox>
            ))}
          </div>
        </Field>

        <Field label="Alerts">
          <div className="cm-box cm-stack">
            <div className="cm-label">Raise alerts for this task</div>
            <Checkbox checked={task.alerts.missed} onChange={missed => set({ alerts: { ...task.alerts, missed } })}>
              <span className="cm-visit-label">Missed <span className="cm-info" title="Raised when the visit is missed"><InfoIcon /></span></span>
            </Checkbox>
            <Checkbox checked={task.alerts.notDone} onChange={notDone => set({ alerts: { ...task.alerts, notDone } })}>
              Not done (no reason given)
            </Checkbox>
            <Checkbox checked={task.alerts.incomplete} onChange={incomplete => set({ alerts: { ...task.alerts, incomplete } })}>
              Incomplete (with reason given)
            </Checkbox>
          </div>
        </Field>
      </div>
    </fieldset>
  )
}
