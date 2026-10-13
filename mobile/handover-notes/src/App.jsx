import { useRef, useState } from 'react'
import ScreenSlider from '../../../Components/ScreenSlider'
import DevToolbar from '../../../Components/DevToolbar'
import DevMode from '../../../Components/DevMode'
import DevComments from '../../../Components/DevComments'
import DevEdit from '../../../Components/DevEdit'
import WireframeToggle from '../../../Components/WireframeToggle'
import AuditCapture from '../../../Components/AuditCapture'
import VisitScreen, { PlayIcon } from '../../tag-in-out/src/VisitScreen'
import BookingsScreen from '../../tag-in-out/src/BookingsScreen'
import TagScreen from '../../tag-in-out/src/TagScreen'
import NotesScreen from './NotesScreen'
import HandoverCard from './HandoverCard'
import BottomSheet from '../../../Components/BottomSheet'
import { HandoverIcon } from './icons'
import { VISITS, NEXT_VISIT_KEY, FILLER_BOOKINGS, WRITER } from './data'

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
  </svg>
)

// Fixed story time rather than the real clock: the afternoon visit ends
// around 16:52.
const WRITTEN_AT = 'Today, 16:52'

// Arriving from Tag In/Out's Finish visit button: the afternoon visit has
// been running ~52 minutes with every task done, and we land straight on
// the Visit notes screen, so the two prototypes read as one flow.
function initialVisits(fromTagInOut) {
  const visits = {}
  for (const v of Object.values(VISITS)) {
    visits[v.key] = { status: 'pending', tasks: v.tasks, startedAt: null }
  }
  if (fromTagInOut) {
    visits.afternoon = {
      status: 'in-progress',
      tasks: VISITS.afternoon.tasks.map(t => ({ ...t, status: 'complete' })),
      startedAt: Date.now() - 52 * 60 * 1000,
    }
  }
  return visits
}

export default function App() {
  const pageRef = useRef(null)
  const fromTagInOut = new URLSearchParams(window.location.search).get('from') === 'tag-in-out'

  const [view, setView] = useState(fromTagInOut ? 'notes' : 'bookings')
  const [current, setCurrent] = useState('afternoon')
  const [visits, setVisits] = useState(() => initialVisits(fromTagInOut))
  const [careNote, setCareNote] = useState('')
  const [handoverDraft, setHandoverDraft] = useState('')
  // Keyed by the visit the note is FOR: { evening: { text, author, when } }
  const [handovers, setHandovers] = useState({})
  const [showTagInPrompt, setShowTagInPrompt] = useState(false)
  // Which visit's handover the Bookings badge sheet is showing, or null.
  const [badgeSheetKey, setBadgeSheetKey] = useState(null)

  const visit = VISITS[current]
  const state = visits[current]
  const elapsed = () => (state.startedAt ? Math.floor((Date.now() - state.startedAt) / 1000) : 0)
  const handoverFor = handovers[current]

  const updateVisit = (key, patch) => setVisits(vs => ({ ...vs, [key]: { ...vs[key], ...patch } }))

  const openVisit = key => {
    setCurrent(key)
    setView('visit')
  }

  const toggleTask = taskKey => updateVisit(current, {
    tasks: state.tasks.map(t => (
      t.key === taskKey ? { ...t, status: t.status === 'complete' ? 'pending' : 'complete' } : t
    )),
  })

  const handleTagIn = () => {
    if (handoverFor) setShowTagInPrompt(true)
    else setView('tagIn')
  }

  const openNotes = () => setView('notes')

  const saveAndTagOut = () => {
    const target = NEXT_VISIT_KEY[current]
    const text = handoverDraft.trim()
    if (target) {
      setHandovers(h => {
        const next = { ...h }
        if (text) next[target] = { text, author: WRITER.name, when: WRITTEN_AT }
        else delete next[target]
        return next
      })
    }
    setView('tagOut')
  }

  // Stephen's two visits sit next to each other, so the badge on the
  // evening one is visible without scrolling once the afternoon is done.
  const previousDone = key => {
    const prev = Object.keys(NEXT_VISIT_KEY).find(k => NEXT_VISIT_KEY[k] === key)
    return !prev || visits[prev].status === 'complete'
  }

  const stephenBooking = key => {
    const v = VISITS[key]
    const s = visits[key]
    const h = handovers[key]
    return {
      key,
      time: v.time,
      visitType: v.visitType,
      customerName: v.name,
      address: v.address,
      highRisk: v.highRisk,
      legalFlags: v.legalFlags,
      status: s.status,
      // A visit can only be opened once the one before it is complete, so the
      // prototype is followed in order: afternoon first, then evening.
      onSelect: s.status === 'complete' || !previousDone(key) ? undefined : () => openVisit(key),
      extra: h && s.status !== 'complete' && (
        // Tapping the badge shows the note in a sheet, like the live app's
        // other booking-card badges. stopPropagation so it doesn't also
        // open the visit.
        <button
          type="button"
          className="ho-booking-badge"
          onClick={e => { e.stopPropagation(); setBadgeSheetKey(key) }}
        >
          <HandoverIcon size={16} /> New handover note
        </button>
      ),
    }
  }
  const bookings = [
    FILLER_BOOKINGS[0],
    stephenBooking('afternoon'),
    stephenBooking('evening'),
    FILLER_BOOKINGS[1],
  ]

  const handoverCard = handoverFor && (
    <HandoverCard handover={handoverFor} />
  )
  const inProgress = state.status === 'in-progress'

  return (
    <>
      <DevToolbar floating>
        <DevEdit containerRef={pageRef} prototypeId={window.location.pathname} />
        <DevMode containerRef={pageRef} />
        <DevComments containerRef={pageRef} prototypeId={window.location.pathname} />
        <WireframeToggle />
        <AuditCapture containerRef={pageRef} />
      </DevToolbar>
      <div className="phone-wrap">
        <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>
        <div className="phone-frame" ref={pageRef}>
          <div className="screen-area">
            {/* Bookings/Visit stay mounted underneath the Notes and Tag
                screens, so sliding those down reveals the right screen:
                the Visit after tagging in, Bookings after tagging out. */}
            <ScreenSlider
              secondaryActive={view !== 'bookings' && view !== 'tagOut'}
              primary={<BookingsScreen bookings={bookings} />}
              secondary={(
                <VisitScreen
                  key={`${current}-${state.status}`}
                  booking={visit}
                  inProgress={inProgress}
                  tasks={state.tasks}
                  startElapsed={elapsed()}
                  onToggleTask={toggleTask}
                  onAddNotes={openNotes}
                  onFinishVisit={openNotes}
                  onTagIn={handleTagIn}
                  onBack={() => setView('bookings')}
                  onCancelVisit={() => {
                    if (window.confirm('Cancel this visit? This can\'t be undone.')) setView('bookings')
                  }}
                >
                  {handoverCard}
                </VisitScreen>
              )}
            />
            {view === 'tagIn' && (
              <TagScreen
                direction="in"
                customerName={visit.name}
                onClose={() => setView('visit')}
                onConfirmed={() => updateVisit(current, { status: 'in-progress', startedAt: Date.now() })}
                onComplete={() => setView('visit')}
              />
            )}
            {view === 'notes' && (
              <NotesScreen
                booking={visit}
                startElapsed={elapsed()}
                careNote={careNote}
                onCareNoteChange={setCareNote}
                handover={handoverDraft}
                onHandoverChange={setHandoverDraft}
                onBack={() => setView('visit')}
                onSave={saveAndTagOut}
              />
            )}
            {view === 'tagOut' && (
              <TagScreen
                direction="out"
                customerName={visit.name}
                skipSuccess
                onClose={() => setView('notes')}
                onConfirmed={() => {
                  updateVisit(current, { status: 'complete' })
                  setCareNote('')
                  setHandoverDraft('')
                }}
                onComplete={() => setView('bookings')}
              />
            )}

            <BottomSheet open={!!badgeSheetKey} onClose={() => setBadgeSheetKey(null)}>
              {badgeSheetKey && handovers[badgeSheetKey] && (
                <>
                  <h3 className="ho-prompt-heading"><HandoverIcon /> Handover note</h3>
                  <div className="ho-quote"><span>{handovers[badgeSheetKey].text}</span></div>
                  <p className="ho-prompt-meta">From {handovers[badgeSheetKey].author} · {handovers[badgeSheetKey].when}</p>
                </>
              )}
            </BottomSheet>

            {/* Reminder at Tag in, whenever there's a handover for this visit. */}
            <BottomSheet open={showTagInPrompt} onClose={() => setShowTagInPrompt(false)}>
              {handoverFor && (
                <>
                  <h3 className="ho-prompt-heading"><HandoverIcon /> Before you start</h3>
                  <p className="ho-prompt-intro">{handoverFor.author} left a note for this visit:</p>
                  <div className="ho-quote"><span>{handoverFor.text}</span></div>
                  <p className="ho-prompt-meta">{handoverFor.when}</p>
                  <button
                    className="fab-square visit-fab"
                    onClick={() => { setShowTagInPrompt(false); setView('tagIn') }}
                  >
                    <PlayIcon />
                    <span>Got it, tag in</span>
                  </button>
                </>
              )}
            </BottomSheet>

          </div>
        </div>
      </div>
    </>
  )
}
