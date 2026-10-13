import { useEffect, useRef, useState } from 'react'

// Mobile bottom sheet: slides up when `open` becomes true, and slides back
// down before unmounting when it becomes false. Tapping the scrim calls
// onClose. Every close path (scrim, a Cancel button, a confirm action)
// just sets `open` false, so they all animate the same way.
//
// The last children seen while open are kept for the exit animation, so a
// caller can clear its own state (e.g. deleteTarget → null) straight away
// without the sheet emptying as it slides down.
//
// Must sit inside a positioned phone frame/screen: the scrim is
// position:absolute, not fixed. Styles live in Styles/mobile.css.
export default function BottomSheet({ open, onClose, className = '', children }) {
  const [mounted, setMounted] = useState(open)
  const [shown, setShown] = useState(false)
  const lastChildren = useRef(children)
  if (open) lastChildren.current = children

  useEffect(() => {
    if (open) {
      setMounted(true)
      // Two frames so the off-screen start position paints before the
      // transition to on-screen begins.
      let inner
      const outer = requestAnimationFrame(() => { inner = requestAnimationFrame(() => setShown(true)) })
      return () => { cancelAnimationFrame(outer); cancelAnimationFrame(inner) }
    }
    setShown(false)
  }, [open])

  if (!mounted) return null
  return (
    <div
      className={`bottom-sheet-overlay${shown ? ' bottom-sheet-overlay--shown' : ''}`}
      onClick={e => { if (e.target === e.currentTarget) onClose?.() }}
    >
      <div
        className={`bottom-sheet-panel ${className}`.trim()}
        onTransitionEnd={e => { if (e.target === e.currentTarget && !shown && !open) setMounted(false) }}
      >
        {lastChildren.current}
      </div>
    </div>
  )
}
