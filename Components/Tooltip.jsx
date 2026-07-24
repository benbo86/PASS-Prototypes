// wrapClassName is optional — lets a consumer add its own positioning
// (e.g. the dev toolbar's fixed-position toggles, which need position:fixed
// on the wrapper itself, not just the button inside it) without changing
// this component's own default inline-flex, content-sized behavior for
// every other existing usage.
//
// placement defaults to 'top' (the original, only behavior) — pass 'bottom'
// for a trigger with no room above it (e.g. the dev toolbar, pinned to
// top:20px — the default placement would render partly off-screen above
// the viewport there).
export default function Tooltip({ children, text, wrapClassName, placement = 'top' }) {
  const wrapClasses = ['tooltip-wrap', placement === 'bottom' ? 'tooltip-below' : null, wrapClassName]
    .filter(Boolean)
    .join(' ')
  return (
    <div className={wrapClasses}>
      {children}
      <div className="tooltip">{text}</div>
    </div>
  )
}
