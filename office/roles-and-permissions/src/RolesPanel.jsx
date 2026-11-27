import { useState } from 'react'
import SlidePanel from '../../../Components/SlidePanel'
import Modal from '../../../Components/Modal'
import SearchMultiSelect from '../../../Components/SearchMultiSelect'
import Tooltip from '../../../Components/Tooltip'
import {
  SECTIONS, ACCESS_LABEL, BUILT_IN_ROLES, CARE_MANAGERS, PEOPLE,
  useRolesStore, saveRole, deleteRole, peopleWithRole,
} from '../../../Components/rolesStore'

// Roles and permissions slide-out (AIOP-25867): the roles list (read-only, the pen
// opens the form) and the add / edit role form, which can copy access from another role.

const PenIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M5.00125,16.245799 L5.00125,18.6099151 C5.00125,18.8276627 5.17233735,18.99875 5.39008488,18.99875 L7.75420098,18.99875 C7.85529805,18.99875 7.95639512,18.9598665 8.0263854,18.8820995 L16.5185393,10.3977224 L13.6022776,7.48146073 L5.11790047,15.9658379 C5.04013349,16.0436049 5.00125,16.1369253 5.00125,16.245799 Z M18.7737816,8.14248004 C19.0770728,7.83918883 19.0770728,7.34925687 18.7737816,7.04596566 L16.9540343,5.22621841 C16.6507431,4.9229272 16.1608112,4.9229272 15.85752,5.22621841 L14.4343843,6.64935408 L17.3506459,9.56561571 L18.7737816,8.14248004 Z" />
  </svg>
)
// Icons/Lock.svg
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)
const DeleteIcon = () => (
  <svg width="24" height="24" viewBox="-4 -3 24 24" fill="currentColor" aria-hidden="true"><path d="M3 18C2.45 18 1.97917 17.8042 1.5875 17.4125C1.19583 17.0208 1 16.55 1 16V3H0V1H5V0H11V1H16V3H15V16C15 16.55 14.8042 17.0208 14.4125 17.4125C14.0208 17.8042 13.55 18 13 18H3ZM13 3H3V16H13V3ZM5 14H7V5H5V14ZM9 14H11V5H9V14Z" /></svg>
)

// V and E circles: hollow = off. Edit includes View, so Edit lights both.
function AccessCell({ level, label }) {
  return (
    <span className="rp-cell" role="img" aria-label={`${label}: ${level === 'none' ? 'no access' : ACCESS_LABEL[level]}`} title={`${label}: ${ACCESS_LABEL[level]}`}>
      <span className={`rp-dot${level !== 'none' ? ' rp-dot--on' : ''}`}>V</span>
      <span className={`rp-dot${level === 'edit' ? ' rp-dot--on' : ''}`}>E</span>
    </span>
  )
}

// One choice per section (None / View / Edit)
function AccessTable({ access, onChange, disabled }) {
  return (
    <table className="rp-access">
      <thead><tr><th>Section</th>{['none', 'view', 'edit'].map(l => <th key={l}>{ACCESS_LABEL[l]}</th>)}</tr></thead>
      <tbody>
        {SECTIONS.map(s => (
          <tr key={s.key}>
            <th scope="row">{s.label}</th>
            {['none', 'view', 'edit'].map(l => (
              <td key={l}>
                <label className="rp-radio" aria-label={`${s.label}: ${ACCESS_LABEL[l]}`}>
                  <input type="radio" className="form-radio" name={`access-${s.key}`} checked={access[s.key] === l} disabled={disabled} onChange={() => onChange({ ...access, [s.key]: l })} />
                </label>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const blankAccess = () => Object.fromEntries(SECTIONS.map(s => [s.key, 'none']))

export default function RolesPanel({ open, onClose }) {
  const state = useRolesStore()
  const [view, setView] = useState('list') // 'list' | 'form'
  const [draft, setDraft] = useState(null) // { id, name, access, people }
  const [showCopy, setShowCopy] = useState(false)
  const [confirm, setConfirm] = useState(null) // { id, name } of the role being deleted
  const [toast, setToast] = useState(null)

  const flash = text => { setToast(text); setTimeout(() => setToast(null), 3000) }
  const closeAll = () => { setView('list'); setDraft(null); setShowCopy(false); onClose() }

  const openForm = role => {
    setDraft(role
      ? { id: role.id, name: role.name, access: { ...role.access }, people: peopleWithRole(state, role.id) }
      : { id: null, name: '', access: blankAccess(), people: [] })
    setView('form')
  }
  const backToList = () => { setView('list'); setDraft(null); setShowCopy(false) }

  const allNames = [...BUILT_IN_ROLES.map(r => r.name), ...state.roles.filter(r => r.id !== draft?.id).map(r => r.name)]
  const nameTaken = draft && allNames.some(n => n.toLowerCase() === draft.name.trim().toLowerCase())
  const noAccess = draft && Object.values(draft.access).every(l => l === 'none')
  const canSave = draft && draft.name.trim() && !nameTaken && !noAccess

  const submitRole = () => {
    saveRole({ id: draft.id, name: draft.name.trim(), access: draft.access }, draft.people)
    flash(draft.id ? 'Role saved' : 'Role added')
    backToList()
  }
  const copyAccessFrom = r => { setDraft(d => ({ ...d, access: { ...r.access } })); setShowCopy(false); flash(`Copied access from ${r.name}`) }

  const title = view === 'list' ? 'Roles and permissions'
    : (draft?.id ? `Edit role: ${draft.name || 'Untitled'}` : 'Add a role')

  const footer = view === 'list' ? (
    <button className="round-btn tertiary-btn" onClick={closeAll}>Close</button>
  ) : (
    <>
      <button className="round-btn tertiary-btn" onClick={backToList}>Back</button>
      <button className="round-btn primary-btn" disabled={!canSave} onClick={submitRole}>Save</button>
    </>
  )

  const candidates = CARE_MANAGERS.map(p => ({ id: p.id, name: p.fullName }))
  const otherRoleOf = pid => state.roles.find(r => r.id === state.assignments[pid] && r.id !== draft?.id)

  return (
    <>
      <SlidePanel open={open} onClose={closeAll} title={title} footer={footer} className="rp-slide">
        <div className="rp-body">
          {view === 'list' && (
            <>
              <div className="rp-list-head">
                <p className="rp-legend"><strong>V</strong> = View, <strong>E</strong> = Edit</p>
                <button type="button" className="round-btn secondary-btn" onClick={() => openForm(null)}>Add role</button>
              </div>
              <div className="rp-scroll">
                <table className="rp-matrix">
                  <thead>
                    <tr>
                      <th className="rp-role-col">Role</th>
                      {SECTIONS.map(s => <th key={s.key}>{s.short}</th>)}
                      <th>Employees</th>
                      <th aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {[...BUILT_IN_ROLES.filter(r => !r.appOnly), ...state.roles].map(r => {
                      const people = r.builtIn ? PEOPLE.filter(p => p.status === 'active' && p.role === r.level && !state.assignments[p.id]).length : peopleWithRole(state, r.id).length
                      return (
                        <tr key={r.id} className={r.builtIn ? 'rp-row--locked' : undefined}>
                          <th scope="row" className="rp-role-col">
                            <span className="rp-role-name">{r.name}</span>
                            {r.builtIn && (
                              <Tooltip text={r.appOnly ? 'Built-in role. Used in the PASSforcare app only, so it has no web access.' : 'Built-in role. It keeps today\'s access and can\'t be changed.'}>
                                <span className="rp-lock" tabIndex={0} role="img" aria-label="Built-in role, can't be changed"><LockIcon /></span>
                              </Tooltip>
                            )}
                          </th>
                          {SECTIONS.map(s => <td key={s.key}><AccessCell level={r.access[s.key]} label={`${r.name}, ${s.label}`} /></td>)}
                          <td className="rp-people">{people}</td>
                          <td className="rp-actions-col">{!r.builtIn && (
                            <>
                              <button type="button" className="rp-pen" aria-label={`Edit ${r.name}`} onClick={() => openForm(r)}><PenIcon /></button>
                              <button type="button" className="rp-pen" aria-label={`Delete ${r.name}`} onClick={() => setConfirm({ id: r.id, name: r.name })}><DeleteIcon /></button>
                            </>
                          )}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {state.roles.length === 0 && <p className="rp-empty">No custom roles yet. Add a role to give someone access to some sections and not others.</p>}
              <p className="rp-note">Built-in roles are locked and keep today's access. An employee keeps their built-in role and can have one custom role on top, for web access. Careworkers and Supervisors only use the PASSforcare app, so they aren't listed.</p>
            </>
          )}

          {view === 'form' && draft && (
            <>
              <div className="rp-form-cols">
                <section className="rp-col rp-col--access">
                  <div className="rp-h2-row">
                    <h2 className="rp-h2">Access</h2>
                      <button type="button" className="round-btn secondary-btn" onClick={() => setShowCopy(true)}>Copy from</button>
                  </div>
                  <AccessTable access={draft.access} onChange={access => setDraft({ ...draft, access })} />
                  {noAccess && <p className="rp-hint">Choose access for at least one section.</p>}
                </section>

                <section className="rp-col rp-col--people">
                  <div className="rp-name-row">
                    <div className="rp-field">
                      <label className="rp-field-label" htmlFor="rp-name">Role name</label>
                      <input id="rp-name" className="form-input" value={draft.name} placeholder="e.g. On call" onChange={e => setDraft({ ...draft, name: e.target.value })} />
                      {nameTaken && <p className="rp-error">A role called {draft.name.trim()} already exists.</p>}
                    </div>
                  </div>
                  <h2 className="rp-h2">Employees with this role</h2>
                  <p className="rp-hint">An employee can only have one custom role. Assigning an employee to a custom role who already has one will replace the role.</p>
                  <SearchMultiSelect items={candidates} selected={draft.people} onChange={people => setDraft({ ...draft, people })} placeholder="Search employees..." />
                  {draft.people.some(pid => otherRoleOf(pid)) && (
                    <p className="rp-hint">Moving: {draft.people.filter(pid => otherRoleOf(pid)).map(pid => `${PEOPLE.find(p => p.id === pid).fullName} (from ${otherRoleOf(pid).name})`).join(', ')}</p>
                  )}
                </section>
              </div>
            </>
          )}
        </div>
      </SlidePanel>

      {showCopy && (
        <Modal title="Copy from" onClose={() => setShowCopy(false)}>
          <p className="rp-modal-text">Pick a role to copy its access into this one. Your role name and employees stay as they are.</p>
          <div className="rp-copy-list">
            {[...BUILT_IN_ROLES.filter(r => !r.appOnly), ...state.roles.filter(r => r.id !== draft?.id)].map(r => (
              <button key={r.id} type="button" className="rp-copy-item" onClick={() => copyAccessFrom(r)}>{r.name}</button>
            ))}
          </div>
          <div className="rp-modal-actions">
            <button type="button" className="round-btn tertiary-btn" onClick={() => setShowCopy(false)}>Cancel</button>
          </div>
        </Modal>
      )}
      {confirm && (
        <Modal title="Delete this role?" onClose={() => setConfirm(null)}>
          <p className="rp-modal-text">
            {(() => { const n = peopleWithRole(state, confirm.id).length; return n === 0 ? `No employees have the ${confirm.name} role.` : `${n === 1 ? '1 employee has' : `${n} employees have`} the ${confirm.name} role. They go back to the access their built-in role gives them.` })()} This can't be undone.
          </p>
          <div className="rp-modal-actions">
            <button type="button" className="round-btn tertiary-btn" onClick={() => setConfirm(null)}>Cancel</button>
            <button type="button" className="round-btn primary-btn" onClick={() => { deleteRole(confirm.id); flash('Role deleted'); backToList(); setConfirm(null) }}>Delete</button>
          </div>
        </Modal>
      )}
      {toast && <div className="rp-toast" role="status">{toast}</div>}
    </>
  )
}

