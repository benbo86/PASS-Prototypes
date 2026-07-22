import { useState, useEffect, useRef } from 'react'
import SideNav from '../../../Components/SideNav'
import TopNav from '../../../Components/TopNav'
import CustomerProfileNav from '../../../Components/CustomerProfileNav'
import DevMode from '../../../Components/DevMode'

// ─── Icons ────────────────────────────────────────────────────

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)

const ArrowLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z"/>
  </svg>
)

const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 13h12.17l-5.59 5.59L12 20l8-8-8-8-1.41 1.41L16.17 11H4z"/>
  </svg>
)

// Not currently used — CANCELLED bubbles use a CSS diagonal line instead
// (see .bubble-item.CANCELLED in mar-legacy.css). Kept in case we revisit
// an icon-based treatment.
const CancelledIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/>
  </svg>
)

const MedicationIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
)

// ─── Data ─────────────────────────────────────────────────────
// Full calendar month (July 2026) — matches the current system date
// (Mon 6 Jul 2026) so "today" highlighting lines up. The grid scrolls
// horizontally (.marsheet-timeline-panel { overflow-x: scroll }) so
// all days remain reachable.

const RANGE_START = new Date(2026, 6, 1) // 1 Jul 2026
const TODAY = new Date(2026, 6, 6)       // 6 Jul 2026 (Monday)
const DAYS_IN_MONTH = new Date(2026, 7, 0).getDate() // 31

const DAYS = Array.from({ length: DAYS_IN_MONTH }, (_, i) => {
  const d = new Date(RANGE_START)
  d.setDate(RANGE_START.getDate() + i)
  return d
})

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function isToday(d) { return d.toDateString() === TODAY.toDateString() }
function fmtRangeDate(d) { return `${WEEKDAY[d.getDay()]} ${d.getDate()} ${MONTH[d.getMonth()]} ${d.getFullYear()}` }

// Pad a partial set of cells out to a full month with FUTURE.
function withFuture(cells) {
  return Array.from({ length: DAYS_IN_MONTH }, (_, i) => cells[i] ?? { status: 'FUTURE' })
}

// Shorthand for a cell carrying popover detail: c('COMPLETE', {...}).
function c(status, extra) { return { status, ...extra } }

const KAREN = { firstName: 'Karen', lastName: 'Bailey' }
const TOM = { firstName: 'Tom', lastName: 'Harris' }

const CANCELLED_VISIT = {
  reason: 'Customer cancelled',
  notes: "Customer called the office to cancel today's visit — hospital appointment ran over.",
}

// Statuses with real visit/task detail worth showing in a popover —
// matches the original's cursor:pointer/pointer-events:auto bubble
// states. CANCELLED is our own addition (AIOP-22638) with a simpler
// popover, since none of the usual visit fields apply to a visit that
// never took place.
const CLICKABLE = new Set(['COMPLETE', 'NOTREQUIRED', 'PARTIAL', 'INCOMPLETE', 'CANCELLED'])

// Cancelled visit lands on 3 Jul 2026 — every task/visit that day
// is marked CANCELLED, matching the ticket's "all tasks within the
// visit are also marked as Cancelled" requirement.

const TASKS = [
  {
    name: 'Medi Derma cream',
    supportRequired: 'Administer',
    startsEnds: '19/03/2026 to ongoing',
    route: 'Topical',
    form: 'Cream',
    dosage: '1 x pea sized amount',
    notes: 'Please administer a small pea sized amount to my bottom after personal care. Wear clean PPE and wash your hands before and after use.',
    visits: [
      {
        name: 'Personal care',
        time: '09:30 - 10:30',
        cells: withFuture([
          c('COMPLETE', { cw: KAREN, completedDateTime: '01/07/2026 09:47', scheduledStart: '01/07/2026 09:30', scheduledEnd: '01/07/2026 10:30', visitStart: '01/07/2026 09:32', visitEnd: '01/07/2026 09:58' }),
          c('COMPLETE', { cw: KAREN, completedDateTime: '02/07/2026 09:41', scheduledStart: '02/07/2026 09:30', scheduledEnd: '02/07/2026 10:30', visitStart: '02/07/2026 09:33', visitEnd: '02/07/2026 09:55' }),
          c('CANCELLED', CANCELLED_VISIT),
          c('COMPLETE', { cw: TOM, completedDateTime: '04/07/2026 09:50', scheduledStart: '04/07/2026 09:30', scheduledEnd: '04/07/2026 10:30', visitStart: '04/07/2026 09:34', visitEnd: '04/07/2026 09:59' }),
          { status: 'MISSED' },
          c('COMPLETE', { cw: KAREN, completedDateTime: '06/07/2026 09:44', scheduledStart: '06/07/2026 09:30', scheduledEnd: '06/07/2026 10:30', visitStart: '06/07/2026 09:31', visitEnd: '06/07/2026 09:53' }),
        ]),
      },
    ],
  },
  {
    name: 'Paracetamol 500mg',
    supportRequired: 'Prompt',
    startsEnds: '02/01/2026 to ongoing',
    route: 'Oral',
    form: 'Tablet',
    dosage: '2 tablets',
    notes: 'For pain relief as required. Do not exceed 8 tablets in 24 hours.',
    visits: [
      {
        name: 'Morning call',
        time: '08:00 - 09:00',
        cells: withFuture([
          c('COMPLETE', { cw: KAREN, completedDateTime: '01/07/2026 08:12', scheduledStart: '01/07/2026 08:00', scheduledEnd: '01/07/2026 09:00', visitStart: '01/07/2026 08:05', visitEnd: '01/07/2026 08:20' }),
          c('PARTIAL', { cw: KAREN, reasonName: 'Refused, will retry', completedDateTime: '02/07/2026 08:15', scheduledStart: '02/07/2026 08:00', scheduledEnd: '02/07/2026 09:00', visitStart: '02/07/2026 08:06', visitEnd: '02/07/2026 08:18' }),
          c('CANCELLED', CANCELLED_VISIT),
          c('COMPLETE', { cw: KAREN, completedDateTime: '04/07/2026 08:10', scheduledStart: '04/07/2026 08:00', scheduledEnd: '04/07/2026 09:00', visitStart: '04/07/2026 08:04', visitEnd: '04/07/2026 08:16' }),
          { status: 'POSSIBLE' },
          c('COMPLETE', { cw: KAREN, completedDateTime: '06/07/2026 08:09', scheduledStart: '06/07/2026 08:00', scheduledEnd: '06/07/2026 09:00', visitStart: '06/07/2026 08:03', visitEnd: '06/07/2026 08:14' }),
        ]),
      },
      {
        name: 'Evening call',
        time: '18:00 - 19:00',
        cells: withFuture([
          c('COMPLETE', { cw: TOM, completedDateTime: '01/07/2026 18:22', scheduledStart: '01/07/2026 18:00', scheduledEnd: '01/07/2026 19:00', visitStart: '01/07/2026 18:11', visitEnd: '01/07/2026 18:26' }),
          c('INCOMPLETE', { cw: TOM, completedDateTime: '02/07/2026 18:30', scheduledStart: '02/07/2026 18:00', scheduledEnd: '02/07/2026 19:00', visitStart: '02/07/2026 18:10' }),
          c('CANCELLED', CANCELLED_VISIT),
          c('COMPLETE', { cw: TOM, completedDateTime: '04/07/2026 18:19', scheduledStart: '04/07/2026 18:00', scheduledEnd: '04/07/2026 19:00', visitStart: '04/07/2026 18:08', visitEnd: '04/07/2026 18:24' }),
          c('COMPLETE', { cw: TOM, completedDateTime: '05/07/2026 18:15', scheduledStart: '05/07/2026 18:00', scheduledEnd: '05/07/2026 19:00', visitStart: '05/07/2026 18:07', visitEnd: '05/07/2026 18:21' }),
        ]),
      },
    ],
  },
]

const BUBBLE_CONTENT = {
  COMPLETE: 'KB',
  NOTREQUIRED: 'KB',
  INCOMPLETE: 'TH',
  PARTIAL: '1',
  POSSIBLE: 'X',
  MISSED: '',
  FUTURE: '',
  CANCELLED: '',
}

function initialsOf(cw) { return cw ? `${cw.firstName[0]}${cw.lastName[0]}` : '' }

const LEGEND = [
  { status: 'COMPLETE', content: 'XX', label: 'Task completed (employee initials/reason code)' },
  { status: 'PARTIAL', content: '1', label: 'Task partially completed (reason code)' },
  { status: 'INCOMPLETE', content: 'XX', label: 'Task incomplete (employee initials)' },
  { status: 'MISSED', content: '', label: 'Task missed' },
  { status: 'FUTURE', content: '', label: 'Task to be completed in the future' },
  { status: 'CANCELLED', content: '', label: 'Visit cancelled' },
  { status: 'POSSIBLE', content: 'X', label: 'This medication is self-administered. Any schedule shown indicates the prescribed time for when the medication should be taken.' },
]

const REASON_CODES = [
  '1: Refused, will retry',
  '2: Refused, will not be retried',
  '3: Refused',
  '4: Nausea or Vomiting',
  '5: Hospitalised',
  '6: Social Leave',
  '7: Refused and Destroyed',
  '8: Dose not available',
]

// ─── Bubble ───────────────────────────────────────────────────

function Bubble({ status, legend, content, onClick }) {
  const body = content !== undefined ? content : (BUBBLE_CONTENT[status] ?? '')
  return (
    <div className={`bubble-item ${status}${legend ? ' legend' : ''}`} onClick={onClick}>
      {body}
    </div>
  )
}

// ─── TaskInstancePopover ────────────────────────────────────────
// Mirrors the original's bubbleTooltipPopover.html template, triggered
// from COMPLETE/PARTIAL/INCOMPLETE bubbles. CANCELLED gets its own
// simpler variant — none of the visit/careworker fields below apply to
// a visit that never took place, so it just states what happened.

function TaskInstancePopover({ task, cell, rect, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      // Ignore clicks on bubbles entirely — the bubble's own onClick handles
      // both closing this popover and opening/toggling the next one. If we
      // closed here too (on mousedown, which fires first), the state would
      // already be null by the time the click's toggle check runs, so a
      // second click on the same bubble would reopen it instead of closing.
      if (ref.current && !ref.current.contains(e.target) && !e.target.closest('.bubble-item')) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  const style = {
    position: 'fixed',
    left: rect.left + rect.width / 2,
    top: rect.top,
  }

  if (cell.status === 'CANCELLED') {
    return (
      <div ref={ref} className="task-instance-popover cancelled" style={style}>
        <div className="popover-arrow" />
        <div className="popover-header">
          <div className="popover-header-content">
            <strong>Visit cancelled</strong>
          </div>
        </div>
        <div className="popover-body">
          <div><strong>Reason:</strong> {cell.reason}</div>
          {cell.notes && <div className="cancelled-notes">{cell.notes}</div>}
        </div>
      </div>
    )
  }

  return (
    <div ref={ref} className="task-instance-popover" style={style}>
      <div className="popover-arrow" />
      <div className="popover-header">
        <div className="popover-header-content clearfix">
          <div className="cw-profile">
            <div className="profile-image">{initialsOf(cell.cw)}</div>
          </div>
          <div className="options">
            <div className="option">
              <div className="cw-name">{cell.cw?.firstName}</div>
              <div className="cw-name">{cell.cw?.lastName}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="popover-body">
        {cell.reasonName && (
          <div className="reason-info">
            <div className="medName">{task.name}</div>
            <div>:</div>
            <div className="refused-reason-name">{cell.reasonName}</div>
          </div>
        )}
        <div><strong>Task completed:</strong> <span>{cell.completedDateTime}</span></div>
        {cell.scheduledStart && (
          <div>
            <strong>Visit start (scheduled):</strong> <span>{cell.scheduledStart}</span><br />
            <strong>Visit end (scheduled):</strong> <span>{cell.scheduledEnd}</span>
          </div>
        )}
        {cell.visitStart && (
          <div>
            <strong>Visit start (completed):</strong> <span>{cell.visitStart}</span>
            {cell.visitEnd && <><br /><strong>Visit end (completed):</strong> <span>{cell.visitEnd}</span></>}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────

export default function App() {
  const pageRef = useRef(null)
  const [popover, setPopover] = useState(null) // { task, cell, rect }

  const handleBubbleClick = (e, task, cell) => {
    if (!CLICKABLE.has(cell.status)) return
    const rect = e.currentTarget.getBoundingClientRect()
    setPopover(prev => (prev && prev.cell === cell ? null : { task, cell, rect }))
  }

  return (
    <div className="page" ref={pageRef}>
      <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>

      <SideNav activeItem="customers" />

      <div className="page-body">
      <TopNav />
      <CustomerProfileNav activeTab="MAR Chart" />

      <div className="content-area">
        <div className="mar-top-panel">
          <div className="mar-person-info">
            <div><b>DOB</b>12/12/1945</div>
            <div><b>Address</b>3 Morgan Way, Woodford Green, IG8 8DL</div>
            <div><b>GP Name</b>Dr Illes</div>
          </div>

          <div className="mar-controls-col">
            <div className="mar-date-nav">
              <button aria-label="Previous month"><ArrowLeftIcon /></button>
              <span className="mar-date-range">{fmtRangeDate(DAYS[0])} – {fmtRangeDate(DAYS[DAYS.length - 1])}</span>
              <button aria-label="Next month"><ArrowRightIcon /></button>
            </div>
            <label className="mar-hide-self-admin">
              <input type="checkbox" />
              Hide self-administer medications
            </label>
          </div>
        </div>

        <div className="mar-legacy">
          <div id="eltList" className="list-group marsheet">
            <div className="marsheet-page-body">
              <div className="marsheet-container">
                <div className="marsheet-timeline-panel">
                  <div className="marsheet_timeline-days-panel">
                    {TASKS.map(task => (
                      <table className="tasks-container" key={task.name}>
                        <tbody>
                          <tr className="marsheet-task-info-panel">
                            <td className="marsheet_timeline-medication-panel">
                              <div className="labelList">
                                <div className="etlLabel med">
                                  <div className="pull-left">
                                    <div className="label-icon-bg"><div className="icon"><MedicationIcon /></div></div>
                                    <div className="label-icon-bg-point"></div>
                                  </div>
                                  <span className="x-task-name">{task.name}</span>
                                </div>
                              </div>
                            </td>
                            <td className="task-info-panels" colSpan={DAYS.length}>
                              <div className="task-info-panels-inner">
                                <div className="task-info-panel second">
                                  <div><label className="control-label">Support required</label> <span>{task.supportRequired}</span></div>
                                  <div><label className="control-label">Starts & Ends</label> <span>{task.startsEnds}</span></div>
                                </div>
                                <div className="task-info-panel third">
                                  <div><label className="control-label">Route</label> <span>{task.route}</span></div>
                                  <div><label className="control-label">Form</label> <span>{task.form}</span></div>
                                </div>
                                <div className="task-info-panel fourth">
                                  <div><label className="control-label">Dosage</label> <span>{task.dosage}</span></div>
                                  <div><label className="control-label">Notes</label> <div className="x-task-notes">{task.notes}</div></div>
                                </div>
                              </div>
                            </td>
                          </tr>

                          <tr className="marsheet-month-container">
                            <td className="marsheet-month-info">July 2026</td>
                            {DAYS.map(d => (
                              <td key={d.toISOString()} className={`marsheet_timeline-day${isToday(d) ? ' today' : ''}`}>
                                {WEEKDAY[d.getDay()]}<br />{d.getDate()}
                              </td>
                            ))}
                          </tr>

                          {task.visits.map(visit => (
                            <tr className="marsheet-visit-row" key={visit.name}>
                              <td className="marsheet-left-info-panel">
                                <div className="marsheet-visit-name">
                                  <div>{visit.name}</div>
                                  <div>{visit.time}</div>
                                </div>
                              </td>
                              {visit.cells.map((cell, i) => (
                                <td key={i} className={`marsheet-task-instance${isToday(DAYS[i]) ? ' today' : ''}`}>
                                  <Bubble
                                    status={cell.status}
                                    onClick={CLICKABLE.has(cell.status) ? (e) => handleBubbleClick(e, task, cell) : undefined}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="reason-codes-wrapper">
              <div className="reason-codes clearfix">
                <div className="reason-code">
                  {LEGEND.map(item => (
                    <div className="bubble-info" key={item.status}>
                      <Bubble status={item.status} legend content={item.content} />
                      <span className="bubble-label">{item.label}</span>
                    </div>
                  ))}
                  <div className="legend-info">
                    <div className="square-info today-info">&nbsp;</div>
                    <span className="bubble-label">Current date</span>
                  </div>
                  <div className="legend-info">
                    <div className="square-info history-info">&nbsp;</div>
                    <span className="bubble-label">Care Plan change on day</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="reason-codes-wrapper">
              <div className="reason-codes clearfix">
                <div className="reason-title">Reason Code:</div>
                {REASON_CODES.map(code => (
                  <div className="reason-code" key={code}><span>{code}</span></div>
                ))}
              </div>
            </div>

            {popover && (
              <TaskInstancePopover
                task={popover.task}
                cell={popover.cell}
                rect={popover.rect}
                onClose={() => setPopover(null)}
              />
            )}
          </div>
        </div>
      </div>
      </div>
      <DevMode containerRef={pageRef} />
    </div>
  )
}
