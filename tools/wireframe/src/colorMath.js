// HSV <-> hex conversion backing the Colour Fill wheel (Toolbar.jsx). Kept
// as plain pure functions, no React, so the geometry/pointer-math side of
// the wheel can stay simple and just call these.

export function hsvToRgb(h, s, v) {
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  let r1, g1, b1
  if (h < 60) { r1 = c; g1 = x; b1 = 0 }
  else if (h < 120) { r1 = x; g1 = c; b1 = 0 }
  else if (h < 180) { r1 = 0; g1 = c; b1 = x }
  else if (h < 240) { r1 = 0; g1 = x; b1 = c }
  else if (h < 300) { r1 = x; g1 = 0; b1 = c }
  else { r1 = c; g1 = 0; b1 = x }
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  }
}

export function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === r) h = 60 * (((g - b) / d) % 6)
    else if (max === g) h = 60 * ((b - r) / d + 2)
    else h = 60 * ((r - g) / d + 4)
  }
  if (h < 0) h += 360
  return { h, s: max === 0 ? 0 : d / max, v: max }
}

export function hexToRgb(hex) {
  if (!hex) return null
  const clean = hex.replace('#', '')
  if (!/^[0-9a-f]{6}$/i.test(clean)) return null
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  }
}

export function rgbToHex({ r, g, b }) {
  return '#' + [r, g, b].map((n) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, '0')).join('')
}

export function hsvToHex(h, s, v) {
  return rgbToHex(hsvToRgb(h, s, v))
}

// Falls back to this repo's own brand purple (--brand-purple-6-purple-4,
// #9a26d6) for null/invalid hex — only ever used to seed the wheel's
// initial position, never shown as an applied fill unless the user
// actually interacts with it. Computed via the same rgbToHsv above rather
// than a hand-typed HSV guess, so it's exactly right.
const FALLBACK_HSV = rgbToHsv(0x9a, 0x26, 0xd6)
export function hexToHsv(hex) {
  const rgb = hexToRgb(hex)
  if (!rgb) return FALLBACK_HSV
  return rgbToHsv(rgb.r, rgb.g, rgb.b)
}
