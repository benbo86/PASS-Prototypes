import { useState } from 'react'
import Tooltip from './Tooltip'

const AuditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M20 20l-4.35-4.35" />
  </svg>
)

// 6th member of the dev toolbar — a one-shot "capture this screen" button,
// not an in-page mode like Dev Mode/Comments/Edit and not a doorway like
// Wireframe access. Clicking it doesn't review or judge anything itself —
// it bundles the prototype's own source files plus a snapshot of what's
// currently rendered into one file under audit-captures/ (gitignored, see
// auditPlugin.js), for a human to hand to Claude afterward to actually do
// the "does this make sense / what does this actually do" questioning.
// That reasoning genuinely can't be automated by this component or its
// backing endpoint — it needs an LLM reading the result, not a rule check.
//
// Dev-only: the /__audit/capture endpoint (auditPlugin.js) only exists
// under `vite dev`, same reasoning as Dev Edit's Apply-to-file button and
// the Wireframe tool's local save/list/delete endpoints. Renders as a
// child of DevToolbar, so it needs no containerRef-independent exemption
// marker of its own — DevToolbar's existing [data-devtoolbar-ui] ancestor
// already exempts it from every other tool's capture-phase click guard,
// the same way it does for the other three in-toolbar tools.
export default function AuditCapture({ containerRef }) {
  const [status, setStatus] = useState('idle') // idle | capturing | done | error
  const [message, setMessage] = useState('')

  async function handleCapture() {
    if (status === 'capturing') return
    if (!containerRef?.current) {
      setStatus('error')
      setMessage('No container to capture')
      setTimeout(() => setStatus('idle'), 3000)
      return
    }
    setStatus('capturing')
    try {
      const res = await fetch('/__audit/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pathname: window.location.pathname,
          search: window.location.search,
          domSnapshot: containerRef.current.outerHTML,
        }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || 'Capture failed')
      setStatus('done')
      setMessage(data.file)
    } catch (err) {
      setStatus('error')
      setMessage(err.message)
    } finally {
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  if (!import.meta.env.DEV) return null

  return (
    <div className="audit-capture-wrap">
      <Tooltip text="Audit — capture this screen for review" wrapClassName="audit-toggle-wrap" placement="bottom">
        <button
          className="dev-toolbar-icon-btn audit-toggle"
          onClick={handleCapture}
          aria-label="Capture this screen for audit"
        >
          <AuditIcon />
        </button>
      </Tooltip>
      {status !== 'idle' && (
        <div className={`audit-toast audit-toast--${status}`}>
          {status === 'capturing' && 'Capturing…'}
          {status === 'done' && `Captured → ${message}`}
          {status === 'error' && `Failed: ${message}`}
        </div>
      )}
    </div>
  )
}
