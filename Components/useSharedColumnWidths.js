import { useState, useRef, useEffect } from 'react'
import { doc, addDoc, updateDoc, onSnapshot, query, collection, where, serverTimestamp } from 'firebase/firestore'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { db, auth, SHARED_EMAIL } from './firebase'
import { getSignInAt, setSignInAt, clearSignInAt, isSessionExpired } from './sharedAuthSession'
import { getStoredAuthor, storeAuthor } from './authorIdentity'

// Extracted from the Invoices prototype (invoices/list/src/Invoices.jsx),
// which was the first table to get resizable columns — this hook is what
// lets any other Styles/main.css `.data-table` become resizable the same
// way, without re-deriving the width math or the shared-save/auth-gate
// plumbing per table. See Styles/main.css's `.resizable-table` rules for
// the CSS half of this feature (table-layout:fixed, truncation, handle
// styling) and Components/ColResizeHandle.jsx / Components/ColLabel.jsx
// for the two small presentational pieces this pairs with.
//
// The Firestore collection is still literally named `invoices_column_widths`
// — kept as-is rather than renamed, since it was already generically scoped
// by a `prototypeId` field (not a fixed doc id) from the start, and renaming
// would need a fresh security-rules publish for no functional benefit; the
// published rules already allow any authenticated write regardless of which
// prototype's widths are being saved.
const COLLECTION = 'invoices_column_widths'

function widthsEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false
  return a.every((w, i) => Math.abs(w - b[i]) < 0.01)
}

/**
 * @param {object} opts
 * @param {number[]} opts.rawWidths - starting proportions (any unit, e.g. px) for each column, in order.
 * @param {string} opts.storageKey - localStorage key for this table's fast-paint cache (must be unique per table).
 * @param {string} opts.prototypeId - scopes the shared Firestore doc (window.location.pathname, or +search for a multi-view prototype — same convention as Dev Comments/Dev Edit).
 * @param {number} [opts.minColPx] - minimum column width in px, enforced live against the table's current rendered width.
 */
export default function useSharedColumnWidths({ rawWidths, storageKey, prototypeId, minColPx = 48 }) {
  const colCount = rawWidths.length

  function defaultColWidths() {
    const total = rawWidths.reduce((a, b) => a + b, 0)
    return rawWidths.map(w => (w / total) * 100)
  }

  function loadColWidths() {
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length === colCount && parsed.every(n => typeof n === 'number' && n > 0)) {
        return parsed
      }
    } catch { /* ignore malformed/unavailable storage */ }
    return null
  }

  const tableRef = useRef(null)
  const [colWidths, setColWidths] = useState(() => loadColWidths() || defaultColWidths())

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(colWidths)) } catch { /* ignore unavailable storage */ }
  }, [colWidths]) // eslint-disable-line react-hooks/exhaustive-deps

  // Set true the moment the user drags any handle this session — once true,
  // incoming shared updates (below) stop auto-applying, so an in-progress
  // local resize is never silently overwritten by someone else's save.
  const hasUserResizedRef = useRef(false)

  const resizeColumn = (index, dxPx) => {
    hasUserResizedRef.current = true
    const tableWidth = tableRef.current?.getBoundingClientRect().width
    if (!tableWidth) return
    const deltaPct = (dxPx / tableWidth) * 100
    const minPct = (minColPx / tableWidth) * 100
    setColWidths(prev => {
      const next = [...prev]
      let a = next[index] + deltaPct
      let b = next[index + 1] - deltaPct
      if (a < minPct) { b -= (minPct - a); a = minPct }
      if (b < minPct) { a -= (minPct - b); b = minPct }
      next[index] = Math.max(minPct, a)
      next[index + 1] = Math.max(minPct, b)
      return next
    })
  }

  // ── Shared column widths (live for every visitor, password-gated to save) ──
  const [activeColWidths, setActiveColWidths] = useState(null)
  const activeDocIdRef = useRef(null)

  const [authUser, setAuthUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [authorName, setAuthorName] = useState(() => getStoredAuthor())
  const isAuthed = !!authUser

  const [gateStep, setGateStep] = useState(null) // null | 'password' | 'name'
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState(null)
  const [signingIn, setSigningIn] = useState(false)
  const [nameInput, setNameInput] = useState('')

  const [savingWidths, setSavingWidths] = useState(false)
  const [saveWidthsError, setSaveWidthsError] = useState(null)
  const [justSavedWidths, setJustSavedWidths] = useState(false)
  const justSavedTimeoutRef = useRef(null)

  // Gated on hasUserResizedRef, not merely "no shared value exists yet" —
  // otherwise a brand-new visitor who hasn't touched a handle would see a
  // "Save column widths" prompt the instant the page loads, just because
  // nobody's ever saved a shared default for this table yet. Matches Dev
  // Edit's own dirty tracking: only what *this session* actually changed
  // counts.
  const widthsDirty = hasUserResizedRef.current && (!activeColWidths || !widthsEqual(colWidths, activeColWidths))

  useEffect(() => {
    return onAuthStateChanged(auth, user => {
      if (user) {
        if (isSessionExpired()) { clearSignInAt(); signOut(auth); return }
        if (getSignInAt() === null) setSignInAt(Date.now())
      } else {
        clearSignInAt()
      }
      setAuthUser(user)
      setAuthReady(true)
    })
  }, [])

  useEffect(() => {
    const q = query(collection(db, COLLECTION), where('prototypeId', '==', prototypeId))
    return onSnapshot(q, snapshot => {
      const d = snapshot.docs[0]
      if (!d) return
      const data = d.data()
      activeDocIdRef.current = d.id
      if (Array.isArray(data.widths) && data.widths.length === colCount) {
        setActiveColWidths(data.widths)
      }
    }, err => console.error(`useSharedColumnWidths(${prototypeId}): subscription failed`, err))
  }, [prototypeId]) // eslint-disable-line react-hooks/exhaustive-deps

  // The actual "live for everyone" behaviour: whenever a new shared value
  // arrives and the user hasn't touched a resize handle this session, adopt
  // it immediately — including the very first load, which is what makes a
  // fresh visit show whatever was last saved rather than the hardcoded
  // defaults.
  useEffect(() => {
    if (activeColWidths && !hasUserResizedRef.current) {
      setColWidths(activeColWidths)
    }
  }, [activeColWidths]) // eslint-disable-line react-hooks/exhaustive-deps

  const performSaveWidths = async () => {
    setSavingWidths(true)
    setSaveWidthsError(null)
    try {
      const payload = { prototypeId, widths: colWidths, authorName: authorName.trim(), updatedAt: serverTimestamp() }
      if (activeDocIdRef.current) {
        await updateDoc(doc(db, COLLECTION, activeDocIdRef.current), payload)
      } else {
        const ref = await addDoc(collection(db, COLLECTION), payload)
        activeDocIdRef.current = ref.id
      }
      hasUserResizedRef.current = false
      clearTimeout(justSavedTimeoutRef.current)
      setJustSavedWidths(true)
      justSavedTimeoutRef.current = setTimeout(() => setJustSavedWidths(false), 2000)
      return true
    } catch (err) {
      setSaveWidthsError(err.message || 'Failed to save')
      return false
    } finally {
      setSavingWidths(false)
    }
  }

  // Mirrors Components/DevEdit.jsx's/the Wireframe tool's own
  // toggleActive/requestSave gate logic exactly: save immediately if
  // already signed in with a name on file, otherwise open the password/name
  // gate, which resumes the save itself once satisfied.
  const requestSaveWidths = () => {
    if (!authReady) return
    if (isAuthed && isSessionExpired()) { clearSignInAt(); signOut(auth); setGateStep('password'); return }
    if (!isAuthed) { setGateStep('password'); return }
    if (!authorName.trim()) { setGateStep('name'); return }
    performSaveWidths()
  }

  const submitPassword = async () => {
    if (!passwordInput || signingIn) return
    setSigningIn(true)
    setPasswordError(null)
    try {
      await signInWithEmailAndPassword(auth, SHARED_EMAIL, passwordInput)
      setPasswordInput('')
      if (authorName.trim()) { setGateStep(null); performSaveWidths() }
      else setGateStep('name')
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
    performSaveWidths()
  }

  const closeGate = () => setGateStep(null)

  return {
    tableRef, colWidths, resizeColumn,
    widthsDirty, savingWidths, justSavedWidths, saveWidthsError, requestSaveWidths,
    gateStep, passwordInput, setPasswordInput, passwordError, signingIn,
    nameInput, setNameInput, submitPassword, submitName, closeGate,
  }
}
