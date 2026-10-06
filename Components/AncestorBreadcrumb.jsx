import { useState, useEffect } from 'react'
import { elementLabel } from './ancestorTrail'

// "div.table-wrap › table.data-table › tbody › tr › td.td-name" — click any
// item to select that element, hover to preview it. Shared by Dev Edit and
// Dev Mode (styles in Styles/dev-toolbar.css, already loaded everywhere).
//
// trail: outermost → innermost (see ancestorTrail). Long trails collapse to
// the innermost few levels behind a "…" that expands the rest; the window
// always keeps the current element in view.
const VISIBLE = 5

export default function AncestorBreadcrumb({ trail, current, onSelect, onHover }) {
  const [expanded, setExpanded] = useState(false)
  useEffect(() => { setExpanded(false) }, [trail[trail.length - 1]])

  if (trail.length < 2) return null

  const currentIdx = trail.indexOf(current)
  const start = expanded ? 0 : Math.max(0, Math.min(currentIdx, trail.length - VISIBLE))
  const shown = trail.slice(start)

  return (
    <div className="anc-crumbs" onMouseLeave={() => onHover?.(null)}>
      {start > 0 && (
        <>
          <button type="button" className="anc-crumb anc-crumb-more" title="Show all parents" onClick={() => setExpanded(true)}>…</button>
          <span className="anc-crumb-sep">›</span>
        </>
      )}
      {shown.map((el, i) => (
        <span className="anc-crumb-item" key={i}>
          {i > 0 && <span className="anc-crumb-sep">›</span>}
          <button
            type="button"
            className={`anc-crumb${el === current ? ' active' : ''}`}
            onClick={() => onSelect(el)}
            onMouseEnter={() => onHover?.(el)}
          >
            {elementLabel(el)}
          </button>
        </span>
      ))}
    </div>
  )
}
