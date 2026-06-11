import { useState, useRef, useEffect } from 'react'
import StatusBar from '../../../Components/StatusBar'
import AppHeader from '../../../Components/AppHeader'
import AppNav from '../../../Components/AppNav'
import PhoneFrame from '../../../Components/PhoneFrame'

/* ── Icons ───────────────────────────────────────────────────────── */

const ChevronLeftIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)

const ChevronDownIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
  </svg>
)

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const DocumentIcon = () => (
  <svg width="24" height="24" viewBox="-5.07 -3 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M8.10373 0C8.60602 0 9.08992 0.189001 9.45925 0.529434L13.22 3.99599C13.6308 4.37464 13.8645 4.90786 13.8645 5.46655V14.6896C13.8645 16.5169 12.3773 17.9986 10.5417 18H3.32534C1.48881 18 0 16.5179 0 14.6896V3.31042C0 1.48212 1.48881 0 3.32534 0H8.10373ZM7.94685 1.98153H3.41796C2.58954 1.98153 1.91796 2.6531 1.91796 3.48153V14.5127C1.91796 15.3411 2.58954 16.0127 3.41796 16.0127H10.4075C11.2359 16.0127 11.9075 15.3411 11.9075 14.5127V6.06202H9.73742C8.74852 6.06202 7.94685 5.26395 7.94685 4.27948V1.98153ZM6.88131 10.5C7.43359 10.5 7.88131 10.9477 7.88131 11.5C7.88131 12.0523 7.43359 12.5 6.88131 12.5H3.88131C3.32902 12.5 2.88131 12.0523 2.88131 11.5C2.88131 10.9477 3.32902 10.5 3.88131 10.5H6.88131ZM9.88131 7.5C10.4336 7.5 10.8813 7.94772 10.8813 8.5C10.8813 9.05228 10.4336 9.5 9.88131 9.5H3.88131C3.32902 9.5 2.88131 9.05228 2.88131 8.5C2.88131 7.94772 3.32902 7.5 3.88131 7.5H9.88131Z"/>
  </svg>
)

const CalendarMenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M19 4H18V3C18 2.45 17.55 2 17 2C16.45 2 16 2.45 16 3V4H8V3C8 2.45 7.55 2 7 2C6.45 2 6 2.45 6 3V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 19C19 19.55 18.55 20 18 20H6C5.45 20 5 19.55 5 19V9H19V19ZM7 11H9V13H7V11ZM11 11H13V13H11V11ZM15 11H17V13H15V11ZM7 15H9V17H7V15ZM11 15H13V17H11V15ZM15 15H17V17H15V15Z"/>
  </svg>
)

const CarMenuIcon = () => (
  <svg width="24" height="24" viewBox="-3 -4 24 24" fill="currentColor">
    <path d="M15.92 1.01C15.72 0.42 15.16 0 14.5 0H3.5C2.84 0 2.29 0.42 2.08 1.01L0 7V15C0 15.55 0.45 16 1 16H2C2.55 16 3 15.55 3 15V14H15V15C15 15.55 15.45 16 16 16H17C17.55 16 18 15.55 18 15V7L15.92 1.01ZM3.5 11C2.67 11 2 10.33 2 9.5C2 8.67 2.67 8 3.5 8C4.33 8 5 8.67 5 9.5C5 10.33 4.33 11 3.5 11ZM14.5 11C13.67 11 13 10.33 13 9.5C13 8.67 13.67 8 14.5 8C15.33 8 16 8.67 16 9.5C16 10.33 15.33 11 14.5 11ZM2 6L3.5 1.5H14.5L16 6H2Z"/>
  </svg>
)

const OfficeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M15.1875 20.3246V17.2729H17.347V20.3246C17.347 20.6103 17.5786 20.8418 17.8643 20.8418H20.4828C20.7685 20.8418 21 20.6103 21 20.3246V3.67585C21.0002 3.39012 20.7687 3.1584 20.483 3.15814C20.4763 3.15814 20.4699 3.1584 20.4633 3.15861C20.4482 3.15814 20.4331 3.15814 20.418 3.15861C20.4072 3.16047 20.3963 3.16254 20.3857 3.16502L3.42022 6.30736C3.17546 6.35412 2.99877 6.56888 3.00001 6.81798V20.3244C3.00001 20.6101 3.23153 20.8416 3.51725 20.8416H14.6702C14.9559 20.8416 15.1875 20.6101 15.1875 20.3246ZM14.4441 7.71033C14.4428 7.44364 14.6443 7.21978 14.9096 7.19309C14.9268 7.19226 14.9441 7.19226 14.9613 7.19309H17.4828C17.7685 7.19309 18 7.4246 18 7.71033V10.3288C18 10.6145 17.7685 10.846 17.4828 10.846H14.9613C14.6756 10.846 14.4441 10.6145 14.4441 10.3288V7.71033ZM9.55615 15.4431C9.55615 15.7288 9.32463 15.9603 9.03891 15.9603H6.52367C6.23794 15.9603 6.00642 15.7288 6.00642 15.4431V12.8246C6.00518 12.5579 6.2067 12.334 6.47194 12.3074C6.48911 12.3065 6.50649 12.3065 6.52367 12.3074H9.0387C9.32442 12.3074 9.55594 12.5389 9.55594 12.8246L9.55615 15.4431ZM9.55615 10.3288C9.55615 10.6145 9.32463 10.846 9.03891 10.846H6.52367C6.23794 10.846 6.00642 10.6145 6.00642 10.3288V7.71033C6.00518 7.44364 6.2067 7.21978 6.47194 7.19309C6.48911 7.19226 6.50649 7.19226 6.52367 7.19309H9.0387C9.32442 7.19309 9.55594 7.4246 9.55594 7.71033L9.55615 10.3288ZM13.7781 15.4431C13.7781 15.7288 13.5466 15.9603 13.2608 15.9603H10.7392C10.4535 15.9603 10.2219 15.7288 10.2219 15.4431V12.8246C10.2207 12.5579 10.4222 12.334 10.6875 12.3074C10.7046 12.3065 10.722 12.3065 10.7392 12.3074H13.2608C13.5466 12.3074 13.7781 12.5389 13.7781 12.8246V15.4431ZM13.7781 10.3288C13.7781 10.6145 13.5466 10.846 13.2608 10.846H10.7392C10.4535 10.846 10.2219 10.6145 10.2219 10.3288V7.71033C10.2207 7.44364 10.4222 7.21978 10.6875 7.19309C10.7046 7.19226 10.722 7.19226 10.7392 7.19309H13.2608C13.5466 7.19309 13.7781 7.4246 13.7781 7.71033V10.3288ZM14.4441 15.4431V12.8246C14.4428 12.5579 14.6443 12.334 14.9096 12.3074C14.9268 12.3065 14.9441 12.3065 14.9613 12.3074H17.4828C17.7685 12.3074 18 12.5389 18 12.8246V15.4431C18 15.7288 17.7685 15.9603 17.4828 15.9603H14.9613C14.6756 15.9603 14.4441 15.7286 14.4441 15.4431Z"/>
  </svg>
)

const FaceIdIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M0.538462 18.9223C0.835846 18.9223 1.07692 19.1634 1.07692 19.4608V20.1538C1.07692 21.6339 2.23805 22.8428 3.69908 22.9192L3.84615 22.9231L4.53769 22.9226C4.79774 22.9225 5.01482 23.1068 5.06515 23.352L5.07615 23.4608C5.07615 23.7582 4.83513 23.9994 4.53769 23.9996L3.84615 24C1.72198 24 0 22.278 0 20.1538V19.4608C0 19.1634 0.241077 18.9223 0.538462 18.9223ZM23.4608 18.9223C23.7582 18.9223 23.9994 19.1633 23.9996 19.4608L24 20.1538C24 22.278 22.278 24 20.1538 24L19.4608 23.9996C19.1633 23.9994 18.9223 23.7582 18.9223 23.4608C18.9223 23.2007 19.1068 22.9838 19.352 22.9336L19.4608 22.9226L20.1538 22.9231C21.6339 22.9231 22.8428 21.7619 22.9192 20.3009L22.9231 20.1538L22.9226 19.4608C22.9225 19.2007 23.1068 18.9836 23.352 18.9333L23.4608 18.9223ZM16.4074 15.9787C16.6031 16.2143 16.5708 16.5639 16.3353 16.7596C15.0656 17.8147 13.4851 18.3764 11.8588 18.3764C10.2322 18.3764 8.6518 17.8148 7.3823 16.7596C7.14662 16.564 7.11439 16.2143 7.31016 15.9788C7.5059 15.7435 7.85553 15.7113 8.09097 15.9069C10.2742 17.7213 13.4431 17.7213 15.6261 15.9069C15.8617 15.7111 16.2113 15.7434 16.4074 15.9787ZM12.0003 7.16209C12.2427 7.16209 12.4522 7.31866 12.5265 7.54305L12.5479 7.6302L12.5547 7.71654V11.5089C12.5547 12.619 11.6515 13.5222 10.5415 13.5222C10.235 13.5222 9.98672 13.2737 9.98727 12.9675C9.98727 12.689 10.1924 12.4586 10.4598 12.419L10.5417 12.413C10.9681 12.413 11.3309 12.1149 11.423 11.7124L11.4403 11.6097L11.4458 11.5089V7.71654C11.4458 7.41029 11.694 7.16209 12.0003 7.16209ZM6.89489 7.41909C7.19764 7.41909 7.45689 7.62308 7.5351 7.90809L7.55299 7.9959L7.55875 8.08295V9.54148C7.55875 9.90816 7.26131 10.2053 6.89463 10.2053C6.59188 10.2053 6.33263 10.0014 6.25442 9.71634L6.23653 9.62853L6.23077 9.54148V8.08295C6.23077 7.71628 6.52821 7.41909 6.89489 7.41909ZM17.1051 7.41883C17.4081 7.41883 17.6674 7.62282 17.7456 7.90799L17.7635 7.99585L17.7692 8.08295V9.54148C17.7692 9.90811 17.4718 10.2051 17.1051 10.2051C16.8024 10.2051 16.5431 10.0011 16.4649 9.71609L16.447 9.62827L16.4412 9.54123V8.0827C16.4412 7.71615 16.7386 7.41883 17.1051 7.41883ZM4.53769 0C4.83508 0 5.07615 0.241077 5.07615 0.538462C5.07615 0.835846 4.83508 1.07692 4.53769 1.07692H3.84615C2.36609 1.07692 1.15721 2.23805 1.08076 3.69908L1.07692 3.84615V4.53769C1.07692 4.83508 0.835846 5.07615 0.538462 5.07615C0.241077 5.07615 0 4.83508 0 4.53769L0 3.84615C0 1.72198 1.72198 0 3.84615 0L4.53769 0ZM20.1538 0C22.278 0 24 1.72198 24 3.84615L23.9996 4.53769C23.9994 4.83513 23.7582 5.07615 23.4608 5.07615C23.2007 5.07615 22.9838 4.89169 22.9336 4.64648L22.9226 4.53769L22.9231 3.84615C22.9231 2.36609 21.7619 1.15721 20.3009 1.08076L20.1538 1.07692H19.4608C19.1634 1.07692 18.9223 0.835846 18.9223 0.538462C18.9223 0.241077 19.1634 0 19.4608 0H20.1538Z"/>
  </svg>
)

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M4 8H8V4H4V8ZM10 20H14V16H10V20ZM4 20H8V16H4V20ZM4 14H8V10H4V14ZM10 14H14V10H10V14ZM16 4V8H20V4H16ZM10 8H14V4H10V8ZM16 14H20V10H16V14ZM16 20H20V16H16V20Z"/>
  </svg>
)

const PpeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.5 6C18.19 6 17.13 7.01 17.02 8.3C15.14 7.8 14.18 6.5 12 6.5C9.81 6.5 8.86 7.8 6.98 8.3C6.87 7.02 5.81 6 4.5 6C3.12 6 2 7.12 2 8.5V9C2 15 5.6 16.81 8.52 16.98C9.53 17.62 10.72 18 12 18C13.28 18 14.47 17.62 15.48 16.98C18.4 16.81 22 15 22 9V8.5C22 7.12 20.88 6 19.5 6ZM3.5 9V8.5C3.5 7.95 3.95 7.5 4.5 7.5C5.05 7.5 5.5 7.95 5.5 8.5V11.5C5.5 12.78 5.88 13.97 6.51 14.98C4.99 14.27 3.5 12.65 3.5 9ZM20.5 9C20.5 12.65 19.01 14.27 17.49 14.98C18.13 13.97 18.5 12.78 18.5 11.5V8.5C18.5 7.95 18.95 7.5 19.5 7.5C20.05 7.5 20.5 7.95 20.5 8.5V9ZM10.69 10.48C10.25 10.74 9.73 11.04 9 11.24V10.2C9.48 10.03 9.84 9.82 10.18 9.62C10.72 9.3 11.23 9 12 9C12.77 9 13.27 9.3 13.8 9.62C14.14 9.82 14.51 10.04 15 10.21V11.25C14.25 11.04 13.74 10.74 13.29 10.47C12.83 10.2 12.49 10 12 10C11.51 10 11.16 10.2 10.69 10.48Z"/>
  </svg>
)

const DataIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14.4 16L13 14.6L15.6 12L13 9.4L14.4 8L17 10.6L19.6 8L21 9.4L18.4 12L21 14.6L19.6 16L17 13.4L14.4 16ZM6 23C5.45 23 4.97917 22.8042 4.5875 22.4125C4.19583 22.0208 4 21.55 4 21V3C4 2.45 4.19583 1.97917 4.5875 1.5875C4.97917 1.19583 5.45 1 6 1H16C16.55 1 17.0208 1.19583 17.4125 1.5875C17.8042 1.97917 18 2.45 18 3V7H16V6H6V18H16V17H18V21C18 21.55 17.8042 22.0208 17.4125 22.4125C17.0208 22.8042 16.55 23 16 23H6ZM6 20V21H16V20H6ZM6 4H16V3H6V4Z"/>
  </svg>
)

const EmailIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM19 18H5C4.45 18 4 17.55 4 17V8L10.94 12.34C11.59 12.75 12.41 12.75 13.06 12.34L20 8V17C20 17.55 19.55 18 19 18ZM12 11L4 6H20L12 11Z"/>
  </svg>
)

const AuthenticatorIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M20 5L12 2L4 5V10.95C4 13.4833 4.75 15.8125 6.25 17.9375C7.75 20.0625 9.66667 21.4167 12 22C14.3333 21.4167 16.25 20.0625 17.75 17.9375C19.25 15.8125 20 13.4833 20 10.95V5ZM5.5 6.05L12 3.6L18.5 6.05V10.95C18.5 13.1333 17.8958 15.1042 16.6875 16.8625C15.4792 18.6208 13.9167 19.8167 12 20.45C10.0833 19.8167 8.52083 18.6208 7.3125 16.8625C6.10417 15.1042 5.5 13.1333 5.5 10.95V6.05ZM9.16406 15.3333C9.27344 15.4444 9.40625 15.5 9.5625 15.5H14.4375C14.5938 15.5 14.7266 15.4444 14.8359 15.3333C14.9453 15.2222 15 15.0873 15 14.9286V10.7952C15 10.6365 14.9453 10.5016 14.8359 10.3905C14.7266 10.2794 14.5938 10.2238 14.4375 10.2238H13.7812V9.30952C13.7812 8.80794 13.6078 8.38095 13.2609 8.02857C12.9141 7.67619 12.4937 7.5 12 7.5C11.5063 7.5 11.0859 7.67619 10.7391 8.02857C10.3922 8.38095 10.2188 8.80794 10.2188 9.30952V10.2238H9.5625C9.40625 10.2238 9.27344 10.2794 9.16406 10.3905C9.05469 10.5016 9 10.6365 9 10.7952V14.9286C9 15.0873 9.05469 15.2222 9.16406 15.3333ZM13.1049 10.2238H10.84V9.37425C10.84 9.05567 10.9503 8.78428 11.171 8.56009C11.3917 8.3359 11.6589 8.22381 11.9725 8.22381C12.2861 8.22381 12.5532 8.3359 12.7739 8.56009C12.9946 8.78428 13.1049 9.05567 13.1049 9.37425V10.2238Z"/>
  </svg>
)

const SupportIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM19.46 9.12L16.68 10.27C16.17 8.91 15.1 7.83 13.73 7.33L14.88 4.55C16.98 5.35 18.65 7.02 19.46 9.12ZM12 15C10.34 15 9 13.66 9 12C9 10.34 10.34 9 12 9C13.66 9 15 10.34 15 12C15 13.66 13.66 15 12 15ZM9.13 4.54L10.3 7.32C8.92 7.82 7.83 8.91 7.32 10.29L4.54 9.13C5.35 7.02 7.02 5.35 9.13 4.54ZM4.54 14.87L7.32 13.72C7.83 15.1 8.91 16.18 10.29 16.68L9.12 19.46C7.02 18.65 5.35 16.98 4.54 14.87ZM14.88 19.46L13.73 16.68C15.1 16.17 16.18 15.09 16.68 13.71L19.46 14.88C18.65 16.98 16.98 18.65 14.88 19.46Z"/>
  </svg>
)

const TroubleshootIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.9999 19.59L17.3099 14.9C18.3699 13.55 18.9999 11.85 18.9999 10C18.9999 5.58 15.4199 2 10.9999 2C6.91995 2 3.55995 5.05 3.06995 9H5.08995C5.56995 6.17 8.02995 4 10.9999 4C14.3099 4 16.9999 6.69 16.9999 10C16.9999 13.31 14.3099 16 10.9999 16C8.57995 16 6.49995 14.56 5.54995 12.5H3.39995C4.44995 15.69 7.45995 18 10.9999 18C12.8499 18 14.5499 17.37 15.8999 16.31L20.5899 21L21.9999 19.59Z"/>
    <path d="M8.43 8.69L9.65 14H11.29L12.55 10.22L13.5 12.5H15.5V11H14.5L13.25 8H11.71L10.59 11.37L9.35 6H7.7L6.45 10H1V11.5H7.55L8.43 8.69Z"/>
  </svg>
)

const PrivacyPolicyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 5L12 1L3 5V11C3 16.55 6.84 21.74 12 23C14.3 22.44 16.33 21.1 17.88 19.29L14.76 16.17C12.82 17.46 10.18 17.24 8.47 15.53C6.52 13.58 6.52 10.41 8.47 8.46C10.42 6.51 13.59 6.51 15.54 8.46C17.25 10.17 17.46 12.81 16.18 14.75L19.08 17.65C20.29 15.69 21 13.38 21 11V5Z"/>
    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"/>
  </svg>
)

const GreenTickIcon = () => (
  <svg width="24" height="24" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="10" fill="#dcfce7"/>
    <path d="M7 11l3 3 5.5-5.5" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

/* ── Data ────────────────────────────────────────────────────────── */

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const todayDate = new Date()
const todayStr = `${todayDate.getDate()} ${MONTHS[todayDate.getMonth()]} ${todayDate.getFullYear()}`
const todayFullStr = `${DAYS[todayDate.getDay()]} ${todayStr}`

const STATES = {
  payPeriod: {
    label: 'Pay period to date',
    date: `1 Jun – ${todayStr}`,
    miles: '39.2 mi',
    pay: '£47.80',
    visits: [
      { name: 'Margaret Thompson', datetime: 'Mon 2 Jun · 09:00–09:45', pay: '£5.20', miles: '4.2 mi', status: 'complete',  rate: '£0.45/mi' },
      { name: 'George Evans',      datetime: 'Mon 2 Jun · 14:30–15:30', pay: '£7.40', miles: '6.1 mi', status: 'complete',  rate: '£0.45/mi' },
      { name: 'Dorothy Williams',  datetime: 'Tue 3 Jun · 10:00–11:00', pay: '£8.60', miles: '7.1 mi', status: 'cancelled', rate: '£0.45/mi' },
      { name: 'Harold Clarke',     datetime: 'Tue 3 Jun · 15:00–16:00', pay: '£6.20', miles: '5.1 mi', status: 'complete',  rate: '£0.45/mi' },
      { name: 'Edith Morrison',    datetime: 'Wed 4 Jun · 09:30–10:30', pay: '£8.40', miles: '6.9 mi', status: 'missed',    rate: '£0.45/mi' },
      { name: 'Margaret Thompson', datetime: 'Thu 5 Jun · 14:00–14:45', pay: '£5.20', miles: '4.2 mi', status: 'complete',  rate: '£0.45/mi' },
    ],
  },
  today: {
    label: 'Today',
    date: todayFullStr,
    miles: '12.7 mi',
    pay: '£15.40',
    visits: [
      { name: 'George Evans',     datetime: 'Today · 09:00–10:00', pay: '£6.80', miles: '5.6 mi', status: 'complete', rate: '£0.45/mi' },
      { name: 'Dorothy Williams', datetime: 'Today · 14:00–15:00', pay: '£8.60', miles: '7.1 mi', status: 'complete', rate: '£0.45/mi' },
    ],
  },
  lastWeek: {
    label: 'Last week',
    date: '26 May – 1 Jun 2026',
    miles: '16.2 mi',
    pay: '£19.80',
    visits: [
      { name: 'Harold Clarke',     datetime: 'Mon 26 May · 09:00–10:00', pay: '£6.20', miles: '5.1 mi', status: 'complete', rate: '£0.45/mi' },
      { name: 'Edith Morrison',    datetime: 'Wed 28 May · 10:00–11:00', pay: '£8.40', miles: '6.9 mi', status: 'missed',   rate: '£0.45/mi' },
      { name: 'Margaret Thompson', datetime: 'Thu 29 May · 14:00–14:45', pay: '£5.20', miles: '4.2 mi', status: 'complete', rate: '£0.45/mi' },
    ],
  },
}

const PILLS = [
  { id: 'payPeriod', label: 'Pay period to date' },
  { id: 'today',     label: 'Today' },
  { id: 'lastWeek',  label: 'Last week' },
]

/* ── Account screen ──────────────────────────────────────────────── */

function MenuRow({ icon, label, right, onClick }) {
  const El = onClick ? 'button' : 'div'
  return (
    <El className={`menu-row${onClick ? ' menu-row-tap' : ''}`} onClick={onClick}>
      <div className="menu-row-icon">{icon}</div>
      <span className="menu-row-label">{label}</span>
      <div className="menu-row-right">{right !== undefined ? right : <ChevronRightIcon />}</div>
    </El>
  )
}

function Toggle({ on }) {
  return (
    <div className={`tog${on ? ' tog-on' : ''}`}>
      <div className="tog-thumb" />
    </div>
  )
}

function AccountScreen({ onGoToMileage }) {
  return (
    <>
      <StatusBar />
      <AppHeader title="Account" />
      <div className="account-body">
        <div className="account-profile">
          <div className="profile-av">AJ</div>
          <div className="profile-info">
            <div className="profile-name">Adrianna Janowski</div>
            <div className="profile-role">Careworker</div>
          </div>
          <button className="logout-btn">LOGOUT</button>
        </div>

        <div className="menu-section-label">Details</div>
        <div className="menu-rows-card">
          <MenuRow icon={<DocumentIcon />}     label="My Documents" />
          <MenuRow icon={<CalendarMenuIcon />} label="Holidays" />
          <MenuRow icon={<CarMenuIcon />}      label="Mileage Pay" onClick={onGoToMileage} />
        </div>

        <div className="menu-section-label">Settings</div>
        <div className="menu-rows-card">
          <MenuRow icon={<OfficeIcon />}          label="BlueBird Sheffield" />
          <MenuRow icon={<FaceIdIcon />}          label="Enable Face ID"  right={<Toggle on />} />
          <MenuRow icon={<MenuIcon />}             label="Enable PIN"      right={<Toggle on />} />
          <MenuRow icon={<PpeIcon />}             label="PPE" />
          <MenuRow icon={<DataIcon />}            label="Remove All Data" />
        </div>

        <div className="menu-section-label">Multi-factor Authentication</div>
        <div className="menu-rows-card">
          <MenuRow icon={<EmailIcon />}         label="Email"         right={<GreenTickIcon />} />
          <MenuRow icon={<AuthenticatorIcon />} label="Authenticator" right={<GreenTickIcon />} />
        </div>

        <div className="menu-section-label">Support</div>
        <div className="menu-rows-card">
          <MenuRow icon={<SupportIcon />}      label="Help Centre" />
          <MenuRow icon={<TroubleshootIcon />} label="Send Diagnostics" />
        </div>

        <div className="menu-section-label">Legal</div>
        <div className="menu-rows-card">
          <MenuRow icon={<PrivacyPolicyIcon />} label="Privacy Policy" />
        </div>

        <div className="account-version">Version 3.6.0</div>
      </div>
      <AppNav activeTab="account" links={{ messages: '../messaging/' }} />
    </>
  )
}

/* ── Mileage screen ──────────────────────────────────────────────── */

function MileageScreen({ filter, setFilter, onBack }) {
  const state = STATES[filter]
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!showDropdown) return
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target)) setShowDropdown(false)
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [showDropdown])

  return (
    <>
      <StatusBar />
      <AppHeader title="Mileage Pay" onBack={onBack} />

      <div className="summary-card">
        <div className="period-area" ref={dropdownRef}>
          <div className="period-selector-text">
            <span className="summary-label">{state.label}</span>
            <span className="summary-date">{state.date}</span>
          </div>
          {/* Filter dropdown — hidden; restore by replacing the div above with:
          <button className="period-selector" onClick={() => setShowDropdown(s => !s)}>
            <div className="period-selector-text">
              <span className="summary-label">{state.label}</span>
              <span className="summary-date">{state.date}</span>
            </div>
            <ChevronDownIcon open={showDropdown} />
          </button>
          {showDropdown && (
            <div className="period-dropdown">
              {PILLS.map(p => (
                <button
                  key={p.id}
                  className={`period-option${filter === p.id ? ' active' : ''}`}
                  onClick={() => { setFilter(p.id); setShowDropdown(false) }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )} */}
        </div>
        <div className="summary-divider" />
        <div className="summary-stats">
          <div className="summary-stat">
            <div className="summary-stat-label">Total miles</div>
            <div className="summary-stat-value">{state.miles}</div>
          </div>
          <div className="summary-stat-sep" />
          <div className="summary-stat" style={{ paddingLeft: 24 }}>
            <div className="summary-stat-label">Total mileage pay</div>
            <div className="summary-stat-value pay">{state.pay}</div>
          </div>
        </div>
      </div>

      <div className="visit-list">
        {state.visits.map((v, i) => (
          <div key={i} className="visit-row">
            <div className="visit-left">
              <div className="visit-name">{v.name}</div>
              <div className="visit-datetime">{v.datetime}</div>
              <div className={`visit-status visit-status-${v.status}`}>{v.status.charAt(0).toUpperCase() + v.status.slice(1)}</div>
            </div>
            <div className="visit-right">
              <div className="visit-pay">{v.pay}</div>
              <div className="visit-miles">{v.miles}</div>
              <div className="visit-rate">{v.rate}</div>
            </div>
          </div>
        ))}
      </div>

      <AppNav activeTab="account" links={{ messages: '../messaging/' }} />
    </>
  )
}

/* ── App ─────────────────────────────────────────────────────────── */

export default function App() {
  const [screen, setScreen] = useState('account')
  const [filter, setFilter] = useState('payPeriod')

  const goToMileage = () => setScreen('mileage')
  const goBack = () => { setScreen('account'); setFilter('payPeriod') }

  return (
    <>
      <a href="../../" className="back-link"><ChevronLeftIcon size={16} /> Prototypes</a>
      <PhoneFrame>
        <div className="screen">
          <div className={`screen-panel${screen === 'mileage' ? ' panel-out-left' : ''}`}>
            <AccountScreen onGoToMileage={goToMileage} />
          </div>
          <div className={`screen-panel${screen === 'account' ? ' panel-out-right' : ''}`}>
            <MileageScreen filter={filter} setFilter={setFilter} onBack={goBack} />
          </div>
        </div>
      </PhoneFrame>
    </>
  )
}
