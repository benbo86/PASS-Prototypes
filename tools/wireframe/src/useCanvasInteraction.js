import { useCallback, useEffect, useRef, useState } from 'react'
import {
  boxFromDrag, moveArrow, moveArrowPoint, moveBox, resizeBox, resizeBoxAspectLocked,
  snap, distance, CLICK_THRESHOLD, DEFAULT_SIZE, makeId,
  groupMembersOf, computeBoundingBox, transformSelection, getElementBox, rectsIntersect, cloneElements,
} from './geometry'

// The whole interaction state machine for the canvas: tool-select → draw a
// new element → auto-revert to pointer, click/shift-click/marquee to build
// a selection (auto-expanding to a persistent group's members), move the
// whole current selection as one rigid unit, and resize the whole
// selection's combined bounding box (see geometry.js's transformSelection
// for why this one mechanism covers both a single element and a group).
//
// Deliberately plain bubble-phase React handlers, not capture-phase
// document listeners like Dev Mode/Dev Edit use — those exist specifically
// to intercept clicks before a *host* prototype's own handlers see them.
// This canvas has no host app to defend against; it is the whole page. The
// one place a window-level listener is still needed is tracking mousemove/
// mouseup for the duration of an active drag, since the cursor can leave
// the element's own bounds mid-drag — that's just the standard technique,
// unrelated to capture-phase interception.
export function useCanvasInteraction({ elements, setElements, activeTool, setActiveTool, selectedIds, setSelectedIds, canvasRef, onDragStart, textDefaults, onTextPlaced, zoom }) {
  // Not React state — a drag is a fast-moving, per-frame concern, and
  // storing it in a ref avoids re-subscribing the window listeners below on
  // every single mousemove-driven element update. The one exception is the
  // marquee rectangle, which has to actually repaint every frame to be
  // useful as visual feedback.
  const dragRef = useRef(null)
  const [marqueeRect, setMarqueeRect] = useState(null)

  const elementsRef = useRef(elements)
  elementsRef.current = elements
  const selectedIdsRef = useRef(selectedIds)
  selectedIdsRef.current = selectedIds

  // `.wf-canvas` is visually scaled via CSS transform (see Canvas.jsx), so
  // its post-transform getBoundingClientRect() reflects the *scaled* size —
  // dividing by zoom converts a raw screen-pixel offset back to true
  // canvas-space coordinates, keeping every element's stored x/y/w/h
  // zoom-independent regardless of what zoom level was active while
  // drawing/moving/resizing it. This is the single chokepoint every drag/
  // click/draw already goes through, so it's the only place zoom needs to
  // be accounted for.
  const getCanvasPoint = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return { x: (e.clientX - rect.left) / zoom, y: (e.clientY - rect.top) / zoom }
  }, [canvasRef, zoom])

  const updateElement = useCallback((id, patch) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...patch } : el)))
  }, [setElements])

  const updateElements = useCallback((patches) => {
    setElements((prev) => prev.map((el) => (patches[el.id] ? { ...el, ...patches[el.id] } : el)))
  }, [setElements])

  // ── Canvas root: pointer mode starts a marquee selection; a draw tool
  // starts drawing a brand-new element. ──
  const onCanvasMouseDown = useCallback((e) => {
    const pt = getCanvasPoint(e)

    if (activeTool === 'pointer') {
      dragRef.current = {
        kind: 'marquee',
        startMouse: pt,
        shiftHeld: e.shiftKey,
        baseSelection: e.shiftKey ? selectedIdsRef.current : [],
      }
      setMarqueeRect({ x: pt.x, y: pt.y, w: 0, h: 0 })
      return
    }

    // Undo history is only actually committed at drag-END (handleMouseUp
    // below), using this snapshot captured now — see the comment there
    // for why: pushing eagerly here would record a spurious no-op history
    // entry for a plain click-to-select that never moves anything.
    const preDragSnapshot = elementsRef.current
    const startX = snap(pt.x)
    const startY = snap(pt.y)
    const id = makeId()
    const isArrow = activeTool === 'arrow'
    const isText = activeTool === 'text'

    // Text participates in the same draw/drag lifecycle as every other
    // shape, but a plain click leaves it `autoSize: true` — no fixed w/h,
    // sized to its own content, no visible box ever (see ElementRenderer).
    // Only a real click-*drag* (crossing CLICK_THRESHOLD, checked live in
    // handleMouseMove below) flips it to a fixed-size bound box, exactly
    // like frame/rect/ellipse. Placeholder w/h here are never rendered
    // while autoSize stays true — replaced by the actual measured size the
    // first time real content is committed (see ElementRenderer's commit).
    const newEl = isArrow
      ? {
          id, type: 'arrow', x1: startX, y1: startY, x2: startX, y2: startY, label: '',
          stroke: '#333333', strokeWidth: 2,
          // Same font-styling fields a rect/ellipse/text label gets (minus
          // textAlign, which doesn't apply to a single floating label
          // centered on the line) — lets the font panel style an arrow's
          // label once it has text, same as any other shape.
          fontFamily: 'Barlow', fontWeight: 400, fontSize: 14, textColor: '#333333',
          groupId: null,
        }
      : isText
      ? {
          id,
          type: 'text',
          x: startX,
          y: startY,
          w: DEFAULT_SIZE.text.w,
          h: DEFAULT_SIZE.text.h,
          autoSize: true,
          label: '',
          fill: null,
          stroke: null,
          strokeWidth: 0,
          fontFamily: textDefaults.fontFamily,
          fontWeight: textDefaults.fontWeight,
          fontSize: textDefaults.fontSize,
          textAlign: textDefaults.textAlign,
          textColor: textDefaults.textColor,
          groupId: null,
        }
      : {
          id,
          type: activeTool,
          x: startX,
          y: startY,
          w: 0,
          h: 0,
          label: '',
          fill: null,
          stroke: '#4d4d4d',
          strokeWidth: activeTool === 'frame' ? 2 : 1,
          fontSize: 14,
          // Rect/ellipse only (frame's own label is a name badge, not
          // styleable body text — see ElementRenderer.jsx/App.jsx) — same
          // font-styling fields a text element gets, so the font panel can
          // style a shape's label once it has text. textAlign defaults to
          // 'center' to match the pre-existing CSS-driven centered look
          // (.wf-el-label), so a brand-new shape looks identical to before
          // this field existed.
          ...(activeTool !== 'frame' ? { fontFamily: 'Barlow', fontWeight: 400, textAlign: 'center', textColor: '#333333' } : {}),
          groupId: null,
        }

    setElements((prev) => [...prev, newEl])
    dragRef.current = { kind: 'draw', id, isArrow, isText, elType: activeTool, startMouse: pt, startPoint: { x: startX, y: startY }, preDragSnapshot }
  }, [activeTool, getCanvasPoint, setElements, textDefaults])

  // ── Element/arrow body: click builds the selection and starts moving
  // whatever ends up selected; shift+click only toggles membership. Used
  // by both ElementRenderer (box elements) and ArrowLayer (arrow bodies) —
  // the move drag itself is type-agnostic (see moveGroup below). ──
  const onElementMouseDown = useCallback((e, el) => {
    if (activeTool !== 'pointer') return
    e.stopPropagation()

    const group = groupMembersOf(el, elementsRef.current)
    const current = selectedIdsRef.current
    const fullyContained = group.every((id) => current.includes(id))

    if (e.shiftKey) {
      setSelectedIds(fullyContained ? current.filter((id) => !group.includes(id)) : [...new Set([...current, ...group])])
      return
    }

    // Clicking something already part of a larger selection keeps that
    // whole selection intact and moves all of it together — only clicking
    // something *not* already selected replaces the selection with just
    // its group.
    const nextSelection = fullyContained ? current : group
    const pt = getCanvasPoint(e)

    // Option+drag duplicates the whole selection about to be moved,
    // leaving the originals untouched in place — the duplicate starts
    // exactly on top of the original (offset {0,0}; the drag itself is
    // what visibly separates it) and the drag then moves the *copies*.
    // preDragSnapshot is captured BEFORE the clones are inserted, so undo
    // removes the duplicate entirely rather than only reverting a move.
    if (e.altKey) {
      const preDragSnapshot = elementsRef.current
      const sourceEls = elementsRef.current.filter((elx) => nextSelection.includes(elx.id))
      const { elements: cloned } = cloneElements(sourceEls, { x: 0, y: 0 })
      setElements((prev) => [...prev, ...cloned])
      const newIds = cloned.map((c) => c.id)
      setSelectedIds(newIds)
      const startBoxes = {}
      cloned.forEach((c) => {
        startBoxes[c.id] = c.type === 'arrow'
          ? { x1: c.x1, y1: c.y1, x2: c.x2, y2: c.y2 }
          : { x: c.x, y: c.y, w: c.w, h: c.h }
      })
      dragRef.current = { kind: 'moveGroup', ids: newIds, startMouse: pt, startBoxes, preDragSnapshot, isDuplicate: true }
      return
    }

    if (!fullyContained) setSelectedIds(nextSelection)

    const preDragSnapshot = elementsRef.current
    const startBoxes = {}
    elementsRef.current.forEach((elx) => {
      if (!nextSelection.includes(elx.id)) return
      startBoxes[elx.id] = elx.type === 'arrow'
        ? { x1: elx.x1, y1: elx.y1, x2: elx.x2, y2: elx.y2 }
        : { x: elx.x, y: elx.y, w: elx.w, h: elx.h }
    })
    dragRef.current = { kind: 'moveGroup', ids: nextSelection, startMouse: pt, startBoxes, preDragSnapshot }
  }, [activeTool, getCanvasPoint, setSelectedIds, setElements])

  // ── One resize handle on the shared SelectionOverlay, operating on the
  // combined bounding box of the *entire* current selection (1 or more
  // elements) — see geometry.js's transformSelection for why this is the
  // only resize implementation needed. Shift+mousedown on a corner handle
  // locks the group's aspect ratio. ──
  const onSelectionHandleMouseDown = useCallback((e, handle) => {
    e.stopPropagation()
    const ids = selectedIdsRef.current
    if (ids.length === 0) return

    const preDragSnapshot = elementsRef.current
    const groupBox0 = computeBoundingBox(elementsRef.current, ids)
    const startSnapshots = elementsRef.current
      .filter((el) => ids.includes(el.id))
      .map((el) => (el.type === 'arrow'
        ? { id: el.id, type: 'arrow', x1: el.x1, y1: el.y1, x2: el.x2, y2: el.y2 }
        : { id: el.id, type: el.type, x: el.x, y: el.y, w: el.w, h: el.h }))
    const isCorner = handle === 'nw' || handle === 'ne' || handle === 'se' || handle === 'sw'
    const pt = getCanvasPoint(e)
    dragRef.current = {
      kind: 'resizeGroup',
      handle,
      // NOT a fixed lockAspect captured here — Shift is checked live on
      // every mousemove tick instead (see handleMouseMove below). Real
      // usage often starts the drag first and presses/releases Shift
      // partway through; capturing it only at this instant meant the lock
      // never engaged unless Shift happened to already be held at the
      // exact moment of mousedown.
      isCorner,
      startMouse: pt,
      groupBox0,
      startSnapshots,
      preDragSnapshot,
    }
  }, [getCanvasPoint])

  // ── Arrow endpoint handle (2, not 8) — only rendered/usable when
  // exactly one arrow is selected alone (see ArrowLayer.jsx). ──
  const onArrowEndpointMouseDown = useCallback((e, el, endpoint) => {
    e.stopPropagation()
    const preDragSnapshot = elementsRef.current
    const pt = getCanvasPoint(e)
    const startPoint = endpoint === 'p1' ? { x: el.x1, y: el.y1 } : { x: el.x2, y: el.y2 }
    dragRef.current = { kind: 'arrowEndpoint', id: el.id, endpoint, startMouse: pt, startPoint, preDragSnapshot }
  }, [getCanvasPoint])

  // ── Drag tracking: one stable pair of window listeners for the whole
  // component lifetime, each a no-op when dragRef.current is null. ──
  useEffect(() => {
    function handleMouseMove(e) {
      const drag = dragRef.current
      if (!drag) return
      const pt = getCanvasPoint(e)
      const dx = pt.x - drag.startMouse.x
      const dy = pt.y - drag.startMouse.y

      if (drag.kind === 'draw') {
        if (drag.isArrow) {
          updateElement(drag.id, { x2: snap(pt.x), y2: snap(pt.y) })
        } else if (drag.isText) {
          // Stays autoSize (no visible box, sized to content) for as long
          // as the mouse hasn't moved past click-distance. The instant it
          // does, this becomes a real click-*drag* — flip to a fixed-size
          // bound box from here on, with the same live boxFromDrag preview
          // every other shape gets.
          if (distance(drag.startMouse.x, drag.startMouse.y, pt.x, pt.y) >= CLICK_THRESHOLD) {
            updateElement(drag.id, { autoSize: false, ...boxFromDrag(drag.startPoint.x, drag.startPoint.y, pt.x, pt.y) })
          }
        } else {
          updateElement(drag.id, boxFromDrag(drag.startPoint.x, drag.startPoint.y, pt.x, pt.y))
        }
      } else if (drag.kind === 'moveGroup') {
        const patches = {}
        drag.ids.forEach((id) => {
          const startBox = drag.startBoxes[id]
          if (!startBox) return
          patches[id] = 'x1' in startBox ? moveArrow(startBox, dx, dy) : moveBox(startBox, dx, dy)
        })
        updateElements(patches)
      } else if (drag.kind === 'resizeGroup') {
        const lockAspect = e.shiftKey && drag.isCorner
        const groupBox1 = lockAspect
          ? resizeBoxAspectLocked(drag.groupBox0, drag.handle, dx, dy)
          : resizeBox(drag.groupBox0, drag.handle, dx, dy)
        updateElements(transformSelection(drag.startSnapshots, drag.groupBox0, groupBox1))
      } else if (drag.kind === 'arrowEndpoint') {
        const p = moveArrowPoint(drag.startPoint.x, drag.startPoint.y, dx, dy)
        updateElement(drag.id, drag.endpoint === 'p1' ? { x1: p.x, y1: p.y } : { x2: p.x, y2: p.y })
      } else if (drag.kind === 'marquee') {
        setMarqueeRect({
          x: Math.min(drag.startMouse.x, pt.x),
          y: Math.min(drag.startMouse.y, pt.y),
          w: Math.abs(pt.x - drag.startMouse.x),
          h: Math.abs(pt.y - drag.startMouse.y),
        })
      }
    }

    function handleMouseUp(e) {
      const drag = dragRef.current
      if (!drag) return
      const pt = getCanvasPoint(e)
      const dx = pt.x - drag.startMouse.x
      const dy = pt.y - drag.startMouse.y

      if (drag.kind === 'draw') {
        // Always commit — a new element was always created, regardless of
        // click-vs-drag.
        onDragStart(drag.preDragSnapshot)
        const dragDistance = distance(drag.startMouse.x, drag.startMouse.y, pt.x, pt.y)
        if (dragDistance < CLICK_THRESHOLD) {
          // A click, not a drag — a near-invisible speck isn't useful, so
          // anchor a sensible per-type default size at the click point.
          // Text is the one exception: it *stays* autoSize (no fixed size
          // applied at all, no visible box) — the whole point of a plain
          // click for text is "no bounding box," not "a small one."
          if (drag.isArrow) {
            const def = DEFAULT_SIZE.arrow
            updateElement(drag.id, { x2: drag.startPoint.x + def.w, y2: drag.startPoint.y })
          } else if (!drag.isText) {
            const def = DEFAULT_SIZE[drag.elType]
            updateElement(drag.id, { x: drag.startPoint.x, y: drag.startPoint.y, w: def.w, h: def.h })
          }
        }
        setSelectedIds([drag.id])
        setActiveTool('pointer')
        // Text, whether placed by click (autoSize) or drag (bound box),
        // always opens straight into typing — no double-click needed
        // either way.
        if (drag.isText) onTextPlaced(drag.id)
      } else if (drag.kind === 'moveGroup' || drag.kind === 'resizeGroup' || drag.kind === 'arrowEndpoint') {
        // Only commit a history entry if the mouse actually moved — a
        // plain click-to-select (mousedown+mouseup with no movement, which
        // always happens when selecting an already-positioned element)
        // would otherwise push a no-op snapshot every single time, quickly
        // filling the undo stack with entries that visibly do nothing.
        // Exception: an Option-drag duplicate always commits regardless of
        // movement — creating the copy is itself a real, undoable change
        // even if the user alt-clicks without ever dragging (a valid way
        // to duplicate in place).
        if (drag.isDuplicate || dx !== 0 || dy !== 0) onDragStart(drag.preDragSnapshot)
      } else if (drag.kind === 'marquee') {
        const pt = getCanvasPoint(e)
        const dragDistance = distance(drag.startMouse.x, drag.startMouse.y, pt.x, pt.y)
        if (dragDistance < CLICK_THRESHOLD) {
          if (!drag.shiftHeld) setSelectedIds([])
        } else {
          const rect = {
            x: Math.min(drag.startMouse.x, pt.x),
            y: Math.min(drag.startMouse.y, pt.y),
            w: Math.abs(pt.x - drag.startMouse.x),
            h: Math.abs(pt.y - drag.startMouse.y),
          }
          const hitIds = new Set()
          elementsRef.current.forEach((el) => {
            if (rectsIntersect(getElementBox(el), rect)) {
              groupMembersOf(el, elementsRef.current).forEach((id) => hitIds.add(id))
            }
          })
          setSelectedIds(drag.shiftHeld ? [...new Set([...drag.baseSelection, ...hitIds])] : [...hitIds])
        }
        setMarqueeRect(null)
      }

      dragRef.current = null
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [getCanvasPoint, updateElement, updateElements, setActiveTool, setSelectedIds, onDragStart, onTextPlaced])

  return {
    onCanvasMouseDown,
    onElementMouseDown,
    onSelectionHandleMouseDown,
    onArrowEndpointMouseDown,
    marqueeRect,
  }
}
