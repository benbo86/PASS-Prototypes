import { readFile, writeFile, readdir, mkdir } from 'fs/promises'
import { resolve, extname, basename } from 'path'
import { renderSpecimenPage } from './iconSpecimenTemplate.js'

// Backs the "swap an icon" feature's Icon Library picker (Components/
// IconSwapPanel.jsx via Components/iconLibrary.js), AND the two standalone
// specimen galleries linked from the root index.html ("PASS Mobile Icons",
// "PASS Icons"). Unlike devEditPlugin.js/wireframePlugin.js, this plugin
// exposes NO HTTP endpoint at all — it only ever writes files (two JSON
// bakes under public/, two generated index.html pages under research/),
// which Vite/git ship unchanged. A dev-only endpoint would create a code
// path production can never exercise, which is exactly the kind of
// dev/prod divergence this repo has hit real bugs from before (see
// CLAUDE.md's Dev Edit history) — baking committed, static output means a
// deployed visitor's Icon Library and both specimen pages show the same
// set as a local dev session, bounded only by "as of the last commit,"
// matching how wireframes/*.json already works (a real, git-tracked file,
// just generated here instead of hand-saved).
//
// Two categories, not one flat list (Ben: "we should show all icons across
// all prototypes rather than 'on this page'... separate sections for
// legacy icons, mobile icons... We can call all others PASS Icons"):
// "mobile" = inline icon defs from mobile/** prototypes + the shared
// mobile-shell components already documented in the pre-existing
// mobile-icons specimen page (AppNav/AppHeader/StatusBar/AccountScreen);
// "pass" = the Icons/ folder (shared repo-wide, not mobile-specific) plus
// every other inline definition. Legacy Icons (research/legacy-icons/) is
// deliberately NOT part of either bake — it's an icon-FONT specimen
// (Font Awesome/eltico/Glyphicons via @font-face), not real <svg> markup,
// so it has nothing to contribute to a mechanism that only ever swaps one
// <svg> for another (confirmed with Ben: leave it out of the picker).
//
// Runs on buildStart (covers `npm run build` too) and on relevant
// file-watch events during `vite dev`, only rewriting a given output file
// when its actual content differs (ignoring generatedAt) so a dev session
// doesn't dirty git on every restart.
//
// A third mobile source, alongside the folder scan and the inline-def scan
// below: `Icons/Mobile Uploads/<Section>/*.svg`, written by the separate
// iconUploadPlugin.js's dev-only upload endpoint. These are real files
// under Icons/ (scanIconsFolder already walks them) — only the
// mobile-vs-pass classification differs by subfolder; `bakeIfChanged` is
// exported so that plugin can trigger a synchronous rebake right after
// writing a new file, rather than waiting on the debounced file-watcher.

const ROOT = resolve(process.cwd())
const ICONS_DIR = resolve(ROOT, 'Icons')
const MOBILE_JSON_PATH = resolve(ROOT, 'public', 'mobile-icon-library.json')
const PASS_JSON_PATH = resolve(ROOT, 'public', 'pass-icon-library.json')
const MOBILE_HTML_PATH = resolve(ROOT, 'research', 'mobile-icons', 'index.html')
const PASS_HTML_PATH = resolve(ROOT, 'research', 'pass-icons', 'index.html')

const SKIP_DIRS = new Set(['node_modules', 'Styles', 'Icons', 'dist', '.git', '.github', 'wireframes', 'tools', 'public'])
// This tool's own chrome icons (Dev Mode/Edit/Comments/Toolbar/Wireframe
// access/Tooltip/this feature's own panel) aren't product icons — excluded
// by filename so they never pollute either picker.
const SKIP_FILE_RE = /^Dev\w*\.jsx$|^(WireframeToggle|Tooltip|IconSwapPanel)\.jsx$/

// ─── Mobile vs. PASS classification ───────────────────────────────────────
// Matches exactly what the original hand-built mobile-icons page already
// documented as in-scope: the four mobile prototype screens' own App.jsx,
// plus the shared shell components every one of those screens renders
// through. Any other mobile/** file (main.jsx etc. never define icons
// anyway) falls through to a humanized-folder-name default so a future
// mobile file isn't silently dropped if this map goes stale.
const MOBILE_GROUP_LABELS = {
  'mobile/messaging/src/App.jsx': 'Staff Messaging',
  'mobile/mileage-pay/src/App.jsx': 'Mileage Pay',
  'mobile/notifications/src/App.jsx': 'Notification Centre',
  'mobile/account/src/App.jsx': 'Account',
  'Components/AccountScreen.jsx': 'Account',
  'Components/AppNav.jsx': 'Shared mobile shell',
  'Components/AppHeader.jsx': 'Shared mobile shell',
  'Components/StatusBar.jsx': 'Shared mobile shell',
}
// The four real "screens" — used to decide whether an icon shared across
// 2+ of them should move into its own "used across multiple screens"
// cross-section, mirroring the original page's own layout.
const MOBILE_SCREEN_FILES = new Set([
  'mobile/messaging/src/App.jsx',
  'mobile/mileage-pay/src/App.jsx',
  'mobile/notifications/src/App.jsx',
  'mobile/account/src/App.jsx',
])

function classifyInlineFile(relPath) {
  if (MOBILE_GROUP_LABELS[relPath]) return { isMobile: true, group: MOBILE_GROUP_LABELS[relPath] }
  if (relPath.startsWith('mobile/')) {
    const folder = relPath.split('/')[1] || 'mobile'
    const label = folder.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    return { isMobile: true, group: label }
  }
  return { isMobile: false, group: 'Inline' }
}

// FNV-1a 32-bit — same algorithm as Components/iconSwap.js's client-side
// hash, kept as an independent copy (not imported) since this file runs in
// Node against plain strings, not live DOM elements, and the two hashes
// serve different purposes: the client hash is the runtime identity used to
// find/match live page elements, this one is only used to dedupe each
// library's *display* list — it never needs to agree byte-for-byte with a
// browser-computed hash.
function fnv1a(str) {
  let hash = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

// Cheap string-level normalization for dedup purposes only (not a real
// parser) — strips the same class of attributes the client-side
// canonicalizer drops (class/id/style/width/height/xmlns*/data-*/aria-*),
// collapses literal colours, and squashes whitespace between tags.
function canonicalizeForDedup(svgMarkup) {
  return svgMarkup
    .replace(/\s(class|id|style|width|height|xmlns(?::\w+)?|data-[\w-]+|aria-[\w-]+)="[^"]*"/g, '')
    .replace(/(fill|stroke|stop-color|flood-color)="(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|[a-zA-Z]+)"/g, '$1="<color>"')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim()
}

// ─── Source A: Icons/**/*.svg (recursive, depth-capped) — always "pass" ───

async function scanIconsFolder() {
  const results = []
  async function walk(dir, relDir, depth) {
    if (depth > 4) return
    let entries
    try { entries = await readdir(dir, { withFileTypes: true }) } catch { return }
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue
      const full = resolve(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(full, relDir ? `${relDir}/${entry.name}` : entry.name, depth + 1)
      } else if (extname(entry.name).toLowerCase() === '.svg') {
        try {
          const raw = await readFile(full, 'utf-8')
          // A handful of files here are full animated logos (embedded
          // <script>/<style>/<animateTransform>), not swappable UI icons —
          // e.g. Icons/PASS nav/pass-genius.svg. Including one in the
          // library would paste live interactive/script markup into
          // whatever plain icon slot it's applied to. Skip anything that
          // isn't a plain static icon.
          if (/<script\b/i.test(raw)) continue
          const name = basename(entry.name, extname(entry.name))
          // Real bug, caught by actually loading the generated specimen
          // page in a browser (not just checking the bake ran without
          // throwing): 22 Icons/*.svg files carry a leading XML prolog
          // (`<?xml version="1.0"...?>`, left over from a Figma/Sketch
          // export) — valid in a standalone .svg file, but a `<?...?>` is
          // not valid HTML syntax at all, so embedding one inline crashed
          // Vite's own HTML parser the instant a specimen page containing
          // one was requested. Strip it (and any XML comment before the
          // root tag) before ever embedding the markup inline.
          const cleaned = raw.replace(/^﻿/, '').replace(/^\s*<\?xml[^>]*\?>\s*/i, '').replace(/^\s*<!--[\s\S]*?-->\s*/, '')
          // Icons/Mobile Uploads/<Section>/*.svg — uploaded via
          // iconUploadPlugin.js's endpoint, classified as Mobile (by the
          // subfolder name, which IS the section) instead of PASS. Every
          // other Icons/*.svg file stays PASS, grouped by its own relDir.
          const uploadMatch = relDir.match(/^Mobile Uploads\/?(.*)$/)
          results.push({
            name,
            group: uploadMatch ? (uploadMatch[1] || 'Uncategorized') : (relDir || 'Icons'),
            isMobile: !!uploadMatch,
            source: { kind: 'repo-file', ref: `Icons/${relDir ? relDir + '/' : ''}${entry.name}`, name },
            svg: cleaned.trim(),
          })
        } catch { /* unreadable/corrupt file — skip it, don't fail the whole scan */ }
      }
    }
  }
  await walk(ICONS_DIR, '', 0)
  return results
}

// ─── Source B: inline `const XIcon = (...) => (<svg>...</svg>)` defs ─────

const INLINE_ICON_RE = /(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(?:\([^()]*\)|[A-Za-z0-9_$]+)\s*=>\s*\(?\s*(<svg\b[\s\S]*?<\/svg>)/g

const CAMEL_TO_KEBAB = {
  strokeWidth: 'stroke-width', strokeLinecap: 'stroke-linecap', strokeLinejoin: 'stroke-linejoin',
  strokeDasharray: 'stroke-dasharray', strokeMiterlimit: 'stroke-miterlimit',
  fillRule: 'fill-rule', clipRule: 'clip-rule', clipPath: 'clip-path', stopColor: 'stop-color',
  xmlnsXlink: 'xmlns:xlink',
}

function normalizeInlineSvg(raw) {
  let out = raw
    // JSX expression attribute values (width={size}, height={size}, etc.)
    // -> a fixed default; anything else expression-valued gets dropped
    // outright rather than guessed at.
    .replace(/\s(width|height)=\{[^}]*\}/g, '')
    .replace(/\sclassName=\{[^}]*\}|\sclassName="[^"]*"/g, '')
    .replace(/\s([a-zA-Z-]+)=\{([^}]*)\}/g, (match, attr, expr) => {
      // Only accept a plain string-literal expression ({'...'}) — anything
      // else (a variable, ternary, template) is unresolvable statically.
      const strMatch = expr.trim().match(/^['"]([^'"]*)['"]$/)
      return strMatch ? ` ${attr}="${strMatch[1]}"` : ''
    })
  for (const [camel, kebab] of Object.entries(CAMEL_TO_KEBAB)) {
    out = out.replaceAll(`${camel}=`, `${kebab}=`)
  }
  if (!/\swidth=/.test(out)) out = out.replace('<svg', '<svg width="24"')
  if (!/\sheight=/.test(out)) out = out.replace('<svg', '<svg height="24"')
  return out
}

async function scanInlineIcons() {
  const results = []
  async function walk(dir) {
    let entries
    try { entries = await readdir(dir, { withFileTypes: true }) } catch { return }
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue
        await walk(resolve(dir, entry.name))
      } else if (entry.name.endsWith('.jsx') && !SKIP_FILE_RE.test(entry.name)) {
        const full = resolve(dir, entry.name)
        let raw
        try { raw = await readFile(full, 'utf-8') } catch { continue }
        const relPath = full.slice(ROOT.length + 1)
        const { isMobile, group } = classifyInlineFile(relPath)
        for (const match of raw.matchAll(INLINE_ICON_RE)) {
          const [, componentName, svgBlob] = match
          const normalized = normalizeInlineSvg(svgBlob)
          // Reject anything still containing an unresolved JSX expression —
          // this is what correctly excludes icon-font glyph wrappers (e.g.
          // FaIcon's {code}) and any other statically-unresolvable prop.
          if (normalized.includes('{') || normalized.includes('}')) continue
          results.push({
            name: componentName.replace(/Icon$/, '').replace(/([a-z])([A-Z])/g, '$1 $2'),
            group,
            isMobile,
            source: { kind: 'inline', ref: `${relPath}#${componentName}`, name: componentName },
            svg: normalized,
          })
        }
      }
    }
  }
  await walk(ROOT)
  return results
}

// ─── Dedup ─────────────────────────────────────────────────────────────────

function dedupe(candidates) {
  const byHash = new Map()
  for (const c of candidates) {
    const canonical = canonicalizeForDedup(c.svg)
    const hash = fnv1a(canonical)
    const existing = byHash.get(hash)
    if (!existing) {
      byHash.set(hash, { hash, name: c.name, group: c.group, svg: c.svg, sources: [c.source], usageCount: 1 })
    } else {
      existing.usageCount += 1
      existing.sources.push(c.source)
      // Prefer a repo-file's own name/group over an inline one where both
      // exist for the same shape — a real Icons/*.svg filename is a more
      // meaningful label than a JSX component name.
      if (c.source.kind === 'repo-file' && existing.sources[0].kind !== 'repo-file') {
        existing.name = c.name
        existing.group = c.group
        existing.svg = c.svg
      }
    }
  }
  return Array.from(byHash.values()).sort((a, b) => {
    const aRepo = a.sources[0].kind === 'repo-file' ? 0 : 1
    const bRepo = b.sources[0].kind === 'repo-file' ? 0 : 1
    if (aRepo !== bRepo) return aRepo - bRepo
    return b.usageCount - a.usageCount
  })
}

// Icons whose sources span 2+ of the four real mobile screens move out of
// their per-file group into one cross-cutting group — mirrors the original
// hand-built page's own "Used across multiple mobile screens" section
// rather than just always grouping by first-seen file.
function regroupSharedMobileIcons(icons) {
  return icons.map((icon) => {
    const screenFiles = new Set(
      icon.sources.filter((s) => s.kind === 'inline').map((s) => s.ref.split('#')[0]).filter((f) => MOBILE_SCREEN_FILES.has(f))
    )
    if (screenFiles.size >= 2) {
      return { ...icon, group: 'Used across multiple mobile screens', sharedAcross: Array.from(screenFiles) }
    }
    return icon
  })
}

async function buildLibraries() {
  const [fromFiles, fromInline] = await Promise.all([scanIconsFolder(), scanInlineIcons()])
  // Every candidate (file-scanned or inline-scanned) already carries its
  // own isMobile flag — scanIconsFolder sets it per-entry now too (true
  // only for Icons/Mobile Uploads/**), so both sources are split the same
  // way rather than assuming "file-scanned == always PASS."
  const allCandidates = [...fromFiles, ...fromInline]
  const mobileCandidates = allCandidates.filter((c) => c.isMobile)
  const passCandidates = allCandidates.filter((c) => !c.isMobile)
  const mobileIcons = regroupSharedMobileIcons(dedupe(mobileCandidates))
  const passIcons = dedupe(passCandidates)
  return {
    mobile: { version: 1, icons: mobileIcons },
    pass: { version: 1, icons: passIcons },
  }
}

async function writeIfChanged(path, data) {
  let existing = null
  try {
    existing = JSON.parse(await readFile(path, 'utf-8'))
  } catch { /* no existing file, or unreadable — bake fresh */ }
  const existingComparable = existing ? JSON.stringify({ version: existing.version, icons: existing.icons }) : null
  const builtComparable = JSON.stringify({ version: data.version, icons: data.icons })
  if (existingComparable === builtComparable) return false
  await mkdir(resolve(path, '..'), { recursive: true })
  await writeFile(path, JSON.stringify({ ...data, generatedAt: new Date().toISOString() }, null, 2), 'utf-8')
  return true
}

// ─── Specimen-page grouping (shared shape both HTML galleries need) ───────

const MOBILE_GROUP_ORDER = ['Shared mobile shell', 'Used across multiple mobile screens']

function toGroups(icons) {
  const byGroup = new Map()
  for (const icon of icons) {
    if (!byGroup.has(icon.group)) byGroup.set(icon.group, [])
    byGroup.get(icon.group).push({ name: icon.sources[0]?.name || icon.name, svg: icon.svg })
  }
  const groupNames = Array.from(byGroup.keys())
  groupNames.sort((a, b) => {
    const ai = MOBILE_GROUP_ORDER.indexOf(a)
    const bi = MOBILE_GROUP_ORDER.indexOf(b)
    if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    return a.localeCompare(b)
  })
  return groupNames.map((name) => ({
    title: name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'icons',
    icons: byGroup.get(name),
  }))
}

async function generateMobileHtml(mobileIcons) {
  const groups = toGroups(mobileIcons)
  const html = renderSpecimenPage({
    title: 'PASS mobile app icons — full specimen',
    eyebrow: 'PASS mobile app · all prototype screens',
    heading: 'Every icon used across the mobile app prototypes',
    descriptionHtml: 'Every distinct inline SVG icon defined across the mobile app prototypes and the shared mobile shell components (<code>AppNav</code>, <code>AppHeader</code>, <code>StatusBar</code>, <code>AccountScreen</code>). Each preview renders inside a fixed 24&times;24 box regardless of the icon\'s native size, so everything sits consistently in the grid. Click a card to copy its SVG source, use the download icon for a single .svg file, or check any icons and use the tray at the bottom-right to grab several as a .zip. Generated automatically — see iconLibraryPlugin.js.',
    zipPrefix: 'pass-mobile-icons',
    groups,
    enableUpload: true,
  })
  await mkdir(resolve(MOBILE_HTML_PATH, '..'), { recursive: true })
  const existing = await readFile(MOBILE_HTML_PATH, 'utf-8').catch(() => null)
  if (existing === html) return false
  await writeFile(MOBILE_HTML_PATH, html, 'utf-8')
  return true
}

async function generatePassHtml(passIcons) {
  const groups = toGroups(passIcons)
  const html = renderSpecimenPage({
    title: 'PASS icons — full specimen',
    eyebrow: 'PASS design system · every other prototype',
    heading: 'Every icon in the Icons/ folder and every non-mobile inline icon',
    descriptionHtml: 'Every distinct icon from the <code>Icons/</code> folder plus every inline SVG icon defined outside the mobile app prototypes (see <code>PASS Mobile Icons</code> for those). Each preview renders inside a fixed 24&times;24 box regardless of the icon\'s native size, so everything sits consistently in the grid. Click a card to copy its SVG source, use the download icon for a single .svg file, or check any icons and use the tray at the bottom-right to grab several as a .zip. Generated automatically — see iconLibraryPlugin.js.',
    zipPrefix: 'pass-icons',
    groups,
  })
  await mkdir(resolve(PASS_HTML_PATH, '..'), { recursive: true })
  const existing = await readFile(PASS_HTML_PATH, 'utf-8').catch(() => null)
  if (existing === html) return false
  await writeFile(PASS_HTML_PATH, html, 'utf-8')
  return true
}

export async function bakeIfChanged() {
  const { mobile, pass } = await buildLibraries()
  await Promise.all([
    writeIfChanged(MOBILE_JSON_PATH, mobile),
    writeIfChanged(PASS_JSON_PATH, pass),
    generateMobileHtml(mobile.icons),
    generatePassHtml(pass.icons),
  ])
}

function debounce(fn, ms) {
  let timer = null
  return (...args) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

export default function iconLibraryPlugin() {
  return {
    name: 'icon-library',
    async buildStart() {
      await bakeIfChanged()
    },
    configureServer(server) {
      bakeIfChanged()
      const rebake = debounce(() => { bakeIfChanged() }, 2000)
      const relevant = (path) => /\.jsx$/.test(path) || /[/\\]Icons[/\\].*\.svg$/.test(path)
      server.watcher.on('change', (path) => { if (relevant(path)) rebake() })
      server.watcher.on('add', (path) => { if (relevant(path)) rebake() })
      server.watcher.on('unlink', (path) => { if (relevant(path)) rebake() })
    },
  }
}
