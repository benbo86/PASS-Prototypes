import SideNav from '../../../Components/SideNav'
import TopNav from '../../../Components/TopNav'

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)

export default function App() {
  return (
    <div className="top-nav-demo">
      <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>
      <SideNav activeItem="customers" />
      <div className="page-body">
        <TopNav onLogout={() => alert('Log out clicked')} />
        <div className="top-nav-demo-content">
          <h1>Customers</h1>
          <p>Placeholder content area — the bar above is the new TopNav, sitting alongside the SideNav.</p>
        </div>
      </div>
    </div>
  )
}
