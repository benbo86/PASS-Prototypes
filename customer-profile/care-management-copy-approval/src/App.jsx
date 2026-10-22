import { useState, useRef, useEffect } from 'react'
import SideNav from '../../../Components/SideNav'
import TopNav from '../../../Components/TopNav'
import CustomerProfileNav from '../../../Components/CustomerProfileNav'
import DevToolbar from '../../../Components/DevToolbar'
import DevMode from '../../../Components/DevMode'
import DevComments from '../../../Components/DevComments'
import DevEdit from '../../../Components/DevEdit'
import WireframeToggle from '../../../Components/WireframeToggle'
import AuditCapture from '../../../Components/AuditCapture'
import TaskDetail from './TaskDetail'
import HistoryModal, { RevertModal } from './HistoryModal'
import CarePlanDocument from './CarePlanDocument'
import {
  CopyBanner, LockedBanner, RemovalBanner, RejectedBanner, CarePlanReviewModal, UnsavedChangesModal, PersonaSwitcher, ShieldIcon,
} from './ApprovalUI'
import { PlusIcon, PrintIcon, TaskTypeIcon } from './icons.jsx'
import {
  NEXT_REVIEW, VISITS, blankTask, nextTaskId, fmtDate, taskTags,
} from './data'
import { PERSONAS, INITIAL_VERSIONS, INITIAL_LIVE, SOURCE_WEB } from './seed'
import {
  diffTaskLists, isMedication, fmtDateTime, isCopy, copyOf, lockReason, awaitingApproval,
  planSave, applyPlan, needsApproval, isDecision, revertTarget,
} from './approval'

// ─── Icons ────────────────────────────────────────────────────

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
  </svg>
)

// Icons/Calendar Clock.svg — copied verbatim, rendered at 16px.
const CalendarClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5C6B80" strokeWidth="2px" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 14v2.2l1.6 1" />
    <path d="M16 2v4" />
    <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" />
    <path d="M3 10h5" />
    <path d="M8 2v4" />
    <circle cx="16" cy="16" r="6" />
  </svg>
)

// Icons/Repeat.svg — copied verbatim, rendered at 16px.
const RepeatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#99A1AF" strokeWidth="2px" strokeLinecap="round" strokeLinejoin="round">
    <path d="m2 9 3-3 3 3" />
    <path d="M13 18H7a2 2 0 0 1-2-2V6" />
    <path d="m22 15-3 3-3-3" />
    <path d="M11 6h6a2 2 0 0 1 2 2v10" />
  </svg>
)

const OutcomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z" />
  </svg>
)

const VisitIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zM7 12h5v5H7z" />
  </svg>
)

// ─── Shared page chrome ───────────────────────────────────────

const SUB_TABS = ['Outcomes', 'Tasks', 'Visits', 'Care Groups']

function SubTabs({ right }) {
  return (
    <div className="cm-subtabs-row">
      <div />
      <ul className="cm-subtabs">
        {SUB_TABS.map(t => (
          <li key={t} className={t === 'Tasks' ? 'active' : 'disabled'}>
            <button type="button">{t}</button>
          </li>
        ))}
      </ul>
      <div className="cm-subtabs-right">{right}</div>
    </div>
  )
}

function NextReview({ date }) {
  return (
    <div className="cm-next-review">
      <span className="cm-next-review-label">Next review</span>
      <span className="cm-next-review-date">{fmtDate(date).replaceAll('/', '-')}</span>
    </div>
  )
}

// ─── Task card (list view) ────────────────────────────────────

// `note` = what the card says about approval: a copy awaiting approval, a
// pending removal, or a replaced old version. A copy's live original has no
// chip: its copy sits right below it.
const NOTE = {
  copy: { label: 'Awaiting approval', muted: false },
  create: { label: 'New · awaiting approval', muted: false },
  removal: { label: 'Removal awaiting approval', muted: false },
  replaced: { label: 'Replaced by approved change', muted: true },
}

// A decision staged on the task page but not saved yet (`staged`) shows as
// an ordinary unsaved change: no awaiting-approval chip or blue outline.
function TaskCard({ task, onOpen, note, unsaved, staged = false }) {
  const tone = task.type === 'Medication' ? 'medication' : 'general'
  const visits = VISITS.filter(v => task.visitIds.includes(v.id))
  const n = note && !staged ? NOTE[note] : null
  return (
    <button
      type="button"
      className={`cm-task-card cm-task-card--${tone}${n && !n.muted ? ' cm-task-card--pending' : ''}`}
      onClick={onOpen}
    >
      <div className="cm-task-head">
        <span className={`cm-type-icon cm-type-icon--${task.type.toLowerCase()}`}>
          <TaskTypeIcon type={task.type} />
        </span>
        <span className="cm-task-title">{task.name || 'Untitled task'}</span>
        {unsaved && <span className="cm-unsaved-chip">Unsaved changes</span>}
        {n && <span className={`cm-pending-chip${n.muted ? ' cm-pending-chip--muted' : ''}`}><ShieldIcon size={16} /> {n.label}</span>}
        <span className={`cm-status-badge cm-status-badge--${task.status}`}>
          {task.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="cm-task-body">
        <div className="cm-task-desc-col">
          <p className="cm-task-desc">{task.description}</p>
          {taskTags(task).length > 0 && (
            <div className="cm-tags">
              {taskTags(task).map(tag => <span key={tag} className="cm-tag">{tag}</span>)}
            </div>
          )}
        </div>

        <div className="cm-task-dates">
          <span className="cm-date-line cm-date-line--start"><CalendarClockIcon /> {fmtDate(task.beginsOn)}</span>
          <span className="cm-date-line"><RepeatIcon /> {task.endsOn ? fmtDate(task.endsOn) : 'Ongoing'}</span>
        </div>

        <div className="cm-task-outcomes">
          {task.outcomes.map(o => (
            <span key={o} className="cm-outcome-pill"><OutcomeIcon /> {o}</span>
          ))}
        </div>

        <div className="cm-task-visits">
          {visits.map(v => (
            <span key={v.id} className="cm-visit-pill"><VisitIcon /> {v.label}</span>
          ))}
        </div>
      </div>
    </button>
  )
}

// ─── App ──────────────────────────────────────────────────────

const readTaskParam = () => new URLSearchParams(window.location.search).get('task')
const readCareplanParam = () => {
  const v = new URLSearchParams(window.location.search).get('careplan')
  return v ? Number(v) : null
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
// What counts as leaving the care plan: any menu item, plus real links.
// Not the side nav's collapse toggle, the profile button (it only opens its
// menu; Log out inside it counts), or the tab you're already on.
const LEAVE_TARGETS = [
  'a[href]',
  '.side-nav-item',
  '.top-nav-icon-btn:not(.top-nav-profile-btn)',
  '.top-nav-profile-item',
  '.primary-tabs li:not(.active) button',
].join(', ')

const byId = list => Object.fromEntries(list.map(t => [t.id, t]))

// State model (inactive copy, 2026-10-22):
// - `live`     — the saved care plan, INCLUDING inactive copies awaiting
//                approval and tasks flagged for removal. There is nothing
//                outside the care plan: every action is one care plan save.
// - `working`  — live plus this session's unsaved edits (saved from the list).
// - `versions` — the careplan version history; every save adds one.
export default function App() {
  const pageRef = useRef(null)
  const [persona, setPersona] = useState(() => PERSONAS.find(p => p.id === 'sam'))
  const [live, setLive] = useState(INITIAL_LIVE)
  const [working, setWorking] = useState(INITIAL_LIVE)
  const [versions, setVersions] = useState(INITIAL_VERSIONS)
  const [nextReview, setNextReview] = useState(NEXT_REVIEW)

  const [hideInactive, setHideInactive] = useState(true)
  const [pendingOnly, setPendingOnly] = useState(false)
  const [openId, setOpenId] = useState(readTaskParam)
  const [docVersion, setDocVersion] = useState(readCareplanParam)
  const [draftNew, setDraftNew] = useState(null)
  // The blank a new task started from, so a draft only counts as unsaved
  // once something has actually been entered.
  const draftBaseRef = useRef(null)
  const [saveModal, setSaveModal] = useState(null)
  const [leaveTo, setLeaveTo] = useState(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [revert, setRevert] = useState(null)
  const [dismissed, setDismissed] = useState(() => new Set())
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  useEffect(() => {
    const onPop = () => { setOpenId(readTaskParam()); setDocVersion(readCareplanParam()) }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => { window.scrollTo(0, 0) }, [openId, docVersion])

  const showToast = (text) => {
    clearTimeout(toastTimer.current)
    setToast(text)
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }

  const navigate = (id) => {
    const url = id ? `${window.location.pathname}?task=${id}` : window.location.pathname
    window.history.pushState(null, '', url)
    setOpenId(id)
    setDocVersion(null)
  }

  const openDocument = (version) => {
    window.history.pushState(null, '', `${window.location.pathname}?careplan=${version.version}`)
    setHistoryOpen(false)
    setOpenId(null)
    setDocVersion(version.version)
  }
  const closeDocument = () => {
    navigate(null)
    setHistoryOpen(true)
  }

  // ── Derived ─────────────────────────────────────────────────
  const liveById = byId(live)
  // Changes still waiting on a decision: one approved, rejected or cancelled
  // in this session (not saved yet) no longer counts.
  const workingById = byId(working)
  const pendingCount = live.filter(t => {
    if (!awaitingApproval(t)) return false
    const w = workingById[t.id]
    return !!w && !w.approval?.decision && !w.pendingRemoval?.decision && (!t.pendingRemoval || !!w.pendingRemoval)
  }).length
  useEffect(() => {
    if (pendingCount === 0) setPendingOnly(false)
  }, [pendingCount])
  // A new task being filled in only joins `working` on "Back to list", so
  // count the draft too, or leaving from its page wouldn't ask first.
  const draftDirty = !!draftNew && !same(draftNew, draftBaseRef.current)
  const dirty = diffTaskLists(live, working).length > 0 || draftDirty
  const nextVersion = Math.max(...versions.map(v => v.version)) + 1

  // Leaving the care plan with unsaved changes asks first, as the live
  // product does (Stay on page / Discard changes). Covers every menu item —
  // side nav, top nav icons and profile menu, customer tabs — whether or not
  // it goes anywhere in the prototype, and closing or reloading the tab. Not
  // the prototype's own Prototypes back link. Discard drops the unsaved changes, then carries on
  // with the original click.
  const leavingRef = useRef(false)
  useEffect(() => {
    if (!dirty) return undefined
    leavingRef.current = false
    const onClick = (e) => {
      if (leavingRef.current || e.metaKey || e.ctrlKey) return
      // The Prototypes back link is prototype chrome, not part of PASS: leave
      // without asking (and without the browser's own leave warning).
      if (e.target.closest('.back-link')) { leavingRef.current = true; return }
      const target = e.target.closest(LEAVE_TARGETS)
      if (!target || !pageRef.current?.contains(target) || target.target === '_blank') return
      e.preventDefault()
      e.stopPropagation()
      setLeaveTo(target)
    }
    const onBeforeUnload = (e) => {
      if (leavingRef.current) return
      e.preventDefault()
      e.returnValue = ''
    }
    document.addEventListener('click', onClick, true)
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => {
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [dirty])

  // ── Core commit: every action is one care plan save → one version ──
  // `touched` tasks take their new saved state in `working`; unsaved edits
  // to every other task are left alone.
  const commit = ({ nextLive, summary, approval = null, rejections = [], employee = persona.name, review = null, origin }) => {
    const now = fmtDateTime(new Date())
    setVersions(prev => [{
      version: nextVersion, modifiedAt: now, receivedAt: now, ts: Date.now(),
      employee, source: SOURCE_WEB, summary, approval, rejections, origin, review, snapshot: nextLive,
    }, ...prev])
    const prevById = liveById
    const nextById = byId(nextLive)
    const touched = new Set([...live, ...nextLive].map(t => t.id).filter(id => !same(prevById[id], nextById[id])))
    setWorking(prev => {
      const workingById = byId(prev)
      const out = nextLive
        .filter(t => touched.has(t.id) || workingById[t.id])
        .map(t => (touched.has(t.id) ? t : workingById[t.id]))
      prev.forEach(t => { if (!nextById[t.id] && !prevById[t.id]) out.push(t) })
      return out
    })
    setLive(nextLive)
    if (review) setNextReview(review.reviewDate)
  }

  const savePlan = (items, review, origin) => {
    const now = fmtDateTime(new Date())
    const { nextLive, summary, rejections } = applyPlan(live, items, { name: persona.name, at: now, review })
    // A save that approves anything records its approver (History's Approved by).
    const approval = items.some(it => it.kind === 'approve' || it.kind === 'approveRemoval') ? { by: persona.name, at: now } : null
    commit({ nextLive, summary, review, origin, approval, rejections })
  }

  // ── List actions ────────────────────────────────────────────
  const handleSave = () => {
    if (!dirty) { showToast('No changes to save'); return }
    setSaveModal(planSave({ live, target: working }))
  }

  const confirmSave = (review) => {
    const items = saveModal
    savePlan(items, review)
    setSaveModal(null)
    const n = items.filter(needsApproval).length
    const decided = items.filter(isDecision).length
    showToast(n
      ? `Saved · version ${nextVersion}. ${n} medication ${n === 1 ? 'change' : 'changes'} awaiting approval`
      : decided ? `Saved · version ${nextVersion}. ${decided === 1 ? 'Decision' : 'Decisions'} now live` : `Care plan saved · version ${nextVersion}`)
  }

  const addTask = () => {
    const blank = { ...blankTask(), id: null }
    draftBaseRef.current = blank
    setDraftNew(blank)
    navigate('new')
  }

  // ── Task page ───────────────────────────────────────────────
  const workingTask = openId === 'new' ? (draftNew || blankTask()) : working.find(t => t.id === openId)
  const inDetail = !!openId && !!workingTask
  const openLive = openId && openId !== 'new' ? liveById[openId] : null
  const lock = lockReason(openLive, live)
  const openCopy = isCopy(openLive) ? openLive : null
  // A staged (unsaved) Approve/Reject on the open copy or removal.
  const decision = workingTask?.approval?.decision || workingTask?.pendingRemoval?.decision || null
  // Latest rejection for this task (or, on a copy's original), unless dismissed
  // or a newer change is already awaiting approval.
  const rejection = (() => {
    if (!openLive || isCopy(openLive) || lock) return null
    const v = versions.find(x => x.rejections?.some(r => r.taskId === openId))
    if (!v || dismissed.has(v.version)) return null
    const later = versions.find(x => x.version > v.version && x.summary.some(line => line.startsWith(openLive.name)))
    return later ? null : { ...v.rejections.find(r => r.taskId === openId), version: v.version }
  })()

  const backToList = () => {
    if (openId === 'new' && draftNew?.name.trim()) {
      setWorking(prev => [...prev, { ...draftNew, id: nextTaskId() }])
    }
    setDraftNew(null)
    navigate(null)
  }

  // A copy shows its real status (inactive) and it can't be changed there;
  // the hint says what it becomes once approved.
  const updateTask = (updated) => {
    if (lock) return
    if (openId === 'new') { setDraftNew(updated); return }
    setWorking(prev => prev.map(t => (t.id === updated.id ? updated : t)))
  }

  // Deleting is an unsaved edit like any other; Save sends a medication
  // task's removal for approval (it stays live until then).
  const deleteTask = () => {
    if (openId === 'new') { setDraftNew(null); navigate(null); return }
    if (openCopy) { cancelChange(); return }
    setWorking(prev => prev.filter(t => t.id !== openId))
    navigate(null)
  }

  // Approve / Reject / Cancel are staged as unsaved edits, then go live with
  // the next care plan save (one save, as the care plan works offline).
  const stage = (fn) => setWorking(prev => prev.map(t => (t.id === openId ? fn(t) : t)))
  const setDecision = (value) => stage(t => {
    const key = isCopy(t) ? 'approval' : 'pendingRemoval'
    const { decision: _old, ...rest } = t[key]
    return { ...t, [key]: value ? { ...rest, decision: value } : rest }
  })
  // No "save the care plan" toasts: like any other unsaved edit, the leave
  // prompt covers forgetting to save (the live product has no such toasts).
  const approve = () => setDecision('approve')
  const reject = () => setDecision('reject')
  const undoDecision = () => setDecision(null)

  const cancelChange = () => {
    if (openCopy) {
      const original = openCopy.approval.replaces
      setWorking(prev => prev.filter(t => t.id !== openId))
      navigate(original)
    } else {
      stage(t => { const { pendingRemoval, ...rest } = t; return rest })
    }
  }

  // ── Revert (from History) ───────────────────────────────────
  const openRevert = (version) => {
    setRevert({ version, items: planSave({ live, target: revertTarget(live, version.snapshot) }) })
  }
  const confirmRevert = () => {
    const { version, items } = revert
    savePlan(items, null, `Reverted to version ${version.version}`)
    setRevert(null)
    const n = items.filter(needsApproval).length
    showToast(n
      ? `Revert to version ${version.version}: ${n} medication ${n === 1 ? 'change' : 'changes'} awaiting approval`
      : `Reverted to version ${version.version}`)
  }

  // ── List data ───────────────────────────────────────────────
  const noteFor = (task) => {
    const saved = liveById[task.id]
    if (!saved) return null
    if (isCopy(saved)) return saved.approval.kind === 'create' ? 'create' : 'copy'
    if (saved.pendingRemoval) return 'removal'
    if (saved.replacedBy) return 'replaced'
    return null
  }
  const stagedFor = (task) => {
    const saved = liveById[task.id]
    if (task.approval?.decision) return task.approval.decision
    if (task.pendingRemoval?.decision) return task.pendingRemoval.decision
    if (saved?.pendingRemoval && !task.pendingRemoval) return 'cancel'
    return null
  }
  // The filter lists only what someone still needs to act on: copies, new
  // tasks and removals. A copy's original isn't actionable, and the copy's own page
  // compares with it and links to it.
  // A change already approved, rejected or cancelled (not saved yet) drops
  // out, matching the strip's count.
  const inPending = t => ['copy', 'create', 'removal'].includes(noteFor(t)) && !stagedFor(t)
  let displayed = hideInactive ? working.filter(t => t.status === 'active' || isCopy(liveById[t.id])) : working
  if (pendingOnly) displayed = working.filter(inPending)

  const viewId = window.location.pathname + window.location.search
  const docVersionObj = docVersion != null ? versions.find(v => v.version === docVersion) : null
  const latestVersion = Math.max(...versions.map(v => v.version))
  const copyOfOpen = lock === 'copy' ? copyOf(live, openId) : null
  // Unsaved: the original's copy was cancelled, or a removal was cancelled.
  const copyCancelled = copyOfOpen && !working.some(t => t.id === copyOfOpen.id)
  const removalDecision = lock === 'removal' ? (workingTask?.pendingRemoval ? decision : 'cancel') : null
  const undoCopyCancel = () => setWorking(prev => {
    const i = prev.findIndex(t => t.id === openId)
    return [...prev.slice(0, i + 1), copyOfOpen, ...prev.slice(i + 1)]
  })
  const undoRemovalCancel = () => stage(t => ({ ...t, pendingRemoval: openLive.pendingRemoval }))

  return (
    <>
      <DevToolbar key={viewId}>
        <DevEdit containerRef={pageRef} prototypeId={viewId} />
        <DevMode containerRef={pageRef} />
        <DevComments containerRef={pageRef} prototypeId={viewId} />
        <WireframeToggle />
        <AuditCapture containerRef={pageRef} />
      </DevToolbar>
      <div className="page" ref={pageRef}>
        <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>
        <SideNav activeItem="customers" />

        <div className="page-body">
          <TopNav />
          <CustomerProfileNav activeTab={docVersionObj ? 'Customer File' : 'Care Management'} />

          {docVersionObj ? (
            <CarePlanDocument version={docVersionObj} latestVersion={latestVersion} onBack={closeDocument} />
          ) : (<>
          <div className="cm-header-band">
            <div className="cm-container">
              <div className="cm-header-row">
                <NextReview date={nextReview} />
                <div className="cm-header-actions">
                  {inDetail ? (
                    <>
                      <button className="round-btn secondary-btn" onClick={backToList}>Back to list</button>
                      <button className="round-btn cm-danger-btn" onClick={deleteTask} disabled={!!lock}>
                        {openCopy ? 'Cancel change' : 'Delete task'}
                      </button>
                    </>
                  ) : (
                    <>
                      {dirty && <span className="cm-dirty-note">Unsaved changes</span>}
                      <button className="round-btn tertiary-btn btn-icon-left" onClick={() => window.print()}>
                        <PrintIcon /> Print
                      </button>
                      <button className="round-btn primary-btn" onClick={handleSave}>Save</button>
                      <button className="round-btn primary-btn btn-icon-left" onClick={addTask}>
                        <PlusIcon /> Add task
                      </button>
                    </>
                  )}
                </div>
              </div>

              <SubTabs
                right={!inDetail && (
                  <label className="checkbox-wrap">
                    <input type="checkbox" checked={hideInactive} onChange={e => setHideInactive(e.target.checked)} />
                    <span className="checkbox-box" />
                    <span>Hide inactive</span>
                  </label>
                )}
              />
            </div>
          </div>

          <main className="cm-container cm-main">
            {inDetail ? (
              <>
                {openCopy && (
                  <CopyBanner
                    copy={openCopy}
                    original={openCopy.approval.replaces ? liveById[openCopy.approval.replaces] : null}
                    persona={persona}
                    decision={decision}
                    onOpenOriginal={() => navigate(openCopy.approval.replaces)}
                    onApprove={approve}
                    onReject={reject}
                    onUndo={undoDecision}
                    onCancel={cancelChange}
                  />
                )}
                {lock === 'removal' && (
                  <RemovalBanner
                    task={openLive}
                    persona={persona}
                    decision={removalDecision}
                    onApprove={approve}
                    onReject={reject}
                    onUndo={removalDecision === 'cancel' ? undoRemovalCancel : undoDecision}
                    onCancel={cancelChange}
                  />
                )}
                {(lock === 'copy' || lock === 'replaced') && (
                  <LockedBanner
                    reason={lock}
                    task={openLive}
                    cancelled={copyCancelled}
                    onUndo={undoCopyCancel}
                    onOpen={() => navigate(lock === 'copy' ? copyOfOpen.id : openLive.replacedBy)}
                  />
                )}
                {rejection && (
                  <RejectedBanner rejection={rejection} onDismiss={() => setDismissed(prev => new Set([...prev, rejection.version]))} />
                )}
                <TaskDetail
                  key={openId}
                  task={workingTask}
                  onChange={updateTask}
                  readOnly={!!lock || !!decision}
                  statusLocked={!!openCopy}
                  statusHint={!openCopy ? null
                    : openCopy.approval.intendedStatus === 'active'
                      ? 'Inactive until approved. Approving makes it active.'
                      : openCopy.approval.kind === 'edit'
                        ? 'Inactive until approved, and stays inactive: this change stops the task.'
                        : 'Inactive until approved, and stays inactive once approved.'}
                />
              </>
            ) : (
              <>
                {pendingCount > 0 && (
                  <div className="cm-approval-strip">
                    <ShieldIcon />
                    <p>
                      <button className="cm-approval-strip-link" onClick={() => setPendingOnly(true)}>
                        {pendingCount} medication {pendingCount === 1 ? 'change' : 'changes'} awaiting approval
                      </button>
                    </p>
                    {pendingOnly && (
                      <button className="cm-link-btn" onClick={() => setPendingOnly(false)}>
                        Show all tasks
                      </button>
                    )}
                  </div>
                )}

                <div className="cm-task-list">
                  {displayed.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      note={noteFor(task)}
                      staged={!!stagedFor(task)}
                      unsaved={!same(task, liveById[task.id])}
                      onOpen={() => navigate(task.id)}
                    />
                  ))}
                  {displayed.length === 0 && <p className="cm-empty">No tasks to display.</p>}
                </div>

                <div className="cm-list-footer">
                  <button className="round-btn secondary-btn" onClick={() => setHistoryOpen(true)}>History</button>
                </div>
              </>
            )}
          </main>
          </>)}
        </div>
      </div>

      <PersonaSwitcher
        personas={PERSONAS}
        persona={persona}
        onChange={setPersona}
        contributors={!inDetail ? null
          : openCopy ? openCopy.approval.contributors.map(c => c.name)
          : lock === 'removal' ? openLive.pendingRemoval.contributors.map(c => c.name)
          : null}
      />

      <CarePlanReviewModal
        open={!!saveModal}
        initialReviewDate={nextReview}
        items={saveModal || []}
        onCancel={() => setSaveModal(null)}
        onConfirm={confirmSave}
      />
      <UnsavedChangesModal
        open={!!leaveTo}
        onStay={() => setLeaveTo(null)}
        onDiscard={() => {
          const target = leaveTo
          setLeaveTo(null)
          setWorking(live)
          setDraftNew(null)
          leavingRef.current = true
          if (target.matches('a[href]')) { window.location.href = target.href; return }
          // Stays set until the next unsaved edit, so a click that navigates
          // doesn't also trigger the browser's own leave warning.
          target.click()
        }}
      />
      <HistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        versions={versions}
        onRevert={openRevert}
        onView={openDocument}
      />
      <RevertModal
        open={!!revert}
        version={revert?.version}
        items={revert?.items || []}
        dirty={dirty}
        onCancel={() => setRevert(null)}
        onConfirm={confirmRevert}
      />

      {toast && <div className="cm-toast">{toast}</div>}
    </>
  )
}
