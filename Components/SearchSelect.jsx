import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// Pick-one search field: clicking the field opens a dropdown of every item,
// typing filters it, clicking (or Enter on) a result picks it and shows its
// name in the field. The single-select sibling of SearchMultiSelect.jsx,
// sharing its field styling (.sms-search-bar). First built for the bulk
// assign panel in schedule/daily-schedule.
//
// The dropdown is portaled (to document.body by default) and positioned
// from the field's own rect (same approach as FilterDropdown/
// IOSCalendarPopover), so it overlays rather than being clipped by a
// scrolling ancestor such as ModalPanel's body. Pass `portalContainer` (a
// prototype's own pageRef element) to keep it inside the area Dev Mode/
// Dev Edit can inspect — it's position:fixed either way.

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
)

// Icons/Chevron Down.svg — for variant="select".
const ChevronDownIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="16.6 8.6 12 13.2 7.4 8.6 6 10 12 16 18 10" />
  </svg>
)

// items: [{ id, name }]; value: the selected id or null.
// variant: 'search' (search icon on the left, the default) or 'select'
// (looks like a dropdown: chevron on the right, still typeable) — the
// latter matches the schedule's own bulk-actions "Assign visits to" field.
export default function SearchSelect({ items, value, onChange, placeholder = 'Search...', variant = 'search', portalContainer }) {
  const selected = items.find(i => i.id === value) || null
  const [query, setQuery] = useState(selected?.name ?? '')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [rect, setRect] = useState(null)
  const fieldRef = useRef(null)
  const listRef = useRef(null)

  // When the field still shows the picked name, opening it lists everything
  // rather than filtering down to that one name.
  const filterText = selected && query === selected.name ? '' : query.trim().toLowerCase()
  const results = items.filter(i => i.name.toLowerCase().includes(filterText))

  useLayoutEffect(() => {
    if (open && fieldRef.current) setRect(fieldRef.current.getBoundingClientRect())
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleMouseDown(e) {
      if (fieldRef.current?.contains(e.target) || listRef.current?.contains(e.target)) return
      close()
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  })

  // Closing without picking puts the field back to the current pick (or
  // empty), so half-typed text never looks like a selection.
  function close() {
    setOpen(false)
    setQuery(selected?.name ?? '')
  }

  function pick(item) {
    onChange(item.id)
    setQuery(item.name)
    setOpen(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive(a => Math.min(a + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter' && open && results[active]) { e.preventDefault(); pick(results[active]) }
    else if (e.key === 'Escape' && open) { e.stopPropagation(); close() }
  }

  return (
    <>
      <div className={`sms-search-bar ss-field${variant === 'select' ? ' ss-field--select' : ''}`} ref={fieldRef} onClick={() => setOpen(true)}>
        {variant === 'search' && <SearchIcon />}
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          placeholder={placeholder}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={e => {
            setQuery(e.target.value)
            setActive(0)
            setOpen(true)
            if (selected && e.target.value !== selected.name) onChange(null)
          }}
          onKeyDown={handleKeyDown}
        />
        {variant === 'select' && <span className={`ss-chevron${open ? ' open' : ''}`}><ChevronDownIcon /></span>}
      </div>
      {open && rect && createPortal(
        <div
          ref={listRef}
          className="ss-dropdown"
          role="listbox"
          style={{ top: rect.bottom + 4, left: rect.left, width: rect.width }}
        >
          {results.map((item, i) => (
            <div
              key={item.id}
              role="option"
              aria-selected={item.id === value}
              className={`ss-option${i === active ? ' active' : ''}${item.id === value ? ' selected' : ''}`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={e => e.preventDefault()}
              onClick={() => pick(item)}
            >
              {item.name}
            </div>
          ))}
          {results.length === 0 && <div className="ss-empty">No results found</div>}
        </div>,
        portalContainer || document.body
      )}
    </>
  )
}
