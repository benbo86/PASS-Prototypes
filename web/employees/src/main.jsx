import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../../Styles/colors.css'
import '../../../Styles/main.css'
import '../../../Styles/legacy.css'
import '../../../Styles/legacy-employee-card.css'
import './employees.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
