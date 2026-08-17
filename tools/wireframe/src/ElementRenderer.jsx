import { useEffect, useRef, useState } from 'react'

const VERTICAL_ALIGN_CSS = { top: 'flex-start', middle: 'center', bottom: 'flex-end' }

// Renders one frame/rect/ellipse/text element — these four share one box
// model (x/y/w/h, optional fill/label) and differ only in a few rendered
// details, so one component handles all of them rather than duplicating
// label-editing logic four times. Resize handles no longer live here (v2:
// they moved to the shared SelectionOverlay, which handles 1-or-more
// selected elements uniformly) — this component only renders the box
// itself and reports clicks/double-clicks/right-clicks upward.
export default function ElementRenderer({ el, isSelected, isGrouped, activeTool, onMouseDown, onContextMenu, onLabelChange, onDoubleClick, autoEdit, onAutoEditConsumed, typeEditChar, onTypeEditConsumed }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(el.label)
  const inputRef = useRef(null)
  const boxRef = useRef(null)
  // Set synchronously (ref, not state) by the typeEditChar effect below,
  // just before it flips editing to true — read once editing actually
  // becomes true (the effect right here), so a seeded keystroke survives
  // the same two-render "setEditing now, react to it next render" gap the
  // pre-existing autoEdit flow below already relies on.
  const pendingCharRef = useRef(null)

  useEffect(() => {
    if (!editing) return
    const seeded = pendingCharRef.current
    pendingCharRef.current = null
    setDraft(seeded != null ? seeded : el.label)
    inputRef.current?.focus()
    if (seeded != null) {
      // Cursor placed right after the just-typed character rather than
      // selecting it — selecting would mean the *next* keystroke replaces
      // it instead of continuing on from it.
      inputRef.current?.setSelectionRange?.(seeded.length, seeded.length)
    } else {
      inputRef.current?.select()
    }
    // Only re-run when editing starts, not on every keystroke of el.label.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing])

  // A freshly-placed text element (see the Text tool's placement flow in
  // useCanvasInteraction.js) opens straight into typing, without needing a
  // double-click first. Deliberately reactive to `autoEdit` itself (not a
  // mount-only `[]` effect) — element creation (mousedown) and the
  // autoEdit flag being set (mouseup, a *separate* native event/render)
  // don't happen in the same batch, so this component's first mount often
  // still sees `autoEdit: false`; a mount-only check would silently miss
  // the moment it flips to true on a later render. Consuming it
  // (`onAutoEditConsumed`) immediately clears the parent's flag, so this
  // only ever fires once per element.
  useEffect(() => {
    if (autoEdit) {
      setEditing(true)
      onAutoEditConsumed(el.id)
    }
  }, [autoEdit, el.id, onAutoEditConsumed])

  // Typing while this element is selected (no double-click first) — the
  // keydown handler in App.jsx seeds this once a printable key is pressed
  // with a single non-frame element selected. Same two-effect shape as
  // autoEdit above (this one flips `editing`, the `[editing]` effect above
  // reacts to it next render), except the ref lets that follow-up effect
  // seed the draft with the typed character instead of resetting to the
  // pre-existing (here, still-empty) el.label.
  useEffect(() => {
    if (typeEditChar != null) {
      pendingCharRef.current = typeEditChar
      setEditing(true)
      onTypeEditConsumed(el.id)
    }
  }, [typeEditChar, el.id, onTypeEditConsumed])

  // Commit on both explicit confirm (blur/Enter) AND cancel (Escape) —
  // canceling re-commits the *original* el.label unchanged (a genuine no-op
  // for anything with real content), which is what makes a brand-new,
  // never-typed-into text element correctly disappear on Escape too, not
  // just on blur: Canvas.jsx's updateLabel deletes any text element
  // committed with an empty label, regardless of which path got it there.
  //
  // A confirmed commit on an autoSize text element also measures its own
  // just-rendered box (via boxRef) and folds the real w/h into the same
  // update — autoSize text has no fixed dimensions to render from, but
  // computeBoundingBox/marquee hit-testing (geometry.js) still need a
  // reasonably accurate w/h to work with, so this keeps them in sync with
  // actual content each time it's confirmed. Cancel deliberately does NOT
  // measure — at the moment Escape fires, the DOM still reflects the
  // about-to-be-discarded draft, not the reverted original, so measuring
  // here would capture the wrong size.
  const isAutoText = el.type === 'text' && el.autoSize
  const isBoundText = el.type === 'text' && !el.autoSize
  const commit = () => {
    if (isAutoText && boxRef.current) {
      // offsetWidth/offsetHeight, not getBoundingClientRect() — the latter
      // reflects the element's POST-transform visual box (affected by the
      // canvas's own zoom scale, and now also by this element's own
      // rotate/flip transform below), while offset*/* always reflects the
      // untransformed layout box regardless of either. Rotating an
      // autoSize text element and re-committing its label would otherwise
      // measure the rotated bounding box (generally larger) instead of the
      // text's own true size.
      const w = boxRef.current.offsetWidth
      const h = boxRef.current.offsetHeight
      onLabelChange(el.id, draft, { w: Math.max(8, w), h: Math.max(8, h) })
    } else {
      onLabelChange(el.id, draft)
    }
    setEditing(false)
  }
  const cancel = () => {
    onLabelChange(el.id, el.label)
    setEditing(false)
  }

  // A triangle can't be drawn with a plain CSS border+border-radius the way
  // rect/ellipse are — clip-path would cut the box down to a triangular
  // silhouette, but a rectangular border doesn't follow the new diagonal
  // edges it creates, leaving two sides with no visible stroke at all. Fill
  // and stroke are rendered via a small inline <svg><polygon> instead (see
  // below), which draws a real stroke along the diagonal sides for free —
  // so the div's own background/border stay switched off for this type.
  const isTriangle = el.type === 'triangle'

  const style = {
    left: el.x,
    top: el.y,
    ...(isAutoText ? {} : { width: el.w, height: el.h }),
    background: isTriangle ? 'transparent' : (el.fill || 'transparent'),
    border: isTriangle ? 'none' : (el.stroke ? `${el.strokeWidth}px solid ${el.stroke}` : 'none'),
    borderRadius: el.type === 'ellipse' ? '50%' : el.type === 'frame' ? 4 : 2,
    fontSize: el.fontSize,
    // Text/rect/ellipse all get full font-panel styling (frame's label is
    // a name badge, not styleable body text — excluded here on purpose).
    // Every field falls back to the pre-existing fixed default for an
    // element saved before these fields existed (a rect/ellipse from
    // before this feature has none of them) — without these fallbacks, an
    // older file would render with no inline styling at all, inheriting
    // whatever the ancestor chain happens to resolve to instead of the
    // look it always actually displayed with.
    ...(el.type !== 'frame' ? {
      fontFamily: el.fontFamily || 'Barlow',
      fontWeight: el.fontWeight || 400,
      textAlign: el.textAlign || 'center',
      color: el.textColor || '#333333',
      // Vertical position within the box — set inline (not left to
      // .wf-el-text's own CSS default) so a per-element choice from the
      // font panel always wins regardless of specificity. Falls back to
      // each type's pre-existing hardcoded look for an element saved
      // before this field existed: text was always top-anchored, rect/
      // ellipse/arrow labels were always vertically centered.
      alignItems: VERTICAL_ALIGN_CSS[el.verticalAlign] || (el.type === 'text' ? 'flex-start' : 'center'),
    } : {}),
    // Rotate + flip combined into one transform (uniform across every
    // box-shaped type, including a rotated/mirrored label along with its
    // shape — normal design-tool behavior, not something to special-case
    // away). Omitted entirely rather than left as a harmless no-op string
    // when both are inert, so an element untouched by either feature keeps
    // byte-for-byte the same style object as before this existed.
    ...((el.rotation || el.flipX || el.flipY) ? {
      transform: `rotate(${el.rotation || 0}deg) scale(${el.flipX ? -1 : 1}, ${el.flipY ? -1 : 1})`,
      transformOrigin: 'center',
    } : {}),
  }

  return (
    <div
      ref={boxRef}
      className={`wf-el wf-el-${el.type}${isAutoText ? ' wf-el-text-auto' : ''}${isSelected ? ' wf-el-selected' : ''}`}
      style={style}
      onMouseDown={(e) => onMouseDown(e, el)}
      onContextMenu={(e) => onContextMenu(e, el)}
      onDoubleClick={(e) => {
        if (el.type === 'frame') return // the frame's own badge handles its double-click instead, see below
        if (activeTool !== 'pointer') return
        e.stopPropagation()
        onDoubleClick(el)
        // Real bug, reported directly: double-click is this tool's own way
        // to isolate one member of a persistent group (bypassing the
        // whole-group expansion a plain click does) — but immediately
        // opening editing here means the very next mousedown (an attempt
        // to drag the now-selected element) lands on the editing <input>
        // instead, whose own stopPropagation blocks the drag from ever
        // starting. Skipped specifically for grouped elements — selecting
        // via double-click no longer also opens editing; a subsequent
        // plain click on that same already-selected element does instead
        // (see onElementMouseDown's clickToEditId), and a drag now works
        // immediately. Ungrouped elements keep the original, unchanged
        // behavior — there's no "already selected, want to drag it"
        // conflict for them, since a single plain click already selects
        // them without needing double-click at all.
        if (!isGrouped) setEditing(true)
      }}
    >
      {isTriangle && (
        // preserveAspectRatio="none" stretches the triangle to exactly fill
        // a non-equilateral box, matching how border-radius:50% already
        // turns a non-square rect into an ellipse rather than staying a
        // fixed circle — the shape always fills its own resized bounds.
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          // width/height:100% is required, not just inset:0 — an <svg> is a
          // *replaced* element (like <img>), and left with 'auto' width/
          // height it sizes itself from the viewBox's own intrinsic aspect
          // ratio instead of actually stretching to fill an absolutely
          // positioned box, silently ignoring inset:0's bottom/right
          // constraints. Without this, the polygon renders at a fixed
          // near-square size regardless of the div's real (possibly very
          // non-square) box — which looked exactly like "every handle
          // preserves the aspect ratio" even though the box itself, and the
          // resize math behind it, were already resizing correctly.
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          <polygon points="50,0 100,100 0,100" fill={el.fill || 'none'} stroke={el.stroke || 'none'} strokeWidth={el.strokeWidth || 0} />
        </svg>
      )}

      {el.type === 'frame' && (
        editing ? (
          <input
            ref={inputRef}
            className="wf-label-input wf-frame-label-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              else if (e.key === 'Escape') { e.stopPropagation(); cancel() }
            }}
          />
        ) : (
          <div
            className="wf-frame-label"
            onDoubleClick={(e) => {
              if (activeTool !== 'pointer') return
              e.stopPropagation()
              onDoubleClick(el)
              // Same reasoning as the main box's own onDoubleClick above —
              // grouped frames get the same "select now, edit on the next
              // plain click" treatment.
              if (!isGrouped) setEditing(true)
            }}
          >
            {el.label || 'Frame'}
          </div>
        )
      )}

      {el.type !== 'frame' && (
        editing ? (
          isBoundText ? (
            // A bound text box (drawn via click-drag) wraps/holds multiple
            // lines within its fixed size — a <textarea> wraps in real
            // time as you type, matching the wrapped look the committed
            // <div> display already had; a plain <input> can't wrap at
            // all (single-line only), which is what made typed text spill
            // past the box's visible edge until you clicked away. Enter
            // is left as the textarea's own default (insert a newline)
            // rather than committing — only blur or Escape end the edit.
            <textarea
              ref={inputRef}
              className="wf-label-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === 'Escape') { e.stopPropagation(); cancel() }
              }}
            />
          ) : (
            <input
              ref={inputRef}
              className={`wf-label-input${el.type === 'text' && draft === '' ? ' wf-label-input-bare' : ''}`}
              // A plain <input> has its own fixed intrinsic width (browser
              // default, unrelated to its value's length) — unlike a <div>,
              // it does NOT naturally shrink/grow to fit typed content. For
              // autoSize text specifically, approximate that growth with a
              // `ch`-based width (1ch ≈ one average character at the
              // current font) so the input visibly grows as you type,
              // matching the "no box until you type, sized to content"
              // behavior — not pixel-perfect (character width varies by
              // font), but the committed display afterwards (a plain <div>,
              // which does shrink-wrap exactly) is what actually matters for
              // the final look.
              style={isAutoText ? { width: `${Math.max(1, draft.length)}ch` } : undefined}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit()
                else if (e.key === 'Escape') { e.stopPropagation(); cancel() }
              }}
            />
          )
        ) : (
          el.label && <div className="wf-el-label">{el.label}</div>
        )
      )}
    </div>
  )
}
