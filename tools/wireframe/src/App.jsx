import { useCallback, useEffect, useRef, useState } from 'react'
import Toolbar from './Toolbar'
import WireframeMenu from './WireframeMenu'
import FontPanel from './FontPanel'
import Canvas from './Canvas'
import { cloneElements, clampZoom, ZOOM_STEP } from './geometry'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { auth, db, SHARED_EMAIL } from '../../../Components/firebase'
import { getStoredAuthor, storeAuthor } from '../../../Components/authorIdentity'
import { getSignInAt, setSignInAt, clearSignInAt, isSessionExpired } from '../../../Components/sharedAuthSession'

const FILLABLE_TYPES = new Set(['frame', 'rect', 'ellipse', 'triangle', 'text'])
// Types that actually render a stroke/border at all (text never does —
// created with stroke:null/strokeWidth:0 and ElementRenderer never draws
// one for it) — Border Fill is scoped to this set, one step broader than
// FILLABLE_TYPES since arrow has a stroke (its line colour) but no fill.
const STROKEABLE_TYPES = new Set(['frame', 'rect', 'ellipse', 'triangle', 'arrow'])
const HISTORY_LIMIT = 50
const DEFAULT_TEXT_STYLE = { fontFamily: 'Barlow', fontWeight: 400, fontSize: 16, textAlign: 'left', verticalAlign: 'top', textColor: '#333333' }
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
  // than creating a duplicate.
  const [currentFirestoreId, setCurrentFirestoreId] = useState(null)
  const [firestoreFiles, setFirestoreFiles] = useState([])

  const elementsRef = useRef(elements)
  elementsRef.current = elements
  const selectedIdsRef = useRef(selectedIds)
  selectedIdsRef.current = selectedIds
  const activeToolRef = useRef(activeTool)
  activeToolRef.current = activeTool

  // Plain ref, not state — clipboard contents don't need to trigger a
  // render, only to be read back on the next ⌘V.
  const clipboardRef = useRef(null)

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

  // Font-panel-eligible selection: a text element always qualifies; a
  // rect/ellipse/arrow only once it actually has text (an empty shape
  // stays a plain box with no font controls — matches the Text tool's own
  // "select it to style it" flow, but only once there's something to
  // style). Frame is deliberately excluded — its label is a name badge
  // above the box, not styleable body text.
  const STYLEABLE_SHAPE_TYPES = new Set(['rect', 'ellipse', 'triangle', 'arrow'])
  const selectedStyleableEl = selectedIds.length === 1
    ? elements.find((el) => el.id === selectedIds[0]
        && (el.type === 'text' || (STYLEABLE_SHAPE_TYPES.has(el.type) && el.label?.trim())))
    : null
  const showFontPanel = activeTool === 'text' || !!selectedStyleableEl
  const fontPanelValue = selectedStyleableEl
    ? {
        fontFamily: selectedStyleableEl.fontFamily,
        fontWeight: selectedStyleableEl.fontWeight,
        fontSize: selectedStyleableEl.fontSize,
        textAlign: selectedStyleableEl.textAlign,
        verticalAlign: selectedStyleableEl.verticalAlign || (selectedStyleableEl.type === 'text' ? 'top' : 'middle'),
        textColor: selectedStyleableEl.textColor,
      }
    : pendingTextStyle

  // Edits the currently-selected element live if one qualifies (a real,
  // undoable mutation); otherwise just updates the *pending* defaults used
  // the next time a text element is placed — the panel is one component,
  // this decides which of the two it's actually driving.
  const handleFontChange = (patch) => {
    if (selectedStyleableEl) {
      pushHistory()
      setElements((prev) => prev.map((el) => (el.id === selectedStyleableEl.id ? { ...el, ...patch } : el)))
    } else {
      setPendingTextStyle((prev) => ({ ...prev, ...patch }))
    }
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
  const pushHistory = useCallback((snapshot) => {
    historyRef.current.push(snapshot || elementsRef.current)
    if (historyRef.current.length > HISTORY_LIMIT) historyRef.current.shift()
  }, [])
  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return
    const prev = historyRef.current.pop()
    setElements(prev)
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

      if ((e.metaKey || e.ctrlKey) && !isTyping) {
        const key = e.key.toLowerCase()
        if (key === 'z') { e.preventDefault(); undo(); return }
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
          return
        }
        if (key === 'v') {
          if (!clipboardRef.current || clipboardRef.current.length === 0) return
          e.preventDefault()
          pushHistory()
          const { elements: pasted } = cloneElements(clipboardRef.current, { x: 16, y: 16 })
          setElements((prev) => [...prev, ...pasted])
          setSelectedIds(pasted.map((el) => el.id))
          return
        }
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
  }, [contextMenu, showExitPrompt, menuOpen, pushHistory, undo])

  const handleFillChange = (hex) => {
    if (selectedIds.length === 0) return
    pushHistory()
    setElements((prev) => prev.map((el) => (selectedIds.includes(el.id) && FILLABLE_TYPES.has(el.type) ? { ...el, fill: hex } : el)))
  }

  const handleStrokeChange = (hex) => {
    if (selectedIds.length === 0) return
    pushHistory()
    setElements((prev) => prev.map((el) => (selectedIds.includes(el.id) && STROKEABLE_TYPES.has(el.type) ? { ...el, stroke: hex } : el)))
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
      if (currentFirestoreId) {
        await updateDoc(doc(db, 'wireframe_saves', currentFirestoreId), payload)
      } else {
        const ref = await addDoc(collection(db, 'wireframe_saves'), { ...payload, createdAt: serverTimestamp() })
        setCurrentFirestoreId(ref.id)
      }
      setWireframeName(name)
      savedSnapshotRef.current = elements
      const fileName = currentFileName || slugify(name)
      postJson('/__wireframe/save', { fileName, name, elements, authorName: authorName.trim() })
        .then((data) => { if (data?.ok) { setCurrentFileName(fileName); refreshFileList() } })
        .catch(() => { /* dev-only endpoint — silently no-op if unreachable */ })
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
      setSelectedIds([])
      setActiveTool('pointer')
      historyRef.current = []
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
      setCurrentFirestoreId(null)
      setSelectedIds([])
      setActiveTool('pointer')
      historyRef.current = []
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
    setActiveTool('pointer')
    setSaveError(null)
    historyRef.current = []
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
      if (currentFirestoreId === id) setCurrentFirestoreId(null)
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
        error={saveError}
      />

      {showFontPanel && (
        <FontPanel value={fontPanelValue} onChange={handleFontChange} showAlignment={selectedStyleableEl?.type !== 'arrow'} />
      )}

      <Canvas
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
        zoom={zoom}
        setZoom={setZoom}
      />

      <Toolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        canFill={canFill}
        currentFill={currentFill}
        onFillChange={handleFillChange}
        canBorderFill={canBorderFill}
        currentStroke={currentStroke}
        onStrokeChange={handleStrokeChange}
        currentStrokeWidth={currentStrokeWidth}
        onStrokeWidthChange={handleStrokeWidthChange}
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
