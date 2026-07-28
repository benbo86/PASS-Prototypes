// Pure, React-free core for the "swap an icon" feature (Components/DevEdit.jsx's
// new SVG tab). No DOM-event/React concerns live here, matching Components/
// devModeUtils.js's own separation — this file only knows how to identify,
// hash, apply, restore, and reconcile <svg> content; DevEdit.jsx owns all
// state/UI.
//
// Why this can't reuse DevEdit's own CSSOM reconciliation (buildPristineSnapshot
// + applyOverrideSet): that mechanism works because a CSSStyleRule is a single,
// global, live object every matching element automatically re-reads on paint —
// "set text on the rule" and "every instance updates" are the same operation
// for free. An <svg>'s content has no such shared object: mutating one
// element's children only ever affects that one node. See the identity and
// apply/observe sections below for how this is solved instead.

// ─── Identity: resolve a click to a target <svg> ──────────────────────────

// Ambiguous (2+ svgs in the clicked container) deliberately returns null
// rather than guessing which one was meant — the caller shows no SVG tab.
export function resolveSvgTarget(el) {
  if (!el) return null
  if (el.tagName && el.tagName.toLowerCase() === 'svg') return el
  const closest = el.closest ? el.closest('svg') : null
  if (closest) return closest
  if (el.querySelectorAll) {
    const svgs = el.querySelectorAll('svg')
    if (svgs.length === 1) return svgs[0]
  }
  return null
}

// ─── Is this actually an icon? ─────────────────────────────────────────────
// Ben: "I don't think we want the user to replace any svg with an icon if it
// isn't an icon" — resolveSvgTarget above just finds "the one <svg> here,"
// which would just as happily match a multi-colour illustration, a logo, or
// an empty-state graphic. Confirmed via AskUserQuestion: gate the whole tab
// on this check (not just the label) — a non-icon SVG shows no tab at all,
// same as a non-<svg> element today. Every real icon in this repo (per the
// icon-library survey elsewhere in this file) is square-ish, small, and
// monochrome (fill="currentColor" or a single literal colour) — an
// illustration or logo reliably breaks at least one of those three.

const MAX_ICON_DIMENSION = 64
const MIN_ICON_DIMENSION = 8
// |w/h - 1| tolerance — accepts exactly-square (the overwhelming majority)
// plus mildly non-square icons (e.g. a 24x18 wordless glyph) without
// accepting a genuinely wide/tall illustration.
const ASPECT_TOLERANCE = 0.34
const NON_ICON_CHILD_TAGS = 'image, linearGradient, radialGradient, pattern, foreignObject, script'

// Real bug, caught before shipping by testing against actual pages (not
// just synthetic cases): a Font-Awesome-style icon (customer-profile/
// timeline's icon-font glyphs use viewBox="0 0 512 512" but render at
// width="12" height="12") was wrongly rejected as "oversized" — viewBox is
// a coordinate system, not a physical size, and plenty of real icons here
// use a large/arbitrary viewBox with a small actual rendered size. Explicit
// width/height attributes (the actual displayed size) are the correct
// signal and take priority; viewBox dimensions are only a fallback for the
// (rarer) icon that has no explicit width/height at all.
function getIntrinsicSize(svgEl) {
  const w = Number(svgEl.getAttribute('width'))
  const h = Number(svgEl.getAttribute('height'))
  if (w > 0 && h > 0) return { w, h }
  const viewBox = svgEl.getAttribute('viewBox')
  if (viewBox) {
    const parts = viewBox.trim().split(/[\s,]+/).map(Number)
    if (parts.length === 4 && parts.every((n) => !Number.isNaN(n))) {
      return { w: parts[2], h: parts[3] }
    }
  }
  return null
}

function isMonochrome(svgEl) {
  const colors = new Set()
  const walk = (n) => {
    if (n.nodeType !== 1) return
    for (const attr of ['fill', 'stroke', 'stop-color', 'flood-color']) {
      const v = n.getAttribute(attr)
      if (v && isColorLiteral(v)) colors.add(v.trim().toLowerCase())
    }
    Array.from(n.children).forEach(walk)
  }
  walk(svgEl)
  return colors.size <= 1
}

export function isLikelyIcon(svgEl) {
  if (!svgEl) return false
  const size = getIntrinsicSize(svgEl)
  if (!size) return false
  if (size.w > MAX_ICON_DIMENSION || size.h > MAX_ICON_DIMENSION) return false
  if (size.w < MIN_ICON_DIMENSION || size.h < MIN_ICON_DIMENSION) return false
  const ratio = size.w / size.h
  if (ratio < 1 - ASPECT_TOLERANCE || ratio > 1 + ASPECT_TOLERANCE) return false
  if (svgEl.querySelector(NON_ICON_CHILD_TAGS)) return false
  if (!isMonochrome(svgEl)) return false
  return true
}

// ─── Canonicalize + hash ───────────────────────────────────────────────────
// Identity is content-based, not structural — a saved swap must survive list
// reordering, conditional wrappers, and view swaps, none of which a DOM path
// alone would survive. width/height/class/id/aria-*/data-* are dropped since
// none of them distinguish "this icon" from "the same icon at a different
// size/state" (confirmed: the same ChevronLeftIcon renders at 14/16/24px via
// a `size` prop in the same file, and the ~20 svgs that do carry a class use
// runtime-toggled state classes, not per-icon identity).

const DROP_ATTRS = new Set([
  'class', 'style', 'width', 'height', 'id', 'focusable', 'xmlns', 'xmlns:xlink',
  'role', 'tabindex', 'data-passicon',
])
const COLOR_ATTRS = new Set(['fill', 'stroke', 'stop-color', 'flood-color'])
const DROP_SUBTREE_TAGS = new Set(['title', 'desc'])

function isAriaOrData(name) {
  return name.startsWith('aria-') || name.startsWith('data-')
}

function isNumeric(v) {
  return v.trim() !== '' && !Number.isNaN(Number(v))
}

const COLOR_LITERAL_RE = /^(#[0-9a-f]{3,8}|rgba?\(|hsla?\(|[a-z]+)$/i

function isColorLiteral(v) {
  return COLOR_LITERAL_RE.test(v.trim()) && v.trim().toLowerCase() !== 'none' && v.trim().toLowerCase() !== 'currentcolor'
}

function normalizeAttrValue(name, value) {
  const v = value.replace(/\s+/g, ' ').trim()
  if (COLOR_ATTRS.has(name) && isColorLiteral(v)) return '<color>'
  if (isNumeric(v)) return String(Number(v))
  return v
}

function canonicalizeNode(el) {
  const tag = el.tagName.toLowerCase()
  if (DROP_SUBTREE_TAGS.has(tag)) return ''
  const attrs = []
  const names = Array.from(el.attributes).map((a) => a.name).sort()
  for (const name of names) {
    if (DROP_ATTRS.has(name) || isAriaOrData(name)) continue
    attrs.push(`${name}=${normalizeAttrValue(name, el.getAttribute(name))}`)
  }
  const children = Array.from(el.children).map(canonicalizeNode).filter(Boolean).join(',')
  return `${tag}[${attrs.join(';')}]${children ? `{${children}}` : ''}`
}

// FNV-1a 32-bit — inline, no dependency, 8 lowercase hex chars.
function fnv1a(str) {
  let hash = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

// Returns { hash, len, canonical } — len is stored alongside the hash as a
// cheap collision hardener (checked together at resolution time), canonical
// is returned too so callers needing a human-readable label (e.g. "N paths")
// don't have to re-walk the element.
export function canonicalizeIcon(svgEl) {
  const canonical = canonicalizeNode(svgEl)
  return { hash: fnv1a(canonical), len: canonical.length, canonical }
}

// ─── Resolving saved swaps back to live elements ──────────────────────────

// Walks container.children[domPath[0]].children[domPath[1]]... — returns
// null the instant an index is out of range, rather than throwing, since a
// stale/out-of-date path against a since-changed page is an expected case,
// not a bug.
function resolveByDomPath(domPath, container) {
  let node = container
  for (const idx of domPath) {
    if (!node || !node.children || idx >= node.children.length) return null
    node = node.children[idx]
  }
  return node
}

// scope: 'all' (the default, and the only mode v1 shipped with) matches
// every element with the same content hash. scope: 'instance' additionally
// carries a domPath — a structural fallback specifically because content
// hashing alone can't distinguish "this one" from "the other N that look
// identical." A structural path is inherently less robust than a content
// hash (it doesn't survive list reordering, conditional wrappers, or a
// view swap — see canonicalizeIcon's own reasoning above for why hashing
// is the primary identity everywhere else) — so if it no longer resolves
// to a genuinely hash-matching element (page structure changed since the
// swap was made), this falls back to "all" rather than silently dropping
// the swap or guessing which instance was meant. Callers that want to
// know this happened can check `result.length !== 1` for an
// scope:'instance' swap that had a domPath.
export function resolveTargets(swap, container) {
  if (!container) return []
  const all = Array.from(container.querySelectorAll('svg'))
  const matching = all.filter((el) => {
    const { hash, len } = canonicalizeIcon(el)
    return hash === swap.originalHash && len === swap.originalLen
  })
  if (swap.scope === 'instance' && swap.domPath) {
    const node = resolveByDomPath(swap.domPath, container)
    // A resolved node is valid in TWO distinct cases, not just one: (1) it
    // still hash-matches the true original (the common case — a fresh
    // reconcile always restores everything to pristine before this runs,
    // so the domPath's target genuinely looks unswapped at this point), OR
    // (2) it's already carrying THIS swap's own data-passicon marker — the
    // case hit by createIconSwapRuntime's own idempotent MutationObserver
    // backstop (`reapply`), which deliberately does NOT restore-then-
    // reapply from scratch each tick, just checks "is this element already
    // correctly marked?" An already-swapped element's hash no longer
    // equals originalHash by definition — real bug caught by testing the
    // full runtime, not just a single resolveTargets call in isolation:
    // treating case (2) as "domPath failed" fell back to "all," which then
    // (incorrectly) applied the swap fresh to every OTHER still-unswapped
    // matching instance on the very next backstop tick, silently widening
    // an instance-scoped swap to all instances a moment after it was
    // correctly applied to just one.
    const alreadyCorrectlySwapped = node && node.getAttribute('data-passicon') === swap.id
    if (node && (matching.includes(node) || alreadyCorrectlySwapped)) return [node]
    console.warn('Icon swap: instance-scoped swap\'s domPath no longer resolves to a matching element (page structure changed) — applying to all matching instances instead.')
  }
  return matching
}

// ─── Structural path (recorded, not used for v1 resolution) ──────────────

export function buildDomPath(svgEl, containerEl) {
  const path = []
  let n = svgEl
  while (n && n !== containerEl) {
    const parent = n.parentElement
    if (!parent) return null
    path.unshift(Array.prototype.indexOf.call(parent.children, n))
    n = parent
  }
  return n === containerEl ? path : null
}

export function buildPathHint(svgEl, containerEl) {
  const hint = []
  let n = svgEl
  while (n && n !== containerEl) {
    const tag = n.tagName.toLowerCase()
    const cls = n.classList && n.classList[0]
    hint.unshift(cls ? `${tag}.${cls}` : tag)
    n = n.parentElement
  }
  return hint
}

// ─── Apply / restore ───────────────────────────────────────────────────────
// Mutates the existing <svg> node's children in place — never outerHTML,
// never replaceWith. React diffs vdom against vdom, not vdom against the
// real DOM: on a re-render where this element's own props haven't changed,
// React computes an identical element tree for the subtree and issues zero
// DOM operations against it, so an in-place child swap is invisible to (and
// survives) the overwhelming majority of unrelated re-renders. It only
// breaks when React actually unmounts+remounts the subtree — see the
// MutationObserver-based runtime below for how that's handled.

function usesCurrentColor(svgEl) {
  if (svgEl.getAttribute('fill') === 'currentColor') return true
  return Array.from(svgEl.querySelectorAll('[fill],[stroke]')).some(
    (n) => n.getAttribute('fill') === 'currentColor' || n.getAttribute('stroke') === 'currentColor'
  )
}

function recolorToCurrentColor(root) {
  const walk = (n) => {
    if (n.nodeType !== 1) return
    for (const attr of ['fill', 'stroke']) {
      const v = n.getAttribute(attr)
      if (v && isColorLiteral(v)) n.setAttribute(attr, 'currentColor')
    }
    Array.from(n.children).forEach(walk)
  }
  walk(root)
}

let parser = null
const XMLNS_SVG = 'http://www.w3.org/2000/svg'

// Real bug, reported directly: swapping in a page-harvested icon (the
// "On this page" source has since been removed entirely — see the Icon
// Swap section of CLAUDE.md — but the underlying namespace fix below still
// matters for any other markup source that omits xmlns) silently did
// nothing, while repo-file and Iconify candidates both worked. Root cause:
// most of this repo's inline icon JSX
// has no explicit xmlns attribute (it's implicit — the element is already
// created in the SVG namespace via JSX/createElementNS) — a live SVG
// element's own outerHTML serialization never re-adds it either, since the
// browser's HTML serializer already knows the element is foreign content
// and doesn't redundantly restate its namespace. But parseFromString with
// the 'image/svg+xml' MIME type parses the string as a *standalone*
// document, where namespace resolution follows plain XML rules — with no
// xmlns anywhere in the string, the root (and everything inside it) ends
// up with namespaceURI === null, not the SVG namespace. Confirmed directly
// (not assumed): grabbing a real page icon's own outerHTML and parsing it
// this way returned `null` for `documentElement.namespaceURI`. A null-
// namespace <svg>/<path> inserted into the live document via
// document.importNode doesn't render as SVG at all — it's just inert
// foreign markup, which is exactly what looked like "nothing happens."
// Repo-file icons (Figma exports always include xmlns) and Iconify results
// (Components/iconLibrary.js's fetchIconifyIcons builds the string with an
// explicit xmlns itself) both happened to already carry it, which is why
// only the page-harvested path was ever affected.
//
// Fixed at the one shared parse chokepoint, not by chasing down every
// source that omits it: inject xmlns onto the opening <svg tag before
// parsing, unless the string already declares one.
function ensureXmlns(svgString) {
  if (/\bxmlns\s*=/.test(svgString)) return svgString
  return svgString.replace(/<svg\b/, `<svg xmlns="${XMLNS_SVG}"`)
}

// Strips <script>/<foreignObject> before anything is ever live-inserted —
// defense in depth. A DOMParser-parsed document is inert on its own, but
// once these nodes are actually imported into the live document (as
// applySwap does), an SVG <script> can execute in some browsers, and
// <foreignObject> can smuggle arbitrary HTML. Iconify results are
// third-party content fetched at runtime, so this isn't purely
// theoretical — cheap to strip unconditionally regardless of source.
function parseSvgString(svgString) {
  if (!parser) parser = new DOMParser()
  const doc = parser.parseFromString(ensureXmlns(svgString), 'image/svg+xml')
  doc.documentElement.querySelectorAll('script, foreignObject').forEach((n) => n.remove())
  return doc.documentElement
}

// Exported so any OTHER place that renders untrusted SVG markup (e.g. the
// Icon Library's own swatch previews, via dangerouslySetInnerHTML) can run
// it through the same script/foreignObject strip before it ever reaches
// the DOM — applySwap isn't the only insertion point.
export function sanitizeSvgMarkup(svgString) {
  return parseSvgString(svgString).outerHTML
}

// Real bug, reported directly: "on this page icons, when selected its not
// looking like the preview." Root cause: the Icon Library's swatch grid
// renders inside Dev Edit's own dark panel (Styles/dev-edit.css's
// .devedit-panel sets color: #f2f2f2), while a real page's icons inherit
// wildly different colours via currentColor (confirmed directly against a
// live prototype: white, blue-grey, purple all present on one page) — a
// currentColor candidate always previewed near-white in the swatch
// regardless of what colour it'll actually render once swapped onto the
// real target. Fixed by reproducing applySwap's own transform (recolor
// literal colours to currentColor if the target uses it — same
// usesCurrentColor/recolorToCurrentColor calls applySwap itself makes,
// so the preview can never drift from the real outcome) and letting the
// caller apply the target's own resolved colour as the swatch's `color`,
// so any currentColor in the preview resolves the same way it will once
// actually applied.
export function previewMarkupFor(svgString, targetEl) {
  const parsed = parseSvgString(svgString)
  if (targetEl && usesCurrentColor(targetEl)) recolorToCurrentColor(parsed)
  return parsed.outerHTML
}

// registry: Map<Element, { innerHTML, viewBox }> — the pre-swap snapshot,
// captured lazily on first mutation (not up front at mount, unlike DevEdit's
// CSS-side buildPristineSnapshot) — React reproduces an unswapped element's
// original markup on every fresh mount, so there is nothing to lose by
// snapshotting the first time we actually touch it, and the key is the live
// element reference itself, which is collision-free by construction (the
// class of bug that hit DevEdit's :root-keyed pristine snapshot structurally
// cannot happen here). A plain Map, not a WeakMap: restoreAll/reconcile need
// to enumerate every registered element (a WeakMap can't be iterated), and
// every entry is explicitly removed via restoreElement/registry.delete the
// moment it's no longer needed, so there's no unbounded-growth risk from
// giving up weak references.
export function applySwap(el, swap, registry) {
  if (!registry.has(el)) {
    registry.set(el, { innerHTML: el.innerHTML, viewBox: el.getAttribute('viewBox') })
  }
  const parsed = parseSvgString(swap.svg)
  if (usesCurrentColor(el)) recolorToCurrentColor(parsed)
  const viewBox = parsed.getAttribute('viewBox') || '0 0 24 24'
  el.setAttribute('viewBox', viewBox)
  const imported = Array.from(parsed.childNodes).map((n) => document.importNode(n, true))
  el.replaceChildren(...imported)
  el.setAttribute('data-passicon', swap.id)
}

export function restoreElement(el, registry) {
  const snapshot = registry.get(el)
  if (!snapshot) return
  el.innerHTML = snapshot.innerHTML
  if (snapshot.viewBox === null) el.removeAttribute('viewBox')
  else el.setAttribute('viewBox', snapshot.viewBox)
  el.removeAttribute('data-passicon')
  registry.delete(el)
}

export function restoreAll(registry) {
  for (const el of Array.from(registry.keys())) restoreElement(el, registry)
}

// Full reconciliation, the analogue of DevEdit's applyOverrideSet: restore
// everything currently swapped, then re-apply the target list from scratch.
// Simpler than the CSS side because there's no global "what existed before
// any override" snapshot to maintain — every registry entry already IS the
// true original for that element, captured the moment it was first touched.
export function reconcile(container, nextSwaps, registry) {
  restoreAll(registry)
  if (!container) return
  for (const swap of nextSwaps) {
    const targets = resolveTargets(swap, container)
    targets.forEach((el) => applySwap(el, swap, registry))
  }
}

// ─── Live runtime: registry + MutationObserver-based re-assertion ─────────
// Only childList/subtree is observed (not attributes — that would fire on
// every hover/class toggle on the page). A React remount always shows up as
// a childList mutation on some ancestor, which is the only case that can
// actually revert a swap (see applySwap's own comment above).
export function createIconSwapRuntime(container) {
  const registry = new Map()
  let activeSwaps = []
  let applying = false
  let rafScheduled = false
  let observer = null
  let pollTimer = null
  const reassertTimes = []

  function reapply() {
    applying = true
    for (const swap of activeSwaps) {
      const targets = resolveTargets(swap, container)
      targets.forEach((el) => {
        if (el.getAttribute('data-passicon') !== swap.id) applySwap(el, swap, registry)
      })
    }
    if (observer) observer.takeRecords() // discard our own mutations before they can be (re-)delivered
    applying = false

    const now = Date.now()
    reassertTimes.push(now)
    while (reassertTimes.length && now - reassertTimes[0] > 1000) reassertTimes.shift()
    if (reassertTimes.length > 30 && observer) {
      console.warn('Icon swap: re-assert loop detected, backing off to polling')
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
    // Cold-start coverage for lazily-mounted subtrees / post-hydration layout.
    scheduleReapply()
    setTimeout(reapply, 300)
    setTimeout(reapply, 1500)
  }

  function stop() {
    if (observer) { observer.disconnect(); observer = null }
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
  }

  return {
    setActiveSwaps(swaps) {
      activeSwaps = swaps || []
      reconcile(container, activeSwaps, registry)
      if (activeSwaps.length > 0) start()
      else stop()
    },
    applyOne(el, swap) { applySwap(el, swap, registry) },
    restoreOne(el) { restoreElement(el, registry) },
    registry,
    dispose() {
      stop()
      restoreAll(registry)
    },
  }
}
