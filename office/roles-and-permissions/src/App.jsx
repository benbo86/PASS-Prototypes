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
// Icons/Users.svg, currentColor
const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M13.3318 13.0337C13.9829 13.3315 14.7011 13.5008 15.4602 13.5008C16.1244 13.5008 16.7595 13.3711 17.3421 13.1392L17.5885 13.0337H18.0761C20.1787 13.0337 21.8963 15.1612 21.9955 17.2671L22 17.4584V18.1721C22 18.9003 21.444 19.4991 20.7335 19.5671L20.5986 19.5735H10.3218C9.5936 19.5735 8.99474 19.0174 8.9268 18.307L8.92038 18.1721V17.4584C8.92038 15.3558 10.5761 13.1664 12.6542 13.0395L12.8443 13.0337H13.3318ZM6.41145 13.0326C7.06251 13.3304 7.78072 13.4997 8.53981 13.4997L8.67088 13.4967C8.23978 13.9639 7.88262 14.5386 7.62719 15.1655C7.23536 15.1151 6.84965 15.0279 6.47353 14.908L6.06261 14.7616L5.92388 14.7625C4.92452 14.7625 3.86284 15.9422 3.7414 17.2174L3.72989 17.4573L3.72899 17.8408L7.19 17.8404L7.1905 18.1475C7.1905 18.7704 7.50505 19.3102 7.96326 19.5723L3.40139 19.5724C2.68722 19.5724 2.09743 19.0376 2.01092 18.3468L2 18.171V17.4573C2 15.3777 3.61978 13.2131 5.66598 13.0433L5.92388 13.0326H6.41145ZM12.9858 14.7738L12.8443 14.7738C11.8308 14.7738 10.7507 15.9967 10.6659 17.2957L10.6606 17.4584L10.6598 17.8326H20.2598V17.4584C20.2598 16.155 19.2203 14.88 18.2031 14.7801L18.0761 14.7738L17.9357 14.7738L17.7099 14.8591C16.9917 15.11 16.2333 15.241 15.4602 15.241C14.6881 15.241 13.9325 15.1104 13.2141 14.8599L12.9858 14.7738ZM15.4602 4.00448C17.5243 4.00448 19.1972 5.67738 19.1972 7.74151C19.1972 9.74113 17.6272 11.3736 15.6525 11.4737L15.4602 11.4785C13.3961 11.4785 11.7232 9.80564 11.7232 7.74151C11.7232 5.74189 13.2931 4.10941 15.2679 4.00934L15.4602 4.00448ZM8.53981 4.00342C9.41333 4.00342 10.2168 4.30302 10.853 4.80508C10.5195 5.29862 10.2694 5.87906 10.1272 6.51462C9.7619 6.03909 9.18665 5.73331 8.53981 5.73331C7.43107 5.73331 6.53266 6.63172 6.53266 7.74045C6.53266 8.84919 7.43107 9.7476 8.53981 9.7476C9.18657 9.7476 9.76176 9.44189 10.1288 8.96705C10.2701 9.60298 10.5206 10.1834 10.8532 10.6769C10.2824 11.1262 9.57681 11.4138 8.80672 11.4681L8.53981 11.4775C6.47568 11.4775 4.80277 9.80458 4.80277 7.74045C4.80277 5.76607 6.33337 4.14963 8.2729 4.0128L8.53981 4.00342ZM15.4602 5.74466C14.3571 5.74466 13.4633 6.63846 13.4633 7.74151C13.4633 8.84456 14.3571 9.73836 15.4602 9.73836C16.5632 9.73836 17.457 8.84456 17.457 7.74151C17.457 6.63846 16.5632 5.74466 15.4602 5.74466Z" />
  </svg>
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
                <Card title="Overdue and missed visits" onEdit={() => {}}>
                  <Row label="Overdue visits threshold" value="≥ 15%" />
                  <p>The threshold is the percentage of visits that can be overdue at the same time before the KPI indicator turns red</p>
                  <Row label="Overdue" value="≥ 15m" />
                  <Row label="Missed" value="≥ 30m" />
                  <Row label="Missed (Time critical)" value="≥ 0m" />
                </Card>
              </div>
              <div className="sp-col">
                <Card title="Permanent allocation" onEdit={() => {}}>
                  <p>Options for the permanent allocation Heatmap</p>
                  <strong className="sp-sub">Heatmap link options</strong>
                  <p>Heatmap links to runs management</p>
                </Card>
                <Card title="Employee punctuality" onEdit={() => {}}>
                  <Row label="Average punctuality deficit threshold" value="≥ 15%" />
                  <p>The threshold is the percentage of visits attended by your employees that breach the punctuality limits set below.</p>
                  <Row label="Tag-in and tag-out leeway threshold" value="≥ 10m" />
                  <Row label="Visit duration threshold" value="≥ 20%" />
                </Card>
              </div>
              <div className="sp-col">
                <Card title="Journal categories" onEdit={() => {}}>
                  {['Note', 'HR', 'Scheduling', 'On-call', 'Incident', 'Compliment', 'Complaint', 'Training', 'Hospital (admissions/discharge)'].map(c => <Row key={c} label={c} value="Enabled" />)}
                </Card>
              </div>
              <div className="sp-col">
                <Card title="Roles and permissions" icon={<UsersIcon />} editLabel="Edit roles and permissions" onEdit={() => setPanelOpen(true)}>
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
