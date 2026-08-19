// Three thread kinds on this customer's Communications tab:
//  - 'openpass-visit'    openPASS user <-> office, tied to a specific visit
//                        (shows the visit label instead of a subject, and a
//                        "View care notes" action in the thread header)
//  - 'employee'          office <-> care worker(s), about this customer.
//                        NOT 1:1 — Ben corrected an earlier version of this
//                        prototype that modelled it as one thread per named
//                        employee (mirroring web/messaging's own stable 1:1
//                        threads). The real constraint: a message here needs
//                        a visibility/audience choice — 'Care Managers' or
//                        'All care staff' — since a customer-specific note
//                        (e.g. a medication timing issue) needs to reach
//                        whoever's actually covering this customer, not one
//                        fixed person who might not be rostered next time.
//                        This audience concept doesn't exist in the live
//                        product yet — Ben flagged it as something that
//                        needs to be added, not something already built
//                        elsewhere to copy. See [[project_client_oriented_messaging]]
//                        memory: this is also a plausible answer to the
//                        earlier open question about whether the existing
//                        carer thread already does what Lee's feedback asked
//                        for (auto-following whoever's currently rostered) —
//                        'All care staff' visibility would do exactly that.
//                        Each thread carries one fixed `audience`; the
//                        thread's title is the audience label (not a
//                        person's name), and individual messages still show
//                        their real sender, since a human wrote each one.
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
    audience: 'all-care-staff',
    lastSender: 'Priya Shah',
    lastMessage: "Thanks for flagging Adrianna — I've got Pat tomorrow morning, I'll keep an eye on this.",
    time: '19:15',
    unread: false,
  },
  {
    id: 3,
    kind: 'openpass-general',
    personName: 'Mark Allin',
    subject: 'Memory concerns',
    lastSender: 'Office',
    lastMessage: "Yes, she was a bit confused about the time but nothing outside of what we'd expect — we'll keep a close eye on her.",
    time: '19:15',
    unread: true,
  },
  {
    id: 4,
    kind: 'employee',
    audience: 'care-managers',
    lastSender: 'Grace Okafor',
    lastMessage: "Agreed — let's review Pat's care plan at the next check-in given the recent memory concerns.",
    time: '09:20',
    unread: false,
  },
]

export const THREAD_MESSAGES = {
  1: [
    { id: 1, isMe: false, sender: 'Mark Allin', text: "Hi, just checking in — how did this evening's visit go?", time: '18:52', day: 'Today' },
    { id: 2, isMe: true, sender: 'Office', text: 'Hi Mark, all went smoothly. Pat was in good spirits and had her dinner and evening medication as usual.', time: '19:05', day: 'Today', receipt: 'read' },
    { id: 3, isMe: false, sender: 'Mark Allin', text: "I'm glad she was in a good mood today, thank you for letting me know.", time: '19:15', day: 'Today' },
  ],
  2: [
    { id: 1, isMe: true, sender: 'Office', text: 'Hi all, could someone let us know how the 4pm visit with Pat went?', time: '18:40', day: 'Today', receipt: 'read' },
    { id: 2, isMe: false, sender: 'Adrianna Yates', text: "Pat didn't take her medication until later than usual — wanted to flag in case it happens again.", time: '18:58', day: 'Today' },
    // Deliberately a different sender from the reply above — this is the
    // whole point of an 'all-care-staff' audience over a fixed 1:1 thread:
    // whoever's actually covering Pat next can see and add to the same
    // thread, not just whoever the office originally messaged.
    { id: 3, isMe: false, sender: 'Priya Shah', text: "Thanks for flagging Adrianna — I've got Pat tomorrow morning, I'll keep an eye on this.", time: '19:15', day: 'Today' },
  ],
  3: [
    { id: 1, isMe: false, sender: 'Mark Allin', text: "Hi, I wanted to raise something — Pat seemed a bit more forgetful than usual when I called her yesterday. Is this something you've noticed too?", time: '10:02', day: 'Today' },
    { id: 2, isMe: true, sender: 'Office', text: "Thanks for letting us know, Mark. We'll ask the care team to keep a closer eye on this during visits.", time: '14:30', day: 'Today', receipt: 'delivered' },
    { id: 3, isMe: false, sender: 'Mark Allin', text: 'Did anything come up today?', time: '19:00', day: 'Today' },
    { id: 4, isMe: true, sender: 'Office', text: "Yes, she was a bit confused about the time but nothing outside of what we'd expect — we'll keep a close eye on her.", time: '19:15', day: 'Today' },
  ],
  4: [
    { id: 1, isMe: true, sender: 'Office', text: "Flagging Pat's recent memory concerns (see the family thread) for manager visibility ahead of her next review.", time: '09:05', day: 'Today', receipt: 'read' },
    { id: 2, isMe: false, sender: 'Grace Okafor', text: "Agreed — let's review Pat's care plan at the next check-in given the recent memory concerns.", time: '09:20', day: 'Today' },
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
