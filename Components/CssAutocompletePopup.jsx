// Presentational dropdown for Components/cssAutocomplete.js's suggestions,
// used only by Components/DevEdit.jsx's "Edit styles" tab. Rendered as a
// fixed-position element inside Dev Edit's already body-portaled tree (see
// DevEdit.jsx's own `createPortal(..., document.body)`) — plain viewport
// coordinates are all that's needed, no second portal.
export default function CssAutocompletePopup({ options, activeIndex, position, onSelect, onHover }) {
  return (
    <div className="devedit-autocomplete-popup" style={{ top: position.top, left: position.left }} data-devedit-ui="true">
      {options.map((option, i) => (
        <button
          key={option}
          type="button"
          className={`devedit-autocomplete-item${i === activeIndex ? ' active' : ''}`}
          // Prevents the textarea from ever blurring on click, so selecting
          // a suggestion never races against DevEdit's own blur-to-close
          // logic — the click still fires normally right after.
          onMouseDown={(e) => e.preventDefault()}
          onMouseEnter={() => onHover(i)}
          onClick={() => onSelect(option)}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
