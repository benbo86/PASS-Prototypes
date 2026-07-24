import { useEffect, useLayoutEffect, useRef } from 'react'
import ElementRenderer from './ElementRenderer'
import ArrowLayer from './ArrowLayer'
import SelectionOverlay from './SelectionOverlay'
import ContextMenu from './ContextMenu'
import { useCanvasInteraction } from './useCanvasInteraction'
import { computeBoundingBox, groupMembersOf, clampZoom, ZOOM_STEP } from './geometry'

// A genuinely large fixed workspace (true infinite canvas is a much bigger
// architectural change, not warranted here) — combined with zoom below,
// this gives the "small elements in a big open space" feel of Figma/Miro
// without an unbounded-canvas rewrite.
export const CANVAS_WIDTH = 4000
export const CANVAS_HEIGHT = 2800

export default function Canvas({
  elements,
  setElements,
  activeTool,
  setActiveTool,
  selectedIds,
  setSelectedIds,
  onDragStart,
  onSendToBack,
  onBringToFront,
  onDelete,
  contextMenu,
  setContextMenu,
  textDefaults,
  onTextPlaced,
  autoEditId,
  onAutoEditConsumed,
  zoom,
  setZoom,
}) {
  const canvasRef = useRef(null)
  const scrollRef = useRef(null)
  // Set by the wheel-zoom handler right before setZoom — applied in the
  // useLayoutEffect below once the DOM has actually re-rendered at the new
  // scale (setting scrollLeft/Top synchronously in the wheel handler itself
  // would race the still-old-scale layout and get clamped incorrectly).
  const pendingScrollRef = useRef(null)

  const {
    onCanvasMouseDown,
    onElementMouseDown,
    onSelectionHandleMouseDown,
    onArrowEndpointMouseDown,
    marqueeRect,
  } = useCanvasInteraction({
    elements, setElements, activeTool, setActiveTool, selectedIds, setSelectedIds, canvasRef, onDragStart,
    textDefaults, onTextPlaced, zoom,
  })

  // Right after a zoom change actually commits to the DOM (new transform
  // scale applied), restore whatever scroll position keeps the
  // zoomed-around point visually anchored — see handleWheel below for how
  // that target is computed.
  useLayoutEffect(() => {
    if (!pendingScrollRef.current || !scrollRef.current) return
    const { left, top } = pendingScrollRef.current
    pendingScrollRef.current = null
    scrollRef.current.scrollLeft = left
    scrollRef.current.scrollTop = top
  }, [zoom])

  // Ctrl/Cmd+scroll (and trackpad pinch, which browsers surface as a wheel
  // event with ctrlKey:true) zooms in/out centered on the cursor — a native
  // listener with { passive: false } is required to preventDefault() the
  // browser's own page-zoom; React's synthetic onWheel can't do that.
  useEffect(() => {
    const scrollEl = scrollRef.current
    if (!scrollEl) return
    function handleWheel(e) {
      if (!(e.ctrlKey || e.metaKey)) return
      e.preventDefault()
      const rect = scrollEl.getBoundingClientRect()
      const cursorOffsetX = e.clientX - rect.left
      const cursorOffsetY = e.clientY - rect.top
      // The canvas-space point currently under the cursor, at the OLD zoom.
      const canvasX = (scrollEl.scrollLeft + cursorOffsetX) / zoom
      const canvasY = (scrollEl.scrollTop + cursorOffsetY) / zoom
      // Proportional (not fixed-step) so a big scroll burst doesn't jump
      // too far — clamped per-tick so it never feels like it teleports.
      const rawDelta = Math.max(-0.2, Math.min(0.2, -e.deltaY * 0.01))
      const newZoom = clampZoom(zoom * (1 + rawDelta))
      if (newZoom === zoom) return
      pendingScrollRef.current = {
        left: canvasX * newZoom - cursorOffsetX,
        top: canvasY * newZoom - cursorOffsetY,
      }
      setZoom(newZoom)
    }
    scrollEl.addEventListener('wheel', handleWheel, { passive: false })
    return () => scrollEl.removeEventListener('wheel', handleWheel)
  }, [zoom, setZoom])

  // An *autoSize* text element (click-placed, no fixed box) committed
  // empty is deleted rather than left as an invisible ghost — covers both
  // "placed it, typed nothing, clicked away" and "cleared existing text
  // back to nothing." A *bound* text box (drawn via click-drag) is
  // deliberately exempt from this — the user explicitly sized a container
  // for text, which is a real, kept decision even before any copy has
  // been typed into it; auto-deleting it on an empty commit would
  // silently discard that placeholder area. `sizePatch` (optional) folds
  // in the real measured w/h for an autoSize text element's confirmed
  // commit — see ElementRenderer.jsx's commit() for why that's measured
  // there rather than here.
  const updateLabel = (id, label, sizePatch) => {
    const el = elements.find((e) => e.id === id)
    if (el?.type === 'text' && el.autoSize && label.trim() === '') {
      setElements((prev) => prev.filter((e) => e.id !== id))
      setSelectedIds((prev) => prev.filter((x) => x !== id))
      return
    }
    setElements((prev) => prev.map((e) => (e.id === id ? { ...e, label, ...(sizePatch || {}) } : e)))
  }

  const closeContextMenu = () => setContextMenu(null)

  const handleContextMenu = (e, el) => {
    e.preventDefault()
    const group = groupMembersOf(el, elements)
    const fullyContained = group.every((id) => selectedIds.includes(id))
    if (!fullyContained) setSelectedIds(group)
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const handleOverlayContextMenu = (e) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  // Double-click (label edit) narrows the selection down to just the one
  // element being edited, even if it was part of a bigger multi-select.
  const handleDoubleClick = (el) => setSelectedIds([el.id])

  const boxElements = elements.filter((el) => el.type !== 'arrow')
  const arrowElements = elements.filter((el) => el.type === 'arrow')

  const soleSelectedEl = selectedIds.length === 1 ? elements.find((el) => el.id === selectedIds[0]) : null
  const isLoneArrowSelected = soleSelectedEl?.type === 'arrow'
  // A freshly-click-placed (autoSize), not-yet-typed-into text element
  // (empty label) must show no bounding box at all until a character
  // lands — otherwise the shared SelectionOverlay's dashed outline +
  // handles would appear the instant it's placed, immediately
  // contradicting "no box until you type." A click-*dragged* text box
  // (autoSize: false) is excluded from this — the user explicitly drew a
  // box, so it shows its selection outline immediately like any other
  // shape, even before anything's typed into it.
  const isLoneEmptyTextSelected = soleSelectedEl?.type === 'text' && soleSelectedEl.autoSize && soleSelectedEl.label === ''
  const selectionBox = selectedIds.length > 0 && !isLoneArrowSelected && !isLoneEmptyTextSelected
    ? computeBoundingBox(elements, selectedIds)
    : null

  return (
    <div className="wf-canvas-scroll" ref={scrollRef}>
    <div
      ref={canvasRef}
      className={`wf-canvas wf-tool-${activeTool}`}
      // The layout box stays the true (unscaled) CANVAS_WIDTH/HEIGHT —
      // transform is purely visual, applied on top. Every child below is
      // already absolutely positioned in canvas-space pixels, so they all
      // inherit this same visual scale for free with no per-child changes.
      // transform-origin 0 0 keeps canvas-space (0,0) fixed regardless of
      // zoom level, matching getCanvasPoint's own coordinate conversion.
      style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, transform: `scale(${zoom})`, transformOrigin: '0 0' }}
      onMouseDown={onCanvasMouseDown}
    >
      {boxElements.map((el) => (
        <ElementRenderer
          key={el.id}
          el={el}
          isSelected={selectedIds.includes(el.id)}
          activeTool={activeTool}
          onMouseDown={onElementMouseDown}
          onContextMenu={handleContextMenu}
          onLabelChange={updateLabel}
          onDoubleClick={handleDoubleClick}
          autoEdit={el.id === autoEditId}
          onAutoEditConsumed={onAutoEditConsumed}
        />
      ))}
      {/* Arrows render as one shared SVG overlay on top of every box
          element — a deliberate simplification over strict cross-type
          DOM interleaving, and the more useful default anyway: arrows
          indicate flow/connections between shapes and should stay visible
          rather than risk being hidden behind whatever they're pointing
          at. Z-order *among* arrows themselves, and *among* box elements
          themselves, still follows array order. */}
      <ArrowLayer
        arrows={arrowElements}
        selectedIds={selectedIds}
        activeTool={activeTool}
        onMouseDown={onElementMouseDown}
        onEndpointMouseDown={onArrowEndpointMouseDown}
        onContextMenu={handleContextMenu}
        onLabelChange={updateLabel}
        onDoubleClick={handleDoubleClick}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
      />

      {selectionBox && (
        <SelectionOverlay
          box={selectionBox}
          onHandleMouseDown={onSelectionHandleMouseDown}
          onContextMenu={handleOverlayContextMenu}
        />
      )}

      {marqueeRect && (
        <div className="wf-marquee" style={{ left: marqueeRect.x, top: marqueeRect.y, width: marqueeRect.w, height: marqueeRect.h }} />
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onSendToBack={onSendToBack}
          onBringToFront={onBringToFront}
          onDelete={onDelete}
          onClose={closeContextMenu}
        />
      )}
    </div>

      {/* Fixed to the viewport (not the scrolled/scaled canvas), bottom-
          right — clear of the bottom-center Toolbar and top-right
          FileControls. Clicking the percentage resets to 100%. */}
      <div className="wf-zoom-control">
        <button className="wf-zoom-btn" onClick={() => setZoom((z) => clampZoom(z - ZOOM_STEP))} aria-label="Zoom out">−</button>
        <button className="wf-zoom-percent" onClick={() => setZoom(1)} title="Reset to 100%">{Math.round(zoom * 100)}%</button>
        <button className="wf-zoom-btn" onClick={() => setZoom((z) => clampZoom(z + ZOOM_STEP))} aria-label="Zoom in">+</button>
      </div>
    </div>
  )
}
