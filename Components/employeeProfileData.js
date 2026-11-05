// Sample documents and Files for the mobile employee profile
// (Components/EmployeeProfile.jsx). Documents are modelled on the live app's
// employee Documents list (a flat list: title, template name, status tick).
// Every employee gets the same samples; the prototype only needs one set.
export const EMPLOYEE_DOCUMENTS = [
  { id: 1, title: '02.10.26 - Handover', template: 'Handover', status: 'complete' },
  { id: 2, title: '04.06.25 - Supervision', template: 'Supervision record', status: 'complete' },
  { id: 3, title: '09.04.25', template: 'SD20(1) Moving and Positioning Competence Assessment', status: 'complete' },
  { id: 4, title: '06.05.25', template: 'Spot check', status: 'complete' },
  { id: 5, title: '15.10.25', template: 'Annual appraisal', status: 'complete' },
  { id: 6, title: '12.11.25', template: 'Communication', status: 'complete' },
]

export const EMPLOYEE_FILE_FOLDERS = [
  { id: 'e1', name: 'Contracts' },
  { id: 'e2', name: 'Training certificates' },
  { id: 'e3', name: 'Right to work' },
]

export const EMPLOYEE_FILES = [
  { id: 1, name: 'Employment contract', extension: 'pdf', size: '312 kB', uploaded: '2026-03-02', uploadedBy: 'Priya Shah', folderId: 'e1' },
  { id: 2, name: 'Contract variation - hours', extension: 'pdf', size: '148 kB', uploaded: '2026-08-19', uploadedBy: 'Priya Shah', folderId: 'e1' },
  { id: 3, name: 'Moving and handling certificate', extension: 'pdf', size: '540 kB', uploaded: '2026-06-11', uploadedBy: 'Admin admin', folderId: 'e2' },
  { id: 4, name: 'First aid certificate', extension: 'jpg', size: '1.4 MB', uploaded: '2026-05-23', uploadedBy: 'Admin admin', folderId: 'e2' },
  { id: 5, name: 'Passport', extension: 'png', size: '860 kB', uploaded: '2026-03-02', uploadedBy: 'Priya Shah', folderId: 'e3' },
  { id: 6, name: 'DBS certificate', extension: 'pdf', size: '220 kB', uploaded: '2026-03-04', uploadedBy: 'Priya Shah', folderId: null },
  { id: 7, name: 'Uniform and ID badge policy', extension: 'docx', size: '41 kB', uploaded: '2026-09-02', uploadedBy: 'Admin admin', folderId: null },
]
