import { isDevToolUi } from './devEditHoverSticky'
import React, { useState, useRef, useEffect } from 'react'
import Tooltip from './Tooltip'

// Info.svg (Icons/), currentColor so it takes the menu's colour
const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12,2 C17.52,2 22,6.48 22,12 C22,17.52 17.52,22 12,22 C6.48,22 2,17.52 2,12 C2,6.48 6.48,2 12,2 Z M10.6662105,9.93690394 L10.581437,9.93690394 C10.1076337,9.93690394 9.72611507,10.3209137 9.72611507,10.7922258 C9.72611507,11.2660291 10.1101248,11.6475478 10.581437,11.6475478 L10.6662105,11.6475478 L10.6662105,16.6348056 L10.5826825,16.6348056 C10.1096134,16.6348056 9.72611507,17.0183039 9.72611507,17.491373 C9.72611507,17.9644422 10.1096134,18.3479405 10.5826825,18.3479405 L13.4173175,18.3479405 C13.8903866,18.3479405 14.2738849,17.9644422 14.2738849,17.491373 C14.2738849,17.0183039 13.8903866,16.6348056 13.4173175,16.6348056 L13.3387717,16.6348056 L13.3362805,10.936904 C13.3360752,10.3847645 12.8884201,9.93727594 12.3362806,9.93727594 L10.6662105,9.93690394 Z M11.8678197,5.65205952 C11.0006244,5.65205952 10.2992557,6.35342819 10.2992557,7.22062354 C10.2992557,8.08781889 11.0006244,8.78918756 11.8678197,8.78918756 C12.7350151,8.78918756 13.4363837,8.08781889 13.4363837,7.22062354 C13.4363837,6.35342819 12.7350151,5.65205952 11.8678197,5.65205952 Z" />
  </svg>
)

// Generic bulk-actions dropdown: a trigger (fully caller-controlled, so it
// can reuse whatever button markup/classes the page already has — e.g. the
// existing round-btn "Actions" button) plus a flat list of
// { label, onClick, disabled, info } items. `info` (optional text) adds an info icon
// beside the item whose hover/focus tooltip explains it. Not portaled — this is meant to live
// in a page header, not inside a scrolling table (unlike FilterDropdown,
// which does need a portal to escape table overflow clipping).
export default function ActionsMenu({ trigger, items, disabled, align = 'right' }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleMouseDown(e) {
    if (isDevToolUi(e.target)) return // a click on dev-tool chrome isn't a click away
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
          {items.map((item, i) => {
            const button = (
              <button
                type="button"
                className="actions-menu-item"
                disabled={item.disabled}
                title={item.disabled ? item.disabledReason : undefined}
                onClick={() => { item.onClick(); setOpen(false) }}
              >
                {item.label}
              </button>
            )
            return item.info ? (
              <div key={i} className="actions-menu-row">
                {button}
                <Tooltip text={item.info} wrapClassName="actions-menu-info-tip">
                  <span className="actions-menu-info" tabIndex={0} role="img" aria-label={`About ${item.label}`}><InfoIcon /></span>
                </Tooltip>
              </div>
            ) : React.cloneElement(button, { key: i })
          })}
        </div>
      )}
    </div>
  )
}
