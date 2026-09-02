import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import 'react-datepicker/dist/react-datepicker.css'
import '../../../Styles/colors.css'
import '../../../Styles/main.css'
import '../../../Styles/date-range-picker.css'
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
