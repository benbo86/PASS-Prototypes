import { useState, useRef, useEffect } from 'react'

// Generic bulk-actions dropdown: a trigger (fully caller-controlled, so it
// can reuse whatever button markup/classes the page already has — e.g. the
// existing round-btn "Actions" button) plus a flat list of
// { label, onClick, disabled } items. Not portaled — this is meant to live
// in a page header, not inside a scrolling table (unlike FilterDropdown,
// which does need a portal to escape table overflow clipping).
export default function ActionsMenu({ trigger, items, disabled, align = 'right' }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleMouseDown(e) {
      if (wrapRef.current?.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [open])

  useEffect(() => {
    if (disabled) setOpen(false)
  }, [disabled])

  return (
    <div className="actions-menu-wrap" ref={wrapRef}>
      {trigger({ open, toggle: () => !disabled && setOpen(v => !v) })}
      {open && (
        <div className={`actions-menu-panel actions-menu-panel--${align}`}>
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              className="actions-menu-item"
              disabled={item.disabled}
              title={item.disabled ? item.disabledReason : undefined}
              onClick={() => { item.onClick(); setOpen(false) }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
