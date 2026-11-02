import { useRef, useState } from 'react'
import StatusBar from '../../../Components/StatusBar'
import AppNav from '../../../Components/AppNav'
import CustomerList from '../../../Components/CustomerList'
import DevToolbar from '../../../Components/DevToolbar'
import DevMode from '../../../Components/DevMode'
import DevComments from '../../../Components/DevComments'
import DevEdit from '../../../Components/DevEdit'
import WireframeToggle from '../../../Components/WireframeToggle'
import AuditCapture from '../../../Components/AuditCapture'

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
  </svg>
)

// Icons/Filters.svg
const FiltersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15,17 C15,16.4477153 14.5522847,16 14,16 L10,16 C9.44771525,16 9,16.4477153 9,17 C9,17.5522847 9.44771525,18 10,18 L14,18 C14.5522847,18 15,17.5522847 15,17 Z M18,12 C18,11.4477153 17.5522847,11 17,11 L7,11 C6.44771525,11 6,11.4477153 6,12 C6,12.5522847 6.44771525,13 7,13 L17,13 C17.5522847,13 18,12.5522847 18,12 Z M4,8 L20,8 C20.5522847,8 21,7.55228475 21,7 C21,6.44771525 20.5522847,6 20,6 L4,6 C3.44771525,6 3,6.44771525 3,7 C3,7.55228475 3.44771525,8 4,8 Z" />
  </svg>
)

// Icons/Search.svg
const SearchIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M10.8488372,18.6872093 C12.627907,18.6872093 14.2813953,18.0802326 15.6,17.0755814 L19.2209302,20.6965116 C19.4302326,20.905814 19.7023256,21.0104651 19.9534884,21.0104651 C20.2046512,21.0104651 20.4976744,20.905814 20.6860465,20.6965116 C21.1046512,20.277907 21.1046512,19.6290698 20.6860465,19.2104651 L17.0860465,15.5895349 C18.0906977,14.2709302 18.6976744,12.6174419 18.6976744,10.8383721 C18.6976744,6.50581395 15.1813953,2.98953488 10.8488372,2.98953488 C6.51627907,2.98953488 3,6.50581395 3,10.8383721 C3,15.1709302 6.51627907,18.6872093 10.8488372,18.6872093 Z M10.8488372,5.08255814 C14.0093023,5.08255814 16.6046512,7.65697674 16.6046512,10.8383721 C16.6046512,14.0197674 14.0093023,16.594186 10.8488372,16.594186 C7.68837209,16.594186 5.09302326,13.9988372 5.09302326,10.8383721 C5.09302326,7.67790698 7.66744186,5.08255814 10.8488372,5.08255814 Z" />
  </svg>
)

// Icons/Close.svg
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <polygon stroke="currentColor" strokeLinejoin="round" points="18 7.2 16.8 6 12 10.8 7.2 6 6 7.2 10.8 12 6 16.8 7.2 18 12 13.2 16.8 18 18 16.8 13.2 12" />
  </svg>
)

export default function App() {
  const pageRef = useRef(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  const closeSearch = () => { setSearchOpen(false); setQuery('') }

  return (
    <>
      <DevToolbar floating>
        <DevEdit containerRef={pageRef} prototypeId={window.location.pathname} />
        <DevMode containerRef={pageRef} />
        <DevComments containerRef={pageRef} prototypeId={window.location.pathname} />
        <WireframeToggle />
        <AuditCapture containerRef={pageRef} />
      </DevToolbar>
      <div className="phone-wrap">
        <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>
        <div className="phone-frame" ref={pageRef}>
          <div className="screen-area">
            <div className="screen">
              <StatusBar />
              <div className="app-header customers-header">
                {searchOpen ? (
                  <div className="customers-search">
                    <SearchIcon size={20} />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search customers"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                    />
                    <button className="app-header-action" aria-label="Close search" onClick={closeSearch}><CloseIcon /></button>
                  </div>
                ) : (
                  <>
                    {/* Filters isn't designed yet — the button is there to match Figma. */}
                    <button className="app-header-action" aria-label="Filter customers"><FiltersIcon /></button>
                    <span className="app-header-title">Customers</span>
                    <button className="app-header-action" aria-label="Search customers" onClick={() => setSearchOpen(true)}><SearchIcon /></button>
                  </>
                )}
              </div>
              <CustomerList query={query} />
              <AppNav
                activeTab="customers"
                links={{ bookings: '../tag-in-out/', notifications: '../notifications/', account: '../account/' }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
