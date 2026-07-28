import { useEffect, useRef, useState } from 'react'
import { FILL_SWATCH_GROUPS, NONE_SWATCH } from './colorTokens'
import { hsvToHex, hexToHsv } from './colorMath'

// Shared Picker/Swatches popup body — extracted from Toolbar.jsx so both
// Colour Fill and Border Fill (which work identically, just writing to a
// different element field) use exactly one implementation rather than two
// copies that could drift apart. Fully self-contained: owns its own tab,
// hex-draft, and wheel/brightness hsv state, seeded fresh from `value`
// every time a *different* popup instance mounts (Fill and Border are
// mutually exclusive via the parent's single `openPopup` state, so only
// one of these is ever mounted at a time).
//
// `onChange(hex)` fires on every continuous drag tick (wheel/brightness) —
// never closes the popup, same reasoning as the original Colour Fill: the
// wheel is a plain React-rendered div, not an OS-native control living
// outside the page, so closing mid-drag would unmount it under the
// cursor. `onApply(hex)` fires only for a discrete, single-action commit
// (a swatch row, the None square, a confirmed hex entry) — the caller
// decides what "apply" means (write the value AND close the popup).
export default function ColorPickerPopup({ value, onChange, onApply }) {
  const [tab, setTab] = useState('picker') // 'picker' | 'swatches'
  const [hexDraft, setHexDraft] = useState(value || '')
  const [hsv, setHsv] = useState(() => hexToHsv(value))
  const draggingRef = useRef(false)
  const wheelRef = useRef(null)
  const brightnessRef = useRef(null)

  useEffect(() => {
    setHexDraft(value || '')
  }, [value])

  useEffect(() => {
    if (draggingRef.current) return
    if (!value) return
    setHsv(hexToHsv(value))
  }, [value])

  const commitHex = () => {
    const raw = hexDraft.trim().replace(/^#/, '')
    const isValid = /^[0-9a-f]{3}$/i.test(raw) || /^[0-9a-f]{6}$/i.test(raw)
    if (!isValid) {
      setHexDraft(value || '')
      return
    }
    const expanded = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
    onApply(`#${expanded.toLowerCase()}`)
  }

  const updateFromWheelPoint = (clientX, clientY, v) => {
    const rect = wheelRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = clientX - cx
    const dy = clientY - cy
    const radius = rect.width / 2
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), radius)
    let h = (Math.atan2(dy, dx) * 180) / Math.PI
    if (h < 0) h += 360
    const s = radius === 0 ? 0 : dist / radius
    const next = { h, s, v }
    setHsv(next)
    onChange(hsvToHex(next.h, next.s, next.v))
  }

  const handleWheelMouseDown = (e) => {
    e.preventDefault()
    draggingRef.current = true
    const v = hsv.v
    updateFromWheelPoint(e.clientX, e.clientY, v)
    const handleMove = (ev) => updateFromWheelPoint(ev.clientX, ev.clientY, v)
    const handleUp = () => {
      draggingRef.current = false
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
    }
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
  }

  const updateFromBrightnessPoint = (clientX) => {
    const rect = brightnessRef.current.getBoundingClientRect()
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width)
    const v = rect.width === 0 ? 0 : x / rect.width
    const next = { h: hsv.h, s: hsv.s, v }
    setHsv(next)
    onChange(hsvToHex(next.h, next.s, next.v))
  }

  const handleBrightnessMouseDown = (e) => {
    e.preventDefault()
    draggingRef.current = true
    updateFromBrightnessPoint(e.clientX)
    const handleMove = (ev) => updateFromBrightnessPoint(ev.clientX)
    const handleUp = () => {
      draggingRef.current = false
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
    }
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
  }

  const wheelRadius = 68 // half of the 136px wheel
  const thumbAngleRad = (hsv.h * Math.PI) / 180
  const thumbR = hsv.s * wheelRadius
  const thumbX = wheelRadius + thumbR * Math.cos(thumbAngleRad)
  const thumbY = wheelRadius + thumbR * Math.sin(thumbAngleRad)

  return (
    <>
      <div className="wf-popup-tabs">
        <button className={`wf-popup-tab${tab === 'picker' ? ' active' : ''}`} onClick={() => setTab('picker')}>Picker</button>
        <button className={`wf-popup-tab${tab === 'swatches' ? ' active' : ''}`} onClick={() => setTab('swatches')}>Swatches</button>
      </div>
      {tab === 'picker' ? (
        <div className="wf-popup-picker">
          <div className="wf-color-wheel-wrap">
            <div className="wf-color-wheel" ref={wheelRef} onMouseDown={handleWheelMouseDown}>
              <div className="wf-color-wheel-value-overlay" style={{ opacity: 1 - hsv.v }} />
              <div className="wf-color-wheel-thumb" style={{ left: thumbX, top: thumbY }} />
            </div>
          </div>
          <div
            className="wf-brightness-slider"
            ref={brightnessRef}
            onMouseDown={handleBrightnessMouseDown}
            style={{ background: `linear-gradient(to right, #000, ${hsvToHex(hsv.h, hsv.s, 1)})` }}
          >
            <div className="wf-brightness-thumb" style={{ left: `${hsv.v * 100}%` }} />
          </div>
          <div className="wf-hex-row">
            <input
              type="text"
              className="wf-hex-input"
              value={hexDraft}
              placeholder="#RRGGBB"
              spellCheck={false}
              onChange={(e) => setHexDraft(e.target.value)}
              onBlur={commitHex}
              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
            />
            <button
              className="wf-swatch-square wf-swatch-none"
              onClick={() => onApply(null)}
              aria-label="None (transparent)"
              title="None (transparent)"
            />
          </div>
        </div>
      ) : (
        <div className="wf-popup-swatches">
          <button key={NONE_SWATCH.label} className="wf-swatch-row" onClick={() => onApply(NONE_SWATCH.hex)}>
            <span className="wf-swatch-dot wf-swatch-none" />
            <span>{NONE_SWATCH.label}</span>
          </button>
          {FILL_SWATCH_GROUPS.map((group) => (
            <div key={group.category} className="wf-swatch-group">
              <div className="wf-swatch-group-label">{group.category}</div>
              {group.swatches.map((s) => (
                <button key={s.label} className="wf-swatch-row" onClick={() => onApply(s.hex)}>
                  <span
                    className={`wf-swatch-dot${s.hex === null ? ' wf-swatch-none' : ''}`}
                    style={s.hex === null ? undefined : { background: s.token ? `var(${s.token})` : s.hex }}
                  />
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
