import { useEffect, useMemo, useRef, useState } from 'react'
import { canonicalizeIcon, previewMarkupFor } from './iconSwap'
import { loadMobileIconLibrary, loadPassIconLibrary, searchIconify, fetchIconifyIcons } from './iconLibrary'

// Tab body shown on Components/DevEdit.jsx's EditPanel when the current
// selection resolves to exactly one <svg> that also passes isLikelyIcon
// (square/small/monochrome) — DevEdit.jsx gates that before this ever
// mounts. Goes straight to the icon library (Ben: swapping is the whole
// point of this tab, so there's no reason to land on an intermediate
// screen first) — there used to be a read-only source+copy view here, but
// that was dropped as low-value (anyone wanting raw markup can already get
// it from DevTools or the generated PASS/Mobile Icons specimen pages), so
// this is genuinely a single screen now, not two. Presentational — all
// durable state (the session's icon edits) lives in DevEdit.jsx; this
// component only manages its own transient UI (search text, which
// candidate is currently selected in the grid, scope choice).
export default function IconSwapPanel({ svgEl, iconSwapKey, containerRef, hasSwap, onPreview, onClearPreview, onApply, onReset }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null) // { svg, source, name } | null
  const [mobileIcons, setMobileIcons] = useState([])
  const [passIcons, setPassIcons] = useState([])
  const [iconifyResults, setIconifyResults] = useState([])
  const [iconifyLoading, setIconifyLoading] = useState(false)
  const [iconifyError, setIconifyError] = useState(null)
  // 'all' (every matching instance on the page) | 'instance' (just this
  // one) — defaults to 'all' every time a genuinely different icon gets
  // selected (reset below), so switching between icons never carries a
  // stale scope choice forward; the user re-decides fresh each time.
  const [scope, setScope] = useState('all')
  const abortRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    loadMobileIconLibrary().then(setMobileIcons)
    loadPassIconLibrary().then(setPassIcons)
  }, [])

  useEffect(() => { setScope('all') }, [svgEl])

  // Real bug, caught by testing (not reasoned through in advance): counting
  // "how many instances share this icon's shape" by re-canonicalizing the
  // LIVE svgEl/page on every render broke the moment scope: 'all' started
  // previewing on every matching instance (this file's own previous
  // behaviour, before that fix, only ever mutated the one selected
  // element) — once every matching instance is previewing the candidate's
  // shape, literally none of them still match the TRUE original hash
  // anymore, so a live recount reads 0 and the scope toggle vanishes out
  // from under the user mid-preview. Memoized on [svgEl, iconSwapKey,
  // containerRef] instead — svgEl's own identity (unlike its content)
  // never changes just because applySwap replaces its children, so this
  // only ever recomputes once per genuinely new selection, capturing the
  // count before this session's own preview mutations can ever affect it.
  const occurrences = useMemo(() => {
    if (!svgEl || !containerRef.current) return 1
    let hash, len
    if (iconSwapKey) {
      const [h, l] = iconSwapKey.split(':')
      hash = h
      len = Number(l)
    } else {
      ({ hash, len } = canonicalizeIcon(svgEl))
    }
    return Array.from(containerRef.current.querySelectorAll('svg')).filter((el) => {
      const c = canonicalizeIcon(el)
      return c.hash === hash && c.len === len
    }).length
  }, [svgEl, iconSwapKey, containerRef])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (abortRef.current) abortRef.current.abort()
    if (!search.trim()) { setIconifyResults([]); setIconifyError(null); return }
    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController()
      abortRef.current = controller
      setIconifyLoading(true)
      setIconifyError(null)
      try {
        const names = await searchIconify(search, { signal: controller.signal })
        const icons = await fetchIconifyIcons(names.slice(0, 60), { signal: controller.signal })
        setIconifyResults(icons)
      } catch (err) {
        if (err.name !== 'AbortError') setIconifyError('Iconify unavailable — repo icons still work')
      } finally {
        setIconifyLoading(false)
      }
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search])

  if (!svgEl) return null

  // The colour any currentColor-based candidate will actually resolve to
  // once applied to the real target — read once per render, applied to
  // every swatch below (see previewMarkupFor's own comment in iconSwap.js).
  const targetColor = getComputedStyle(svgEl).color

  const pickCandidate = (candidate) => {
    if (selected && selected.svg === candidate.svg) {
      setSelected(null)
      onClearPreview()
      return
    }
    setSelected(candidate)
    onPreview(candidate.svg, scope)
  }

  // Re-preview with the new scope if a candidate is already selected —
  // otherwise switching from "just this one" to "all N instances" (or
  // back) after already picking something wouldn't show its real effect
  // until Apply, defeating the point of previewing at all.
  const handleScopeChange = (nextScope) => {
    setScope(nextScope)
    if (selected) {
      onClearPreview()
      onPreview(selected.svg, nextScope)
    }
  }

  const filterByName = (list) => {
    if (!search.trim()) return list
    const q = search.trim().toLowerCase()
    return list.filter((c) => (c.name || '').toLowerCase().includes(q))
  }

  const handleApply = () => {
    if (!selected) return
    // Baked mobile/PASS icons carry a `sources` array (a shape can come
    // from more than one place in the repo), not a singular `source` —
    // only Iconify results have `source` directly. Normalize here so the
    // saved swap's own source metadata is populated either way.
    const source = selected.source || (selected.sources && selected.sources[0])
    // scope is only ever meaningful when there's more than one instance to
    // choose between — with exactly one on the page, 'all' and 'instance'
    // are equivalent, so there's no toggle shown and this always stays
    // 'all' (the reset default) in that case.
    onApply(selected.svg, source, scope)
    setSelected(null)
  }

  const handleReset = () => {
    onReset()
    setSelected(null)
  }

  return (
    <div className="devedit-svg-tab">
      {occurrences > 1 && (
        <div className="devedit-svg-occurrences">This icon appears {occurrences} times on this page</div>
      )}
      {hasSwap && (
        <div className="devedit-icon-status-row">
          <div className="devedit-banner-success">Icon applied</div>
          <button className="devedit-btn-secondary" onClick={handleReset}>Reset</button>
        </div>
      )}
      <input
        type="text"
        className="devedit-iconlib-search"
        placeholder="Search Iconify"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoFocus
      />
      <div className="devedit-iconlib-grid-scroll">
        <IconGroup title="PASS Icons" icons={filterByName(passIcons)} selected={selected} onPick={pickCandidate} targetColor={targetColor} targetEl={svgEl} />
        <IconGroup title="Mobile Icons" icons={filterByName(mobileIcons)} selected={selected} onPick={pickCandidate} targetColor={targetColor} targetEl={svgEl} />
        {search.trim() && (
          <div className="devedit-iconlib-group">
            <div className="devedit-iconlib-group-label">Iconify</div>
            {iconifyLoading && <div className="devedit-iconlib-status">Searching…</div>}
            {iconifyError && <div className="devedit-iconlib-status">{iconifyError}</div>}
            {!iconifyLoading && !iconifyError && iconifyResults.length === 0 && (
              <div className="devedit-iconlib-status">No results</div>
            )}
            {!iconifyLoading && iconifyResults.length > 0 && (
              <IconSwatchGrid icons={iconifyResults} selected={selected} onPick={pickCandidate} targetColor={targetColor} targetEl={svgEl} />
            )}
          </div>
        )}
      </div>
      {occurrences > 1 && (
        <div className="devedit-iconlib-scope" role="radiogroup" aria-label="Apply to">
          <button
            type="button"
            className={`devedit-iconlib-scope-btn${scope === 'all' ? ' active' : ''}`}
            onClick={() => handleScopeChange('all')}
          >
            All {occurrences} instances
          </button>
          <button
            type="button"
            className={`devedit-iconlib-scope-btn${scope === 'instance' ? ' active' : ''}`}
            onClick={() => handleScopeChange('instance')}
          >
            Just this one
          </button>
        </div>
      )}
      <div className="devedit-rule-actions">
        <button className="devedit-btn-primary" onClick={handleApply} disabled={!selected}>Apply</button>
      </div>
    </div>
  )
}

function IconGroup({ title, icons, selected, onPick, targetColor, targetEl }) {
  if (icons.length === 0) return null
  return (
    <div className="devedit-iconlib-group">
      <div className="devedit-iconlib-group-label">{title}</div>
      <IconSwatchGrid icons={icons} selected={selected} onPick={onPick} targetColor={targetColor} targetEl={targetEl} />
    </div>
  )
}

function IconSwatchGrid({ icons, selected, onPick, targetColor, targetEl }) {
  return (
    <div className="devedit-iconlib-grid">
      {icons.map((c, i) => (
        <button
          key={`${c.source?.ref || c.name}-${i}`}
          className={`devedit-iconlib-swatch${selected && selected.svg === c.svg ? ' active' : ''}`}
          title={c.name}
          onClick={() => onPick(c)}
          // color, not just innerHTML: any currentColor in the preview
          // must resolve to the same colour it'll actually take once
          // applied to the real target (see previewMarkupFor's comment in
          // iconSwap.js) — without this the swatch always previews in
          // devedit-panel's own near-white text colour instead.
          style={{ color: targetColor }}
          // previewMarkupFor strips <script>/<foreignObject> (same as the
          // old sanitizeSvgMarkup did) AND reproduces applySwap's own
          // literal-to-currentColor recolor when the target uses it, so
          // this can never drift from the real apply-time outcome.
          dangerouslySetInnerHTML={{ __html: previewMarkupFor(c.svg, targetEl) }}
        />
      ))}
    </div>
  )
}
