import { readFile, writeFile, readdir, mkdir } from 'fs/promises'
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
          const { fileName, name, elements } = JSON.parse(body)
          const resolvedPath = assertSafePath(fileName)
          await mkdir(WIREFRAMES_DIR, { recursive: true })
          await writeFile(resolvedPath, JSON.stringify({ version: 1, name, elements }, null, 2), 'utf-8')
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
            try {
              const raw = await readFile(resolve(WIREFRAMES_DIR, f), 'utf-8')
              const data = JSON.parse(raw)
              return { fileName, name: data.name || fileName }
            } catch {
              return { fileName, name: fileName }
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
