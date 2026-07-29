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

// 4 dedicated round handles, positioned just outside each corner square —
// deliberately separate elements from HANDLES above (not the same corner
// square doing double duty by drag distance), so grabbing one is always
// unambiguous: the square resizes, the round handle just outside it
// rotates. Only rendered when the parent (Canvas.jsx) determines exactly
// one non-arrow element is selected — see isSoleRotatableSelected there.
const ROTATE_HANDLES = ['nw', 'ne', 'se', 'sw']

export default function SelectionOverlay({ box, onHandleMouseDown, onContextMenu, rotation = 0, showRotateHandles = false, onRotateHandleMouseDown }) {
  return (
    <div
      className="wf-selection-overlay"
      style={{
        left: box.x, top: box.y, width: box.w, height: box.h,
        // Rotating the whole overlay (rather than computing each handle's
        // own rotated screen position) is what makes its 8 resize handles
        // — and the 4 rotate handles below — visually track the element's
        // actual rotated corners for free via plain CSS: this box and
        // ElementRenderer's own box share the identical center, so the two
        // transforms rotate in lockstep.
        ...(rotation ? { transform: `rotate(${rotation}deg)`, transformOrigin: 'center' } : {}),
      }}
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
      {showRotateHandles && ROTATE_HANDLES.map((corner) => (
        <div
          key={`rotate-${corner}`}
          className={`wf-rotate-handle wf-rotate-handle-${corner}`}
          onMouseDown={(e) => onRotateHandleMouseDown(e, corner)}
        />
      ))}
    </div>
  )
}
