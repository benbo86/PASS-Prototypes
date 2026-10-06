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
  PendingBanner, RejectedBanner, CarePlanReviewModal, RejectModal, PersonaSwitcher, ShieldIcon,
} from './ApprovalUI'
import { PlusIcon, PrintIcon, TaskTypeIcon } from './icons.jsx'
import {
  INITIAL_TASKS, NEXT_REVIEW, VISITS, blankTask, nextTaskId, fmtDate, taskTags,
} from './data'
import { PERSONAS, INITIAL_VERSIONS, INITIAL_REQUESTS, SOURCE_WEB } from './seed'
import {
  diffTaskLists, applyChanges, isMedication, summariseChange, fmtDateTime,
  overlayPending, proposedTask, planSave, withFields,
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

const PENDING_LABEL = {
  edit: 'Change pending approval',
  create: 'New · pending approval',
  delete: 'Removal pending approval',
}

function TaskCard({ task, onOpen, pending, unsaved }) {
  const tone = task.type === 'Medication' ? 'medication' : 'general'
  const visits = VISITS.filter(v => task.visitIds.includes(v.id))
  return (
    <button
      type="button"
      className={`cm-task-card cm-task-card--${tone}${pending ? ' cm-task-card--pending' : ''}`}
      onClick={onOpen}
    >
      <div className="cm-task-head">
        <span className={`cm-type-icon cm-type-icon--${task.type.toLowerCase()}`}>
          <TaskTypeIcon type={task.type} />
        </span>
        <span className="cm-task-title">{task.name || 'Untitled task'}</span>
        {unsaved && <span className="cm-unsaved-chip">Unsaved changes</span>}
        {pending && <span className="cm-pending-chip"><ShieldIcon size={16} /> {PENDING_LABEL[pending]}</span>}
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

// The open task lives in the URL (?task=t1 / ?task=new) so the detail view
// is linkable and Dev Comments scope to each view separately — same
// pathname+search convention as timesheets/filters and GPA.
const readTaskParam = () => new URLSearchParams(window.location.search).get('task')
// Version History's View opens the read-only care plan document for that
// version (?careplan=28) — on the Customer File page in the live product.
const readCareplanParam = () => {
  const v = new URLSearchParams(window.location.search).get('careplan')
  return v ? Number(v) : null
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
let requestCounter = 100

// State model (no-lock, 2026-10-05):
// - `live`     — the care plan carers actually see (last saved/approved).
// - `requests` — medication changes awaiting/after approval. Nothing is
//                locked while one is pending (except a pending removal).
// - baseline   — derived: live with every pending proposal shown in place.
//                This is what the list and task page show, and what unsaved
//                edits are measured against.
// - `working`  — baseline plus this session's unsaved edits. Saving happens
//                from the list (as in the live product).
// - `versions` — the careplan version history.
const INITIAL_PENDING = INITIAL_REQUESTS.filter(r => r.status === 'pending')
export default function App() {
  const pageRef = useRef(null)
  const [persona, setPersona] = useState(PERSONAS[0])
  const [live, setLive] = useState(INITIAL_TASKS)
  const [working, setWorking] = useState(() => overlayPending(INITIAL_TASKS, INITIAL_PENDING))
  const [requests, setRequests] = useState(INITIAL_REQUESTS)
  const [versions, setVersions] = useState(INITIAL_VERSIONS)
  const [nextReview, setNextReview] = useState(NEXT_REVIEW)

  const [hideInactive, setHideInactive] = useState(true)
  const [pendingOnly, setPendingOnly] = useState(false)
  const [openId, setOpenId] = useState(readTaskParam)
  const [docVersion, setDocVersion] = useState(readCareplanParam)
  const [draftNew, setDraftNew] = useState(null)
  const [saveModal, setSaveModal] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [revert, setRevert] = useState(null)
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
  const pendingRequests = requests.filter(r => r.status === 'pending')
  const pendingByTask = Object.fromEntries(pendingRequests.map(r => [r.taskId, r]))
  // Once the last pending change is approved/rejected/withdrawn the banner
  // (and its "Show all tasks" link) disappears — drop the filter with it,
  // or the list would be left empty with no way back.
  useEffect(() => {
    if (pendingRequests.length === 0) setPendingOnly(false)
  }, [pendingRequests.length])
  const liveById = Object.fromEntries(live.map(t => [t.id, t]))
  const baseline = overlayPending(live, pendingRequests)
  const baselineById = Object.fromEntries(baseline.map(t => [t.id, t]))
  const unsavedChanges = diffTaskLists(baseline, working)
  const dirty = unsavedChanges.length > 0
  const nextVersion = Math.max(...versions.map(v => v.version)) + 1

  const latestRequestFor = (taskId) => {
    const forTask = requests.filter(r => r.taskId === taskId)
    return forTask[forTask.length - 1]
  }

  // ── Core commit: one place that applies immediate changes and raises,
  //    updates or closes approval requests (see planSave in approval.js), so
  //    Save, Delete and Revert all behave the same ──
  // `review` = the Care plan review answers ({ saveType, reviewDate, notes })
  // when the commit came from the list's Save; Delete/Revert don't ask.
  const commit = ({ immediate = [], ops = [], origin = 'Edit', review = null }) => {
    const now = fmtDateTime(new Date())
    const ts = Date.now()
    const nextLive = applyChanges(live, immediate)

    if (immediate.length) {
      setVersions(prev => [{
        version: nextVersion, modifiedAt: now, receivedAt: now, ts,
        employee: persona.name, source: SOURCE_WEB,
        summary: immediate.map(summariseChange), changes: immediate,
        approval: null, origin: origin === 'Edit' ? undefined : origin,
        review, snapshot: nextLive,
      }, ...prev])
    }

    let nextRequests = requests
    ops.forEach(op => {
      if (op.type === 'close') {
        nextRequests = nextRequests.map(r => (r.id === op.pending.id
          ? { ...r, status: 'withdrawn', decidedAt: now, closedBy: persona.name, closedNote: op.note,
              before: liveById[r.taskId] || null, after: proposedTask(liveById[r.taskId], r) }
          : r))
        return
      }
      const contributor = { name: persona.name, at: now, review, step: op.step }
      const fields = {
        kind: op.kind, keys: op.keys, before: op.before, after: op.after,
        requestedAt: now, ts, source: SOURCE_WEB, review,
        origin: origin === 'Edit' ? 'Edit' : origin.replace('Reverted', 'Revert'),
      }
      if (op.pending) {
        // A further edit to a pending change: same request, approval restarts.
        nextRequests = nextRequests.map(r => (r.id === op.pending.id
          ? { ...r, ...fields, contributors: [...r.contributors, contributor] }
          : r))
      } else {
        nextRequests = [...nextRequests, {
          id: `r${++requestCounter}`, taskId: op.taskId, ...fields,
          requestedBy: persona.name, status: 'pending', contributors: [contributor],
        }]
      }
    })
    setRequests(nextRequests)
    setLive(nextLive)

    // Every task this commit touched now shows its new baseline; unsaved
    // edits to other tasks are left alone.
    const nextBaseline = overlayPending(nextLive, nextRequests.filter(r => r.status === 'pending'))
    const nextBaselineById = Object.fromEntries(nextBaseline.map(t => [t.id, t]))
    const touched = new Set([...immediate.map(c => c.taskId), ...ops.map(o => o.taskId || o.pending.taskId)])
    setWorking(prev => {
      let next = prev.filter(t => !touched.has(t.id) || nextBaselineById[t.id])
      next = next.map(t => (touched.has(t.id) ? nextBaselineById[t.id] : t))
      touched.forEach(id => { if (nextBaselineById[id] && !next.some(t => t.id === id)) next.push(nextBaselineById[id]) })
      return next
    })
    // The review date belongs to the review, not the medication change, so
    // it applies straight away even if every change is waiting on approval.
    if (review) setNextReview(review.reviewDate)
  }

  const planFrom = (target) => planSave({ live, baseline, target, pendingByTask })
  // For the dialogs: what each request op will propose, compared with live.
  const approvalItems = ops => ops.filter(o => o.type === 'request').map(o => ({
    taskId: o.taskId,
    before: o.kind === 'create' ? null : liveById[o.taskId],
    after: o.kind === 'delete' ? null : o.kind === 'create' ? o.after : withFields(liveById[o.taskId], o.after, o.keys),
    pending: o.pending,
  }))
  const closingItems = ops => ops.filter(o => o.type === 'close').map(o => ({
    taskId: o.pending.taskId, name: (o.pending.after || o.pending.before).name, requestedBy: o.pending.requestedBy,
  }))

  // ── List actions ────────────────────────────────────────────
  const handleSave = () => {
    if (!dirty) { showToast('No changes to save'); return }
    // Every save goes through the Care plan review dialog, as in the live
    // product — it also lists any medication changes going for approval.
    setSaveModal(planFrom(working))
  }

  const confirmSave = (review) => {
    const { immediate, ops } = saveModal
    commit({ immediate, ops, review })
    setSaveModal(null)
    const requested = ops.filter(o => o.type === 'request').length
    showToast(requested
      ? `${immediate.length ? `Saved · version ${nextVersion}. ` : ''}${requested} medication ${requested === 1 ? 'change' : 'changes'} sent for approval`
      : `Care plan saved${immediate.length ? ` · version ${nextVersion}` : ''}`)
  }

  const addTask = () => { setDraftNew({ ...blankTask(), id: null }); navigate('new') }

  // ── Task page actions ───────────────────────────────────────
  const openTaskObj = openId === 'new'
    ? (draftNew || blankTask())
    : working.find(t => t.id === openId)
  const inDetail = !!openId && !!openTaskObj
  const openPending = openId ? pendingByTask[openId] : null
  const openLatest = openId && openId !== 'new' ? latestRequestFor(openId) : null
  const showRejected = openLatest?.status === 'rejected' && !openLatest.dismissed

  const backToList = () => {
    // A new task joins the working care plan once it has a name; it's
    // saved (or sent for approval) with everything else from the list.
    if (openId === 'new' && draftNew?.name.trim()) {
      setWorking(prev => [...prev, { ...draftNew, id: nextTaskId() }])
    }
    setDraftNew(null)
    navigate(null)
  }

  const updateTask = (updated) => {
    if (openPending?.kind === 'delete') return
    if (openId === 'new') setDraftNew(updated)
    else setWorking(prev => prev.map(t => (t.id === updated.id ? updated : t)))
  }

  const deleteTask = () => {
    if (openId === 'new') { setDraftNew(null); navigate(null); return }
    const liveTask = liveById[openId]
    if (!liveTask && !openPending) {
      // Never saved — just drop it from the working copy.
      setWorking(prev => prev.filter(t => t.id !== openId))
      navigate(null)
      return
    }
    const target = working.filter(t => t.id !== openId)
    const { immediate, ops } = planFrom(target)
    const ownOps = ops.filter(o => (o.taskId || o.pending.taskId) === openId)
    const ownImmediate = immediate.filter(c => c.taskId === openId)
    if (!liveTask) {
      if (!window.confirm('Discard this new medication task? Its approval request will be withdrawn.')) return
      commit({ ops: ownOps })
      showToast('New task discarded')
      navigate(null)
    } else if (isMedication(liveTask)) {
      const msg = openPending
        ? 'Removing a medication task needs approval from a Care Manager. This replaces the change already waiting for approval. Send for approval?'
        : 'Removing a medication task needs approval from a Care Manager. It stays live until then. Send for approval?'
      if (!window.confirm(msg)) return
      commit({ ops: ownOps })
      showToast('Removal sent for approval')
    } else {
      if (!window.confirm('Delete this task?')) return
      commit({ immediate: ownImmediate })
      showToast(`Task deleted · version ${nextVersion}`)
      navigate(null)
    }
  }

  const decide = (request, patch) => setRequests(prev => prev.map(r => (r.id === request.id ? { ...r, ...patch } : r)))

  // Approving applies only the request's clinical fields to whatever is live
  // now, so housekeeping edits saved while it waited are kept.
  const approve = (request) => {
    const now = fmtDateTime(new Date())
    const liveTask = liveById[request.taskId] || null
    const after = request.kind === 'delete' ? null : proposedTask(liveTask, request)
    const change = { taskId: request.taskId, before: liveTask, after }
    const nextLive = applyChanges(live, [change])
    setLive(nextLive)
    if (request.kind === 'delete') setWorking(prev => prev.filter(t => t.id !== request.taskId))
    setVersions(prev => [{
      version: nextVersion, modifiedAt: now, receivedAt: now, ts: Date.now(),
      employee: [...new Set(request.contributors.map(c => c.name))].join(', '), source: request.source,
      summary: [summariseChange(change)], changes: [change],
      approval: { by: persona.name, at: now },
      origin: request.origin === 'Edit' ? undefined : request.origin,
      review: request.review, snapshot: nextLive,
    }, ...prev])
    decide(request, { status: 'approved', decidedBy: persona.name, decidedAt: now, before: liveTask, after })
    showToast(`Change approved · version ${nextVersion} is now live`)
    if (request.kind === 'delete') navigate(null)
  }

  // Rejected/withdrawn: the task's pending fields go back to live.
  const closeRequest = (request, patch) => {
    const liveTask = liveById[request.taskId] || null
    decide(request, { ...patch, before: liveTask, after: request.kind === 'delete' ? null : proposedTask(liveTask, request) })
    setWorking(prev => {
      if (request.kind === 'create') return prev.filter(t => t.id !== request.taskId)
      if (request.kind === 'edit') return prev.map(t => (t.id === request.taskId ? withFields(t, liveTask, request.keys) : t))
      return prev
    })
    if (request.kind === 'create') navigate(null)
  }

  const reject = (reason) => {
    closeRequest(rejectTarget, { status: 'rejected', decidedBy: persona.name, decidedAt: fmtDateTime(new Date()), reason })
    setRejectTarget(null)
    showToast('Change rejected')
  }

  const withdraw = (request) => {
    closeRequest(request, { status: 'withdrawn', decidedAt: fmtDateTime(new Date()), closedBy: persona.name })
    showToast('Request withdrawn')
  }

  // ── Revert (from History) ───────────────────────────────────
  const openRevert = (version) => {
    const plan = planFrom(version.snapshot)
    setRevert({ version, ...plan })
  }

  const confirmRevert = () => {
    const { version, immediate, ops } = revert
    commit({ immediate, ops, origin: `Reverted to version ${version.version}` })
    setRevert(null)
    const requested = ops.filter(o => o.type === 'request').length
    showToast(requested
      ? `Revert to version ${version.version}: ${requested} medication ${requested === 1 ? 'change' : 'changes'} sent for approval`
      : `Reverted to version ${version.version}`)
  }

  // ── List data ───────────────────────────────────────────────
  const listTasks = working
  let displayed = hideInactive ? listTasks.filter(t => t.status === 'active') : listTasks
  if (pendingOnly) displayed = listTasks.filter(t => pendingByTask[t.id])


  const viewId = window.location.pathname + window.location.search
  // A version made earlier in a session that's since been reloaded won't
  // exist any more — fall back to the task list.
  const docVersionObj = docVersion != null ? versions.find(v => v.version === docVersion) : null
  const latestVersion = Math.max(...versions.map(v => v.version))

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
                      <button className="round-btn cm-danger-btn" onClick={deleteTask} disabled={openPending?.kind === 'delete'}>Delete task</button>
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
                {openPending && (
                  <PendingBanner
                    request={openPending}
                    persona={persona}
                    onApprove={() => approve(openPending)}
                    onReject={() => setRejectTarget(openPending)}
                    onWithdraw={() => withdraw(openPending)}
                  />
                )}
                {!openPending && showRejected && (
                  <RejectedBanner request={openLatest} onDismiss={() => decide(openLatest, { dismissed: true })} />
                )}
                <TaskDetail key={openId} task={openTaskObj} onChange={updateTask} readOnly={openPending?.kind === 'delete'} />
              </>
            ) : (
              <>
                {pendingRequests.length > 0 && (
                  <div className="cm-approval-strip">
                    <ShieldIcon />
                    <p>
                      <button className="cm-approval-strip-link" onClick={() => setPendingOnly(true)}>
                        {pendingRequests.length} medication {pendingRequests.length === 1 ? 'change' : 'changes'} pending approval
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
                      pending={pendingByTask[task.id]?.kind || null}
                      unsaved={!same(task, baselineById[task.id])}
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

      <PersonaSwitcher personas={PERSONAS} persona={persona} onChange={setPersona} />

      <CarePlanReviewModal
        open={!!saveModal}
        initialReviewDate={nextReview}
        approvalChanges={saveModal ? approvalItems(saveModal.ops) : []}
        closingChanges={saveModal ? closingItems(saveModal.ops) : []}
        onCancel={() => setSaveModal(null)}
        onConfirm={confirmSave}
      />
      <RejectModal open={!!rejectTarget} request={rejectTarget} onCancel={() => setRejectTarget(null)} onConfirm={reject} />
      <HistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        versions={versions}
        requests={requests}
        onRevert={openRevert}
        onView={openDocument}
      />
      <RevertModal
        open={!!revert}
        version={revert?.version}
        immediate={revert?.immediate || []}
        approval={revert ? approvalItems(revert.ops) : []}
        closing={revert ? closingItems(revert.ops) : []}
        blocked={revert?.skipped || []}
        dirty={dirty}
        onCancel={() => setRevert(null)}
        onConfirm={confirmRevert}
      />

      {toast && <div className="cm-toast">{toast}</div>}
    </>
  )
}
