// Ancestor trail helpers shared by Dev Edit and Dev Mode — the "select
// parent" breadcrumb and ⌥-click. Both tools hit-test the deepest element
// under the cursor, so anything fully covered by its children (a table, a
// wrapper div) is otherwise unreachable.
//
// The trail never climbs above the prototype's own root (the tool's
// containerRef), so it can't wander into the dev toolbar or <body>. A root
// with `display: contents` has no box of its own, so it's left out.

function isRootBoundary(el, root) {
  return !el || el === document.body || el === document.documentElement || (root && !root.contains(el))
}

function hasOwnBox(el) {
  return getComputedStyle(el).display !== 'contents'
}

// The nearest ancestor of `el` that can be selected, or null at the top.
export function selectableParent(el, root) {
  let p = el?.parentElement
  while (p && !isRootBoundary(p, root)) {
    if (hasOwnBox(p)) return p
    p = p.parentElement
  }
  return null
}

// Outermost → innermost, ending at `leaf`.
export function ancestorTrail(leaf, root) {
  const trail = []
  let el = leaf
  while (el && !isRootBoundary(el, root)) {
    if (el === leaf || hasOwnBox(el)) trail.unshift(el)
    el = el.parentElement
  }
  return trail
}

// "table.data-table", "div#main.page", "td" — tag plus id and first class.
export function elementLabel(el) {
  const tag = el.tagName.toLowerCase()
  const id = el.id ? `#${el.id}` : ''
  const cls = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean)[0]
  return `${tag}${id}${cls ? `.${cls}` : ''}`
}
