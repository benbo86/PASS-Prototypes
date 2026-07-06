import WebNav from '../../../Components/WebNav'
import CustomerProfileNav from '../../../Components/CustomerProfileNav'

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

// Pad a partial set of cell statuses out to a full month with FUTURE.
function withFuture(cells) {
  return Array.from({ length: DAYS_IN_MONTH }, (_, i) => cells[i] ?? 'FUTURE')
}

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
        cells: withFuture(['COMPLETE', 'COMPLETE', 'CANCELLED', 'COMPLETE', 'MISSED', 'COMPLETE']),
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
        cells: withFuture(['COMPLETE', 'PARTIAL', 'CANCELLED', 'COMPLETE', 'POSSIBLE', 'COMPLETE']),
      },
      {
        name: 'Evening call',
        time: '18:00 - 19:00',
        cells: withFuture(['COMPLETE', 'INCOMPLETE', 'CANCELLED', 'COMPLETE', 'COMPLETE']),
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

function Bubble({ status, legend, content }) {
  const body = content !== undefined ? content : (BUBBLE_CONTENT[status] ?? '')
  return (
    <div className={`bubble-item ${status}${legend ? ' legend' : ''}`}>
      {body}
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────

export default function App() {
  return (
    <div className="page">
      <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>

      <WebNav activePage="customers" />

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
                              {visit.cells.map((status, i) => (
                                <td key={i} className={`marsheet-task-instance${isToday(DAYS[i]) ? ' today' : ''}`}>
                                  <Bubble status={status} />
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
          </div>
        </div>
      </div>
    </div>
  )
}
