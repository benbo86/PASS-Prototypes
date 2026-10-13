import { HandoverIcon } from './icons'

// Shown on the next carer's Visit screen, between the customer card and the
// task list, for the whole visit.
export default function HandoverCard({ handover }) {
  return (
    <div className="ho-card">
      <div className="ho-card-header">
        <span className="ho-card-title"><HandoverIcon /> Handover note</span>
      </div>
      <p className="ho-card-text">{handover.text}</p>
      <span className="ho-card-meta">From {handover.author} · {handover.when}</span>
    </div>
  )
}
