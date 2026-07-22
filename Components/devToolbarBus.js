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
