import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

const EllipsisIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2.2" />
    <circle cx="12" cy="12" r="2.2" />
    <circle cx="19" cy="12" r="2.2" />
  </svg>
)

// A small "⋮" trigger that opens a portaled dropdown of secondary row
// actions — e.g. a table row with one primary action shown inline (Approve)
// plus a couple of rarer/destructive ones (Decline, Cancel) that don't need
// their own permanent slot in the row. Components/ActionsMenu.jsx already
// covers a similar { label, onClick, disabled } dropdown, but it's
// explicitly non-portaled — fine for a page-header trigger, not for a row
// inside a scrolling/clipping table body. This reuses the anchor+portal
// technique Components/FilterDropdown.jsx already established for exactly
// that problem in the same kind of table.
export default function RowActionsMenu({ items }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, right: 0 })
  const btnRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open || !btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    setPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right })
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleMouseDown(e) {
      if (menuRef.current?.contains(e.target)) return
      if (btnRef.current?.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [open])

  return (
    <>
      <button
        type="button"
        ref={btnRef}
        className="row-actions-btn"
        aria-label="More actions"
        data-devmode-passthrough="true"
        onClick={() => setOpen((v) => !v)}
      >
        <EllipsisIcon />
      </button>
      {open && createPortal(
        <div
          className="row-actions-panel"
          ref={menuRef}
          style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
        >
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              className="row-actions-item"
              disabled={item.disabled}
              onClick={() => { item.onClick(); setOpen(false) }}
            >
              {item.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}
