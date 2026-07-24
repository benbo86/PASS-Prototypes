// ─── Shared session expiry (no real auth — a self-enforced timeout) ──
// Firebase Auth's own session doesn't expire on its own — the SDK
// silently refreshes the underlying ID token forever, so someone stays
// signed in indefinitely unless something else forces a sign-out. This
// tracks "signed in at" ourselves (a plain localStorage timestamp,
// separate from Firebase's own session state) and forces a sign-out once
// a week has passed, so the shared password doesn't grant indefinite
// access from a browser that once had it entered.
//
// Extracted out of Components/DevEdit.jsx (where this originated) so the
// wireframe tool's own shared/password-gated save can enforce the exact
// same one-week timeout on the exact same underlying Firebase Auth
// session — both features check the same timestamp, so a session started
// in one is already correctly subject to the same expiry in the other.
// The localStorage key itself is left unchanged (still `devedit-signin-at`)
// so this move doesn't invalidate anyone's already-active session.
export const SIGNIN_AT_KEY = 'devedit-signin-at'
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // one week

export function getSignInAt() {
  try { const v = localStorage.getItem(SIGNIN_AT_KEY); return v ? Number(v) : null } catch { return null }
}
export function setSignInAt(ts) {
  try { localStorage.setItem(SIGNIN_AT_KEY, String(ts)) } catch { /* ignore */ }
}
export function clearSignInAt() {
  try { localStorage.removeItem(SIGNIN_AT_KEY) } catch { /* ignore */ }
}
export function isSessionExpired() {
  const signInAt = getSignInAt()
  return signInAt !== null && (Date.now() - signInAt) > SESSION_DURATION_MS
}
