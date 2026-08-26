import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

// The iOS "compact" time-entry keypad — a numeric keypad that builds an
// HH:MM value digit by digit, replacing the old wheel-spinner time picker
// now that Ben supplied a real reference image (same as
// Components/IOSCalendarPopover.jsx was for date mode — see that file's
// own header comment). The wheel picker this replaces (formerly
// Components/IOSWheelPicker.jsx) has been deleted outright, not left as
// dead code, once nothing referenced it any more.
//
// 24-hour only, no AM/PM segment — this app already uses 24-hour time
// everywhere (every stored 'HH:MM' value), so the AM/PM toggle visible in
// Ben's reference (a 12-hour-clock feature) has no equivalent need here;
// dropping it was confirmed with Ben before building, not assumed.
//
// Positioned like the real iOS system keyboard, not docked under the
// field like IOSCalendarPopover.jsx's own small card — full-width, flush
// against the bottom edge of the phone mockup (Ben's own correction after
// the first version docked it under the field like the calendar: "the
// numeric keyboard should be the native iOS one, where its displayed at
// the bottom of the device"). Portaled to document.body, positioned via
// the `.phone-frame` ancestor's own getBoundingClientRect() rather than
// the field's — same portal technique as IOSCalendarPopover.jsx (escapes
// .hol-form-body's overflow-y:auto / .phone-frame's own overflow:hidden),
// just anchored to the frame's bottom edge instead of the field. There is
// deliberately no separate value-display readout any more (the first
// version had one, styled like Ben's reference image's own floating "3:43"
// card) — the field being edited is already a live, visible, controlled
// input showing the exact same value as it's typed, so a second readout
// would just be redundant, and a real system keyboard has no such readout
// of its own either. Every valid keystroke live-applies to the field
// immediately (confirmed with Ben via AskUserQuestion, matching the
// calendar's own convention) — but unlike the calendar, this picker DOES
// have a "Done" button, in a thin toolbar above the keypad. Apple's own
// numeric/phone-style keyboards (the ones with letter subscripts, which is
// what this one visually matches) genuinely have no Return/Done key built
// in — apps needing an explicit dismiss affordance for exactly this
// keyboard style almost always add their own "Done" toolbar directly above
// it (an input accessory view), since tap-elsewhere-to-dismiss alone is
// easy to miss in a form full of fields. Done is purely a dismiss, not a
// separate "confirm" step — there's nothing left to commit, since every
// digit already live-applied on its own keystroke; tapping outside still
// works identically, Done just adds a more discoverable affordance.
//
// Digit entry model: hour and minute are two independent segments filled
// left-to-right with auto-advance — NOT one continuous 4-digit shift
// register. A leading digit that could never start a valid 2-digit value
// for its segment (hour: 3-9, since 30-99 all exceed 23; minute: 6-9,
// since 60-99 all exceed 59) is immediately committed as a complete
// 1-digit value and auto-advances to the next segment; otherwise the
// segment waits for an optional second digit, rejecting one that would
// push the combined value out of range (hour > 23, minute > 59). This
// mirrors Ben's own reference example ("3:43" — a single "3" instantly
// becomes the complete hour since no valid hour is 30+, then "4"+"3" fill
// minutes) while avoiding a plain single 4-digit shift register's real
// failure mode: reinterpreting the whole buffer as HH:MM after every
// keystroke blocks completely ordinary target times mid-entry (typing
// "1","9","3","0" toward 19:30 hits an "invalid" 01:93 reading after the
// 3rd digit under that model) — traced by hand before writing any code,
// not discovered after shipping.

const KEYS = [
  ['1', ''], ['2', 'ABC'], ['3', 'DEF'],
  ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'],
  ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'],
]

const BackspaceIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 6h11a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-6-6 6-6z" />
    <path d="M13 10l4 4M17 10l-4 4" />
  </svg>
)

// onChange fires with plain 'HH:MM', 24-hour — matches every other time
// value already flowing through this repo's own data. `anchorEl` is the
// field's own `.hol-field-input-wrap` DOM node — used only to find the
// enclosing `.phone-frame` to anchor against, not for its own position.
// No `value` prop — unlike the first version, there's no display readout
// to seed from the field's current value; every open starts blank, same
// as tapping a real keyboard-driven field always starts a fresh entry.
export default function IOSTimeKeypadPopover({ onChange, onClose, anchorEl }) {
  const [pos, setPos] = useState(null)
  const [hourDigits, setHourDigits] = useState('')
  const [hourState, setHourState] = useState('empty') // 'empty' | 'partial' | 'complete'
  const [minuteDigits, setMinuteDigits] = useState('')
  const [minuteState, setMinuteState] = useState('empty')
  const [segment, setSegment] = useState('hour')

  useEffect(() => {
    if (!anchorEl) return
    const frame = anchorEl.closest('.phone-frame')
    const frameRect = frame
      ? frame.getBoundingClientRect()
      : { left: 0, right: window.innerWidth, bottom: window.innerHeight, width: window.innerWidth }
    // A fixed estimate, not a live measurement — this component's content
    // (a 4-row keypad, nothing else now that the display readout is gone)
    // never actually varies between opens. No top-vs-bottom branching is
    // needed here the way IOSCalendarPopover.jsx has — a real keyboard is
    // always bottom-anchored regardless of how far down the screen the
    // field being edited sits.
    const height = 352 // matches .ios-time-popover's own computed height exactly (the toolbar + keypad sections' combined padding/keys/gaps) so it sits flush against the frame's bottom edge, not a few px short
    setPos({ top: frameRect.bottom - height, left: frameRect.left, width: frameRect.width })
  }, [anchorEl])

  function commit(nextHourDigits, nextMinuteDigits) {
    const h = nextHourDigits === '' ? 0 : parseInt(nextHourDigits, 10)
    const m = nextMinuteDigits === '' ? 0 : parseInt(nextMinuteDigits, 10)
    onChange(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  }

  function pressDigit(d) {
    let hd = hourDigits, hs = hourState, md = minuteDigits, ms = minuteState, seg = segment

    if (seg === 'hour') {
      if (hs === 'empty') {
        hd = d
        hs = d >= '3' ? 'complete' : 'partial'
        if (hs === 'complete') seg = 'minute'
      } else if (hs === 'partial') {
        const val = parseInt(hd + d, 10)
        if (val <= 23) { hd = hd + d; hs = 'complete'; seg = 'minute' }
        // else: reject the digit — hour stays as-is, still waiting.
      }
    } else {
      if (ms === 'empty' || ms === 'complete') {
        // A digit typed once minute is already 'complete' restarts minute
        // entry fresh, rather than trying to combine with the old value —
        // simplest, most predictable "keep typing to correct" behavior.
        md = d
        ms = d >= '6' ? 'complete' : 'partial'
      } else { // 'partial'
        const val = parseInt(md + d, 10)
        if (val <= 59) { md = md + d; ms = 'complete' }
        // else: reject the digit — minute stays as-is, still waiting.
      }
    }

    setHourDigits(hd); setHourState(hs)
    setMinuteDigits(md); setMinuteState(ms)
    setSegment(seg)
    commit(hd, md)
  }

  function pressBackspace() {
    let hd = hourDigits, hs = hourState, md = minuteDigits, ms = minuteState, seg = segment

    if (seg === 'minute' && ms !== 'empty') {
      if (md.length === 2) { md = md.slice(0, 1); ms = 'partial' }
      else { md = ''; ms = 'empty' }
    } else if (seg === 'minute') {
      // Minute is already empty — step back into hour so backspace can
      // keep removing digits there.
      seg = 'hour'
      if (hd.length === 2) { hd = hd.slice(0, 1); hs = 'partial' }
      else { hd = ''; hs = 'empty' }
    } else if (hs !== 'empty') {
      if (hd.length === 2) { hd = hd.slice(0, 1); hs = 'partial' }
      else { hd = ''; hs = 'empty' }
    }

    setHourDigits(hd); setHourState(hs)
    setMinuteDigits(md); setMinuteState(ms)
    setSegment(seg)
    commit(hd, md)
  }

  if (!pos) return null

  return createPortal(
    // Same reasoning as Components/IOSCalendarPopover.jsx's own header
    // comment: still nested in the React tree inside whichever field
    // wrapper opened it, so its own onClick={() => setActiveField(...)}
    // would otherwise re-fire on bubble the instant a key is pressed.
    <span onClick={e => e.stopPropagation()}>
      <div className="ios-cal-backdrop" onClick={onClose} />
      <div className="ios-time-popover" style={{ top: pos.top, left: pos.left, width: pos.width }}>
        <div className="ios-time-toolbar">
          <button type="button" className="ios-time-toolbar-btn" onClick={onClose}>Done</button>
        </div>
        <div className="ios-time-keypad">
          {KEYS.map(([digit, letters]) => (
            <button key={digit} type="button" className="ios-time-key" onClick={() => pressDigit(digit)}>
              <span className="ios-time-key-digit">{digit}</span>
              {letters && <span className="ios-time-key-letters">{letters}</span>}
            </button>
          ))}
          <span />
          <button type="button" className="ios-time-key" onClick={() => pressDigit('0')}>
            <span className="ios-time-key-digit">0</span>
          </button>
          <button type="button" className="ios-time-key ios-time-key--backspace" onClick={pressBackspace} aria-label="Delete digit">
            <BackspaceIcon />
          </button>
        </div>
      </div>
    </span>,
    document.body
  )
}
