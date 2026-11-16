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
import SlidePanel from '../../../Components/SlidePanel'
import VisitTasksList, { CancelledVisitDetails } from '../../../Components/VisitTasksList'
import TimelineItem, { TimelineTypeIcon } from '../../../Components/TimelineItem'
import TimelineHeader, { TimelineFilterSelect, TimelineFilterInput, TimelineFilterPill, TimelineFiltersMenu, TimelineFilterDropdown, TimelineViewSettings, TimelineSwitch } from '../../../Components/TimelineHeader'
import { CalendarHeaderIcon } from '../../../Components/TimelineIcons'

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)

// ─── Filters ──────────────────────────────────────────────────
// The timeline lists visits only. A visit matches a filter if it, or any of
// its tasks, does — so "Medication" finds every visit that includes a
// medication task.

// How the timeline filters look:
//   'menu'     one "Filters" pill; its menu lists each filter type, then drills in
//   'pills'    a pill per filter type
//   'original' the first select + text-field filters (state and matching kept below)
//   'live'     the live timeline's filters: Event type picker, then dropdowns that change with it
const FILTER_STYLE = 'live'
const LIVE = FILTER_STYLE === 'live'
// How the "Group tasks by visit" setting is shown: 'switch' (a switch on the bar) or 'button' (a View settings button + popover).
const VIEW_STYLE = 'button'
const GROUP_HINT = 'Show each visit’s tasks inside the visit, instead of as separate items.'
const PILL_FILTERS = FILTER_STYLE !== 'original'

// Live filter options (copied from the live timeline).
const LIVE_EVENT_TYPES = [
  { value: 'all', label: 'All timeline events' },
  { value: 'actions', label: 'Actions' },
  { value: 'alerts', label: 'Alerts' },
  { value: 'updates', label: 'Updates' },
  { value: 'documents', label: 'Documents' },
]
const ACTION_TYPE_ITEMS = ['Medications', 'Hydration', 'Nutrition', 'Observations', 'General', 'Outcome Tracking', 'Visits']
const TYPE_LABEL = { general: 'General', medication: 'Medications', nutrition: 'Nutrition', hydration: 'Hydration', observation: 'Observations' }
const ACTION_STATUS_ITEMS = ['Planned/Due', 'Started', 'Completed', 'Partial', 'Missed']
const ALERT_TYPE_ITEMS = ['Missed', 'Not done', 'Observation alert', 'Hydration alert']
const ALERT_STATUS_ITEMS = ['Unresolved', 'Resolved']
const UPDATE_TYPE_ITEMS = ['Care Package', 'Legal decisions']
const SAVE_TYPE_ITEMS = ['Care Plan created', 'Minor corrections / typos', 'Scheduled review', 'Unscheduled review', 'Automatic update']
const REVIEW_REASON_ITEMS = ["Change in residents needs or circumstances", 'Change in third party circumstances', 'Medical', 'Wishes', 'Other']
// Live's action statuses. A cancelled action has no live status, so a status filter hides it.
const ACTION_STATUS_LABEL = { complete: 'Completed', partial: 'Partial', overdue: 'Missed', missed: 'Missed' }

// Pill dropdown options. Event type matches live (this timeline only holds
// visits, so Alerts/Updates/Documents have nothing to show yet); Task type is
// label -> task type.
// Status filter options: Visit status (the status on the row) and Task status.
const VISIT_STATUS_OPTIONS = ['Completed', 'Missed', 'Cancelled']
const TASK_STATUS_OPTIONS = ['Completed', 'Overdue', 'Partial', 'Cancelled']
const VISIT_STATUS_PILL = { complete: 'Completed', missed: 'Missed', cancelled: 'Cancelled' }
const TASK_STATUS_PILL = { complete: 'Completed', overdue: 'Overdue', partial: 'Partial', cancelled: 'Cancelled' }

const EVENT_TYPE_PILLS = ['Visits', 'Alerts', 'Updates', 'Documents']
const TASK_TYPE_PILL_TYPES = { Tasks: 'general', Medication: 'medication', Nutrition: 'nutrition', Hydration: 'hydration', Observations: 'observation' }

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

// extra (optional): medication details { form, dosage, support } and, for a partial task, the carer's { reason }.
const task = (id, type, title, instructions, status, done, note, doneDate, extra = {}) =>
  ({ id, type, title, instructions, status, done, doneDate, note, ...extra })

const TABLETS = { form: 'Tablet', dosage: '2 tablets', support: 'Prompt' }
const CREAM = { form: 'Cream', dosage: 'Pea-sized amount', support: 'Administer' }

const TODAY_VISITS = [
  { id: 'v1', time: '17:00', type: 'visit', title: 'Evening Visit', careType: 'Personal care', status: 'cancelled',
    due: { due: '17:00', completeBy: '17:30' },
    cancellation: { at: '5 Jul 2026 at 16:20', reason: 'Customer cancelled', note: "Patricia's daughter called the office to say she'll be staying over this evening, so the visit isn't needed." },
    tasks: [
      task(101, 'nutrition', 'EVENING MEAL',
        ['Please prepare my evening meal and serve this to me on a tray whilst I am seated comfortably on my sofa. My daughter usually prepares home-cooked meals for me in advance and leaves these in the fridge for reheating.'],
        'cancelled', null, null),
    ] },
  { id: 'v2', time: '12:30', type: 'visit', title: 'Lunch Visit', careType: 'Personal care', status: 'complete', by: 'Karen Bailey',
    due: { due: '12:30', completeBy: '13:00' }, actual: '12:29 – 12:56',
    tasks: [
      task(201, 'general', 'ENTERING MY PROPERTY', ['Please knock and wait — I may take a moment to get to the door.'], 'complete', '12:31', 'Knocked and waited. Patricia was in her chair and let me in.'),
      task(202, 'general', 'MEET AND GREET', ['Introduce yourself if this is your first visit with me.'], 'complete', '12:32', 'Patricia was in good spirits.'),
      task(203, 'nutrition', 'LUNCH', ['Heat the meal in the fridge until piping hot, let it cool a little, and serve on a tray at the sofa.'], 'complete', '12:44', 'Chicken casserole heated and served. Ate most of it.'),
      task(204, 'hydration', 'OFFER FLUIDS', ['Prefers a glass of squash rather than water — jug is in the fridge door.'], 'complete', '12:48', 'Drank a full glass of squash.'),
      task(205, 'medication', 'Lunchtime medication', ['Prompt Patricia to take her tablets from the dosette box.'], 'complete', '12:50', 'Tablets taken with squash.', undefined, TABLETS),
      task(206, 'general', 'ENSURE KITCHEN TIDY', ['Dishes washed and dried, surfaces wiped.'], 'complete', '12:54', 'Kitchen left tidy.'),
    ] },
  { id: 'v3', time: '09:30', type: 'visit', title: 'Morning Visit', careType: 'Personal care', status: 'complete', by: 'Karen Bailey',
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
      task(314, 'medication', 'Medi Derma cream *As agreed by the Registered Manager**', ['Please administer a small pea sized amount to my bottom after personal care. Do not over apply, this will not help me.'], 'partial', '10:01', 'Patricia declined the cream today and said her skin felt comfortable. Husband informed.', undefined, { ...CREAM, reason: 'Refused' }),
    ] },
  { id: 'v4', time: '08:00', type: 'visit', title: 'Morning Medication Visit', careType: 'Complex care', status: 'missed',
    due: { due: '08:00', completeBy: '08:15' },
    tasks: [
      task(401, 'medication', 'Morning medication', ['Prompt Patricia to take her morning tablets from the dosette box.'], 'overdue', null, null, undefined, TABLETS),
    ] },
]

const PAST_VISITS = [
  { id: 'v5', time: '22:00', type: 'visit', title: 'Night Visit', careType: 'Complex care', status: 'complete', by: 'Karen Bailey',
    due: { due: '22:00', completeBy: '07:00' }, actual: '22:04 – 6 Jul 2026 at 06:58',
    tasks: [
      task(501, 'general', 'SETTLE FOR THE NIGHT', ['Help me into my nightwear and into bed, with the bed rails up.'], 'complete', '22:12', 'Settled in bed with the rails up.'),
      task(502, 'general', 'REPOSITIONING', ['Reposition me every four hours to prevent pressure sores.'], 'complete', '02:30', 'Repositioned onto her left side. Skin intact.', '6 Jul 2026'),
      task(503, 'general', 'CONTINENCE CHECK', ['Check and change my pad if needed.'], 'complete', '03:05', 'Pad checked and changed.', '6 Jul 2026'),
      task(504, 'hydration', 'OFFER FLUIDS', ['A small drink of squash from the bedside cup.'], 'complete', '06:20', 'Took a few sips of squash.', '6 Jul 2026'),
      task(505, 'general', 'MORNING WASH', ['Help me wash and dress ready for the day.'], 'complete', '06:50', 'Washed and dressed. Patricia chose her own clothes.', '6 Jul 2026'),
    ] },
  { id: 'v6', time: '17:30', type: 'visit', title: 'Evening Visit', careType: 'Personal care', status: 'complete', by: 'Karen Bailey',
    due: { due: '17:30', completeBy: '18:00' }, actual: '17:28 – 17:54',
    tasks: [
      task(601, 'general', 'ENTERING MY PROPERTY', ['Please knock and wait — I may take a moment to get to the door.'], 'complete', '17:31', 'Let in by Patricia.'),
      task(602, 'nutrition', 'EVENING MEAL', ['Heat the meal left in the fridge by my daughter and serve on a tray at the sofa.'], 'complete', '17:42', 'Shepherd’s pie reheated and served. Ate about half.'),
      task(603, 'hydration', 'OFFER FLUIDS', ['Prefers a glass of squash rather than water.'], 'complete', '17:48', 'Drank a glass of squash.'),
      task(604, 'general', 'ENSURE KITCHEN TIDY', ['Dishes washed and dried, surfaces wiped.'], 'complete', '17:52', 'Kitchen left tidy.'),
    ] },
  { id: 'v7', time: '09:30', type: 'visit', title: 'Morning Visit', careType: 'Personal care', status: 'complete', by: 'Karen Bailey',
    due: { due: '09:30', completeBy: '10:30' }, actual: '09:31 – 10:08',
    tasks: [
      task(701, 'general', 'MORNING PERSONAL CARE / DRESSING', ['I prefer to choose my own outfit — please lay a couple of options out for me to pick from.'], 'complete', '09:52', 'Assisted with washing and dressing.'),
      task(702, 'hydration', 'OFFER FLUIDS', ['Prefers a glass of squash rather than water — jug is in the fridge door.'], 'complete', '09:55', 'Drank a glass of squash.'),
      task(703, 'general', 'COMPANIONSHIP', ['Please engage with me throughout the visit.'], 'complete', '10:03', 'Chatted about her garden.'),
    ] },
]

// Earlier days (infinite scroll in the live product). Carers: Karen Bailey, Amara Okafor.
const SAT_VISITS = [
  { id: 'v8', time: '22:00', type: 'visit', title: 'Night Visit', careType: 'Complex care', status: 'complete', by: 'Amara Okafor',
    due: { due: '22:00', completeBy: '22:30' }, actual: '22:02 – 22:26',
    tasks: [
      task(801, 'general', 'ENTERING MY PROPERTY', ['Please knock and wait — I may take a moment to get to the door.'], 'complete', '22:03', 'Let in by Patricia.'),
      task(802, 'medication', 'Night-time medication', ['Prompt Patricia to take her tablets from the dosette box.'], 'complete', '22:10', 'Tablets taken with water.', undefined, TABLETS),
      task(803, 'general', 'BED ROUTINE', ['Help me into my nightwear and settle me in bed with the bedside lamp on.'], 'complete', '22:20', 'Settled in bed, lamp left on.'),
    ] },
  { id: 'v9', time: '17:30', type: 'visit', title: 'Evening Visit', careType: 'Personal care', status: 'complete', by: 'Karen Bailey',
    due: { due: '17:30', completeBy: '18:00' }, actual: '17:33 – 17:58',
    tasks: [
      task(901, 'general', 'ENTERING MY PROPERTY', ['Please knock and wait — I may take a moment to get to the door.'], 'complete', '17:34', 'Let in by Patricia.'),
      task(902, 'nutrition', 'EVENING MEAL', ['Heat the meal left in the fridge by my daughter and serve on a tray at the sofa.'], 'complete', '17:44', 'Lasagne reheated and served. Ate most of it.'),
      task(903, 'hydration', 'OFFER FLUIDS', ['Prefers a glass of squash rather than water.'], 'complete', '17:50', 'Drank a glass of squash.'),
    ] },
  { id: 'v10', time: '12:30', type: 'visit', title: 'Lunch Visit', careType: 'Personal care', status: 'complete', by: 'Amara Okafor',
    due: { due: '12:30', completeBy: '13:00' }, actual: '12:31 – 12:58',
    tasks: [
      task(1001, 'nutrition', 'LUNCH', ['Heat the meal in the fridge until piping hot, let it cool a little, and serve on a tray at the sofa.'], 'complete', '12:42', 'Soup and a sandwich served.'),
      task(1002, 'hydration', 'OFFER FLUIDS', ['Prefers a glass of squash rather than water — jug is in the fridge door.'], 'complete', '12:47', 'Drank a full glass.'),
      task(1003, 'medication', 'Lunchtime medication', ['Prompt Patricia to take her tablets from the dosette box.'], 'complete', '12:50', 'Tablets taken.', undefined, TABLETS),
    ] },
  { id: 'v11', time: '09:30', type: 'visit', title: 'Morning Visit', careType: 'Personal care', status: 'complete', by: 'Karen Bailey',
    due: { due: '09:30', completeBy: '10:30' }, actual: '09:30 – 10:15',
    tasks: [
      task(1101, 'general', 'MORNING PERSONAL CARE / DRESSING', ['I prefer to choose my own outfit — please lay a couple of options out for me to pick from.'], 'complete', '09:55', 'Assisted with washing and dressing.'),
      task(1102, 'observation', 'Body Map Observation', ['Record any marks or skin changes on the body map.'], 'complete', '10:00', 'No new marks.'),
      task(1103, 'medication', 'Medi Derma cream *As agreed by the Registered Manager**', ['Please administer a small pea sized amount to my bottom after personal care.'], 'partial', '10:03', 'Patricia declined the cream today. Husband informed.', undefined, { ...CREAM, reason: 'Refused will retry' }),
    ] },
]

const FRI_VISITS = [
  { id: 'v12', time: '17:30', type: 'visit', title: 'Evening Visit', careType: 'Personal care', status: 'cancelled',
    due: { due: '17:30', completeBy: '18:00' },
    cancellation: { at: '1 Jul 2026 at 11:27', reason: 'Customer cancelled', note: 'Patricia was out for dinner with her daughter, so no evening visit was needed.' },
    tasks: [
      task(1201, 'nutrition', 'EVENING MEAL', ['Heat the meal left in the fridge by my daughter and serve on a tray at the sofa.'], 'cancelled', null, null),
    ] },
  { id: 'v13', time: '12:30', type: 'visit', title: 'Lunch Visit', careType: 'Personal care', status: 'complete', by: 'Karen Bailey',
    due: { due: '12:30', completeBy: '13:00' }, actual: '12:28 – 12:55',
    tasks: [
      task(1301, 'general', 'ENTERING MY PROPERTY', ['Please knock and wait — I may take a moment to get to the door.'], 'complete', '12:30', 'Let in by Patricia.'),
      task(1302, 'nutrition', 'LUNCH', ['Heat the meal in the fridge until piping hot, let it cool a little, and serve on a tray at the sofa.'], 'complete', '12:41', 'Fish pie heated and served.'),
      task(1303, 'hydration', 'OFFER FLUIDS', ['Prefers a glass of squash rather than water — jug is in the fridge door.'], 'complete', '12:46', 'Drank a glass of squash.'),
      task(1304, 'general', 'ENSURE KITCHEN TIDY', ['Dishes washed and dried, surfaces wiped.'], 'complete', '12:52', 'Kitchen left tidy.'),
    ] },
  { id: 'v14', time: '09:30', type: 'visit', title: 'Morning Visit', careType: 'Personal care', status: 'complete', by: 'Amara Okafor',
    due: { due: '09:30', completeBy: '10:30' }, actual: '09:32 – 10:20',
    tasks: [
      task(1401, 'general', 'PRESSURE SORES', ['Please be discreet and check my body for pressure sores, if you notice any please inform my husband and document on the body map.'], 'complete', '09:45', 'No pressure marks noted.'),
      task(1402, 'general', 'MORNING PERSONAL CARE / DRESSING', ['I prefer to choose my own outfit — please lay a couple of options out for me to pick from.'], 'complete', '09:58', 'Assisted with washing and dressing.'),
      task(1403, 'observation', 'Body Map Observation', ['Record any marks or skin changes on the body map.'], 'complete', '10:02', 'Dressing on right buttock, scab on left.'),
    ] },
  { id: 'v15', time: '08:00', type: 'visit', title: 'Morning Medication Visit', careType: 'Complex care', status: 'complete', by: 'Karen Bailey',
    due: { due: '08:00', completeBy: '08:15' }, actual: '08:01 – 08:12',
    tasks: [
      task(1501, 'medication', 'Morning medication', ['Prompt Patricia to take her morning tablets from the dosette box.'], 'complete', '08:06', 'Tablets taken with water.', undefined, TABLETS),
    ] },
]

const THU_VISITS = [
  { id: 'v16', time: '22:00', type: 'visit', title: 'Night Visit', careType: 'Complex care', status: 'complete', by: 'Amara Okafor',
    due: { due: '22:00', completeBy: '22:30' }, actual: '22:05 – 22:28',
    tasks: [
      task(1601, 'medication', 'Night-time medication', ['Prompt Patricia to take her tablets from the dosette box.'], 'complete', '22:10', 'Tablets taken with water.', undefined, TABLETS),
      task(1602, 'general', 'BED ROUTINE', ['Help me into my nightwear and settle me in bed with the bedside lamp on.'], 'complete', '22:22', 'Settled in bed.'),
    ] },
  { id: 'v17', time: '17:30', type: 'visit', title: 'Evening Visit', careType: 'Personal care', status: 'complete', by: 'Karen Bailey',
    due: { due: '17:30', completeBy: '18:00' }, actual: '17:29 – 17:55',
    tasks: [
      task(1701, 'nutrition', 'EVENING MEAL', ['Heat the meal left in the fridge by my daughter and serve on a tray at the sofa.'], 'complete', '17:40', 'Chicken curry reheated and served.'),
      task(1702, 'hydration', 'OFFER FLUIDS', ['Prefers a glass of squash rather than water.'], 'complete', '17:47', 'Drank a glass of squash.'),
      task(1703, 'general', 'ENSURE KITCHEN TIDY', ['Dishes washed and dried, surfaces wiped.'], 'complete', '17:52', 'Kitchen left tidy.'),
    ] },
  { id: 'v18', time: '09:30', type: 'visit', title: 'Morning Visit', careType: 'Personal care', status: 'missed',
    due: { due: '09:30', completeBy: '10:30' },
    tasks: [
      task(1801, 'general', 'MORNING PERSONAL CARE / DRESSING', ['I prefer to choose my own outfit — please lay a couple of options out for me to pick from.'], 'overdue', null, null),
      task(1802, 'medication', 'Morning medication', ['Prompt Patricia to take her morning tablets from the dosette box.'], 'overdue', null, null, undefined, TABLETS),
    ] },
]

// Updates and documents that sit in the timeline between visits (examples copied from live).
const EVENTS = {
  'Monday 6 July 2026': [
    { id: 'e1', kind: 'update', time: '17:03', title: 'Care plan updated', by: 'Karin Venter', at: '6 Jul 2026 at 17:03',
      updateType: 'Care Package', saveType: 'Minor corrections / typos', nextReview: 'Thu, 12/11/2026' },
    { id: 'e2', kind: 'document', time: '16:33', title: 'Document updated - SD05(1) Generic Support Plan', by: 'Kelly Hockett', at: '6 Jul 2026 at 16:33' },
  ],
  'Sunday 5 July 2026': [
    { id: 'e3', kind: 'update', time: '14:20', title: 'Care plan updated', by: 'Louise Carter', at: '5 Jul 2026 at 14:20',
      updateType: 'Care Package', saveType: 'Scheduled review', reason: 'Medical', nextReview: 'Mon, 05/10/2026' },
  ],
  'Saturday 4 July 2026': [
    // Title and details of this Legal decisions example are made up.
    { id: 'e4', kind: 'update', time: '11:15', title: 'Legal decisions updated', by: 'Karin Venter', at: '4 Jul 2026 at 11:15',
      updateType: 'Legal decisions', saveType: 'Unscheduled review', reason: 'Wishes', nextReview: 'Fri, 04/12/2026' },
  ],
  'Friday 3 July 2026': [
    { id: 'e5', kind: 'document', time: '15:42', title: 'Document updated - Moving and Handling Assessment', by: 'Kelly Hockett', at: '3 Jul 2026 at 15:42' },
  ],
}
const ALL_EVENTS = Object.values(EVENTS).flat()

const ALL_VISITS = [...TODAY_VISITS, ...PAST_VISITS, ...SAT_VISITS, ...FRI_VISITS, ...THU_VISITS]

// ─── Visit panel content ──────────────────────────────────────

const VISIT_STATUS_LABELS = { complete: 'Complete', missed: 'Missed', cancelled: 'Cancelled' }
const TASK_TYPE_LABELS = { general: 'Tasks', observation: 'Observations', medication: 'Medication', nutrition: 'Nutrition', hydration: 'Hydration' }
const TASK_STATUS_LABELS = { complete: 'Completed', partial: 'Partial', overdue: 'Overdue', cancelled: 'Cancelled' }

function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

// Alerts: a partial task raises one (Resolved once the office has added a review note),
// an overdue task raises a Missed alert.
function alertType(t) {
  if (t.status === 'overdue') return 'Missed'
  if (t.type === 'observation') return 'Observation alert'
  if (t.type === 'hydration') return 'Hydration alert'
  return 'Not done'
}
function alertsOf(visits) {
  return visits.flatMap(v => v.tasks.filter(t => t.status === 'partial' || t.status === 'overdue').map(t => ({
    id: t.id, time: t.done || v.time, type: t.type, title: t.title, by: t.done ? (t.by || v.by) : null,
    status: t.status, alertType: alertType(t),
    resolved: t.status === 'partial' && !!v.reviewNote,
  })))
}

function buildVisitPanel(visit, dayLabel, reviewNotes = {}) {
  const done = visit.tasks.filter(t => t.status === 'complete').length
  const details = [
    { label: 'Date', value: dayLabel },
    { label: 'Planned time', value: `${visit.due.due} – ${visit.due.completeBy}` },
    visit.actual && { label: 'Actual time', value: visit.actual },
    visit.by && { label: 'Employee', value: visit.by },
    visit.careType && { label: 'Care type', value: visit.careType },
  ].filter(Boolean)
  const cards = []
  if (visit.careNote) cards.push(
    <div className="vtp-card" key="care"><h3>Care note</h3>{visit.careNote.map((l, i) => <p key={i}>{l}</p>)}</div>)
  if (visit.reviewNote) cards.push(
    <div className="vtp-card" key="review"><h3>Review note</h3><p>{visit.reviewNote.text}</p>
      <p className="vtp-card-meta">{visit.reviewNote.by} · {visit.reviewNote.date}</p></div>)
  return {
    title: visit.title,
    status: visit.status,
    statusLabel: VISIT_STATUS_LABELS[visit.status],
    details: visit.cancellation ? [] : details,
    // A cancelled visit shows Care plan (due times) and Cancelled (when, why, note) columns, as on live.
    cancelled: visit.cancellation && {
      plan: `Due at ${visit.due.due} | Complete by ${visit.due.completeBy}`,
      ...visit.cancellation,
    },
    taskSummary: visit.cancellation ? null : `${done} of ${visit.tasks.length} completed`,
    tasks: visit.tasks.map(t => ({
      id: t.id,
      title: t.title,
      instructions: t.instructions,
      completed: t.done && (t.doneDate ? `${t.doneDate} at ${t.done}` : t.done),
      // Minutes from midnight of the visit's start day, for sorting the Completed column.
      completedSort: t.done ? timeToMinutes(t.done) + (t.doneDate ? 1440 : 0) : null,
      icon: <TimelineTypeIcon type={t.type} neutral={!!visit.cancellation} />,
      typeLabel: TASK_TYPE_LABELS[t.type],
      status: t.status,
      statusLabel: TASK_STATUS_LABELS[t.status],
      note: t.note,
      cancelledAt: t.cancelledAt, form: t.form, dosage: t.dosage, support: t.support, reason: t.reason,
      completedBy: t.done ? (t.by || visit.by) : null,
      // A partial task raises an alert; it turns green once the office has added a review note.
      reviewNote: reviewNotes[t.id] || (t.status === 'partial' ? visit.reviewNote : undefined),
      alert: t.status === 'partial' ? ((reviewNotes[t.id] || visit.reviewNote) ? 'resolved' : 'open') : undefined,
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
  // Pill filters (multi-select).
  const [typePills, setTypePills] = useState(() => new Set())
  const [taskTypePills, setTaskTypePills] = useState(() => new Set())
  const [visitStatusPills, setVisitStatusPills] = useState(() => new Set())
  const [taskStatusPills, setTaskStatusPills] = useState(() => new Set())
  const [namePills, setNamePills] = useState(() => new Set())
  const [byPills, setByPills] = useState(() => new Set())
  const [visitNamePills, setVisitNamePills] = useState(() => new Set())
  const [careTypePills, setCareTypePills] = useState(() => new Set())
  const careTypeItems = [...new Set(ALL_VISITS.map(v => v.careType))].sort((a, b) => a.localeCompare(b))
  const visitNameItems = [...new Set(ALL_VISITS.map(v => v.title))].sort((a, b) => a.localeCompare(b))
  const nameItems = [...new Set(ALL_VISITS.flatMap(v => v.tasks.map(t => t.title)))].sort((a, b) => a.localeCompare(b))
  const byItems = [...new Set(ALL_VISITS.map(v => v.by).filter(Boolean))].sort((a, b) => a.localeCompare(b))
  // Live-style filters (FILTER_STYLE 'live'). Changing the event type clears them.
  const [liveType, setLiveType] = useState('all')
  const [actionTypeSel, setActionTypeSel] = useState(() => new Set())
  const [actionStatusSel, setActionStatusSel] = useState(() => new Set())
  const [groupByVisit, setGroupByVisit] = useState(false) // off by default, as in the ticket
  const [alertTypeSel, setAlertTypeSel] = useState(() => new Set())
  const [alertStatusSel, setAlertStatusSel] = useState(() => new Set())
  const [updateTypeSel, setUpdateTypeSel] = useState(() => new Set())
  const [saveTypeSel, setSaveTypeSel] = useState(() => new Set())
  const [reasonSel, setReasonSel] = useState(() => new Set())
  const changeLiveType = (t) => {
    setLiveType(t)
    ;[setActionTypeSel, setActionStatusSel, setAlertTypeSel, setAlertStatusSel, setUpdateTypeSel, setSaveTypeSel, setReasonSel].forEach(f => f(new Set()))
    setEventName(''); setDoneBy('')
  }
  const showsVisits = !LIVE || liveType === 'all' || liveType === 'actions'
  // "+ Review note": opens the slide-out for one task; submitted notes are kept per task.
  const [reviewTask, setReviewTask] = useState(null) // { id, title }
  const [reviewDraft, setReviewDraft] = useState('')
  const [reviewNotes, setReviewNotes] = useState({})
  const openReviewNote = (t) => { setReviewDraft(''); setReviewTask({ id: t.id, title: t.title }) }
  const closeReviewNote = () => setReviewTask(null)
  const submitReviewNote = () => {
    if (!reviewDraft.trim()) return
    setReviewNotes(prev => ({ ...prev, [reviewTask.id]: { by: 'Adrianna Janowski', date: `6 Jul 2026 at ${new Date().toTimeString().slice(0, 5)}`, text: reviewDraft.trim() } }))
    closeReviewNote()
  }
  const [openIds, setOpenIds] = useState(() => new Set())
  const toggle = (id) => setOpenIds(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })
  // Everything that can open: visits, plus (in the flat view) each task, plus updates/documents.
  const expandableIds = [
    ...ALL_VISITS.map(v => v.id),
    ...(LIVE && !groupByVisit ? ALL_VISITS.flatMap(v => v.tasks.map(t => `t${t.id}`)) : []),
    ...(LIVE && liveType === 'all' ? ALL_EVENTS.map(e => e.id) : []),
  ]
  const expandAll = () => setOpenIds(new Set(expandableIds))
  const collapseAll = () => setOpenIds(new Set())
  const allExpanded = expandableIds.every(id => openIds.has(id))

  const has = (text, q) => text.toLowerCase().includes(q.trim().toLowerCase())
  const matches = (i) =>
    (eventType === 'all' || i.type === eventType) &&
    (!eventName.trim() || has(i.title, eventName)) &&
    (!doneBy.trim() || has(i.by || '', doneBy))
  // Pill filters: a visit shows if its event type, carer and (task type / name)
  // choices all fit. Task type and name must be met by the same task.
  const pillMatches = (v) => {
    if (typePills.size && !typePills.has('Visits')) return false
    if (byPills.size && !byPills.has(v.by || '')) return false
    if (visitNamePills.size && !visitNamePills.has(v.title)) return false
    if (careTypePills.size && !careTypePills.has(v.careType)) return false
    const typeOk = (t) => taskTypePills.size === 0 || [...taskTypePills].some(l => TASK_TYPE_PILL_TYPES[l] === t.type)
    const nameOkT = (t) => namePills.size === 0 || namePills.has(t.title)
    const statusOkT = (t) => taskStatusPills.size === 0 || taskStatusPills.has(TASK_STATUS_PILL[t.status])
    if (visitStatusPills.size && !visitStatusPills.has(VISIT_STATUS_PILL[v.status])) return false
    // Task type, task name and task status have to be met by the same task.
    if (taskTypePills.size + namePills.size + taskStatusPills.size === 0) return true
    return v.tasks.some(t => typeOk(t) && nameOkT(t) && statusOkT(t))
  }
  const anyPillFilter = typePills.size + visitStatusPills.size + visitNamePills.size + careTypePills.size + byPills.size + taskTypePills.size + namePills.size + taskStatusPills.size > 0
  const clearAllPills = () => { setTypePills(new Set()); setVisitNamePills(new Set()); setCareTypePills(new Set()); setTaskTypePills(new Set()); setVisitStatusPills(new Set()); setTaskStatusPills(new Set()); setNamePills(new Set()); setByPills(new Set()) }
  // Live filters work the same in both views. Grouped: a visit shows if it, or any of
  // its tasks, matches (so Action type "Medications" finds every visit with a medication
  // task). Flat: each visit and task is its own item and has to match itself.
  const visitUnit = (v) => ({ kind: 'Visits', status: v.status, name: v.title, by: v.by })
  const taskUnit = (v, t) => ({ kind: TYPE_LABEL[t.type], status: t.status, name: t.title, by: t.done ? (t.by || v.by) : null })
  const liveUnitMatch = (u) =>
    (!actionTypeSel.size || actionTypeSel.has(u.kind)) &&
    (!actionStatusSel.size || actionStatusSel.has(ACTION_STATUS_LABEL[u.status])) &&
    (!eventName.trim() || has(u.name, eventName)) &&
    (!doneBy.trim() || has(u.by || '', doneBy))
  const liveVisitShows = (v) => liveUnitMatch(visitUnit(v)) || v.tasks.some(t => liveUnitMatch(taskUnit(v, t)))
  const liveEventMatch = (e) =>
    (!updateTypeSel.size || updateTypeSel.has(e.updateType)) &&
    (!saveTypeSel.size || saveTypeSel.has(e.saveType)) &&
    (!reasonSel.size || reasonSel.has(e.reason)) &&
    (!eventName.trim() || has(e.title, eventName)) &&
    (!doneBy.trim() || has(e.by || '', doneBy))
  const liveAlerts = (visits) => alertsOf(visits)
    .filter(a =>
      (!alertTypeSel.size || alertTypeSel.has(a.alertType)) &&
      (!alertStatusSel.size || alertStatusSel.has(a.resolved ? 'Resolved' : 'Unresolved')) &&
      (!eventName.trim() || has(a.title, eventName)) &&
      (!doneBy.trim() || has(a.by || '', doneBy)))
    .sort((a, b) => timeToMinutes(b.time) - timeToMinutes(a.time))
  const applyFilters = (visits) => visits
    .filter(v => LIVE ? liveVisitShows(v) : PILL_FILTERS ? pillMatches(v) : (matches(v) || v.tasks.some(t => matches({ ...t, by: t.by || v.by }))))
    .sort((a, b) => timeToMinutes(b.time) - timeToMinutes(a.time))

  const goToNow = () => {
    if (!latestDayRef.current) return
    const css = (name, fallback) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name) || fallback)
    const offset = 44 + css('--ctx-bar-height', 156) + css('--dev-toolbar-height', 0) + css('--tlh-height', 144) + 48
    const top = latestDayRef.current.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }

  // ── Rendering ──────────────────────────────────────────────
  const detailsBlock = (body) => (<>
    {body.cancelled && <CancelledVisitDetails {...body.cancelled} />}
    {body.details.length > 0 && <dl className="vtp-details">
      {body.details.map(d => (
        <div className="vtp-details__item" key={d.label}><dt>{d.label}</dt><dd>{d.value}</dd></div>
      ))}
    </dl>}
  </>)

  // A visit with its tasks inside it (grouped view).
  const groupedVisitNode = (visit, heading) => {
    const isOpen = openIds.has(visit.id)
    const body = isOpen ? buildVisitPanel(visit, heading, reviewNotes) : null
    return (
      <TimelineItem key={visit.id} item={{ ...visit, bell: visit.tasks.some(t => t.status === 'partial') }} isOpen={isOpen} onToggle={() => toggle(visit.id)} expandable>
        {body && (
          <div className="tl-nested">
            {detailsBlock(body)}
            <h2 className="vtp-section-title">Tasks{body.taskSummary && <span className="vtp-section-count"> ({body.taskSummary})</span>}</h2>
            <VisitTasksList tasks={body.tasks} compact={!!body.cancelled} onAddReviewNote={openReviewNote} />
            {body.cards.length > 0 && <div className="vtp-cards">{body.cards}</div>}
          </div>
        )}
      </TimelineItem>
    )
  }

  // A visit on its own, without its tasks (flat view: they are separate items).
  const flatVisitNode = (visit, heading) => {
    const isOpen = openIds.has(visit.id)
    const body = isOpen ? buildVisitPanel(visit, heading, reviewNotes) : null
    return (
      <TimelineItem key={visit.id} item={{ ...visit, tasks: undefined, bell: visit.tasks.some(t => t.status === 'partial') }} isOpen={isOpen} onToggle={() => toggle(visit.id)} expandable>
        {body && (
          <div className="tl-nested">
            {detailsBlock(body)}
            {body.cards.length > 0 && <div className="vtp-cards">{body.cards}</div>}
          </div>
        )}
      </TimelineItem>
    )
  }

  // A task on its own (flat view).
  const flatTaskNode = (visit, t, heading) => {
    const id = `t${t.id}`
    const isOpen = openIds.has(id)
    const pt = isOpen ? buildVisitPanel(visit, heading, reviewNotes).tasks.find(x => x.id === t.id) : null
    return (
      <TimelineItem key={id} isOpen={isOpen} onToggle={() => toggle(id)} expandable
        item={{ time: t.done || visit.time, type: t.type, title: t.title, status: t.status, by: t.done ? (t.by || visit.by) : null,
          alert: t.status === 'partial' ? ((reviewNotes[t.id] || visit.reviewNote) ? 'resolved' : 'open') : undefined }}>
        {pt && <div className="tl-nested"><VisitTasksList tasks={[pt]} compact={!!visit.cancellation} onAddReviewNote={openReviewNote} /></div>}
      </TimelineItem>
    )
  }

  // An update or document.
  const eventNode = (e) => {
    const isOpen = openIds.has(e.id)
    return (
      <TimelineItem key={e.id} isOpen={isOpen} onToggle={() => toggle(e.id)} expandable
        item={{ time: e.time, type: e.kind, title: e.title, noStatus: true, by: e.by }}>
        <div className="tl-nested tl-event-body">
          <span className="tl-event-date"><CalendarHeaderIcon />{e.at}</span>
          {e.saveType && <dl className="tl-event-fields">
            <dt>Save type</dt><dd>{e.saveType}</dd>
            {e.reason && <><dt>Review reason</dt><dd>{e.reason}</dd></>}
            {e.nextReview && <><dt>Next review date</dt><dd>{e.nextReview}</dd></>}
          </dl>}
          <a className="tl-event-link" href="#" onClick={ev => ev.preventDefault()}>Open related page (in new tab)</a>
        </div>
      </TimelineItem>
    )
  }

  // Everything one day shows under the live filters, newest first.
  const liveEntries = (heading, visits) => {
    if (liveType === 'alerts') {
      return liveAlerts(visits).map(a => ({
        key: `a${a.id}`, sort: 0,
        node: <TimelineItem key={`a${a.id}`} isOpen={false} onToggle={() => {}}
          item={{ time: a.time, type: a.type, title: a.title, status: a.status, by: a.by, alert: a.resolved ? 'resolved' : undefined }} />,
      }))
    }
    const events = (EVENTS[heading] || []).filter(e => liveEventMatch(e))
    if (liveType === 'updates' || liveType === 'documents') {
      const kind = liveType === 'updates' ? 'update' : 'document'
      return events.filter(e => e.kind === kind).map(e => ({ key: e.id, sort: timeToMinutes(e.time), node: eventNode(e) }))
    }
    const list = []
    visits.forEach(v => {
      if (groupByVisit) {
        if (liveVisitShows(v)) list.push({ key: v.id, sort: timeToMinutes(v.time), node: groupedVisitNode(v, heading) })
      } else {
        if (liveUnitMatch(visitUnit(v))) list.push({ key: v.id, sort: timeToMinutes(v.time), node: flatVisitNode(v, heading) })
        v.tasks.forEach(t => {
          if (liveUnitMatch(taskUnit(v, t))) list.push({ key: `t${t.id}`, sort: timeToMinutes(t.done || v.time) + (t.doneDate ? 1440 : 0), node: flatTaskNode(v, t, heading) })
        })
      }
    })
    if (liveType === 'all') events.forEach(e => list.push({ key: e.id, sort: timeToMinutes(e.time), node: eventNode(e) }))
    return list.sort((a, b) => b.sort - a.sort)
  }

  const DAYS = [
    ['Monday 6 July 2026', TODAY_VISITS, latestDayRef],
    ['Sunday 5 July 2026', PAST_VISITS, null],
    ['Saturday 4 July 2026', SAT_VISITS, null],
    ['Friday 3 July 2026', FRI_VISITS, null],
    ['Thursday 2 July 2026', THU_VISITS, null],
  ]

  const renderDay = (heading, visits, ref) => {
    const shown = applyFilters(visits)
    return (
      <div className="tl-day-group" ref={ref} key={heading}>
        <div className="tl-day-header">{heading}</div>
        <div className="tl-list">
          {shown.length === 0 && <div className="tl2-empty">No timeline events match these filters.</div>}
          {shown.map(visit => groupedVisitNode(visit, heading))}
        </div>
      </div>
    )
  }

  // Live filters: days with nothing to show are left out, with one message if nothing matches at all.
  const renderLiveDays = () => {
    const days = DAYS.map(([heading, visits, ref]) => ({ heading, ref, entries: liveEntries(heading, visits) })).filter(d => d.entries.length)
    if (!days.length) return <div className="tl2-empty">No timeline events match these filters.</div>
    return days.map(d => (
      <div className="tl-day-group" ref={d.ref} key={d.heading}>
        <div className="tl-day-header">{d.heading}</div>
        <div className="tl-list">{d.entries.map(e => e.node)}</div>
      </div>
    ))
  }

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
          onToggleAll={showsVisits ? (allExpanded ? collapseAll : expandAll) : undefined}
          allExpanded={allExpanded}
          viewSettings={LIVE && showsVisits ? (VIEW_STYLE === 'switch' ? (
            <TimelineSwitch label="Group tasks" hint={GROUP_HINT} checked={groupByVisit} onChange={setGroupByVisit} />
          ) : (
            <TimelineViewSettings options={[{ key: 'group', label: 'Group tasks by visit', checked: groupByVisit, onChange: setGroupByVisit, hint: GROUP_HINT }]} />
          )) : undefined}
        >
          {LIVE ? (
            <>
              <TimelineFilterDropdown single prefix="Show:" label="Event type" items={LIVE_EVENT_TYPES} value={liveType} onChange={changeLiveType} />
              {liveType === 'actions' && <>
                <TimelineFilterDropdown label="Action type" allLabel="All actions" items={ACTION_TYPE_ITEMS} selected={actionTypeSel} onChange={setActionTypeSel} />
                <TimelineFilterDropdown label="Action status" allLabel="All statuses" items={ACTION_STATUS_ITEMS} selected={actionStatusSel} onChange={setActionStatusSel} />
              </>}
              {liveType === 'alerts' && <>
                <TimelineFilterDropdown label="Alert type" allLabel="All alerts" items={ALERT_TYPE_ITEMS} selected={alertTypeSel} onChange={setAlertTypeSel} />
                <TimelineFilterDropdown label="Alert status" allLabel="All statuses" items={ALERT_STATUS_ITEMS} selected={alertStatusSel} onChange={setAlertStatusSel} />
              </>}
              {liveType === 'updates' && <>
                <TimelineFilterDropdown label="Update type" allLabel="All updates" items={UPDATE_TYPE_ITEMS} selected={updateTypeSel} onChange={setUpdateTypeSel} />
                <TimelineFilterDropdown label="Save type" allLabel="All save types" items={SAVE_TYPE_ITEMS} selected={saveTypeSel} onChange={setSaveTypeSel} />
                <TimelineFilterDropdown label="Review reason" allLabel="All review reasons" items={REVIEW_REASON_ITEMS} selected={reasonSel} onChange={setReasonSel} />
              </>}
              {liveType !== 'updates' && <TimelineFilterInput label="Event name" value={eventName} onChange={setEventName} />}
              <TimelineFilterInput label="Done by" value={doneBy} onChange={setDoneBy} />
            </>
          ) : FILTER_STYLE === 'menu' ? (
            <TimelineFiltersMenu onClearAll={clearAllPills} filters={[
              { key: 'type', label: 'Event type', items: EVENT_TYPE_PILLS, selected: typePills, onChange: setTypePills },
              { group: 'Visit', key: 'visitName', label: 'Visit name', items: visitNameItems, selected: visitNamePills, onChange: setVisitNamePills },
              { group: 'Visit', key: 'careType', label: 'Care type', items: careTypeItems, selected: careTypePills, onChange: setCareTypePills },
              { group: 'Visit', key: 'by', label: 'Done by', items: byItems, selected: byPills, onChange: setByPills },
              { group: 'Visit', key: 'visitStatus', label: 'Visit status', items: VISIT_STATUS_OPTIONS, selected: visitStatusPills, onChange: setVisitStatusPills },
              { group: 'Task', key: 'taskType', label: 'Task type', items: Object.keys(TASK_TYPE_PILL_TYPES), selected: taskTypePills, onChange: setTaskTypePills },
              { group: 'Task', key: 'name', label: 'Task name', items: nameItems, selected: namePills, onChange: setNamePills },
              { group: 'Task', key: 'taskStatus', label: 'Task status', items: TASK_STATUS_OPTIONS, selected: taskStatusPills, onChange: setTaskStatusPills },
            ]} />
          ) : FILTER_STYLE === 'pills' ? (
            <>
              <TimelineFilterPill label="Event type" items={EVENT_TYPE_PILLS} selected={typePills} onChange={setTypePills} />
              <TimelineFilterPill label="Visit name" items={visitNameItems} selected={visitNamePills} onChange={setVisitNamePills} />
              <TimelineFilterPill label="Care type" items={careTypeItems} selected={careTypePills} onChange={setCareTypePills} />
              <TimelineFilterPill label="Done by" items={byItems} selected={byPills} onChange={setByPills} />
              <TimelineFilterPill label="Visit status" items={VISIT_STATUS_OPTIONS} selected={visitStatusPills} onChange={setVisitStatusPills} />
              <TimelineFilterPill label="Task type" items={Object.keys(TASK_TYPE_PILL_TYPES)} selected={taskTypePills} onChange={setTaskTypePills} />
              <TimelineFilterPill label="Task name" items={nameItems} selected={namePills} onChange={setNamePills} />
              <TimelineFilterPill label="Task status" items={TASK_STATUS_OPTIONS} selected={taskStatusPills} onChange={setTaskStatusPills} />
              {anyPillFilter && <button type="button" className="tlh-clear-all" onClick={clearAllPills}>Clear all</button>}
            </>
          ) : (
            <>
              <TimelineFilterSelect label="Event type" prefix="Show:" value={eventType} onChange={setEventType} options={EVENT_TYPE_OPTIONS} />
              <TimelineFilterInput label="Event name" value={eventName} onChange={setEventName} />
              <TimelineFilterInput label="Done by" value={doneBy} onChange={setDoneBy} />
            </>
          )}
        </TimelineHeader>

        <div className="tl2-body">
          {tab !== 'care-events' ? (
            <div className="tl2-empty">Journal entries will appear here.</div>
          ) : LIVE ? renderLiveDays() : (
            <>
              {DAYS.map(([heading, visits, ref]) => renderDay(heading, visits, ref))}
            </>
          )}
        </div>
      </div>
      </div>
      </div>
      <SlidePanel
        open={!!reviewTask} onClose={closeReviewNote}
        title={reviewTask && `Review note: ${reviewTask.title.length > 40 ? `${reviewTask.title.slice(0, 40).trimEnd()}…` : reviewTask.title}`}
        footer={<>
          <button className="round-btn tertiary-btn" onClick={closeReviewNote}>Close</button>
          <button className="round-btn primary-btn" disabled={!reviewDraft.trim()} onClick={submitReviewNote}>Submit</button>
        </>}
      >
        <label className="rn-label" htmlFor="review-note-text">Review notes</label>
        <textarea id="review-note-text" className="form-textarea" rows={12} autoFocus value={reviewDraft} onChange={e => setReviewDraft(e.target.value)} />
      </SlidePanel>
    </>
  )
}
