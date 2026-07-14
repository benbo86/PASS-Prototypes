import { useState } from 'react'
import PhoneFrame from '../../../Components/PhoneFrame'
import StatusBar from '../../../Components/StatusBar'
import AppHeader from '../../../Components/AppHeader'
import AppNav from '../../../Components/AppNav'
import ScreenSlider from '../../../Components/ScreenSlider'

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)

function HomeScreen({ onOpenDetail }) {
  return (
    <>
      <StatusBar />
      <AppHeader title="Home" />
      <div className="shell-demo-body">
        <p>Primary screen — StatusBar + AppHeader (no back button). AppNav sits outside the slider, fixed at the bottom.</p>
        <button className="round-btn primary-btn" onClick={onOpenDetail}>Open detail screen</button>
      </div>
    </>
  )
}

function DetailScreen({ onBack }) {
  return (
    <>
      <StatusBar />
      <AppHeader title="Detail" onBack={onBack} />
      <div className="shell-demo-body">
        <p>Secondary screen — same shell, AppHeader now shows a back button. ScreenSlider handles the slide transition between the two; AppNav stays put.</p>
      </div>
    </>
  )
}

export default function App() {
  const [detailOpen, setDetailOpen] = useState(false)

  return (
    <div className="mobile-shell-demo">
      <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>
      <div className="mobile-shell-demo-content">
        <h1>Mobile Shell</h1>
        <p>PhoneFrame + StatusBar + AppHeader + AppNav + ScreenSlider — the five pieces every mobile prototype is built from, always used together rather than standalone.</p>
      </div>
      <PhoneFrame>
        <div className="screen">
          <ScreenSlider
            secondaryActive={detailOpen}
            primary={<HomeScreen onOpenDetail={() => setDetailOpen(true)} />}
            secondary={<DetailScreen onBack={() => setDetailOpen(false)} />}
          />
        </div>
        <AppNav activeTab="bookings" />
      </PhoneFrame>
    </div>
  )
}
