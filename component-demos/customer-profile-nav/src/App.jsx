import CustomerProfileNav from '../../../Components/CustomerProfileNav'

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)

export default function App() {
  return (
    <div className="demo-page">
      <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>
      <CustomerProfileNav activeTab="Documents" />
      <div className="demo-content">
        <h1>Customer Profile Nav</h1>
        <p>Sticky context bar (customer summary + primary tabs) used across the customer-profile prototypes. Tab hrefs are relative to customer-profile/*, so clicking MAR Chart/Timeline/Documents from here won't resolve — this demo is for previewing appearance, not navigation.</p>
      </div>
    </div>
  )
}
