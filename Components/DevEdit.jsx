import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, getDocs, serverTimestamp,
} from 'firebase/firestore'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { announceState, subscribeToState } from './devToolbarBus'
import { getStoredAuthor, storeAuthor } from './authorIdentity'
import { auth, db } from './firebase'

// One shared Firebase Auth account gates who can save/revert a version —
// not per-person credentials. This email is never shown to anyone; it must
// match whatever account was created in the Firebase console (see
// CLAUDE.md's Dev Edit section). The "password" handed to the design team
// is that account's password.
const SHARED_EMAIL = 'designteam@pass-prototypes.internal'

const PenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
)

const HistoryIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </svg>
)

// ─── CSSOM helpers ────────────────────────────────────────────────
// Vite's dev server injects each imported stylesheet as its own <style> tag
// carrying data-vite-dev-id (the absolute source file path on disk) — see
// devEditPlugin.js for the write-back side of this. This attribute does not
// exist in a production build (Vite bundles CSS into hashed files there,
// no per-rule mapping at all) — filePath comes back null for every rule in
// that case, which is fine: it's only needed for the dev-only "Apply to
// file" action, never for the shared/versioned live-override path below,
// which matches purely by selector text.
function getFilePath(sheet) {
  const ownerNode = sheet && sheet.ownerNode
  return ownerNode && ownerNode.getAttribute ? ownerNode.getAttribute('data-vite-dev-id') : null
}

function normalizeSelectorText(sel) {
  return sel.replace(/\s+/g, ' ').replace(/\s*,\s*/g, ', ').trim()
}

function ruleKey(selectorText, mediaText) {
  return `${normalizeSelectorText(selectorText)}|${mediaText ? normalizeSelectorText(mediaText) : ''}`
}

// Finds every live CSS rule matching a clicked element, regardless of
// whether it has a resolvable source file — used when selecting an element
// to edit. `filePath` is null wherever "Apply to file" wouldn't be
// possible anyway (production, or a rule from a non-Vite-injected sheet).
function findMatchingRules(el) {
  const found = []

  function collect(ruleList, mediaText, sheet) {
    for (const rule of Array.from(ruleList)) {
      if (rule.type === CSSRule.MEDIA_RULE) {
        collect(rule.cssRules, rule.media.mediaText, sheet)
      } else if (rule.type === CSSRule.STYLE_RULE) {
        let matches = false
        try { matches = el.matches(rule.selectorText) } catch { /* unsupported/invalid selector for .matches() */ }
        if (matches) {
          found.push({ rule, selectorText: rule.selectorText, mediaText: mediaText || null, filePath: getFilePath(sheet) })
        }
      }
    }
  }

  for (const sheet of Array.from(document.styleSheets)) {
    let rules
    try { rules = sheet.cssRules } catch { continue } // cross-origin sheet, not expected in this repo
    if (rules) collect(rules, null, sheet)
  }

  // Later-declared rules tend to win ties in the cascade — show those
  // first, closest to how browser DevTools orders its matched-rules list.
  return found.reverse()
}

// Finds live rule(s) matching a *stored* selector (not tied to any element
// on screen) — used to apply a saved/active version's overrides, and to
// preview a past version. Works identically in dev and production, since
// it never touches filePath.
function findRulesForSelector(selectorText, mediaText) {
  const wantKey = ruleKey(selectorText, mediaText)
  const found = []

  function collect(ruleList, currentMediaText) {
    for (const rule of Array.from(ruleList)) {
      if (rule.type === CSSRule.MEDIA_RULE) {
        collect(rule.cssRules, rule.media.mediaText)
      } else if (rule.type === CSSRule.STYLE_RULE) {
        if (ruleKey(rule.selectorText, currentMediaText || null) === wantKey) found.push(rule)
      }
    }
  }

  for (const sheet of Array.from(document.styleSheets)) {
    let rules
    try { rules = sheet.cssRules } catch { continue }
    if (rules) collect(rules, null)
  }
  return found
}

function applyOverridesLive(overrides) {
  overrides.forEach(o => {
    findRulesForSelector(o.selector, o.mediaText).forEach(rule => { rule.style.cssText = o.declarations })
  })
}

function formatDeclarations(cssText) {
  return cssText
    .split(';')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => s + ';')
    .join('\n')
}

function toMillis(value) {
  if (!value) return 0
  if (typeof value.toMillis === 'function') return value.toMillis()
  if (value instanceof Date) return value.getTime()
  return 0
}

function fmtTime(value) {
  const d = value?.toDate ? value.toDate() : value instanceof Date ? value : null
  if (!d) return ''
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

async function upsertActiveVersion(prototypeId, versionId, versionName, overrides) {
  const q = query(collection(db, 'devedit_active'), where('prototypeId', '==', prototypeId))
  const snap = await getDocs(q)
  const payload = { prototypeId, versionId, versionName, overrides, updatedAt: serverTimestamp() }
  if (snap.empty) {
    await addDoc(collection(db, 'devedit_active'), payload)
  } else {
    await updateDoc(snap.docs[0].ref, payload)
  }
}

// ─── Panel positioning ──────────────────────────────────────────────
// Sits beside the selected element (right of it, flipping left if that
// would run off the viewport edge) rather than a fixed page corner — same
// idea as Dev Comments' thread panel, adapted for an element's rect
// instead of a click point.
const PANEL_WIDTH = 340
const PANEL_MARGIN = 12

function computeEditPanelPosition(rect) {
  let left = rect.right + 16
  if (left + PANEL_WIDTH + PANEL_MARGIN > window.innerWidth) {
    left = rect.left - PANEL_WIDTH - 16
  }
  left = Math.max(PANEL_MARGIN, Math.min(left, window.innerWidth - PANEL_WIDTH - PANEL_MARGIN))
  const top = Math.max(PANEL_MARGIN, Math.min(rect.top, window.innerHeight - PANEL_MARGIN - 60))
  return { left, top }
}

function toBoxStyle(rect) {
  return { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
}

function classNameOf(el) {
  // SVG elements expose className as an SVGAnimatedString, not a plain
  // string — guard rather than assume every element matches HTMLElement's
  // shape.
  return typeof el.className === 'string' ? el.className : (el.className?.baseVal || '')
}

// ─── Dev Edit ────────────────────────────────────────────────────────
// Toggleable live style editor. Two independent capabilities layered on
// the same select-an-element-and-edit-its-CSS mechanic:
//  - Apply to file (dev-only, unchanged from the original build): writes
//    one rule's edit straight into its real source .css file via
//    devEditPlugin.js's dev-server-only endpoint. Never touches Firestore.
//  - Save as version (requires signing in with the one shared password):
//    edits across as many elements as you like accumulate in a session,
//    then "Save as version" bundles all of them into a named Firestore
//    snapshot and makes it the prototype's active version — which every
//    visitor's page then applies live, authenticated or not, dev or prod.
// Always mounted (not gated behind import.meta.env.DEV) — the always-on
// "apply the active version" effect below has to run for every visitor.
export default function DevEdit({ containerRef, prototypeId }) {
  const [active, setActive] = useState(false)
  const [hoveredEl, setHoveredEl] = useState(null)
  const [hoverRect, setHoverRect] = useState(null)
  const [selection, setSelection] = useState(null) // { el, rect, keys: [] } — data itself lives in sessionEdits
  const [error, setError] = useState(null)

  // ── Auth + identity gate ──
  const [authUser, setAuthUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [authorName, setAuthorName] = useState(getStoredAuthor)
  const [gateStep, setGateStep] = useState(null) // null | 'password' | 'name'
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState(null)
  const [signingIn, setSigningIn] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const isAuthed = !!authUser

  useEffect(() => {
    return onAuthStateChanged(auth, user => { setAuthUser(user); setAuthReady(true) })
  }, [])

  // ── Session-accumulated edits ──
  // Keyed by selector+mediaText (ruleKey), not by element — so re-selecting
  // an already-edited element shows the same in-progress draft instead of
  // resetting it, and switching to a *different* element no longer reverts
  // whatever was left un-saved on the last one. `rule` is the live CSSOM
  // object; mutating its .style.cssText is what makes every matching
  // element update in realtime, and is what carries an edit forward across
  // selection changes without any extra plumbing.
  const [sessionEdits, setSessionEdits] = useState({})
  const sessionEditsRef = useRef(sessionEdits)
  sessionEditsRef.current = sessionEdits

  const selectionRef = useRef(null)
  selectionRef.current = selection

  const editedEntries = useCallback(() => Object.values(sessionEditsRef.current).filter(e => e.draft !== e.original), [])

  const discardSession = useCallback(() => {
    Object.values(sessionEditsRef.current).forEach(entry => { entry.rule.style.cssText = entry.original })
    setSessionEdits({})
    setSelection(null)
  }, [])

  // ── Always-on: apply whatever version is currently active for this
  // prototype, for *every* visitor — signed in or not, dev or production.
  // This is the entire point of the shared/versioned mode: a saved version
  // shows up for anyone looking at the page, without them doing anything.
  const [activeOverrides, setActiveOverrides] = useState(null) // {versionId, versionName, overrides} | null
  const activeOverridesRef = useRef(null)
  activeOverridesRef.current = activeOverrides

  useEffect(() => {
    const q = query(collection(db, 'devedit_active'), where('prototypeId', '==', prototypeId))
    const unsub = onSnapshot(q, snapshot => {
      setActiveOverrides(snapshot.empty ? null : (() => {
        const data = snapshot.docs[0].data()
        return { versionId: data.versionId, versionName: data.versionName, overrides: data.overrides || [] }
      })())
    }, err => console.error('Dev Edit: active-version subscription failed', err))
    return unsub
  }, [prototypeId])

  useEffect(() => {
    if (!activeOverrides) return
    // Don't stomp a rule the user is actively mid-editing right now.
    applyOverridesLive(activeOverrides.overrides.filter(o => !sessionEditsRef.current[ruleKey(o.selector, o.mediaText)]))
  }, [activeOverrides])

  const toggleActive = useCallback(() => {
    if (active) {
      setActive(false)
      setSelection(null)
      setHoveredEl(null)
      return
    }
    if (!authReady) return // ignore clicks before Firebase has restored any persisted session
    if (!isAuthed) { setGateStep('password'); return }
    if (!authorName.trim()) { setGateStep('name'); return }
    setActive(true)
  }, [active, authReady, isAuthed, authorName])

  const submitPassword = async () => {
    if (!passwordInput || signingIn) return
    setSigningIn(true)
    setPasswordError(null)
    try {
      await signInWithEmailAndPassword(auth, SHARED_EMAIL, passwordInput)
      setPasswordInput('')
      if (authorName.trim()) {
        setGateStep(null)
        setActive(true)
      } else {
        setGateStep('name')
      }
    } catch {
      setPasswordError('Incorrect password')
    } finally {
      setSigningIn(false)
    }
  }

  const submitName = () => {
    const trimmed = nameInput.trim()
    if (!trimmed) return
    storeAuthor(trimmed)
    setAuthorName(trimmed)
    setGateStep(null)
    setActive(true)
  }

  const handleSignOut = async () => {
    discardSession()
    setActive(false)
    setShowHistory(false)
    await signOut(auth)
  }

  // Announce our own state changes as an effect, not inside the updater
  // above — see the matching comment in DevMode.jsx/DevComments.jsx for
  // why (a synchronous event dispatch from inside a setState updater,
  // where a listener elsewhere calls a *different* component's setState,
  // is the "Cannot update a component while rendering a different
  // component" React warning).
  useEffect(() => {
    announceState('devedit', active)
  }, [active])

  // ── Mutual exclusivity with Dev Mode / Dev Comments ──
  // Turning off via another tool activating does NOT discard the session —
  // edits stay live-previewed and resumable, same as manually toggling off.
  useEffect(() => {
    return subscribeToState((feature, otherActive) => {
      if (feature !== 'devedit' && otherActive && active) {
        setActive(false)
        setSelection(null)
        setHoveredEl(null)
      }
    })
  }, [active])

  // ── Capture-phase hover + click interception (mirrors Dev Mode's own
  // pattern) — intercepts before the real app's handlers fire, so
  // selecting an element to edit never triggers real navigation/clicks. ──
  useEffect(() => {
    if (!active) return
    const container = containerRef.current
    if (!container) return

    // Exempt all three toolbar features' own chrome, not just this one —
    // same two-way (now three-way) rule Dev Mode/Dev Comments already
    // follow, or activating this tool would swallow clicks meant for the
    // other toggles/panels.
    const isOtherUi = (target) => target.closest && target.closest('[data-devedit-ui], [data-devmode-ui], [data-devcomments-ui]')
    const isRecognized = (target) =>
      container.contains(target) ||
      (target.closest && target.closest('.react-datepicker-popper, .fd-wrap'))

    const handleMove = (e) => {
      if (isOtherUi(e.target)) return
      const target = isRecognized(e.target) ? e.target : null
      setHoveredEl(prev => {
        if (target === prev) return prev
        setHoverRect(target ? target.getBoundingClientRect() : null)
        return target
      })
    }

    const handleLeave = () => { setHoveredEl(null); setHoverRect(null) }

    const handleSuppress = (e) => {
      if (isOtherUi(e.target)) return
      e.preventDefault()
      e.stopPropagation()
    }

    const handleClick = (e) => {
      if (isOtherUi(e.target)) return
      e.preventDefault()
      e.stopPropagation()
      const target = e.target
      if (!isRecognized(target)) return
      if (selectionRef.current && selectionRef.current.el === target) return // already open on this element

      const rawMatches = findMatchingRules(target)
      const keys = []
      const newEntries = {}
      const toLookup = []

      rawMatches.forEach(m => {
        const key = ruleKey(m.selectorText, m.mediaText)
        keys.push(key)
        if (sessionEditsRef.current[key] || newEntries[key]) return // already tracked from a prior selection — keep its draft as-is
        const original = formatDeclarations(m.rule.style.cssText)
        newEntries[key] = { rule: m.rule, selectorText: m.selectorText, mediaText: m.mediaText, filePath: m.filePath, original, draft: original, loading: true }
        toLookup.push({ key, filePath: m.filePath, selector: m.selectorText, mediaText: m.mediaText })
      })

      if (Object.keys(newEntries).length > 0) {
        setSessionEdits(prev => ({ ...prev, ...newEntries }))
      }
      setSelection({ el: target, rect: target.getBoundingClientRect(), keys })
      setError(null)

      if (toLookup.length === 0) return

      // Reads each rule's declarations straight out of its source file via
      // devEditPlugin.js's postcss-backed endpoint — preserves authored
      // shorthand (e.g. `border: none`) instead of the browser's own
      // longhand-expanded serialization. Dev-only: in production this
      // fetch simply fails (no such route on a static host), caught below,
      // leaving the browser-serialized placeholder in place — perfectly
      // fine there, since nothing gets written back to a file anyway.
      fetch('/__dev-edit/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules: toLookup.map(({ filePath, selector, mediaText }) => ({ filePath, selector, mediaText })) }),
      })
        .then(res => res.json())
        .then(data => {
          if (!data.ok) return
          setSessionEdits(prev => {
            const next = { ...prev }
            toLookup.forEach((item, i) => {
              const entry = next[item.key]
              const result = data.results[i]
              if (!entry) return
              if (!result || !result.found) { next[item.key] = { ...entry, loading: false }; return }
              const untouched = entry.draft === entry.original
              next[item.key] = {
                ...entry,
                original: result.declarations,
                draft: untouched ? result.declarations : entry.draft,
                loading: false,
              }
            })
            return next
          })
        })
        .catch(() => {
          setSessionEdits(prev => {
            const next = { ...prev }
            toLookup.forEach(item => { if (next[item.key]) next[item.key] = { ...next[item.key], loading: false } })
            return next
          })
        })
    }

    document.addEventListener('mousemove', handleMove, true)
    document.addEventListener('mouseleave', handleLeave, true)
    document.addEventListener('pointerdown', handleSuppress, true)
    document.addEventListener('mousedown', handleSuppress, true)
    document.addEventListener('click', handleClick, true)
    return () => {
      document.removeEventListener('mousemove', handleMove, true)
      document.removeEventListener('mouseleave', handleLeave, true)
      document.removeEventListener('pointerdown', handleSuppress, true)
      document.removeEventListener('mousedown', handleSuppress, true)
      document.removeEventListener('click', handleClick, true)
    }
  }, [active, containerRef])

  // ── Escape: close whatever's open, then exit on a further press ──
  // Never reverts anything by itself — discarding the session is now an
  // explicit, separate action, not something a stray Escape should do.
  const [showHistory, setShowHistory] = useState(false)
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key !== 'Escape') return
      if (selectionRef.current) { setSelection(null); return }
      if (showHistory) { setShowHistory(false); return }
      if (active) setActive(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [active, showHistory])

  // ── Keep the selected element's highlight/panel glued to it across
  // scroll/layout changes, and clean up if it gets removed from the DOM
  // (e.g. a list row that unmounts) while still selected. ──
  useEffect(() => {
    if (!selection) return
    let rafId
    const tick = () => {
      const el = selectionRef.current?.el
      if (!el || !el.isConnected) { setSelection(null); return }
      setSelection(sel => (sel ? { ...sel, rect: el.getBoundingClientRect() } : sel))
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [selection?.el])

  // Live preview: mutate the actual CSSOM rule directly here (a normal
  // event handler), not inside the setState updater below — keeps the
  // updater pure, matching the lesson from DevMode/DevComments' own
  // announceState fix.
  const updateDraft = (key, value) => {
    const entry = sessionEditsRef.current[key]
    if (!entry) return
    entry.rule.style.cssText = value
    setSessionEdits(prev => ({ ...prev, [key]: { ...prev[key], draft: value } }))
  }

  // ── Apply to file: dev-only, unchanged in behavior from the original
  // build — writes one rule's edit straight into its source .css file. ──
  const [applyingKey, setApplyingKey] = useState(null)
  const handleApplyToFile = async (key) => {
    const entry = sessionEditsRef.current[key]
    if (!entry || !entry.filePath) return
    setApplyingKey(key)
    setError(null)
    try {
      const res = await fetch('/__dev-edit/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ edits: [{ filePath: entry.filePath, selector: entry.selectorText, mediaText: entry.mediaText, declarations: entry.draft }] }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || 'Failed to apply')
      setSessionEdits(prev => ({ ...prev, [key]: { ...prev[key], original: prev[key].draft } }))
    } catch (err) {
      setError(err.message)
    } finally {
      setApplyingKey(null)
    }
  }

  // ── Save as version ──
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [versionNameInput, setVersionNameInput] = useState('')
  const [saving, setSaving] = useState(false)

  const openSaveDialog = () => {
    if (editedEntries().length === 0) return
    setShowSaveDialog(true)
  }

  const submitSaveVersion = async () => {
    const name = versionNameInput.trim()
    const edited = editedEntries()
    if (!name || saving || edited.length === 0) return
    setSaving(true)
    setError(null)
    try {
      const overrides = edited.map(e => ({ selector: e.selectorText, mediaText: e.mediaText || null, declarations: e.draft, filePath: e.filePath || null }))
      const versionRef = await addDoc(collection(db, 'devedit_versions'), {
        prototypeId, name, authorName, createdAt: serverTimestamp(), overrides,
      })
      await upsertActiveVersion(prototypeId, versionRef.id, name, overrides)
      // The session's edits are now the committed/active state — reset
      // each edited entry's baseline to its own draft, so further edits
      // diff against this new committed point rather than the pre-session
      // original (which would otherwise make an already-saved rule look
      // "changed" forever).
      setSessionEdits(prev => {
        const next = { ...prev }
        edited.forEach(e => {
          const key = ruleKey(e.selectorText, e.mediaText)
          if (next[key]) next[key] = { ...next[key], original: next[key].draft }
        })
        return next
      })
      setShowSaveDialog(false)
      setVersionNameInput('')
    } catch (err) {
      console.error('Dev Edit: failed to save version', err)
      setError('Failed to save version')
    } finally {
      setSaving(false)
    }
  }

  // ── Version history ──
  const [versions, setVersions] = useState([])
  const [previewVersionId, setPreviewVersionId] = useState(null)

  useEffect(() => {
    if (!showHistory) return
    const q = query(collection(db, 'devedit_versions'), where('prototypeId', '==', prototypeId))
    const unsub = onSnapshot(q, snapshot => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      docs.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt))
      setVersions(docs)
    }, err => console.error('Dev Edit: version history subscription failed', err))
    return unsub
  }, [showHistory, prototypeId])

  const previewVersion = (version) => {
    if (editedEntries().length > 0 && !window.confirm('Discard your unsaved edits to preview a past version?')) return
    if (editedEntries().length > 0) discardSession()
    applyOverridesLive(version.overrides)
    setPreviewVersionId(version.id)
  }

  const stopPreview = () => {
    if (activeOverridesRef.current) applyOverridesLive(activeOverridesRef.current.overrides)
    setPreviewVersionId(null)
  }

  const revertToVersion = async (version) => {
    await upsertActiveVersion(prototypeId, version.id, version.name, version.overrides)
    setPreviewVersionId(null)
  }

  const showHoverHighlight = hoverRect && (!selection || hoveredEl !== selection.el)
  const rows = selection ? selection.keys.map(k => sessionEdits[k]).filter(Boolean) : []
  const dirtyCount = editedEntries().length

  return (
    <>
      <button
        className={`devedit-toggle${active ? ' active' : ''}`}
        onClick={toggleActive}
        data-devedit-ui="true"
        aria-label={active ? 'Exit Dev Edit' : 'Dev Edit'}
      >
        <PenIcon />
      </button>

      {gateStep && createPortal(
        <AuthGate
          step={gateStep}
          password={passwordInput}
          setPassword={setPasswordInput}
          passwordError={passwordError}
          signingIn={signingIn}
          onSubmitPassword={submitPassword}
          name={nameInput}
          setName={setNameInput}
          onSubmitName={submitName}
          onClose={() => setGateStep(null)}
        />,
        document.body
      )}

      {active && createPortal(
        <div data-devedit-ui="true">
          {showHoverHighlight && (
            <div className="devedit-highlight devedit-highlight-hover" style={toBoxStyle(hoverRect)} />
          )}

          {selection && (
            <>
              <div className="devedit-highlight devedit-highlight-selected" style={toBoxStyle(selection.rect)} />
              <EditPanel
                selection={selection}
                rows={rows}
                onDraftChange={updateDraft}
                onApplyToFile={handleApplyToFile}
                applyingKey={applyingKey}
                onClose={() => setSelection(null)}
                error={error}
              />
            </>
          )}

          <SessionBar
            dirtyCount={dirtyCount}
            onSave={openSaveDialog}
            onDiscard={discardSession}
            onToggleHistory={() => setShowHistory(h => !h)}
            historyOpen={showHistory}
            authorName={authorName}
            onSignOut={handleSignOut}
            previewing={!!previewVersionId}
            onStopPreview={stopPreview}
          />

          {showSaveDialog && (
            <SaveVersionDialog
              name={versionNameInput}
              setName={setVersionNameInput}
              onSubmit={submitSaveVersion}
              onCancel={() => setShowSaveDialog(false)}
              saving={saving}
            />
          )}

          {showHistory && (
            <VersionHistoryPanel
              versions={versions}
              activeVersionId={activeOverrides?.versionId}
              previewVersionId={previewVersionId}
              onPreview={previewVersion}
              onRevert={revertToVersion}
              onClose={() => { setShowHistory(false); if (previewVersionId) stopPreview() }}
            />
          )}
        </div>,
        document.body
      )}
    </>
  )
}

// ─── Password / name gate ────────────────────────────────────────────

function AuthGate({ step, password, setPassword, passwordError, signingIn, onSubmitPassword, name, setName, onSubmitName, onClose }) {
  return (
    <div className="devedit-gate-overlay" data-devedit-ui="true" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="devedit-gate-box">
        {step === 'password' ? (
          <>
            <div className="devedit-gate-title">Enter edit password</div>
            <input
              className="devedit-gate-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') onSubmitPassword() }}
              autoFocus
            />
            {passwordError && <div className="devedit-error">{passwordError}</div>}
            <div className="devedit-gate-actions">
              <button className="devedit-btn-secondary" onClick={onClose}>Cancel</button>
              <button className="devedit-btn-primary" onClick={onSubmitPassword} disabled={!password || signingIn}>
                {signingIn ? 'Checking…' : 'Unlock'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="devedit-gate-title">What's your name?</div>
            <input
              className="devedit-gate-input"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') onSubmitName() }}
              autoFocus
            />
            <div className="devedit-gate-actions">
              <button className="devedit-btn-secondary" onClick={onClose}>Cancel</button>
              <button className="devedit-btn-primary" onClick={onSubmitName} disabled={!name.trim()}>Continue</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Session bar ──────────────────────────────────────────────────
// Fixed bottom-right while active — the one persistent place to save or
// discard the current session and reach version history, independent of
// whether any element is currently selected.

function SessionBar({ dirtyCount, onSave, onDiscard, onToggleHistory, historyOpen, authorName, onSignOut, previewing, onStopPreview }) {
  return (
    <div className="devedit-session-bar" data-devedit-ui="true">
      {previewing && (
        <span className="devedit-session-previewing">
          Previewing a past version
          <button className="devedit-link-btn" onClick={onStopPreview}>Stop</button>
        </span>
      )}
      {dirtyCount > 0 && <span className="devedit-session-count">{dirtyCount} unsaved edit{dirtyCount === 1 ? '' : 's'}</span>}
      {dirtyCount > 0 && <button className="devedit-btn-secondary" onClick={onDiscard}>Discard</button>}
      {dirtyCount > 0 && <button className="devedit-btn-primary" onClick={onSave}>Save as version</button>}
      <button className={`devedit-btn-secondary${historyOpen ? ' active' : ''}`} onClick={onToggleHistory}>
        <HistoryIcon /> History
      </button>
      <span className="devedit-session-identity">
        {authorName}
        <button className="devedit-link-btn" onClick={onSignOut}>Sign out</button>
      </span>
    </div>
  )
}

function SaveVersionDialog({ name, setName, onSubmit, onCancel, saving }) {
  return (
    <div className="devedit-gate-overlay" data-devedit-ui="true" onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="devedit-gate-box">
        <div className="devedit-gate-title">Save as version</div>
        <input
          className="devedit-gate-input"
          placeholder="Version name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') onSubmit() }}
          autoFocus
        />
        <div className="devedit-gate-actions">
          <button className="devedit-btn-secondary" onClick={onCancel} disabled={saving}>Cancel</button>
          <button className="devedit-btn-primary" onClick={onSubmit} disabled={!name.trim() || saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Version history panel ───────────────────────────────────────────

function VersionHistoryPanel({ versions, activeVersionId, previewVersionId, onPreview, onRevert, onClose }) {
  return (
    <div className="devedit-history-panel" data-devedit-ui="true">
      <div className="devedit-panel-header">
        <div className="devedit-panel-title">Version history</div>
        <button className="devedit-panel-close" onClick={onClose} aria-label="Close version history">×</button>
      </div>
      <div className="devedit-panel-body">
        {versions.length === 0 && <div className="devedit-panel-empty">No versions saved yet for this page.</div>}
        {versions.map(v => (
          <div key={v.id} className={`devedit-version-row${v.id === activeVersionId ? ' active' : ''}${v.id === previewVersionId ? ' previewing' : ''}`}>
            <div className="devedit-version-info">
              <div className="devedit-version-name">
                {v.name}
                {v.id === activeVersionId && <span className="devedit-version-badge">active</span>}
              </div>
              <div className="devedit-version-meta">{v.authorName} · {fmtTime(v.createdAt)}</div>
            </div>
            <div className="devedit-version-actions">
              <button className="devedit-btn-secondary" onClick={() => onPreview(v)}>Preview</button>
              {v.id !== activeVersionId && (
                <button className="devedit-btn-primary" onClick={() => onRevert(v)}>Revert to this</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Edit panel (per selected element) ───────────────────────────────

function EditPanel({ selection, rows, onDraftChange, onApplyToFile, applyingKey, onClose, error }) {
  const pos = computeEditPanelPosition(selection.rect)
  const cls = classNameOf(selection.el).trim()
  const tagLabel = selection.el.tagName.toLowerCase() + (cls ? '.' + cls.split(/\s+/).join('.') : '')

  return (
    <div className="devedit-panel" data-devedit-ui="true" style={{ left: pos.left, top: pos.top }}>
      <div className="devedit-panel-header">
        <div className="devedit-panel-title">Edit styles</div>
        <span className="devedit-panel-tag">{tagLabel}</span>
        <button className="devedit-panel-close" onClick={onClose} aria-label="Close">×</button>
      </div>
      <div className="devedit-panel-body">
        {rows.length === 0 && (
          <div className="devedit-panel-empty">No editable stylesheet rule matches this element.</div>
        )}

        {rows.map((m, i) => {
          const key = ruleKey(m.selectorText, m.mediaText)
          return (
            <div className="devedit-rule-block" key={key}>
              <div className="devedit-rule-selector">
                {m.selectorText}
                {m.mediaText && <span className="devedit-rule-media">@media {m.mediaText}</span>}
                {m.loading && <span className="devedit-rule-loading">loading…</span>}
              </div>
              <textarea
                className="devedit-rule-textarea"
                value={m.draft}
                onChange={e => onDraftChange(key, e.target.value)}
                rows={Math.max(3, m.draft.split('\n').length)}
                spellCheck={false}
                disabled={m.loading}
              />
              {import.meta.env.DEV && m.filePath && (
                <div className="devedit-rule-actions">
                  <button
                    className="devedit-btn-secondary"
                    onClick={() => onApplyToFile(key)}
                    disabled={m.loading || m.draft === m.original || applyingKey === key}
                  >
                    {applyingKey === key ? 'Applying…' : 'Apply to file'}
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {error && <div className="devedit-error">{error}</div>}
      </div>
    </div>
  )
}
