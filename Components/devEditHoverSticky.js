// Shared "make a hover/popover component Dev-Edit-editable" behavior —
// extracted from Components/Tooltip.jsx (the first consumer) so ANY future
// hover-triggered or portaled popover (a custom tooltip, a hover card, a
// preview bubble) gets this for free with one hook call, instead of every
// new one hand-rolling the same three things again:
//
//   1. Staying mounted/visible past mouseleave while Dev Edit is active
//      (a popover that vanishes the instant the cursor leaves its trigger
//      can never be reached to click into — Dev Edit needs it to stay put).
//   2. Becoming pointer-events:auto while active (most popovers are
//      pointer-events:none at rest so they never intercept real clicks —
//      correct for normal use, but it also means Dev Edit's own click
//      would pass straight through to whatever's behind, never landing on
//      the popover's own content).
//   3. Dismissing on a genuine click elsewhere, or Escape, once pinned —
//      so it doesn't just stay open forever with no way to close it again.
//
// Usage: a component keeps its own `[visible, setVisible]` boolean exactly
// as it already would (however it decides to show/hide itself is
// unchanged) and calls this hook, passing that pair plus a CSS selector
// matching its own popover root (used to tell "a click inside the
// popover, meant to select something in it" apart from "a click
// elsewhere, meant to dismiss it"). It returns whether Dev Edit is
// currently active — the component should (a) skip its own normal hide
// logic while this is true, and (b) set `pointerEvents: 'auto'` on its
// popover root while this is true (both left to the caller, since exactly
// how "hide" and "the popover root" are expressed varies per component).
//
// The one thing this can't automate away: the popover's own root element
// still needs to actually be selectable at all, i.e. recognized by Dev
// Edit as real page content rather than being invisible to it. If it's
// portaled outside the prototype's own container (document.body, same as
// this one), that's already handled generally — Components/DevEdit.jsx
// recognizes anything that isn't another tool's own chrome, with no
// per-component allowlist to maintain.
import { useState, useEffect } from 'react'
import { subscribeToState } from './devToolbarBus'

export function useDevEditActive() {
  const [active, setActive] = useState(false)
  useEffect(() => subscribeToState((feature, isActive) => {
    if (feature === 'devedit') setActive(isActive)
  }), [])
  return active
}

// Click-away/Escape dismissal for a popover Dev Edit has pinned open.
// Registered at capture phase specifically because Dev Edit's own
// mousedown/keydown interception (Components/DevEdit.jsx) is ALSO
// capture-phase on `document` and calls stopPropagation — which would
// otherwise stop this same-node bubble-phase listener from ever firing (a
// later, separate visit to `document` that stopped propagation prevents
// from ever happening). Two capture-phase listeners on the same node both
// still fire, in registration order — stopPropagation only stops the
// event moving to a *different* node, not sibling listeners on this one —
// so capture phase here works regardless of whether Dev Edit's own
// handler also runs on the same event. Worked out and verified first for
// schedule/daily-schedule's own shift/visit hover cards, then generalized
// here once Components/Tooltip.jsx needed the identical behavior.
//
// Real bug, caught directly: a click INSIDE Dev Edit's own edit panel
// (its CSS textarea, Save/Cancel buttons, tabs — all portaled elsewhere,
// same as this popover) is not a descendant of `ownSelector` either, so
// without this exclusion, clicking into the panel to actually work on
// whatever was just selected reads as "clicked away from the popover" and
// dismisses it — which detaches the very element Dev Edit had selected,
// and Dev Edit's own stale-selection watchdog then closes its panel too,
// right out from under someone trying to type a CSS change. Every dev
// tool's own chrome carries one of these data-*-ui markers already (the
// same ones Components/DevEdit.jsx's own isOtherUi checks), so excluding
// all of them here — not just Dev Edit's own — covers e.g. Dev Mode's
// inspector panel too, on the offwebsite chance both are somehow relevant
// to the same click.
const OTHER_TOOL_UI_SELECTOR = '[data-devedit-ui], [data-devmode-ui], [data-devcomments-ui], [data-wireframeaccess-ui], [data-devtoolbar-ui]'
export function useDevEditStickyDismiss(active, visible, setVisible, ownSelector) {
  useEffect(() => {
    if (!active || !visible) return
    const handlePointerDown = (e) => {
      if (!e.target.closest(ownSelector) && !e.target.closest(OTHER_TOOL_UI_SELECTOR)) setVisible(false)
    }
    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      setVisible(false)
    }
    document.addEventListener('mousedown', handlePointerDown, true)
    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown, true)
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [active, visible, ownSelector, setVisible])
}
