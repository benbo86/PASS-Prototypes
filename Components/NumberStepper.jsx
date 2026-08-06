// A number input flanked by minus/plus buttons — no equivalent existed
// anywhere in this repo before this component (confirmed by a repo-wide
// search). First consumer: customer-profile/service-agreement/'s "Care
// workers" field. Demoed in component-demos/ui-kit.

const MinusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

export default function NumberStepper({ value, onChange, min = 1, max }) {
  const decrement = () => onChange(Math.max(min, value - 1))
  const increment = () => onChange(max != null ? Math.min(max, value + 1) : value + 1)

  return (
    <div className="stepper">
      <input
        type="number"
        className="stepper-input"
        value={value}
        min={min}
        max={max}
        onChange={e => {
          const n = Number(e.target.value)
          if (Number.isNaN(n)) return
          const clamped = max != null ? Math.min(max, Math.max(min, n)) : Math.max(min, n)
          onChange(clamped)
        }}
      />
      <button
        type="button"
        className="stepper-btn"
        onClick={decrement}
        disabled={value <= min}
        aria-label="Decrease"
      >
        <MinusIcon />
      </button>
      <button
        type="button"
        className="stepper-btn"
        onClick={increment}
        disabled={max != null && value >= max}
        aria-label="Increase"
      >
        <PlusIcon />
      </button>
    </div>
  )
}
