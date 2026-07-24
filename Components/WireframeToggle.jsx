import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth, SHARED_EMAIL } from './firebase'
import { getSignInAt, setSignInAt, clearSignInAt, isSessionExpired } from './sharedAuthSession'
import Tooltip from './Tooltip'

const ShapesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="10" width="11" height="11" rx="1.5" />
    <circle cx="16.5" cy="7" r="5" />
  </svg>
)

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M18 6L6 18" /><path d="M6 6l12 12" />
  </svg>
)

// 4th member of the dev toolbar — a doorway into the standalone Wireframe
// tool (tools/wireframe/), not an in-page mode like Dev Mode/Comments/Edit.
// Unlike those three this doesn't take containerRef/prototypeId props and
// doesn't participate in devToolbarBus's mutual-exclusivity coordination —
// that only matters for ongoing active states, and there's no "active"
// concept here beyond whether the modal is open.
//
// Gated by the exact same shared Firebase Auth session Dev Edit uses
// (Components/firebase.js's `auth`/`SHARED_EMAIL`, Components/
// sharedAuthSession.js's expiry helpers) — someone already signed in via
// Dev Edit (or a previous Wireframe visit) skips the password prompt
// entirely. Deliberately password-only, no name step — attribution isn't
// needed just to open the tool; the Wireframe tool's own save flow (v7)
// already asks for a name at the point that actually matters.
//
// Once past the gate, opens tools/wireframe/ in an iframe inside a modal
// (not a real navigation — the URL never changes) so the underlying
// prototype stays visibly present (dimmed) behind it. Deliberately an
// iframe rather than importing that tool's own App component directly:
// its CSS (height:100vh, position:fixed toolbar/zoom-control/FileControls,
// the v8/v9 zoom-to-cursor math) all assume they own the whole viewport —
// inside an iframe, 100vh/position:fixed naturally resolve against the
// iframe's own viewport (i.e. the modal box) for free, with zero changes
// needed to any of that already-debugged code.
export default function WireframeToggle() {
  const [authUser, setAuthUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [gateOpen, setGateOpen] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState(null)
  const [signingIn, setSigningIn] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const iframeRef = useRef(null)
  const isAuthed = !!authUser

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

  const handleToggle = () => {
    if (!authReady) return
    if (isAuthed && isSessionExpired()) {
      clearSignInAt()
      signOut(auth)
      setGateOpen(true)
      return
    }
    if (!isAuthed) { setGateOpen(true); return }
    setModalOpen(true)
  }

  const submitPassword = async () => {
    if (!passwordInput || signingIn) return
    setSigningIn(true)
    setPasswordError(null)
    try {
      await signInWithEmailAndPassword(auth, SHARED_EMAIL, passwordInput)
      setPasswordInput('')
      setGateOpen(false)
      setModalOpen(true)
    } catch {
      setPasswordError('Incorrect password')
    } finally {
      setSigningIn(false)
    }
  }

  // Closing is guarded by the iframe's own unsaved-changes check, not
  // decided here — this only *asks*; tools/wireframe/src/App.jsx's own
  // message listener replies with wireframe:close (see below) once it's
  // actually safe (no unsaved changes, or the user just confirmed Discard/
  // Save from its own exit prompt, rendered inside the iframe itself).
  // Nothing to lose if the iframe hasn't finished loading yet.
  const requestClose = () => {
    if (!iframeLoaded || !iframeRef.current) { setModalOpen(false); return }
    iframeRef.current.contentWindow.postMessage({ type: 'wireframe:requestClose' }, window.location.origin)
  }

  useEffect(() => {
    if (!modalOpen) return
    function handleMessage(e) {
      if (e.origin !== window.location.origin) return
      if (e.data?.type === 'wireframe:close') {
        setModalOpen(false)
        setIframeLoaded(false)
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') requestClose()
    }
    window.addEventListener('message', handleMessage)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('message', handleMessage)
      window.removeEventListener('keydown', handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen, iframeLoaded])

  return (
    <>
      <Tooltip text="Wireframe" wrapClassName="wireframeaccess-toggle-wrap" placement="bottom">
        <button
          className={`dev-toolbar-icon-btn wireframeaccess-toggle${gateOpen ? ' active' : ''}`}
          onClick={handleToggle}
          data-wireframeaccess-ui="true"
          aria-label="Open Wireframe tool"
        >
          <ShapesIcon />
        </button>
      </Tooltip>

      {gateOpen && createPortal(
        <div
          className="devedit-gate-overlay"
          data-wireframeaccess-ui="true"
          onClick={(e) => { if (e.target === e.currentTarget) setGateOpen(false) }}
        >
          <div className="devedit-gate-box">
            <div className="devedit-gate-title">Enter password to open Wireframe</div>
            <input
              className="devedit-gate-input"
              type="password"
              placeholder="Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitPassword() }}
              autoFocus
            />
            {passwordError && <div className="devedit-error">{passwordError}</div>}
            <div className="devedit-gate-actions">
              <button className="devedit-btn-secondary" onClick={() => setGateOpen(false)}>Cancel</button>
              <button className="devedit-btn-primary" onClick={submitPassword} disabled={!passwordInput || signingIn}>
                {signingIn ? 'Checking…' : 'Unlock'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {modalOpen && createPortal(
        <div
          className="wireframeaccess-modal-scrim"
          data-wireframeaccess-ui="true"
          onClick={(e) => { if (e.target === e.currentTarget) requestClose() }}
        >
          <div className="wireframeaccess-modal-box">
            <button className="wireframeaccess-modal-close" onClick={requestClose} aria-label="Close Wireframe">
              <CloseIcon />
            </button>
            <iframe
              ref={iframeRef}
              className="wireframeaccess-modal-iframe"
              src="../../tools/wireframe/?embedded=1"
              title="Wireframe tool"
              onLoad={() => { setIframeLoaded(true); iframeRef.current?.contentWindow?.focus() }}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
