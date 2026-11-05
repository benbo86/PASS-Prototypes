import '../Styles/customer-menu.css'
import StatusBar from './StatusBar'
import { LegalFlags, HighRiskBadge } from './LegalFlags'
import visitsIcon from '../Icons/Mobile Uploads/Customer menu/Visits.svg'
import marChartIcon from '../Icons/Mobile Uploads/Customer menu/MAR Chart.svg'
import aboutMeIcon from '../Icons/Mobile Uploads/Customer menu/About me.svg'
import detailsIcon from '../Icons/Mobile Uploads/Customer menu/Details.svg'
import carePackageIcon from '../Icons/Mobile Uploads/Customer menu/Care package.svg'
import communicationIcon from '../Icons/Mobile Uploads/Customer menu/Communication.svg'
import documentsIcon from '../Icons/Mobile Uploads/Customer menu/Documents.svg'
import medicalHistoryIcon from '../Icons/Mobile Uploads/Customer menu/Medical history.svg'
import openPassIcon from '../Icons/Mobile Uploads/Customer menu/OpenPASS.svg'

// Mobile Customer menu (Figma Mobile App 388:4581): the customer's header
// card and a 3×3 grid of sections. Shared so any mobile prototype can open it.
// Only tiles given a link in `links` go anywhere (today: documents); the rest
// are drawn as in the design but aren't built yet.
//
//   customer   an entry from Components/customersData.js
//   onBack     "All customers" arrow
//   links      { documents: '../customer-documents/' }

// Tint colours are the design's own (rgba of each tile's icon colour).
const TILES = [
  { key: 'visits', label: 'Visits', icon: visitsIcon, tint: 'rgba(240, 162, 5, 0.15)' },
  { key: 'mar-chart', label: 'MAR Chart', icon: marChartIcon, tint: 'rgba(242, 109, 109, 0.15)' },
  { key: 'about-me', label: 'About me', icon: aboutMeIcon, tint: 'rgba(148, 170, 75, 0.15)' },
  { key: 'details', label: 'Details', icon: detailsIcon, tint: 'rgba(114, 102, 148, 0.15)' },
  { key: 'care-package', label: 'Care package', icon: carePackageIcon, tint: 'rgba(58, 172, 230, 0.15)' },
  { key: 'communication', label: 'Communication', icon: communicationIcon, tint: 'rgba(193, 123, 85, 0.15)' },
  { key: 'documents', label: 'Documents', icon: documentsIcon, tint: 'rgba(70, 194, 154, 0.15)' },
  { key: 'medical-history', label: 'Medical history', icon: medicalHistoryIcon, tint: 'rgba(177, 115, 199, 0.15)' },
  { key: 'openpass', label: 'OpenPASS', icon: openPassIcon, tint: '#d0d8ef' },
]

// Icons/Arrow Left.svg
const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.71969 12.6255L4.73999 12.6499C4.74414 12.6548 4.74834 12.6596 4.75259 12.6644L9.75259 18.2894C10.1195 18.7022 10.7516 18.7393 11.1644 18.3724C11.5771 18.0055 11.6143 17.3734 11.2474 16.9606L7.727 13L18.5 13C19.0523 13 19.5 12.5523 19.5 12C19.5 11.4477 19.0523 11 18.5 11L7.727 11L11.2474 7.03937C11.5861 6.65834 11.5805 6.09046 11.2529 5.71676L11.1644 5.6276C10.7516 5.26068 10.1195 5.29786 9.75259 5.71065L4.75259 11.3356L4.7402 11.3498C4.73323 11.358 4.72639 11.366 4.71969 11.3746L4.75259 11.3356C4.72265 11.3693 4.69538 11.4045 4.67076 11.441C4.65284 11.4675 4.63629 11.4947 4.62104 11.5227C4.61696 11.5303 4.61304 11.5377 4.60922 11.5452C4.59534 11.5722 4.58258 11.6003 4.5711 11.629C4.56781 11.6375 4.5647 11.6456 4.56169 11.6537C4.52179 11.7614 4.5 11.8782 4.5 12C4.5 12.1218 4.52179 12.2386 4.56167 12.3465C4.5647 12.3544 4.56781 12.3625 4.57103 12.3706C4.58258 12.3998 4.59534 12.4278 4.60932 12.4551C4.61304 12.4623 4.61696 12.4697 4.62098 12.4771C4.63629 12.5053 4.65284 12.5325 4.67061 12.5589L4.71969 12.6255Z" />
  </svg>
)

// Icons/Key.svg
const KeyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
  </svg>
)

// The customer header (status bar, "All customers" bar and the purple card).
// Shown on the menu and on top of every menu section (Documents, ...), so the
// customer is always visible. Back is either a button (onBack) or a link (backHref).
export function CustomerHeader({ customer, onBack, backHref }) {
  const back = backHref
    ? <a className="app-header-back" href={backHref} aria-label="Back to all customers"><ArrowLeftIcon /></a>
    : <button className="app-header-back" onClick={onBack} aria-label="Back to all customers"><ArrowLeftIcon /></button>
  return (
    <>
      <StatusBar />
      <div className="app-header">
        {back}
        <span className="app-header-title customer-menu-title">All customers</span>
        <div style={{ width: 36 }} />
      </div>

      <div className="customer-menu-card">
        <div className="customer-menu-card-text">
          <h2 className="customer-menu-name">{customer.firstName} {customer.lastName}</h2>
          <div className="customer-menu-meta">
            <span>Address</span>
            <span>{customer.address}</span>
          </div>
          <div className="customer-menu-meta">
            <span>Date of Birth</span>
            <span>{customer.dob}</span>
          </div>
          <LegalFlags flags={customer.legalFlags} />
        </div>
        <div className={`customer-menu-photo${customer.highRisk ? ' customer-menu-photo--risk' : ''}`}>
          <img src={customer.photo} alt="" width="67" height="67" />
        </div>
        {customer.highRisk && <div className="customer-menu-risk"><HighRiskBadge /></div>}
        <span className="customer-menu-key"><KeyIcon /></span>
      </div>
    </>
  )
}

export default function CustomerMenu({ customer, onBack, links = {} }) {
  if (!customer) return <div className="screen" />
  return (
    <div className="screen">
      <CustomerHeader customer={customer} onBack={onBack} />

      <div className="customer-menu-grid">
        {TILES.map(t => {
          const href = links[t.key.replace(/-([a-z])/g, (_, c) => c.toUpperCase())]
          const body = (
            <>
              <img src={t.icon} alt="" className="customer-menu-tile-icon" />
              <span className="customer-menu-tile-label">{t.label}</span>
            </>
          )
          return href ? (
            <a key={t.key} className="customer-menu-tile customer-menu-tile--link" style={{ background: t.tint }} href={href}>{body}</a>
          ) : (
            <div key={t.key} className="customer-menu-tile" style={{ background: t.tint }}>{body}</div>
          )
        })}
      </div>
    </div>
  )
}
