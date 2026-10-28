/* 全站共用的門市選擇器：真實街道地圖（MapLibre＋OpenFreeMap，免金鑰）＋搜尋＋地區篩選＋「離我最近」，地圖和清單連動。
   樣式跟客製化介紹頁的「客製化自行車服務門市」一樣；資料是 custom-studio/stores.json（全台 130 間服務門市）。

   const p = GiantStorePicker.mount(el, {
     mode: 'select' | 'browse',   // select：可以選一間（結帳、試騎預約）；browse：只瀏覽
     layout: 'auto' | 'side' | 'stack',   // side：左地圖右清單；stack：地圖在上、清單在下；auto（預設）：依寬度自動
     selected: '18998',           // 預設選取的門市 id
     tags: {'18998': '上次來過'},  // 門市名稱旁的小標籤
     onSelect: store => {}        // 選了某間門市（store = {id, name, addr, tel, region, lat, lng}）
   });
   p.select(id) / p.selected() / p.resize() / p.el（同一個元素可以搬到別的位置，地圖不用重建）

   地圖載不到（離線、file://、不支援 WebGL）就只顯示清單，功能照常。 */
(function () {
  var script = document.currentScript || document.querySelector('script[src*="store-picker.js"]');
  var ROOT = script ? script.src.replace(/js\/store-picker\.js.*$/, '') : '';
  var GL_JS = 'https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.js', GL_CSS = 'https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.css';
  var GL_STYLE = 'https://tiles.openfreemap.org/styles/positron';
  var REGIONS = ['全部', '北部', '中部', '南部', '東部', '離島'];
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]; }); };
  var norm = function (s) { return String(s).replace(/臺/g, '台').replace(/\s+/g, '').toLowerCase(); };
  var street = function (s) { return String(s.addr || '').replace(/^\d+\s*/, ''); };
  var reduced = function () { return matchMedia('(prefers-reduced-motion: reduce)').matches; };
  var km = function (a, b) { var R = 6371, r = Math.PI / 180, dLa = (b.lat - a.lat) * r, dLn = (b.lng - a.lng) * r, x = Math.sin(dLa / 2) * Math.sin(dLa / 2) + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLn / 2) * Math.sin(dLn / 2); return 2 * R * Math.asin(Math.sqrt(x)); };
  var ICON = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    near: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>'
  };

  var css = document.createElement('style');
  css.textContent = [
    '.sp{--sp-ink:#141A22;--sp-ink70:#4A5563;--sp-ink50:#7A8492;--sp-line:#DCE1E7;--sp-ai:#1F4FE0;--sp-navy:#0E1726;display:grid;gap:16px;font-family:inherit;color:var(--sp-ink)}',
    '.sp *{box-sizing:border-box}.sp button{font-family:inherit;line-height:1.2;color:inherit;cursor:pointer}',
    '.sp-side{grid-template-columns:minmax(0,1fr) minmax(0,1fr);height:var(--sp-h,480px)}',
    '.sp-stack{grid-template-columns:1fr}',
    '.sp-map{position:relative;min-height:0;border-radius:16px;overflow:hidden;background:#EEF1F4}',
    '.sp-stack .sp-map{height:var(--sp-map-h,220px)}',
    '.sp.sp-nomap{grid-template-columns:1fr;height:auto}.sp.sp-nomap .sp-map{display:none}',
    '.sp-map .sp-gl{position:absolute;inset:0;opacity:0;transition:opacity .5s ease}.sp-map.on .sp-gl{opacity:1}',
    '.sp-wait{position:absolute;inset:0;display:grid;place-items:center;font-size:13px;color:var(--sp-ink50)}.sp-map.on .sp-wait{display:none}',
    '.sp-gl .maplibregl-canvas{outline:none}.sp-gl .maplibregl-ctrl-attrib{font-size:10.5px;background:rgba(255,255,255,.8)}.sp-gl .maplibregl-ctrl-bottom-left{margin:0 0 6px 6px}',
    '.sp-zoom{position:absolute;right:12px;bottom:12px;z-index:4;display:flex;flex-direction:column;border-radius:12px;background:#fff;box-shadow:0 1px 2px rgba(20,26,34,.06),0 6px 18px rgba(20,26,34,.1);overflow:hidden}',
    '.sp-zoom button{display:grid;place-items:center;width:36px;height:36px;border:0;background:none}.sp-zoom button+button{border-top:1px solid #E6E9EE}.sp-zoom button:hover:not(:disabled){background:#F3F5F7}.sp-zoom button:disabled{color:#C3CAD3;cursor:default}.sp-zoom svg{width:16px;height:16px}',
    '.sp-mk{position:relative;width:20px;height:20px}.sp-mk i{position:absolute;inset:0;border-radius:50%;background:var(--sp-ai);border:3px solid #fff;box-shadow:0 2px 8px rgba(31,79,224,.35)}',
    '.sp-mk::before{content:"";position:absolute;inset:0;border-radius:50%;background:var(--sp-ai);opacity:0;animation:sp-pulse 1.8s ease-out .6s infinite}',
    '.sp-mk-tag{position:absolute;left:50%;bottom:calc(100% + 10px);transform:translateX(-50%);padding:7px 12px 8px;border-radius:12px;background:#fff;box-shadow:0 1px 2px rgba(20,26,34,.06),0 8px 22px rgba(20,26,34,.12);white-space:nowrap;pointer-events:none;opacity:0;animation:sp-tag .3s ease .6s forwards}',
    '.sp-mk-tag b{display:block;font-size:13.5px;font-weight:700}.sp-mk-tag span{display:block;margin-top:2px;font-size:12px;color:var(--sp-ink50)}',
    '.sp-me{width:16px;height:16px;border-radius:50%;background:#14B8A6;border:3px solid #fff;box-shadow:0 0 0 6px rgba(20,184,166,.18)}',
    '@keyframes sp-pulse{0%{opacity:.35;transform:scale(1)}100%{opacity:0;transform:scale(3.2)}}@keyframes sp-tag{from{opacity:0;transform:translate(-50%,4px)}to{opacity:1;transform:translateX(-50%)}}',
    '.sp-list{display:flex;flex-direction:column;min-height:0;padding:18px 18px 6px;border:1px solid var(--sp-line);border-radius:16px;background:#fff}',
    '.sp-tools{display:flex;gap:8px;flex:none}',
    '.sp-q{flex:1;min-width:0;display:flex;align-items:center;gap:10px;height:44px;padding:0 16px;border:1px solid #C9D0D8;border-radius:999px;font-size:14.5px;font-weight:600}.sp-q:focus-within{border-color:var(--sp-ink)}',
    '.sp-q svg{flex:none;width:17px;height:17px;color:var(--sp-ink70)}.sp-q input{flex:1;min-width:0;height:100%;border:0;outline:0;background:none;font:inherit;color:var(--sp-ink)}.sp-q input::placeholder{color:#9AA4B0;font-weight:500}',
    '.sp-near{flex:none;display:inline-flex;align-items:center;gap:6px;height:44px;padding:0 14px;border:1px solid #C9D0D8;border-radius:999px;background:#fff;font-size:13.5px;font-weight:700;white-space:nowrap}.sp-near svg{width:16px;height:16px}.sp-near:hover{border-color:var(--sp-ink)}',
    '.sp-near.on{background:#E6F6F4;border-color:#14B8A6;color:#0F766E}.sp-near[aria-busy=true]{opacity:.6;cursor:wait}',
    '.sp-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;flex:none}',
    '.sp-chip{height:34px;padding:0 13px;border:1px solid var(--sp-line);border-radius:999px;background:#fff;font-size:13px;font-weight:600;color:var(--sp-ink70);font-variant-numeric:tabular-nums;transition:background .2s,color .2s,border-color .2s}',
    '.sp-chip:hover:not(.on){border-color:var(--sp-ink)}.sp-chip.on{background:var(--sp-navy);border-color:var(--sp-navy);color:#fff}',
    '.sp-cnt{flex:none;margin:12px 0 0;font-size:12.5px;font-weight:700;color:var(--sp-ink70)}.sp-cnt:empty{display:none}',
    '.sp-list ul{flex:1;min-height:0;overflow-y:auto;list-style:none;margin:6px 0 0;padding:0 4px 0 0;scrollbar-width:thin;scrollbar-color:#C9D0D8 transparent}',
    '.sp-stack .sp-list ul{max-height:var(--sp-list-h,300px)}',
    '.sp-list li{display:flex;align-items:center;gap:12px;margin:0 -8px;padding:12px 8px;border-top:1px solid var(--sp-line);border-radius:10px;cursor:pointer;transition:background .2s}',
    '.sp-list li:first-child{border-top-color:transparent}.sp-list li.hl{background:#F3F5F7}.sp-list li.sel{background:#EEF3FF}.sp-list li.sel b{color:var(--sp-ai)}',
    '.sp-list li:focus-visible{outline:2px solid var(--sp-ai);outline-offset:-2px}',
    '.sp-radio{flex:none;width:18px;height:18px;border-radius:50%;border:1.5px solid #9AA4B0;background:#fff}.sp-list li.sel .sp-radio{border:5px solid var(--sp-navy)}',
    '.sp-browse .sp-radio{display:none}',
    '.sp-txt{flex:1;min-width:0}.sp-txt b{display:block;font-size:14.5px;font-weight:700}.sp-txt span{display:block;margin-top:3px;font-size:12.5px;color:var(--sp-ink70);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.sp-tag{display:inline-block;margin-left:8px;padding:1px 8px;border-radius:999px;background:#FFF4E5;color:#B45309;font-size:11.5px;font-weight:700;vertical-align:2px}',
    '.sp-end{flex:none;text-align:right;font-size:13px;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap}.sp-end small{display:block;margin-top:3px;font-size:12px;font-weight:600;color:#0F766E}',
    '.sp-end a{color:var(--sp-ink);text-decoration:none}.sp-end a:hover{text-decoration:underline}',
    '.sp-empty{display:block!important;padding:28px 0!important;text-align:center;color:var(--sp-ink50);font-size:14px;border-top:0!important;cursor:default!important}',
    '.sp-picked{grid-column:1/-1;margin:0;padding:12px 16px;border-radius:12px;background:#F3F5F7;font-size:13.5px;line-height:1.6;color:var(--sp-ink70)}.sp-picked b{color:var(--sp-ink)}.sp-picked:empty{display:none}',
    '.sp-msg{flex:none;margin:8px 0 0;font-size:12.5px;color:#B23932}.sp-msg:empty{display:none}',
    '@media(max-width:760px){.sp-side{grid-template-columns:1fr;height:auto}.sp-side .sp-map{height:240px}.sp-side .sp-list ul{max-height:320px}}',
    '@media(prefers-reduced-motion:reduce){.sp-mk::before{animation:none}.sp-mk-tag{animation:none;opacity:1}}'
  ].join('');
  document.head.appendChild(css);

  var dataP = null;
  function data() { return dataP || (dataP = fetch(ROOT + 'custom-studio/stores.json').then(function (r) { return r.json(); })); }
  var glP = null;
  function hasWebGL() { try { var c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } }
  function loadGL() {
    if (glP) return glP;
    glP = new Promise(function (ok, no) {
      if (!/^https?:$/.test(location.protocol) || !hasWebGL()) return no();
      if (window.maplibregl) return ok(window.maplibregl);
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = GL_CSS; document.head.appendChild(l);
      var s = document.createElement('script'); s.src = GL_JS; s.async = true;
      s.onload = function () { window.maplibregl ? ok(window.maplibregl) : no(); }; s.onerror = no;
      document.head.appendChild(s);
    });
    return glP;
  }

  function mount(host, o) {
    o = o || {};
    var mode = o.mode || 'select', tags = o.tags || {};
    var el = document.createElement('div');
    var layout = o.layout || 'auto';
    el.className = 'sp sp-' + (layout === 'auto' ? 'side' : layout) + (mode === 'browse' ? ' sp-browse' : '');
    el.innerHTML = '<div class="sp-map"><div class="sp-wait">地圖載入中…</div><div class="sp-zoom"><button type="button" data-z="1" aria-label="放大地圖">' + ICON.plus + '</button><button type="button" data-z="-1" aria-label="縮小地圖">' + ICON.minus + '</button></div></div>' +
      '<div class="sp-list"><div class="sp-tools"><label class="sp-q">' + ICON.search + '<input type="search" placeholder="搜尋門市、縣市或地址" aria-label="搜尋門市" autocomplete="off"></label>' +
      '<button type="button" class="sp-near" aria-pressed="false">' + ICON.near + '離我最近</button></div>' +
      '<p class="sp-msg" role="status"></p><div class="sp-chips" role="group" aria-label="地區"></div><p class="sp-cnt"></p><ul role="listbox" aria-label="門市"></ul></div>' +
      (mode === 'select' ? '<p class="sp-picked" aria-live="polite"></p>' : '');
    host.appendChild(el);
    /* layout 'auto'：寬度夠（≥ 720px）左地圖右清單，不夠就地圖在上、清單在下 */
    if (layout === 'auto' && window.ResizeObserver) new ResizeObserver(function () { var w = el.getBoundingClientRect().width; if (!w) return; var side = w >= 720; if (el.classList.contains('sp-side') !== side) { el.classList.toggle('sp-side', side); el.classList.toggle('sp-stack', !side); if (map) map.resize(); } }).observe(el);
    var mapc = el.querySelector('.sp-map'), ul = el.querySelector('ul'), input = el.querySelector('input'), chipsBox = el.querySelector('.sp-chips'),
      cnt = el.querySelector('.sp-cnt'), nearBtn = el.querySelector('.sp-near'), msg = el.querySelector('.sp-msg'), picked = el.querySelector('.sp-picked');
    var stores = [], sorted = [], hits = [], region = '全部', query = '', sel = null, hov = null, me = null, map = null;

    var api = {el: el, select: function (id) { var s = stores.filter(function (x) { return x.id === String(id); })[0]; if (s) choose(s.i, true); }, selected: function () { return sel == null ? null : stores[sel]; }, resize: function () { map && map.resize(); }};

    data().then(function (d) {
      stores = d.map(function (s, i) { return Object.assign({}, s, {i: i, zip: parseInt(s.addr, 10) || 999, key: norm(s.name + s.addr + s.city)}); });
      sorted = stores.slice().sort(function (a, b) { return REGIONS.indexOf(a.region) - REGIONS.indexOf(b.region) || a.zip - b.zip; });
      chipsBox.innerHTML = REGIONS.map(function (r) { return '<button type="button" class="sp-chip" data-r="' + r + '" aria-pressed="false">' + r + ' ' + (r === '全部' ? stores.length : stores.filter(function (s) { return s.region === r; }).length) + '</button>'; }).join('');
      var pre = o.selected != null ? stores.filter(function (x) { return x.id === String(o.selected); })[0] : null;
      if (pre) sel = pre.i;
      render();
      if (pre) { scrollTo(pre.i); }
      new IntersectionObserver(function (es, io) { if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); startMap(); } }, {rootMargin: '600px 0px'}).observe(el);
    }).catch(function () { ul.innerHTML = '<li class="sp-empty">門市資料載入失敗，請重新整理再試一次。</li>'; el.classList.add('sp-nomap'); });

    /* ---------- 清單 ---------- */
    function render() {
      var qn = norm(query);
      hits = stores.map(function (s) { return (region === '全部' || s.region === region) && (!qn || s.key.indexOf(qn) >= 0); });
      var rows = (me ? stores.slice().sort(function (a, b) { return a.km - b.km; }) : sorted).filter(function (s) { return hits[s.i]; });
      ul.innerHTML = rows.length ? rows.map(function (s) {
        return '<li role="option" tabindex="0" data-i="' + s.i + '" aria-selected="' + (s.i === sel) + '"' + (s.i === sel ? ' class="sel"' : '') + '><span class="sp-radio" aria-hidden="true"></span><div class="sp-txt"><b>' + esc(s.name) + (tags[s.id] ? '<em class="sp-tag">' + esc(tags[s.id]) + '</em>' : '') + '</b><span title="' + esc(s.addr) + '">' + esc(street(s)) + '</span></div>' +
          '<div class="sp-end"><a href="tel:' + esc(String(s.tel).replace(/[^\d+]/g, '')) + '">' + esc(s.tel) + '</a>' + (me ? '<small>' + (s.km < 10 ? s.km.toFixed(1) : Math.round(s.km)) + ' 公里</small>' : '') + '</div></li>';
      }).join('') : '<li class="sp-empty">找不到符合的門市，換個關鍵字或地區試試。</li>';
      cnt.textContent = query ? '搜尋「' + query + '」' + (region === '全部' ? '' : '（' + region + '）') + '，共 ' + rows.length + ' 筆' : '';
      chipsBox.querySelectorAll('.sp-chip').forEach(function (c) { var on = c.dataset.r === region; c.classList.toggle('on', on); c.setAttribute('aria-pressed', on); });
      showPicked();
      if (map) map.filter();
    }
    function showPicked() {
      if (!picked) return;
      var s = sel == null ? null : stores[sel];
      picked.innerHTML = s ? '已選：<b>' + esc(s.name) + '</b>・' + esc(s.addr) + '・' + esc(s.tel) : '';
    }
    function scrollTo(i) { var li = ul.querySelector('li[data-i="' + i + '"]'); if (li) ul.scrollTo({top: li.offsetTop - ul.offsetTop - 8, behavior: reduced() ? 'auto' : 'smooth'}); }
    function highlight(i) { ul.querySelectorAll('li.hl').forEach(function (li) { li.classList.remove('hl'); }); hov = i; if (map) map.hover(i); if (i == null) return; var li = ul.querySelector('li[data-i="' + i + '"]'); if (li) li.classList.add('hl'); }
    function choose(i, scroll) {
      if (mode === 'browse' && sel === i) { sel = null; render(); if (map) map.unselect(); return; }
      if (!hits[i]) { query = ''; input.value = ''; region = '全部'; }
      sel = i; render(); if (scroll) scrollTo(i);
      if (map) map.select(i);
      if (mode === 'select' && o.onSelect) o.onSelect(stores[i]);
    }

    var typing;
    input.addEventListener('input', function () { clearTimeout(typing); typing = setTimeout(function () { query = input.value.trim(); render(); if (map) map.fitTo(); }, 120); });
    chipsBox.addEventListener('click', function (e) { var c = e.target.closest('.sp-chip'); if (!c) return; region = c.dataset.r; render(); if (map) map.fitTo(); });
    ul.addEventListener('pointerover', function (e) { var li = e.target.closest('li[data-i]'); if (li) highlight(+li.dataset.i); });
    ul.addEventListener('pointerleave', function () { highlight(null); });
    ul.addEventListener('click', function (e) { var li = e.target.closest('li[data-i]'); if (!li || e.target.closest('a')) return; choose(+li.dataset.i); });
    ul.addEventListener('keydown', function (e) { var li = e.target.closest('li[data-i]'); if (li && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); choose(+li.dataset.i); } });

    /* 離我最近：取得位置後依距離排序，地圖拉到最近的幾間；再按一次回到依地區排序 */
    nearBtn.addEventListener('click', function () {
      if (me) { me = null; nearBtn.classList.remove('on'); nearBtn.setAttribute('aria-pressed', 'false'); msg.textContent = ''; render(); if (map) { map.me(null); map.fitTo(); } return; }
      if (!navigator.geolocation) { msg.textContent = '這個瀏覽器無法取得位置，請用搜尋或地區篩選。'; return; }
      nearBtn.setAttribute('aria-busy', 'true'); msg.textContent = '';
      navigator.geolocation.getCurrentPosition(function (pos) {
        nearBtn.removeAttribute('aria-busy');
        me = {lat: pos.coords.latitude, lng: pos.coords.longitude};
        stores.forEach(function (s) { s.km = km(me, s); });
        region = '全部'; query = ''; input.value = '';
        nearBtn.classList.add('on'); nearBtn.setAttribute('aria-pressed', 'true');
        render(); ul.scrollTop = 0;
        if (map) { map.me(me); map.near(); }
      }, function () { nearBtn.removeAttribute('aria-busy'); msg.textContent = '沒有取得你的位置（可能沒有允許定位），請用搜尋或地區篩選。'; }, {timeout: 10000, maximumAge: 600000});
    });

    /* ---------- 地圖 ---------- */
    function startMap() {
      loadGL().then(function (ml) {
        var c = document.createElement('div'); c.className = 'sp-gl'; mapc.prepend(c);
        var lngs = stores.map(function (s) { return s.lng; }), lats = stores.map(function (s) { return s.lat; });
        var ALL = [[Math.min.apply(null, lngs), Math.min.apply(null, lats)], [Math.max.apply(null, lngs), Math.max.apply(null, lats)]], PAD = 28, ZSEL = 15, ZMAX = 18;
        var m, ready = false, cur = null, hv = null, mk = null, meMk = null, fullZoom = 7;
        try {
          m = new ml.Map({container: c, style: GL_STYLE, bounds: ALL, fitBoundsOptions: {padding: PAD}, maxZoom: ZMAX, minZoom: 5, attributionControl: false, dragRotate: false, pitchWithRotate: false, touchPitch: false, scrollZoom: false,
            cooperativeGestures: matchMedia('(pointer: coarse)').matches, localIdeographFontFamily: '"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif'});
        } catch (e) { c.remove(); el.classList.add('sp-nomap'); return; }
        m.touchZoomRotate.disableRotation(); m.keyboard.disableRotation();
        m.addControl(new ml.AttributionControl({compact: true}), 'bottom-left');   /* 地圖來源標註依授權必須保留，預設收成 ⓘ */
        var collapse = function () { var a = c.querySelector('.maplibregl-ctrl-attrib.maplibregl-compact-show'); if (a) a.classList.remove('maplibregl-compact-show'); };
        m.once('load', collapse); m.once('idle', collapse);
        var failT = setTimeout(function () { if (!ready) { m.remove(); c.remove(); el.classList.add('sp-nomap'); } }, 9000);
        var fs = function (i, st) { m.setFeatureState({source: 'sp', id: i}, st); };
        var zin = mapc.querySelector('[data-z="1"]'), zout = mapc.querySelector('[data-z="-1"]');
        var zs = function () { var z = m.getZoom(); zout.disabled = z <= fullZoom + .25; zin.disabled = z >= ZMAX - .01; };
        zin.onclick = function () { m.zoomIn({duration: 300}); }; zout.onclick = function () { m.zoomOut({duration: 300}); };
        m.on('load', function () {
          m.getStyle().layers.forEach(function (l) {
            if (l.type === 'symbol' && l.layout && JSON.stringify(l.layout['text-field'] || '').indexOf('name') >= 0) m.setLayoutProperty(l.id, 'text-field', ['coalesce', ['get', 'name:zh-Hant'], ['get', 'name:zh'], ['get', 'name']]);
            if (l.id === 'background') m.setPaintProperty(l.id, 'background-color', '#EEF1F4');
            if (l.id === 'water') m.setPaintProperty(l.id, 'fill-color', '#D6DEE8');
            if (l.id === 'park' || /landcover_wood/.test(l.id)) m.setPaintProperty(l.id, 'fill-color', '#E4EAE4');
          });
          m.addSource('sp', {type: 'geojson', data: {type: 'FeatureCollection', features: stores.map(function (s) { return {type: 'Feature', id: s.i, properties: {}, geometry: {type: 'Point', coordinates: [s.lng, s.lat]}}; })}});
          var r = function (a, b) { return ['case', ['boolean', ['feature-state', 'hl'], false], b, a]; };
          m.addLayer({id: 'sp-pins', type: 'circle', source: 'sp', paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, r(4, 7), 11, r(6, 9), 16, r(8, 11)],
            'circle-color': '#1F4FE0', 'circle-stroke-color': '#fff', 'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 6, 1.2, 14, 2],
            'circle-opacity': ['case', ['boolean', ['feature-state', 'off'], false], .14, ['boolean', ['feature-state', 'sel'], false], 0, 1],
            'circle-stroke-opacity': ['case', ['boolean', ['feature-state', 'off'], false], .14, ['boolean', ['feature-state', 'sel'], false], 0, 1]}});
          m.on('mouseenter', 'sp-pins', function () { m.getCanvas().style.cursor = 'pointer'; });
          m.on('mouseleave', 'sp-pins', function () { m.getCanvas().style.cursor = ''; });
          m.on('click', function (e) { var f = m.queryRenderedFeatures(e.point, {layers: ['sp-pins']}).filter(function (f) { return !f.state.off; })[0]; if (f) choose(f.id, true); });
          m.on('zoomend', zs); m.on('moveend', zs);
          fullZoom = m.cameraForBounds(ALL, {padding: PAD}).zoom;
          m.once('idle', function () {
            ready = true; clearTimeout(failT); mapc.classList.add('on'); zs();
            map.filter(); if (me) map.me(me); if (sel != null) map.select(sel); else if (me) map.near(); else map.fitTo();
          });
        });
        var cam = function (ll, z) { return {center: ll, zoom: z, duration: reduced() ? 0 : 900, essential: true, offset: [0, 24]}; };
        map = {
          filter: function () { if (ready) stores.forEach(function (s) { fs(s.i, {off: !hits[s.i]}); }); },
          hover: function (i) { if (!ready) return; if (hv != null) fs(hv, {hl: false}); hv = i; if (i != null) fs(i, {hl: true}); },
          select: function (i) {
            if (!ready) return; var s = stores[i];
            if (cur != null) fs(cur, {sel: false}); cur = i; fs(i, {sel: true});
            if (mk) mk.remove();
            var d = document.createElement('div'); d.className = 'sp-mk'; d.innerHTML = '<i></i><div class="sp-mk-tag"><b>' + esc(s.name) + '</b><span>' + esc(street(s)) + '</span></div>';
            mk = new ml.Marker({element: d, anchor: 'center'}).setLngLat([s.lng, s.lat]).addTo(m);
            m.flyTo(cam([s.lng, s.lat], Math.max(m.getZoom(), ZSEL)));
          },
          unselect: function () { if (!ready) return; if (cur != null) fs(cur, {sel: false}); cur = null; if (mk) mk.remove(); mk = null; },
          fitTo: function () {
            if (!ready) return;
            var idx = stores.filter(function (s) { return hits[s.i]; });
            if (!idx.length || idx.length === stores.length) return m.fitBounds(ALL, {padding: PAD, duration: reduced() ? 0 : 800});
            var ln = idx.map(function (s) { return s.lng; }), la = idx.map(function (s) { return s.lat; });
            m.fitBounds([[Math.min.apply(null, ln), Math.min.apply(null, la)], [Math.max.apply(null, ln), Math.max.apply(null, la)]], {padding: 48, maxZoom: 14, duration: reduced() ? 0 : 800});
          },
          me: function (p) {
            if (!ready) return; if (meMk) { meMk.remove(); meMk = null; } if (!p) return;
            var d = document.createElement('div'); d.className = 'sp-me'; d.title = '你的位置';
            meMk = new ml.Marker({element: d}).setLngLat([p.lng, p.lat]).addTo(m);
          },
          /* 拉到「你的位置＋最近的 5 間」 */
          near: function () {
            if (!ready || !me) return;
            var pts = stores.slice().sort(function (a, b) { return a.km - b.km; }).slice(0, 5).concat([me]);
            var ln = pts.map(function (s) { return s.lng; }), la = pts.map(function (s) { return s.lat; });
            m.fitBounds([[Math.min.apply(null, ln), Math.min.apply(null, la)], [Math.max.apply(null, ln), Math.max.apply(null, la)]], {padding: 56, maxZoom: 14, duration: reduced() ? 0 : 900});
          },
          resize: function () { m.resize(); }
        };
      }, function () { el.classList.add('sp-nomap'); });
    }
    return api;
  }

  window.GiantStorePicker = {mount: mount, data: data};
})();
