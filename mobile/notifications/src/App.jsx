import { useState, useEffect } from 'react'
import StatusBar from '../../../Components/StatusBar'
import AppNav from '../../../Components/AppNav'

import maryImg     from '../../../Images/Customer=Mary McCarthy.png'
import anthonyImg  from '../../../Images/Customer=Anthony Brown.png'
import hilaryImg   from '../../../Images/Customer=Hilary Buxton.png'
import lilyImg     from '../../../Images/Customer=Lily.png'
import sanjeezImg  from '../../../Images/Customer=Sanjeez Chaundry.png'
import harryImg    from '../../../Images/Customer=Harinder Kulkarni.png'
import samImg      from '../../../Images/Customer=Sam Malone.png'

// ─── Icons ────────────────────────────────────────────────────

const ChevronLeftIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)

const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.71969 12.6255L4.73999 12.6499C4.74414 12.6548 4.74834 12.6596 4.75259 12.6644L9.75259 18.2894C10.1195 18.7022 10.7516 18.7393 11.1644 18.3724C11.5771 18.0055 11.6143 17.3734 11.2474 16.9606L7.727 13L18.5 13C19.0523 13 19.5 12.5523 19.5 12C19.5 11.4477 19.0523 11 18.5 11L7.727 11L11.2474 7.03937C11.5861 6.65834 11.5805 6.09046 11.2529 5.71676L11.1644 5.6276C10.7516 5.26068 10.1195 5.29786 9.75259 5.71065L4.75259 11.3356L4.7402 11.3498C4.73323 11.358 4.72639 11.3662 4.71969 11.3746L4.75259 11.3356C4.72265 11.3693 4.69538 11.4045 4.67076 11.441C4.65284 11.4675 4.63629 11.4947 4.62104 11.5227C4.60922 11.5452 4.59534 11.5722 4.5711 11.629C4.56169 11.6537 4.52179 11.7614 4.5 12C4.5 12.1218 4.52179 12.2386 4.56167 12.3465C4.5711 12.3998 4.59534 12.4278 4.62098 12.4771C4.63629 12.5053 4.65284 12.5325 4.67061 12.5589L4.71969 12.6255Z"/>
  </svg>
)

const ClockIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
  </svg>
)

const TimeGlassIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M13.6631555,12.8955987 C15.5379293,13.8324663 17.2297129,16.2385946 17.2301797,18.0105428 L17.2304404,19.0000631 L6.62991901,19.0000046 L6.63017963,18.0105427 C6.6306395,16.2646975 8.27776975,13.9005552 10.1456445,12.9199085 L10.1976839,12.8940314 L11.92646,12.0277319 Z M17.9301797,5.01284409 C17.9301797,5.01396235 17.9301772,5.01507448 17.9301459,5.01610948 L17.2304431,5.01610947 L17.2301797,6.01584603 C17.2297145,7.78174428 15.5446237,10.1644241 13.6624298,11.1069091 L11.930359,11.9742219 L10.1976839,11.1059686 L10.1288102,11.0714556 C8.27109448,10.0959403 6.63063794,7.75577763 6.63017963,6.01584606 L6.62991629,5.01610947 L5.93023116,5.01610948 C5.9301846,5.01503838 5.93017967,5.01394256 5.93017967,5.01284409 C5.93017967,5.00804653 5.92999677,5.00376296 5.9296185,5.00000001 L17.9300949,5.00000001 C17.9301591,5.00406577 17.9301797,5.00839948 17.9301797,5.01284409 Z"
      stroke="currentColor" strokeWidth="2" fillRule="nonzero" />
  </svg>
)

const CancelIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
  </svg>
)

const AddCircleIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
  </svg>
)

const CalendarIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
  </svg>
)

const PersonAddIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
)

const PersonRemoveIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 8c0-2.21-1.79-4-4-4S6 5.79 6 8s1.79 4 4 4 4-1.79 4-4zm-4 6c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm7-2h4v2h-4v-2z"/>
  </svg>
)

const RunIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.5316862,2.25 C19.9042089,2.25 21.8103775,4.17252165 21.8103775,6.56109363 C21.8103775,7.8496122 21.3837488,8.78195426 20.3219865,10.0738404 L20.1732443,10.2523025 L19.7081836,10.7935427 C19.1579376,11.4366344 18.7242877,11.9825709 18.3228589,12.5536133 L18.1736687,12.7691698 L18.0521069,12.9635835 C18.0043383,13.0406934 17.9396825,13.1058825 17.8632144,13.1546699 C17.5785244,13.3363048 17.2004933,13.2527621 17.0191918,12.9678594 L16.9463007,12.854717 L16.890097,12.77017 C16.5022598,12.200899 16.0833253,11.658275 15.5733798,11.0511815 L15.3490849,10.7867858 L14.8755401,10.2352557 L14.6389457,9.94903468 L14.4294845,9.68356497 C14.1341575,9.2985939 13.9203798,8.96793102 13.7430368,8.62080199 C13.4137771,7.97631297 13.25,7.31890047 13.25,6.56109363 C13.25,4.17297543 15.1583415,2.25 17.5316862,2.25 Z M17.5316862,3.47291108 C15.8362095,3.47291108 14.4729111,4.84590921 14.4729111,6.56109363 C14.4729111,7.11498404 14.585996,7.58279609 14.8320591,8.06443701 C14.9496979,8.29470185 15.0899372,8.51980245 15.2738098,8.77155709 L15.3895377,8.92606291 L15.5815192,9.16988989 L15.8033741,9.43861563 L16.27801,9.99141826 C16.7207576,10.5085118 17.0915491,10.9673927 17.427079,11.4177677 L17.5314117,11.5594769 L17.5879302,11.4818583 C17.8822707,11.0833493 18.204096,10.6790482 18.5850789,10.226845 L18.7806467,9.99655663 L19.238958,9.46323938 C20.2743722,8.2372622 20.5874665,7.54526007 20.5874665,6.56109363 C20.5874665,4.84511326 19.2259968,3.47291108 17.5316862,3.47291108 Z M17.5301888,5.61300546 C18.0342755,5.61300546 18.4473721,6.02610205 18.4473721,6.53018877 C18.4473721,7.0342755 18.0342755,7.44737208 17.5301888,7.44737208 C17.026102,7.44737208 16.6130055,7.0342755 16.6130055,6.53018877 C16.6130055,6.02610205 17.026102,5.61300546 17.5301888,5.61300546 Z"
      stroke="currentColor" strokeWidth="0.5" fillRule="nonzero" />
    <path d="M17.2801888,14.25 C17.6944023,14.25 18.0301888,14.5857864 18.0301888,15 C18.0301888,15.3796958 17.7480349,15.693491 17.3819593,15.7431534 L17.2801888,15.75 L9.72977518,15.75 C9.30206188,15.75 8.95533174,16.0967301 8.95533174,16.5244434 C8.95533174,16.916514 9.24668137,17.2405361 9.62468779,17.2918171 L9.72977518,17.2988869 L19.3963725,17.2988869 C20.7092665,17.2988869 21.7735774,18.3631977 21.7735774,19.6760918 C21.7735774,20.9342819 20.7961113,21.9641725 19.5591305,22.0478124 L19.3963725,22.0532967 L5.75,22.0532967 C5.33578644,22.0532967 5,21.7175102 5,21.3032967 C5,20.9236009 5.28215388,20.6098057 5.64822944,20.5601433 L5.75,20.5532967 L19.3963725,20.5532967 C19.8808394,20.5532967 20.2735774,20.1605586 20.2735774,19.6760918 C20.2735774,19.2288916 19.9389367,18.8598509 19.5064072,18.8057215 L19.3963725,18.7988869 L9.72977518,18.7988869 C8.47363475,18.7988869 7.45533174,17.7805839 7.45533174,16.5244434 C7.45533174,15.3206422 8.39054406,14.3352715 9.57405282,14.2552472 L9.72977518,14.25 L17.2801888,14.25 Z M3.1628418,20.5532967 C3.57705536,20.5532967 3.9128418,20.8890831 3.9128418,21.3032967 C3.9128418,21.6829924 3.63068792,21.9967876 3.26461235,22.04645 L3.1628418,22.0532967 L2.84210526,22.0532967 C2.4278917,22.0532967 2.09210526,21.7175102 2.09210526,21.3032967 C2.09210526,20.9236009 2.37425914,20.6098057 2.74033471,20.5601433 L2.84210526,20.5532967 L3.1628418,20.5532967 Z"
      fillRule="nonzero" />
  </svg>
)

const ClockDetailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
  </svg>
)

const CalendarDetailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
  </svg>
)

const PersonDetailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
)

const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
)

const AddCircleDetailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
  </svg>
)

const TimeGlassDetailIcon = () => <TimeGlassIcon size={16} />

const RunDetailIcon = () => <RunIcon size={16} />

// ─── Data ─────────────────────────────────────────────────────

const NOTIFICATIONS = [
  // Midnight-spanning examples — Today
  {
    id: 11, type: 'new', read: false, receivedAt: '20 mins ago', section: 'Today',
    customer: 'Harinder Kulkarni', initials: 'HK', photo: harryImg,
    bookingDate: 'Tue 24 Jun', newTime: '11:30pm',
    bookingEndTime: '1:30am', bookingEndDate: 'Wed 25 Jun',
    duration: '2 hours', address: '89 Birch Street, Sheffield, S2 4PQ',
  },
  {
    id: 12, type: 'shift_visit_changed', read: false, receivedAt: '40 mins ago', section: 'Today',
    customer: 'Sam Malone', initials: 'SM', photo: samImg,
    shiftName: 'Night Round C',
    shiftDate: 'Tue 24 Jun',
    shiftStartTime: '10:30pm',
    shiftDuration: '4 hrs 30 min',
    originalVisitTime: '11:30pm',
    newVisitTime: '12:15am', newVisitDate: 'Wed 25 Jun',
    visitDuration: '45 min',
    address: '22 Castle Road, Sheffield, S1 2GH',
  },
  // Shift notifications — Today
  {
    id: 8, type: 'shift_visit_changed', read: false, receivedAt: '30 mins ago', section: 'Today',
    customer: 'Hilary Buxton', initials: 'HB', photo: hilaryImg,
    shiftName: 'Morning Round A',
    shiftDate: 'Tue 24 Jun',
    shiftStartTime: '8:00am',
    originalVisitTime: '10:00am', newVisitTime: '10:45am',
    visitDuration: '1 hr 30 min',
    shiftDuration: '4 hrs 30 min',
    address: '32 Oak Avenue, Sheffield, S11 8LG',
  },
  {
    id: 9, type: 'shift_duration_changed', read: false, receivedAt: '1 hour ago', section: 'Today',
    shiftName: 'Afternoon Round B',
    shiftInitials: 'AR',
    shiftDate: 'Tue 24 Jun',
    shiftStartTime: '1:00pm',
    originalShiftDuration: '3 hrs', newShiftDuration: '3 hrs 30 min',
    visitCount: 4,
  },
  // Existing booking notifications — Today
  {
    id: 1, type: 'time_changed', read: false, receivedAt: '1 hour ago', section: 'Today',
    customer: 'Mary McCarthy', initials: 'MM', photo: maryImg,
    bookingDate: 'Tue 24 Jun', bookingTime: '9:00am',
    originalTime: '9:00am', newTime: '10:30am',
    duration: '1 hour', address: '14 Meadow Lane, Sheffield, S6 4RN',
  },
  {
    id: 2, type: 'cancelled', read: false, receivedAt: '2 hours ago', section: 'Today',
    customer: 'Anthony Brown', initials: 'AB', photo: anthonyImg,
    bookingDate: 'Wed 25 Jun', bookingTime: '2:00pm',
    originalTime: '2:00pm',
    duration: '45 minutes', address: '7 Park Road, Sheffield, S10 2TH',
  },
  {
    id: 3, type: 'shadow_added', read: false, receivedAt: '3 hours ago', section: 'Today',
    customer: 'Hilary Buxton', initials: 'HB', photo: hilaryImg,
    bookingDate: 'Thu 26 Jun', bookingTime: '10:00am',
    shadowName: 'James Okafor', shadowInitials: 'JO',
    duration: '1 hr 30 min', address: '32 Oak Avenue, Sheffield, S11 8LG',
  },
  // Shift summary — Yesterday
  {
    id: 10, type: 'shift_summary', read: true, receivedAt: 'Yesterday', section: 'Yesterday',
    shiftName: 'Morning Round A',
    shiftInitials: 'MR',
    shiftDate: 'Mon 23 Jun',
    shiftStartTime: '8:00am',
    originalShiftDuration: '4 hrs', newShiftDuration: '3 hrs 45 min',
    changes: [
      { changeType: 'time_changed',     customer: 'Mary McCarthy', originalTime: '9:00am',  newTime: '9:30am' },
      { changeType: 'visit_added',      customer: 'Lily',          time: '11:15am',          duration: '45 min' },
      { changeType: 'duration_changed', customer: 'Hilary Buxton', originalDuration: '1 hr', newDuration: '45 min' },
    ],
  },
  // Existing booking notifications — Yesterday
  {
    id: 4, type: 'duration_changed', read: true, receivedAt: 'Yesterday', section: 'Yesterday',
    customer: 'Harinder Kulkarni', initials: 'HK', photo: harryImg,
    bookingDate: 'Mon 23 Jun', bookingTime: '11:00am',
    originalDuration: '1 hour', newDuration: '45 minutes',
    duration: '45 minutes', address: '89 Birch Street, Sheffield, S2 4PQ',
  },
  {
    id: 5, type: 'date_changed', read: true, receivedAt: 'Yesterday', section: 'Yesterday',
    customer: 'Lily', initials: 'LY', photo: lilyImg,
    originalDate: 'Fri 27 Jun', newDate: 'Sat 28 Jun', bookingTime: '8:00am',
    bookingDate: 'Sat 28 Jun',
    duration: '1 hour', address: '5 Elm Close, Sheffield, S7 1NP',
  },
  {
    id: 6, type: 'shadow_removed', read: true, receivedAt: 'Yesterday', section: 'Yesterday',
    customer: 'Sanjeez Chaundry', initials: 'SC', photo: sanjeezImg,
    bookingDate: 'Fri 27 Jun', bookingTime: '9:30am',
    shadowName: 'Sarah Mitchell', shadowInitials: 'SM',
    duration: '1 hour', address: '41 Manor Drive, Sheffield, S8 0YT',
  },
  {
    id: 7, type: 'new', read: true, receivedAt: '3 days ago', section: 'Earlier',
    customer: 'Sam Malone', initials: 'SM', photo: samImg,
    bookingDate: 'Wed 18 Jun', bookingTime: '3:30pm',
    newTime: '3:30pm',
    duration: '1 hour', address: '22 Castle Road, Sheffield, S1 2GH',
  },
]

const TYPE_CONFIG = {
  time_changed:           { label: 'Booking time changed',       iconBg: '#fef3dc', iconColor: '#e09000', Icon: ClockIcon },
  duration_changed:       { label: 'Duration changed',           iconBg: '#fef3dc', iconColor: '#e09000', Icon: TimeGlassIcon },
  date_changed:           { label: 'Date changed',               iconBg: '#e8f0fe', iconColor: '#1a73e8', Icon: CalendarIcon },
  cancelled:              { label: 'Booking cancelled',          iconBg: '#fdeaea', iconColor: '#c0392b', Icon: CancelIcon },
  new:                    { label: 'New booking',                iconBg: '#e6f4ec', iconColor: '#27ae60', Icon: AddCircleIcon },
  shadow_added:           { label: 'Shadow careworker added',    iconBg: '#ede7f6', iconColor: '#7b1fa2', Icon: PersonAddIcon },
  shadow_removed:         { label: 'Shadow careworker removed',  iconBg: '#f0f0f0', iconColor: '#555',    Icon: PersonRemoveIcon },
  shift_visit_changed:    { label: 'Booking time changed',       iconBg: '#fef3dc', iconColor: '#e09000', Icon: ClockIcon },
  shift_duration_changed: { label: 'Shift duration changed',     iconBg: '#fef3dc', iconColor: '#e09000', Icon: TimeGlassIcon },
  shift_summary:          { label: 'Shift updated',              iconBg: '#f0ecf5', iconColor: '#6d1b98', Icon: RunIcon },
}

const SHIFT_TYPES = ['shift_visit_changed', 'shift_duration_changed', 'shift_summary']

const renderDetail = (notif) => {
  switch (notif.type) {
    case 'time_changed':
      return <><s>{notif.originalTime}</s>{` ${notif.newTime}, ${notif.bookingDate}`}</>
    case 'duration_changed':
      return <><s>{notif.originalDuration}</s>{` ${notif.newDuration}, ${notif.bookingDate}, ${notif.bookingTime}`}</>
    case 'date_changed':
      return <><s>{notif.originalDate}</s>{` ${notif.newDate}, ${notif.bookingTime}`}</>
    case 'cancelled':
      return <s>{`${notif.originalTime}, ${notif.bookingDate}`}</s>
    case 'new':
      return notif.bookingEndDate
        ? `${notif.newTime}, ${notif.bookingDate} – ${notif.bookingEndTime}, ${notif.bookingEndDate}`
        : `${notif.newTime}, ${notif.bookingDate}`
    case 'shadow_added':
      return `${notif.shadowName} added, ${notif.bookingTime}, ${notif.bookingDate}`
    case 'shadow_removed':
      return <><s>{notif.shadowName}</s>{` removed, ${notif.bookingTime}, ${notif.bookingDate}`}</>
    case 'shift_visit_changed':
      return notif.newVisitDate && notif.newVisitDate !== notif.shiftDate
        ? <><s>{`${notif.originalVisitTime}, ${notif.shiftDate}`}</s>{` ${notif.newVisitTime}, ${notif.newVisitDate}`}</>
        : <><s>{notif.originalVisitTime}</s>{` ${notif.newVisitTime}, ${notif.shiftDate}`}</>
    case 'shift_duration_changed':
      return <><s>{notif.originalShiftDuration}</s>{` ${notif.newShiftDuration}, ${notif.shiftStartTime}, ${notif.shiftDate}`}</>
    case 'shift_summary': {
      const durationChanged = notif.originalShiftDuration !== notif.newShiftDuration
      const total = notif.changes.length + (durationChanged ? 1 : 0)
      return `${total} changes, ${notif.shiftStartTime}, ${notif.shiftDate}`
    }
    default:
      return ''
  }
}

// ─── Notification Row ──────────────────────────────────────────

function NotifRow({ notif }) {
  const config = TYPE_CONFIG[notif.type]
  const { Icon } = config
  const displayName = notif.type === 'shift_visit_changed' ? notif.customer : (notif.shiftName || notif.customer)

  return (
    <div className={`notif-row${notif.read ? '' : ' unread'}`}>
      <div className="notif-avatar-wrap">
        {notif.photo
          ? <img src={notif.photo} className="notif-avatar" alt={notif.customer} />
          : <div
              className="notif-avatar notif-avatar-initials"
              style={{
                background: notif.shiftInitials ? '#dcd9e4' : notif.avatarColor,
                color:      notif.shiftInitials ? '#6d1b98' : '#fff',
              }}
            >
              {notif.shiftInitials ? <RunIcon size={22} /> : notif.initials}
            </div>
        }
        {notif.type !== 'shift_summary' && (
          <div className="notif-type-badge" style={{ background: config.iconBg, color: config.iconColor }}>
            <Icon size={13} />
          </div>
        )}
      </div>

      <div className="notif-body">
        <div className={`notif-title${notif.read ? '' : ' bold'}`}>{config.label}</div>
        <div className="notif-customer">{displayName}</div>
        <div className="notif-detail">{renderDetail(notif)}</div>
        {notif.type === 'shift_visit_changed' && (
          <div className="notif-shift-context">
            <RunIcon size={11} />
            {notif.shiftName}, {notif.shiftStartTime}, {notif.shiftDuration}
          </div>
        )}
      </div>

      <div className="notif-right">
        {!notif.read && <div className="notif-unread-dot" />}
        <span className="notif-time">{notif.receivedAt}</span>
      </div>
    </div>
  )
}

// ─── Filters ──────────────────────────────────────────────────

// const FILTERS = [
//   { id: 'all',       label: 'All',         types: null },
//   { id: 'changes',   label: 'Changes',     types: ['time_changed', 'duration_changed', 'date_changed'] },
//   { id: 'shifts',    label: 'Shifts',      types: SHIFT_TYPES },
//   { id: 'new',       label: 'New',         types: ['new'] },
//   { id: 'cancelled', label: 'Cancelled',   types: ['cancelled'] },
//   { id: 'carer',     label: 'Careworker',  types: ['shadow_added', 'shadow_removed'] },
// ]

// ─── Notification Centre Screen ────────────────────────────────

function NotifCentreScreen({ notifications, onViewBooking, unreadCount, onMarkAllRead }) {
  // const [activeFilter, setActiveFilter] = useState('all')
  // const filter = FILTERS.find(f => f.id === activeFilter)
  // const filtered = filter.types ? notifications.filter(n => filter.types.includes(n.type)) : notifications
  const filtered = notifications

  const sections = ['Today', 'Yesterday', 'Earlier']
  const grouped = sections
    .map(label => ({ label, items: filtered.filter(n => n.section === label) }))
    .filter(g => g.items.length > 0)

  return (
    <div className="screen">
      <StatusBar />
      <div className="app-header">
        <span className="app-header-title" style={{ textAlign: 'left' }}>Notifications</span>
        {unreadCount > 0 && (
          <button className="notif-header-action" onClick={onMarkAllRead}>Mark all as read</button>
        )}
      </div>
      {/* <div className="notif-filters">
        {FILTERS.map(f => (
          <button
            key={f.id}
            className={`notif-filter-pill${activeFilter === f.id ? ' active' : ''}`}
            onClick={() => setActiveFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div> */}
      <div className="notif-list">
        {grouped.length > 0 ? grouped.map(group => (
          <div key={group.label}>
            <div className="notif-section-header">{group.label}</div>
            {group.items.map(n => (
              <div key={n.id} onClick={() => onViewBooking(n)} style={{ cursor: 'pointer' }}>
                <NotifRow notif={n} />
              </div>
            ))}
          </div>
        )) : (
          <div className="notif-empty-state">No notifications</div>
        )}
      </div>
    </div>
  )
}

// ─── Detail Screen ─────────────────────────────────────────────

const STATUS_CONFIG = {
  time_changed:           { label: 'Time changed',              bg: '#fef3dc', color: '#b37a00' },
  duration_changed:       { label: 'Duration changed',          bg: '#fef3dc', color: '#b37a00' },
  date_changed:           { label: 'Date changed',              bg: '#e8f0fe', color: '#1557b0' },
  cancelled:              { label: 'Cancelled',                 bg: '#fdeaea', color: '#c0392b' },
  new:                    { label: 'New booking',               bg: '#e6f4ec', color: '#1e7e45' },
  shadow_added:           { label: 'Shadow careworker added',   bg: '#ede7f6', color: '#6a1b9a' },
  shadow_removed:         { label: 'Shadow careworker removed', bg: '#f0f0f0', color: '#555'    },
  shift_visit_changed:    { label: 'Booking time changed',      bg: '#fef3dc', color: '#b37a00' },
  shift_duration_changed: { label: 'Shift duration changed',    bg: '#fef3dc', color: '#b37a00' },
  shift_summary:          { label: 'Shift updated',             bg: '#f0ecf5', color: '#6d1b98' },
}

function DetailRow({ icon, label, value, strikethrough = false, iconColor = '#726694' }) {
  return (
    <div className="booking-detail-row">
      <div className="booking-detail-icon-col" style={{ color: iconColor }}>{icon}</div>
      <div>
        <div className="booking-detail-label">{label}</div>
        <div className={`booking-detail-value${strikethrough ? ' strikethrough' : ''}`}>{value}</div>
      </div>
    </div>
  )
}

function DetailSectionLabel({ children }) {
  return <div className="booking-detail-section-label">{children}</div>
}

function BookingDetailScreen({ notif, onBack }) {
  const status = STATUS_CONFIG[notif.type]
  const isShift = notif.type === 'shift_duration_changed' || notif.type === 'shift_summary'
  const displayName = notif.type === 'shift_visit_changed' ? notif.customer : (notif.shiftName || notif.customer)
  const headerTitle = isShift ? 'Shift update' : 'Booking update'

  return (
    <div className="screen">
      <StatusBar />
      <div className="app-header">
        <button className="app-header-back" onClick={onBack}>
          <ArrowLeftIcon />
        </button>
        <span className="app-header-title">{headerTitle}</span>
        <div style={{ width: 36 }} />
      </div>

      <div className="booking-detail-scroll">
        <div className="booking-detail-customer">
          {notif.photo
            ? <img src={notif.photo} className="booking-detail-avatar-img" alt={notif.customer} />
            : <div
                className="booking-detail-avatar"
                style={{
                  background: notif.shiftInitials ? '#dcd9e4' : notif.avatarColor,
                  color:      notif.shiftInitials ? '#6d1b98' : '#fff',
                }}
              >
                {notif.shiftInitials ? <RunIcon size={32} /> : notif.initials}
              </div>
          }
          <div className="booking-detail-name">{displayName}</div>
          <div className="booking-detail-status-badge" style={{ background: status.bg, color: status.color }}>
            {status.label}
          </div>
        </div>

        <div className="booking-detail-divider" />

        <div className="booking-detail-section">

          {/* ── Booking types ── */}
          {notif.type === 'time_changed' && <>
            <DetailRow icon={<ClockDetailIcon />} label="Original time" value={`${notif.originalTime}, ${notif.bookingDate}`} strikethrough iconColor="#bbb" />
            <DetailRow icon={<ClockDetailIcon />} label="Updated time"  value={`${notif.newTime}, ${notif.bookingDate}`} iconColor="#e09000" />
          </>}

          {notif.type === 'duration_changed' && <>
            <DetailRow icon={<ClockDetailIcon />} label="Visit time"        value={`${notif.bookingTime}, ${notif.bookingDate}`} />
            <DetailRow icon={<TimeGlassDetailIcon />} label="Original duration" value={notif.originalDuration} strikethrough iconColor="#bbb" />
            <DetailRow icon={<TimeGlassDetailIcon />} label="Updated duration"  value={notif.newDuration} iconColor="#e09000" />
          </>}

          {notif.type === 'date_changed' && <>
            <DetailRow icon={<CalendarDetailIcon />} label="Original date" value={`${notif.originalDate}, ${notif.bookingTime}`} strikethrough iconColor="#bbb" />
            <DetailRow icon={<CalendarDetailIcon />} label="Updated date"  value={`${notif.newDate}, ${notif.bookingTime}`} iconColor="#1a73e8" />
          </>}

          {notif.type === 'cancelled' && (
            <DetailRow icon={<ClockDetailIcon />} label="Cancelled booking" value={`${notif.originalTime}, ${notif.bookingDate}`} strikethrough iconColor="#c0392b" />
          )}

          {notif.type === 'new' && (notif.bookingEndDate ? <>
            <DetailRow icon={<ClockDetailIcon />} label="Start time" value={`${notif.newTime}, ${notif.bookingDate}`}       iconColor="#27ae60" />
            <DetailRow icon={<ClockDetailIcon />} label="End time"   value={`${notif.bookingEndTime}, ${notif.bookingEndDate}`} iconColor="#27ae60" />
          </> :
            <DetailRow icon={<ClockDetailIcon />} label="Booking time" value={`${notif.newTime}, ${notif.bookingDate}`} iconColor="#27ae60" />
          )}

          {notif.type === 'shadow_added' && <>
            <DetailRow icon={<PersonDetailIcon />} label="Shadow careworker added" value={notif.shadowName} iconColor="#7b1fa2" />
            <DetailRow icon={<ClockDetailIcon />}  label="Booking time" value={`${notif.bookingTime}, ${notif.bookingDate}`} />
          </>}

          {notif.type === 'shadow_removed' && <>
            <DetailRow icon={<PersonDetailIcon />} label="Shadow careworker removed" value={notif.shadowName} strikethrough iconColor="#bbb" />
            <DetailRow icon={<ClockDetailIcon />}  label="Booking time" value={`${notif.bookingTime}, ${notif.bookingDate}`} />
          </>}

          {/* ── Shift: single visit changed ── */}
          {notif.type === 'shift_visit_changed' && <>
            <DetailRow icon={<ClockDetailIcon />}  label="Original time" value={`${notif.originalVisitTime}, ${notif.shiftDate}`} strikethrough iconColor="#bbb" />
            <DetailRow icon={<ClockDetailIcon />}  label="Updated time"  value={`${notif.newVisitTime}, ${notif.newVisitDate || notif.shiftDate}`} iconColor="#e09000" />
            <DetailRow icon={<RunDetailIcon />}    label="Shift"               value={notif.shiftName} iconColor="#726694" />
            <DetailRow icon={<ClockDetailIcon />}  label="Shift time"    value={`${notif.shiftStartTime}, ${notif.shiftDate}`} />
            <DetailRow icon={<TimeGlassDetailIcon />}  label="Shift duration"      value={notif.shiftDuration} />
          </>}

          {/* ── Shift: duration only ── */}
          {notif.type === 'shift_duration_changed' && <>
            <DetailRow icon={<TimeGlassDetailIcon />}  label="Original duration" value={notif.originalShiftDuration} strikethrough iconColor="#bbb" />
            <DetailRow icon={<TimeGlassDetailIcon />}  label="Updated duration"  value={notif.newShiftDuration} iconColor="#e09000" />
            <DetailRow icon={<ClockDetailIcon />}  label="Time"        value={`${notif.shiftStartTime}, ${notif.shiftDate}`} />
            <DetailRow icon={<RunDetailIcon />}    label="Visits"         value={notif.visitCount} iconColor="#726694" />
          </>}

          {/* ── Shift: summary (multiple changes) ── */}
          {notif.type === 'shift_summary' && <>
            <DetailSectionLabel>Visit changes ({notif.changes.length})</DetailSectionLabel>
            {notif.changes.map((c, i) => {
              if (c.changeType === 'time_changed') return (
                <DetailRow key={i} icon={<ClockDetailIcon />}      label={`Time changed, ${c.customer}`}     value={<><s>{c.originalTime}</s>{` ${c.newTime}`}</>}                   iconColor="#e09000" />
              )
              if (c.changeType === 'visit_added') return (
                <DetailRow key={i} icon={<AddCircleDetailIcon />}  label={`Visit added, ${c.customer}`}      value={`${c.time}, ${c.duration}`}                                    iconColor="#27ae60" />
              )
              if (c.changeType === 'duration_changed') return (
                <DetailRow key={i} icon={<TimeGlassDetailIcon />}      label={`Duration changed, ${c.customer}`} value={<><s>{c.originalDuration}</s>{` ${c.newDuration}`}</>}           iconColor="#e09000" />
              )
              return null
            })}
            <DetailSectionLabel>Shift</DetailSectionLabel>
            <DetailRow icon={<TimeGlassDetailIcon />} label="Original duration" value={notif.originalShiftDuration} strikethrough iconColor="#bbb" />
            <DetailRow icon={<TimeGlassDetailIcon />} label="Updated duration"  value={notif.newShiftDuration} iconColor="#e09000" />
            <DetailRow icon={<ClockDetailIcon />} label="Shift time"        value={`${notif.shiftStartTime}, ${notif.shiftDate}`} />
          </>}

          {notif.duration && notif.type !== 'duration_changed' && <DetailRow icon={<TimeGlassDetailIcon />} label="Duration" value={notif.duration} />}
          {notif.address  && <DetailRow icon={<MapPinIcon />}       label="Address"  value={notif.address} />}
        </div>

      </div>
    </div>
  )
}

// ─── Root ──────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState('list')
  const [selectedNotif, setSelectedNotif] = useState(null)
  const [notifications, setNotifications] = useState(NOTIFICATIONS)
  const [badgeCount, setBadgeCount] = useState(() => NOTIFICATIONS.filter(n => !n.read).length)

  useEffect(() => {
    setBadgeCount(0)
  }, [])

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const viewBooking = (notif) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))
    setSelectedNotif(notif)
    setView('detail')
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="phone-wrap">
      <a href="../../" className="back-link">
        <ChevronLeftIcon /> Prototypes
      </a>
      <div className="phone-frame">
        <div className="screen-area">
          <div className={`screen-slide ${view === 'list' ? 'slide-active' : 'slide-out-left'}`}>
            <NotifCentreScreen
              notifications={notifications}
              onViewBooking={viewBooking}
              unreadCount={unreadCount}
              onMarkAllRead={markAllRead}
            />
          </div>
          <div className={`screen-slide ${view === 'detail' ? 'slide-active' : 'slide-out-right'}`}>
            {selectedNotif && (
              <BookingDetailScreen
                notif={selectedNotif}
                onBack={() => setView('list')}
              />
            )}
          </div>
        </div>
        <AppNav
          activeTab="notifications"
          notifCount={badgeCount}
          totalUnread={4}
          links={{ messages: '../messaging/' }}
        />
      </div>
    </div>
  )
}
