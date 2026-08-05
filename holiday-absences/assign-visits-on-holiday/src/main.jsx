import React from 'react'
import ReactDOM from 'react-dom/client'
import AddHolidayOrAbsencePage from './AddHolidayOrAbsencePage'
import '../../../Styles/main.css'
import '../../../Styles/colors.css'
import '../../../Styles/modal.css'
import '../../../Styles/holiday-absence-dialog.css'
import 'react-datepicker/dist/react-datepicker.css'
import '../../../Styles/dev-toolbar.css'
import '../../../Styles/dev-mode.css'
import '../../../Styles/dev-comments.css'
import '../../../Styles/dev-edit.css'
import '../../../Styles/wireframe-access.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AddHolidayOrAbsencePage />
  </React.StrictMode>
)
