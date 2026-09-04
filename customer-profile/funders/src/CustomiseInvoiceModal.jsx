import { useState, useEffect } from 'react'
import Tooltip from '../../../Components/Tooltip'
import { INVOICE_LAYOUTS, defaultInvoiceConfig } from './data'
import InvoicePreviewModal from './InvoicePreviewModal'

// ─── Icons ────────────────────────────────────────────────────

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <polygon points="18 7.2 16.8 6 12 10.8 7.2 6 6 7.2 10.8 12 6 16.8 7.2 18 12 13.2 16.8 18 18 16.8 13.2 12" fill="currentColor" stroke="currentColor" strokeLinejoin="round" />
  </svg>
)

// Copied verbatim from Icons/Info.svg, per this repo's own icon-copy-
// fidelity convention.
const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M12,2 C17.52,2 22,6.48 22,12 C22,17.52 17.52,22 12,22 C6.48,22 2,17.52 2,12 C2,6.48 6.48,2 12,2 Z M10.6662105,9.93690394 L10.581437,9.93690394 C10.1076337,9.93690394 9.72611507,10.3209137 9.72611507,10.7922258 C9.72611507,11.2660291 10.1101248,11.6475478 10.581437,11.6475478 L10.6662105,11.6475478 L10.6662105,16.6348056 L10.5826825,16.6348056 C10.1096134,16.6348056 9.72611507,17.0183039 9.72611507,17.491373 C9.72611507,17.9644422 10.1096134,18.3479405 10.5826825,18.3479405 L13.4173175,18.3479405 C13.8903866,18.3479405 14.2738849,17.9644422 14.2738849,17.491373 C14.2738849,17.0183039 13.8903866,16.6348056 13.4173175,16.6348056 L13.3387717,16.6348056 L13.3362805,10.936904 C13.3360752,10.3847645 12.8884201,9.93727594 12.3362806,9.93727594 L10.6662105,9.93690394 Z M11.8678197,5.65205952 C11.0006244,5.65205952 10.2992557,6.35342819 10.2992557,7.22062354 C10.2992557,8.08781889 11.0006244,8.78918756 11.8678197,8.78918756 C12.7350151,8.78918756 13.4363837,8.08781889 13.4363837,7.22062354 C13.4363837,6.35342819 12.7350151,5.65205952 11.8678197,5.65205952 Z" fill="currentColor" />
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
// Native HTML5 drag-and-drop — array order IS display/column order.
// Toggling a field's checkbox never changes its position, so a field
// unchecked and later re-checked reappears exactly where it was.

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
    <div className="fd-field-list">
      {fields.map((f, i) => (
        <div
          key={f.key}
          className={`fd-reorder-row${dragIndex === i ? ' dragging' : ''}${overIndex === i && dragIndex !== null && dragIndex !== i ? ' drag-over' : ''}`}
          draggable
          onDragStart={() => setDragIndex(i)}
          onDragOver={(e) => { e.preventDefault(); setOverIndex(i) }}
          onDrop={handleDrop(i)}
          onDragEnd={() => { setDragIndex(null); setOverIndex(null) }}
        >
          <span className="fd-drag-handle" aria-hidden="true"><GripIcon /></span>
          <label className="fd-field-checkbox-row">
            <input type="checkbox" checked={f.enabled} onChange={() => onToggle(f.key)} />
            <span>{f.label}</span>
          </label>
        </div>
      ))}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────

export default function CustomiseInvoiceModal({ open, invoiceConfig, onClose, onConfirm }) {
  const [draft, setDraft] = useState(defaultInvoiceConfig())
  const [previewOpen, setPreviewOpen] = useState(false)

  // Re-seeds every time the modal opens — from the funder's own saved
  // config if it has one, or sensible defaults for a funder whose
  // document has never been customised yet. Same "seed on open, not on
  // mount" reasoning as VisitPanel.jsx's own `pending` state.
  useEffect(() => {
    if (open) {
      setDraft(invoiceConfig ? structuredClone(invoiceConfig) : defaultInvoiceConfig())
      setPreviewOpen(false)
    }
  }, [open, invoiceConfig])

  if (!open) return null

  const toggleHeaderField = (key) =>
    setDraft(d => ({ ...d, header: d.header.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f) }))

  const setLayout = (layoutKey) => setDraft(d => ({ ...d, layout: layoutKey }))

  const toggleLayoutField = (key) =>
    setDraft(d => ({
      ...d,
      fieldOrders: {
        ...d.fieldOrders,
        [d.layout]: d.fieldOrders[d.layout].map(f => f.key === key ? { ...f, enabled: !f.enabled } : f),
      },
    }))

  const reorderLayoutFields = (nextFields) =>
    setDraft(d => ({ ...d, fieldOrders: { ...d.fieldOrders, [d.layout]: nextFields } }))

  const activeLayoutFields = draft.fieldOrders[draft.layout]

  return (
    <div className="fd-modal-overlay" onClick={onClose}>
      <div className="fd-modal" onClick={e => e.stopPropagation()}>
        <div className="fd-modal-header">
          <h2 className="fd-modal-title">Customise document</h2>
          <button className="fd-modal-close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <div className="fd-modal-body">
          <div>
            <h3 className="fd-modal-section-heading">Header fields</h3>
            <p className="fd-modal-section-desc">These fields appear at the top of every invoice.</p>
            <div className="fd-field-list">
              {draft.header.map(f => (
                <label className="fd-field-checkbox-row" key={f.key}>
                  <input type="checkbox" checked={f.enabled} onChange={() => toggleHeaderField(f.key)} />
                  <span>{f.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="fd-modal-section-heading">Layout</h3>
            <p className="fd-modal-section-desc">Pick a layout for the itemised list of visits</p>
            {/* Ben: primary/secondary buttons "don't feel like the right UI
                here" — picking a layout is a single selection, not an
                action, so a button-toggle was the wrong control semantically
                as well as visually. Confirmed via AskUserQuestion: radio
                cards over a segmented control or a plain radio row —
                Styles/main.css's own shared .radio-card + .form-radio
                (promoted to the UI Kit, see component-demos/ui-kit). */}
            <div className="fd-layout-picker">
              {INVOICE_LAYOUTS.map(l => (
                <label
                  key={l.key}
                  className={`radio-card${l.key === draft.layout ? ' selected' : ''}`}
                >
                  <input
                    type="radio"
                    className="form-radio"
                    name="fd-invoice-layout"
                    checked={l.key === draft.layout}
                    onChange={() => setLayout(l.key)}
                  />
                  <span>{l.name}</span>
                  {/* Ben: "I'd like a description of what each layout is" —
                      copy matches the live product verbatim (data.js). */}
                  <Tooltip text={l.description}>
                    <InfoIcon />
                  </Tooltip>
                </label>
              ))}
            </div>

            <p className="fd-modal-section-desc">Choose which fields appear. Fields can be ordered (left to right)</p>
            <ReorderableFieldList
              fields={activeLayoutFields}
              onReorder={reorderLayoutFields}
              onToggle={toggleLayoutField}
            />
          </div>
        </div>

        <div className="fd-modal-footer">
          {/* Weekly totals has no real document to preview yet — Ben:
              "This is an example of the visits list not the weekly totals,
              lets leave the preview for the weekly totals as we don't have
              this yet." Disabled rather than hidden, so the option's
              presence/absence doesn't shift depending on which layout is
              selected. */}
          <button
            className="round-btn secondary-btn"
            onClick={() => setPreviewOpen(true)}
            disabled={draft.layout === 'weeklyTotals'}
            title={draft.layout === 'weeklyTotals' ? "Preview isn't available for Weekly totals yet" : undefined}
          >
            Preview
          </button>
          <div className="fd-modal-footer-actions">
            <button className="round-btn tertiary-btn" onClick={onClose}>Cancel</button>
            <button className="round-btn primary-btn" onClick={() => onConfirm(draft)}>Confirm</button>
          </div>
        </div>
      </div>

      <InvoicePreviewModal
        open={previewOpen}
        draft={draft}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  )
}
