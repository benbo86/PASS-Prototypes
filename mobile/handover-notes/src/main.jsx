import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '../../../Styles/colors.css'
import '../../../Styles/main.css'
import '../../../Styles/mobile.css'
import '../../../Styles/dev-toolbar.css'
import '../../../Styles/dev-mode.css'
import '../../../Styles/dev-comments.css'
import '../../../Styles/dev-edit.css'
import '../../../Styles/wireframe-access.css'
// Reuses Tag In/Out's own screens (Bookings, Visit, Tag), so it loads that
// prototype's stylesheet too. handover.css only holds what's new here.
import '../../tag-in-out/src/tag-in-out.css'
import './handover.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
