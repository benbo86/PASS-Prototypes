import { createPortal } from 'react-dom'

// Shared password + display-name gate for any feature that writes to the
// project's one shared-password-gated Firestore data (reads stay open to
// everyone; writes require the shared account's password) — Dev Edit's CSS
// versions and the Wireframe tool's shared saves each built their own copy
// of this exact two-step UI inline; this is that pattern extracted for a
// third caller rather than duplicating it again. The two existing copies
// are left as-is (each has its own deeply-wired exit-flow/pendingActionRef
// state not worth risking a retrofit on) — this is for new callers only.
//
// Reuses Styles/dev-edit.css's `.devedit-gate-*` classes rather than
// shipping new CSS, matching the convention WireframeToggle's own password
// gate already established for the same reason.
export default function AuthGate({
  step, // 'password' | 'name'
  passwordTitle = 'Enter password',
  password, setPassword, passwordError, signingIn, onSubmitPassword,
  name, setName, onSubmitName,
  onClose,
}) {
  return createPortal(
    <div className="devedit-gate-overlay" data-devedit-ui="true" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="devedit-gate-box">
        {step === 'password' ? (
          <>
            <div className="devedit-gate-title">{passwordTitle}</div>
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
    </div>,
    document.body
  )
}
