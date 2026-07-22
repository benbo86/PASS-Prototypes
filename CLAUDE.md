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
| `Components/DevMode.jsx` | Dev Mode element inspector — wire into every new prototype, see Prototype conventions below |
| `Components/devModeUtils.js` | Pure geometry/colour/export helpers backing Dev Mode |
| `Styles/dev-mode.css` | Dev Mode's own dark-themed UI (toggle, panel, help modal) — self-contained, not part of the main design system |
| `Components/DevComments.jsx` | Dev Comments — Firestore-backed pin comments, wire into every new prototype alongside Dev Mode, see Prototype conventions below |
| `Components/firebase.js` | Shared Firebase app/Firestore init (one project backs Dev Comments repo-wide) — see Firebase section below |
| `Components/devToolbarBus.js` | Tiny `window` event pub/sub making Dev Mode and Dev Comments mutually exclusive — see Firebase section below |
| `Components/indexBadges.js` | Plain JS (not React) — notification pills on root `index.html`, loaded via `<script type="module">` — see Firebase section below |
| `Styles/dev-comments.css` | Dev Comments' own UI (toggle, pins, composer, thread panel) — amber accent, distinct from Dev Mode's palette |

**Always read `Styles/main.css` before adding local CSS.**

**Any new icon fetched from Figma must be saved to `Icons/` as an `.svg` file** before (or alongside) being used as an inline JSX component. Use the same viewBox as the Figma source. The inline JSX component uses `fill="currentColor"` for theming; the `.svg` file uses `fill="#000000"` as the static reference. If the style exists there, use the shared class. Only write prototype-specific CSS for genuinely local things (layout, one-off colours, prototype-specific structure).

---

## Prototype conventions (required on every new prototype)

1. **Back link** — add at the top of the main component:
   ```jsx
   <a href="../../" className="back-link"><ChevronLeftIcon /> Prototypes</a>
   ```
   `.back-link` is defined in `main.css` (fixed, bottom 24px, left 24px, purple).

2. **Index entry** — add a link under the correct heading in the root `index.html`.

3. **Scrim / overlay context** — if the prototype opens over a background (e.g. a panel with a scrim), the back link needs `z-index` above the overlay so it remains clickable and visible. Set its colour to white when it sits over a dark scrim.

4. **Dev Mode** — wire the element inspector into every new prototype (mobile or web). Fully rolled out across every existing prototype (all `mobile/*`, plus every web prototype under `customer-profile/`, `office/`, `roster/`, `web/`, `employee-contract/`, `gross-pay-advice/`, `timesheets/`, `schedule/`, `holiday-absences/`) — this is the reference pattern for any new one:
   ```jsx
   import { useRef } from 'react'
   import DevMode from '../../../Components/DevMode'

   const pageRef = useRef(null)
   // attach pageRef to the prototype's outermost real-content frame —
   // .phone-frame for mobile prototypes, or the prototype's own top-level
   // wrapper div for web prototypes (e.g. the `.page`/`.he-page`/etc. div
   // that already wraps the back-link). A narrower ref makes anything
   // outside it (e.g. a bottom nav bar) uninspectable.
   <DevMode containerRef={pageRef} />
   ```
   Also add `import '../../../Styles/dev-mode.css'` to the prototype's `main.jsx`, alongside its other style imports. `DevMode` is safe to render either as a sibling of the ref'd frame OR nested inside it (most web prototypes nest it, since there's usually no separate shell to hang it outside of) — its own toggle/help/panel chrome is auto-exempted from being treated as an inspectable target either way.

   If the prototype has no single wrapping element (a fragment `<>...</>` root, common in small modal-style prototypes), wrap it in `<div ref={pageRef} style={{ display: 'contents' }}>...</div>` instead — `display: contents` keeps it invisible to layout, it just gives Dev Mode a real node to scope to.

   If the prototype goes through a shared wrapper component (like `Components/PhoneFrame.jsx`) rather than raw markup, that wrapper needs to forward its own ref via `forwardRef` onto its outermost element so a `containerRef` can reach it.

   **Portaled popups (react-datepicker, FilterDropdown, react-select):** these render outside `containerRef` (via `document.body`) and aren't inspectable there, but must stay fully usable while Dev Mode is active:
   - `react-datepicker`'s own trigger wrapper (`.react-datepicker-wrapper`, added automatically by the library regardless of `portalId`) and its popup (`.react-datepicker-popper`) are auto-exempted — no action needed.
   - `Components/FilterDropdown`'s portaled menu (`.fd-wrap`) is auto-exempted, but its **trigger button is prototype-specific** (each prototype renders its own filter-icon button) — add `data-devmode-passthrough="true"` to that trigger button, or Dev Mode will swallow the click meant to open it. See `gross-pay-advice/holiday-deduction` or `timesheets/filters` for the pattern.
   - `react-select` isn't used by any prototype yet — if one adds it, its portaled menu will need the same treatment (check its rendered class name and add it alongside `.react-datepicker-popper, .fd-wrap` in `Components/DevMode.jsx`'s `isInScope`/`isExemptFromCapture` checks).

5. **Dev Comments** — wire the Firestore-backed pin-comment feature into every new prototype alongside Dev Mode. Reuses the exact same ref Dev Mode uses — no second ref needed:
   ```jsx
   import DevComments from '../../../Components/DevComments'
   // ...
   <DevMode containerRef={pageRef} />
   <DevComments containerRef={pageRef} prototypeId={window.location.pathname} />
   ```
   Also add `import '../../../Styles/dev-comments.css'` to `main.jsx`. See the Firebase section below for the backing project and security-rules status.

   If the prototype has a fragment root wrapped in `<div ref={pageRef} style={{ display: 'contents' }}>` (see Dev Mode's own convention above for when this applies), note that `display: contents` elements always report an all-zero `getBoundingClientRect()` — `DevComments` already handles this generically (falls back to viewport-relative positioning when the container has no real box), so no per-prototype action is needed, just be aware pins on these particular prototypes are positioned relative to the viewport rather than a container box.

   **Multi-view prototypes** (a list view and a detail view reached via a different URL/query-param, e.g. `gross-pay-advice/holiday-deduction`, `timesheets/filters`) need Dev Mode *and* Dev Comments wired into **each** view's own component separately — an early `return <OtherComponent />` before the main JSX means the outer wiring never runs for that view. This bit Dev Mode itself once already (see the Dev Mode memory/history) — check for early-return view switching before assuming one wiring pass covers a whole prototype.

---

## Icons

- **Default size: 24×24px** for all SVG icons unless explicitly stated otherwise.
- Exceptions: ellipsis circle icon (32×32), footer warning icon (40×40 if using the large amber variant).
- Use `fill="currentColor"` so icons inherit colour from CSS.
- Icons inside clickable areas (e.g. edit icon next to text) should be wrapped in a `<button>` with `.ep-icon-btn` or similar — not a bare `<span>`.
- **Back buttons in headers** — always use `Arrow Left.svg` from `Icons/` at 24×24px with no accompanying text label:
  ```jsx
  <button className="app-header-back" onClick={onBack}>
    <ArrowLeftIcon />
  </button>
  ```

---

## Figma auto layout

Use auto layout for any group of vertically or horizontally stacked items — don't use absolute x/y positioning for children that have a structural relationship.

- Vertical stacks (list rows, label+value pairs, form fields): `VERTICAL` auto layout
- Horizontal stacks (icon+label, badge content, side-by-side stats): `HORIZONTAL` auto layout
- `itemSpacing` and padding values follow the 8px spacing grid
- Children that should stretch to fill width: `layoutSizingHorizontal = 'FILL'`
- Containers that should hug content: `layoutSizingHorizontal/Vertical = 'HUG'`

Review existing designs when updating — convert absolute-positioned stacks to auto layout proactively.

---

## Figma constraints (responsiveness)

Always set constraints on nodes when creating or updating Figma designs, so frames can be resized to simulate different screen widths (smaller phone, wider phone, tablet).

| Element | Horizontal | Vertical |
|---|---|---|
| Full-width bars (header, nav, cards, dividers) | Left & Right | Top or Bottom |
| Scroll/body area | Left & Right | Top & Bottom |
| Left-pinned content (name, datetime, badge) | Left | Top |
| Right-pinned content (pay, miles, icons) | Right | Top |
| Centered content (header title) | Center | Top |
| Bottom nav | Left & Right | Bottom |
| Status bar | Left & Right | Top |

Set constraints at the same time as position/size — not as an afterthought.

---

## Spacing

Use multiples of **8px** for all spacing — padding, gap, margin, position offsets — in both CSS prototypes and Figma designs.

Common values: `4 8 12 16 24 32 40 48px`

**Exceptions:** 4px and 12px are fine (4px sub-grid). Avoid arbitrary values like 5, 6, 10, 14, 18px unless driven by a specific typographic need (e.g. line-height).

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

Use `.warning-banner.orange` for amber warnings, `.warning-banner.red` for red/error warnings, `.warning-banner.green` for success/confirmation states.

Standard structure:
```jsx
<div className="warning-banner orange">
  <WarningIcon />   {/* uses .warning-icon class — amber colour auto-applied */}
  <div>
    <h4>Warnings</h4>
    <p>Body text for a single message.</p>
    {/* or use <ul><li> for multiple messages */}
  </div>
</div>
```

- `h4` inside `.warning-banner` is pre-styled in `main.css` (16px, 600 weight, dark amber `#7b3306`, margin 0)
- `p` and `li` inside `.warning-banner.orange` are pre-styled in `main.css` (`var(--greyscale-2-grey-20)` / `#333`, 15px, 1.5 line-height)
- The `WarningIcon` SVG should have `className="warning-icon"` — `main.css` colours it `var(--rag-amber-amber-7)`
- Use `<p>` for a single message, `<ul><li>` for multiple

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

---

## Firebase (Dev Comments)

**Project:** `pass-prototypes` (Firestore, free Spark plan — chosen over Supabase specifically because Supabase's free tier pauses projects after ~1 week of inactivity, which would break comments between review cycles for an internal tool like this).

**Config:** lives in `Components/firebase.js`, one project shared repo-wide across every prototype. The config values (`apiKey` etc.) are meant to be public in client code — Firebase enforces access via Firestore security rules, not by hiding them.

**Collection:** `devmode_comments`. One doc per comment thread:
```
{
  prototypeId: string,      // window.location.pathname — scopes comments to one prototype/view
  xPercent, yPercent: number,  // pin position, relative to containerRef's box (or viewport if containerRef has no box — see Dev Mode conventions above)
  authorName: string,       // required — no anonymous comments/replies, enforced client-side (submit is disabled until both name and text are filled)
  text: string,              // the original comment — editable by whoever's current authorName matches (client-side check only, not real auth)
  edited: boolean,          // set once text has been edited; shown as "(edited)" next to the timestamp
  replies: [{ authorName, text, createdAt, edited }],  // array field, not a subcollection — simpler for this small a scale; each reply is independently editable the same way as the root comment
  resolved: boolean,
  createdAt: Firestore serverTimestamp(),
}
```
(No `elementLabel` field — it captured a short tag+class snippet of whatever was clicked, but showed raw markup in the UI with little real value, so both the capture and the display were removed.)

**Identity:** no real auth, but a name IS required — first comment/reply prompts for one, remembered in `localStorage` (`devcomments-author-name`) and reused. Anyone can still type any name (not a real security boundary), the requirement is just to stop comments being left with no attribution at all.

**Delete is a real, user-facing action** (bin icon in the thread panel header, with a `window.confirm()` guard) — removes the whole comment doc, replies included. This changes the security-rules shape needed once test mode expires (see below): rules must allow `delete`, not just `create`/`update`.

**⚠️ Security rules status:** created in **test mode** (open read/write, no auth check) on 2026-07-22 — this expires automatically after 30 days (~2026-08-21). Before then, tighten the rules in the Firebase console (Firestore → Rules) to something like: allow `create` only with the required fields present and correctly typed (including non-empty `authorName`), allow `update` only to append to `replies` or toggle `resolved` (not rewrite `text`/`authorName` on the original), allow `delete` (the UI now depends on this). If comments suddenly stop working after that date, this is why — check the Rules tab first.

**Pins are visible whenever Dev Mode isn't active**, regardless of whether comment mode itself is on — anyone browsing a prototype normally should be able to see existing feedback without turning anything on. `active` (the comment-mode toggle) only gates the "click anywhere to drop a new pin" interception; viewing a thread, replying, resolving, editing, and deleting all work regardless of whether comment mode is on. Pins hide entirely while Dev Mode is active (see the mutual-exclusivity/state-sharing entry below) so they don't clutter element inspection. Each pin shows its own reply-count badge (red circle, top-right of the pin) when it has replies — there's no aggregate "unresolved count" badge on the toggle itself anymore, since with pins always visible that count is redundant (just look at the pins).

**Hovering a pin reveals its first message as a visual extension of the pin** — not a separate floating tooltip. A flex wrapper (`.devcomments-pin-wrap`) holds the round pin button and, on hover, a dark bubble tucked behind it (negative margin, rounded only on the far side) showing the author and the original comment text (truncated to one line). Clicking anywhere in that preview bubble opens the same thread panel as clicking the pin itself — same `onClick` handler passed to both.

**Toolbar conventions (Dev Mode + Dev Comments together):** the two toggles sit as one visual toolbar, top-right — Dev Mode's toggle (round, icon-only, a `</>` code glyph) at `right: 76px`, Dev Comments' toggle (round, comment-bubble icon) immediately to its right at `right: 24px`, both `top: 20px`, both sharing the same active-state purple (`--brand-purple-6-purple-4`). Dev Comments' *toggle and panel chrome* (composer/panel buttons, focus borders) use this same purple for toolbar consistency, but **the pin itself and its matching comment-mode cursor stay amber/orange** — deliberately reverted after briefly trying purple everywhere, since a comment pin visually reading as distinct from a Dev Mode selection earns its keep (green is kept for "resolved" either way — a status colour, not decorative). Dev Mode's help entry point moved from a small "?" button next to the toggle to a bottom-right status pill reading "Using dev mode" — only rendered while Dev Mode is active, so it doubles as an on/off confirmation (the toggle itself lost its text label to become a plain icon) and the click target for the help modal.

**The comment-mode cursor needs an explicit reset for the toolbar's own buttons.** `.devcomments-cursor-active` is applied to `containerRef`'s own subtree, and many web prototypes render `<DevComments>` (so its toggle) *nested inside* that same element rather than as an outside sibling — meaning the toggle can be a genuine descendant of the cursor-active container, not just the always-portaled pins/composer/panel. Without a higher-specificity reset rule scoped to `[data-devcomments-ui]`/`[data-devmode-ui]` and their descendants, the custom pin cursor leaks onto the toggle buttons themselves. Caught by explicitly checking `toggle.closest('.devcomments-cursor-active')` on a web prototype — it returned true, which the original comment above this rule assumed could never happen.

**Comments and replies are editable** by whoever's currently-typed `authorName` matches the message's own `authorName` (an edit pencil icon appears only then) — same non-authoritative identity model as the rest of this feature, not real per-user security. Edited messages get `edited: true` and show "(edited)" next to their timestamp, matching the convention already used in `mobile/messaging`'s chat feature.

**Notification pill on the prototype index (`index.html`).** `Components/indexBadges.js` (a plain `<script type="module">`, not a React component — Vite processes root `index.html` as its own entry the same way it does every prototype's `main.jsx`, so bare imports like `firebase/firestore` resolve normally) subscribes to the *entire* `devmode_comments` collection, groups it by `prototypeId`, and shows a small amber pill — **just the comment-bubble icon and a number, no "N new comments" text** — next to any `.proto-link` whose resolved pathname (`new URL(href, location.href).pathname` — strips query strings, so a bare and a `?employee=...` link to the same folder share one pathname/badge) has activity newer than that prototype's `localStorage` last-seen entry (shared key, `devcomments-last-seen`, written by `DevComments.jsx` itself). Visiting a prototype's page is what counts as "read" — pins are always visible now, so landing on the page is treated as having had the chance to notice them (same logic as a Slack channel's unread count clearing on open, not requiring every message individually acknowledged).

Getting "seen" right took one real fix: the natural approach — call `Date.now()` right after the Firestore write resolves — races `serverTimestamp()`'s actual server-resolved value, which can land *after* that client-side timestamp (network latency), wrongly leaving the author's own fresh comment flagged as unread moments later. Fixed by marking "seen" using the latest timestamp actually present in the live-subscribed `comments` data (an effect keyed on `comments` itself) rather than wall-clock time — it naturally re-fires with the correct server-resolved timestamp once the write's snapshot comes back, no separate call needed after `submitComment`/`submitReply`.

**Dev Mode and Dev Comments are mutually exclusive, and each tracks the other's live on/off state** — activating one deactivates the other, *and* Dev Comments hides its pins for as long as Dev Mode stays active (not just at the moment it turns on). Coordinated via `Components/devToolbarBus.js`, a tiny `window` `CustomEvent` pub/sub (`announceState(feature, isActive)` / `subscribeToState(callback)`) rather than lifted React state, since the two toggles are independent components with no shared parent across 18 prototype files. `announceState` carries the boolean on *every* transition (not just "just turned on"), which is what lets Dev Comments track "is Dev Mode currently active" continuously via its own `devModeActive` state, gating pin rendering (`{!devModeActive && comments.map(...)}`), separately from the one-shot mutual-exclusivity reaction. Any future toolbar feature needs to both announce its own state on every change and subscribe to react to others'.

**`announceState` must be called from an effect, never from inside a `setState` updater function.** The first version called it directly inside `setIsActive(active => { ...; announceState(...); return next })` — since the event dispatch is synchronous and a listener elsewhere calls a *different* component's `setState`, this triggered React's "Cannot update a component while rendering a different component" warning (updater functions must stay pure; side effects, including dispatching events that cascade into other components' state, belong in a `useEffect` keyed on the state itself, run after the commit).

**Cross-component UI exemption is required in both directions.** Each feature's capture-phase click interception must skip the *other* feature's chrome (`[data-devmode-ui]` / `[data-devcomments-ui]`), not just its own — otherwise activating one first causes its "outside recognized scope" guard to swallow clicks on the other's toggle button entirely (discovered when testing both active at once: the Dev Comments toggle sits outside `containerRef`, so Dev Mode's own guard treated it as ordinary outside-page chrome and blocked it, silently preventing Dev Comments from ever turning on — before mutual exclusivity made this scenario impossible via the UI, but the exemption is still needed for the one frame where both listeners are attached). Any future toolbar addition needs the same two-way exemption wired into both/all existing features, not just its own.

**`box-sizing: border-box` must be explicit on any Dev Mode/Dev Comments input or button using `width: 100%`/`flex: 1` plus padding or a border.** There is no repo-wide `box-sizing: border-box` reset available to prototypes' own React DOM (only `index.html`'s own page-local inline `<style>` has one, which doesn't apply beyond that page). Without it, the browser's default `content-box` model renders the element wider than its allotted space by exactly its padding+border, overflowing the parent panel. Fixed on `.devcomments-name-input`/`.devcomments-text-input` (`dev-comments.css`) and proactively on `.devmode-select`/`.devmode-export-btn` (`dev-mode.css`, same latent defect, same author) — any new form control added to either panel needs the same explicit declaration, since neither stylesheet can lean on an inherited default.

**Comments are scoped strictly to the specific screen/view they were added on — never shared across pages or views, even within what feels like "one prototype."** An earlier version of this tried grouping the mobile app's separate AppNav-tab folders (`mobile/notifications/`, `mobile/account/`, `mobile/messaging/`, `mobile/mileage-pay/`) under one shared `prototypeId` so a comment would follow you between tabs — Ben corrected this: each screen should only show the comments actually left on it, full stop. That grouping helper (`Components/prototypeGroups.js`) was removed; each prototype's `prototypeId` is plain `window.location.pathname` again (mobile tabs are already genuinely different pathnames, so no extra work was needed there once the grouping was reverted).

**Multi-view prototypes reached via a query string need `pathname + search`, not `pathname` alone, or level 1 and level 2 share one `prototypeId`.** Timesheets (`timesheets/filters/`) and Gross Pay Advice (`gross-pay-advice/holiday-deduction/`) both track their level-1-list vs level-2-detail view via `history.pushState(null, '', '?employee=...')` on drill-in and `history.pushState(null, '', pathname)` (search cleared) on back — same pathname throughout, so a bare-pathname `prototypeId` (the original approach) caused comments left on one level to also show on the other. Both of these prototypes' `DevComments` calls now use `prototypeId={window.location.pathname + window.location.search}` instead. `Components/indexBadges.js`'s `pathnameForHref` does the same (`url.pathname + url.search`) so direct-detail index links (e.g. "Holiday Deduction" → `?employee=stephen-nicholls`) still match up with the right comments. This is safe to apply everywhere (not just these two) since a link/page with no query string just gets an empty `search`, unchanged from before.

**Known limitation, not yet addressed:** internal screen transitions that use component state only (no URL change) — e.g. `mobile/notifications`'/`mobile/messaging`'s `ScreenSlider`-based list→detail transitions — still share one `prototypeId` per visit-count-as-one-page, since there's no URL signal to key off. Not yet reported as an issue; would need each such prototype to start reflecting its current internal screen in the URL (query string or hash) before it could be scoped the same way Timesheets/GPA now are.

**Delete is restricted to the comment's original author** (same non-authoritative, typed-name identity model as editing) — the bin icon in the thread panel header only renders when the currently-typed `authorName` matches `comment.authorName` (`canDelete` in `ThreadPanel`), same check shape as `EditableMessage`'s `canEdit`. Resolve stays unrestricted (anyone can mark resolved/reopen) — only delete is creator-gated, since it's destructive and irreversible.
