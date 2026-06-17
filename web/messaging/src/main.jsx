import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../../Styles/colors.css'
import '../../../Styles/main.css'
import './messages.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
