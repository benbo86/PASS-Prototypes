import React from 'react'
import ReactDOM from 'react-dom/client'
import HolidayEntitlement from './HolidayEntitlement'
import '../../Styles/colors.css'
import '../../Styles/main.css'
import '../holiday-entitlement.css'
import 'react-datepicker/dist/react-datepicker.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HolidayEntitlement />
  </React.StrictMode>
)
