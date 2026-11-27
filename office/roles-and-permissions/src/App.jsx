import { useRef, useState } from 'react'
import SideNav from '../../../Components/SideNav'
import TopNav from '../../../Components/TopNav'
import OfficeNav from '../../../Components/OfficeNav'
import DevToolbar from '../../../Components/DevToolbar'
import DevMode from '../../../Components/DevMode'
import DevComments from '../../../Components/DevComments'
import DevEdit from '../../../Components/DevEdit'
import WireframeToggle from '../../../Components/WireframeToggle'
import AuditCapture from '../../../Components/AuditCapture'
import { useRolesStore, peopleWithRole, resetRoles } from '../../../Components/rolesStore'
import RolesPanel from './RolesPanel'

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)
// Icons/Edit.svg, currentColor
const PenIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M5.00125,16.245799 L5.00125,18.6099151 C5.00125,18.8276627 5.17233735,18.99875 5.39008488,18.99875 L7.75420098,18.99875 C7.85529805,18.99875 7.95639512,18.9598665 8.0263854,18.8820995 L16.5185393,10.3977224 L13.6022776,7.48146073 L5.11790047,15.9658379 C5.04013349,16.0436049 5.00125,16.1369253 5.00125,16.245799 Z M18.7737816,8.14248004 C19.0770728,7.83918883 19.0770728,7.34925687 18.7737816,7.04596566 L16.9540343,5.22621841 C16.6507431,4.9229272 16.1608112,4.9229272 15.85752,5.22621841 L14.4343843,6.64935408 L17.3506459,9.56561571 L18.7737816,8.14248004 Z" />
  </svg>
)
// Icons/Overdue Visits.svg, currentColor
const OverdueIcon = () => (
  <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M14 1h-4c-.55 0-1 .45-1 1s.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1zm5.03 6.39l.75-.75a.993.993 0 000-1.4l-.01-.01a.993.993 0 00-1.4 0l-.75.75A8.962 8.962 0 0012 4c-4.8 0-8.88 3.96-9 8.76A8.998 8.998 0 0012 22a8.994 8.994 0 007.03-14.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm0-5.002c.55 0 1-.525 1-1.166V9.166C13 8.525 12.55 8 12 8s-1 .525-1 1.166v4.666c0 .641.45 1.166 1 1.166z" fillRule="evenodd" /></svg>
)
// Icons/Permanent Allocation.svg, currentColor
const AllocationIcon = () => (
  <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><path d="M0 0h24v24H0z" /><path d="M7.406 13.697c.57.26 1.19.426 1.843.47a2.502 2.502 0 00-.294 1.982 7.19 7.19 0 01-1.737-.374l-.208-.079h-.109c-.933 0-1.969 1.173-2.053 2.415l-.006.163v.187h5.986l.169.164-.315 1.837h-6.39a1.45 1.45 0 01-1.443-1.31l-.007-.14v-.738c0-2.175 1.713-4.44 3.863-4.571l.196-.006h.505zm2.201-9.34a3.865 3.865 0 01.2 7.726l-.2.005a3.865 3.865 0 01-.199-7.726l.2-.005zm0 2a1.865 1.865 0 100 3.73 1.865 1.865 0 000-3.73zm6.614 5.324a.5.5 0 01.227.227l1.315 2.665 2.94.427a.5.5 0 01.278.853l-2.128 2.074.502 2.929a.5.5 0 01-.725.527L16 20l-2.63 1.383a.5.5 0 01-.725-.527l.502-2.929-2.128-2.074a.5.5 0 01.277-.853l2.94-.427 1.316-2.665a.5.5 0 01.67-.227z" fill="currentColor" fillRule="nonzero" /></g></svg>
)
// Icons/Employee Punctuality.svg, currentColor
const PunctualityIcon = () => (
  <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><path d="M0 0h24v24H0z" /><path d="M15.495 10A5.503 5.503 0 0121 15.5c0 3.037-2.465 5.5-5.505 5.5A5.497 5.497 0 0110 15.5c0-3.037 2.46-5.5 5.495-5.5zm0 1.44a4.058 4.058 0 00-4.055 4.06 4.058 4.058 0 004.055 4.06 4.064 4.064 0 004.065-4.06c0-2.242-1.82-4.06-4.065-4.06zM15 2a1 1 0 011 1v1h1a2 2 0 012 2v1.999L5.5 8a.5.5 0 00-.5.5v8a.5.5 0 00.5.5h2.875c.103.702.298 1.373.573 2H5a2 2 0 01-2-2V6a2 2 0 012-2h1V3a1 1 0 112 0v1h6V3a1 1 0 011-1zm.5 10.39c.366 0 .673.275.716.643l.004.077-.001 2.646 1.262.747a.72.72 0 01.326.815l-.037.103-.035.068a.721.721 0 01-.918.289l-.068-.036-1.615-.954a.723.723 0 01-.348-.533l-.006-.087V13.11a.72.72 0 01.72-.72z" fill="currentColor" /></g></svg>
)
// Icons/Journal Categories.svg, currentColor
const JournalIcon = () => (
  <svg aria-hidden="true" width="24" height="24" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><path d="M0 0h32v32H0z" /><path d="M11.259 4C8.81 4 6.825 5.976 6.825 8.414v15.172C6.825 26.024 8.81 28 11.259 28h9.621c2.448-.002 4.43-1.977 4.43-4.414V11.29c0-.745-.31-1.456-.858-1.961l-5.015-4.622A2.667 2.667 0 0017.63 4zm.123 2.642h6.039v3.064a2.382 2.382 0 002.387 2.377h2.894V23.35a2 2 0 01-2 2h-9.32a2 2 0 01-2-2V8.642a2 2 0 012-2z" fill="currentColor" fillRule="nonzero" /><path stroke="currentColor" strokeWidth="2.667" strokeLinecap="round" d="M12 15.333h8m-8 4h4" /></g></svg>
)
// Icons/User Shield.svg, currentColor
const ShieldIcon = () => (
  <svg aria-hidden="true" width="24" height="24" viewBox="0 0 640 512" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c1.8 0 3.5-.2 5.3-.5c-76.3-55.1-99.8-141-103.1-200.2c-16.1-4.8-33.1-7.3-50.7-7.3H178.3zm308.8-78.3l-120 48C358 277.4 352 286.2 352 296c0 63.3 25.9 168.8 134.8 214.2c5.9 2.5 12.6 2.5 18.5 0C614.1 464.8 640 359.3 640 296c0-9.8-6-18.6-15.1-22.3l-120-48c-5.7-2.3-12.1-2.3-17.8 0zM591.4 312c-3.9 50.7-27.2 116.7-95.4 149.7V273.8L591.4 312z" /></svg>
)

function Card({ title, icon, onEdit, editLabel, children }) {
  return (
    <section className="sp-card">
      <header className="sp-card-head">
        {icon}
        <h2>{title}</h2>
        <button type="button" className="sp-card-edit" aria-label={editLabel ?? `Edit ${title}`} onClick={onEdit} data-devmode-passthrough="true"><PenIcon /></button>
      </header>
      <div className="sp-card-body">{children}</div>
    </section>
  )
}
const Row = ({ label, value }) => <div className="sp-row"><span>{label}</span><strong>{value}</strong></div>

export default function App() {
  const pageRef = useRef(null)
  const state = useRolesStore()
  const [panelOpen, setPanelOpen] = useState(false)
  const count = id => peopleWithRole(state, id).length

  return (
    <>
      <DevToolbar>
        <DevEdit containerRef={pageRef} prototypeId={window.location.pathname} />
        <DevMode containerRef={pageRef} />
        <DevComments containerRef={pageRef} prototypeId={window.location.pathname} />
        <WireframeToggle />
        <AuditCapture containerRef={pageRef} />
      </DevToolbar>
      <div className="office-page" ref={pageRef}>
        <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>
        <SideNav activeItem="office" />
        <div className="page-body">
          <TopNav />
          <OfficeNav active="settings-and-permissions" />
          <main className="office-content sp-content">
            <div className="sp-columns">
              <div className="sp-col">
                <Card title="Overdue and missed visits" icon={<OverdueIcon />} onEdit={() => {}}>
                  <Row label="Overdue visits threshold" value="≥ 15%" />
                  <p>The threshold is the percentage of visits that can be overdue at the same time before the KPI indicator turns red</p>
                  <Row label="Overdue" value="≥ 15m" />
                  <Row label="Missed" value="≥ 30m" />
                  <Row label="Missed (Time critical)" value="≥ 0m" />
                </Card>
              </div>
              <div className="sp-col">
                <Card title="Permanent allocation" icon={<AllocationIcon />} onEdit={() => {}}>
                  <p>Options for the permanent allocation Heatmap</p>
                  <strong className="sp-sub">Heatmap link options</strong>
                  <p>Heatmap links to runs management</p>
                </Card>
                <Card title="Employee punctuality" icon={<PunctualityIcon />} onEdit={() => {}}>
                  <Row label="Average punctuality deficit threshold" value="≥ 15%" />
                  <p>The threshold is the percentage of visits attended by your employees that breach the punctuality limits set below.</p>
                  <Row label="Tag-in and tag-out leeway threshold" value="≥ 10m" />
                  <Row label="Visit duration threshold" value="≥ 20%" />
                </Card>
              </div>
              <div className="sp-col">
                <Card title="Journal categories" icon={<JournalIcon />} onEdit={() => {}}>
                  {['Note', 'HR', 'Scheduling', 'On-call', 'Incident', 'Compliment', 'Complaint', 'Training', 'Hospital (admissions/discharge)'].map(c => <Row key={c} label={c} value="Enabled" />)}
                </Card>
              </div>
              <div className="sp-col">
                <Card title="Roles and permissions" icon={<ShieldIcon />} editLabel="Edit roles and permissions" onEdit={() => setPanelOpen(true)}>
                  <p>Control which sections each role can view or edit.</p>
                  {state.roles.length === 0
                    ? <p className="sp-empty">No custom roles yet.</p>
                    : state.roles.map(r => <Row key={r.id} label={r.name} value={`${count(r.id)} ${count(r.id) === 1 ? 'employee' : 'employees'}`} />)}
                </Card>
              </div>
            </div>
          </main>
        </div>
        <RolesPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
        <div className="rp-proto" data-devmode-passthrough="true">
          <span className="rp-proto-tag">Prototype</span>
          <button type="button" className="rp-link" onClick={resetRoles}>Reset roles</button>
        </div>
      </div>
    </>
  )
}
