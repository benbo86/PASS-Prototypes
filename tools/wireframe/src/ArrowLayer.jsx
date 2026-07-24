import { useEffect, useRef, useState } from 'react'

// One SVG overlay for every arrow on the canvas — arrows need a real
// arrowhead, which is awkward to get with CSS borders alone, so this is the
// one element type rendered outside the plain-HTML-div approach the other
// four types use.
//
// v2: an arrow's own 2-endpoint handles only render when it's the *sole*
// selected element — more precise/intuitive than a generic bounding box for
// a diagonal line. As soon as anything else joins the selection (or an
// arrow is part of a multi-select/group), the shared SelectionOverlay's 8
// handles take over instead (see geometry.js's transformSelection, which
// treats an arrow's two points like any other element's bounding box).
export default function ArrowLayer({ arrows, selectedIds, activeTool, onMouseDown, onEndpointMouseDown, onContextMenu, onLabelChange, onDoubleClick, width, height }) {
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (editingId) inputRef.current?.focus()
  }, [editingId])

  const startEditing = (arrow) => {
    onDoubleClick(arrow)
    setDraft(arrow.label || '')
    setEditingId(arrow.id)
  }
  const commit = (id) => {
    onLabelChange(id, draft)
    setEditingId(null)
  }

  return (
    <svg className="wf-arrow-layer" width={width} height={height}>
      <defs>
        <marker id="wf-arrowhead" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M0,0 L10,5 L0,10 Z" fill="#333333" />
        </marker>
      </defs>
      {arrows.map((a) => {
        const midX = (a.x1 + a.x2) / 2
        const midY = (a.y1 + a.y2) / 2
        const isSelected = selectedIds.includes(a.id)
        const isSoleSelection = selectedIds.length === 1 && selectedIds[0] === a.id
        return (
          <g key={a.id}>
            {/* A selected-but-not-sole arrow (part of a multi-select/
                group) gets no endpoint handles of its own — the shared
                SelectionOverlay owns resizing then — but still needs some
                visual indication it's included, matching box elements'
                own .wf-el-selected outline. A thicker highlight stroke
                underneath the real line is simpler than a dashed bounding
                box for a diagonal line. */}
            {isSelected && (
              <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} className="wf-arrow-selected-highlight" pointerEvents="none" />
            )}
            {/* Fat, invisible hit-stroke — much easier to grab an arrow's
                body than the thin visible line alone would allow. */}
            <line
              x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
              stroke="transparent"
              strokeWidth={16}
              style={{ cursor: activeTool === 'pointer' ? 'move' : 'default', pointerEvents: 'stroke' }}
              onMouseDown={(e) => onMouseDown(e, a)}
              onContextMenu={(e) => onContextMenu(e, a)}
              onDoubleClick={(e) => {
                if (activeTool !== 'pointer') return
                e.stopPropagation()
                startEditing(a)
              }}
            />
            <line
              x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
              stroke={a.stroke} strokeWidth={a.strokeWidth}
              markerEnd="url(#wf-arrowhead)"
              pointerEvents="none"
            />
            {a.label && editingId !== a.id && (
              <text
                x={midX} y={midY - 8} textAnchor="middle"
                fontSize={a.fontSize || 13}
                fontFamily={a.fontFamily || 'Barlow'}
                fontWeight={a.fontWeight || 400}
                fill={a.textColor || '#333333'}
                pointerEvents="none"
              >
                {a.label}
              </text>
            )}
            {editingId === a.id && (
              <foreignObject x={midX - 70} y={midY - 22} width={140} height={28}>
                <input
                  ref={inputRef}
                  className="wf-label-input wf-arrow-label-input"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  onBlur={() => commit(a.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commit(a.id)
                    else if (e.key === 'Escape') { e.stopPropagation(); setEditingId(null) }
                  }}
                />
              </foreignObject>
            )}
            {isSoleSelection && activeTool === 'pointer' && (
              <>
                <circle cx={a.x1} cy={a.y1} r={6} className="wf-arrow-endpoint" onMouseDown={(e) => onEndpointMouseDown(e, a, 'p1')} />
                <circle cx={a.x2} cy={a.y2} r={6} className="wf-arrow-endpoint" onMouseDown={(e) => onEndpointMouseDown(e, a, 'p2')} />
              </>
            )}
          </g>
        )
      })}
    </svg>
  )
}
