import ModalPanel from '../../../Components/ModalPanel'
import InvoiceDocument from '../../../Components/InvoiceDocument'
import { SAMPLE_PREVIEW_INVOICE, fmtGBP } from './data'

// A second ModalPanel stacked on top of CustomiseInvoiceModal's own —
// `stacked` bumps its z-index one tier above the base so it visually wins,
// and its own background-click handler (ModalPanel's own stopPropagation)
// is what stops closing this one from also closing the Customise modal
// underneath it.
export default function InvoicePreviewModal({ open, draft, onClose }) {
  return (
    <ModalPanel open={open} onClose={onClose} title="Preview — Visit list" width={1040} stacked>
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
    </ModalPanel>
  )
}
