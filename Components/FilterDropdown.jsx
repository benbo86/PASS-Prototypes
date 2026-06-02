import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

const RightArrowIcon = () => (
  <svg width="16" viewBox="0 0 24.05 12.38" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M23.76,5.48,18.41.13a.47.47,0,0,0-.64,0L17,.91a.47.47,0,0,0,0,.64l3.65,3.64H.45A.45.45,0,0,0,0,5.64v1.1a.45.45,0,0,0,.45.45H20.64L17,10.84a.45.45,0,0,0,0,.63l.78.78a.45.45,0,0,0,.64,0L23.76,6.9A1,1,0,0,0,23.76,5.48Z"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M10.8488372,18.6872093 C12.627907,18.0802326 14.2813953,18.0802326 15.6,17.0755814 L19.2209302,20.6965116 C19.4302326,20.905814 19.7023256,21.0104651 19.9534884,21.0104651 C20.2046512,21.0104651 20.4976744,20.905814 20.6860465,20.6965116 C21.1046512,20.277907 21.1046512,19.6290698 20.6860465,19.2104651 L17.0860465,15.5895349 C18.0906977,14.2709302 18.6976744,12.6174419 18.6976744,10.8383721 C18.6976744,6.50581395 15.1813953,2.98953488 10.8488372,2.98953488 C6.51627907,2.98953488 3,6.50581395 3,10.8383721 C3,15.1709302 6.51627907,18.6872093 10.8488372,18.6872093 Z M10.8488372,5.08255814 C14.0093023,5.08255814 16.6046512,7.65697674 16.6046512,10.8383721 C16.6046512,14.0197674 14.0093023,16.594186 10.8488372,16.594186 C7.68837209,16.594186 5.09302326,13.9988372 5.09302326,10.8383721 C5.09302326,7.67790698 7.66744186,5.08255814 10.8488372,5.08255814 Z"
      fill="currentColor" fillRule="nonzero"/>
  </svg>
);

export default function FilterDropdown({
  items,
  selected,
  onApply,
  onClear,
  hasNameSort,
  hasSort,
  searchOnly,
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

  const handleApply = () => { onApply(pending, sortDir, nameField, search); onClose(); };
  const handleClear = () => { onClear(); onClose(); };

  return createPortal(
    <div
      className="fd-wrap"
      ref={dropRef}
      style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}
    >
      {showSort && (
        <>
          <div className="fd-sort-section">
            <div className="fd-sort-col">
              <button
                className={`fd-sort-btn ${sortDir === 'asc'  ? 'selected' : ''}`}
                onClick={() => setSortDir('asc')}
              >
                <span>Sort A</span><RightArrowIcon /><span>Z</span>
              </button>
              <button
                className={`fd-sort-btn ${sortDir === 'desc' ? 'selected' : ''}`}
                onClick={() => setSortDir('desc')}
              >
                <span>Sort Z</span><RightArrowIcon /><span>A</span>
              </button>
            </div>
            {hasNameSort && (
              <div className="fd-sort-col">
                <label className="fd-radio-row">
                  <input
                    type="radio"
                    className="form-radio"
                    name="fd-namefield"
                    checked={nameField === 'first'}
                    onChange={() => setNameField('first')}
                  />
                  <span>First name</span>
                </label>
                <label className="fd-radio-row">
                  <input
                    type="radio"
                    className="form-radio"
                    name="fd-namefield"
                    checked={nameField === 'last'}
                    onChange={() => setNameField('last')}
                  />
                  <span>Last name</span>
                </label>
              </div>
            )}
          </div>
          <div className="fd-divider" />
        </>
      )}

      <div className="search-bar fd-search-bar">
        <SearchIcon />
        <input
          placeholder="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />
      </div>

      {!searchOnly && (
        <>
          <div className="fd-list">
            {visible.map(item => (
              <div key={item} className="fd-item" onClick={() => toggle(item)}>
                <span className={`fd-checkbox ${pending.has(item) ? 'checked' : ''}`}>
                  {pending.has(item) && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
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
            <button className="fd-apply-btn" onClick={handleApply} disabled={pending.size === 0}>
              Apply
            </button>
            <button className="fd-clear-btn" onClick={handleClear} disabled={pending.size === 0 && selected.size === 0}>
              Clear
            </button>
          </div>
        </>
      )}

      {searchOnly && (
        <div className="fd-footer">
          <button className="fd-apply-btn" onClick={handleApply}>Apply</button>
          <button className="fd-clear-btn" onClick={handleClear}>Clear</button>
        </div>
      )}
    </div>,
    document.body
  );
}
