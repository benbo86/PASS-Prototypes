import { readFile, writeFile, readdir, mkdir, stat, unlink } from 'fs/promises'
import { resolve, sep } from 'path'

// Backs the Wireframe tool (tools/wireframe/). Dev-server only, via
// configureServer — Vite only calls this for `vite dev`/`vite serve`, never
// a production build, so these endpoints simply don't exist on the
// deployed site. Saves/lists/loads one JSON file per wireframe under
// wireframes/ at the repo root.
const WIREFRAMES_DIR = resolve(process.cwd(), 'wireframes')

export default function wireframePlugin() {
  return {
    name: 'wireframe-tool',
    configureServer(server) {
      server.middlewares.use('/__wireframe/save', (req, res) => {
        handleJsonPost(req, res, async (body) => {
          const { fileName, name, elements, authorName, firestoreId, cloudUnlinked } = JSON.parse(body)
          const resolvedPath = assertSafePath(fileName)
          await mkdir(WIREFRAMES_DIR, { recursive: true })
          // updatedAt lets the client merge local saves into one
          // chronological list alongside Firestore's own updatedAt —
          // previously this file had no timestamp of any kind. authorName
          // is best-effort (whatever the client currently has stored via
          // Components/authorIdentity.js) — local saves aren't gated behind
          // sign-in the way cloud saves are, so this can be empty if no
          // name has ever been entered on this machine yet.
          // firestoreId/cloudUnlinked let a local file remember its own
          // cloud-save relationship across reloads — without persisting
          // these, reopening a local file always looked cloud-unlinked
          // (App.jsx's own client-side state resets on every load), so the
          // very next save silently created a brand-new cloud doc under the
          // same name, effectively "undeleting" one the user had removed
          // from the live site.
          await writeFile(resolvedPath, JSON.stringify({
            version: 1, name, elements, authorName: authorName || null, updatedAt: new Date().toISOString(),
            firestoreId: firestoreId || null, cloudUnlinked: !!cloudUnlinked,
          }, null, 2), 'utf-8')
          return { ok: true, fileName }
        })
      })

      server.middlewares.use('/__wireframe/list', (req, res) => {
        handleJsonPost(req, res, async () => {
          let entries
          try {
            entries = await readdir(WIREFRAMES_DIR)
          } catch {
            return { ok: true, files: [] } // no wireframes saved yet — normal, not an error
          }
          const jsonFiles = entries.filter(f => f.endsWith('.json'))
          const files = await Promise.all(jsonFiles.map(async (f) => {
            const fileName = f.slice(0, -'.json'.length)
            const filePath = resolve(WIREFRAMES_DIR, f)
            try {
              const raw = await readFile(filePath, 'utf-8')
              const data = JSON.parse(raw)
              // Falls back to the file's own mtime for any file saved
              // before updatedAt existed — no migration needed, and this
              // is still a genuine "last modified" timestamp either way.
              const updatedAt = data.updatedAt || (await stat(filePath)).mtime.toISOString()
              return { fileName, name: data.name || fileName, authorName: data.authorName || null, updatedAt }
            } catch {
              return { fileName, name: fileName, authorName: null, updatedAt: null }
            }
          }))
          return { ok: true, files }
        })
      })

      server.middlewares.use('/__wireframe/load', (req, res) => {
        handleJsonPost(req, res, async (body) => {
          const { fileName } = JSON.parse(body)
          const resolvedPath = assertSafePath(fileName)
          const raw = await readFile(resolvedPath, 'utf-8')
          return { ok: true, data: JSON.parse(raw) }
        })
      })

      server.middlewares.use('/__wireframe/delete', (req, res) => {
        handleJsonPost(req, res, async (body) => {
          const { fileName } = JSON.parse(body)
          const resolvedPath = assertSafePath(fileName)
          await unlink(resolvedPath)
          return { ok: true, fileName }
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
