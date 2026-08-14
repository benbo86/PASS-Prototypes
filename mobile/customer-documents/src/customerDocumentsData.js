// Mock data for the Customer Documents prototype (AIOP-23664 — folder
// support in Assessments & Other Documents). One customer, matching the
// Figma "Arthur Barrington" reference (file Mo0MhJ9pRTFSeDcsBOS3AU,
// node 429:4918).

export const CUSTOMER = {
  id: 1,
  name: 'Arthur Barrington',
  addressLine1: '22 Dunlop Street',
  addressLine2: 'Farnham GU23 4EE',
  dob: '17/01/44',
  highRisk: true,
  legalChips: [
    { id: 'allergies', label: 'Allergies' },
    { id: 'dnacpr', label: 'DNACPR' },
    { id: 'dols', label: 'DoLS' },
  ],
}

// ─── Assessments ────────────────────────────────────────────────
// group: 'mandatory' | 'optional' — a classification on the document
// itself, shown inline on its row (not a folder property — see
// ASSESSMENT_FOLDERS below). status: 'complete' | 'partial' | 'notStarted'
// — maps to the uploaded Mobile Icons DocumentComplete (green) /
// DocumentIncomplete (amber, "partially complete") / DocumentNotStarted
// (red) icons (Icons/Mobile Uploads/Used across multiple mobile screens/).
// folderId is the foreign key onto ASSESSMENT_FOLDERS — null/undefined
// means "loose", not yet in a folder.

// date is when the item was CREATED, not completed — every item has one,
// regardless of status, so the date filter applies uniformly instead of
// only ever matching "All time" for anything not yet complete. DD/MM/YYYY,
// deliberately spread across the search/filter feature's date-range
// buckets (7 days/30 days/3 months/6 months/1 year) relative to a real
// "today" (the filter compares against the actual system clock).
export const ASSESSMENTS = [
  { id: 1, name: 'Consent to Care',                     group: 'mandatory', status: 'complete',   date: '08/08/2026', folderId: null },
  { id: 2, name: 'Essential Documents 2024',            group: 'mandatory', status: 'partial',    date: '12/08/2026', folderId: null },
  { id: 3, name: 'Important Contacts',                  group: 'mandatory', status: 'complete',   date: '20/07/2026', folderId: null, reviewDue: 'in 5 months' },
  { id: 4, name: 'My Important Contacts',                group: 'mandatory', status: 'complete',   date: '15/07/2026', folderId: null },
  { id: 5, name: 'Risk Assessment',                      group: 'mandatory', status: 'partial',    date: '25/07/2026', folderId: 'f1' },
  { id: 6, name: 'Moving and Handling Assessment',       group: 'mandatory', status: 'notStarted', date: '08/07/2026', folderId: null },
  { id: 7, name: 'Care and Support Plan',                group: 'mandatory', status: 'complete',   date: '01/06/2026', folderId: null },
  { id: 8, name: 'Next of Kin Details',                  group: 'mandatory', status: 'notStarted', date: '15/06/2026', folderId: null },
  { id: 9, name: 'Future-state assessment',              group: 'optional',  status: 'notStarted', date: '20/05/2026', folderId: null },
  { id: 10, name: 'Opportunity Assessment',              group: 'optional',  status: 'notStarted', date: '01/05/2026', folderId: null },
  // Deliberately mixed with Risk Assessment (mandatory) in the same folder
  // (f1) — folders have no classification of their own, so a folder can
  // freely hold both mandatory and optional documents together.
  { id: 11, name: 'Personal History',                    group: 'optional',  status: 'complete',   date: '10/05/2026', folderId: 'f1' },
  { id: 12, name: 'Life Story',                          group: 'optional',  status: 'partial',    date: '10/04/2026', folderId: null },
  { id: 13, name: 'Continence Assessment',               group: 'optional',  status: 'partial',    date: '01/03/2026', folderId: null },
  { id: 14, name: 'Pain Assessment',                     group: 'optional',  status: 'complete',   date: '10/11/2025', folderId: null },
  { id: 15, name: 'Medication Management Assessment',    group: 'optional',  status: 'notStarted', date: '15/01/2026', folderId: null },
  { id: 16, name: 'Communication Needs Assessment',      group: 'optional',  status: 'partial',    date: '20/10/2025', folderId: null },
]

// Not-yet-added optional assessment templates — offered by "Add assessment"
export const OPTIONAL_ASSESSMENT_TEMPLATES = [
  { id: 'interests',       name: 'Interests and Activities' },
  { id: 'personal-goals',  name: 'Personal Goals and Aspirations' },
  { id: 'falls-risk',      name: 'Falls Risk Assessment' },
  { id: 'nutrition',       name: 'Nutrition and Hydration Assessment' },
  { id: 'sleep',           name: 'Sleep Assessment' },
  { id: 'skin-integrity',  name: 'Skin Integrity Assessment' },
  { id: 'oral-health',     name: 'Oral Health Assessment' },
  { id: 'mental-capacity', name: 'Mental Capacity Assessment' },
]

// No `group` field — folders carry no classification of their own; any
// document (mandatory or optional) can be moved in or out of any folder.
// f2 is seeded empty to also show that state.
export const ASSESSMENT_FOLDERS = [
  { id: 'f1', name: 'Care Planning Review' },
  { id: 'f2', name: 'Wellbeing Reviews' },
]

// ─── Other Documents ────────────────────────────────────────────
// No `group` field at all — this section has no Mandatory/Optional concept.

export const OTHER_DOCUMENTS = [
  { id: 1, title: 'Best Interest Decision Making - Consent to care', code: 'BBC SD09(2) Best Interest Decision Making Framework', status: 'complete', date: '10/08/2026', folderId: 'g1' },
  { id: 2, title: 'Best Interest Decision Making - Cot Sides',       code: 'BBC SD09(2) Best Interest Decision Making Framework', status: 'complete', date: '28/07/2026', folderId: 'g1' },
  { id: 3, title: 'Best Interest Decision Making - Medication',      code: 'BBC SD09(2) Best Interest Decision Making Framework', status: 'complete', date: '05/07/2026', folderId: 'g1' },
  { id: 4, title: 'Communication Chart',                              code: 'SD05(7) My Communication chart',                       status: 'complete', date: '01/05/2026', folderId: null },
  { id: 5, title: 'Waterlow Score Assessment',                        code: 'BBC Adapted Waterlow Score assessment',                 status: 'complete', date: '01/12/2025', folderId: null },
]

export const OTHER_DOCUMENT_FOLDERS = [
  { id: 'g1', name: 'Best Interest Decisions' },
]

let _nextAssessmentId = ASSESSMENTS.length + 1
export function nextAssessmentId() { return _nextAssessmentId++ }

let _nextOtherDocId = OTHER_DOCUMENTS.length + 1
export function nextOtherDocId() { return _nextOtherDocId++ }

let _nextFolderId = ASSESSMENT_FOLDERS.length + OTHER_DOCUMENT_FOLDERS.length + 1
export function nextFolderId() { return `f${_nextFolderId++}` }
