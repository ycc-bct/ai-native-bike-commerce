/* 客製化自行車服務門市：地圖與右側清單連動。
   清單：搜尋（門市名稱、縣市、地址）＋地區篩選；滑到某間，地圖上的點放大；點某間（或點地圖上的點）→ 地圖拉近、標出店名，清單捲到那間。
   地圖：區塊快進到畫面時才載入 MapLibre＋OpenFreeMap 的真實街道圖（免金鑰），可放大到街道層級；
        載不到（離線、file://、不支援 WebGL）就沿用頁面上的手繪 SVG 台灣圖，互動相同。
   右下角 +／−；改搜尋／地區會拉到符合的範圍；點地圖空白處或再點一次同一間只取消選取。
   SVG 上 130 個點的順序與 stores.json 相同（已用經緯度核對）。 */
(() => {
  const sec = document.getElementById('stores'); if (!sec) return;
  const list = sec.querySelector('.slist'), ul = list.querySelector('ul'), q = list.querySelector('.q'), chipsBox = list.querySelector('.chips'), cnt = list.querySelector('.cnt');
  const svg = sec.querySelector('.tw'), mapc = svg.closest('.mapc'), pins = [...svg.querySelectorAll('.pins circle')], labels = [...svg.querySelectorAll('.rl')];
  const REGIONS = ['全部', '北部', '中部', '南部', '東部', '離島'];
  const GL_JS = 'https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.js', GL_CSS = 'https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.css';
  const GL_STYLE = 'https://tiles.openfreemap.org/styles/positron';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[c]);
  const norm = s => String(s).replace(/臺/g, '台').replace(/\s+/g, '').toLowerCase();
  const street = s => String(s.addr || '').replace(/^\d+\s*/, '');
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  fetch(new URL('stores.json', location.href)).then(r => r.json()).then(init).catch(() => { /* file:// 打開時讀不到資料，保留原本的靜態清單 */ });

  function init(data) {
    const stores = data.map((s, i) => ({...s, i, pin: pins[i], zip: parseInt(s.addr, 10) || 999, key: norm(s.name + s.addr + s.city)}));
    const sorted = stores.slice().sort((a, b) => REGIONS.indexOf(a.region) - REGIONS.indexOf(b.region) || a.zip - b.zip);
    const count = r => r === '全部' ? stores.length : stores.filter(s => s.region === r).length;
    let region = '全部', query = '', active = null, sel = null, hits = stores.map(() => true);

    /* 搜尋框與地區按鈕換成可以操作的元件 */
    q.innerHTML = q.querySelector('svg').outerHTML + '<input type="search" placeholder="搜尋門市名稱、縣市或地址" aria-label="搜尋門市" autocomplete="off">';
    const input = q.querySelector('input');
    chipsBox.innerHTML = REGIONS.map(r => `<button type="button" class="chip" data-r="${r}" aria-pressed="false">${r} ${count(r)}</button>`).join('');
    sec.classList.add('st-live');
    /* 右側清單卡寬度＝地區按鈕一整列的寬度，讓「離島」右緣和搜尋框右緣切齊（桌機） */
    const fitList = () => { const c = chipsBox.children; if (!c.length) return; const w = c[c.length - 1].getBoundingClientRect().right - c[0].getBoundingClientRect().left; if (w > 0) sec.style.setProperty('--chips-w', Math.ceil(w * 10) / 10 + 'px'); };
    fitList(); (document.fonts ? document.fonts.ready : Promise.resolve()).then(fitList); addEventListener('resize', fitList);

    /* 地圖上共用的控制：右下角 +／− */
    const zoomUi = document.createElement('div'); zoomUi.className = 'st-zoom';
    zoomUi.innerHTML = '<button type="button" data-z="in" aria-label="放大地圖"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button><button type="button" data-z="out" aria-label="縮小地圖"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg></button>';
    mapc.append(zoomUi);
    const zin = zoomUi.querySelector('[data-z="in"]'), zout = zoomUi.querySelector('[data-z="out"]');
    const ev = {
      state: ({zoomed, canIn}) => { mapc.classList.toggle('zoomed', zoomed); zout.disabled = !zoomed; zin.disabled = !canIn; },
      pick: i => pickFromMap(i),
      blank: () => unselect()
    };
    let map = svgMap(ev);
    zin.addEventListener('click', () => map.zoomBy(1));
    zout.addEventListener('click', () => map.zoomBy(-1));

    /* ================= 手繪 SVG 地圖（備援） ================= */
    function svgMap(ev) {
      const NS = 'http://www.w3.org/2000/svg', FULL = {z: 1, cx: 250, cy: 315}, ZSEL = 9, ZMAX = 16, STEP = 1.6;
      let view = {...FULL}, vb = null, cur = null, anim, hov = null;
      const ring = document.createElementNS(NS, 'circle'); ring.setAttribute('class', 'st-ring'); ring.setAttribute('r', '4.2');
      const tag = document.createElement('div'); tag.className = 'st-tag'; tag.setAttribute('aria-hidden', 'true'); mapc.append(tag);
      labels.forEach(l => { const r = l.textContent.trim().split(/\s+/)[0]; l.dataset.r = r; l.setAttribute('role', 'button'); l.setAttribute('tabindex', '0'); l.setAttribute('aria-label', '只看' + r + '門市'); });
      stores.forEach(s => { if (!s.pin) return; s.pin.dataset.i = s.i; const t = document.createElementNS(NS, 'title'); t.textContent = s.name; s.pin.appendChild(t); });
      const fit = () => { const r = svg.getBoundingClientRect(); return {W: r.width || 1, H: r.height || 1}; };
      const boxOf = v => { const {W, H} = fit(), h = 630 / v.z, w = h * W / H; return {x: v.cx - w / 2, y: v.cy - h / 2, w, h}; };
      const setVB = v => { vb = v; svg.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`); svg.style.setProperty('--pz', (v.h / 630).toFixed(4)); placeTag(); };
      function placeTag() {
        if (cur == null || !stores[cur].pin) return;
        const m = mapc.getBoundingClientRect(), r = stores[cur].pin.getBoundingClientRect();
        tag.style.transform = `translate(${r.left - m.left + r.width / 2}px,${r.top - m.top}px) translate(-50%,calc(-100% - 12px))`;
      }
      function tween(to) {
        cancelAnimationFrame(anim);
        const from = vb || to, t0 = performance.now(), dur = reduced() ? 1 : 600;
        const step = now => { const k = Math.min(1, (now - t0) / dur), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
          setVB({x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, w: from.w + (to.w - from.w) * e, h: from.h + (to.h - from.h) * e});
          if (k < 1) anim = requestAnimationFrame(step); };
        anim = requestAnimationFrame(step);
      }
      function goTo(v, animate = true) {
        const z = Math.max(1, Math.min(ZMAX, v.z));
        view = z <= 1.001 ? {...FULL} : {z, cx: Math.max(0, Math.min(500, v.cx)), cy: Math.max(0, Math.min(630, v.cy))};
        svg.classList.toggle('zoomed', view.z > 1);
        ev.state({zoomed: view.z > 1, canIn: view.z < ZMAX});
        animate ? tween(boxOf(view)) : (cancelAnimationFrame(anim), setVB(boxOf(view)));
      }
      /* 拖曳移動；拖過就不算點擊 */
      let drag = null, dragged = false;
      const onDown = e => { if (view.z <= 1 || e.button !== 0) return; drag = {x: e.clientX, y: e.clientY, cx: view.cx, cy: view.cy, id: e.pointerId}; dragged = false; };
      const onMove = e => {
        if (!drag || e.pointerId !== drag.id) return;
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (!dragged && Math.hypot(dx, dy) < 4) return;
        if (!dragged) { dragged = true; svg.setPointerCapture(e.pointerId); svg.classList.add('dragging'); }
        const k = (630 / view.z) / fit().H; goTo({z: view.z, cx: drag.cx - dx * k, cy: drag.cy - dy * k}, false);
      };
      const onUp = () => { if (drag) { drag = null; svg.classList.remove('dragging'); } };
      const onClick = e => {
        if (dragged) { dragged = false; return; }
        const pin = e.target.closest('.pins circle:not(.st-ring)');
        if (pin) ev.pick(+pin.dataset.i); else if (!e.target.closest('.rl')) ev.blank();
      };
      const onResize = () => goTo(view, false);
      svg.addEventListener('pointerdown', onDown); svg.addEventListener('pointermove', onMove); svg.addEventListener('pointerup', onUp); svg.addEventListener('pointercancel', onUp);
      svg.addEventListener('click', onClick); addEventListener('resize', onResize);
      labels.forEach(l => {
        const pick = () => setRegion(region === l.dataset.r ? '全部' : l.dataset.r);
        l.addEventListener('click', pick);
        l.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
      });
      goTo(FULL, false);
      return {
        filter() {
          stores.forEach(s => s.pin && s.pin.classList.toggle('off', !hits[s.i]));
          labels.forEach(l => { l.classList.toggle('dim', region !== '全部' && l.dataset.r !== region); l.classList.toggle('on', l.dataset.r === region); });
        },
        hover(i) {
          if (hov != null && stores[hov].pin) stores[hov].pin.classList.remove('hl');
          hov = i; if (i != null && stores[i].pin) { stores[i].pin.classList.add('hl'); stores[i].pin.parentNode.appendChild(stores[i].pin); }
        },
        select(i) {
          const s = stores[i]; if (!s.pin) return;
          if (cur != null && stores[cur].pin) stores[cur].pin.classList.remove('sel');
          cur = i; s.pin.classList.add('sel'); s.pin.parentNode.appendChild(s.pin);
          ring.setAttribute('cx', s.pin.getAttribute('cx')); ring.setAttribute('cy', s.pin.getAttribute('cy')); s.pin.parentNode.insertBefore(ring, s.pin);
          ring.classList.remove('go'); ring.getBBox(); ring.classList.add('go');
          tag.innerHTML = `<b>${esc(s.name)}</b><span>${esc(street(s))}</span>`;
          svg.classList.add('has-sel'); mapc.classList.add('has-sel');
          const z = Math.max(view.z, ZSEL);
          goTo({z, cx: +s.pin.getAttribute('cx'), cy: +s.pin.getAttribute('cy') - 630 / z * .06});
        },
        unselect() {
          if (cur != null && stores[cur].pin) stores[cur].pin.classList.remove('sel');
          cur = null; ring.remove(); svg.classList.remove('has-sel'); mapc.classList.remove('has-sel');
        },
        full() { goTo(FULL); },
        fitTo() { goTo(FULL); },
        zoomBy(d) { goTo({...view, z: d > 0 ? view.z * STEP : view.z / STEP}); },
        destroy() {
          cancelAnimationFrame(anim); this.unselect(); this.hover(null); tag.remove();
          svg.removeEventListener('pointerdown', onDown); svg.removeEventListener('pointermove', onMove); svg.removeEventListener('pointerup', onUp); svg.removeEventListener('pointercancel', onUp);
          svg.removeEventListener('click', onClick); removeEventListener('resize', onResize);
        }
      };
    }

    /* ================= 真實街道地圖（MapLibre＋OpenFreeMap） ================= */
    function glMap(ev, onReady, onFail) {
      const ml = window.maplibregl;
      const el = document.createElement('div'); el.className = 'st-gl'; mapc.prepend(el);
      const lngs = stores.map(s => s.lng), lats = stores.map(s => s.lat);
      const ALL = [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]];
      const PAD = {top: 36, bottom: 36, left: 36, right: 36}, ZSEL = 15.5, ZMAX = 18;
      const touch = matchMedia('(pointer: coarse)').matches;
      let map, ready = false, cur = null, hov = null, marker = null, fullZoom = 7;
      try {
        map = new ml.Map({container: el, style: GL_STYLE, bounds: ALL, fitBoundsOptions: {padding: PAD}, maxZoom: ZMAX, minZoom: 5,
          attributionControl: false, dragRotate: false, pitchWithRotate: false, touchPitch: false, scrollZoom: false,
          cooperativeGestures: touch,   // 手機／平板：單指照常捲動頁面，兩指才移動地圖
          locale: {'CooperativeGesturesHandler.MobileHelpText': '用兩指移動地圖', 'CooperativeGesturesHandler.WindowsHelpText': '按住 Ctrl 再滾動可縮放地圖', 'CooperativeGesturesHandler.MacHelpText': '按住 ⌘ 再滾動可縮放地圖'}, localIdeographFontFamily: '"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif'});
      } catch (e) { el.remove(); onFail(); return null; }
      map.touchZoomRotate.disableRotation(); map.keyboard.disableRotation();
      map.addControl(new ml.AttributionControl({compact: true}), 'bottom-left');
      /* 地圖來源標註依授權必須保留，預設收成 ⓘ，點了才展開 */
      const collapseAttrib = () => el.querySelector('.maplibregl-ctrl-attrib.maplibregl-compact-show')?.classList.remove('maplibregl-compact-show');
      map.once('load', collapseAttrib); map.once('idle', collapseAttrib);
      const fail = setTimeout(() => { if (!ready) { map.remove(); el.remove(); onFail(); } }, 9000);
      map.on('error', e => { if (!ready && /style/i.test(String(e && e.error && e.error.message))) { clearTimeout(fail); map.remove(); el.remove(); onFail(); } });

      const geo = {type: 'FeatureCollection', features: stores.map(s => ({type: 'Feature', id: s.i, properties: {name: s.name}, geometry: {type: 'Point', coordinates: [s.lng, s.lat]}}))};
      const fs = (i, st) => map.setFeatureState({source: 'st', id: i}, st);
      const zoomState = () => { const z = map.getZoom(); ev.state({zoomed: z > fullZoom + .25, canIn: z < ZMAX - .01}); };

      map.on('load', () => {
        /* 地圖配色調成頁面的淡灰藍；所有地名、路名改成只顯示中文 */
        const style = map.getStyle();
        style.layers.forEach(l => {
          if (l.type === 'symbol' && l.layout && JSON.stringify(l.layout['text-field'] || '').includes('name')) map.setLayoutProperty(l.id, 'text-field', ['coalesce', ['get', 'name:zh-Hant'], ['get', 'name:zh'], ['get', 'name']]);
          if (l.id === 'background') map.setPaintProperty(l.id, 'background-color', '#EEF1F4');
          if (l.id === 'water') map.setPaintProperty(l.id, 'fill-color', '#D6DEE8');
          if (l.id === 'park' || /landcover_wood/.test(l.id)) map.setPaintProperty(l.id, 'fill-color', '#E4EAE4');
        });
        map.addSource('st', {type: 'geojson', data: geo});
        const r = (base, big) => ['case', ['boolean', ['feature-state', 'hl'], false], big, base];
        map.addLayer({id: 'st-pins', type: 'circle', source: 'st', paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, r(4, 7), 11, r(6, 9), 16, r(8, 11)],
          'circle-color': '#1F4FE0', 'circle-stroke-color': '#fff', 'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 6, 1.2, 14, 2],
          'circle-opacity': ['case', ['boolean', ['feature-state', 'off'], false], .14, ['boolean', ['feature-state', 'sel'], false], 0, 1],
          'circle-stroke-opacity': ['case', ['boolean', ['feature-state', 'off'], false], .14, ['boolean', ['feature-state', 'sel'], false], 0, 1],
          'circle-opacity-transition': {duration: 250}, 'circle-radius-transition': {duration: 200}
        }});
        map.on('mouseenter', 'st-pins', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'st-pins', () => { map.getCanvas().style.cursor = ''; });
        map.on('click', e => {
          const f = map.queryRenderedFeatures(e.point, {layers: ['st-pins']}).filter(f => !f.state.off)[0];
          f ? ev.pick(f.id) : ev.blank();
        });
        map.on('zoomend', zoomState); map.on('moveend', zoomState);
        fullZoom = map.cameraForBounds(ALL, {padding: PAD}).zoom;
        map.once('idle', () => { ready = true; clearTimeout(fail); zoomState(); onReady(); });
      });

      const camera = (center, zoom) => ({center, zoom, duration: reduced() ? 0 : 900, essential: true, offset: [0, 28]});
      return {
        filter() { if (!ready) return; stores.forEach(s => fs(s.i, {off: !hits[s.i]})); },
        hover(i) { if (!ready) return; if (hov != null) fs(hov, {hl: false}); hov = i; if (i != null) fs(i, {hl: true}); },
        select(i) {
          const s = stores[i]; if (!ready) return;
          if (cur != null) fs(cur, {sel: false});
          cur = i; fs(i, {sel: true});
          marker && marker.remove();
          const m = document.createElement('div'); m.className = 'st-mk';
          m.innerHTML = `<i class="st-mk-dot"></i><div class="st-mk-tag"><b>${esc(s.name)}</b><span>${esc(street(s))}</span></div>`;
          marker = new ml.Marker({element: m, anchor: 'center'}).setLngLat([s.lng, s.lat]).addTo(map);
          mapc.classList.add('has-sel');
          map.flyTo(camera([s.lng, s.lat], Math.max(map.getZoom(), ZSEL)));
        },
        unselect() {
          if (!ready) return;
          if (cur != null) fs(cur, {sel: false});
          cur = null; marker && marker.remove(); marker = null; mapc.classList.remove('has-sel');
        },
        full() { if (ready) map.fitBounds(ALL, {padding: PAD, duration: reduced() ? 0 : 800}); },
        /* 篩選後拉到符合的門市範圍；全部符合就回全台 */
        fitTo(idx) {
          if (!ready) return;
          if (!idx.length || idx.length === stores.length) return this.full();
          const ln = idx.map(i => stores[i].lng), la = idx.map(i => stores[i].lat);
          map.fitBounds([[Math.min(...ln), Math.min(...la)], [Math.max(...ln), Math.max(...la)]], {padding: {top: 70, bottom: 50, left: 50, right: 70}, maxZoom: 14, duration: reduced() ? 0 : 800});
        },
        zoomBy(d) { d > 0 ? map.zoomIn({duration: 300}) : map.zoomOut({duration: 300}); },
        destroy() { map.remove(); el.remove(); }
      };
    }

    /* 區塊快進到畫面時才載入地圖程式；成功就把 SVG 換成真實地圖 */
    function hasWebGL() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } }
    function loadGL() {
      if (!/^https?:$/.test(location.protocol) || !hasWebGL()) return;
      const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = GL_CSS; document.head.appendChild(css);
      const js = document.createElement('script'); js.src = GL_JS; js.async = true;
      js.onload = () => {
        if (!window.maplibregl) return;
        const gl = glMap(ev, () => {
          map.destroy(); map = gl; mapc.classList.add('gl-on');
          map.filter(); if (sel != null) map.select(sel); else if (region !== '全部' || query) map.fitTo(stores.filter(s => hits[s.i]).map(s => s.i));
        }, () => mapc.classList.remove('gl-loading'));
      };
      document.head.appendChild(js);
    }
    new IntersectionObserver((es, io) => { if (es.some(e => e.isIntersecting)) { io.disconnect(); loadGL(); } }, {rootMargin: '900px 0px'}).observe(sec);

    /* ================= 清單 ================= */
    function render() {
      const qn = norm(query);
      hits = stores.map(s => (region === '全部' || s.region === region) && (!qn || s.key.includes(qn)));
      const rows = sorted.filter(s => hits[s.i]);
      ul.innerHTML = rows.length ? rows.map(s => `<li data-i="${s.i}" tabindex="0"><div><b>${esc(s.name)}</b><span>${esc(s.addr)}</span></div><a class="tel" href="tel:${esc(s.tel.replace(/[^\d+]/g, ''))}">${esc(s.tel)}</a></li>`).join('')
        : '<li class="st-empty">找不到符合的門市，換個關鍵字或地區試試。</li>';
      ul.scrollTop = 0;
      unselect();
      /* 只有搜尋時才顯示筆數（地區按鈕已經有各區數量） */
      cnt.textContent = query ? `搜尋「${query}」${region === '全部' ? '' : `（${region}）`}，共 ${rows.length} 筆` : '';
      cnt.classList.toggle('on', !!query);
      chipsBox.querySelectorAll('.chip').forEach(c => { const on = c.dataset.r === region; c.classList.toggle('on', on); c.setAttribute('aria-pressed', on); });
      map.filter(); map.fitTo(rows.map(s => s.i));
      highlight(null);
    }
    function highlight(i, scroll) {
      ul.querySelectorAll('li.hl').forEach(li => li.classList.remove('hl'));
      active = i; map.hover(i);
      if (i == null) return;
      const li = ul.querySelector(`li[data-i="${i}"]`);
      if (li) { li.classList.add('hl'); if (scroll) ul.scrollTo({top: li.offsetTop - ul.offsetTop - 8, behavior: 'smooth'}); }
    }
    function select(i) {
      sel = i;
      ul.querySelectorAll('li.sel').forEach(li => li.classList.remove('sel'));
      ul.querySelector(`li[data-i="${i}"]`)?.classList.add('sel');
      map.select(i);
    }
    function unselect() {
      if (sel == null) return;
      sel = null; ul.querySelectorAll('li.sel').forEach(li => li.classList.remove('sel'));
      map.unselect();
    }
    function pickFromMap(i) {
      if (!hits[i]) { query = ''; input.value = ''; region = '全部'; render(); }
      highlight(i, true); select(i);
    }
    const setRegion = r => { region = r; render(); };

    let typing;
    input.addEventListener('input', () => { clearTimeout(typing); typing = setTimeout(() => { query = input.value.trim(); render(); }, 120); });
    chipsBox.addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) setRegion(c.dataset.r); });
    ul.addEventListener('pointerover', e => { const li = e.target.closest('li[data-i]'); if (li) highlight(+li.dataset.i); });
    ul.addEventListener('pointerleave', () => highlight(null));
    ul.addEventListener('click', e => { const li = e.target.closest('li[data-i]'); if (!li || e.target.closest('a')) return; const i = +li.dataset.i; sel === i ? unselect() : select(i); });
    ul.addEventListener('keydown', e => { const li = e.target.closest('li[data-i]'); if (li && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); li.click(); } });
    render();
  }
})();
