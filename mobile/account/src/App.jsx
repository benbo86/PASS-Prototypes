import { useState, useRef } from 'react'
import PhoneFrame from '../../../Components/PhoneFrame'
import AccountScreen from '../../../Components/AccountScreen'
import DevMode from '../../../Components/DevMode'
import { UNREAD_MESSAGES_COUNT, hasReadMessages } from '../../../Components/messagesData'

const ChevronLeftIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)

export default function App() {
  const [messagesUnread] = useState(() => hasReadMessages() ? 0 : UNREAD_MESSAGES_COUNT)
  const phoneFrameRef = useRef(null)

  return (
    <>
      <a href="../../" className="back-link"><ChevronLeftIcon size={16} /> Prototypes</a>
      <PhoneFrame ref={phoneFrameRef}>
        <div className="screen">
          <AccountScreen
            // Both destinations embed Account locally themselves (see
            // Components/AccountScreen.jsx usage in mobile/messaging and
            // mobile/mileage-pay), so their own "back" is a local slide —
            // this page is never itself a transition destination.
            onGoToMessages={() => { window.location.href = '../messaging/?screen=inbox&transition=1' }}
            onGoToMileage={() => { window.location.href = '../mileage-pay/?screen=mileage&transition=1' }}
            messagesUnread={messagesUnread}
          />
        </div>
      </PhoneFrame>
      <DevMode containerRef={phoneFrameRef} />
    </>
  )
}
