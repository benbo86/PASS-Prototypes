import { useCallback, useEffect, useRef, useState } from 'react'
import Toolbar from './Toolbar'
import FileControls from './FileControls'
import FontPanel from './FontPanel'
import Canvas from './Canvas'
import { cloneElements, clampZoom, ZOOM_STEP } from './geometry'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { collection, query, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { auth, db, SHARED_EMAIL } from '../../../Components/firebase'
import { getStoredAuthor, storeAuthor } from '../../../Components/authorIdentity'
import { getSignInAt, setSignInAt, clearSignInAt, isSessionExpired } from '../../../Components/sharedAuthSession'

const FILLABLE_TYPES = new Set(['frame', 'rect', 'ellipse', 'text'])
const HISTORY_LIMIT = 50
const DEFAULT_TEXT_STYLE = { fontFamily: 'Barlow', fontWeight: 400, fontSize: 16, textAlign: 'left', textColor: '#333333' }
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
  const [saveStatus, setSaveStatus] = useState(null)
  const [showExitPrompt, setShowExitPrompt] = useState(false)

  const [savedFiles, setSavedFiles] = useState([])
  const [selectedLoadFile, setSelectedLoadFile] = useState('')

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

  // Set right before requestSave() opens the gate for an exit-triggered
  // save — resumed by submitPassword/submitName once the gate completes,
  // so navigation only happens once a save the exit flow triggered has
  // actually succeeded (mirrors Components/DevEdit.jsx's own pendingExitRef).
  const pendingExitAfterSaveRef = useRef(false)

  // ── Dirty tracking for the exit-confirmation prompt ── captures the
  // mount-time elements reference once, then compares by reference — every
  // real mutation already produces a fresh array via setElements, so this
  // needs no deep-equality. Reset (by re-pointing this ref at the same
  // array just handed to setElements) right after a successful Save, Load,
  // or New.
  const savedSnapshotRef = useRef(elements)
  const isDirty = elements !== savedSnapshotRef.current

  const selectedFillable = elements.filter((el) => selectedIds.includes(el.id) && FILLABLE_TYPES.has(el.type))
  const canFill = selectedFillable.length > 0
  const currentFill = selectedFillable[0]?.fill || null

  // Font-panel-eligible selection: a text element always qualifies; a
  // rect/ellipse/arrow only once it actually has text (an empty shape
  // stays a plain box with no font controls — matches the Text tool's own
  // "select it to style it" flow, but only once there's something to
  // style). Frame is deliberately excluded — its label is a name badge
  // above the box, not styleable body text.
  const STYLEABLE_SHAPE_TYPES = new Set(['rect', 'ellipse', 'arrow'])
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
  useEffect(() => {
    function handleBeforeUnload(e) {
      if (!isDirty) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

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
  }, [contextMenu, showExitPrompt, pushHistory, undo])

  const handleFillChange = (hex) => {
    if (selectedIds.length === 0) return
    pushHistory()
    setElements((prev) => prev.map((el) => (selectedIds.includes(el.id) && FILLABLE_TYPES.has(el.type) ? { ...el, fill: hex } : el)))
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
    setSaveStatus(null)
    try {
      const payload = { name, authorName: authorName.trim(), elements, updatedAt: serverTimestamp() }
      if (currentFirestoreId) {
        await updateDoc(doc(db, 'wireframe_saves', currentFirestoreId), payload)
      } else {
        const ref = await addDoc(collection(db, 'wireframe_saves'), { ...payload, createdAt: serverTimestamp() })
        setCurrentFirestoreId(ref.id)
      }
      setWireframeName(name)
      setSaveStatus('Saved')
      savedSnapshotRef.current = elements
      const fileName = currentFileName || slugify(name)
      postJson('/__wireframe/save', { fileName, name, elements })
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

  // If a save this function triggers succeeds and it was requested on
  // behalf of the exit flow (pendingExitAfterSaveRef), navigate away —
  // mirrors Components/DevEdit.jsx's own pendingExitRef/finishExit pairing.
  const saveAndMaybeExit = async () => {
    const ok = await performSave()
    if (ok && pendingExitAfterSaveRef.current) {
      pendingExitAfterSaveRef.current = false
      window.location.href = '../../'
    }
    return ok
  }

  // The one entry point both FileControls' Save button and the exit
  // prompt's Save button call. Saves immediately if already signed in (and
  // a remembered name is on file); otherwise opens the password/name gate,
  // which resumes the save itself once satisfied (submitPassword/
  // submitName below) — mirrors Components/DevEdit.jsx's toggleActive gate
  // logic exactly.
  const requestSave = () => {
    if (!authReady) return
    if (isAuthed && isSessionExpired()) {
      clearSignInAt()
      signOut(auth)
      setGateStep('password')
      return
    }
    if (!isAuthed) { setGateStep('password'); return }
    if (!authorName.trim()) { setGateStep('name'); return }
    saveAndMaybeExit()
  }

  const submitPassword = async () => {
    if (!passwordInput || signingIn) return
    setSigningIn(true)
    setPasswordError(null)
    try {
      await signInWithEmailAndPassword(auth, SHARED_EMAIL, passwordInput)
      setPasswordInput('')
      if (authorName.trim()) {
        setGateStep(null)
        saveAndMaybeExit()
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
    saveAndMaybeExit()
  }

  const closeGate = () => {
    pendingExitAfterSaveRef.current = false
    setGateStep(null)
  }

  // Load dropdown values are prefixed (`local:<fileName>` /
  // `cloud:<docId>`, see the merged options built in the render below) so
  // this can dispatch to the right backend and clear the *other* backend's
  // tracking id, same as loading a local file already cleared currentFileName.
  const handleLoad = async () => {
    if (!selectedLoadFile) return
    setSaveError(null)
    setSaveStatus(null)
    const sepIndex = selectedLoadFile.indexOf(':')
    const source = selectedLoadFile.slice(0, sepIndex)
    const id = selectedLoadFile.slice(sepIndex + 1)

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
    } catch (err) {
      setSaveError(err.message || 'Failed to load')
    }
  }

  const handleNew = () => {
    if (elements.length > 0 && !window.confirm('Clear the canvas and start a new wireframe?')) return
    const empty = []
    setElements(empty)
    savedSnapshotRef.current = empty
    setSelectedIds([])
    setWireframeName('')
    setCurrentFileName(null)
    setCurrentFirestoreId(null)
    setActiveTool('pointer')
    setSaveError(null)
    setSaveStatus(null)
    historyRef.current = []
  }

  // ── Exit confirmation ── mirrors Components/DevEdit.jsx's own
  // ExitPrompt exactly: same message shape, Discard/Save (no separate
  // Cancel), backdrop-click cancels.
  const handleBackLinkClick = (e) => {
    if (!isDirty) return
    e.preventDefault()
    setShowExitPrompt(true)
  }
  const handleExitDiscard = () => { window.location.href = '../../' }
  const handleExitSave = () => {
    pendingExitAfterSaveRef.current = true
    setShowExitPrompt(false)
    requestSave()
  }

  return (
    <div className="wf-page">
      <a href="../../" className="wf-back-link" onClick={handleBackLinkClick}>← Prototypes</a>

      <FileControls
        wireframeName={wireframeName}
        setWireframeName={setWireframeName}
        onSave={requestSave}
        saving={saving}
        saveError={saveError}
        saveStatus={saveStatus}
        savedFiles={savedFiles}
        firestoreFiles={firestoreFiles}
        selectedLoadFile={selectedLoadFile}
        setSelectedLoadFile={setSelectedLoadFile}
        onLoad={handleLoad}
        onNew={handleNew}
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
