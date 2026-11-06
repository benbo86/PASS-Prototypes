import { useState, useRef, useEffect } from 'react'
import '../Styles/files-screen.css'
import StatusBar from './StatusBar'
import ScreenSlider from './ScreenSlider'

// Read-only Files (AIOP-25397): files uploaded on the web, shown in the app
// only while online. Shared by Customer Documents (a customer's files) and
// My Documents (the signed-in employee's own files).
//
//   <FilesSheet open files folders showFolders offline urlPrefix onClose />
//
// Slides up over whatever is behind it (closed with the X), keeps its content
// while sliding away. Folders mirror the web (one level) but nothing here edits
// them. Tapping a file opens a preview.
//   urlPrefix  optional, e.g. '?section=files', so an open folder survives a reload
//   showFolders  default true. False shows every file in one flat list, newest first
//                (no folder cards, no folder tags): files ahead of the folders work.

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'heic', 'webp']
const FILE_TYPE_PATHS = {
  image: "M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2M8.5 13.5l2.5 3.01L14.5 12l4.5 6H5z",
  document: "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8zm2 16H8v-2h8zm0-4H8v-2h8zm-3-5V3.5L18.5 9z",
}
const isImage = (extension) => IMAGE_EXTENSIONS.includes(extension?.toLowerCase())

const FileTypeIcon = ({ extension, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d={FILE_TYPE_PATHS[isImage(extension) ? 'image' : 'document']} />
  </svg>
)
const SearchIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M10.8488372,18.6872093 C12.627907,18.6872093 14.2813953,18.0802326 15.6,17.0755814 L19.2209302,20.6965116 C19.4302326,20.905814 19.7023256,21.0104651 19.9534884,21.0104651 C20.2046512,21.0104651 20.4976744,20.905814 20.6860465,20.6965116 C21.1046512,20.277907 21.1046512,19.6290698 20.6860465,19.2104651 L17.0860465,15.5895349 C18.0906977,14.2709302 18.6976744,12.6174419 18.6976744,10.8383721 C18.6976744,6.50581395 15.1813953,2.98953488 10.8488372,2.98953488 C6.51627907,2.98953488 3,6.50581395 3,10.8383721 C3,15.1709302 6.51627907,18.6872093 10.8488372,18.6872093 Z M10.8488372,5.08255814 C14.0093023,5.08255814 16.6046512,7.65697674 16.6046512,10.8383721 C16.6046512,14.0197674 14.0093023,16.594186 10.8488372,16.594186 C7.68837209,16.594186 5.09302326,13.9988372 5.09302326,10.8383721 C5.09302326,7.67790698 7.66744186,5.08255814 10.8488372,5.08255814 Z" fill="currentColor"/>
  </svg>
)
const FolderIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
  </svg>
)
const CloseIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
)
const ChevronLeftIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
)
// Icons/Cloud Offline.svg
const CloudOfflineIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" fill="currentColor"/>
    <line x1="2" y1="3" x2="22" y2="21" stroke="currentColor" strokeWidth="2"/>
  </svg>
)

const fmtFileDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

function FileRow({ file, folderName, onOpen }) {
  return (
    <button className="files-row" type="button" onClick={onOpen}>
      <span className="files-row-icon"><FileTypeIcon extension={file.extension} size={22} /></span>
      <span className="files-row-body">
        <div className="files-row-title">{file.name}</div>
        <div className="files-row-sub">{file.extension.toUpperCase()} · {file.size} · {fmtFileDate(file.uploaded)}</div>
        <div className="files-row-sub">Uploaded by {file.uploadedBy}</div>
        {folderName && <span className="files-folder-tag"><FolderIcon size={12} />{folderName}</span>}
      </span>
    </button>
  )
}

function FolderCard({ folder, count, onOpen }) {
  return (
    <div className="files-folder-card" onClick={onOpen} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') onOpen() }}>
      <span className="files-folder-card-icon"><FolderIcon /></span>
      <span className="files-folder-card-body">
        <span className="files-folder-card-name">{folder.name}</span>
        <div className="files-folder-card-count">{count} file{count === 1 ? '' : 's'}</div>
      </span>
    </div>
  )
}

function OfflineNotice() {
  return (
    <div className="files-offline">
      <CloudOfflineIcon size={40} />
      <h3>You're offline</h3>
      <p>Files are only available when you're online. Connect to the internet to see these files.</p>
    </div>
  )
}

// What the carer sees after tapping a file. A stand-in for the system file
// preview (which would open the real file, fetched with the web's get-file
// API): an image fills the width, a document shows as a page.
function FilePreviewScreen({ file, offline, onClose }) {
  return (
    <div className="files-root">
      <StatusBar />
      <div className="app-header">
        <button className="app-header-back" onClick={onClose} aria-label="Close preview"><CloseIcon /></button>
        <span className="app-header-title files-preview-title">{file ? `${file.name}.${file.extension}` : ''}</span>
        <div style={{ width: 36 }} />
      </div>
      <div className="files-preview-body">
        {offline ? <OfflineNotice /> : file && (
          <>
            {isImage(file.extension) ? (
              <div className="files-preview-image" role="img" aria-label={file.name}>
                <div className="files-preview-sun" />
                <div className="files-preview-hill files-preview-hill--back" />
                <div className="files-preview-hill files-preview-hill--front" />
              </div>
            ) : (
              <div className="files-preview-page" aria-label={file.name}>
                <div className="files-preview-page-title" />
                {[100, 92, 96, 70, 0, 98, 90, 94, 60, 0, 96, 88, 40].map((w, i) => (
                  w === 0 ? <div key={i} className="files-preview-page-gap" /> : <div key={i} className="files-preview-line" style={{ width: `${w}%` }} />
                ))}
              </div>
            )}
            <div className="files-preview-meta">{file.extension.toUpperCase()} · {file.size} · Uploaded by {file.uploadedBy}</div>
          </>
        )}
      </div>
    </div>
  )
}

function useSlideUp() {
  const [active, setActive] = useState(false)
  const [mounted, setMounted] = useState(false)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])
  return {
    active, mounted,
    open: () => { clearTimeout(timer.current); setMounted(true); requestAnimationFrame(() => requestAnimationFrame(() => setActive(true))) },
    close: () => { setActive(false); timer.current = setTimeout(() => setMounted(false), 300) },
  }
}

function FilesScreen({ files: allFiles, folders: allFolders, showFolders = true, offline, urlPrefix, onClose }) {
  const folders = showFolders ? allFolders : []
  // Newest upload first, as on the web.
  const files = [...allFiles].sort((a, b) => b.uploaded.localeCompare(a.uploaded))
  const [folderId, setFolderId] = useState(() => {
    const p = new URLSearchParams(window.location.search)
    return urlPrefix && window.location.search.startsWith(urlPrefix) ? p.get('folder') : null
  })
  const [searchText, setSearchText] = useState('')
  const preview = useSlideUp()
  const [previewFile, setPreviewFile] = useState(null)

  const openFolder = (id) => { if (urlPrefix) history.pushState(null, '', `${urlPrefix}&folder=${id}`); setFolderId(id) }
  const closeFolder = () => { if (urlPrefix) history.pushState(null, '', urlPrefix); setFolderId(null) }
  const openFile = (file) => { setPreviewFile(file); preview.open() }

  const openFolderObj = folders.find(f => f.id === folderId) || null
  const q = searchText.trim().toLowerCase()
  const searching = q !== ''
  const matches = searching
    ? files.filter(f => `${f.name}.${f.extension}`.toLowerCase().includes(q))
        .map(f => ({ ...f, folderName: folders.find(fo => fo.id === f.folderId)?.name || null }))
    : []
  const looseFiles = showFolders ? files.filter(f => !f.folderId) : files
  const row = (f) => <FileRow key={f.id} file={f} folderName={f.folderName} onOpen={() => openFile(f)} />

  return (
    <>
      <ScreenSlider
        secondaryActive={!!openFolderObj}
        primary={
          <div className="files-root">
            <StatusBar />
            <div className="files-screen">
              <div className="app-header">
                <button className="app-header-back" onClick={onClose} aria-label="Close"><CloseIcon /></button>
                <span className="app-header-title">Files</span>
                <div style={{ width: 36 }} />
              </div>
              {offline ? (
                <div className="files-body"><OfflineNotice /></div>
              ) : (
                <>
                  <div className="files-search-bar">
                    <div className="files-search-input">
                      <SearchIcon size={18} />
                      <input type="text" placeholder="Search" value={searchText} onChange={e => setSearchText(e.target.value)} />
                    </div>
                  </div>
                  <div className="files-body">
                    {searching ? (
                      matches.length === 0
                        ? <div className="files-empty">No files match your search.</div>
                        : matches.map(row)
                    ) : files.length === 0 ? (
                      <div className="files-empty">No files have been uploaded.</div>
                    ) : (
                      <>
                        {folders.map(folder => (
                          <FolderCard key={folder.id} folder={folder} count={files.filter(f => f.folderId === folder.id).length} onOpen={() => openFolder(folder.id)} />
                        ))}
                        {looseFiles.map(row)}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        }
        secondary={
          openFolderObj ? (
            <div className="files-root">
              <StatusBar />
              <div className="files-screen">
                <div className="app-header">
                  <button className="app-header-back" onClick={closeFolder} aria-label="Back"><ChevronLeftIcon /></button>
                  <span className="app-header-title">{openFolderObj.name}</span>
                  <div style={{ width: 36 }} />
                </div>
                <div className="files-body">
                  {files.filter(f => f.folderId === openFolderObj.id).length === 0
                    ? <div className="files-empty">This folder has no files.</div>
                    : files.filter(f => f.folderId === openFolderObj.id).map(row)}
                </div>
              </div>
            </div>
          ) : <div className="files-root" />
        }
      />
      <div className={`files-sheet-slide${preview.active ? ' files-sheet-active' : ''}`}>
        {preview.mounted && <FilePreviewScreen file={previewFile} offline={offline} onClose={preview.close} />}
      </div>
    </>
  )
}

// The slide-up wrapper. Mounted while open or sliding away.
export function FilesSheet({ open, ...props }) {
  const [mounted, setMounted] = useState(open)
  useEffect(() => {
    if (open) { setMounted(true); return }
    const t = setTimeout(() => setMounted(false), 300)
    return () => clearTimeout(t)
  }, [open])
  return (
    <div className={`files-sheet-slide${open ? ' files-sheet-active' : ''}`}>
      {mounted && <FilesScreen {...props} />}
    </div>
  )
}

// Prototype control, outside the phone: show the offline state.
export function OfflineToggle({ offline, onChange }) {
  return (
    <label className="files-offline-toggle">
      <input type="checkbox" checked={offline} onChange={e => onChange(e.target.checked)} />
      Simulate offline
    </label>
  )
}

// Prototype control, outside the phone: show files in folders or one flat list.
export function FoldersToggle({ showFolders, onChange }) {
  return (
    <label className="files-offline-toggle files-folders-toggle">
      <input type="checkbox" checked={showFolders} onChange={e => onChange(e.target.checked)} />
      Show folders
    </label>
  )
}
