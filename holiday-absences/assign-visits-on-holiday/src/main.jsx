import React from 'react'
import ReactDOM from 'react-dom/client'
import HolidayAbsenceDialog from './HolidayAbsenceDialog'
import '../../../Styles/main.css'
import '../../../Styles/colors.css'
import '../../../Styles/modal.css'
import '../holiday-absence-dialog.css'
import 'react-datepicker/dist/react-datepicker.css'
import '../../../Styles/dev-mode.css'
import '../../../Styles/dev-comments.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HolidayAbsenceDialog />
  </React.StrictMode>
)
