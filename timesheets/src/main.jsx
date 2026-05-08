import React from 'react'
import ReactDOM from 'react-dom/client'
import Timesheets from './Timesheets'
import '../../Styles/main.css'
import '../../Styles/colors.css'
import '../../Styles/filter-dropdown.css'
import '../../Styles/date-range-picker.css'
import '../timesheets.css'
import 'react-datepicker/dist/react-datepicker.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Timesheets />
  </React.StrictMode>
)
