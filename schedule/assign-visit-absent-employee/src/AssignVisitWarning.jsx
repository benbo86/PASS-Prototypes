import { useRef } from 'react'
import DevMode from '../../../Components/DevMode'
import DevComments from '../../../Components/DevComments'

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <polygon fill="currentColor" stroke="currentColor" strokeLinejoin="round"
      points="18 7.2 16.8 6 12 10.8 7.2 6 6 7.2 10.8 12 6 16.8 7.2 18 12 13.2 16.8 18 18 16.8 13.2 12" />
  </svg>
)

const WarningIcon = () => (
  <svg className="warning-icon" width="24" height="24" viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path fill="currentColor" d="M10.27,3.99 C11.04,2.66 12.96,2.66 13.73,3.99 L21.26,17
      C22.03,18.33 21.07,20 19.53,20 L4.47,20 C2.93,20 1.97,18.33 2.74,17 Z M12,15
      C11.45,15 11,15.45 11,16 C11,16.55 11.45,17 12,17 C12.55,17 13,16.55 13,16
      C13,15.45 12.55,15 12,15 Z M12,7 C11.45,7 11,7.45 11,8 L11,12 C11,12.55 11.45,13
      12,13 C12.55,13 13,12.55 13,12 L13,8 C13,7.45 12.55,7 12,7 Z" />
  </svg>
)

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <polygon fill="currentColor" points="15.4 7.4 14 6 8 12 14 18 15.4 16.6 10.8 12" />
  </svg>
)

export default function AssignVisitWarning() {
  const pageRef = useRef(null)
  return (
    <div ref={pageRef} style={{ display: 'contents' }}>
      <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>
      <div className="modal">
      <button className="modal-close-btn" aria-label="Close"><CloseIcon /></button>

      <h6>Assignment warnings</h6>

      <div className="warning-banner orange">
        <WarningIcon />
        <div>
          <h4>Warnings</h4>
          <ul>
              <li>Amirah Marsden is absent</li>
          </ul>
        </div>
      </div>

      <div className="btn-row centered">
        <button className="round-btn tertiary-btn">Cancel</button>
        <button className="round-btn primary-btn">Assign visits</button>
      </div>
    </div>
    <DevMode containerRef={pageRef} />
    <DevComments containerRef={pageRef} prototypeId={window.location.pathname} />
    </div>
  )
}
