import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '../../../Styles/colors.css'
import '../../../Styles/main.css'
import '../../../Styles/legacy.css'
import '../../../Components/invoice-document.css'
import '../../../Styles/side-nav.css'
import '../../../Styles/top-nav.css'
import '../../../Styles/customer-profile-nav.css'
import '../../../Styles/dev-toolbar.css'
import '../../../Styles/dev-mode.css'
import '../../../Styles/dev-comments.css'
import '../../../Styles/dev-edit.css'
import '../../../Styles/wireframe-access.css'
import '../funders.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
