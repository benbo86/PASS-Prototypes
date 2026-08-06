import { useState, useRef } from 'react'
import SideNav from '../../../Components/SideNav'
import TopNav from '../../../Components/TopNav'
import CustomerProfileNav from '../../../Components/CustomerProfileNav'
import RosteringNav from '../../../Components/RosteringNav'
import DevToolbar from '../../../Components/DevToolbar'
import DevMode from '../../../Components/DevMode'
import DevComments from '../../../Components/DevComments'
import DevEdit from '../../../Components/DevEdit'
import WireframeToggle from '../../../Components/WireframeToggle'
import AuditCapture from '../../../Components/AuditCapture'
import VisitPanel from './VisitPanel'
import SegmentedToggle from '../../../Components/SegmentedToggle'
import {
  INITIAL_VISITS, CARE_WORKERS, DAY_LABELS,
  fmtGBP, fmtDate, addDuration, fmtDuration, nextVisitId,
} from './data'

// ─── Icons ────────────────────────────────────────────────────

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
  </svg>
)

const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
)

// ─── Small local components ───────────────────────────────────

function Row({ label, value }) {
  return (
    <div className="sa-row">
      <span className="sa-row-label">{label}</span>
      <span className="sa-row-value">{value}</span>
    </div>
  )
}

// Display-only — per Ben's own instruction, this dropped its earlier
// click-to-change-status behaviour entirely ("not important for this
// prototype"). Uses the shared Components/SegmentedToggle.jsx, matching
// the Timesheets/Unpublished pill's own look, with the Active option's
// selected state recolored green via its `tone` prop.
function StatusToggle({ status }) {
  return (
    <div className="sa-status-toggle">
      <span className="sa-status-toggle-label">Visit status</span>
      <SegmentedToggle
        options={[
          { value: 'inactive', label: 'Inactive' },
          { value: 'active', label: 'Active', tone: 'green' },
        ]}
        value={status}
      />
    </div>
  )
}

function VisitCard({ visit, index, onEdit }) {
  const preferredNames = visit.preferredCareWorkerIds
    .map(id => CARE_WORKERS.find(c => c.id === id)?.name)
    .filter(Boolean)
    .join(', ')

  return (
    <section className="sa-visit-section">
      <div className="sa-visit-heading-row">
        <h2 className="sa-visit-heading">Visit {index}</h2>
        <StatusToggle status={visit.status} />
      </div>

      <div className="sa-visit-card">
        <button className="sa-edit-btn" onClick={onEdit} aria-label="Edit visit" title="Edit visit">
          <EditIcon />
        </button>

        <Row label="Visit title" value={visit.title} />
        <Row label="Start date" value={fmtDate(visit.startDate)} />
        <Row label="End date" value={visit.endDate ? fmtDate(visit.endDate) : 'Ongoing'} />
        <Row label="Care type" value={visit.careType} />
        <Row label="Start time" value={visit.startTime} />
        <Row label="End time" value={addDuration(visit.startTime, visit.durationHours, visit.durationMinutes)} />
        <Row label="Duration" value={fmtDuration(visit.durationHours, visit.durationMinutes)} />
        <Row label="Careworkers" value={visit.careWorkers} />
        <Row label="Preferred careworkers" value={preferredNames || '—'} />

        <div className="sa-row">
          <span className="sa-row-label">Cadence</span>
          <div className="sa-row-value sa-cadence-value">
            <div>{visit.cadence}</div>
            {visit.cadence === 'Weekly' && visit.cadenceDays && (
              <div className="sa-day-badges">
                {DAY_LABELS.map((d, i) => (
                  <span key={i} className={`sa-day-badge${visit.cadenceDays[i] ? ' active' : ''}`}>{d}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        <Row label="Funder" value={visit.funder} />
        <Row label="Charge rate sheet" value={visit.chargeRateSheet} />
        <Row label="Deposit status" value={visit.depositPaid ? 'Paid' : '—'} />
        <Row label="Pay rate sheet" value={visit.payRateSheet || '—'} />

        <div className="sa-row">
          <span className="sa-row-label">Recurring expenses</span>
          <span className="sa-row-value">
            {visit.recurringExpenses.length === 0 ? '—' : (
              <div className="sa-expense-list">
                {visit.recurringExpenses.map((exp, i) => (
                  <div key={i}>{exp.title} · {fmtGBP(exp.amount)}</div>
                ))}
              </div>
            )}
          </span>
        </div>
      </div>
    </section>
  )
}

// ─── App ──────────────────────────────────────────────────────

export default function App() {
  const pageRef = useRef(null)
  const [visits, setVisits] = useState(INITIAL_VISITS)
  const [hideInactive, setHideInactive] = useState(true)
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingVisit, setEditingVisit] = useState(null)

  const displayedVisits = hideInactive ? visits.filter(v => v.status === 'active') : visits

  const openAddPanel = () => { setEditingVisit(null); setPanelOpen(true) }
  const openEditPanel = (visit) => { setEditingVisit(visit); setPanelOpen(true) }
  const closePanel = () => setPanelOpen(false)

  const saveVisit = (visitData) => {
    if (visitData.id) {
      setVisits(prev => prev.map(v => v.id === visitData.id ? visitData : v))
    } else {
      setVisits(prev => [...prev, { ...visitData, id: nextVisitId(), status: 'active' }])
    }
    setPanelOpen(false)
  }

  return (
    <>
      <DevToolbar>
        <DevEdit containerRef={pageRef} prototypeId={window.location.pathname} />
        <DevMode containerRef={pageRef} />
        <DevComments containerRef={pageRef} prototypeId={window.location.pathname} />
        <WireframeToggle />
        <AuditCapture containerRef={pageRef} />
      </DevToolbar>
      <div className="page" ref={pageRef}>
      <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>
      <SideNav activeItem="customers" />

      <div className="page-body">
      <TopNav />
      <CustomerProfileNav activeTab="Rostering" />

      <div className="sa-page">
        <div className="sa-header">
          <div>
            <div className="sa-breadcrumb">Rostering</div>
            <h1 className="sa-title">Service agreement</h1>
          </div>
          <button className="round-btn primary-btn" onClick={openAddPanel}>Add new visit</button>
        </div>

        <div className="sa-content">
          <RosteringNav activeItem="service-agreement" />

          <main className="sa-main">
            <div className="sa-filter-row">
              <span className="sa-count-label">Displaying {displayedVisits.length}/{visits.length} visits</span>
              <label className="checkbox-wrap">
                <input type="checkbox" checked={hideInactive} onChange={e => setHideInactive(e.target.checked)} />
                <span className="checkbox-box" />
                <span>Hide inactive</span>
              </label>
            </div>

            {displayedVisits.map((visit, i) => (
              <VisitCard
                key={visit.id}
                visit={visit}
                index={i + 1}
                onEdit={() => openEditPanel(visit)}
              />
            ))}

            {displayedVisits.length === 0 && (
              <p className="sa-empty">No visits to display.</p>
            )}
          </main>
        </div>
      </div>

      <VisitPanel
        open={panelOpen}
        visit={editingVisit}
        onClose={closePanel}
        onSave={saveVisit}
      />
      </div>
      </div>
    </>
  )
}
