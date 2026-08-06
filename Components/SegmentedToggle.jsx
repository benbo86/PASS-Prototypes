// Purely a status/selection DISPLAY — no click handling, no onChange.
// Originally built inline for timesheets/filters' Timesheets/Unpublished
// pill (still decorative there too), promoted to a shared component once
// customer-profile/service-agreement/ needed the identical look for its
// visit Active/Inactive status. If a future consumer needs this to be
// genuinely interactive, add an optional onChange rather than special-casing
// — every current consumer is intentionally display-only.
//
// options: [{ value, label, tone? }] — `tone` (e.g. 'green') only matters
// for whichever option is currently active, recoloring that one pill.
export default function SegmentedToggle({ options, value }) {
  return (
    <div className="seg-toggle">
      {options.map(opt => {
        const isActive = opt.value === value
        return (
          <span
            key={opt.value}
            className={`seg-toggle-item${isActive ? ' active' : ''}${isActive && opt.tone ? ` seg-toggle-item--${opt.tone}` : ''}`}
          >
            {opt.label}
          </span>
        )
      })}
    </div>
  )
}
