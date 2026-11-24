import { useState, useRef } from 'react'
import DevToolbar from '../../../Components/DevToolbar'
import DevEdit from '../../../Components/DevEdit'
import DevMode from '../../../Components/DevMode'
import DevComments from '../../../Components/DevComments'
import WireframeToggle from '../../../Components/WireframeToggle'
import AuditCapture from '../../../Components/AuditCapture'
import SegmentedToggle from '../../../Components/SegmentedToggle'
import SchedulePdfPreview, { PAGE, ScaledPage } from './SchedulePdfPreview'

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
  </svg>
)

// The customer schedule document (AIOP-25799) at the new 11pt text size, with a
// prototype-only toggle to compare it against the size it was before.
export default function CustomerScheduleTextSize() {
  const pageRef = useRef(null)
  const [textSize, setTextSize] = useState('11')
  const [layout, setLayout] = useState('cards')
  const scale = 96 / 72 // 1pt = 96/72 px, so A4 is shown at 100%
  return (
    <>
      <DevToolbar>
        <DevEdit containerRef={pageRef} prototypeId={window.location.pathname} />
        <DevMode containerRef={pageRef} />
        <DevComments containerRef={pageRef} prototypeId={window.location.pathname} />
        <WireframeToggle />
        <AuditCapture containerRef={pageRef} />
      </DevToolbar>
      <div className="cst-page" ref={pageRef}>
        <a href="../../" className="back-link"><BackIcon /> Prototypes</a>
        <div className="cst-bar">
          <span>Text size (prototype option)</span>
          <SegmentedToggle options={[{ value: '11', label: '11pt' }, { value: 'current', label: 'Current (6.75–8.25pt)' }]} value={textSize} onChange={setTextSize} />
          <span>Layout (prototype option)</span>
          <SegmentedToggle options={[{ value: 'cards', label: 'Cards' }, { value: 'list', label: 'For consideration' }]} value={layout} onChange={setLayout} />
        </div>
        <ScaledPage scale={scale} width={PAGE.portrait.w}>
          <SchedulePdfPreview customer="Christine Gowans" weekLabel="Mon 16 Nov 2026 - Sun 22 Nov 2026" orientation="portrait" textSize={textSize} layout={layout} showPending showCancelled />
        </ScaledPage>
      </div>
    </>
  )
}
