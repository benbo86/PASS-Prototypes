// Is this page showing inside one of SplitViewToggle's panes?
//
// The pane's iframe is named SPLIT_PANE_NAME, and an iframe keeps its name
// as it navigates — so a mobile prototype opened from inside the pane (e.g.
// tapping the Notifications tab) still knows it's in a pane, not just the
// page the split first loaded. ?splitpane=1 is a fallback for opening a
// pane URL directly.
//
// Flags <html class="split-pane"> so Styles/split-view.css / Styles/mobile.css
// can hide the pane's own toolbar and back-link, and keeps
// --split-pane-scale up to date so a phone mockup shrinks to fit.
// Imported by SplitViewToggle and AppNav, so every mobile prototype gets it.
export const SPLIT_PANE_NAME = 'pass-split-pane'

export const IS_SPLIT_PANE =
  window.name === SPLIT_PANE_NAME || new URLSearchParams(window.location.search).has('splitpane')

if (IS_SPLIT_PANE) {
  const root = document.documentElement
  root.classList.add('split-pane')
  const PHONE_W = 393 + 26 + 32 // frame + bezel + breathing room
  const PHONE_H = 852 + 26 + 32
  const updateScale = () => {
    const scale = Math.min(1, window.innerWidth / PHONE_W, window.innerHeight / PHONE_H)
    root.style.setProperty('--split-pane-scale', scale.toFixed(3))
  }
  updateScale()
  window.addEventListener('resize', updateScale)
}
