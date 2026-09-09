import { useCallback, useEffect, useRef, useState } from 'react'
import Toolbar from './Toolbar'
import WireframeMenu from './WireframeMenu'
import FontToolbar from './FontToolbar'
import Canvas from './Canvas'
import { cloneElements, clampZoom, ZOOM_STEP, computeBoundingBox, alignElements, nudgeElements, GRID, makeId, snap, DEFAULT_SIZE } from './geometry'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { auth, db, SHARED_EMAIL } from '../../../Components/firebase'
import { getStoredAuthor, storeAuthor } from '../../../Components/authorIdentity'
import { getSignInAt, setSignInAt, clearSignInAt, isSessionExpired } from '../../../Components/sharedAuthSession'

const FILLABLE_TYPES = new Set(['frame', 'rect', 'ellipse', 'triangle', 'text'])
// Every real element type except Frame — used to gate the floating
// toolbar's font/alignment/text-colour section (Frame's `label` is a
// name badge above the box, not styleable body text).
const FONT_CAPABLE_TYPES = new Set(['text', 'rect', 'ellipse', 'triangle', 'arrow'])
// Types that render a stroke/border. Text used to be excluded here
// (created with stroke:null/strokeWidth:0) since Border Fill only ever
// lived in the bottom toolbar and wasn't offered for text — Ben's own
// "these options should also apply to text objects" ask (moving Fill/
// Border into the floating toolbar) removes that exclusion; ElementRenderer
// already draws a border for any type generically off el.stroke/
// strokeWidth, so no rendering change was needed, only this set.
const STROKEABLE_TYPES = new Set(['frame', 'rect', 'ellipse', 'triangle', 'arrow', 'text'])
const HISTORY_LIMIT = 50
const DEFAULT_TEXT_STYLE = { fontFamily: 'Barlow', fontWeight: 400, fontStyle: 'normal', fontSize: 16, textAlign: 'left', verticalAlign: 'top', textColor: '#333333' }
// Bare-letter tool shortcuts (no modifier) — Ellipse uses O (circle/oval)
// rather than its own first letter, since Rect/Frame/Text/Arrow already
// claim R/F/T/A and "O" reads more intuitively for a circular shape.
const TOOL_SHORTCUT_KEYS = { r: 'rect', o: 'ellipse', f: 'frame', t: 'text', a: 'arrow' }

function slugify(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'untitled'
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  })
  return res.json()
}

export default function App() {
  const [elements, setElements] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [activeTool, setActiveTool] = useState('pointer')
  const [contextMenu, setContextMenu] = useState(null) // {x, y} | null
  const [autoEditId, setAutoEditId] = useState(null)
  // { id, char } | null — set by the keydown handler below when a single
  // styleable element is selected and the user just starts typing, without
  // double-clicking first. Consumed the same way autoEditId is (the target
  // element opens editing and seeds its draft with `char`), just triggered
  // by a keystroke instead of the drop/placement moment.
  const [typeEditTarget, setTypeEditTarget] = useState(null)
  const [pendingTextStyle, setPendingTextStyle] = useState(DEFAULT_TEXT_STYLE)
  // View state only — not part of a saved wireframe's JSON, resets to 100%
  // on reload. Lives here (not Canvas.jsx) so this file's own keydown
  // handler can drive the Cmd/Ctrl+=/-/0 shortcuts below with the same
  // single source of truth Canvas.jsx's zoom control/wheel-zoom use.
  const [zoom, setZoom] = useState(1)

  const [wireframeName, setWireframeName] = useState('')
  const [currentFileName, setCurrentFileName] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  // Brief post-save confirmation on the Save button itself ("Saved", with a
  // checkmark) — previously a successful save gave no visible feedback at
  // all beyond the button reverting from "Saving…" back to "Save", which
  // looked identical to nothing having happened. justSavedTimeoutRef clears
  // any still-pending revert before starting a new one, so saving twice in
  // quick succession doesn't cut the confirmation short or leave two
  // competing timeouts racing to reset it.
  const [justSaved, setJustSaved] = useState(false)
  const justSavedTimeoutRef = useRef(null)
  const [showExitPrompt, setShowExitPrompt] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const [savedFiles, setSavedFiles] = useState([])

  // ── Shared save (Firestore) ── same shared password/Firebase Auth
  // session Components/DevEdit.jsx uses (Components/firebase.js's `auth`,
  // Components/sharedAuthSession.js's expiry helpers) — someone already
  // signed in via Dev Edit on another prototype in the same browser is
  // already signed in here too, no second prompt needed.
  const [authUser, setAuthUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [authorName, setAuthorName] = useState(getStoredAuthor)
  const [gateStep, setGateStep] = useState(null) // null | 'password' | 'name'
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState(null)
  const [signingIn, setSigningIn] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const isAuthed = !!authUser

  // currentFileName (above) tracks the local dev-only file; this is its
  // Firestore counterpart, so a repeated save updates the same doc rather
  // than creating a duplicate. Persisted INSIDE the local file itself
  // (a `firestoreId` field, written by performSave's local mirror, read
  // back by performLoad's local branch) — without that, reopening a local
  // file always reset this to null, so the very next save silently created
  // a brand-new cloud doc under the same name, effectively "undeleting" a
  // cloud copy that had been deliberately removed on the live site.
  const [currentFirestoreId, setCurrentFirestoreId] = useState(null)
  // Set once a save discovers its linked cloud doc no longer exists (it was
  // deleted, e.g. from the live site) — from then on, saves for THIS file
  // never automatically recreate a cloud copy, even though currentFirestoreId
  // is null (same null value a file that never had a cloud copy would have).
  // Also persisted in the local file, for the same reason as firestoreId.
  const [cloudUnlinked, setCloudUnlinked] = useState(false)
  const [firestoreFiles, setFirestoreFiles] = useState([])

  const elementsRef = useRef(elements)
  elementsRef.current = elements
  const selectedIdsRef = useRef(selectedIds)
  selectedIdsRef.current = selectedIds
  const activeToolRef = useRef(activeTool)
  activeToolRef.current = activeTool

  // Lifted up from Canvas.jsx (which used to create its own) specifically so
  // the keyboard-paste handler below can convert a screen point (the
  // current viewport's own center, since a keyboard paste has no cursor
  // position of its own to anchor to) into canvas-space coordinates —
  // otherwise identical to how useCanvasInteraction's own getCanvasPoint
  // already does this for every mouse-driven interaction.
  const canvasRef = useRef(null)

  // Plain ref, not state — clipboard contents don't need to trigger a
  // render, only to be read back on the next ⌘V.
  const clipboardRef = useRef(null)
  // How many times ⌘V has been pressed since the last ⌘C — every paste
  // used to clone at the exact same fixed +16/+16 offset from the
  // clipboard's original position, so a 2nd/3rd paste landed exactly on
  // top of the 1st and looked like nothing had happened. Reset on every
  // fresh ⌘C so a new copy always starts its own cascade from scratch.
  const pasteCountRef = useRef(0)

  // What to do once the dirty-check (showExitPrompt) resolves — set by
  // requestSwitch() before showing the prompt, read by handleExitDiscard/
  // handleExitSave (via saveAndMaybeContinue) once the user decides.
  // { type: 'exit' } | { type: 'load', source, id } | { type: 'new' } | null.
  // Generalizes what used to be a single boolean (pendingExitAfterSaveRef)
  // only ever meaning "exit" — now the same gate also covers switching to a
  // different saved wireframe or starting a new one.
  const pendingActionRef = useRef(null)

  // What to do once the *auth* gate (gateStep) resolves — separate from the
  // dirty-check above, since it can now be reached from two different
  // places: Save (needs password + a stored author name) and a cloud
  // delete (needs only the password, no name/attribution required to
  // remove something). { type: 'save' } | { type: 'delete', id, name } | null.
  const pendingAuthActionRef = useRef(null)

  // ── Dirty tracking for the exit-confirmation prompt ── captures the
  // mount-time elements reference once, then compares by reference — every
  // real mutation already produces a fresh array via setElements, so this
  // needs no deep-equality. Reset (by re-pointing this ref at the same
  // array just handed to setElements) right after a successful Save, Load,
  // or New.
  const savedSnapshotRef = useRef(elements)
  const isDirty = elements !== savedSnapshotRef.current

  // Reached via a prototype's own Wireframe toggle (Components/
  // WireframeToggle.jsx), which opens this page inside an iframe within a
  // modal rather than navigating — ?embedded=1 marks that case. The
  // back-link/exit-flow behave completely differently then (see below):
  // there's no "navigate back," closing means asking the parent page to
  // remove the iframe, via postMessage.
  const isEmbedded = new URLSearchParams(window.location.search).get('embedded') === '1'

  // The one place "leaving this tool" actually happens, however it was
  // reached — every exit call-site (Discard, a save the exit flow
  // triggered, a parent's close request once nothing's unsaved) funnels
  // through this instead of duplicating the isEmbedded branch each time.
  const exitTool = () => {
    if (isEmbedded) {
      window.parent.postMessage({ type: 'wireframe:close' }, window.location.origin)
    } else {
      window.location.href = '../../'
    }
  }

  const selectedFillable = elements.filter((el) => selectedIds.includes(el.id) && FILLABLE_TYPES.has(el.type))
  const canFill = selectedFillable.length > 0
  const currentFill = selectedFillable[0]?.fill || null

  const selectedStrokeable = elements.filter((el) => selectedIds.includes(el.id) && STROKEABLE_TYPES.has(el.type))
  const canBorderFill = selectedStrokeable.length > 0
  const currentStroke = selectedStrokeable[0]?.stroke || null
  const currentStrokeWidth = selectedStrokeable[0]?.strokeWidth ?? 1

  // The one selected element, regardless of type, whenever exactly one is
  // selected — this is what the floating toolbar anchors its box to when
  // nothing else is selected alongside it. Not gated on already having
  // text, so the toolbar doubles as a way to preset style *before* typing
  // (double-click/type-to-edit still opens the actual text edit).
  const selectedSoleEl = selectedIds.length === 1 ? elements.find((el) => el.id === selectedIds[0]) : null
  const isMultiSelect = selectedIds.length > 1
  // Font/alignment/text-colour section — Ben: "have the same options when
  // multiple elements" — now shows for a multi-select too, as long as at
  // least one member is font-capable (mirrors how Fill/Border already
  // bulk-apply across a multi-select below). Frame is still excluded
  // regardless of selection count — its own `label` is a name badge
  // above the box, not styleable body text, so it only ever gets Fill/
  // Border.
  const selectedFontCapable = elements.filter((el) => selectedIds.includes(el.id) && FONT_CAPABLE_TYPES.has(el.type))
  const fontToolbarShowFontControls = selectedFontCapable.length > 0
  // Alignment: hidden only for a *lone* selected arrow (no meaningful
  // "align this text" for a single floating line label) — a multi-select
  // that happens to include an arrow still shows it, since "align these
  // elements to each other" is a perfectly sensible geometric operation
  // regardless of type (see alignElements in geometry.js).
  const fontToolbarShowAlignment = fontToolbarShowFontControls && !(selectedSoleEl?.type === 'arrow')
  // The toolbar itself shows for any single selection (Fill/Border always
  // apply per that one element's own type; Frame gets Fill/Border only),
  // AND for a multi-select where at least one member is fillable/
  // strokeable/font-capable. This is what makes moving Fill/Border out of
  // the bottom Toolbar (Ben: "so I don't have to go to the menu at the
  // bottom of the screen") not a regression for the bulk-apply-to-a-
  // multi-select case that toolbar used to also cover.
  const showContextToolbar = selectedSoleEl != null || (isMultiSelect && (canFill || canBorderFill || fontToolbarShowFontControls))
  // The toolbar floats above the real selection box, so — unlike the old
  // docked panel — it has nothing to anchor to before something is
  // actually selected. Dropped the old "customize defaults for the next
  // placed text" case (armed Text tool, nothing selected yet): a freshly
  // placed element auto-selects immediately, so this only costs one beat,
  // not a real capability, and pendingTextStyle still supplies its fixed
  // defaults.
  const fontToolbarBox = showContextToolbar ? computeBoundingBox(elements, selectedIds) : null
  // For a multi-select, the displayed "current" value is just the first
  // font-capable member's own — same convention selectedFillable[0]/
  // selectedStrokeable[0] already use above for Fill/Border, rather than
  // a genuine mixed-value indicator (not worth the extra complexity for
  // this tool). For font/weight/size/text-colour this is a real (if
  // approximate) preview; for alignment specifically it's not shown at
  // all in multi-select mode — see FontToolbar.jsx's own `isMultiSelect`
  // branch, since clicking an alignment option there triggers an
  // immediate align action instead of reflecting/setting a shared value.
  const fontToolbarValue = fontToolbarShowFontControls
    ? {
        fontFamily: selectedFontCapable[0].fontFamily,
        fontWeight: selectedFontCapable[0].fontWeight,
        fontSize: selectedFontCapable[0].fontSize,
        textAlign: selectedFontCapable[0].textAlign,
        verticalAlign: selectedFontCapable[0].verticalAlign || (selectedFontCapable[0].type === 'text' ? 'top' : 'middle'),
        textColor: selectedFontCapable[0].textColor,
      }
    : null

  // Only ever called while fontToolbarShowFontControls is true (the
  // toolbar section that calls this doesn't render otherwise) — bulk-
  // applies to every selected font-capable element, same "single and
  // multi are the same operation" pattern handleFillChange/
  // handleStrokeChange already use (a single selection is just the N=1
  // case of the same map, no special-casing needed).
  const handleFontChange = (patch) => {
    if (selectedFontCapable.length === 0) return
    pushHistory()
    setElements((prev) => prev.map((el) => (selectedIds.includes(el.id) && FONT_CAPABLE_TYPES.has(el.type) ? { ...el, ...patch } : el)))
  }

  // Ben: "when a vertical alignment option is selected then it should
  // align the elements" — for 2+ selected elements, the same Alignment
  // popup's buttons reposition the elements relative to each other
  // (Figma-style) instead of setting each one's own text/vertical-align
  // field (that meaning stays exactly as before for a single selection —
  // see FontToolbar.jsx's own `isMultiSelect` branch, which decides which
  // of the two this actually calls). Only ever invoked with 2+ selected;
  // a lone element aligning to its own bounding box would be a no-op.
  const handleAlignElements = (axis, mode) => {
    if (selectedIds.length < 2) return
    pushHistory()
    setElements((prev) => alignElements(prev, selectedIds, axis, mode))
  }

  // Ben: "I'd like the ability to paste into a group, so double clicking
  // into the group, pasting and the new element being part of the group."
  // Double-clicking an already-grouped element isolates it as the sole
  // selection (Canvas.jsx's handleDoubleClick — a pre-existing mechanism,
  // not something new added for this) while its own `groupId` stays set —
  // that's the "inside the group" signal this hooks into: whenever the
  // CURRENT selection is exactly one element that already belongs to a
  // group, a paste right after should join that same group rather than
  // landing as an ungrouped sibling on top of it. Read via refs (not the
  // closured selectedIds/elements state) since both paste paths that call
  // this run from the keydown handler, same reasoning as everything else
  // in that handler.
  const contextGroupId = () => {
    const ids = selectedIdsRef.current
    if (ids.length !== 1) return null
    return elementsRef.current.find((el) => el.id === ids[0])?.groupId || null
  }

  // The internal element-clipboard paste (⌘C a shape, ⌘V it back) — pulled
  // out of the keydown handler into its own function specifically so the
  // group-context logic below exists in exactly one place, not duplicated
  // across this handler's two separate ⌘V call sites (the general one and
  // the narrower one that also fires while mid-rename-edit).
  const pasteInternalClipboard = () => {
    pushHistory()
    pasteCountRef.current += 1
    const step = pasteCountRef.current * 16
    const { elements: pasted } = cloneElements(clipboardRef.current, { x: step, y: step })
    // Only join the current context group when the copied elements had none
    // of their own — cloneElements (geometry.js) already remaps a COPIED
    // group's own shared groupId to a fresh one, so pasting a group you
    // copied correctly keeps forming its own distinct new group, unchanged
    // by this. Forcing that case into the current context group too would
    // silently merge two unrelated groups together — a bigger, more
    // surprising change than what was actually asked for.
    const groupId = contextGroupId()
    const finalPasted = groupId && !clipboardRef.current.some((el) => el.groupId)
      ? pasted.map((el) => ({ ...el, groupId }))
      : pasted
    setElements((prev) => [...prev, ...finalPasted])
    setSelectedIds(finalPasted.map((el) => el.id))
  }

  // Ben: "add the ability to paste text straight onto canvas" — ⌘V with
  // nothing internally copied (clipboardRef empty, see the keydown handler
  // below) now falls through to the real OS clipboard instead of being a
  // no-op. `navigator.clipboard.readText()` is async and only reliably
  // resolves without a permission prompt when called directly from a user
  // gesture — the keydown handler calling this synchronously (not awaited)
  // is exactly that gesture.
  //
  // Placed at the current viewport's own center (converted to canvas-space
  // via canvasRef + zoom, the same conversion useCanvasInteraction's own
  // getCanvasPoint does for a mouse position) — a keyboard paste has no
  // cursor position of its own to anchor to, so "wherever you're currently
  // looking" is the only sensible default, same reasoning any design tool
  // uses for a paste with no prior copy on the same canvas.
  //
  // Single-line text becomes an autoSize element (matches a plain click
  // with the Text tool exactly — sized to content, no visible box) with a
  // placeholder w/h from DEFAULT_SIZE.text, corrected the first time it's
  // actually re-edited (ElementRenderer's own commit-time measurement) —
  // the same "wrong until first edit" tolerance a freshly click-placed
  // empty text element already has, not a new gap this introduces.
  // Multi-line text becomes a bound (non-autoSize) box instead, since an
  // autoSize text element's editor is always a single-line <input> (v5) —
  // pasting a paragraph into that would silently collapse every line
  // break; a bound box's <textarea> editor preserves them.
  const pasteTextFromClipboard = () => {
    if (!navigator.clipboard?.readText) return
    // Captured synchronously, before the async readText() resolves — the
    // selection at the moment ⌘V was actually pressed is what "pasting
    // into this group" should mean, not whatever it might be by the time
    // the promise settles (nothing else can change it in between in
    // practice, but reading it now is the correct thing regardless).
    const groupId = contextGroupId()
    navigator.clipboard.readText().then((text) => {
      const trimmed = text?.trim()
      if (!trimmed) return
      const rect = canvasRef.current?.getBoundingClientRect()
      const center = rect
        ? { x: (window.innerWidth / 2 - rect.left) / zoom, y: (window.innerHeight / 2 - rect.top) / zoom }
        : { x: 200, y: 200 }
      const isMultiline = trimmed.includes('\n')
      const w = isMultiline ? 320 : DEFAULT_SIZE.text.w
      const h = isMultiline ? Math.min(400, Math.max(80, trimmed.split('\n').length * 24 + 16)) : DEFAULT_SIZE.text.h
      const newEl = {
        id: makeId(),
        type: 'text',
        x: snap(center.x - w / 2),
        y: snap(center.y - h / 2),
        w,
        h,
        autoSize: !isMultiline,
        label: trimmed,
        fill: null,
        stroke: null,
        strokeWidth: 0,
        // Same fields (and the same source — pendingTextStyle, whatever the
        // user currently has the Text tool's own defaults set to) a
        // click/drag-placed text element gets in useCanvasInteraction.js —
        // pasting stays consistent with placing text any other way rather
        // than reverting to a fixed, ask-agnostic style.
        fontFamily: pendingTextStyle.fontFamily,
        fontWeight: pendingTextStyle.fontWeight,
        fontStyle: pendingTextStyle.fontStyle,
        fontSize: pendingTextStyle.fontSize,
        textAlign: pendingTextStyle.textAlign,
        textColor: pendingTextStyle.textColor,
        groupId,
        rotation: 0,
        flipX: false,
        flipY: false,
      }
      pushHistory()
      setElements((prev) => [...prev, newEl])
      setSelectedIds([newEl.id])
    }).catch(() => {})
  }

  // ── Undo: snapshot-based. pushHistory captures a pre-mutation elements
  // snapshot — called once per logical action (once per drag gesture, not
  // per mousemove tick), so an entire drag undoes in a single ⌘Z rather
  // than needing to be repeated per pixel of movement. Takes an optional
  // explicit snapshot (used by useCanvasInteraction's drag handlers, which
  // only decide *whether* to push at drag-END — see the comment on
  // onDragStart below for why) and defaults to the current elements for
  // App.jsx's own instant, non-drag actions (fill/delete/group/ungroup),
  // which push synchronously right before mutating.
  const historyRef = useRef([])
  // Redo — a mirror-image stack, populated only by undo() itself (each undo
  // pushes the state it's moving AWAY from, so redo can come back to it).
  // Any genuinely new action invalidates whatever "future" was there to
  // redo into, so pushHistory (called only by real user actions, never by
  // undo/redo themselves) clears it — same convention every other design
  // tool uses (e.g. Figma: undo, do something new, and the old redo branch
  // is simply gone).
  const redoRef = useRef([])
  const pushHistory = useCallback((snapshot) => {
    historyRef.current.push(snapshot || elementsRef.current)
    if (historyRef.current.length > HISTORY_LIMIT) historyRef.current.shift()
    redoRef.current = []
  }, [])
  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return
    redoRef.current.push(elementsRef.current)
    if (redoRef.current.length > HISTORY_LIMIT) redoRef.current.shift()
    const prev = historyRef.current.pop()
    setElements(prev)
    setSelectedIds([])
  }, [])
  const redo = useCallback(() => {
    if (redoRef.current.length === 0) return
    // Pushed directly onto historyRef, not via pushHistory — going through
    // pushHistory would immediately clear the very redoRef entry this call
    // is in the middle of consuming.
    historyRef.current.push(elementsRef.current)
    if (historyRef.current.length > HISTORY_LIMIT) historyRef.current.shift()
    const next = redoRef.current.pop()
    setElements(next)
    setSelectedIds([])
  }, [])

  const refreshFileList = useCallback(async () => {
    try {
      const data = await postJson('/__wireframe/list')
      if (data.ok) setSavedFiles(data.files)
    } catch {
      // Dev-only endpoint — silently no-op if it's unreachable (e.g. this
      // page loaded outside `vite dev`, though it's not expected to).
    }
  }, [])

  useEffect(() => { refreshFileList() }, [refreshFileList])

  // Mirrors Components/DevEdit.jsx's own auth effect exactly — same
  // Firebase project, same self-enforced one-week expiry timestamp, so a
  // session started in either tool is already correctly subject to the
  // other's expiry check.
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        if (isSessionExpired()) {
          clearSignInAt()
          signOut(auth)
          return
        }
        if (getSignInAt() === null) setSignInAt(Date.now())
      } else {
        clearSignInAt()
      }
      setAuthUser(user)
      setAuthReady(true)
    })
  }, [])

  // Live list of shared (Firestore) saves for this tool, merged into the
  // Load dropdown alongside the local dev-only files.
  useEffect(() => {
    const q = query(collection(db, 'wireframe_saves'))
    const unsub = onSnapshot(q, (snapshot) => {
      const files = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      files.sort((a, b) => (b.updatedAt?.toMillis?.() || 0) - (a.updatedAt?.toMillis?.() || 0))
      setFirestoreFiles(files)
    }, (err) => console.error('Wireframe tool: shared-save subscription failed', err))
    return unsub
  }, [])

  // Best-effort secondary safety net for an actual tab close/refresh/typed-
  // URL navigation — browsers always show their own generic wording here
  // regardless of any custom string, so this is not the primary UX; the
  // custom Save/Discard prompt on the in-app back-link (below) is.
  //
  // Reads elementsRef/savedSnapshotRef directly INSIDE the handler, rather
  // than closing over the `isDirty` value from whichever render last ran
  // this effect (previously the dependency here) — a real bug this caused:
  // saveAndMaybeContinue's save-then-navigate sequence updates
  // savedSnapshotRef.current (marking clean) and then calls exitTool()'s
  // `window.location.href = ...` in the very same synchronous/microtask
  // continuation, with no React render in between. Mutating a ref never
  // triggers a re-render, so this effect never got a chance to re-run and
  // re-subscribe with isDirty:false before the navigation fired — the
  // OLD, still-dirty-closured listener was what the browser actually
  // consulted, showing its native "changes may not be saved" dialog even
  // though the save had already genuinely succeeded. Reading both refs
  // fresh at the moment the event actually fires (rather than a value
  // captured at some earlier render) needs no re-subscription at all —
  // registered once, on mount.
  useEffect(() => {
    function handleBeforeUnload(e) {
      if (elementsRef.current === savedSnapshotRef.current) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // Embedded-in-a-modal only: the parent (Components/WireframeToggle.jsx)
  // owns the modal's visibility, but only this page knows whether it's
  // actually safe to close — so a close attempt (×, scrim, Escape) on the
  // parent side asks first rather than deciding unilaterally. Reuses the
  // exact same isDirty check and exit-prompt UI the standalone back-link
  // already uses; only the *destination* once confirmed (postMessage vs
  // navigate) differs, via exitTool.
  useEffect(() => {
    if (!isEmbedded) return
    function handleMessage(e) {
      if (e.origin !== window.location.origin) return
      if (e.data?.type !== 'wireframe:requestClose') return
      if (isDirty) { pendingActionRef.current = { type: 'exit' }; setShowExitPrompt(true) }
      else exitTool()
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [isEmbedded, isDirty])

  // ── Keyboard shortcuts ──
  // Escape precedence: close an open context menu → clear the selection →
  // reset an armed draw tool back to pointer. Canceling an in-progress
  // label edit is handled locally by the label input itself (see
  // ElementRenderer.jsx/ArrowLayer.jsx's own onKeyDown, which stops
  // propagation) — by the time a bare Escape reaches this listener, we're
  // guaranteed not to be mid-edit, so there's no separate branch for it
  // here. This is also the only way back to "pointer" now that the
  // Select toolbar button is gone (besides re-clicking an active tool
  // icon, see Toolbar.jsx).
  useEffect(() => {
    function handleKeyDown(e) {
      // A non-text control (the font panel's colour-picker/number inputs,
      // a <select>) staying focused after use must NOT count as "typing" —
      // otherwise, e.g., picking a custom text colour leaves the colour
      // <input> focused, and every tool shortcut (R/C/F/T/A) would
      // silently stop working until something else was clicked. Only a
      // genuine text-entry field (a plain text <input> or a <textarea>)
      // should suppress these.
      const active = document.activeElement
      const isTyping = active?.tagName === 'TEXTAREA'
        || (active?.tagName === 'INPUT' && (!active.type || active.type === 'text'))

      if (e.key === 'Escape') {
        if (showExitPrompt) { setShowExitPrompt(false); return }
        if (menuOpen) { setMenuOpen(false); return }
        if (contextMenu) { setContextMenu(null); return }
        if (selectedIdsRef.current.length > 0) { setSelectedIds([]); return }
        setActiveTool('pointer')
        return
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && !isTyping) {
        // Capture the ids into a plain local const *before* calling
        // setElements, rather than reading selectedIdsRef.current inside
        // the updater itself — a ref read inside a state updater is
        // unsound under React 18 StrictMode, which can invoke the same
        // updater a second time after other state (and this ref) has
        // already moved on, silently turning "delete these" into a no-op
        // once selectedIdsRef.current had already been reset to [] by the
        // sibling setSelectedIds([]) call below.
        const idsToDelete = selectedIdsRef.current
        if (idsToDelete.length === 0) return
        pushHistory()
        setElements((prev) => prev.filter((el) => !idsToDelete.includes(el.id)))
        setSelectedIds([])
        return
      }

      // Arrow-key nudge — Ben: "allow the user to move them using the
      // keyboard arrows". Plain arrow = 1px (fine, unsnapped — the only way
      // to get an element off the otherwise-everywhere 8px grid, until a
      // real grid-snap toggle exists); Shift+arrow = a full GRID step,
      // matching this tool's own established grid unit rather than an
      // arbitrary Figma-style 10px. Excludes every other modifier so it
      // never collides with a future Cmd/Option+arrow shortcut. `e.repeat`
      // (true for the auto-generated events while a key is held) gates
      // history — only the initial press pushes a snapshot, so holding an
      // arrow down to nudge repeatedly undoes as ONE step, the same
      // "one entry per gesture" convention a mouse drag already gets.
      //
      // Guarded by a broader check than the narrow `isTyping` above
      // (textarea/text-input only) — a focused <select> (font family/
      // weight) or a number <input> (font size, stroke thickness) both
      // have their own native arrow-key behaviour (change option / step
      // the value) that this must not steal just because a canvas element
      // also happens to be selected underneath.
      const isArrowKeyFormControl = active?.tagName === 'SELECT' || active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA'
      if (
        (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')
        && !isArrowKeyFormControl && !e.metaKey && !e.ctrlKey && !e.altKey
      ) {
        const ids = selectedIdsRef.current
        if (ids.length === 0) return
        e.preventDefault()
        const step = e.shiftKey ? GRID : 1
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0
        if (!e.repeat) pushHistory()
        setElements((prev) => nudgeElements(prev, ids, dx, dy))
        return
      }

      // ⌘B/⌘I — Ben: "bold or italicise text using the keyboard shortcuts
      // command + b and command + i", working both "when selecting an
      // element/s" and "when editing in the bounding box". Scoped (confirmed
      // via AskUserQuestion) to a whole-element toggle for now, not true
      // per-character rich text — a label here is one plain string with one
      // fontWeight/fontStyle for its entire text, not a set of independently
      // formatted spans, so highlighting only part of the text while editing
      // still toggles the WHOLE element's style rather than just the
      // selected portion. Real per-character rich text (contentEditable,
      // span storage, save/load format changes) is a separate, larger
      // future project. Reads/writes go through refs (elementsRef/
      // selectedIdsRef), not the closured elements/selectedIds state, for
      // the same reason every other shortcut in this handler already does —
      // this effect only resubscribes on a handful of unrelated
      // dependencies (see its own dependency array), so closured state can
      // go stale between re-subscriptions.
      const toggleFontField = (field, nextValue) => {
        const ids = selectedIdsRef.current
        const targets = elementsRef.current.filter((el) => ids.includes(el.id) && FONT_CAPABLE_TYPES.has(el.type))
        if (targets.length === 0) return false
        const newValue = nextValue(targets[0][field])
        pushHistory()
        setElements((prev) => prev.map((el) => (ids.includes(el.id) && FONT_CAPABLE_TYPES.has(el.type) ? { ...el, [field]: newValue } : el)))
        return true
      }
      // Toggles to/from exactly 'Bold' (700) rather than restoring whatever
      // specific weight was active before — this tool's typography model
      // has no separate "remembered previous weight" field, and Medium/
      // Semibold are rare enough starting points that always landing back
      // on Regular (400) is an acceptable simplification over adding one.
      const toggleBold = () => toggleFontField('fontWeight', (w) => (w >= 700 ? 400 : 700))
      const toggleItalic = () => toggleFontField('fontStyle', (s) => (s === 'italic' ? 'normal' : 'italic'))

      // ⌘C/⌘V get a narrower, separate gate from every other Cmd-shortcut
      // below — real bug, reported directly: double-clicking a shape (this
      // tool's own, if unintuitive, way to isolate a single member of a
      // persistent group — see groupMembersOf's own history) immediately
      // opens that shape's label for editing and focuses its input, which
      // made `isTyping` true and silently blocked ⌘C from ever running —
      // "double-click the circle, ⌘C, click away, ⌘V" pasted nothing,
      // because the shape-level clipboard was never actually populated.
      // Scoped specifically to `wf-label-input` (the shared class every
      // element-label editing input carries — rect/ellipse/text/frame/
      // arrow all use it) rather than lifting the isTyping gate globally,
      // so unrelated real text fields (the wireframe name field, save/
      // rename dialogs) keep their normal native copy/paste of typed text,
      // unaffected.
      const isEditingElementLabel = active?.classList?.contains('wf-label-input')
      if ((e.metaKey || e.ctrlKey) && isEditingElementLabel) {
        const key = e.key.toLowerCase()
        if (key === 'c') {
          const ids = selectedIdsRef.current
          if (ids.length === 0) return
          e.preventDefault()
          clipboardRef.current = elementsRef.current.filter((el) => ids.includes(el.id))
          pasteCountRef.current = 0
          return
        }
        if (key === 'v' && clipboardRef.current && clipboardRef.current.length > 0) {
          e.preventDefault()
          pasteInternalClipboard()
          return
        }
        if (key === 'b') { if (toggleBold()) e.preventDefault(); return }
        if (key === 'i') { if (toggleItalic()) e.preventDefault(); return }
        // No matching clipboard content (⌘V with nothing copied) or some
        // other Cmd-combo while editing a label — fall through to native
        // input behaviour rather than returning early.
      }

      if ((e.metaKey || e.ctrlKey) && !isTyping) {
        const key = e.key.toLowerCase()
        if (key === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return }
        // Zoom shortcuts — preventDefault stops the browser's own native
        // page-zoom, which these keys would otherwise trigger. '=' covers
        // the unshifted key most keyboards report for Cmd/Ctrl+'+'.
        if (key === '=' || key === '+') { e.preventDefault(); setZoom((z) => clampZoom(z + ZOOM_STEP)); return }
        if (key === '-' || key === '_') { e.preventDefault(); setZoom((z) => clampZoom(z - ZOOM_STEP)); return }
        if (key === '0') { e.preventDefault(); setZoom(1); return }
        if (key === 'c') {
          const ids = selectedIdsRef.current
          if (ids.length === 0) return
          e.preventDefault()
          clipboardRef.current = elementsRef.current.filter((el) => ids.includes(el.id))
          pasteCountRef.current = 0
          return
        }
        if (key === 'v') {
          if (!clipboardRef.current || clipboardRef.current.length === 0) {
            // Nothing internally copied — try the real OS clipboard instead
            // of treating this as a no-op (Ben: "add the ability to paste
            // text straight onto canvas").
            e.preventDefault()
            pasteTextFromClipboard()
            return
          }
          e.preventDefault()
          // Cascades further from the clipboard's original position with
          // each successive paste (16px per step, matching Figma's own
          // repeated-paste convention) instead of every paste landing at
          // the same fixed +16/+16 offset and stacking exactly on the last —
          // handled inside pasteInternalClipboard via pasteCountRef.
          pasteInternalClipboard()
          return
        }
        if (key === 'b') { if (toggleBold()) e.preventDefault(); return }
        if (key === 'i') { if (toggleItalic()) e.preventDefault(); return }
        if (key === 'g') {
          e.preventDefault()
          if (e.shiftKey) {
            const ids = selectedIdsRef.current
            const groupIds = new Set(elementsRef.current.filter((el) => ids.includes(el.id) && el.groupId).map((el) => el.groupId))
            if (groupIds.size === 0) return
            pushHistory()
            setElements((prev) => prev.map((el) => (groupIds.has(el.groupId) ? { ...el, groupId: null } : el)))
          } else {
            const ids = selectedIdsRef.current
            if (ids.length < 2) return
            pushHistory()
            const newGroupId = `g_${Date.now()}_${Math.floor(Math.random() * 1e6)}`
            setElements((prev) => prev.map((el) => (ids.includes(el.id) ? { ...el, groupId: newGroupId } : el)))
          }
        }
        return
      }

      // Typing while a single text/rect/ellipse/triangle/arrow is selected
      // starts editing it with the typed character, no double-click needed
      // first — an explicit ask: select, then just type. Checked (and
      // returns) before the bare-letter tool shortcuts right below, so
      // e.g. typing "r" onto a selected shape edits its text rather than
      // arming the Rect tool; with nothing styleable selected, target is
      // null and the shortcut branch runs exactly as before.
      if (!isTyping && !e.altKey && !e.metaKey && !e.ctrlKey && e.key.length === 1) {
        const ids = selectedIdsRef.current
        const target = ids.length === 1
          ? elementsRef.current.find((el) => el.id === ids[0] && FONT_CAPABLE_TYPES.has(el.type))
          : null
        if (target) {
          e.preventDefault()
          setTypeEditTarget({ id: target.id, char: e.key })
          return
        }
      }

      // Bare-letter tool shortcuts — never fire while typing, and the
      // metaKey/ctrlKey branch above already returned by this point, so
      // there's no risk of colliding with ⌘C/⌘V/⌘Z/⌘G. Also excludes
      // Option, since that's the alt-drag-duplicate modifier
      // (useCanvasInteraction.js), not a shortcut trigger here.
      if (!isTyping && !e.altKey) {
        const toolKey = TOOL_SHORTCUT_KEYS[e.key.toLowerCase()]
        if (toolKey) {
          e.preventDefault()
          setActiveTool(activeToolRef.current === toolKey ? 'pointer' : toolKey)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [contextMenu, showExitPrompt, menuOpen, pushHistory, undo, redo])

  const handleFillChange = (hex) => {
    if (selectedIds.length === 0) return
    pushHistory()
    setElements((prev) => prev.map((el) => (selectedIds.includes(el.id) && FILLABLE_TYPES.has(el.type) ? { ...el, fill: hex } : el)))
  }

  const handleStrokeChange = (hex) => {
    if (selectedIds.length === 0) return
    pushHistory()
    setElements((prev) => prev.map((el) => (selectedIds.includes(el.id) && STROKEABLE_TYPES.has(el.type)
      // Text is created with strokeWidth:0 (no border UI used to exist for
      // it) — setting a real colour with a 0 width would render invisibly.
      // Only bumps a genuinely-unset width; never touches one already set.
      ? { ...el, stroke: hex, strokeWidth: hex && !el.strokeWidth ? 1 : el.strokeWidth }
      : el)))
  }

  const handleStrokeWidthChange = (width) => {
    if (selectedIds.length === 0) return
    pushHistory()
    setElements((prev) => prev.map((el) => (selectedIds.includes(el.id) && STROKEABLE_TYPES.has(el.type) ? { ...el, strokeWidth: width } : el)))
  }

  const handleDeleteSelection = () => {
    if (selectedIds.length === 0) return
    pushHistory()
    setElements((prev) => prev.filter((el) => !selectedIds.includes(el.id)))
    setSelectedIds([])
  }

  // z-order for a multi-select/group: splice the whole selected block out
  // (preserving members' relative order) and re-insert it at the array's
  // start/end — still just "array order is z-order," now moving several
  // elements at once.
  const handleBringToFront = () => {
    if (selectedIds.length === 0) return
    pushHistory()
    setElements((prev) => {
      const selected = prev.filter((el) => selectedIds.includes(el.id))
      const rest = prev.filter((el) => !selectedIds.includes(el.id))
      return [...rest, ...selected]
    })
  }
  const handleSendToBack = () => {
    if (selectedIds.length === 0) return
    pushHistory()
    setElements((prev) => {
      const selected = prev.filter((el) => selectedIds.includes(el.id))
      const rest = prev.filter((el) => !selectedIds.includes(el.id))
      return [...selected, ...rest]
    })
  }

  // The actual write — assumes auth is already satisfied (requestSave,
  // below, is the gatekeeper that guarantees this). An empty name defaults
  // to "Untitled" rather than blocking the save at all. Also best-effort
  // mirrors the same content to the existing local dev-only endpoint
  // (silently ignored if unreachable, e.g. this page loaded outside `vite
  // dev`) so Ben's existing workflow of reading a wireframe's JSON straight
  // off disk keeps working unchanged. Returns true/false so callers (the
  // gate-completion handlers, the exit flow) can react to success.
  const performSave = async () => {
    if (saving) return false
    const name = wireframeName.trim() || 'Untitled'
    setSaving(true)
    setSaveError(null)
    try {
      const payload = { name, authorName: authorName.trim(), elements, updatedAt: serverTimestamp() }
      let firestoreId = currentFirestoreId
      let unlinked = cloudUnlinked
      let infoMessage = null
      if (unlinked) {
        // This file's cloud copy was previously found to be deleted — never
        // auto-recreate it from here. Local-only for as long as this stays
        // true (there's no "re-publish to shared" action yet).
      } else if (firestoreId) {
        try {
          await updateDoc(doc(db, 'wireframe_saves', firestoreId), payload)
        } catch (err) {
          if (err.code === 'not-found') {
            // The linked cloud doc is gone (deleted from the live site,
            // most likely) — do NOT fall back to creating a fresh one here;
            // that would silently resurrect something deliberately removed.
            // Remember this so every future save of this same file also
            // stays local-only, not just this one.
            firestoreId = null
            unlinked = true
            setCurrentFirestoreId(null)
            setCloudUnlinked(true)
            infoMessage = 'Shared copy was deleted — saved locally only.'
          } else {
            throw err
          }
        }
      } else {
        const ref = await addDoc(collection(db, 'wireframe_saves'), { ...payload, createdAt: serverTimestamp() })
        firestoreId = ref.id
        setCurrentFirestoreId(ref.id)
      }
      setWireframeName(name)
      savedSnapshotRef.current = elements
      const fileName = currentFileName || slugify(name)
      postJson('/__wireframe/save', { fileName, name, elements, authorName: authorName.trim(), firestoreId, cloudUnlinked: unlinked })
        .then((data) => { if (data?.ok) { setCurrentFileName(fileName); refreshFileList() } })
        .catch(() => { /* dev-only endpoint — silently no-op if unreachable */ })
      if (infoMessage) setSaveError(infoMessage)
      clearTimeout(justSavedTimeoutRef.current)
      setJustSaved(true)
      justSavedTimeoutRef.current = setTimeout(() => setJustSaved(false), 2000)
      return true
    } catch (err) {
      setSaveError(err.message || 'Failed to save')
      return false
    } finally {
      setSaving(false)
    }
  }

  // Dispatches whatever requestSwitch() stashed once it's actually safe to
  // proceed (either there was nothing to lose, or Discard/Save already
  // resolved that). The single place all three "switch away from the
  // current wireframe" flows converge.
  const runAction = (action) => {
    if (!action) return
    if (action.type === 'exit') exitTool()
    else if (action.type === 'new') performNew()
    else if (action.type === 'load') performLoad(action.source, action.id)
  }

  // The one gate every "this would discard unsaved changes" flow goes
  // through — back-link exit, picking a different saved wireframe from the
  // menu, and New. Nothing to lose → just do it; otherwise stash what was
  // requested and show the same Discard/Save prompt exit already used.
  const requestSwitch = (action) => {
    if (isDirty) {
      pendingActionRef.current = action
      setShowExitPrompt(true)
    } else {
      runAction(action)
    }
  }

  // If a save this function triggers succeeds and something was waiting on
  // it (requestSwitch stashed it before opening the prompt/gate), continue
  // on to that now — mirrors Components/DevEdit.jsx's own
  // pendingExitRef/finishExit pairing, generalized beyond just "exit."
  const saveAndMaybeContinue = async () => {
    const ok = await performSave()
    if (ok && pendingActionRef.current) {
      const action = pendingActionRef.current
      pendingActionRef.current = null
      runAction(action)
    }
    return ok
  }

  // The one entry point the exit prompt's Save button calls (there's no
  // longer a standalone Save button in the main UI — see WireframeMenu).
  // Saves immediately if already signed in (and a remembered name is on
  // file); otherwise opens the password/name gate, which resumes the save
  // itself once satisfied (submitPassword/submitName below) — mirrors
  // Components/DevEdit.jsx's toggleActive gate logic exactly.
  const requestSave = () => {
    pendingAuthActionRef.current = { type: 'save' }
    if (!authReady) return
    if (isAuthed && isSessionExpired()) {
      clearSignInAt()
      signOut(auth)
      setGateStep('password')
      return
    }
    if (!isAuthed) { setGateStep('password'); return }
    if (!authorName.trim()) { setGateStep('name'); return }
    saveAndMaybeContinue()
  }

  // Cloud delete needs the same shared sign-in as Save, but never the name
  // step — deleting doesn't attribute anything to anyone.
  const requestDeleteCloud = (id, name) => {
    pendingAuthActionRef.current = { type: 'delete', id, name }
    if (!authReady) return
    if (isAuthed && isSessionExpired()) {
      clearSignInAt()
      signOut(auth)
      setGateStep('password')
      return
    }
    if (!isAuthed) { setGateStep('password'); return }
    performDeleteCloud(id)
  }

  const submitPassword = async () => {
    if (!passwordInput || signingIn) return
    setSigningIn(true)
    setPasswordError(null)
    try {
      await signInWithEmailAndPassword(auth, SHARED_EMAIL, passwordInput)
      setPasswordInput('')
      const pending = pendingAuthActionRef.current
      if (pending?.type === 'delete') {
        setGateStep(null)
        pendingAuthActionRef.current = null
        performDeleteCloud(pending.id)
      } else if (authorName.trim()) {
        setGateStep(null)
        saveAndMaybeContinue()
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
    pendingAuthActionRef.current = null
    saveAndMaybeContinue()
  }

  const closeGate = () => {
    pendingActionRef.current = null
    pendingAuthActionRef.current = null
    setGateStep(null)
  }

  // The actual load — no dirty-check here, requestLoad (called from
  // WireframeMenu) always routes through requestSwitch first. `source`/
  // `id` come directly from whichever row was clicked (`cloud`/`local`),
  // replacing the old prefixed-dropdown-value parsing.
  const performLoad = async (source, id) => {
    setSaveError(null)

    if (source === 'cloud') {
      const match = firestoreFiles.find((f) => f.id === id)
      if (!match) { setSaveError('Failed to load'); return }
      const loadedElements = match.elements || []
      setElements(loadedElements)
      savedSnapshotRef.current = loadedElements
      setWireframeName(match.name || 'Untitled')
      setCurrentFirestoreId(match.id)
      setCurrentFileName(null)
      // A cloud-sourced load always corresponds to a real, currently-live
      // doc (it's in firestoreFiles, the live onSnapshot list) — never
      // treat it as unlinked just because a previous local session was.
      setCloudUnlinked(false)
      setSelectedIds([])
      setActiveTool('pointer')
      historyRef.current = []
      redoRef.current = []
      setMenuOpen(false)
      return
    }

    try {
      const data = await postJson('/__wireframe/load', { fileName: id })
      if (!data.ok) throw new Error(data.error || 'Failed to load')
      const loadedElements = data.data.elements || []
      setElements(loadedElements)
      savedSnapshotRef.current = loadedElements
      setWireframeName(data.data.name || id)
      setCurrentFileName(id)
      // Restore whichever cloud link (or deliberate absence of one) this
      // local file itself remembers, instead of always resetting to null —
      // see the fields' own declarations above for why this matters.
      setCurrentFirestoreId(data.data.firestoreId || null)
      setCloudUnlinked(!!data.data.cloudUnlinked)
      setSelectedIds([])
      setActiveTool('pointer')
      historyRef.current = []
      redoRef.current = []
      setMenuOpen(false)
    } catch (err) {
      setSaveError(err.message || 'Failed to load')
    }
  }
  const requestLoad = (source, id) => requestSwitch({ type: 'load', source, id })

  const performNew = () => {
    const empty = []
    setElements(empty)
    savedSnapshotRef.current = empty
    setSelectedIds([])
    setWireframeName('')
    setCurrentFileName(null)
    setCurrentFirestoreId(null)
    setCloudUnlinked(false)
    setActiveTool('pointer')
    setSaveError(null)
    historyRef.current = []
    redoRef.current = []
    setMenuOpen(false)
  }
  const requestNew = () => requestSwitch({ type: 'new' })

  // Local delete is ungated (same trust level as the local save-to-disk
  // endpoint already has — dev-only, Ben's own machine). Cloud delete goes
  // through requestDeleteCloud above since it needs the shared sign-in.
  const performDeleteLocal = async (fileName) => {
    setSaveError(null)
    try {
      const data = await postJson('/__wireframe/delete', { fileName })
      if (!data.ok) throw new Error(data.error || 'Failed to delete')
      if (currentFileName === fileName) setCurrentFileName(null)
      refreshFileList()
    } catch (err) {
      setSaveError(err.message || 'Failed to delete')
    }
  }
  const performDeleteCloud = async (id) => {
    setSaveError(null)
    try {
      await deleteDoc(doc(db, 'wireframe_saves', id))
      // If this was the currently-open wireframe's own cloud copy, mark it
      // unlinked too (not just clear the id) — otherwise saving again right
      // away (no reload in between) would immediately recreate it, same bug
      // as the stale-reload case performSave's not-found catch handles.
      if (currentFirestoreId === id) {
        setCurrentFirestoreId(null)
        setCloudUnlinked(true)
      }
    } catch (err) {
      setSaveError(err.message || 'Failed to delete')
    }
  }
  // Single entry point WireframeMenu calls for either source — confirms
  // once, then dispatches to the right backend.
  const requestDelete = (source, id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    if (source === 'local') performDeleteLocal(id)
    else requestDeleteCloud(id, name)
  }

  // ── Exit confirmation ── mirrors Components/DevEdit.jsx's own
  // ExitPrompt exactly: same message shape, Discard/Save (no separate
  // Cancel), backdrop-click cancels.
  const handleBackLinkClick = (e) => {
    if (!isDirty) return
    e.preventDefault()
    pendingActionRef.current = { type: 'exit' }
    setShowExitPrompt(true)
  }
  const handleExitDiscard = () => {
    const action = pendingActionRef.current
    pendingActionRef.current = null
    setShowExitPrompt(false)
    runAction(action)
  }
  const handleExitSave = () => {
    setShowExitPrompt(false)
    requestSave()
  }

  // Normalizes each backend's own shape into one common shape, sorted
  // newest-first within itself. Kept as two separate lists (rather than
  // merging into one flat array here) so WireframeMenu can decide whether
  // to show them under separate headings — local saves only exist at all
  // when running `vite dev` locally (the deployed site has no local
  // endpoints to list), so a "Local" heading only makes sense to show when
  // there's actually something under it. Firestore's updatedAt is a
  // Timestamp (.toMillis()); the local plugin's is a plain ISO string (or
  // null for a file whose own stat() lookup failed) — both normalized to
  // epoch ms so they still sort correctly against each other if ever
  // merged into one flat list.
  const cloudFiles = firestoreFiles
    .map((f) => ({
      source: 'cloud', id: f.id, name: f.name || 'Untitled', authorName: f.authorName || null,
      updatedAtMs: f.updatedAt?.toMillis?.() ?? 0,
    }))
    .sort((a, b) => b.updatedAtMs - a.updatedAtMs)
  const localFiles = savedFiles
    .map((f) => ({
      source: 'local', id: f.fileName, name: f.name || f.fileName, authorName: f.authorName || null,
      updatedAtMs: f.updatedAt ? new Date(f.updatedAt).getTime() : 0,
    }))
    .sort((a, b) => b.updatedAtMs - a.updatedAtMs)
  const currentFileKey = currentFirestoreId ? `cloud:${currentFirestoreId}` : currentFileName ? `local:${currentFileName}` : null

  return (
    <div className="wf-page">
      {/* No back-link at all when embedded in a prototype's modal (see
          Components/WireframeToggle.jsx) — the modal's own close button is
          the affordance there; a "← Prototypes" link inside an iframe that
          isn't really the prototype index would be confusing. */}
      {!isEmbedded && (
        <a href="../../" className="wf-back-link" onClick={handleBackLinkClick}>← Prototypes</a>
      )}

      <WireframeMenu
        wireframeName={wireframeName}
        setWireframeName={setWireframeName}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        cloudFiles={cloudFiles}
        localFiles={localFiles}
        currentFileKey={currentFileKey}
        onSelectFile={requestLoad}
        onNew={requestNew}
        onDelete={requestDelete}
        onSave={requestSave}
        saving={saving}
        justSaved={justSaved}
        error={saveError}
      />

      <Canvas
        canvasRef={canvasRef}
        elements={elements}
        setElements={setElements}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        onDragStart={pushHistory}
        onSendToBack={handleSendToBack}
        onBringToFront={handleBringToFront}
        onDelete={handleDeleteSelection}
        contextMenu={contextMenu}
        setContextMenu={setContextMenu}
        textDefaults={pendingTextStyle}
        onTextPlaced={setAutoEditId}
        autoEditId={autoEditId}
        onAutoEditConsumed={() => setAutoEditId(null)}
        typeEditTarget={typeEditTarget}
        onTypeEditConsumed={() => setTypeEditTarget(null)}
        zoom={zoom}
        setZoom={setZoom}
        fontToolbarBox={fontToolbarBox}
        fontToolbarValue={fontToolbarValue}
        onFontToolbarChange={handleFontChange}
        fontToolbarShowFontControls={fontToolbarShowFontControls}
        fontToolbarShowAlignment={fontToolbarShowAlignment}
        fontToolbarIsMultiSelect={isMultiSelect}
        onAlignElements={handleAlignElements}
        canFill={canFill}
        currentFill={currentFill}
        onFillChange={handleFillChange}
        canBorderFill={canBorderFill}
        currentStroke={currentStroke}
        onStrokeChange={handleStrokeChange}
        currentStrokeWidth={currentStrokeWidth}
        onStrokeWidthChange={handleStrokeWidthChange}
      />

      <Toolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
      />

      {showExitPrompt && (
        <div className="wf-context-backdrop" onMouseDown={() => setShowExitPrompt(false)}>
          <div className="wf-exit-prompt-box" onMouseDown={(e) => e.stopPropagation()}>
            <div className="wf-exit-prompt-title">You have unsaved changes</div>
            <div className="wf-exit-prompt-actions">
              <button className="wf-tool-btn" onClick={handleExitDiscard}>Discard</button>
              <button className="wf-tool-btn wf-primary" disabled={saving} onClick={handleExitSave}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
            {saveError && <div className="wf-toolbar-error">{saveError}</div>}
          </div>
        </div>
      )}

      {gateStep && (
        <div className="wf-context-backdrop" onMouseDown={closeGate}>
          <div className="wf-gate-box" onMouseDown={(e) => e.stopPropagation()}>
            {gateStep === 'password' ? (
              <>
                <div className="wf-gate-title">Enter password to save</div>
                <input
                  className="wf-gate-input"
                  type="password"
                  placeholder="Password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') submitPassword() }}
                  autoFocus
                />
                {passwordError && <div className="wf-toolbar-error">{passwordError}</div>}
                <div className="wf-gate-actions">
                  <button className="wf-tool-btn" onClick={closeGate}>Cancel</button>
                  <button className="wf-tool-btn wf-primary" onClick={submitPassword} disabled={!passwordInput || signingIn}>
                    {signingIn ? 'Checking…' : 'Unlock'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="wf-gate-title">What's your name?</div>
                <input
                  className="wf-gate-input"
                  placeholder="Your name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') submitName() }}
                  autoFocus
                />
                <div className="wf-gate-actions">
                  <button className="wf-tool-btn" onClick={closeGate}>Cancel</button>
                  <button className="wf-tool-btn wf-primary" onClick={submitName} disabled={!nameInput.trim()}>Continue</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
