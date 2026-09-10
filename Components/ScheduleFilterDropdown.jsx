import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

// A simpler sibling of Components/FilterDropdown.jsx for the Daily
// Schedule toolbar's own filters — that component's sort section and
// Apply/Clear footer don't apply here: schedule filters are just a search
// box over a checkbox list, and a selection takes effect immediately
// (calls `onChange` on every toggle) rather than waiting for an explicit
// Apply click. Clearing is a single page-level "Clear" button next to the
// filter row (see DailySchedule.jsx), not a per-dropdown Clear button.
// Reuses FilterDropdown's own `fd-*` CSS classes verbatim (search bar,
// item list, checkbox) — Styles/filter-dropdown.css already covers all of
// this, so nothing new was needed there.

const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M10.8488372,18.6872093 C12.627907,18.0802326 14.2813953,18.0802326 15.6,17.0755814 L19.2209302,20.6965116 C19.4302326,20.905814 19.7023256,21.0104651 19.9534884,21.0104651 C20.2046512,21.0104651 20.4976744,20.905814 20.6860465,20.6965116 C21.1046512,20.277907 21.1046512,19.6290698 20.6860465,19.2104651 L17.0860465,15.5895349 C18.0906977,14.2709302 18.6976744,12.6174419 18.6976744,10.8383721 C18.6976744,6.50581395 15.1813953,2.98953488 10.8488372,2.98953488 C6.51627907,2.98953488 3,6.50581395 3,10.8383721 C3,15.1709302 6.51627907,18.6872093 10.8488372,18.6872093 Z M10.8488372,5.08255814 C14.0093023,5.08255814 16.6046512,7.65697674 16.6046512,10.8383721 C16.6046512,14.0197674 14.0093023,16.594186 10.8488372,16.594186 C7.68837209,16.594186 5.09302326,13.9988372 5.09302326,10.8383721 C5.09302326,7.67790698 7.66744186,5.08255814 10.8488372,5.08255814 Z"
      fill="currentColor" fillRule="nonzero"/>
  </svg>
)

export default function ScheduleFilterDropdown({ items, selected, onChange, isOpen, onClose, anchorEl }) {
  const [search, setSearch] = useState('')
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const dropRef = useRef(null)

  useEffect(() => { if (isOpen) setSearch('') }, [isOpen])

  useEffect(() => {
    if (isOpen && anchorEl) {
      const rect = anchorEl.getBoundingClientRect()
      setPos({ top: rect.bottom + 6, left: rect.left })
    }
  }, [isOpen, anchorEl])

  const handleOutside = useCallback((e) => {
    if (
      dropRef.current && !dropRef.current.contains(e.target) &&
      anchorEl && !anchorEl.contains(e.target)
    ) {
      onClose()
    }
  }, [anchorEl, onClose])

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [isOpen, handleOutside])

  if (!isOpen) return null

  const visible = items.filter(i => i.toLowerCase().includes(search.toLowerCase()))

  const toggle = (item) => {
    const next = new Set(selected)
    if (next.has(item)) next.delete(item); else next.add(item)
    onChange(next)
  }

  return createPortal(
    <div className="fd-wrap" ref={dropRef} style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}>
      <div className="search-bar fd-search-bar">
        <SearchIcon />
        <input placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} autoFocus />
      </div>
      <div className="fd-list">
        {visible.map(item => (
          <div key={item} className="fd-item" onClick={() => toggle(item)}>
            <span className={`fd-checkbox ${selected.has(item) ? 'checked' : ''}`}>
              {selected.has(item) && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span className="fd-item-label">{item}</span>
          </div>
        ))}
        {visible.length === 0 && <span className="fd-empty">No results</span>}
      </div>
    </div>,
    document.body
  )
}
