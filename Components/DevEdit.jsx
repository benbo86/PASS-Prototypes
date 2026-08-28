import { useState, useRef, useEffect, useLayoutEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { createPortal } from 'react-dom'
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs, serverTimestamp,
} from 'firebase/firestore'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { announceState, subscribeToState, subscribeToSignOutRequest } from './devToolbarBus'
import { getStoredAuthor, storeAuthor } from './authorIdentity'
import { auth, db, SHARED_EMAIL } from './firebase'
import { getSignInAt, setSignInAt, clearSignInAt, isSessionExpired } from './sharedAuthSession'
import Tooltip from './Tooltip'
import { resolveSvgTarget, isLikelyIcon, canonicalizeIcon, createIconSwapRuntime, buildDomPath, buildPathHint, resolveTargets } from './iconSwap'
import IconSwapPanel from './IconSwapPanel'
import { canonicalizeElement, createElementEditRuntime, isEligibleForTagChange, isLeafTextElement, resolveElementTarget } from './elementEdit'
import ElementEditPanel from './ElementEditPanel'
import { getSuggestions, getCaretCoordinates } from './cssAutocomplete'
import CssAutocompletePopup from './CssAutocompletePopup'

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

// A dedicated <style> tag for rules Dev Edit creates from scratch — for an
// element with no existing stylesheet rule of its own to edit ("No editable
// stylesheet rule matches this element"). Nothing else ever writes to this
// sheet, so it's safe to fully manage (including pruning stale rules from
// it, see pruneInjectedSheet below) without risking a real, hand-authored
// rule living anywhere else on the page.
const INJECTED_STYLE_ID = 'devedit-injected-rules'
function getInjectedSheet() {
  let styleEl = document.getElementById(INJECTED_STYLE_ID)
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = INJECTED_STYLE_ID
    document.head.appendChild(styleEl)
  }
  return styleEl.sheet
}

// Removes any rule from the injected sheet whose key isn't in `keepKeys` —
// run on every reconcile so a brand-new rule that's no longer part of the
// active override set (e.g. reverted to a version/Original that doesn't
// include it) actually stops applying. A synthesized rule never appears in
// pristineMap (it didn't exist at mount), so applyOverrideSet's own
// pristine-restore loop below has nothing to restore it FROM — pruning the
// injected sheet directly is the only way to un-apply it.
function pruneInjectedSheet(keepKeys) {
  const sheet = getInjectedSheet()
  for (let i = sheet.cssRules.length - 1; i >= 0; i--) {
    const rule = sheet.cssRules[i]
    if (rule.type === CSSRule.STYLE_RULE && keepKeys.has(ruleKey(rule.selectorText, null))) continue
    sheet.deleteRule(i)
  }
}

// Always re-resolves the live rule(s) for a selector fresh, rather than
// mutating a previously-captured CSSStyleRule reference directly — see the
// comment on buildPristineSnapshot below for why holding onto an old
// reference is actually broken, not just extra-cautious. Falls back to
// inserting a brand-new rule into the injected sheet when nothing matches
// this selector anywhere yet — this is what makes it possible to create a
// rule for an element that had none to begin with, not just edit one that
// already existed. (Only ever exercised for a plain, non-@media selector —
// a synthesized rule is always created without a mediaText, so the @media
// case stays exclusively the "found an existing rule" branch above.)
function setLiveRuleText(selectorText, mediaText, cssText) {
  const existing = findRulesForSelector(selectorText, mediaText)
  if (existing.length > 0) {
    existing.forEach(rule => { rule.style.cssText = cssText })
    return
  }
  try {
    const sheet = getInjectedSheet()
    sheet.insertRule(`${selectorText} { ${cssText} }`, sheet.cssRules.length)
  } catch (err) {
    console.error('Dev Edit: failed to create new rule', err)
  }
}

// A pinned pseudo-version, always present in history, representing "no
// overrides at all" — the true base styling as originally shipped, before
// Dev Edit ever touched anything. Not a real Firestore doc (nothing to
// save — it's definitionally always the same), just a sentinel id/name so
// it can flow through the same preview/revert code paths as a real one.
const ORIGINAL_VERSION_ID = '__original__'
const ORIGINAL_VERSION = { id: ORIGINAL_VERSION_ID, name: 'Original', authorName: null, createdAt: null, overrides: [], iconSwaps: [] }

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
  pruneInjectedSheet(new Set([...newSelKeys, ...(excludeKeys || [])]))
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

async function upsertActiveVersion(prototypeId, versionId, versionName, overrides, iconSwaps = [], elementEdits = []) {
  const q = query(collection(db, 'devedit_active'), where('prototypeId', '==', prototypeId))
  const snap = await getDocs(q)
  const payload = { prototypeId, versionId, versionName, overrides, iconSwaps, elementEdits, updatedAt: serverTimestamp() }
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
// The SVG tab's Icon Library subview needs more room for a comfortable
// swatch grid than a CSS declaration textarea does.
const SVG_PANEL_WIDTH = 400
const PANEL_MARGIN = 12

// Real bug, reported directly: the panel got cut off at the bottom of the
// viewport for any element low on the page. The old vertical clamp assumed
// a fixed ~60px-tall panel (`window.innerHeight - PANEL_MARGIN - 60`) and
// anchored from `top` regardless — but the panel's real height varies a lot
// by tab/content (a handful of style rows vs. the full Icon Library grid),
// so that guess was frequently wrong and the panel ran off the bottom edge
// with no way to reach its own Apply/Back buttons. Fixed by anchoring from
// whichever edge leaves more room to grow into: when there's less room
// below the element than above it, position via `bottom` (growing upward)
// instead of `top` (growing downward) — combined with the panel's existing
// `max-height: 80vh` + `overflow-y: auto`, this keeps it fully on-screen
// regardless of how tall it actually renders, without needing to know that
// height in advance.
function computeEditPanelPosition(rect, width = PANEL_WIDTH) {
  let left = rect.right + 16
  if (left + width + PANEL_MARGIN > window.innerWidth) {
    left = rect.left - width - 16
  }
  left = Math.max(PANEL_MARGIN, Math.min(left, window.innerWidth - width - PANEL_MARGIN))

  const spaceBelow = window.innerHeight - rect.top
  const spaceAbove = rect.bottom
  if (spaceBelow < spaceAbove) {
    const bottom = Math.max(PANEL_MARGIN, window.innerHeight - rect.bottom)
    return { left, bottom }
  }
  const top = Math.max(PANEL_MARGIN, rect.top)
  return { left, top }
}

function toBoxStyle(rect) {
  return { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
}

// Icon edits are keyed by the swapped-in-place shape's TRUE original
// hash+len (see Components/iconSwap.js's identity scheme) — but a
// currently-selected element that's already been swapped no longer
// *hashes* to that original (its content has changed), so it can't be
// found that way. Its data-passicon marker (set by applySwap) carries the
// swap's own id instead — this is what makes "pick a different icon for an
// already-swapped element" replace the swap in place rather than layer a
// second one on top of the swapped result, and what makes Reset correctly
// mean "the true original," not "the previous swap."
//
// The marker has to be checked against TWO places, not just this session's
// own iconEdits: an icon can already be swapped from a *previously saved*
// version, applied by the always-on effect before the user ever opened Dev
// Edit this session — iconEdits starts empty every session, so a marker
// left over from that always-on application won't be found there at all.
// Real bug caught during design, not after shipping: without checking
// activeSwaps too, selecting an already-actively-swapped icon would fall
// through to hashing its CURRENT (already-swapped) markup and treat that
// as "the original" — silently breaking Reset (it would restore to the
// swapped state, not the true pristine icon) and defeating the whole
// point of the chained-swap-replaces-in-place rule.
//
// Returns { key, seed } — seed is the pre-existing active swap's own data
// when this element is swapped-but-not-yet-represented-in-session-state,
// so the caller can seed a session entry for it (mirroring how the CSS
// side seeds a rule's `original` from whatever's live at selection time,
// which is *also* already-active-override-aware for the same reason).
function resolveIconIdentity(el, iconEditsMap, activeSwaps) {
  if (!el) return { key: null, seed: null }
  const marker = el.getAttribute('data-passicon')
  if (marker) {
    const sessionEntry = Object.entries(iconEditsMap).find(([, e]) => e.id === marker)
    if (sessionEntry) return { key: sessionEntry[0], seed: null }
    const activeSwap = (activeSwaps || []).find((s) => s.id === marker)
    if (activeSwap) return { key: `${activeSwap.originalHash}:${activeSwap.originalLen}`, seed: activeSwap }
  }
  const { hash, len } = canonicalizeIcon(el)
  return { key: `${hash}:${len}`, seed: null }
}

function makeIconSwapId() {
  return `iconswap-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// Merges the shared/persisted active-version icon swaps with this
// session's own local edits — session edits always win for whatever key
// they cover, INCLUDING a Reset (an entry with svg: null, kept rather than
// deleted specifically so it can act as a suppression tombstone here: real
// bug caught during design — if Reset simply deleted its iconEdits entry,
// this merge would have nothing left to exclude the active version's own
// swap with, and the very next reconcile would silently re-apply the old
// saved swap right back, making Reset a no-op). Anything the session has
// no opinion about at all falls through to whatever the active/saved
// version says.
function mergeIconSwaps(iconEditsMap, activeSwaps) {
  const result = []
  const sessionKeys = new Set(Object.keys(iconEditsMap))
  Object.values(iconEditsMap).forEach((e) => {
    if (e.svg) result.push({ id: e.id, originalHash: e.originalHash, originalLen: e.originalLen, svg: e.svg, scope: e.scope, domPath: e.domPath })
  })
  ;(activeSwaps || []).forEach((s) => {
    const key = `${s.originalHash}:${s.originalLen}`
    if (!sessionKeys.has(key)) result.push(s)
  })
  return result
}

// ─── Element edits (text / tag / class / id) ───────────────────────────
// Same shape of problem resolveIconIdentity/mergeIconSwaps already solve —
// a marker attribute (data-passelement here) checked against BOTH this
// session's own edits and the currently-active saved version, so re-
// selecting an already-actively-edited element seeds from its real current
// state rather than hashing its already-edited content and treating that as
// "the original." Keyed by dom path (not content hash) as the PRIMARY key,
// the inverse of icon identity's own emphasis — see elementEdit.js's own
// module comment for why: this is instance-scoped by construction, and a
// path is what actually distinguishes "this specific element" from another
// one that merely looks the same.
function resolveElementEditIdentity(el, container, elementEditsMap, activeEdits) {
  if (!el) return { key: null, seed: null }
  const marker = el.getAttribute('data-passelement')
  if (marker) {
    const sessionEntry = Object.entries(elementEditsMap).find(([, e]) => e.id === marker)
    if (sessionEntry) return { key: sessionEntry[0], seed: null }
    const activeEdit = (activeEdits || []).find((e) => e.id === marker)
    if (activeEdit) return { key: activeEdit.domPath.join('.'), seed: activeEdit }
  }
  const domPath = buildDomPath(el, container)
  if (!domPath) return { key: null, seed: null }
  return { key: domPath.join('.'), seed: null }
}

function makeElementEditId() {
  return `elementedit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// Same merge rule as mergeIconSwaps: session edits always win for whatever
// key they cover (including an explicit Reset, kept as a tombstone rather
// than deleted so it can suppress a still-active saved edit — see that
// function's own comment for the exact bug this prevents), anything the
// session has no opinion about falls through to the active/saved version.
function mergeElementEdits(elementEditsMap, activeEdits) {
  const result = []
  const sessionKeys = new Set(Object.keys(elementEditsMap))
  Object.values(elementEditsMap).forEach((e) => {
    if (e.committed) {
      result.push({
        id: e.id, domPath: e.domPath, originalHash: e.originalHash, originalLen: e.originalLen,
        tag: e.committed.tag, text: e.committed.text, className: e.committed.className, elementId: e.committed.elementId,
      })
    }
  })
  ;(activeEdits || []).forEach((e) => {
    const key = e.domPath.join('.')
    if (!sessionKeys.has(key)) result.push(e)
  })
  return result
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

  // ── SVG tab / icon swaps ── which of the two tabs is showing (only
  // relevant once a selection resolves to an <svg> — see selection.svgEl
  // below), and the session's own icon-swap edits: a flatter two-state
  // model than sessionEdits' original/committed/draft, since there's no
  // separate dev-only "apply to file" step here to lose track of — an
  // entry either represents a swap that's live right now, or (once
  // Reset/never-applied) it doesn't exist in the map at all. Keyed by
  // `${originalHash}:${originalLen}` (see resolveIconIdentity above).
  const [activeTab, setActiveTab] = useState('styles')
  const [iconEdits, setIconEdits] = useState({})
  const iconEditsRef = useRef(iconEdits)
  iconEditsRef.current = iconEdits

  // ── Element tab / text-tag-class-id edits ── keyed by dom-path string
  // (see resolveElementEditIdentity above for why this, unlike icons, keys
  // primarily by structural position rather than content). Same three-state
  // shape as sessionEdits (original/committed/draft), just holding all four
  // fields together per entry instead of one CSS declaration string, since
  // Apply/Reset/dirty-checking all need to treat the four as one edit unit.
  const [elementEdits, setElementEdits] = useState({})
  const elementEditsRef = useRef(elementEdits)
  elementEditsRef.current = elementEdits
  const [showTabSwitchPrompt, setShowTabSwitchPrompt] = useState(false)

  const iconRuntimeRef = useRef(null)
  useEffect(() => {
    iconRuntimeRef.current = createIconSwapRuntime(containerRef.current)
    return () => iconRuntimeRef.current?.dispose()
  }, [containerRef])

  const elementRuntimeRef = useRef(null)
  useEffect(() => {
    elementRuntimeRef.current = createElementEditRuntime(containerRef.current)
    return () => elementRuntimeRef.current?.dispose()
  }, [containerRef])

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

  // An icon entry's dirtiness mirrors the CSS side's committed/original
  // split, just flatter (svg/savedSvg instead of draft/committed/original)
  // — savedSvg is whatever's currently the active/saved value (or null if
  // this icon was never swapped before this session), set once at
  // creation/seeding and only ever updated by a successful Save as
  // version. Without this comparison, merely *selecting* an
  // already-actively-swapped icon (which seeds a session entry — see
  // resolveIconIdentity above) would incorrectly count as a fresh unsaved
  // edit even though nothing was actually changed. Reads the ref (not
  // iconEdits directly) for the same reason editedEntries reads
  // sessionEditsRef — this needs to stay callable from stable useCallback
  // closures (toggleActive, handleSignOut) without going stale.
  const iconEditedCount = useCallback(() => Object.values(iconEditsRef.current).filter(e => e.svg !== e.savedSvg).length, [])

  // Same dirtiness rule as the icon side (committed vs saved, not some
  // deeper "true original" — see the seeding comment in handleClick below
  // for why), just comparing the whole {tag,text,className,elementId}
  // object at once. There's no live-draft state to worry about here at all
  // (see ElementEditPanel's own comment on why), so committed is genuinely
  // the only thing that can differ from saved.
  const elementEditedCount = useCallback(() => Object.values(elementEditsRef.current).filter(
    (e) => JSON.stringify(e.committed) !== JSON.stringify(e.saved)
  ).length, [])

  const discardSession = useCallback(() => {
    Object.values(sessionEditsRef.current).forEach(entry => { setLiveRuleText(entry.selectorText, entry.mediaText, entry.original) })
    setSessionEdits({})
    // Icon edits discard the same way — clearing to {} removes this
    // session's opinion about every icon entirely (including any pending
    // Reset/suppression — see mergeIconSwaps), so the unified reconcile
    // effect above falls all the way back to whatever's genuinely saved in
    // activeOverrides (or the true original, via iconSwap.js's own
    // registry, for a brand-new swap that was never saved at all).
    setIconEdits({})
    // Same reasoning as icon edits above — the combined reconcile effect
    // below falls back to whatever's genuinely saved/active, or the true
    // original for anything never saved.
    setElementEdits({})
    setSelection(null)
  }, [])

  // Reverts only the *unconfirmed* rules among `keys` (draft !== committed)
  // back to their last committed value — leaves anything already confirmed
  // via Apply alone, since that's meant to survive as part of the ongoing
  // session. Used whenever the currently-open panel closes without an
  // explicit Apply: clicking away, clicking a different element, Escape,
  // or the panel's own close button — an edit you never confirmed
  // shouldn't silently persist just because you clicked elsewhere.
  //
  // Real, severe bug found: this can fire *while the unified Apply's own
  // batch file-write is still awaiting its response* (see handlePanelApply
  // below) — switching to a new element right after clicking Apply calls
  // this with the *previous* selection's keys, and at that moment
  // `committed` for the just-applied rules hasn't been updated yet (that
  // only happens once the async request resolves). This reverted the
  // still-in-flight rules' draft/live style back to their pre-edit values
  // moments before the apply actually completed — reported as "apply an
  // edit, go to another element, edit it without saving, and the previous
  // edit disappears." Skipping every key while a batch Apply is in flight
  // (applyingAllRef, already tracked for the unified Apply button's own
  // disabled/label state) stops this specific revert from ever running out
  // from under it; handlePanelApply's own commit step is *also* hardened
  // independently (closure-captured draft values, forced live re-apply) as
  // a second line of defense.
  const [applyingAll, setApplyingAll] = useState(false)
  const applyingAllRef = useRef(false)
  applyingAllRef.current = applyingAll

  const revertDirtyRules = useCallback((keys) => {
    if (!keys || keys.length === 0 || applyingAllRef.current) return
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
    // A live icon-swap PREVIEW (IconSwapPanel.onPreview) mutates the DOM
    // directly via the runtime, entirely outside iconEdits/React state —
    // closing/switching the selection unmounts the panel that was tracking
    // it, but the mutation itself doesn't clean up on its own the way a
    // CSS preview does (that's just a CSSOM rule, restored the moment
    // sessionEdits reverts it above). Re-running the runtime from the
    // current *committed* iconEdits discards any such uncommitted preview.
    if (iconRuntimeRef.current) {
      const swaps = mergeIconSwaps(iconEditsRef.current, activeOverridesRef.current?.iconSwaps)
      iconRuntimeRef.current.setActiveSwaps(swaps)
    }
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
        return { versionId: data.versionId, versionName: data.versionName, overrides: data.overrides || [], iconSwaps: data.iconSwaps || [], elementEdits: data.elementEdits || [] }
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

  // Icon-swap analogue of the effect above — reconciles whenever EITHER
  // side changes: the shared/active version (someone else's save landing
  // via Firestore), or this session's own local edits (Apply/Reset). One
  // combined effect rather than two independent ones specifically because
  // Components/iconSwap.js's setActiveSwaps always restores-then-reapplies
  // its *entire* given list — two separate effects each calling it with
  // only their own partial view would fight and silently undo each other.
  // mergeIconSwaps is what makes a session Reset correctly override (not
  // just ignore) a still-active saved swap for the same icon.
  useEffect(() => {
    if (!iconRuntimeRef.current) return
    iconRuntimeRef.current.setActiveSwaps(mergeIconSwaps(iconEdits, activeOverrides?.iconSwaps))
  }, [activeOverrides, iconEdits])

  // Element-edit analogue of the effect above — same combined-effect
  // reasoning (createElementEditRuntime's own setActiveEdits also always
  // restores-then-reapplies its entire given list).
  useEffect(() => {
    if (!elementRuntimeRef.current) return
    elementRuntimeRef.current.setActiveEdits(mergeElementEdits(elementEdits, activeOverrides?.elementEdits))
  }, [activeOverrides, elementEdits])

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
      if (editedEntries().length > 0 || iconEditedCount() > 0 || elementEditedCount() > 0) { setExitPrompt('deactivate'); return }
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
  }, [active, authReady, isAuthed, authorName, editedEntries, iconEditedCount, elementEditedCount])

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
    if (editedEntries().length > 0 || iconEditedCount() > 0 || elementEditedCount() > 0) { setExitPrompt('signout'); return }
    await finishExit('signout')
  }

  // Components/DevToolbar.jsx's own Sign Out button lives outside this
  // component and has no access to editedEntries() — it just announces a
  // request and leaves the actual (guarded) sign-out to us, exactly as if
  // our own (now-removed) session-bar Sign Out button had been clicked.
  useEffect(() => {
    return subscribeToSignOutRequest(() => { handleSignOut() })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    // Same pre-filled-timestamp default as the toolbar's own "Save as
    // version" button (openSaveDialog) — this path bypasses that function
    // entirely (it needs to clear exitPrompt first), so the default has to
    // be set here too.
    setVersionNameInput(fmtTime(new Date()))
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

    // Exempt all four toolbar features' own chrome, not just this one —
    // same two-way (now four-way) rule Dev Mode/Dev Comments already
    // follow, or activating this tool would swallow clicks meant for the
    // other toggles/panels.
    const isOtherUi = (target) => target.closest && target.closest('[data-devedit-ui], [data-devmode-ui], [data-devcomments-ui], [data-wireframeaccess-ui], [data-devtoolbar-ui]')
    const isRecognized = (target) =>
      container.contains(target) ||
      (target.closest && target.closest('.react-datepicker-popper, .fd-wrap'))

    const handleMove = (e) => {
      if (isOtherUi(e.target)) return
      const rawTarget = isRecognized(e.target) ? e.target : null
      // Same normalization handleClick applies below (and Dev Mode's own
      // resolveHitTarget) — the hover highlight shows the icon's own box,
      // not a smaller inner path's, so hovering and the eventual click
      // agree on what's being pointed at. Only when the raw hover target
      // actually lands on/inside that svg, though — see handleClick's own
      // comment on `clickWasOnSvgItself` for why the broader "container
      // holds exactly one child svg" match must NOT trigger this.
      const rawSvgEl = rawTarget && resolveSvgTarget(rawTarget)
      const svgElForHover = rawSvgEl && isLikelyIcon(rawSvgEl) ? rawSvgEl : null
      const target = (svgElForHover && svgElForHover.contains(rawTarget)) ? svgElForHover : rawTarget
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
      const rawTarget = e.target

      if (!isRecognized(rawTarget)) {
        // Clicking outside the recognized page entirely — same as
        // dismissing the panel any other way, so an unconfirmed edit
        // doesn't survive just because the click landed somewhere else.
        closeSelection()
        return
      }

      // Real bug: a click landing on an icon's own inner <path>/<circle>
      // used to keep THAT raw node as selection.el — but the stale-
      // selection watchdog a bit below (the `el.isConnected` check) treats
      // selection.el falling out of the DOM as "the element was removed,
      // close the panel." applySwap's own el.replaceChildren() on the
      // <svg> destroys exactly that inner node the instant a preview/apply
      // runs, so the watchdog immediately (and wrongly) treated a
      // successful swap as its own selected element having vanished, and
      // closed the panel out from under the user before Apply could ever
      // complete — reported as "selecting the icon itself and swapping
      // doesn't work, only selecting the surrounding box does." Fixed by
      // normalizing to the enclosing <svg>, whenever the click resolves to
      // a real icon (isLikelyIcon) — the svg itself is never destroyed by
      // its own children being replaced, so the watchdog never misfires.
      //
      // Real bug #2, reported directly: this normalization was too broad.
      // resolveSvgTarget also resolves an svg via its OWN separate
      // "container holds exactly one child svg" fallback — e.g. mobile/
      // notifications' `.notif-avatar` div, a real styled element (size,
      // border-radius, its own CSS class) that happens to wrap one
      // RunIcon/EventIcon. Normalizing selection.el to the icon for THAT
      // case too meant clicking anywhere in the avatar circle — including
      // its own background, nowhere near the icon's actual drawn pixels —
      // silently edited the icon (which has no CSS class of its own)
      // instead of `.notif-avatar`, hiding every one of that div's real,
      // genuinely editable rules. The stale-watchdog bug this
      // normalization exists to fix can only ever happen when
      // selection.el is a node DESTROYED BY the swapped svg's own
      // replaceChildren (i.e. the click landed ON or INSIDE the svg) — a
      // container that merely holds an untouched svg child elsewhere
      // within it is never itself destroyed by that swap, so it never
      // needed normalizing in the first place. Fixed by only normalizing
      // when the raw click target is actually on/inside the resolved svg
      // (`svgEl.contains(rawTarget)`, true for both "is the svg itself"
      // and "is a descendant of it"), leaving the container-fallback case
      // targeting its own real element, exactly as it did before either
      // fix — svgEl itself (used for the Icon tab) is unaffected either
      // way, only selection.el/the CSS-matching target changes here.
      const rawSvgEl = resolveSvgTarget(rawTarget)
      const svgEl = rawSvgEl && isLikelyIcon(rawSvgEl) ? rawSvgEl : null
      const clickWasOnSvgItself = svgEl && svgEl.contains(rawTarget)
      const target = clickWasOnSvgItself ? svgEl : rawTarget

      if (selectionRef.current && selectionRef.current.el === target) return // already open on this element

      // Switching to a different element — revert whatever was left
      // unconfirmed (draft !== committed) on the previous one first.
      // Anything already confirmed via Apply is untouched, so it still
      // carries forward as part of the session.
      revertDirtyRules(selectionRef.current ? selectionRef.current.keys : [])
      // Same reasoning as closeSelection above — discard any uncommitted
      // icon-swap preview left on the previously-selected element.
      if (iconRuntimeRef.current) {
        const swaps = mergeIconSwaps(iconEditsRef.current, activeOverridesRef.current?.iconSwaps)
        iconRuntimeRef.current.setActiveSwaps(swaps)
      }

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

      // svgEl was already resolved above (before target was normalized) —
      // reused here rather than re-resolved.
      const { key: iconSwapKey, seed } = resolveIconIdentity(svgEl, iconEditsRef.current, activeOverridesRef.current?.iconSwaps)
      if (seed) {
        // Already actively swapped from a previously-saved version, not
        // yet represented in this session's own state — seed it now,
        // svg === savedSvg so it correctly reads as "not dirty" until the
        // user actually picks something different.
        setIconEdits(prev => (prev[iconSwapKey] ? prev : {
          ...prev,
          [iconSwapKey]: { id: seed.id, originalHash: seed.originalHash, originalLen: seed.originalLen, svg: seed.svg, savedSvg: seed.svg, source: seed.source, authorName: seed.authorName, scope: seed.scope, domPath: seed.domPath, pathHint: seed.pathHint },
        }))
      }

      // Same seeding idea as the icon block above, adapted for dom-path-
      // primary identity (see resolveElementEditIdentity's own comment).
      const { key: elementEditKey, seed: elementSeed } = resolveElementEditIdentity(
        target, containerRef.current, elementEditsRef.current, activeOverridesRef.current?.elementEdits
      )
      if (elementSeed) {
        // Already actively edited from a previously-saved version, not yet
        // represented in this session's own state — seed it now, saved ===
        // committed so it correctly reads as "not dirty" until the user
        // actually changes something. (Recovering the *true* pristine
        // original, if this is ever Reset, is the runtime's own registry's
        // job — same division of responsibility as icon swaps: this field
        // only ever needs to know "what's currently active," not the
        // deeper history behind it.)
        const seedValues = { tag: elementSeed.tag, text: elementSeed.text, className: elementSeed.className, elementId: elementSeed.elementId }
        setElementEdits(prev => (prev[elementEditKey] ? prev : {
          ...prev,
          [elementEditKey]: {
            id: elementSeed.id, domPath: elementSeed.domPath, pathHint: elementSeed.pathHint,
            originalHash: elementSeed.originalHash, originalLen: elementSeed.originalLen,
            saved: seedValues, committed: seedValues,
          },
        }))
      }

      setSelection({ el: target, rect: target.getBoundingClientRect(), keys, svgEl, iconSwapKey, elementEditKey })
      setActiveTab('styles')
      setShowTabSwitchPrompt(false)
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
      if (!el || !el.isConnected) {
        // Might not be a genuine removal — an Element-tab tag change
        // replaces this exact node (you can't rename a DOM node's tag in
        // place, only recreate and swap it in), which looks identical to a
        // removal from here. Same failure mode already fixed once for icon
        // swaps (see handleClick's own history on this) — try to re-resolve
        // the new live node via this edit's own domPath before concluding
        // the element is actually gone.
        const key = selectionRef.current?.elementEditKey
        const entry = key ? elementEditsRef.current[key] : null
        const resolved = entry && containerRef.current
          ? resolveElementTarget({ domPath: entry.domPath, id: entry.id, originalHash: entry.originalHash, originalLen: entry.originalLen }, containerRef.current)
          : null
        if (resolved) {
          setSelection(sel => (sel ? { ...sel, el: resolved, rect: resolved.getBoundingClientRect() } : sel))
          rafId = requestAnimationFrame(tick)
          return
        }
        closeSelection()
        return
      }
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

  // ── Unified Apply / Cancel / Reset — one action row shared by the "Edit
  // styles" and "Element" tabs (Ben: "have one apply button across both...
  // a cancel and reset button"). Previously each CSS rule had its OWN
  // Apply/Cancel pair, and clicking either one closed the WHOLE panel and
  // silently reverted every OTHER still-open rule's unconfirmed draft — so
  // editing two rules (or a rule plus the element's text/tag) meant
  // applying them one at a time, each click discarding whatever hadn't
  // been applied yet elsewhere in the same panel. Batching into one action
  // removes that trap. The Icon tab is untouched — it keeps its own
  // self-contained Apply/Reset, since "styles and/or elements" doesn't
  // cover it.
  const elementPanelRef = useRef(null)
  const [elementDraftDirty, setElementDraftDirty] = useState(false)
  const [elementResetNonce, setElementResetNonce] = useState(0)

  // Apply: validates the Element tab first (if it's part of this
  // selection) — an invalid element edit blocks the WHOLE apply, since
  // there's only one Apply action now, not two independent ones. Then
  // commits every dirty CSS row in one batched request (devEditPlugin.js's
  // /apply endpoint already loops over an `edits` array — it just never
  // received more than one at a time before this), and finally the element
  // edit, before closing. `entry.draft`/`elementResult.value` are captured
  // once, at the moment Apply was clicked, for the same reason the old
  // per-rule Apply captured `entry.draft` once — so what's actually
  // written/committed can't drift from what the request is in flight for.
  const handlePanelApply = async () => {
    const sel = selectionRef.current
    if (!sel || applyingAllRef.current) return

    let elementResult = null
    if (elementPanelRef.current) {
      elementResult = elementPanelRef.current.commit()
      if (!elementResult.ok) return // its own inline error is already shown; nothing here is applied
    }

    const dirtyKeys = sel.keys.filter(k => {
      const e = sessionEditsRef.current[k]
      return e && e.draft !== e.committed
    })
    const fileEdits = dirtyKeys
      .map(k => sessionEditsRef.current[k])
      .filter(e => import.meta.env.DEV && e.filePath)
      .map(e => ({ filePath: e.filePath, selector: e.selectorText, mediaText: e.mediaText, declarations: e.draft }))

    if (fileEdits.length > 0) {
      setApplyingAll(true)
      setError(null)
      try {
        const res = await fetch('/__dev-edit/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ edits: fileEdits }),
        })
        const data = await res.json()
        if (!data.ok) throw new Error(data.error || 'Failed to apply')
      } catch (err) {
        setError(err.message)
        // Leave the panel open on failure, so the error is visible and the
        // edit can be retried, rather than closing on top of a failed write.
        setApplyingAll(false)
        return
      }
      setApplyingAll(false)
    }

    dirtyKeys.forEach(k => {
      const e = sessionEditsRef.current[k]
      setLiveRuleText(e.selectorText, e.mediaText, e.draft)
    })
    if (dirtyKeys.length > 0) {
      setSessionEdits(prev => {
        const next = { ...prev }
        dirtyKeys.forEach(k => { if (next[k]) next[k] = { ...next[k], committed: next[k].draft } })
        return next
      })
    }

    if (elementResult?.ok && elementResult.value) handleElementApply(elementResult.value)

    if (iconRuntimeRef.current) {
      const swaps = mergeIconSwaps(iconEditsRef.current, activeOverridesRef.current?.iconSwaps)
      iconRuntimeRef.current.setActiveSwaps(swaps)
    }
    setSelection(null)
  }

  // Cancel: discards only unconfirmed drafts (CSS keystrokes not yet
  // Applied; the Element tab's own in-progress typing, which was never
  // live-applied and simply unmounts with the panel) and closes — exactly
  // what closing the panel any other way (×, Escape, clicking elsewhere)
  // already does. An explicit button just makes it a deliberate action
  // instead of only an implicit side effect of leaving.
  const handlePanelCancel = closeSelection

  // Reset: every CSS rule in this selection goes all the way back to its
  // true original (not just its last-committed value — a stronger action
  // than Cancel, since it discards even an already-applied edit), and any
  // existing element edit resets the same way, then closes.
  const handlePanelReset = () => {
    const sel = selectionRef.current
    if (!sel || applyingAllRef.current) return
    sel.keys.forEach(key => {
      const entry = sessionEditsRef.current[key]
      if (entry) setLiveRuleText(entry.selectorText, entry.mediaText, entry.original)
    })
    setSessionEdits(prev => {
      const next = { ...prev }
      sel.keys.forEach(key => {
        if (next[key]) next[key] = { ...next[key], committed: next[key].original, draft: next[key].original }
      })
      return next
    })
    handleElementReset()
    setElementResetNonce(n => n + 1)
    if (iconRuntimeRef.current) {
      const swaps = mergeIconSwaps(iconEditsRef.current, activeOverridesRef.current?.iconSwaps)
      iconRuntimeRef.current.setActiveSwaps(swaps)
    }
    setSelection(null)
  }

  // ── Add rule: for an element with no existing stylesheet rule at all
  // ("No editable stylesheet rule matches this element") — creates a
  // brand-new sessionEdits entry for one of the element's own classes, with
  // empty original/committed/draft. Everything downstream (Apply, Cancel,
  // Discard, Save as version) already treats a rule generically via that
  // same three-state shape, so a rule that started out empty needs no
  // special-casing anywhere else — only the live CSSOM insert
  // (setLiveRuleText's injected-sheet fallback) and the reconcile-time
  // prune (applyOverrideSet) above needed to change to make this possible.
  const handleAddRule = (selector) => {
    const key = ruleKey(selector, null)
    setSessionEdits(prev => (prev[key] ? prev : {
      ...prev,
      [key]: { selectorText: selector, mediaText: null, filePath: null, original: '', committed: '', draft: '', loading: false },
    }))
    setSelection(sel => (sel && !sel.keys.includes(key) ? { ...sel, keys: [...sel.keys, key] } : sel))
  }

  // ── Save as version ──
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [versionNameInput, setVersionNameInput] = useState('')
  const [saving, setSaving] = useState(false)

  const openSaveDialog = () => {
    if (editedEntries().length === 0 && iconEditedCount() === 0 && elementEditedCount() === 0) return
    // Pre-filled with a timestamp so Save works immediately for a small
    // edit with no typing required — still a plain editable text field, so
    // a real name can replace it for anything worth naming properly.
    setVersionNameInput(fmtTime(new Date()))
    setShowSaveDialog(true)
  }

  const submitSaveVersion = async () => {
    const name = versionNameInput.trim()
    const edited = editedEntries()
    // Same "only what's actually dirty this round" rule as the CSS side
    // above (edited, filtered by committed !== original) — an icon entry
    // seeded from an already-active swap but never re-picked (svg ===
    // savedSvg) is deliberately left out, exactly like an unedited CSS
    // rule would be.
    const editedIcons = Object.entries(iconEditsRef.current).filter(([, e]) => e.svg !== e.savedSvg)
    // Same "only what's genuinely dirty this round" rule as CSS/icons above
    // — committed vs saved, exactly what elementEditedCount() itself checks.
    const editedElements = Object.entries(elementEditsRef.current).filter(
      ([, e]) => JSON.stringify(e.committed) !== JSON.stringify(e.saved)
    )
    if (!name || saving || (edited.length === 0 && editedIcons.length === 0 && editedElements.length === 0)) return
    setSaving(true)
    setError(null)
    try {
      // Only *confirmed* (Applied) edits go into a version — `committed`,
      // not `draft`. A rule sitting mid-edit in a still-open, unconfirmed
      // panel is deliberately left out, same as it wouldn't survive a
      // click-away either.
      const newOverrides = edited.map(e => ({ selector: e.selectorText, mediaText: e.mediaText || null, declarations: e.committed, filePath: e.filePath || null }))
      const newIconSwaps = editedIcons.map(([, e]) => ({
        id: e.id, scope: e.scope || 'all', originalHash: e.originalHash, originalLen: e.originalLen,
        domPath: e.domPath || null, pathHint: e.pathHint || null,
        svg: e.svg, source: e.source, authorName: e.authorName, createdAt: e.createdAt || new Date().toISOString(),
      }))
      // committed: null is a pending Reset (a tombstone suppressing a still-
      // active saved edit, see handleElementReset) — "no edit" is expressed
      // by absence from the persisted array, not a null entry, same as
      // icons exclude svg: null from what actually gets saved.
      const newElementEdits = editedElements
        .filter(([, e]) => e.committed !== null)
        .map(([, e]) => ({
          id: e.id, domPath: e.domPath, pathHint: e.pathHint || null,
          originalHash: e.originalHash, originalLen: e.originalLen,
          tag: e.committed.tag, text: e.committed.text, className: e.committed.className, elementId: e.committed.elementId,
          authorName, createdAt: e.createdAt || new Date().toISOString(),
        }))
      // Real bug, reported live: saving used to write ONLY this round's
      // dirty edits as the version's entire override set, silently dropping
      // every override from a PREVIOUS save that isn't also being re-edited
      // right now — e.g. save a padding change on rule A, then separately
      // save a padding change on rule B, and B's save would wipe A's out of
      // the resulting version (and the live active styling) entirely, even
      // though A was never touched or reverted. A new version needs to
      // represent the FULL current styling state, not just this session's
      // delta — so merge this round's edits with whatever's already active,
      // same "session wins for its own key, otherwise carry the existing
      // entry forward unchanged" rule mergeIconSwaps already established for
      // the live-reconcile path (not reused directly here since it drops
      // fields — source/authorName/createdAt/pathHint — this save path
      // needs to preserve on carried-over entries).
      const newOverrideKeys = new Set(newOverrides.map(o => ruleKey(o.selector, o.mediaText)))
      const carriedOverrides = (activeOverridesRef.current?.overrides || [])
        .filter(o => !newOverrideKeys.has(ruleKey(o.selector, o.mediaText)))
      const overrides = [...carriedOverrides, ...newOverrides]

      const newIconKeys = new Set(newIconSwaps.map(s => `${s.originalHash}:${s.originalLen}`))
      const carriedIconSwaps = (activeOverridesRef.current?.iconSwaps || [])
        .filter(s => !newIconKeys.has(`${s.originalHash}:${s.originalLen}`))
      const iconSwaps = [...carriedIconSwaps, ...newIconSwaps]

      const newElementKeys = new Set(newElementEdits.map(e => e.domPath.join('.')))
      // A pending Reset (committed: null) also needs to suppress its
      // carried-over counterpart here, or the save would silently resurrect
      // the very edit Reset was meant to remove — same reasoning newIconSwaps
      // doesn't need (icons have no separate tombstone-vs-persisted split at
      // this layer since svg:null is already excluded above, but the KEY
      // still needs excluding from the carry-forward so it doesn't survive).
      const resetElementKeys = new Set(
        editedElements.filter(([, e]) => e.committed === null).map(([, e]) => e.domPath.join('.'))
      )
      const carriedElementEdits = (activeOverridesRef.current?.elementEdits || [])
        .filter(e => !newElementKeys.has(e.domPath.join('.')) && !resetElementKeys.has(e.domPath.join('.')))
      const elementEdits = [...carriedElementEdits, ...newElementEdits]

      const versionRef = await addDoc(collection(db, 'devedit_versions'), {
        prototypeId, name, authorName, createdAt: serverTimestamp(), overrides, iconSwaps, elementEdits,
      })
      await upsertActiveVersion(prototypeId, versionRef.id, name, overrides, iconSwaps, elementEdits)
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
      // Same reset for icons: savedSvg = svg, so an unchanged swap reads
      // as clean again until it's actually re-picked.
      setIconEdits(prev => {
        const next = { ...prev }
        editedIcons.forEach(([key]) => {
          if (next[key]) next[key] = { ...next[key], savedSvg: next[key].svg }
        })
        return next
      })
      // Same reset for elements: saved = committed, so an unchanged edit
      // reads as clean again until it's actually re-edited. A pending
      // Reset (committed: null) resets to null too — it's genuinely
      // "no edit" now, matching the just-persisted absence of that key.
      setElementEdits(prev => {
        const next = { ...prev }
        editedElements.forEach(([key]) => {
          if (next[key]) next[key] = { ...next[key], saved: next[key].committed }
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
    const hasUnsaved = editedEntries().length > 0 || iconEditedCount() > 0 || elementEditedCount() > 0
    if (hasUnsaved && !window.confirm('Discard your unsaved edits to preview a past version?')) return
    if (hasUnsaved) discardSession()
    if (pristineRef.current) applyOverrideSet(version.overrides, pristineRef.current)
    // Previewing shows EXACTLY this version's own icon swaps, not merged
    // with anything else — discardSession() above already cleared this
    // session's own edits in the common case, but calling setActiveSwaps
    // directly (bypassing mergeIconSwaps) is what makes this correct
    // regardless of that effect's own timing.
    iconRuntimeRef.current?.setActiveSwaps(version.iconSwaps || [])
    // Same reasoning as icons directly above: show exactly this version's
    // own element edits, not merged with the current session's.
    elementRuntimeRef.current?.setActiveEdits(version.elementEdits || [])
    setPreviewVersionId(version.id)
  }

  const stopPreview = () => {
    if (pristineRef.current) {
      applyOverrideSet(activeOverridesRef.current ? activeOverridesRef.current.overrides : [], pristineRef.current)
    }
    iconRuntimeRef.current?.setActiveSwaps(mergeIconSwaps(iconEditsRef.current, activeOverridesRef.current?.iconSwaps))
    elementRuntimeRef.current?.setActiveEdits(mergeElementEdits(elementEditsRef.current, activeOverridesRef.current?.elementEdits))
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
      await upsertActiveVersion(prototypeId, version.id, version.name, version.overrides, version.iconSwaps || [], version.elementEdits || [])
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
  const dirtyCount = editedEntries().length + iconEditedCount() + elementEditedCount()

  // ── Tab switching (Edit styles <-> Element/Icon) ── switching away from
  // a tab that has something uncommitted prompts to apply or discard
  // first, mirroring ExitPrompt's own two-button + backdrop-cancels
  // convention exactly, rather than introducing a new three-button pattern
  // for one case. Generalized from "always goes to svg" to a remembered
  // pendingTab once the Element tab existed as a second possible
  // destination, and again to check *whichever* tab is actually being
  // left (not just Edit styles) once the Element tab could itself hold an
  // uncommitted draft — leaving Element for Edit styles/Icon used to
  // silently drop an in-progress (never-applied) text/tag/class/id edit,
  // since unmounting ElementEditPanel just discards its own local state.
  const hasUncommittedCssEdit = rows.some(m => m.draft !== m.committed)
  const [pendingTab, setPendingTab] = useState(null)

  const requestTab = (tab) => {
    if (tab === activeTab) return
    if (activeTab === 'styles' && hasUncommittedCssEdit) { setPendingTab(tab); setShowTabSwitchPrompt(true); return }
    if (activeTab === 'element' && elementDraftDirty) { setPendingTab(tab); setShowTabSwitchPrompt(true); return }
    setActiveTab(tab)
  }

  const handleTabSwitchDiscard = () => {
    // Element's own in-progress draft needs no action here — it's local
    // state inside ElementEditPanel, which is about to unmount as soon as
    // the tab switches, discarding it for free.
    if (activeTab === 'styles' && selection) revertDirtyRules(selection.keys)
    setShowTabSwitchPrompt(false)
    setActiveTab(pendingTab)
    setPendingTab(null)
  }

  // Commits whichever tab is being left. For CSS: every currently-dirty
  // row's draft becomes its new committed value, WITHOUT the unified
  // Apply's other side effects (closing the whole panel, the dev-only
  // batched file write) — this path is about not losing in-progress work
  // while navigating within Dev Edit's own UI, not the deliberate "confirm
  // and write to file" action, so it deliberately stays a plain in-memory
  // commit. For Element: validates via the same ref-exposed `commit()`
  // the unified Apply uses — an invalid draft cancels the whole tab
  // switch (its own inline error is already visible, so staying put on
  // the Element tab is the only way to actually show it).
  const handleTabSwitchApply = () => {
    if (activeTab === 'styles') {
      const dirtyKeys = rows.filter(m => m.draft !== m.committed).map(m => ruleKey(m.selectorText, m.mediaText))
      setSessionEdits(prev => {
        const next = { ...prev }
        dirtyKeys.forEach(k => { if (next[k]) next[k] = { ...next[k], committed: next[k].draft } })
        return next
      })
    } else if (activeTab === 'element' && elementPanelRef.current) {
      const result = elementPanelRef.current.commit()
      if (!result.ok) { setShowTabSwitchPrompt(false); setPendingTab(null); return }
      handleElementApply(result.value)
    }
    setShowTabSwitchPrompt(false)
    setActiveTab(pendingTab)
    setPendingTab(null)
  }

  const handleTabSwitchCancel = () => { setShowTabSwitchPrompt(false); setPendingTab(null) }

  // ── Icon swap handlers (SVG tab) ──
  // selection.iconSwapKey was already resolved once, at selection time (via
  // resolveIconIdentity, which is also what seeds a session entry for an
  // icon that's already actively swapped from a previous save) — reused
  // here rather than re-resolved, so it can't drift from what selection
  // was actually seeded with.
  const currentIconSwap = selection?.iconSwapKey ? iconEdits[selection.iconSwapKey] : null

  // Element tab — hasElementEditToReset feeds the unified Reset button's
  // own enabled state below: true whenever there's a currently-active
  // committed edit at all (session-applied, or seeded from an active
  // saved version), regardless of whether it happens to already match
  // `saved` — Reset means "back to the TRUE original," a stronger target
  // than merely undoing this session's own changes.
  const currentElementEdit = selection?.elementEditKey ? elementEdits[selection.elementEditKey] : null
  const hasElementEditToReset = !!currentElementEdit?.committed
  // The panel's own starting draft — always read straight off the live
  // element (selection.el), which already reflects whatever's currently
  // applied (a fresh original, a seeded active edit, or this session's own
  // prior Apply) — there's no separate "what should the fields show"
  // bookkeeping to keep in sync with that.
  const elementEditInitial = selection ? {
    tag: selection.el.tagName.toLowerCase(),
    text: selection.el.children.length === 0 ? selection.el.textContent : '',
    className: selection.el.className || '',
    elementId: selection.el.id || '',
  } : null

  // Live-preview a candidate directly on the selected element, without
  // touching iconEdits/session state at all — Back or deselecting just
  // re-runs the real reconciliation below, discarding this preview-only
  // mutation.
  const handleIconPreview = (svgMarkup, scope = 'all') => {
    if (!selection?.svgEl || !iconRuntimeRef.current) return
    if (scope !== 'all' || !selection.iconSwapKey) {
      iconRuntimeRef.current.applyOne(selection.svgEl, { id: 'preview', svg: svgMarkup })
      return
    }
    // scope 'all' previews on every matching instance too, not just the
    // selected one — the whole point of previewing before Apply is to see
    // the real effect, and for an "all instances" swap that effect is
    // page-wide. originalHash/originalLen come from selection.iconSwapKey
    // (resolved once, at selection time) rather than re-hashing the live
    // selection.svgEl, for the same reason handleIconApply's own fallback
    // branch does — by the time a second/third candidate is previewed,
    // selection.svgEl may already carry an earlier candidate's swapped-in
    // content, and re-hashing that would silently stop matching the other
    // still-original instances.
    const [hash, lenStr] = selection.iconSwapKey.split(':')
    const targets = resolveTargets({ originalHash: hash, originalLen: Number(lenStr), scope: 'all' }, containerRef.current)
    targets.forEach((el) => iconRuntimeRef.current.applyOne(el, { id: 'preview', svg: svgMarkup }))
  }
  const handleIconClearPreview = () => {
    if (!iconRuntimeRef.current) return
    const swaps = mergeIconSwaps(iconEditsRef.current, activeOverridesRef.current?.iconSwaps)
    iconRuntimeRef.current.setActiveSwaps(swaps)
  }
  const handleIconApply = (svgMarkup, source, scope = 'all') => {
    if (!selection?.svgEl || !selection.iconSwapKey) return
    const existing = iconEditsRef.current[selection.iconSwapKey]
    let originalHash, originalLen, id, savedSvg
    if (existing) {
      // Replace the swap in place — Reset must still mean "the true
      // original," not "the previous swap," and re-picking shouldn't
      // silently chain a second swap on top of an already-swapped result.
      // savedSvg (whatever's currently the *active/saved* value, or null
      // if this icon was never swapped before this session) carries
      // forward unchanged — only Save-as-version updates it, matching the
      // CSS side's committed/original split.
      ({ originalHash, originalLen, id, savedSvg } = existing)
    } else {
      // Real bug, caught during verification: this used to re-hash the LIVE
      // selection.svgEl here — but by the time Apply is clicked, that element
      // has almost always already been mutated by handleIconPreview (picking
      // a candidate previews it immediately, before Apply). Re-hashing at
      // this point captures the swapped-in candidate's own shape as if it
      // were "the original," corrupting originalHash/originalLen for any
      // icon that had never been swapped before this session — resolveTargets
      // would then never find the (correctly restored) true-original element
      // again, silently no-op'ing the swap. selection.iconSwapKey was
      // resolved once already, at selection time, before any preview
      // mutation ever ran — parsing it back apart is the correct source,
      // exactly matching the comment on selection.iconSwapKey's own
      // declaration above.
      const [originalHashPart, originalLenPart] = selection.iconSwapKey.split(':')
      originalHash = originalHashPart
      originalLen = Number(originalLenPart)
      id = makeIconSwapId()
      savedSvg = null
    }
    const key = `${originalHash}:${originalLen}`
    // domPath/pathHint are only computed (and only meaningful) for an
    // instance-scoped swap — resolveTargets in iconSwap.js falls back to
    // "all" if this ever fails to resolve to a genuinely matching element
    // later (page structure changed), so there's no need to guard against
    // buildDomPath returning null here; it just means that fallback runs.
    const domPath = scope === 'instance' ? buildDomPath(selection.svgEl, containerRef.current) : null
    const pathHint = scope === 'instance' ? buildPathHint(selection.svgEl, containerRef.current) : null
    setIconEdits(prev => ({
      ...prev,
      [key]: { id, originalHash, originalLen, svg: svgMarkup, savedSvg, source, authorName, createdAt: new Date().toISOString(), scope, domPath, pathHint },
    }))
  }
  const handleIconReset = () => {
    if (!selection?.iconSwapKey) return
    // svg: null, not deleting the entry — this is what makes Reset
    // correctly SUPPRESS a still-active saved swap for this icon (see
    // mergeIconSwaps above), rather than just removing this session's own
    // opinion and letting the old saved swap silently reapply right back
    // on the very next reconcile.
    setIconEdits(prev => (prev[selection.iconSwapKey] ? { ...prev, [selection.iconSwapKey]: { ...prev[selection.iconSwapKey], svg: null } } : prev))
  }

  // ── Element edit handlers (Element tab) ── ElementEditPanel has already
  // validated `draftValues` before ever calling this — this only ever
  // updates state, never the DOM directly; the combined reconcile effect
  // above is what actually applies it, exactly the same division as the
  // icon-swap handlers above.
  const handleElementApply = (draftValues) => {
    if (!selection?.el) return
    const target = selection.el
    const existing = selection.elementEditKey ? elementEditsRef.current[selection.elementEditKey] : null
    let entry
    if (existing) {
      // Same "carry saved forward unchanged, only committed moves" split
      // the icon side uses for savedSvg — only Save-as-version updates
      // `saved`.
      entry = { ...existing, committed: draftValues }
    } else {
      const { hash, len } = canonicalizeElement(target)
      const domPath = buildDomPath(target, containerRef.current)
      const pathHint = buildPathHint(target, containerRef.current)
      const savedValues = {
        tag: target.tagName.toLowerCase(), text: target.textContent, className: target.className, elementId: target.id,
      }
      entry = {
        id: makeElementEditId(), domPath, pathHint, originalHash: hash, originalLen: len,
        saved: savedValues, committed: draftValues,
      }
    }
    const key = selection.elementEditKey || entry.domPath.join('.')
    setElementEdits(prev => ({ ...prev, [key]: entry }))
    // selection.el itself doesn't need updating here even if the tag just
    // changed — the per-frame watchdog below re-resolves it via domPath the
    // moment it notices the old node disconnected, the same way it already
    // recovers from any other DOM replacement.
    if (!selection.elementEditKey) setSelection(sel => (sel ? { ...sel, elementEditKey: key } : sel))
  }

  const handleElementReset = () => {
    if (!selection?.elementEditKey) return
    // committed: null, not deleting the entry — same reasoning as
    // handleIconReset: this is what makes Reset correctly SUPPRESS a still-
    // active saved edit for this element, rather than just removing this
    // session's own opinion and letting the old saved edit silently
    // reapply right back on the very next reconcile.
    setElementEdits(prev => (prev[selection.elementEditKey] ? { ...prev, [selection.elementEditKey]: { ...prev[selection.elementEditKey], committed: null } } : prev))
  }

  return (
    <>
      <Tooltip text="Edit" wrapClassName="devedit-toggle-wrap" placement="bottom">
        <button
          className={`dev-toolbar-icon-btn devedit-toggle${active ? ' active' : ''}`}
          onClick={toggleActive}
          data-devedit-ui="true"
          aria-label={active ? 'Exit Dev Edit' : 'Dev Edit'}
        >
          <PenIcon />
        </button>
      </Tooltip>

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
                onAddRule={handleAddRule}
                onClose={closeSelection}
                error={error}
                activeTab={activeTab}
                onTabChange={requestTab}
                containerRef={containerRef}
                hasIconSwap={!!currentIconSwap?.svg}
                onIconPreview={handleIconPreview}
                onIconClearPreview={handleIconClearPreview}
                onIconApply={handleIconApply}
                onIconReset={handleIconReset}
                elementEditInitial={elementEditInitial}
                elementPanelRef={elementPanelRef}
                elementDraftDirty={elementDraftDirty}
                onElementDirtyChange={setElementDraftDirty}
                elementResetNonce={elementResetNonce}
                hasElementEditToReset={hasElementEditToReset}
                applyingAll={applyingAll}
                onPanelApply={handlePanelApply}
                onPanelCancel={handlePanelCancel}
                onPanelReset={handlePanelReset}
              />
              {showTabSwitchPrompt && (
                <TabSwitchPrompt
                  onApply={handleTabSwitchApply}
                  onDiscard={handleTabSwitchDiscard}
                  onCancel={handleTabSwitchCancel}
                />
              )}
            </>
          )}

          <SessionBar
            dirtyCount={dirtyCount}
            onSave={openSaveDialog}
            onDiscard={discardSession}
            onToggleHistory={() => { setShowHistory(h => !h); setHistoryError(null) }}
            historyOpen={showHistory}
            authorName={authorName}
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
              dirtyCount={editedEntries().length + iconEditedCount() + elementEditedCount()}
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
            <div className="devedit-gate-title">Enter password to open edit mode</div>
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

function SessionBar({ dirtyCount, onSave, onDiscard, onToggleHistory, historyOpen, authorName, previewing, onStopPreview }) {
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
      {/* Sign Out itself moved to Components/DevToolbar.jsx, reachable any
          time the shared session is active rather than only while Dev
          Edit's own edit mode is open — see subscribeToSignOutRequest
          above for how a click there still reaches this component's own
          guarded handleSignOut. */}
      <span className="devedit-session-identity">{authorName}</span>
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
          onFocus={e => e.target.select()}
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

// Shown when switching from the Edit styles tab to the SVG tab while a CSS
// edit sits uncommitted (typed but not yet confirmed via Apply) — same
// two-button + backdrop-cancels convention as ExitPrompt above, just a
// smaller scope (this one rule block's draft, not the whole session).
function TabSwitchPrompt({ onApply, onDiscard, onCancel }) {
  return (
    <div className="devedit-gate-overlay" data-devedit-ui="true" onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="devedit-gate-box">
        <div className="devedit-gate-title">You have unapplied style edits</div>
        <div className="devedit-gate-actions">
          <button className="devedit-btn-secondary" onClick={onDiscard}>Discard changes</button>
          <button className="devedit-btn-primary" onClick={onApply}>Apply changes</button>
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

// ─── Rule textarea with Chrome-Styles-pane-style autocomplete ─────────
// Ben: "can we have it so it presents you the options when you're adding a
// style, similar to how it does in chrome." Wraps the plain declarations
// textarea with a property/value suggestion dropdown (Components/
// cssAutocomplete.js does the actual matching) — a purely local UI concern,
// so its suggestion/caret state lives here rather than in DevEdit.jsx's own
// (already large) state, matching how ElementEditPanel keeps its own draft
// local too.
function RuleTextarea({ value, onChange, disabled, rows }) {
  const textareaRef = useRef(null)
  const pendingCaretRef = useRef(null)
  const [suggestion, setSuggestion] = useState(null) // { kind, options, activeIndex, replaceStart, replaceEnd, position } | null

  // Moves the real caret to wherever a just-applied suggestion should leave
  // it — has to happen after the controlled value actually lands in the
  // DOM (a plain assignment during the event handler would be clobbered by
  // React's own re-render), so this runs as a layout effect keyed on value.
  useLayoutEffect(() => {
    if (pendingCaretRef.current != null && textareaRef.current) {
      textareaRef.current.setSelectionRange(pendingCaretRef.current, pendingCaretRef.current)
      pendingCaretRef.current = null
    }
  }, [value])

  const refreshSuggestions = (text, caretIndex) => {
    if (disabled || !textareaRef.current) { setSuggestion(null); return }
    const result = getSuggestions(text, caretIndex)
    if (!result) { setSuggestion(null); return }
    const position = getCaretCoordinates(textareaRef.current, caretIndex, text)
    setSuggestion({ ...result, activeIndex: 0, position })
  }

  const applySuggestion = (option) => {
    if (!suggestion) return
    const { replaceStart, replaceEnd, kind } = suggestion
    // Selecting a property is only ever half the job — auto-append ": "
    // and immediately re-open suggestions for the (empty) value, mirroring
    // how Chrome jumps straight into the value field once a property's
    // picked. Value/variable picks insert verbatim: a value can be one
    // token of a longer one (`1px solid <here>`), so there's nothing safe
    // to auto-append there the way there is for a property name.
    const insertText = kind === 'property' ? `${option}: ` : option
    const newText = value.slice(0, replaceStart) + insertText + value.slice(replaceEnd)
    const newCaret = replaceStart + insertText.length
    pendingCaretRef.current = newCaret
    onChange(newText)
    if (kind === 'property') refreshSuggestions(newText, newCaret)
    else setSuggestion(null)
  }

  const handleChange = (e) => {
    onChange(e.target.value)
    refreshSuggestions(e.target.value, e.target.selectionStart)
  }

  const handleKeyDown = (e) => {
    if (!suggestion) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSuggestion(s => s && { ...s, activeIndex: (s.activeIndex + 1) % s.options.length })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSuggestion(s => s && { ...s, activeIndex: (s.activeIndex - 1 + s.options.length) % s.options.length })
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      applySuggestion(suggestion.options[suggestion.activeIndex])
    } else if (e.key === 'Escape') {
      // Swallow here (not the panel/selection-closing Escape below) — only
      // dismiss the dropdown, matching Chrome's own suggestion-box Escape.
      e.preventDefault()
      e.stopPropagation()
      setSuggestion(null)
    }
  }

  const handleKeyUp = (e) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', 'Tab', 'Escape'].includes(e.key)) return
    refreshSuggestions(e.target.value, e.target.selectionStart)
  }

  return (
    <div className="devedit-autocomplete-wrap">
      <textarea
        ref={textareaRef}
        className="devedit-rule-textarea"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onClick={(e) => refreshSuggestions(e.target.value, e.target.selectionStart)}
        onBlur={() => setSuggestion(null)}
        rows={rows}
        spellCheck={false}
        disabled={disabled}
      />
      {suggestion && (
        <CssAutocompletePopup
          options={suggestion.options}
          activeIndex={suggestion.activeIndex}
          position={suggestion.position}
          onSelect={applySuggestion}
          onHover={(i) => setSuggestion(s => s && { ...s, activeIndex: i })}
        />
      )}
    </div>
  )
}

// ─── Edit panel (per selected element) ───────────────────────────────

function EditPanel({
  selection, rows, onDraftChange, onAddRule, onClose, error,
  activeTab, onTabChange, containerRef, hasIconSwap, onIconPreview, onIconClearPreview, onIconApply, onIconReset,
  elementEditInitial, elementPanelRef, elementDraftDirty, onElementDirtyChange, elementResetNonce, hasElementEditToReset,
  applyingAll, onPanelApply, onPanelCancel, onPanelReset,
}) {
  // Only read when rows.length === 0 below ("no rule matches this element")
  // — offers one of the element's own classes as a selector to create a
  // brand-new rule under.
  const addableClasses = selection.el.classList ? Array.from(selection.el.classList) : []
  // The Icon tab only ever exists when the selection resolves to one <svg>
  // AND that svg passes isLikelyIcon (square/small/monochrome) — for every
  // other element, including a matched-but-not-icon-shaped svg (an
  // illustration, a logo), that tab is simply absent. The Element tab, by
  // contrast, is offered for every selection — Ben's own ask for this was
  // general-purpose, not conditional the way icon-swapping is — so the tab
  // strip itself is now always shown (a plain "Edit styles" title with no
  // strip at all was the pre-Element-tab behaviour).
  const showIconTab = !!selection.svgEl
  const isSvgTab = activeTab === 'svg' && showIconTab
  const isElementTab = activeTab === 'element'
  const panelWidth = isSvgTab ? SVG_PANEL_WIDTH : PANEL_WIDTH
  const basePos = computeEditPanelPosition(selection.rect, panelWidth)

  // Manual drag override — null until the user actually drags the header,
  // at which point it takes over from the auto-computed basePos entirely
  // (always expressed as a plain {left, top}, regardless of whether
  // basePos itself was top- or bottom-anchored). Resets whenever a
  // genuinely different element is selected, so a fresh selection always
  // starts at its own sensible auto-computed position rather than
  // inheriting wherever the panel was last dragged to.
  const [dragPos, setDragPos] = useState(null)
  const dragStateRef = useRef(null)
  useEffect(() => { setDragPos(null) }, [selection.el])

  const handleHeaderMouseDown = (e) => {
    if (e.button !== 0 || e.target.closest('button')) return
    const panelEl = e.currentTarget.closest('.devedit-panel')
    const startRect = panelEl.getBoundingClientRect()
    dragStateRef.current = {
      startX: e.clientX, startY: e.clientY, startLeft: startRect.left, startTop: startRect.top,
    }
    const onMove = (ev) => {
      const d = dragStateRef.current
      if (!d) return
      const left = Math.max(-panelWidth + 80, Math.min(d.startLeft + (ev.clientX - d.startX), window.innerWidth - 80))
      const top = Math.max(0, Math.min(d.startTop + (ev.clientY - d.startY), window.innerHeight - 40))
      setDragPos({ left, top })
    }
    const onUp = () => {
      dragStateRef.current = null
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  const pos = dragPos || basePos

  // Unified Apply/Reset enabled state — the union of both tabs' own
  // dirtiness, not just whichever one happens to be showing right now,
  // since Apply/Cancel/Reset now act across both at once regardless of
  // which tab is active.
  const hasDirtyCss = rows.some(m => m.draft !== m.committed)
  const hasEditedCss = rows.some(m => m.committed !== m.original)
  const canApply = hasDirtyCss || elementDraftDirty
  const canReset = hasDirtyCss || hasEditedCss || elementDraftDirty || hasElementEditToReset

  return (
    <div className="devedit-panel" data-devedit-ui="true" style={{ left: pos.left, top: pos.top, bottom: pos.bottom, width: panelWidth }}>
      <div className="devedit-panel-header" onMouseDown={handleHeaderMouseDown}>
        <div className="devedit-tabs">
          <button className={`devedit-tab${!isSvgTab && !isElementTab ? ' active' : ''}`} onClick={() => onTabChange('styles')}>Edit styles</button>
          <button className={`devedit-tab${isElementTab ? ' active' : ''}`} onClick={() => onTabChange('element')}>Element</button>
          {showIconTab && (
            <button className={`devedit-tab${isSvgTab ? ' active' : ''}`} onClick={() => onTabChange('svg')}>Icon</button>
          )}
        </div>
        <button className="devedit-panel-close" onClick={onClose} aria-label="Close">×</button>
      </div>
      <div className="devedit-panel-body">
        {isSvgTab ? (
          <IconSwapPanel
            svgEl={selection.svgEl}
            iconSwapKey={selection.iconSwapKey}
            containerRef={containerRef}
            hasSwap={hasIconSwap}
            onPreview={onIconPreview}
            onClearPreview={onIconClearPreview}
            onApply={onIconApply}
            onReset={onIconReset}
          />
        ) : isElementTab ? (
          <ElementEditPanel
            ref={elementPanelRef}
            el={selection.el}
            elKey={selection.elementEditKey || selection.el}
            initial={elementEditInitial}
            onDirtyChange={onElementDirtyChange}
            resetNonce={elementResetNonce}
          />
        ) : (
          <>
            {rows.length === 0 && (
              <div className="devedit-panel-empty">
                No editable stylesheet rule matches this element.
                {addableClasses.length > 0 ? (
                  <div className="devedit-add-rule-list">
                    {addableClasses.map(cls => (
                      <button key={cls} className="devedit-btn-secondary" onClick={() => onAddRule(`.${cls}`)}>
                        + Add rule for .{cls}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="devedit-add-rule-hint">This element has no class name to attach a new rule to.</div>
                )}
              </div>
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
                  <RuleTextarea
                    value={m.draft}
                    onChange={(text) => onDraftChange(key, text)}
                    rows={Math.max(3, m.draft.split('\n').length)}
                    disabled={m.loading || applyingAll}
                  />
                </div>
              )
            })}
          </>
        )}
      </div>
      {!isSvgTab && (
        <div className="devedit-panel-footer">
          {error && <div className="devedit-error">{error}</div>}
          <div className="devedit-rule-actions">
            <button className="devedit-btn-secondary" onClick={onPanelCancel} disabled={applyingAll}>
              Cancel
            </button>
            <button className="devedit-btn-secondary" onClick={onPanelReset} disabled={applyingAll || !canReset}>
              Reset
            </button>
            <button className="devedit-btn-primary" onClick={onPanelApply} disabled={applyingAll || !canApply}>
              {applyingAll ? 'Applying…' : 'Apply'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
