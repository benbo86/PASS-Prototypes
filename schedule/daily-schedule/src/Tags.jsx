// Area tag — a small coloured pill with an icon, matching the reference
// styling Ben supplied (an amber-red "Surrey" area tag). Conceptually
// user-configurable in the real product (colours chosen in Roster
// Settings' Tags area) — that settings screen isn't built yet, so this is
// a fixed lookup standing in for it, keyed by name so it's trivial to swap
// for real config later. Visit type renders as plain text in the list
// table (see DailySchedule.jsx) — no tag/icon needed for it.

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

// ── Icons (16×16, currentColor so they inherit each tag's own text colour) ──

const PinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
  </svg>
)

export function AreaTag({ area }) {
  const { bg, text } = AREA_COLORS[area] || SWATCH.mauve;
  return (
    <span className="ds-tag" style={{ background: bg, color: text }}>
      <PinIcon /> {area}
    </span>
  )
}
