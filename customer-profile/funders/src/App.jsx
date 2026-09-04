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
import FunderPanel from './FunderPanel'
import { INITIAL_FUNDERS, invoiceLayoutName, fmtGBP } from './data'

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

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" /><path d="M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
  </svg>
)

// ─── Small local components ───────────────────────────────────

function Row({ label, value }) {
  return (
    <div className="fd-row">
      <span className="fd-row-label">{label}</span>
      <span className="fd-row-value">{value}</span>
    </div>
  )
}

// Read-only — per Ben's own instruction, this doesn't rebuild every
// existing funder field as an editable form, just the summary shown here.
// Heading row + numbered title ("Funder 1") lives *above* the card, byte-
// for-byte the same shape as service-agreement's own VisitCard ("Visit 1")
// — the card itself no longer repeats "Funder" as its own first group
// title, matching how Visit's card never repeats "Visit" either. Trash
// and pencil both live in the same top-right corner of the card, matching
// Ben's own reference screenshot exactly (unlike VisitCard, which only
// ever needed the one edit icon).
function FunderCard({ funder, index, onEdit, onDelete }) {
  return (
    <section className="fd-card-section">
      <div className="fd-card-heading-row">
        <h2 className="fd-card-heading">Funder {index}</h2>
      </div>

      <div className="fd-card">
        <div className="fd-card-actions">
          <button className="fd-icon-btn fd-icon-btn--delete" onClick={onDelete} aria-label="Delete funder" title="Delete funder">
            <TrashIcon />
          </button>
          <button className="fd-icon-btn" onClick={onEdit} aria-label="Edit funder" title="Edit funder">
            <EditIcon />
          </button>
        </div>

        <div className="fd-group">
          <Row label="Name" value={funder.name} />
          <Row label="Type" value={funder.type} />
          <Row label="Flat No/House Name" value={funder.flatNoHouseName || '—'} />
          <Row label="Address 1" value={funder.addressLine1} />
          <Row label="Address 2" value={funder.addressLine2 || '—'} />
          <Row label="Town/City" value={funder.townCity} />
          <Row label="County" value={funder.county} />
          <Row label="Postcode" value={funder.postcode} />
          <div className="fd-row">
            <span className="fd-row-label">Status</span>
            <span className="fd-row-value">
              <span className="status-pill status-completed">{funder.status}</span>
            </span>
          </div>
        </div>

        <div className="fd-group">
          <span className="fd-group-title">Accounting details</span>
          <Row label="Accounts reference" value={funder.accountsReference} />
          <Row label="Cost centre/Department code" value={funder.costCentre} />
        </div>

        <div className="fd-group">
          <span className="fd-group-title">Contact details</span>
          <Row label="Contact name" value={funder.contactName} />
          <Row label="Email address" value={funder.email} />
          <Row label="Contact number" value={funder.contactNumber} />
        </div>

        <Row label="Customer ID number" value={funder.customerIdNumber} />

        <div className="fd-group">
          <span className="fd-group-title">Charge details</span>
          <Row label="Charge method" value={funder.chargeMethod} />
          <Row label="Charge rounding" value={funder.chargeRounding} />
          <Row label="Payment method" value={funder.paymentMethod} />
          <Row label="Weekly funding limit" value={fmtGBP(funder.weeklyFundingLimit)} />
          <Row label="Invoice delivery method" value={funder.invoiceDeliveryMethod} />
          <Row label="Invoice format" value={funder.invoiceFormat} />
          <Row label="Invoice template" value={invoiceLayoutName(funder.invoiceConfig?.layout) || '-'} />
        </div>
      </div>
    </section>
  )
}

// ─── App ──────────────────────────────────────────────────────

export default function App() {
  const pageRef = useRef(null)
  const [funders, setFunders] = useState(INITIAL_FUNDERS)
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingFunderId, setEditingFunderId] = useState(null)

  const editingFunder = funders.find(f => f.id === editingFunderId) || null

  const openEditPanel = (funder) => { setEditingFunderId(funder.id); setPanelOpen(true) }
  const closePanel = () => setPanelOpen(false)

  const deleteFunder = (funder) => {
    if (!window.confirm(`Delete ${funder.name}?`)) return
    setFunders(prev => prev.filter(f => f.id !== funder.id))
  }

  const saveInvoiceConfig = (config) => {
    setFunders(prev => prev.map(f => f.id === editingFunderId ? { ...f, invoiceConfig: config } : f))
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

      <div className="fd-page">
        <div className="fd-header">
          <div className="fd-breadcrumb">Rostering</div>
          <h1 className="fd-title">Funders</h1>
        </div>

        <div className="fd-content">
          <RosteringNav activeItem="funders" />

          <main className="fd-main">
            {funders.map((funder, i) => (
              <FunderCard
                key={funder.id}
                funder={funder}
                index={i + 1}
                onEdit={() => openEditPanel(funder)}
                onDelete={() => deleteFunder(funder)}
              />
            ))}

            {funders.length === 0 && (
              <p className="fd-empty">No funders to display.</p>
            )}
          </main>
        </div>
      </div>

      <FunderPanel
        open={panelOpen}
        funder={editingFunder}
        onClose={closePanel}
        onSaveInvoiceConfig={saveInvoiceConfig}
      />
      </div>
      </div>
    </>
  )
}
