import { useRef, useState } from 'react'
import StatusBar from '../../../Components/StatusBar'
import ScreenSlider from '../../../Components/ScreenSlider'
import DevToolbar from '../../../Components/DevToolbar'
import DevMode from '../../../Components/DevMode'
import DevComments from '../../../Components/DevComments'
import DevEdit from '../../../Components/DevEdit'
import WireframeToggle from '../../../Components/WireframeToggle'
import AuditCapture from '../../../Components/AuditCapture'
import TagScreen from './TagScreen'
import BookingsScreen from './BookingsScreen'
import VisitScreen from './VisitScreen'
import { CUSTOMER, TASKS } from './data'

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
  </svg>
)

// ─── Tasks stub — non-interactive, just for narrative continuity ───
function TasksScreen({ onTagOut }) {
  return (
    <div className="screen">
      <StatusBar />
      <div className="tag-demo-header">Tasks</div>
      <div className="tag-demo-body">
        {TASKS.map(t => (
          <div className="tag-demo-task-row" key={t.key}>
            <span>{t.label}</span>
            <span className="tag-demo-task-time">{t.time}</span>
          </div>
        ))}
      </div>
      <div className="tag-demo-footer">
        <button className="round-btn primary-btn" style={{ width: '100%' }} onClick={onTagOut}>Tag out</button>
      </div>
    </div>
  )
}

function DoneScreen({ onRestart }) {
  return (
    <div className="screen">
      <StatusBar />
      <div className="tag-demo-body tag-demo-body--centered">
        <p>Visit complete.</p>
        <button className="round-btn secondary-btn" onClick={onRestart}>Start again</button>
      </div>
    </div>
  )
}

export default function App() {
  // Plain linear state, no router — matches every other mobile
  // prototype's own internal-navigation convention for a single flow that
  // doesn't need to go back and forth (ScreenSlider is for list<->detail).
  const [view, setView] = useState('bookings')
  const pageRef = useRef(null)

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
            {(view === 'bookings' || view === 'visit') && (
              <ScreenSlider
                secondaryActive={view === 'visit'}
                primary={<BookingsScreen onSelectBooking={() => setView('visit')} />}
                secondary={(
                  <VisitScreen
                    booking={CUSTOMER}
                    onBack={() => setView('bookings')}
                    onTagIn={() => setView('tagIn')}
                  />
                )}
              />
            )}
            {view === 'tagIn' && (
              <TagScreen
                direction="in"
                customerName={CUSTOMER.name}
                onClose={() => setView('visit')}
                onComplete={() => setView('visitInProgress')}
              />
            )}
            {view === 'visitInProgress' && (
              <VisitScreen
                inProgress
                booking={CUSTOMER}
                onBack={() => setView('bookings')}
                onCancelVisit={() => {
                  if (window.confirm('Cancel this visit? This can\'t be undone.')) setView('bookings')
                }}
              />
            )}
            {view === 'tasks' && <TasksScreen onTagOut={() => setView('tagOut')} />}
            {view === 'tagOut' && (
              <TagScreen
                direction="out"
                customerName={CUSTOMER.name}
                onClose={() => setView('tasks')}
                onComplete={() => setView('done')}
              />
            )}
            {view === 'done' && <DoneScreen onRestart={() => setView('bookings')} />}
          </div>
        </div>
      </div>
    </>
  )
}
