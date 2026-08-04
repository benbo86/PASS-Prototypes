import { useRef } from 'react'

// A thin draggable strip on a column's right edge. Trades width with its
// immediate right-hand neighbour only (not a global reflow) — the simplest
// model that keeps a table's total width constant while resizing. Pure
// presentation/gesture — the actual width math lives in the caller's
// resizeColumn (see Components/useSharedColumnWidths.js).
export default function ColResizeHandle({ onDrag }) {
  const lastXRef = useRef(0)

  const onMouseDown = e => {
    e.preventDefault()
    e.stopPropagation()
    lastXRef.current = e.clientX

    const onMouseMove = e2 => {
      const dx = e2.clientX - lastXRef.current
      lastXRef.current = e2.clientX
      onDrag(dx)
    }
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  return (
    <span
      className="col-resize-handle"
      data-devmode-passthrough="true"
      onMouseDown={onMouseDown}
      onClick={e => e.stopPropagation()}
    />
  )
}
