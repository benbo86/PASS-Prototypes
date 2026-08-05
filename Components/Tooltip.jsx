import { useState, useRef, useCallback, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'

// wrapClassName is optional — applied to both the trigger wrap AND the
// portaled tooltip content, so an instance-specific override (e.g.
// employee-restricted-hours' own widened max-width) can still target the
// tooltip via a plain compound class selector (`.tooltip.my-class`) even
// though the tooltip is no longer a DOM descendant of the wrap — see below.
//
// placement defaults to 'top' (the original, only behavior) — pass 'bottom'
// for a trigger with no room above it (e.g. the dev toolbar, pinned to
// top:20px — the default placement would render partly off-screen above
// the viewport there).
//
// Portaled to document.body, positioned via the trigger's own
// getBoundingClientRect rather than CSS position:absolute relative to
// .tooltip-wrap — a CSS-positioned popup gets silently clipped by any
// ancestor with overflow other than visible (a truncating table cell, a
// scrollable panel), which is exactly what happened the first time this
// component was used inside a table cell. Portaling escapes that
// entirely, matching how FilterDropdown/DevComments/Modal/AuthGate already
// solve the same class of problem elsewhere in this repo.
const VIEWPORT_MARGIN = 8

export default function Tooltip({ children, text, wrapClassName, placement = 'top' }) {
  const wrapRef = useRef(null)
  const tooltipRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ left: -9999, top: -9999 })

  // Centers on the trigger by default, then clamps within the viewport so a
  // trigger near the left/right edge (e.g. the last column of a wide table)
  // doesn't run text off-screen. The arrow always stays at the box's own
  // bottom-center rather than trying to track the trigger through a clamp —
  // an arrow shifted off toward one corner to stay "accurate" reads as
  // broken/misaligned, whereas a plain centered tail reads as intentional
  // even when the box itself isn't perfectly centered on the trigger.
  const updatePosition = useCallback(() => {
    if (!wrapRef.current) return
    const rect = wrapRef.current.getBoundingClientRect()
    const centerLeft = rect.left + rect.width / 2
    const tw = tooltipRef.current?.offsetWidth || 0
    let left = centerLeft
    if (tw) {
      const halfW = tw / 2
      left = Math.min(
        Math.max(centerLeft, halfW + VIEWPORT_MARGIN),
        window.innerWidth - halfW - VIEWPORT_MARGIN
      )
    }
    setPos({
      left,
      top: placement === 'bottom' ? rect.bottom + 10 : rect.top - 10,
    })
  }, [placement])

  const show = () => { updatePosition(); setVisible(true) }
  const hide = () => setVisible(false)

  // Keeps the tooltip glued to its trigger if the page/table scrolls or the
  // window resizes while it's open — only wired up while actually visible.
  useLayoutEffect(() => {
    if (!visible) return
    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [visible, updatePosition])

  const wrapClasses = ['tooltip-wrap', wrapClassName].filter(Boolean).join(' ')
  const tooltipClasses = [
    'tooltip',
    placement === 'bottom' ? 'tooltip-below' : null,
    visible ? 'tooltip-visible' : null,
    wrapClassName,
  ].filter(Boolean).join(' ')

  return (
    <div ref={wrapRef} className={wrapClasses} onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {createPortal(
        <div
          ref={tooltipRef}
          className={tooltipClasses}
          style={{ left: pos.left, top: pos.top }}
        >
          {text}
        </div>,
        document.body
      )}
    </div>
  )
}
