import React from 'react'
import ReactDOM from 'react-dom/client'
import EventPanel from './EventPanel'
import '../../../Styles/colors.css'
import '../../../Styles/main.css'
import './EventPanel.css'
import '../../../Styles/dev-mode.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <EventPanel />
  </React.StrictMode>
)
