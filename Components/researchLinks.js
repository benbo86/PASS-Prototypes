// Research pages linked to each prototype. DevToolbar shows a Research
// button on any prototype listed here, and the root index shows a matching
// "Research" badge on its row (added by hand in index.html). One page per
// feature, with a section per type of research (Customer discovery,
// Competitor research…); see research/holiday-requests/.
//
// Keys are the prototype's folder, relative to the site root
// ('location/prototype-name/'). Hrefs are relative to the site root too.
// To link research to a new prototype, add the page under research/ and an
// entry here — no per-prototype wiring needed.
export const RESEARCH_LINKS = {
  'web/messaging/': [
    { title: 'Messaging discovery — requirement coverage', href: 'research/messaging-coverage/' },
  ],
  'mobile/holidays/': [
    { title: 'Holiday requests research', href: 'research/holiday-requests/' },
  ],
  'schedule/leave-requests/': [
    { title: 'Holiday requests research', href: 'research/holiday-requests/' },
  ],
}

// The current page's folder, e.g. 'mobile/holidays/'. Strips Vite's base
// ('/PASS-Prototypes/') and anything after the two-level folder.
export function currentPrototypeKey() {
  const base = import.meta.env.BASE_URL || '/'
  let path = window.location.pathname
  if (path.startsWith(base)) path = path.slice(base.length)
  const parts = path.split('/').filter(Boolean)
  return parts.length >= 2 ? `${parts[0]}/${parts[1]}/` : ''
}

export function researchForCurrentPage() {
  return RESEARCH_LINKS[currentPrototypeKey()] || []
}

// Absolute href for a research link, so it works from any prototype depth.
export function researchHref(link) {
  return (import.meta.env.BASE_URL || '/') + link.href
}
