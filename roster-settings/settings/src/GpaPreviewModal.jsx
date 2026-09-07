import ModalPanel from '../../../Components/ModalPanel'
import GrossPayAdviceDocument from '../../../Components/GrossPayAdviceDocument'
import { SAMPLE_PREVIEW_GPA, fmtGBP } from './gpaCustomisation'

// Structural copy of customer-profile/funders' InvoicePreviewModal.jsx —
// reads straight off whichever `draft` CustomiseGpaModal is currently
// holding (not a snapshot), stacked above it as a second overlay rather
// than an inline split-pane. No "layout disabled" case to handle here —
// unlike the invoice preview, there's only ever one document shape, so the
// Preview button in CustomiseGpaModal has nothing to disable.
export default function GpaPreviewModal({ open, draft, onClose }) {
  return (
    <ModalPanel open={open} onClose={onClose} title="Preview — Gross Pay Advice" width={1040} stacked>
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
    </ModalPanel>
  )
}
