import React from 'react'
import ReactDOM from 'react-dom/client'
import LeaveRequests from './LeaveRequests'
import '../../../Styles/colors.css'
import '../../../Styles/main.css'
import '../../../Styles/filter-dropdown.css'
import '../../../Styles/date-range-picker.css'
import '../../../Styles/side-nav.css'
import '../../../Styles/top-nav.css'
import '../../../Styles/modal.css'
import '../../../Styles/holiday-absence-dialog.css'
import '../leave-requests.css'
import 'react-datepicker/dist/react-datepicker.css'
import '../../../Styles/dev-toolbar.css'
import '../../../Styles/dev-mode.css'
import '../../../Styles/dev-comments.css'
import '../../../Styles/dev-edit.css'
import '../../../Styles/wireframe-access.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LeaveRequests />
  </React.StrictMode>
)
