// Shared mock threads — single source of truth so the unread-messages
// badge stays in sync between the messaging prototype and any other
// prototype's nav badge (Account tab, "Messages" menu row), same pattern
// as Components/notificationsData.js.

export const THREADS = [
  {
    id: 1,
    title: 'Blue Bird Sheffield — Team Update',
    isBroadcast: true,
    careReceiver: null,
    participants: 'Office',
    lastSender: 'Office',
    lastMessage: "Just a reminder the weekly handover meeting is Thursday at 4pm. Please make sure your visit notes are up to date beforehand.",
    time: '10:42 AM',
    unread: 1,
    sentByMe: false,
    archivedByCarer: false,
  },
  {
    id: 2,
    title: 'Medication Query',
    careReceiver: null,
    participants: 'Office',
    lastSender: 'Office',
    lastMessage: "Morning Adrianna, just a follow up on Margaret. Did you manage to speak with her son at the visit?",
    time: '9:15 AM',
    unread: 1,
    sentByMe: false,
    archivedByCarer: false,
  },
  {
    id: 3,
    title: 'Friday Shift — Swap Request',
    careReceiver: null,
    participants: 'Office',
    lastSender: 'Office',
    lastMessage: "No problem at all Adrianna, we'll sort it. Tom will cover your Friday 6th visit.",
    time: 'Yesterday',
    unread: 0,
    sentByMe: false,
    archivedByCarer: false,
  },
  {
    id: 5,
    title: 'Attachment Examples',
    careReceiver: null,
    participants: 'Office',
    lastSender: 'Office',
    lastMessage: 'Please see the training video above.',
    time: '10:35 AM',
    unread: 0,
    sentByMe: false,
    archivedByCarer: false,
  },
  {
    id: 4,
    title: 'Annual Leave — July',
    careReceiver: null,
    participants: 'Office',
    lastSender: 'You',
    lastMessage: "I'd like to request annual leave from 14th July to 18th July if possible.",
    time: 'Mon',
    unread: 0,
    sentByMe: true,
    deliveredNotRead: true,
    archivedByCarer: false,
  },
]

export const UNREAD_MESSAGES_COUNT = THREADS.filter(t => !t.archivedByCarer).reduce((sum, t) => sum + t.unread, 0)

// Messages lives under Account now (no dedicated nav tab), and Account's
// screen + the messaging app itself are separate static prototype pages
// with no shared backend. localStorage simulates "the carer has opened
// messages" persisting across that page boundary, so the badge actually
// stays cleared when navigating back to Account/Notifications instead of
// resetting on every page load.
const MESSAGES_READ_KEY = 'pass-prototype-messages-read'

export function hasReadMessages() {
  try { return localStorage.getItem(MESSAGES_READ_KEY) === 'true' } catch { return false }
}

export function markMessagesRead() {
  try { localStorage.setItem(MESSAGES_READ_KEY, 'true') } catch { /* ignore */ }
}
