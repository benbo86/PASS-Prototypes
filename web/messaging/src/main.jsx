import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../../Styles/colors.css'
import '../../../Styles/main.css'
import '../../../Styles/side-nav.css'
import '../../../Styles/top-nav.css'
import '../../../Styles/filter-dropdown.css'
import '../../../Styles/dev-mode.css'
import '../../../Styles/dev-comments.css'
import './messages.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
