import React from 'react'
import ReactDOM from 'react-dom/client'
import Timesheets from './Timesheets'
import '../../../Styles/main.css'
import '../../../Styles/holiday-panel.css'
import '../../../Styles/colors.css'
import '../../../Styles/filter-dropdown.css'
import '../../../Styles/date-range-picker.css'
import '../../../Styles/side-nav.css'
import '../../../Styles/top-nav.css'
import '../timesheets.css'
import 'react-datepicker/dist/react-datepicker.css'
import '../../../Styles/dev-toolbar.css'
import '../../../Styles/dev-mode.css'
import '../../../Styles/dev-comments.css'
import '../../../Styles/dev-edit.css'
import '../../../Styles/wireframe-access.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Timesheets />
  </React.StrictMode>
)
