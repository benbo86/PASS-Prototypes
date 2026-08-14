import { writeFile, mkdir, access } from 'fs/promises'
import { resolve, sep } from 'path'
import { bakeIfChanged } from './iconLibraryPlugin.js'

// Backs the "Upload icon" buttons on the generated PASS Mobile Icons
// specimen page (research/mobile-icons/index.html — see
// iconSpecimenTemplate.js's `enableUpload` option). Dev-server only, via
// configureServer — same reasoning as devEditPlugin.js/wireframePlugin.js:
// Vite only calls this for `vite dev`/`vite serve`, never a production
// build, so this endpoint simply doesn't exist on the deployed site
// (confirmed with Ben: a shared/deployed-site version is a bigger, separate
// ask for later — this is dev-only for now, matching how Wireframe's own
// local save started before it later grew a Firestore-backed shared save).
//
// Deliberately a SEPARATE file from iconLibraryPlugin.js, which documents
// its own "no HTTP endpoint at all" design stance for the read/bake side —
// that stance is about the SERVING path never diverging between dev and
// prod. Writing a brand-new source file doesn't touch that: once written,
// the file is read back through the exact same scanIconsFolder path any
// hand-added Icons/*.svg file already goes through, in dev or a later prod
// build alike — there's no second, upload-only read path to diverge.

const ROOT = resolve(process.cwd())
const ICONS_DIR = resolve(ROOT, 'Icons')
const UPLOADS_DIR = resolve(ICONS_DIR, 'Mobile Uploads')

// Filesystem-unsafe characters stripped from both the section and icon
// name — mirrors wireframePlugin.js's assertSafePath (strip path
// separators) plus the handful of other characters most filesystems
// reject outright, since both values become real directory/file names.
function sanitizeSegment(value) {
  return String(value).replace(/[\\/:*?"<>|]/g, '').trim()
}

function assertSafePath(section, name) {
  const safeSection = sanitizeSegment(section)
  const safeName = sanitizeSegment(name)
  if (!safeSection) throw new Error('Section name is required.')
  if (!safeName) throw new Error('Icon name is required.')
  const dir = resolve(UPLOADS_DIR, safeSection)
  const filePath = resolve(dir, `${safeName}.svg`)
  if (!dir.startsWith(UPLOADS_DIR + sep) || !filePath.startsWith(dir + sep)) {
    throw new Error('Refusing to write outside the Mobile Uploads directory.')
  }
  return { dir, filePath }
}

// Mirrors scanIconsFolder's own normalization in iconLibraryPlugin.js, so
// an uploaded file is never treated differently than a hand-added one once
// it's on disk: strip BOM/XML-prolog/leading-comment, reject anything with
// a <script> tag (the pass-genius.svg class of file — a logo, not an icon).
function normalizeSvg(raw) {
  if (/<script\b/i.test(raw)) {
    throw new Error('This file contains a <script> tag and can’t be used as an icon.')
  }
  const cleaned = raw.replace(/^﻿/, '').replace(/^\s*<\?xml[^>]*\?>\s*/i, '').replace(/^\s*<!--[\s\S]*?-->\s*/, '').trim()
  if (!/<svg\b/i.test(cleaned)) {
    throw new Error('That doesn’t look like a valid SVG file.')
  }
  // The Icon Swap pipeline (Components/iconSwap.js's recolorToCurrentColor)
  // only ever rewrites a LITERAL fill/stroke to currentColor — it can't
  // invent a colour that isn't there. `fill="none"` and `fill="currentColor"`
  // both already count as "something to work with" (nothing to inject for
  // either). Only when NO fill/stroke attribute appears anywhere — e.g. the
  // file relies on the browser's implicit default black by omission — do we
  // inject the same fill="#000000" every other committed Icons/*.svg uses
  // as its own static reference colour, so it behaves identically from here on.
  const hasColorAttr = /\b(fill|stroke)\s*=\s*"[^"]*"/i.test(cleaned)
  if (hasColorAttr) return cleaned
  return cleaned.replace(/<svg\b/i, '<svg fill="#000000"')
}

export default function iconUploadPlugin() {
  return {
    name: 'icon-upload',
    configureServer(server) {
      server.middlewares.use('/__icon-library/upload', (req, res) => {
        handleJsonPost(req, res, async (body) => {
          const { section, name, svg } = JSON.parse(body)
          if (typeof svg !== 'string' || !svg.trim()) throw new Error('No file content received.')
          const { dir, filePath } = assertSafePath(section, name)
          const exists = await access(filePath).then(() => true).catch(() => false)
          if (exists) throw new Error('An icon with this name already exists in this section — pick a different name.')
          const cleaned = normalizeSvg(svg)
          await mkdir(dir, { recursive: true })
          await writeFile(filePath, cleaned, 'utf-8')
          await bakeIfChanged()
          return { ok: true }
        })
      })
    },
  }
}

function handleJsonPost(req, res, handler) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end()
    return
  }
  let body = ''
  req.on('data', chunk => { body += chunk })
  req.on('end', async () => {
    try {
      const result = await handler(body)
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(result))
    } catch (err) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ ok: false, error: err.message }))
    }
  })
}
