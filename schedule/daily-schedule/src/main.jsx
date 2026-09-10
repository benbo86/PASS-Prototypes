import React from 'react'
import ReactDOM from 'react-dom/client'
import DailySchedule from './DailySchedule'
import '../../../Styles/colors.css'
import '../../../Styles/main.css'
import '../../../Styles/side-nav.css'
import '../../../Styles/top-nav.css'
import '../../../Styles/event-panel.css'
import '../../../Styles/date-range-picker.css'
import '../../../Styles/filter-dropdown.css'
import '../daily-schedule.css'
import 'react-datepicker/dist/react-datepicker.css'
import '../../../Styles/dev-toolbar.css'
import '../../../Styles/dev-mode.css'
import '../../../Styles/dev-comments.css'
import '../../../Styles/dev-edit.css'
import '../../../Styles/wireframe-access.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DailySchedule />
  </React.StrictMode>
)
