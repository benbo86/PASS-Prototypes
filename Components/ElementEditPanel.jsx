import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import {
  isEligibleForTagChange, isValidTagName, isLeafTextElement,
  isValidClassName, isValidElementId, isElementIdUnique,
} from './elementEdit'

// Tab body shown on Components/DevEdit.jsx's EditPanel for ANY selected
// element (unlike the Icon tab, not gated to a specific shape) — edit its
// text content, tag name, class, and id. Presentational — all durable state
// (the session's element edits) lives in DevEdit.jsx, same convention
// IconSwapPanel already established.
//
// Deliberately NOT a live-as-you-type preview like the CSS tab's own
// textarea — Ben's own ask ("if I make a mistake, throw an error and
// prevent applying") describes a draft-then-validate-then-commit flow, not
// a continuous one. So the draft lives entirely in this component's own
// local state until Apply succeeds; DevEdit.jsx only ever sees the
// validated, already-applied result.
//
// No Apply/Reset buttons of its own — Ben asked for one shared Apply/
// Cancel/Reset action row across both the CSS and Element tabs, rendered
// by EditPanel itself. This component exposes what that shared row needs
// via a ref instead: `commit()` runs the same validation the old internal
// Apply button used to, returning `{ok:true, value}` or `{ok:false}` (its
// own inline error is shown either way, so the caller doesn't need the
// message). `onDirtyChange`/`resetNonce` are the two small hooks that let
// the parent know "is there anything to Apply/Reset" without lifting the
// whole draft up.
const ElementEditPanel = forwardRef(function ElementEditPanel({ el, elKey, initial, onDirtyChange, resetNonce }, ref) {
  const [draft, setDraft] = useState(initial)
  const [error, setError] = useState(null)
  const canChangeTag = !!el && isEligibleForTagChange(el)
  const canEditText = !!el && isLeafTextElement(el)

  // A genuinely different element selected — start fresh from ITS current
  // values, not whatever was left in the fields for the previous one. Also
  // resyncs whenever the parent bumps resetNonce (its unified Reset button
  // was clicked) — `elKey` alone doesn't change on a same-element Reset
  // (the domPath-based key is stable across a tag change too), so without
  // this the fields would keep showing the just-discarded draft even
  // though the live element (and `initial`, read straight off it) has
  // already reverted.
  useEffect(() => { setDraft(initial); setError(null) }, [elKey, resetNonce])

  const isDirty = !!el && JSON.stringify(draft) !== JSON.stringify(initial)
  useEffect(() => {
    onDirtyChange?.(isDirty)
    // Resets to false on unmount (leaving the Element tab) and on every
    // re-run before recomputing — so a stale `true` from a previous
    // element/tab visit can never linger once this component stops being
    // the one actually driving that signal.
    return () => onDirtyChange?.(false)
  }, [isDirty, onDirtyChange])

  useImperativeHandle(ref, () => ({
    commit() {
      if (!el) return { ok: false }
      if (canChangeTag && draft.tag.trim() === '') {
        setError('Tag can\'t be empty.')
        return { ok: false }
      }
      if (canChangeTag && !isValidTagName(draft.tag)) {
        setError(`"${draft.tag}" isn't a supported tag — try one like div, span, p, or h1–h6.`)
        return { ok: false }
      }
      if (!isValidClassName(draft.className)) {
        setError('Class contains characters that aren\'t valid in a CSS class name.')
        return { ok: false }
      }
      if (!isValidElementId(draft.elementId)) {
        setError('ID must be a single word with no spaces, and can\'t start with a number.')
        return { ok: false }
      }
      if (!isElementIdUnique(draft.elementId, el, el.ownerDocument)) {
        setError(`"${draft.elementId}" is already used by another element on this page — ids must be unique.`)
        return { ok: false }
      }
      setError(null)
      return { ok: true, value: draft }
    },
  }))

  if (!el) return null

  const patch = (partial) => setDraft((d) => ({ ...d, ...partial }))

  return (
    <div className="devedit-element-tab">
      {canChangeTag ? (
        <div className="devedit-rule-block">
          <label className="devedit-element-label">Tag</label>
          <input
            type="text"
            className="devedit-rule-textarea devedit-element-input"
            value={draft.tag}
            onChange={(e) => patch({ tag: e.target.value })}
          />
        </div>
      ) : (
        <div className="devedit-element-hint">
          This is a {el.tagName.toLowerCase()} — its tag can't be changed here, since replacing an
          interactive element would silently lose whatever behaviour it has.
        </div>
      )}

      {canEditText ? (
        <div className="devedit-rule-block">
          <label className="devedit-element-label">Text</label>
          <textarea
            className="devedit-rule-textarea"
            rows={3}
            value={draft.text}
            onChange={(e) => patch({ text: e.target.value })}
          />
        </div>
      ) : (
        <div className="devedit-element-hint">
          This element contains other elements, not just text, so its content can't be edited here.
        </div>
      )}

      <div className="devedit-rule-block">
        <label className="devedit-element-label">Class</label>
        <input
          type="text"
          className="devedit-rule-textarea devedit-element-input"
          value={draft.className}
          onChange={(e) => patch({ className: e.target.value })}
          placeholder="(none)"
        />
      </div>

      <div className="devedit-rule-block">
        <label className="devedit-element-label">ID</label>
        <input
          type="text"
          className="devedit-rule-textarea devedit-element-input"
          value={draft.elementId}
          onChange={(e) => patch({ elementId: e.target.value })}
          placeholder="(none)"
        />
      </div>

      {error && <div className="devedit-error">{error}</div>}
    </div>
  )
})

export default ElementEditPanel
