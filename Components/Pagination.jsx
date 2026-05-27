export default function Pagination({
  page,
  totalPages,
  rowsPerPage,
  rowsPerPageOptions = [10, 12, 25, 50],
  showStart,
  showEnd,
  totalRows,
  onPageChange,
  onRowsPerPageChange,
}) {
  return (
    <div className="pagination">
      <div className="pag-left">
        <button className="pag-btn" onClick={() => onPageChange(1)} disabled={page <= 1}>First</button>
        <button className="pag-arrow" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1}>‹</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button key={p} className={`pag-btn pag-num ${p === page ? 'current' : ''}`}
            onClick={() => onPageChange(p)}>{p}</button>
        ))}
        <button className="pag-arrow" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>›</button>
        <button className="pag-btn" onClick={() => onPageChange(totalPages)} disabled={page >= totalPages}>Last</button>
      </div>
      <div className="pag-right">
        <span className="count-label">Rows per page</span>
        <select className="rows-select" value={rowsPerPage}
          onChange={e => onRowsPerPageChange(Number(e.target.value))}>
          {rowsPerPageOptions.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <span className="count-label">{showStart}–{showEnd} of {totalRows}</span>
      </div>
    </div>
  );
}
