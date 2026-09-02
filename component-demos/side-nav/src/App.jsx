import { useState, useRef } from 'react'
import SideNav from '../../../Components/SideNav'
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
  const [activeItem, setActiveItem] = useState('finance')

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
      <div className="side-nav-demo" ref={pageRef}>
      <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>
      <SideNav activeItem={activeItem} onSelectItem={setActiveItem} />
      <div className="side-nav-demo-content">
        <h1>{activeItem.charAt(0).toUpperCase() + activeItem.slice(1)}</h1>
        <p>Placeholder content area — select a different item in the nav to see the active state, or use the toggle at the top to collapse/expand it.</p>
      </div>
    </div>
    </>
  )
}
