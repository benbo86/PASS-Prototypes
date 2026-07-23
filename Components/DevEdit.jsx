import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs, serverTimestamp,
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

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
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

// Always re-resolves the live rule(s) for a selector fresh, rather than
// mutating a previously-captured CSSStyleRule reference directly — see the
// comment on buildPristineSnapshot below for why holding onto an old
// reference is actually broken, not just extra-cautious.
function setLiveRuleText(selectorText, mediaText, cssText) {
  findRulesForSelector(selectorText, mediaText).forEach(rule => { rule.style.cssText = cssText })
}

// A pinned pseudo-version, always present in history, representing "no
// overrides at all" — the true base styling as originally shipped, before
// Dev Edit ever touched anything. Not a real Firestore doc (nothing to
// save — it's definitionally always the same), just a sentinel id/name so
// it can flow through the same preview/revert code paths as a real one.
const ORIGINAL_VERSION_ID = '__original__'
const ORIGINAL_VERSION = { id: ORIGINAL_VERSION_ID, name: 'Original', authorName: null, createdAt: null, overrides: [] }

// Re-resolves a rule within one *specific* stylesheet (by its index in
// document.styleSheets), rather than the first match anywhere on the page —
// see buildPristineSnapshot below for why matching by selector text alone
// across the whole page is actively wrong for the pristine-restore path.
function findRuleInSheet(sheetIndex, selectorText, mediaText) {
  const sheet = document.styleSheets[sheetIndex]
  if (!sheet) return null
  let rules
  try { rules = sheet.cssRules } catch { return null }
  if (!rules) return null
  const wantKey = ruleKey(selectorText, mediaText)
  let found = null
  function walk(ruleList, currentMediaText) {
    for (const rule of Array.from(ruleList)) {
      if (found) return
      if (rule.type === CSSRule.MEDIA_RULE) {
        walk(rule.cssRules, rule.media.mediaText)
      } else if (rule.type === CSSRule.STYLE_RULE) {
        if (ruleKey(rule.selectorText, currentMediaText || null) === wantKey) { found = rule; return }
      }
    }
  }
  walk(rules, null)
  return found
}

function setLiveRuleTextInSheet(sheetIndex, selectorText, mediaText, cssText) {
  const rule = findRuleInSheet(sheetIndex, selectorText, mediaText)
  if (rule) rule.style.cssText = cssText
}

// One-time-per-page-load snapshot of every rule's cssText exactly as it
// was before Dev Edit (or any saved version) ever touched it — needed
// because there was otherwise no way to answer "what was this rule before
// any override existed at all," in dev *or* production (the dev-only
// /lookup endpoint reads the source file, but there's no file to read in
// a static production build). Captured via useLayoutEffect at mount, which
// runs synchronously before the always-on active-version effect ever gets
// a chance to apply anything — see the effect below for why the ordering
// matters.
//
// Deliberately stores `selectorText`/`mediaText`, NOT the live
// CSSStyleRule object itself, even though holding the reference directly
// would be cheaper. Real bug found: using the dev-only Apply action writes
// to the actual source .css file, which triggers Vite's HMR to swap in a
// brand-new <style> tag for that file — genuinely new rule objects, while
// the *old* tag (and every rule object captured from it) gets detached
// from the document. Mutating a detached rule's .style.cssText has zero
// visual effect, since the browser no longer renders anything from a
// removed <style> tag — so a snapshot (or session entry, see below) taken
// before that swap silently lost the ability to affect the page at all,
// even though the JS reference itself remained perfectly readable/
// writable. Re-resolving the live rule fresh via findRulesForSelector on
// every use (setLiveRuleText) sidesteps this entirely.
//
// Keyed by `${sheetIndex}::${selector}|${mediaText}`, NOT selector text
// alone — a real, severe bug found live on customer-profile/timeline: this
// repo deliberately gives more than one stylesheet its own `:root { ... }`
// block (colors.css's design-system tokens, legacy.css's separate legacy
// tokens — see CLAUDE.md). Keying purely by selector text collapsed both
// into a single map entry (first-seen-wins, i.e. colors.css's), silently
// dropping legacy.css's own `:root` properties from the snapshot entirely.
// Since Dev Edit is now mounted on every page, the always-on reconciliation
// effect below then found *every* rule matching `:root` anywhere on the
// page and overwrote all of them with that one captured (colors.css-only)
// cssText — permanently wiping legacy.css's tokens (--legacy-status-
// complete etc.) from the live CSSOM on every load, even though the raw
// served file was always correct (which is why it visibly flashed correct
// for an instant on refresh, before this effect ran and clobbered it).
// Including sheetIndex keeps same-selector rules from different files as
// distinct snapshot/restore targets instead of conflating them.
function buildPristineSnapshot() {
  const snapshot = new Map()
  Array.from(document.styleSheets).forEach((sheet, sheetIndex) => {
    let rules
    try { rules = sheet.cssRules } catch { return }
    if (!rules) return
    function collect(ruleList, mediaText) {
      for (const rule of Array.from(ruleList)) {
        if (rule.type === CSSRule.MEDIA_RULE) {
          collect(rule.cssRules, rule.media.mediaText)
        } else if (rule.type === CSSRule.STYLE_RULE) {
          const uniqueKey = `${sheetIndex}::${ruleKey(rule.selectorText, mediaText || null)}`
          if (!snapshot.has(uniqueKey)) {
            snapshot.set(uniqueKey, { sheetIndex, selectorText: rule.selectorText, mediaText: mediaText || null, cssText: rule.style.cssText })
          }
        }
      }
    }
    collect(rules, null)
  })
  return snapshot
}

// Reconciles the live page to *exactly* match `overrides` — restores any
// pristine-known rule not covered by `overrides` back to its true original
// first, then applies each override. This is what makes switching between
// versions (including "Original", whose overrides is always []) correct
// regardless of what was showing before, rather than only ever being able
// to *add* overrides and never take one away. `excludeKeys` skips rules
// the user is actively mid-editing right now, so this never stomps an
// in-progress session edit.
//
// The restore step resolves each pristine entry back within its OWN
// sheet (setLiveRuleTextInSheet) — see buildPristineSnapshot for why that
// matters. The override-*application* step below still matches by selector
// text across every sheet (setLiveRuleText/findRulesForSelector), since a
// saved override doesn't carry sheet identity (only `filePath`, which is a
// local dev filesystem path, meaningless for this in production). In
// practice this is a much smaller residual risk than the restore path was:
// real saved overrides target prototype-specific classes (e.g.
// `.notif-unread-dot`), which only exist in one file, not broadly-shared
// selectors like `:root`.
function applyOverrideSet(overrides, pristineMap, excludeKeys) {
  const newSelKeys = new Set(overrides.map(o => ruleKey(o.selector, o.mediaText)))
  pristineMap.forEach((entry) => {
    const selKey = ruleKey(entry.selectorText, entry.mediaText)
    if (newSelKeys.has(selKey) || (excludeKeys && excludeKeys.has(selKey))) return
    setLiveRuleTextInSheet(entry.sheetIndex, entry.selectorText, entry.mediaText, entry.cssText)
  })
  overrides.forEach(o => {
    const key = ruleKey(o.selector, o.mediaText)
    if (excludeKeys && excludeKeys.has(key)) return
    setLiveRuleText(o.selector, o.mediaText, o.declarations)
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

// ─── Session expiry ──────────────────────────────────────────────────
// Firebase Auth's own session doesn't expire on its own — the SDK
// silently refreshes the underlying ID token forever, so someone stays
// signed in indefinitely unless something else forces a sign-out. This
// tracks "signed in at" ourselves (a plain localStorage timestamp,
// separate from Firebase's own session state) and forces a sign-out once
// a week has passed, so the shared password doesn't grant indefinite
// access from a browser that once had it entered.
const SIGNIN_AT_KEY = 'devedit-signin-at'
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // one week

function getSignInAt() {
  try { const v = localStorage.getItem(SIGNIN_AT_KEY); return v ? Number(v) : null } catch { return null }
}
function setSignInAt(ts) {
  try { localStorage.setItem(SIGNIN_AT_KEY, String(ts)) } catch { /* ignore */ }
}
function clearSignInAt() {
  try { localStorage.removeItem(SIGNIN_AT_KEY) } catch { /* ignore */ }
}
function isSessionExpired() {
  const signInAt = getSignInAt()
  return signInAt !== null && (Date.now() - signInAt) > SESSION_DURATION_MS
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
    return onAuthStateChanged(auth, user => {
      if (user) {
        if (isSessionExpired()) {
          // Week's up — force a real sign-out rather than just hiding the
          // UI, so a stale still-valid Firebase session can't silently
          // keep working if something else in the page checked auth.currentUser
          // directly. signOut() triggers this same callback again with
          // user === null, which the else branch below handles.
          clearSignInAt()
          signOut(auth)
          return
        }
        if (getSignInAt() === null) {
          // Either a brand-new sign-in (submitPassword doesn't set this
          // itself — this covers both that and legacy sessions from
          // before this expiry existed) — start the week's clock now
          // rather than force an immediate, surprising sign-out for
          // someone already using it.
          setSignInAt(Date.now())
        }
      } else {
        clearSignInAt()
      }
      setAuthUser(user)
      setAuthReady(true)
    })
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

  // Each entry tracks three states, not two — this distinction is what
  // makes Cancel/click-away and Save-as-version both work correctly at
  // once: `original` (the true pre-session baseline, immutable once set,
  // used by Discard and by Save-as-version's "has this rule *ever* been
  // confirmed different" check), `committed` (the last value explicitly
  // confirmed via Apply — starts equal to original, and is what Cancel/
  // click-away revert back to, NOT all the way to original, since undoing
  // a second edit on an already-applied rule shouldn't also throw away the
  // first one), and `draft` (whatever's currently live in the textarea,
  // possibly not yet confirmed at all). An earlier version conflated
  // `original` with "last confirmed value" (Apply set original = draft
  // directly) — that made Save-as-version's `draft !== original` check
  // permanently blind to any rule the moment it was Applied, since nothing
  // ever looked "different" from its own already-updated baseline again.
  const editedEntries = useCallback(() => Object.values(sessionEditsRef.current).filter(e => e.committed !== e.original), [])

  const discardSession = useCallback(() => {
    Object.values(sessionEditsRef.current).forEach(entry => { setLiveRuleText(entry.selectorText, entry.mediaText, entry.original) })
    setSessionEdits({})
    setSelection(null)
  }, [])

  // Reverts only the *unconfirmed* rules among `keys` (draft !== committed)
  // back to their last committed value — leaves anything already confirmed
  // via Apply alone, since that's meant to survive as part of the ongoing
  // session. Used whenever the currently-open panel closes without an
  // explicit Apply: clicking away, clicking a different element, Escape,
  // or the panel's own close button — an edit you never confirmed
  // shouldn't silently persist just because you clicked elsewhere.
  const revertDirtyRules = useCallback((keys) => {
    if (!keys || keys.length === 0) return
    let changed = false
    keys.forEach(key => {
      const entry = sessionEditsRef.current[key]
      if (entry && entry.draft !== entry.committed) {
        setLiveRuleText(entry.selectorText, entry.mediaText, entry.committed)
        changed = true
      }
    })
    if (!changed) return
    setSessionEdits(prev => {
      const next = { ...prev }
      keys.forEach(key => {
        if (next[key] && next[key].draft !== next[key].committed) {
          next[key] = { ...next[key], draft: next[key].committed }
        }
      })
      return next
    })
  }, [])

  const closeSelection = useCallback(() => {
    revertDirtyRules(selectionRef.current ? selectionRef.current.keys : [])
    setSelection(null)
  }, [revertDirtyRules])

  // ── Pristine snapshot: every rule's cssText exactly as shipped, before
  // Dev Edit or any saved version ever touches it. useLayoutEffect (not
  // useEffect) so this runs synchronously right after mount, guaranteed to
  // complete before the always-on active-version effect below gets its
  // first chance to apply anything (that effect's Firestore subscription
  // is inherently async — at minimum a microtask away — so ordering here
  // is safe in practice, but useLayoutEffect makes the *intent* explicit:
  // this must happen first). Without this, there would be no way to
  // answer "what was this rule before any override existed at all," in
  // dev or production — the dev-only /lookup endpoint reads the source
  // file, but there's no file to read on a static production build.
  const pristineRef = useRef(null)
  useLayoutEffect(() => {
    if (!pristineRef.current) pristineRef.current = buildPristineSnapshot()
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
    if (!pristineRef.current) return // shouldn't happen (layout effect runs first), but don't reconcile against nothing
    const overrides = activeOverrides ? activeOverrides.overrides : []
    // Don't stomp whatever's currently open in the edit panel right now —
    // deliberately NOT the whole sessionEdits history (every rule ever
    // touched this session, including already-saved ones), which would
    // permanently block this effect from ever reconciling those rules
    // again (e.g. reverting to a version/Original that doesn't include a
    // rule you'd previously edited and saved would silently no-op on it).
    const exclude = new Set(selectionRef.current ? selectionRef.current.keys : [])
    applyOverrideSet(overrides, pristineRef.current, exclude)
  }, [activeOverrides])

  // 'deactivate' | 'signout' | null — which exit path is waiting on the
  // user's save-or-discard decision. A ref, not state, since it needs to
  // survive across the Save Version dialog's own lifecycle (opened from
  // inside the exit prompt) without re-showing the exit prompt itself.
  const [exitPrompt, setExitPrompt] = useState(null)
  const pendingExitRef = useRef(null)

  const finishExit = useCallback(async (intent) => {
    if (intent === 'signout') {
      setActive(false)
      setShowHistory(false)
      await signOut(auth)
    } else {
      setActive(false)
      setSelection(null)
      setHoveredEl(null)
    }
  }, [])

  const toggleActive = useCallback(() => {
    if (active) {
      if (editedEntries().length > 0) { setExitPrompt('deactivate'); return }
      setActive(false)
      setSelection(null)
      setHoveredEl(null)
      return
    }
    if (!authReady) return // ignore clicks before Firebase has restored any persisted session
    // Catches a tab left open across the week boundary without a reload —
    // onAuthStateChanged's own expiry check only runs on actual auth-state
    // transitions (load/sign-in/sign-out), not continuously, so a long-
    // lived tab could otherwise still show as "signed in" past a week.
    if (isAuthed && isSessionExpired()) {
      clearSignInAt()
      signOut(auth)
      setGateStep('password')
      return
    }
    if (!isAuthed) { setGateStep('password'); return }
    if (!authorName.trim()) { setGateStep('name'); return }
    setActive(true)
  }, [active, authReady, isAuthed, authorName, editedEntries])

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
    if (editedEntries().length > 0) { setExitPrompt('signout'); return }
    await finishExit('signout')
  }

  // ── Exit prompt actions ── (shown when leaving edit mode — toggling off
  // or signing out — while unsaved edits exist, instead of silently
  // leaving them applied-but-unmanaged or silently discarding them)
  const handleExitDiscard = () => {
    const intent = exitPrompt
    discardSession()
    setExitPrompt(null)
    finishExit(intent)
  }

  const handleExitSaveAsVersion = () => {
    pendingExitRef.current = exitPrompt
    setExitPrompt(null)
    setShowSaveDialog(true)
  }

  const handleExitCancel = () => setExitPrompt(null)

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

      if (!isRecognized(target)) {
        // Clicking outside the recognized page entirely — same as
        // dismissing the panel any other way, so an unconfirmed edit
        // doesn't survive just because the click landed somewhere else.
        closeSelection()
        return
      }
      if (selectionRef.current && selectionRef.current.el === target) return // already open on this element

      // Switching to a different element — revert whatever was left
      // unconfirmed (draft !== committed) on the previous one first.
      // Anything already confirmed via Apply is untouched, so it still
      // carries forward as part of the session.
      revertDirtyRules(selectionRef.current ? selectionRef.current.keys : [])

      const rawMatches = findMatchingRules(target)
      const keys = []
      const newEntries = {}
      const toLookup = []

      rawMatches.forEach(m => {
        const key = ruleKey(m.selectorText, m.mediaText)
        keys.push(key)
        if (sessionEditsRef.current[key] || newEntries[key]) return // already tracked from a prior selection — keep its draft as-is
        const original = formatDeclarations(m.rule.style.cssText)
        newEntries[key] = { selectorText: m.selectorText, mediaText: m.mediaText, filePath: m.filePath, original, committed: original, draft: original, loading: true }
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
              // All three still equal means nothing (typing, Apply, or
              // Cancel) has happened to this entry since it was created —
              // safe to refresh all three to the more accurate lookup
              // text. If the user's already interacted with it, leave
              // draft/committed alone and just note the accurate original
              // for Discard/Save-as-version's own baseline comparison.
              const untouched = entry.draft === entry.original && entry.committed === entry.original
              next[item.key] = {
                ...entry,
                original: result.declarations,
                committed: untouched ? result.declarations : entry.committed,
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
  }, [active, containerRef, closeSelection, revertDirtyRules])

  // ── Escape: close whatever's open, then exit on a further press ──
  // Reverts unconfirmed edits on the currently-open panel (same as
  // clicking away), but never discards the whole session by itself —
  // discarding already-confirmed edits stays an explicit, separate action.
  const [showHistory, setShowHistory] = useState(false)
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key !== 'Escape') return
      if (exitPrompt) { setExitPrompt(null); return }
      if (selectionRef.current) { closeSelection(); return }
      if (showHistory) { setShowHistory(false); return }
      if (active) toggleActive()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [active, showHistory, closeSelection, exitPrompt, toggleActive])

  // ── Keep the selected element's highlight/panel glued to it across
  // scroll/layout changes, and clean up if it gets removed from the DOM
  // (e.g. a list row that unmounts) while still selected. ──
  useEffect(() => {
    if (!selection) return
    let rafId
    const tick = () => {
      const el = selectionRef.current?.el
      if (!el || !el.isConnected) { closeSelection(); return }
      setSelection(sel => (sel ? { ...sel, rect: el.getBoundingClientRect() } : sel))
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [selection?.el, closeSelection])

  // Live preview: mutate the actual CSSOM rule directly here (a normal
  // event handler), not inside the setState updater below — keeps the
  // updater pure, matching the lesson from DevMode/DevComments' own
  // announceState fix.
  const updateDraft = (key, value) => {
    const entry = sessionEditsRef.current[key]
    if (!entry) return
    setLiveRuleText(entry.selectorText, entry.mediaText, value)
    setSessionEdits(prev => ({ ...prev, [key]: { ...prev[key], draft: value } }))
  }

  // ── Apply: confirms this one rule's edit (committed = draft) and closes
  // the panel — when running locally with a resolvable source file, it
  // *also* writes straight into that file via devEditPlugin.js (unchanged
  // behavior from the original build, just no longer the only thing this
  // button does; in production, no file to write to, it's just the
  // confirm step, no network call). Any *other* rule block still open in
  // this same panel that hasn't been confirmed reverts to its own last-
  // committed value, same as any other way of leaving the panel without
  // an explicit Apply (click-away, Escape, ×). ──
  const [applyingKey, setApplyingKey] = useState(null)
  const handleApply = async (key) => {
    const entry = sessionEditsRef.current[key]
    if (!entry) return
    const sel = selectionRef.current
    const canWriteToFile = import.meta.env.DEV && entry.filePath

    const finishApply = () => {
      setSessionEdits(prev => ({ ...prev, [key]: { ...prev[key], committed: prev[key].draft } }))
      if (sel) revertDirtyRules(sel.keys.filter(k => k !== key))
      setSelection(null)
    }

    if (!canWriteToFile) {
      finishApply()
      return
    }
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
      finishApply()
    } catch (err) {
      setError(err.message)
      // Leave the panel open on failure, so the error is visible and the
      // edit can be retried, rather than closing on top of a failed write.
    } finally {
      setApplyingKey(null)
    }
  }

  // ── Cancel: reverts this one rule all the way back to its true
  // original (not just its last-committed value — Cancel means "I don't
  // want this edit at all," a stronger action than just leaving the panel
  // without confirming) and closes the panel. Any *other* rule block still
  // open in this same panel that hasn't been confirmed reverts to its own
  // last-committed value, same as Apply above. ──
  const handleCancelRule = (key) => {
    const sel = selectionRef.current
    const entry = sessionEditsRef.current[key]
    if (!entry) return

    setLiveRuleText(entry.selectorText, entry.mediaText, entry.original)
    setSessionEdits(prev => ({
      ...prev,
      [key]: { ...prev[key], committed: prev[key].original, draft: prev[key].original },
    }))
    if (sel) revertDirtyRules(sel.keys.filter(k => k !== key))
    setSelection(null)
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
      // Only *confirmed* (Applied) edits go into a version — `committed`,
      // not `draft`. A rule sitting mid-edit in a still-open, unconfirmed
      // panel is deliberately left out, same as it wouldn't survive a
      // click-away either.
      const overrides = edited.map(e => ({ selector: e.selectorText, mediaText: e.mediaText || null, declarations: e.committed, filePath: e.filePath || null }))
      const versionRef = await addDoc(collection(db, 'devedit_versions'), {
        prototypeId, name, authorName, createdAt: serverTimestamp(), overrides,
      })
      await upsertActiveVersion(prototypeId, versionRef.id, name, overrides)
      // The session's committed edits are now the saved/active state —
      // reset each edited entry's `original` baseline to its own
      // `committed` value, so further edits diff against this new
      // checkpoint rather than the pre-session original (which would
      // otherwise make an already-saved rule look "changed" forever).
      setSessionEdits(prev => {
        const next = { ...prev }
        edited.forEach(e => {
          const key = ruleKey(e.selectorText, e.mediaText)
          if (next[key]) next[key] = { ...next[key], original: next[key].committed }
        })
        return next
      })
      setShowSaveDialog(false)
      setVersionNameInput('')
      // If this save was triggered from the exit prompt ("Save as
      // version" chosen while trying to leave edit mode), completing it
      // is also what finally completes the exit.
      if (pendingExitRef.current) {
        const intent = pendingExitRef.current
        pendingExitRef.current = null
        finishExit(intent)
      }
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
    if (pristineRef.current) applyOverrideSet(version.overrides, pristineRef.current)
    setPreviewVersionId(version.id)
  }

  const stopPreview = () => {
    if (pristineRef.current) {
      applyOverrideSet(activeOverridesRef.current ? activeOverridesRef.current.overrides : [], pristineRef.current)
    }
    setPreviewVersionId(null)
  }

  // Own error slot, separate from the per-element edit panel's `error` —
  // the history panel can be open at the same time as an edit panel, and a
  // shared single error string would risk a delete failure here showing up
  // (confusingly) inside an unrelated open edit panel, or vice versa.
  const [historyError, setHistoryError] = useState(null)

  const revertToVersion = async (version) => {
    setHistoryError(null)
    try {
      await upsertActiveVersion(prototypeId, version.id, version.name, version.overrides)
      setPreviewVersionId(null)
    } catch (err) {
      console.error('Dev Edit: failed to revert', err)
      setHistoryError('Failed to revert to this version')
    }
  }

  // Deleting the currently-active version is intentionally not offered —
  // VersionRow only renders this action for non-active rows in the first
  // place — since devedit_active carries its own denormalized copy of the
  // overrides (not just a reference), deleting the active version's own
  // doc wouldn't actually break the live styling, but it *would* silently
  // remove the only record of what's currently showing, with no way back
  // to it later. Requires being signed in, same as any devedit_versions
  // write — see the Firestore rules in CLAUDE.md's Firebase section.
  const deleteVersion = async (version) => {
    if (!window.confirm(`Delete "${version.name}"? This can't be undone.`)) return
    setHistoryError(null)
    try {
      await deleteDoc(doc(db, 'devedit_versions', version.id))
    } catch (err) {
      console.error('Dev Edit: failed to delete version', err)
      setHistoryError('Failed to delete version')
    }
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
                onApply={handleApply}
                onCancelRule={handleCancelRule}
                applyingKey={applyingKey}
                onClose={closeSelection}
                error={error}
              />
            </>
          )}

          <SessionBar
            dirtyCount={dirtyCount}
            onSave={openSaveDialog}
            onDiscard={discardSession}
            onToggleHistory={() => { setShowHistory(h => !h); setHistoryError(null) }}
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
              onCancel={() => {
                // Backing out of saving also aborts the whole exit attempt
                // (if this dialog was opened from the exit prompt) — never
                // force an exit/discard the user didn't explicitly confirm.
                pendingExitRef.current = null
                setShowSaveDialog(false)
              }}
              saving={saving}
            />
          )}

          {exitPrompt && (
            <ExitPrompt
              dirtyCount={editedEntries().length}
              onSave={handleExitSaveAsVersion}
              onDiscard={handleExitDiscard}
              onCancel={handleExitCancel}
            />
          )}

          {showHistory && (
            <VersionHistoryPanel
              versions={versions}
              activeVersionId={activeOverrides?.versionId || ORIGINAL_VERSION_ID}
              previewVersionId={previewVersionId}
              onPreview={previewVersion}
              onRevert={revertToVersion}
              onDelete={deleteVersion}
              error={historyError}
              onClose={() => { setShowHistory(false); setHistoryError(null); if (previewVersionId) stopPreview() }}
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

// Shown when leaving edit mode (toggling off, or signing out) while
// unsaved (committed-but-not-yet-versioned) edits exist — asks explicitly
// rather than either silently discarding them or silently leaving them
// applied-but-unmanaged after the toolbar itself says you're no longer
// editing. Clicking the backdrop (same convention as the other overlay
// dialogs) cancels the exit attempt entirely and returns to editing,
// without needing a third explicit button for that.
function ExitPrompt({ dirtyCount, onSave, onDiscard, onCancel }) {
  return (
    <div className="devedit-gate-overlay" data-devedit-ui="true" onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="devedit-gate-box">
        <div className="devedit-gate-title">You have {dirtyCount} unsaved edit{dirtyCount === 1 ? '' : 's'}</div>
        <div className="devedit-gate-actions">
          <button className="devedit-btn-secondary" onClick={onDiscard}>Discard changes</button>
          <button className="devedit-btn-primary" onClick={onSave}>Save as version</button>
        </div>
      </div>
    </div>
  )
}

// ─── Version history panel ───────────────────────────────────────────

function VersionHistoryPanel({ versions, activeVersionId, previewVersionId, onPreview, onRevert, onDelete, error, onClose }) {
  return (
    <div className="devedit-history-panel" data-devedit-ui="true">
      <div className="devedit-panel-header">
        <div className="devedit-panel-title">Version history</div>
        <button className="devedit-panel-close" onClick={onClose} aria-label="Close version history">×</button>
      </div>
      <div className="devedit-panel-body">
        {error && <div className="devedit-error">{error}</div>}
        {versions.length === 0 && <div className="devedit-panel-empty">No versions saved yet for this page.</div>}
        {versions.map(v => (
          <VersionRow key={v.id} version={v} isActive={v.id === activeVersionId} isPreviewing={v.id === previewVersionId} onPreview={onPreview} onRevert={onRevert} onDelete={onDelete} />
        ))}
        <VersionRow
          version={ORIGINAL_VERSION}
          isActive={activeVersionId === ORIGINAL_VERSION_ID}
          isPreviewing={previewVersionId === ORIGINAL_VERSION_ID}
          onPreview={onPreview}
          onRevert={onRevert}
          onDelete={onDelete}
          isOriginal
        />
      </div>
    </div>
  )
}

function VersionRow({ version, isActive, isPreviewing, onPreview, onRevert, onDelete, isOriginal }) {
  return (
    <div className={`devedit-version-row${isActive ? ' active' : ''}${isPreviewing ? ' previewing' : ''}${isOriginal ? ' original' : ''}`}>
      <div className="devedit-version-info">
        <div className="devedit-version-name">
          {version.name}
          {isActive && <span className="devedit-version-badge">active</span>}
        </div>
        <div className="devedit-version-meta">
          {isOriginal ? 'Base styling, no overrides' : `${version.authorName} · ${fmtTime(version.createdAt)}`}
        </div>
      </div>
      <div className="devedit-version-actions">
        {!isActive && (
          <>
            {/* Original has no real doc behind it — nothing to delete,
                and it must always exist as the fallback baseline. */}
            {!isOriginal && (
              <button className="devedit-icon-btn danger" onClick={() => onDelete(version)} aria-label="Delete version">
                <TrashIcon />
              </button>
            )}
            <button className="devedit-btn-secondary" onClick={() => onPreview(version)}>Preview</button>
            <button className="devedit-btn-primary" onClick={() => onRevert(version)}>Revert to this</button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Edit panel (per selected element) ───────────────────────────────

function EditPanel({ selection, rows, onDraftChange, onApply, onCancelRule, applyingKey, onClose, error }) {
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
              <div className="devedit-rule-actions">
                <button
                  className="devedit-btn-secondary"
                  onClick={() => onCancelRule(key)}
                  disabled={m.loading || (m.draft === m.original && m.committed === m.original)}
                >
                  Cancel
                </button>
                <button
                  className="devedit-btn-primary"
                  onClick={() => onApply(key)}
                  disabled={m.loading || m.draft === m.committed || applyingKey === key}
                >
                  {applyingKey === key ? 'Applying…' : 'Apply'}
                </button>
              </div>
            </div>
          )
        })}

        {error && <div className="devedit-error">{error}</div>}
      </div>
    </div>
  )
}
