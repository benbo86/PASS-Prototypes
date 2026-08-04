import { useRef } from 'react'
import HolidayAbsenceDialog from '../../../Components/HolidayAbsenceDialog'
import DevToolbar from '../../../Components/DevToolbar'
import DevMode from '../../../Components/DevMode'
import DevComments from '../../../Components/DevComments'
import DevEdit from '../../../Components/DevEdit'
import WireframeToggle from '../../../Components/WireframeToggle'
import AuditCapture from '../../../Components/AuditCapture'

// Renamed from this file's original HolidayAbsenceDialog.jsx once the dialog
// itself moved to Components/HolidayAbsenceDialog.jsx (reusable, prop-driven)
// — this is now just the standalone demo's own page shell. Rendered with no
// pre-population props, so HolidayAbsenceDialog's own defaults reproduce
// this page's original look exactly (same hardcoded employee/dates); Close
// stays a no-op and Confirm still just alerts, matching the original demo's
// own (never-wired-up) behaviour byte-for-byte.

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <polygon fill="currentColor" points="15.4 7.4 14 6 8 12 14 18 15.4 16.6 10.8 12" />
  </svg>
)

export default function AddHolidayOrAbsencePage() {
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
      <div ref={pageRef} className="modal-page-wrap">
      <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>
      <HolidayAbsenceDialog
        onConfirm={({ option }) => alert(`Holiday booked. Visits: ${option === 'keep' ? 'Keep assigned' : 'Move to unassigned'}`)}
      />
      </div>
    </>
  )
}
