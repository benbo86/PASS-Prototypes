import GrossPayAdviceDocument from '../../../Components/GrossPayAdviceDocument'
import { SAMPLE_PREVIEW_GPA, fmtGBP } from './gpaCustomisation'

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <polygon points="18 7.2 16.8 6 12 10.8 7.2 6 6 7.2 10.8 12 6 16.8 7.2 18 12 13.2 16.8 18 18 16.8 13.2 12" fill="currentColor" stroke="currentColor" strokeLinejoin="round" />
  </svg>
)

// Structural copy of customer-profile/funders' InvoicePreviewModal.jsx —
// reads straight off whichever `draft` CustomiseGpaModal is currently
// holding (not a snapshot), stacked above it as a second overlay rather
// than an inline split-pane. No "layout disabled" case to handle here —
// unlike the invoice preview, there's only ever one document shape, so the
// Preview button in CustomiseGpaModal has nothing to disable.
export default function GpaPreviewModal({ open, draft, onClose }) {
  if (!open) return null

  // Nested inside CustomiseGpaModal's own overlay (not a portal) so the
  // preview stacks visually via z-index alone — stopPropagation here is
  // what stops a background click from also bubbling up into that outer
  // overlay's own onClick={onClose} and closing both modals at once.
  return (
    <div className="gpa-modal-overlay gpa-preview-overlay" onClick={(e) => { e.stopPropagation(); onClose() }}>
      <div className="gpa-preview-modal" onClick={e => e.stopPropagation()}>
        <div className="gpa-modal-header">
          <h2 className="gpa-modal-title">Preview — Gross Pay Advice</h2>
          <button className="gpa-modal-close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <div className="gpa-preview-body">
          <div className="gpa-preview-doc-wrap">
            <GrossPayAdviceDocument
              gpa={SAMPLE_PREVIEW_GPA}
              fmtGBP={fmtGBP}
              headerFields={draft.header}
              visitTableFields={draft.tableFields}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
