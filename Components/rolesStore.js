// Roles and permissions (AIOP-25867), shared by office/roles-and-permissions and
// employees/roles so a role changed on one page shows on the other. Kept in
// localStorage, so it only syncs within one browser.
//
// Decisions (Ben, 27/11/2026): one role per person; one choice per section
// (None / View / Edit, and Edit includes View); today's roles are locked rows;
// a person keeps their level and may have one custom role on top; a new role can
// copy its access from an existing role (no separate templates).
// Custom roles only matter for people with web access, which is Care Manager and
// above: Careworkers and Supervisors only use PASSforcare.
import { useSyncExternalStore } from 'react'
import { EMPLOYEES_LIST } from '../employees/list/src/employeesListData'

export const SECTIONS = [
  { key: 'schedule', label: 'Schedule', short: 'Schedule' },
  { key: 'finance', label: 'Finance', short: 'Finance' },
  { key: 'customers', label: 'Customers', short: 'Customers' },
  { key: 'care', label: 'Care plans and documents', short: 'Care plans & docs' },
  { key: 'employees', label: 'Employees', short: 'Employees' },
  { key: 'reports', label: 'Reports', short: 'Reports' },
  { key: 'messages', label: 'Messages', short: 'Messages' },
  { key: 'settings', label: 'Office settings', short: 'Office settings' },
]
export const ACCESS_LABEL = { none: 'None', view: 'View', edit: 'Edit' }

const all = level => Object.fromEntries(SECTIONS.map(s => [s.key, level]))
const access = (base, overrides) => ({ ...all(base), ...overrides })

// Placeholder access for today's roles. The real defaults come from today's permissions.
export const BUILT_IN_ROLES = [
  { id: 'level-super', name: 'Super user', builtIn: true, level: 'Super user', access: all('edit') },
  { id: 'level-manager', name: 'Care Manager', builtIn: true, level: 'Care Manager',
    access: access('edit', { finance: 'view', reports: 'view', settings: 'none' }) },
  { id: 'level-supervisor', name: 'Supervisor', builtIn: true, level: 'Supervisor', appOnly: true, access: all('none') },
  { id: 'level-careworker', name: 'Careworker', builtIn: true, level: 'Careworker', appOnly: true, access: all('none') },
]

const SEED = {
  roles: [
    { id: 'role-on-call', name: 'On call', access: access('none', { schedule: 'edit', customers: 'view', care: 'view', employees: 'view', messages: 'edit' }) },
    { id: 'role-finance', name: 'Finance only', access: access('none', { finance: 'edit', employees: 'view', reports: 'view' }) },
  ],
  assignments: { 'e-mr-andrew-cary': 'role-on-call', 'e-ms-aisha-cunningham': 'role-on-call', 'e-mrs-siobhan-murphy': 'role-finance' },
}

// The shared Employees fixture still has roles PASS doesn't have; map them to the four that exist.
const LEVEL_MAP = { Manager: 'Care Manager', 'Care Coordinator': 'Care Manager', Test: 'Careworker' }
export const PEOPLE = EMPLOYEES_LIST.map(e => ({ ...e, role: LEVEL_MAP[e.role] ?? e.role }))
export const CARE_MANAGERS = PEOPLE.filter(e => e.role === 'Care Manager' && e.status === 'active')

const KEY = 'pass-roles-v1'
const EVENT = 'pass-roles-change'
let cache = null
function read() {
  if (cache) return cache
  try { cache = JSON.parse(localStorage.getItem(KEY)) } catch { cache = null }
  if (!cache) cache = SEED
  return cache
}
function write(next) {
  cache = next
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* storage unavailable */ }
  window.dispatchEvent(new Event(EVENT))
}
function subscribe(cb) {
  const onStorage = e => { if (e.key === KEY) { cache = null; cb() } }
  window.addEventListener(EVENT, cb)
  window.addEventListener('storage', onStorage)
  return () => { window.removeEventListener(EVENT, cb); window.removeEventListener('storage', onStorage) }
}
export const useRolesStore = () => useSyncExternalStore(subscribe, read)

const uid = prefix => `${prefix}-${Math.random().toString(36).slice(2, 8)}`

// Saves a role and who has it. Someone can only have one role, so anyone ticked
// here moves off whatever role they had.
export function saveRole(role, peopleIds) {
  const s = read()
  const id = role.id ?? uid('role')
  const roles = s.roles.some(r => r.id === id)
    ? s.roles.map(r => r.id === id ? { id, name: role.name, access: role.access } : r)
    : [...s.roles, { id, name: role.name, access: role.access }]
  const assignments = Object.fromEntries(Object.entries(s.assignments).filter(([, rid]) => rid !== id))
  peopleIds.forEach(pid => { assignments[pid] = id })
  write({ ...s, roles, assignments })
  return id
}
export function deleteRole(id) {
  const s = read()
  write({ ...s, roles: s.roles.filter(r => r.id !== id), assignments: Object.fromEntries(Object.entries(s.assignments).filter(([, rid]) => rid !== id)) })
}
export function assignRole(personId, roleId) {
  const s = read()
  const assignments = { ...s.assignments }
  if (roleId) assignments[personId] = roleId; else delete assignments[personId]
  write({ ...s, assignments })
}
export function resetRoles() { write(SEED) }

export const peopleWithRole = (state, roleId) => Object.entries(state.assignments).filter(([, rid]) => rid === roleId).map(([pid]) => pid)
