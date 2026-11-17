// Mock customers for the Customers list. Ported from the fixtures in the
// design team's own prototype so both repos show the same people. Review
// dates are relative to today (reviewIn) so the "Due in the next 7 days"
// filters stay demonstrable whenever the prototype is opened.
import arthur from '../../../Images/Customer=Arthur.png'
import davidPhoto from '../../../Images/Customer=David Farrington.png'
import jimPhoto from '../../../Images/Customer=Jim McLean.png'
import harinderPhoto from '../../../Images/Customer=Harinder Kulkarni.png'
import maryPhoto from '../../../Images/Customer=Mary McCarthy.png'
import hilaryPhoto from '../../../Images/Customer=Hilary Buxton.png'
import samPhoto from '../../../Images/Customer=Sam Malone.png'

export const STATUS_LABEL = {
  'assessment-booked': 'Assessment booked',
  'assessment-completed': 'Assessment completed',
  active: 'Active',
  inactive: 'Inactive',
  finished: 'Finished',
}

// dd-mm-yyyy, `days` from today
export function reviewIn(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
}

// Area tags carry their own colour. Same pastel pairs as the live app.
const REGION = {
  teal: { bg: '#e0f1f4', fg: '#004753', border: '#a6d6de' },
  blue: { bg: '#e5ecfd', fg: '#13337a', border: '#b3c8f8' },
  pink: { bg: '#fbe4e9', fg: '#750f25', border: '#f5b0bf' },
  green: { bg: '#e3f4e1', fg: '#1f5a1a', border: '#b5dcb0' },
  amber: { bg: '#fdf0d5', fg: '#6b4400', border: '#f1d18f' },
  violet: { bg: '#eee8fb', fg: '#3d2380', border: '#cbbdf0' },
}
const region = (label, color) => ({ type: 'region', label, ...REGION[color] })
const attr = (key, value) => ({ type: 'attr', key, value })

const AVATAR = ['#c9b4de', '#b7dda8', '#b1c8de', '#f0c9a8', '#a8d8d4', '#e8b4c4']

const initialsOf = (fullName) =>
  fullName.replace(/^(Mr|Mrs|Ms|Miss|Master|Dr) /, '').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

// Every customer starts Active with no flags, tags or review date; `o` overrides.
const person = (id, fullName, surname, o, i) => ({
  id, fullName, surname,
  initials: initialsOf(fullName),
  avatarColor: AVATAR[i % AVATAR.length],
  status: 'active',
  chips: [],
  ...o,
})

const LIST = [
  person('arthur-barrington', 'Mr Arthur Barrington', 'Barrington', {
    photo: arthur, highRisk: true, dnacpr: true, reviewDate: '20-09-2026', reviewOverdue: true,
    dob: '22/07/1937', telephone: '0121 353 4695', address: '91 Westwood Road, Sutton Coldfield, B73 6UJ',
    chips: [attr('Territory', 'West Midlands'), attr('Area', 'Sutton'), region('Warwickshire', 'teal'), attr('Environment', 'Smoker')],
  }, 0),
  person('vera-bramwell', 'Mrs Vera Bramwell', 'Bramwell', {
    status: 'assessment-completed', reviewDate: '14-11-2026',
    dob: '19/11/1939', telephone: '01827 318 462', address: '22 Ashcroft Gardens, Tamworth, B79 8QN',
    chips: [attr('Territory', 'Staffordshire'), region('Tamworth', 'green'), attr('Environment', 'Cats')],
  }, 5),
  person('d-bennett', 'Mrs Jean Bennett', 'Bennett', {
    telephone: '01902 442 118', dob: '30/03/1941', address: '14 Orchard Way, Wolverhampton, WV3 9DT',
    chips: [attr('Territory', 'West Midlands'), region('Wolverhampton', 'amber')],
  }, 1),
  person('d-buxton', 'Mrs Hilary Buxton', 'Buxton', {
    photo: hilaryPhoto, dnacpr: true, reviewDate: reviewIn(3), dob: '12/09/1936', telephone: '01283 551 204',
    address: '3 Church Lane, Burton upon Trent, DE14 2AB',
    chips: [attr('Territory', 'Staffordshire'), region('Burton', 'violet')],
  }, 2),
  person('edith-caldwell', 'Mrs Edith Caldwell', 'Caldwell', {
    status: 'assessment-completed', reviewDate: '28-10-2026', reviewOverdue: true,
    dob: '03/02/1942', telephone: '01543 415 208', address: '7 Meadowbank Close, Lichfield, WS13 6RT',
    chips: [attr('Territory', 'Staffordshire'), region('Lichfield', 'blue'), attr('Environment', 'Dogs')],
  }, 2),
  person('d-compston', 'Mr Martin Compston', 'Compston', {
    reviewDate: reviewIn(0), dob: '11/05/1984', address: 'East wing first floor, Cody Technology Park, Concorde Road, GU14 0LS',
    chips: [attr('Apples', 'cherry'), region('Berkshire', 'teal'), region('Hampshire', 'blue'), attr('Area2', 'South'), attr('Environment', 'Smoker'), attr('Territory', 'Hampshire')],
  }, 3),
  person('d-ellis', 'Mr Colin Ellis', 'Ellis', {
    dols: true, dob: '21/06/1938', telephone: '0121 773 0921', address: '9 Hagley Road, Edgbaston, B16 8PA',
    chips: [attr('Territory', 'West Midlands'), attr('Environment', 'Smoker'), attr('Medical Conditions', 'Diabetes')],
  }, 0),
  person('d-farrington', 'Mr David Farrington', 'Farrington', {
    photo: davidPhoto, highRisk: true, dnacpr: true, dols: true, reviewDate: reviewIn(90), dob: '06/12/1937',
    address: '54 Reading Road, RG41 1EH',
    chips: [attr('Apples', 'lemon'), attr('Area2', 'South'), region('Berkshire', 'teal'), region('Hampshire', 'blue'), attr('Territory', 'Berkshire'), attr('Environment', 'Cats'), attr('Environment', 'Smoker')],
  }, 1),
  person('d-fitzgerald', 'Mrs Nora Fitzgerald', 'Fitzgerald', {
    telephone: '01543 280 337', dob: '17/04/1943', address: '28 Beacon Street, Lichfield, WS13 7AA',
    chips: [attr('Territory', 'Staffordshire'), region('Lichfield', 'blue'), attr('Medical Conditions', 'Dementia')],
  }, 2),
  person('d-gill', 'Mr Harbans Gill', 'Gill', {
    reviewDate: reviewIn(6), dob: '02/02/1946', telephone: '024 7655 1180', address: '77 Foleshill Road, Coventry, CV6 5AJ',
    chips: [attr('Territory', 'Warwickshire'), region('Coventry', 'green'), attr('Language', 'Punjabi')],
  }, 3),
  person('d-grant', 'Mrs Ruth Grant', 'Grant', {
    dnacpr: true, dob: '25/08/1935', address: '6 Elm Close, Solihull, B91 3QP',
    chips: [attr('Territory', 'West Midlands'), region('Solihull', 'amber'), attr('Environment', 'Dogs'), attr('Medical Conditions', 'Diabetes')],
  }, 4),
  person('d-hall', 'Mr Stanley Hall', 'Hall', {
    reviewDate: reviewIn(60), dob: '14/11/1940', telephone: '01922 616 402', address: '41 Lichfield Road, Walsall, WS4 2DJ',
    chips: [attr('Territory', 'West Midlands')],
  }, 5),
  person('d-kulkarni', 'Mr Harinder Kulkarni', 'Kulkarni', {
    photo: harinderPhoto, highRisk: true, reviewDate: reviewIn(-5), reviewOverdue: true, dob: '09/07/1944',
    telephone: '0121 440 9382', address: '18 Park Avenue, Harborne, B17 9QT',
    chips: [attr('Territory', 'West Midlands'), region('Birmingham', 'pink'), attr('Environment', 'Smoker'), attr('Language', 'Gujarati')],
  }, 0),
  person('d-malone', 'Mr Sam Malone', 'Malone', {
    photo: samPhoto, dob: '28/01/1950', telephone: '01384 255 619', address: '12 Kingswinford Road, Dudley, DY1 4NH',
    chips: [attr('Territory', 'West Midlands'), region('Dudley', 'violet')],
  }, 1),
  person('d-mccarthy', 'Mrs Mary McCarthy', 'McCarthy', {
    photo: maryPhoto, reviewDate: reviewIn(26), dob: '03/05/1939', address: '65 Station Road, Four Oaks, B74 4NX',
    chips: [attr('Territory', 'West Midlands'), region('Sutton Coldfield', 'teal'), attr('Environment', 'Cats')],
  }, 2),
  person('d-mclean', 'Mr Jim McLean', 'McLean', {
    photo: jimPhoto, dols: true, dob: '19/10/1941', telephone: '01782 331 075', address: '2 Queens Park Gardens, Stoke-on-Trent, ST1 4EX',
    chips: [attr('Territory', 'Staffordshire'), region('Stoke', 'amber')],
  }, 3),
  person('d-okafor', 'Mrs Grace Okafor', 'Okafor', {
    dob: '07/03/1948', telephone: '0121 603 7714', address: '33 Brookvale Road, Erdington, B23 6QU',
    chips: [attr('Territory', 'West Midlands'), region('Birmingham', 'pink'), attr('Language', 'Igbo')],
  }, 4),
  person('d-osborne', 'Mr Frank Osborne', 'Osborne', {
    status: 'finished', dob: '15/05/1931', telephone: '01283 702 118', address: '10 Orchard Close, Burton upon Trent, DE15 9QX',
    chips: [attr('Territory', 'Staffordshire'), region('Burton', 'violet')],
  }, 1),
  person('d-pike', 'Mr Leonard Pike', 'Pike', {
    status: 'assessment-booked', dob: '04/08/1947', telephone: '0121 561 4409', address: '67 Chester Road, Sutton Coldfield, B73 5BJ',
    chips: [attr('Territory', 'West Midlands'), region('Sutton Coldfield', 'teal')],
  }, 2),
  person('d-quinn', 'Mr Desmond Quinn', 'Quinn', {
    reviewDate: reviewIn(20), dob: '24/09/1937', telephone: '01785 249 160', address: '8 Rowley Park, Stafford, ST17 9AB',
    chips: [attr('Territory', 'Staffordshire'), region('Stafford', 'green')],
  }, 5),
  person('d-taylor', 'Mrs Elsie Taylor', 'Taylor', {
    dnacpr: true, dob: '13/06/1934', address: '19 Mill Lane, Nuneaton, CV11 4HP',
    chips: [attr('Territory', 'Warwickshire'), region('Nuneaton', 'blue'), attr('Environment', 'Oxygen'), attr('Medical Conditions', 'COPD')],
  }, 0),
  person('d-thomas', 'Mr Gareth Thomas', 'Thomas', {
    dob: '01/12/1952', telephone: '01922 722 540', address: '51 Bridge Street, Walsall, WS1 1JQ',
    chips: [attr('Territory', 'West Midlands'), attr('Environment', 'Smoker')],
  }, 1),
  person('d-walker', 'Mrs Pauline Walker', 'Walker', {
    reviewDate: reviewIn(45), dob: '29/07/1945', telephone: '01543 506 233', address: '4 Cannock Road, Rugeley, WS15 2HD',
    chips: [attr('Territory', 'Staffordshire'), region('Rugeley', 'violet')],
  }, 2),
  person('d-ward', 'Mrs Doris Ward', 'Ward', {
    status: 'inactive', dob: '27/02/1933', address: '3 Meadow View, Tamworth, B77 2AT',
    chips: [attr('Territory', 'Staffordshire'), region('Tamworth', 'green')],
  }, 3),
]

// Customers carrying the Allergies flag
const ALLERGIES = new Set(['arthur-barrington', 'edith-caldwell', 'd-buxton', 'd-ellis', 'd-grant', 'd-quinn', 'd-taylor', 'd-mclean'])

export const CUSTOMERS_LIST = LIST
  .map(c => ({ ...c, allergies: ALLERGIES.has(c.id) || undefined }))
  .sort((a, b) => a.surname.localeCompare(b.surname))

// dd-mm-yyyy review date -> sortable timestamp; null when there isn't one
export const reviewTimeOf = (c) => {
  if (!c.reviewDate) return null
  const [d, m, y] = c.reviewDate.split('-').map(Number)
  return new Date(y, m - 1, d).getTime()
}
