import { useState, useRef } from 'react'
import SlidePanel from '../../../Components/SlidePanel'
import DevToolbar from '../../../Components/DevToolbar'
import DevMode from '../../../Components/DevMode'
import DevComments from '../../../Components/DevComments'
import DevEdit from '../../../Components/DevEdit'
import WireframeToggle from '../../../Components/WireframeToggle'
import AuditCapture from '../../../Components/AuditCapture'

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)

export default function App() {
  const [open, setOpen] = useState(false)

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
      <div className="demo-page" ref={pageRef}>
      <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>
      <div className="demo-content">
        <h1>Slide Panel</h1>
        <p>937px-wide panel that slides in from the right over a scrim, with a grey body and optional footer actions.</p>
        <button className="round-btn primary-btn" onClick={() => setOpen(true)}>Open panel</button>
      </div>

      <SlidePanel
        open={open}
        onClose={() => setOpen(false)}
        title="Panel title"
        footer={
          <>
            <button className="round-btn tertiary-btn" onClick={() => setOpen(false)}>Cancel</button>
            <button className="round-btn primary-btn" onClick={() => setOpen(false)}>Save</button>
          </>
        }
      >
        <p>Panel body content — the consuming prototype controls spacing here.</p>
      </SlidePanel>
    </div>
    </>
  )
}
