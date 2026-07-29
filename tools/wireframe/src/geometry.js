// Pure geometry helpers for the wireframe canvas — no React, no DOM,
// trivially reusable by both the box-element interaction hook and
// ArrowLayer's own endpoint-drag handlers.

export const GRID = 8

export function snap(v) {
  return Math.round(v / GRID) * GRID
}

// Zoom is view state only — not saved into a wireframe's JSON, resets to
// 100% on reload — shared by App.jsx's zoom state/keyboard shortcuts and
// Canvas.jsx's zoom control UI / Ctrl/Cmd+scroll zoom-to-cursor handling.
export const ZOOM_MIN = 0.25
export const ZOOM_MAX = 2
export const ZOOM_STEP = 0.25

export function clampZoom(z) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z))
}

// Default sizes used when a draw tool is used as a plain click (no drag) —
// see boxFromDrag/arrow default below for where these get anchored.
export const DEFAULT_SIZE = {
  frame: { w: 320, h: 240 },
  rect: { w: 160, h: 96 },
  ellipse: { w: 160, h: 96 },
  triangle: { w: 160, h: 96 },
  text: { w: 160, h: 40 },
  arrow: { w: 160, h: 0 },
}

// A handle's name says which edges move; edges it doesn't name stay fixed.
// This one formula correctly produces both "resize a single edge" (n/s/e/w)
// and "resize a corner" (ne/nw/se/sw, which anchors the opposite corner)
// behavior. Dragging a moved edge past its (fixed) opposite edge is a real
// flip, not just a bigger box — flippedX/flippedY (computed from the RAW
// pre-normalize edges, before the min/max below reorders them into a
// canonical positive box) tell transformSelection to mirror content rather
// than merely re-anchoring position. Gated on handle.includes(letter) —
// only an axis this handle actually controls can flip; the other stays
// false. w/h themselves still always come out positive here (unchanged) —
// flip is purely a signal consumed downstream, not a sign on w/h.
export function resizeBox(startBox, handle, dx, dy) {
  const left0 = startBox.x
  const top0 = startBox.y
  const right0 = startBox.x + startBox.w
  const bottom0 = startBox.y + startBox.h

  const left = handle.includes('w') ? left0 + dx : left0
  const right = handle.includes('e') ? right0 + dx : right0
  const top = handle.includes('n') ? top0 + dy : top0
  const bottom = handle.includes('s') ? bottom0 + dy : bottom0

  const flippedX = handle.includes('w') ? left > right0 : handle.includes('e') ? right < left0 : false
  const flippedY = handle.includes('n') ? top > bottom0 : handle.includes('s') ? bottom < top0 : false

  const l = snap(Math.min(left, right))
  const r = snap(Math.max(left, right))
  const t = snap(Math.min(top, bottom))
  const b = snap(Math.max(top, bottom))

  return { x: l, y: t, w: Math.max(GRID, r - l), h: Math.max(GRID, b - t), flippedX, flippedY }
}

// Same edge-then-snap logic as resizeBox, but both axes are always free —
// used when drawing a brand-new element by dragging from one point to
// another on empty canvas.
export function boxFromDrag(x0, y0, x1, y1) {
  const l = snap(Math.min(x0, x1))
  const r = snap(Math.max(x0, x1))
  const t = snap(Math.min(y0, y1))
  const b = snap(Math.max(y0, y1))
  return { x: l, y: t, w: Math.max(GRID, r - l), h: Math.max(GRID, b - t) }
}

// Same as boxFromDrag, but locks the drawn box to a 1:1 aspect ratio
// (shift+drag while drawing a new Frame/Rect/Ellipse) — whichever axis has
// moved further becomes the driving dimension, applied to both, in the
// correct direction per quadrant (so dragging up-left grows the square up
// and to the left, not always down-right). Reuses boxFromDrag for the
// actual snap-to-grid math once the square's far corner is derived.
export function boxFromDragAspectLocked(x0, y0, x1, y1) {
  const dx = x1 - x0
  const dy = y1 - y0
  const size = Math.max(Math.abs(dx), Math.abs(dy))
  const signX = dx < 0 ? -1 : 1
  const signY = dy < 0 ? -1 : 1
  return boxFromDrag(x0, y0, x0 + signX * size, y0 + signY * size)
}

// Translate only — w/h untouched.
export function moveBox(startBox, dx, dy) {
  return { ...startBox, x: snap(startBox.x + dx), y: snap(startBox.y + dy) }
}

// Arrow endpoints resize independently (2-point resize is the natural
// equivalent of 8-point box resize for a line with no width/height).
export function moveArrowPoint(x0, y0, dx, dy) {
  return { x: snap(x0 + dx), y: snap(y0 + dy) }
}

// Moving an arrow's body must NOT snap each endpoint independently — that
// can subtly distort the arrow's length/angle if the two endpoints don't
// land on the grid identically. Instead, re-derive one shared *actual*
// delta from the first endpoint's snap result and apply it identically to
// the second, keeping the arrow perfectly rigid.
export function moveArrow(startArrow, dx, dy) {
  const newX1 = snap(startArrow.x1 + dx)
  const actualDx = newX1 - startArrow.x1
  const newY1 = snap(startArrow.y1 + dy)
  const actualDy = newY1 - startArrow.y1
  return {
    x1: newX1,
    y1: newY1,
    x2: startArrow.x2 + actualDx,
    y2: startArrow.y2 + actualDy,
  }
}

// Distance below which a "draw" gesture is treated as a plain click rather
// than an intentional drag — used to decide when to fall back to a
// per-type default size anchored at the click point.
export const CLICK_THRESHOLD = 4

export function distance(x0, y0, x1, y1) {
  return Math.hypot(x1 - x0, y1 - y0)
}

let idCounter = 0
export function makeId() {
  idCounter += 1
  return `el_${idCounter}_${Math.floor(Math.random() * 1e6)}`
}

// ─── v2: multi-select, groups, aspect-locked resize ──────────────────

// A box-shaped {x,y,w,h} view of any element, box or arrow — the one thing
// every element type can be reduced to for bounding-box/selection math.
export function getElementBox(el) {
  if (el.type === 'arrow') {
    const x = Math.min(el.x1, el.x2)
    const y = Math.min(el.y1, el.y2)
    return { x, y, w: Math.abs(el.x2 - el.x1), h: Math.abs(el.y2 - el.y1) }
  }
  return { x: el.x, y: el.y, w: el.w, h: el.h }
}

// Clicking (or marquee-selecting) any one member of a persistent group
// should act on the whole group — this is the single source of truth for
// "what does selecting this element actually select."
export function groupMembersOf(el, elements) {
  if (!el.groupId) return [el.id]
  return elements.filter((e) => e.groupId === el.groupId).map((e) => e.id)
}

// Combined bounding box across a mixed set of box-elements and arrows —
// used both to render the shared SelectionOverlay and as the "groupBox0"
// input to transformSelection below. Falls back to a GRID-sized box at the
// origin if ids is empty (shouldn't be called in that case, but avoids
// returning -Infinity/NaN if it ever is).
export function computeBoundingBox(elements, ids) {
  const selected = elements.filter((el) => ids.includes(el.id))
  if (selected.length === 0) return { x: 0, y: 0, w: GRID, h: GRID }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  selected.forEach((el) => {
    const box = getElementBox(el)
    minX = Math.min(minX, box.x)
    minY = Math.min(minY, box.y)
    maxX = Math.max(maxX, box.x + box.w)
    maxY = Math.max(maxY, box.y + box.h)
  })
  return { x: minX, y: minY, w: Math.max(GRID, maxX - minX), h: Math.max(GRID, maxY - minY) }
}

// Same "which edges move" shape as resizeBox, but the two free edges for a
// *corner* handle are derived from the box's original aspect ratio (picking
// whichever axis moved more, relatively, as the driving one) instead of
// independently from dx/dy — this is what "shift+drag a corner" locks.
// Edge handles (n/s/e/w) have no meaningful aspect ratio to preserve and
// ignore this entirely (callers only invoke this for corner handles).
export function resizeBoxAspectLocked(startBox, handle, dx, dy) {
  const ratio = startBox.w / startBox.h
  const left0 = startBox.x
  const top0 = startBox.y
  const right0 = startBox.x + startBox.w
  const bottom0 = startBox.y + startBox.h

  const rawLeft = handle.includes('w') ? left0 + dx : left0
  const rawRight = handle.includes('e') ? right0 + dx : right0
  const rawTop = handle.includes('n') ? top0 + dy : top0
  const rawBottom = handle.includes('s') ? bottom0 + dy : bottom0
  const rawW = Math.abs(rawRight - rawLeft)
  const rawH = Math.abs(rawBottom - rawTop)

  let targetW, targetH
  const wChange = Math.abs(rawW - startBox.w) / startBox.w
  const hChange = Math.abs(rawH - startBox.h) / startBox.h
  if (wChange >= hChange) {
    targetW = rawW
    targetH = targetW / ratio
  } else {
    targetH = rawH
    targetW = targetH * ratio
  }

  // Flip is read from the RAW rawLeft/rawRight/rawTop/rawBottom above, not
  // the target-size-derived left/right/top/bottom below — those are always
  // re-derived as an anchor ± a positive magnitude, so they can never
  // themselves appear to cross. The raw values still carry the user's
  // actual (unclamped) drag intent.
  const flippedX = handle.includes('w') ? rawLeft > right0 : handle.includes('e') ? rawRight < left0 : false
  const flippedY = handle.includes('n') ? rawTop > bottom0 : handle.includes('s') ? rawBottom < top0 : false

  // Derive final left/top/right/bottom from the target size, keeping
  // whichever two edges this handle doesn't touch anchored at their
  // original values — same anchoring logic as resizeBox, just fed a
  // computed target size instead of raw dx/dy per axis.
  const left = handle.includes('w') ? right0 - targetW : left0
  const right = handle.includes('e') ? left0 + targetW : right0
  const top = handle.includes('n') ? bottom0 - targetH : top0
  const bottom = handle.includes('s') ? top0 + targetH : bottom0

  const l = snap(left), r = snap(right), t = snap(top), b = snap(bottom)
  return { x: l, y: t, w: Math.max(GRID, r - l), h: Math.max(GRID, b - t), flippedX, flippedY }
}

// ─── rotation ──────────────────────────────────────────────────────────

export function normalizeAngle(deg) {
  const a = deg % 360
  return a < 0 ? a + 360 : a
}

// Shift-held rotation snaps to the nearest step — checked live every tick
// (same "don't capture the modifier at mousedown, read it live" convention
// already used by aspect-lock resize and shift-drag-to-draw a 1:1 square,
// since real usage often presses Shift mid-drag, not before).
export function snapAngle(deg, step = 15) {
  return Math.round(deg / step) * step
}

// Angle (degrees) from a center point to a mouse point, both canvas-space.
// Standard atan2 screen convention: 0°=3 o'clock, increasing clockwise
// (falls out for free since canvas-space y grows downward) — this already
// matches CSS transform: rotate()'s own clockwise-positive convention, so
// no sign flip is ever needed between this math and the rendered CSS.
export function angleBetween(cx, cy, x, y) {
  return (Math.atan2(y - cy, x - cx) * 180) / Math.PI
}

// Rotates a raw (dx, dy) DELTA vector by angleDeg — not an absolute point,
// no center subtraction needed. Used to convert a resize handle's raw
// canvas-space mouse delta into a rotated element's own local/unrotated
// frame (call with -rotation) before feeding resizeBox/
// resizeBoxAspectLocked, so dragging a corner of a rotated shape resizes
// along the shape's own visual axes instead of the screen's.
export function rotateVector(dx, dy, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  return { dx: dx * cos - dy * sin, dy: dx * sin + dy * cos }
}

// The one resize/scale transform used for everything from a single
// selected element up to a large multi-select/group: an independent
// per-axis scale + translate mapping groupBox0 → groupBox1, applied to
// every selected element. For exactly one selected (non-arrow) element,
// groupBox0 *is* that element's own box, so this reduces exactly to a
// direct per-element resize — no special case needed for "just one thing
// selected."
//
// `startSnapshots` must be each selected element's state captured ONCE at
// drag start (not the live elements array) — re-deriving from live,
// already-updated elements on a later mousemove tick would treat a
// previous tick's *output* as this tick's input, double-applying the
// transform relative to groupBox0 (which never itself updates mid-drag).
// Each startSnapshots entry (non-arrow) also carries its own flipX/flipY
// at drag-start, for the XOR below.
//
// groupBox1.flippedX/flippedY (from resizeBox/resizeBoxAspectLocked) make
// scaleX/scaleY SIGNED (negative when flipped) instead of always-positive.
// A negative scale in the plain tx(x) = groupBox1.x + (x-groupBox0.x)*scaleX
// formula would map the shape OUTSIDE groupBox1 (everything to the right of
// the mapped left edge moves further left) rather than mirrored WITHIN it —
// adding groupBox1.w/h when flipped re-anchors the mapped range back to
// exactly [groupBox1.x, groupBox1.x+groupBox1.w], mirrored. w/h magnitudes
// always stay positive via Math.abs; only tx/ty and each element's own
// flipX/flipY (XORed against its frozen start-of-drag state, never
// accumulated tick-by-tick — same "always fresh from groupBox0" principle
// as x/y/w/h) carry the actual mirroring.
export function transformSelection(startSnapshots, groupBox0, groupBox1) {
  const flipX = !!groupBox1.flippedX
  const flipY = !!groupBox1.flippedY
  const scaleX = (flipX ? -1 : 1) * (groupBox1.w / groupBox0.w)
  const scaleY = (flipY ? -1 : 1) * (groupBox1.h / groupBox0.h)
  const tx = (x) => groupBox1.x + (flipX ? groupBox1.w : 0) + (x - groupBox0.x) * scaleX
  const ty = (y) => groupBox1.y + (flipY ? groupBox1.h : 0) + (y - groupBox0.y) * scaleY

  const patches = {}
  startSnapshots.forEach((el) => {
    if (el.type === 'arrow') {
      patches[el.id] = {
        x1: snap(tx(el.x1)), y1: snap(ty(el.y1)),
        x2: snap(tx(el.x2)), y2: snap(ty(el.y2)),
      }
    } else {
      const w = Math.max(GRID, snap(Math.abs(el.w * scaleX)))
      const h = Math.max(GRID, snap(Math.abs(el.h * scaleY)))
      // tx(el.x)/ty(el.y) map the element's own start TOP-LEFT corner —
      // when this axis is flipped, that mapped point is now the box's
      // OPPOSITE corner, so the true new top-left needs the box's own
      // (just-computed) width/height subtracted back out.
      const x = snap(flipX ? tx(el.x) - w : tx(el.x))
      const y = snap(flipY ? ty(el.y) - h : ty(el.y))
      patches[el.id] = {
        x, y, w, h,
        // Explicitly resizing a text element (whether it was already a
        // bound box or still autoSize) always graduates it to a fixed-size
        // bound box from here on — matching the same "manually resizing
        // converts auto-width to fixed-width" convention most design
        // tools use, and consistent with the fact that it now has an
        // explicit w/h a user chose on purpose.
        ...(el.type === 'text' ? { autoSize: false } : {}),
        flipX: flipX ? !el.flipX : !!el.flipX,
        flipY: flipY ? !el.flipY : !!el.flipY,
      }
    }
  })
  return patches
}

// Whether two axis-aligned boxes overlap at all — used by marquee
// selection to decide which elements the drag rectangle caught.
export function rectsIntersect(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

// ─── v4: copy/paste, alt-drag duplicate ──────────────────────────────

// Makes a real, independent copy of a set of elements — fresh ids
// throughout, and any groupId shared *among the copied elements* remapped
// consistently to one new shared id, so a copied group stays a group
// (just a distinct one from the original, not merged into it). Shared by
// both ⌘V paste (offset {16,16}, so the copy is visibly distinct at the
// moment it appears) and Option-drag duplicate (offset {0,0} — the
// duplicate starts exactly on top of the original, and the drag itself is
// what visibly separates it, matching Figma/Illustrator's own convention).
export function cloneElements(sourceElements, offset = { x: 0, y: 0 }) {
  const idMap = new Map()
  sourceElements.forEach((el) => idMap.set(el.id, makeId()))
  const groupIdMap = new Map()
  const remapGroup = (oldGroupId) => {
    if (!oldGroupId) return null
    if (!groupIdMap.has(oldGroupId)) groupIdMap.set(oldGroupId, makeId())
    return groupIdMap.get(oldGroupId)
  }
  const elements = sourceElements.map((el) => {
    const id = idMap.get(el.id)
    const groupId = remapGroup(el.groupId)
    return el.type === 'arrow'
      ? { ...el, id, groupId, x1: el.x1 + offset.x, y1: el.y1 + offset.y, x2: el.x2 + offset.x, y2: el.y2 + offset.y }
      : { ...el, id, groupId, x: el.x + offset.x, y: el.y + offset.y }
  })
  return { elements, idMap }
}
