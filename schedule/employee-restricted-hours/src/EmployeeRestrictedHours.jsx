import { useRef } from 'react'
import DevToolbar from '../../../Components/DevToolbar'
import DevEdit from '../../../Components/DevEdit'
import DevMode from '../../../Components/DevMode'
import DevComments from '../../../Components/DevComments'
import WireframeToggle from '../../../Components/WireframeToggle'
import AuditCapture from '../../../Components/AuditCapture'
import Tooltip from '../../../Components/Tooltip'

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
  </svg>
)

const EllipsisIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
)

// Illustrates showing employees' maximum permitted hours (student visa —
// term-time capped — or benefit restriction) on the schedule swim lane,
// per Ben's wireframe (wireframes/maximum-weekly-hours-employee-restricted.json).
// Confirmed with Ben before/while building:
// 1. The 3rd value + tooltip only render for restricted employees — an
//    unrestricted employee keeps today's plain 2-value "X hrs / Y hrs
//    scheduled" text (not shown in this single-example prototype, but the
//    HoursLine branch below still exists for that case).
// 2. The 3rd number is always bare (no "(term time)" or other inline
//    qualifier, and no "hrs scheduled" suffix) — just "scheduled /
//    contracted / max", since the tooltip is what explains each position.
//    The tooltip's own wording is still conditional on restriction type
//    ("Maximum term time" vs "Maximum weekly hours").
// 3. One combined tooltip covers all 3 numbers together, not one per number.
// 4. No warning/emphasis styling (e.g. strikethrough, colour) for
//    approaching/exceeding the cap — purely informational for now.
// 5. Single example row (Priya, student-visa) — Ben asked to trim this down
//    from an earlier 3-row version that also showed an unrestricted and a
//    benefit-restricted employee side by side.
const EMPLOYEES = [
  {
    id: 2,
    name: 'Priya Sharma',
    initials: 'PS',
    avatarTint: 'green',
    scheduledHours: 15,
    contractedHours: 20,
    restriction: 'student-visa',
    maxHours: 16,
    visits: [
      { customer: 'Margaret Thompson', type: 'Personal care' },
      { customer: 'John Okonkwo', type: 'Domestic support' },
      { customer: 'Elsie Barker', type: 'Medication' },
    ],
  },
]

function HoursLine({ employee }) {
  const { scheduledHours, contractedHours, restriction, maxHours } = employee

  if (!restriction) {
    return (
      <span className="erh-hours-line">
        {scheduledHours} hrs / {contractedHours} hrs scheduled
      </span>
    )
  }

  const isTermTime = restriction === 'student-visa'
  const tooltipText = isTermTime
    ? 'Scheduled / Weekly Contracted / Maximum term time'
    : 'Scheduled / Weekly Contracted / Maximum weekly hours'

  return (
    <Tooltip text={tooltipText} wrapClassName="erh-hours-tooltip-wrap" placement="bottom">
      <span className="erh-hours-line">
        {scheduledHours}h / {contractedHours}h / {maxHours}h
      </span>
    </Tooltip>
  )
}

function EmployeeRow({ employee }) {
  return (
    <div className="erh-row">
      <div className="erh-info">
        <div className={`erh-avatar erh-avatar--${employee.avatarTint}`}>
          {employee.initials}
          <span className="erh-avatar-dot" />
        </div>
        <div className="erh-info-text">
          <div className="erh-name">{employee.name}</div>
          <HoursLine employee={employee} />
        </div>
        <button className="erh-menu-btn" aria-label="Employee options">
          <EllipsisIcon />
        </button>
      </div>
      <div className="erh-timeline">
        <div className="erh-timeline-grid" />
        {employee.visits.map((visit, i) => (
          <div className="erh-visit-card" key={i} style={{ left: `${64 + i * 280}px` }}>
            <div className="erh-visit-customer">{visit.customer}</div>
            <div className="erh-visit-type">{visit.type}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function EmployeeRestrictedHours() {
  const pageRef = useRef(null)

  return (
    <>
      <DevToolbar>
        <DevEdit containerRef={pageRef} prototypeId={window.location.pathname} />
        <DevMode containerRef={pageRef} />
        <DevComments containerRef={pageRef} prototypeId={window.location.pathname} />
        <WireframeToggle />
        <AuditCapture containerRef={pageRef} />
      </DevToolbar>
      <div className="erh-page" ref={pageRef}>
        <a href="../../" className="back-link"><BackIcon /> Prototypes</a>

        <div className="erh-header">
          <h1>Schedule</h1>
          <p className="erh-header-sub">
            Employees with a hours restriction (student visa or benefit-restricted) show a 3rd figure — their
            maximum permitted hours — alongside scheduled/contracted hours. Hover the hours text for what each
            number means.
          </p>
        </div>

        <div className="erh-swimlanes">
          {EMPLOYEES.map(employee => (
            <EmployeeRow key={employee.id} employee={employee} />
          ))}
        </div>
      </div>
    </>
  )
}
