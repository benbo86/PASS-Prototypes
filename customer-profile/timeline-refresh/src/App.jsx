import { useState, useRef } from 'react'
import SideNav from '../../../Components/SideNav'
import TopNav from '../../../Components/TopNav'
import CustomerProfileNav from '../../../Components/CustomerProfileNav'
import DevToolbar from '../../../Components/DevToolbar'
import DevMode from '../../../Components/DevMode'
import DevComments from '../../../Components/DevComments'
import DevEdit from '../../../Components/DevEdit'
import WireframeToggle from '../../../Components/WireframeToggle'
import AuditCapture from '../../../Components/AuditCapture'
import VisitTasksPanel from '../../../Components/VisitTasksPanel'
import TimelineItem, { TimelineTypeIcon } from '../../../Components/TimelineItem'
import TimelineHeader, { TimelineFilterSelect, TimelineFilterInput } from '../../../Components/TimelineHeader'

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)

// ─── Filters ──────────────────────────────────────────────────
// The timeline lists visits only. A visit matches a filter if it, or any of
// its tasks, does — so "Medication" finds every visit that includes a
// medication task.

const EVENT_TYPE_OPTIONS = [
  { value: 'all', label: 'All timeline events' },
  { value: 'general', label: 'Tasks' },
  { value: 'medication', label: 'Medication' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'hydration', label: 'Hydration' },
  { value: 'observation', label: 'Observations' },
]

// ─── Data ─────────────────────────────────────────────────────
// Visit: time = planned start (row time), due = planned window (the visit
// time), completed = when the carer finished (time only, or date + time if
// that is a different day to the visit start). One carer (`by`) completes a
// visit's tasks. Task: done = time (doneDate only if a different day).

const task = (id, type, title, instructions, status, done, note, doneDate) =>
  ({ id, type, title, instructions, status, done, doneDate, note })

const TODAY_VISITS = [
  { id: 'v1', time: '17:00', type: 'visit', title: 'Evening Visit', status: 'cancelled',
    due: { due: '17:00', completeBy: '17:30' },
    cancellation: { reason: 'Customer cancelled', note: "Patricia's daughter called the office to say she'll be staying over this evening, so the visit isn't needed." },
    tasks: [
      task(101, 'nutrition', 'EVENING MEAL',
        ['Please prepare my evening meal and serve this to me on a tray whilst I am seated comfortably on my sofa. My daughter usually prepares home-cooked meals for me in advance and leaves these in the fridge for reheating.'],
        'cancelled', null, "Part of the evening visit, which was cancelled — Patricia's daughter is preparing her meal instead."),
    ] },
  { id: 'v2', time: '12:30', type: 'visit', title: 'Lunch Visit', status: 'complete', by: 'Karen Bailey',
    due: { due: '12:30', completeBy: '13:00' }, actual: '12:29 – 12:56',
    tasks: [
      task(201, 'general', 'ENTERING MY PROPERTY', ['Please knock and wait — I may take a moment to get to the door.'], 'complete', '12:31', 'Knocked and waited. Patricia was in her chair and let me in.'),
      task(202, 'general', 'MEET AND GREET', ['Introduce yourself if this is your first visit with me.'], 'complete', '12:32', 'Patricia was in good spirits.'),
      task(203, 'nutrition', 'LUNCH', ['Heat the meal in the fridge until piping hot, let it cool a little, and serve on a tray at the sofa.'], 'complete', '12:44', 'Chicken casserole heated and served. Ate most of it.'),
      task(204, 'hydration', 'OFFER FLUIDS', ['Prefers a glass of squash rather than water — jug is in the fridge door.'], 'complete', '12:48', 'Drank a full glass of squash.'),
      task(205, 'medication', 'Lunchtime medication', ['Prompt Patricia to take her tablets from the dosette box.'], 'complete', '12:50', 'Tablets taken with squash.'),
      task(206, 'general', 'ENSURE KITCHEN TIDY', ['Dishes washed and dried, surfaces wiped.'], 'complete', '12:54', 'Kitchen left tidy.'),
    ] },
  { id: 'v3', time: '09:30', type: 'visit', title: 'Personal care', status: 'complete', by: 'Karen Bailey',
    due: { due: '09:30', completeBy: '10:30' }, actual: '09:29 – 10:12',
    careNote: ['Patricia was in bed on arrival. Supported her to the commode, personal care carried out, bowels opened.', 'Supported with dressing, tidied areas and disposed of rubbish. Dressing on right buttock, scab on left. Husband aware.', 'Left her well sat in her chair. Nothing else required.'],
    reviewNote: { by: 'Louise Carter', date: '6 Jul 2026 at 12:04', text: 'Cream not applied, Patricia declined. Husband aware, monitor skin at next visit.' },
    tasks: [
      task(301, 'general', 'ENTERING MY PROPERTY', ['Please knock and wait — I may take a moment to get to the door.'], 'complete', '09:31', 'Knocked and waited before entering. Patricia let me in without difficulty.'),
      task(302, 'general', 'MEET AND GREET', ['Introduce yourself if this is your first visit with me.'], 'complete', '09:32', 'Introduced myself on arrival. Patricia was alert and in good spirits.'),
      task(303, 'general', 'CONSENT TO CARE', ['Always ask before starting any personal care task.'], 'complete', '09:33', "Explained today's care tasks and gained verbal consent before starting."),
      task(304, 'general', 'PRESSURE SORES', ['Please be discreet and check my body for pressure sores, if you notice any please inform my husband and document on the body map.'], 'complete', '09:44', 'Checked skin discreetly during personal care — no new pressure marks noted.'),
      task(305, 'general', 'MORNING PERSONAL CARE / DRESSING', ['I prefer to choose my own outfit — please lay a couple of options out for me to pick from.'], 'complete', '09:52', 'Assisted with washing and dressing. Patricia chose her own outfit from the options offered.'),
      task(306, 'general', 'ORAL CARE', ['Uses own electric toothbrush, kept in the bathroom cabinet.'], 'complete', '09:53', 'Teeth brushed with her own toothbrush.'),
      task(307, 'observation', 'Body Map Observation', ['Record any marks or skin changes on the body map.'], 'complete', '09:54', 'Dressing on right buttock, scab on left. Recorded on the body map.'),
      task(308, 'hydration', 'OFFER FLUIDS', ['Prefers a glass of squash rather than water — jug is in the fridge door.'], 'complete', '09:55', 'Drank a glass of squash.'),
      task(309, 'general', 'ASSIST WITH MOBILITY & SAFE TRANSFER SUPPORT', ['Use the walking frame for all transfers — do not support under the arms.'], 'complete', '09:59', 'Used the walking frame for the transfer to her chair.'),
      task(310, 'general', 'BRUSH MY HAIR WITH CONSENT', ['Ask first — some days this isn’t wanted.'], 'complete', '10:02', 'Asked first — Patricia was happy for her hair to be brushed today.'),
      task(311, 'general', 'INCONTINENCE PAD', ['Dispose of used pads in the bathroom bin, not the kitchen.'], 'complete', '10:04', 'Pad changed and disposed of in the bathroom bin.'),
      task(312, 'general', 'ENSURE BATHROOM & TOILET CLEANED AFTER USE', ['Cleaning products are under the sink.'], 'complete', '10:10', 'Cleaned the bathroom and toilet after use.'),
      task(313, 'general', 'COMPANIONSHIP', ["Please engage with me throughout the visit, I have Parkinson's with Lewy bodies and I am not always fully able to communicate with full sentences but can acknowledge and say some words in response but you may have to prompt."], 'complete', '10:11', 'Chatted throughout the visit. Patricia responded with a few words and smiled.'),
      task(314, 'medication', 'Medi Derma cream *As agreed by the Registered Manager**', ['Please administer a small pea sized amount to my bottom after personal care. Do not over apply, this will not help me.'], 'notdone', null, 'Patricia declined the cream today and said her skin felt comfortable. Husband informed.'),
    ] },
  { id: 'v4', time: '08:00', type: 'visit', title: 'Morning Medication Visit', status: 'missed',
    due: { due: '08:00', completeBy: '08:15' },
    tasks: [
      task(401, 'medication', 'Morning medication', ['Prompt Patricia to take her morning tablets from the dosette box.'], 'overdue', null, null),
    ] },
]

const PAST_VISITS = [
  { id: 'v5', time: '22:00', type: 'visit', title: 'Night Visit', status: 'complete', by: 'Karen Bailey',
    due: { due: '22:00', completeBy: '07:00' }, actual: '22:04 – 6 Jul 2026 at 06:58',
    tasks: [
      task(501, 'general', 'SETTLE FOR THE NIGHT', ['Help me into my nightwear and into bed, with the bed rails up.'], 'complete', '22:12', 'Settled in bed with the rails up.'),
      task(502, 'general', 'REPOSITIONING', ['Reposition me every four hours to prevent pressure sores.'], 'complete', '02:30', 'Repositioned onto her left side. Skin intact.', '6 Jul 2026'),
      task(503, 'general', 'CONTINENCE CHECK', ['Check and change my pad if needed.'], 'complete', '03:05', 'Pad checked and changed.', '6 Jul 2026'),
      task(504, 'hydration', 'OFFER FLUIDS', ['A small drink of squash from the bedside cup.'], 'complete', '06:20', 'Took a few sips of squash.', '6 Jul 2026'),
      task(505, 'general', 'MORNING WASH', ['Help me wash and dress ready for the day.'], 'complete', '06:50', 'Washed and dressed. Patricia chose her own clothes.', '6 Jul 2026'),
    ] },
  { id: 'v6', time: '17:30', type: 'visit', title: 'Evening Visit', status: 'complete', by: 'Karen Bailey',
    due: { due: '17:30', completeBy: '18:00' }, actual: '17:28 – 17:54',
    tasks: [
      task(601, 'general', 'ENTERING MY PROPERTY', ['Please knock and wait — I may take a moment to get to the door.'], 'complete', '17:31', 'Let in by Patricia.'),
      task(602, 'nutrition', 'EVENING MEAL', ['Heat the meal left in the fridge by my daughter and serve on a tray at the sofa.'], 'complete', '17:42', 'Shepherd’s pie reheated and served. Ate about half.'),
      task(603, 'hydration', 'OFFER FLUIDS', ['Prefers a glass of squash rather than water.'], 'complete', '17:48', 'Drank a glass of squash.'),
      task(604, 'general', 'ENSURE KITCHEN TIDY', ['Dishes washed and dried, surfaces wiped.'], 'complete', '17:52', 'Kitchen left tidy.'),
    ] },
  { id: 'v7', time: '09:30', type: 'visit', title: 'Personal care', status: 'complete', by: 'Karen Bailey',
    due: { due: '09:30', completeBy: '10:30' }, actual: '09:31 – 10:08',
    tasks: [
      task(701, 'general', 'MORNING PERSONAL CARE / DRESSING', ['I prefer to choose my own outfit — please lay a couple of options out for me to pick from.'], 'complete', '09:52', 'Assisted with washing and dressing.'),
      task(702, 'hydration', 'OFFER FLUIDS', ['Prefers a glass of squash rather than water — jug is in the fridge door.'], 'complete', '09:55', 'Drank a glass of squash.'),
      task(703, 'general', 'COMPANIONSHIP', ['Please engage with me throughout the visit.'], 'complete', '10:03', 'Chatted about her garden.'),
    ] },
]

const ALL_VISITS = [...TODAY_VISITS, ...PAST_VISITS]

// ─── Visit panel content ──────────────────────────────────────

const VISIT_STATUS_LABELS = { complete: 'Complete', missed: 'Missed', cancelled: 'Cancelled' }
const TASK_TYPE_LABELS = { general: 'Tasks', observation: 'Observations', medication: 'Medication', nutrition: 'Nutrition', hydration: 'Hydration' }
const TASK_STATUS_LABELS = { complete: 'Completed', notdone: 'Not done', overdue: 'Overdue', cancelled: 'Cancelled' }

function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function buildVisitPanel(visit, dayLabel) {
  const done = visit.tasks.filter(t => t.status === 'complete').length
  const details = [
    { label: 'Date', value: dayLabel },
    { label: 'Planned time', value: `${visit.due.due} – ${visit.due.completeBy}` },
    visit.actual && { label: 'Actual time', value: visit.actual },
    visit.by && { label: 'Employee', value: visit.by },
    visit.cancellation && { label: 'Reason', value: visit.cancellation.reason },
  ].filter(Boolean)
  const cards = []
  if (visit.cancellation?.note) cards.push(
    <div className="vtp-card" key="cancel"><h3>Cancellation note</h3><p>{visit.cancellation.note}</p></div>)
  if (visit.careNote) cards.push(
    <div className="vtp-card" key="care"><h3>Care note</h3>{visit.careNote.map((l, i) => <p key={i}>{l}</p>)}</div>)
  if (visit.reviewNote) cards.push(
    <div className="vtp-card" key="review"><h3>Review note</h3><p>{visit.reviewNote.text}</p>
      <p className="vtp-card-meta">{visit.reviewNote.by} · {visit.reviewNote.date}</p></div>)
  return {
    title: visit.title,
    status: visit.status,
    statusLabel: VISIT_STATUS_LABELS[visit.status],
    details,
    taskSummary: `${done} of ${visit.tasks.length} completed`,
    tasks: visit.tasks.map(t => ({
      id: t.id,
      title: t.title,
      instructions: t.instructions,
      completed: t.done && (t.doneDate ? `${t.doneDate} at ${t.done}` : t.done),
      // Minutes from midnight of the visit's start day, for sorting the Completed column.
      completedSort: t.done ? timeToMinutes(t.done) + (t.doneDate ? 1440 : 0) : null,
      icon: <TimelineTypeIcon type={t.type} />,
      typeLabel: TASK_TYPE_LABELS[t.type],
      status: t.status,
      statusLabel: TASK_STATUS_LABELS[t.status],
      note: t.note,
    })),
    cards,
  }
}

export default function App() {
  const pageRef = useRef(null)
  const latestDayRef = useRef(null)
  const [tab, setTab] = useState('care-events')
  const [eventType, setEventType] = useState('all')
  const [eventName, setEventName] = useState('')
  const [doneBy, setDoneBy] = useState('')
  const [panel, setPanel] = useState(null) // { visit, dayLabel }

  const has = (text, q) => text.toLowerCase().includes(q.trim().toLowerCase())
  const matches = (i) =>
    (eventType === 'all' || i.type === eventType) &&
    (!eventName.trim() || has(i.title, eventName)) &&
    (!doneBy.trim() || has(i.by || '', doneBy))
  const applyFilters = (visits) => visits
    .filter(v => matches(v) || v.tasks.some(matches))
    .sort((a, b) => timeToMinutes(b.time) - timeToMinutes(a.time))

  const goToNow = () => {
    if (!latestDayRef.current) return
    const css = (name, fallback) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name) || fallback)
    const offset = 44 + css('--ctx-bar-height', 156) + css('--dev-toolbar-height', 0) + css('--tlh-height', 144) + 48
    const top = latestDayRef.current.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }

  const renderDay = (heading, visits, ref) => {
    const shown = applyFilters(visits)
    return (
      <div className="tl-day-group" ref={ref} key={heading}>
        <div className="tl-day-header">{heading}</div>
        <div className="tl-list">
          {shown.length === 0 && <div className="tl2-empty">No timeline events match these filters.</div>}
          {shown.map(visit => {
            const open = () => setPanel({ visit, dayLabel: heading })
            // "View tasks" button hidden for now (pass onViewTasks={open} to bring it back);
            // clicking the row still opens the panel.
            return <TimelineItem key={visit.id} item={visit} isOpen={false} onToggle={open} />
          })}
        </div>
      </div>
    )
  }

  const panelProps = panel && buildVisitPanel(panel.visit, panel.dayLabel)

  return (
    <>
      <DevToolbar>
        <DevEdit containerRef={pageRef} prototypeId={window.location.pathname} />
        <DevMode containerRef={pageRef} />
        <DevComments containerRef={pageRef} prototypeId={window.location.pathname} />
        <WireframeToggle />
        <AuditCapture containerRef={pageRef} />
      </DevToolbar>
      <div className="page" ref={pageRef}>
      <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>
      <SideNav activeItem="customers" />

      <div className="page-body">
      <TopNav />
      <CustomerProfileNav activeTab="Timeline" />

      <div className="timeline-legacy">
        <TimelineHeader
          tabs={[{ id: 'care-events', label: 'Care events' }, { id: 'journal', label: 'Journal' }]}
          activeTab={tab}
          onTabChange={setTab}
          showFilters={tab === 'care-events'}
          dateLabel="6 July 2026"
          onGoToNow={goToNow}
        >
          <TimelineFilterSelect label="Event type" prefix="Show:" value={eventType} onChange={setEventType} options={EVENT_TYPE_OPTIONS} />
          <TimelineFilterInput label="Event name" value={eventName} onChange={setEventName} />
          <TimelineFilterInput label="Done by" value={doneBy} onChange={setDoneBy} />
        </TimelineHeader>

        <div className="tl2-body">
          {tab === 'care-events' ? (
            <>
              {renderDay('Monday 6 July 2026', TODAY_VISITS, latestDayRef)}
              {renderDay('Sunday 5 July 2026', PAST_VISITS, null)}
            </>
          ) : (
            <div className="tl2-empty">Journal entries will appear here.</div>
          )}
        </div>
      </div>
      </div>
      </div>
      {panelProps && (
        <VisitTasksPanel open onClose={() => setPanel(null)} {...panelProps}>
          {panelProps.cards.length > 0 && <div className="vtp-cards">{panelProps.cards}</div>}
        </VisitTasksPanel>
      )}
    </>
  )
}
