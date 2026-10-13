import { useEffect, useState } from 'react'
import StatusBar from '../../../Components/StatusBar'
import AppHeader from '../../../Components/AppHeader'
import { CustomerCard, fmtElapsed } from '../../tag-in-out/src/VisitScreen'
import { ClockIcon, FinishVisitIcon } from '../../tag-in-out/src/icons'
import { HandoverIcon, CheckIcon, CloseSmallIcon } from './icons'

// The Visit notes screen from the live app (slides up after Finish visit),
// with one addition: an optional "Note for the next carer" field below the
// required care note. The two are kept visually separate on purpose. The
// care note is the record of this visit; the handover is a one-off
// instruction shown to whoever does the customer's next visit.
export default function NotesScreen({
  booking, startElapsed, careNote, onCareNoteChange, handover, onHandoverChange, onBack, onSave,
}) {
  const [elapsed, setElapsed] = useState(startElapsed)

  useEffect(() => {
    const id = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const firstName = booking.name.split(' ')[0]
  const canSave = careNote.trim().length > 0

  return (
    <div className="screen ho-notes-screen">
      <StatusBar />
      <AppHeader
        title="Visit notes"
        subtitle={<><ClockIcon size={12} /> Visit in progress ({fmtElapsed(elapsed)})</>}
        onBack={onBack}
      />
      <div className="visit-body">
        <CustomerCard booking={booking} />

        <section className="ho-notes-section">
          <div className="ho-notes-label-row">
            <label className="ho-notes-label" htmlFor="ho-care-note">Add some notes?</label>
            <button className="ho-clear-btn" disabled={!careNote} onClick={() => onCareNoteChange('')}>
              <CloseSmallIcon /> Clear
            </button>
          </div>
          <textarea
            id="ho-care-note"
            className="ho-textarea"
            rows={6}
            value={careNote}
            onChange={e => onCareNoteChange(e.target.value)}
          />
          {careNote.trim() && <div className="ho-saved"><CheckIcon /> Saved</div>}
        </section>

        <section className="ho-handover-section">
          <div className="ho-notes-label-row">
            <label className="ho-handover-label" htmlFor="ho-handover">
              <HandoverIcon /> Note for the next carer
              <span className="ho-optional">Optional</span>
            </label>
            <button className="ho-clear-btn" disabled={!handover} onClick={() => onHandoverChange('')}>
              <CloseSmallIcon /> Clear
            </button>
          </div>
          <p className="ho-handover-help">
            Shown to the carer on {firstName}'s next visit, then removed.
            If it always applies, ask the office to add it to {firstName}'s profile.
          </p>
          <textarea
            id="ho-handover"
            className="ho-textarea ho-textarea--handover"
            rows={3}
            value={handover}
            onChange={e => onHandoverChange(e.target.value)}
            placeholder="e.g. Washing is in the machine, please hang it out"
          />
        </section>
      </div>
      <div className="visit-fab-wrap">
        <button className={`fab-square ho-save-btn${canSave ? '' : ' ho-save-btn--disabled'}`} disabled={!canSave} onClick={onSave}>
          <FinishVisitIcon size={20} />
          <span>Save and tag out</span>
        </button>
      </div>
    </div>
  )
}
