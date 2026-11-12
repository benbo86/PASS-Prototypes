import employeePlaceholder from '../Images/Employee Placeholder.png'
import {
  GeneralListIcon, MedListIcon, NutritionListIcon, HydrationListIcon, VisitListIcon,
  AlertCircleIcon, StatusCheckIcon, StatusBanIcon,
} from './TimelineIcons'

// Refreshed timeline list item (customer + employee timelines). Renders the
// collapsed row; pass the expanded body as children (shown while isOpen).
// Styles: Styles/timeline-item.css.
//
// onViewTasks (optional): shows a "View tasks" button on the row, e.g. for a
// visit whose tasks open in Components/VisitTasksPanel.jsx.
// item: { time, type, title, status, by?, noStatus?, alert?, dueIn? }
//   type   general | observation | medication | visit | nutrition | hydration | outcome
//   status overdue | missed | complete | partial | cancelled | upcoming
//   Overdue shows a red "!" and an empty grey status slot; once there is an
//   outcome the slot fills. Upcoming shows item.dueIn on the right.
//
// observation/outcome have no refreshed design yet and, like cancelled and
// upcoming items, use the neutral grey tone.
export const TIMELINE_TYPE_META = {
  general:     { icon: GeneralListIcon,   tone: 'general' },
  observation: { icon: GeneralListIcon,   tone: 'neutral' },
  medication:  { icon: MedListIcon,       tone: 'medication' },
  visit:       { icon: VisitListIcon,     tone: 'visit' },
  nutrition:   { icon: NutritionListIcon, tone: 'nutrition' },
  hydration:   { icon: HydrationListIcon, tone: 'hydration' },
  outcome:     { icon: GeneralListIcon,   tone: 'neutral' },
}

// The round type icon used in the row, for use elsewhere (e.g. the task
// table in VisitTasksPanel). type: general | observation | medication | ...
export function TimelineTypeIcon({ type }) {
  const meta = TIMELINE_TYPE_META[type] || TIMELINE_TYPE_META.general
  const Icon = meta.icon
  return <span className={`tli-type-icon tli-item--${meta.tone}`}><span className="tli-icon-circle"><Icon /></span></span>
}

function Avatar() {
  return <img className="tli-avatar" src={employeePlaceholder} alt="" />
}

function RowRight({ item, onViewTasks }) {
  if (item.status === 'upcoming') return <span className="tli-due-in">{item.dueIn}</span>
  if (item.noStatus) {
    return item.by ? <span className="tli-by">by <Avatar /> {item.by}</span> : null
  }
  const overdue = item.status === 'overdue' || item.status === 'missed'
  const StatusGlyph = item.status === 'cancelled' ? StatusBanIcon : overdue ? null : StatusCheckIcon
  return (
    <div className="tli-right">
      {onViewTasks && (
        <button className="round-btn tertiary-btn tli-view-tasks" onClick={e => { e.stopPropagation(); onViewTasks() }}>View tasks</button>
      )}
      {item.by && <span className="tli-by">by <Avatar /> {item.by}</span>}
      {overdue && <span className="tli-alert"><AlertCircleIcon /></span>}
      {/* A partial task later resolved by the office gets a green alert. */}
      {item.status === 'partial' && item.alert && <span className="tli-alert tli-alert--resolved"><AlertCircleIcon /></span>}
      {item.status === 'complete'
        // Same glyph as the "Completed" line in the expanded care note
        // (eltico icon-task-status-complete, loaded by Styles/legacy.css).
        ? <span className="tli-status-glyph" aria-hidden="true">{'\uE90B'}</span>
        : <span className={`tli-status${overdue ? '' : ` tli-status--${item.status}`}`}>{StatusGlyph && <StatusGlyph />}</span>}
    </div>
  )
}

export default function TimelineItem({ item, isOpen, onToggle, onViewTasks, children }) {
  const meta = TIMELINE_TYPE_META[item.type]
  const upcoming = item.status === 'upcoming'
  const tone = upcoming || item.status === 'cancelled' ? 'neutral' : meta.tone
  const Icon = meta.icon
  // Care-plan titles are authored in capitals; medication names keep their case.
  const caps = item.type !== 'medication' && !upcoming

  return (
    <div className={`tli-item tli-item--${tone}`}>
      <div className="tli-row" onClick={onToggle} role="button" tabIndex={0}>
        <span className="tli-time">({item.time})</span>
        <span className="tli-title-wrap">
          <span className="tli-icon-circle"><Icon /></span>
          <span className={`tli-title${caps ? ' tli-title--caps' : ''}`}>{item.title}</span>
        </span>
        <RowRight item={item} onViewTasks={onViewTasks} />
      </div>
      {isOpen && children}
    </div>
  )
}
