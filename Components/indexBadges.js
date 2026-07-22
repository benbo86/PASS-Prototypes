// Notification pills on the root prototype index — shows which prototypes
// have new Dev Comments activity (a new comment or reply) since this
// browser last visited that prototype's page. Runs only on index.html,
// which Vite processes as its own module entry the same way it does every
// prototype's src/main.jsx, so bare imports like 'firebase/firestore'
// resolve normally.
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from './firebase'

const LAST_SEEN_KEY = 'devcomments-last-seen'

function getLastSeenMap() {
  try { return JSON.parse(localStorage.getItem(LAST_SEEN_KEY) || '{}') } catch { return {} }
}

// Firestore Timestamp (comment.createdAt, via serverTimestamp()) has
// .toMillis(); a plain Date (reply.createdAt, since serverTimestamp()
// can't be used inside arrayUnion) does not.
function toMillis(value) {
  if (!value) return 0
  if (typeof value.toMillis === 'function') return value.toMillis()
  if (value instanceof Date) return value.getTime()
  return 0
}

// Resolves a prototype link's href to the same prototypeId DevComments
// uses at runtime. Most prototypes key off pathname alone, but multi-view
// prototypes reached via a query string (Timesheets, Gross Pay Advice —
// level 1 list vs level 2 detail, e.g. ?employee=stephen-nicholls) key off
// pathname+search instead, so a comment left on one level doesn't leak
// into the other — see the matching prototypeId props in Timesheets.jsx/
// GrossPayAdvice.jsx. Including search here unconditionally is safe for
// every other link too: with no query string, `url.search` is just `''`.
function pathnameForHref(href) {
  const url = new URL(href, window.location.href)
  return url.pathname + url.search
}

function countUnseen(comments, seenAt) {
  let count = 0
  for (const c of comments) {
    if (toMillis(c.createdAt) > seenAt) count++
    for (const r of c.replies || []) {
      if (toMillis(r.createdAt) > seenAt) count++
    }
  }
  return count
}

function renderBadges(byPrototype) {
  const lastSeen = getLastSeenMap()
  document.querySelectorAll('.proto-link').forEach(link => {
    const row = link.closest('.proto-row')
    if (!row) return

    const existing = row.querySelector('.devcomments-index-badge')
    if (existing) existing.remove()

    const pathname = pathnameForHref(link.getAttribute('href'))
    const comments = byPrototype[pathname]
    if (!comments || comments.length === 0) return

    const seenAt = lastSeen[pathname] || 0
    const unseenCount = countUnseen(comments, seenAt)
    if (unseenCount === 0) return

    // Icon + number only (no "N new comments" text) — matches the same
    // comment-bubble glyph used for the pins/toggle in DevComments.jsx.
    const badge = document.createElement('span')
    badge.className = 'devcomments-index-badge'
    badge.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>'
      + `<span>${unseenCount}</span>`
    link.insertAdjacentElement('afterend', badge)
  })
}

onSnapshot(collection(db, 'devmode_comments'), (snapshot) => {
  const byPrototype = {}
  snapshot.forEach(d => {
    const data = d.data()
    if (!byPrototype[data.prototypeId]) byPrototype[data.prototypeId] = []
    byPrototype[data.prototypeId].push(data)
  })
  renderBadges(byPrototype)
}, err => {
  console.error('Index notification badges: subscription failed', err)
})
