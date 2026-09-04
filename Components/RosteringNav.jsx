// Left sub-nav sitting inside the Rostering tab's own page content (not the
// global SideNav rail, and not a horizontal tab bar like CustomerProfileNav/
// OfficeNav) — first built for customer-profile/service-agreement/. Flat
// {key,label,href,Icon} list, href:null renders inert, matching the same
// convention OfficeNav/ScheduleNav already use for a sibling section not yet
// built. Only "Service agreement" exists today; the other 3 are placeholders
// for future Rostering pages.

// Copied verbatim from Icons/Funder.svg / Icons/Service Agreement.svg /
// Icons/Funder Allocation.svg (literal fills/strokes swapped for
// currentColor so they can recolor on hover/active, same convention as
// every other converted icon in this repo — see e.g. Components/SideNav.jsx's
// own note on this).

const FunderIcon = () => (
  <svg width="24" height="24" viewBox="0 0 25 24" fill="none">
    <path d="M20.543,14.608 L17.335,17.174 C16.9408466,17.4901338 16.450267,17.6616602 15.945,17.66 L11.84,17.66 C11.5423668,17.647369 11.3075744,17.4024011 11.3075744,17.1045 C11.3075744,16.8065989 11.5423668,16.561631 11.84,16.549 L14.559,16.549 C15.111,16.549 15.625,16.17 15.713,15.625 C15.7684243,15.3021896 15.6785829,14.9713717 15.467482,14.7209424 C15.2563811,14.4705131 14.9455338,14.326 14.618,14.326 L10.063,14.326 C9.126,14.326 8.217,14.649 7.49,15.239 L5.875,16.549 L3.951,16.549 C3.64431978,16.5489995 3.39555158,16.7973203 3.395,17.104 L3.395,20.438 C3.395,20.744 3.644,20.993 3.951,20.993 L15.338,20.993 C15.843,20.993 16.333,20.823 16.727,20.507 L21.978,16.306 C22.2336835,16.1014587 22.3861204,15.7945466 22.3946022,15.4672253 C22.4030841,15.1399039 22.2667469,14.8255089 22.022,14.608 C21.612,14.236 20.973,14.261 20.542,14.608 L20.543,14.608 Z" fill="currentColor" />
    <g stroke="currentColor" strokeLinecap="round" strokeWidth="2">
      <path d="M15.395,10.5 L15.395,12 L9.395,12 L10.395,12 L10.395,6.284 C10.405,5.329 10.793,4.647 11.562,4.235 C12.33,3.824 13.274,3.952 14.395,4.622" strokeLinejoin="round" />
      <line x1="9.395" y1="8" x2="12.395" y2="8" />
    </g>
  </svg>
)

const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const ServiceAgreementIcon = () => (
  <svg width="24" height="24" viewBox="0 0 25 24" fill="none">
    <path d="M13.617,3 L13.805,3.009 C14.1769965,3.04406244 14.5317325,3.18263117 14.829,3.409 L14.973,3.529 L18.733,6.996 L18.864,7.128 C19.123328,7.41566746 19.2935521,7.77244332 19.354,8.155 L17.421,10.086 L17.421,9.062 L15.251,9.062 L15.104,9.056 C14.2360332,8.98637495 13.5446118,8.30128912 13.467,7.434 L13.461,7.279 L13.461,4.982 L8.93,4.982 C8.15887523,4.98352966 7.51454069,5.5694849 7.44,6.337 L7.433,6.482 L7.433,17.512 L7.44,17.657 C7.50886506,18.3711917 8.07385953,18.9366053 8.788,19.006 L8.933,19.013 L15.923,19.013 L16.067,19.006 C16.7811405,18.9366053 17.3461349,18.3711917 17.415,17.657 L17.422,17.513 L17.422,15.958 L19.379,14.003 L19.379,17.69 L19.374,17.877 C19.2749235,19.5604757 17.9288142,20.9018528 16.245,20.995 L16.056,21 L8.84,21 L8.651,20.995 C6.96640583,20.902833 5.61917519,19.5611961 5.52,17.877 L5.515,17.69 L5.515,6.31 L5.52,6.123 C5.6191259,4.43916417 6.96579583,3.09765719 8.65,3.005 L8.84,3 L13.617,3 Z M19.162,9.346 L21.1,11.284 L15.456,16.922 C15.4097009,16.9722436 15.3443206,17.0005751 15.276,17.0000086 L13.704,17.0000086 C13.6354106,17.000538 13.5694743,16.9735287 13.5209728,16.9250272 C13.4724713,16.8765257 13.445462,16.8105894 13.4459921,16.742 L13.4459921,15.17 C13.4459921,15.098 13.472,15.036 13.524,14.984 L19.162,9.346 Z M20.661,7.847 C20.8620834,7.64609322 21.1879166,7.64609322 21.389,7.847 L22.599,9.057 C22.7999068,9.25808335 22.7999068,9.58391665 22.599,9.785 L21.653,10.731 L19.715,8.793 L20.661,7.847 Z" fill="currentColor" fillRule="evenodd" />
    <polyline points="8.895 16.5 9.788 15 10.671 16.5 12.446 16.5" stroke="currentColor" strokeLinejoin="round" fill="none" />
  </svg>
)

const FunderAllocationIcon = () => (
  <svg width="24" height="24" viewBox="0 0 25 24" fill="none">
    <path d="M8.263,13 C5.853,13 1.032,14.167 1.032,16.5 L1.032,18.999 L15.494,18.999 L15.494,16.5 C15.494,14.167 10.674,13 8.264,13 M16.528,13 C16.228,13 15.89,13.018 15.53,13.054 C16.726,13.892 17.56,15.017 17.56,16.5 L17.56,18.999 L23.756,18.999 L23.756,16.5 C23.756,14.167 18.938,13 16.528,13 M8.263,4.999 C6.553,4.999 5.165,6.344 5.165,8 C5.165,9.656 6.553,11 8.263,11 C9.975,11 11.353,9.656 11.353,8 C11.353,6.344 9.975,4.999 8.263,4.999 M16.528,4.999 C14.815,4.999 13.428,6.344 13.428,8 C13.428,9.656 14.815,11 16.528,11 C18.238,11 19.615,9.656 19.615,8 C19.615,6.344 18.238,4.999 16.528,4.999" fill="currentColor" fillRule="evenodd" />
  </svg>
)

const NAV_ITEMS = [
  { key: 'funders',            label: 'Funders',            href: '../funders/', Icon: FunderIcon },
  { key: 'care-requirements',  label: 'Care requirements',  href: null, Icon: CheckIcon },
  { key: 'service-agreement',  label: 'Service agreement',  href: '../service-agreement/', Icon: ServiceAgreementIcon },
  { key: 'funder-allocation',  label: 'Funder allocation',  href: null, Icon: FunderAllocationIcon },
]

export default function RosteringNav({ activeItem }) {
  return (
    <nav className="rn-nav">
      <ul className="rn-list">
        {NAV_ITEMS.map(({ key, label, href, Icon }) => (
          <li key={key}>
            <button
              className={`rn-item${key === activeItem ? ' active' : ''}`}
              onClick={() => href && (window.location.href = href)}
              style={!href ? { cursor: 'default' } : undefined}
            >
              <span className="rn-item-icon"><Icon /></span>
              <span className="rn-item-label">{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
