// Three thread kinds on this customer's Communications tab:
//  - 'openpass-visit'    openPASS user <-> office, tied to a specific visit
//                        (shows the visit label instead of a subject, and a
//                        "View care notes" action in the thread header)
//  - 'employee'          "Office messages" — office <-> care worker(s),
//                        about this customer. ONE thread per customer, not
//                        1:1 and not split by audience — matches the real
//                        live product exactly (Ben: "you go to
//                        communications -> office messages where you see a
//                        thread. Each office message displays if its to
//                        all care staff or care managers only"). An earlier
//                        version of this prototype modelled this as one
//                        thread PER named employee (mirroring web/
//                        messaging's own stable 1:1 threads), then as one
//                        thread PER audience (Care Managers / All care
//                        staff, each its own row) — both wrong. The
//                        visibility choice ('care-managers' | 'all-care-
//                        staff') lives on each individual OFFICE-sent
//                        message (`message.audience`), not on the thread —
//                        a single thread's history can and does mix
//                        messages with different audiences over time. Care
//                        worker replies never carry an `audience` of their
//                        own — they're just responding to whatever's
//                        already visible, not re-declaring who can see it.
//                        See [[project_client_oriented_messaging]] memory:
//                        this is also a plausible answer to the earlier
//                        open question about whether the existing carer
//                        thread already does what Lee's feedback asked for
//                        (auto-following whoever's currently rostered) —
//                        'all-care-staff' visibility would do exactly that.
//  - 'openpass-general'  openPASS user <-> office, NOT tied to a visit.
//                        Always carries a subject (shown in place of the
//                        visit label) since there's no visit to anchor it.
export const AUDIENCE_LABELS = {
  'care-managers': 'Care Managers',
  'all-care-staff': 'All care staff',
}

// The openPASS user (Mark) is a family member of this customer — Mrs
// Patricia "Pat" Allin, the same customer named in the shared
// CustomerProfileNav banner (Components/CustomerProfileNav.jsx). An
// earlier version of this data invented an unrelated customer ("David
// Farrington") the wireframe hadn't actually specified; Ben corrected it —
// Mark's surname is now Allin (Patricia's family), and every message
// below refers to Patricia/Pat, not David.
export const THREADS = [
  {
    id: 1,
    kind: 'openpass-visit',
    personName: 'Mark Allin',
    visitLabel: 'Evening Visit 17:30, 18/08/26',
    lastSender: 'Mark Allin',
    lastMessage: "I'm glad she was in a good mood today, thank you for letting me know.",
    time: '19:15',
    unread: false,
  },
  {
    id: 2,
    kind: 'employee',
    lastSender: 'Priya Shah',
    lastMessage: "Thanks for flagging Adrianna — I've got Pat tomorrow morning, I'll keep an eye on this.",
    time: '19:47',
    unread: false,
  },
  {
    id: 3,
    kind: 'openpass-general',
    personName: 'Mark Allin',
    subject: 'Memory concerns',
    lastSender: 'Office',
    lastMessage: "Yes, she was a bit confused about the time but nothing outside of what we'd expect — we'll keep a close eye on her.",
    time: '19:32',
    unread: true,
  },
]

// Every message carries a real `date` (YYYY-MM-DD, local calendar day) —
// what actually drives the day separators in ThreadView (see
// dayLabel/groupMessagesByDay in App.jsx). Dates below are fixed relative
// to when this was built (today = 2026-08-19) purely so the demo threads
// visibly exercise every separator bucket (Today / Yesterday / a weekday
// name for the rest of the last 7 days / an absolute date beyond that) —
// same convention as other hardcoded demo dates already in this repo
// (e.g. the visit label's "18/08/26"), not something that stays "current"
// indefinitely.
export const THREAD_MESSAGES = {
  1: [
    { id: 1, isMe: false, sender: 'Mark Allin', text: "Hi, just checking in — how did this evening's visit go?", time: '18:52', date: '2026-08-19' },
    { id: 2, isMe: true, sender: 'Office', text: 'Hi Mark, all went smoothly. Pat was in good spirits and had her dinner and evening medication as usual.', time: '19:05', date: '2026-08-19', receipt: 'read' },
    { id: 3, isMe: false, sender: 'Mark Allin', text: "I'm glad she was in a good mood today, thank you for letting me know.", time: '19:15', date: '2026-08-19' },
  ],
  // Single "Office messages" thread — deliberately mixes two different
  // audiences across its history (a Care Managers exchange earlier in the
  // day, an All care staff exchange later) to make concrete that the
  // audience choice lives per-message, not per-thread. Also deliberately
  // the thread with real history spanning weeks, not just today — an
  // ongoing customer-specific record is exactly the case where "how do
  // older messages get dated" actually matters (see
  // [[project_client_oriented_messaging]] memory).
  2: [
    { id: 1, isMe: true, sender: 'Office', audience: 'all-care-staff', text: "Pat's family have asked that we keep a slightly closer eye on her medication timings going forward — nothing urgent, just flagging for awareness.", time: '11:10', date: '2026-07-29', receipt: 'read' },
    { id: 2, isMe: false, sender: 'Adrianna Yates', text: 'Thanks for the heads up, will do.', time: '11:40', date: '2026-07-29' },
    { id: 3, isMe: true, sender: 'Office', audience: 'care-managers', text: "Quick note for managers — Pat's had a couple of slightly later medication rounds this month. Nothing serious, but worth keeping on file.", time: '09:30', date: '2026-08-13', receipt: 'delivered' },
    { id: 4, isMe: false, sender: 'Grace Okafor', text: "Noted, thanks — I'll keep it in mind for her next review.", time: '09:52', date: '2026-08-13' },
    { id: 5, isMe: true, sender: 'Office', audience: 'all-care-staff', text: "Reminder to log Pat's medication times promptly during visits this week please.", time: '08:15', date: '2026-08-18', receipt: 'read' },
    { id: 6, isMe: false, sender: 'Priya Shah', text: 'Will do, thanks.', time: '08:22', date: '2026-08-18' },
    { id: 7, isMe: true, sender: 'Office', audience: 'care-managers', text: "Flagging Pat's recent memory concerns (see the family thread) for manager visibility ahead of her next review.", time: '09:05', date: '2026-08-19', receipt: 'read' },
    { id: 8, isMe: false, sender: 'Grace Okafor', text: "Agreed — let's review Pat's care plan at the next check-in given the recent memory concerns.", time: '09:20', date: '2026-08-19' },
    { id: 9, isMe: true, sender: 'Office', audience: 'all-care-staff', text: 'Hi all, could someone let us know how the 4pm visit with Pat went?', time: '18:40', date: '2026-08-19', receipt: 'read' },
    { id: 10, isMe: false, sender: 'Adrianna Yates', text: "Pat didn't take her medication until later than usual — wanted to flag in case it happens again.", time: '18:58', date: '2026-08-19' },
    // Deliberately a different sender from the reply above — this is the
    // whole point of an 'all-care-staff' audience: whoever's actually
    // covering Pat next can see and add to the same thread, not just
    // whoever the office originally messaged.
    { id: 11, isMe: false, sender: 'Priya Shah', text: "Thanks for flagging Adrianna — I've got Pat tomorrow morning, I'll keep an eye on this.", time: '19:47', date: '2026-08-19' },
  ],
  3: [
    { id: 1, isMe: false, sender: 'Mark Allin', text: "Hi, I wanted to raise something — Pat seemed a bit more forgetful than usual when I called her yesterday. Is this something you've noticed too?", time: '10:02', date: '2026-08-19' },
    { id: 2, isMe: true, sender: 'Office', text: "Thanks for letting us know, Mark. We'll ask the care team to keep a closer eye on this during visits.", time: '14:30', date: '2026-08-19', receipt: 'delivered' },
    { id: 3, isMe: false, sender: 'Mark Allin', text: 'Did anything come up today?', time: '19:00', date: '2026-08-19' },
    { id: 4, isMe: true, sender: 'Office', text: "Yes, she was a bit confused about the time but nothing outside of what we'd expect — we'll keep a close eye on her.", time: '19:32', date: '2026-08-19' },
  ],
}

// Dummy content for the "View care notes" inline modal — visit-linked
// threads only. Care Notes itself has no real prototype yet (unbuilt tab in
// Components/CustomerProfileNav.jsx), so this is illustrative content, not
// a link into a built feature.
export const CARE_NOTES_BY_VISIT = {
  'Evening Visit 17:30, 18/08/26': [
    { label: 'Mood', value: 'Settled and talkative throughout the visit.' },
    { label: 'Meals', value: 'Ate full dinner, no concerns.' },
    { label: 'Medication', value: 'Evening medication administered on time.' },
    { label: 'Mobility', value: 'Used walking frame as usual, no falls or near-misses.' },
  ],
}
