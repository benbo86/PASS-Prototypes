import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '../../../Styles/main.css'
import '../../../Styles/colors.css'
// @font-face for the task-chip icon font (eltico/fa-solid/fa-regular) —
// reusing customer-profile/timeline's own icon mechanism, see App.jsx's
// TASK_TYPE_ICON comment. Safe to load alongside colors.css's own :root
// block — the Dev Edit `:root`-corruption bug this could once have
// triggered (see CLAUDE.md's Dev Edit history) was already fixed at its
// root (keyed by stylesheet index, not just selector).
import '../../../Styles/legacy.css'
import '../../../Styles/top-nav.css'
import '../../../Styles/side-nav.css'
import '../../../Styles/customer-profile-nav.css'
import '../../../Styles/dev-toolbar.css'
import '../../../Styles/dev-mode.css'
import '../../../Styles/dev-comments.css'
import '../../../Styles/dev-edit.css'
import '../../../Styles/wireframe-access.css'
import '../../../Styles/filter-dropdown.css'
import '../communications.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
