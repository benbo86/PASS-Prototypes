// Mock-up of the customer schedule PDF (AIOP-25799). Page units are points
// (1 CSS px = 1pt) on an A4 page, scaled to fit by the caller.
//
//   standard + cards  → today's layout (7 day columns)
//   large    + cards  → Concept 2 from wireframes/schedule-pdf.json (days flow into
//                       3 columns portrait / 4 landscape); 'cards2' is the same with 2 / 3
//                       columns, to compare at 16pt
//   large    + list   → Nourish-style list, one row per visit
//
// Visit data is a fixed week for the live example customer; the dialog's
// Include pending / cancelled checkboxes filter it.

export const DAYS = ['Mon 16', 'Tue 17', 'Wed 18', 'Thu 19', 'Fri 20', 'Sat 21', 'Sun 22']

const VISITS = [
  { day: 0, time: '07:15 - 07:45', carer: 'Christina Constant', label: 'Morning', status: 'booked' },
  { day: 0, time: '13:00 - 13:30', carer: 'Dorina Eperjesi', label: 'Lunch', status: 'pending' },
  { day: 0, time: '21:30 - 22:00', carer: 'Hayley Bolitho-Webb', label: 'Bed', status: 'booked' },
  { day: 1, time: '07:15 - 07:45', carer: 'Christina Constant', label: 'Morning', status: 'booked' },
  { day: 1, time: '21:30 - 22:00', carer: 'Hayley Bolitho-Webb', label: 'Bed', status: 'booked' },
  { day: 2, time: '07:15 - 07:45', carer: 'Eghosa Orumwense', label: 'Morning', status: 'booked' },
  { day: 2, time: '21:30 - 22:00', carer: 'Josephine Cockle', label: 'Bed', status: 'booked' },
  { day: 3, time: '07:15 - 07:45', carer: 'Eghosa Orumwense', label: 'Morning', status: 'booked' },
  { day: 3, time: '21:30 - 22:00', carer: 'Josephine Cockle', label: 'Bed', status: 'booked' },
  { day: 4, time: '07:05 - 07:35', carer: 'Epiphania Muindis', label: 'Morning', status: 'booked' },
  { day: 4, time: '13:00 - 13:30', carer: 'Nafisa Abdullahi Mudei', label: 'Lunch', status: 'cancelled' },
  { day: 4, time: '21:30 - 22:00', carer: 'Jessica Rose-Sheikh', label: 'Bed', status: 'booked' },
  { day: 5, time: '07:05 - 07:35', carer: 'Epiphania Muindis', label: 'Morning', status: 'booked' },
  { day: 5, time: '21:30 - 22:00', carer: 'Jessica Rose-Sheikh', label: 'Bed', status: 'booked' },
  { day: 6, time: '07:15 - 07:45', carer: 'Shahanaz Begum Ali', label: 'Morning', status: 'pending' },
  { day: 6, time: '21:30 - 22:00', carer: 'Hayley Bolitho-Webb', label: 'Bed', status: 'booked' },
]

VISITS.sort((a, b) => a.day - b.day || a.time.localeCompare(b.time))

function Card({ v }) {
  return (
    <div className={`pdf-card pdf-card--${v.status}`}>
      <div className="pdf-card-time">{v.time}</div>
      <div className="pdf-card-name">{v.carer}</div>
      <div className="pdf-card-label">{v.label}</div>
    </div>
  )
}

function Cards({ days, visits, columns }) {
  return (
    <div className="pdf-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {days.map(i => (
        <div className="pdf-day" key={i}>
          <div className="pdf-day-head">{DAYS[i]}</div>
          {visits.filter(v => v.day === i).map((v, k) => <Card key={k} v={v} />)}
        </div>
      ))}
    </div>
  )
}

function List({ days, visits }) {
  return (
    <table className="pdf-list">
      <tbody>
        {days.map(i => {
          const d = DAYS[i]
          const rows = visits.filter(v => v.day === i)
          if (rows.length === 0) {
            return (
              <tr key={d}>
                <td className="pdf-list-day">{d}</td>
                <td colSpan={2} className="pdf-list-none">No visits</td>
              </tr>
            )
          }
          return rows.map((v, k) => (
            <tr key={`${d}-${k}`} className={k === 0 ? 'pdf-list-first' : ''}>
              {k === 0 && <td className="pdf-list-day" rowSpan={rows.length}>{d}</td>}
              <td className={`pdf-list-time pdf-list-time--${v.status}`}>{v.time}</td>
              <td className={v.status === 'cancelled' ? 'pdf-list-cancelled' : ''}>{v.carer}</td>
            </tr>
          ))
        })}
      </tbody>
    </table>
  )
}

export const PAGE = { portrait: { w: 595, h: 842 }, landscape: { w: 842, h: 595 } }

// Splits the 7 days across pages by estimated height (pt). A mock-up, not a layout
// engine: days never split between pages, and wrapped names are only estimated.
function paginate(layout, large, portrait, visits, columns, size) {
  const LINE = size * 1.35
  const all = [0, 1, 2, 3, 4, 5, 6]
  if (!large) return [all]
  const KEY = 44 // room for the key on whichever page is last
  const avail = [(portrait ? 450 : 295) - KEY, (portrait ? 720 : 475) - KEY]
  const perLine = Math.floor((columns >= 3 ? 17 : 27) * 16 / size) // rough characters per line in a card
  const cardH = v => (2 + Math.ceil(v.carer.length / perLine)) * LINE + 12
  const dayH = d => {
    const vs = visits.filter(v => v.day === d)
    return layout === 'cards'
      ? 2 * LINE + 26 + (vs.length ? vs.reduce((t, v) => t + cardH(v), 0) : 24)
      : Math.max(1, vs.length) * (LINE + 18)
  }
  // Cards fill row by row (a row is as tall as its tallest day); a list is one tall column.
  const units = layout === 'cards'
    ? Array.from({ length: Math.ceil(all.length / columns) }, (_, r) => all.slice(r * columns, r * columns + columns))
    : all.map(d => [d])
  const unitH = u => Math.max(...u.map(dayH))
  const pages = [[]]
  let used = 0
  units.forEach(u => {
    const cap = avail[pages.length === 1 ? 0 : 1]
    if (used + unitH(u) > cap && pages[pages.length - 1].length) { pages.push([]); used = 0 }
    pages[pages.length - 1].push(...u)
    used += unitH(u)
  })
  return pages
}

export default function SchedulePdfPreview({ customer, weekLabel, textSize, orientation, largeLayout, largeSize = 16, showPending, showCancelled }) {
  const large = textSize === 'large'
  const visits = VISITS.filter(v => (v.status !== 'pending' || showPending) && (v.status !== 'cancelled' || showCancelled))
  const { w, h } = PAGE[orientation]
  const portrait = orientation === 'portrait'
  const layout = large ? (largeLayout === 'list' ? 'list' : 'cards') : 'cards'
  const columns = !large ? 7 : largeLayout === 'cards2' ? (portrait ? 2 : 3) : (portrait ? 3 : 4)
  const pages = paginate(layout, large, portrait, visits, columns, largeSize)

  return (
    <div className="pdf-pages">
      {pages.map((days, n) => (
        <div key={n} className={`pdf-page${large ? ' pdf-page--large' : ''}`} style={{ width: w, height: h, '--lg': `${largeSize}px` }}>
          {n === 0 ? (
            <>
              <div className={`pdf-head${portrait ? '' : ' pdf-head--row'}`}>
                <div className="pdf-customer">
                  <b>{customer}</b>
                  <div>44B Chelmsford Road</div><div>South Woodford</div><div>London</div><div>E18 2PP</div>
                </div>
                <div className="pdf-agency">
                  <b>Bluebird Care Redbridge</b>
                  <div>137 George Lane</div><div>South Woodford, London</div><div>E18 1AN</div>
                  <div className="pdf-agency-contact">0208 989 8444</div>
                </div>
              </div>
              <div className="pdf-title">Visit schedule for {customer}</div>
              <div className="pdf-range">{weekLabel}</div>
              <div className="pdf-count">{visits.length} visits</div>
            </>
          ) : (
            <div className="pdf-title pdf-title--cont">Visit schedule for {customer} (continued)</div>
          )}
          {layout === 'cards' ? <Cards days={days} visits={visits} columns={columns} /> : <List days={days} visits={visits} />}
          {n === pages.length - 1 && (
            <div className="pdf-key">
              <span className="pdf-key-label">Key</span>
              <span className="pdf-key-item pdf-key-item--booked">Booked with staff</span>
              {showPending && <span className="pdf-key-item pdf-key-item--pending">Pending booking</span>}
              {showCancelled && <span className="pdf-key-item pdf-key-item--cancelled">Cancelled visit</span>}
            </div>
          )}
          <div className="pdf-footer">Page {n + 1}/{pages.length} 18/11/26</div>
        </div>
      ))}
    </div>
  )
}
