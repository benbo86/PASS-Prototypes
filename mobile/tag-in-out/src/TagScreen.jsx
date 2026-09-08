import { useState, useRef, useEffect } from 'react'
import { PREFERRED_METHOD, REASON_CODES } from './data'

// ─── Icons ────────────────────────────────────────────────────
// Copied verbatim from Icons/Close.svg and Icons/Warning.svg, per this
// repo's own icon-copy-fidelity convention.

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <polygon points="18 7.2 16.8 6 12 10.8 7.2 6 6 7.2 10.8 12 6 16.8 7.2 18 12 13.2 16.8 18 18 16.8 13.2 12" fill="currentColor" stroke="currentColor" strokeLinejoin="round" />
  </svg>
)

// Copied verbatim from Icons/Tag Method QR.svg / Tag Method NFC.svg /
// Tag Method Manual.svg — pulled directly from the real Figma "Tag in
// method" component (node 1:279, Mobile App file) rather than hand-drawn,
// per this repo's own icon-copy-fidelity convention.
const QrIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M9.5 13C10.3284 13 11 13.6716 11 14.5V20.5C11 21.3284 10.3284 22 9.5 22H3.5C2.67157 22 2 21.3284 2 20.5V14.5C2 13.6716 2.67157 13 3.5 13H9.5ZM15 20V22H13V20H15ZM18.5 20V22H16.5V20H18.5ZM22 20V22H20V20H22ZM9 14H4C3.44772 14 3 14.4477 3 15V20C3 20.5523 3.44772 21 4 21H9C9.55228 21 10 20.5523 10 20V15C10 14.4477 9.55228 14 9 14ZM8 15.5C8.27614 15.5 8.5 15.7239 8.5 16V19C8.5 19.2761 8.27614 19.5 8 19.5H5C4.72386 19.5 4.5 19.2761 4.5 19V16C4.5 15.7239 4.72386 15.5 5 15.5H8ZM15 16.5V18.5H13V16.5H15ZM18.5 16.5V18.5H16.5V16.5H18.5ZM22 16.5V18.5H20V16.5H22ZM15 13V15H13V13H15ZM18.5 13V15H16.5V13H18.5ZM22 13V15H20V13H22ZM20.5 2C21.3284 2 22 2.67157 22 3.5V9.5C22 10.3284 21.3284 11 20.5 11H14.5C13.6716 11 13 10.3284 13 9.5V3.5C13 2.67157 13.6716 2 14.5 2H20.5ZM9.5 2C10.3284 2 11 2.67157 11 3.5V9.5C11 10.3284 10.3284 11 9.5 11H3.5C2.67157 11 2 10.3284 2 9.5V3.5C2 2.67157 2.67157 2 3.5 2H9.5ZM20 3H15C14.4477 3 14 3.44772 14 4V9C14 9.55228 14.4477 10 15 10H20C20.5523 10 21 9.55228 21 9V4C21 3.44772 20.5523 3 20 3ZM9 3H4C3.44772 3 3 3.44772 3 4V9C3 9.55228 3.44772 10 4 10H9C9.55228 10 10 9.55228 10 9V4C10 3.44772 9.55228 3 9 3ZM19 4.5C19.2761 4.5 19.5 4.72386 19.5 5V8C19.5 8.27614 19.2761 8.5 19 8.5H16C15.7239 8.5 15.5 8.27614 15.5 8V5C15.5 4.72386 15.7239 4.5 16 4.5H19ZM8 4.5C8.27614 4.5 8.5 4.72386 8.5 5V8C8.5 8.27614 8.27614 8.5 8 8.5H5C4.72386 8.5 4.5 8.27614 4.5 8V5C4.5 4.72386 4.72386 4.5 5 4.5H8Z" />
  </svg>
)

const NfcIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
    <path d="M10.865 0C4.86339 0 0 4.87011 0 10.875C0 16.8799 4.86339 21.75 10.865 21.75C16.8766 21.75 21.75 16.8799 21.75 10.875C21.75 4.87007 16.8766 0 10.865 0ZM10.865 1.75C15.9103 1.75 20 5.83684 20 10.875C20 15.9132 15.9103 20 10.865 20C5.83043 20 1.75 15.9139 1.75 10.875C1.75 5.83607 5.83043 1.75 10.865 1.75Z" />
    <path d="M10.868 3C6.52181 3 3 6.52669 3 10.875C3 15.2233 6.52181 18.75 10.868 18.75C15.221 18.75 18.75 15.2235 18.75 10.875C18.75 6.52653 15.221 3 10.868 3ZM10.868 4.75C14.2548 4.75 17 7.4933 17 10.875C17 14.2567 14.2548 17 10.868 17C7.48885 17 4.75 14.2574 4.75 10.875C4.75 7.49264 7.48885 4.75 10.868 4.75Z" />
    <path d="M10.871 6C8.18024 6 6 8.18326 6 10.875C6 13.5667 8.18024 15.75 10.871 15.75C13.5655 15.75 15.75 13.567 15.75 10.875C15.75 8.183 13.5655 6 10.871 6ZM10.871 7.75C12.5993 7.75 14 9.14977 14 10.875C14 12.6002 12.5993 14 10.871 14C9.14728 14 7.75 12.6008 7.75 10.875C7.75 9.14922 9.14728 7.75 10.871 7.75Z" />
  </svg>
)

const ManualIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11 2C11.55 2 12.05 2.22 12.41 2.58L21.41 11.58C21.77 11.94 22 12.45 22 13C22 13.55 21.78 14.05 21.41 14.41L14.41 21.41C14.05 21.78 13.55 22 13 22C12.45 22 11.95 21.78 11.59 21.42L2.59 12.42C2.22 12.05 2 11.55 2 11V4C2 2.9 2.9 2 4 2H11ZM11 3.99V4H4V11L13 20.01L20 12.99L11 3.99ZM6.5 5C7.32843 5 8 5.67157 8 6.5C8 7.32843 7.32843 8 6.5 8C5.67157 8 5 7.32843 5 6.5C5 5.67157 5.67157 5 6.5 5Z" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="var(--rag-green-green-3-aa, #2e9e4f)" />
    <path d="M7 12.5L10.5 16L17 8.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const METHOD_ICON = {
  qr: QrIcon,
  nfc: NfcIcon,
  manual: ManualIcon,
}

const METHOD_LABEL = {
  qr: 'QR code',
  nfc: 'NFC',
  manual: 'manually',
}

// "Tag in with QR code" / "Tag in with NFC" / "Tag in manually" — matches
// the real Figma copy exactly (no "with" before "manually").
const methodRowLabel = (verb, key) => key === 'manual' ? `${verb} manually` : `${verb} with ${METHOD_LABEL[key]}`

export default function TagScreen({ direction, customerName, onClose, onComplete }) {
  // 'select' -> the office's one preferred method, plus the escalation
  // link; 'reason' -> picking a reason code (manual is the only path that
  // ever reaches here); 'scanning' -> brief simulated delay (this is a
  // prototype, not a real scanner); 'success' -> confirmation.
  const [step, setStep] = useState('select')
  const [reasonKey, setReasonKey] = useState(null)
  const [otherText, setOtherText] = useState('')
  const [confirmedMethod, setConfirmedMethod] = useState(null)
  const [closing, setClosing] = useState(false)
  const scanTimer = useRef(null)
  const closeTimer = useRef(null)

  useEffect(() => () => {
    clearTimeout(scanTimer.current)
    clearTimeout(closeTimer.current)
  }, [])

  // Ben: "have it slide down when closed so it mirrors open" — plays the
  // reverse of .tag-screen's own mount animation (tag-screen-slide-down,
  // toggled via this class) before actually telling the parent to swap
  // `view` away, so the screen is still on-screen (just animating out)
  // for the duration rather than vanishing the instant the X is tapped.
  // 300ms matches .tag-screen-slide-up's own duration exactly.
  const handleClose = () => {
    setClosing(true)
    closeTimer.current = setTimeout(onClose, 300)
  }

  const verb = direction === 'in' ? 'Tag in' : 'Tag out'
  const PreferredIcon = METHOD_ICON[PREFERRED_METHOD]

  const complete = (method) => {
    setConfirmedMethod(method)
    setStep('scanning')
    scanTimer.current = setTimeout(() => {
      if (direction === 'in') {
        // Ben: "we don't need the tagged in confirmation screen, after
        // tapping the tag in method the screen should slide down
        // revealing the visit in progress screen" — Tag In skips
        // 'success' entirely and reuses the exact same slide-down-then-
        // notify-parent mechanism the X close button already uses
        // (handleClose), so both ways of leaving this screen look
        // identical. Tag Out is unaffected — still shows the 'success'
        // confirmation + Done button, since only Tag In was asked about.
        setClosing(true)
        closeTimer.current = setTimeout(() => onComplete(method), 300)
      } else {
        setStep('success')
      }
    }, 500)
  }

  // Per the epic's own spec (AIOP-20690, "Tag in/Out workflow"): carers are
  // presented with the office's own configured method — not a free choice
  // of QR/NFC/Manual — plus a single escalation: "Users can select an
  // option 'Preferred tag in/out option not available' which will then
  // enable them to tag in or out manually." Every escalation ends at
  // Manual, so "reason required for any non-preferred pick" and "reason
  // required only for Manual" collapse into the same behaviour here —
  // there's no longer a separate "pick a different automated method"
  // path to worry about. Tapping the preferred method is never a
  // deviation by definition, so it always completes directly, even in the
  // edge case where Manual itself happens to be the preferred method.
  const handleConfirmReason = () => complete('manual')

  // Ben: "have it as a sheet/drawer that slides up from the bottom. The
  // user can close the sheet by tapping outside" — closing this way is
  // now the sheet's only dismiss action (the Back button was removed), so
  // it needs to fully discard the in-progress pick, same as Back used to.
  const closeReasonSheet = () => {
    setStep('select')
    setReasonKey(null)
    setOtherText('')
  }

  // Ben: "Shall we add a text input if reason is Other?" — required, not
  // optional, since "Other" alone tells the office nothing they could
  // actually act on; matches the fixed-list-plus-free-text-for-Other
  // pattern rather than making the whole thing free text.
  const reasonReady = reasonKey && (reasonKey !== 'other' || otherText.trim())

  return (
    <div className={`tag-screen${closing ? ' tag-screen--closing' : ''}`}>
      <div className="tag-header">
        <button className="tag-header-close" onClick={handleClose} aria-label="Close">
          <CloseIcon />
        </button>
        <span className="tag-header-title">{verb}</span>
        <div style={{ width: 36 }} />
      </div>

      {(step === 'select' || step === 'reason') && (
        <div className="tag-intro">
          <h1 className="tag-heading">Choose your {verb} method</h1>
          <div className="tag-avatar" aria-hidden="true">
            {customerName.split(' ').map(p => p[0]).join('').slice(0, 2)}
          </div>
        </div>
      )}

      {(step === 'select' || step === 'reason') && (
        <div className="tag-body">
          {direction === 'in' && (
            <p className="tag-info-note">
              Please note: once tagged in to {customerName}, you will be required to complete this visit before you can tag back out.
            </p>
          )}
          <div className="tag-method-card">
            <button className="tag-method-row" onClick={() => complete(PREFERRED_METHOD)}>
              <span className="tag-method-icon"><PreferredIcon /></span>
              <span className="tag-method-label">{methodRowLabel(verb, PREFERRED_METHOD)}</span>
            </button>
          </div>
          {PREFERRED_METHOD !== 'manual' && (
            <button className="tag-fallback-link" onClick={() => setStep('reason')}>
              Preferred tag in/out option not available
            </button>
          )}
        </div>
      )}

      {step === 'reason' && (
        <div className="tag-sheet-overlay" onClick={closeReasonSheet}>
          <div className="tag-sheet-panel" onClick={e => e.stopPropagation()}>
            <div className="tag-sheet-handle" />
            <div className="tag-sheet-content">
              <h2 className="tag-reason-heading">For what reason?</h2>
              <div className="tag-reason-list">
                {REASON_CODES.map(r => (
                  <label key={r.key} className={`radio-card tag-reason-card${reasonKey === r.key ? ' selected' : ''}`}>
                    <input
                      type="radio"
                      className="form-radio"
                      name="tag-reason"
                      checked={reasonKey === r.key}
                      onChange={() => setReasonKey(r.key)}
                    />
                    <span>{r.label}</span>
                  </label>
                ))}
              </div>
              {reasonKey === 'other' && (
                <input
                  type="text"
                  className="form-input tag-reason-other-input"
                  placeholder="Please specify"
                  value={otherText}
                  onChange={e => setOtherText(e.target.value)}
                  autoFocus
                />
              )}
            </div>
            <div className="tag-sheet-footer">
              <button className="round-btn primary-btn" disabled={!reasonReady} onClick={handleConfirmReason}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {step === 'scanning' && (
        <div className="tag-success">
          <div className="tag-scanning-spinner" aria-hidden="true" />
          <p className="tag-success-body">{confirmedMethod === 'manual' ? 'Confirming…' : `Scanning with ${METHOD_LABEL[confirmedMethod]}…`}</p>
        </div>
      )}

      {step === 'success' && (
        <div className="tag-success">
          <CheckCircleIcon />
          <h2 className="tag-success-heading">{direction === 'in' ? 'Tagged in' : 'Tagged out'}</h2>
          <p className="tag-success-body">
            {methodRowLabel(verb, confirmedMethod)}
            {confirmedMethod === 'manual' && reasonKey
              ? ` — ${reasonKey === 'other' ? otherText : REASON_CODES.find(r => r.key === reasonKey)?.label}`
              : ''}
          </p>
          <button className="round-btn primary-btn" onClick={() => onComplete(confirmedMethod)}>Done</button>
        </div>
      )}
    </div>
  )
}
