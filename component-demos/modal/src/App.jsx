import { useState } from 'react'
import Modal from '../../../Components/Modal'

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)

export default function App() {
  const [open, setOpen] = useState(false)

  return (
    <div className="demo-page">
      <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>
      <div className="demo-content">
        <h1>Modal</h1>
        <p>A centered overlay dialog with a title, close button, and scrim — closes on background click.</p>
        <button className="round-btn primary-btn" onClick={() => setOpen(true)}>Open modal</button>
      </div>

      {open && (
        <Modal title="Modal title" onClose={() => setOpen(false)}>
          <p>This is the modal body content — pass any children here.</p>
        </Modal>
      )}
    </div>
  )
}
