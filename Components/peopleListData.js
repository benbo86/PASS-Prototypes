// Helpers shared by the Customers and Employees list fixtures (customers/list,
// employees/list): area-tag colours, tag builders, avatar colours and initials.

// Area tags carry their own colour.
export const REGION = {
  teal: { bg: '#e0f1f4', fg: '#004753', border: '#a6d6de' },
  blue: { bg: '#e5ecfd', fg: '#13337a', border: '#b3c8f8' },
  pink: { bg: '#fbe4e9', fg: '#750f25', border: '#f5b0bf' },
  green: { bg: '#e3f4e1', fg: '#1f5a1a', border: '#b5dcb0' },
  amber: { bg: '#fdf0d5', fg: '#6b4400', border: '#f1d18f' },
  violet: { bg: '#eee8fb', fg: '#3d2380', border: '#cbbdf0' },
}
// A colour-coded area tag (shown with a map pin)
export const region = (label, color) => ({ type: 'region', label, ...REGION[color] })
// A custom attribute tag ("Territory: Hampshire")
export const attr = (key, value) => ({ type: 'attr', key, value })

export const AVATAR = ['#c9b4de', '#b7dda8', '#b1c8de', '#f0c9a8', '#a8d8d4', '#e8b4c4']

// "Mrs Mary McCarthy" -> "MM"
export const initialsOf = (fullName) =>
  fullName.replace(/^(Mr|Mrs|Ms|Miss|Master|Dr) /, '').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
