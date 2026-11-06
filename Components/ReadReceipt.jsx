import '../Styles/read-receipt.css'

// Message receipt shown on messages the user sent. One component for web and
// mobile messaging so the icons and colours always match.
//
// Only three states exist in the live product (confirmed by the server team,
// 2026-11-05): the message hasn't gone out yet, the server has it ("sent"), or
// the other person has read it. Delivery to the other phone isn't tracked, so
// there is no "delivered" state.
//
//   status="sending"  clock, grey
//   status="sent"     single tick, grey
//   status="read"     double tick, purple

const LABELS = {
  sending: 'Sending',
  sent: 'Sent, not read yet',
  read: 'Read',
}

// Clock path copied from Icons/Clock.svg
const ClockPath = () => (
  <path d="M12,0.375 C5.578125,0.375 0.375,5.578125 0.375,12 C0.375,18.421875 5.578125,23.625 12,23.625 C18.421875,23.625 23.625,18.421875 23.625,12 C23.625,5.578125 18.421875,0.375 12,0.375 Z M12,21.375 C6.8203125,21.375 2.625,17.1796875 2.625,12 C2.625,6.8203125 6.8203125,2.625 12,2.625 C17.1796875,2.625 21.375,6.8203125 21.375,12 C21.375,17.1796875 17.1796875,21.375 12,21.375 Z M14.896875,16.48125 L10.9171875,13.5890625 C10.771875,13.48125 10.6875,13.3125 10.6875,13.134375 L10.6875,5.4375 C10.6875,5.128125 10.940625,4.875 11.25,4.875 L12.75,4.875 C13.059375,4.875 13.3125,5.128125 13.3125,5.4375 L13.3125,12.0796875 L16.44375,14.3578125 C16.696875,14.540625 16.7484375,14.8921875 16.565625,15.1453125 L15.684375,16.359375 C15.5015625,16.6078125 15.15,16.6640625 14.896875,16.48125 Z" />
)

const SingleTickPath = () => <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />

const DoubleTickPath = () => (
  <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
)

export default function ReadReceipt({ status = 'sent', size = 16 }) {
  const known = LABELS[status] ? status : 'sent'
  return (
    <svg
      width={size}
      height={size}
      viewBox={known === 'sending' ? '0 0 25 25' : '0 0 24 24'}
      fill="currentColor"
      className={`receipt-icon receipt-${known}`}
      role="img"
      aria-label={LABELS[known]}
    >
      {known === 'sending' && <ClockPath />}
      {known === 'sent' && <SingleTickPath />}
      {known === 'read' && <DoubleTickPath />}
    </svg>
  )
}
