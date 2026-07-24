import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { announceSignOutRequest } from './devToolbarBus'

const SignOutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
)

// Full-width dev toolbar — hosts Dev Mode/Dev Comments/Dev Edit/Wireframe
// access as one real, normal-flow bar (position:sticky, not fixed — see
// Styles/dev-toolbar.css for why) rather than 4 independently floating
// circular buttons, so it genuinely reserves space at the top of every
// prototype and pushes that prototype's own content below it, instead of
// floating over whatever the prototype renders in its own top-right
// corner. Wire this in wherever the previous four <DevMode>/<DevComments>/
// <DevEdit>/<WireframeToggle> calls used to sit, now as children, and as a
// new *sibling before* the prototype's own root element (not inside it —
// see CLAUDE.md's Prototype conventions for why):
//
//   <>
//     <DevToolbar>
//       <DevEdit containerRef={pageRef} prototypeId={window.location.pathname} />
//       <WireframeToggle />
//       <DevComments containerRef={pageRef} prototypeId={window.location.pathname} />
//       <DevMode containerRef={pageRef} />
//     </DevToolbar>
//     <div className="page" ref={pageRef}>...</div>
//   </>
//
// containerRef/prototypeId still go directly on each tool exactly as
// before — this component only provides the bar's chrome, it doesn't own
// any of their logic. Each tool's own portaled overlays/panels/gates are
// unaffected by being nested here, since portals render to document.body
// regardless of where in the tree they're mounted.
//
// floating={true} (mobile prototypes only): renders as a compact, fixed
// top-right pill instead of a full-width sticky bar — the mobile phone
// mockup is narrow and horizontally centered with the toolbar occupying
// otherwise-empty page background to its right, so pushing it down a
// prototype's own content the way the full-width bar does for web
// prototypes isn't needed here, and would just waste vertical space above
// a mockup that's already much shorter than the viewport. Because it's
// position:fixed (out of document flow), it never actually overlaps the
// centered phone frame either. See Styles/mobile.css's .phone-wrap — it
// does NOT subtract --dev-toolbar-height, unlike every full-width-bar
// consumer, precisely because this variant reserves no flow space.
export default function DevToolbar({ children, floating = false }) {
  const [authUser, setAuthUser] = useState(null)

  // Independent of whether Dev Edit happens to be open right now — Sign
  // Out should be reachable any time the shared session is active, not
  // just while actively editing. See devToolbarBus.js's
  // announceSignOutRequest for why this doesn't call signOut(auth)
  // directly.
  useEffect(() => {
    return onAuthStateChanged(auth, setAuthUser)
  }, [])

  return (
    <div className={`dev-toolbar${floating ? ' dev-toolbar-floating' : ''}`} data-devtoolbar-ui="true">
      <div className="dev-toolbar-items">{children}</div>
      {authUser && (
        <button className="dev-toolbar-signout" onClick={() => announceSignOutRequest()}>
          <SignOutIcon />
          Sign out
        </button>
      )}
    </div>
  )
}
