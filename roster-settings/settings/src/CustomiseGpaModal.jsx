import { useState, useEffect } from 'react'
import ModalPanel from '../../../Components/ModalPanel'
import { defaultGpaConfig } from './gpaCustomisation'
import GpaPreviewModal from './GpaPreviewModal'

// ─── Icons ────────────────────────────────────────────────────

const GripIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
    <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
    <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
  </svg>
)

// ─── Reorderable field list ─────────────────────────────────────
// Same native-HTML5-drag-and-drop mechanism as customer-profile/funders'
// own CustomiseInvoiceModal.jsx — array order IS column order.
//
// A field can carry `locked: true` (Date) — Ben: "Date (fixed, cannot be
// reordered or unselected)," then corrected the same round: "Lets make
// the date reorderable, my mistake." So `locked` only disables the
// checkbox (always checked, ignores clicks); the drag handle and all
// drag/drop wiring are completely untouched for a locked row, same as any
// other field — matching customer-profile/funders' own Date field exactly.

function ReorderableFieldList({ fields, onReorder, onToggle }) {
  const [dragIndex, setDragIndex] = useState(null)
  const [overIndex, setOverIndex] = useState(null)

  const handleDrop = (i) => (e) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === i) { setDragIndex(null); setOverIndex(null); return }
    const next = [...fields]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(i, 0, moved)
    onReorder(next)
    setDragIndex(null)
    setOverIndex(null)
  }

  return (
    <div className="gpa-field-list">
      {fields.map((f, i) => (
        <div
          key={f.key}
          className={`gpa-reorder-row${dragIndex === i ? ' dragging' : ''}${overIndex === i && dragIndex !== null && dragIndex !== i ? ' drag-over' : ''}`}
          draggable
          onDragStart={() => setDragIndex(i)}
          onDragOver={(e) => { e.preventDefault(); setOverIndex(i) }}
          onDrop={handleDrop(i)}
          onDragEnd={() => { setDragIndex(null); setOverIndex(null) }}
        >
          <span className="gpa-drag-handle" aria-hidden="true"><GripIcon /></span>
          <label className={`gpa-field-checkbox-row${f.locked ? ' gpa-field-checkbox-row--locked' : ''}`}>
            <input
              type="checkbox"
              checked={f.locked || f.enabled}
              disabled={f.locked}
              onChange={() => onToggle(f.key)}
            />
            <span>{f.label}</span>
          </label>
        </div>
      ))}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────
// Structural copy of customer-profile/funders' CustomiseInvoiceModal.jsx,
// minus the Layout/radio-card section entirely — a Gross Pay Advice only
// ever has one document shape, so there's nothing to pick between. Now
// built on Components/ModalPanel.jsx (see CustomiseInvoiceModal.jsx's own
// equivalent note) instead of bespoke .gpa-modal-* chrome.
export default function CustomiseGpaModal({ open, gpaConfig, onClose, onConfirm }) {
  const [draft, setDraft] = useState(defaultGpaConfig())
  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    if (open) {
      setDraft(gpaConfig ? structuredClone(gpaConfig) : defaultGpaConfig())
      setPreviewOpen(false)
    }
  }, [open, gpaConfig])

  if (!open) return null

  const toggleHeaderField = (key) =>
    setDraft(d => ({ ...d, header: d.header.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f) }))

  const toggleTableField = (key) =>
    setDraft(d => ({ ...d, tableFields: d.tableFields.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f) }))

  const reorderTableFields = (nextFields) =>
    setDraft(d => ({ ...d, tableFields: nextFields }))

  // Header fields split into two picker sections — Ben: "split out the
  // header fields, one for company details and the other employee summary
  // which contains the new fields I requested." draft.header stays one
  // flat array (order = company fields then employee-summary fields,
  // fixed by gpaCustomisation.js's own field order); these two derived
  // lists are purely a rendering split, not a second piece of state.
  const companyFields = draft.header.filter(f => f.group === 'company')
  const employeeSummaryFields = draft.header.filter(f => f.group === 'employeeSummary')

  return (
    <>
      <ModalPanel
        open={open}
        onClose={onClose}
        title="Customise layout"
        footer={
          <>
            <button className="round-btn secondary-btn" onClick={() => setPreviewOpen(true)}>
              Preview
            </button>
            <div className="gpa-modal-footer-actions">
              <button className="round-btn tertiary-btn" onClick={onClose}>Cancel</button>
              <button className="round-btn primary-btn" onClick={() => onConfirm(draft)}>Confirm</button>
            </div>
          </>
        }
      >
        <div className="gpa-modal-body-content">
          <div>
            <h3 className="gpa-modal-section-heading">Company details</h3>
            <p className="gpa-modal-section-desc">These fields appear at the top of every Gross Pay Advice.</p>
            <div className="gpa-field-list">
              {companyFields.map(f => (
                <label className="gpa-field-checkbox-row" key={f.key}>
                  <input type="checkbox" checked={f.enabled} onChange={() => toggleHeaderField(f.key)} />
                  <span>{f.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="gpa-modal-section-heading">Employee summary</h3>
            <p className="gpa-modal-section-desc">These totals appear alongside the pay breakdown at the top of every Gross Pay Advice.</p>
            <div className="gpa-field-list">
              {employeeSummaryFields.map(f => (
                <label className="gpa-field-checkbox-row" key={f.key}>
                  <input type="checkbox" checked={f.enabled} onChange={() => toggleHeaderField(f.key)} />
                  <span>{f.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="gpa-modal-section-heading">Visit table fields</h3>
            <p className="gpa-modal-section-desc">Choose which fields appear. Fields can be ordered (left to right)</p>
            <ReorderableFieldList
              fields={draft.tableFields}
              onReorder={reorderTableFields}
              onToggle={toggleTableField}
            />
          </div>
        </div>
      </ModalPanel>

      <GpaPreviewModal
        open={previewOpen}
        draft={draft}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  )
}
