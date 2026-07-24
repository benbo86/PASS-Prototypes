// Shared bounding-box + 8 resize handles for the *entire* current
// selection (a single element, a transient multi-select, or a persistent
// group) — replaces v1's per-element handles. Not rendered at all when
// exactly one arrow is selected alone (ArrowLayer renders its own 2
// endpoint handles for that case instead — see ArrowLayer.jsx).
const HANDLES = [
  { name: 'nw', cursor: 'nwse-resize' },
  { name: 'n', cursor: 'ns-resize' },
  { name: 'ne', cursor: 'nesw-resize' },
  { name: 'e', cursor: 'ew-resize' },
  { name: 'se', cursor: 'nwse-resize' },
  { name: 's', cursor: 'ns-resize' },
  { name: 'sw', cursor: 'nesw-resize' },
  { name: 'w', cursor: 'ew-resize' },
]

export default function SelectionOverlay({ box, onHandleMouseDown, onContextMenu }) {
  return (
    <div
      className="wf-selection-overlay"
      style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
      onContextMenu={onContextMenu}
    >
      {HANDLES.map((h) => (
        <div
          key={h.name}
          className={`wf-handle wf-handle-${h.name}`}
          style={{ cursor: h.cursor }}
          onMouseDown={(e) => onHandleMouseDown(e, h.name)}
        />
      ))}
    </div>
  )
}
