import { useRef } from 'react'
import SideNav from '../../../Components/SideNav'
import TopNav from '../../../Components/TopNav'
import OfficeNav from '../../../Components/OfficeNav'
import DevToolbar from '../../../Components/DevToolbar'
import DevMode from '../../../Components/DevMode'
import DevComments from '../../../Components/DevComments'
import DevEdit from '../../../Components/DevEdit'
import WireframeToggle from '../../../Components/WireframeToggle'

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)

export default function App() {
  const pageRef = useRef(null)
  return (
    <>
      <DevToolbar>
        <DevEdit containerRef={pageRef} prototypeId={window.location.pathname} />
        <WireframeToggle />
        <DevComments containerRef={pageRef} prototypeId={window.location.pathname} />
        <DevMode containerRef={pageRef} />
      </DevToolbar>
      <div className="office-page" ref={pageRef}>
      <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>
      <SideNav activeItem="office" />
      <div className="page-body">
      <TopNav />
      <OfficeNav active="details" />
      <main className="office-content">
        <div className="office-placeholder-card">
          <h1>Details</h1>
          <p>No prototype built yet — placeholder page.</p>
        </div>
      </main>
      </div>
      </div>
    </>
  )
}
