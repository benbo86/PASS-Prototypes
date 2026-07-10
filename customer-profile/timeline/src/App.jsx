import { useState } from 'react'
import WebNav from '../../../Components/WebNav'
import CustomerProfileNav from '../../../Components/CustomerProfileNav'
import employeePlaceholder from '../../../Images/Employee Placeholder.png'

// ─── Icons ────────────────────────────────────────────────────
// Placeholders — see the note in timeline-legacy.css. Swap for the
// real icon set once supplied.

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)

// Header type icons + status icons — confirmed 2026-07-10 directly
// against the live app's own CSS and the real font files (fa-solid-900
// / fa-regular-400 from pen.passgenius.com, and eltico.woff — see
// Styles/legacy.css for how they're loaded, and the "PASS legacy icon
// fonts" specimen artifact for the full glyph list). Not guessed.
const FaIcon = ({ code, weight = 'solid' }) => (
  <span className={`tl-fa-icon tl-fa-icon-${weight}`}>{code}</span>
)
const EltIcon = ({ code, color }) => (
  <span className="tl-eltico-icon" style={color ? { color } : undefined}>{code}</span>
)

const GeneralIcon = () => <FaIcon code={''} weight="solid" /> // fa-check
const MedicationIcon = () => <FaIcon code={''} weight="regular" /> // fa-plus
const NutritionIcon = () => <FaIcon code={''} weight="solid" /> // fa-utensils
const HydrationIcon = () => <FaIcon code={''} weight="solid" /> // fa-mug-saucer
const ObservationIcon = () => <FaIcon code={''} weight="regular" /> // fa-eye
const VisitIcon = () => <FaIcon code={''} weight="regular" /> // fa-hand-pointer
const OutcomeIcon = () => <FaIcon code={''} weight="regular" /> // fa-star, "Care plan updated"

// Status icons — eltico glyphs (icon-task-status-*, icon-alert-rag-GREEN).
// icon-alert-rag-GREEN also backs the default/no-alert state in the
// export's own CSS, so there's no separate grey "none" glyph.
const OverdueIcon = () => <EltIcon code={''} color="var(--legacy-status-overdue)" />
const CompleteIcon = () => <EltIcon code={''} color="var(--legacy-status-complete)" />
const PartialIcon = () => <EltIcon code={''} color="var(--legacy-status-partial)" />
const AlertGreenIcon = () => <EltIcon code={''} color="var(--legacy-success)" />

// Body icons — Calendar/Info/Cream form/Dosage/Support required/Bodymap/
// Carer (id-card)/Review note (file) confirmed 2026-07-10 (see header
// comment above); the rest below are still hand-drawn placeholders.
const CalendarSmallIcon = () => <FaIcon code={''} weight="regular" /> // fa-calendar-alt
const InfoCircleFilledIcon = () => <FaIcon code={''} weight="solid" /> // fa-info-circle
const ExternalLinkIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 3v2h3.59L9 13.59 10.41 15 19 6.41V10h2V3h-7zM19 19H5V5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7z"/></svg>
)
const IdCardIcon = () => <FaIcon code={''} weight="regular" /> // fa-id-card
const ReviewNoteIcon = () => <FaIcon code={''} weight="regular" /> // fa-file (regular only — no solid version in the confirmed set)
const CheckIcon = () => <FaIcon code={''} weight="solid" /> // fa-check
const PencilSmallIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
)
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
)
const CreamFormIcon = () => <EltIcon code={'🗭'} /> // icon-form
const DosageIcon = () => <EltIcon code={''} /> // icon-dosage
const SupportRequiredIcon = () => <FaIcon code={''} weight="regular" /> // fa-user
const BodymapIcon = () => <FaIcon code={''} weight="solid" /> // fa-male

// ─── Type styling ───────────────────────────────────────────────
// Colors confirmed against the legacy export's own CSS and Ben's
// reference screenshots (2026-07-09), stored as shared tokens in
// Styles/legacy.css since other legacy recreations may need them.

const TYPE_META = {
  general:     { icon: GeneralIcon,     bg: 'var(--legacy-panel-task-bg)',             text: 'var(--legacy-panel-task-text)' },
  observation: { icon: ObservationIcon, bg: 'var(--legacy-panel-observation-bg)',      text: 'var(--legacy-panel-observation-text)' },
  medication:  { icon: MedicationIcon,  bg: 'var(--legacy-panel-medication-bg)',       text: 'var(--legacy-panel-medication-text)' },
  visit:       { icon: VisitIcon,       bg: 'var(--legacy-panel-visit-bg)',            text: 'var(--legacy-panel-visit-text)', dark: true },
  nutrition:   { icon: NutritionIcon,   bg: 'var(--legacy-panel-nutrition-bg)',        text: 'var(--legacy-panel-nutrition-text)' },
  hydration:   { icon: HydrationIcon,   bg: 'var(--legacy-panel-hydration-bg)',        text: 'var(--legacy-panel-hydration-text)' },
  outcome:     { icon: OutcomeIcon,     bg: 'var(--legacy-panel-outcome-tracking-bg)', text: 'var(--legacy-panel-outcome-tracking-text)' },
}

const FUTURE_META = { bg: 'var(--legacy-panel-future-bg)', text: 'var(--legacy-panel-future-text)' }

const STATUS_ICON = { overdue: OverdueIcon, complete: CompleteIcon, partial: PartialIcon }

// ─── Data ─────────────────────────────────────────────────────
// Titles/types/notes are pulled from the exported page + Ben's
// reference screenshots (Patricia Allin, visit of 6 Jul 2026, plus
// examples from a second export dated 1 Jul 2026). Some notes are
// plausible fills where the source didn't cover a given field.

const TODAY_ITEMS = [
  { id: 1, time: '09:30', type: 'general', title: 'ENTERING MY PROPERTY', bodyType: 'generic', status: 'complete', by: 'Karen Bailey', at: '30 Apr 2026 at 09:31',
    due: { due: '09:30', completeBy: '10:30' }, notes: ['Please knock and wait — I may take a moment to get to the door.'],
    completionNote: 'Knocked and waited before entering. Patricia let me in without difficulty.' },
  { id: 2, time: '09:31', type: 'general', title: 'MEET AND GREET', bodyType: 'generic', status: 'complete', by: 'Karen Bailey', at: '30 Apr 2026 at 09:32',
    due: { due: '09:30', completeBy: '10:30' }, notes: ['Introduce yourself if this is your first visit with me.'],
    completionNote: 'Introduced myself on arrival. Patricia was alert and in good spirits.' },
  { id: 3, time: '09:32', type: 'general', title: 'CONSENT TO CARE', bodyType: 'generic', status: 'complete', by: 'Karen Bailey', at: '30 Apr 2026 at 09:33',
    due: { due: '09:30', completeBy: '10:30' }, notes: ['Always ask before starting any personal care task.'],
    completionNote: 'Explained today\'s care tasks and gained verbal consent before starting.' },
  { id: 4, time: '09:57', type: 'visit', title: 'Personal care', bodyType: 'visit', status: 'partial', by: 'Jenna Killens', at: '30 Apr 2026 at 09:57',
    due: { due: '09:30', completeBy: '10:30' },
    careNote: { statusLabel: 'Partial', name: 'Jenna Killens', date: '30 Apr 2026 at 09:57',
      lines: ['David answered the door on arrival.', 'pat was in bed, David got her up and assisted to commode. pc carriedout, bowels opened. supported dressing, tidied areas and disposed of rubbish.', 'dressing on right buttock, scab on left. David aware.', 'leaving her well sat in her chair. noting else required.'] },
    alert: { resolvedAt: '30 Apr 2026 at 09:57', resolvedBy: 'Louise Carter', resolutionNote: 'Resolution note: husband confirmed all outstanding care tasks were completed.' },
    reviewNote: { by: 'Louise Carter', date: '30 Apr 2026 at 12:04', text: 'all tasks completed husband assisted with transfers' } },
  { id: 5, time: '09:35', type: 'general', title: 'MORNING PERSONAL CARE / DRESSING', bodyType: 'generic', status: 'complete', by: 'Karen Bailey', at: '30 Apr 2026 at 09:52', expanded: true,
    due: { due: '09:30', completeBy: '10:30' }, notes: ['I prefer to choose my own outfit — please lay a couple of options out for me to pick from.'],
    completionNote: 'Assisted with washing and dressing. Patricia chose her own outfit from the options offered.' },
  { id: 6, time: '09:40', type: 'general', title: 'PRESSURE SORES', bodyType: 'generic', status: 'complete', by: 'Karen Bailey', at: '30 Apr 2026 at 09:44', expanded: true,
    due: { due: '09:30', completeBy: '10:30' }, notes: ['Please be discreet and check my body for pressure sores, if you notice any please inform my husband and document on the body map.'],
    completionNote: 'Checked skin discreetly during personal care — no new pressure marks noted.' },
  { id: 7, time: '09:54', type: 'observation', title: 'Body Map Observation', bodyType: 'observation', status: 'complete', by: 'Jenna Killens', at: '30 Apr 2026 at 09:54',
    due: { due: '09:30', completeBy: '10:30' },
    observationNote: 'Please document any bruising, marks or pressure sores I may have, please document in your notes and inform the office.',
    historyLinkText: 'View observation history',
    careNote: { name: 'Jenna Killens', date: '30 Apr 2026 at 09:54', buttonText: 'Observation details' } },
  { id: 8, time: '09:50', type: 'general', title: 'ORAL CARE', bodyType: 'generic', status: 'complete', by: 'Karen Bailey', at: '30 Apr 2026 at 09:53',
    due: { due: '09:30', completeBy: '10:30' }, notes: ['Uses own electric toothbrush, kept in the bathroom cabinet.'],
    completionNote: 'Supported with brushing teeth using her own electric toothbrush.' },
  { id: 9, time: '09:53', type: 'hydration', title: 'OFFER FLUIDS', bodyType: 'generic', status: 'complete', by: 'Karen Bailey', at: '30 Apr 2026 at 09:55',
    due: { due: '09:30', completeBy: '10:30' }, notes: ['Prefers a glass of squash rather than water — jug is in the fridge door.'],
    completionNote: 'Offered a glass of squash from the fridge, which Patricia drank most of.' },
  { id: 10, time: '09:55', type: 'general', title: 'ASSIST WITH MOBILITY & SAFE TRANSFER SUPPORT', bodyType: 'generic', status: 'complete', by: 'Karen Bailey', at: '30 Apr 2026 at 09:59',
    due: { due: '09:30', completeBy: '10:30' }, notes: ['Use the walking frame for all transfers — do not support under the arms.'],
    completionNote: 'Supported transfer using the walking frame, no signs of discomfort.' },
  { id: 11, time: '10:00', type: 'general', title: 'BRUSH MY HAIR WITH CONSENT', bodyType: 'generic', status: 'complete', by: 'Karen Bailey', at: '30 Apr 2026 at 10:02',
    due: { due: '09:30', completeBy: '10:30' }, notes: ['Ask first — some days this isn’t wanted.'],
    completionNote: 'Asked first — Patricia was happy for her hair to be brushed today.' },
  { id: 12, time: '09:30', type: 'medication', title: 'Medi Derma cream *As agreed by the Registered Manager**', bodyType: 'medication', status: 'overdue',
    due: { due: '09:30', completeBy: '10:30' },
    medication: { form: 'Cream', formType: 'Topical', dosage: '1 x pea sized amount', instruction: 'Administer', bodymapButton: true },
    notes: [
      'Please administer a small pea sized amount to my bottom after personal care. Do not over apply, this will not help me.',
      'The District Nurse has agreed and recommended this cream to be used as an antiseptic barrier cream.  You must wear clean PPE to apply gently, and wash your hands before and after use.  If I experience side affects, the most common to look out for would be a rash, hives, swollen or blistered skin, wheezing or tightness of chest. Please discuss with me if you feel I am experiencing any of these and contact your office team who will ensure that we seek the most appropriate advice.',
    ] },
  { id: 13, time: '10:08', type: 'general', title: 'INCONTINENCE PAD', bodyType: 'generic', status: 'complete', by: 'Karen Bailey', at: '30 Apr 2026 at 10:10',
    due: { due: '09:30', completeBy: '10:30' }, notes: ['Dispose of used pads in the bathroom bin, not the kitchen.'],
    completionNote: 'Changed pad and disposed of it in the bathroom bin as instructed.' },
  { id: 14, time: '09:30', type: 'general', title: 'COMPANIONSHIP', bodyType: 'generic', status: 'overdue',
    due: { due: '09:30', completeBy: '10:30' }, notes: ["Please engage with me throughout the visit, I have Parkinson's with Lewy bodies and I am not always fully able to communicate with full sentences but can acknowledge and say some words in response but you may have to prompt."] },
  { id: 15, time: '10:14', type: 'general', title: 'ENSURE BATHROOM & TOILET CLEANED AFTER USE', bodyType: 'generic', status: 'complete', by: 'Karen Bailey', at: '30 Apr 2026 at 10:15',
    due: { due: '09:30', completeBy: '10:30' }, notes: ['Cleaning products are under the sink.'],
    completionNote: 'Cleaned the bathroom and toilet after use with the products under the sink.' },
  { id: 16, time: '15:37', type: 'outcome', title: 'Care plan updated', bodyType: 'outcome', by: 'pass roster', noStatus: true,
    date: '30 Jun 2026 at 15:37', linkText: 'Open related page (in new tab)' },
  { id: 17, time: '17:00', type: 'visit', title: 'Evening Visit', bodyType: 'generic', status: 'overdue',
    due: { due: '17:00', completeBy: '17:30' }, notes: ['Scheduled evening visit — please check in with Patricia before starting any tasks.'] },
  { id: 18, time: '17:00', type: 'nutrition', title: 'EVENING MEAL', bodyType: 'generic', status: 'overdue',
    due: { due: '17:00', completeBy: '17:30' }, notes: [
      'Please prepare my evening meal and serve this to me on a tray whilst I am seated comfortably on my sofa. My daughter usually prepares home-cooked meals for me in advance and leaves these in the fridge for reheating.',
      'Please ensure meals are heated thoroughly and served at a safe temperature. Offer me choice where appropriate and present my meal in a way that is appetising and easy for me to manage.',
      'Remain observant for any signs of reduced appetite, difficulty eating, nausea, oral discomfort, or decline in nutritional intake, and escalate concerns appropriately.',
    ] },
]

const FUTURE_ITEMS = [
  { id: 21, time: '09:30', type: 'general', title: 'INFECTION CONTROL', bodyType: 'generic', status: null, dueInDays: 20,
    due: { due: '09:30', completeBy: '10:30' }, notes: [
      'I would like Care Experts to wear appropriate PPE and change it regularly in line with infection control guidance. Please encourage and support me to wash my hands to maintain good hygiene.',
      'After use, please dispose of PPE in a disposable hygiene/waste bag along with my incontinence pad, ensuring it is securely sealed and placed in the outside wheelie bin.',
    ] },
  { id: 22, time: '09:35', type: 'general', title: 'MORNING PERSONAL CARE / DRESSING', bodyType: 'generic', status: null, dueInDays: 21,
    due: { due: '09:30', completeBy: '10:30' }, notes: ['I prefer to choose my own outfit — please lay a couple of options out for me to pick from.'] },
  { id: 23, time: '09:54', type: 'observation', title: 'Body Map Observation', bodyType: 'generic', status: null, dueInDays: 21,
    due: { due: '09:30', completeBy: '10:30' }, notes: ['Please document any bruising, marks or pressure sores I may have.'] },
]

function Avatar({ name }) {
  return (
    <span className="tl-avatar-wrap">
      <img className="tl-avatar" src={employeePlaceholder} alt="" />
    </span>
  )
}

function HeadingRight({ item }) {
  if (item.noStatus) {
    return item.by ? (
      <span className="tl-heading-by">
        by <Avatar /> {item.by}
      </span>
    ) : null
  }

  if (!item.status) {
    return <span className="tl-item-status">Due in {item.dueInDays} days</span>
  }

  const StatusIcon = STATUS_ICON[item.status]
  // The green "resolved" bell only ever applies to a task that was partially
  // done but has since been resolved by the office (item.alert) — never for
  // complete/overdue tasks.
  const showResolvedAlert = item.status === 'partial' && item.alert
  return (
    <div className="tl-heading-right">
      {item.by && (
        <span className="tl-heading-by">
          by <Avatar /> {item.by}
        </span>
      )}
      <span className="tl-status-icon"><StatusIcon /></span>
      {showResolvedAlert && (
        <span className="tl-status-icon"><AlertGreenIcon /></span>
      )}
    </div>
  )
}

function DueRow({ due }) {
  if (!due) return null
  return (
    <div className="tl-body-row">
      <CalendarSmallIcon />
      <span>Due at {due.due} | Complete by {due.completeBy}</span>
    </div>
  )
}

function NotesBlock({ notes }) {
  if (!notes?.length) return null
  return (
    <div className="tl-body-notes">
      <InfoCircleFilledIcon />
      <div className="tl-body-notes-text">
        {notes.map((n, i) => <p key={i}>{n}</p>)}
      </div>
    </div>
  )
}

// Shows the resolved-alert block (item.alert) followed by the review note
// (item.reviewNote), in that order, in a single column — the review note
// always sits under the alert when both are present.
function AlertReviewCol({ item }) {
  if (!item.alert && !item.reviewNote) return null
  return (
    <div className="tl-body-col">
      {item.alert && (
        <>
          <h4 className="tl-body-heading">Alert</h4>
          <div className="tl-body-row"><AlertGreenIcon /> <span>Not done (resolved)</span></div>
          <div className="tl-body-row"><CalendarSmallIcon /> <span>{item.alert.resolvedAt}</span></div>
          <div className="tl-body-row"><IdCardIcon /> <span>{item.alert.resolvedBy}</span></div>
          <div className="tl-body-row"><CheckIcon /> <span>{item.alert.resolutionNote}</span></div>
        </>
      )}
      {item.reviewNote && (
        <>
          <h4 className={`tl-body-heading${item.alert ? ' tl-body-heading-divided' : ''}`}>Review Note <PencilSmallIcon /></h4>
          <div className="tl-body-row"><IdCardIcon /> <span>{item.reviewNote.by}</span></div>
          <div className="tl-body-row"><CalendarSmallIcon /> <span>{item.reviewNote.date}</span></div>
          <div className="tl-body-row"><ReviewNoteIcon /> <span>{item.reviewNote.text}</span></div>
        </>
      )}
    </div>
  )
}

function GenericBody({ item }) {
  const showCareNote = item.status === 'complete' && item.completionNote
  return (
    <div className={showCareNote ? 'tl-body-columns tl-body-columns-2' : 'tl-body-generic'}>
      <div className={showCareNote ? 'tl-body-col' : undefined}>
        <h4 className="tl-body-heading">Care Plan</h4>
        <DueRow due={item.due} />
        <NotesBlock notes={item.notes} />
        {!item.reviewNote && (
          <a className="tl-add-review" href="#" onClick={e => e.preventDefault()}><PlusIcon /> Add review note</a>
        )}
      </div>
      {showCareNote && (
        <div className="tl-body-col">
          <h4 className="tl-body-heading">Care Note</h4>
          <div className="tl-body-row tl-body-row-status-complete"><CompleteIcon /> <span>Completed</span></div>
          <div className="tl-body-row"><IdCardIcon /> <span>{item.by}</span></div>
          <div className="tl-body-row"><CalendarSmallIcon /> <span>{item.at}</span></div>
          <div className="tl-body-notes">
            <InfoCircleFilledIcon />
            <div className="tl-body-notes-text"><p>{item.completionNote}</p></div>
          </div>
        </div>
      )}
    </div>
  )
}

function ObservationBody({ item }) {
  return (
    <div className="tl-body-columns tl-body-columns-2">
      <div className="tl-body-col">
        <h4 className="tl-body-heading">Care Plan</h4>
        <DueRow due={item.due} />
        {item.observationNote && (
          <div className="tl-body-notes">
            <InfoCircleFilledIcon />
            <div className="tl-body-notes-text"><p>{item.observationNote}</p></div>
          </div>
        )}
        {item.historyLinkText && (
          <a className="tl-body-link" href="#" onClick={e => e.preventDefault()}>{item.historyLinkText} <ExternalLinkIcon /></a>
        )}
      </div>
      <div className="tl-body-col">
        <h4 className="tl-body-heading">Care Note</h4>
        <div className="tl-body-row tl-body-row-status-complete"><CompleteIcon /> <span>Completed</span></div>
        <div className="tl-body-row"><IdCardIcon /> <span>{item.careNote.name}</span></div>
        <div className="tl-body-row"><CalendarSmallIcon /> <span>{item.careNote.date}</span></div>
        <button className="tl-legacy-btn-blue">{item.careNote.buttonText}</button>
      </div>
    </div>
  )
}

function VisitBody({ item }) {
  const hasThirdCol = item.alert || item.reviewNote
  return (
    <div className={`tl-body-columns ${hasThirdCol ? 'tl-body-columns-3' : 'tl-body-columns-2'}`}>
      <div className="tl-body-col">
        <h4 className="tl-body-heading">Care Plan</h4>
        <DueRow due={item.due} />
      </div>
      <div className="tl-body-col">
        <h4 className="tl-body-heading">Care Note</h4>
        <div className="tl-body-row tl-body-row-status-partial"><PartialIcon /> <span>{item.careNote.statusLabel}</span></div>
        <div className="tl-body-row"><IdCardIcon /> <span>{item.careNote.name}</span></div>
        <div className="tl-body-row"><CalendarSmallIcon /> <span>{item.careNote.date}</span></div>
        <div className="tl-body-notes">
          <InfoCircleFilledIcon />
          <div className="tl-body-notes-text">
            {item.careNote.lines.map((l, i) => <p key={i}>{l}</p>)}
          </div>
        </div>
      </div>
      <AlertReviewCol item={item} />
    </div>
  )
}

function MedicationBody({ item }) {
  return (
    <div className="tl-body-columns tl-body-columns-2">
      <div className="tl-body-col">
        <h4 className="tl-body-heading">Care Plan</h4>
        <div className="tl-body-row"><CreamFormIcon /> <span>{item.medication.form}<br /><span className="tl-body-row-sub">{item.medication.formType}</span></span></div>
        <div className="tl-body-row"><DosageIcon /> <span>{item.medication.dosage}</span></div>
        <div className="tl-body-row"><SupportRequiredIcon /> <span>{item.medication.instruction}</span></div>
      </div>
      <div className="tl-body-col">
        <DueRow due={item.due} />
        <NotesBlock notes={item.notes} />
        {item.medication.bodymapButton && (
          <div className="tl-body-row"><BodymapIcon /> <button className="tl-legacy-btn-blue">Bodymap</button></div>
        )}
        {!item.reviewNote && (
          <a className="tl-add-review" href="#" onClick={e => e.preventDefault()}><PlusIcon /> Add review note</a>
        )}
      </div>
    </div>
  )
}

function OutcomeBody({ item }) {
  return (
    <div className="tl-body-generic">
      <div className="tl-body-row"><CalendarSmallIcon /> <span>{item.date}</span></div>
      <a className="tl-body-link" href="#" onClick={e => e.preventDefault()}>{item.linkText}</a>
    </div>
  )
}

const BODY_COMPONENTS = {
  generic: GenericBody,
  observation: ObservationBody,
  visit: VisitBody,
  medication: MedicationBody,
  outcome: OutcomeBody,
}

function TimelineItem({ item, isFuture, isOpen, onToggle }) {
  const meta = isFuture ? FUTURE_META : TYPE_META[item.type]
  const Icon = TYPE_META[item.type].icon
  const BodyComponent = BODY_COMPONENTS[item.bodyType]

  return (
    <div className="tl-item">
      <div
        className={`tl-item-heading${TYPE_META[item.type].dark && !isFuture ? ' tl-item-heading-dark' : ''}`}
        style={{ background: meta.bg, color: meta.text }}
        onClick={onToggle}
        role="button"
        tabIndex={0}
      >
        <div className="tl-item-heading-left">
          <span className="tl-item-time">({item.time})</span>
          <span className="tl-item-icon"><Icon /></span>
          <span className="tl-item-title">{item.title}</span>
        </div>
        <HeadingRight item={{ ...item, status: isFuture ? null : item.status, dueInDays: item.dueInDays }} />
      </div>

      {isOpen && (
        <div className="tl-item-body">
          <BodyComponent item={item} />
        </div>
      )}
    </div>
  )
}

export default function App() {
  const initialOpen = new Set(TODAY_ITEMS.filter(i => i.expanded).map(i => i.id))
  const [openIds, setOpenIds] = useState(initialOpen)

  const allIds = [...TODAY_ITEMS, ...FUTURE_ITEMS].map(i => i.id)

  const toggle = (id) => {
    setOpenIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const expandAll = () => setOpenIds(new Set(allIds))
  const collapseAll = () => setOpenIds(new Set())

  return (
    <div>
      <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>
      <WebNav activePage="customers" />
      <CustomerProfileNav activeTab="Timeline" />

      <div className="timeline-legacy">

        <div className="tl-action-bar">
          <button className="tl-btn tl-btn-success">Go to now</button>
          <button className="tl-btn tl-btn-primary" onClick={expandAll}>Expand all</button>
          <button className="tl-btn tl-btn-primary" onClick={collapseAll}>Collapse all</button>
        </div>

        <div className="tl-day-group">
          <div className="tl-day-header">Monday 6 July 2026</div>
          <div className="tl-list">
            {TODAY_ITEMS.map(item => (
              <TimelineItem
                key={item.id}
                item={item}
                isFuture={false}
                isOpen={openIds.has(item.id)}
                onToggle={() => toggle(item.id)}
              />
            ))}
          </div>
        </div>

        <div className="tl-now-separator"><span>NOW</span></div>

        <div className="tl-day-group">
          <div className="tl-day-header">Tuesday 7 July 2026</div>
          <div className="tl-list">
            {FUTURE_ITEMS.map(item => (
              <TimelineItem
                key={item.id}
                item={item}
                isFuture={true}
                isOpen={openIds.has(item.id)}
                onToggle={() => toggle(item.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
