// ─── Author identity (no real auth — a remembered display name) ──
// Shared between Dev Comments and Dev Edit so a name is only ever asked for
// once per browser, regardless of which feature prompts for it first.

const AUTHOR_KEY = 'devcomments-author-name'

export function getStoredAuthor() {
  try { return localStorage.getItem(AUTHOR_KEY) || '' } catch { return '' }
}

export function storeAuthor(name) {
  try { localStorage.setItem(AUTHOR_KEY, name) } catch { /* ignore */ }
}
