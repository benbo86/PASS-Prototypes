import { useEffect, useRef, useState } from 'react'

// Renders one frame/rect/ellipse/text element — these four share one box
// model (x/y/w/h, optional fill/label) and differ only in a few rendered
// details, so one component handles all of them rather than duplicating
// label-editing logic four times. Resize handles no longer live here (v2:
// they moved to the shared SelectionOverlay, which handles 1-or-more
// selected elements uniformly) — this component only renders the box
// itself and reports clicks/double-clicks/right-clicks upward.
export default function ElementRenderer({ el, isSelected, activeTool, onMouseDown, onContextMenu, onLabelChange, onDoubleClick, autoEdit, onAutoEditConsumed }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(el.label)
  const inputRef = useRef(null)
  const boxRef = useRef(null)

  useEffect(() => {
    if (!editing) return
    setDraft(el.label)
    inputRef.current?.focus()
    inputRef.current?.select()
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
      const rect = boxRef.current.getBoundingClientRect()
      onLabelChange(el.id, draft, { w: Math.max(8, Math.ceil(rect.width)), h: Math.max(8, Math.ceil(rect.height)) })
    } else {
      onLabelChange(el.id, draft)
    }
    setEditing(false)
  }
  const cancel = () => {
    onLabelChange(el.id, el.label)
    setEditing(false)
  }

  const style = {
    left: el.x,
    top: el.y,
    ...(isAutoText ? {} : { width: el.w, height: el.h }),
    background: el.fill || 'transparent',
    border: el.stroke ? `${el.strokeWidth}px solid ${el.stroke}` : 'none',
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
        setEditing(true)
      }}
    >
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
              setEditing(true)
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
