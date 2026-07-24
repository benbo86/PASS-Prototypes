// Save/Load/New — extracted out of Toolbar.jsx (v2), which now holds only
// the centered bottom drawing-tools icon bar. File operations live in
// their own small cluster, top-right, so the bottom bar stays purely about
// Frame/Shapes/Colour Fill as designed.
//
// v7: Save is always enabled (an empty name defaults to "Untitled" in
// App.jsx's performSave, so there's nothing left to block on) and the load
// dropdown merges two backends — `savedFiles` (local, dev-only, values
// prefixed `local:`) and `firestoreFiles` (shared/password-gated saves,
// values prefixed `cloud:`) — shown as separate optgroups so it's clear
// which is which. App.jsx's handleLoad reads the prefix to dispatch.
export default function FileControls({
  wireframeName,
  setWireframeName,
  onSave,
  saving,
  saveError,
  saveStatus,
  savedFiles,
  firestoreFiles,
  selectedLoadFile,
  setSelectedLoadFile,
  onLoad,
  onNew,
}) {
  return (
    <div className="wf-file-controls">
      <input
        className="wf-name-input"
        placeholder="Wireframe name"
        value={wireframeName}
        onChange={(e) => setWireframeName(e.target.value)}
      />
      <button className="wf-tool-btn wf-primary" onClick={onSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save'}
      </button>
      <select
        className="wf-load-select"
        value={selectedLoadFile}
        onChange={(e) => setSelectedLoadFile(e.target.value)}
      >
        <option value="">Load a wireframe…</option>
        {firestoreFiles.length > 0 && (
          <optgroup label="Shared">
            {firestoreFiles.map((f) => (
              <option key={f.id} value={`cloud:${f.id}`}>{f.name}</option>
            ))}
          </optgroup>
        )}
        {savedFiles.length > 0 && (
          <optgroup label="Local (this machine)">
            {savedFiles.map((f) => (
              <option key={f.fileName} value={`local:${f.fileName}`}>{f.name}</option>
            ))}
          </optgroup>
        )}
      </select>
      <button className="wf-tool-btn" onClick={onLoad} disabled={!selectedLoadFile}>Load</button>
      <button className="wf-tool-btn" onClick={onNew}>New</button>
      {saveError && <span className="wf-toolbar-error">{saveError}</span>}
      {saveStatus && <span className="wf-toolbar-status">{saveStatus}</span>}
    </div>
  )
}
