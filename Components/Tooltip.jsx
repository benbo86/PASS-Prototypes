export default function Tooltip({ children, text }) {
  return (
    <div className="tooltip-wrap">
      {children}
      <div className="tooltip">{text}</div>
    </div>
  )
}
