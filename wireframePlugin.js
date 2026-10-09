import { readFile, writeFile, readdir, mkdir, unlink } from 'fs/promises'
import { resolve, sep } from 'path'

// Backs the Wireframe tool (tools/wireframe/). Dev-server only, via
// configureServer — Vite only calls this for `vite dev`/`vite serve`, never
// a production build, so these endpoints simply don't exist on the
// deployed site. Wireframes themselves live in Firestore (the only copy
// the tool lists or opens); every save made while running locally is also
// mirrored here as wireframes/<name>.json, a silent backup Claude can read
// straight off disk. One backup per shared wireframe, matched by
// firestoreId.
const WIREFRAMES_DIR = resolve(process.cwd(), 'wireframes')
// Pasted/dropped images, one file per imageId (e.g. img_12_345.webp). The
// wireframe JSON only references them by imageId; saving them as real
// files means they can be opened and viewed directly, not just read as
// encoded data.
const IMAGES_DIR = resolve(WIREFRAMES_DIR, 'images')
const IMAGE_EXT = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png' }

export default function wireframePlugin() {
  return {
    name: 'wireframe-tool',
    configureServer(server) {
      server.middlewares.use('/__wireframe/save', (req, res) => {
        handleJsonPost(req, res, async (body) => {
          const { fileName, name, elements, images, authorName, firestoreId } = JSON.parse(body)
          const resolvedPath = assertSafePath(fileName)
          await mkdir(WIREFRAMES_DIR, { recursive: true })
          await writeImages(images)
          // A rename changes the file name, so drop any older backup of the
          // same shared wireframe rather than leaving a stale duplicate.
          for (const old of await backupsFor(firestoreId)) {
            if (old !== resolvedPath) await unlink(old)
          }
          // updatedAt lets the client merge local saves into one
          // chronological list alongside Firestore's own updatedAt —
          // previously this file had no timestamp of any kind. authorName
          // is best-effort (whatever the client currently has stored via
          // Components/authorIdentity.js) — local saves aren't gated behind
          // sign-in the way cloud saves are, so this can be empty if no
          // name has ever been entered on this machine yet.
          // firestoreId ties this backup to its shared wireframe, so a
          // rename or delete can find it again.
          await writeFile(resolvedPath, JSON.stringify({
            version: 1, name, elements, authorName: authorName || null, updatedAt: new Date().toISOString(),
            firestoreId: firestoreId || null,
          }, null, 2), 'utf-8')
          return { ok: true, fileName }
        })
      })

      server.middlewares.use('/__wireframe/delete', (req, res) => {
        handleJsonPost(req, res, async (body) => {
          // Called after a shared wireframe is deleted: removes its backup(s)
          // and any images no remaining backup uses.
          const { firestoreId } = JSON.parse(body)
          const backups = await backupsFor(firestoreId)
          for (const file of backups) await unlink(file)
          const removedImages = await removeUnusedImages()
          return { ok: true, removed: backups.length, removedImages }
        })
      })
    },
  }
}

// Writes each { imageId: dataUrl } that isn't already on disk. An imageId's
// content never changes, so an existing file is always current.
async function writeImages(images) {
  const entries = Object.entries(images || {})
  if (entries.length === 0) return
  await mkdir(IMAGES_DIR, { recursive: true })
  const existing = new Set(await readdir(IMAGES_DIR))
  for (const [imageId, dataUrl] of entries) {
    const match = /^data:(image\/[a-z+]+);base64,(.+)$/.exec(String(dataUrl))
    if (!match) continue
    const fileName = `${safeImageId(imageId)}.${IMAGE_EXT[match[1]] || 'img'}`
    if (existing.has(fileName)) continue
    await writeFile(resolve(IMAGES_DIR, fileName), Buffer.from(match[2], 'base64'))
  }
}

// Deletes every image file no remaining wireframe references. Run after a
// wireframe is deleted; checks all files (not just the deleted one's
// images) because an image can be copied into more than one wireframe,
// and so leftovers from earlier deletes get cleaned up too. Images are
// only ever written by a save, so an unreferenced file is always an orphan.
async function removeUnusedImages() {
  let imageFiles
  try { imageFiles = await readdir(IMAGES_DIR) } catch { return [] }
  const used = new Set()
  for (const f of (await readdir(WIREFRAMES_DIR)).filter((f) => f.endsWith('.json'))) {
    try {
      const data = JSON.parse(await readFile(resolve(WIREFRAMES_DIR, f), 'utf-8'))
      ;(data.elements || []).forEach((el) => { if (el.type === 'image' && el.imageId) used.add(safeImageId(el.imageId)) })
    } catch {
      // An unreadable wireframe file can't prove its images unused, so
      // keep everything rather than risk deleting something it needs.
      return []
    }
  }
  const removed = []
  for (const file of imageFiles) {
    const id = file.slice(0, file.lastIndexOf('.'))
    if (used.has(id)) continue
    await unlink(resolve(IMAGES_DIR, file))
    removed.push(file)
  }
  return removed
}

// Paths of every backup file belonging to one shared wireframe.
async function backupsFor(firestoreId) {
  if (!firestoreId) return []
  let entries
  try { entries = await readdir(WIREFRAMES_DIR) } catch { return [] }
  const matches = []
  for (const f of entries.filter((f) => f.endsWith('.json'))) {
    const filePath = resolve(WIREFRAMES_DIR, f)
    try {
      if (JSON.parse(await readFile(filePath, 'utf-8')).firestoreId === firestoreId) matches.push(filePath)
    } catch {
      // Unreadable file: not ours to touch.
    }
  }
  return matches
}

function safeImageId(imageId) {
  return String(imageId).replace(/[^a-zA-Z0-9_-]/g, '')
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

// Scoped tighter than devEditPlugin.js's own assertSafePath — this plugin
// only ever needs to touch one specific directory (not "any file of a
// given extension anywhere in the repo"), so it builds the path from a
// bare fileName rather than accepting an arbitrary path from the client.
function assertSafePath(fileName) {
  const safeName = String(fileName).replace(/[\\/]/g, '')
  const resolvedPath = resolve(WIREFRAMES_DIR, `${safeName}.json`)
  if (!resolvedPath.startsWith(WIREFRAMES_DIR + sep)) {
    throw new Error('Refusing to access a path outside the wireframes directory')
  }
  return resolvedPath
}
