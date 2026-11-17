// Mock employees for the Employees list. Ported from the fixtures in the design
// team's own prototype so both repos show the same people. Shaped like the cards
// on the live list: a role, tags (area, territory, staff type...), contact
// details and, for people who use the PASS app, when they last logged in.
import { region, attr, AVATAR, initialsOf } from '../../../Components/peopleListData'

export const STATUS_LABEL = { active: 'Active', inactive: 'Inactive', leaver: 'Leaver' }

export const ROLES = ['Careworker', 'Care Coordinator', 'Manager', 'Supervisor', 'Super user', 'Test']
// Roles above a careworker read in purple on the card
export const SENIOR_ROLES = new Set(['Supervisor', 'Care Coordinator', 'Manager', 'Super user'])

// ─── Tag building blocks ───────────────────────────────────────

const SOUTH = attr('Area2', 'South')
const CHERRY = attr('Apples', 'cherry')
const FIELD = attr('Staff Type', 'Field Staff')
const OFFICE = attr('Staff Type', 'Office Staff')

const berkshire = () => region('Berkshire', 'teal')
const hampshire = () => region('Hampshire', 'blue')
const surrey = () => region('Surrey', 'pink')
const kent = () => region('Kent', 'green')
const sussex = () => region('East Sussex', 'amber')
const dorset = () => region('Dorset', 'violet')

// App info: days since they last logged in (0 = today), platform, version, whether
// that's the newest release, and whether app notifications are on.
const ios = (daysAgo, version = '3.22.0', latest = true, notificationsOn = true) =>
  ({ notificationsOn, daysAgo, platform: 'iOS', version, latest })
const android = (daysAgo, version = '2.40.0', latest = true, notificationsOn = true) =>
  ({ notificationsOn, daysAgo, platform: 'Android', version, latest })

// first.last@example.com, lower-cased, with anything that isn't a letter or digit dropped
function exampleEmail(fullName) {
  const [first, ...rest] = fullName.replace(/^(Mr|Mrs|Ms|Miss|Dr) /, '').split(' ')
  const clean = (t) => t.toLowerCase().replace(/[^a-z0-9]/g, '')
  return `${clean(first)}.${clean(rest.join(''))}@example.com`
}

// Dummy numbers from the ranges Ofcom reserves for drama (07700 900xxx mobiles,
// 01632 960xxx landlines), varied by position so cards don't all match.
const exampleMobile = (i) => `07700 900 ${String(100 + ((i * 37) % 900)).padStart(3, '0')}`
const exampleLandline = (i) => `01632 960 ${String(100 + ((i * 53) % 900)).padStart(3, '0')}`

let nextIndex = 0
// Every contact detail is filled in unless the entry sets its own
function emp(fullName, surname, role, o = {}) {
  const i = nextIndex++
  return {
    id: `e-${fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    fullName, surname, role,
    initials: initialsOf(fullName),
    avatarColor: AVATAR[i % AVATAR.length],
    status: 'active',
    chips: [],
    mobile: exampleMobile(i),
    telephone: exampleLandline(i),
    email: exampleEmail(fullName),
    ...o,
  }
}

const LIST = [
  emp('Mr Kristioffer Ajer', 'Ajer', 'Manager', { chips: [CHERRY, hampshire(), SOUTH, FIELD, OFFICE, attr('Territory', 'Hampshire')], app: ios(16) }),
  emp('Mr contract backdate', 'backdate', 'Careworker', { chips: [CHERRY, surrey(), SOUTH, attr('Territory', 'East Sussex')] }),
  emp('Mr Mitch Brown', 'Brown', 'Test', { chips: [CHERRY, attr('Apples', 'lemon'), attr('Apples', 'orange'), berkshire(), hampshire(), SOUTH, FIELD], app: ios(8) }),
  emp('Mr David Buckowski', 'Buckowski', 'Careworker', { mobile: '07700 900 142', email: 'david.buckowski@example.com', chips: [CHERRY, berkshire(), SOUTH, FIELD, attr('Language', 'Polish')], app: ios(1, '3.23.0') }),
  emp('Mr James Bullard', 'Bullard', 'Supervisor', { chips: [CHERRY, berkshire(), SOUTH, attr('Care Setting', 'Live-in'), FIELD], app: android(3) }),
  emp('Mr John C', 'C', 'Super user', { chips: [CHERRY, attr('Apples', 'lemon'), attr('Apples', 'orange'), berkshire(), hampshire(), SOUTH] }),
  emp('Mr New Carer', 'Carer', 'Careworker', { telephone: '01234 567 890', chips: [CHERRY, SOUTH, attr('Language', 'Arabic'), attr('Territory', 'Cornwall')] }),
  emp('Mr Andrew Cary', 'Cary', 'Manager', { mobile: '07123 456 789', email: 'everylifetest+qa_ac@gmail.com', chips: [CHERRY, berkshire(), hampshire(), surrey(), SOUTH], app: ios(2, '3.23.0', true, false) }),
  emp('Mrs Priya Chambers', 'Chambers', 'Careworker', {
    mobile: '07700 900 311',
    // Deliberately long, to show the truncate-with-tooltip behaviour on a card
    email: 'priya.chambers-hartley.homecare.rota@southerncarepartnership.example.co.uk',
    chips: [kent(), SOUTH, FIELD], app: android(1, '2.38.2', false),
  }),
  emp('Mr Dean Cooper', 'Cooper', 'Careworker', { mobile: '07700 900 427', chips: [surrey(), SOUTH, FIELD], app: ios(12, '3.21.0', false) }),
  emp('Ms Aisha Cunningham', 'Cunningham', 'Care Coordinator', { email: 'aisha.cunningham@example.com', telephone: '01252 700 221', chips: [hampshire(), OFFICE], app: ios(5) }),
  emp('Mr Raj Dhillon', 'Dhillon', 'Careworker', { mobile: '07700 900 518', chips: [berkshire(), SOUTH, FIELD, attr('Language', 'Punjabi')], app: android(0) }),
  emp('Mrs Julie Edwards', 'Edwards', 'Careworker', { mobile: '07700 900 633', chips: [sussex(), SOUTH, FIELD], app: ios(21, '3.20.1', false) }),
  emp('Mr Tom Evans', 'Evans', 'Careworker', { mobile: '07700 900 702', chips: [dorset(), FIELD], app: android(4) }),
  emp('Miss Chloe Fairbrother', 'Fairbrother', 'Careworker', { mobile: '07700 900 815', chips: [kent(), SOUTH, FIELD], app: ios(2) }),
  emp('Mr Liam Fox', 'Fox', 'Supervisor', { mobile: '07700 900 906', email: 'liam.fox@example.com', chips: [surrey(), hampshire(), SOUTH, FIELD], app: android(9) }),
  emp('Mrs Helen Green', 'Green', 'Careworker', { mobile: '07700 900 119', chips: [berkshire(), FIELD], app: android(45, '2.38.0', false, false) }),
  emp('Mr Sanjay Gupta', 'Gupta', 'Careworker', { mobile: '07700 900 224', chips: [hampshire(), FIELD, attr('Language', 'Hindi')], app: ios(1) }),
  emp('Mr Paul Hall', 'Hall', 'Careworker', { mobile: '07700 900 331', chips: [sussex(), FIELD], app: ios(6, '3.22.0', true) }),
  emp('Mr Imran Hussain', 'Hussain', 'Careworker', { mobile: '07700 900 448', chips: [berkshire(), FIELD, attr('Language', 'Urdu')], app: android(0) }),
  emp('Mrs Karen Harris', 'Harris', 'Care Coordinator', { telephone: '01252 700 233', email: 'karen.harris@example.com', chips: [hampshire(), OFFICE] }),
  emp('Ms Bethany Hughes', 'Hughes', 'Careworker', { mobile: '07700 900 557', chips: [surrey(), FIELD], app: ios(15, '3.21.0', false) }),
  emp('Mr Kwame Mensah', 'Mensah', 'Careworker', { mobile: '07700 900 664', chips: [berkshire(), FIELD], app: android(3) }),
  emp('Mrs Siobhan Murphy', 'Murphy', 'Manager', { mobile: '07700 900 771', email: 'siobhan.murphy@example.com', chips: [hampshire(), surrey(), OFFICE], app: ios(1) }),
  emp('Mrs Anita Nair', 'Nair', 'Careworker', { mobile: '07700 900 888', chips: [kent(), FIELD, attr('Language', 'Malayalam')], app: ios(7) }),
  emp('Mr Binh Nguyen', 'Nguyen', 'Careworker', { mobile: '07700 900 995', chips: [surrey(), FIELD], app: android(2) }),
  emp('Ms Agnieszka Nowak', 'Nowak', 'Careworker', { mobile: '07700 900 102', chips: [berkshire(), FIELD, attr('Language', 'Polish')], app: ios(11, '3.22.0', true) }),
  emp('Mr Declan Nolan', 'Nolan', 'Careworker', { mobile: '07700 900 209', chips: [dorset(), FIELD] }),
  emp('Mrs Ngozi Okoro', 'Okoro', 'Careworker', { mobile: '07700 900 316', chips: [hampshire(), FIELD], app: android(5) }),
  emp("Mr Sean O'Brien", "O'Brien", 'Supervisor', { mobile: '07700 900 423', chips: [sussex(), kent(), FIELD], app: ios(14, '3.22.0', true) }),
  emp('Mrs Meera Patel', 'Patel', 'Careworker', { mobile: '07700 900 530', chips: [berkshire(), FIELD, attr('Language', 'Gujarati')], app: ios(0, '3.23.0') }),
  emp('Mr Desmond Quinn', 'Quinn', 'Careworker', { mobile: '07700 900 637', chips: [surrey(), FIELD], app: android(33, '2.39.1', false) }),
  emp('Mr Faisal Rahman', 'Rahman', 'Careworker', { mobile: '07700 900 744', chips: [hampshire(), FIELD, attr('Language', 'Bengali')], app: ios(2) }),
  emp('Miss Eilidh Reid', 'Reid', 'Careworker', { mobile: '07700 900 851', chips: [dorset(), FIELD], app: android(8) }),
  emp('Mrs Gurpreet Singh', 'Singh', 'Careworker', { mobile: '07700 900 958', chips: [berkshire(), FIELD, attr('Language', 'Punjabi')], app: ios(1) }),
  emp('Mrs Elsie Taylor', 'Taylor', 'Careworker', { mobile: '07700 900 065', chips: [kent(), FIELD], app: ios(4) }),
  emp('Mr Gareth Thomas', 'Thomas', 'Careworker', { mobile: '07700 900 172', chips: [sussex(), FIELD], app: android(10) }),
  emp('Ms Olivia Thompson', 'Thompson', 'Careworker', { mobile: '07700 900 279', chips: [surrey(), FIELD], app: ios(3) }),
  emp('Mr Callum Turner', 'Turner', 'Supervisor', { mobile: '07700 900 386', chips: [hampshire(), FIELD], app: android(6) }),
  emp('Mr Minh Tran', 'Tran', 'Careworker', { mobile: '07700 900 493', chips: [berkshire(), FIELD, attr('Language', 'Vietnamese')], app: ios(1) }),
  emp('Mrs Fiona Tait', 'Tait', 'Careworker', { mobile: '07700 900 500', chips: [dorset(), FIELD], app: android(19, '2.39.1', false, false) }),
  emp('Mr Oscar Thorpe', 'Thorpe', 'Careworker', { status: 'inactive', mobile: '07700 900 607', chips: [kent(), FIELD], app: ios(62, '3.18.0', false, false) }),
  emp('Ms Yuki Tanaka', 'Tanaka', 'Careworker', { mobile: '07700 900 714', chips: [surrey(), FIELD, attr('Language', 'Japanese')], app: ios(2) }),
  emp('Mr Diego Vasquez', 'Vasquez', 'Careworker', { mobile: '07700 900 821', chips: [hampshire(), FIELD, attr('Language', 'Spanish')], app: android(7) }),
  emp('Mrs Pauline Walker', 'Walker', 'Careworker', { status: 'leaver', mobile: '07700 900 928', chips: [sussex(), FIELD], app: ios(120, '3.15.0', false, false) }),
  // A surname that doesn't start with a letter lands under "#"
  emp('Mr Night 24h Cover', '24h Cover', 'Test', { chips: [hampshire(), OFFICE] }),
]

export const EMPLOYEES_LIST = [...LIST].sort((a, b) => a.surname.localeCompare(b.surname))
