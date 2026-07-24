// Tiny cross-component coordination for the Dev Mode / Dev Comments toolbar.
// The two toggles are independent components with no shared parent to lift
// state into (each prototype renders them as plain siblings), so mutual
// exclusivity — and each feature knowing whether the *other* is currently
// active, not just when it just activated — is coordinated via a
// window-level CustomEvent instead of a React context. The smallest change
// that lets two already-independent features stay aware of each other
// without restructuring every prototype that renders them.
const EVENT_NAME = 'pass-devtoolbar-state'

// Announce every on/off transition, not just activation — Dev Comments
// needs to know when Dev Mode turns back OFF too, to bring pins back.
export function announceState(feature, isActive) {
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { feature, isActive } }))
}

// callback(feature, isActive) fires for every state change from ANY
// toolbar feature, including this one — callers should ignore their own
// name where that matters (e.g. mutual exclusivity).
export function subscribeToState(callback) {
  const handler = (e) => callback(e.detail.feature, e.detail.isActive)
  window.addEventListener(EVENT_NAME, handler)
  return () => window.removeEventListener(EVENT_NAME, handler)
}

// Same pattern, separate event — Components/DevToolbar.jsx's own Sign Out
// button doesn't own the shared session's dirty-state (only Dev Edit does,
// via its own sessionEdits), so it can't just call signOut(auth) directly:
// signing out with unsaved Dev Edit work needs the exact same guard Dev
// Edit's own (now-removed) session-bar Sign Out button already had. This
// lets DevToolbar *ask* for a sign-out without knowing anything about Dev
// Edit's internal state — Dev Edit.jsx subscribes and runs its existing
// handleSignOut (dirty-check → exit-prompt if needed, real signOut once
// safe) exactly as if its own button had been clicked.
const SIGNOUT_EVENT_NAME = 'pass-devtoolbar-signout-request'

export function announceSignOutRequest() {
  window.dispatchEvent(new CustomEvent(SIGNOUT_EVENT_NAME))
}

export function subscribeToSignOutRequest(callback) {
  window.addEventListener(SIGNOUT_EVENT_NAME, callback)
  return () => window.removeEventListener(SIGNOUT_EVENT_NAME, callback)
}
