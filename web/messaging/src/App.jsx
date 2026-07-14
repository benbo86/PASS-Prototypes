import { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import SideNav from '../../../Components/SideNav'
import TopNav from '../../../Components/TopNav'

// ─── Icons ────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
)
const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5.00125 16.2458L5.00125 18.6099C5.00125 18.8277 5.17234 18.9988 5.39008 18.9988L7.7542 18.9988C7.8553 18.9988 7.9564 18.9599 8.02639 18.8821L16.5185 10.3977L13.6023 7.48146L5.1179 15.9658C5.04013 16.0436 5.00125 16.1369 5.00125 16.2458ZM18.7738 8.1425C19.0771 7.83919 19.0771 7.34926 18.7738 7.04597L16.954 5.22622C16.6507 4.92293 16.1608 4.92293 15.8575 5.22622L14.4344 6.64935L17.3506 9.56562L18.7738 8.1425Z"/>
  </svg>
)
const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
)
const CloseIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
)
const ArchiveIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.15.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/>
  </svg>
)
const GroupIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
)
const PersonIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
)
const MapPinIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <g transform="translate(5, 3)" fill="currentColor">
      <path d="M7.00005192,0 C9.20321149,0 11.2406469,1.00396045 12.5689437,2.75376482 C14.4241722,5.2002101 14.4757064,8.56321728 12.7226637,11.0617419 L12.5679835,11.2737425 L7.68915023,17.6588892 C7.64275576,17.7196077 7.58858253,17.7739295 7.52803012,17.8204513 C7.1767269,18.0903536 6.68540691,18.0494818 6.38255112,17.7414404 L6.3109536,17.6588892 L1.43116014,11.272481 C-0.477074945,8.75613733 -0.477074945,5.27010853 1.43128954,2.75359427 C2.75945696,1.00396045 4.79689234,0 7.00005192,0 Z M7,9 C8.20812289,9 9.1875,8.04061018 9.1875,6.85714286 C9.1875,5.67367554 8.20812289,4.71428571 7,4.71428571 C5.79187711,4.71428571 4.8125,5.67367554 4.8125,6.85714286 C4.8125,8.04061018 5.79187711,9 7,9 Z" />
    </g>
  </svg>
)
const EmployeesIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M6.34529323,13.6992001 C6.98659064,13.9861115 7.69403084,14.1492572 8.44173186,14.1492572 C8.83563565,14.1492572 9.21916363,14.1039779 9.58727007,14.0191771 C8.13951251,14.6947293 7.11265435,16.3547899 7.11265435,17.9622169 L7.11265435,18.6498286 C7.11265435,19.3952357 7.73094558,20 8.49302546,20 L3.38037111,20 C2.61829123,20 2,19.3952357 2,18.6498286 L2,17.9622169 C2,15.8750769 3.73121544,13.6992001 5.86503911,13.6992001 L6.34529323,13.6992001 Z M13.3845982,13.6992001 C14.0316964,13.9861115 14.7455357,14.1492572 15.5,14.1492572 C16.2544643,14.1492572 16.9712054,13.9861115 17.6154018,13.6992001 L18.1,13.6992001 C20.253125,13.6992001 22,15.8750769 22,17.9622169 L22,18.6498286 C22,19.3952357 21.3761161,20 20.6071429,20 L10.3928571,20 C9.62388393,20 9,19.3952357 9,18.6498286 L9,17.9622169 C9,15.8750769 10.746875,13.6992001 12.9,13.6992001 Z M19.6758297,16.8496 L17.2371129,16.8496 C16.9609705,16.8496 16.7371129,17.0734577 16.7371129,17.3496 L16.7371129,18.2311353 C16.7371129,18.5072776 16.9609705,18.7311353 17.2371129,18.7311353 L19.6758297,18.7311353 C19.9519721,18.7311353 20.1758297,18.5072776 20.1758297,18.2311353 L20.1758297,17.3496 C20.1758297,17.0734577 19.9519721,16.8496 19.6758297,16.8496 Z M8.44173186,5 C9.43518456,5 10.3366335,5.384812 10.9988003,6.01037989 C10.3047346,6.66418301 9.87339658,7.5829878 9.87339658,8.60045709 C9.87339658,9.61792638 10.3047346,10.5367312 10.9983346,11.1914945 C10.3366335,11.8161022 9.43518456,12.2009142 8.44173186,12.2009142 C6.40856024,12.2009142 4.76074222,10.5891471 4.76074222,8.60045709 C4.76074222,6.61176712 6.40856024,5 8.44173186,5 Z M15.5,5 C17.5515625,5 19.2142857,6.61176712 19.2142857,8.60045709 C19.2142857,10.5891471 17.5515625,12.2009142 15.5,12.2009142 C13.4484375,12.2009142 11.7857143,10.5891471 11.7857143,8.60045709 C11.7857143,6.61176712 13.4484375,5 15.5,5 Z"/>
  </svg>
)
const BroadcastIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM19.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v4h2v-4h1l5 3V6L8 9H4zm11.5 3c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.01 1.5-3.34z"/>
  </svg>
)
const AttachIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 015 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 005 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
  </svg>
)
const CheckDoubleIcon = ({ read }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className={`receipt-icon ${read ? 'receipt-read' : 'receipt-delivered'}`}>
    <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/>
  </svg>
)
const CheckSentIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="receipt-icon receipt-sent">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
)
const UnreadBubbleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
    <circle cx="19" cy="5" r="3.5"/>
  </svg>
)
const ReplyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>
  </svg>
)
const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
  </svg>
)
const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)
const PlusIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
)
const FilterIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15,17 C15,16.4477153 14.5522847,16 14,16 L10,16 C9.44771525,16 9,16.4477153 9,17 C9,17.5522847 9.44771525,18 10,18 L14,18 C14.5522847,18 15,17.5522847 15,17 Z M18,12 C18,11.4477153 17.5522847,11 17,11 L7,11 C6.44771525,11 6,11.4477153 6,12 C6,12.5522847 6.44771525,13 7,13 L17,13 C17.5522847,13 18,12.5522847 18,12 Z M4,8 L20,8 C20.5522847,8 21,7.55228475 21,7 C21,6.44771525 20.5522847,6 20,6 L4,6 C3.44771525,6 3,6.44771525 3,7 C3,7.55228475 3.44771525,8 4,8 Z"/>
  </svg>
)
const ChevronRightIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8.29999 7.70005L12.9 12.3L8.29999 16.9L9.69999 18.3L15.7 12.3L9.69999 6.30005L8.29999 7.70005Z"/>
  </svg>
)

// ─── Data ─────────────────────────────────────────────────────

const CARERS = [
  { id: 1,  name: 'Sarah Mitchell',  initials: 'SM', area: 'North Sheffield' },
  { id: 2,  name: 'Karen Bailey',    initials: 'KB', area: 'North Sheffield' },
  { id: 3,  name: 'Tom Harris',      initials: 'TH', area: 'South Sheffield' },
  { id: 4,  name: 'Priya Sharma',    initials: 'PS', area: 'South Sheffield' },
  { id: 5,  name: 'James Okafor',    initials: 'JO', area: 'Rotherham Central' },
  { id: 6,  name: 'Linda Peters',    initials: 'LP', area: 'Rotherham Central' },
  { id: 7,  name: 'David Chen',      initials: 'DC', area: 'North Sheffield' },
  { id: 8,  name: 'Emma Richardson', initials: 'ER', area: 'South Sheffield' },
  { id: 9,  name: 'Michael Hughes',  initials: 'MH', area: 'Rotherham Central' },
  { id: 10, name: 'Olivia Brooks',   initials: 'OB', area: 'North Sheffield' },
  { id: 11, name: 'Nathan Wells',    initials: 'NW', area: 'South Sheffield' },
  { id: 12, name: 'Chloe Barker',    initials: 'CB', area: 'Rotherham Central' },
  { id: 13, name: 'Ryan Sutton',     initials: 'RS', area: 'North Sheffield' },
  { id: 14, name: 'Fiona Marsh',     initials: 'FM', area: 'South Sheffield' },
  { id: 15, name: 'Callum Reid',     initials: 'CR', area: 'Rotherham Central' },
]

const TAG_TYPES = [
  { id: 1, name: 'Care Home' },
  { id: 2, name: 'Area' },
  { id: 3, name: 'Shift Pattern' },
]

const TAGS = [
  { id: 101, typeId: 1, name: 'Blue Bird Sheffield',  memberCount: 15 },
  { id: 102, typeId: 1, name: 'Sunrise Rotherham',    memberCount: 8  },
  { id: 103, typeId: 1, name: 'Meadow View Leeds',    memberCount: 6  },
  { id: 104, typeId: 2, name: 'North Sheffield',      memberCount: 11 },
  { id: 105, typeId: 2, name: 'South Sheffield',      memberCount: 9  },
  { id: 106, typeId: 2, name: 'Rotherham Central',    memberCount: 14 },
  { id: 107, typeId: 3, name: 'Early Shift',          memberCount: 12 },
  { id: 108, typeId: 3, name: 'Late Shift',           memberCount: 10 },
  { id: 109, typeId: 3, name: 'Weekend',              memberCount: 7  },
]

const THREADS = [
  {
    id: 1,
    title: 'Care Homes — Team Update',
    isGroup: false,
    isBroadcast: true,
    replyAllowed: false,
    participants: 'Blue Bird Sheffield, Sunrise Rotherham, Meadow View Leeds, North Sheffield, South Sheffield · 49 employees',
    participantList: ['Blue Bird Sheffield', 'Sunrise Rotherham', 'Meadow View Leeds', 'North Sheffield', 'South Sheffield'],
    areaTags: [
      { name: 'Blue Bird Sheffield', memberCount: 15 },
      { name: 'Sunrise Rotherham', memberCount: 8 },
      { name: 'Meadow View Leeds', memberCount: 6 },
      { name: 'North Sheffield', memberCount: 11 },
      { name: 'South Sheffield', memberCount: 9 },
    ],
    lastSender: 'Office',
    lastMessage: "Just a reminder the weekly handover meeting is Thursday at 4pm.",
    time: '10:42 AM',
    unread: 0,
    archivedByOffice: false,
    broadcastRecipientCount: 49,
    broadcastReadCount: 31,
  },
  {
    id: 2,
    title: 'Medication Query',
    isGroup: false,
    isBroadcast: false,
    replyAllowed: true,
    participants: 'Adrianna Jackson',
    participantList: ['Adrianna Jackson'],
    area: 'North Sheffield',
    lastSender: 'Office',
    lastMessage: "Morning Adrianna, just a follow up on Margaret. Did you manage to speak with her son at the visit? We received a call from him this morning.",
    time: '9:15 AM',
    unread: 0,
    archivedByOffice: false,
  },
  {
    id: 3,
    title: 'Friday Shift — Swap Request',
    isGroup: false,
    isBroadcast: false,
    replyAllowed: true,
    participants: 'Adrianna Jackson',
    participantList: ['Adrianna Jackson'],
    area: 'North Sheffield',
    lastSender: 'Office',
    lastMessage: "No problem at all Adrianna, we'll sort it. Tom will cover your Friday 6th visit.",
    time: 'Yesterday',
    unread: 0,
    archivedByOffice: false,
  },
  {
    id: 4,
    title: 'Annual Leave — July',
    isGroup: false,
    isBroadcast: false,
    replyAllowed: true,
    participants: 'Adrianna Jackson',
    participantList: ['Adrianna Jackson'],
    area: 'North Sheffield',
    lastSender: 'Adrianna Jackson',
    lastMessage: "I'd like to request annual leave from 14th July to 18th July if possible.",
    time: 'Mon',
    unread: 0,
    archivedByOffice: false,
  },
  {
    id: 5,
    title: 'Road Closures — This Week',
    isGroup: false,
    isBroadcast: true,
    replyAllowed: false,
    participants: 'All employees (47)',
    participantList: [],
    lastSender: 'Office',
    lastMessage: "Please be aware of road closures on the A57 this week due to utility works.",
    time: 'Yesterday',
    unread: 0,
    archivedByOffice: false,
    broadcastRecipientCount: 47,
    broadcastReadCount: 0,
  },
  {
    id: 6,
    title: 'Shift Confirmation',
    isGroup: false,
    isBroadcast: false,
    replyAllowed: true,
    participants: 'Tom Harris',
    participantList: ['Tom Harris'],
    area: 'South Sheffield',
    lastSender: 'Tom Harris',
    lastMessage: "Just confirming I'm all set for the Friday cover visit at 6pm.",
    time: 'Tue',
    unread: 1,
    archivedByOffice: false,
  },
  {
    id: 7,
    title: 'Care Plan Update — Mr. Okonkwo',
    isGroup: false,
    isBroadcast: false,
    replyAllowed: true,
    participants: 'James Okafor',
    participantList: ['James Okafor'],
    area: 'Rotherham Central',
    lastSender: 'Office',
    lastMessage: "Thanks for flagging this — the care plan has been updated to reflect the new mobility support.",
    time: 'Mon',
    unread: 0,
    archivedByOffice: false,
  },
  {
    id: 8,
    title: 'Weekend Rota — Cover Needed',
    isGroup: true,
    isBroadcast: false,
    replyAllowed: true,
    participants: 'Tom Harris, Priya Sharma, James Okafor, Linda Peters, Olivia Brooks',
    participantList: ['Tom Harris', 'Priya Sharma', 'James Okafor', 'Linda Peters', 'Olivia Brooks'],
    lastSender: 'Office',
    lastMessage: "Thanks everyone — Saturday's cover is now sorted between the five of you.",
    time: 'Wed',
    unread: 2,
    archivedByOffice: false,
  },
]

const CURRENT_OFFICE_USER = 'Karen Ashworth'

const THREAD_MESSAGES = {
  1: [
    { id: 1, isMe: true, senderName: 'Karen Ashworth', text: "Just a reminder the weekly handover meeting is Thursday at 4pm. Please make sure your visit notes are up to date beforehand.", time: '10:42 AM', day: 'Today', attachments: [{ name: 'Weekly_Handover_Agenda.pdf', size: '84 KB' }] },
  ],
  2: [
    { id: 1, isMe: true, senderName: 'Karen Ashworth', text: "Hi Adrianna, I wanted to check in about Margaret Thompson's care visit yesterday. Did she take her evening medication? She mentioned to her son that she thought she might have missed it.", time: '2:34 PM', day: 'Yesterday', receipt: 'read' },
    { id: 2, isMe: false, sender: 'Adrianna Jackson', text: "Hi Karen, yes I was there until 5pm and she did take all her medication. I've attached my signed visit notes for reference.", time: '2:47 PM', day: 'Yesterday' },
    { id: 3, isMe: true, senderName: 'Karen Ashworth', text: "That's great, thank you! Her son has been a bit worried. Could you also let me know if she mentions any pain during your next visit? She has a GP appointment on Thursday.", time: '2:52 PM', day: 'Yesterday', receipt: 'read' },
    { id: 4, isMe: true, senderName: 'Priya Shah', text: "Morning Adrianna, just a follow up on Margaret. Did you manage to speak with her son at the visit? We received a call from him this morning.", time: '9:15 AM', day: 'Today', receipt: 'delivered' },
  ],
  3: [
    { id: 1, isMe: false, sender: 'Adrianna Jackson', text: "Hi, I was wondering if it would be possible to swap my Friday 6th shift? I have a family commitment that afternoon.", time: 'Fri 11:02 AM', day: 'Friday', receipt: 'read' },
    { id: 2, isMe: true, senderName: 'Liam Foster', text: "Hi Adrianna, thanks for letting us know. Let me check who's available to cover and get back to you.", time: 'Fri 11:45 AM', day: 'Friday' },
    { id: 3, isMe: true, senderName: 'Karen Ashworth', text: "No problem at all Adrianna, we'll sort it. Tom will cover your Friday 6th visit.", time: '4:02 PM', day: 'Yesterday' },
  ],
  4: [
    { id: 1, isMe: false, sender: 'Adrianna Jackson', text: "Hi, I'd like to request annual leave from 14th July to 18th July if possible. Happy to discuss if needed.", time: 'Mon 9:20 AM', day: 'Monday', receipt: 'delivered' },
  ],
  5: [
    { id: 1, isMe: true, senderName: 'Karen Ashworth', text: "Please be aware of road closures on the A57 this week due to utility works near Hillsborough. Affected roads include A57 Penistone Road, Herries Road, and parts of Middlewood Road — works are expected to run until Friday. Please allow extra travel time on visits in that area.", time: '9:10 AM', day: 'Yesterday' },
  ],
  6: [
    { id: 1, isMe: true, senderName: 'Karen Ashworth', text: "Hi Tom, can you cover the Friday 6th visit at 6pm? Should be a straightforward personal care call.", time: 'Tue 10:15 AM', day: 'Tuesday', receipt: 'read' },
    { id: 2, isMe: false, sender: 'Tom Harris', text: "Just confirming I'm all set for the Friday cover visit at 6pm.", time: 'Tue 10:41 AM', day: 'Tuesday' },
  ],
  7: [
    { id: 1, isMe: false, sender: 'James Okafor', text: "Wanted to flag that Mr. Okonkwo's mobility has changed since last week — he now needs the walking frame for all transfers.", time: 'Mon 8:52 AM', day: 'Monday', receipt: 'read' },
    { id: 2, isMe: true, senderName: 'Karen Ashworth', text: "Thanks for flagging this — the care plan has been updated to reflect the new mobility support.", time: 'Mon 1:20 PM', day: 'Monday' },
  ],
  8: [
    { id: 1, isMe: true, senderName: 'Karen Ashworth', text: "We still need cover for Saturday's morning visits — can anyone take an extra shift?", time: 'Wed 9:02 AM', day: 'Wednesday', receipt: 'read' },
    { id: 2, isMe: false, sender: 'Tom Harris', text: "I can cover the 8am–12pm slot.", time: 'Wed 9:30 AM', day: 'Wednesday' },
    { id: 3, isMe: false, sender: 'Olivia Brooks', text: "Happy to take the afternoon if needed.", time: 'Wed 9:41 AM', day: 'Wednesday' },
    { id: 4, isMe: true, senderName: 'Karen Ashworth', text: "Thanks everyone — Saturday's cover is now sorted between the five of you.", time: 'Wed 10:15 AM', day: 'Wednesday' },
  ],
}

// ─── Helpers ──────────────────────────────────────────────────

function getInitials(name) {
  const parts = name.trim().split(' ')
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

function nameToColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return INITIALS_COLORS[Math.abs(hash) % INITIALS_COLORS.length]
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Measures how many of `items` fit on one line of the real (visible)
// container before an overflow indicator is needed, re-measuring whenever
// the container is resized (e.g. the sidebar being dragged wider). Each
// consumer renders a matching hidden row (via itemRefs/moreRef) purely so
// real widths can be measured, plus the actual visible row sliced to
// visibleCount — the hidden row never affects layout.
function useOverflowFit(items, gap) {
  const containerRef = useRef(null)
  const itemRefs = useRef([])
  const moreRef = useRef(null)
  const [visibleCount, setVisibleCount] = useState(items.length)

  useEffect(() => {
    const container = containerRef.current
    if (!container || items.length === 0) return

    const recalc = () => {
      const containerWidth = container.offsetWidth
      const widths = items.map((_, i) => itemRefs.current[i]?.offsetWidth || 0)
      const totalWidth = widths.reduce((sum, w, i) => sum + w + (i > 0 ? gap : 0), 0)
      if (totalWidth <= containerWidth) {
        setVisibleCount(items.length)
        return
      }
      const moreWidth = (moreRef.current?.offsetWidth || 0) + gap
      const budget = containerWidth - moreWidth
      let used = 0
      let fit = 0
      for (let i = 0; i < items.length; i++) {
        const next = used + widths[i] + (i > 0 ? gap : 0)
        if (next > budget) break
        used = next
        fit = i + 1
      }
      setVisibleCount(Math.max(fit, 1))
    }

    recalc()
    const ro = new ResizeObserver(recalc)
    ro.observe(container)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, items.join(' '), gap])

  return { containerRef, itemRefs, moreRef, visibleCount }
}

// Comma-separated recipient names, truncated to what fits on one line
// with a trailing "+N" for the rest.
function RecipientNames({ names }) {
  const { containerRef, itemRefs, moreRef, visibleCount } = useOverflowFit(names, 4)
  const hiddenCount = names.length - visibleCount

  return (
    <div className="msg-thread-recipient" ref={containerRef}>
      <div className="msg-thread-overflow-measure" aria-hidden="true">
        {names.map((name, i) => (
          <span key={i} ref={el => itemRefs.current[i] = el} className="msg-thread-recipient-name">
            {name}{i < names.length - 1 ? ',' : ''}
          </span>
        ))}
        <span ref={moreRef} className="msg-thread-more">+{names.length}</span>
      </div>
      {names.slice(0, visibleCount).map((name, i) => (
        <span key={i} className="msg-thread-recipient-name">
          {name}{i < names.length - 1 ? ',' : ''}
        </span>
      ))}
      {hiddenCount > 0 && <span className="msg-thread-more">+{hiddenCount}</span>}
    </div>
  )
}

// Area/tag pills, truncated the same way — as many badges as fit on one
// line, then "+N" for the rest.
// tags: array of { name, memberCount }. showCount also renders each tag's
// member count (used in the open thread's header; the sidebar row omits it).
function AreaTags({ tags, showCount = false }) {
  const names = tags.map(t => t.name)
  const { containerRef, itemRefs, moreRef, visibleCount } = useOverflowFit(names, 6)
  const hiddenCount = tags.length - visibleCount

  const renderTag = (t, ref) => (
    <span key={t.name} ref={ref} className="msg-area-badge">
      {t.name}{showCount && <span className="msg-area-badge-count"> {t.memberCount}</span>}
    </span>
  )

  return (
    <div className="msg-thread-area-row" ref={containerRef}>
      <div className="msg-thread-overflow-measure" aria-hidden="true">
        {tags.map((t, i) => renderTag(t, el => itemRefs.current[i] = el))}
        <span ref={moreRef} className="msg-area-badge msg-thread-more-pill">+{tags.length}</span>
      </div>
      {tags.slice(0, visibleCount).map(t => renderTag(t))}
      {hiddenCount > 0 && <span className="msg-area-badge msg-thread-more-pill">+{hiddenCount}</span>}
    </div>
  )
}

// ─── Thread Row ────────────────────────────────────────────────

function ThreadRow({ thread, isActive, onClick }) {
  const isUnread = thread.unread > 0
  const firstName = thread.participantList[0] || ''
  const palette = !thread.isBroadcast && firstName ? nameToColor(firstName) : null
  const extraCount = !thread.isBroadcast && thread.participantList.length > 1
    ? thread.participantList.length - 1
    : 0

  return (
    <div
      className={`msg-thread-row${isActive ? ' active' : ''}${isUnread ? ' unread' : ''}`}
      onClick={onClick}
    >
      <div
        className={`msg-thread-avatar${thread.isBroadcast ? ' broadcast' : ''}`}
        style={palette ? { background: palette.bg, color: palette.fg } : {}}
      >
        {thread.isBroadcast
          ? <BroadcastIcon size={18} />
          : <span className="msg-thread-initials">{getInitials(firstName)}</span>
        }
        {extraCount > 0 && <span className="msg-thread-extra">+{extraCount}</span>}
      </div>
      <div className="msg-thread-body">
        <div className="msg-thread-top">
          <span className="msg-thread-name">{thread.title}</span>
          <span className="msg-thread-time">{thread.time}</span>
        </div>
        {!thread.areaTags && (
          thread.participantList.length > 0
            ? <RecipientNames names={thread.participantList} />
            : <span className="msg-thread-recipient-plain">{thread.participants}</span>
        )}
        {thread.areaTags && <AreaTags tags={thread.areaTags} showCount />}
        <div className="msg-thread-preview-row">
          <span className="msg-thread-preview">
            <span className="msg-thread-sender">{thread.lastSender}: </span>
            {thread.lastMessage}
          </span>
          {isUnread
            ? <span className="msg-unread-badge">{thread.unread}</span>
            : null
          }
        </div>
      </div>
    </div>
  )
}

// ─── Sidebar ───────────────────────────────────────────────────

const MESSAGE_TYPE_OPTIONS = ['Message', 'Broadcast']

function threadAreas(t) {
  if (t.area) return [t.area]
  if (t.areaTags) return t.areaTags.map(a => a.name)
  return []
}

// Checkbox list + in-list search shown in the flyout for one filter category.
// Ticking an option applies it immediately — there's no separate Apply step,
// since this is a quick hover-driven pick rather than the FilterDropdown's
// click-to-open-then-confirm pattern. Portaled to document.body (see
// FilterMenu below) and positioned off the hovered menu item's rect.
function FilterCategorySubmenu({ anchorRect, menuRef, options, selected, onToggle }) {
  const [query, setQuery] = useState('')
  const visible = options.filter(o => o.toLowerCase().includes(query.toLowerCase()))

  return createPortal(
    <div
      className="msg-filter-submenu"
      ref={menuRef}
      style={{ position: 'fixed', top: anchorRect.top, left: anchorRect.right + 6 }}
    >
      <div className="search-bar msg-filter-submenu-search">
        <SearchIcon />
        <input
          placeholder="Search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />
      </div>
      <div className="msg-filter-submenu-list">
        {visible.map(opt => (
          <div key={opt} className="fd-item" onClick={() => onToggle(opt)}>
            <span className={`fd-checkbox${selected.has(opt) ? ' checked' : ''}`}>
              {selected.has(opt) && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </span>
            <span className="fd-item-label">{opt}</span>
          </div>
        ))}
        {visible.length === 0 && <span className="fd-empty">No results</span>}
      </div>
    </div>,
    document.body
  )
}

const FILTER_CATEGORIES = [
  { id: 'type', label: 'Type' },
  { id: 'employee', label: 'Employee' },
  { id: 'area', label: 'Area' },
]

// Filter icon → dropdown listing the 3 categories → hovering a category
// opens its checkbox flyout to the side. Both the dropdown and the flyout
// are portaled to document.body and positioned off getBoundingClientRect(),
// same as the shared FilterDropdown component — .msg-sidebar has
// overflow:hidden (for the resize handle), which would otherwise clip or
// misplace anything positioned as a plain descendant.
function FilterMenu({ options, values, setters }) {
  const [open, setOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState(null)
  const [menuRect, setMenuRect] = useState(null)
  const [itemRect, setItemRect] = useState(null)
  const iconRef = useRef(null)
  const menuRef = useRef(null)
  const submenuRef = useRef(null)
  const itemRefs = useRef({})

  const totalCount = values.type.size + values.employee.size + values.area.size

  const toggleOpen = () => {
    if (!open) setMenuRect(iconRef.current.getBoundingClientRect())
    setOpen(v => !v)
    setActiveCategory(null)
  }

  const hoverCategory = (id) => {
    setActiveCategory(id)
    setItemRect(itemRefs.current[id].getBoundingClientRect())
  }

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e) => {
      const inIcon = iconRef.current?.contains(e.target)
      const inMenu = menuRef.current?.contains(e.target)
      const inSubmenu = submenuRef.current?.contains(e.target)
      if (!inIcon && !inMenu && !inSubmenu) {
        setOpen(false)
        setActiveCategory(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const toggle = (categoryId, value) => {
    const current = values[categoryId]
    const next = new Set(current)
    next.has(value) ? next.delete(value) : next.add(value)
    setters[categoryId](next)
  }

  const clearAll = () => {
    FILTER_CATEGORIES.forEach(cat => setters[cat.id](new Set()))
    setOpen(false)
    setActiveCategory(null)
  }

  return (
    <div className="msg-filter-wrap">
      <button
        ref={iconRef}
        className={`msg-filter-icon-btn${open ? ' active' : ''}`}
        onClick={toggleOpen}
        title="Filter"
      >
        <FilterIcon />
        {totalCount > 0 && <span className="msg-filter-badge">{totalCount}</span>}
      </button>
      {open && menuRect && createPortal(
        <div
          className="msg-filter-menu"
          ref={menuRef}
          style={{ position: 'fixed', top: menuRect.bottom + 6, left: menuRect.right }}
        >
          {FILTER_CATEGORIES.map(cat => (
            <div
              key={cat.id}
              ref={el => itemRefs.current[cat.id] = el}
              className={`msg-filter-menu-item${activeCategory === cat.id ? ' active' : ''}`}
              onMouseEnter={() => hoverCategory(cat.id)}
            >
              <span>{cat.label}</span>
              <span className="msg-filter-menu-item-right">
                {values[cat.id].size > 0 && <span className="filter-count">{values[cat.id].size}</span>}
                <ChevronRightIcon />
              </span>
            </div>
          ))}
          {totalCount > 0 && (
            <button
              className="msg-filter-menu-clear"
              onMouseEnter={() => setActiveCategory(null)}
              onClick={clearAll}
            >
              Clear filters
            </button>
          )}
        </div>,
        document.body
      )}
      {open && activeCategory && itemRect && (
        <FilterCategorySubmenu
          menuRef={submenuRef}
          anchorRect={itemRect}
          options={options[activeCategory]}
          selected={values[activeCategory]}
          onToggle={v => toggle(activeCategory, v)}
        />
      )}
    </div>
  )
}

function Sidebar({ threads, activeThreadId, search, onSearch, onSelectThread, onCompose, width, onResizeStart }) {
  const [tab, setTab] = useState('inbox')
  const [showComposeMenu, setShowComposeMenu] = useState(false)
  const composeMenuRef = useRef(null)

  const [employeeFilter, setEmployeeFilter] = useState(new Set())
  const [typeFilter, setTypeFilter] = useState(new Set())
  const [areaFilter, setAreaFilter] = useState(new Set())

  const employeeOptions = useMemo(() => (
    [...new Set(threads.filter(t => !t.isBroadcast).flatMap(t => t.participantList))].sort()
  ), [threads])
  const areaOptions = useMemo(() => (
    [...new Set(threads.flatMap(threadAreas))].sort()
  ), [threads])

  const filterValues = { type: typeFilter, employee: employeeFilter, area: areaFilter }
  const filterSetters = { type: setTypeFilter, employee: setEmployeeFilter, area: setAreaFilter }
  const filterOptions = { type: MESSAGE_TYPE_OPTIONS, employee: employeeOptions, area: areaOptions }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (composeMenuRef.current && !composeMenuRef.current.contains(e.target)) {
        setShowComposeMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = threads.filter(t => {
    const matchesTab = tab === 'inbox' ? !t.archivedByOffice : t.archivedByOffice
    const query = search.toLowerCase()
    const matchesSearch = t.title.toLowerCase().includes(query) ||
      t.lastMessage.toLowerCase().includes(query) ||
      t.participants.toLowerCase().includes(query) ||
      (t.area && t.area.toLowerCase().includes(query)) ||
      (t.areaTags && t.areaTags.some(tag => tag.name.toLowerCase().includes(query)))
    const matchesEmployee = employeeFilter.size === 0 || t.participantList.some(p => employeeFilter.has(p))
    const matchesType = typeFilter.size === 0 || typeFilter.has(t.isBroadcast ? 'Broadcast' : 'Message')
    const matchesArea = areaFilter.size === 0 || threadAreas(t).some(a => areaFilter.has(a))
    return matchesTab && matchesSearch && matchesEmployee && matchesType && matchesArea
  })

  return (
    <div className="msg-sidebar" style={{ width }}>
      <div className="msg-sidebar-header">
        <h2 className="msg-sidebar-title">Messages</h2>
        <div className="msg-compose-btn-wrap" ref={composeMenuRef}>
          <button className="round-btn primary-btn btn-icon-left msg-compose-btn" onClick={() => setShowComposeMenu(v => !v)} title="New message">
            <EditIcon />
            <span>New message</span>
          </button>
          {showComposeMenu && (
            <div className="msg-compose-mode-menu">
              <button onClick={() => { setShowComposeMenu(false); onCompose('employee') }}>
                <PersonIcon size={16} /> Employee
              </button>
              <button onClick={() => { setShowComposeMenu(false); onCompose('broadcast') }}>
                <BroadcastIcon size={16} /> Broadcast
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="msg-sidebar-search">
        <div className="msg-search-bar">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={e => onSearch(e.target.value)}
          />
        </div>
        <FilterMenu options={filterOptions} values={filterValues} setters={filterSetters} />
      </div>
      <div className="msg-sidebar-tabs">
        <button
          className={`msg-sidebar-tab${tab === 'inbox' ? ' active' : ''}`}
          onClick={() => setTab('inbox')}
        >Messages</button>
        <button
          className={`msg-sidebar-tab${tab === 'archived' ? ' active' : ''}`}
          onClick={() => setTab('archived')}
        >Archived</button>
      </div>
      <div className="msg-thread-list">
        {filtered.map(t => (
          <ThreadRow
            key={t.id}
            thread={t}
            isActive={t.id === activeThreadId}
            onClick={() => onSelectThread(t.id)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="msg-empty-list">
            {tab === 'archived' ? 'No archived threads' : 'No messages found'}
          </div>
        )}
      </div>
      <div className="msg-sidebar-resize-handle" onMouseDown={onResizeStart} />
    </div>
  )
}

// ─── Thread View ───────────────────────────────────────────────

function ThreadView({ thread, messages, onSend, onToggleArchive, onMarkUnread }) {
  const [inputText, setInputText] = useState('')
  const [localMsgs, setLocalMsgs] = useState(messages)
  const [replyTo, setReplyTo] = useState(null)
  const [editing, setEditing] = useState(null)
  const [actionTarget, setActionTarget] = useState(null)
  const [attachments, setAttachments] = useState([])
  const endRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleFileAttach = (e) => {
    const files = Array.from(e.target.files)
    setAttachments(prev => [...prev, ...files.map(f => ({ name: f.name, size: formatFileSize(f.size) }))])
    e.target.value = ''
  }

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  useEffect(() => {
    setLocalMsgs(messages)
    setEditing(null)
    setInputText('')
    setReplyTo(null)
    setAttachments([])
  }, [thread.id])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [localMsgs.length, thread.id])

  const appendEvent = (text) => {
    setLocalMsgs(prev => [...prev, { id: Date.now(), type: 'event', text, time: 'Just now', day: 'Today' }])
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  const headerFirstName = thread.participantList[0] || ''
  const headerInitials = !thread.isBroadcast && headerFirstName ? getInitials(headerFirstName) : ''
  const headerPalette = !thread.isBroadcast && headerFirstName ? nameToColor(headerFirstName) : null

  const byDay = localMsgs.reduce((acc, msg) => {
    const last = acc[acc.length - 1]
    if (last && last.day === msg.day) last.msgs.push(msg)
    else acc.push({ day: msg.day, msgs: [msg] })
    return acc
  }, [])

  const handleSend = () => {
    const text = inputText.trim()
    if (!text) return
    if (editing) {
      setLocalMsgs(prev => prev.map(m => m.id === editing.id ? { ...m, text, edited: true } : m))
      setEditing(null)
    } else {
      const newMsg = {
        id: localMsgs.length + 1,
        isMe: true,
        text,
        time: 'Just now',
        day: 'Today',
        ...(replyTo ? { replyTo } : {}),
        ...(attachments.length ? { attachments } : {}),
      }
      setLocalMsgs(prev => [
        ...prev,
        ...(thread.archivedByOffice ? [{ id: Date.now(), type: 'event', text: 'This thread has been unarchived', time: 'Just now', day: 'Today' }] : []),
        newMsg,
      ])
      onSend?.(text, attachments)
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
    setInputText('')
    setReplyTo(null)
    setAttachments([])
  }

  return (
    <div className="msg-thread-view" onClick={() => setActionTarget(null)}>
      {/* Header */}
      <div className="msg-thread-header">
        <div
          className={`msg-thread-header-avatar${thread.isBroadcast ? ' broadcast' : ''}`}
          style={headerPalette ? { background: headerPalette.bg, color: headerPalette.fg } : {}}
        >
          {thread.isBroadcast
            ? <BroadcastIcon size={20} />
            : <span className="msg-thread-initials">{headerInitials}</span>
          }
        </div>
        <div className="msg-thread-header-info">
          <h2>{thread.title}</h2>
          <div className="msg-thread-header-sub-row">
            {thread.areaTags ? (
              <AreaTags tags={thread.areaTags} showCount />
            ) : thread.participantList.length > 0 ? (
              <RecipientNames names={thread.participantList} />
            ) : (
              <span className="msg-thread-header-sub">{thread.participants}</span>
            )}
          </div>
          {thread.isBroadcast && (
            <span className="msg-read-count">{thread.broadcastReadCount} of {thread.broadcastRecipientCount} read</span>
          )}
        </div>
        <div className="msg-thread-header-actions">
          {!thread.archivedByOffice && thread.replyAllowed && (
            <button
              className="round-btn secondary-btn btn-icon-left msg-header-action-btn"
              title="Mark as unread"
              onClick={e => { e.stopPropagation(); onMarkUnread?.() }}
            >
              <UnreadBubbleIcon />
              <span>Mark unread</span>
            </button>
          )}
          <button
            className="round-btn secondary-btn btn-icon-left msg-header-action-btn"
            title={thread.archivedByOffice ? (thread.isBroadcast ? 'Unarchive broadcast' : 'Unarchive thread') : (thread.isBroadcast ? 'Archive broadcast' : 'Archive thread')}
            onClick={e => { e.stopPropagation(); onToggleArchive?.() }}
          >
            <ArchiveIcon size={18} />
            <span>{thread.archivedByOffice ? (thread.isBroadcast ? 'Unarchive broadcast' : 'Unarchive thread') : (thread.isBroadcast ? 'Archive broadcast' : 'Archive thread')}</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="msg-messages-area" onClick={() => setActionTarget(null)}>
        {byDay.map(group => (
          <div key={group.day}>
            <div className="msg-day-sep"><span>{group.day}</span></div>
            {group.msgs.map((msg, i) => {
              if (msg.type === 'event') {
                return (
                  <div key={msg.id} className="msg-event-message">
                    <span>{msg.text}</span>
                  </div>
                )
              }
              return (
                <div
                  key={msg.id}
                  className={`msg-message-group ${msg.isMe ? 'from-me' : 'from-them'}`}
                >
                  {msg.isMe && msg.senderName && <div className="msg-sender-label">{msg.senderName}</div>}
                  <div
                    className={`msg-bubble ${msg.isMe ? 'sent' : 'received'}`}
                    onClick={e => { e.stopPropagation(); setActionTarget(actionTarget?.id === msg.id ? null : msg) }}
                  >
                    {msg.replyTo && (
                      <div className={`msg-reply-quote${msg.isMe ? ' me' : ''}`}>
                        <span className="msg-reply-author">{msg.replyTo.isMe ? 'You' : msg.replyTo.sender}</span>
                        <span className="msg-reply-text">{msg.replyTo.text.slice(0, 80)}{msg.replyTo.text.length > 80 ? '…' : ''}</span>
                      </div>
                    )}
                    <span className="msg-bubble-text">{msg.text}</span>
                    {msg.edited && <span className="msg-edited">(edited)</span>}
                    {msg.attachments?.map((att, i) => (
                      <div key={i} className={`msg-attachment-file ${msg.isMe ? 'sent' : 'received'}`}>
                        <AttachIcon />
                        <div className="msg-attachment-file-info">
                          <span className="msg-attachment-file-name">{att.name}</span>
                          {att.size && <span className="msg-attachment-file-size">{att.size}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="msg-meta">
                    <span className="msg-time">{msg.time}</span>
                    {msg.isMe && msg.receipt === 'read' && <CheckDoubleIcon read={true} />}
                    {msg.isMe && msg.receipt === 'delivered' && <CheckDoubleIcon read={false} />}
                    {msg.isMe && !msg.receipt && <CheckSentIcon />}
                  </div>

                  {/* Inline action menu on click */}
                  {actionTarget?.id === msg.id && (() => {
                    const isOwnMessage = msg.isMe && msg.senderName === CURRENT_OFFICE_USER
                    const broadcastLocked = thread.isBroadcast && thread.broadcastReadCount > 0
                    const lockTitle = `Can't edit or delete — already read by ${thread.broadcastReadCount} of ${thread.broadcastRecipientCount} recipients`
                    return (
                    <div className={`msg-action-menu${msg.isMe ? ' from-me' : ' from-them'}`} onClick={e => e.stopPropagation()}>
                      {thread.replyAllowed && (
                        <button onClick={() => { setReplyTo(msg); setActionTarget(null); inputRef.current?.focus() }}>
                          <ReplyIcon /> Reply
                        </button>
                      )}
                      {isOwnMessage && (
                        <button
                          disabled={broadcastLocked}
                          title={broadcastLocked ? lockTitle : undefined}
                          onClick={() => { setEditing(msg); setInputText(msg.text); setReplyTo(null); setActionTarget(null); inputRef.current?.focus() }}
                        >
                          <EditIcon /> Edit
                        </button>
                      )}
                      {isOwnMessage && (
                        <button
                          className="danger"
                          disabled={broadcastLocked}
                          title={broadcastLocked ? lockTitle : undefined}
                          onClick={() => {
                            setLocalMsgs(prev => prev.filter(m => m.id !== msg.id))
                            setActionTarget(null)
                          }}
                        >
                          <DeleteIcon /> Delete
                        </button>
                      )}
                    </div>
                    )
                  })()}
                </div>
              )
            })}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Reply strip */}
      {replyTo && !editing && (
        <div className="msg-context-strip">
          <div className="msg-context-bar reply" />
          <div className="msg-context-body">
            <span className="msg-context-label">Replying to {replyTo.isMe ? 'yourself' : replyTo.sender}</span>
            <span className="msg-context-preview">{replyTo.text.slice(0, 100)}{replyTo.text.length > 100 ? '…' : ''}</span>
          </div>
          <button className="msg-context-close" onClick={() => setReplyTo(null)}>
            <CloseIcon size={16} />
          </button>
        </div>
      )}

      {/* Edit strip */}
      {editing && (
        <div className="msg-context-strip editing">
          <div className="msg-context-bar edit" />
          <div className="msg-context-body">
            <span className="msg-context-label">Editing message</span>
            <span className="msg-context-preview">{editing.text.slice(0, 100)}{editing.text.length > 100 ? '…' : ''}</span>
          </div>
          <button className="msg-context-close" onClick={() => { setEditing(null); setInputText('') }}>
            <CloseIcon size={16} />
          </button>
        </div>
      )}

      {/* One-way notice */}
      {thread.isBroadcast && (
        <div className="msg-broadcast-notice read-only">
          <BroadcastIcon size={16} />
          <span>This is a read-only broadcast — employees can't reply.</span>
        </div>
      )}

      {/* Attachments-in-progress strip */}
      {!thread.isBroadcast && attachments.length > 0 && (
        <div className="msg-compose-attachments">
          {attachments.map((att, i) => (
            <span key={i} className="msg-compose-attachment-chip">
              <AttachIcon />
              <span className="msg-compose-attachment-name">{att.name}</span>
              <button className="msg-chip-remove" onClick={() => removeAttachment(i)}>
                <CloseIcon size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Compose bar — broadcasts are send-once, so no further messages on this thread */}
      {!thread.isBroadcast && (
        <div className="msg-compose-bar" onClick={e => e.stopPropagation()}>
          <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileAttach} multiple />
          <button className="msg-compose-attach" title="Attach file" onClick={e => { e.stopPropagation(); fileInputRef.current.click() }}>
            <AttachIcon />
          </button>
          <div className="msg-compose-input-wrap">
            <input
              ref={inputRef}
              className="msg-compose-input"
              placeholder="Reply to this thread..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            />
          </div>
          <button
            className={`msg-send-btn${inputText.trim() ? ' active' : ''}`}
            onClick={handleSend}
            disabled={!inputText.trim()}
          >
            <SendIcon />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Compose View ──────────────────────────────────────────────

const INITIALS_COLORS = [
  { bg: '#e8e0f0', fg: '#5a3878' },
  { bg: '#ddeef8', fg: '#1a4a6e' },
  { bg: '#ddf0e8', fg: '#1a5a36' },
  { bg: '#f8eedc', fg: '#6e4210' },
  { bg: '#f0dde8', fg: '#6e1a3c' },
  { bg: '#ddf0ee', fg: '#1a5a52' },
]

function ComposeView({ mode, onSend, onCancel }) {
  const isBroadcast = mode === 'broadcast'

  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [selectedCarer, setSelectedCarer] = useState(null)
  const [broadcastType, setBroadcastType] = useState('all')
  const [selectedCarers, setSelectedCarers] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [recipientSearch, setRecipientSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [attachments, setAttachments] = useState([])
  const dropdownRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleFileAttach = (e) => {
    const files = Array.from(e.target.files)
    setAttachments(prev => [...prev, ...files.map(f => ({ name: f.name, size: formatFileSize(f.size) }))])
    e.target.value = ''
  }

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const filteredCarers = CARERS
    .filter(c => c.name.toLowerCase().includes(recipientSearch.toLowerCase()))
    .sort((a, b) => a.name.split(' ').at(-1).localeCompare(b.name.split(' ').at(-1)))

  const filteredTagTypes = TAG_TYPES.map(type => ({
    ...type,
    tags: TAGS.filter(tag =>
      tag.typeId === type.id &&
      tag.name.toLowerCase().includes(recipientSearch.toLowerCase())
    ),
  })).filter(type => type.tags.length > 0)

  const hasRecipients = isBroadcast
    ? (broadcastType === 'all' || (broadcastType === 'groups' ? selectedTags.length > 0 : selectedCarers.length > 0))
    : !!selectedCarer
  const canSend = title.trim() && message.trim() && hasRecipients

  // Employee mode: single selection, picking a new one replaces the current one
  const selectCarer = (carer) => {
    setSelectedCarer(carer)
    setRecipientSearch('')
    setShowDropdown(false)
  }

  // Broadcast mode, "Selected employees": multi-select
  const toggleCarer = (carer) => {
    setSelectedCarers(prev =>
      prev.some(c => c.id === carer.id) ? prev.filter(c => c.id !== carer.id) : [...prev, carer]
    )
  }

  // Broadcast mode, "Area tags": multi-select
  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.some(t => t.id === tag.id) ? prev.filter(t => t.id !== tag.id) : [...prev, tag]
    )
  }

  const clearAll = () => {
    setSelectedCarer(null)
    setSelectedCarers([])
    setSelectedTags([])
  }

  // The three broadcast targets are mutually exclusive — switching clears the others
  const changeBroadcastType = (type) => {
    setBroadcastType(type)
    setSelectedCarers([])
    setSelectedTags([])
    setRecipientSearch('')
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const showPicker = !isBroadcast || broadcastType !== 'all'

  return (
    <div className="msg-compose-view">
      <div className="msg-compose-header">
        <div className="msg-compose-header-titles">
          <h2>New {isBroadcast ? 'Broadcast' : 'Message'}</h2>
        </div>
        <button className="msg-compose-cancel" onClick={onCancel}>
          <CloseIcon size={20} />
        </button>
      </div>

      <div className="msg-compose-form">

        {/* To field */}
        <div className="msg-compose-field">
          <label className="msg-compose-label">To</label>

          {isBroadcast && (
            <div className="msg-broadcast-type-tabs">
              <button
                className={`msg-broadcast-type-tab${broadcastType === 'all' ? ' active' : ''}`}
                onClick={() => changeBroadcastType('all')}
              ><BroadcastIcon size={14} />All</button>
              <button
                className={`msg-broadcast-type-tab${broadcastType === 'groups' ? ' active' : ''}`}
                onClick={() => changeBroadcastType('groups')}
              ><MapPinIcon size={14} />Area</button>
              <button
                className={`msg-broadcast-type-tab${broadcastType === 'individuals' ? ' active' : ''}`}
                onClick={() => changeBroadcastType('individuals')}
              ><EmployeesIcon size={14} />Employees</button>
            </div>
          )}

          {showPicker && (
            <div className="msg-compose-to-wrap" ref={dropdownRef}>
              <div className="msg-compose-to-inner">
                {/* Employee mode: single selection, shown as plain text (not a removable pill — only one is ever possible) */}
                {!isBroadcast && selectedCarer ? (
                  <div className="msg-compose-single-selected">
                    <span>{selectedCarer.name}</span>
                    <button onClick={() => setSelectedCarer(null)} className="msg-chip-remove">
                      <CloseIcon size={12} />
                    </button>
                  </div>
                ) : !isBroadcast ? (
                  <input
                    className="msg-compose-to-input"
                    placeholder="Search for an employee..."
                    value={recipientSearch}
                    onChange={e => { setRecipientSearch(e.target.value); setShowDropdown(true) }}
                    onFocus={() => setShowDropdown(true)}
                  />
                ) : (
                  <>
                    {/* Broadcast, "Selected employees": multi chips */}
                    {broadcastType === 'individuals' && (() => {
                      const LIMIT = 4
                      const visible = selectedCarers.slice(0, LIMIT)
                      const overflow = selectedCarers.length - LIMIT
                      return (
                        <>
                          {visible.map(c => (
                            <span key={c.id} className="msg-compose-chip msg-compose-chip-broadcast">
                              <BroadcastIcon size={11} />
                              {c.name}
                              <button onClick={() => toggleCarer(c)} className="msg-chip-remove">
                                <CloseIcon size={12} />
                              </button>
                            </span>
                          ))}
                          {overflow > 0 && <span className="msg-compose-chip msg-chip-overflow">+{overflow} more</span>}
                        </>
                      )
                    })()}
                    {/* Broadcast, "Area tags": tag chips */}
                    {broadcastType === 'groups' && selectedTags.map(tag => (
                      <span key={tag.id} className="msg-compose-chip msg-compose-chip-broadcast">
                        <BroadcastIcon size={11} />
                        {tag.name} · {tag.memberCount}
                        <button onClick={() => toggleTag(tag)} className="msg-chip-remove">
                          <CloseIcon size={12} />
                        </button>
                      </span>
                    ))}
                    <input
                      className="msg-compose-to-input"
                      placeholder={
                        hasRecipients ? '' :
                        broadcastType === 'groups' ? 'Search for an area tag...' :
                        'Search for an employee...'
                      }
                      value={recipientSearch}
                      onChange={e => { setRecipientSearch(e.target.value); setShowDropdown(true) }}
                      onFocus={() => setShowDropdown(true)}
                    />
                  </>
                )}
              </div>
              {showDropdown && (
                <div className="msg-carer-dropdown">
                  {(!isBroadcast || broadcastType === 'individuals') && (
                    <>
                      {filteredCarers.map(c => {
                        const palette = INITIALS_COLORS[c.id % INITIALS_COLORS.length]
                        const isSelected = isBroadcast && selectedCarers.some(s => s.id === c.id)
                        return (
                          <div
                            key={c.id}
                            className="msg-carer-option"
                            onClick={() => (isBroadcast ? toggleCarer(c) : selectCarer(c))}
                          >
                            {isBroadcast && (
                              <input type="checkbox" className="msg-option-checkbox" checked={isSelected} onChange={() => {}} />
                            )}
                            <div className="msg-carer-avatar" style={{ background: palette.bg, color: palette.fg }}>
                              {c.initials}
                            </div>
                            <span>{c.name}</span>
                          </div>
                        )
                      })}
                      {filteredCarers.length === 0 && <div className="msg-dropdown-empty">No employees found</div>}
                    </>
                  )}

                  {isBroadcast && broadcastType === 'groups' && (
                    filteredTagTypes.length > 0 ? filteredTagTypes.map(type => (
                      <div key={type.id}>
                        <div className="msg-dropdown-type-header">{type.name}</div>
                        {type.tags.map(tag => {
                          const isSelected = selectedTags.some(s => s.id === tag.id)
                          return (
                            <div key={tag.id} className="msg-carer-option" onClick={() => toggleTag(tag)}>
                              <input type="checkbox" className="msg-option-checkbox" checked={isSelected} onChange={() => {}} />
                              <div className="msg-carer-avatar" style={{ background: '#e8e0f0', color: '#5a3878' }}>
                                <GroupIcon size={16} />
                              </div>
                              <div className="msg-tag-option-body">
                                <span>{tag.name}</span>
                                <span className="msg-tag-member-count">{tag.memberCount} employees</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )) : (
                      recipientSearch && <div className="msg-dropdown-empty">No area tags found</div>
                    )
                  )}

                  {hasRecipients && (
                    <div className="msg-dropdown-clear">
                      <button onMouseDown={e => { e.preventDefault(); clearAll() }}>Clear</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <div className="msg-compose-field">
          <label className="msg-compose-label">Subject <span className="msg-required">*</span></label>
          <input
            className="form-input"
            placeholder="What is this message about?"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        {/* Message */}
        <div className="msg-compose-field msg-compose-field-grow">
          <label className="msg-compose-label">Message <span className="msg-required">*</span></label>
          <textarea
            className="form-textarea msg-compose-textarea"
            placeholder="Write your message..."
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
        </div>

        {/* Attachments */}
        <div className="msg-compose-attachments">
          <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileAttach} multiple />
          <button type="button" className="msg-compose-attach-btn" onClick={() => fileInputRef.current.click()}>
            <AttachIcon /> Attach
          </button>
          {attachments.map((att, i) => (
            <span key={i} className="msg-compose-attachment-chip">
              <AttachIcon />
              <span className="msg-compose-attachment-name">{att.name}</span>
              <button className="msg-chip-remove" onClick={() => removeAttachment(i)}>
                <CloseIcon size={12} />
              </button>
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="msg-compose-actions">
          <button className="round-btn tertiary-btn" onClick={onCancel}>Cancel</button>
          <button
            className="round-btn primary-btn btn-icon-right"
            disabled={!canSend}
            onClick={() => canSend && onSend({
              mode,
              broadcastType: isBroadcast ? broadcastType : undefined,
              title,
              recipients: isBroadcast ? (broadcastType === 'individuals' ? selectedCarers : []) : [selectedCarer],
              tags: isBroadcast && broadcastType === 'groups' ? selectedTags : [],
              message,
              attachments,
            })}
          >
            {isBroadcast ? 'Send broadcast' : 'Send'} <SendIcon />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Empty State ───────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="msg-empty-state">
      <div className="msg-empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
      </div>
      <p>Select a conversation or start a new message</p>
    </div>
  )
}

// ─── Root ──────────────────────────────────────────────────────

export default function App() {
  const [threads, setThreads] = useState(THREADS)
  const [threadMessages, setThreadMessages] = useState(THREAD_MESSAGES)
  const [activeThreadId, setActiveThreadId] = useState(null)
  const [rightPanel, setRightPanel] = useState('empty')
  const [composeMode, setComposeMode] = useState(null)
  const [search, setSearch] = useState('')
  const [sidebarWidth, setSidebarWidth] = useState(320)

  const handleSidebarResizeStart = (e) => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = sidebarWidth
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    const handleMouseMove = (moveEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX)
      setSidebarWidth(Math.min(480, Math.max(240, newWidth)))
    }
    const handleMouseUp = () => {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const [messageBadge, setMessageBadge] = useState(() =>
    THREADS.reduce((sum, t) => sum + t.unread, 0)
  )

  useEffect(() => {
    setMessageBadge(0)
  }, [])

  const activeThread = threads.find(t => t.id === activeThreadId)
  const activeMessages = activeThread ? (threadMessages[activeThreadId] || []) : []

  const handleSelectThread = (id) => {
    setActiveThreadId(id)
    setRightPanel('thread')
    setThreads(prev => prev.map(t => t.id === id ? { ...t, unread: 0 } : t))
  }

  const handleSend = (text, attachments) => {
    const wasArchived = threads.find(t => t.id === activeThreadId)?.archivedByOffice
    const now = Date.now()
    setThreads(prev => {
      const updated = prev.find(t => t.id === activeThreadId)
      if (!updated) return prev
      const rest = prev.filter(t => t.id !== activeThreadId)
      return [
        { ...updated, lastSender: 'Office', lastMessage: text, time: 'Just now', unread: 0, ...(wasArchived ? { archivedByOffice: false } : {}) },
        ...rest,
      ]
    })
    setThreadMessages(prev => {
      const existing = prev[activeThreadId] || []
      const sentMsg = { id: now + 1, isMe: true, text, time: 'Just now', day: 'Today', ...(attachments?.length ? { attachments } : {}) }
      const additions = wasArchived
        ? [
            { id: now, type: 'event', text: 'This thread has been unarchived', time: 'Just now', day: 'Today' },
            sentMsg,
          ]
        : [{ ...sentMsg, id: now }]
      return { ...prev, [activeThreadId]: [...existing, ...additions] }
    })
  }

  const handleToggleArchive = () => {
    const activeThread = threads.find(t => t.id === activeThreadId)
    const isArchived = activeThread?.archivedByOffice
    setThreads(prev => prev.map(t =>
      t.id === activeThreadId ? { ...t, archivedByOffice: !t.archivedByOffice } : t
    ))
    if (!activeThread?.isBroadcast) {
      setThreadMessages(prev => ({
        ...prev,
        [activeThreadId]: [
          ...(prev[activeThreadId] || []),
          { id: Date.now(), type: 'event', text: isArchived ? 'This thread has been unarchived' : 'This thread has been archived', time: 'Just now', day: 'Today' },
        ],
      }))
    }
    setActiveThreadId(null)
    setRightPanel('empty')
  }

  const handleMarkUnread = () => {
    setThreads(prev => prev.map(t =>
      t.id === activeThreadId ? { ...t, unread: 1 } : t
    ))
  }

  const handleNewMessage = ({ mode, broadcastType, title, recipients, tags, message, attachments }) => {
    const baseId = Math.max(...threads.map(t => t.id)) + 1

    if (mode === 'broadcast') {
      const participantsSummary =
        broadcastType === 'groups' ? tags.map(t => `${t.name} · ${t.memberCount} employees`).join(', ') :
        broadcastType === 'all'    ? `All employees (${CARERS.length})` :
        recipients.map(r => r.name).join(', ')
      const participantList =
        broadcastType === 'groups' ? tags.map(t => t.name) :
        broadcastType === 'all'    ? [] :
        recipients.map(r => r.name)
      const newThread = {
        id: baseId,
        title,
        isGroup: false,
        isBroadcast: true,
        replyAllowed: false,
        participants: participantsSummary,
        participantList,
        areaTags: broadcastType === 'groups' && tags.length > 0
          ? tags.map(t => ({ name: t.name, memberCount: t.memberCount }))
          : undefined,
        lastSender: 'Office',
        lastMessage: message,
        time: 'Just now',
        unread: 0,
        archivedByOffice: false,
      }
      setThreads(prev => [newThread, ...prev])
      setThreadMessages(prev => ({
        ...prev,
        [baseId]: [{ id: 1, isMe: true, text: message, time: 'Just now', day: 'Today', ...(attachments?.length ? { attachments } : {}) }],
      }))
      setActiveThreadId(baseId)
      setRightPanel('thread')
    } else {
      // Employee mode — always exactly one recipient, normal 1:1 thread
      const recipient = recipients[0]
      const newThread = {
        id: baseId,
        title,
        isGroup: false,
        isBroadcast: false,
        replyAllowed: true,
        participants: recipient.name,
        participantList: [recipient.name],
        area: recipient.area,
        lastSender: 'Office',
        lastMessage: message,
        time: 'Just now',
        unread: 0,
        archivedByOffice: false,
      }
      setThreads(prev => [newThread, ...prev])
      setThreadMessages(prev => ({
        ...prev,
        [baseId]: [{ id: 1, isMe: true, text: message, time: 'Just now', day: 'Today', ...(attachments?.length ? { attachments } : {}) }],
      }))
      setActiveThreadId(baseId)
      setRightPanel('thread')
    }
  }

  return (
    <div className="messages-page">
      <a href="../../" className="back-link">
        <ChevronLeftIcon /> Prototypes
      </a>
      <SideNav />
      <div className="page-body">
      <TopNav activeItem="messages" unreadMessages={messageBadge} />
      <div className="messages-layout">
        <Sidebar
          threads={threads}
          activeThreadId={activeThreadId}
          search={search}
          onSearch={setSearch}
          onSelectThread={handleSelectThread}
          onCompose={(mode) => { setActiveThreadId(null); setComposeMode(mode); setRightPanel('compose') }}
          width={sidebarWidth}
          onResizeStart={handleSidebarResizeStart}
        />
        <div className="msg-main">
          {rightPanel === 'empty' && <EmptyState />}
          {rightPanel === 'thread' && activeThread && (
            <ThreadView
              key={activeThreadId}
              thread={activeThread}
              messages={activeMessages}
              onSend={handleSend}
              onToggleArchive={handleToggleArchive}
              onMarkUnread={handleMarkUnread}
            />
          )}
          {rightPanel === 'compose' && (
            <ComposeView
              mode={composeMode}
              onSend={handleNewMessage}
              onCancel={() => setRightPanel('empty')}
            />
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
