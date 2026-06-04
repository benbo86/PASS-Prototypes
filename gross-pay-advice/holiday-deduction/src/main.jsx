import React from 'react'
import ReactDOM from 'react-dom/client'
import GrossPayAdvice from './GrossPayAdvice'
import '../../../Styles/main.css'
import '../../../Styles/holiday-panel.css'
import '../../../Styles/colors.css'
import '../../../Styles/filter-dropdown.css'
import '../../../Styles/date-range-picker.css'
import '../gross-pay-advice.css'
import 'react-datepicker/dist/react-datepicker.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GrossPayAdvice />
  </React.StrictMode>
)
