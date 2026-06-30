import WebNav from '../../../Components/WebNav'
import OfficeNav from '../../../Components/OfficeNav'

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)

export default function App() {
  return (
    <div className="office-page">
      <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>
      <WebNav activePage="office" />
      <OfficeNav active="details" />
      <main className="office-content">
        <div className="office-placeholder-card">
          <h1>Details</h1>
          <p>No prototype built yet — placeholder page.</p>
        </div>
      </main>
    </div>
  )
}
