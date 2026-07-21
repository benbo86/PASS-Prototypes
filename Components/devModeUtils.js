// Pure helpers for the Dev Mode inspector (Components/DevMode.jsx) —
// geometry, computed-style parsing, and image export. No React/DOM-event
// concerns live here so these stay easy to reason about independently.

import { toPng, toJpeg, toSvg, toCanvas } from 'html-to-image'

// ─── Color ───────────────────────────────────────────────────────

// Converts a computed rgb()/rgba() string to hex + keeps the original.
// Returns { hex, rgba, alpha } — hex is null for transparent/unparseable
// values. Note: getComputedStyle never actually returns the literal string
// "transparent" — an unset background computes to "rgba(0, 0, 0, 0)", so
// alpha === 0 (not just a missing/unmatched string) must also read as
// transparent, or e.g. a genuinely transparent element misleadingly shows
// as opaque black.
export function parseColor(rgbString) {
  if (!rgbString || rgbString === 'transparent') {
    return { hex: null, rgba: rgbString || 'transparent', alpha: 0 }
  }
  const match = rgbString.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/)
  if (!match) return { hex: null, rgba: rgbString, alpha: 1 }
  const [, r, g, b, a] = match
  const alpha = a !== undefined ? parseFloat(a) : 1
  if (alpha === 0) return { hex: null, rgba: rgbString, alpha: 0 }
  const hex = '#' + [r, g, b].map(v => Math.round(Number(v)).toString(16).padStart(2, '0')).join('')
  return { hex, rgba: rgbString, alpha }
}

// ─── Element metrics (for the inspect panel) ────────────────────

export function firstFont(fontFamily) {
  return fontFamily ? fontFamily.split(',')[0].replace(/["']/g, '').trim() : ''
}

export function getElementMetrics(el) {
  const rect = el.getBoundingClientRect()
  const cs = getComputedStyle(el)

  const hasVisibleBorder = parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none'

  const radii = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius]
  const uniformRadius = radii.every(r => r === radii[0])

  return {
    tagName: el.tagName.toLowerCase(),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    backgroundColor: parseColor(cs.backgroundColor),
    color: parseColor(cs.color),
    borderColor: hasVisibleBorder ? parseColor(cs.borderTopColor) : null,
    borderWidth: hasVisibleBorder ? cs.borderTopWidth : null,
    fontFamily: cs.fontFamily,
    fontSize: cs.fontSize,
    fontWeight: cs.fontWeight,
    lineHeight: cs.lineHeight,
    letterSpacing: cs.letterSpacing,
    borderRadius: uniformRadius ? cs.borderTopLeftRadius : radii,
    boxShadow: cs.boxShadow === 'none' ? null : cs.boxShadow,
  }
}

// Renders a metrics object as a plain CSS declaration block (no selector) —
// matches Figma's own "copy as CSS", which is meant to be pasted straight
// into an existing rule rather than used as a standalone snippet. Omits
// properties that don't apply (transparent colors, no border, no shadow,
// default letter-spacing) so the output only shows what the element
// actually uses.
export function generateCssSnippet(metrics) {
  const lines = [
    `width: ${metrics.width}px;`,
    `height: ${metrics.height}px;`,
  ]
  if (metrics.backgroundColor.hex) lines.push(`background-color: ${metrics.backgroundColor.hex};`)
  if (metrics.color.hex) lines.push(`color: ${metrics.color.hex};`)
  lines.push(
    `font-family: ${firstFont(metrics.fontFamily)};`,
    `font-size: ${metrics.fontSize};`,
    `font-weight: ${metrics.fontWeight};`,
    `line-height: ${metrics.lineHeight};`,
  )
  if (metrics.letterSpacing && metrics.letterSpacing !== 'normal') {
    lines.push(`letter-spacing: ${metrics.letterSpacing};`)
  }
  if (metrics.borderColor) lines.push(`border: ${metrics.borderWidth} solid ${metrics.borderColor.hex};`)
  const radius = Array.isArray(metrics.borderRadius) ? metrics.borderRadius.join(' ') : metrics.borderRadius
  if (radius && parseFloat(radius) > 0) lines.push(`border-radius: ${radius};`)
  if (metrics.boxShadow) lines.push(`box-shadow: ${metrics.boxShadow};`)
  return lines.join('\n')
}

// ─── Distance geometry ───────────────────────────────────────────

// DOMRect's numeric fields are inherited accessors, not own enumerable
// properties — they don't survive JSON.stringify or plain equality checks
// as expected. Always convert to a plain object immediately after calling
// getBoundingClientRect() before storing/comparing/rendering it.
export function toPlainRect(rect) {
  return {
    top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom,
    width: rect.width, height: rect.height,
  }
}

// True if an element has some actual visual presence (a non-transparent
// background, a visible border, or a shadow) rather than being a purely
// structural layout wrapper (e.g. a flex/grid container with no styling
// of its own). Border check uses the top side as a proxy for "has a
// border at all" — matches the same simplification used in
// getElementMetrics, since most UI elements use uniform borders.
function isVisiblyStyled(el) {
  const cs = getComputedStyle(el)
  if (parseColor(cs.backgroundColor).hex) return true
  const hasBorder = parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none'
  if (hasBorder && parseColor(cs.borderTopColor).hex) return true
  if (cs.boxShadow && cs.boxShadow !== 'none') return true
  return false
}

// Walks up from an element to the nearest ancestor with real visual
// presence, skipping purely structural wrapper divs (common in flex/grid
// layouts) that have no background/border of their own. Falls back to the
// immediate parent if nothing visibly styled is found before <body>.
// Used for the default (nothing-selected) hover measurement — showing a
// gap to an invisible layout wrapper the user can't actually see is not
// useful; a gap to something with a visible edge is.
export function findVisibleAncestor(el) {
  let node = el.parentElement
  const immediateParent = node
  while (node && node !== document.body && node !== document.documentElement) {
    if (isVisiblyStyled(node)) return node
    node = node.parentElement
  }
  return immediateParent
}

// 4-sided gap between a child's rect and its parent's rect. Can be negative
// if the child visually overflows the parent (e.g. absolute positioning) —
// that's shown as-is, not clamped, since it's real signal for an inspector.
export function computeParentGap(childRect, parentRect) {
  return {
    top: childRect.top - parentRect.top,
    right: parentRect.right - childRect.right,
    bottom: parentRect.bottom - childRect.bottom,
    left: childRect.left - parentRect.left,
  }
}

// Wraps a single childRect/refRect pair into the same per-direction shape
// computeNearestGaps produces, so the overlay can render both with one
// code path regardless of whether all 4 sides share one reference or each
// has its own nearest neighbor.
export function uniformDirs(childRect, refRect) {
  const gap = computeParentGap(childRect, refRect)
  return {
    top: { gap: gap.top, rect: refRect },
    right: { gap: gap.right, rect: refRect },
    bottom: { gap: gap.bottom, rect: refRect },
    left: { gap: gap.left, rect: refRect },
  }
}

// For each of the 4 directions from el, finds whichever is actually
// nearest: another element within `container` sitting immediately next to
// el on that side, or container's own edge if nothing is closer. This is
// what makes the default hover measurement show "12px to the next line of
// text" instead of always jumping straight to the container boundary —
// matching what a developer actually perceives as "the gap" when looking
// at stacked/adjacent content.
//
// Candidates are gathered by walking el's ancestor chain up to (and
// including) `container`, collecting sibling elements at each level —
// NOT a full container.querySelectorAll('*'), which could be large and
// is re-run every animation frame while hovering.
function collectNearbyCandidates(el, container) {
  const candidates = []
  let node = el.parentElement
  while (node) {
    for (const sibling of node.children) {
      if (sibling !== el && !sibling.contains(el)) candidates.push(sibling)
    }
    if (node === container) break
    node = node.parentElement
  }
  return candidates
}

export function computeNearestGaps(el, container) {
  const elRect = toPlainRect(el.getBoundingClientRect())
  const containerRect = toPlainRect(container.getBoundingClientRect())
  const candidates = collectNearbyCandidates(el, container).map(c => toPlainRect(c.getBoundingClientRect()))

  const dirs = uniformDirs(elRect, containerRect)

  for (const cRect of candidates) {
    const overlapsX = cRect.left < elRect.right && elRect.left < cRect.right
    const overlapsY = cRect.top < elRect.bottom && elRect.top < cRect.bottom

    if (overlapsX && cRect.top >= elRect.bottom - 0.5) {
      const gap = cRect.top - elRect.bottom
      if (gap < dirs.bottom.gap) dirs.bottom = { gap, rect: cRect }
    }
    if (overlapsX && cRect.bottom <= elRect.top + 0.5) {
      const gap = elRect.top - cRect.bottom
      if (gap < dirs.top.gap) dirs.top = { gap, rect: cRect }
    }
    if (overlapsY && cRect.left >= elRect.right - 0.5) {
      const gap = cRect.left - elRect.right
      if (gap < dirs.right.gap) dirs.right = { gap, rect: cRect }
    }
    if (overlapsY && cRect.right <= elRect.left + 0.5) {
      const gap = elRect.left - cRect.right
      if (gap < dirs.left.gap) dirs.left = { gap, rect: cRect }
    }
  }

  return { rect: elRect, dirs }
}

// Pairwise gap between two unrelated/non-overlapping rects, decomposed into
// horizontal/vertical like Figma's measurement badges. Returns
// { overlapping: true } when the rects intersect on both axes — callers
// should fall back to computeParentGap-style display in that case instead
// of showing a misleading 0px/0px.
export function computeElementGap(rectA, rectB) {
  const overlapsX = rectA.left < rectB.right && rectB.left < rectA.right
  const overlapsY = rectA.top < rectB.bottom && rectB.top < rectA.bottom

  if (overlapsX && overlapsY) {
    return { overlapping: true }
  }

  let horizontal = 0
  if (!overlapsX) {
    horizontal = rectA.right <= rectB.left ? rectB.left - rectA.right : rectA.left - rectB.right
  }
  let vertical = 0
  if (!overlapsY) {
    vertical = rectA.bottom <= rectB.top ? rectB.top - rectA.bottom : rectA.top - rectB.bottom
  }

  return { overlapping: false, horizontal, vertical, overlapsX, overlapsY }
}

export function isAncestorOrDescendant(elA, elB) {
  return elA !== elB && (elA.contains(elB) || elB.contains(elA))
}

export function findCommonAncestor(elements) {
  if (elements.length === 0) return null
  if (elements.length === 1) return elements[0].parentElement || elements[0]

  const ancestorChain = (el) => {
    const chain = []
    let node = el
    while (node) {
      chain.push(node)
      node = node.parentElement
    }
    return chain
  }

  const chains = elements.map(ancestorChain)
  for (const candidate of chains[0]) {
    if (chains.every(chain => chain.includes(candidate))) return candidate
  }
  return document.body
}

// ─── Export ───────────────────────────────────────────────────────

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  link.setAttribute('data-devmode-ui', 'true')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function extensionFor(format) {
  return format === 'jpeg' ? 'jpg' : format
}

// skipFonts: true — html-to-image's own font re-embedding step tries to
// read cssRules from every stylesheet on the page, including cross-origin
// ones (e.g. the Google Fonts <link>, which has no `crossorigin` attribute
// so the browser blocks CSSOM access to it) — this throws a SecurityError.
// document.fonts.ready above already guarantees the correct font is
// rendered before the snapshot is taken, so we don't need html-to-image's
// separate embedding step for that. Trade-off: an exported SVG opened in a
// context without the Barlow font available may fall back to a system
// font — acceptable for an internal dev tool, same caveat class as SVG
// export not producing true vector paths.
const HTML_TO_IMAGE_OPTS = { skipFonts: true }

// The anchor below is appended straight to document.body, outside
// containerRef's subtree — DevMode's own outer "block accidental
// navigation" guard (see DevMode.jsx) preventDefault()s any click outside
// that scope, which would otherwise silently cancel this exact download.
// Tagging it data-devmode-ui exempts it, same as the rest of Dev Mode's UI.

export async function exportElement(el, { format = 'png', scale = 1, filename } = {}) {
  await document.fonts.ready
  const name = filename || `devmode-export-${Date.now()}`

  let dataUrl
  if (format === 'png') dataUrl = await toPng(el, { ...HTML_TO_IMAGE_OPTS, pixelRatio: scale })
  else if (format === 'jpg' || format === 'jpeg') dataUrl = await toJpeg(el, { ...HTML_TO_IMAGE_OPTS, pixelRatio: scale, quality: 0.95 })
  else if (format === 'svg') dataUrl = await toSvg(el, HTML_TO_IMAGE_OPTS)
  else throw new Error(`Unsupported export format: ${format}`)

  downloadDataUrl(dataUrl, `${name}.${extensionFor(format)}`)
}

// Crops an html-to-image SVG data URL to a region by rewriting the root
// <svg>'s viewBox/width/height — a real crop via SVG's native viewport
// mechanism, no manipulation of the embedded foreignObject content needed.
function cropSvgDataUrl(dataUrl, crop) {
  const commaIndex = dataUrl.indexOf(',')
  const encoded = dataUrl.slice(commaIndex + 1)
  const svgText = decodeURIComponent(encoded)

  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml')
  const svgEl = doc.documentElement
  svgEl.setAttribute('viewBox', `${crop.x} ${crop.y} ${crop.width} ${crop.height}`)
  svgEl.setAttribute('width', String(Math.round(crop.width)))
  svgEl.setAttribute('height', String(Math.round(crop.height)))

  const newSvgText = new XMLSerializer().serializeToString(svgEl)
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(newSvgText)}`
}

// Multi-select export: one combined image spanning the union bounding box
// of all selected elements, cropped from their nearest common ancestor —
// shows them exactly as they appear together, including whatever sits
// between/around them.
export async function exportSelection(elements, { format = 'png', scale = 1, filename } = {}) {
  await document.fonts.ready
  const name = filename || `devmode-export-${Date.now()}`

  const ancestor = findCommonAncestor(elements)
  const ancestorRect = ancestor.getBoundingClientRect()
  const rects = elements.map(el => el.getBoundingClientRect())
  const union = {
    left: Math.min(...rects.map(r => r.left)),
    top: Math.min(...rects.map(r => r.top)),
    right: Math.max(...rects.map(r => r.right)),
    bottom: Math.max(...rects.map(r => r.bottom)),
  }
  const crop = {
    x: union.left - ancestorRect.left,
    y: union.top - ancestorRect.top,
    width: union.right - union.left,
    height: union.bottom - union.top,
  }

  if (format === 'svg') {
    const svgDataUrl = await toSvg(ancestor, HTML_TO_IMAGE_OPTS)
    downloadDataUrl(cropSvgDataUrl(svgDataUrl, crop), `${name}.svg`)
    return
  }

  const fullCanvas = await toCanvas(ancestor, { ...HTML_TO_IMAGE_OPTS, pixelRatio: scale })
  const cropCanvas = document.createElement('canvas')
  cropCanvas.width = Math.round(crop.width * scale)
  cropCanvas.height = Math.round(crop.height * scale)
  const ctx = cropCanvas.getContext('2d')
  ctx.drawImage(
    fullCanvas,
    Math.round(crop.x * scale), Math.round(crop.y * scale),
    cropCanvas.width, cropCanvas.height,
    0, 0,
    cropCanvas.width, cropCanvas.height
  )
  const mime = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : 'image/png'
  downloadDataUrl(cropCanvas.toDataURL(mime, 0.95), `${name}.${extensionFor(format)}`)
}
