import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../../Styles/colors.css'
import '../../../Styles/main.css'
import '../../../Styles/side-nav.css'
import '../../../Styles/top-nav.css'
import './contactable-staff.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
