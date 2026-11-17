/* PASS page capture. Runs as a bookmarklet (or pasted into the DevTools console) on any web page,
   including logged-in ones. Pick an element and it saves a JSON file with the element tree, the
   computed styles that differ from browser defaults, sizes and positions, fonts and CSS variables. */
(function () {
  if (window.__passCapture) { window.__passCapture.stop(); return; }

  var MAX_NODES = 6000;
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, LINK: 1, META: 1, TEMPLATE: 1, HEAD: 1, TITLE: 1, BASE: 1 };
  var PROPS = ['display', 'position', 'top', 'right', 'bottom', 'left', 'z-index', 'box-sizing',
    'min-width', 'max-width', 'min-height', 'max-height', 'margin', 'padding',
    'border-width', 'border-style', 'border-color', 'border-radius',
    'background-color', 'background-image', 'background-size', 'background-position', 'background-repeat',
    'color', 'opacity', 'box-shadow', 'font-family', 'font-size', 'font-weight', 'font-style', 'line-height',
    'letter-spacing', 'text-align', 'text-transform', 'text-decoration-line', 'text-overflow', 'white-space',
    'word-break', 'vertical-align', 'overflow-x', 'overflow-y',
    'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink', 'flex-basis', 'justify-content', 'align-items',
    'align-self', 'align-content', 'gap', 'grid-template-columns', 'grid-template-rows', 'grid-column', 'grid-row',
    'order', 'cursor', 'transform', 'visibility', 'pointer-events', 'fill', 'stroke', 'stroke-width',
    'object-fit', 'list-style-type', 'table-layout', 'border-collapse'];
  var INHERITED = { 'color': 1, 'font-family': 1, 'font-size': 1, 'font-weight': 1, 'font-style': 1, 'line-height': 1,
    'letter-spacing': 1, 'text-align': 1, 'text-transform': 1, 'white-space': 1, 'word-break': 1, 'cursor': 1,
    'visibility': 1, 'fill': 1, 'stroke': 1, 'list-style-type': 1, 'border-collapse': 1 };
  var KEEP_ATTRS = ['id', 'class', 'href', 'src', 'srcset', 'alt', 'title', 'role', 'type', 'name', 'placeholder', 'for',
    'disabled', 'checked', 'selected', 'colspan', 'rowspan', 'target', 'tabindex', 'contenteditable', 'draggable'];

  var UI = 'data-pass-capture-ui';
  var mask = false;
  var hover = null;
  var leaf = null;
  var frame = null;
  var defaults = {};
  var nodes = 0;
  var fontUse = {};

  function maskText(s) {
    return mask ? s.replace(/[A-Za-z]/g, 'x').replace(/[0-9]/g, '0') : s;
  }

  function baseline(tag) {
    if (defaults[tag]) return defaults[tag];
    var out = {};
    try {
      if (!frame) {
        frame = document.createElement('iframe');
        frame.setAttribute(UI, '1');
        frame.style.cssText = 'position:fixed;left:-9999px;top:0;width:0;height:0;border:0;visibility:hidden';
        document.documentElement.appendChild(frame);
      }
      var d = frame.contentDocument;
      var el = d.createElement(tag);
      d.body.appendChild(el);
      var cs = frame.contentWindow.getComputedStyle(el);
      PROPS.forEach(function (p) { out[p] = cs.getPropertyValue(p); });
      d.body.removeChild(el);
    } catch (e) { out = {}; }
    defaults[tag] = out;
    return out;
  }

  function styles(cs, parentCs, base) {
    var s = {};
    PROPS.forEach(function (p) {
      var v = cs.getPropertyValue(p);
      if (v === '' || v === base[p]) return;
      if (INHERITED[p] && parentCs && parentCs.getPropertyValue(p) === v) return;
      s[p] = v;
    });
    // Noise: border colour/width mean nothing without a border style, and auto is the usual min size.
    if (!s['border-style']) { delete s['border-color']; delete s['border-width']; }
    if (s['min-width'] === 'auto') delete s['min-width'];
    if (s['min-height'] === 'auto') delete s['min-height'];
    return s;
  }

  function attrs(el) {
    var a = {};
    KEEP_ATTRS.forEach(function (n) {
      if (!el.hasAttribute(n)) return;
      var v = el.getAttribute(n);
      if ((n === 'src' || n === 'href') && /^data:/i.test(v)) v = '[data-uri]';
      if (n === 'title' || n === 'alt' || n === 'placeholder') v = maskText(v);
      a[n] = v;
    });
    for (var i = 0; i < el.attributes.length; i++) {
      var at = el.attributes[i];
      if (/^aria-/.test(at.name)) a[at.name] = /label|description/.test(at.name) ? maskText(at.value) : at.value;
    }
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
      var t = (el.getAttribute('type') || '').toLowerCase();
      if (t !== 'password' && t !== 'hidden' && el.value) a.value = maskText(String(el.value));
    }
    return a;
  }

  function pseudo(el, which) {
    var cs = getComputedStyle(el, which);
    var c = cs.getPropertyValue('content');
    if (!c || c === 'none' || c === 'normal') return null;
    var s = {};
    ['display', 'position', 'width', 'height', 'color', 'background-color', 'background-image', 'font-family',
      'font-size', 'font-weight', 'border-radius', 'margin', 'padding', 'transform'].forEach(function (p) {
      var v = cs.getPropertyValue(p);
      if (v) s[p] = v;
    });
    return { content: maskText(c), s: s };
  }

  function walk(el, origin, parentCs) {
    if (nodes >= MAX_NODES) return null;
    var tag = el.tagName.toLowerCase();
    var cs = getComputedStyle(el);
    if (cs.display === 'none') return null;
    nodes++;
    var r = el.getBoundingClientRect();
    var node = { t: tag, r: [Math.round(r.left - origin.x), Math.round(r.top - origin.y), Math.round(r.width * 10) / 10, Math.round(r.height * 10) / 10] };
    var a = attrs(el);
    if (Object.keys(a).length) node.a = a;
    var s = styles(cs, parentCs, baseline(tag));
    if (Object.keys(s).length) node.s = s;
    if (s['font-family']) fontUse[s['font-family']] = 1;

    var b = pseudo(el, '::before'), f = pseudo(el, '::after');
    if (b || f) node.p = { before: b || undefined, after: f || undefined };

    if (tag === 'svg') {
      var html = el.outerHTML;
      node.svg = html.length > 20000 ? '[svg too large]' : html;
      return node;
    }
    if (tag === 'iframe' || tag === 'canvas' || tag === 'video') { node.note = 'not captured'; return node; }

    var kids = [];
    for (var n = el.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 3) {
        var txt = n.nodeValue.replace(/\s+/g, ' ').trim();
        if (txt) kids.push(maskText(txt));
      } else if (n.nodeType === 1 && !SKIP[n.tagName] && !n.hasAttribute(UI)) {
        var k = walk(n, origin, cs);
        if (k) kids.push(k);
      }
    }
    if (kids.length) node.c = kids;
    return node;
  }

  function rootVars() {
    var names = {};
    var out = {};
    var cs = getComputedStyle(document.documentElement);
    for (var i = 0; i < document.styleSheets.length; i++) {
      var rules;
      try { rules = document.styleSheets[i].cssRules; } catch (e) { continue; }
      for (var j = 0; j < rules.length; j++) {
        var r = rules[j];
        if (r.style && /^(:root|html|body)$/.test(r.selectorText || '')) {
          for (var k = 0; k < r.style.length; k++) if (r.style[k].indexOf('--') === 0) names[r.style[k]] = 1;
        }
      }
    }
    Object.keys(names).forEach(function (n) { out[n] = cs.getPropertyValue(n).trim(); });
    return out;
  }

  function fontFaces() {
    var out = [];
    for (var i = 0; i < document.styleSheets.length; i++) {
      var rules;
      try { rules = document.styleSheets[i].cssRules; } catch (e) { continue; }
      for (var j = 0; j < rules.length; j++) {
        var r = rules[j];
        if (r.type === 5) {
          var src = r.style.getPropertyValue('src');
          var urls = (src.match(/url\(([^)]+)\)/g) || []).map(function (u) { return u.slice(4, -1).replace(/^["']|["']$/g, ''); });
          out.push({ family: r.style.getPropertyValue('font-family').replace(/^["']|["']$/g, ''),
            weight: r.style.getPropertyValue('font-weight'), style: r.style.getPropertyValue('font-style'), urls: urls });
        }
      }
    }
    return out;
  }

  function captureElement(el) {
    nodes = 0; fontUse = {};
    var r = el.getBoundingClientRect();
    var origin = { x: r.left, y: r.top };
    var tree = walk(el, origin, null);
    var truncated = nodes >= MAX_NODES;
    return {
      format: 'pass-capture/1',
      notes: 'Styles list only values that differ from the browser default for that tag. Font, colour, line-height, text-align, text-transform, white-space and cursor are also dropped when equal to the parent, so they inherit. r is [x, y, width, height] in px relative to the captured root. c is children (strings are text). p is ::before/::after. Sizes are used (rendered) values.',
      url: location.origin + location.pathname,
      title: maskText(document.title),
      capturedAt: new Date().toISOString(),
      masked: mask,
      viewport: { w: innerWidth, h: innerHeight, dpr: devicePixelRatio },
      root: { w: Math.round(r.width), h: Math.round(r.height) },
      truncated: truncated,
      nodeCount: nodes,
      fontsUsed: Object.keys(fontUse),
      fontFaces: fontFaces(),
      cssVariables: rootVars(),
      tree: tree
    };
  }

  function download(data) {
    var name = 'capture-' + location.hostname.replace(/[^a-z0-9]+/gi, '-') + '-' + new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14) + '.json';
    var blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.setAttribute(UI, '1');
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    return name;
  }

  /* ---- picker UI ---- */
  var box = document.createElement('div');
  box.setAttribute(UI, '1');
  box.style.cssText = 'position:fixed;z-index:2147483646;pointer-events:none;border:2px solid #9a26d6;background:rgba(154,38,214,0.12);display:none;box-sizing:border-box';
  var bar = document.createElement('div');
  bar.setAttribute(UI, '1');
  bar.style.cssText = 'position:fixed;z-index:2147483647;left:50%;bottom:16px;transform:translateX(-50%);display:flex;align-items:center;gap:12px;padding:8px 12px;background:#1b1b1f;color:#fff;font:13px/1.4 system-ui,sans-serif;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.3)';
  bar.innerHTML = '<span>Click an element to capture. ↑/↓ parent/child · ⌘-click passes through · Esc cancels</span>' +
    '<label style="display:flex;align-items:center;gap:4px;cursor:pointer"><input type="checkbox" data-mask> Mask text</label>' +
    '<button data-page style="font:inherit;padding:4px 8px;border:0;border-radius:4px;background:#9a26d6;color:#fff;cursor:pointer">Whole page</button>';
  document.body.appendChild(box);
  document.body.appendChild(bar);
  bar.querySelector('[data-mask]').addEventListener('change', function (e) { mask = e.target.checked; });

  function inUi(t) { return t && t.closest && t.closest('[' + UI + ']'); }
  function show(el) {
    hover = el;
    if (!el) { box.style.display = 'none'; return; }
    var r = el.getBoundingClientRect();
    box.style.display = 'block';
    box.style.left = r.left + 'px'; box.style.top = r.top + 'px';
    box.style.width = r.width + 'px'; box.style.height = r.height + 'px';
  }
  function onMove(e) {
    if (inUi(e.target)) return;
    var el = document.elementFromPoint(e.clientX, e.clientY);
    if (el && !inUi(el)) { leaf = el; show(el); }
  }
  function swallow(e) {
    if (e.metaKey || e.ctrlKey || inUi(e.target)) return;
    e.preventDefault(); e.stopPropagation();
  }
  function onClick(e) {
    if (e.metaKey || e.ctrlKey || inUi(e.target)) return;
    e.preventDefault(); e.stopPropagation();
    if (hover) finish(hover);
  }
  function onKey(e) {
    if (e.key === 'Escape') { e.stopPropagation(); stop(); }
    else if (e.key === 'ArrowUp' && hover && hover.parentElement && hover !== document.documentElement) { e.preventDefault(); show(hover.parentElement); }
    else if (e.key === 'ArrowDown' && hover && leaf && hover !== leaf) {
      e.preventDefault();
      var c = leaf;
      while (c.parentElement && c.parentElement !== hover) c = c.parentElement;
      show(c);
    }
  }
  bar.querySelector('[data-page]').addEventListener('click', function () { finish(document.body); });

  function toast(msg) {
    var t = document.createElement('div');
    t.setAttribute(UI, '1');
    t.style.cssText = 'position:fixed;z-index:2147483647;left:50%;bottom:16px;transform:translateX(-50%);padding:10px 16px;background:#1b1b1f;color:#fff;font:13px/1.4 system-ui,sans-serif;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.3)';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 5000);
  }

  function finish(el) {
    var data;
    try { data = captureElement(el); } catch (err) { stop(); toast('Capture failed: ' + err.message); return; }
    stop();
    var name = download(data);
    toast('Saved ' + name + ' (' + data.nodeCount + ' elements' + (data.truncated ? ', truncated' : '') + (data.masked ? ', text masked' : '') + ')');
  }

  function stop() {
    document.removeEventListener('mousemove', onMove, true);
    document.removeEventListener('mousedown', swallow, true);
    document.removeEventListener('pointerdown', swallow, true);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('keydown', onKey, true);
    box.remove(); bar.remove();
    if (frame) { frame.remove(); frame = null; }
    delete window.__passCapture;
  }

  document.addEventListener('mousemove', onMove, true);
  document.addEventListener('mousedown', swallow, true);
  document.addEventListener('pointerdown', swallow, true);
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKey, true);
  window.__passCapture = { stop: stop, captureElement: captureElement };
})();
