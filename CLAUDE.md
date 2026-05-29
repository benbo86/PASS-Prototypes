# PASS Prototypes — Claude Reference

Prototype UI components for the PASS product (Everylife Technologies). Used for design exploration and stakeholder demos.

---

## Stack

- **Vite + React 18** — one `node_modules` at the root, shared across all prototypes
- **CSS variables** from Zeplin export (`Styles/colors.css`)
- `react-select` v5, `react-datepicker` v7
- Run `npm run dev` from root → `localhost:5173/PASS-Prototypes/`

---

## Folder & URL structure

Prototypes live at `/location/prototype-name/`. Vite auto-discovers any two-level subfolder containing an `index.html`.

```
schedule/
  assign-visit-absent-employee/
  assign-visit-absent-employee-event-panel/
holiday-absences/
  assign-visits-on-holiday/
timesheets/
  filters/
employee-contract/
  holiday-pay-deduction/
```

**When creating a new prototype:**
- Place it under the correct location folder (schedule, holiday-absences, timesheets, employee-contract, etc.)
- Add a link under the right heading in the root `index.html`
- Styles import path: `../../../Styles/colors.css` and `../../../Styles/main.css`
- Back-link href: `../../` (two levels up to the prototype index)

---

## Shared assets

| Path | Contents |
|---|---|
| `Styles/colors.css` | All CSS custom properties (colour tokens) |
| `Styles/main.css` | All shared component styles — check here before writing local CSS |
| `Styles/modal.css` | Modal overlay styles |
| `Styles/filter-dropdown.css` | `fd-*` styles for FilterDropdown component |
| `Styles/date-range-picker.css` | `.cal-trigger`, `.date-range-text` |
| `Components/FilterDropdown.jsx` | Column/above-table filter dropdown |
| `Components/DateRangePicker.jsx` | Exports `CalendarIcon`, `fmtDate`, `DateRangeInput` |
| `Icons/` | Shared SVGs: Calendar, Chevron Down, Clock, Close, Delete, Document, Edit, Filter Active, Filters, Recurs, Right Arrow, Search, Sort, Warning |

**Always read `Styles/main.css` before adding local CSS.**

**Any new icon fetched from Figma must be saved to `Icons/` as an `.svg` file** before (or alongside) being used as an inline JSX component. Use the same viewBox as the Figma source. The inline JSX component uses `fill="currentColor"` for theming; the `.svg` file uses `fill="#000000"` as the static reference. If the style exists there, use the shared class. Only write prototype-specific CSS for genuinely local things (layout, one-off colours, prototype-specific structure).

---

## Prototype conventions (required on every new prototype)

1. **Back link** — add at the top of the main component:
   ```jsx
   <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>
   ```
   `.back-link` is defined in `main.css` (fixed, top 20px, left 24px, purple).

2. **Index entry** — add a link under the correct heading in the root `index.html`.

3. **Scrim / overlay context** — if the prototype opens over a background (e.g. a panel with a scrim), the back link needs `z-index` above the overlay so it remains clickable and visible. Set its colour to white when it sits over a dark scrim.

---

## Icons

- **Default size: 24×24px** for all SVG icons unless explicitly stated otherwise.
- Exceptions: ellipsis circle icon (32×32), footer warning icon (40×40 if using the large amber variant).
- Use `fill="currentColor"` so icons inherit colour from CSS.
- Icons inside clickable areas (e.g. edit icon next to text) should be wrapped in a `<button>` with `.ep-icon-btn` or similar — not a bare `<span>`.

---

## Buttons (`main.css`)

| Class | Usage |
|---|---|
| `.round-btn.primary-btn` | Purple filled — primary action |
| `.round-btn.secondary-btn` | Purple outlined — secondary action |
| `.round-btn.tertiary-btn` | Grey filled — cancel/dismiss |
| `.btn-icon-left` | Add to any `.round-btn` with a left icon — overrides padding-left to 16px |
| `.btn-icon-right` | Same for right icon |

**Disabled states:**
- Primary disabled: background `var(--ui-purple-7-lightest-lavendar)`, text `var(--greyscale-11-grey-80)`
- Secondary disabled: border `var(--greyscale-13-grey-90)`, text `var(--greyscale-12-grey-85)`
- Use the HTML `disabled` attribute — `main.css` has `.secondary-btn:disabled` defined.

---

## Warning banners (`main.css`)

Use `.warning-banner.orange` for amber warnings, `.warning-banner.red` for red/error warnings.

Standard structure:
```jsx
<div className="warning-banner orange">
  <WarningIcon />   {/* uses .warning-icon class — amber colour auto-applied */}
  <div>
    <h4>Warnings</h4>
    <ul>
      <li>The specific warning message</li>
    </ul>
  </div>
</div>
```

- `h4` inside `.warning-banner` is pre-styled in `main.css` (16px, 600 weight, dark amber `#7b3306`)
- The `WarningIcon` SVG should have `className="warning-icon"` — `main.css` colours it `var(--rag-amber-amber-7)`

---

## Colour tokens (key ones)

| Token | Value | Used for |
|---|---|---|
| `--brand-purple-6-purple-4` | `#9a26d6` | Primary buttons, active states |
| `--brand-purple-7-purple-5` | `#b02cf7` | Close button, active tab indicator (older patterns) |
| `--brand-purple-4-purple-2-tint` | `#b173c7` | Active tab underline |
| `--ui-purple-3-grape-grey` | `#968caf` | Inactive icons, edit icons, booked badge stripe |
| `--ui-purple-5-languid-lavendar` | `#dcd9e4` | Borders, dividers, dashed outlines |
| `--ui-purple-6-lavendar-grey` | `#edecf1` | Table headers, placeholder backgrounds |
| `--ui-purple-7-lightest-lavendar` | `#f5f5f6` | Panel body background, search bar background |
| `--web-skrim` | `rgba(60,57,72,0.7)` | Background scrim behind panels/modals |
| `--rag-amber-amber-7` | `#f0a205` | Warning icon colour, warning banner border |
| `--rag-amber-amber-lightest` | `#f7f4ed` | Warning banner background |

---

## Event panel patterns (schedule/assign-visit-absent-employee-event-panel)

Rules established while building this prototype:

**Header:**
- Title: 28px / 500 weight
- Booked badge stripe colour: `var(--ui-purple-3-grape-grey)` (#968CAF) — NOT brand purple
- Customer label sits directly above the customer name as a stacked group in the info row (not a separate row above)
- Info row items: `gap: 32px`, no separators between items
- Edit icons in the info row are `<button className="ep-icon-btn">` — not bare spans
- Tab underline: `var(--brand-purple-4-purple-2-tint)`, runs 24px left and right of the tab label (achieved by giving each tab `padding: 14px 24px` and `::after { left: 0; right: 0 }`)
- Tabs container: `justify-content: space-between`, `padding: 0 48px`

**Panel body:**
- Background: `var(--ui-purple-7-lightest-lavendar)`
- Padding: 48px
- Section titles: `<h1>` using main.css h1 styles (20px / 500 weight)

**Employee bars (88px tall):**
- Assigned / Assign bars: no border
- Unassigned bar: `2px dashed var(--ui-purple-5-languid-lavendar)`
- Travel/car icon colour: `var(--ui-purple-3-grape-grey)` (Grape Grey)
- Availability indicator: green fill (`var(--availability-3-green)`) on lavender tint background, 144px wide × 4px tall
- Initials avatars: use availability colour tints as backgrounds (green-tint, blue-tint, mauve-tint)

**Footer warning state:**
- Shows `<h6>Assignment warnings</h6>` then `.warning-banner.orange` (with `<h4>Warnings</h4>` and bullet list) above the actions row
- Warning content padding: `12px 24px`; bullet list `margin-top: 12px`
- In warning state: Cancel button moves from left to sit next to the primary action on the right (`justify-content: flex-end` on actions row)
- Primary action label: "Accept assignment" (not "Assign visit")

---

## Figma

**File:** PASS Web Components
**File key:** `jCC8CRGDHxjRo1aQZPQzNh`
**Team:** ELT UX (Pro)

Contains all components matching `Styles/main.css`: buttons, checkboxes, radios, inputs, filter pills, badges, status pills, table, pagination, warning banners, icons, event panel header/body/footer components.

When implementing from Figma:
- The generated code uses Tailwind — convert all classes to the project's CSS variable system
- Image asset URLs from Figma expire in ~7 days — prefer SVG inline implementations over `<img src={figmaUrl}>`
- Apply fills/strokes/cornerRadius BEFORE setting layoutMode when writing to Figma via `use_figma`
