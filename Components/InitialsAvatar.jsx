// Round avatar showing a person's initials on one of the live app's seven
// pastel colours (--avatar-* in Styles/colors.css). The colour comes from a
// hash of the name, so the same person always gets the same colour.
// Styles: Styles/initials-avatar.css. size defaults to 24px.
export const AVATAR_COLOURS = [
  'var(--avatar-1-teal)', 'var(--avatar-2-blue)', 'var(--avatar-3-green)', 'var(--avatar-4-taupe)',
  'var(--avatar-5-rose)', 'var(--avatar-6-lilac)', 'var(--avatar-7-gold)',
]

export function initialsOf(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return ''
  const first = parts[0][0]
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

export function avatarColourFor(name) {
  let h = 0
  for (const ch of name || '') h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return AVATAR_COLOURS[h % AVATAR_COLOURS.length]
}

export default function InitialsAvatar({ name, size = 24 }) {
  return (
    <span
      className="initials-avatar"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42), background: avatarColourFor(name) }}
      aria-hidden="true"
    >
      {initialsOf(name)}
    </span>
  )
}
