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
  const DIMS = ['M316 955 L1672 955', 'M650 1003 L1333 1003', 'M650 955 L650 1014', 'M1333 955 L1333 1014', 'M1625 498 L1625 955', 'M1250 497 L1638 497'];

  function build(sec, tl) {
    const gsap = window.gsap, stage = sec.querySelector('.in'), la = sec.querySelector('.la'), rear = sec.querySelector('.rear-wheel');
    const items = [...sec.querySelectorAll('.pp10')];
    sec.classList.add('pd-on');

    /* 白底方格與畫線的 SVG，位置跟線稿底圖 .la 完全一樣（含 object-fit） */
    const paper = document.createElement('img'); paper.className = 'pd-ov'; paper.alt = ''; paper.src = IMG + 'paper.jpg'; paper.decoding = 'async';
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'pd-ov'); svg.setAttribute('viewBox', '0 0 2000 1250'); svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML =
      '<defs><mask id="pdMask" maskUnits="userSpaceOnUse" x="0" y="0" width="2000" height="1250"><g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round">' +
      FRAME.map(([d, w]) => `<path class="pd-m" pathLength="1" d="${d}" stroke-width="${w}"/>`).join('') +
      '</g><rect class="pd-all" width="2000" height="1250" fill="#fff" opacity="0"/></mask></defs>' +
      `<image href="${IMG}frame-lines.webp" width="2000" height="1250" preserveAspectRatio="none" mask="url(#pdMask)"/>` +
      `<g fill="none" stroke="${PENCIL}" stroke-width="1.6" stroke-linecap="round" opacity=".75">` + DIMS.map(d => `<path class="pd-d" pathLength="1" d="${d}"/>`).join('') + '</g>' +
      `<g fill="none" stroke="${PENCIL}" stroke-width="1.3" stroke-linecap="round" opacity=".38">` + FRAME.map(([d]) => {
        const p = d.match(/-?[\d.]+/g).map(Number), segs = [];
        for (let k = 0; k + 3 < p.length; k += 2) { const [x1, y1, x2, y2] = p.slice(k, k + 4), L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L; segs.push(`M${x1 - ux * 42} ${y1 - uy * 42} L${x2 + ux * 42} ${y2 + uy * 42}`); }
        return `<path class="pd-c" pathLength="1" d="${segs.join(' ')}"/>`;
      }).join('') + '</g>' +
      '<circle class="pd-tip" r="6" fill="#5F6670" opacity="0"/>';
    la.after(paper, svg);
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
    const ptip = document.createElement('i'); ptip.className = 'pd-ptip'; stage.appendChild(ptip);
    const frame = [...svg.querySelectorAll('.pd-m')], dims = [...svg.querySelectorAll('.pd-d')], guides = [...svg.querySelectorAll('.pd-c')], tip = svg.querySelector('.pd-tip');

    /* 起始狀態（跟原本 fromTo 的 immediateRender 一樣，建好就先藏起來） */
    gsap.set([la, rear].concat(parts.map(p => p.ph)), {opacity: 0});
    gsap.set([paper, svg], {opacity: 0}); gsap.set([tip, ptip], {opacity: 0});
    frame.concat(dims, guides).forEach(p => { p.style.strokeDasharray = '1 1'; p.style.strokeDashoffset = '1'; });

    const follow = (path, at, dur) => {
      const L = path.getTotalLength(), o = {p: 0};
      tl.set(tip, {opacity: 1}, at);
      tl.to(o, {p: 1, duration: dur, ease: 'power1.inOut', onUpdate: () => { const pt = path.getPointAtLength(o.p * L); tip.setAttribute('cx', pt.x); tip.setAttribute('cy', pt.y); }}, at);
      tl.to(path, {strokeDashoffset: 0, duration: dur, ease: 'power1.inOut'}, at);
    };
    tl.to(paper, {opacity: 1, duration: .15, ease: 'power1.out'}, 0).set(svg, {opacity: 1}, 0);
    let at = .04;
    follow(dims[0], at, .14); at += .1;                                              // 地面線
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
    dims.slice(1).forEach((p, k) => tl.to(p, {strokeDashoffset: 0, duration: .18, ease: 'power1.inOut'}, at + k * .03));   // 尺寸標註最後補上
    tl.to(la, {opacity: 1, duration: .7, ease: 'sine.inOut'}, at + .1);
    tl.to([svg, paper], {opacity: 0, duration: .7, ease: 'sine.inOut'}, at + .2);
    tl.set([svg, paper].concat(tips), {display: 'none'}, at + .95);
    return tl;
  }
  window.PartsDraw = {build};
})();
