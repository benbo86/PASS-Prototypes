import Tooltip from '../../../Components/Tooltip'

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)

export default function App() {
  return (
    <div className="demo-page">
      <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>
      <div className="demo-content">
        <h1>Tooltip</h1>
        <p>Wraps any element and shows a small label above it on hover.</p>
        <div className="demo-row">
          <Tooltip text="This is a tooltip">
            <button className="round-btn secondary-btn">Hover me</button>
          </Tooltip>
          <Tooltip text="Save your changes">
            <button className="round-btn primary-btn">Save</button>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
