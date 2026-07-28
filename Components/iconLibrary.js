// Client-side companion to iconLibraryPlugin.js — fetches/caches the two
// generated-but-committed libraries (public/mobile-icon-library.json,
// public/pass-icon-library.json) and (phase 5) wraps Iconify's public
// search/icon-data API. Components/IconSwapPanel.jsx is the only consumer.
//
// Two libraries, not one flat list, plus no more live "on this page"
// harvesting — Ben: "I think we should show all icons across all
// prototypes rather than 'on this page'... separate sections for legacy
// icons, mobile icons... We can call all others PASS Icons." Legacy Icons
// isn't part of either bake (it's an icon-FONT specimen, not real <svg>
// markup — nothing for a swap-in picker to offer), confirmed with Ben.

let mobilePromise = null
let passPromise = null

function loadLibrary(filename) {
  return fetch(`${import.meta.env.BASE_URL}${filename}`)
    .then((res) => (res.ok ? res.json() : { icons: [] }))
    .then((data) => data.icons || [])
    .catch(() => [])
}

// Cached at module scope (not per-component) — every prototype's own
// DevEdit instance shares one fetch each, and neither ever needs to change
// within a single page session.
export function loadMobileIconLibrary() {
  if (!mobilePromise) mobilePromise = loadLibrary('mobile-icon-library.json')
  return mobilePromise
}

export function loadPassIconLibrary() {
  if (!passPromise) passPromise = loadLibrary('pass-icon-library.json')
  return passPromise
}

// ─── Iconify (phase 5) ──────────────────────────────────────────────────
const ICONIFY_BASE = 'https://api.iconify.design'

export async function searchIconify(query, { signal } = {}) {
  if (!query || !query.trim()) return []
  const res = await fetch(`${ICONIFY_BASE}/search?query=${encodeURIComponent(query.trim())}&limit=64`, { signal })
  if (!res.ok) throw new Error('Iconify search failed')
  const data = await res.json()
  return data.icons || [] // ["mdi:bell", "lucide:bell", ...]
}

// Batches one request per collection prefix, rather than one per icon name.
export async function fetchIconifyIcons(names, { signal } = {}) {
  const byPrefix = new Map()
  for (const full of names) {
    const [prefix, ...rest] = full.split(':')
    const name = rest.join(':')
    if (!byPrefix.has(prefix)) byPrefix.set(prefix, [])
    byPrefix.get(prefix).push(name)
  }
  const results = []
  await Promise.all(Array.from(byPrefix.entries()).map(async ([prefix, names]) => {
    const res = await fetch(`${ICONIFY_BASE}/${prefix}.json?icons=${names.map(encodeURIComponent).join(',')}`, { signal })
    if (!res.ok) return
    const data = await res.json()
    const width = data.width || 24
    const height = data.height || 24
    Object.entries(data.icons || {}).forEach(([name, icon]) => {
      const w = icon.width || width
      const h = icon.height || height
      results.push({
        name: `${prefix}:${name}`,
        source: { kind: 'iconify', ref: `${prefix}:${name}`, name: `${prefix}:${name}` },
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" fill="currentColor">${icon.body}</svg>`,
      })
    })
  }))
  return results
}
