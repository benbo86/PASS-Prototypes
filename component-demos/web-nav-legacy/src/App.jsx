import WebNav from '../../../Components/WebNav'

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)

export default function App() {
  return (
    <div className="demo-page">
      <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>
      <WebNav activePage="customers" unreadMessages={3} />
      <div className="demo-content">
        <h1>Top Nav (legacy)</h1>
        <p>The original purple top nav — logo, primary links, and a right-hand action cluster (support, journal, messages, PASSgenius, and a More menu for Office/Log out). Superseded by SideNav + TopNav; kept here for reference only.</p>
      </div>
    </div>
  )
}
