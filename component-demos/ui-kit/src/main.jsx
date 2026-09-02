import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '../../../Styles/colors.css'
import '../../../Styles/main.css'
import '../../../Styles/filter-dropdown.css'
import '../../../Styles/mobile-account.css'
import '../../../Styles/mobile.css'
// Needed only for the Task chips section below — provides the fa-solid/
// fa-regular @font-face rules its icons render through (same mechanism
// customer-profile/communications and customer-profile/timeline use).
import '../../../Styles/legacy.css'
import '../../../Styles/dev-toolbar.css'
import '../../../Styles/dev-mode.css'
import '../../../Styles/dev-comments.css'
import '../../../Styles/dev-edit.css'
import '../../../Styles/wireframe-access.css'
import './demo.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
