import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  toPlainRect, getElementMetrics, computeElementGap, uniformDirs,
  computeNearestGaps, isAncestorOrDescendant, findVisibleAncestor,
  exportElement, exportSelection, firstFont, generateCssSnippet,
} from './devModeUtils'

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.3 5.71a1 1 0 00-1.42 0L12 10.59 7.11 5.7A1 1 0 105.7 7.11L10.59 12 5.7 16.89a1 1 0 101.41 1.41L12 13.41l4.89 4.89a1 1 0 001.41-1.41L13.41 12l4.89-4.89a1 1 0 000-1.4z" />
  </svg>
)

const CopyIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
)

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const HelpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

function shallowRectEqual(a, b) {
  if (a === b) return true
  if (!a || !b) return false
  return a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height
}

function round(n) { return Math.round(n) }

// ─── Dev Mode ────────────────────────────────────────────────────
// Toggleable element inspector for a prototype's live DOM — hover to see
// spacing, click to inspect exact computed styles, shift-click to multi-
// select, export any selection as an image. See CLAUDE.md / the Dev Mode
// plan doc for the full design rationale (portal + stacking-context
// interaction, capture-phase event interception, StrictMode-safe rAF loop).
export default function DevMode({ containerRef }) {
  const [isActive, setIsActive] = useState(false)
  const [hoveredEl, setHoveredEl] = useState(null)
  const [selectedEls, setSelectedEls] = useState([])
  const [hoverRect, setHoverRect] = useState(null)
  const [selectedRects, setSelectedRects] = useState([])
  const [gapInfo, setGapInfo] = useState(null)
  const [exportFormat, setExportFormat] = useState('png')
  const [exportScale, setExportScale] = useState(1)
  const [isExporting, setIsExporting] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const hoveredElRef = useRef(null)
  const selectedElsRef = useRef([])
  const rafIdRef = useRef(null)
  const lastHoverRectRef = useRef(null)
  const lastSelectedRectsRef = useRef([])
  const lastGapInfoRef = useRef(null)

  const clearSelection = useCallback(() => setSelectedEls([]), [])

  const toggleActive = useCallback(() => {
    setIsActive(active => {
      const next = !active
      if (!next) {
        hoveredElRef.current = null
        selectedElsRef.current = []
        setHoveredEl(null)
        setSelectedEls([])
      }
      return next
    })
  }, [])

  // ── Capture-phase event interception ──
  // Must intercept before the real app's own handlers fire (link nav,
  // swipe-to-delete's setPointerCapture, row-tap navigation, etc.) — see
  // plan doc. mousemove doesn't need prevention, nothing to block there.
  useEffect(() => {
    if (!isActive) return
    const container = containerRef.current
    if (!container) return

    const handleMove = (e) => {
      const target = e.target
      if (target !== hoveredElRef.current) {
        hoveredElRef.current = target
        setHoveredEl(target)
      }
    }

    const handleLeave = () => {
      hoveredElRef.current = null
      setHoveredEl(null)
    }

    const handleSuppress = (e) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const handleClick = (e) => {
      e.preventDefault()
      e.stopPropagation()
      const target = e.target

      setSelectedEls(prev => {
        let next
        if (e.shiftKey) {
          next = prev.includes(target) ? prev.filter(el => el !== target) : [...prev, target]
        } else {
          next = (prev.length === 1 && prev[0] === target) ? prev : [target]
        }
        selectedElsRef.current = next
        return next
      })
    }

    container.addEventListener('mousemove', handleMove, true)
    container.addEventListener('mouseleave', handleLeave, true)
    container.addEventListener('pointerdown', handleSuppress, true)
    container.addEventListener('mousedown', handleSuppress, true)
    container.addEventListener('click', handleClick, true)

    return () => {
      container.removeEventListener('mousemove', handleMove, true)
      container.removeEventListener('mouseleave', handleLeave, true)
      container.removeEventListener('pointerdown', handleSuppress, true)
      container.removeEventListener('mousedown', handleSuppress, true)
      container.removeEventListener('click', handleClick, true)
    }
  }, [isActive, containerRef])

  // ── Outer guard against accidental navigation ──
  // containerRef only covers the inspectable subtree (e.g. .phone-frame),
  // but sibling chrome like the prototype's "back to index" link sits
  // outside it — clicking that while Dev Mode is active would navigate
  // away and kill the whole session with no warning. Block default
  // actions on anything outside both the inspectable container AND Dev
  // Mode's own UI, without doing any of the hover/select logic for it.
  useEffect(() => {
    if (!isActive) return
    const container = containerRef.current

    const isInScope = (target) => {
      if (container && container.contains(target)) return true
      if (target.closest && target.closest('[data-devmode-ui]')) return true
      return false
    }

    const guardBlock = (e) => {
      if (isInScope(e.target)) return
      e.preventDefault()
      e.stopPropagation()
    }

    // click (not mousedown/pointerdown) additionally clears the current
    // selection when it lands outside the inspectable frame — mirrors
    // clicking empty canvas to deselect in Figma, rather than the click
    // just being silently swallowed.
    const guardClick = (e) => {
      if (isInScope(e.target)) return
      e.preventDefault()
      e.stopPropagation()
      if (selectedElsRef.current.length > 0) {
        selectedElsRef.current = []
        setSelectedEls([])
      }
    }

    document.addEventListener('click', guardClick, true)
    document.addEventListener('mousedown', guardBlock, true)
    document.addEventListener('pointerdown', guardBlock, true)
    return () => {
      document.removeEventListener('click', guardClick, true)
      document.removeEventListener('mousedown', guardBlock, true)
      document.removeEventListener('pointerdown', guardBlock, true)
    }
  }, [isActive, containerRef])

  // ── Escape: close the help modal first if it's open (works whether or
  // not Dev Mode itself is active), otherwise clear selection first and
  // exit Dev Mode on a second press (or immediately if nothing was
  // selected) ──
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key !== 'Escape') return
      if (showHelp) {
        setShowHelp(false)
        return
      }
      if (!isActive) return
      if (selectedElsRef.current.length > 0) {
        selectedElsRef.current = []
        setSelectedEls([])
      } else {
        setIsActive(false)
        hoveredElRef.current = null
        setHoveredEl(null)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isActive, showHelp])

  // ── rAF loop: continuously reposition overlays, drop detached nodes ──
  // Keyed only on [isActive] (not hover/selection) so StrictMode's double-
  // invoke can never stack duplicate loops; current hover/selection is read
  // from refs kept in sync by the handlers/setters above.
  useEffect(() => {
    if (!isActive) return

    const tick = () => {
      // hover
      const hEl = hoveredElRef.current
      if (hEl && hEl.isConnected) {
        const plain = toPlainRect(hEl.getBoundingClientRect())
        if (!shallowRectEqual(plain, lastHoverRectRef.current)) {
          lastHoverRectRef.current = plain
          setHoverRect(plain)
        }
      } else {
        if (hEl && !hEl.isConnected) {
          hoveredElRef.current = null
          setHoveredEl(null)
        }
        if (lastHoverRectRef.current) {
          lastHoverRectRef.current = null
          setHoverRect(null)
        }
      }

      // selection
      const sEls = selectedElsRef.current
      if (sEls.length) {
        const stillConnected = sEls.filter(el => el.isConnected)
        if (stillConnected.length !== sEls.length) {
          selectedElsRef.current = stillConnected
          setSelectedEls(stillConnected)
        }
        const rects = stillConnected.map(el => toPlainRect(el.getBoundingClientRect()))
        const prev = lastSelectedRectsRef.current
        const changed = rects.length !== prev.length || rects.some((r, i) => !shallowRectEqual(r, prev[i]))
        if (changed) {
          lastSelectedRectsRef.current = rects
          setSelectedRects(rects)
        }
      } else if (lastSelectedRectsRef.current.length) {
        lastSelectedRectsRef.current = []
        setSelectedRects([])
      }

      // gap computation — only meaningful with 0 or exactly 1 selected
      const hEl2 = hoveredElRef.current
      const sEls2 = selectedElsRef.current
      let nextGap = null

      if (sEls2.length === 0 && hEl2 && hEl2.isConnected && hEl2.parentElement) {
        // Measure to whichever is actually nearest in each direction — the
        // next sibling element if one sits closer, otherwise the nearest
        // ancestor with real visual presence (not necessarily the
        // immediate DOM parent, which is often just an invisible
        // structural wrapper with nothing on screen to relate a gap to).
        const container = findVisibleAncestor(hEl2)
        nextGap = { type: 'neighbors', ...computeNearestGaps(hEl2, container) }
      } else if (sEls2.length === 1 && hEl2 && hEl2.isConnected && hEl2 !== sEls2[0]) {
        const selEl = sEls2[0]
        const selRect = toPlainRect(selEl.getBoundingClientRect())
        const hovRect = toPlainRect(hEl2.getBoundingClientRect())

        if (isAncestorOrDescendant(selEl, hEl2)) {
          // ancestor/descendant — nearest-neighbor gaps within whichever
          // element contains the other
          const [containedEl, containerEl] = hEl2.contains(selEl) ? [selEl, hEl2] : [hEl2, selEl]
          nextGap = { type: 'neighbors', ...computeNearestGaps(containedEl, containerEl) }
        } else {
          const pairGap = computeElementGap(selRect, hovRect)
          if (pairGap.overlapping) {
            // unrelated but visually overlapping — no genuine containment
            // relationship for the nearest-neighbor ancestor-chain search
            // to walk, so fall back to a single shared reference
            nextGap = { type: 'neighbors', rect: hovRect, dirs: uniformDirs(hovRect, selRect) }
          } else {
            nextGap = { type: 'pair', gap: pairGap, rectA: selRect, rectB: hovRect }
          }
        }
      }

      const gapChanged = JSON.stringify(nextGap) !== JSON.stringify(lastGapInfoRef.current)
      if (gapChanged) {
        lastGapInfoRef.current = nextGap
        setGapInfo(nextGap)
      }

      rafIdRef.current = requestAnimationFrame(tick)
    }

    rafIdRef.current = requestAnimationFrame(tick)
    return () => { if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current) }
  }, [isActive])

  const handleExportSingle = useCallback(async () => {
    if (selectedElsRef.current.length !== 1) return
    setIsExporting(true)
    try {
      await exportElement(selectedElsRef.current[0], { format: exportFormat, scale: exportFormat === 'svg' ? 1 : exportScale })
    } catch (err) {
      console.error('Dev Mode export failed', err)
    } finally {
      setIsExporting(false)
    }
  }, [exportFormat, exportScale])

  const handleExportMulti = useCallback(async () => {
    if (selectedElsRef.current.length < 2) return
    setIsExporting(true)
    try {
      await exportSelection(selectedElsRef.current, { format: exportFormat, scale: exportFormat === 'svg' ? 1 : exportScale })
    } catch (err) {
      console.error('Dev Mode export failed', err)
    } finally {
      setIsExporting(false)
    }
  }, [exportFormat, exportScale])

  const showHoverHighlight = hoverRect && !selectedEls.includes(hoveredEl)

  return (
    <>
      <div className="devmode-toggle-group" data-devmode-ui="true">
        <button className={`devmode-toggle${isActive ? ' active' : ''}`} onClick={toggleActive} data-devmode-ui="true">
          <span className="devmode-toggle-dot" />
          {isActive ? 'Exit Dev Mode' : 'Dev Mode'}
        </button>
        <button className="devmode-help-btn" onClick={() => setShowHelp(true)} aria-label="Dev Mode help" data-devmode-ui="true">
          <HelpIcon />
        </button>
      </div>

      {showHelp && createPortal(
        <DevModeHelpModal onClose={() => setShowHelp(false)} />,
        document.body
      )}

      {isActive && createPortal(
        <div data-devmode-ui="true">
          {showHoverHighlight && (
            <div
              className="devmode-highlight devmode-highlight-hover"
              style={{ top: hoverRect.top, left: hoverRect.left, width: hoverRect.width, height: hoverRect.height }}
            />
          )}

          {selectedRects.map((r, i) => (
            <div
              key={i}
              className="devmode-highlight devmode-highlight-selected"
              style={{ top: r.top, left: r.left, width: r.width, height: r.height }}
            />
          ))}

          {gapInfo && selectedEls.length <= 1 && <GapOverlay gapInfo={gapInfo} />}

          {selectedEls.length === 1 && (
            <InspectPanel
              el={selectedEls[0]}
              onClose={clearSelection}
              format={exportFormat}
              setFormat={setExportFormat}
              scale={exportScale}
              setScale={setExportScale}
              onExport={handleExportSingle}
              isExporting={isExporting}
            />
          )}

          {selectedEls.length > 1 && (
            <MultiSelectPanel
              count={selectedEls.length}
              onClose={clearSelection}
              format={exportFormat}
              setFormat={setExportFormat}
              scale={exportScale}
              setScale={setExportScale}
              onExport={handleExportMulti}
              isExporting={isExporting}
            />
          )}
        </div>,
        document.body
      )}
    </>
  )
}

// ─── Help modal ──────────────────────────────────────────────────
// Always reachable from the help icon, whether or not Dev Mode is
// currently active — a developer should be able to read this before ever
// turning the tool on.

const HOW_TO_USE = [
  { key: 'Click', text: 'Select an element to inspect its dimensions, colours, typography, and more' },
  { key: 'Shift + Click', text: 'Add or remove elements from a multi-selection' },
  { key: 'Hover', text: 'See the distance from that element to whatever is nearest to it' },
  { key: 'Select, then Hover', text: 'Measure the distance between the selected element and whatever you hover next' },
  { key: 'Esc', text: 'Clear the current selection — press again to exit Dev Mode' },
  { key: 'Click outside', text: 'Clicking outside the phone frame also clears your selection' },
]

const WHAT_YOU_CAN_DO = [
  'Copy any colour value, or copy the element’s full styling as a CSS snippet',
  'Export a single element as a PNG, JPG or SVG, at up to 4x scale',
  'Select multiple elements and export them together as one combined image',
]

function DevModeHelpModal({ onClose }) {
  return (
    <div className="devmode-help-overlay" data-devmode-ui="true" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="devmode-help-box">
        <div className="devmode-help-header">
          <div className="devmode-help-title">Dev Mode help</div>
          <button className="devmode-panel-close" onClick={onClose} aria-label="Close help">
            <CloseIcon />
          </button>
        </div>
        <div className="devmode-help-body">
          <div className="devmode-help-section">
            <div className="devmode-panel-section-title">How to use</div>
            <ul className="devmode-help-list">
              {HOW_TO_USE.map(({ key, text }) => (
                <li key={key}>
                  <span className="devmode-help-key">{key}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="devmode-help-section">
            <div className="devmode-panel-section-title">What you can do</div>
            <ul className="devmode-help-list">
              {WHAT_YOU_CAN_DO.map(text => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Gap / distance overlay ──────────────────────────────────────

function GapOverlay({ gapInfo }) {
  if (gapInfo.type === 'neighbors') {
    const { rect, dirs } = gapInfo
    const pieces = []
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2

    // The other end of each line is derived directly from the gap value
    // itself (rect's edge ± gap), not read off the reference element's
    // rect — the reference can be either a sibling sitting right next to
    // rect (where the near edge faces rect) or the container itself
    // (where the *opposite* edge is the one that matters), and deriving
    // from the gap sidesteps needing to know which case it is.
    if (dirs.top) {
      const { gap } = dirs.top
      const y1 = rect.top - gap, y2 = rect.top
      pieces.push(
        <div key="top-line" className="devmode-gap-line vertical" style={{ left: x, top: Math.min(y1, y2), height: Math.abs(gap) }} />,
        <GapLabel key="top-label" value={round(gap)} x={x} y={(y1 + y2) / 2} orientation="vertical" />
      )
    }
    if (dirs.bottom) {
      const { gap } = dirs.bottom
      const y1 = rect.bottom, y2 = rect.bottom + gap
      pieces.push(
        <div key="bottom-line" className="devmode-gap-line vertical" style={{ left: x, top: Math.min(y1, y2), height: Math.abs(gap) }} />,
        <GapLabel key="bottom-label" value={round(gap)} x={x} y={(y1 + y2) / 2} orientation="vertical" />
      )
    }
    if (dirs.left) {
      const { gap } = dirs.left
      const x1 = rect.left - gap, x2 = rect.left
      pieces.push(
        <div key="left-line" className="devmode-gap-line horizontal" style={{ top: y, left: Math.min(x1, x2), width: Math.abs(gap) }} />,
        <GapLabel key="left-label" value={round(gap)} x={(x1 + x2) / 2} y={y} orientation="horizontal" />
      )
    }
    if (dirs.right) {
      const { gap } = dirs.right
      const x1 = rect.right, x2 = rect.right + gap
      pieces.push(
        <div key="right-line" className="devmode-gap-line horizontal" style={{ top: y, left: Math.min(x1, x2), width: Math.abs(gap) }} />,
        <GapLabel key="right-label" value={round(gap)} x={(x1 + x2) / 2} y={y} orientation="horizontal" />
      )
    }

    return <>{pieces}</>
  }

  const { gap, rectA, rectB } = gapInfo
  const pieces = []

  if (!gap.overlapsX) {
    const [left, right] = rectA.left <= rectB.left ? [rectA, rectB] : [rectB, rectA]
    const overlapTop = Math.max(rectA.top, rectB.top)
    const overlapBottom = Math.min(rectA.bottom, rectB.bottom)
    const y = overlapTop < overlapBottom ? (overlapTop + overlapBottom) / 2 : left.top + left.height / 2
    const width = Math.max(0, right.left - left.right)
    pieces.push(
      <div key="h-line" className="devmode-gap-line horizontal" style={{ left: left.right, top: y, width }} />,
      <GapLabel key="h-label" value={round(gap.horizontal)} x={left.right + width / 2} y={y} orientation="horizontal" />
    )
  }

  if (!gap.overlapsY) {
    const [top, bottom] = rectA.top <= rectB.top ? [rectA, rectB] : [rectB, rectA]
    const overlapLeft = Math.max(rectA.left, rectB.left)
    const overlapRight = Math.min(rectA.right, rectB.right)
    const x = overlapLeft < overlapRight ? (overlapLeft + overlapRight) / 2 : top.left + top.width / 2
    const height = Math.max(0, bottom.top - top.bottom)
    pieces.push(
      <div key="v-line" className="devmode-gap-line vertical" style={{ top: top.bottom, left: x, height }} />,
      <GapLabel key="v-label" value={round(gap.vertical)} x={x} y={top.bottom + height / 2} orientation="vertical" />
    )
  }

  return <>{pieces}</>
}

// GAP_LABEL_OFFSET pushes the label beside the line rather than centered
// on top of it — for small gap values the line is very short, and a
// centered label (which is bigger than the line) would fully cover it,
// making it look like there's no line at all.
const GAP_LABEL_OFFSET = 10

function GapLabel({ value, x, y, orientation = 'center' }) {
  let left = x, top = y, transform = 'translate(-50%, -50%)'
  if (orientation === 'vertical') {
    // line runs top-to-bottom — offset sideways so the label sits beside it
    left = x + GAP_LABEL_OFFSET
    transform = 'translate(0, -50%)'
  } else if (orientation === 'horizontal') {
    // line runs left-to-right — offset upward so the label sits above it
    top = y - GAP_LABEL_OFFSET
    transform = 'translate(-50%, -100%)'
  }
  return <div className="devmode-gap-label" style={{ left, top, transform }}>{value}px</div>
}

// ─── Inspect panel (single-select) ───────────────────────────────

function InspectPanel({ el, onClose, format, setFormat, scale, setScale, onExport, isExporting }) {
  const metrics = getElementMetrics(el)
  const cssSnippet = generateCssSnippet(metrics)

  return (
    <div className="devmode-panel" data-devmode-ui="true">
      <div className="devmode-panel-header">
        <div className="devmode-panel-title">Inspect</div>
        <span className="devmode-panel-tag">&lt;{metrics.tagName}&gt;</span>
        <button className="devmode-panel-close" onClick={onClose} aria-label="Close inspect panel">
          <CloseIcon />
        </button>
      </div>
      <div className="devmode-panel-body">
        <div className="devmode-panel-section">
          <div className="devmode-panel-section-title">Dimensions</div>
          <Row label="Width" value={`${metrics.width}px`} />
          <Row label="Height" value={`${metrics.height}px`} />
        </div>

        <div className="devmode-panel-section">
          <div className="devmode-panel-section-title">Colour</div>
          <ColorRow label="Background" color={metrics.backgroundColor} />
          <ColorRow label="Text" color={metrics.color} />
          {metrics.borderColor && <ColorRow label="Border" color={metrics.borderColor} />}
        </div>

        <div className="devmode-panel-section">
          <div className="devmode-panel-section-title">Typography</div>
          <Row label="Font" value={firstFont(metrics.fontFamily)} />
          <Row label="Size" value={metrics.fontSize} />
          <Row label="Weight" value={metrics.fontWeight} />
          <Row label="Line height" value={metrics.lineHeight} />
          <Row label="Letter spacing" value={metrics.letterSpacing} />
        </div>

        <div className="devmode-panel-section">
          <div className="devmode-panel-section-title">Border &amp; shadow</div>
          <Row label="Radius" value={Array.isArray(metrics.borderRadius) ? metrics.borderRadius.join(' / ') : metrics.borderRadius} />
          <Row label="Shadow" value={metrics.boxShadow || 'none'} />
        </div>

        <CodePreviewSection css={cssSnippet} />

        <ExportSection
          format={format} setFormat={setFormat}
          scale={scale} setScale={setScale}
          onExport={onExport} isExporting={isExporting}
          buttonLabel="Export"
        />
      </div>
    </div>
  )
}

function MultiSelectPanel({ count, onClose, format, setFormat, scale, setScale, onExport, isExporting }) {
  return (
    <div className="devmode-panel" data-devmode-ui="true">
      <div className="devmode-panel-header">
        <div className="devmode-panel-title">{count} elements selected</div>
        <button className="devmode-panel-close" onClick={onClose} aria-label="Clear selection">
          <CloseIcon />
        </button>
      </div>
      <div className="devmode-panel-body">
        <div className="devmode-panel-empty">Inspect details aren't shown for multiple elements — export is still available below.</div>
        <ExportSection
          format={format} setFormat={setFormat}
          scale={scale} setScale={setScale}
          onExport={onExport} isExporting={isExporting}
          buttonLabel="Export combined image"
          sectionTitle="Export (combined image)"
        />
      </div>
    </div>
  )
}

function useCopy() {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch (err) {
      console.error('Dev Mode copy failed', err)
    }
  }, [])
  return [copied, copy]
}

function CodePreviewSection({ css }) {
  const [copied, copy] = useCopy()
  return (
    <div className="devmode-panel-section">
      <div className="devmode-panel-section-title-row">
        <div className="devmode-panel-section-title">Code</div>
        <button
          className="devmode-copy-btn devmode-copy-btn-text"
          onClick={() => copy(css)}
          data-devmode-ui="true"
        >
          {copied ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy CSS</>}
        </button>
      </div>
      <pre className="devmode-code-block">{css}</pre>
    </div>
  )
}

function ExportSection({ format, setFormat, scale, setScale, onExport, isExporting, buttonLabel, sectionTitle = 'Export' }) {
  return (
    <div className="devmode-panel-section">
      <div className="devmode-panel-section-title">{sectionTitle}</div>
      <div className="devmode-export-row">
        <select className="devmode-select" value={format} onChange={e => setFormat(e.target.value)}>
          <option value="png">PNG</option>
          <option value="jpg">JPG</option>
          <option value="svg">SVG</option>
        </select>
        <select
          className="devmode-select"
          value={scale}
          onChange={e => setScale(Number(e.target.value))}
          disabled={format === 'svg'}
        >
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={3}>3x</option>
          <option value={4}>4x</option>
        </select>
      </div>
      <button className="devmode-export-btn" onClick={onExport} disabled={isExporting}>
        {isExporting ? 'Exporting…' : buttonLabel}
      </button>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="devmode-panel-row">
      <span className="devmode-panel-row-label">{label}</span>
      <span className="devmode-panel-row-value">{value}</span>
    </div>
  )
}

function ColorRow({ label, color }) {
  const [copied, copy] = useCopy()
  return (
    <div className="devmode-panel-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span className="devmode-panel-row-label">{label}</span>
        <span className="devmode-swatch-row">
          <span className="devmode-swatch"><span className="devmode-swatch-fill" style={{ background: color.hex || 'transparent' }} /></span>
          <span className="devmode-panel-row-value">{color.hex || 'transparent'}</span>
          {color.hex && (
            <button
              className="devmode-copy-btn"
              onClick={() => copy(color.hex)}
              aria-label={`Copy ${color.hex}`}
              data-devmode-ui="true"
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
          )}
        </span>
      </div>
      {color.hex && <div style={{ fontSize: 10.5, color: '#6e6e73', textAlign: 'right' }}>{color.rgba}</div>}
    </div>
  )
}
