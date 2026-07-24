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
| `Components/DevEdit.jsx` | Dev Edit — live CSS rule editor, wire into every new prototype alongside Dev Mode/Dev Comments (always mounted, not dev-only — see Prototype conventions below) |
| `Components/authorIdentity.js` | Shared name-prompt storage (`getStoredAuthor`/`storeAuthor`) — used by both Dev Comments and Dev Edit, so a name is only ever asked for once per browser |
| `devEditPlugin.js` | Vite dev-server plugin backing Dev Edit — repo-root, not under `Components/` (it's Node-side server code, not a React component) — see Dev Edit section below |
| `Styles/dev-edit.css` | Dev Edit's own dark-themed UI (toggle, highlight boxes, edit panel) — blue accent, distinct from both Dev Mode and Dev Comments' palettes |
| `wireframePlugin.js` | Vite dev-server plugin backing the Wireframe tool (`tools/wireframe/`) — repo-root, not under `Components/`, same reasoning as `devEditPlugin.js` — see Wireframe tool section below |
| `Styles/wireframe-tool.css` | Wireframe tool's own UI (toolbar, canvas grid, resize handles, save gate) — self-contained, not part of the main design system |
| `Components/sharedAuthSession.js` | Session-expiry helpers (`getSignInAt`/`setSignInAt`/`clearSignInAt`/`isSessionExpired`) for the one shared Firebase Auth session — extracted from Dev Edit so the Wireframe tool's shared save enforces the same one-week timeout on the same underlying session — see Dev Edit and Wireframe tool sections below |

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

6. **Dev Edit** — wire the live style editor into every new prototype alongside Dev Mode/Dev Comments, same ref, same "wire every view separately" rule as Dev Comments above, and the **same `prototypeId` expression as the adjacent `DevComments` call** (plain pathname, or `pathname + search` for a multi-view prototype — must match exactly, or the shared/versioned overrides and the comments end up scoped differently for what's meant to be the same page):
   ```jsx
   import DevEdit from '../../../Components/DevEdit'
   // ...
   <DevMode containerRef={pageRef} />
   <DevComments containerRef={pageRef} prototypeId={window.location.pathname} />
   <DevEdit containerRef={pageRef} prototypeId={window.location.pathname} />
   ```
   Also add `import '../../../Styles/dev-edit.css'` to `main.jsx`. **Not** gated behind `import.meta.env.DEV` — always mounted, in every environment, because ordinary (unauthenticated, production) visitors need the always-on "apply whichever version is currently active" effect to run too. Only the `Apply to file` button inside the panel is dev-only (gated at the button itself, not the component) — see the Dev Edit section below for the full architecture.

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

**✅ Security rules status:** the shape below (covering `devmode_comments`, Dev Edit's two collections, and `wireframe_saves`) is published and confirmed enforcing. The `devedit_versions`/`devedit_active`/`devmode_comments` portion was confirmed as of 2026-07-22; `wireframe_saves` was published and confirmed on 2026-07-23 via a direct, no-UI Firestore check — unauthenticated read succeeded (open read), unauthenticated write rejected with `permission-denied`, no test doc persisted. Still outstanding: an *authenticated* create/update on `wireframe_saves` hasn't been exercised yet (needs the real shared password, which isn't stored anywhere in this repo/session).
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /devmode_comments/{id} {
      allow read: if true;
      allow create: if request.resource.data.authorName is string
                    && request.resource.data.authorName.size() > 0
                    && request.resource.data.text is string
                    && request.resource.data.prototypeId is string
                    && request.resource.data.resolved == false
                    && request.resource.data.replies == [];
      allow update: if request.resource.data.diff(resource.data).affectedKeys()
                       .hasOnly(['replies', 'resolved', 'text', 'edited']);
      allow delete: if true;
    }
    match /devedit_versions/{id} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if false;
      allow delete: if request.auth != null;
    }
    match /devedit_active/{id} {
      allow read: if true;
      allow create, update: if request.auth != null;
      allow delete: if false;
    }
    match /wireframe_saves/{id} {
      allow read: if true;
      allow create, update: if request.auth != null;
      allow delete: if false;
    }
  }
}
```
Re-verify afterward by attempting an **unauthenticated** write and confirming it's rejected — don't just confirm sign-in works, since test-mode rules allow authenticated writes too and wouldn't tell the two states apart.

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

---

## Dev Edit (live style editor)

Third member of the dev toolbar (`Components/DevEdit.jsx`, `right: 128px`, left of Dev Mode's own toggle) — select an element, edit the actual CSS rule(s) that apply to it, see every matching element update instantly. Two independent capabilities, both reachable from the same select-and-edit mechanic:
- **Apply to file** (dev-only, per-rule) — writes one rule's edit straight into its real source `.css` file.
- **Save as version** (requires the shared password) — bundles every edit made across a whole editing session into a named, Firestore-backed snapshot that becomes the prototype's *active* version, which every visitor's page then applies live — signed in or not, dev or production. This is the feature that makes edits visible to people other than whoever made them.

**Always mounted, in every environment.** Unlike the original (dev-only) build of this feature, every prototype now renders `<DevEdit containerRef={...} prototypeId={...} />` unconditionally (no `import.meta.env.DEV` gate on the component itself) — production visitors need the always-on "apply the active version" effect described below, and the design team needs the toggle to exist on the deployed site at all. Only the `Apply to file` *button* stays gated on `import.meta.env.DEV` (per rule-block, in `EditPanel`), since its backing endpoint only exists under `vite dev` anyway.

**Auth: one shared Firebase Auth account, not per-person credentials.** `Components/firebase.js` exports both `auth` (`getAuth(app)`) and `SHARED_EMAIL` — a fixed constant that must exactly match whatever account was created in the Firebase console — the design team never sees or types it, only the account's password. (`SHARED_EMAIL` originated in `DevEdit.jsx` but moved to `firebase.js` in the Wireframe tool's v7 round, once the Wireframe tool needed to gate its own shared save behind the exact same account — both features now import it from one place rather than risking two copies drifting apart.) Clicking the toggle while signed out shows a password prompt (`signInWithEmailAndPassword`); on success, if no name is stored yet, a name prompt follows next, reusing `Components/authorIdentity.js` (`getStoredAuthor`/`storeAuthor`, extracted from Dev Comments so the two features share one identity — a name is only ever asked for once per browser, whichever feature prompts for it first, and survives the session expiry below since it's a separate localStorage key Firebase's own sign-out never touches).

**Sessions expire after one week, enforced client-side (not something Firebase Auth does on its own).** Firebase Auth's SDK silently refreshes the underlying ID token forever — there's no built-in "sign out after N days" without a backend (Admin SDK token revocation, which this project deliberately doesn't have). `Components/sharedAuthSession.js` (extracted from `DevEdit.jsx` in the Wireframe tool's v7 round, so both features enforce the same timeout on the same underlying session — see Wireframe tool section below) tracks a plain `devedit-signin-at` localStorage timestamp (key name left unchanged by the extraction, so no one's already-active session was invalidated): set whenever `onAuthStateChanged` sees a signed-in user with no timestamp yet (covers both a brand-new sign-in and grandfathering in a pre-existing session from before this expiry existed, without forcing a surprise immediate sign-out), and checked both there (catches the common "reload after some days" case) and again in `toggleActive` right before entering edit mode (catches a tab left open continuously across the week boundary, since `onAuthStateChanged` only re-fires on actual auth-state transitions, not continuously). Expiry calls a real `signOut(auth)`, not just a UI hide — the same reasoning as the security rules above, a client-side-only "looks signed out" state wouldn't actually revoke anything.

**Data model — two Firestore collections, both queried by `prototypeId` field (not doc ID, since `prototypeId` is a pathname containing `/`, which Firestore IDs can't contain), same pattern as `devmode_comments`:**
- `devedit_versions` — one doc per saved version, content-immutable (`allow update: if false` — a version's own fields can never be edited after creation) but deletable by anyone signed in: `{ prototypeId, name, authorName, createdAt, overrides: [{selector, mediaText, declarations, filePath}] }`. The version history UI only ever offers Delete for a *non-active* version (`VersionRow`'s `!isActive` gate) — deleting the active one wouldn't break the live styling (`devedit_active` carries its own denormalized `overrides` copy, not a reference), but would remove the only record of what's currently showing, with no way back to it via history afterward. That's a UI-level safeguard only, not enforced by the security rules themselves.
- `devedit_active` — one doc per prototype, denormalized (carries its own copy of `overrides`, not just a reference) so applying it on page load is a single read: `{ prototypeId, versionId, versionName, overrides, updatedAt }`. "Revert to version X" just overwrites this doc's fields with X's — no new version doc gets created by reverting.

**Applying overrides live matches purely by selector text (+ enclosing `@media`), never by file path.** `findRulesForSelector`/`applyOverridesLive` in `DevEdit.jsx` walk `document.styleSheets` looking for a matching `selectorText`, then set `rule.style.cssText`. This is deliberate: Vite's `data-vite-dev-id` attribute (see below) simply doesn't exist in a production build — Vite bundles CSS into hashed files there, no per-rule source mapping at all — so `filePath` can only ever be used for the dev-only Apply-to-file path, never for the shared/versioned one. `filePath` is still stored on each override as metadata (useful context, and available if a future dev-convenience wants it), just not read by the live-apply code.

**Session-accumulated edits, requiring explicit confirmation per rule.** `sessionEdits` is a map keyed by `selector|mediaText` (`ruleKey`), not by DOM element or by "the currently open panel" — selecting a *different* element doesn't wipe out an already-*confirmed* edit on the previous one; it carries forward as part of the same ongoing session. Re-selecting an *already-tracked* element reuses its existing entry rather than re-initializing it. Each entry tracks **three** states, not two:
- `original` — the true pre-session baseline (from `/lookup` in dev, or the browser's own serialization in prod), set once and never changed except when Save-as-version resets it as a new checkpoint (see below).
- `committed` — the last value explicitly confirmed via **Apply**. Starts equal to `original`.
- `draft` — whatever's currently live in the textarea, possibly not yet confirmed at all.

Entries do **not** cache the live `CSSStyleRule` object itself (an earlier version did — see the stale-reference bug below) — every mutation re-resolves the current live rule fresh via `setLiveRuleText(selectorText, mediaText, cssText)`, which wraps `findRulesForSelector`.

**Apply and Cancel are per-rule-block, both close the whole panel, and revert to two deliberately different baselines.** **Apply** sets `committed = draft` (and, when running locally with a resolvable source file, also writes to the real file via the same dev-only endpoint as before — `import.meta.env.DEV && entry.filePath` gates that part specifically, not the button's visibility; on failure the panel stays open so the error is visible and the edit can be retried, rather than closing on top of a failed write). **Cancel** reverts that rule all the way back to its true `original` — a stronger action than just "stop editing for now," since it discards even an *already-confirmed* edit on that same rule, not just the latest unconfirmed keystrokes. Any *other* rule block still open in the same panel that hasn't been explicitly confirmed reverts to its own last-`committed` value either way (same as clicking away, Escape, or the panel's own × close button) — Apply/Cancel only ever make a stronger decision about the *one* rule block they're attached to.

Clicking away from the panel entirely (a different element, blank page, Escape, or the panel's own × close button), without using either button, is the *weaker* revert — `draft` back to `committed`, never all the way to `original` — since simply leaving without deciding shouldn't retroactively undo something already explicitly confirmed. Discarding the *entire* session (reverting even already-committed edits across every rule, all the way to `original`) stays a separate, explicit action in the session bar.

**Real bug: caching a live `CSSStyleRule` reference (in both `sessionEdits` and the pristine snapshot) silently broke revert/preview after using Apply's file-write.** Reported as "I'm not sure the revert option is working" — reverting to a specific saved version worked fine, but reverting to **Original** did not, and only after a prior Apply on that same rule. Root cause: Apply's dev-only file-write path (`/__dev-edit/apply`) writes to the real source `.css` file, which triggers Vite's HMR to swap in a **brand-new `<style>` tag** for that file — genuinely new `CSSStyleRule` objects, while the *old* tag (and every rule reference captured from it, in `pristineRef` and in any `sessionEdits` entry created before the swap) gets detached from the document. Mutating a detached rule's `.style.cssText` is a legal, silent no-op visually — the browser doesn't render anything from a removed `<style>` tag, but nothing throws, so there was no error to notice either. Fixed by never storing the rule object at all: both the pristine snapshot and every `sessionEdits` entry now store only `selectorText`/`mediaText`, and every mutation goes through `setLiveRuleText`, which re-walks `document.styleSheets` fresh each time — slightly more work per call, but immune to any future stylesheet replacement, HMR-triggered or otherwise.

**Real bug: an earlier version of Apply set `original = draft` directly, making Save-as-version permanently blind to any rule the moment it was confirmed.** Save-as-version decides what to include via `committed !== original` — if Apply had already collapsed those two together, nothing ever looked "different" from its own already-updated baseline again, so that rule silently never made it into a saved version's `overrides`, and if it was the *only* edited rule, "Save as version" would write nothing to Firestore at all (the function returns early on an empty edit list) — meaning `devedit_active` never actually got updated, even though the UI made it look like saving had worked. This was almost certainly the cause of a reported bug where the "active" badge in version history only ever appeared on "Original," never on a real saved version — likely from confirming an edit (via the original dev-only "Apply to file," which had the exact same flaw) before ever trying to save it as a version. Fixed by splitting `committed` out from `original` as its own field, with Save-as-version reading `committed` (not `draft`) to build the saved `overrides`.

**Why applying an active version can't just read `rule.style.cssText` off the CSSOM for the "original" reference, unlike the dev-only `/lookup` round-trip below.** The dev-only file-write path cares about preserving authored shorthand in a real file; the shared/versioned path never writes to a file at all (only replays `cssText` on load), so there's nothing to preserve formatting-wise — using the browser's own (possibly longhand-expanded) serialization is completely fine there. The two paths intentionally use different levels of rigor for this reason.

**Exiting edit mode with unsaved edits asks first, rather than silently discarding or silently leaving them applied.** Both the toggle (turning `active` off) and Sign Out check `editedEntries().length > 0` before actually exiting — if there's anything confirmed-but-not-yet-versioned, an `ExitPrompt` overlay shows instead ("You have N unsaved edits" + Discard changes / Save as version), and the actual exit (`finishExit`) is deferred until a decision is made. Clicking the overlay's backdrop cancels the whole exit attempt and returns to editing, without needing a dedicated third button for that. Choosing "Save as version" opens the normal save dialog; a `pendingExitRef` remembers which exit was in flight (`'deactivate'` or `'signout'`) so a *successful* save also completes it afterward — but backing out of that save dialog (its own Cancel) clears the pending-exit ref too, so it never forces an exit the user didn't explicitly confirm. Escape while active routes through the exact same `toggleActive` path (not a direct `setActive(false)`), so it's gated by the same prompt. Deliberately **not** extended to the mutual-exclusivity path (switching to Dev Mode/Dev Comments) — that's treated as temporarily switching tools within the same toolbar, not "leaving," and the session stays fully intact/resumable either way, so there's nothing to lose there.

**Architecture for the dev-only file-write path — reads/writes real files via a Vite dev-server plugin (`devEditPlugin.js`).** Vite injects each imported stylesheet in dev mode as its own `<style data-vite-dev-id="/absolute/path/to/file.css">` tag — that attribute is the whole trick, giving the client a direct line from a live CSSOM rule back to its source file on disk. Two POST-only endpoints, registered via `configureServer` (which Vite only calls for `vite dev`/`vite serve`, never a production build):
- `/__dev-edit/lookup` — given the rule(s) the client found via the live CSSOM, parses each source file with `postcss` and returns the declarations exactly as authored. Also used (and gracefully no-ops via its existing `.catch()` in production, where the route doesn't exist) to populate a freshly-selected rule's textarea with nicer, non-expanded text — a UX nicety in dev, irrelevant but harmless in prod.
- `/__dev-edit/apply` — same lookup, then replaces that rule's declarations with the edited text and writes the file back. Only called from the **Apply** button's handler when `import.meta.env.DEV && entry.filePath` — the button itself is always visible (its label is just "Apply", not "Apply to file" anymore, since confirming a session edit is a universal action, writing to a file is the dev-only extra it also does when possible).

Both endpoints restrict themselves to `.css` paths inside the project root (`assertSafePath` in `devEditPlugin.js`) — a basic guard against a stray/malformed request writing somewhere it shouldn't, not a hardened security boundary (this only ever runs on a developer's own machine).

**Why there's a `/lookup` round-trip instead of just reading `rule.style.cssText` off the CSSOM directly, for the dev-only file-write path specifically.** First version did exactly that, and it seemed to work — until a real edit exposed the problem: `cssText` re-serializes from the browser's *computed* style object, so a hand-written `border: none` comes back as four expanded longhand properties (`border-width: medium; border-style: none; border-color: currentcolor; border-image: initial;`). Editing one property and hitting Apply would've silently expanded every other untouched shorthand in that rule, permanently degrading the source file's formatting on every single edit. Reading through `postcss` instead preserves exactly what's in the file — shorthand stays shorthand. The CSSOM is still used for the *live preview* (`rule.style.cssText = draft` on every keystroke — this is what makes every matching element update in realtime), just not as the source of truth for what gets written to a file.

**Selector/rule matching, both client and server side, is whitespace-normalized** (`normalizeSelectorText`/`ruleKey` in `DevEdit.jsx`, `normalizeSelector` in `devEditPlugin.js`) — `CSSStyleRule.selectorText` (browser) and a selector as actually formatted in a source file (sometimes split across lines for grouped selectors, e.g. `.devcomments-composer,\n.devcomments-panel` in `dev-comments.css`) differ only in whitespace, and both are collapsed to the same form before comparing. `@media`-nested rules are matched too, considering the immediate parent at-rule's `params`/`media.mediaText` alongside the selector — a rule with the same selector inside vs. outside a media query are treated as distinct.

**Indentation is preserved on the dev-only file write**, not just correctness of values — `applyEdit` in `devEditPlugin.js` captures the original declarations' `raws.before` (each decl's leading whitespace) and the rule's own `raws.after` (before the closing `}`) *before* removing and re-adding declarations, re-applying them to the new/edited decl nodes (matched back to the original by property name, falling back to a sensible default for genuinely new properties). Skipping this step was an early bug — postcss's default raws for a declaration parsed from a bare `a{...}` wrapper (used to turn the edited textarea text into clean AST nodes) have no leading newline/indent at all, so every edit would've flattened an entire nicely-indented rule onto ragged, unindented lines even though only one property in it actually changed.

**Selecting an element can match more than one CSS rule** (e.g. `.round-btn` and `.primary-btn` both apply to a primary button) — each shows as its own editable block in the panel, each with its own Cancel/Apply pair. A rule this broad (`*`) matching literally every element on the page is expected, not a bug — it does apply, same as it would in browser DevTools.

**Highlight/select follows Dev Mode's own established patterns**: capture-phase `mousemove`/`click` interception on `document` while active (so selecting an element to edit never triggers real navigation/clicks underneath it), a small `requestAnimationFrame` loop to keep the selected element's highlight/panel glued to it across scroll (and to detect + clean up if the element gets removed from the DOM while selected), and the same three-way `[data-devmode-ui]`/`[data-devcomments-ui]`/`[data-devedit-ui]` exemption every toolbar feature needs for the others' chrome. Participates in the same mutual-exclusivity bus (`devToolbarBus.js`) as the other two — only one of the three tools is ever active at once; being deactivated this way does **not** discard the session, only hides the select-mode overlay (matches manually toggling off).

**Version history and preview.** Shown only once signed in (a separate panel, opened from the session bar). Lists `devedit_versions` for the current `prototypeId`, newest first, plus a pinned **"Original"** pseudo-version always shown last — not a real Firestore doc (there's nothing to save; it's definitionally always the same `overrides: []`), just a sentinel (`ORIGINAL_VERSION_ID = '__original__'`) that flows through the same preview/revert code paths as a real one. This is the only way back to the true base styling once any version has ever been saved — added after Ben reported saving a version on the notifications prototype with no way to get back to the original. **Preview** applies a version's overrides live without touching `devedit_active` — a non-destructive look. **Revert** actually updates `devedit_active` (setting it to `{versionId: '__original__', overrides: []}` for Original). The **active version's row hides both Preview and Revert** — there's nothing meaningful to preview (it's already what's showing) or revert to (it's already active).

**Reconciling to a version — including "no overrides at all" — requires a genuine pristine snapshot, not just re-applying an override list.** `applyOverridesLive` (apply-only) can't express "stop overriding this rule" — passing it `[]` is a no-op, it never undoes an already-mutated `rule.style.cssText`. Fixed with `buildPristineSnapshot()` (walks every stylesheet once, capturing each rule's `cssText` exactly as shipped — captured in a `useLayoutEffect` at mount, specifically *before* the always-on active-version effect ever gets a chance to run, since there'd be no way to recover the true original afterward, in dev or production) and `applyOverrideSet(overrides, pristineMap, excludeKeys)`, which restores every pristine-known rule *not* in the target override list back to its true original, then applies the target list — a full "set the world to exactly this" reconciliation, used uniformly by the always-on effect, Preview, and stop-preview.

**Real bug: reverting to Original (or any version lacking a previously-edited rule) silently no-op'd on that rule.** The always-on effect's "don't stomp a rule the user is actively mid-editing" guard originally excluded every key in the *entire* `sessionEdits` map — but `sessionEdits` intentionally keeps every rule ever touched this session, including ones already saved via "Save as version" (so re-selecting an element still shows its committed draft). That meant any rule ever edited earlier in the session stayed permanently excluded from reconciliation, even long after the panel editing it was closed — reverting to Original would visibly do nothing for exactly the rule you'd most likely want reverted. Fixed by scoping the exclude set to `selection?.keys` (only whatever's in the *currently open* panel right now), not the whole session history.

**Firestore security rules require `request.auth != null` for `devedit_versions`/`devedit_active` writes** (real enforcement, not just a client-side UI gate — a bare client-side password check can be bypassed entirely, and can't stop a direct Firestore write). See the Firebase section above for the exact rule text — published and confirmed actually enforcing via direct (no-UI) Firestore calls, not just a successful sign-in through the app.

**Real, severe bug: the always-on reconciliation effect was silently corrupting `:root` on every page load for any prototype whose CSS defines `:root` in more than one file** — reported as "styling is off... like the timeline, these were coloured, there might be other colours missing too" (status icons that should be green/red/amber rendering black). Root cause: `buildPristineSnapshot()` keyed its map purely by selector text (`ruleKey(selectorText, mediaText)`), with no awareness of which stylesheet a rule came from. This repo deliberately gives *two* files their own `:root { ... }` block — `Styles/colors.css` (general tokens) and `Styles/legacy.css` (legacy-only tokens like `--legacy-status-complete`) — so legacy.css's `:root`, processed second, got silently dropped from the snapshot as an already-seen key. Since Dev Edit is mounted unconditionally on every prototype, the always-on effect runs on *every* page load regardless of whether any override is active — with `overrides: []` (true for any prototype with no saved `devedit_active` doc at all), its restore step used the page-wide `setLiveRuleText`/`findRulesForSelector`, which matches by selector text **across every stylesheet**, found every `:root` rule on the page (both files'), and overwrote all of them with the one captured (colors.css-only) snapshot — permanently wiping legacy.css's tokens from the live CSSOM on load. The raw served file was always correct, which is why the page visibly flashed the right colors for an instant before this effect ran and clobbered them.

Fixed by keying `buildPristineSnapshot()`'s entries by `${sheetIndex}::${ruleKey}` (the rule's index into `document.styleSheets`, not just its selector) and adding `findRuleInSheet(sheetIndex, selector, mediaText)`/`setLiveRuleTextInSheet(...)`, which resolve a rule *within one specific sheet only* — used by `applyOverrideSet`'s restore step in place of the page-wide lookup. The override-*application* half of `applyOverrideSet`/`applyOverridesLive` still matches by selector text across all sheets, unchanged and deliberately not fixed the same way — a saved override carries no sheet identity to key on (`filePath` is a local dev path, meaningless in production), and every real saved override targets a prototype-specific class that only exists in one file (e.g. `.notif-unread-dot`), not a broadly-shared selector like `:root` — a much smaller, still-open residual risk than the restore-path bug that was actually firing on every load. Affected prototypes (any loading both `colors.css` and `legacy.css`): `customer-profile/timeline`, `customer-profile/mar-chart`, `web/employees`, `component-demos/employee-card-legacy`.

---

## Wireframe tool (`tools/wireframe/`)

A small in-browser wireframing canvas — **not a product prototype**, a dev tool, so it skips the "Prototype conventions" section above entirely (no back-link/Dev Mode/Dev Comments/Dev Edit wiring). Lets Ben rough out a layout directly (frames, rectangles, ellipses, arrows, text — all movable/resizable/deletable, with optional fill color) and save it as a real JSON file in the repo, which Claude then reads directly to understand layout intent before implementing an actual prototype — faster than sketching in a separate app, and avoids losing the back-and-forth to ambiguous prose descriptions.

**Location**: `tools/wireframe/` fits the existing two-level Vite auto-discovery scan for free (`location/subdir/index.html`), same as any prototype folder. Linked from root `index.html`'s new "Tools" subsection (inside the "Components & Icons" column) via `.tool-link`, not `.proto-link`, so `Components/indexBadges.js` (which only queries `.proto-link` for Dev Comments badges) doesn't need to care about it.

**Data**: one JSON file per wireframe under `wireframes/` at the repo root (added to `vite.config.js`'s `SKIP` set so the prototype-discovery scan never walks into it). `elements` is a flat array — array order **is** z-order (no `zIndex` field; "bring to front/send to back" is just a splice to the array's end/start). Every element's `fill`/`stroke` stores a resolved literal hex, never a `var(--token)` reference, so a saved wireframe file is fully self-contained. No parent/child nesting — flat list only.

**Persistence**: `wireframePlugin.js` (repo root, alongside `devEditPlugin.js`) is a dev-server-only Vite plugin (`configureServer`) with three POST endpoints — `/__wireframe/save`, `/__wireframe/list`, `/__wireframe/load` — mirroring `devEditPlugin.js`'s shape (`handleJsonPost` body-parsing helper, `assertSafePath` guarding), scoped tighter since this plugin only ever touches the one `wireframes/` directory. Like Dev Edit's own file-write endpoints, these only exist under `vite dev` — the tool always builds/deploys, but Save/Load only work locally.

**Interaction model**: plain bubble-phase React `onMouseDown`/`onDoubleClick` handlers, not capture-phase `document` listeners like Dev Mode/Dev Edit use — this canvas has no host app to defend against; it *is* the whole page. A tool-select (frame/rect/ellipse/arrow/text) → click-drag-to-draw → auto-revert-to-pointer flow; a plain click (no drag) falls back to a sensible per-type default size anchored at the click point rather than leaving a near-invisible speck. Draw/move/resize share one grid-snapped geometry model in `tools/wireframe/src/geometry.js` — a handle's name says which edges move, the rest stay fixed, which alone produces correct corner-anchor and edge-flip behavior with no special-casing. Arrows resize from either endpoint (2-point, the natural equivalent of 8-point box resize for a line) and, when moved, re-derive one shared post-snap delta applied to both endpoints so they stay rigid rather than each snapping independently and subtly distorting length/angle.

**Rendering**: frame/rect/ellipse/text are plain absolutely-positioned `<div>`s (`ElementRenderer.jsx`, one component for all four since they share one box model and differ only in rendering details). Arrows are a single SVG overlay (`ArrowLayer.jsx`) with a `<marker>` arrowhead def — needed for a real arrowhead, which plain CSS borders can't do. This means arrows always render visually on top of every box element (a deliberate simplification over strict cross-type DOM interleaving) — the more useful default anyway, since arrows indicate flow/connections and should stay visible rather than risk being hidden behind whatever they're pointing at. Z-order *within* box elements, and *within* arrows, still follows true array order.

**CSS**: its own `Styles/wireframe-tool.css`, importing only `Styles/colors.css` (for live-linked fill-swatch previews via `var(--token)`) — deliberately not `Styles/main.css`, since nothing in the product design system (buttons, warning banners, tables) fits a canvas/handle/toolbar UI. The saved JSON itself never stores a token reference, only the swatch's resolved hex, per the data model above.

### v2 — multi-select, persistent groups, undo, icon toolbar

**Toolbar** is now a centered bottom icon bar (`Toolbar.jsx`) with exactly three buttons — **Frame** (arms directly), **Shapes** (opens a popup of Rectangle/Ellipse/Arrow/Text icons), **Colour Fill** (opens a two-tab popup: native color-picker input, and a swatches list from `colorTokens.js` showing each row's swatch *and* label). Re-clicking an already-active icon cancels it back to pointer — there is no dedicated "Select" button anymore (removed; its only purpose, returning to pointer, is now Escape or re-clicking the active icon). Save/Load/New moved out into their own top-right `FileControls.jsx` cluster, unchanged in behavior from v1.

**Selection is no longer a single id.** `selectedIds` (array) drives everything. Clicking an unselected element replaces the selection with its group's members (see below); clicking something *already* part of a larger current selection keeps that whole selection intact and drags all of it together (this is what makes "drag any member of an existing multi-select" work, rather than collapsing to one element first). Shift+click only toggles membership, never starts a drag. Click-drag on empty canvas (in pointer mode) is a marquee — selects everything whose bounding box intersects the drag rect, expanded to full groups.

**Persistent groups**: every element has a `groupId` (default `null`, no migration needed for older saved files). **⌘G**/Ctrl+G groups 2+ selected elements under one new id; **⌘⇧G**/Ctrl+Shift+G clears `groupId` from every member of any group represented in the selection. Clicking *any one* grouped member always re-selects the whole group — groups and ad-hoc multi-selects share the exact same rendering/resize path, the only difference is whether membership is transient (`selectedIds`) or persistent (`groupId` on the elements themselves).

**Unified single/group resize — the key architectural move**: resize handles moved out of `ElementRenderer.jsx` entirely into one shared `SelectionOverlay.jsx`, positioned around `computeBoundingBox(elements, selectedIds)` (new in `geometry.js`). Dragging a handle resizes *that* combined box (via the existing `resizeBox`, or `resizeBoxAspectLocked` for shift+corner-drag), then `transformSelection` applies one affine transform (independent per-axis scale + translate) to every selected element. For exactly one selected element this reduces exactly to a direct per-element resize — no special case needed, which is also why the same shift+corner aspect lock works identically whether one or several things are selected. A **lone selected arrow** is the one exception: it keeps its own 2-endpoint handles in `ArrowLayer.jsx` (more precise for a diagonal line) instead of the shared overlay.

**Context menu** (`ContextMenu.jsx`, portaled to `document.body` like Dev Edit's own panels, since Canvas's coordinate space is canvas-local/scrollable but a right-click menu should float at the raw cursor position) replaces the old Send-to-back/Bring-to-front/Delete toolbar buttons — right-click selects the target's group first if not already selected, then shows all three actions acting on the whole current selection. Z-order on a multi-select splices the whole selected block out (preserving relative order) and re-inserts it at the array's start/end.

**Undo (⌘Z)**: snapshot-based (`historyRef`, plain array of prior `elements` snapshots, capped at 50), not a command pattern. `App.jsx`'s `pushHistory(snapshot?)` pushes either an explicit snapshot or the current `elementsRef.current`. Redo is out of scope.

**Escape precedence**: close an open context menu → clear the selection → reset an armed draw tool to pointer. Canceling an in-progress label edit is handled *locally* by the label input itself (`stopPropagation` on its own Escape handler) — by the time a bare Escape reaches the window-level listener, editing is guaranteed to already be over, so there's no separate branch for it.

**Real bug: `transformSelection`'s call site was fixed to a corrected 3-argument design mid-build, but its own function signature in `geometry.js` was never updated to match** — still declared 4 params, so the 3-arg call left its real `groupBox1` silently `undefined`, throwing on every resize mousemove tick. Caught via a Playwright stack trace, not shipped blind.

**Real bug: `SelectionOverlay` had no `pointer-events: none`, so it sat on top of already-selected elements and intercepted clicks meant for them** — clicking an already-selected element to reposition it instead fell through (as a DOM *sibling*, not ancestor, so it never reached the element's own handler) to the canvas's empty-space click-to-deselect logic. Fixed with `pointer-events: none` on the overlay and `pointer-events: auto` on its handles only.

**Real bug, a genuine React 18 StrictMode gotcha: reading a mutable ref (`selectedIdsRef.current`) *inside* a `setElements` updater function is unsound.** The Backspace/Delete handler filtered elements using `selectedIdsRef.current` read inside the updater, immediately followed by `setSelectedIds([])` in the same handler — StrictMode's deliberate second invocation of that same updater (to test purity) ran *after* the ref had already been reset to `[]` by the sibling call's re-render, making the filter a no-op every time. Fixed by capturing `const idsToDelete = selectedIdsRef.current` as a plain local *before* calling `setElements`, so the value the updater closes over can never change regardless of how many times it's invoked. General rule for this codebase going forward: never read a ref directly inside a state-updater callback — snapshot it to a local first.

**Real bug: `onDragStart` (undo's `pushHistory`) fired unconditionally at drag-*start*, so a plain click-to-select (zero mouse movement, which is exactly what a click on an already-positioned element is) pushed a visually no-op history entry every time** — would have silently filled the undo stack with entries that do nothing when undone. Fixed by moving the actual history commit to drag-*end*, gated on `dx !== 0 || dy !== 0` for move/resize/arrow-endpoint drags (a `draw` always commits, since a new element is unconditionally created regardless of click-vs-drag); the pre-drag snapshot is captured at drag-start and threaded through `dragRef` so the *correct* (pre-mutation) state is what actually gets pushed at drag-end.

### v3 — aspect-lock fix, dedicated Text tool, frame rename, exit confirmation

**Real bug: shift+corner aspect lock never actually worked.** `onSelectionHandleMouseDown` captured `lockAspect: e.shiftKey && isCorner` once, at mousedown — real usage (start the drag, *then* press Shift) meant Shift often wasn't held yet at that exact instant, so the lock silently never engaged. Fixed by storing only `isCorner` in `dragRef` and checking `e.shiftKey` live on every `mousemove` tick instead, matching how Figma/Sketch-style constrain-proportions actually behaves (press/release Shift any time mid-drag).

**Text is now its own toolbar icon** (out of the Shapes popup), with a placement flow unique to it: a single click (not click-drag-to-size) drops a caret immediately with no visible box, and typing starts right away — no double-click needed. A new `autoEditId` handshake (`App.jsx` sets it right after placing a text element; `ElementRenderer` opens editing on mount if it matches, then clears it) is what skips the double-click just for this one creation path. "No box until you type" is implemented as *local* component state in `ElementRenderer.jsx` (a `wf-label-input-bare` class while the local `draft` is empty, switching to the normal bordered input the instant a character lands) — deliberately not a live cross-component sync of `el.label`, since that would have broken the already-shipped commit-on-blur/Escape-reverts behavior for editing existing text. Canceling (Escape) now re-commits `el.label` unchanged rather than doing nothing — combined with `Canvas.jsx`'s `updateLabel` deleting any text element committed with an empty label, this is what makes a never-typed-into placement correctly disappear on Escape too, not just on blur.

**Real bug caught during verification: a freshly-placed empty text element (auto-selected on placement) would show the shared `SelectionOverlay`'s dashed box + handles instantly** — the overlay only knows about `selectedIds`, not an element's own content. Fixed with an explicit `isLoneEmptyTextSelected` exclusion in `Canvas.jsx`, alongside the existing lone-arrow one.

**Right-side font panel** (`FontPanel.jsx`) deliberately mirrors `Components/DevMode.jsx`'s own dark inspector panel look (not this tool's own light popup style) per an explicit "similar to dev mode" ask. One panel, two jobs: while the Text tool is armed it edits `pendingTextStyle` (defaults for the *next* placed text); while exactly one text element is selected it edits that element directly and live. Alignment is the standard left/center/right (confirmed via `AskUserQuestion` — the original ask listed "left, middle or center," which turned out to just mean the standard three).

**Frame rename fix**: double-clicking a frame already edited its `label`, but the input rendered centered in the box — wrong, since the name displays in a small badge *above* the box. Fixed by scoping the double-click specifically to the `.wf-frame-label` badge (removed from the frame body's own double-click) with a `.wf-frame-label-input` positioned exactly where the badge sits.

**Exit confirmation** mirrors `Components/DevEdit.jsx`'s own `ExitPrompt` convention exactly (message shape, Discard/Save, backdrop-click cancels, no separate Cancel). Dirtiness is tracked via a `savedSnapshotRef` reference comparison (reset after a successful Save/Load/New — every real mutation already produces a fresh array via `setElements`, so no deep-equality is needed). `handleSave` now returns a boolean specifically so the exit flow knows whether to navigate without racing React's async state updates (checking `saveError` right after an `await` isn't reliable within the same tick). A `beforeunload` listener is a best-effort secondary net for an actual tab close/refresh — browsers strip custom text from that dialog regardless, so the custom modal on the in-app back-link is the real UX.

### v3.1 — text auto-size (click) vs. bound box (click-drag)

Text elements gain `autoSize: boolean`. A plain click → `true`, no fixed w/h, sized to its own content, never shows a box at all (missing on older saved files is falsy → safely treated as bound). A click-*drag* → `false`, a real fixed-size container — creation now goes through the same `'draw'` drag lifecycle every other shape uses (checking live drag distance in `handleMouseMove`, flipping to `autoSize:false` with live `boxFromDrag` updates once past `CLICK_THRESHOLD`) rather than v3's instant-placement branch that ignored drag distance entirely. Resizing an autoSize text via the shared `SelectionOverlay` always graduates it to bound (`transformSelection` in `geometry.js` sets `autoSize:false` in its patch) — manually resizing implies an explicit size was chosen on purpose.

**Real bug: a plain `<input>` doesn't shrink/grow to fit its typed value** — unlike a `<div>`, its width defaults to the browser's own fixed intrinsic sizing, unrelated to `value`'s length. The "no box, grows as you type" effect looked broken while actively editing even though the *committed* display (a `<div>`, which does shrink-wrap correctly) was fine. Fixed with a `ch`-based width heuristic (`width: ${draft.length}ch`) applied only to the autoSize input while editing.

**Real bug, a genuine React timing gotcha: the auto-edit-on-placement handshake silently broke once creation moved into the shared drag lifecycle.** `onTextPlaced` (sets `autoEditId`) now fires from `handleMouseUp` — a *separate* event/render from the element's own creation in `onCanvasMouseDown`. `ElementRenderer`'s auto-edit effect had a mount-only `useEffect(() => {...}, [])` — but the component *mounts* on the earlier mousedown-triggered render, where `autoEditId` is still `null`; a mount-only check never re-fires once it later flips to `true`. Worked by accident in v3 only because both happened in one `onCanvasMouseDown` call, letting React 18's automatic batching merge them into a single render whose first mount already saw `autoEdit:true`. Fixed by making the effect reactive to `autoEdit` itself (`useEffect(..., [autoEdit, el.id, onAutoEditConsumed])`) instead of mount-only. Caught by dumping a freshly-placed element's actual `outerHTML` and finding it had silently rendered with zero children — not assumed working from a visual check alone.

### v4 — copy/paste, Option-drag duplicate, tool keyboard shortcuts

One shared pure helper, `cloneElements` in `geometry.js`, backs both ⌘V paste and Option-drag duplicate — fresh ids throughout, and any `groupId` shared *among the elements being cloned* remapped consistently to one new shared id (a copied group becomes a distinct new group, not a merge into the original). Paste offsets by a fixed `{16,16}`; Option-drag duplicate offsets by `{0,0}` (the copy starts exactly on the original — the drag itself, reusing the existing `moveGroup` mechanics, is what separates it, matching Figma/Illustrator's own alt-drag convention). ⌘C/⌘V live in `App.jsx` via a plain `clipboardRef` (not state); ⌘V makes the pasted elements the new selection, consistent with every other creation flow in this tool.

**Option-drag duplicate** lives in `useCanvasInteraction.js`'s `onElementMouseDown` (shared by `ElementRenderer`/`ArrowLayer`, so it covers arrows for free) — alt-dragging one member of an existing bigger selection duplicates the whole thing, reusing the same `nextSelection` resolution the plain move path already computes. Carries an `isDuplicate` flag so the existing "skip undo history if nothing moved" guard (v2, added to stop plain clicks from spamming no-op entries) doesn't also swallow a legitimate alt-*click*-with-no-drag duplicate — creating the copy is a real change regardless of subsequent movement.

Tool shortcuts (R/C/F/T/A) sit in the same bare-key space as Escape/Backspace, gated on `!isTyping` plus explicit exclusion of Option (the alt-drag modifier); the ⌘-modifier branch above unconditionally `return`s, so a browser shortcut like ⌘R can never be misread as arming Rect. Re-pressing the same key toggles back to pointer, matching the toolbar icons' own convention — needed a new `activeToolRef` (same stale-closure-avoidance pattern as `elementsRef`/`selectedIdsRef`) since the keydown effect's dependency array doesn't include `activeTool`.

### v5 — bound-text editing: no focus ring, live wrap, persists when empty

Every label input/textarea (`.wf-label-input`, `.wf-frame-label-input`, `.wf-arrow-label-input`) gets `outline: none` — this tool already draws its own purple border for active editing, so the browser's default focus ring was redundant and visually clashed.

**Bound text (click-dragged, `!autoSize`) now edits via a `<textarea>`, not an `<input>`** — a single-line input can't wrap, so typed text overflowed past the box's edge until commit (when the static `<div>` display, which does wrap, took over). `type==='text' && !autoSize` gets the textarea; autoSize text and every other type keep the single-line input, unchanged. This flips Enter's meaning for bound text only — it inserts a newline (textarea's own default, no commit call) rather than confirming; only blur/Escape end that edit. `.wf-el-label` gained `white-space: pre-wrap` so a typed line break survives into the committed display.

**A bound (drawn) text box is no longer deleted when committed empty** — the existing "delete empty text on commit" rule in `Canvas.jsx`'s `updateLabel` is now scoped to `el.autoSize && label.trim() === ''` specifically. A click-dragged box represents a deliberately sized placeholder and should stick around even before any copy is typed into it; a plain click's autoSize text is unaffected and still disappears if left empty.

**Unrelated, logged separately**: a reported "saved wireframe won't load" traced to the *agent's own* test-cleanup habit (`rm -rf wireframes` after each verification round, on the same untracked directory Save/Load actually use) rather than a code bug — see `feedback_dont_rm_shared_data_dirs` in memory. Test cleanup for this tool now only ever deletes specific named files it created, never the whole directory.

### v6 — fill colour + text colour for text elements

Text elements can take a background fill via the existing Colour Fill picker — just widening `FILLABLE_TYPES` (`App.jsx`) to include `'text'`; `ElementRenderer.jsx` already rendered `background: el.fill` generically for every type. A new "Text colour" section in `FontPanel.jsx` writes a `textColor` field (swatches from a new `TEXT_COLOR_SWATCHES` list in `colorTokens.js` — deliberately separate from `FILL_SWATCHES`, whose light background tints make poor text colours — plus a custom `<input type="color">`), applied via inline `color` on the element; falls back to the original fixed `#333333` for text saved before this field existed.

**Real bug: the `isTyping` guard treated *any* focused `<input>` as "typing," including the font panel's colour-picker and size (number) inputs** — after using either, it stayed focused and silently disabled every bare-letter tool shortcut (R/C/F/T/A) until something else was clicked. Narrowed the check to true text-entry fields only (`<textarea>`, or an `<input>` with no `type`/`type="text"`).

**Also fixed while touching this**: `Toolbar.jsx`'s swatch preview only rendered a colour when the entry had a matching CSS `token`, showing nothing at all for a hex-only entry — hit immediately by the new "Red" text-colour swatch, since this repo's own red tokens are pastel/light (warning-banner backgrounds), with no dark text-legible equivalent to link to. Fixed by falling back to the raw `hex` when no token exists, in both `Toolbar.jsx` and `FontPanel.jsx`.

**Test-tooling note, not an app bug**: `page.keyboard.type()`'s rapid synthetic keystrokes intermittently truncated text in the bound-text `<textarea>` and showed a bogus negative canvas scroll position — slow per-key typing and `page.fill()` both worked perfectly, confirming a keystroke-timing artifact specific to fast programmatic typing, not a real user-facing issue.

### v7 — shared, password-gated save/load for the design team; "Untitled" saves

Until this round, Save/Load only worked when *Ben* was running `vite dev` locally — `wireframePlugin.js`'s endpoints are dev-server-only, so the design team (visiting the deployed site) had no way to create or save a wireframe at all. Now saving also writes to a new Firestore collection, `wireframe_saves` (one doc per wireframe, auto-generated id remembered client-side as `currentFirestoreId` — mirrors how `currentFileName` already tracks the local file, so repeated saves in one session `updateDoc` the same doc rather than creating duplicates): `{ name, authorName, elements, createdAt, updatedAt }`. Security rules (same shape as `devedit_active` — open read, authenticated write, no delete since there's no delete UI for this collection):
```
match /wireframe_saves/{id} {
  allow read: if true;
  allow create, update: if request.auth != null;
  allow delete: if false;
}
```

**Gated by the exact same shared Firebase Auth session as Dev Edit** — this is what makes "already signed in via Dev Edit skips the gate here too" work for free, and is why `SHARED_EMAIL` (`Components/firebase.js`) and the session-expiry helpers (`Components/sharedAuthSession.js`: `SIGNIN_AT_KEY`, `SESSION_DURATION_MS`, `getSignInAt`/`setSignInAt`/`clearSignInAt`/`isSessionExpired`) were extracted out of `Components/DevEdit.jsx` this round, where they originated — `DevEdit.jsx` now imports both instead of declaring them locally (pure refactor, the `'devedit-signin-at'` localStorage key itself is unchanged so no one's active session is invalidated by the move). Only *saving* requires the password — browsing/loading the shared list stays open to everyone, same as Dev Comments' own read-open/write-gated pattern.

**`App.jsx`'s save logic is now a `performSave`/`requestSave` split**, mirroring `DevEdit.jsx`'s own `toggleActive`/`submitPassword`/`submitName` gate exactly:
- `performSave()` — the actual write, assumes auth is already satisfied. Defaults an empty name to `"Untitled"` (`wireframeName.trim() || 'Untitled'`) rather than blocking the save at all — the old disabled-Save-button-until-named treatment is gone entirely, both on `FileControls`' own Save button and the exit-prompt's. Also best-effort mirrors the same content to the existing local `/__wireframe/save` endpoint (`.catch(() => {})` — silently ignored when unreachable, e.g. on the deployed site), so Ben's own workflow of reading a wireframe's JSON straight off disk keeps working unchanged.
- `requestSave()` — the one entry point both Save buttons call. Opens the password/name gate (new `.wf-gate-*` UI, light-themed to match this tool rather than reusing `dev-edit.css`'s dark theme) if not yet signed in or no name is stored; otherwise calls `performSave()` directly. `submitPassword`/`submitName` resume the pending save once the gate is satisfied.
- **Exit-flow integration**: `handleExitSave` sets a `pendingExitAfterSaveRef` flag (mirrors `DevEdit.jsx`'s own `pendingExitRef`) and calls `requestSave()` — navigation away only happens once a save the exit flow triggered actually succeeds, whether immediate or after completing the gate. Canceling the gate clears the flag, same as `DevEdit.jsx`'s established convention of never forcing an exit the user didn't confirm.

**Merged local + cloud file list**: `FileControls.jsx` now renders two `<optgroup>`s — "Shared" (Firestore, live via `onSnapshot`) and "Local (this machine)" (the pre-existing dev-only file list) — with each `<option>`'s value prefixed `cloud:<docId>` / `local:<fileName>` so `App.jsx`'s `handleLoad` can dispatch to the right backend and clear the *other* backend's tracking id (`currentFirestoreId`/`currentFileName`) on load.

**Verification note**: the `wireframe_saves` rules are published and confirmed enforcing (2026-07-23, direct no-UI check — unauthenticated read succeeds, unauthenticated write rejected with `permission-denied`). The "correct password → real Firestore write succeeds" path still needs the actual shared password, which isn't stored anywhere in this repo/session (same convention as every other shared-password check here) — confirmed instead via Playwright that the gate appears when signed out, a wrong password is rejected with no successful sign-in, canceling the gate returns to the canvas without navigating or saving, and the merged dropdown/exit-flow wiring behave as designed.

### v8 — O shortcut, categorized colour swatches, shape font styling, zoomable/pannable canvas

**Ellipse shortcut changed from `C` to `O`** (`App.jsx`'s `TOOL_SHORTCUT_KEYS`) — reads more intuitively for a circular shape than its own first letter.

**Colour Fill's Swatches tab now shows the *entire* named colour system from `Styles/colors.css`**, not a small curated list — `colorTokens.js`'s flat `FILL_SWATCHES` became `FILL_SWATCH_GROUPS`, an array of `{ category, swatches }` mirroring `colors.css`'s own section comments (Greyscale, Brand Purple, UI Purple, UI Blue, RAG Red, RAG Amber, RAG Green, Availability, Task Actions, Schedule Card Indicators, Buttons, Form Inputs, Bodymap — 13 groups). Deliberately excludes `colors.css`'s ungrouped "Misc" section (`--web-skrim`, `--invisible`, `--purple-7`, `--iolite`, `--amber`, `--calcite`) — one-off special-purpose values with no natural category, not real fill choices (confirmed via `AskUserQuestion`). `Toolbar.jsx` renders a `.wf-swatch-group-label` heading above each group; `NONE_SWATCH` is a standalone export shown once, above all groups, matching its previous "always-first" position. `TEXT_COLOR_SWATCHES` (the font panel's own curated text-colour list) is untouched — this ask was specifically about the Colour Fill popup.

**Rect/ellipse/arrow labels get the same font panel treatment as a text element, once they actually have text.** Confirmed via `AskUserQuestion`: font styling extends to arrows (family/weight/size/colour; alignment is skipped — doesn't apply to a single floating label on a line) but **not** Frame — a frame's `label` is its name badge above the box, not body text, so it's excluded entirely and keeps its pre-existing unstyled look. The font panel appears only once the shape already has text (`el.label?.trim()`), not for an empty shape — matches "if a shape has text in it" literally, and keeps a plain decorative rect from ever showing font controls it'll never use. Implementation: `useCanvasInteraction.js`'s rect/ellipse/arrow `newEl` construction gains the same `fontFamily`/`fontWeight`/`textAlign`/`textColor` fields text already had (arrow omits `textAlign`); `ElementRenderer.jsx`'s inline font-style block broadens from `el.type === 'text'` to `el.type !== 'frame'`; `ArrowLayer.jsx`'s `<text>` label reads `fontFamily`/`fontWeight`/`fill` off the arrow's own fields instead of hardcoded values. All reads fall back to the pre-existing fixed defaults (`|| 'Barlow'`, `|| 400`, `|| 'center'`, `|| '#333333'`) — an old saved rect/ellipse/arrow (no such fields yet) renders identically to before until edited. `App.jsx`'s `selectedTextEl` generalized to `selectedStyleableEl` (single selection, `type === 'text'` or a styleable shape with non-empty text); `FontPanel.jsx` gained a `showAlignment` prop (default `true`, passed as `false` for a selected arrow) wrapping its existing Alignment section.

**Canvas bumped from 1400×1000 to 4000×2800, with a Figma/Miro-style zoom** (confirmed via `AskUserQuestion`: zoom-to-cursor via Ctrl/Cmd+scroll, not just buttons). Zoom is view state only — lives in `App.jsx` (`zoom`/`setZoom`, `geometry.js`'s `ZOOM_MIN`/`ZOOM_MAX`/`ZOOM_STEP`/`clampZoom`), passed down to `Canvas.jsx`, **not saved into the wireframe JSON** (resets to 100% on reload, same as Figma's own zoom not being part of a file). `Canvas.jsx` applies `transform: scale(zoom)` / `transformOrigin: '0 0'` to the existing `.wf-canvas` div — every child (box elements, `ArrowLayer`'s SVG, `SelectionOverlay`, the marquee) is already absolutely positioned in canvas-space pixels and inherits the same visual scale for free; `geometry.js` needed zero changes (pure canvas-space math, zoom-agnostic). `useCanvasInteraction.js`'s `getCanvasPoint` — the single chokepoint every drag/click/draw already goes through — became zoom-aware (`(e.clientX - rect.left) / zoom`), which alone made the entire existing interaction model zoom-correct with no other logic changes. A new bottom-right `.wf-zoom-control` (–/percentage/+, click percentage to reset to 100%) plus Cmd/Ctrl+`=`/`-`/`0` keyboard shortcuts (added to `App.jsx`'s existing global keydown handler) round out manual zoom.

**Zoom-to-cursor via Ctrl/Cmd+scroll** (`Canvas.jsx`): a native, non-passive `wheel` listener on the scroll container (React's synthetic `onWheel` can't `preventDefault()` a passive listener) — only acts when `e.ctrlKey || e.metaKey` (trackpad pinch already surfaces as a wheel event with `ctrlKey:true`, so this covers pinch-to-zoom for free). Computes the canvas-space point under the cursor at the old zoom, then — after the new zoom actually commits to the DOM (a `useLayoutEffect` keyed on `zoom`, not set synchronously inside the wheel handler itself) — restores `scrollLeft`/`scrollTop` so that point stays visually anchored under the cursor.

**Real, severe bug: vertical zoom-to-cursor was completely broken (0px scroll adjustment on the Y axis) the moment the canvas grew past one viewport's height.** `.wf-page`'s `min-height: 100vh` (not a fixed `height`) meant that once `CANVAS_HEIGHT` became 2800px (taller than any real viewport), the *whole page* grew to fit the content and the **browser's own document scrolled**, rather than `.wf-canvas-scroll`'s own `overflow: auto` doing the scrolling internally — leaving `.wf-canvas-scroll` with `clientHeight === scrollHeight` (2800 === 2800, no internal vertical overflow at all) even though `overflow:auto` was still correctly set. Horizontal zoom-to-cursor happened to still work (there *was* horizontal overflow, since `CANVAS_WIDTH` exceeded typical viewport widths already), which is what made this a partial, easy-to-miss bug rather than an obvious total failure — caught by instrumenting the wheel handler directly (`scrollHeight`/`clientHeight` logged) after a Playwright cursor-anchoring check showed ~65px of vertical drift with zero horizontal drift, not assumed from the symptom alone. Fixed by changing `.wf-page` to a fixed `height: 100vh` + `overflow: hidden` — its only in-flow child is `.wf-canvas-scroll` (every other piece of chrome — back-link, FileControls, Toolbar, FontPanel, the new zoom control — is `position: fixed`), so this correctly bounds `.wf-canvas-scroll`'s own `flex: 1` height to exactly one viewport, letting its `overflow: auto` do real internal scrolling again. Re-verified afterward: sub-pixel drift only (~0.2px, pure rounding) on both axes.

**Verified end-to-end via Playwright**: `O` arms Ellipse, `C` no longer arms anything; Swatches tab shows all 13 category headings; an empty rect shows no font panel, a rect with text does (family/weight/size/alignment all apply live), a labeled arrow shows the panel *without* an Alignment section, a named frame never shows the panel; zoom buttons/percentage-reset/keyboard shortcuts all work; a rect drawn at 50% zoom produces exactly double the canvas-space size of the on-screen drag distance (confirms `getCanvasPoint`'s zoom conversion is correct, the single most regression-critical check for this round); Ctrl+scroll zoom-to-cursor keeps the zoomed-around point anchored on both axes after the `.wf-page` height fix; zoom resets to 100% after a full page reload. The local-file save→reload round trip itself couldn't be exercised this round (save now requires the v7 shared-password gate, which needs credentials not available in this session) — not a v8 regression, just outside what could be verified without Ben.
