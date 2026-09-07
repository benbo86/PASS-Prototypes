import { useState, useEffect } from 'react'
import { defaultGpaConfig } from './gpaCustomisation'
import GpaPreviewModal from './GpaPreviewModal'

// ─── Icons ────────────────────────────────────────────────────

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <polygon points="18 7.2 16.8 6 12 10.8 7.2 6 6 7.2 10.8 12 6 16.8 7.2 18 12 13.2 16.8 18 18 16.8 13.2 12" fill="currentColor" stroke="currentColor" strokeLinejoin="round" />
  </svg>
)

const GripIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
    <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
    <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
  </svg>
)

// ─── Reorderable field list ─────────────────────────────────────
// Same native-HTML5-drag-and-drop mechanism as customer-profile/funders'
// own CustomiseInvoiceModal.jsx — array order IS column order. Date isn't
// part of this list at all (see below), so there's no `locked` flag to
// handle here the way the invoice modal's own list needs — every row in
// this particular list is always fully checkable/draggable.

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
          <label className="gpa-field-checkbox-row">
            <input type="checkbox" checked={f.enabled} onChange={() => onToggle(f.key)} />
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
// ever has one document shape, so there's nothing to pick between.
//
// Date is genuinely locked here — Ben: "Date (fixed, cannot be reordered
// or unselected)" — a deliberate difference from how the invoice modal's
// own Date ended up (reorderable, only its checkbox locked). Rather than
// mixing a `locked` flag into the reorderable array (which would need the
// drag logic itself to special-case never dropping another field onto
// index 0), Date is rendered as its own static, non-draggable row directly
// above <ReorderableFieldList> — the same approach originally tried for
// the invoice modal's Date field before that spec changed.
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

  return (
    <div className="gpa-modal-overlay" onClick={onClose}>
      <div className="gpa-modal" onClick={e => e.stopPropagation()}>
        <div className="gpa-modal-header">
          <h2 className="gpa-modal-title">Customise layout</h2>
          <button className="gpa-modal-close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <div className="gpa-modal-body">
          <div>
            <h3 className="gpa-modal-section-heading">Header fields</h3>
            <p className="gpa-modal-section-desc">These fields appear at the top of every Gross Pay Advice.</p>
            <div className="gpa-field-list">
              {draft.header.map(f => (
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
            <div className="gpa-field-list">
              {/* Static, non-draggable — Date is always the first column
                  and can never be turned off. */}
              <label className="gpa-field-checkbox-row gpa-field-checkbox-row--locked">
                <input type="checkbox" checked readOnly disabled />
                <span>Date</span>
              </label>
            </div>
            <ReorderableFieldList
              fields={draft.tableFields}
              onReorder={reorderTableFields}
              onToggle={toggleTableField}
            />
          </div>
        </div>

        <div className="gpa-modal-footer">
          <button className="round-btn secondary-btn" onClick={() => setPreviewOpen(true)}>
            Preview
          </button>
          <div className="gpa-modal-footer-actions">
            <button className="round-btn tertiary-btn" onClick={onClose}>Cancel</button>
            <button className="round-btn primary-btn" onClick={() => onConfirm(draft)}>Confirm</button>
          </div>
        </div>
      </div>

      <GpaPreviewModal
        open={previewOpen}
        draft={draft}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  )
}
