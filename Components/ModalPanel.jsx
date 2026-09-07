// A centered-and-boxed sibling to Components/SlidePanel.jsx — same prop
// shape (open/onClose/title/children/footer) so anyone who already knows
// SlidePanel already knows this. Deliberately NOT a variant of
// Components/Modal.jsx: that component is the simple case (title + close
// button + freeform children, no footer slot) and its 2 existing
// consumers (component-demos/modal, schedule/leave-requests) are staying
// exactly as they are — this is for the different, header/scrollable-
// body/footer shape first built ad hoc for customer-profile/funders'
// CustomiseInvoiceModal and roster-settings/settings' CustomiseGpaModal
// (~150 lines of near-identical .fd-modal-*/.gpa-modal-* CSS between the
// two), now consolidated here.
//
// `stacked` bumps the z-index one tier above the base (10850 → 10855) —
// for a second ModalPanel that needs to open on top of an already-open
// one (e.g. a "Preview" overlay on top of a "Customise" one). Both tiers
// sit above Components/SlidePanel.jsx's own .slide-panel-overlay (10800)
// so either can also open on top of an already-open SlidePanel, and below
// Dev Edit's fixed UI (10900) so that stays usable regardless of what
// else is open — same z-index reasoning already established for the
// .fd-modal-overlay/.gpa-modal-overlay this replaces.
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <polygon points="18 7.2 16.8 6 12 10.8 7.2 6 6 7.2 10.8 12 6 16.8 7.2 18 12 13.2 16.8 18 18 16.8 13.2 12" fill="currentColor" stroke="currentColor" strokeLinejoin="round" />
  </svg>
)

export default function ModalPanel({ open, onClose, title, children, footer, width = 648, stacked = false }) {
  if (!open) return null

  // stopPropagation unconditionally, not just when `stacked` — harmless
  // for a top-level ModalPanel (nothing above it to propagate into), and
  // what stops a background click on a *nested* one from also bubbling
  // into an outer ModalPanel/SlidePanel's own onClose and closing both at
  // once (the exact bug fixed by hand on InvoicePreviewModal/
  // GpaPreviewModal before this component existed).
  return (
    <div
      className={`modal-panel-overlay${stacked ? ' modal-panel-overlay--stacked' : ''}`}
      onClick={(e) => { e.stopPropagation(); onClose() }}
    >
      <div className="modal-panel" style={{ width }} onClick={e => e.stopPropagation()}>
        <div className="modal-panel-header">
          <h2 className="modal-panel-title">{title}</h2>
          <button className="modal-panel-close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <div className="modal-panel-body">{children}</div>
        {footer && <div className="modal-panel-footer">{footer}</div>}
      </div>
    </div>
  )
}
