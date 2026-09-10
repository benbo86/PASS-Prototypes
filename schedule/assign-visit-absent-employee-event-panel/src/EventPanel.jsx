import { useRef } from 'react'
import DevToolbar from '../../../Components/DevToolbar'
import DevMode from '../../../Components/DevMode'
import DevComments from '../../../Components/DevComments'
import DevEdit from '../../../Components/DevEdit'
import WireframeToggle from '../../../Components/WireframeToggle'
import AuditCapture from '../../../Components/AuditCapture'
import SharedEventPanel from '../../../Components/EventPanel'

// This page used to be a single, self-contained EventPanel component —
// it's now a thin wrapper around Components/EventPanel.jsx (extracted so
// schedule/daily-schedule's own Unassigned-visit assign flow could reuse
// the exact same panel instead of a parallel one). Every value below is
// the same hardcoded demo data this page always had; only the shape
// changed (props instead of inline consts/JSX) — see Components/
// EventPanel.jsx's own header comment for what else came with the move.

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <polygon fill="currentColor" points="15.4 7.4 14 6 8 12 14 18 15.4 16.6 10.8 12" />
  </svg>
)

const CUSTOMER_PORTRAIT = 'https://www.figma.com/api/mcp/asset/c836424c-78f6-40fe-a96c-5526bcc2f9f9'

const RECOMMENDED_EMPLOYEES = [
  {
    id: 1, name: 'Katheryn Perry', title: 'Mrs', type: 'Fulltime',
    visited: '66 in last 30d', travel: '1.2 miles', fill: 68,
    avatarBg: 'var(--availability-3-green-tint)',
    onHoliday: true,
  },
  {
    id: 2, name: 'Sarah Mitchell', title: 'Ms', type: 'Part time',
    visited: '42 in last 30d', travel: '0.8 miles', fill: 45,
    avatarBg: 'var(--availability-4-blue-tint)',
  },
  {
    id: 3, name: 'James Thornton', title: 'Mr', type: 'Variable',
    visited: '31 in last 30d', travel: '2.1 miles', fill: 30,
    avatarBg: 'var(--availability-6-mauve-tint)',
  },
]

const TOTAL_SLOTS = 2

export default function EventPanel() {
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
      <div ref={pageRef} style={{ display: 'contents' }}>
        <a href="../../" className="back-link ep-back-link">
          <ChevronLeftIcon /> Prototypes
        </a>

        <SharedEventPanel
          statusBadge={{ label: 'Booked', tone: 'purple' }}
          customerAvatarUrl={CUSTOMER_PORTRAIT}
          customerName="Mr David Farrington"
          visitLabel="Lunchtime visit"
          visitKindLabel="Care visit"
          initialDateISO="2024-09-26"
          initialStart="12:00"
          initialEnd="13:00"
          plannedStart="12:00"
          plannedEnd="13:00"
          recurrenceText="10 days, bi-weekly"
          employeesRequired={TOTAL_SLOTS}
          initialSlots={Array(TOTAL_SLOTS).fill(null)}
          recommendedEmployees={RECOMMENDED_EMPLOYEES}
        />
      </div>
    </>
  )
}
