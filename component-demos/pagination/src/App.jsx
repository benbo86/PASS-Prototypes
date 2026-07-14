import { useState } from 'react'
import Pagination from '../../../Components/Pagination'

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)

const TOTAL_ROWS = 125

export default function App() {
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const totalPages = Math.ceil(TOTAL_ROWS / rowsPerPage)
  const showStart = (page - 1) * rowsPerPage + 1
  const showEnd = Math.min(page * rowsPerPage, TOTAL_ROWS)

  return (
    <div className="demo-page">
      <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>
      <div className="demo-content">
        <h1>Pagination</h1>
        <p>Page/first/last controls plus a rows-per-page select — fully controlled, state lives in the parent.</p>
        <Pagination
          page={page}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          showStart={showStart}
          showEnd={showEnd}
          totalRows={TOTAL_ROWS}
          onPageChange={setPage}
          onRowsPerPageChange={(n) => { setRowsPerPage(n); setPage(1) }}
        />
      </div>
    </div>
  )
}
