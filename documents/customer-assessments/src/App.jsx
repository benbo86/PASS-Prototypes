import { useState, useRef, useEffect } from 'react'
import WebNav from '../../../Components/WebNav'

// ─── Icons ────────────────────────────────────────────────────

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 10l5 5 5-5z"/>
  </svg>
)

const PrintIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
  </svg>
)

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>
)

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/>
  </svg>
)

const BookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
  </svg>
)

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
  </svg>
)

const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
  </svg>
)

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
)

const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/>
  </svg>
)

// ─── Shared data ──────────────────────────────────────────────

const ROLES = [
  { value: 'Super user',   label: 'Super user' },
  { value: 'Care Manager', label: 'Care Manager' },
  { value: 'Supervisor',   label: 'Supervisor' },
  { value: 'Careworker',   label: 'Careworker' },
]

// ─── Data ─────────────────────────────────────────────────────

const TEMPLATES = [
  {
    id: 1,
    name: 'Risk Assessment',
    level: 'brand',
    mandatory: true,
    status: 'active',
    reviewRequired: false,
    includedInPrint: true,
    read: 'Careworker',
    write: 'Care Manager',
  },
  {
    id: 2,
    name: 'Moving and Handling Assessment',
    level: 'brand',
    mandatory: true,
    status: 'active',
    reviewRequired: true,
    includedInPrint: true,
    read: 'Careworker',
    write: 'Care Manager',
  },
  {
    id: 3,
    name: 'Care and Support Plan',
    level: 'brand',
    mandatory: true,
    status: 'active',
    reviewRequired: true,
    includedInPrint: true,
    read: 'Careworker',
    write: 'Care Manager',
  },
  {
    id: 4,
    name: 'Consent to Care',
    level: 'custom',
    mandatory: true,
    status: 'active',
    reviewRequired: false,
    includedInPrint: true,
    read: 'Careworker',
    write: 'Care Manager',
  },
  {
    id: 5,
    name: 'Next of Kin Details',
    level: 'custom',
    mandatory: true,
    status: 'active',
    reviewRequired: false,
    includedInPrint: false,
    read: 'Careworker',
    write: 'Care Manager',
  },
  {
    id: 6,
    name: 'Personal History',
    level: 'custom',
    mandatory: false,
    status: 'active',
    reviewRequired: false,
    includedInPrint: false,
    read: 'Careworker',
    write: 'Care Manager',
  },
  {
    id: 7,
    name: 'My Important Contacts',
    level: 'custom',
    mandatory: false,
    status: 'active',
    reviewRequired: false,
    includedInPrint: false,
    read: 'Careworker',
    write: 'Care Manager',
  },
  {
    id: 8,
    name: 'Interests and Activities',
    level: 'custom',
    mandatory: false,
    status: 'inactive',
    reviewRequired: false,
    includedInPrint: false,
    read: 'Careworker',
    write: 'Care Manager',
  },
]

// ─── MandatoryDropdown ─────────────────────────────────────────

function MandatoryDropdown({ mandatory, onChange, disabled }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (disabled) {
    return (
      <span className="tooltip-wrap">
        <span className={`mandatory-btn mandatory-btn--locked ${mandatory ? 'is-mandatory' : 'is-optional'}`}>
          <LockIcon />
          {mandatory ? 'Mandatory' : 'Optional'}
        </span>
        <span className="tooltip">Set at brand level</span>
      </span>
    )
  }

  return (
    <div className="mandatory-wrap" ref={ref}>
      <button
        className={`mandatory-btn ${mandatory ? 'is-mandatory' : 'is-optional'}`}
        onClick={() => setOpen(o => !o)}
      >
        {mandatory ? 'Mandatory' : 'Optional'}
        <ChevronDownIcon />
      </button>
      {open && (
        <div className="mandatory-dropdown">
          <button
            className={`mandatory-option ${mandatory ? 'is-selected' : ''}`}
            onClick={() => { onChange(true); setOpen(false) }}
          >
            Mandatory
          </button>
          <button
            className={`mandatory-option ${!mandatory ? 'is-selected' : ''}`}
            onClick={() => { onChange(false); setOpen(false) }}
          >
            Optional
          </button>
        </div>
      )}
    </div>
  )
}

// ─── StatusDropdown ────────────────────────────────────────────

function StatusDropdown({ status, onChange, disabled }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const labels = { active: 'Active', inactive: 'Inactive', disabled: 'Disabled' }

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (disabled) {
    return (
      <span className={`status-btn status-btn--locked status-btn--${status}`}>
        <EyeIcon />
        {labels[status]}
      </span>
    )
  }

  return (
    <div className="status-wrap" ref={ref}>
      <button
        className={`status-btn status-btn--${status}`}
        onClick={() => setOpen(o => !o)}
      >
        <EyeIcon />
        {labels[status]}
        <ChevronDownIcon />
      </button>
      {open && (
        <div className="status-dropdown">
          {['active', 'inactive', 'disabled'].map(s => (
            <button
              key={s}
              className={`status-option ${status === s ? 'is-selected' : ''}`}
              onClick={() => { onChange(s); setOpen(false) }}
            >
              {labels[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── TemplateRow ───────────────────────────────────────────────

function TemplateRow({ template, onUpdate, onDelete }) {
  const isCustom = template.level === 'custom'
  const isDisabled = template.status === 'disabled'
  const [showPerms, setShowPerms] = useState(false)

  return (
    <li className={`template-row ${template.level} ${template.status === 'disabled' ? 'is-disabled' : ''}`}>
      <div className="template-name">
        <span className="template-title">{template.name}</span>
        {template.level === 'brand' && (
          <span className="level-tag">Brand</span>
        )}
      </div>

      <div className="template-actions">
        {/* Permissions — only for custom (office-level) templates */}
        {isCustom && (
          <button className="perm-btn" title="Edit permissions" onClick={() => setShowPerms(true)}>
            <span className="perm-segment">
              <BookIcon />
              <b>Read:</b> {template.read}
            </span>
            <span className="perm-divider" />
            <span className="perm-segment">
              <EditIcon />
              <b>Write:</b> {template.write}
            </span>
          </button>
        )}

        {/* Status */}
        <StatusDropdown
          status={template.status}
          onChange={(s) => onUpdate(template.id, { status: s })}
          disabled={!isCustom}
        />

        {/* Mandatory / Optional */}
        <MandatoryDropdown
          mandatory={template.mandatory}
          onChange={(m) => onUpdate(template.id, { mandatory: m })}
          disabled={!isCustom}
        />

        {/* Icon buttons */}
        <div className="icon-btns">
          {isCustom && (
            <button
              className="icon-btn icon-btn--delete"
              title="Delete"
              onClick={() => onDelete(template.id)}
            >
              <DeleteIcon />
            </button>
          )}
          <button
            className={`icon-btn ${template.includedInPrint ? 'is-active' : ''}`}
            title={template.includedInPrint ? 'Included in print' : 'Not included in print'}
            onClick={() => isCustom && onUpdate(template.id, { includedInPrint: !template.includedInPrint })}
            disabled={!isCustom}
          >
            <PrintIcon />
          </button>
          <button
            className="icon-btn"
            title="Edit"
            disabled={!isCustom || isDisabled}
          >
            <EditIcon />
          </button>
          <button
            className={`icon-btn ${template.reviewRequired ? 'is-active' : ''}`}
            title={template.reviewRequired ? 'Review required' : 'Review not required'}
            onClick={() => isCustom && onUpdate(template.id, { reviewRequired: !template.reviewRequired })}
            disabled={!isCustom}
          >
            <CalendarIcon />
          </button>
        </div>
      </div>

      {showPerms && (
        <PermissionsModal
          read={template.read}
          write={template.write}
          onClose={() => setShowPerms(false)}
          onSave={(read, write) => { onUpdate(template.id, { read, write }); setShowPerms(false) }}
        />
      )}
    </li>
  )
}

// ─── PermissionsModal ─────────────────────────────────────────

function PermissionsModal({ read, write, onClose, onSave }) {
  const [draft, setDraft] = useState({ read, write })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Permissions</h2>
          <button className="modal-close-btn" onClick={onClose}><CloseIcon /></button>
        </div>

        <div className="modal-form">
          <div className="form-row form-row--permissions">
            <div className="permissions-grid">
              {[
                { key: 'read', label: 'Minimum read' },
                { key: 'write', label: 'Minimum write' },
              ].map(({ key, label }) => (
                <div key={key} className="permissions-row">
                  <span className="permissions-row-label">{label}</span>
                  <div className="permissions-options">
                    {ROLES.map(role => (
                      <label key={role.value} className="radio-label">
                        <input
                          type="radio"
                          className="form-radio"
                          checked={draft[key] === role.value}
                          onChange={() => setDraft(prev => ({ ...prev, [key]: role.value }))}
                        />
                        {role.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="round-btn tertiary-btn" onClick={onClose}>Cancel</button>
          <button
            className="round-btn primary-btn"
            onClick={() => onSave(draft.read, draft.write)}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── CreateTemplateModal ──────────────────────────────────────

const OWNER_TYPES = [
  { value: 'customer',            label: 'Customer' },
  { value: 'customer_assessment', label: 'Customer Assessment' },
  { value: 'employee',            label: 'Employee' },
  { value: 'observation',         label: 'Observation' },
]

const EMPTY_FORM = {
  name: '',
  ownerType: 'customer_assessment',
  mandatory: false,
  read: 'Careworker',
  write: 'Care Manager',
}

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
)

function CreateTemplateModal({ onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const isAssessment = form.ownerType === 'customer_assessment'
  const canSave = form.name.trim().length > 0

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box--lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create new document type</h2>
          <button className="modal-close-btn" onClick={onClose}><CloseIcon /></button>
        </div>

        <div className="modal-form">
          {/* Name */}
          <div className="form-row">
            <label className="form-label form-label--required">Name</label>
            <input
              className="form-input"
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Enter document name"
              maxLength={100}
              autoFocus
            />
          </div>

          {/* Owner type */}
          <div className="form-row">
            <label className="form-label">Owner type</label>
            <select
              className="form-select"
              value={form.ownerType}
              onChange={e => set('ownerType', e.target.value)}
            >
              {OWNER_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Mandatory — only for Customer Assessments */}
          {isAssessment && (
            <div className="form-row">
              <label className="form-label">Mandatory</label>
              <div className="radio-group">
                {[{ value: false, label: 'Optional' }, { value: true, label: 'Mandatory' }].map(opt => (
                  <label key={String(opt.value)} className="radio-label">
                    <input
                      type="radio"
                      className="form-radio"
                      checked={form.mandatory === opt.value}
                      onChange={() => set('mandatory', opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Permissions */}
          <div className="form-row form-row--permissions">
            <label className="form-label form-label--required">Permissions</label>
            <div className="permissions-grid">
              {[
                { key: 'read', label: 'Minimum read' },
                { key: 'write', label: 'Minimum write' },
              ].map(({ key, label }) => (
                <div key={key} className="permissions-row">
                  <span className="permissions-row-label">{label}</span>
                  <div className="permissions-options">
                    {ROLES.map(role => (
                      <label key={role.value} className="radio-label">
                        <input
                          type="radio"
                          className="form-radio"
                          checked={form[key] === role.value}
                          onChange={() => set(key, role.value)}
                        />
                        {role.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="round-btn tertiary-btn" onClick={onClose}>Cancel</button>
          <button
            className="round-btn primary-btn"
            disabled={!canSave}
            onClick={() => canSave && onSave(form)}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────

const OFFICE_TABS = ['Details', 'Checklists', 'Documents', 'Care Groups', 'Tags', 'Roster Settings', 'Settings and Permissions']
const DOC_TABS = ['Customer', 'Employee', 'Customer Assessments', 'Observations']

export default function App() {
  const [templates, setTemplates] = useState(TEMPLATES)
  const [level, setLevel] = useState('office')
  const [showDisabled, setShowDisabled] = useState(false)
  const [activeDocTab, setActiveDocTab] = useState('Customer Assessments')
  const [showModal, setShowModal] = useState(false)

  const handleUpdate = (id, changes) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...changes } : t))
  }

  const handleSave = (form) => {
    const newTemplate = {
      id: Date.now(),
      name: form.name.trim(),
      level: 'custom',
      mandatory: form.mandatory,
      status: 'active',
      read: form.read,
      write: form.write,
      includedInPrint: false,
      reviewRequired: false,
    }
    setTemplates(prev => [...prev, newTemplate])
    setShowModal(false)
  }

  const handleDelete = (id) => {
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

  const visible = templates.filter(t => showDisabled || t.status !== 'disabled')

  return (
    <div className="page">
      <a href="../../" className="back-link">
        <ChevronLeftIcon /> Prototypes
      </a>

      <WebNav activePage="settings" />

      <div className="page-content">
        {/* Office primary tabs */}
        <div className="primary-tabs-bar">
          <ul className="primary-tabs">
            {OFFICE_TABS.map(tab => (
              <li key={tab} className={tab === 'Documents' ? 'active' : ''}>
                <button>{tab}</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="documents-content">
          {/* Secondary tabs */}
          <ul className="doc-tabs">
            {DOC_TABS.map(tab => (
              <li key={tab} className={tab === activeDocTab ? 'active' : ''}>
                <button onClick={() => setActiveDocTab(tab)}>{tab}</button>
              </li>
            ))}
          </ul>

          {/* Controls row */}
          <div className="controls-row">
            <div className="controls-left">
              {/* Office/Brand toggle */}
              <div className="level-toggle">
                <button
                  className={`level-toggle-btn ${level === 'office' ? 'active' : ''}`}
                  onClick={() => setLevel('office')}
                >
                  Office
                </button>
                <button
                  className={`level-toggle-btn ${level === 'brand' ? 'active' : ''}`}
                  onClick={() => setLevel('brand')}
                >
                  Brand
                </button>
              </div>

              <label className="show-disabled-label">
                <input
                  type="checkbox"
                  checked={showDisabled}
                  onChange={e => setShowDisabled(e.target.checked)}
                />
                Show disabled documents
              </label>
            </div>

            <div className="controls-right">
              <button className="round-btn primary-btn btn-icon-left" onClick={() => setShowModal(true)}>
                <PlusIcon /> Add
              </button>
            </div>
          </div>

          {/* Template list */}
          <div className="template-list-card">
            <ul className="template-list">
              {visible.map(t => (
                <TemplateRow key={t.id} template={t} onUpdate={handleUpdate} onDelete={handleDelete} />
              ))}
            </ul>
          </div>
        </div>
      </div>

      {showModal && (
        <CreateTemplateModal
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
