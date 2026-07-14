import OfficeNav from '../../../Components/OfficeNav'

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)

export default function App() {
  return (
    <div className="demo-page">
      <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>
      <OfficeNav active="details" />
      <div className="demo-content">
        <h1>Office Nav</h1>
        <p>Horizontal tab bar used across the office/roster prototypes. Tab hrefs are relative to office/*, so this demo is for previewing appearance rather than navigation.</p>
      </div>
    </div>
  )
}
