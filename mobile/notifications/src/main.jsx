import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '../../../Styles/colors.css'
import '../../../Styles/main.css'
import '../../../Styles/mobile.css'
import '../../../Styles/dev-mode.css'
import '../../../Styles/dev-comments.css'
import './notifications.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
