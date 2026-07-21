import { useState, useRef } from 'react'
import AppNav from '../../../Components/AppNav'
import PhoneFrame from '../../../Components/PhoneFrame'
import ScreenSlider from '../../../Components/ScreenSlider'
import AccountScreen from '../../../Components/AccountScreen'
import MileageScreen from '../../../Components/MileageScreen'
import DevMode from '../../../Components/DevMode'
import { UNREAD_MESSAGES_COUNT, hasReadMessages } from '../../../Components/messagesData'

const ChevronLeftIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)

/* ── App ─────────────────────────────────────────────────────────── */
/* Embeds AccountScreen (from mobile/account) alongside MileageScreen via a
   local ScreenSlider — mirrors mobile/messaging's Account + Inbox/Thread
   structure, so this transition is a genuine local slide, not a faked
   cross-page one. Defaults to Account (the real entry point), but skips
   straight to Mileage Pay when arriving via ?screen=mileage — e.g. a
   "Mileage Pay" tap from mobile/account, which already showed Account once. */

export default function App() {
  const [outerView, setOuterView] = useState(() =>
    new URLSearchParams(window.location.search).get('screen') === 'mileage' ? 'mileage' : 'account'
  )
  // mobile/account and mobile/mileage-pay are separate pages, so the
  // "Mileage Pay" tap has no shared DOM to slide within — this plays a
  // matching entrance once, only for that specific arrival (never a direct
  // visit or bottom-nav switch).
  const [entering] = useState(() =>
    new URLSearchParams(window.location.search).get('transition') === '1'
  )
  const [filter, setFilter] = useState('payPeriod')
  const [messagesUnread] = useState(() => hasReadMessages() ? 0 : UNREAD_MESSAGES_COUNT)
  const phoneFrameRef = useRef(null)

  return (
    <>
      <a href="../../" className="back-link"><ChevronLeftIcon size={16} /> Prototypes</a>
      <PhoneFrame ref={phoneFrameRef}>
        <div className={`screen-area page-slide ${entering ? 'slide-entering' : ''}`}>
          <ScreenSlider
            secondaryActive={outerView === 'mileage'}
            primary={
              <AccountScreen
                hideNav
                onGoToMessages={() => { window.location.href = '../messaging/?screen=inbox&transition=1' }}
                onGoToMileage={() => setOuterView('mileage')}
                messagesUnread={messagesUnread}
              />
            }
            secondary={
              <MileageScreen filter={filter} setFilter={setFilter} onBack={() => setOuterView('account')} />
            }
          />
        </div>
        <AppNav activeTab="account" messagesUnread={messagesUnread} links={{ notifications: '../notifications/' }} />
      </PhoneFrame>
      <DevMode containerRef={phoneFrameRef} />
    </>
  )
}
