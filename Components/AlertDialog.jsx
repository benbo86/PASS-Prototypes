import { useState } from 'react'

// Mobile alert, in the iOS "liquid glass" style (Figma: Mobile App, "Delete
// Expense", node 3971:16952). A frosted rounded card with a title, optional
// message, an optional text field, and full-width stacked pill buttons: the
// main action first, then Cancel. We design the prototypes for iOS only, so
// this is the one alert style for every mobile prototype (Android would use
// its own native dialog).
//
// Render it inside the phone frame. It covers the frame with a dimmed overlay.
//
//   <AlertDialog
//     title="Warning"
//     message="..."
//     actions={[{ label: 'OK', onClick: close }]}
//   />
//
// actions: [{ label, onClick, disabled? }] — shown top to bottom in the order given.
//
// To ask for text, pass `input` ({ placeholder }) and `onSubmit`. The first
// action then reads the field: give it `submit: true` and it is disabled
// until something is typed, and Enter triggers it. Its onClick receives the
// trimmed text.
//
//   <AlertDialog
//     title="Name your document"
//     input={{ placeholder: 'Document name' }}
//     actions={[{ label: 'OK', submit: true, onClick: name => save(name) },
//               { label: 'Cancel', onClick: cancel }]}
//   />

export default function AlertDialog({ title, message, input, actions = [], onDismiss }) {
  const [text, setText] = useState('')
  const trimmed = text.trim()
  const submitAction = actions.find(a => a.submit)
  const canSubmit = trimmed.length > 0

  return (
    <div className="alert-overlay" onClick={onDismiss}>
      <div className="alert-dialog" role="alertdialog" aria-labelledby="alert-title" onClick={e => e.stopPropagation()}>
        <div className="alert-text">
          <h3 id="alert-title" className="alert-title">{title}</h3>
          {message && <p className="alert-message">{message}</p>}
        </div>
        {input && (
          <input
            className="alert-input"
            type="text"
            placeholder={input.placeholder}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && submitAction && canSubmit) submitAction.onClick(trimmed) }}
            autoFocus
          />
        )}
        <div className="alert-actions">
          {actions.map(a => (
            <button
              key={a.label}
              type="button"
              className="alert-btn"
              disabled={a.disabled || (a.submit && !canSubmit)}
              onClick={() => (a.submit ? a.onClick(trimmed) : a.onClick?.())}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
