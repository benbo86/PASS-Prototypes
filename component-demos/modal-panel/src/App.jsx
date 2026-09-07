import { useState, useRef } from 'react'
import ModalPanel from '../../../Components/ModalPanel'
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
  const [stackedOpen, setStackedOpen] = useState(false)

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
        <h1>Modal Panel</h1>
        <p>
          A centered, boxed dialog with a header, scrollable body, and optional footer —
          a sibling to Slide Panel for content that should open as a box rather than slide
          in from the side. Supports a <code>stacked</code> variant for a second Modal
          Panel that needs to open on top of an already-open one (e.g. a Preview over a
          Customise dialog), first built for the Funders and Contracts and pay
          document-customisation flows.
        </p>
        <button className="round-btn primary-btn" onClick={() => setOpen(true)}>Open modal panel</button>
      </div>

      <ModalPanel
        open={open}
        onClose={() => setOpen(false)}
        title="Modal panel title"
        footer={
          <>
            <button className="round-btn secondary-btn" onClick={() => setStackedOpen(true)}>Open stacked</button>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="round-btn tertiary-btn" onClick={() => setOpen(false)}>Cancel</button>
              <button className="round-btn primary-btn" onClick={() => setOpen(false)}>Confirm</button>
            </div>
          </>
        }
      >
        <div className="demo-panel-body-content">
          <p>Panel body content — the consuming prototype controls spacing and layout here, same as Slide Panel.</p>
          <p>Use the footer's "Open stacked" button to see a second Modal Panel open on top of this one via the <code>stacked</code> prop.</p>
        </div>
      </ModalPanel>

      <ModalPanel
        open={stackedOpen}
        onClose={() => setStackedOpen(false)}
        title="Stacked modal panel"
        width={480}
        stacked
      >
        <div className="demo-panel-body-content">
          <p>This one passes <code>stacked</code>, which bumps its z-index above the modal panel underneath it. Clicking its own background closes only this layer.</p>
        </div>
      </ModalPanel>
    </div>
    </>
  )
}
