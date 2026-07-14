import { useState, useRef } from 'react'
import FilterDropdown from '../../../Components/FilterDropdown'

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)

const EMPLOYEES = ['Karen Bailey', 'Jenna Killens', 'Tom Harris', 'Adrianna Jackson', 'James Okafor', 'Priya Sharma']

export default function App() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(new Set())
  const btnRef = useRef(null)

  return (
    <div className="demo-page">
      <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>
      <div className="demo-content">
        <h1>Filter Dropdown</h1>
        <p>Portaled multi-select dropdown with search and A–Z sort, positioned against an anchor button. Used for column and above-table filters.</p>
        <button
          ref={btnRef}
          className="round-btn secondary-btn"
          onClick={() => setOpen(o => !o)}
        >
          Filter by employee{selected.size > 0 ? ` (${selected.size})` : ''}
        </button>

        <FilterDropdown
          items={EMPLOYEES}
          selected={selected}
          onApply={(sel) => setSelected(sel)}
          onClear={() => setSelected(new Set())}
          hasNameSort
          isOpen={open}
          onClose={() => setOpen(false)}
          anchorEl={btnRef.current}
        />
      </div>
    </div>
  )
}
