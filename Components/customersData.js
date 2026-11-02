import arthur from '../Images/Customer=Arthur.png'
import anthonyBrown from '../Images/Customer=Anthony Brown.png'
import hilaryBuxton from '../Images/Customer=Hilary Buxton.png'
import sanjeezChaundry from '../Images/Customer=Sanjeez Chaundry.png'
import nilesCrane from '../Images/Customer=Niles Crane.png'
import davidFarrington from '../Images/Customer=David Farrington.png'
import harinderKulkarni from '../Images/Customer=Harinder Kulkarni.png'
import samMalone from '../Images/Customer=Sam Malone.png'
import maryMcCarthy from '../Images/Customer=Mary McCarthy.png'
import jimMcLean from '../Images/Customer=Jim McLean.png'

// Shared by mobile/customers and mobile/messages-tab. The first six match
// the Figma frame (Mobile App, node 18:2592). The rest
// reuse photos already in Images/ so the list scrolls past the fold.
// The list is grouped by surname, as in the design.
export const CUSTOMERS = [
  { id: 'arthur-barrington', firstName: 'Arthur', lastName: 'Barrington', address: '22 Dunlop Street, Farnham GU23 4EE', photo: arthur, highRisk: true, legalFlags: ['allergies', 'dnacpr', 'dols'] },
  { id: 'anthony-brown', firstName: 'Anthony', lastName: 'Brown', address: '104C West Street, Farnham, Surrey, GU9 7EN', photo: anthonyBrown, legalFlags: ['allergies', 'dnacpr'] },
  { id: 'hilary-buxton', firstName: 'Hilary', lastName: 'Buxton', address: "45 Saint James' Avenue, Farnham, Surrey, GU9 9QF", photo: hilaryBuxton, legalFlags: ['dnacpr', 'dols'] },
  { id: 'sanjeez-chaundry', firstName: 'Sanjeez', lastName: 'Chaundry', address: '85 Farnborough Road, Farnborough, Hampshire, GU14 6TF', photo: sanjeezChaundry, legalFlags: ['allergies', 'dnacpr', 'dols'] },
  { id: 'niles-crane', firstName: 'Niles', lastName: 'Crane', address: '47 West Road, Farnborough, Hampshire, GU14 8EZ', photo: nilesCrane, legalFlags: ['dnacpr', 'dols'] },
  { id: 'david-farrington', firstName: 'David', lastName: 'Farrington', address: '84 West Street, Farnham, Surrey, GU9 7EN', photo: davidFarrington, legalFlags: ['dnacpr', 'dols'] },
  { id: 'harinder-kulkarni', firstName: 'Harinder', lastName: 'Kulkarni', address: '12 Firgrove Hill, Farnham, Surrey, GU9 8LQ', photo: harinderKulkarni, legalFlags: ['allergies'] },
  { id: 'sam-malone', firstName: 'Sam', lastName: 'Malone', address: '3 Castle Street, Farnham, Surrey, GU9 7HR', photo: samMalone, highRisk: true, legalFlags: ['dols'] },
  { id: 'mary-mccarthy', firstName: 'Mary', lastName: 'McCarthy', address: '19 Hale Road, Farnham, Surrey, GU9 9QH', photo: maryMcCarthy, legalFlags: [] },
  { id: 'jim-mclean', firstName: 'Jim', lastName: 'McLean', address: '7 Lynch Road, Farnham, Surrey, GU9 8BZ', photo: jimMcLean, legalFlags: ['dnacpr'] },
]
