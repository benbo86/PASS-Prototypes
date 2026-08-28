// Pure, React-free core for the "Element" tab (Components/DevEdit.jsx) — edit
// an element's text content, tag name, class, and id. Same separation as
// Components/iconSwap.js (no DOM-event/React concerns here; DevEdit.jsx owns
// all state/UI) and the same reason it can't reuse DevEdit's own CSSOM
// reconciliation: a CSSStyleRule is one shared object every matching element
// re-reads for free, but a specific DOM node isn't — mutating one element
// only ever affects that one node.
//
// Unlike Icon Swap (content-hash identity, defaults to "every matching
// instance"), this is deliberately INSTANCE-scoped by construction: editing
// "this paragraph's wording" or "this div's tag" is inherently about the one
// element you clicked, not every element that happens to look the same.
// Identity is therefore primarily a structural DOM path (position within the
// container), with a content hash as a secondary validity check — the
// inverse emphasis from Icon Swap's own hash-primary/path-secondary split,
// justified by the different nature of what's being identified. This does
// mean a saved edit can't survive the target being reordered/removed from
// its container — same accepted limitation Icon Swap's own scope:'instance'
// mode already documents for the identical reason (a structural path doesn't
// survive list reordering, conditional wrappers, or a view swap).

// buildDomPath/buildPathHint are generic (any Element, not SVG-specific) and
// already exported from ./iconSwap.js — DevEdit.jsx, which already imports
// them from there for icon swaps, reuses the same two rather than this file
// duplicating them.

// ─── Which elements/tags are eligible ──────────────────────────────────────
// Ben: text and class/id editing should work on anything, but changing an
// element's TAG needs a narrower, deliberately conservative scope — you
// can't rename a DOM node's tag in place, only create a new element and
// replace it, and the replacement is a plain node with none of React's own
// props/handlers. An interactive element (button/link/input/etc.) silently
// loses its real behaviour the instant it's replaced this way, with no
// reliable way to detect "this had a handler" from outside React to warn
// first — so those elements simply never offer the tag field at all, rather
// than offering it and hoping the user knows not to use it there.
const INTERACTIVE_TAGS = new Set(['a', 'button', 'input', 'select', 'textarea', 'form', 'option', 'label', 'iframe', 'video', 'audio', 'canvas', 'svg'])

// A curated set of safe, structural/text tags — deliberately not "any tag
// name" (which would let someone create e.g. <script> or <iframe> via the
// tag field). Covers the realistic "turn this div into a heading" /
// "this span should be a label" use case without opening up anything with
// its own side effects.
const ALLOWED_TARGET_TAGS = new Set([
  'div', 'span', 'p', 'section', 'article', 'header', 'footer', 'aside', 'nav',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'em', 'small', 'li', 'td', 'th', 'blockquote', 'figcaption', 'caption', 'label',
])

export function isEligibleForTagChange(el) {
  return !!el && !INTERACTIVE_TAGS.has(el.tagName.toLowerCase())
}

export function isValidTagName(tag) {
  return ALLOWED_TARGET_TAGS.has(String(tag).toLowerCase().trim())
}

// Text editing is offered only for elements with no element children (plain
// text, or empty) — an element mixing text and nested elements (an icon
// inside a label, a link inside a sentence) has no single "the text" to
// replace without silently discarding those children, so it's out of scope
// rather than risking data loss.
export function isLeafTextElement(el) {
  return !!el && el.children.length === 0
}

// ─── Validation ─────────────────────────────────────────────────────────
// A plain identifier per space-separated token — matches how HTML actually
// treats a class attribute (whitespace-separated tokens) while staying
// simple enough to explain in an inline error message.
const IDENT_RE = /^-?[_a-zA-Z][_a-zA-Z0-9-]*$/

export function isValidClassName(value) {
  const trimmed = value.trim()
  if (trimmed === '') return true // clearing the class entirely is valid
  return trimmed.split(/\s+/).every((token) => IDENT_RE.test(token))
}

export function isValidElementId(value) {
  const trimmed = value.trim()
  if (trimmed === '') return true // clearing the id entirely is valid
  if (/\s/.test(trimmed)) return false
  return IDENT_RE.test(trimmed)
}

// Excludes the element's own current id from the collision check — setting
// an id to the value it already has isn't a real collision.
export function isElementIdUnique(value, el, doc) {
  const trimmed = value.trim()
  if (trimmed === '') return true
  const existing = (doc || document).getElementById(trimmed)
  return !existing || existing === el
}

// ─── Canonicalize + hash ────────────────────────────────────────────────
// A secondary validity check alongside the dom path (see the module comment
// above) — tag + normalized own text, deliberately not the full subtree
// (this only ever targets leaf/text-bearing elements or their tag, not
// arbitrary nested structure).
function fnv1a(str) {
  let hash = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

export function canonicalizeElement(el) {
  const canonical = `${el.tagName.toLowerCase()}|${(el.textContent || '').replace(/\s+/g, ' ').trim()}`
  return { hash: fnv1a(canonical), len: canonical.length, canonical }
}

// ─── Resolving a saved edit back to a live element ─────────────────────
function resolveByDomPath(domPath, container) {
  let node = container
  for (const idx of domPath) {
    if (!node || !node.children || idx >= node.children.length) return null
    node = node.children[idx]
  }
  return node
}

// A resolved node is valid in exactly the same two cases Icon Swap's own
// scope:'instance' resolution already established: it still hash-matches
// the true original (a fresh reconcile always restores-then-reapplies, so
// the target genuinely looks unedited at that point), OR it already carries
// this edit's own data-passelement marker (the idempotent MutationObserver
// backstop's own re-check, which deliberately doesn't restore first). If
// neither holds, the page structure has changed too much since the edit was
// made — there's no sensible "apply to something else instead" fallback for
// an instance-scoped text/tag/class edit (unlike Icon Swap's icon, there's
// no "every matching instance" to fall back to), so this returns null and
// the caller simply skips that edit rather than guessing.
export function resolveElementTarget(edit, container) {
  if (!container) return null
  const node = resolveByDomPath(edit.domPath, container)
  if (!node) return null
  if (node.getAttribute('data-passelement') === edit.id) return node
  const { hash, len } = canonicalizeElement(node)
  if (hash === edit.originalHash && len === edit.originalLen) return node
  return null
}

// ─── Apply / restore ────────────────────────────────────────────────────
// registry: Map<Element, { tagName, attributes, innerHTML }> — like Icon
// Swap's own registry, keyed by the live element reference and snapshotted
// lazily on first touch (React reproduces an unedited element's original
// markup on every fresh mount, so there's nothing to lose by waiting).
// Unlike Icon Swap, the key can change mid-session: a tag-change replaces
// the node outright, so the registry entry is deleted under the old
// reference and re-added under the new one, carrying the *same* original
// snapshot forward — every caller must use the element `applyElementEdit`
// returns as the new live reference from that point on, not the one passed
// in, exactly the same "don't trust selection.el after this" discipline
// DevEdit.jsx's own icon-swap wiring already established for a different
// reason (there, React destroying an inner node; here, the node itself
// being swapped out).
export function applyElementEdit(el, edit, registry) {
  if (!registry.has(el)) {
    registry.set(el, {
      tagName: el.tagName.toLowerCase(),
      attributes: Array.from(el.attributes).map((a) => [a.name, a.value]),
      innerHTML: el.innerHTML,
    })
  }
  const snapshot = registry.get(el)
  let target = el

  if (edit.tag && edit.tag !== target.tagName.toLowerCase()) {
    const next = document.createElement(edit.tag)
    Array.from(target.attributes).forEach((a) => next.setAttribute(a.name, a.value))
    while (target.firstChild) next.appendChild(target.firstChild)
    target.replaceWith(next)
    registry.delete(el)
    registry.set(next, snapshot)
    target = next
  }

  if (typeof edit.text === 'string') target.textContent = edit.text
  if (typeof edit.className === 'string') target.className = edit.className
  if (typeof edit.elementId === 'string') {
    if (edit.elementId) target.id = edit.elementId
    else target.removeAttribute('id')
  }
  target.setAttribute('data-passelement', edit.id)
  return target
}

export function restoreElement(el, registry) {
  const snapshot = registry.get(el)
  if (!snapshot) return el
  let target = el
  if (target.tagName.toLowerCase() !== snapshot.tagName) {
    const original = document.createElement(snapshot.tagName)
    target.replaceWith(original)
    target = original
  }
  Array.from(target.attributes).forEach((a) => target.removeAttribute(a.name))
  snapshot.attributes.forEach(([name, value]) => target.setAttribute(name, value))
  target.innerHTML = snapshot.innerHTML
  registry.delete(el)
  return target
}

export function restoreAll(registry) {
  for (const el of Array.from(registry.keys())) restoreElement(el, registry)
}

export function reconcile(container, edits, registry) {
  restoreAll(registry)
  if (!container) return
  edits.forEach((edit) => {
    const target = resolveElementTarget(edit, container)
    if (target) applyElementEdit(target, edit, registry)
  })
}

// ─── Live runtime: registry + MutationObserver-based re-assertion ─────────
// Same shape as Icon Swap's own createIconSwapRuntime, including the
// rolling-window poll-fallback backstop — see that file's own comments for
// why childList/subtree (not attributes) is what's observed, and why a
// backstop beyond the observer is needed at all.
export function createElementEditRuntime(container) {
  const registry = new Map()
  let activeEdits = []
  let applying = false
  let rafScheduled = false
  let observer = null
  let pollTimer = null
  const reassertTimes = []

  function reapply() {
    applying = true
    for (const edit of activeEdits) {
      const target = resolveElementTarget(edit, container)
      if (target && target.getAttribute('data-passelement') !== edit.id) {
        applyElementEdit(target, edit, registry)
      }
    }
    if (observer) observer.takeRecords()
    applying = false

    const now = Date.now()
    reassertTimes.push(now)
    while (reassertTimes.length && now - reassertTimes[0] > 1000) reassertTimes.shift()
    if (reassertTimes.length > 30 && observer) {
      console.warn('Element edit: re-assert loop detected, backing off to polling')
      observer.disconnect()
      observer = null
      if (!pollTimer) pollTimer = setInterval(reapply, 500)
    }
  }

  function scheduleReapply() {
    if (applying || rafScheduled) return
    rafScheduled = true
    requestAnimationFrame(() => {
      rafScheduled = false
      reapply()
    })
  }

  function start() {
    if (observer || !container) return
    observer = new MutationObserver(() => {
      if (applying) return
      scheduleReapply()
    })
    observer.observe(container, { childList: true, subtree: true })
    scheduleReapply()
    setTimeout(reapply, 300)
    setTimeout(reapply, 1500)
  }

  function stop() {
    if (observer) { observer.disconnect(); observer = null }
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
  }

  return {
    setActiveEdits(edits) {
      activeEdits = edits || []
      reconcile(container, activeEdits, registry)
      if (activeEdits.length > 0) start()
      else stop()
    },
    applyOne(el, edit) { return applyElementEdit(el, edit, registry) },
    restoreOne(el) { return restoreElement(el, registry) },
    registry,
    dispose() {
      stop()
      restoreAll(registry)
    },
  }
}
