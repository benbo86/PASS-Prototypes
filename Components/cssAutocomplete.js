// Pure, React-free CSS property/value autocomplete engine backing Dev Edit's
// "Edit styles" tab (Components/DevEdit.jsx) — lets typing a declaration in
// the raw textarea surface suggestions the way Chrome DevTools' own Styles
// pane does. No hand-maintained property list to drift from reality: it's
// read live off the browser's own CSSStyleDeclaration.

let cachedProperties = null

function toKebabCase(camel) {
  return camel.replace(/([A-Z])/g, '-$1').toLowerCase()
}

// Enumerating a live CSSStyleDeclaration's own prototype chain yields every
// CSS property the browser actually supports, as camelCase accessors (a
// well-known, zero-maintenance trick) — filtered to real settable string
// properties (excludes methods, `length`, `parentRule`) and the legacy
// `cssFloat` alias (plain `float` is already in the list).
export function getAllCssProperties() {
  if (cachedProperties) return cachedProperties
  const style = document.createElement('div').style
  const props = new Set()
  for (const key in style) {
    if (typeof style[key] !== 'string') continue
    if (key === 'cssText' || key === 'cssFloat') continue
    props.add(toKebabCase(key))
  }
  cachedProperties = Array.from(props).sort()
  return cachedProperties
}

// A curated set of the keyword values Chrome's own Styles pane suggests for
// the properties most commonly hand-edited in this repo's prototypes — not
// exhaustive (there's no live browser API for "valid keyword values of
// property X"), just the practical common cases.
export const CSS_VALUE_KEYWORDS = {
  display: ['block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid', 'none', 'contents', 'table', 'table-cell', 'table-row'],
  position: ['static', 'relative', 'absolute', 'fixed', 'sticky'],
  overflow: ['visible', 'hidden', 'scroll', 'auto', 'clip'],
  'overflow-x': ['visible', 'hidden', 'scroll', 'auto', 'clip'],
  'overflow-y': ['visible', 'hidden', 'scroll', 'auto', 'clip'],
  'text-align': ['left', 'right', 'center', 'justify', 'start', 'end'],
  'font-weight': ['normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
  'font-style': ['normal', 'italic', 'oblique'],
  'text-decoration': ['none', 'underline', 'overline', 'line-through'],
  'text-decoration-line': ['none', 'underline', 'overline', 'line-through'],
  'text-transform': ['none', 'capitalize', 'uppercase', 'lowercase'],
  'white-space': ['normal', 'nowrap', 'pre', 'pre-wrap', 'pre-line', 'break-spaces'],
  'box-sizing': ['content-box', 'border-box'],
  visibility: ['visible', 'hidden', 'collapse'],
  float: ['left', 'right', 'none', 'inline-start', 'inline-end'],
  clear: ['left', 'right', 'both', 'none'],
  cursor: ['auto', 'default', 'pointer', 'text', 'move', 'not-allowed', 'grab', 'grabbing', 'help', 'wait', 'crosshair', 'zoom-in', 'zoom-out', 'ns-resize', 'ew-resize'],
  'flex-direction': ['row', 'row-reverse', 'column', 'column-reverse'],
  'flex-wrap': ['nowrap', 'wrap', 'wrap-reverse'],
  'align-items': ['flex-start', 'flex-end', 'center', 'stretch', 'baseline', 'normal', 'start', 'end'],
  'align-content': ['flex-start', 'flex-end', 'center', 'stretch', 'space-between', 'space-around', 'normal'],
  'align-self': ['auto', 'flex-start', 'flex-end', 'center', 'stretch', 'baseline'],
  'justify-content': ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly', 'start', 'end'],
  'justify-items': ['start', 'end', 'center', 'stretch'],
  'vertical-align': ['baseline', 'top', 'middle', 'bottom', 'text-top', 'text-bottom', 'sub', 'super'],
  resize: ['none', 'both', 'horizontal', 'vertical'],
  'pointer-events': ['auto', 'none'],
  'user-select': ['auto', 'none', 'text', 'all'],
  'background-repeat': ['repeat', 'no-repeat', 'repeat-x', 'repeat-y', 'space', 'round'],
  'background-size': ['auto', 'cover', 'contain'],
  'background-position': ['center', 'top', 'bottom', 'left', 'right'],
  'border-style': ['none', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'],
  'list-style-type': ['none', 'disc', 'circle', 'square', 'decimal'],
  'object-fit': ['fill', 'contain', 'cover', 'none', 'scale-down'],
  'word-break': ['normal', 'break-all', 'keep-all', 'break-word'],
  'text-overflow': ['clip', 'ellipsis'],
  width: ['auto', 'fit-content', 'max-content', 'min-content'],
  height: ['auto', 'fit-content', 'max-content', 'min-content'],
  margin: ['auto', '0'],
  padding: ['0'],
  top: ['auto', '0'],
  left: ['auto', '0'],
  right: ['auto', '0'],
  bottom: ['auto', '0'],
}

export const GLOBAL_VALUE_KEYWORDS = ['inherit', 'initial', 'unset', 'revert']

// Custom properties (`--token`) are worth surfacing on their own — this
// repo's whole design system (Styles/colors.css) is built on them, and
// suggesting `var(--brand-purple-6-purple-4)` while editing a colour is far
// more useful than a plain colour keyword here. Scanning `document.
// styleSheets` mirrors the same technique this file's own `findMatchingRules`
// (in DevEdit.jsx) already uses elsewhere in this repo.
export function getCssVariableNames() {
  const names = new Set()
  for (const sheet of document.styleSheets) {
    let rules
    try { rules = sheet.cssRules } catch { continue }
    if (!rules) continue
    for (const rule of rules) {
      if (!rule.style) continue
      for (let i = 0; i < rule.style.length; i++) {
        const prop = rule.style[i]
        if (prop.startsWith('--')) names.add(prop)
      }
    }
  }
  return Array.from(names).sort()
}

const COLORISH_PROPERTIES = /color|background|border|outline|fill|stroke|shadow/
const MAX_SUGGESTIONS = 8

function sortByRelevance(options, query) {
  const q = query.toLowerCase()
  return [...options].sort((a, b) => {
    const aPrefix = a.startsWith(q) ? 0 : 1
    const bPrefix = b.startsWith(q) ? 0 : 1
    if (aPrefix !== bPrefix) return aPrefix - bPrefix
    return a.localeCompare(b)
  })
}

// Determines whether the caret sits in "property name" or "value" position
// within the single (possibly multi-line) declarations block that's the
// entire textarea's content, and returns what to show plus exactly which
// substring a chosen suggestion should replace. Returns null when there's
// nothing worth suggesting (e.g. an empty property query — showing all 700+
// properties unfiltered would be noise, not help).
export function getSuggestions(text, caretIndex) {
  const declStart = text.lastIndexOf(';', caretIndex - 1) + 1
  const segment = text.slice(declStart, caretIndex)
  const colonIdx = segment.indexOf(':')

  if (colonIdx === -1) {
    const leading = segment.match(/^\s*/)[0].length
    const query = segment.slice(leading)
    if (query.length === 0 || !/^[a-zA-Z-]*$/.test(query)) return null
    const options = sortByRelevance(
      getAllCssProperties().filter(p => p.includes(query.toLowerCase())),
      query
    ).slice(0, MAX_SUGGESTIONS)
    if (options.length === 0) return null
    return { kind: 'property', options, replaceStart: declStart + leading, replaceEnd: caretIndex }
  }

  const propertyName = segment.slice(0, colonIdx).trim().toLowerCase()
  const valueSegment = segment.slice(colonIdx + 1)
  const valueStart = declStart + colonIdx + 1

  // Mid-var(...) — suggest just the variable name, replacing only what's
  // been typed of it so far (not the whole value), and close the paren for
  // the caller so a completed var() is always syntactically valid.
  const varMatch = valueSegment.match(/var\(\s*(--[\w-]*)?$/i)
  if (varMatch) {
    const varQuery = (varMatch[1] || '').toLowerCase()
    const options = getCssVariableNames().filter(v => v.toLowerCase().includes(varQuery)).slice(0, MAX_SUGGESTIONS)
    if (options.length === 0) return null
    return {
      kind: 'variable',
      options: options.map(v => `${v})`),
      replaceStart: caretIndex - (varMatch[1] || '').length,
      replaceEnd: caretIndex,
    }
  }

  const leading = valueSegment.match(/^\s*/)[0].length
  const query = valueSegment.slice(leading)
  if (/[;:]/.test(query)) return null
  const keywordOptions = CSS_VALUE_KEYWORDS[propertyName] || []
  const variableOptions = COLORISH_PROPERTIES.test(propertyName)
    ? getCssVariableNames().map(v => `var(${v})`)
    : []
  const combined = [...keywordOptions, ...variableOptions, ...GLOBAL_VALUE_KEYWORDS]
  const q = query.toLowerCase()
  const options = sortByRelevance(combined.filter(v => v.toLowerCase().includes(q)), q).slice(0, MAX_SUGGESTIONS)
  if (options.length === 0) return null
  return { kind: 'value', options, replaceStart: valueStart + leading, replaceEnd: caretIndex }
}

// ─── Caret pixel position (for anchoring the dropdown) ─────────────────
// Classic mirror-div technique: render the text-before-caret into an
// invisible clone of the textarea's own box/font metrics, then read where a
// marker span lands. `textOverride` lets a caller measure a position that
// hasn't been committed to the DOM yet (e.g. right after inserting a
// suggestion, before React's next render has updated the real textarea).
const MIRROR_PROPERTIES = [
  'boxSizing', 'width', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
  'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'letterSpacing', 'lineHeight', 'tabSize',
]

export function getCaretCoordinates(textarea, caretIndex, textOverride) {
  const text = textOverride ?? textarea.value
  const computed = window.getComputedStyle(textarea)
  const div = document.createElement('div')
  MIRROR_PROPERTIES.forEach((p) => { div.style[p] = computed[p] })
  div.style.position = 'absolute'
  div.style.visibility = 'hidden'
  div.style.whiteSpace = 'pre-wrap'
  div.style.wordWrap = 'break-word'
  div.style.top = '0'
  div.style.left = '0'
  document.body.appendChild(div)

  div.textContent = text.slice(0, caretIndex)
  const marker = document.createElement('span')
  marker.textContent = '.'
  div.appendChild(marker)

  const rect = textarea.getBoundingClientRect()
  const lineHeight = parseFloat(computed.lineHeight) || parseFloat(computed.fontSize) * 1.4
  const top = rect.top + marker.offsetTop - textarea.scrollTop + lineHeight
  const left = rect.left + marker.offsetLeft - textarea.scrollLeft

  document.body.removeChild(div)
  return { top, left }
}
