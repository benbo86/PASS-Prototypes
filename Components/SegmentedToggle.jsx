// Display-only by default (no `onChange`) — the original behaviour every
// existing consumer (timesheets/filters, customer-profile/service-agreement)
// relies on. Passing `onChange` opts a consumer into a real interactive
// toggle (renders <button>s instead of bare <span>s) — added for
// mobile/holidays' Days-scheme/Hours-scheme demo switch, per this file's
// own prior note that a future interactive need should add `onChange`
// rather than special-casing.
//
// options: [{ value, label, tone? }] — `tone` (e.g. 'green') only matters
// for whichever option is currently active, recoloring that one pill.
export default function SegmentedToggle({ options, value, onChange }) {
  return (
    <div className="seg-toggle">
      {options.map(opt => {
        const isActive = opt.value === value
        const className = `seg-toggle-item${isActive ? ' active' : ''}${isActive && opt.tone ? ` seg-toggle-item--${opt.tone}` : ''}`
        return onChange ? (
          <button key={opt.value} type="button" className={className} onClick={() => onChange(opt.value)}>
            {opt.label}
          </button>
        ) : (
          <span key={opt.value} className={className}>
            {opt.label}
          </span>
        )
      })}
    </div>
  )
}
