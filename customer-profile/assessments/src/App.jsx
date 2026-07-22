import { useState, useRef } from 'react'
import SideNav from '../../../Components/SideNav'
import TopNav from '../../../Components/TopNav'
import CustomerProfileNav from '../../../Components/CustomerProfileNav'
import DevMode from '../../../Components/DevMode'
import DevComments from '../../../Components/DevComments'

// ─── Icons ────────────────────────────────────────────────────

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8.3 7.7L12.9 12.3L8.3 16.9L9.7 18.3L15.7 12.3L9.7 6.3L8.3 7.7Z"/>
  </svg>
)

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
)

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
)

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10.85 18.69C12.63 18.69 14.28 18.08 15.6 17.08L19.22 20.7C19.43 20.91 19.7 21.01 19.95 21.01C20.5 21.01 20.9 20.58 20.9 20.03C20.9 19.78 20.8 19.54 20.69 19.21L17.09 15.59C18.09 14.27 18.7 12.62 18.7 10.84C18.7 6.51 15.18 2.99 10.85 2.99C6.52 2.99 3 6.51 3 10.84C3 15.17 6.52 18.69 10.85 18.69ZM10.85 5.08C14.01 5.08 16.6 7.66 16.6 10.84C16.6 14.02 14.01 16.59 10.85 16.59C7.69 16.59 5.09 14 5.09 10.84C5.09 7.68 7.67 5.08 10.85 5.08Z"/>
  </svg>
)

const WarningIcon = () => (
  <svg className="warning-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10.27 3.99C11.04 2.66 12.96 2.66 13.73 3.99L21.26 17C22.03 18.33 21.07 20 19.53 20L4.47 20C2.93 20 1.97 18.33 2.74 17ZM12 15C11.45 15 11 15.45 11 16C11 16.55 11.45 17 12 17C12.55 17 13 16.55 13 16C13 15.45 12.55 15 12 15ZM12 7C11.45 7 11 7.45 11 8L11 12C11 12.55 11.45 13 12 13C12.55 13 13 12.55 13 12L13 8C13 7.45 12.55 7 12 7Z"/>
  </svg>
)

const CompletedIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="12" fill="#388e3c"/>
    <polygon points="9.29,15.79 5.47,12.03 4.2,13.29 9.29,18.3 20.2,7.55 18.93,6.3" fill="white"/>
  </svg>
)

const IncompleteIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="12" fill="var(--rag-red-red-overdue, #e31c4a)"/>
    <path d="M17 7.41L15.59 6 12 9.59 8.41 6 7 7.41 10.59 11 7 14.59 8.41 16 12 12.41 15.59 16 17 14.59 13.41 11z" fill="white"/>
  </svg>
)

// ─── Data ─────────────────────────────────────────────────────

const DOC_TABS = ['Enquiry', 'Assessments', 'Documents', 'Files']

const MANDATORY = [
  { id: 1, name: 'Risk Assessment',              completed: false, date: null },
  { id: 2, name: 'Moving and Handling Assessment', completed: false, date: null },
  { id: 3, name: 'Care and Support Plan',         completed: true,  date: '15/01/2026' },
  { id: 4, name: 'Consent to Care',               completed: true,  date: '03/03/2026' },
  { id: 5, name: 'Next of Kin Details',           completed: false, date: null },
]

const INITIAL_OPTIONAL = [
  { id: 'my-important-contacts', name: 'My Important Contacts', completed: true, date: '03/03/2026' },
]

const OPTIONAL_TEMPLATES = [
  { id: 'personal-history',      name: 'Personal History' },
  { id: 'interests',             name: 'Interests and Activities' },
  { id: 'personal-goals',        name: 'Personal Goals and Aspirations' },
  { id: 'life-story',            name: 'Life Story' },
  { id: 'communication',         name: 'Communication Needs Assessment' },
  { id: 'continence',            name: 'Continence Assessment' },
  { id: 'skin-integrity',        name: 'Skin Integrity Assessment' },
  { id: 'nutrition',             name: 'Nutrition and Hydration Assessment' },
  { id: 'falls-risk',            name: 'Falls Risk Assessment' },
  { id: 'pressure-ulcer',        name: 'Pressure Ulcer Risk Assessment' },
  { id: 'pain',                  name: 'Pain Assessment' },
  { id: 'sleep',                 name: 'Sleep Assessment' },
  { id: 'oral-health',           name: 'Oral Health Assessment' },
  { id: 'foot-care',             name: 'Foot Care Assessment' },
  { id: 'medication-mgmt',       name: 'Medication Management Assessment' },
  { id: 'mental-capacity',       name: 'Mental Capacity Assessment' },
  { id: 'social-wellbeing',      name: 'Social and Emotional Wellbeing Assessment' },
  { id: 'end-of-life',           name: 'End of Life Care Preferences' },
  { id: 'environmental-risk',    name: 'Environmental Risk Assessment' },
  { id: 'sensory-needs',         name: 'Sensory Needs Assessment' },
]

// ─── AssessmentRow ────────────────────────────────────────────

function AssessmentRow({ assessment }) {
  return (
    <div className="assessment-row">
      <span className="assessment-status">
        {assessment.completed ? <CompletedIcon /> : <IncompleteIcon />}
      </span>
      <span className="assessment-name">{assessment.name}</span>
      <span className={`assessment-date ${!assessment.completed ? 'is-incomplete' : ''}`}>
        {assessment.completed ? `Completed ${assessment.date}` : 'Not yet completed'}
      </span>
      <span className="assessment-chevron"><ChevronRightIcon /></span>
    </div>
  )
}

// ─── AddOptionalModal ─────────────────────────────────────────

function AddOptionalModal({ available, onClose, onAdd }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(new Set())

  const filtered = available.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add optional assessment</h2>
          <button className="modal-close-btn" onClick={onClose}><CloseIcon /></button>
        </div>

        <div className="modal-search-wrap">
          <span className="modal-search-icon"><SearchIcon /></span>
          <input
            className="form-input modal-search-input"
            type="text"
            placeholder="Search assessments..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="modal-checklist">
          {filtered.length === 0 ? (
            <p className="modal-empty">No assessments found.</p>
          ) : (
            filtered.map(t => (
              <label key={t.id} className="checklist-item">
                <input
                  type="checkbox"
                  className="checklist-checkbox"
                  checked={selected.has(t.id)}
                  onChange={() => toggle(t.id)}
                />
                <span className="checklist-name">{t.name}</span>
              </label>
            ))
          )}
        </div>

        <div className="modal-footer">
          <button className="round-btn tertiary-btn" onClick={onClose}>Cancel</button>
          <button
            className="round-btn primary-btn"
            disabled={selected.size === 0}
            onClick={() => onAdd(selected)}
          >
            {selected.size > 0 ? `Add (${selected.size})` : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────

export default function App() {
  const pageRef = useRef(null)
  const [optionalAdded, setOptionalAdded] = useState(INITIAL_OPTIONAL)
  const [showModal, setShowModal] = useState(false)

  const incompleteCount = MANDATORY.filter(a => !a.completed).length

  const available = OPTIONAL_TEMPLATES.filter(t =>
    !optionalAdded.some(a => a.id === t.id)
  )

  const handleAdd = (selectedIds) => {
    const newItems = OPTIONAL_TEMPLATES
      .filter(t => selectedIds.has(t.id))
      .map(t => ({ ...t, completed: false, date: null }))
    setOptionalAdded(prev => [...prev, ...newItems])
    setShowModal(false)
  }

  return (
    <div className="page" ref={pageRef}>
      <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>

      <SideNav activeItem="customers" />

      <div className="page-body">
      <TopNav />
      <CustomerProfileNav activeTab="Documents" />

      {/* Doc sub-tabs */}
      <div className="sub-tabs-bar">
        <ul className="sub-tabs">
          {DOC_TABS.map(tab => (
            <li key={tab} className={tab === 'Assessments' ? 'active' : ''}>
              <button>{tab}</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Content */}
      <div className="content-area">
        <div className="action-row">
          <button className="round-btn primary-btn btn-icon-left" onClick={() => setShowModal(true)}>
            <PlusIcon /> Add optional assessment
          </button>
        </div>

        {incompleteCount > 0 && (
          <div className="warning-banner orange">
            <WarningIcon />
            <div>
              <h4>{incompleteCount} incomplete mandatory assessment{incompleteCount !== 1 ? 's' : ''}</h4>
            </div>
          </div>
        )}

        <section className="assessment-section">
          <h2 className="section-heading">Mandatory</h2>
          <div className="assessment-list-card">
            {MANDATORY.map(a => <AssessmentRow key={a.id} assessment={a} />)}
          </div>
        </section>

        {optionalAdded.length > 0 && (
          <section className="assessment-section">
            <h2 className="section-heading">Optional</h2>
            <div className="assessment-list-card">
              {optionalAdded.map(a => <AssessmentRow key={a.id} assessment={a} />)}
            </div>
          </section>
        )}
      </div>

      {showModal && (
        <AddOptionalModal
          available={available}
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
        />
      )}
      </div>
      <DevMode containerRef={pageRef} />
      <DevComments containerRef={pageRef} prototypeId={window.location.pathname} />
    </div>
  )
}
