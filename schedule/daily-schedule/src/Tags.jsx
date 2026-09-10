// Area and Visit Type tags — small coloured pills with an icon, matching
// the reference styling Ben supplied (an amber-red "Surrey" area tag, a
// blue "Sleeping night" visit-type tag). Both are conceptually user-
// configurable in the real product (colours chosen in Roster Settings'
// Tags area; visit-type icons "automatically generated") — neither of
// those settings screens exist yet, so this is a fixed lookup standing in
// for them, keyed by name so it's trivial to swap for real config later.

const SWATCH = {
  red:    { bg: 'var(--rag-red-action-med-pastel)',      text: 'var(--rag-red-red-overdue-text)' },
  blue:   { bg: 'var(--availability-4-blue-tint)',       text: 'var(--ui-blue-edited-text)' },
  green:  { bg: 'var(--rag-green-green-lightest)',       text: 'var(--rag-green-green-3-aa)' },
  amber:  { bg: 'var(--rag-amber-amber-lightest)',       text: 'var(--rag-amber-amber-6)' },
  mauve:  { bg: 'var(--availability-6-mauve-tint)',      text: 'var(--brand-purple-3-purple-2)' },
  purple: { bg: 'var(--ui-purple-8-vibrant-lavendar)',   text: 'var(--ui-purple-1-cyber-grape)' },
};

// Explicit (not hashed) assignments — a hash lands too many of our small,
// fixed name lists on the same slot to read as genuinely distinct tags,
// and specifically wouldn't reliably reproduce "Sleeping night" as blue,
// which the reference screenshot shows.
const AREA_COLORS = {
  'Coleraine Central': SWATCH.red,
  'Portstewart': SWATCH.blue,
  'Portrush': SWATCH.green,
  'Ballymoney': SWATCH.amber,
  'Castlerock': SWATCH.mauve,
};
const VISIT_TYPE_COLORS = {
  'Personal care': SWATCH.green,
  'Sleeping night': SWATCH.blue,
  'Waking night': SWATCH.amber,
  'Domiciliary': SWATCH.mauve,
  'Companionship': SWATCH.purple,
  'Wellbeing check': SWATCH.red,
  'Medication support': SWATCH.green,
};

// ── Icons (16×16, currentColor so they inherit each tag's own text colour) ──

const PinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
  </svg>
)
const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
)
const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)
const HomeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" />
  </svg>
)
const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const ActivityIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
)
const PillIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="7" rx="3.5" transform="rotate(-45 12 14.5)" />
    <line x1="12" y1="9.5" x2="12" y2="19.5" transform="rotate(-45 12 14.5)" />
  </svg>
)

const VISIT_TYPE_ICONS = {
  'Personal care': UsersIcon,
  'Sleeping night': MoonIcon,
  'Waking night': SunIcon,
  'Domiciliary': HomeIcon,
  'Companionship': UsersIcon,
  'Wellbeing check': ActivityIcon,
  'Medication support': PillIcon,
}

export function AreaTag({ area }) {
  const { bg, text } = AREA_COLORS[area] || SWATCH.mauve;
  return (
    <span className="ds-tag" style={{ background: bg, color: text }}>
      <PinIcon /> {area}
    </span>
  )
}

export function VisitTypeTag({ visitType }) {
  const Icon = VISIT_TYPE_ICONS[visitType] || UsersIcon;
  const { bg, text } = VISIT_TYPE_COLORS[visitType] || SWATCH.mauve;
  return (
    <span className="ds-tag" style={{ background: bg, color: text }}>
      <Icon /> {visitType}
    </span>
  )
}
