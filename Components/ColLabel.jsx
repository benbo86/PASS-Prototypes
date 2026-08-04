// Two-word column headings drop their second word onto its own line, so a
// narrower (resized) column doesn't need to widen just to fit its own label.
// Labels with any other word count (1, or 3+) render unchanged — there's no
// single obviously-correct break point for those, so it's left to the
// column's own width to accommodate.
export default function ColLabel({ children }) {
  const parts = String(children).split(' ');
  return parts.length === 2 ? <span>{parts[0]}<br />{parts[1]}</span> : <span>{children}</span>;
}
