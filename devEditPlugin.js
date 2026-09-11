import { readFile, writeFile } from 'fs/promises'
import { resolve, sep } from 'path'
import postcss from 'postcss'

// Backs the Dev Edit toolbar feature (Components/DevEdit.jsx) — a dev-only
// element-style editor. Only registered via configureServer, which Vite
// only calls for `vite dev`/`vite serve` — never for a production build —
// so these endpoints (and the filesystem access they perform) simply don't
// exist outside a local dev session.
//
// Two endpoints, both POST:
//  - /__dev-edit/lookup: given the rule(s) the client found via the live
//    CSSOM, read each one's declarations back out of its *source file*
//    (not the browser's CSSStyleRule.style.cssText) and return them as
//    originally authored. This matters because cssText re-serializes from
//    the parsed computed style object — e.g. a hand-written `border: none`
//    comes back out as four expanded longhand properties. Editing that
//    version and writing it back would permanently expand every untouched
//    shorthand in a rule the moment any one property in it was edited.
//    Postcss, by contrast, never expands anything it wasn't asked to —
//    reading through it preserves exactly what's in the file.
//  - /__dev-edit/apply: write edited declarations back into the same
//    rule in its source file. An edit marked `create: true` (a brand-new
//    rule with no existing match, see Components/DevEdit.jsx's
//    handleAddRule) appends a new rule instead of erroring when nothing is
//    found; any edit whose declarations end up empty removes the rule
//    from the file entirely, rather than leaving an empty `{}` behind.
export default function devEditPlugin() {
  return {
    name: 'dev-edit-apply',
    configureServer(server) {
      server.middlewares.use('/__dev-edit/lookup', (req, res) => {
        handleJsonPost(req, res, async (body) => {
          const { rules } = JSON.parse(body)
          const results = await Promise.all(rules.map(lookupDeclarations))
          return { ok: true, results }
        })
      })

      server.middlewares.use('/__dev-edit/apply', (req, res) => {
        handleJsonPost(req, res, async (body) => {
          const { edits } = JSON.parse(body)
          for (const edit of edits) await applyEdit(edit)
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

// Selectors serialize slightly differently between what the browser reports
// (CSSStyleRule.selectorText, whitespace-normalized) and how a grouped
// selector is actually formatted in a source file (e.g. split across lines
// for readability, as several rules in this repo's own CSS are) — collapse
// both to the same whitespace-insensitive form before comparing.
function normalizeSelector(sel) {
  return sel.replace(/\s+/g, ' ').replace(/\s*,\s*/g, ', ').trim()
}

function assertSafePath(filePath) {
  const projectRoot = resolve(process.cwd())
  const resolvedPath = resolve(filePath)
  if (!resolvedPath.startsWith(projectRoot + sep)) {
    throw new Error('Refusing to access a path outside the project root')
  }
  if (!resolvedPath.endsWith('.css')) {
    throw new Error('Refusing to access a non-.css file')
  }
  return resolvedPath
}

async function findRule(resolvedPath, selector, mediaText) {
  const css = await readFile(resolvedPath, 'utf-8')
  const root = postcss.parse(css)

  const wantSelector = normalizeSelector(selector)
  const wantMedia = mediaText ? mediaText.replace(/\s+/g, ' ').trim() : null

  let target = null
  root.walkRules(rule => {
    if (target) return
    if (normalizeSelector(rule.selector) !== wantSelector) return
    const parentMedia = rule.parent?.type === 'atrule' && rule.parent.name === 'media'
      ? rule.parent.params.replace(/\s+/g, ' ').trim()
      : null
    if (parentMedia !== wantMedia) return
    target = rule
  })

  if (!target) {
    throw new Error(`Could not find rule "${selector}" in ${resolvedPath}`)
  }
  return { root, target }
}

async function lookupDeclarations({ filePath, selector, mediaText }) {
  try {
    const resolvedPath = assertSafePath(filePath)
    const { target } = await findRule(resolvedPath, selector, mediaText)
    const declarations = target.nodes
      .filter(n => n.type === 'decl')
      .map(d => `${d.prop}: ${d.value}${d.important ? ' !important' : ''};`)
      .join('\n')
    return { filePath, selector, mediaText, declarations, found: true }
  } catch (err) {
    return { filePath, selector, mediaText, declarations: '', found: false, error: err.message }
  }
}

// Appends a brand-new rule (optionally inside a new @media block) to the
// end of the file — used only when `create: true` was explicitly passed
// AND no existing rule was found (see applyEdit below). Never invoked for
// a normal edit-existing-rule request, so a selector genuinely expected to
// already exist still fails loudly if it's somehow missing, rather than
// silently creating a duplicate.
function appendRule(root, selector, mediaText, declarations) {
  const rule = postcss.rule({ selector, raws: { before: '\n\n', between: ' ' } })
  const declRoot = postcss.parse(`a{${declarations}}`)
  declRoot.first.nodes.forEach(decl => {
    const clone = decl.clone()
    clone.raws.before = '\n  '
    rule.append(clone)
  })
  rule.raws.after = '\n'
  if (mediaText) {
    const atRule = postcss.atRule({ name: 'media', params: mediaText, raws: { before: '\n\n', between: ' ', after: '\n' } })
    rule.raws.before = '\n  '
    atRule.append(rule)
    root.append(atRule)
  } else {
    root.append(rule)
  }
}

// Declarations arrive empty in exactly two cases: Reset/Discard reverting
// a brand-new rule (see Components/DevEdit.jsx's revertFileWrites — a new
// rule's `original` is always '', since it never existed before this
// session) back past its only-ever-applied state, or a normal edit whose
// textarea was cleared out entirely. Either way, a rule with zero
// declarations serves no purpose sitting in the file — removing it
// outright (rather than leaving `.foo {\n}` behind) is what actually makes
// "revert a new rule" a clean no-trace undo instead of a cosmetic stain.
async function applyEdit({ filePath, selector, mediaText, declarations, create }) {
  const resolvedPath = assertSafePath(filePath)
  const isEmpty = !declarations || !declarations.trim()

  let found
  try {
    found = await findRule(resolvedPath, selector, mediaText)
  } catch (err) {
    if (!create) throw err
    found = null
  }

  if (!found) {
    if (isEmpty) return // nothing to create, nothing to remove
    const css = await readFile(resolvedPath, 'utf-8')
    const root = postcss.parse(css)
    appendRule(root, selector, mediaText, declarations)
    await writeFile(resolvedPath, root.toString(), 'utf-8')
    return
  }

  const { root, target } = found

  if (isEmpty) {
    target.remove()
    await writeFile(resolvedPath, root.toString(), 'utf-8')
    return
  }

  // Preserve the rule's original indentation/formatting rather than
  // letting every declaration fall back to whatever raws a throwaway
  // `postcss.parse('a{...}')` wrapper happens to produce (no leading
  // newline/indent at all) — without this, editing even one property in
  // an otherwise untouched, nicely-indented rule would flatten the whole
  // thing onto ragged, un-indented lines.
  const originalDecls = target.nodes.filter(n => n.type === 'decl')
  const fallbackBefore = originalDecls[0]?.raws.before ?? '\n    '
  const closingAfter = target.raws.after ?? '\n'

  // Re-parse the edited declaration block on its own so postcss gives us
  // clean Declaration nodes to swap in, rather than hand-splitting on
  // semicolons/colons ourselves (fragile with values like url(...), quoted
  // strings, or shorthand with commas).
  const declRoot = postcss.parse(`a{${declarations}}`)
  const newDecls = declRoot.first.nodes

  target.removeAll()
  newDecls.forEach(decl => {
    const clone = decl.clone()
    // A property that already existed keeps its own original indent
    // (matters if, say, the file mixed tabs/spaces); a newly added one
    // just inherits whatever the rule's other declarations use.
    const matching = originalDecls.find(d => d.prop === decl.prop)
    clone.raws.before = matching ? matching.raws.before : fallbackBefore
    target.append(clone)
  })
  target.raws.after = closingAfter

  await writeFile(resolvedPath, root.toString(), 'utf-8')
}
