// Icons shared by the Tasks list and task detail views.

// Icons/Print.svg — header Print buttons (task list + care plan document).
export const PrintIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 8h-1V3H6v5H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zM8 5h8v3H8V5zm8 14H8v-4h8v4zm2-4v-2H6v2H4v-4c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v4h-2z" />
    <circle cx="18" cy="11.5" r="1" />
  </svg>
)

export const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,2 C17.52,2 22,6.48 22,12 C22,17.52 17.52,22 12,22 C6.48,22 2,17.52 2,12 C2,6.48 6.48,2 12,2 Z M10.6662105,9.93690394 L10.581437,9.93690394 C10.1076337,9.93690394 9.72611507,10.3209137 9.72611507,10.7922258 C9.72611507,11.2660291 10.1101248,11.6475478 10.581437,11.6475478 L10.6662105,11.6475478 L10.6662105,16.6348056 L10.5826825,16.6348056 C10.1096134,16.6348056 9.72611507,17.0183039 9.72611507,17.491373 C9.72611507,17.9644422 10.1096134,18.3479405 10.5826825,18.3479405 L13.4173175,18.3479405 C13.8903866,18.3479405 14.2738849,17.9644422 14.2738849,17.491373 C14.2738849,17.0183039 13.8903866,16.6348056 13.4173175,16.6348056 L13.3387717,16.6348056 L13.3362805,10.936904 C13.3360752,10.3847645 12.8884201,9.93727594 12.3362806,9.93727594 L10.6662105,9.93690394 Z M11.8678197,5.65205952 C11.0006244,5.65205952 10.2992557,6.35342819 10.2992557,7.22062354 C10.2992557,8.08781889 11.0006244,8.78918756 11.8678197,8.78918756 C12.7350151,8.78918756 13.4363837,8.08781889 13.4363837,7.22062354 C13.4363837,6.35342819 12.7350151,5.65205952 11.8678197,5.65205952 Z" />
  </svg>
)

export const PlusIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
)

// Font Awesome fa-plus (Icons/FA Plus.svg) — 448x512 viewBox, so 17.5x20
// keeps its native proportions. Used in the task page's Task Type dropdown.
export const FaPlusIcon = () => (
  <svg width="17.5" height="20" viewBox="0 0 448 512" fill="currentColor">
    <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" />
  </svg>
)

// Icons/General Task.svg — copied verbatim (its own fill, from the live page).
export const GeneralTaskIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#894B00">
    <path d="M21.68,9.5l-8.81,8.43c-.13.13-.29.22-.45.28-.47.18-1.03.08-1.4-.31l-5.03-5.23c-.49-.51-.48-1.33.04-1.83l.36-.35c.51-.49,1.33-.48,1.83.04l3.79,3.95,8.34-7.98c-1.79-2.71-4.86-4.5-8.35-4.5C6.48,2,2,6.48,2,12s4.48,10,10,10,10-4.48,10-10c0-.87-.11-1.7-.32-2.5Z" fill="#894B00" />
  </svg>
)

// Medication tasks use a plus (matching the live product), every other
// task type the General Task icon.
export const TaskTypeIcon = ({ type, size = 20 }) =>
  type === 'Medication' ? <PlusIcon size={size} /> : <GeneralTaskIcon size={size} />
