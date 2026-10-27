/* 六大零件規格：鉛筆藍圖進場（E）。
   白底方格 → 鉛筆筆尖照順序畫出車架（先拉輔助線再描線）→ 零件分兩批同時畫（輪子＋坐墊，再來其他）→ 實物淡入。全部約 1.7 秒。
   速寫與實物是同一張畫布，所以一定對齊。只在桌機版（> 900px）使用；手機版零件改成清單，不跑這段。
   用法：PartsDraw.build(section, timeline) 把所有動畫加進原頁那條 paused timeline，觸發、播完輪播都沿用原頁邏輯。 */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const IMG = new URL('../img/parts-draw/', document.currentScript.src).href;
  const SKETCH = {'p-saddle': 'saddle', 'p-cassette': 'cassette', 'p-crank-ring': 'crank', 'p-stem': 'stem', 'p-bar-drop': 'bar', 'p-wheel': 'wheel'};
  const PENCIL = '#8A9099';
  /* 座標＝線稿圖 2000×1250。車架一筆一筆：五通往上畫座管 → 上管 → 頭管 → 下管回五通 → 後下叉 → 後上叉 → 前叉 */
  const FRAME = [['M940 775 L858 470 L792 312', 46], ['M858 470 L1222 393', 46], ['M1222 393 L1248 492', 44], ['M1248 492 L944 768', 52],
    ['M940 775 L657 727', 44], ['M657 727 L855 478', 40], ['M1240 496 L1337 733', 40]];
  /* 尺寸線：地面線、軸距（含兩端箭頭）、兩條延伸短線、車高（含上下箭頭）、上方延伸線。線條兩端略為出頭，像手繪製圖 */
  const DIMS = ['M306 955 L1682 955', 'M650 1003 L1333 1003', 'M650 949 L650 1020', 'M1333 949 L1333 1020', 'M1625 498 L1625 955', 'M1244 497 L1644 497',
    'M668 993 L650 1003 L668 1013', 'M1315 993 L1333 1003 L1315 1013', 'M1615 516 L1625 498 L1635 516', 'M1615 937 L1625 955 L1635 937'];
  /* 進場最後補上的製圖線（五通與前後軸鉛直線、軸心水平線、座管角與頭管角）＋左上坐墊、右側車把俯視的小速寫與弧形箭頭 */
  const arrowHead = (x, y, dx, dy, s = 18) => {
    const L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, a = .45;
    const p = r => [x - s * (ux * Math.cos(r) - uy * Math.sin(r)), y - s * (uy * Math.cos(r) + ux * Math.sin(r))];
    const [x1, y1] = p(a), [x2, y2] = p(-a);
    return `M${x1.toFixed(1)} ${y1.toFixed(1)} L${x} ${y} L${x2.toFixed(1)} ${y2.toFixed(1)}`;
  };
  const XLINES = ['M940 540 L940 975', 'M652 470 L652 975', 'M1336 470 L1336 975', 'M380 729 L1610 729',
    'M850 775 A90 90 0 0 1 916.6 688.1', 'M1328 492 A80 80 0 0 1 1268.4 569.6'];
  /* 滑到（或點選）某個零件時，才在旁邊畫出它的鉛筆速寫：後半段零件在左側、前半段在右側（車把在標籤右上、前輪上方；豎桿在兩個標籤上方；坐墊在坐墊左側；大齒盤在標籤右下、地面線下方），高度對齊該零件。一次只出現一張 */
  const HOVER = {
    'p-saddle': ['saddle-34', 472, 249, 204, 154], 'p-cassette': ['cassette-simple', 232, 648, 170, 162], 'p-crank-ring': ['crank-short', 1007, 860, 140, 129],
    'p-bar-drop': ['bar-top-clean', 1488, 176, 232, 164], 'p-stem': ['stem-34', 1242, 164, 182, 122], 'p-wheel': ['wheel-34', 1650, 620, 220, 270]};

  function build(sec, tl) {
    const gsap = window.gsap, stage = sec.querySelector('.in'), la = sec.querySelector('.la'), rear = sec.querySelector('.rear-wheel');
    const items = [...sec.querySelectorAll('.pp10')];
    sec.classList.add('pd-on');
    /* 底層清楚線稿 .la 本身也畫了尺寸線：用遮罩把尺寸線的區域蓋掉，只留車架（尺寸線改由上面淡淡的鉛筆線表現） */
    const HIDE = [[280, 940, 1420, 30], [630, 985, 720, 40], [636, 940, 28, 90], [1319, 940, 28, 90], [1606, 470, 40, 505], [1262, 484, 400, 26]];
    const holes = HIDE.map(([x, y, w, h]) => `M${x} ${y}h${w}v${h}h${-w}Z`).join('');   // 遮罩以透明度判斷：整片不透明，尺寸線區域挖空
    const maskSvg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2000 1250' preserveAspectRatio='none'><path fill='black' fill-rule='evenodd' d='M0 0H2000V1250H0Z${holes}'/></svg>`;
    const maskUrl = `url("data:image/svg+xml,${encodeURIComponent(maskSvg)}") 0 0/100% 100% no-repeat`;
    /* 四邊淡出，車子縮小時看不到方格紙／線稿的矩形邊緣 */
    const EDGE = 'linear-gradient(90deg,transparent 0,#000 9%,#000 91%,transparent 100%),linear-gradient(transparent 0,#000 7%,#000 93%,transparent 100%)';
    la.style.webkitMask = `${maskUrl}, ${EDGE}`; la.style.webkitMaskComposite = 'source-in, source-in';
    la.style.mask = `${maskUrl}, ${EDGE}`; la.style.maskComposite = 'intersect';

    /* 白底方格與畫線的 SVG，位置跟線稿底圖 .la 完全一樣（含 object-fit） */
    const paper = document.createElement('img'); paper.className = 'pd-ov';
    paper.style.webkitMask = paper.style.mask = 'linear-gradient(90deg,transparent 0,#000 9%,#000 91%,transparent 100%),linear-gradient(transparent 0,#000 7%,#000 93%,transparent 100%)'; paper.style.webkitMaskComposite = 'source-in'; paper.style.maskComposite = 'intersect'; paper.alt = ''; paper.src = IMG + 'paper-v2.jpg'; paper.decoding = 'async';
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'pd-ov'); svg.setAttribute('viewBox', '0 0 2000 1250'); svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML =
      '<defs><mask id="pdMask" maskUnits="userSpaceOnUse" x="0" y="0" width="2000" height="1250"><g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round">' +
      FRAME.map(([d, w]) => `<path class="pd-m" pathLength="1" d="${d}" stroke-width="${w}"/>`).join('') +
      '</g><rect class="pd-all" width="2000" height="1250" fill="#fff" opacity="0"/></mask></defs>' +
      `<image href="${IMG}frame-lines.webp" width="2000" height="1250" preserveAspectRatio="none" mask="url(#pdMask)"/>` +
      /* 鉛筆顆粒：用雜訊遮罩筆畫，不扭曲線條 */
      '<filter id="pdGrain" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="7" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.75" result="a"/><feComposite in="SourceGraphic" in2="a" operator="in"/></filter>' +
      `<g fill="none" stroke="${PENCIL}" stroke-linecap="round" stroke-linejoin="round" filter="url(#pdGrain)">` +
      DIMS.map(d => `<path class="pd-d" pathLength="1" d="${d}" stroke-width="1.7" opacity=".34"/>`).join('') +
      DIMS.map(d => `<path class="pd-dr" pathLength="1" d="${d}" stroke-width="1.2" opacity=".16" transform="translate(1.2 -1.4)"/>`).join('') + '</g>' +
      `<g fill="none" stroke="${PENCIL}" stroke-width="1.3" stroke-linecap="round" opacity=".38">` + FRAME.map(([d]) => {
        const p = d.match(/-?[\d.]+/g).map(Number), segs = [];
        for (let k = 0; k + 3 < p.length; k += 2) { const [x1, y1, x2, y2] = p.slice(k, k + 4), L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L; segs.push(`M${x1 - ux * 42} ${y1 - uy * 42} L${x2 + ux * 42} ${y2 + uy * 42}`); }
        return `<path class="pd-c" pathLength="1" d="${segs.join(' ')}"/>`;
      }).join('') + '</g>' +
      `<g class="pd-x" fill="none" stroke="${PENCIL}" stroke-linecap="round" stroke-linejoin="round" filter="url(#pdGrain)">` +
      /* 直線兩端用漸層淡出，不會在半路突然斷掉 */
      '<defs>' + XLINES.map((d, k) => { const m = d.match(/^M(\S+) (\S+) L(\S+) (\S+)$/); return m ? `<linearGradient id="pdF${k}" gradientUnits="userSpaceOnUse" x1="${m[1]}" y1="${m[2]}" x2="${m[3]}" y2="${m[4]}"><stop offset="0" stop-color="${PENCIL}" stop-opacity="0"/><stop offset=".2" stop-color="${PENCIL}"/><stop offset=".86" stop-color="${PENCIL}"/><stop offset="1" stop-color="${PENCIL}" stop-opacity="0"/></linearGradient>` : ''; }).join('') + '</defs>' +
      XLINES.map((d, k) => { const st = /^M\S+ \S+ L/.test(d) ? ` stroke="url(#pdF${k})"` : ''; return `<path class="pd-xl" pathLength="1" d="${d}"${st} stroke-width="1.7" opacity=".55"/><path class="pd-xl" pathLength="1" d="${d}"${st} stroke-width="1.1" opacity=".2" transform="translate(1.2 -1.2)"/>`; }).join('') +
      Object.entries(HOVER).map(([k, [f, x, y, w, h]]) => `<image class="pd-hv" data-part="${k}" href="${IMG}${f}.webp?v=2" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>`).join('') + '</g>' +
      '<circle class="pd-tip" r="6" fill="#5F6670" opacity="0"/>';
    la.before(paper); la.after(svg);   // 方格紙在線稿底下，最後畫面的清楚線稿才看得到
    const sync = () => {
      const cs = getComputedStyle(la);
      [paper, svg].forEach(el => Object.assign(el.style, {left: la.offsetLeft + 'px', top: la.offsetTop + 'px', width: la.offsetWidth + 'px', height: la.offsetHeight + 'px'}));
      paper.style.objectFit = cs.objectFit; paper.style.objectPosition = cs.objectPosition;
      svg.setAttribute('preserveAspectRatio', 'xMidYMid ' + (cs.objectFit === 'contain' ? 'meet' : 'slice'));
    };
    sync(); new ResizeObserver(sync).observe(la);

    /* 每個零件一張鉛筆速寫，疊在實物下面；後輪另外一張 */
    const sk = it => { const k = Object.keys(SKETCH).find(c => it.classList.contains(c)); const s = document.createElement('img'); s.className = 'pd-sk'; s.alt = ''; s.decoding = 'async'; s.src = IMG + SKETCH[k] + '.webp'; it.insertBefore(s, it.firstChild); return s; };
    const parts = items.map(it => ({el: it, sk: sk(it), ph: it.querySelector('img:not(.pd-sk)')}));
    const rearSk = document.createElement('img'); rearSk.className = 'rear-wheel pd-sk pd-rear'; rearSk.alt = ''; rearSk.src = IMG + 'rear.webp'; rear.after(rearSk);
    const by = c => parts.find(p => p.el.classList.contains(c));
    const ORDER = [{el: rear, sk: rearSk, ph: rear}, by('p-wheel'), by('p-crank-ring'), by('p-cassette'), by('p-saddle'), by('p-stem'), by('p-bar-drop')];
    /* 速寫圖先載入；失敗（例如伺服器剛好重開）就重試，真的載不到就不顯示，避免出現破圖圖示 */
    const guard = (el, attr) => {
      const u = el.getAttribute(attr); if (!u) return;
      let n = 0; const t = new Image();
      t.onload = () => { if (n) el.setAttribute(attr, t.src); el.classList.add('pd-ok'); };
      t.onerror = () => { if (++n < 4) setTimeout(() => { t.src = u + (u.includes('?') ? '&' : '?') + 'r=' + n; }, 1200 * n); else el.remove(); };
      t.src = u;
    };
    sec.querySelectorAll('image.pd-hv').forEach(el => guard(el, 'href'));
    sec.querySelectorAll('img.pd-sk').forEach(el => guard(el, 'src'));
    const ptip = document.createElement('i'); ptip.className = 'pd-ptip'; stage.appendChild(ptip);
    const frame = [...svg.querySelectorAll('.pd-m')], dims = [...svg.querySelectorAll('.pd-d')], retrace = [...svg.querySelectorAll('.pd-dr')], guides = [...svg.querySelectorAll('.pd-c')], tip = svg.querySelector('.pd-tip');

    /* 起始狀態（跟原本 fromTo 的 immediateRender 一樣，建好就先藏起來） */
    gsap.set([la, rear].concat(parts.map(p => p.ph)), {opacity: 0});
    gsap.set([paper, svg], {opacity: 0}); gsap.set([tip, ptip], {opacity: 0});
    const xlines = [...svg.querySelectorAll('.pd-xl')];
    frame.concat(dims, retrace, guides, xlines).forEach(p => { p.style.strokeDasharray = '1 1'; p.style.strokeDashoffset = '1'; });

    const follow = (path, at, dur) => {
      const L = path.getTotalLength(), o = {p: 0};
      tl.set(tip, {opacity: 1}, at);
      tl.to(o, {p: 1, duration: dur, ease: 'power1.inOut', onUpdate: () => { const pt = path.getPointAtLength(o.p * L); tip.setAttribute('cx', pt.x); tip.setAttribute('cy', pt.y); }}, at);
      tl.to(path, {strokeDashoffset: 0, duration: dur, ease: 'power1.inOut'}, at);
    };
    tl.to(paper, {opacity: 1, duration: .15, ease: 'power1.out'}, 0).set(svg, {opacity: 1}, 0);
    let at = .04;
    tl.to(retrace[0], {strokeDashoffset: 0, duration: .2, ease: 'power1.inOut'}, at + .04); follow(dims[0], at, .14); at += .1;                                              // 地面線
    let lastDur = 0; const dur0 = () => lastDur * .3;
    frame.forEach((path, k) => {                                                       // 車架：先拉輔助線，再描正式的線
      const dur = Math.max(.07, path.getTotalLength() / 5200);
      tl.to(guides[k], {strokeDashoffset: 0, duration: dur * .5, ease: 'power1.out'}, at);
      follow(path, at + dur * .1, dur); at += dur * .8; lastDur = dur;
    });
    at += dur0();
    tl.set(tip, {opacity: 0}, at).to(svg.querySelector('.pd-all'), {opacity: 1, duration: .15}, at);

    /* 零件分兩批同時畫（每個零件各自一支筆尖）：先畫兩個輪子＋坐墊，接著飛輪、大齒盤、豎桿、車把；畫完實物淡入，速寫退掉 */
    const GROUPS = [[ORDER[0], ORDER[1], ORDER[4]], [ORDER[2], ORDER[3], ORDER[5], ORDER[6]]];
    const tips = [];
    const placeTip = (t, el, ax, ay) => { const S = stage.getBoundingClientRect(), r = el.getBoundingClientRect(); t.style.transform = `translate(${r.left - S.left + ax * r.width}px,${r.top - S.top + ay * r.height}px)`; };
    let end = at;
    GROUPS.forEach((group, g) => {
      const t0 = at + g * .16;
      group.forEach(o => {
        const wheel = o.el === rear || o.el.classList.contains('p-wheel');
        const round = wheel || /p-cassette|p-crank-ring/.test(o.el.className), dur = wheel ? .3 : .2;
        const t = ptip.cloneNode(); stage.appendChild(t); tips.push(t);
        tl.call(() => o.sk.classList.add(round ? 'pd-conic' : 'pd-lin'), null, t0);
        tl.set(o.sk, {opacity: 1}, t0).set(t, {opacity: 1}, t0);
        const v = {x: 0};
        tl.to(v, {x: 1, duration: dur, ease: 'power1.inOut', onUpdate: () => {
          if (round) { const a = v.x * 360, rad = (a - 90) * Math.PI / 180; o.sk.style.setProperty('--a', a + 'deg'); placeTip(t, o.el, .5 + .47 * Math.cos(rad), .5 + .47 * Math.sin(rad)); }
          else { o.sk.style.setProperty('--p', (v.x * 106 - 3) + '%'); placeTip(t, o.el, Math.min(1, v.x), .5); }
        }}, t0);
        tl.set(t, {opacity: 0}, t0 + dur + .02);
        tl.to(o.ph, {opacity: 1, duration: .75, ease: 'sine.inOut'}, t0 + dur);          // 畫完後實物慢慢浮現
        tl.to(o.sk, {opacity: 0, duration: .65, ease: 'sine.inOut'}, t0 + dur + .15);
        end = Math.max(end, t0 + dur);
      });
    });
    at = end - .1;
    dims.slice(1).forEach((p, k) => {   // 尺寸標註最後補上：先描一次，再淡淡重描；箭頭在線畫完後補
      const t = at + (k < 5 ? k * .03 : .2 + (k - 5) * .03);
      tl.to(p, {strokeDashoffset: 0, duration: .18, ease: 'power1.inOut'}, t);
      tl.to(retrace[k + 1], {strokeDashoffset: 0, duration: .2, ease: 'power1.inOut'}, t + .05);
    });
    /* 最後畫面：方格紙＋淡淡的清楚線稿（.la）當底，上面疊鉛筆線稿（車架、輔助線、尺寸線）；筆尖退掉 */
    tl.to(la, {opacity: .42, duration: .7, ease: 'sine.inOut'}, at + .1);     // 底下一層清楚的線，讓車架輪廓明確
    xlines.forEach((p, k) => tl.to(p, {strokeDashoffset: 0, duration: .35, ease: 'power1.inOut'}, at + .05 + (k % 12) * .025));   // 補上的製圖線與箭頭
    tl.to(svg, {opacity: .8, duration: .7, ease: 'sine.inOut'}, at + .2);      // 上面是鉛筆線稿，稍微加深
    tl.set(tips, {display: 'none'}, at + .95);
    /* 速寫只在聚焦零件時出現（零件浮起後約 0.15 秒淡入）；進場還沒畫完前不出現 */
    const sketches = [...svg.querySelectorAll('.pd-hv')];
    sec.addEventListener('partchange', e => {
      const it = items[e.detail], key = it && Object.keys(HOVER).find(c => it.classList.contains(c));
      sketches.forEach(im => im.classList.toggle('on', tl.progress() === 1 && im.dataset.part === key));
    });
    return tl;
  }
  window.PartsDraw = {build};
})();
