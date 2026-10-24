/* 客製頁預覽背景提案：注入 customized.html。三個背景都讓車「站在地上」，切到特寫角度時背景跟著放大並模糊（提案 A）。
   ?bg=light|dark|outdoor 指定一開始的背景；之後左上角的背景按鈕、左右切角度都照常可用。 */
(() => {
  const D = document, Q = new URL(location.href).searchParams;
  const IMG = new URL('storefront/docs/stage-bg/', location.href).href;
  /* 背景圖裡「地面線」在圖高的比例（量過）：深色棚 64%、戶外 62% */
  const BG = {dark: {src: IMG + 'dark.jpg', horizon: .64, blur0: 0}, outdoor: {src: IMG + 'outdoor.jpg', horizon: .62, blur0: 2},
    road: {src: IMG + 'road.jpg', horizon: .82, blur0: 1.5}};   // road：道路往遠方延伸，著地點放在前景柏油（圖高 82%）
  const SHADOW = {light: [.30, '20,26,34', .16], dark: [.62, '0,0,0', .45], outdoor: [.5, '10,14,18', .28], road: [.55, '8,10,12', .32]};
  const css = D.createElement('style');
  css.textContent = `
  #stage[data-stage-background]{background:transparent!important;background-image:none!important}
  #stage .bgx{position:absolute;inset:0;z-index:0;overflow:hidden;border-radius:inherit;pointer-events:none}
  #stage .bgx-i{position:absolute;inset:0;transform-origin:50% 50%;transition:transform .65s cubic-bezier(.16,1,.3,1),filter .65s cubic-bezier(.16,1,.3,1),opacity .35s ease;will-change:transform,filter}
  #stage .bgx-i img{position:absolute;left:0;top:0;display:block}
  #stage .bgx[data-mode=light] .bgx-i{background:
     radial-gradient(ellipse 46% 42% at 50% 44%,rgba(255,255,255,.95),rgba(255,255,255,0) 72%),
     linear-gradient(180deg,#F3F5F7 0,#F3F5F7 var(--hz,70%),#EBEEF1 calc(var(--hz,70%) + 7%),#E6E9ED 100%)}
  #stage #flatPreview{position:relative;z-index:1}
  #stage .bgx-sh{position:absolute;inset:0;pointer-events:none;transition:transform .65s cubic-bezier(.16,1,.3,1)}
  #stage .bgx-sh i,#stage .bgx-sh b{position:absolute;border-radius:50%;filter:blur(3px)}
  #stage .bgx-sh b{filter:blur(10px)}
  `;
  D.head.appendChild(css);

  const go = () => {
    const st = D.getElementById('stage'), cv = D.querySelector('canvas[data-flat-img="paint-side"]'), slide = D.querySelector('.flat-slide');
    if (!st || !cv || !slide || !cv.width) return setTimeout(go, 200);
    /* 第四個背景按鈕「道路延伸」（比較用） */
    const od = D.querySelector('.background-choice[data-stage-background="outdoor"]');
    if (od && !D.querySelector('.background-choice[data-stage-background="road"]')) {
      const rb = od.cloneNode(true); rb.dataset.stageBackground = 'road'; rb.setAttribute('aria-label', '道路背景'); rb.setAttribute('aria-pressed', 'false');
      rb.style.backgroundImage = `url(${IMG}road.jpg)`; rb.style.backgroundSize = 'cover'; rb.style.backgroundPosition = 'center'; od.after(rb);
      rb.addEventListener('click', e => { e.stopPropagation(); e.preventDefault(); st.dataset.stageBackground = 'road';
        D.querySelectorAll('.background-choice').forEach(b => b.setAttribute('aria-pressed', String(b === rb))); }, true);
      D.querySelectorAll('.background-choice:not([data-stage-background="road"])').forEach(b => b.addEventListener('click', () => rb.setAttribute('aria-pressed', 'false')));
    }
    const want = Q.get('bg'); if (want) D.querySelector(`.background-choice[data-stage-background="${want}"]`)?.click();
    const layer = D.createElement('div'); layer.className = 'bgx'; layer.innerHTML = '<div class="bgx-i"><img alt=""></div>'; st.prepend(layer);
    const inner = layer.querySelector('.bgx-i'), img = inner.querySelector('img');
    const sh = D.createElement('div'); sh.className = 'bgx-sh'; sh.innerHTML = '<i></i><i></i><b></b>'; slide.prepend(sh);

    /* 量輪胎著地點（畫布像素） */
    let contacts = null;
    const measure = () => {
      const W = cv.width, H = cv.height; let d; try { d = cv.getContext('2d').getImageData(0, 0, W, H).data; } catch (e) { return null; }
      let bot = 0; for (let y = H - 1; y > 0 && !bot; y--) for (let x = 0; x < W; x += 2) if (d[(y * W + x) * 4 + 3] > 60) { bot = y; break; }
      const xs = []; for (let x = 0; x < W; x++) for (let y = bot; y > bot - 10; y--) if (d[(y * W + x) * 4 + 3] > 60) { xs.push(x); break; }
      const groups = []; xs.forEach(x => { const g = groups[groups.length - 1]; if (g && x - g[1] < 30) g[1] = x; else groups.push([x, x]); });
      const two = groups.sort((a, b) => (b[1] - b[0]) - (a[1] - a[0])).slice(0, 2).sort((a, b) => a[0] - b[0]);
      let top = H; for (let y = 0; y < H && top === H; y++) for (let x = 0; x < W; x += 2) if (d[(y * W + x) * 4 + 3] > 60) { top = y; break; }
      return {bot, top, c: two.map(g => (g[0] + g[1]) / 2), W, H};
    };
    /* 畫布 object-fit:contain 之後，畫布像素 → 舞台座標 */
    const toStage = (x, y) => {
      const S = st.getBoundingClientRect(), k = Math.min(cv.offsetWidth / contacts.W, cv.offsetHeight / contacts.H);
      const ox = (cv.offsetWidth - contacts.W * k) / 2, oy = (cv.offsetHeight - contacts.H * k) / 2;
      const sl = slide.getBoundingClientRect();
      return {x: sl.left - S.left + ox + x * k, y: sl.top - S.top + oy + y * k, k};
    };
    const layout = () => {
      if (!contacts) contacts = measure(); if (!contacts) return;
      const mode = st.dataset.stageBackground || 'light'; layer.dataset.mode = mode;
      const S = st.getBoundingClientRect(), ground = toStage(0, contacts.bot), topY = toStage(0, contacts.top).y;
      /* 地平線：放在輪軸附近（著地點往上約 1/4 車高） */
      const hz = ground.y - (ground.y - topY) * .26;
      inner.style.setProperty('--hz', (hz / S.height * 100).toFixed(1) + '%');
      const bg = BG[mode];
      if (bg) {
        if (!img.src.endsWith(bg.src.split('/').pop())) img.src = bg.src;
        const iw = 1168, ih = 880, sc = Math.max(S.width / iw, S.height / ih) * 1.12, w = iw * sc, h = ih * sc;
        let top = ground.y - bg.horizon * h; top = Math.min(0, Math.max(S.height - h, top));
        Object.assign(img.style, {width: w + 'px', height: h + 'px', left: (S.width - w) / 2 + 'px', top: top + 'px', display: 'block'});
      } else img.style.display = 'none';
      /* 接地陰影：兩個輪胎各一團（跟著畫布一起縮放） */
      const [a, col, drop] = SHADOW[mode], sl = slide.getBoundingClientRect();
      [...sh.querySelectorAll('i')].forEach((el, i) => {
        const p = toStage(contacts.c[i] || 0, contacts.bot), w = contacts.W * p.k * .2, h = w * .14;
        Object.assign(el.style, {left: (p.x - (sl.left - S.left) - w / 2) + 'px', top: (p.y - (sl.top - S.top) - h * .55) + 'px', width: w + 'px', height: h + 'px',
          background: `radial-gradient(closest-side,rgba(${col},${a}),rgba(${col},${a * .4}) 50%,rgba(${col},0))`});
      });
      /* 不用畫布 drop-shadow：圖裡有大量近乎透明的像素，drop-shadow 會把它們描成一個方框。改成整台車底下一片很淡的長橢圓陰影 */
      cv.style.filter = 'none';
      const r0 = toStage(contacts.c[0] || 0, contacts.bot), r1 = toStage(contacts.c[1] || 0, contacts.bot), wide = r1.x - r0.x + contacts.W * r0.k * .22, tall = wide * .07;
      Object.assign(sh.querySelector('b').style, {left: ((r0.x + r1.x) / 2 - (sl.left - S.left) - wide / 2) + 'px', top: (r0.y - (sl.top - S.top) - tall * .5) + 'px', width: wide + 'px', height: tall + 'px',
        background: `radial-gradient(closest-side,rgba(${col},${drop}),rgba(${col},0))`});
      zoom();
    };
    /* 提案 A：背景跟著鏡頭放大（約 55% 的放大量，做出前後景深差）並模糊 */
    const zoom = () => {
      const mode = layer.dataset.mode, m = /scale\(([\d.]+)\)/.exec(cv.style.transform || ''), z = m ? +m[1] : 1;
      const [ox, oy] = (cv.style.transformOrigin || '50% 50%').split(' ').map(v => parseFloat(v) / 100);
      const S = st.getBoundingClientRect(), sl = slide.getBoundingClientRect();
      const px = sl.left - S.left + ox * slide.offsetWidth, py = sl.top - S.top + oy * slide.offsetHeight;
      const bz = 1 + (z - 1) * .55, blur = (BG[mode]?.blur0 || 0) + (z - 1) * 16;
      inner.style.transformOrigin = `${px}px ${py}px`;
      inner.style.transform = `scale(${bz})`;
      inner.style.filter = `blur(${blur.toFixed(1)}px)${(mode === 'outdoor' || mode === 'road') && z > 1 ? ' brightness(.92) saturate(.85)' : ''}`;
      /* 淺色：特寫時地面漸層放大後會變成一團髒污，直接淡成純色背景 */
      inner.style.opacity = mode === 'light' && z > 1 ? '0' : '1';
      sh.style.transformOrigin = cv.style.transformOrigin; sh.style.transform = cv.style.transform;
    };
    /* ===== 車子下方工具列（?tb=A 角度點點＋背景、?tb=B 角度縮圖＋背景）＋雙擊／Home 鍵回全車 ===== */
    const TB = Q.get('tb');
    if (TB) {
      const t = D.createElement('style');
      t.textContent = `
      #stage .preview-toolbar{display:none!important}
      #stage .tbx{position:absolute;left:50%;bottom:14px;z-index:6;translate:-50% 0;display:flex;align-items:center;gap:14px;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.92);backdrop-filter:blur(10px);box-shadow:0 1px 2px rgba(20,26,34,.06),0 6px 18px rgba(20,26,34,.12);font-family:"Inter","Noto Sans TC",sans-serif}
      #stage .tbx .sep{width:1px;height:22px;background:#DCE1E7}
      #stage .tbx .views{display:flex;align-items:center;gap:6px}
      #stage .tbx .views button{position:relative;border:0;padding:0;background:none;cursor:pointer}
      #stage .tbx.A .views button{width:22px;height:22px;display:grid;place-items:center}
      #stage .tbx.A .views button i{display:block;width:8px;height:8px;border-radius:50%;background:#C3CAD3;transition:background .2s,width .25s}
      #stage .tbx.A .views button[aria-current] i{width:20px;border-radius:999px;background:#141A22}
      #stage .tbx.A .views button.all{width:auto;padding:0 4px;color:#7A8492}
      #stage .tbx.A .views button.all[aria-current]{color:#141A22}
      #stage .tbx.A .views button.all svg{width:22px;height:22px}
      #stage .tbx.B{padding:6px 12px 6px 6px;border-radius:16px}
      #stage .tbx.B .views button{width:50px;height:36px;border-radius:9px;overflow:hidden;background:#EEF1F4;box-shadow:inset 0 0 0 1px #DCE1E7}
      #stage .tbx.B .views button canvas{width:100%;height:100%;display:block}
      #stage .tbx.B .views button[aria-current]{box-shadow:0 0 0 2px #fff,0 0 0 3.5px #141A22}
      #stage .tbx .views button::after{content:attr(data-name);position:absolute;left:50%;bottom:calc(100% + 10px);translate:-50% 4px;padding:5px 9px;border-radius:8px;background:#141A22;color:#fff;font-size:12px;font-weight:600;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .15s,translate .15s}
      #stage .tbx .views button:hover::after{opacity:1;translate:-50% 0}
      #stage .tbx .bgs{display:flex;align-items:center;gap:8px}
      #stage .tbx .bgs button{width:22px;height:22px;border-radius:50%;border:1px solid #C3CAD3;padding:0;cursor:pointer;background-size:cover;background-position:center}
      #stage .tbx .bgs button[aria-pressed=true]{box-shadow:0 0 0 2px #fff,0 0 0 3.5px #141A22;border-color:transparent}`;
      D.head.appendChild(t);
      const bar = D.createElement('div'); bar.className = 'tbx ' + TB; st.appendChild(bar);
      const BIKE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="15" r="3.5"/><circle cx="18.5" cy="15" r="3.5"/><path d="M5.5 15 9 9h6.5l3 6M9 9l2.5 6h-6M15.5 9l-4 6M8 7.5h3"/></svg>';
      bar.innerHTML = `<div class="views">${FLAT_VIEWS.map((v, i) => `<button type="button" data-i="${i}" data-name="${v.name}" aria-label="${v.name}" class="${i === 0 ? 'all' : ''}">${TB === 'A' ? (i === 0 ? BIKE : '<i></i>') : '<canvas width="100" height="72"></canvas>'}</button>`).join('')}</div><span class="sep"></span><div class="bgs"></div>`;
      const bgs = bar.querySelector('.bgs');
      const SW = {light: '#F3F5F7', dark: `#1b1d21 url(${IMG}dark.jpg) center/cover`, outdoor: `url(${IMG}outdoor.jpg) center/cover`, road: `url(${IMG}road.jpg) center/cover`};
      const syncBgs = () => {
        const src = [...D.querySelectorAll('.background-choice')].filter(b => !b.hidden);
        bgs.innerHTML = src.map(b => `<button type="button" data-bg="${b.dataset.stageBackground}" aria-label="${b.getAttribute('aria-label') || ''}" aria-pressed="${st.dataset.stageBackground === b.dataset.stageBackground}"></button>`).join('');
        bgs.querySelectorAll('button').forEach(b => { b.style.background = SW[b.dataset.bg] || '#ccc'; });
      };
      bgs.addEventListener('click', e => { const b = e.target.closest('button'); if (b) D.querySelector(`.background-choice[data-stage-background="${b.dataset.bg}"]`)?.click(); setTimeout(syncBgs, 50); });
      bar.querySelector('.views').addEventListener('click', e => { const b = e.target.closest('button'); if (b) flatGo(+b.dataset.i, false); });
      const syncViews = () => bar.querySelectorAll('.views button').forEach((b, i) => i === flatIdx ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current'));
      /* B：每個角度的小縮圖＝同一張畫布依該角度的放大倍數與焦點裁切 */
      const drawThumbs = () => {
        if (TB !== 'B') return;
        /* 縮圖＝主畫面在該角度實際看到的範圍：畫布盒子（含上下留白）以焦點放大 z 倍後的可視區，換算回圖片像素 */
        const W = cv.width, H = cv.height, bw = cv.offsetWidth, bh = cv.offsetHeight, k = Math.min(bw / W, bh / H), offX = (bw - W * k) / 2, offY = (bh - H * k) / 2;
        bar.querySelectorAll('.views canvas').forEach((c, i) => {
          const v = FLAT_VIEWS[i], z = +(/scale\(([\d.]+)\)/.exec(v.zoom || '') || [0, 1])[1], [ox, oy] = (v.origin || '50% 50%').split(' ').map(n => parseFloat(n) / 100);
          const vw = bw / z, vh = bh / z, vx = ox * bw - ox * vw, vy = oy * bh - oy * vh;          // 可視區（盒子座標）
          const aspect = c.width / c.height, cw = Math.max(vw, vh * aspect), ch = cw / aspect;       // 依縮圖比例補齊
          const cx = vx + vw / 2, cy = vy + vh / 2;
          const sx = (cx - cw / 2 - offX) / k, sy = (cy - ch / 2 - offY) / k;
          const g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height); g.drawImage(cv, sx, sy, cw / k, ch / k, 0, 0, c.width, c.height);
        });
      };
      syncBgs(); syncViews(); drawThumbs(); setInterval(drawThumbs, 1200);
      new MutationObserver(() => { syncViews(); syncBgs(); }).observe(cv, {attributes: true, attributeFilter: ['style']});
      new MutationObserver(syncBgs).observe(st, {attributes: true, attributeFilter: ['data-stage-background']});
    }
    /* 雙擊畫面或按 Home 鍵：直接回到全車 */
    st.addEventListener('dblclick', e => { if (!e.target.closest('button')) flatGo(0, false); });
    D.addEventListener('keydown', e => { if (e.key === 'Home' && st.contains(D.activeElement)) { e.preventDefault(); flatGo(0); } });
    new MutationObserver(layout).observe(st, {attributes: true, attributeFilter: ['data-stage-background']});
    new MutationObserver(zoom).observe(cv, {attributes: true, attributeFilter: ['style']});
    addEventListener('resize', layout);
    setTimeout(layout, 300);
  };
  go();
})();
