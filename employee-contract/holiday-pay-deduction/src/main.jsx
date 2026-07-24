import React from 'react'
import ReactDOM from 'react-dom/client'
import HolidayEntitlement from './HolidayEntitlement'
import '../../../Styles/colors.css'
import '../../../Styles/main.css'
import '../holiday-entitlement.css'
import 'react-datepicker/dist/react-datepicker.css'
import '../../../Styles/dev-toolbar.css'
import '../../../Styles/dev-mode.css'
import '../../../Styles/dev-comments.css'
import '../../../Styles/dev-edit.css'
import '../../../Styles/wireframe-access.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HolidayEntitlement />
  </React.StrictMode>
)
