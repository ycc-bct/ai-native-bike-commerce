/* 客製頁平面預覽（Propel SL 1 這類 PSD 合成車款）的背景與角度工具列。
   - 三種背景：淺色（後方柔光＋淡地面）、深色攝影棚、山路（道路往遠方延伸）。地面線對齊輪胎著地點，車底下有接地陰影。
   - 切到特寫角度時，背景跟著放大（約車子的 55%）並模糊；淺色背景特寫時淡成純色，避免地面漸層被放大成髒污。
   - 車子下方一條工具列：6 個角度點（第一個＝全車）＋背景色票；取代原本左上角的背景按鈕與左右箭頭。
     雙擊畫面或按 Home 鍵回到全車，鍵盤左右鍵照常切換。
   3D 預覽車款（TCR 等）不受影響。依賴主程式的全域：flatGo、flatIdx、FLAT_VIEWS。 */
(() => {
  const D = document;
  const BG = {   // horizon＝背景圖裡「輪胎該站的位置」在圖高的比例（量過）
    dark: {src: 'assets/backgrounds/studio-dark.jpg', w: 1168, h: 880, horizon: .64, blur0: 0},
    outdoor: {src: 'assets/backgrounds/mountain-pass-road.jpg', w: 1168, h: 880, horizon: .82, blur0: 1.5}};
  const SHADOW = {light: [.30, '20,26,34', .16], dark: [.62, '0,0,0', .45], outdoor: [.55, '8,10,12', .32]};
  const SWATCH = {light: '#F3F5F7', dark: `#1b1d21 url(${BG.dark.src}) center/cover`, outdoor: `url(${BG.outdoor.src}) center/cover`};

  const go = () => {
    const st = D.getElementById('stage'), cv = D.querySelector('canvas[data-flat-img="paint-side"]'), slide = D.querySelector('.flat-slide');
    if (!st || !cv || !slide || !cv.width || typeof flatGo !== 'function') return setTimeout(go, 200);
    st.classList.add('sp-on');

    const layer = D.createElement('div'); layer.className = 'sp-bg'; layer.innerHTML = '<div class="sp-bg-i"><img alt=""></div>'; st.prepend(layer);
    const inner = layer.firstChild, img = inner.firstChild;
    const sh = D.createElement('div'); sh.className = 'sp-sh'; sh.innerHTML = '<i></i><i></i><b></b>'; slide.prepend(sh);

    /* 輪胎著地點（畫布像素）：最底下一排不透明像素分成兩群 */
    let contacts = null;
    const measure = () => {
      const W = cv.width, H = cv.height; let d; try { d = cv.getContext('2d').getImageData(0, 0, W, H).data; } catch (e) { return null; }
      let bot = 0; for (let y = H - 1; y > 0 && !bot; y--) for (let x = 0; x < W; x += 2) if (d[(y * W + x) * 4 + 3] > 60) { bot = y; break; }
      if (!bot) return null;
      const xs = []; for (let x = 0; x < W; x++) for (let y = bot; y > bot - 10; y--) if (d[(y * W + x) * 4 + 3] > 60) { xs.push(x); break; }
      const groups = []; xs.forEach(x => { const g = groups[groups.length - 1]; if (g && x - g[1] < 30) g[1] = x; else groups.push([x, x]); });
      const two = groups.sort((a, b) => (b[1] - b[0]) - (a[1] - a[0])).slice(0, 2).sort((a, b) => a[0] - b[0]);
      let top = H; for (let y = 0; y < H && top === H; y++) for (let x = 0; x < W; x += 2) if (d[(y * W + x) * 4 + 3] > 60) { top = y; break; }
      return {bot, top, c: two.map(g => (g[0] + g[1]) / 2), W, H};
    };
    const toStage = (x, y) => {   // 畫布像素 → 舞台座標（object-fit:contain）
      const S = st.getBoundingClientRect(), sl = slide.getBoundingClientRect(), k = Math.min(cv.offsetWidth / contacts.W, cv.offsetHeight / contacts.H);
      return {x: sl.left - S.left + (cv.offsetWidth - contacts.W * k) / 2 + x * k, y: sl.top - S.top + (cv.offsetHeight - contacts.H * k) / 2 + y * k, k};
    };

    const layout = () => {
      const flat = st.classList.contains('is-flat'); st.classList.toggle('sp-flat', flat); if (!flat) return;
      if (!contacts) contacts = measure(); if (!contacts) return setTimeout(layout, 300);
      const mode = SHADOW[st.dataset.stageBackground] ? st.dataset.stageBackground : 'light'; layer.dataset.mode = mode;
      const S = st.getBoundingClientRect(), sl = slide.getBoundingClientRect(), ground = toStage(0, contacts.bot), topY = toStage(0, contacts.top).y;
      inner.style.setProperty('--hz', ((ground.y - (ground.y - topY) * .26) / S.height * 100).toFixed(1) + '%');
      const bg = BG[mode];
      if (bg) {
        if (img.getAttribute('src') !== bg.src) img.src = bg.src;
        const sc = Math.max(S.width / bg.w, S.height / bg.h) * 1.12, w = bg.w * sc, h = bg.h * sc;
        const top = Math.min(0, Math.max(S.height - h, ground.y - bg.horizon * h));
        Object.assign(img.style, {width: w + 'px', height: h + 'px', left: (S.width - w) / 2 + 'px', top: top + 'px', display: 'block'});
      } else img.style.display = 'none';
      /* 接地陰影：兩個輪胎各一團＋整台車底下一片很淡的長橢圓（不用畫布 drop-shadow，圖裡近乎透明的像素會被描成方框） */
      const [a, col, drop] = SHADOW[mode];
      [...sh.querySelectorAll('i')].forEach((el, i) => {
        const p = toStage(contacts.c[i] || 0, contacts.bot), w = contacts.W * p.k * .2, h = w * .14;
        Object.assign(el.style, {left: (p.x - (sl.left - S.left) - w / 2) + 'px', top: (p.y - (sl.top - S.top) - h * .55) + 'px', width: w + 'px', height: h + 'px',
          background: `radial-gradient(closest-side,rgba(${col},${a}),rgba(${col},${a * .4}) 50%,rgba(${col},0))`});
      });
      const r0 = toStage(contacts.c[0] || 0, contacts.bot), r1 = toStage(contacts.c[1] || 0, contacts.bot), wide = r1.x - r0.x + contacts.W * r0.k * .22, tall = wide * .07;
      Object.assign(sh.querySelector('b').style, {left: ((r0.x + r1.x) / 2 - (sl.left - S.left) - wide / 2) + 'px', top: (r0.y - (sl.top - S.top) - tall * .5) + 'px', width: wide + 'px', height: tall + 'px',
        background: `radial-gradient(closest-side,rgba(${col},${drop}),rgba(${col},0))`});
      zoom(); syncBar();
    };
    const zoom = () => {
      const mode = layer.dataset.mode || 'light', m = /scale\(([\d.]+)\)/.exec(cv.style.transform || ''), z = m ? +m[1] : 1;
      const [ox, oy] = (cv.style.transformOrigin || '50% 50%').split(' ').map(v => parseFloat(v) / 100);
      const S = st.getBoundingClientRect(), sl = slide.getBoundingClientRect();
      inner.style.transformOrigin = `${sl.left - S.left + ox * slide.offsetWidth}px ${sl.top - S.top + oy * slide.offsetHeight}px`;
      inner.style.transform = `scale(${1 + (z - 1) * .55})`;
      inner.style.filter = `blur(${((BG[mode]?.blur0 || 0) + (z - 1) * 16).toFixed(1)}px)${mode === 'outdoor' && z > 1 ? ' brightness(.92) saturate(.85)' : ''}`;
      inner.style.opacity = mode === 'light' && z > 1 ? '0' : '1';
      sh.style.transformOrigin = cv.style.transformOrigin; sh.style.transform = cv.style.transform;
      syncBar();
    };

    /* 車子下方工具列 */
    const bar = D.createElement('div'); bar.className = 'sp-bar'; bar.setAttribute('role', 'toolbar'); bar.setAttribute('aria-label', '預覽角度與背景');
    bar.innerHTML = `<div class="sp-views" role="group" aria-label="角度">${FLAT_VIEWS.map((v, i) => `<button type="button" data-i="${i}" data-name="${v.name}" aria-label="${v.name}"><i></i></button>`).join('')}</div><span class="sp-sep" aria-hidden="true"></span><div class="sp-bgs" role="group" aria-label="背景"></div>`;
    st.appendChild(bar);
    const bgs = bar.querySelector('.sp-bgs');
    const syncBar = () => {
      bar.querySelectorAll('.sp-views button').forEach((b, i) => i === flatIdx ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current'));
      const src = [...D.querySelectorAll('.background-choice')].filter(b => !b.hidden);
      if (bgs.childElementCount !== src.length) bgs.innerHTML = src.map(b => `<button type="button" data-bg="${b.dataset.stageBackground}" aria-label="${b.getAttribute('aria-label') || ''}"></button>`).join('');
      bgs.querySelectorAll('button').forEach(b => { b.style.background = SWATCH[b.dataset.bg] || '#ccc'; b.setAttribute('aria-pressed', String(st.dataset.stageBackground === b.dataset.bg)); });
    };
    bgs.addEventListener('click', e => { const b = e.target.closest('button'); if (b) D.querySelector(`.background-choice[data-stage-background="${b.dataset.bg}"]`)?.click(); });
    bar.querySelector('.sp-views').addEventListener('click', e => { const b = e.target.closest('button'); if (b) flatGo(+b.dataset.i, false); });
    st.addEventListener('dblclick', e => { if (st.classList.contains('sp-flat') && flatIdx !== 0 && !e.target.closest('button')) flatGo(0, false); });

    /* 工具列自動隱藏：滑鼠在預覽區移動時出現，停 2 秒或移出就淡出；鍵盤操作工具列時一直顯示。觸控裝置一直顯示 */
    const touch = matchMedia('(pointer: coarse)').matches;
    let idle;
    /* 只有「鍵盤」焦點在工具列上才保持顯示；滑鼠點過的按鈕雖然也有焦點，不算 */
    const kbdFocus = () => !!bar.querySelector(':focus-visible');
    const showBar = (ms = 2000) => { bar.classList.add('show'); clearTimeout(idle); if (!kbdFocus() && !bar.matches(':hover')) idle = setTimeout(() => bar.classList.remove('show'), ms); };
    if (touch) bar.classList.add('show', 'stay');
    else {
      st.addEventListener('pointermove', () => showBar());
      st.addEventListener('pointerleave', () => { clearTimeout(idle); if (!kbdFocus()) bar.classList.remove('show'); });
      bar.addEventListener('pointerenter', () => { clearTimeout(idle); bar.classList.add('show'); });
      bar.addEventListener('focusin', () => { if (kbdFocus()) { clearTimeout(idle); bar.classList.add('show'); } });
      bar.addEventListener('focusout', () => showBar(1200));
      showBar(2600);   // 一進來先出現一下，讓人知道有這條
    }

    /* 放大檢視（全車視角、桌機）：滑過時游標是放大鏡；點一下在點的位置放大 2.2 倍，之後移動滑鼠可以看不同位置；
       再點一下回到原本大小。背景跟著同樣放大＋模糊。 */
    const Z = 2.2;
    let lens = false;
    const originAt = e => { const b = slide.getBoundingClientRect(), c = v => Math.min(1, Math.max(0, v));
      return `${(c((e.clientX - b.left) / b.width) * 100).toFixed(2)}% ${(c((e.clientY - b.top) / b.height) * 100).toFixed(2)}%`; };
    const lensOn = e => {
      lens = true; cv.style.transition = 'transform .4s cubic-bezier(.16,1,.3,1)';
      cv.style.transformOrigin = originAt(e); cv.style.transform = `scale(${Z})`; st.classList.add('sp-lens');
    };
    const lensOff = () => { if (!lens) return; lens = false; cv.style.transform = ''; cv.style.transformOrigin = '50% 50%'; st.classList.remove('sp-lens'); setTimeout(() => { if (!lens) cv.style.transition = ''; }, 450); };
    const canLens = () => !touch && flatIdx === 0 && st.classList.contains('sp-flat');
    slide.addEventListener('pointermove', e => { if (lens) cv.style.transformOrigin = originAt(e); });
    slide.addEventListener('click', e => { if (!canLens()) return; lens ? lensOff() : lensOn(e); });
    st.classList.toggle('sp-can-lens', !touch);
    const goView = flatGo; window.flatGo = (i, f) => { lensOff(); goView(i, f); };
    D.addEventListener('keydown', e => { if (e.key === 'Home' && st.contains(D.activeElement) && st.classList.contains('sp-flat')) { e.preventDefault(); flatGo(0); } });

    new MutationObserver(layout).observe(st, {attributes: true, attributeFilter: ['data-stage-background', 'class']});
    new MutationObserver(zoom).observe(cv, {attributes: true, attributeFilter: ['style']});
    addEventListener('resize', layout);
    layout();
  };
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', go); else go();
})();
