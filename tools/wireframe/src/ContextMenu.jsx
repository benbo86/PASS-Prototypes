import { createPortal } from 'react-dom'

// Small right-click menu — replaces v1's toolbar Send to back/Bring to
// front/Delete buttons. Always acts on the *whole* current selection
// (Canvas.jsx ensures the right-clicked target is part of the selection
// before opening this). Portaled to document.body and positioned with
// `fixed` + raw clientX/clientY — Canvas.jsx's own coordinate space is
// canvas-local (scrollable/offset), but a context menu should just float
// at the cursor's screen position, same reasoning as Dev Edit's own
// portaled panels (AuthGate/SaveVersionDialog). A full-screen transparent
// backdrop closes it on any outside click, matching that same family's
// overlay-click-to-close convention.
export default function ContextMenu({ x, y, onSendToBack, onBringToFront, onDelete, onClose }) {
  return createPortal(
    <div className="wf-context-backdrop" onMouseDown={onClose} onContextMenu={(e) => { e.preventDefault(); onClose() }}>
      <div className="wf-context-menu" style={{ left: x, top: y }} onMouseDown={(e) => e.stopPropagation()}>
        <button onClick={() => { onSendToBack(); onClose() }}>Send to back</button>
        <button onClick={() => { onBringToFront(); onClose() }}>Bring to front</button>
        <button className="wf-danger" onClick={() => { onDelete(); onClose() }}>Delete</button>
      </div>
    </div>,
    document.body
  )
}
