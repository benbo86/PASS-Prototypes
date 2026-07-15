import { useState, useRef, useEffect } from 'react'
import StatusBar from './StatusBar'
import AppHeader from './AppHeader'

// Extracted from mobile/mileage-pay so it can be embedded locally alongside
// AccountScreen via ScreenSlider (mobile/mileage-pay/App.jsx) — the same
// pattern mobile/messaging uses for AccountScreen + Inbox/Thread, so the
// Account <-> Mileage Pay transition is a genuine local slide, not a faked
// cross-page one.

const ChevronDownIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
  </svg>
)

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const todayDate = new Date()
const todayStr = `${todayDate.getDate()} ${MONTHS[todayDate.getMonth()]} ${todayDate.getFullYear()}`
const todayFullStr = `${DAYS[todayDate.getDay()]} ${todayStr}`

const STATES = {
  payPeriod: {
    label: 'Pay period to date',
    date: `1 Jun – ${todayStr}`,
    miles: '39.2 mi',
    pay: '£47.80',
    visits: [
      { name: 'Margaret Thompson', datetime: 'Mon 2 Jun · 09:00–09:45', pay: '£5.20', miles: '4.2 mi', status: 'complete',  rate: '£0.45/mi' },
      { name: 'George Evans',      datetime: 'Mon 2 Jun · 14:30–15:30', pay: '£7.40', miles: '6.1 mi', status: 'complete',  rate: '£0.45/mi' },
      { name: 'Dorothy Williams',  datetime: 'Tue 3 Jun · 10:00–11:00', pay: '£8.60', miles: '7.1 mi', status: 'cancelled', rate: '£0.45/mi' },
      { name: 'Harold Clarke',     datetime: 'Tue 3 Jun · 15:00–16:00', pay: '£6.20', miles: '5.1 mi', status: 'complete',  rate: '£0.45/mi' },
      { name: 'Edith Morrison',    datetime: 'Wed 4 Jun · 09:30–10:30', pay: '£8.40', miles: '6.9 mi', status: 'missed',    rate: '£0.45/mi' },
      { name: 'Margaret Thompson', datetime: 'Thu 5 Jun · 14:00–14:45', pay: '£5.20', miles: '4.2 mi', status: 'complete',  rate: '£0.45/mi' },
    ],
  },
  today: {
    label: 'Today',
    date: todayFullStr,
    miles: '12.7 mi',
    pay: '£15.40',
    visits: [
      { name: 'George Evans',     datetime: 'Today · 09:00–10:00', pay: '£6.80', miles: '5.6 mi', status: 'complete', rate: '£0.45/mi' },
      { name: 'Dorothy Williams', datetime: 'Today · 14:00–15:00', pay: '£8.60', miles: '7.1 mi', status: 'complete', rate: '£0.45/mi' },
    ],
  },
  lastWeek: {
    label: 'Last week',
    date: '26 May – 1 Jun 2026',
    miles: '16.2 mi',
    pay: '£19.80',
    visits: [
      { name: 'Harold Clarke',     datetime: 'Mon 26 May · 09:00–10:00', pay: '£6.20', miles: '5.1 mi', status: 'complete', rate: '£0.45/mi' },
      { name: 'Edith Morrison',    datetime: 'Wed 28 May · 10:00–11:00', pay: '£8.40', miles: '6.9 mi', status: 'missed',   rate: '£0.45/mi' },
      { name: 'Margaret Thompson', datetime: 'Thu 29 May · 14:00–14:45', pay: '£5.20', miles: '4.2 mi', status: 'complete', rate: '£0.45/mi' },
    ],
  },
}

const PILLS = [
  { id: 'payPeriod', label: 'Pay period to date' },
  { id: 'today',     label: 'Today' },
  { id: 'lastWeek',  label: 'Last week' },
]

export default function MileageScreen({ filter, setFilter, onBack }) {
  const state = STATES[filter]
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!showDropdown) return
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target)) setShowDropdown(false)
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [showDropdown])

  return (
    <>
      <StatusBar />
      <AppHeader title="Mileage Pay" onBack={onBack} />

      <div className="summary-card">
        <div className="period-area" ref={dropdownRef}>
          <div className="period-selector-text">
            <span className="summary-label">{state.label}</span>
            <span className="summary-date">{state.date}</span>
          </div>
          {/* Filter dropdown — hidden; restore by replacing the div above with:
          <button className="period-selector" onClick={() => setShowDropdown(s => !s)}>
            <div className="period-selector-text">
              <span className="summary-label">{state.label}</span>
              <span className="summary-date">{state.date}</span>
            </div>
            <ChevronDownIcon open={showDropdown} />
          </button>
          {showDropdown && (
            <div className="period-dropdown">
              {PILLS.map(p => (
                <button
                  key={p.id}
                  className={`period-option${filter === p.id ? ' active' : ''}`}
                  onClick={() => { setFilter(p.id); setShowDropdown(false) }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )} */}
        </div>
        <div className="summary-divider" />
        <div className="summary-stats">
          <div className="summary-stat">
            <div className="summary-stat-label">Total miles</div>
            <div className="summary-stat-value">{state.miles}</div>
          </div>
          <div className="summary-stat-sep" />
          <div className="summary-stat" style={{ paddingLeft: 24 }}>
            <div className="summary-stat-label">Total mileage pay</div>
            <div className="summary-stat-value pay">{state.pay}</div>
          </div>
        </div>
      </div>

      <div className="visit-list">
        {state.visits.map((v, i) => (
          <div key={i} className="visit-row">
            <div className="visit-left">
              <div className="visit-name">{v.name}</div>
              <div className="visit-datetime">{v.datetime}</div>
              <div className={`visit-status visit-status-${v.status}`}>{v.status.charAt(0).toUpperCase() + v.status.slice(1)}</div>
            </div>
            <div className="visit-right">
              <div className="visit-pay">{v.pay}</div>
              <div className="visit-miles">{v.miles}</div>
              <div className="visit-rate">{v.rate}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
