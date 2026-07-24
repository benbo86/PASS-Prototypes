// Full swatch set pulled from every named section of Styles/colors.css —
// grouped under the same category names that file itself uses, so any
// repo colour is reachable from the Colour Fill popup's Swatches tab
// without leaving the tool. `token` is used only for a live-linked preview
// (`background: var(--token)`, so a swatch stays accurate if the
// underlying value changes later) — the value actually written into a
// saved wireframe's fill/stroke is always `hex`, so a saved file stays
// fully self-contained and never depends on this repo's CSS. Deliberately
// excludes colors.css's ungrouped "Misc" section at the bottom (--web-skrim,
// --invisible, --purple-7, --iolite, --amber, --calcite) — one-off
// special-purpose values (a scrim overlay, a fully-transparent
// placeholder already covered by NONE_SWATCH below, etc.), not real fill
// choices, and with no natural category label of their own.
export const NONE_SWATCH = { label: 'None', token: null, hex: null }

export const FILL_SWATCH_GROUPS = [
  {
    category: 'Greyscale',
    swatches: [
      { label: 'Black', token: '--greyscale-01-black', hex: '#000000' },
      { label: 'Grey 20', token: '--greyscale-2-grey-20', hex: '#333333' },
      { label: 'Grey 30', token: '--greyscale-3-grey-30', hex: '#4d4d4d' },
      { label: 'Grey 40', token: '--greyscale-4-grey-40', hex: '#666666' },
      { label: 'Grey 45', token: '--greyscale-5-grey-45', hex: '#737373' },
      { label: 'Grey 50', token: '--greyscale-6-grey-50', hex: '#808080' },
      { label: 'Grey 60', token: '--greyscale-7-grey-60', hex: '#999999' },
      { label: 'Grey 65', token: '--greyscale-8-grey-65', hex: '#a6a6a6' },
      { label: 'Grey 70', token: '--greyscale-9-grey-70', hex: '#b3b3b3' },
      { label: 'Grey 75', token: '--greyscale-10-grey-75', hex: '#bfbfbf' },
      { label: 'Grey 80', token: '--greyscale-11-grey-80', hex: '#cccccc' },
      { label: 'Grey 85', token: '--greyscale-12-grey-85', hex: '#d9d9d9' },
      { label: 'Grey 90', token: '--greyscale-13-grey-90', hex: '#e6e6e6' },
      { label: 'Grey 95', token: '--greyscale-14-grey-95', hex: '#f5f5f5' },
      { label: 'Grey 97', token: '--greyscale-15-grey-97', hex: '#f7f7f7' },
      { label: 'White', token: '--greyscale-16-white', hex: '#ffffff' },
      { label: 'Grey 95 (alt)', token: '--greyscale-grey-95', hex: '#efeded' },
    ],
  },
  {
    category: 'Brand Purple',
    swatches: [
      { label: 'Purple 0', token: '--brand-purple-1-purple-0', hex: '#42105c' },
      { label: 'Purple 2', token: '--brand-purple-3-purple-2', hex: '#6d1b98' },
      { label: 'Purple 2 tint', token: '--brand-purple-4-purple-2-tint', hex: '#b173c7' },
      { label: 'Purple 3', token: '--brand-purple-5-purple-3', hex: '#8421b8' },
      { label: 'Purple 4', token: '--brand-purple-6-purple-4', hex: '#9a26d6' },
      { label: 'Purple 5', token: '--brand-purple-7-purple-5', hex: '#b02cf7' },
      { label: 'Purple 10', token: '--brand-purple-8-purple-10', hex: '#f1d6ff' },
    ],
  },
  {
    category: 'UI Purple',
    swatches: [
      { label: 'Cyber grape', token: '--ui-purple-1-cyber-grape', hex: '#4f4279' },
      { label: 'Glossy grape', token: '--ui-purple-2-glossy-grape', hex: '#726694' },
      { label: 'Grape grey', token: '--ui-purple-3-grape-grey', hex: '#968caf' },
      { label: 'Lavender', token: '--ui-purple-4-lavendar', hex: '#cac6d7' },
      { label: 'Languid lavender', token: '--ui-purple-5-languid-lavendar', hex: '#dcd9e4' },
      { label: 'Lavender grey', token: '--ui-purple-6-lavendar-grey', hex: '#edecf1' },
      { label: 'Lightest lavender', token: '--ui-purple-7-lightest-lavendar', hex: '#f5f5f6' },
      { label: 'Vibrant lavender', token: '--ui-purple-8-vibrant-lavendar', hex: '#dad3ef' },
      { label: 'Cyber opacity 3%', token: '--ui-purple-opacity-tint-cyber-opacity-3', hex: 'rgba(39, 28, 74, 0.03)' },
      { label: 'Cyber opacity 5%', token: '--ui-purple-opacity-tint-cyber-opacity-5', hex: 'rgba(39, 28, 74, 0.05)' },
      { label: 'Cyber opacity 10%', token: '--ui-purple-opacity-tint-cyber-opacity-10', hex: 'rgba(39, 28, 74, 0.1)' },
    ],
  },
  {
    category: 'UI Blue',
    swatches: [
      { label: 'Lightest', token: '--ui-blue-lightest', hex: '#f3fafd' },
      { label: 'Edited fill', token: '--ui-blue-edited-fill', hex: '#edf9ff' },
      { label: 'Edited outline', token: '--ui-blue-edited-outline', hex: '#3aace6' },
      { label: 'Edited text', token: '--ui-blue-edited-text', hex: '#007cba' },
      { label: 'Muted dark', token: '--ui-blue-muted-dark', hex: '#6a8ec3' },
    ],
  },
  {
    category: 'RAG Red',
    swatches: [
      { label: 'Red pastel lighter', token: '--rag-red-red-pastel-lighter', hex: '#fbf5f5' },
      { label: 'Action med lightest', token: '--rag-red-action-med-lightest', hex: '#fcf7f7' },
      { label: 'Action med pastel', token: '--rag-red-action-med-pastel', hex: '#f2dedf' },
      { label: 'Action medication', token: '--rag-red-action-medication', hex: '#f26d6d' },
      { label: 'Overdue text', token: '--rag-red-red-overdue-text', hex: '#c05e5e' },
      { label: 'Overdue', token: '--rag-red-red-overdue', hex: '#e31c4a' },
      { label: 'Overdue dark', token: '--rag-red-red-overdue-dark', hex: '#b5002a' },
    ],
  },
  {
    category: 'RAG Amber',
    swatches: [
      { label: 'Amber lightest', token: '--rag-amber-amber-lightest', hex: '#f7f4ed' },
      { label: 'Amber muted banner', token: '--rag-amber-amber-muted-banner', hex: '#e9d189' },
      { label: 'Amber 6', token: '--rag-amber-amber-6', hex: '#e09600' },
      { label: 'Amber 7', token: '--rag-amber-amber-7', hex: '#f0a205' },
    ],
  },
  {
    category: 'RAG Green',
    swatches: [
      { label: 'Green lightest', token: '--rag-green-green-lightest', hex: '#e8f1e8' },
      { label: 'Green muted banner', token: '--rag-green-green-muted-banner', hex: '#b7dda8' },
      { label: 'Green 3', token: '--rag-green-green-3-aa', hex: '#1c871c' },
      { label: 'Green 4', token: '--rag-green-green-4', hex: '#1f991f' },
      { label: 'Green 5', token: '--rag-green-green-5', hex: '#21a621' },
    ],
  },
  {
    category: 'Availability',
    swatches: [
      { label: 'Purple', token: '--availability-1-purple', hex: '#bfbacf' },
      { label: 'Purple tint', token: '--availability-1-purple-tint', hex: '#e9e8ed' },
      { label: 'Purple (alt)', token: '--availability-purple', hex: '#cac6d7' },
      { label: 'Amber', token: '--availability-2-amber', hex: '#e9d189' },
      { label: 'Amber tint', token: '--availability-2-amber-tint', hex: '#f2ecdf' },
      { label: 'Green', token: '--availability-3-green', hex: '#b7dda8' },
      { label: 'Green tint', token: '--availability-3-green-tint', hex: '#e2f2dc' },
      { label: 'Blue', token: '--availability-4-blue', hex: '#b1c8de' },
      { label: 'Blue tint', token: '--availability-4-blue-tint', hex: '#e0e9f2' },
      { label: 'Blue tint (alt)', token: '--availability-blue-tint', hex: '#e7f1f6' },
      { label: 'Mauve', token: '--availability-6-mauve', hex: '#c9b4de' },
      { label: 'Mauve tint', token: '--availability-6-mauve-tint', hex: '#eae1f2' },
    ],
  },
  {
    category: 'Task Actions',
    swatches: [
      { label: 'Care plan tracking', token: '--tasks-action-careplantracking', hex: '#e35ce6' },
      { label: 'Assessment', token: '--tasks-action-assessment', hex: '#c17b55' },
      { label: 'Document', token: '--tasks-action-document', hex: '#46c29a' },
      { label: 'Task', token: '--tasks-action-task', hex: '#94aa4b' },
      { label: 'Observation', token: '--tasks-action-observation', hex: '#5ca8e5' },
      { label: 'Group activity', token: '--tasks-action-groupactivity', hex: '#6c68d5' },
    ],
  },
  {
    category: 'Schedule Card Indicators',
    swatches: [
      { label: 'Complete', token: '--schedule-cards-assets-indicator-colour-complete', hex: '#b7dda8' },
      { label: 'Missed', token: '--schedule-cards-assets-indicator-colour-missed', hex: '#e31c4a' },
      { label: 'Cancelled', token: '--schedule-cards-assets-indicator-colour-cancelled', hex: '#a6a6a6' },
    ],
  },
  {
    category: 'Buttons',
    swatches: [
      { label: 'Primary default', token: '--buttons-lozenge-1-primary-1-default', hex: '#9a26d6' },
      { label: 'Tertiary default', token: '--buttons-lozenge-3-tertiary-1-default', hex: '#edecf1' },
      { label: 'Tertiary disabled', token: '--buttons-lozenge-3-tertiary-4-disabled', hex: '#f5f5f5' },
      { label: 'Tertiary label active', token: '--buttons-label-3-tertiary-3-active-or-down', hex: '#4d4d4d' },
    ],
  },
  {
    category: 'Form Inputs',
    swatches: [
      { label: 'Active', token: '--form-input-active', hex: '#000000' },
      { label: 'Filled', token: '--form-input-filled', hex: '#333333' },
      { label: 'Inactive', token: '--form-input-inactive', hex: '#737373' },
    ],
  },
  {
    category: 'Bodymap',
    swatches: [
      { label: 'Zone empty', token: '--bodymap-1-bodymap-zone-empty', hex: '#bfdfff' },
      { label: 'Zone pressed', token: '--bodymap-3-bodymap-zone-pressed', hex: '#246bb3' },
    ],
  },
]

export const STROKE_SWATCHES = FILL_SWATCH_GROUPS.flatMap(g => g.swatches).filter(s => s.hex !== null)

// A separate, smaller, curated list for *text* colour specifically (used
// only by the font panel) — the full FILL_SWATCH_GROUPS above is meant for
// background tints (many of them light/low-contrast), which make poor
// choices for text itself. These favor readable, higher-contrast values.
export const TEXT_COLOR_SWATCHES = [
  { label: 'Grey 20 (default)', token: '--greyscale-2-grey-20', hex: '#333333' },
  { label: 'Black', token: '--greyscale-01-black', hex: '#000000' },
  { label: 'White', token: '--greyscale-16-white', hex: '#ffffff' },
  { label: 'Brand purple', token: '--brand-purple-6-purple-4', hex: '#9a26d6' },
  // No repo token maps cleanly to a dark, text-legible red (the design
  // system's own red tokens are pastel/light, meant for warning-banner
  // backgrounds, not text) — hex-only, no live var() link for this one.
  { label: 'Red', token: null, hex: '#c0392b' },
  { label: 'Green', token: '--rag-green-green-5', hex: '#21a621' },
  { label: 'Amber', token: '--rag-amber-amber-7', hex: '#f0a205' },
]
