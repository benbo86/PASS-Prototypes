import { useState, useRef, useLayoutEffect } from 'react'
import DevToolbar from '../../../Components/DevToolbar'
import DevEdit from '../../../Components/DevEdit'
import DevMode from '../../../Components/DevMode'
import DevComments from '../../../Components/DevComments'
import WireframeToggle from '../../../Components/WireframeToggle'
import AuditCapture from '../../../Components/AuditCapture'
import SegmentedToggle from '../../../Components/SegmentedToggle'
import SchedulePdfPreview, { PAGE } from './SchedulePdfPreview'

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
  </svg>
)

// Scales the page with transform, not CSS zoom (browsers disagree on what
// getBoundingClientRect() returns inside a zoomed element, which made Dev Edit /
// Dev Mode highlight the wrong place). A transform doesn't take up scaled space,
// so the wrapper's height is measured and set explicitly.
function ScaledPage({ scale, width, children }) {
  const ref = useRef(null)
  const [h, setH] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setH(el.offsetHeight)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div className="ps-preview-frame" style={{ width: width * scale, height: h * scale }}>
      <div ref={ref} style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width }}>{children}</div>
    </div>
  )
}

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
