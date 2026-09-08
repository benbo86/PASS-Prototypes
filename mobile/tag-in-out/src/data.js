// ─── AIOP-20690 — QR Code & NFC Tag in/out Preference ───────────
// The office's own preference (what AIOP-23484's web settings piece would
// actually control) is a plain constant here — that story is explicitly
// out of scope for this round ("mobile first"). Change this to demo the
// other states (a QR-preferred office, or an NFC-preferred one).
export const PREFERRED_METHOD = 'nfc'

// Fixed reason-code list — Ben found the real "non-NFC" reason codes in
// the product's own documentation and supplied them directly, replacing
// the earlier invented set (NFC tag not working / Phone battery or device
// issue), which weren't the real codes. These are genuinely generic — not
// derived from PREFERRED_METHOD like the earlier version was — several of
// them (Frustrated visit, Late cancellation, Delivered on a different day)
// describe why the *visit itself* is non-standard rather than why NFC
// specifically failed, so they apply regardless of which method the
// office prefers. "Other" is not itself one of the documented codes —
// added as a catch-all, matching this repo's own established convention
// (see TagScreen.jsx's own follow-up text field for that one) — flagged
// directly to Ben rather than silently assumed.
export const REASON_CODES = [
  { key: 'frustrated-visit', label: 'Frustrated visit' },
  { key: 'forgot-log', label: 'Forgot to log in / out' },
  { key: 'office-notified', label: 'Office notified' },
  { key: 'away-from-home', label: 'Service delivered away from home' },
  { key: 'different-day', label: 'Delivered on a different day' },
  { key: 'late-cancellation', label: 'Late cancellation' },
  { key: 'other', label: 'Other' },
]

// Dummy content, but now the single source of truth for the *whole*
// prototype, not just the Booking/Tasks wrapper — Ben: "make sure we use
// the same customer and visit details throughout the prototype." Every
// screen (Bookings' real card, the Visit header, and TagScreen's own
// customer-name prop, already threaded through App.jsx) reads from this
// one object, so there's nowhere for the details to drift out of sync.
// "Stephen Nicholls" is the dummy customer name already established
// elsewhere in this repo for exactly this purpose.
export const CUSTOMER = {
  name: 'Stephen Nicholls',
  visitType: 'Afternoon visit',
  address: '14 Elm Grove, Woodford Green, IG8 8DL',
  time: '16:00 – 17:00 (1hr)',
  dob: '17/01/1958',
  // Deliberately shown as true (rather than a quieter false) — matching
  // the real Figma reference on both screens, so the prototype actually
  // demonstrates the HIGH RISK badge + legal-flag pills it was built to
  // show, not just their absence.
  highRisk: true,
  legalFlags: ['allergies', 'dnacpr', 'dols'],
}

// The Bookings list's one real entry mirrors CUSTOMER exactly (same
// name/visitType/time/address) rather than duplicating those fields — the
// other two are clearly-invented filler so the list doesn't look empty;
// tapping them isn't wired to anything, only the real entry is.
//
// `status` drives the card's left-edge "Task states" marker (see
// icons.jsx's own TaskStateIcon) — 'pending' (empty ring, not yet
// started) or 'complete' (solid green tick). Ordered chronologically so
// the one already-'complete' visit (earlier in the morning) reads
// naturally above the two still-'pending' ones. 'in-progress' is a real,
// supported marker state (see icons.jsx) but isn't used by any entry
// here — only one visit can genuinely be in progress at a time, and this
// screen is always reached before anything has been tagged into yet.
export const BOOKINGS = [
  {
    key: 'filler-1',
    time: '09:00 – 09:30 (30m)',
    visitType: 'Morning tea visit',
    customerName: 'Hilary Buxton',
    address: '22 Dunlop Street, Farnham, GU23 4EE',
    highRisk: false,
    legalFlags: [],
    status: 'complete',
  },
  {
    key: 'real',
    time: CUSTOMER.time,
    visitType: CUSTOMER.visitType,
    customerName: CUSTOMER.name,
    address: CUSTOMER.address,
    highRisk: CUSTOMER.highRisk,
    legalFlags: CUSTOMER.legalFlags,
    status: 'pending',
  },
  {
    key: 'filler-2',
    time: '18:00 – 18:30 (30m)',
    visitType: 'Companionship visit',
    customerName: 'Lily Finch',
    address: '22 Dunlop Street, Farnham, GU23 4EE',
    highRisk: false,
    legalFlags: [],
    status: 'pending',
  },
]

// `type` drives the task row's right-hand badge (icons.jsx's own
// TaskTypeBadge) — 'medication' for the two tablets, 'other' for
// everything else, matching the two action-type badges actually shown
// across the real Figma "Task card small" component's own live task
// rows (node 97:3219) — see icons.jsx's own note on why only these two.
//
// `status` drives the left-hand marker shown once the visit is actually
// in progress (icons.jsx's TaskStateIcon — the same pending/in-progress/
// complete marker already used for the booking card's own status, see
// its own header comment). All 5 default to 'pending' — matching the
// real Figma "Visit - Tasks" reference (node 533:5814) exactly, which
// shows every task still as a plain empty ring immediately after tagging
// in, since nothing has actually been started or completed yet.
export const TASKS = [
  { key: 'personal-care', label: 'Personal care record', time: '16:00', type: 'other', status: 'pending' },
  { key: 'meds', label: 'Metformin 500mg tablets', time: '16:00', type: 'medication', status: 'pending' },
  { key: 'meds-2', label: 'Lercanidipine 20mg tablets', time: '16:00', type: 'medication', status: 'pending' },
  { key: 'weekly-review', label: 'Weekly Review — Maintain Adequate Dietary & Fluid Intake', time: '16:30', type: 'other', status: 'pending' },
  { key: 'hydration', label: 'Hydration task', time: '16:45', type: 'other', status: 'pending' },
]
