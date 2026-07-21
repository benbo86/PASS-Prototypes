import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import StatusBar from '../../../Components/StatusBar'
import AppNav from '../../../Components/AppNav'
import ScreenSlider from '../../../Components/ScreenSlider'
import AccountScreen from '../../../Components/AccountScreen'
import DevMode from '../../../Components/DevMode'
import { UNREAD_NOTIFICATIONS_COUNT } from '../../../Components/notificationsData'
import { THREADS, markMessagesRead } from '../../../Components/messagesData'
import cqcImg from '../../../Images/CQC Good.jpeg'
import handlingImg from '../../../Images/MOVING-AND-HANDLING-PEOPLE.webp'

// ─── Icons ───────────────────────────────────────────────────

const ChevronLeftIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)
const ChevronRightIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
  </svg>
)
const CloseIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
)
const ArchiveIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.15.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/>
  </svg>
)
const EditIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5.00125 16.2458L5.00125 18.6099C5.00125 18.8277 5.17234 18.9988 5.39008 18.9988L7.7542 18.9988C7.8553 18.9988 7.9564 18.9599 8.02639 18.8821L16.5185 10.3977L13.6023 7.48146L5.1179 15.9658C5.04013 16.0436 5.00125 16.1369 5.00125 16.2458ZM18.7738 8.1425C19.0771 7.83919 19.0771 7.34926 18.7738 7.04597L16.954 5.22622C16.6507 4.92293 16.1608 4.92293 15.8575 5.22622L14.4344 6.64935L17.3506 9.56562L18.7738 8.1425Z" />
  </svg>
)
const SearchIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
)
const SendIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
)
const AttachIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 015 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 005 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
  </svg>
)
const EmojiIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
  </svg>
)
const MicIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
  </svg>
)
const PhotoIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
  </svg>
)
const VideoIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
  </svg>
)
const FileIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
  </svg>
)
const BroadcastIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM19.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v4h2v-4h1l5 3V6L8 9H4zm11.5 3c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.01 1.5-3.34z"/>
  </svg>
)
const PersonIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
)
const EditActionIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>
)
const DeleteActionIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
  </svg>
)
const ReplyIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>
  </svg>
)
const EllipsisIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
)
const UnreadBubbleIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
    <circle cx="19" cy="5" r="3.5"/>
  </svg>
)
const InfoIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M12,2 C17.52,2 22,6.48 22,12 C22,17.52 17.52,22 12,22 C6.48,22 2,17.52 2,12 C2,6.48 6.48,2 12,2 Z M10.6662105,9.93690394 L10.581437,9.93690394 C10.1076337,9.93690394 9.72611507,10.3209137 9.72611507,10.7922258 C9.72611507,11.2660291 10.1101248,11.6475478 10.581437,11.6475478 L10.6662105,11.6475478 L10.6662105,16.6348056 L10.5826825,16.6348056 C10.1096134,16.6348056 9.72611507,17.0183039 9.72611507,17.491373 C9.72611507,17.9644422 10.1096134,18.3479405 10.5826825,18.3479405 L13.4173175,18.3479405 C13.8903866,18.3479405 14.2738849,17.9644422 14.2738849,17.491373 C14.2738849,17.0183039 13.8903866,16.6348056 13.4173175,16.6348056 L13.3387717,16.6348056 L13.3362805,10.936904 C13.3360752,10.3847645 12.8884201,9.93727594 12.3362806,9.93727594 L10.6662105,9.93690394 Z M11.8678197,5.65205952 C11.0006244,5.65205952 10.2992557,6.35342819 10.2992557,7.22062354 C10.2992557,8.08781889 11.0006244,8.78918756 11.8678197,8.78918756 C12.7350151,8.78918756 13.4363837,8.08781889 13.4363837,7.22062354 C13.4363837,6.35342819 12.7350151,5.65205952 11.8678197,5.65205952 Z"/>
  </svg>
)
const ArrowLeftIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.71969 12.6255L4.73999 12.6499C4.74414 12.6548 4.74834 12.6596 4.75259 12.6644L9.75259 18.2894C10.1195 18.7022 10.7516 18.7393 11.1644 18.3724C11.5771 18.0055 11.6143 17.3734 11.2474 16.9606L7.727 13L18.5 13C19.0523 13 19.5 12.5523 19.5 12C19.5 11.4477 19.0523 11 18.5 11L7.727 11L11.2474 7.03937C11.5861 6.65834 11.5805 6.09046 11.2529 5.71676L11.1644 5.6276C10.7516 5.26068 10.1195 5.29786 9.75259 5.71065L4.75259 11.3356L4.7402 11.3498C4.73323 11.358 4.72639 11.3662 4.71969 11.3746L4.75259 11.3356C4.72265 11.3693 4.69538 11.4045 4.67076 11.441C4.65284 11.4675 4.63629 11.4947 4.62104 11.5227C4.60922 11.5452 4.59534 11.5722 4.5711 11.629C4.56169 11.6537 4.52179 11.7614 4.5 12C4.5 12.1218 4.52179 12.2386 4.56167 12.3465C4.5711 12.3998 4.59534 12.4278 4.62098 12.4771C4.63629 12.5053 4.65284 12.5325 4.67061 12.5589L4.71969 12.6255Z"/>
  </svg>
)
const AddIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.916 5.00275L12.0151 5C12.5912 5.00028 13.0705 5.47958 13.0705 6.07082V10.9295H17.9292C18.4906 10.9295 18.9557 11.3634 18.9968 11.9197L19 12.0151C18.9997 12.5912 18.5204 13.0705 17.9292 13.0705H13.0705V17.9292C13.0705 18.4906 12.6366 18.9557 12.0803 18.9968L11.9849 19C11.4088 18.9997 10.9295 18.5204 10.9295 17.9292V13.0705H6.07082C5.5094 13.0705 5.04427 12.6366 5.00323 12.0803L5 11.9849C5.00028 11.4088 5.47958 10.9295 6.07082 10.9295H10.9295V6.07082L10.9351 5.95992C10.9841 5.48574 11.3434 5.10031 11.8101 5.01699L11.916 5.00275Z"/>
  </svg>
)
const CheckDoubleIcon = ({ read, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={`receipt-icon ${read ? 'receipt-read' : 'receipt-delivered'}`}>
    <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/>
  </svg>
)
const CheckSentIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="receipt-icon receipt-sent">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
)
const TickIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
)
const PlusIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
)
const PlayIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
)
const SaveIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
  </svg>
)
const ShareIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
  </svg>
)
const ForwardIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 8V4l8 8-8 8v-4H4V8h8z"/>
  </svg>
)
const ChevronDownIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
  </svg>
)
const ChevronUpIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"/>
  </svg>
)

// ─── Data ────────────────────────────────────────────────────

const CUSTOMERS = [
  { id: 1,  name: 'Margaret Thompson',  initials: 'MT', hasPhoto: true,  photoColor: '#c4a0d4' },
  { id: 2,  name: 'George Evans',       initials: 'GE', hasPhoto: false },
  { id: 3,  name: 'Dorothy Williams',   initials: 'DW', hasPhoto: true,  photoColor: '#8ab8d4' },
  { id: 4,  name: 'Harold Clarke',      initials: 'HC', hasPhoto: false },
  { id: 5,  name: 'Edith Morrison',     initials: 'EM', hasPhoto: true,  photoColor: '#8aba9e' },
  { id: 6,  name: 'Arthur Bennett',     initials: 'AB', hasPhoto: false },
  { id: 7,  name: 'Florence Harding',   initials: 'FH', hasPhoto: true,  photoColor: '#e898b0' },
  { id: 8,  name: 'Walter Johnson',     initials: 'WJ', hasPhoto: false },
  { id: 9,  name: 'Beatrice Cooper',    initials: 'BC', hasPhoto: true,  photoColor: '#d4a050' },
  { id: 10, name: 'Stanley Moore',      initials: 'SM', hasPhoto: false },
  { id: 11, name: 'Vera Patterson',     initials: 'VP', hasPhoto: true,  photoColor: '#60b8a8' },
  { id: 12, name: 'Reginald Foster',    initials: 'RF', hasPhoto: false },
  { id: 13, name: 'Agnes Lambert',      initials: 'AL', hasPhoto: true,  photoColor: '#a0b868' },
  { id: 14, name: 'Clarence Webb',      initials: 'CW', hasPhoto: false },
  { id: 15, name: 'Mildred Shaw',       initials: 'MS', hasPhoto: true,  photoColor: '#e08858' },
  { id: 16, name: 'Herbert Ellis',      initials: 'HE', hasPhoto: false },
  { id: 17, name: 'Constance Ward',     initials: 'CW', hasPhoto: true,  photoColor: '#b870c8' },
  { id: 18, name: 'Leonard Dixon',      initials: 'LD', hasPhoto: false },
  { id: 19, name: 'Gladys Hunt',        initials: 'GH', hasPhoto: false },
  { id: 20, name: 'Cecil Barnes',       initials: 'CB', hasPhoto: true,  photoColor: '#7090d0' },
]

const THREAD_MESSAGES = {
  1: [
    { id: 1, isMe: false, sender: 'Office', text: "Just a reminder the weekly handover meeting is Thursday at 4pm. Please make sure your visit notes are up to date beforehand.", time: '10:42 AM', day: 'Today' },
  ],
  2: [
    { id: 1, isMe: false, sender: 'Office', text: "Hi Adrianna, I wanted to check in about Margaret Thompson's care visit yesterday. Did she take her evening medication? She mentioned to her son that she thought she might have missed it.", time: '2:34 PM', day: 'Yesterday' },
    { id: 2, isMe: true, text: "Hi Karen, yes I was there until 5pm and she did take all her medication. I've attached my signed visit notes for reference.", time: '2:47 PM', day: 'Yesterday', receipt: 'read', attachments: [{ type: 'file', name: 'Visit_Notes_Margaret_12May.pdf', size: '148 KB' }] },
    { id: 3, isMe: false, sender: 'Office', text: "That's great, thank you! Her son has been a bit worried. Could you also let me know if she mentions any pain during your next visit? She has a GP appointment on Thursday.", time: '2:52 PM', day: 'Yesterday' },
    { id: 4, isMe: false, sender: 'Office', text: "Morning Adrianna, just a follow up on Margaret. Did you manage to speak with her son at the visit? We received a call from him this morning.", time: '9:15 AM', day: 'Today' },
  ],
  3: [
    { id: 1, isMe: true, text: "Hi, I was wondering if it would be possible to swap my Friday 6th shift? I have a family commitment that afternoon.", time: 'Fri 11:02 AM', day: 'Friday', receipt: 'read' },
    { id: 2, isMe: false, sender: 'Office', text: "Hi Adrianna, thanks for letting us know. Let me check who's available to cover and get back to you.", time: 'Fri 11:45 AM', day: 'Friday' },
    { id: 3, isMe: false, sender: 'Office', text: "No problem at all Adrianna, we'll sort it. Tom will cover your Friday 6th visit.", time: '4:02 PM', day: 'Yesterday' },
  ],
  4: [
    { id: 1, isMe: true, text: "Hi, I'd like to request annual leave from 14th July to 18th July if possible. Happy to discuss if needed.", time: 'Mon 9:20 AM', day: 'Monday', receipt: 'delivered' },
  ],
  5: [
    { id: 1, isMe: false, sender: 'Office', text: "Photo from our CQC inspection, Well done everyone.", time: '10:01 AM', day: 'Today', attachments: [{ type: 'image', name: 'CQC_Inspection.jpg', src: cqcImg }] },
    { id: 3, isMe: true, time: '10:12 AM', day: 'Today', receipt: 'read', attachments: [{ type: 'file', name: 'Timesheet_May_Week3.pdf', size: '56 KB' }] },
    { id: 4, isMe: true, text: "Please find this week's timesheet attached.", time: '10:13 AM', day: 'Today', receipt: 'delivered', attachments: [{ type: 'file', name: 'Timesheet_May_Week4.pdf', size: '62 KB' }] },
    { id: 5, isMe: false, sender: 'Office', text: 'Please make sure everyone watches the Moving and Handling Guide for Carers.', time: '10:30 AM', day: 'Today', attachments: [{ type: 'video', name: 'Manual_Handling_Training.mp4', duration: '4:12', poster: handlingImg }] },
    { id: 6, isMe: false, sender: 'Office', text: 'Please see the training video above.', time: '10:35 AM', day: 'Today' },
  ],
}

// ─── Inbox Screen ────────────────────────────────────────────

function ThreadRow({ thread, onClick, showArchivedTag }) {
  const isUnread = thread.unread > 0
  return (
    <div className="thread-row-outer" onClick={onClick}>
      <div className="thread-row">
        <div className={`thread-avatar ${thread.isBroadcast ? 'broadcast' : ''}`}>
          {thread.isBroadcast ? <BroadcastIcon /> : <PersonIcon />}
        </div>
        <div className="thread-body">
          <div className="thread-top">
            <span className={`thread-name ${isUnread ? 'unread' : ''}`}>{thread.title}</span>
            <span className={`thread-time ${isUnread ? 'unread' : ''}`}>{thread.time}</span>
          </div>
          <div className={`thread-preview ${isUnread ? 'unread' : ''}`}>
            {thread.sentByMe && <span className="thread-preview-you">You: </span>}
            {thread.lastMessage}
          </div>
          <div className="thread-bottom">
            <div className="thread-tags">
              {showArchivedTag && <span className="thread-archived-tag">Archived</span>}
            </div>
            <div className="thread-right-meta">
              {isUnread
                ? <span className="unread-badge">{thread.unread}</span>
                : thread.sentByMe && (
                    thread.deliveredNotRead
                      ? <CheckSentIcon />
                      : <CheckDoubleIcon read={true} />
                  )
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InboxScreen({ threads, onOpenThread, onCompose, onBack, totalUnread }) {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('inbox')

  const isSearching = search.trim().length > 0

  const filtered = threads.filter(t => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.lastMessage.toLowerCase().includes(search.toLowerCase()) ||
      (t.careReceiver && t.careReceiver.toLowerCase().includes(search.toLowerCase()))
    if (!matchesSearch) return false
    if (isSearching) return true
    return tab === 'inbox' ? !t.archivedByCarer : t.archivedByCarer
  })

  return (
    <div className="screen">
      <StatusBar />
      <div className="app-header">
        <button className="app-header-back" onClick={onBack} aria-label="Back to Account">
          <ArrowLeftIcon />
        </button>
        <span className="app-header-title">Messages</span>
        <button className="app-header-action" onClick={onCompose} aria-label="New message">
          <AddIcon />
        </button>
      </div>
      <div className="inbox-search">
        <div className="search-bar">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      {!isSearching && (
        <div className="inbox-tabs">
          <button className={`inbox-tab${tab === 'inbox' ? ' active' : ''}`} onClick={() => setTab('inbox')}>Messages</button>
          <button className={`inbox-tab${tab === 'archived' ? ' active' : ''}`} onClick={() => setTab('archived')}>Archived</button>
        </div>
      )}
      <div className="thread-list">
        {filtered.map(t => (
          <ThreadRow
            key={t.id}
            thread={t}
            onClick={() => onOpenThread(t.id)}
            showArchivedTag={isSearching && t.archivedByCarer}
          />
        ))}
        {filtered.length === 0 && (
          <div className="empty-state">
            {isSearching ? 'No messages found' : tab === 'archived' ? 'No archived threads' : 'No messages'}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Attachment ──────────────────────────────────────────────

const Attachment = ({ attachment, isMe, onPreview }) => {
  if (attachment.type === 'image') {
    return (
      <div className="msg-attachment-image" onClick={onPreview}>
        {attachment.src
          ? <img src={attachment.src} alt={attachment.name} className="msg-attachment-real-img" />
          : <><PhotoIcon size={34} /><span className="msg-attachment-image-name">{attachment.name}</span></>
        }
      </div>
    )
  }
  if (attachment.type === 'video') {
    return (
      <div className="msg-attachment-image msg-attachment-video" onClick={onPreview}>
        {attachment.poster
          ? <img src={attachment.poster} alt={attachment.name} className="msg-attachment-real-img" />
          : <span className="msg-attachment-image-name">{attachment.name}{attachment.duration ? ` · ${attachment.duration}` : ''}</span>
        }
        <div className={`msg-attachment-play-btn${attachment.poster ? ' overlay' : ''}`}>
          <PlayIcon size={26} />
        </div>
      </div>
    )
  }
  if (attachment.type === 'file') {
    return (
      <div className={`msg-attachment-file ${isMe ? 'sent' : 'received'}`} onClick={onPreview} style={{ cursor: 'pointer' }}>
        <FileIcon size={22} />
        <div className="msg-attachment-file-info">
          <span className="msg-attachment-file-name">{attachment.name}</span>
          {attachment.size && <span className="msg-attachment-file-size">{attachment.size}</span>}
        </div>
      </div>
    )
  }
  return null
}

// ─── File doc mocks ───────────────────────────────────────────

function VisitNotesDoc() {
  return (
    <>
      <div className="doc-header-bar">
        <div className="doc-logo" />
        <div className="doc-header-text">
          <div className="doc-h1">Visit Record</div>
          <div className="doc-subtitle">12 May 2026 · 16:30</div>
        </div>
      </div>
      <div className="doc-meta-row"><div className="doc-meta-label">Client</div><div className="doc-meta-value">Margaret Thompson</div></div>
      <div className="doc-meta-row"><div className="doc-meta-label">Carer</div><div className="doc-meta-value">Adrianna Jackson</div></div>
      <div className="doc-meta-row"><div className="doc-meta-label">Duration</div><div className="doc-meta-value">45 minutes</div></div>
      <div className="doc-divider" />
      <div className="doc-section-title">Tasks completed</div>
      <div className="doc-checklist">
        {['Evening medication administered', 'Light meal prepared and served', 'Mobility assistance provided', 'General welfare check'].map(t => (
          <div key={t} className="doc-check-item"><span className="doc-check">✓</span><span>{t}</span></div>
        ))}
      </div>
      <div className="doc-section-title">Notes</div>
      <div className="doc-text-lines">
        <div className="doc-line long" />
        <div className="doc-line long" />
        <div className="doc-line medium" />
      </div>
      <div className="doc-meta-row" style={{ marginTop: 8 }}><div className="doc-meta-label">Signed</div><div className="doc-meta-value doc-signature">A. Jackson</div></div>
    </>
  )
}

function TimesheetDoc({ week }) {
  const rows = [
    ['Monday',    '08:00', '14:00', '6.0'],
    ['Tuesday',   '08:30', '13:30', '5.0'],
    ['Wednesday', '09:00', '15:00', '6.0'],
    ['Thursday',  '08:00', '14:30', '6.5'],
    ['Friday',    '08:30', '13:00', '4.5'],
  ]
  return (
    <>
      <div className="doc-header-bar">
        <div className="doc-logo" />
        <div className="doc-header-text">
          <div className="doc-h1">Weekly Timesheet</div>
          <div className="doc-subtitle">Week {week} · May 2026</div>
        </div>
      </div>
      <div className="doc-meta-row"><div className="doc-meta-label">Employee</div><div className="doc-meta-value">Adrianna Jackson</div></div>
      <div className="doc-meta-row"><div className="doc-meta-label">Department</div><div className="doc-meta-value">Care Services</div></div>
      <div className="doc-divider" />
      <table className="doc-table">
        <thead><tr><th>Day</th><th>Start</th><th>End</th><th>Hours</th></tr></thead>
        <tbody>
          {rows.map(([day, start, end, hrs]) => (
            <tr key={day}><td>{day}</td><td>{start}</td><td>{end}</td><td>{hrs}</td></tr>
          ))}
        </tbody>
      </table>
      <div className="doc-total-row"><span>Total hours</span><span>28.0 hrs</span></div>
    </>
  )
}

function FileDocPreview({ attachment }) {
  const name = attachment.name.toLowerCase()
  const weekMatch = attachment.name.match(/Week(\d+)/i)
  const week = weekMatch ? weekMatch[1] : '1'
  const isTimesheet = name.includes('timesheet')
  return (
    <div className="file-doc-preview">
      {isTimesheet ? <TimesheetDoc week={week} /> : <VisitNotesDoc />}
    </div>
  )
}

// ─── Attachment Preview ──────────────────────────────────────

function AttachmentPreview({ attachment, onClose }) {
  const imgSrc = attachment.src || attachment.poster
  const isFile = attachment.type === 'file'
  const displayTitle = attachment.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ')
  return (
    <div className="attachment-preview-overlay">
      <StatusBar />
      <div className="app-header attachment-preview-appheader">
        <button className="app-header-back" onClick={onClose}>
          <ArrowLeftIcon />
        </button>
        <span className="app-header-title">{displayTitle}</span>
        <div style={{ width: 36 }} />
      </div>
      <div className={`attachment-preview-content${isFile ? ' file-content' : ''}`}>
        {!isFile && imgSrc && <img src={imgSrc} alt={attachment.name} className="attachment-preview-img" />}
        {attachment.type === 'video' && (
          <div className="attachment-preview-play"><PlayIcon size={38} /></div>
        )}
        {isFile && <FileDocPreview attachment={attachment} />}
      </div>
      <div className="attachment-preview-footer">
        {[
          { icon: <SaveIcon size={24} />, label: 'Save' },
          { icon: <ShareIcon size={24} />, label: 'Share' },
          { icon: <ForwardIcon size={24} />, label: 'Forward' },
        ].map(({ icon, label }) => (
          <button key={label} className="attachment-preview-action">
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Thread Screen ───────────────────────────────────────────

const ThreadScreen = forwardRef(function ThreadScreen({ thread, messages, onBack, onMessageSent, onMarkUnread, onToggleArchive, onMessageDeleted, totalUnread, onOpenActions, onCloseActions }, ref) {
  const [inputText, setInputText] = useState('')
  const [localMsgs, setLocalMsgs] = useState(messages)
  const [replyTo, setReplyTo] = useState(null)
  const [editing, setEditing] = useState(null)
  const [showAttach, setShowAttach] = useState(false)
  const [infoMenuOpen, setInfoMenuOpen] = useState(false)
  const [infoMenuPos, setInfoMenuPos] = useState({ top: 0, right: 16 })
  const [previewAttachment, setPreviewAttachment] = useState(null)
  const [prevThreadId, setPrevThreadId] = useState(thread?.id)
  const endRef = useRef(null)
  const inputRef = useRef(null)
  const screenRef = useRef(null)

  // Sync derived state: reset localMsgs immediately when thread changes (no stale-render flash)
  if (prevThreadId !== thread?.id) {
    setPrevThreadId(thread?.id)
    setLocalMsgs(messages)
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [])

  // Reset UI state when switching threads (localMsgs reset happens synchronously above)
  useEffect(() => {
    setInputText('')
    setReplyTo(null)
    setEditing(null)
    setShowAttach(false)
    setInfoMenuOpen(false)
    setPreviewAttachment(null)
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'auto' }), 0)
  }, [thread?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useImperativeHandle(ref, () => ({
    replyToMessage: (msg) => { setReplyTo(msg); inputRef.current?.focus() },
    editMessage:    (msg) => { setEditing(msg); setInputText(msg.text); inputRef.current?.focus() },
    deleteMessage:  (msg) => { setLocalMsgs(prev => prev.filter(m => m.id !== msg.id)); onMessageDeleted?.(msg.id) },
    dismissAll:     ()    => { setShowAttach(false); setInfoMenuOpen(false); setPreviewAttachment(null) },
  }))

  if (!thread) return <div className="screen" />

  const isReadOnly = thread.isBroadcast

  // Group messages by day
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
      setLocalMsgs(prev => [...prev, {
        id: prev.length + 1, isMe: true, text,
        time: 'Just now', day: 'Today', receipt: 'delivered',
        ...(replyTo ? { replyTo } : {}),
      }])
      onMessageSent?.(text)
    }
    setInputText('')
    setReplyTo(null)
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  const openActions = (e, msg) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    onOpenActions?.(msg, rect)
    setShowAttach(false)
  }

  const toggleInfoMenu = (e) => {
    e.stopPropagation()
    if (infoMenuOpen) { setInfoMenuOpen(false); return }
    const rect = e.currentTarget.getBoundingClientRect()
    const screenRect = screenRef.current.getBoundingClientRect()
    setInfoMenuPos({ top: rect.bottom - screenRect.top + 4, right: screenRect.right - rect.right })
    setInfoMenuOpen(true)
    setShowAttach(false)
  }

  const dismissOverlays = () => {
    onCloseActions?.()
    setShowAttach(false)
    setInfoMenuOpen(false)
    setPreviewAttachment(null)
  }

  return (
    <div className="screen" onClick={dismissOverlays} ref={screenRef}>
      <StatusBar />

      {/* Header */}
      <div className="app-header thread-app-header">
        <button className="app-header-back" onClick={onBack}>
          <ArrowLeftIcon />
        </button>
        <div className="thread-header-center">
          <span className="thread-header-title">{thread?.title}</span>
          <span className="thread-header-sub">{thread?.participants}</span>
        </div>
        <button className="app-header-action" onClick={toggleInfoMenu}><EllipsisIcon /></button>
      </div>

      {/* Info dropdown menu */}
      {infoMenuOpen && (
        <div
          className="actions-menu"
          style={{ position: 'absolute', top: infoMenuPos.top, right: infoMenuPos.right, zIndex: 20 }}
          onClick={e => e.stopPropagation()}
        >
          <button onClick={() => { onMarkUnread?.(thread.id); setInfoMenuOpen(false) }}>
            <UnreadBubbleIcon size={20} /> Mark as unread
          </button>
          <button onClick={() => { onToggleArchive?.(thread.id); setInfoMenuOpen(false) }}>
            <ArchiveIcon size={20} /> {thread.archivedByCarer ? 'Unarchive' : 'Archive'}
          </button>
        </div>
      )}

      {/* Care receiver tag */}
      {thread?.careReceiver && (
        <div className="thread-tag-bar">
          <span className="care-receiver-tag">
            <span className="care-re-label">Re:</span>{thread.careReceiver}
          </span>
        </div>
      )}

      {/* Messages */}
      <div className="messages-area" onClick={e => e.stopPropagation()}>
        {byDay.map(group => (
          <div key={group.day}>
            <div className="day-separator"><span>{group.day}</span></div>
            {group.msgs.map((msg, i) => {
              if (msg.type === 'event') {
                return (
                  <div key={msg.id} className="event-message">
                    <span>{msg.text}</span>
                  </div>
                )
              }
              const prev = group.msgs[i - 1]
              const showSender = !msg.isMe && (!prev || prev.sender !== msg.sender || prev.isMe)
              return (
                <div
                  key={msg.id}
                  className={`message-group ${msg.isMe ? 'from-me' : 'from-them'}`}
                >
                  {showSender && <div className="msg-sender-name">{msg.sender}</div>}
                  <div
                    className={`bubble ${msg.isMe ? 'bubble-sent' : 'bubble-received'}${msg.replyTo ? ' has-reply' : ''}`}
                    onClick={e => { if (!isReadOnly || msg.isMe) openActions(e, msg) }}
                  >
                  {msg.replyTo && (
                    <div className={`reply-quote ${msg.isMe ? 'reply-quote-me' : ''}`}>
                      <span className="reply-quote-author">{msg.replyTo.isMe ? 'You' : msg.replyTo.sender}</span>
                      <span className="reply-quote-text">{msg.replyTo.text.slice(0, 70)}{msg.replyTo.text.length > 70 ? '…' : ''}</span>
                    </div>
                  )}
                    {msg.attachments?.map((att, i) => (
                      <Attachment key={i} attachment={att} isMe={msg.isMe} onPreview={(e) => { e.stopPropagation(); setPreviewAttachment(att) }} />
                    ))}
                    {msg.text}
                    {msg.edited && <span className="edited-label">(edited)</span>}
                  </div>
                  <div className="msg-meta">
                    <span className="msg-time">{msg.time}</span>
                    {msg.isMe && msg.receipt === 'read' && <CheckDoubleIcon read={true} />}
                    {msg.isMe && msg.receipt === 'delivered' && <CheckDoubleIcon read={false} />}
                    {msg.isMe && !msg.receipt && <CheckSentIcon />}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Reply strip */}
      {replyTo && !editing && (
        <div className="context-strip reply-strip" onClick={e => e.stopPropagation()}>
          <div className="context-strip-bar" />
          <div className="context-strip-body">
            <span className="context-strip-label">Replying to {replyTo.isMe ? 'yourself' : replyTo.sender}</span>
            <span className="context-strip-preview">{replyTo.text.slice(0, 80)}{replyTo.text.length > 80 ? '…' : ''}</span>
          </div>
          <button className="context-strip-close" onClick={() => setReplyTo(null)}><CloseIcon size={18} /></button>
        </div>
      )}

      {/* Edit strip */}
      {editing && (
        <div className="context-strip edit-strip" onClick={e => e.stopPropagation()}>
          <div className="context-strip-bar" />
          <div className="context-strip-body">
            <span className="context-strip-label">Editing message</span>
            <span className="context-strip-preview">{editing.text.slice(0, 80)}</span>
          </div>
          <button className="context-strip-close" onClick={() => { setEditing(null); setInputText('') }}><CloseIcon size={18} /></button>
        </div>
      )}

      {/* Attach picker */}
      {showAttach && (
        <div className="attach-picker" onClick={e => e.stopPropagation()}>
          {[{ icon: <PhotoIcon />, label: 'Photo' }, { icon: <FileIcon />, label: 'File' }].map(({ icon, label }) => (
            <button key={label} className="attach-option" onClick={() => setShowAttach(false)}>
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Compose bar */}
      {isReadOnly ? (
        <div className="broadcast-notice">
          <BroadcastIcon size={16} />
          <span>This is a read-only broadcast — you can't reply.</span>
        </div>
      ) : (
        <div className="compose-bar" onClick={e => e.stopPropagation()}>
          <button className="compose-icon-btn" onClick={e => { e.stopPropagation(); setShowAttach(s => !s) }}>
            <AddIcon />
          </button>
          <div className="compose-input-wrap">
            <input
              ref={inputRef}
              className="compose-input"
              placeholder="Message..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSend() } }}
              onClick={e => e.stopPropagation()}
            />
          </div>
          <button className="send-btn" onClick={handleSend} style={{ visibility: inputText.trim() ? 'visible' : 'hidden' }}>
            <SendIcon />
          </button>
        </div>
      )}


      {/* Attachment preview */}
      {previewAttachment && (
        <AttachmentPreview attachment={previewAttachment} onClose={() => setPreviewAttachment(null)} />
      )}

    </div>
  )
})

// ─── Compose Screen ───────────────────────────────────────────

const INITIALS_COLORS = [
  { bg: '#e8e0f0', fg: '#5a3878' },
  { bg: '#ddeef8', fg: '#1a4a6e' },
  { bg: '#ddf0e8', fg: '#1a5a36' },
  { bg: '#f8eedc', fg: '#6e4210' },
  { bg: '#f0dde8', fg: '#6e1a3c' },
  { bg: '#ddf0ee', fg: '#1a5a52' },
]

const PersonAvatar = ({ person }) => {
  if (person.hasPhoto) {
    return (
      <div className="customer-avatar customer-avatar-photo" style={{ background: person.photoColor }}>
        {person.initials}
      </div>
    )
  }
  const palette = INITIALS_COLORS[person.id % INITIALS_COLORS.length]
  return (
    <div className="customer-avatar customer-avatar-initials" style={{ background: palette.bg, color: palette.fg }}>
      {person.initials}
    </div>
  )
}

const summariseReceivers = (receivers) => {
  if (!receivers.length) return ''
  const abbrev = r => {
    const parts = r.name.split(' ')
    return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0]
  }
  if (receivers.length === 1) return receivers[0].name
  const shown = receivers.slice(0, 2).map(abbrev).join(', ')
  const rest = receivers.length - 2
  return rest > 0 ? `${shown} +${rest}` : shown
}

function PersonPickerSheet({ title, items, selected, onToggle, onClose }) {
  const [search, setSearch] = useState('')
  const [chipsExpanded, setChipsExpanded] = useState(false)
  const filtered = items.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="picker-overlay" onClick={onClose}>
      <div className="picker-sheet" onClick={e => e.stopPropagation()}>
        <div className="picker-handle" />
        <div className="picker-header">
          <h2>{title}</h2>
          <button className="picker-done-btn" onClick={onClose}>Done</button>
        </div>
        <div className="picker-search">
          <div className="picker-search-bar">
            <SearchIcon size={18} />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        {selected.length > 0 && (
          <div className="picker-selected-container">
            <button className="picker-selected-summary" onClick={() => setChipsExpanded(s => !s)}>
              <span className="picker-summary-count">{selected.length}</span>
              <span className="picker-summary-text">{summariseReceivers(selected)}</span>
              {chipsExpanded ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
            </button>
            {chipsExpanded && (
              <div className="picker-selected-area">
                {selected.map(r => (
                  <div key={r.id} className="picker-selected-chip">
                    <span>{r.name}</span>
                    <button className="picker-chip-remove" onClick={e => { e.stopPropagation(); onToggle(r) }} aria-label={`Remove ${r.name}`}>
                      <CloseIcon size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="picker-list">
          {filtered.map(p => {
            const isSelected = selected.some(r => r.id === p.id)
            return (
              <div key={p.id} className={`picker-item ${isSelected ? 'selected' : ''}`} onClick={() => onToggle(p)}>
                <PersonAvatar person={p} />
                <div className="picker-item-info">
                  <span className="picker-item-name">{p.name}</span>
                  {p.reachMeFor && <span className="picker-item-reach">{p.reachMeFor}</span>}
                </div>
                {isSelected && <TickIcon />}
              </div>
            )
          })}
          {filtered.length === 0 && <div className="empty-state">No results found</div>}
        </div>
      </div>
    </div>
  )
}

function ComposeScreen({ onBack, onSend, customers, totalUnread }) {
  const [title, setTitle] = useState('')
  const [careReceivers, setCareReceivers] = useState([])
  const [message, setMessage] = useState('')
  const [showCarePicker, setShowCarePicker] = useState(false)
  const canSend = title.trim() && message.trim()

  const toggleCare = (customer) => setCareReceivers(prev =>
    prev.some(r => r.id === customer.id) ? prev.filter(r => r.id !== customer.id) : [...prev, customer]
  )

  return (
    <div className="screen">
      <StatusBar />
      <div className="app-header compose-app-header">
        <button className="app-header-back" onClick={onBack}>
          <ArrowLeftIcon />
        </button>
        <span className="app-header-title">New Message</span>
        <div style={{ width: 40 }} />
      </div>

      <div className="compose-form">

        {/* To — carers only ever message Office, so there's nothing to pick */}
        <div className="compose-field-group">
          <div className="compose-inline-row">
            <span className="compose-to-label">To:</span>
            <span>Office</span>
          </div>
        </div>

        <div className="compose-divider" />

        {/* Title */}
        <div className="compose-field-group">
          <label className="compose-field-label">Title <span className="required">*</span></label>
          <input
            className="form-input-mobile"
            placeholder="What's this message about?"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        {/* Care receivers */}
        <div className="compose-field-group compose-tappable-group" style={{ display: 'none' }} onClick={() => setShowCarePicker(true)}>
          <div className="compose-inline-row">
            <span className="compose-to-label">Customer:</span>
            {careReceivers.length === 0 && <span className="optional-label">Optional</span>}
          </div>
          {careReceivers.length > 0 && (
            <div className="compose-chips-full" onClick={e => e.stopPropagation()}>
              {careReceivers.map(r => (
                <div key={r.id} className="compose-chip">
                  <span>{r.name}</span>
                  <button className="compose-chip-remove" onClick={e => { e.stopPropagation(); toggleCare(r) }} aria-label={`Remove ${r.name}`}>
                    <CloseIcon size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message */}
        <div className="compose-field-group">
          <label className="compose-field-label">Message <span className="required">*</span></label>
          <textarea
            className="message-textarea"
            placeholder="Write your message..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={5}
          />
        </div>

        {/* Attachments */}
        <div className="compose-field-group">
          <label className="compose-field-label">Attachments</label>
          <div className="attachment-row">
            {[{ icon: <PhotoIcon />, label: 'Photo' }, { icon: <FileIcon />, label: 'File' }].map(({ icon, label }) => (
              <button key={label} className="attachment-btn">{icon}<span>{label}</span></button>
            ))}
          </div>
        </div>

        {/* Send */}
        <button
          className={`compose-send-btn ${!canSend ? 'disabled' : ''}`}
          disabled={!canSend}
          onClick={() => canSend && onSend({ title, careReceivers, message })}
        >
          Send Message <SendIcon size={18} />
        </button>

      </div>


      {showCarePicker && (
        <PersonPickerSheet
          title="Add Customers"
          items={customers}
          selected={careReceivers}
          onToggle={toggleCare}
          onClose={() => setShowCarePicker(false)}
        />
      )}
    </div>
  )
}

// ─── Root ────────────────────────────────────────────────────

export default function App() {
  // Defaults to Account (the real entry point), but skips straight to the
  // inbox when arriving via ?screen=inbox — e.g. a "Messages" tap from
  // mobile/account, which already showed Account once.
  const [outerView, setOuterView] = useState(() =>
    new URLSearchParams(window.location.search).get('screen') === 'inbox' ? 'messaging' : 'account'
  )
  // mobile/account and mobile/messaging are separate pages, so the "Messages"
  // tap has no shared DOM to slide within — this plays a matching entrance
  // once, only for that specific arrival (never a direct visit or bottom-nav switch).
  const [entering] = useState(() =>
    new URLSearchParams(window.location.search).get('transition') === '1'
  )
  const [view, setView] = useState('inbox')
  const [activeThreadId, setActiveThreadId] = useState(null)
  const [threads, setThreads] = useState(THREADS)
  const [threadMessages, setThreadMessages] = useState(THREAD_MESSAGES)
  const [composeVisible, setComposeVisible] = useState(false)
  const [composeExiting, setComposeExiting] = useState(false)
  const [actionTarget, setActionTarget] = useState(null)
  const [actionMenuY, setActionMenuY] = useState(0)
  const phoneFrameRef = useRef(null)
  const threadScreenRef = useRef(null)

  const [messageBadge, setMessageBadge] = useState(() =>
    THREADS.filter(t => !t.archivedByCarer).reduce((sum, t) => sum + t.unread, 0)
  )

  useEffect(() => {
    setMessageBadge(0)
    markMessagesRead()
  }, [])

  const totalUnread = threads.filter(t => !t.archivedByCarer).reduce((sum, t) => sum + t.unread, 0)

  const handleOpenActions = (msg, rect) => {
    if (actionTarget?.id === msg.id) { setActionTarget(null); return }
    const frameRect = phoneFrameRef.current?.getBoundingClientRect()
    if (!frameRect) return
    const rawTop = rect.bottom - frameRect.top
    const menuItemCount = msg.isMe ? 3 : 1
    const menuHeight = menuItemCount * 52 + 8
    const clamped = Math.min(rawTop + 4, frameRect.height - menuHeight - 16)
    setActionMenuY(Math.max(clamped, rect.top - frameRect.top))
    setActionTarget(msg)
  }

  const handleCloseActions = () => {
    setActionTarget(null)
    threadScreenRef.current?.dismissAll()
  }

  const handleMarkUnread = (id) => {
    setThreads(prev => prev.map(t => t.id === id ? { ...t, unread: 1 } : t))
  }

  const openCompose = () => {
    setComposeExiting(false)
    setComposeVisible(true)
    setView('compose')
  }

  const closeCompose = () => {
    setComposeExiting(true)
    setView('inbox')
    setTimeout(() => { setComposeVisible(false); setComposeExiting(false) }, 300)
  }

  const openThread = (id) => {
    setActiveThreadId(id)
    setThreads(prev => prev.map(t => t.id === id ? { ...t, unread: 0 } : t))
    setView('thread')
  }

  const handleReply = (text) => {
    const wasArchived = threads.find(t => t.id === activeThreadId)?.archivedByCarer
    const now = Date.now()
    setThreads(prev => {
      const updated = prev.find(t => t.id === activeThreadId)
      if (!updated) return prev
      const rest = prev.filter(t => t.id !== activeThreadId)
      return [
        { ...updated, lastSender: 'You', lastMessage: text, time: 'Just now', sentByMe: true, deliveredNotRead: true, unread: 0, ...(wasArchived ? { archivedByCarer: false } : {}) },
        ...rest,
      ]
    })
    setThreadMessages(prev => ({
      ...prev,
      [activeThreadId]: [
        ...(prev[activeThreadId] || []),
        { id: now, isMe: true, text, time: 'Just now', day: 'Today', receipt: 'delivered' },
      ],
    }))
  }

  const handleToggleArchive = (id) => {
    setThreads(prev => prev.map(t => t.id === id ? { ...t, archivedByCarer: !t.archivedByCarer } : t))
    setActiveThreadId(null)
    setView('inbox')
  }

  const handleNewMessage = ({ title, careReceivers, message }) => {
    const newId = threads.reduce((max, t) => Math.max(max, t.id), 0) + 1
    const newThread = {
      id: newId,
      title,
      careReceiver: careReceivers.length > 0 ? careReceivers.map(r => r.name).join(', ') : null,
      participants: 'Office',
      lastSender: 'You',
      lastMessage: message,
      time: 'Just now',
      unread: 0,
      sentByMe: true,
      deliveredNotRead: true,
    }
    setThreads(prev => [newThread, ...prev])
    setThreadMessages(prev => ({
      ...prev,
      [newId]: [{ id: 1, isMe: true, text: message, time: 'Just now', day: 'Today', receipt: 'delivered' }],
    }))
    setActiveThreadId(newId)
    setComposeVisible(false)
    setView('thread')
  }

  const handleMessageDeleted = (msgId) => {
    const updatedMsgs = (threadMessages[activeThreadId] || []).filter(m => m.id !== msgId)
    setThreadMessages(prev => ({ ...prev, [activeThreadId]: updatedMsgs }))
    const last = updatedMsgs[updatedMsgs.length - 1]
    setThreads(prev => prev.map(t =>
      t.id !== activeThreadId ? t : {
        ...t,
        lastMessage: last ? (last.text || '') : '',
        sentByMe: last ? last.isMe : t.sentByMe,
      }
    ))
  }

  const activeThread = threads.find(t => t.id === activeThreadId) || null
  const canReplyInThread = !activeThread?.isBroadcast

  return (
    <div className="phone-wrap">
      <a href="../../" className="back-link">
        <ChevronLeftIcon size={16} /> Prototypes
      </a>
      <div className="phone-frame" ref={phoneFrameRef}>
        <div className={`screen-area page-slide ${entering ? 'slide-entering' : ''}`}>
          <ScreenSlider
            secondaryActive={outerView === 'messaging'}
            primary={
              <AccountScreen
                hideNav
                onGoToMessages={() => setOuterView('messaging')}
                onGoToMileage={() => { window.location.href = '../mileage-pay/' }}
                messagesUnread={messageBadge}
              />
            }
            secondary={
              <>
                <ScreenSlider
                  secondaryActive={view === 'thread'}
                  primary={
                    <InboxScreen
                      threads={threads}
                      onOpenThread={openThread}
                      onCompose={openCompose}
                      onBack={() => setOuterView('account')}
                      totalUnread={totalUnread}
                    />
                  }
                  secondary={
                    <ThreadScreen
                      ref={threadScreenRef}
                      thread={activeThread}
                      messages={activeThreadId ? (threadMessages[activeThreadId] || []) : []}
                      onBack={() => setView('inbox')}
                      onMessageSent={handleReply}
                      onMarkUnread={handleMarkUnread}
                      onToggleArchive={handleToggleArchive}
                      onMessageDeleted={handleMessageDeleted}
                      totalUnread={totalUnread}
                      onOpenActions={handleOpenActions}
                      onCloseActions={handleCloseActions}
                    />
                  }
                />
                {composeVisible && (
                  <div className={`compose-overlay ${composeExiting ? 'exiting' : 'entering'}`}>
                    <ComposeScreen
                      onBack={closeCompose}
                      onSend={handleNewMessage}
                      customers={CUSTOMERS}
                      totalUnread={totalUnread}
                    />
                  </div>
                )}
              </>
            }
          />
        </div>
        {outerView === 'account' ? (
          <AppNav
            activeTab="account"
            messagesUnread={messageBadge}
            links={{ notifications: '../notifications/' }}
          />
        ) : (
          <AppNav
            activeTab={null}
            messagesUnread={messageBadge}
            notifCount={UNREAD_NOTIFICATIONS_COUNT}
            links={{ notifications: '../notifications/', account: '../account/' }}
          />
        )}
        {actionTarget && (
          <div className="phone-frame-overlay" onClick={handleCloseActions}>
            <div
              className="actions-menu"
              style={{
                position: 'absolute',
                top: actionMenuY,
                ...(actionTarget.isMe ? { right: 16 } : { left: 16 }),
              }}
              onClick={e => e.stopPropagation()}
            >
              {canReplyInThread && (
                <button onClick={() => { threadScreenRef.current?.replyToMessage(actionTarget); handleCloseActions() }}>
                  <ReplyIcon /> Reply
                </button>
              )}
              {actionTarget.isMe && (
                <button onClick={() => { threadScreenRef.current?.editMessage(actionTarget); handleCloseActions() }}>
                  <EditActionIcon /> Edit
                </button>
              )}
              {actionTarget.isMe && (
                <button className="action-delete" onClick={() => { threadScreenRef.current?.deleteMessage(actionTarget); handleCloseActions() }}>
                  <DeleteActionIcon /> Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <DevMode containerRef={phoneFrameRef} />
    </div>
  )
}
