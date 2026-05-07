import React from 'react'
import ReactDOM from 'react-dom/client'
import Timesheets from './Timesheets'
import '../../Styles/main.css'
import '../../Styles/colors.css'
import '../timesheets.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Timesheets />
  </React.StrictMode>
)
