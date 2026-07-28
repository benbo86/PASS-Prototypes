import { readFile, writeFile, readdir, mkdir } from 'fs/promises'
import { resolve, sep, join, extname } from 'path'
import { existsSync } from 'fs'

// Backs the Audit toolbar tool (Components/AuditCapture.jsx) — a dev-only
// "capture this screen" button. Unlike Dev Edit/Wireframe's endpoints,
// this one doesn't make any decisions of its own about what's wrong with a
// prototype — an LLM does that, later, in conversation. The endpoint's only
// job is to bundle enough raw material (the prototype's own source files,
// plus a snapshot of what's actually rendered right now) into one file
// under audit-captures/ (gitignored — these are one-off working files, not
// something the team needs in version control) so that handoff is a single
// "read this file" rather than a multi-step manual gather.
//
// Only registered via configureServer, which Vite only calls for
// `vite dev`/`vite serve` — never a production build — matching every
// other dev-only endpoint in this repo.
const AUDIT_DIR = resolve(process.cwd(), 'audit-captures')
const SOURCE_EXTENSIONS = new Set(['.jsx', '.js', '.css', '.html'])
const SKIP_DIRS = new Set(['node_modules', '.git'])

const REVIEWER_PREAMBLE = `<!--
This is a raw capture for an audit review — not itself the review.
When reviewing this file, question the logic rather than checking it against
style rules: for each element/handler below, ask what it actually does or
means, and flag anything that looks unfinished, unreachable, hardcoded where
it looks like it should be dynamic, or not fully defined (e.g. a button with
no real effect, a state that's never reachable, a TODO, an edge case with no
visible handling).
-->
`

export default function auditPlugin() {
  return {
    name: 'audit-capture',
    configureServer(server) {
      server.middlewares.use('/__audit/capture', (req, res) => {
        handleJsonPost(req, res, async (body) => {
          const { pathname, search, domSnapshot } = JSON.parse(body)
          const base = server.config.base || '/'
          const relativePath = stripBase(pathname, base)
          const segments = relativePath.split('/').filter(Boolean)
          if (segments.length < 2) {
            throw new Error(`Could not resolve a prototype folder from "${pathname}"`)
          }
          const [location, prototypeName] = segments
          const protoDir = assertSafeDir(resolve(process.cwd(), location, prototypeName))
          if (!existsSync(protoDir)) {
            throw new Error(`No such prototype folder: ${location}/${prototypeName}`)
          }

          const sourceFiles = await collectSourceFiles(protoDir, `${location}/${prototypeName}`)
          const timestamp = new Date().toISOString()
          const fileSlug = `${location}--${prototypeName}${search ? '--' + sanitizeSearch(search) : ''}`
          const stamp = timestamp.replace(/[:.]/g, '-')
          const outName = `${fileSlug}--${stamp}.md`

          const parts = [
            REVIEWER_PREAMBLE,
            `# Audit capture — ${relativePath}${search || ''}`,
            `Captured: ${timestamp}`,
            '',
            '## Rendered DOM snapshot',
            '```html',
            domSnapshot || '(no container ref available)',
            '```',
            '',
            ...sourceFiles.flatMap(f => [
              `## Source: ${f.relPath}`,
              '```' + (f.lang || ''),
              f.content,
              '```',
              '',
            ]),
          ]

          await mkdir(AUDIT_DIR, { recursive: true })
          const outPath = resolve(AUDIT_DIR, outName)
          await writeFile(outPath, parts.join('\n'), 'utf-8')

          return { ok: true, file: `audit-captures/${outName}` }
        })
      })
    },
  }
}

function stripBase(pathname, base) {
  const normalizedBase = base.endsWith('/') ? base : base + '/'
  if (pathname.startsWith(normalizedBase)) {
    return pathname.slice(normalizedBase.length)
  }
  return pathname.replace(/^\//, '')
}

function sanitizeSearch(search) {
  return search.replace(/^\?/, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function assertSafeDir(dirPath) {
  const projectRoot = resolve(process.cwd())
  const resolvedPath = resolve(dirPath)
  if (!resolvedPath.startsWith(projectRoot + sep)) {
    throw new Error('Refusing to access a path outside the project root')
  }
  return resolvedPath
}

async function collectSourceFiles(dir, relBase) {
  const out = []
  async function walk(currentDir, relDir) {
    const entries = await readdir(currentDir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue
        await walk(join(currentDir, entry.name), `${relDir}/${entry.name}`)
      } else {
        const ext = extname(entry.name)
        if (!SOURCE_EXTENSIONS.has(ext)) continue
        const fullPath = join(currentDir, entry.name)
        const content = await readFile(fullPath, 'utf-8')
        out.push({
          relPath: `${relDir}/${entry.name}`,
          content,
          lang: ext === '.jsx' ? 'jsx' : ext === '.js' ? 'js' : ext === '.css' ? 'css' : 'html',
        })
      }
    }
  }
  await walk(dir, relBase)
  out.sort((a, b) => a.relPath.localeCompare(b.relPath))
  return out
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
