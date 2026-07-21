import { useState, useRef } from 'react'
import Select, { components } from 'react-select'
import FilterDropdown from '../../../Components/FilterDropdown'

// ─── Icons (copied verbatim from Icons/, fill set to currentColor) ──────

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)

const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.916 5.00275L12.0151 5C12.5912 5.00028 13.0705 5.47958 13.0705 6.07082V10.9295H17.9292C18.4906 10.9295 18.9557 11.3634 18.9968 11.9197L19 12.0151C18.9997 12.5912 18.5204 13.0705 17.9292 13.0705H13.0705V17.9292C13.0705 18.4906 12.6366 18.9557 12.0803 18.9968L11.9849 19C11.4088 18.9997 10.9295 18.5204 10.9295 17.9292V13.0705H6.07082C5.5094 13.0705 5.04427 12.6366 5.00323 12.0803L5 11.9849C5.00028 11.4088 5.47958 10.9295 6.07082 10.9295H10.9295V6.07082L10.9351 5.95992C10.9841 5.48574 11.3434 5.10031 11.8101 5.01699L11.916 5.00275Z"/>
  </svg>
)

const ChevronDownIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="16.6 8.6 12 13.2 7.4 8.6 6 10 12 16 18 10"/>
  </svg>
)

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.5759 2.85953C14.1433 1.88245 15.341 1.47271 16.3181 1.88245C17.1375 2.22915 17.894 2.67041 18.6189 3.20623C19.4699 3.8366 19.7221 5.06583 19.1547 6.04291C18.8395 6.61024 18.8395 7.30365 19.1547 7.87099C19.4699 8.43832 20.0688 8.78503 20.7307 8.78503C21.8653 8.78503 22.8109 9.63603 22.937 10.7392C23 11.1489 23 11.5902 23 11.9999C23 12.4097 23 12.8509 22.937 13.2607C22.8109 14.3638 21.8653 15.2148 20.7307 15.2148C20.1003 15.2148 19.4699 15.5615 19.1547 16.1289C18.8395 16.6962 18.8395 17.3896 19.1547 17.9569C19.7221 18.934 19.4699 20.1317 18.6189 20.7936C17.894 21.3294 17.1375 21.7707 16.3181 22.1174C16.0344 22.212 15.7822 22.275 15.4986 22.275C14.7421 22.275 13.9857 21.8653 13.5759 21.1403C13.2607 20.573 12.6304 20.2263 12 20.2263C11.3696 20.2263 10.7393 20.573 10.4241 21.1403C9.85673 22.1174 8.65903 22.5271 7.68195 22.1174C6.86246 21.7707 6.10602 21.3294 5.38109 20.7936C4.53009 20.1633 4.27794 18.934 4.84527 17.9569C5.16046 17.3896 5.16046 16.6962 4.84527 16.1289C4.53009 15.5615 3.93123 15.2148 3.26934 15.2148C2.13467 15.2148 1.18911 14.3638 1.06304 13.2607C1.03152 12.8509 1 12.4097 1 11.9999C1 11.5902 1 11.1489 1.06304 10.7392C1.18911 9.63603 2.13467 8.78503 3.26934 8.78503C3.89971 8.78503 4.53009 8.43832 4.84527 7.87099C5.16046 7.30365 5.16046 6.61024 4.84527 6.04291C4.27794 5.06583 4.53009 3.86812 5.38109 3.20623C6.10602 2.67041 6.86246 2.22915 7.68195 1.88245C8.69054 1.47271 9.85673 1.88245 10.4241 2.85953C10.7393 3.42686 11.3696 3.77357 12 3.77357C12.6304 3.77357 13.2607 3.42686 13.5759 2.85953ZM15.6246 3.58445C15.4355 3.4899 15.2779 3.61597 15.1834 3.77357C14.5215 4.90824 13.3238 5.60165 12 5.60165C10.6762 5.60165 9.47851 4.90824 8.81662 3.77357C8.72206 3.64749 8.53295 3.52142 8.37536 3.58445C7.68195 3.86812 7.05158 4.24635 6.45272 4.68761C6.32665 4.78216 6.32665 5.00279 6.4212 5.16039C7.08309 6.29506 7.08309 7.68188 6.4212 8.81655C5.79083 9.9197 4.5616 10.6446 3.26934 10.6446C3.08023 10.6446 2.92264 10.7707 2.89112 10.9598C2.8596 11.3065 2.82808 11.6532 2.82808 11.9999C2.82808 12.3466 2.8596 12.6933 2.89112 13.04C2.89112 13.2292 3.04871 13.3552 3.26934 13.3552C4.5616 13.3552 5.75931 14.0486 6.4212 15.1833C7.05158 16.318 7.08309 17.7048 6.4212 18.8395C6.32665 18.9971 6.29513 19.2177 6.45272 19.3122C7.05158 19.7535 7.68195 20.1317 8.37536 20.4154C8.56447 20.51 8.72206 20.3839 8.81662 20.2263C9.47851 19.0916 10.6762 18.3982 12 18.3982C13.3238 18.3982 14.5215 19.0916 15.1834 20.2263C15.2779 20.3524 15.467 20.4784 15.6246 20.4154C16.3181 20.1317 16.9484 19.7535 17.5473 19.3122C17.6734 19.2177 17.6734 18.9971 17.5788 18.8395C16.9169 17.7048 16.9169 16.318 17.5788 15.1833C18.2092 14.0802 19.4384 13.3552 20.7307 13.3552C20.9198 13.3552 21.0774 13.2292 21.1089 13.04C21.1719 12.6933 21.1719 12.3466 21.1719 11.9999C21.1719 11.6532 21.1404 11.3065 21.1089 10.9598C21.1089 10.7707 20.9513 10.6446 20.7307 10.6446C19.4384 10.6446 18.2407 9.95122 17.5788 8.81655C16.9484 7.68188 16.9169 6.29506 17.5788 5.16039C17.6734 5.00279 17.7049 4.78216 17.5473 4.68761C16.9484 4.24635 16.2865 3.86812 15.6246 3.58445ZM12 8.34377C14.0172 8.34377 15.6562 9.98274 15.6562 11.9999C15.6562 14.0171 14.0172 15.6561 12 15.6561C9.98281 15.6561 8.34384 14.0171 8.34384 11.9999C8.34384 9.98274 9.98281 8.34377 12 8.34377ZM12 10.1718C10.9914 10.1718 10.1719 10.9913 10.1719 11.9999C10.1719 13.0085 10.9914 13.828 12 13.828C13.0086 13.828 13.8281 13.0085 13.8281 11.9999C13.8281 10.9913 13.0086 10.1718 12 10.1718Z"/>
  </svg>
)

const WarningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="warning-icon">
    <path d="M10.27,3.99 C11.04,2.66 12.96,2.66 13.73,3.99 L21.26,17 C22.03,18.33 21.07,20 19.53,20 L4.47,20 C2.93,20 1.97,18.33 2.74,17 Z M12,15 C11.4477153,15 11,15.4477153 11,16 C11,16.5522847 11.4477153,17 12,17 C12.5522847,17 13,16.5522847 13,16 C13,15.4477153 12.5522847,15 12,15 Z M12,7 C11.4477153,7 11,7.44771525 11,8 L11,12 C11,12.5522847 11.4477153,13 12,13 C12.5522847,13 13,12.5522847 13,12 L13,8 C13,7.44771525 12.5522847,7 12,7 Z"/>
  </svg>
)

const TickIcon = ({ className }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <polygon points="9.29090299 15.7925373 5.47272117 12.0313433 4.1999939 13.2850746 9.29090299 18.3 20.1999939 7.55373134 18.9272666 6.3"/>
  </svg>
)

const ClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0.0374, 0.7143)" fillRule="nonzero">
      <path fill="currentColor" d="M12,0.375 C5.578125,0.375 0.375,5.578125 0.375,12 C0.375,18.421875 5.578125,23.625 12,23.625 C18.421875,23.625 23.625,18.421875 23.625,12 C23.625,5.578125 18.421875,0.375 12,0.375 Z M12,21.375 C6.8203125,21.375 2.625,17.1796875 2.625,12 C2.625,6.8203125 6.8203125,2.625 12,2.625 C17.1796875,2.625 21.375,6.8203125 21.375,12 C21.375,17.1796875 17.1796875,21.375 12,21.375 Z M14.896875,16.48125 L10.9171875,13.5890625 C10.771875,13.48125 10.6875,13.3125 10.6875,13.134375 L10.6875,5.4375 C10.6875,5.128125 10.940625,4.875 11.25,4.875 L12.75,4.875 C13.059375,4.875 13.3125,5.128125 13.3125,5.4375 L13.3125,12.0796875 L16.44375,14.3578125 C16.696875,14.540625 16.7484375,14.8921875 16.565625,15.1453125 L15.684375,16.359375 C15.5015625,16.6078125 15.15,16.6640625 14.896875,16.48125 Z" />
    </g>
  </svg>
)

// ── react-select: custom chevron + styles, copied verbatim from
// holiday-absences/assign-visits-on-holiday/src/HolidayAbsenceDialog.jsx ──

const DropdownIndicator = (props) => (
  <components.DropdownIndicator {...props}>
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <polygon fill="currentColor" points="16.6 8.6 12 13.2 7.4 8.6 6 10 12 16 18 10" />
    </svg>
  </components.DropdownIndicator>
)

const SELECT_STYLES = {
  control: (base, { isFocused }) => ({
    ...base,
    border: `1.5px solid ${isFocused ? '#9a26d6' : '#cac6d7'}`,
    borderRadius: 8, boxShadow: 'none', fontFamily: 'inherit',
    fontSize: 16, fontWeight: 500, cursor: 'pointer',
    '&:hover': { borderColor: isFocused ? '#9a26d6' : '#cac6d7' },
  }),
  valueContainer: (base) => ({ ...base, padding: '10px 14px' }),
  singleValue: (base) => ({ ...base, color: '#333', margin: 0 }),
  placeholder: (base) => ({ ...base, color: '#333' }),
  input: (base) => ({ ...base, margin: 0, padding: 0, color: '#333' }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({ ...base, color: '#968caf', padding: '8px 10px 8px 0', '&:hover': { color: '#968caf' } }),
  menu: (base) => ({ ...base, borderRadius: 8, border: '1.5px solid #cac6d7', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', overflow: 'hidden', marginTop: 4 }),
  menuList: (base) => ({ ...base, padding: 0 }),
  option: (base, { isSelected, isFocused }) => ({
    ...base, fontSize: 16, fontWeight: 500,
    color: isSelected ? '#fff' : '#333',
    backgroundColor: isSelected ? '#9a26d6' : isFocused ? '#f3f4f6' : '#fff',
    cursor: 'pointer', '&:active': { backgroundColor: '#8421b8' },
  }),
}

const ABSENCE_TYPES = [
  { value: 'holiday', label: 'Holiday' },
  { value: 'sickness', label: 'Sickness' },
  { value: 'other', label: 'Other' },
]

const FilterIcon = ({ active }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" className={`col-icon ${active ? 'col-icon--active' : ''}`}>
    {active ? (
      <path d="M10.5,15.7658125 L10.5,12 L6.75103413,7.83448237 C6.56630462,7.62922736 6.58294383,7.31308244 6.78819884,7.12835293 C6.88001119,7.04572181 6.99916031,7 7.1226812,7 L16.8773188,7 C17.1534612,7 17.3773188,7.22385763 17.3773188,7.5 C17.3773188,7.62352089 17.331597,7.74267001 17.2489659,7.83448237 L13.5,12 L13.5,17.4324792 C13.5,17.7086216 13.2761424,17.9324792 13,17.9324792 C12.8830317,17.9324792 12.7697653,17.8914711 12.6799078,17.8165898 L10.6799078,16.1499232 C10.5659115,16.0549263 10.5,15.9142024 10.5,15.7658125 Z" fill="currentColor"/>
    ) : (
      <path d="M15 17c0-.552-.448-1-1-1h-4c-.552 0-1 .448-1 1s.448 1 1 1h4c.552 0 1-.448 1-1zm3-5c0-.552-.448-1-1-1H7c-.552 0-1 .448-1 1s.448 1 1 1h10c.552 0 1-.448 1-1zM4 8h16c.552 0 1-.448 1-1s-.448-1-1-1H4c-.552 0-1 .448-1 1s.448 1 1 1z" fill="currentColor"/>
    )}
  </svg>
)

// ─── Layout helper ───────────────────────────────────────────────

function Section({ title, description, children }) {
  return (
    <section className="uk-section">
      <h2>{title}</h2>
      {description && <p className="uk-section-desc">{description}</p>}
      {children}
    </section>
  )
}

const CUSTOMERS = ['Margaret Thompson', 'George Evans', 'Dorothy Williams', 'Harold Clarke', 'Edith Morrison']

export default function App() {
  const [filterSelected, setFilterSelected] = useState(new Set())
  const [filterOpen, setFilterOpen] = useState(false)
  const filterAnchorRef = useRef(null)

  const [radioValue, setRadioValue] = useState('first')
  const [checkedA, setCheckedA] = useState(true)
  const [checkedB, setCheckedB] = useState(false)
  const [toggleOn, setToggleOn] = useState(true)
  const [rows, setRows] = useState(10)
  const [activeTab, setActiveTab] = useState('Details')
  const [absenceType, setAbsenceType] = useState(ABSENCE_TYPES[0])

  return (
    <div className="uk-page">
      <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>

      <div className="uk-header">
        <h1>UI Kit</h1>
        <p>The shared CSS-only building blocks used across prototypes — buttons, inputs, dropdowns, radios, checkboxes, toggles, badges, tabs and warnings. All classes live in <code>Styles/main.css</code> unless noted otherwise. The Dropdowns section below shows FilterDropdown in context, but for its full behaviour (and the other shared React components with real state — Pagination, Modal, Tooltip, Date Range Picker), see their own dedicated demos on the <a href="../../">prototypes page</a>.</p>
      </div>

      <Section title="Buttons" description="Always composed as .round-btn plus a variant class. .btn-icon-left / .btn-icon-right just adjust padding on whichever side has an icon.">
        <span className="uk-caption">Primary / Secondary / Tertiary</span>
        <div className="uk-row">
          <button className="round-btn primary-btn">Primary</button>
          <button className="round-btn secondary-btn">Secondary</button>
          <button className="round-btn tertiary-btn">Tertiary</button>
        </div>

        <span className="uk-caption">Disabled</span>
        <div className="uk-row">
          <button className="round-btn primary-btn" disabled>Primary</button>
          <button className="round-btn secondary-btn" disabled>Secondary</button>
        </div>

        <span className="uk-caption">With icons</span>
        <div className="uk-row">
          <button className="round-btn primary-btn btn-icon-left"><PlusIcon /> Add employee</button>
          <button className="round-btn secondary-btn btn-icon-right">Select <ChevronDownIcon /></button>
          <button className="round-btn tertiary-btn btn-icon-left btn-icon-right"><SettingsIcon /> Actions <ChevronDownIcon /></button>
        </div>
      </Section>

      <Section title="Field inputs" description="Text, number and dropdown fields all share the same height via .form-input and react-select's SELECT_STYLES. Time (and date) fields use the same styling but swap the input for a readonly .input-wrap with a trailing icon — copied from the holiday-absences dialog.">
        <div className="uk-field-row">
          <div className="uk-field">
            <label className="uk-field-label" htmlFor="uk-text-demo">Text</label>
            <input id="uk-text-demo" className="form-input" type="text" placeholder="e.g. Jane Smith" />
          </div>
          <div className="uk-field uk-field--narrow">
            <label className="uk-field-label" htmlFor="uk-number-demo">Number</label>
            <input id="uk-number-demo" className="form-input" type="number" placeholder="0" />
          </div>
          <div className="uk-field">
            <label className="uk-field-label" htmlFor="uk-select-demo">Absence type</label>
            <Select
              inputId="uk-select-demo"
              options={ABSENCE_TYPES}
              value={absenceType}
              onChange={setAbsenceType}
              styles={SELECT_STYLES}
              components={{ DropdownIndicator }}
            />
          </div>
          <div className="uk-field uk-field--narrow">
            <label className="uk-field-label" htmlFor="uk-time-demo">Start time</label>
            <div className="input-wrap">
              <input id="uk-time-demo" className="form-input" type="text" value="09:00" readOnly />
              <span className="input-icon"><ClockIcon /></span>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Dropdowns" description="Two real patterns: the shared FilterDropdown component (column filters, portal-rendered, with search/sort) and a plain styled <select> (.rows-select, used by Pagination).">
        <span className="uk-caption">FilterDropdown</span>
        <div className="uk-row">
          <span className="uk-th-demo">
            Customer
            <button
              ref={filterAnchorRef}
              className={`col-icon-btn ${filterSelected.size ? 'col-icon-btn--active' : ''}`}
              onClick={() => setFilterOpen(o => !o)}
            >
              <FilterIcon active={filterSelected.size > 0} />
            </button>
          </span>
        </div>
        <FilterDropdown
          items={CUSTOMERS}
          selected={filterSelected}
          onApply={(sel) => setFilterSelected(sel)}
          onClear={() => setFilterSelected(new Set())}
          hasNameSort
          isOpen={filterOpen}
          onClose={() => setFilterOpen(false)}
          anchorEl={filterAnchorRef.current}
        />

        <span className="uk-caption">Plain select (.rows-select)</span>
        <div className="uk-row">
          <select className="rows-select" value={rows} onChange={e => setRows(Number(e.target.value))}>
            {[10, 12, 25, 50].map(n => <option key={n} value={n}>{n} rows</option>)}
          </select>
        </div>
      </Section>

      <Section title="Radio buttons" description=".form-radio — a custom circular radio, typically wrapped in .fd-radio-row for label spacing.">
        <div className="uk-row">
          <label className="fd-radio-row">
            <input type="radio" className="form-radio" name="uk-radio-demo" checked={radioValue === 'first'} onChange={() => setRadioValue('first')} />
            <span>First name</span>
          </label>
          <label className="fd-radio-row">
            <input type="radio" className="form-radio" name="uk-radio-demo" checked={radioValue === 'last'} onChange={() => setRadioValue('last')} />
            <span>Last name</span>
          </label>
        </div>
      </Section>

      <Section title="Checkboxes" description=".checkbox-wrap hides the native input and styles a sibling .checkbox-box span instead.">
        <div className="uk-row">
          <label className="checkbox-wrap">
            <input type="checkbox" checked={checkedA} onChange={e => setCheckedA(e.target.checked)} />
            <span className="checkbox-box" />
          </label>
          <label className="checkbox-wrap">
            <input type="checkbox" checked={checkedB} onChange={e => setCheckedB(e.target.checked)} />
            <span className="checkbox-box" />
          </label>
        </div>
      </Section>

      <Section title="Toggle switches" description=".tog / .tog-on / .tog-thumb — used for settings-style on/off rows (Account screen). Click to try it.">
        <div className="uk-row">
          <div className={`tog${toggleOn ? ' tog-on' : ''}`} onClick={() => setToggleOn(o => !o)} role="switch" aria-checked={toggleOn} tabIndex={0}>
            <div className="tog-thumb" />
          </div>
        </div>
      </Section>

      <Section title="Badges / status pills" description="Status pills (.status-pill + a colour modifier) and count badges (.menu-row-badge) share the same red/green/grey tokens used throughout the RAG colour system.">
        <span className="uk-caption">Status pills</span>
        <div className="uk-row">
          <span className="status-pill status-completed">Completed</span>
          <span className="status-pill status-missed">Missed</span>
          <span className="status-pill status-cancelled">Cancelled</span>
        </div>

        <span className="uk-caption">Count badge</span>
        <div className="uk-row">
          <span className="menu-row-badge">3</span>
        </div>
      </Section>

      <Section title="Tabs" description=".ep-tabs / .ep-tab / .ep-tab--active — the underline-tab pattern from the event panel (local pattern, copied here for reference).">
        <div className="ep-tabs uk-tabs-demo" role="tablist">
          {['Details', 'Checklists', 'Documents'].map(tab => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              className={`ep-tab${activeTab === tab ? ' ep-tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Warnings" description=".warning-banner + a colour modifier (orange / red / green). Orange is the default even without the modifier class, but always add it explicitly.">
        <div className="uk-stack">
          <div className="warning-banner orange">
            <WarningIcon />
            <div>
              <h4>Warnings</h4>
              <p>The finish date has changed but a verified holiday pay deduction already exists. Review and update the deduction in timesheets.</p>
            </div>
          </div>
          <div className="warning-banner red">
            <WarningIcon />
            <div>
              <h4>Unable to save</h4>
              <p>This is a demonstration only — no real .warning-banner.red usage exists elsewhere in the prototypes yet.</p>
            </div>
          </div>
          <div className="warning-banner green">
            <TickIcon className="success-icon" />
            <div>
              <h4>Holiday pay deduction added</h4>
              <p>£42.50 deduction record created. <a href="#" onClick={e => e.preventDefault()}>View in timesheets</a></p>
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}
