import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export default function FilterDropdown({
  items,
  selected,
  onApply,
  onClear,
  hasNameSort,
  hasSort,
  isOpen,
  onClose,
  anchorEl,
}) {
  const [pending,   setPending]   = useState(() => new Set(selected));
  const [sortDir,   setSortDir]   = useState('asc');
  const [nameField, setNameField] = useState('first');
  const [search,    setSearch]    = useState('');
  const [pos,       setPos]       = useState({ top: 0, left: 0 });
  const dropRef  = useRef(null);
  const showSort = hasSort !== false;

  useEffect(() => {
    if (isOpen) {
      setPending(new Set(selected));
      setSearch('');
    }
  }, [isOpen]); // eslint-disable-line

  useEffect(() => {
    if (isOpen && anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, left: rect.left });
    }
  }, [isOpen, anchorEl]);

  const handleOutside = useCallback((e) => {
    if (
      dropRef.current && !dropRef.current.contains(e.target) &&
      anchorEl && !anchorEl.contains(e.target)
    ) {
      onClose();
    }
  }, [anchorEl, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen, handleOutside]);

  if (!isOpen) return null;

  const sortKey = (str) => {
    if (!hasNameSort) return str;
    const parts = str.trim().split(/\s+/);
    return nameField === 'last' ? parts[parts.length - 1] : parts[0];
  };
  const visible = items
    .filter(i => i.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortDir === 'asc'
      ? sortKey(a).localeCompare(sortKey(b))
      : sortKey(b).localeCompare(sortKey(a))
    );

  const toggle = (item) => {
    const next = new Set(pending);
    if (next.has(item)) next.delete(item); else next.add(item);
    setPending(next);
  };

  const handleApply = () => { onApply(pending, sortDir, nameField); onClose(); };
  const handleClear = () => { onClear(); onClose(); };
  const canApply    = pending.size > 0 || selected.size > 0;

  return createPortal(
    <div
      className="fd-wrap"
      ref={dropRef}
      style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}
    >
      {showSort && (
        <>
          <div className="fd-sort-section">
            {/* Sort direction — always shown, stacked left */}
            <div className="fd-sort-col">
              <button
                className={`fd-sort-btn ${sortDir === 'asc'  ? 'selected' : ''}`}
                onClick={() => setSortDir('asc')}
              >
                Sort A → Z
              </button>
              <button
                className={`fd-sort-btn ${sortDir === 'desc' ? 'selected' : ''}`}
                onClick={() => setSortDir('desc')}
              >
                Sort Z → A
              </button>
            </div>
            {/* Name field — only for name-based data */}
            {hasNameSort && (
              <div className="fd-sort-col">
                <button
                  className={`fd-sort-btn ${nameField === 'first' ? 'selected' : ''}`}
                  onClick={() => setNameField('first')}
                >
                  First name
                </button>
                <button
                  className={`fd-sort-btn ${nameField === 'last' ? 'selected' : ''}`}
                  onClick={() => setNameField('last')}
                >
                  Last name
                </button>
              </div>
            )}
          </div>
          <div className="fd-divider" />
        </>
      )}

      <div className="fd-search">
        <SearchIcon />
        <input
          placeholder="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />
      </div>

      <div className="fd-list">
        {visible.map(item => (
          <div
            key={item}
            className="fd-item"
            onClick={() => toggle(item)}
          >
            <span className={`fd-checkbox ${pending.has(item) ? 'checked' : ''}`}>
              {pending.has(item) && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </span>
            <span className="fd-item-label">{item}</span>
          </div>
        ))}
        {visible.length === 0 && <span className="fd-empty">No results</span>}
      </div>

      <div className="fd-footer">
        <button className="fd-apply-btn" onClick={handleApply} disabled={!canApply}>
          Apply
        </button>
        <button className="fd-clear-btn" onClick={handleClear}>
          Clear
        </button>
      </div>
    </div>,
    document.body
  );
}
