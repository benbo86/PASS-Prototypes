import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '../../../Styles/main.css'
import '../../../Styles/colors.css'
import '../../../Styles/filter-dropdown.css'
import '../../holiday-deduction/gross-pay-advice.css'
import '../salaried-travel-time.css'
import '../../../Styles/dev-toolbar.css'
import '../../../Styles/dev-mode.css'
import '../../../Styles/dev-comments.css'
import '../../../Styles/dev-edit.css'
import '../../../Styles/wireframe-access.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
