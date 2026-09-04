import InvoiceDocument from '../../../Components/InvoiceDocument'
import { SAMPLE_PREVIEW_INVOICE, fmtGBP } from './data'

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <polygon points="18 7.2 16.8 6 12 10.8 7.2 6 6 7.2 10.8 12 6 16.8 7.2 18 12 13.2 16.8 18 18 16.8 13.2 12" fill="currentColor" stroke="currentColor" strokeLinejoin="round" />
  </svg>
)

// Reads straight off whichever `draft` CustomiseInvoiceModal is currently
// holding — not a snapshot copied at open-time — so if this were ever kept
// mounted while the draft changes, it would already be showing the current
// state with no extra plumbing. Ben: "The preview should update when any
// of the fields are changed." Separate overlay, stacked above
// CustomiseInvoiceModal (fd-modal-overlay, 10850) — confirmed via
// AskUserQuestion over an inline split-pane, matching the existing
// Invoices-page precedent of a preview that opens on top rather than
// living beside the fields being edited.
//
// Visit list only — CustomiseInvoiceModal's own Preview button is disabled
// whenever Weekly totals is selected, so `draft.layout` is always
// 'visitList' by the time this ever opens (see Components/InvoiceDocument.jsx
// for why: there's no real Weekly totals document design yet).
export default function InvoicePreviewModal({ open, draft, onClose }) {
  if (!open) return null

  // Nested inside CustomiseInvoiceModal's own overlay (not a portal) so the
  // preview stacks visually via z-index alone — stopPropagation here is
  // what stops a background click from also bubbling up into that outer
  // overlay's own onClick={onClose} and closing both modals at once.
  return (
    <div className="fd-modal-overlay fd-preview-overlay" onClick={(e) => { e.stopPropagation(); onClose() }}>
      <div className="fd-preview-modal" onClick={e => e.stopPropagation()}>
        <div className="fd-modal-header">
          <h2 className="fd-modal-title">Preview — Visit list</h2>
          <button className="fd-modal-close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <div className="fd-preview-body">
          <div className="fd-preview-doc-wrap">
            <InvoiceDocument
              invoice={SAMPLE_PREVIEW_INVOICE}
              fmtGBP={fmtGBP}
              headerFields={draft.header}
              visitListFields={draft.fieldOrders.visitList}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
