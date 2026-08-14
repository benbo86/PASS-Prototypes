// Shared static-HTML-gallery generator backing both research/mobile-icons/
// index.html and research/pass-icons/index.html. Both used to be (or, for
// pass-icons, would otherwise have been) hand-authored one-off files —
// this is the one shared page shell (CSS + the vanilla-JS copy/download/
// zip apparatus, no external dependency, lifted verbatim from the original
// hand-built mobile-icons page) so both galleries stay visually/behaviourally
// identical and a future tweak to one applies to both. Only the intro text
// and the grouped card content differ per page. Plain Node/ESM, no deps —
// imported by iconLibraryPlugin.js, which supplies the actual icon data.

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, '&quot;')
}

function nativeSizeOf(svg) {
  const w = /\swidth="([\d.]+)"/.exec(svg)
  const h = /\sheight="([\d.]+)"/.exec(svg)
  return w && h ? `${w[1]}×${h[1]}` : ''
}

function renderCard(icon) {
  const note = icon.note || ''
  const safeNote = note.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  const filename = `${safeNote ? `${icon.name}-${safeNote}` : icon.name}.svg`
  const labelHtml = note
    ? `${escapeHtml(icon.name)} <span class="native-size">(${escapeHtml(note)})</span>`
    : escapeHtml(icon.name)
  const nativeSize = nativeSizeOf(icon.svg)
  return `
      <div class="card" tabindex="0" role="button" data-name="${escapeAttr(icon.name)}"${note ? ` data-note="${escapeAttr(note)}"` : ''} onclick="copySvg(this)" onkeydown="if(event.key==='Enter'){copySvg(this)}">
        <label class="card-check" onclick="event.stopPropagation()" title="Select for group download">
          <input type="checkbox" onchange="updateSelectionBar()">
        </label>
        <button class="card-dl" title="Download ${escapeAttr(filename)}" onclick="event.stopPropagation(); downloadIcon(this)"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg></button>
        <span class="icon-preview">${icon.svg}</span>
        <span class="label">${labelHtml}</span>
        <span class="native-size">${nativeSize}</span>
        <template class="svg-src">${escapeHtml(icon.svg)}</template>
      </div>`
}

function renderSection(group, index, enableUpload) {
  const slug = group.slug || `section-${index}`
  const cardsHtml = group.icons.map(renderCard).join('\n')
  const count = `${group.icons.length} icon${group.icons.length === 1 ? '' : 's'}`
  const subtitle = group.subtitle ? ` &middot; ${escapeHtml(group.subtitle)}` : ''
  const description = group.description ? `\n    <p class="section-desc">${escapeHtml(group.description)}</p>` : ''
  // The title goes inside both an HTML attribute (onclick="...") AND, once
  // the browser decodes that attribute's entities, a single-quoted JS
  // string literal — escapeAttr handles the former, the \' replace handles
  // the latter (JS-string-escape a literal quote, not an HTML entity for
  // it, since entity decoding happens BEFORE the JS parser ever sees this).
  const uploadBtn = enableUpload
    ? `<button class="section-upload-btn" onclick="openUploadPanel('${escapeAttr(group.title).replace(/'/g, "\\'")}')">Upload icon</button>`
    : ''
  return `
  <section data-section-slug="${escapeAttr(slug)}">
    <div class="section-head"><h2>${escapeHtml(group.title)}</h2><span class="count">${count}${subtitle}</span>${uploadBtn}<button class="section-dl-btn" onclick="downloadSection(this)">Download section (.zip)</button></div>${description}
    <div class="grid">
${cardsHtml}
    </div>
  </section>`
}

const PAGE_STYLE = `
  :root {
    --bg: #f6f5f9; --bg-inset: #eeecf3; --card: #ffffff; --border: #e2dfe9;
    --text: #211f28; --text-muted: #7a7686; --accent: #6d1b98; --accent-soft: #f1e6f9;
    --shadow: 0 1px 2px rgba(30,20,50,0.06), 0 2px 8px rgba(30,20,50,0.05);
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #19171d; --bg-inset: #211f26; --card: #24222a; --border: #35323c;
      --text: #ece9f1; --text-muted: #a29cae; --accent: #c896ea; --accent-soft: #322938;
      --shadow: 0 1px 2px rgba(0,0,0,0.3), 0 2px 10px rgba(0,0,0,0.25);
    }
  }
  :root[data-theme="dark"] {
    --bg: #19171d; --bg-inset: #211f26; --card: #24222a; --border: #35323c;
    --text: #ece9f1; --text-muted: #a29cae; --accent: #c896ea; --accent-soft: #322938;
    --shadow: 0 1px 2px rgba(0,0,0,0.3), 0 2px 10px rgba(0,0,0,0.25);
  }
  :root[data-theme="light"] {
    --bg: #f6f5f9; --bg-inset: #eeecf3; --card: #ffffff; --border: #e2dfe9;
    --text: #211f28; --text-muted: #7a7686; --accent: #6d1b98; --accent-soft: #f1e6f9;
    --shadow: 0 1px 2px rgba(30,20,50,0.06), 0 2px 8px rgba(30,20,50,0.05);
  }

  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    background: var(--bg); color: var(--text);
    font-family: -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif;
    padding: 40px 32px 100px; min-height: 100vh;
  }
  .wrap { max-width: 1100px; margin: 0 auto; }
  .eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); margin: 0 0 8px; }
  h1 { font-size: 26px; font-weight: 700; margin: 0 0 6px; text-wrap: balance; letter-spacing: -0.01em; }
  .sub { font-size: 14.5px; color: var(--text-muted); max-width: 68ch; line-height: 1.55; margin: 0 0 16px; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background: rgba(120,100,150,0.12); padding: 1px 5px; border-radius: 3px; font-size: 12.5px; }

  .top-actions { margin-bottom: 28px; }
  .download-all-btn {
    font-family: inherit; font-size: 13px; font-weight: 600; color: #fff; background: var(--accent);
    border: none; border-radius: 8px; padding: 9px 16px; cursor: pointer;
  }
  .download-all-btn:hover { filter: brightness(1.08); }

  section { margin-bottom: 44px; }
  .section-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 6px; flex-wrap: wrap; }
  .section-head h2 { font-size: 17px; font-weight: 700; margin: 0; }
  .section-head .count { font-size: 12.5px; color: var(--text-muted); }
  .section-desc { font-size: 13px; color: var(--text-muted); margin: 0 0 16px; max-width: 68ch; line-height: 1.5; }
  .section-dl-btn {
    margin-left: auto; font-family: inherit; font-size: 12px; font-weight: 600; color: var(--accent);
    background: var(--accent-soft); border: none; border-radius: 6px; padding: 5px 10px; cursor: pointer; white-space: nowrap;
  }
  .section-dl-btn:hover { filter: brightness(0.96); }
  .section-upload-btn {
    font-family: inherit; font-size: 12px; font-weight: 600; color: var(--accent);
    background: var(--accent-soft); border: none; border-radius: 6px; padding: 5px 10px; cursor: pointer; white-space: nowrap;
  }
  .section-upload-btn:hover { filter: brightness(0.96); }
  .new-section-upload-btn {
    font-family: inherit; font-size: 13px; font-weight: 600; color: var(--accent); background: var(--card);
    border: 1px solid var(--border); border-radius: 8px; padding: 9px 16px; cursor: pointer; margin-left: 10px;
  }
  .new-section-upload-btn:hover { background: var(--accent-soft); }

  .upload-overlay {
    position: fixed; inset: 0; background: rgba(20,15,30,0.45); z-index: 400;
    display: flex; align-items: center; justify-content: center;
    opacity: 0; pointer-events: none; transition: opacity 0.15s ease;
  }
  .upload-overlay.show { opacity: 1; pointer-events: auto; }
  .upload-panel {
    background: var(--card); border: 1px solid var(--border); box-shadow: var(--shadow);
    border-radius: 12px; padding: 24px; width: 340px; max-width: 90vw;
    display: flex; flex-direction: column; gap: 14px;
  }
  .upload-panel h3 { margin: 0; font-size: 16px; font-weight: 700; }
  .upload-field { display: flex; flex-direction: column; gap: 5px; font-size: 12.5px; color: var(--text-muted); font-weight: 600; }
  .upload-field input {
    font-family: inherit; font-size: 13.5px; color: var(--text); background: var(--bg-inset);
    border: 1px solid var(--border); border-radius: 6px; padding: 8px 10px;
  }
  .upload-field input:disabled { opacity: 0.65; }
  .upload-error { font-size: 12.5px; color: #c0392b; min-height: 1em; }
  .upload-actions { display: flex; justify-content: flex-end; gap: 10px; }
  .upload-actions button { font-family: inherit; font-size: 13px; font-weight: 600; border: none; border-radius: 7px; padding: 8px 14px; cursor: pointer; }
  .upload-cancel-btn { background: transparent; color: var(--text-muted); }
  .upload-cancel-btn:hover { color: var(--text); }
  .upload-submit-btn { background: var(--accent); color: #fff; }
  .upload-submit-btn:hover { filter: brightness(1.08); }
  .upload-submit-btn:disabled { opacity: 0.6; cursor: default; }

  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(128px, 1fr)); gap: 12px; }

  .card {
    position: relative;
    font-family: inherit; background: var(--card); border: 1px solid var(--border); box-shadow: var(--shadow);
    border-radius: 10px; padding: 16px 8px 12px; display: flex; flex-direction: column; align-items: center;
    text-align: center; gap: 8px; cursor: pointer; transition: transform 0.12s ease, box-shadow 0.12s ease; color: inherit;
  }
  .card:hover { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(30,20,50,0.12); }
  .card:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

  .card-check {
    position: absolute; top: 6px; left: 6px; width: 20px; height: 20px;
    display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 2;
  }
  .card-check input { width: 14px; height: 14px; cursor: pointer; accent-color: var(--accent); margin: 0; }

  .card-dl {
    position: absolute; top: 4px; right: 4px; width: 22px; height: 22px; z-index: 2;
    border: none; background: transparent; border-radius: 6px; padding: 0;
    display: flex; align-items: center; justify-content: center;
    color: var(--text-muted); cursor: pointer;
  }
  .card-dl:hover { background: var(--bg-inset); color: var(--accent); }
  .card-dl svg { width: 14px; height: 14px; }

  /* The "24x24 canvas" — every icon preview renders inside this fixed box,
     scaled to fit (not stretched), regardless of the icon's native size —
     so icons authored at 16x16, 17x12, 26x13 etc. all sit consistently
     alongside true 24x24 icons in the grid. */
  .icon-preview {
    width: 24px; height: 24px; flex-shrink: 0; margin-top: 6px;
    display: flex; align-items: center; justify-content: center;
    color: var(--accent);
  }
  .icon-preview svg { max-width: 24px; max-height: 24px; width: auto; height: auto; display: block; }

  .label { font-size: 11.5px; color: var(--text); line-height: 1.3; word-break: break-word; }
  .native-size { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 10px; color: var(--text-muted); }

  .toast {
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(12px);
    background: var(--text); color: var(--bg); font-size: 13px; padding: 9px 16px; border-radius: 7px;
    opacity: 0; pointer-events: none; transition: opacity 0.15s ease, transform 0.15s ease;
    max-width: 80vw; text-align: center; z-index: 300;
  }
  .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
  @media (prefers-reduced-motion: reduce) { .card, .toast, .selection-bar { transition: none; } }

  .selection-bar {
    position: fixed; bottom: 24px; right: 24px; z-index: 250;
    background: var(--card); border: 1px solid var(--border); box-shadow: var(--shadow);
    border-radius: 12px; padding: 10px 14px; display: flex; align-items: center; gap: 10px;
    transform: translateY(12px); opacity: 0; pointer-events: none; transition: opacity 0.15s ease, transform 0.15s ease;
    font-size: 13px;
  }
  .selection-bar.show { opacity: 1; transform: translateY(0); pointer-events: auto; }
  .selection-bar button {
    font-family: inherit; font-size: 12.5px; font-weight: 600; border: none; border-radius: 7px;
    padding: 7px 12px; cursor: pointer;
  }
  .selection-bar .dl-btn { background: var(--accent); color: #fff; }
  .selection-bar .dl-btn:hover { filter: brightness(1.08); }
  .selection-bar .clear-btn { background: transparent; color: var(--text-muted); }
  .selection-bar .clear-btn:hover { color: var(--text); }

  /* Back link — hand-styled to match the shared .back-link convention
     without importing main.css, since this page runs its own
     self-contained palette rather than the app's design system. */
  .back-link {
    position: fixed;
    bottom: 24px;
    left: 24px;
    z-index: 200;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: #9a26d6;
    color: #fff;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.18);
    transition: background 0.15s;
  }
  .back-link:hover { background: #8421b8; }
  .back-link svg { display: block; }
`

// Identical to the original hand-built mobile-icons page's own script,
// verbatim — a minimal, dependency-free ZIP writer (store method, no
// compression) plus copy/download/selection wiring. zipPrefix is the only
// per-page parameter.
function pageScript(zipPrefix) {
  return `
  function copySvg(card) {
    const tmpl = card.querySelector('.svg-src');
    const code = tmpl.content.textContent.trim();
    navigator.clipboard?.writeText(code);
    const label = card.querySelector('.label').textContent.trim();
    showToast('Copied ' + label + ' SVG');
  }

  function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(window.__t);
    window.__t = setTimeout(() => toast.classList.remove('show'), 1400);
  }

  function getCardData(card) {
    const name = card.dataset.name;
    const note = card.dataset.note || '';
    const code = card.querySelector('.svg-src').content.textContent.trim();
    const safeNote = note.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const filename = (safeNote ? name + '-' + safeNote : name) + '.svg';
    return { name, note, code, filename };
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function downloadIcon(btn) {
    const card = btn.closest('.card');
    const { code, filename } = getCardData(card);
    downloadBlob(new Blob([code], { type: 'image/svg+xml' }), filename);
    showToast('Downloaded ' + filename);
  }

  // ── Minimal ZIP writer (store method, no compression) ──────────
  function crc32(buf) {
    let crc = 0 ^ (-1);
    for (let i = 0; i < buf.length; i++) {
      let c = (crc ^ buf[i]) & 0xFF;
      for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      crc = (crc >>> 8) ^ c;
    }
    return (crc ^ (-1)) >>> 0;
  }

  function makeZip(files) {
    const encoder = new TextEncoder();
    let offset = 0;
    const localParts = [];
    const fileRecords = [];

    for (const f of files) {
      const nameBytes = encoder.encode(f.name);
      const data = f.data;
      const crc = crc32(data);
      const size = data.length;

      const local = new Uint8Array(30 + nameBytes.length);
      const lv = new DataView(local.buffer);
      lv.setUint32(0, 0x04034b50, true);
      lv.setUint16(4, 20, true);
      lv.setUint16(6, 0, true);
      lv.setUint16(8, 0, true);
      lv.setUint16(10, 0, true);
      lv.setUint16(12, 0, true);
      lv.setUint32(14, crc, true);
      lv.setUint32(18, size, true);
      lv.setUint32(22, size, true);
      lv.setUint16(26, nameBytes.length, true);
      lv.setUint16(28, 0, true);
      local.set(nameBytes, 30);

      fileRecords.push({ nameBytes, crc, size, offset });
      localParts.push(local, data);
      offset += local.length + data.length;
    }

    const centralParts = [];
    let centralSize = 0;
    for (const rec of fileRecords) {
      const central = new Uint8Array(46 + rec.nameBytes.length);
      const cv = new DataView(central.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint16(8, 0, true);
      cv.setUint16(10, 0, true);
      cv.setUint16(12, 0, true);
      cv.setUint16(14, 0, true);
      cv.setUint32(16, rec.crc, true);
      cv.setUint32(20, rec.size, true);
      cv.setUint32(24, rec.size, true);
      cv.setUint16(28, rec.nameBytes.length, true);
      cv.setUint16(30, 0, true);
      cv.setUint16(32, 0, true);
      cv.setUint16(34, 0, true);
      cv.setUint16(36, 0, true);
      cv.setUint32(38, 0, true);
      cv.setUint32(42, rec.offset, true);
      central.set(rec.nameBytes, 46);
      centralParts.push(central);
      centralSize += central.length;
    }

    const centralOffset = offset;
    const eocd = new Uint8Array(22);
    const ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(4, 0, true);
    ev.setUint16(6, 0, true);
    ev.setUint16(8, files.length, true);
    ev.setUint16(10, files.length, true);
    ev.setUint32(12, centralSize, true);
    ev.setUint32(16, centralOffset, true);
    ev.setUint16(20, 0, true);

    return new Blob([...localParts, ...centralParts, eocd], { type: 'application/zip' });
  }

  function cardsToZipFiles(cards) {
    const encoder = new TextEncoder();
    return Array.from(cards).map(c => {
      const { code, filename } = getCardData(c);
      return { name: filename, data: encoder.encode(code) };
    });
  }

  function downloadSection(btn) {
    const section = btn.closest('section');
    const cards = section.querySelectorAll('.card');
    const slug = section.dataset.sectionSlug || 'icons';
    downloadBlob(makeZip(cardsToZipFiles(cards)), '${zipPrefix}-' + slug + '.zip');
    showToast('Downloaded ' + cards.length + ' icons (.zip)');
  }

  function downloadAll() {
    const cards = document.querySelectorAll('.card');
    downloadBlob(makeZip(cardsToZipFiles(cards)), '${zipPrefix}-all.zip');
    showToast('Downloaded ' + cards.length + ' icons (.zip)');
  }

  function updateSelectionBar() {
    const checked = document.querySelectorAll('.card input[type=checkbox]:checked');
    const bar = document.getElementById('selection-bar');
    document.getElementById('selection-count').textContent = checked.length + ' selected';
    bar.classList.toggle('show', checked.length > 0);
  }

  function downloadSelected() {
    const checked = document.querySelectorAll('.card input[type=checkbox]:checked');
    const cards = Array.from(checked).map(cb => cb.closest('.card'));
    downloadBlob(makeZip(cardsToZipFiles(cards)), '${zipPrefix}-selected.zip');
    showToast('Downloaded ' + cards.length + ' icons (.zip)');
  }

  function clearSelection() {
    document.querySelectorAll('.card input[type=checkbox]:checked').forEach(cb => cb.checked = false);
    updateSelectionBar();
  }

  // ── Upload (only wired up when enableUpload rendered the panel/buttons —
  // harmless if never called on a page without them) ─────────────────
  function openUploadPanel(sectionTitle) {
    const overlay = document.getElementById('upload-overlay');
    const sectionInput = document.getElementById('upload-section-input');
    const titleEl = document.getElementById('upload-panel-title');
    document.getElementById('upload-error').textContent = '';
    document.getElementById('upload-name-input').value = '';
    document.getElementById('upload-file-input').value = '';
    if (sectionTitle) {
      sectionInput.value = sectionTitle;
      sectionInput.disabled = true;
      titleEl.textContent = 'Upload icon to "' + sectionTitle + '"';
    } else {
      sectionInput.value = '';
      sectionInput.disabled = false;
      titleEl.textContent = 'Upload icon to a new section';
    }
    overlay.classList.add('show');
  }

  function closeUploadPanel() {
    document.getElementById('upload-overlay').classList.remove('show');
  }

  async function submitUpload() {
    const section = document.getElementById('upload-section-input').value.trim();
    const name = document.getElementById('upload-name-input').value.trim();
    const fileInput = document.getElementById('upload-file-input');
    const errorEl = document.getElementById('upload-error');
    const submitBtn = document.getElementById('upload-submit-btn');
    errorEl.textContent = '';
    if (!section) { errorEl.textContent = 'Section name is required.'; return; }
    if (!name) { errorEl.textContent = 'Icon name is required.'; return; }
    const file = fileInput.files[0];
    if (!file) { errorEl.textContent = 'Choose an .svg file.'; return; }
    const text = await file.text();
    if (text.toLowerCase().indexOf('<svg') === -1) { errorEl.textContent = 'That doesn’t look like a valid SVG file.'; return; }
    submitBtn.disabled = true;
    submitBtn.textContent = 'Uploading…';
    try {
      const res = await fetch('/__icon-library/upload', {
        method: 'POST',
        body: JSON.stringify({ section: section, name: name, svg: text }),
      });
      let data;
      try { data = await res.json(); } catch (parseErr) { throw new Error('local-only'); }
      if (!data.ok) throw new Error(data.error || 'Upload failed.');
      showToast('Uploaded ' + name + ' — reloading…');
      setTimeout(function () { location.reload(); }, 600);
    } catch (err) {
      // A real {ok:false, error} response (bad name, duplicate, etc.) shows
      // that message directly. Anything else (network failure, or a 404's
      // own HTML page instead of JSON — e.g. this static page viewed on a
      // deployed site with no dev server behind it) gets the generic hint.
      errorEl.textContent = err.message === 'local-only'
        ? 'Upload failed — this only works while running npm run dev locally.'
        : err.message;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Upload';
    }
  }
`
}

// groups: [{ title, subtitle?, description?, slug?, icons: [{name, svg, note?}] }]
// enableUpload: only true for the mobile page (iconLibraryPlugin.js's
// generateMobileHtml) — the PASS page's own call site omits it, so its
// output stays byte-for-byte what it was before this option existed.
export function renderSpecimenPage({ title, eyebrow, heading, descriptionHtml, zipPrefix, groups, enableUpload = false }) {
  const totalCount = groups.reduce((n, g) => n + g.icons.length, 0)
  const sectionsHtml = groups.map((g, i) => renderSection(g, i, enableUpload)).join('\n')
  const newSectionUploadBtn = enableUpload
    ? `<button class="new-section-upload-btn" onclick="openUploadPanel(null)">Upload icon to a new section</button>`
    : ''
  const uploadPanelHtml = enableUpload ? `
<div class="upload-overlay" id="upload-overlay" onclick="if (event.target === this) closeUploadPanel()">
  <div class="upload-panel">
    <h3 id="upload-panel-title">Upload icon</h3>
    <label class="upload-field">
      <span>Section</span>
      <input type="text" id="upload-section-input" placeholder="e.g. Staff Messaging">
    </label>
    <label class="upload-field">
      <span>Icon name</span>
      <input type="text" id="upload-name-input" placeholder="e.g. pin">
    </label>
    <label class="upload-field">
      <span>SVG file</span>
      <input type="file" id="upload-file-input" accept=".svg,image/svg+xml">
    </label>
    <div class="upload-error" id="upload-error"></div>
    <div class="upload-actions">
      <button class="upload-cancel-btn" onclick="closeUploadPanel()">Cancel</button>
      <button class="upload-submit-btn" id="upload-submit-btn" onclick="submitUpload()">Upload</button>
    </div>
  </div>
</div>` : ''
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<style>${PAGE_STYLE}</style>
</head>
<body>

<a href="../../" class="back-link">
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
  Prototypes
</a>

<div class="wrap">
  <p class="eyebrow">${escapeHtml(eyebrow)}</p>
  <h1>${escapeHtml(heading)}</h1>
  <p class="sub">${descriptionHtml}</p>

  <div class="top-actions">
    <button class="download-all-btn" onclick="downloadAll()">Download all ${totalCount} icons (.zip)</button>
    ${newSectionUploadBtn}
  </div>
${sectionsHtml}
</div>

<div class="toast" id="toast">Copied</div>

<div class="selection-bar" id="selection-bar">
  <span id="selection-count">0 selected</span>
  <button class="dl-btn" onclick="downloadSelected()">Download (.zip)</button>
  <button class="clear-btn" onclick="clearSelection()">Clear</button>
</div>
${uploadPanelHtml}

<script>${pageScript(zipPrefix)}</script>
</body>
</html>
`
}
