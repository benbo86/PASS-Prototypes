// Handover note icon — a speech bubble with lines. Chosen over the Figma
// solid "Icon=Message" (kept in the Mobile Icons library as
// Icons/Mobile Uploads/.../Message Filled.svg) so a handover doesn't read
// as an in-app message.
export const HandoverIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9l-4.4 3.5A1 1 0 0 1 3 20.7V5a2 2 0 0 1 1-2zm1 2v13.6L8.3 16H20V5H5zm3 3h8v2H8V8zm0 4h5v2H8v-2z" />
  </svg>
)

export const CheckIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
  </svg>
)

// Copied from Icons/Close.svg, scaled down for the inline Clear buttons.
export const CloseSmallIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <polygon points="18 7.2 16.8 6 12 10.8 7.2 6 6 7.2 10.8 12 6 16.8 7.2 18 12 13.2 16.8 18 18 16.8 13.2 12" fill="currentColor" stroke="currentColor" strokeLinejoin="round" />
  </svg>
)
