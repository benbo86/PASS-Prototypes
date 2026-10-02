import { useState, useRef, useEffect, useMemo } from 'react'
import frontSvg from '../../../Icons/Bodymap Front.svg?raw'
import backSvg from '../../../Icons/Bodymap Back.svg?raw'
import leftSvg from '../../../Icons/Bodymap Left.svg?raw'
import rightSvg from '../../../Icons/Bodymap Right.svg?raw'

// Body map using the live app's own artwork (Icons/Bodymap *.svg, exported
// from the real page). Each clickable zone is an element with an id like
// `zone-shin-left` inside the SVG's #Zones group; selection is stored per
// view as `${view}:${zoneId}` so identically-named zones on different views
// never collide.
//
// The view selector uses the legacy `eltico` icon font's own bodymap glyphs
// (research/legacy-icons) — each view has an "empty" and a "marked" glyph,
// and a view switches to "marked" once any of its zones is selected.

const DeleteIcon = () => (
  <svg width="24" height="24" viewBox="-4 -3 24 24" fill="currentColor">
    <path d="M3 18C2.45 18 1.97917 17.8042 1.5875 17.4125C1.19583 17.0208 1 16.55 1 16V3H0V1H5V0H11V1H16V3H15V16C15 16.55 14.8042 17.0208 14.4125 17.4125C14.0208 17.8042 13.55 18 13 18H3ZM13 3H3V16H13V3ZM5 14H7V5H5V14ZM9 14H11V5H9V14Z" />
  </svg>
)

// Strip what the raw export carries from the live page's own state/styles:
// its <style> block (global class names — restyled, scoped, in
// care-management.css instead), a couple of zones left in their "selected"
// state with an inline fill at export time, and the fixed width/height (the
// container sizes it).
const clean = (svg) => svg
  .replace(/<style>[\s\S]*?<\/style>/, '')
  .replace(/ selected/g, '')
  .replace(/ fill="#519BE6"/g, '')
  .replace(/(<svg[^>]*?) width="400" height="720"/, '$1')

const VIEWS = [
  { id: 'front', label: 'Front', svg: clean(frontSvg), empty: '', marked: '' },
  { id: 'back', label: 'Back', svg: clean(backSvg), empty: '', marked: '' },
  { id: 'left', label: 'Left side', svg: clean(leftSvg), empty: '', marked: '' },
  { id: 'right', label: 'Right side', svg: clean(rightSvg), empty: '', marked: '' },
]

// `zone-upper_arm-inner-left` → "Upper arm inner left"
export const zoneLabel = (id) => {
  const words = id.replace(/^zone-/, '').replace(/[_-]/g, ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

export default function BodyMap({ zones, onChange, readOnly = false }) {
  const [view, setView] = useState('front')
  const figureRef = useRef(null)
  const current = VIEWS.find(v => v.id === view)

  const selectedInView = useMemo(
    () => new Set(zones.filter(z => z.startsWith(`${view}:`)).map(z => z.slice(view.length + 1))),
    [zones, view],
  )

  // Reflect selection onto the injected SVG's own zone elements, and give
  // each zone a native tooltip naming it (runs after every render — the
  // markup is re-injected whenever the view changes).
  useEffect(() => {
    const root = figureRef.current
    if (!root) return
    root.querySelectorAll('#Zones [id^="zone-"]').forEach(el => {
      el.classList.toggle('selected', selectedInView.has(el.id))
      if (!el.querySelector(':scope > title')) {
        const t = document.createElementNS('http://www.w3.org/2000/svg', 'title')
        t.textContent = zoneLabel(el.id)
        el.prepend(t)
      }
    })
  }, [selectedInView, view])

  const handleClick = (e) => {
    if (readOnly) return
    const zone = e.target.closest?.('#Zones [id^="zone-"]')
    if (!zone) return
    const key = `${view}:${zone.id}`
    onChange(zones.includes(key) ? zones.filter(z => z !== key) : [...zones, key])
  }

  return (
    <div className="cm-box cm-bodymap">
      <div className="cm-bodymap-toolbar">
        <div className="cm-bodymap-views" role="tablist" aria-label="Body map view">
          {VIEWS.map(v => {
            const marked = zones.some(z => z.startsWith(`${v.id}:`))
            return (
              <button
                key={v.id}
                type="button"
                role="tab"
                aria-selected={view === v.id}
                className={`cm-bodymap-view${view === v.id ? ' active' : ''}`}
                onClick={() => setView(v.id)}
                title={v.label}
              >
                <span className="cm-eltico" aria-hidden="true">{marked ? v.marked : v.empty}</span>
                <span className="cm-visually-hidden">{v.label}</span>
              </button>
            )
          })}
        </div>
        <button
          type="button"
          className="cm-bodymap-clear"
          onClick={() => onChange([])}
          disabled={zones.length === 0}
          aria-label="Clear body map"
          title="Clear body map"
        >
          <DeleteIcon />
        </button>
      </div>

      <div
        ref={figureRef}
        className={`cm-bodymap-figure${readOnly ? ' readonly' : ''}`}
        onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: current.svg }}
      />
    </div>
  )
}
