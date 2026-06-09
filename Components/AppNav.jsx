const BookingsNavIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M15.4946 10C18.5352 10 21 12.4631 21 15.5C21 18.5369 18.5352 21 15.4946 21C12.4596 21 10 18.537 10 15.5C10 12.463 12.4596 10 15.4946 10ZM15.4946 11.4395C13.2551 11.4395 11.4395 13.2575 11.4395 15.5C11.4395 17.7425 13.2551 19.5605 15.4946 19.5605C17.74 19.5605 19.5605 17.742 19.5605 15.5C19.5605 13.258 17.74 11.4395 15.4946 11.4395ZM15 2C15.5523 2 16 2.44772 16 3V4H17C18.1046 4 19 4.89543 19 6V7.999L5.5 8C5.22386 8 5 8.22386 5 8.5V16.5C5 16.7761 5.22386 17 5.5 17L8.37533 17.0009C8.47788 17.7018 8.673 18.3726 8.94787 19.0005L5 19C3.89543 19 3 18.1046 3 17V6C3 4.89543 3.89543 4 5 4H6V3C6 2.44772 6.44772 2 7 2C7.55228 2 8 2.44772 8 3V4H14V3C14 2.44772 14.4477 2 15 2ZM15.5 12.3901C15.8663 12.3901 16.173 12.6651 16.2155 13.0332L16.2198 13.1099L16.2187 15.7562L17.4815 16.5032C17.7653 16.6709 17.8942 17.0058 17.8073 17.3179L17.7703 17.4208L17.7349 17.489C17.5485 17.8044 17.1558 17.9285 16.8172 17.7778L16.7491 17.7424L15.1338 16.7878C14.9431 16.6751 14.8153 16.4812 14.7857 16.2546L14.7802 16.1682V13.1099C14.7802 12.7124 15.1025 12.3901 15.5 12.3901Z"/>
  </svg>
)

const UsersNavIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.3318 13.0337C13.9829 13.3315 14.7011 13.5008 15.4602 13.5008C16.1244 13.5008 16.7595 13.3711 17.3421 13.1392L17.5885 13.0337H18.0761C20.1787 13.0337 21.8963 15.1612 21.9955 17.2671L22 17.4584V18.1721C22 18.9003 21.444 19.4991 20.7335 19.5671L20.5986 19.5735H10.3218C9.5936 19.5735 8.99474 19.0174 8.9268 18.307L8.92038 18.1721V17.4584C8.92038 15.3558 10.5761 13.1664 12.6542 13.0395L12.8443 13.0337H13.3318ZM15.4602 4.00448C17.5243 4.00448 19.1972 5.67738 19.1972 7.74151C19.1972 9.74113 17.6272 11.3736 15.6525 11.4737L15.4602 11.4785C13.3961 11.4785 11.7232 9.80564 11.7232 7.74151C11.7232 5.74189 13.2931 4.10941 15.2679 4.00934L15.4602 4.00448Z"/>
  </svg>
)

const MessagesNavIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM19 18H5C4.45 18 4 17.55 4 17V8L10.94 12.34C11.59 12.75 12.41 12.75 13.06 12.34L20 8V17C20 17.55 19.55 18 19 18ZM12 11L4 6H20L12 11Z"/>
  </svg>
)

function NavItem({ id, activeTab, href, children }) {
  const isActive = activeTab === id
  const className = `nav-item${isActive ? ' active' : ''}`
  if (href && !isActive) {
    return <a className={className} href={href}>{children}</a>
  }
  return <button className={className}>{children}</button>
}

export default function AppNav({ activeTab = 'messages', totalUnread = 0, links = {} }) {
  return (
    <div className="app-nav">
      <NavItem id="bookings" activeTab={activeTab} href={links.bookings}>
        <BookingsNavIcon />
        <span className="nav-label">Bookings</span>
      </NavItem>
      <NavItem id="users" activeTab={activeTab} href={links.users}>
        <UsersNavIcon />
        <span className="nav-label">Users</span>
      </NavItem>
      <NavItem id="messages" activeTab={activeTab} href={links.messages}>
        <div className="nav-messages-wrap">
          <MessagesNavIcon />
          {totalUnread > 0 && <span className="nav-badge">{totalUnread}</span>}
        </div>
        <span className="nav-label">Messages</span>
      </NavItem>
      <NavItem id="account" activeTab={activeTab} href={links.account}>
        <div className="nav-avatar">AJ</div>
      </NavItem>
    </div>
  )
}
