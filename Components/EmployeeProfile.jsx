import '../Styles/employee-profile.css'
import StatusBar from './StatusBar'
import { FilesSheet } from './FilesScreen'
import { EMPLOYEE_DOCUMENTS, EMPLOYEE_FILES, EMPLOYEE_FILE_FOLDERS } from './employeeProfileData'

// Mobile employee profile (live app, Care Manager and above): the employee's
// card and a flat Documents list. Built from a screenshot of the live app.
// Files (AIOP-25397) is a row at the top of the Documents list that opens the
// shared read-only Files screen.
//
//   employee     an entry from Components/employeesData.js
//   onBack       back arrow
//   filesOpen / onOpenFiles / onCloseFiles   Files sheet state, owned by the page
//   offline      show the Files offline state

// Icons/Arrow Left.svg
const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.71969 12.6255L4.73999 12.6499C4.74414 12.6548 4.74834 12.6596 4.75259 12.6644L9.75259 18.2894C10.1195 18.7022 10.7516 18.7393 11.1644 18.3724C11.5771 18.0055 11.6143 17.3734 11.2474 16.9606L7.727 13L18.5 13C19.0523 13 19.5 12.5523 19.5 12C19.5 11.4477 19.0523 11 18.5 11L7.727 11L11.2474 7.03937C11.5861 6.65834 11.5805 6.09046 11.2529 5.71676L11.1644 5.6276C10.7516 5.26068 10.1195 5.29786 9.75259 5.71065L4.75259 11.3356L4.7402 11.3498C4.73323 11.358 4.72639 11.366 4.71969 11.3746L4.75259 11.3356C4.72265 11.3693 4.69538 11.4045 4.67076 11.441C4.65284 11.4675 4.63629 11.4947 4.62104 11.5227C4.61696 11.5303 4.61304 11.5377 4.60922 11.5452C4.59534 11.5722 4.58258 11.6003 4.5711 11.629C4.56781 11.6375 4.5647 11.6456 4.56169 11.6537C4.52179 11.7614 4.5 11.8782 4.5 12C4.5 12.1218 4.52179 12.2386 4.56167 12.3465C4.5647 12.3544 4.56781 12.3625 4.57103 12.3706C4.58258 12.3998 4.59534 12.4278 4.60932 12.4551C4.61304 12.4623 4.61696 12.4697 4.62098 12.4771C4.63629 12.5053 4.65284 12.5325 4.67061 12.5589L4.71969 12.6255Z" />
  </svg>
)
// Icons/Phone.svg
const PhoneIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24c1.12.37 2.33.57 3.57.57c.55 0 1 .45 1 1V20c0 .55-.45 1-1 1c-9.39 0-17-7.61-17-17c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1c0 1.25.2 2.45.57 3.57c.11.35.03.74-.25 1.02z" />
  </svg>
)
// Icons/Messages.svg
const MessageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
  </svg>
)
// Icons/Email.svg
const EmailIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM19 18H5C4.45 18 4 17.55 4 17V8L10.94 12.34C11.59 12.75 12.41 12.75 13.06 12.34L20 8V17C20 17.55 19.55 18 19 18ZM12 11L4 6H20L12 11Z" />
  </svg>
)
// Icons/Duplicate.svg
const DocumentStackIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
  </svg>
)
const FolderIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
  </svg>
)
const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
  </svg>
)
const CompleteTick = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" aria-label="Complete">
    <circle cx="14" cy="14" r="14" fill="#2f9e2f" />
    <path d="M8 14.5l4 4 8-8.5" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const AddDocumentIcon = () => (
  <svg width="24" height="24" viewBox="-5.07 -3 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M8.10373 0C8.60602 0 9.08992 0.189001 9.45925 0.529434L13.22 3.99599C13.6308 4.37464 13.8645 4.90786 13.8645 5.46655V14.6896C13.8645 16.5169 12.3773 17.9986 10.5417 18H3.32534C1.48881 18 0 16.5179 0 14.6896V3.31042C0 1.48212 1.48881 0 3.32534 0H8.10373ZM7.94685 1.98153H3.41796C2.58954 1.98153 1.91796 2.6531 1.91796 3.48153V14.5127C1.91796 15.3411 2.58954 16.0127 3.41796 16.0127H10.4075C11.2359 16.0127 11.9075 15.3411 11.9075 14.5127V6.06202H9.73742C8.74852 6.06202 7.94685 5.26395 7.94685 4.27948V1.98153ZM6.88131 10.5C7.43359 10.5 7.88131 10.9477 7.88131 11.5C7.88131 12.0523 7.43359 12.5 6.88131 12.5H3.88131C3.32902 12.5 2.88131 12.0523 2.88131 11.5C2.88131 10.9477 3.32902 10.5 3.88131 10.5H6.88131ZM9.88131 7.5C10.4336 7.5 10.8813 7.94772 10.8813 8.5C10.8813 9.05228 10.4336 9.5 9.88131 9.5H3.88131C3.32902 9.5 2.88131 9.05228 2.88131 8.5C2.88131 7.94772 3.32902 7.5 3.88131 7.5H9.88131Z" />
  </svg>
)
// Icons/Avatar Placeholder.svg
const AvatarPlaceholder = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="12" fill="#BDBDBD" />
    <circle cx="12" cy="8.4" r="3.8" fill="#ffffff" />
    <ellipse cx="12" cy="17.4" rx="6.6" ry="3.8" fill="#ffffff" />
  </svg>
)

export default function EmployeeProfile({ employee, onBack, filesOpen, onOpenFiles, onCloseFiles, offline = false }) {
  if (!employee) return <div className="employee-profile" />
  return (
    <div className="employee-profile">
      <StatusBar />
      <div className="app-header">
        <button className="app-header-back" onClick={onBack} aria-label="Back to employees"><ArrowLeftIcon /></button>
        <span className="app-header-title">{employee.firstName} {employee.lastName}</span>
        <div style={{ width: 36 }} />
      </div>

      <div className="employee-profile-body">
        <div className="employee-profile-card">
          <div className="employee-profile-avatar"><AvatarPlaceholder /></div>
          <div className="employee-profile-card-text">
            <span className="employee-profile-role-label">ROLE</span>
            <span className="employee-profile-role">{employee.role}</span>
            <div className="employee-profile-actions">
              <button type="button" aria-label="Call"><PhoneIcon /></button>
              <button type="button" aria-label="Message"><MessageIcon /></button>
              <button type="button" aria-label="Email"><EmailIcon /></button>
            </div>
          </div>
        </div>

        <div className="employee-profile-section-label">Documents</div>
        <div className="employee-profile-list">
          <button type="button" className="employee-profile-files-row" onClick={onOpenFiles}>
            <span className="employee-profile-row-icon"><FolderIcon /></span>
            <span className="employee-profile-row-text">
              <span className="employee-profile-row-title">Files</span>
              <span className="employee-profile-row-sub">Uploaded on the web</span>
            </span>
            <span className="employee-profile-chevron"><ChevronRightIcon /></span>
          </button>
          {EMPLOYEE_DOCUMENTS.map(d => (
            <div key={d.id} className="employee-profile-doc">
              <span className="employee-profile-row-icon"><DocumentStackIcon /></span>
              <span className="employee-profile-row-text">
                <span className="employee-profile-row-title">{d.title}</span>
                <span className="employee-profile-row-sub">{d.template}</span>
              </span>
              <CompleteTick />
            </div>
          ))}
        </div>
      </div>

      <button type="button" className="employee-profile-fab"><AddDocumentIcon /> ADD DOCUMENT</button>

      <FilesSheet open={filesOpen} files={EMPLOYEE_FILES} folders={EMPLOYEE_FILE_FOLDERS} offline={offline} onClose={onCloseFiles} />
    </div>
  )
}
