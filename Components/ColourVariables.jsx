import { useMemo, useState, useRef, useEffect } from 'react'
import { getCssVariableNames } from './cssAutocomplete'

// Dev Edit's "Colours" tab: every CSS custom property whose value is a colour,
// as a grid of swatches with its name + value underneath, grouped by the first
// part of its name (brand, ui, greyscale…). Click a swatch to copy var(--name). Names are read live off the loaded stylesheets
// (cssAutocomplete.getCssVariableNames), values from the computed style, so
// it never goes out of date. Styles: Styles/dev-edit.css (.devedit-colorvars*).

const COLOUR_VALUE = /^(#[0-9a-f]{3,8}|rgba?\(|hsla?\()/i

function readColourVariables() {
  const cs = getComputedStyle(document.documentElement)
  return getCssVariableNames()
    .map(name => ({ name, value: cs.getPropertyValue(name).trim() }))
    .filter(v => COLOUR_VALUE.test(v.value))
}

const groupLabel = (name) => {
  const first = name.replace(/^--/, '').split('-')[0]
  return first.charAt(0).toUpperCase() + first.slice(1)
}

export default function ColourVariables() {
  // Re-read whenever a stylesheet changes (Vite hot-swaps <style> tags when
  // colors.css is edited), so a newly added variable shows up straight away.
  const [version, setVersion] = useState(0)
  useEffect(() => {
    let t
    const observer = new MutationObserver(() => { clearTimeout(t); t = setTimeout(() => setVersion(v => v + 1), 150) })
    observer.observe(document.head, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['href'] })
    return () => { clearTimeout(t); observer.disconnect() }
  }, [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const all = useMemo(readColourVariables, [version])
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState(null)
  const timer = useRef(null)

  const q = query.trim().toLowerCase()
  const shown = q ? all.filter(v => v.name.toLowerCase().includes(q) || v.value.toLowerCase().includes(q)) : all
  const groups = []
  for (const v of shown) {
    const label = groupLabel(v.name)
    let g = groups.find(x => x.label === label)
    if (!g) { g = { label, items: [] }; groups.push(g) }
    g.items.push(v)
  }

  const copy = async (name) => {
    const text = `var(${name})`
    try { await navigator.clipboard.writeText(text) } catch {
      // Fallback for contexts without the async clipboard API.
      const ta = document.createElement('textarea')
      ta.value = text; document.body.appendChild(ta); ta.select()
      try { document.execCommand('copy') } catch { /* nothing more to try */ }
      ta.remove()
    }
    setCopied(name)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="devedit-colorvars">
      <input
        className="devedit-colorvars-search" placeholder={`Search ${all.length} colour variables`}
        value={query} onChange={e => setQuery(e.target.value)}
      />
      <div className="devedit-colorvars-list">
        {groups.map(g => (
          <div key={g.label}>
            <div className="devedit-colorvars-group">{g.label}</div>
            <div className="devedit-colorvars-grid">
              {g.items.map(v => (
                <button key={v.name} type="button" className="devedit-colorvars-tile" onClick={() => copy(v.name)} title={`Copy var(${v.name})`}>
                  <span className="devedit-colorvars-swatch" style={{ background: v.value }}>
                    {copied === v.name && <span className="devedit-colorvars-copied">Copied</span>}
                  </span>
                  <span className="devedit-colorvars-name">{v.name.replace(/^--/, '')}</span>
                  <span className="devedit-colorvars-value">{v.value}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
        {groups.length === 0 && <div className="devedit-colorvars-empty">No colour variables match.</div>}
      </div>
    </div>
  )
}
