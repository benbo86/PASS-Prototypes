import { useState } from 'react'
import SlidePanel from '../../../Components/SlidePanel'
import CustomiseInvoiceModal from './CustomiseInvoiceModal'
import { invoiceLayoutName } from './data'

// "Edit funder" — deliberately doesn't rebuild every field from the
// summary card as an editable input ("we don't need to create all
// existing funder options, lets keep this read only in the summary").
// The only genuinely editable thing here this round is the invoice
// document customisation, reached via its own modal.
//
// Cancel/Save footer included even though nothing at *this* level is
// currently editable (invoice document changes are committed directly by
// the Customise document modal's own Confirm) — Ben: "Always use this
// when we use the slide panel component." Both buttons just close for
// now, same as the panel's own built-in ×; if this panel ever grows a
// real top-level field, Save has somewhere to actually commit it without
// changing the footer's own shape.
export default function FunderPanel({ open, funder, onClose, onSaveInvoiceConfig }) {
  const [modalOpen, setModalOpen] = useState(false)

  const handleConfirmInvoiceConfig = (config) => {
    onSaveInvoiceConfig(config)
    setModalOpen(false)
  }

  return (
    <>
      <SlidePanel
        open={open}
        onClose={onClose}
        title="Edit funder"
        footer={
          <>
            <button className="round-btn tertiary-btn" onClick={onClose}>Cancel</button>
            <button className="round-btn primary-btn" onClick={onClose}>Save</button>
          </>
        }
      >
        <div className="fd-panel-top-row">
          <div className="fd-invoice-doc-section">
            <div>
              <h3 className="fd-modal-section-heading">
                <span className="fd-required-asterisk">*</span> Invoice document
              </h3>
              <p className="fd-invoice-doc-layout">
                <strong>Layout:</strong> {invoiceLayoutName(funder?.invoiceConfig?.layout)}
              </p>
            </div>
            <button className="round-btn primary-btn" onClick={() => setModalOpen(true)}>
              Customise document
            </button>
          </div>
          {/* Ben, 2026-09-04: "I mean't the style of the scenario label,
              perhaps more boxy in the top right of the slide out body" —
              employee-contract/holiday-pay-deduction's own
              .he-scenario-label (lavender fill, left accent border,
              rounded on the right only), reused verbatim here rather than
              the hover-tooltip tried previously, and laid out via
              .fd-panel-top-row's flex row so it sits at the top-right of
              the panel body instead of inline with the heading text. */}
          <div className="fd-invoice-doc-note">
            This option will replace the Invoice template option.
          </div>
        </div>
      </SlidePanel>

      {funder && (
        <CustomiseInvoiceModal
          open={modalOpen}
          invoiceConfig={funder.invoiceConfig}
          onClose={() => setModalOpen(false)}
          onConfirm={handleConfirmInvoiceConfig}
        />
      )}
    </>
  )
}
