// Shared mock notifications — single source of truth so unread counts stay
// in sync between the notifications prototype and any other prototype's nav badge.

import maryImg     from '../Images/Customer=Mary McCarthy.png'
import anthonyImg  from '../Images/Customer=Anthony Brown.png'
import hilaryImg   from '../Images/Customer=Hilary Buxton.png'
import lilyImg     from '../Images/Customer=Lily.png'
import sanjeezImg  from '../Images/Customer=Sanjeez Chaundry.png'
import harryImg    from '../Images/Customer=Harinder Kulkarni.png'
import samImg      from '../Images/Customer=Sam Malone.png'

export const NOTIFICATIONS = [
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
  // Non-contact event — Today
  {
    id: 14, type: 'event_time_changed', read: false, receivedAt: '1 hour ago', section: 'Today',
    eventName: 'Staff Meeting', isEvent: true,
    eventDate: 'Thu 27 Jun',
    originalTime: '2:00pm', newTime: '3:30pm',
    duration: '1 hour', address: 'Meeting Room 1, Head Office',
  },
  // New shift — Today
  {
    id: 13, type: 'shift_new', read: false, receivedAt: '2 hours ago', section: 'Today',
    shiftName: 'Evening Round D',
    shiftInitials: 'ER',
    shiftDate: 'Tue 24 Jun',
    shiftStartTime: '5:00pm',
    shiftDuration: '3 hrs',
    bookings: [
      { customer: 'Jane Doe',   time: '5:00pm', duration: '45 min' },
      { customer: 'Tom Baker',  time: '6:00pm', duration: '30 min' },
      { customer: 'Ellen Rees', time: '7:15pm', duration: '45 min' },
    ],
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
  // Non-contact events — Yesterday
  {
    id: 15, type: 'event_date_changed', read: true, receivedAt: 'Yesterday', section: 'Yesterday',
    eventName: 'Manual Handling Training', isEvent: true,
    originalDate: 'Mon 30 Jun', newDate: 'Wed 2 Jul', eventTime: '9:00am',
    duration: '2 hours', address: 'Training Room 2, Head Office',
  },
  {
    id: 16, type: 'event_duration_changed', read: true, receivedAt: 'Yesterday', section: 'Yesterday',
    eventName: 'Supervision — J. Okafor', isEvent: true,
    eventDate: 'Fri 28 Jun', eventTime: '11:00am',
    originalDuration: '30 minutes', newDuration: '45 minutes',
    address: 'Office 3, Head Office',
  },
]

export const UNREAD_NOTIFICATIONS_COUNT = NOTIFICATIONS.filter(n => !n.read).length
