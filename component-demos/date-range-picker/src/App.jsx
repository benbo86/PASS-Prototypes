import { useState } from 'react'
import DatePicker from 'react-datepicker'
import { fmtDate, DateRangeInput } from '../../../Components/DateRangePicker'

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)

export default function App() {
  const [dateRange, setDateRange] = useState([null, null])
  const [startDate, endDate] = dateRange

  const rangeLabel = startDate && endDate
    ? startDate.toDateString() === endDate.toDateString()
      ? fmtDate(startDate)
      : `${fmtDate(startDate)} – ${fmtDate(endDate)}`
    : startDate ? fmtDate(startDate) : 'Select dates'

  return (
    <div className="demo-page">
      <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>
      <div className="demo-content">
        <h1>Date Range Picker</h1>
        <p>Exports a calendar-icon trigger button (<code>DateRangeInput</code>) and a date formatter (<code>fmtDate</code>) for use as react-datepicker's <code>customInput</code>.</p>
        <DatePicker
          selectsRange
          startDate={startDate}
          endDate={endDate}
          onChange={(update) => setDateRange(update)}
          customInput={<DateRangeInput label={rangeLabel} />}
          calendarStartDay={1}
          formatWeekDay={d => d.slice(0, 1)}
        />
      </div>
    </div>
  )
}
