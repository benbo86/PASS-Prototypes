import { useState } from 'react'

// Search-to-add, pick-many input — type to filter `items`, click a result to
// add it, added items render as removable rows below. Mirrors the
// search-to-add employee UX originally built for roster/communications'
// (then roster/contactable-staff's) own Contactable employees feature —
// since removed from that prototype, but this remains the established
// precedent for "search and add people" (row-based, not react-select's
// chip-multiselect). No equivalent shared component existed before this —
// first consumer: customer-profile/service-agreement/'s "Preferred care
// workers" field. Demoed in component-demos/ui-kit.

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
)

const RemoveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
)

export default function SearchMultiSelect({ items, selected, onChange, placeholder = 'Search...' }) {
  const [search, setSearch] = useState('')

  const selectedItems = items.filter(i => selected.includes(i.id))

  const searchResults = search.length > 0
    ? items.filter(i => !selected.includes(i.id) && i.name.toLowerCase().includes(search.toLowerCase()))
    : []

  const addItem = (id) => {
    onChange([...selected, id])
    setSearch('')
  }

  const removeItem = (id) => onChange(selected.filter(x => x !== id))

  return (
    <div className="sms-wrap">
      <div className="sms-search-bar">
        <SearchIcon />
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {searchResults.length > 0 && (
        <div className="sms-search-results">
          {searchResults.map(i => (
            <div key={i.id} className="sms-search-result" onClick={() => addItem(i.id)}>
              {i.name}
            </div>
          ))}
        </div>
      )}
      {search.length > 0 && searchResults.length === 0 && (
        <div className="sms-no-results">No results found</div>
      )}
      {selectedItems.length > 0 && (
        <div className="sms-selected-list">
          {selectedItems.map(i => (
            <div key={i.id} className="sms-selected-row">
              <span>{i.name}</span>
              <button type="button" className="sms-remove-btn" onClick={() => removeItem(i.id)} aria-label={`Remove ${i.name}`}>
                <RemoveIcon />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
