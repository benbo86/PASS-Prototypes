import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, arrayUnion, serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { announceState, subscribeToState } from './devToolbarBus'
import { getStoredAuthor, storeAuthor } from './authorIdentity'

// ─── Icons ────────────────────────────────────────────────────────

const CommentIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
)

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.3 5.71a1 1 0 00-1.42 0L12 10.59 7.11 5.7A1 1 0 105.7 7.11L10.59 12 5.7 16.89a1 1 0 101.41 1.41L12 13.41l4.89 4.89a1 1 0 001.41-1.41L13.41 12l4.89-4.89a1 1 0 000-1.4z" />
  </svg>
)

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const EditIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
)

// ─── Read tracking (drives the notification pill on the prototype index) ──
// Visiting a prototype's page marks everything currently there as "seen" —
// pins are always visible now, so landing on the page is treated as having
// had the chance to notice them, same as opening a Slack channel clearing
// its unread count without requiring every message be individually read.
// Components/indexBadges.js reads this same key to decide which prototypes
// still show a pill on the index page.
const LAST_SEEN_KEY = 'devcomments-last-seen'

// Firestore Timestamp (comment.createdAt, via serverTimestamp()) has
// .toMillis(); a plain Date (reply.createdAt, since serverTimestamp() can't
// be used inside arrayUnion) does not. Duplicated in Components/
// indexBadges.js, which can't import this (plain script vs React
// component) — kept tiny and identical on purpose.
function toMillis(value) {
  if (!value) return 0
  if (typeof value.toMillis === 'function') return value.toMillis()
  if (value instanceof Date) return value.getTime()
  return 0
}

// Marks `timestamp` (the latest activity time actually present in this
// prototype's live-subscribed data, NOT Date.now() — see the effect that
// calls this for why) as seen, but never moves it backwards.
function markSeenAt(prototypeId, timestamp) {
  try {
    const raw = localStorage.getItem(LAST_SEEN_KEY)
    const map = raw ? JSON.parse(raw) : {}
    if (!map[prototypeId] || timestamp > map[prototypeId]) {
      map[prototypeId] = timestamp
      localStorage.setItem(LAST_SEEN_KEY, JSON.stringify(map))
    }
  } catch { /* ignore */ }
}

// Some prototypes have no single wrapping element for containerRef to
// attach to (a fragment root), so Dev Mode gives them a `display: contents`
// wrapper instead — invisible to layout, which is fine for event listening/
// `contains()` checks, but `getBoundingClientRect()` on a `display: contents`
// element always returns an all-zero rect (no box is generated at all).
// Percentage-based pin positions would divide by that zero width/height and
// produce NaN. Fall back to the viewport itself as the positioning frame
// when that happens — pins still land in the right visual spot, just
// computed relative to the window instead of a (nonexistent) container box.
function getPositioningRect(container) {
  const rect = container.getBoundingClientRect()
  if (rect.width > 0 && rect.height > 0) return rect
  return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }
}

function fmtTime(value) {
  // Firestore Timestamp has .toDate(); a plain Date (used for reply
  // entries, since serverTimestamp() can't be used inside arrayUnion) is
  // used as-is.
  const d = value?.toDate ? value.toDate() : value instanceof Date ? value : null
  if (!d) return ''
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

// Panel sits beside whichever pin was clicked rather than a fixed page
// corner — flips to the pin's left if it would run off the right edge, and
// clamps vertically so it never renders off the top/bottom of the viewport.
// PANEL_HEIGHT_ESTIMATE is a rough budget for vertical clamping only (the
// panel's real height is auto/scrollable) — it doesn't need to be exact,
// just enough to keep the panel from opening mostly off-screen.
const PANEL_WIDTH = 300
const PANEL_HEIGHT_ESTIMATE = 420
const PANEL_MARGIN = 12

function computePanelPosition(pinLeft, pinTop) {
  let left = pinLeft + 36
  if (left + PANEL_WIDTH + PANEL_MARGIN > window.innerWidth) {
    left = pinLeft - PANEL_WIDTH - 12
  }
  left = Math.max(PANEL_MARGIN, Math.min(left, window.innerWidth - PANEL_WIDTH - PANEL_MARGIN))
  const top = Math.max(PANEL_MARGIN, Math.min(pinTop, window.innerHeight - PANEL_HEIGHT_ESTIMATE - PANEL_MARGIN))
  return { left, top }
}

// ─── Dev Comments ───────────────────────────────────────────────────
// Figma-style pin comments overlaid on a prototype, backed by Firestore so
// feedback is shared and updates live between whoever has the page open.
// Independent of Dev Mode's inspect mode — comments can be left without
// turning inspection on. Reuses the same containerRef Dev Mode uses, so
// pins are positioned relative to the same outermost content frame.
export default function DevComments({ containerRef, prototypeId }) {
  const [active, setActive] = useState(false)
  const [comments, setComments] = useState([])
  const [composerAt, setComposerAt] = useState(null) // {x, y, xPercent, yPercent} | null
  const [openThreadId, setOpenThreadId] = useState(null)
  const [authorName, setAuthorName] = useState(getStoredAuthor)

  const activeRef = useRef(active)
  activeRef.current = active

  // ── Mark this prototype as "seen" for the index page's notification
  // pill, keyed to the actual latest activity timestamp in the live
  // subscribed data (not Date.now()) — visiting the page is enough,
  // regardless of whether comment mode ever gets turned on. Using
  // Date.now() here would race serverTimestamp()'s server-resolved value:
  // a comment just written by this same browser can resolve to a server
  // time *after* the client's Date.now() call that ran right after the
  // write, which would wrongly leave the author's own comment flagged as
  // unread. Re-running whenever `comments` updates naturally re-marks
  // after every write once its snapshot comes back, without needing a
  // separate call in submitComment/submitReply. Also correctly does
  // nothing while comments is still empty — nothing to mark, and the
  // index page skips prototypes with zero comments regardless. ──
  useEffect(() => {
    if (comments.length === 0) return
    let latest = 0
    for (const c of comments) {
      latest = Math.max(latest, toMillis(c.createdAt))
      for (const r of c.replies || []) latest = Math.max(latest, toMillis(r.createdAt))
    }
    if (latest > 0) markSeenAt(prototypeId, latest)
  }, [comments, prototypeId])

  // ── Live subscription — always on, so pins are ready the moment
  // comment mode is toggled, and reads stay cheap (a handful of small
  // docs per prototype). ──
  useEffect(() => {
    const q = query(collection(db, 'devmode_comments'), where('prototypeId', '==', prototypeId))
    const unsub = onSnapshot(q, snapshot => {
      setComments(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    }, err => {
      console.error('Dev Comments subscription failed', err)
    })
    return unsub
  }, [prototypeId])

  const toggleActive = useCallback(() => {
    setActive(a => {
      const next = !a
      if (!next) { setComposerAt(null); setOpenThreadId(null) }
      return next
    })
  }, [])

  // Announce our own state changes for Dev Mode to react to — as an
  // effect (after the state commit), not inside the updater above. See
  // the matching comment in DevMode.jsx for why (updaters must stay pure;
  // dispatching a synchronous event that triggers another component's
  // setState from inside one is the "Cannot update a component while
  // rendering a different component" React warning).
  useEffect(() => {
    announceState('devcomments', active)
  }, [active])

  // ── Mutual exclusivity with Dev Mode ──
  // Only one dev-toolbar feature is active at a time — see the matching
  // effect in DevMode.jsx and devToolbarBus.js for why this is a window
  // event rather than lifted state.
  useEffect(() => {
    return subscribeToState((feature, otherActive) => {
      if (feature !== 'devcomments' && otherActive && active) {
        setActive(false)
        setComposerAt(null)
        setOpenThreadId(null)
      }
    })
  }, [active])

  // ── Hide pins entirely while Dev Mode is active ──
  // Comments would otherwise clutter/interfere with inspecting elements.
  // Tracked separately from the mutual-exclusivity effect above, since
  // this needs Dev Mode's *current* on/off state continuously (pins are
  // always visible independent of `active`), not just a one-shot reaction
  // to it turning on.
  const [devModeActive, setDevModeActive] = useState(false)
  useEffect(() => {
    return subscribeToState((feature, isActive) => {
      if (feature === 'devmode') setDevModeActive(isActive)
    })
  }, [])

  // ── Custom cursor while comment mode is active ──
  // Applied to containerRef's own subtree (not document.body) so it never
  // affects Dev Comments' own chrome, which portals to document.body
  // outside containerRef entirely — hovering the toggle/composer/panel
  // still shows a normal pointer.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    if (active) container.classList.add('devcomments-cursor-active')
    return () => container.classList.remove('devcomments-cursor-active')
  }, [active, containerRef])

  // ── Capture-phase click interception (comment mode only) ──
  // Mirrors Dev Mode's own pattern: intercept before the real app's click
  // handlers fire, so dropping a pin never accidentally navigates or
  // triggers real UI underneath it.
  useEffect(() => {
    if (!active) return
    const container = containerRef.current
    if (!container) return

    // Also exempt Dev Mode's and Dev Edit's own chrome ([data-devmode-ui],
    // [data-devedit-ui]) — all three toggles sit as one toolbar, all
    // outside containerRef. Without this, activating Dev Comments while
    // another tool is also active would swallow clicks on its toggle/panel
    // (treating them as "click the page to drop a pin" instead) — the same
    // class of bug as Dev Mode not recognizing Dev Comments' chrome, just
    // the mirror case, now extended to a third tool.
    const isOtherFeatureUi = (target) => target.closest && target.closest('[data-devcomments-ui], [data-devmode-ui], [data-devedit-ui]')

    const handleClick = (e) => {
      if (isOtherFeatureUi(e.target)) return
      e.preventDefault()
      e.stopPropagation()
      const rect = getPositioningRect(container)
      const xPercent = ((e.clientX - rect.left) / rect.width) * 100
      const yPercent = ((e.clientY - rect.top) / rect.height) * 100
      setOpenThreadId(null)
      setComposerAt({ x: e.clientX, y: e.clientY, xPercent, yPercent })
    }

    const handleSuppress = (e) => {
      if (isOtherFeatureUi(e.target)) return
      e.preventDefault()
      e.stopPropagation()
    }

    document.addEventListener('click', handleClick, true)
    document.addEventListener('mousedown', handleSuppress, true)
    document.addEventListener('pointerdown', handleSuppress, true)
    return () => {
      document.removeEventListener('click', handleClick, true)
      document.removeEventListener('mousedown', handleSuppress, true)
      document.removeEventListener('pointerdown', handleSuppress, true)
    }
  }, [active, containerRef])

  // ── Escape closes whatever's open, then exits comment mode ──
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key !== 'Escape') return
      if (composerAt) { setComposerAt(null); return }
      if (openThreadId) { setOpenThreadId(null); return }
      if (activeRef.current) setActive(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [composerAt, openThreadId])

  const submitComment = useCallback(async (text) => {
    const name = authorName.trim()
    if (!name) return
    storeAuthor(name)
    await addDoc(collection(db, 'devmode_comments'), {
      prototypeId,
      xPercent: composerAt.xPercent,
      yPercent: composerAt.yPercent,
      authorName: name,
      text,
      replies: [],
      resolved: false,
      createdAt: serverTimestamp(),
    })
    setComposerAt(null)
  }, [authorName, composerAt, prototypeId])

  const submitReply = useCallback(async (commentId, text) => {
    const name = authorName.trim()
    if (!name) return
    storeAuthor(name)
    await updateDoc(doc(db, 'devmode_comments', commentId), {
      replies: arrayUnion({ authorName: name, text, createdAt: new Date() }),
    })
  }, [authorName])

  const toggleResolved = useCallback(async (commentId, resolved) => {
    await updateDoc(doc(db, 'devmode_comments', commentId), { resolved: !resolved })
  }, [])

  const editComment = useCallback(async (commentId, newText) => {
    await updateDoc(doc(db, 'devmode_comments', commentId), { text: newText, edited: true })
  }, [])

  // Replies are a plain array field (not a subcollection, see the schema
  // note elsewhere), so editing one entry means writing the whole array
  // back — arrayUnion only supports adding, not modifying an existing
  // element in place.
  const editReply = useCallback(async (commentId, replyIndex, newText, currentReplies) => {
    const updated = currentReplies.map((r, i) => i === replyIndex ? { ...r, text: newText, edited: true } : r)
    await updateDoc(doc(db, 'devmode_comments', commentId), { replies: updated })
  }, [])

  const deleteComment = useCallback(async (commentId) => {
    await deleteDoc(doc(db, 'devmode_comments', commentId))
    setOpenThreadId(null)
  }, [])

  // Pins render regardless of `active` — anyone browsing the prototype
  // should see existing feedback without needing to turn comment mode on.
  // `active` now purely gates the "click anywhere to drop a new pin"
  // interception below, not pin visibility.
  const containerRect = containerRef.current ? getPositioningRect(containerRef.current) : null
  const openThread = comments.find(c => c.id === openThreadId) || null

  let openThreadPos = null
  if (openThread && containerRect) {
    openThreadPos = computePanelPosition(
      containerRect.left + (openThread.xPercent / 100) * containerRect.width,
      containerRect.top + (openThread.yPercent / 100) * containerRect.height
    )
  }

  return (
    <>
      <button
        className={`devcomments-toggle${active ? ' active' : ''}`}
        onClick={toggleActive}
        data-devcomments-ui="true"
        aria-label="Toggle comments"
      >
        <CommentIcon />
      </button>

      {containerRect && createPortal(
        <div data-devcomments-ui="true">
          {!devModeActive && comments.map(c => (
            <Pin
              key={c.id}
              comment={c}
              left={containerRect.left + (c.xPercent / 100) * containerRect.width}
              top={containerRect.top + (c.yPercent / 100) * containerRect.height}
              isOpen={openThreadId === c.id}
              onClick={() => { setComposerAt(null); setOpenThreadId(id => id === c.id ? null : c.id) }}
            />
          ))}

          {composerAt && (
            <CommentComposer
              x={composerAt.x}
              y={composerAt.y}
              authorName={authorName}
              setAuthorName={setAuthorName}
              onCancel={() => setComposerAt(null)}
              onSubmit={submitComment}
            />
          )}

          {openThread && openThreadPos && (
            <ThreadPanel
              comment={openThread}
              position={openThreadPos}
              authorName={authorName}
              setAuthorName={setAuthorName}
              onClose={() => setOpenThreadId(null)}
              onReply={(text) => submitReply(openThread.id, text)}
              onToggleResolved={() => toggleResolved(openThread.id, openThread.resolved)}
              onDelete={() => deleteComment(openThread.id)}
              onEditComment={(text) => editComment(openThread.id, text)}
              onEditReply={(index, text) => editReply(openThread.id, index, text, openThread.replies || [])}
            />
          )}
        </div>,
        document.body
      )}
    </>
  )
}

// ─── Pin ──────────────────────────────────────────────────────────

function Pin({ comment, left, top, isOpen, onClick }) {
  const [hovering, setHovering] = useState(false)
  const replyCount = comment.replies?.length || 0
  // Preview is redundant once the full thread is already open beside it.
  const showPreview = hovering && !isOpen

  return (
    <div
      className="devcomments-pin-wrap"
      style={{ left, top }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      data-devcomments-ui="true"
    >
      <button
        className={`devcomments-pin${comment.resolved ? ' resolved' : ''}${isOpen ? ' open' : ''}`}
        onClick={onClick}
        aria-label={`Comment: ${comment.text}`}
      >
        {comment.resolved ? <CheckIcon /> : <CommentIcon />}
        {replyCount > 0 && <span className="devcomments-pin-badge">{replyCount}</span>}
      </button>

      {showPreview && (
        <div className="devcomments-pin-preview" onClick={onClick}>
          <span className="devcomments-pin-preview-author">{comment.authorName}</span>
          <span className="devcomments-pin-preview-text">{comment.text}</span>
        </div>
      )}
    </div>
  )
}

// ─── New comment composer ───────────────────────────────────────────

function CommentComposer({ x, y, authorName, setAuthorName, onCancel, onSubmit }) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const canSubmit = text.trim() && authorName.trim()

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    try {
      await onSubmit(text.trim())
    } catch (err) {
      console.error('Dev Comments: failed to add comment', err)
      setSubmitting(false)
    }
  }

  return (
    <div
      className="devcomments-composer"
      data-devcomments-ui="true"
      style={{ left: x, top: y }}
      onClick={e => e.stopPropagation()}
    >
      <input
        className="devcomments-name-input"
        placeholder="Your name"
        value={authorName}
        onChange={e => setAuthorName(e.target.value)}
      />
      <textarea
        className="devcomments-text-input"
        placeholder="Leave a comment…"
        value={text}
        onChange={e => setText(e.target.value)}
        autoFocus
        rows={3}
      />
      <div className="devcomments-composer-actions">
        <button className="devcomments-btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="devcomments-btn-primary" onClick={handleSubmit} disabled={!canSubmit || submitting}>
          {submitting ? 'Posting…' : 'Comment'}
        </button>
      </div>
    </div>
  )
}

// ─── Thread panel (existing comment + replies) ──────────────────────

function ThreadPanel({ comment, position, authorName, setAuthorName, onClose, onReply, onToggleResolved, onDelete, onEditComment, onEditReply }) {
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const canReply = replyText.trim() && authorName.trim()
  // Same non-authoritative identity model as editing (see EditableMessage)
  // — only whoever's currently-typed name matches the comment's original
  // author sees the delete action at all.
  const canDelete = !!authorName.trim() && comment.authorName === authorName

  const handleReply = async () => {
    if (!canReply || submitting) return
    setSubmitting(true)
    try {
      await onReply(replyText.trim())
      setReplyText('')
    } catch (err) {
      console.error('Dev Comments: failed to add reply', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = () => {
    if (!window.confirm('Delete this comment and all replies? This can’t be undone.')) return
    onDelete()
  }

  return (
    <div className="devcomments-panel" data-devcomments-ui="true" style={{ left: position.left, top: position.top }}>
      <div className="devcomments-panel-header">
        <div className="devcomments-panel-title">Comment</div>
        <div className="devcomments-panel-header-actions">
          {canDelete && (
            <button className="devcomments-icon-btn danger" onClick={handleDelete} aria-label="Delete comment">
              <TrashIcon />
            </button>
          )}
          <button
            className={`devcomments-icon-btn${comment.resolved ? ' active' : ''}`}
            onClick={onToggleResolved}
            aria-label={comment.resolved ? 'Reopen' : 'Resolve'}
          >
            <CheckIcon />
          </button>
          <button className="devcomments-panel-close" onClick={onClose} aria-label="Close thread">
            <CloseIcon />
          </button>
        </div>
      </div>

      <div className="devcomments-panel-body">
        <EditableMessage
          authorName={comment.authorName}
          text={comment.text}
          createdAt={comment.createdAt}
          edited={comment.edited}
          canEdit={!!authorName.trim() && comment.authorName === authorName}
          onSave={onEditComment}
        />

        {(comment.replies || []).map((r, i) => (
          <EditableMessage
            key={i}
            authorName={r.authorName}
            text={r.text}
            createdAt={r.createdAt}
            edited={r.edited}
            canEdit={!!authorName.trim() && r.authorName === authorName}
            onSave={(newText) => onEditReply(i, newText)}
          />
        ))}

        <input
          className="devcomments-name-input"
          placeholder="Your name"
          value={authorName}
          onChange={e => setAuthorName(e.target.value)}
        />
        <textarea
          className="devcomments-text-input"
          placeholder="Reply…"
          value={replyText}
          onChange={e => setReplyText(e.target.value)}
          rows={2}
        />
        <div className="devcomments-composer-actions">
          <button className="devcomments-btn-primary" onClick={handleReply} disabled={!canReply || submitting}>
            {submitting ? 'Posting…' : 'Reply'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── A single message (the root comment or one reply) ───────────────
// Editable in place when it belongs to whoever's currently typed in as
// authorName — not real auth (anyone could rename themselves to match),
// just enough to keep "edit your own message" as a UX nicety consistent
// with the rest of this feature's identity model.

function EditableMessage({ authorName, text, createdAt, edited, canEdit, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(text)
  const [saving, setSaving] = useState(false)

  const startEdit = () => { setDraft(text); setEditing(true) }

  const saveEdit = async () => {
    if (!draft.trim() || saving) return
    setSaving(true)
    try {
      await onSave(draft.trim())
      setEditing(false)
    } catch (err) {
      console.error('Dev Comments: failed to save edit', err)
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <div className="devcomments-message">
        <div className="devcomments-message-head">
          <span className="devcomments-author">{authorName}</span>
        </div>
        <textarea
          className="devcomments-text-input"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          rows={2}
          autoFocus
        />
        <div className="devcomments-composer-actions">
          <button className="devcomments-btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
          <button className="devcomments-btn-primary" onClick={saveEdit} disabled={!draft.trim() || saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="devcomments-message">
      <div className="devcomments-message-head">
        <span className="devcomments-author">{authorName}</span>
        <span className="devcomments-message-head-right">
          <span className="devcomments-time">{fmtTime(createdAt)}{edited ? ' (edited)' : ''}</span>
          {canEdit && (
            <button className="devcomments-edit-btn" onClick={startEdit} aria-label="Edit">
              <EditIcon />
            </button>
          )}
        </span>
      </div>
      <div className="devcomments-message-text">{text}</div>
    </div>
  )
}
