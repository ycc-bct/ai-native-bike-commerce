/* 「六大零件規格」進場提案：注入到嵌入的 custom-studio/index.html 裡執行。
   不改原頁檔案；先停掉原本的 GSAP 進場，再依 variant 播 A／B／C／D。 */
(() => {
  const W = window, D = document, gsap = W.gsap;
  const BASE = new URL('.', D.currentScript.src).href;           // .../storefront/docs/parts-fx/
  const sec = D.getElementById('parts'), stage = sec.querySelector('.in');
  const la = sec.querySelector('.la'), rear = sec.querySelector('.rear-wheel');
  const items = [...sec.querySelectorAll('.pp10')];
  const head = sec.querySelector('.phd9');
  const byCls = c => items.find(i => i.classList.contains(c));
  const SK = {'p-saddle':'saddle','p-cassette':'cassette','p-crank-ring':'crank','p-stem':'stem','p-bar-drop':'bar','p-wheel':'wheel'};

  /* 1. 停掉原本的進場：清空 timeline，塞一段很長的空白，原頁的 observer 播了也不會結束、不會開始輪播 */
  const tl = W.__timelines && W.__timelines.parts;
  if (tl) { tl.clear(); tl.to({}, {duration: 1e5}); }
  const css = D.createElement('style');
  css.textContent = `
    .orb-callout{display:none!important}
    .fx-sk{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none;opacity:0}
    .fx-svg{position:absolute;pointer-events:none;overflow:visible;z-index:5}
    .fx-svg path,.fx-svg line,.fx-svg circle{fill:none}
    img.fx-ov{position:absolute;display:block;opacity:0;pointer-events:none}
    .fx-sk.fx-conic{-webkit-mask-image:conic-gradient(from 0deg,#000 var(--a,0deg),transparent calc(var(--a,0deg) + .6deg));mask-image:conic-gradient(from 0deg,#000 var(--a,0deg),transparent calc(var(--a,0deg) + .6deg))}
    .fx-sk.fx-lin{-webkit-mask-image:linear-gradient(90deg,#000 var(--p,0%),transparent calc(var(--p,0%) + 3%));mask-image:linear-gradient(90deg,#000 var(--p,0%),transparent calc(var(--p,0%) + 3%))}
    .fx-ptip{position:absolute;left:0;top:0;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;background:#5F6670;opacity:0;pointer-events:none;z-index:40}
    svg.fx-ov{opacity:0}
    .fx-scan{position:absolute;top:0;bottom:0;width:2px;background:#1F4FE0;box-shadow:0 0 18px 4px rgba(31,79,224,.45),0 0 60px 18px rgba(31,79,224,.16);z-index:30;pointer-events:none;opacity:0}
    .fx-scan::before{content:"";position:absolute;right:2px;top:0;bottom:0;width:180px;background:linear-gradient(90deg,rgba(31,79,224,0),rgba(31,79,224,.10))}
    .fx-bp{position:absolute;inset:0;z-index:15;pointer-events:none;background:#1A3F97;opacity:0}
    .fx-bp img{position:absolute;display:block}
    .parts10.fx-dark .phd9 h2,.parts10.fx-dark .phd9 p{color:#fff!important;transition:color .6s ease}
    .parts10 .phd9 h2,.parts10 .phd9 p{transition:color .6s ease}
    .parts10 .phd9{z-index:16}
  `;
  D.head.appendChild(css);

  /* 2. 每個零件加一張藍色線稿，疊在實物照片下面 */
  items.forEach(it => {
    const k = Object.keys(SK).find(c => it.classList.contains(c));
    const s = D.createElement('img'); s.className = 'fx-sk'; s.alt = ''; s.src = BASE + SK[k] + '-sketch.png';
    it.insertBefore(s, it.firstChild);
  });
  const rearSk = D.createElement('img'); rearSk.className = 'rear-wheel fx-sk'; rearSk.alt = ''; rearSk.src = BASE + 'rear-sketch.png';
  rear.after(rearSk);
  const photo = it => it.querySelector('img:not(.fx-sk)');
  const sketch = it => it.querySelector('.fx-sk');

  /* 3. 疊在線稿底圖上的 SVG（座標 = 線稿圖 2000×1250），跟 .la 的 object-fit 對齊 */
  const NS = 'http://www.w3.org/2000/svg';
  const svg = D.createElementNS(NS, 'svg'); svg.setAttribute('class', 'fx-svg'); svg.setAttribute('viewBox', '0 0 2000 1250');
  svg.innerHTML = `<defs><filter id="fxHand" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter></defs>
    <g id="fxDims" stroke="#A3A9B2" stroke-width="1.4">
      <line x1="316" y1="955" x2="1672" y2="955"/><line x1="650" y1="1003" x2="1333" y2="1003"/>
      <line x1="650" y1="955" x2="650" y2="1014"/><line x1="1333" y1="955" x2="1333" y2="1014"/>
      <line x1="1625" y1="498" x2="1625" y2="955"/><line x1="1250" y1="497" x2="1638" y2="497"/>
    </g>
    <g id="fxWheels" stroke="#B4B9C1" stroke-width="1.2" stroke-dasharray="6 7">
      <circle cx="657" cy="727" r="232"/><circle cx="1335" cy="729" r="232"/>
    </g>
    <g id="fxFrame" stroke="#545A63" stroke-width="2.6" stroke-linecap="round" filter="url(#fxHand)">
      <path d="M798 318 L858 470 L940 772"/><path d="M865 468 L1222 398"/><path d="M1218 392 L1248 492"/>
      <path d="M1242 494 L948 762"/><path d="M930 778 L658 728"/><path d="M850 486 L660 722"/>
      <path d="M1238 500 L1335 730"/><circle cx="940" cy="773" r="17"/><circle cx="657" cy="727" r="9"/><circle cx="1335" cy="730" r="7"/>
    </g>`;
  stage.appendChild(svg);
  function placeOverlay(el, box) {
    const r = la.getBoundingClientRect(), s = stage.getBoundingClientRect();
    el.style.left = (r.left - s.left) + 'px'; el.style.top = (r.top - s.top) + 'px';
    el.style.width = r.width + 'px'; el.style.height = r.height + 'px';
    if (el.tagName.toLowerCase() === 'svg') el.setAttribute('preserveAspectRatio', 'xMidYMid ' + (getComputedStyle(la).objectFit === 'contain' ? 'meet' : 'slice'));
  }
  const drawables = sel => [...svg.querySelectorAll(sel)];
  drawables('path,line,circle').forEach(p => { const L = p.getTotalLength ? p.getTotalLength() : 600; p.style.strokeDasharray = p.closest('#fxWheels') ? '6 7' : L; p.dataset.len = L; });

  /* E：白底方格 → 鉛筆筆尖照順序畫出「頁面本身的」車架線與尺寸線 → 每個零件用自己的鉛筆速寫畫出來 → 實物淡入（同一張畫布，必定對齊） */
  const paper = D.createElement('img'); paper.className = 'fx-ov'; paper.alt = ''; paper.src = BASE + 'paper-2880.jpg';
  const draw = D.createElementNS(NS, 'svg'); draw.setAttribute('class', 'fx-svg fx-ov'); draw.setAttribute('viewBox', '0 0 2000 1250');
  const PENCIL = '#8A9099';
  const FRAME = [   // 一筆一筆的順序：從五通往上畫座管 → 上管 → 頭管 → 下管回五通 → 後下叉 → 後上叉 → 前叉
    ['M940 775 L858 470 L792 312', 46], ['M858 470 L1222 393', 46], ['M1222 393 L1248 492', 44], ['M1248 492 L944 768', 52],
    ['M940 775 L657 727', 44], ['M657 727 L855 478', 40], ['M1240 496 L1337 733', 40]
  ];
  const DIMS = ['M316 955 L1672 955', 'M650 1003 L1333 1003', 'M650 955 L650 1014', 'M1333 955 L1333 1014', 'M1625 498 L1625 955', 'M1250 497 L1638 497'];
  draw.innerHTML = '<defs><mask id="fxEm" maskUnits="userSpaceOnUse" x="0" y="0" width="2000" height="1250"><g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round">' +
      FRAME.map(([d, w]) => `<path class="fxE-m" pathLength="1" d="${d}" stroke-width="${w}"/>`).join('') +
    '</g><rect id="fxEall" width="2000" height="1250" fill="#fff" opacity="0"/></mask></defs>' +
    '<image href="' + BASE + 'frame-lines.webp" width="2000" height="1250" preserveAspectRatio="none" mask="url(#fxEm)"/>' +
    '<g fill="none" stroke="' + PENCIL + '" stroke-width="1.6" stroke-linecap="round" opacity=".75">' + DIMS.map(d => `<path class="fxE-d" pathLength="1" d="${d}"/>`).join('') + '</g>' +
    // 構圖線：每一筆先拉一條超出兩端的淡直線
    '<g fill="none" stroke="' + PENCIL + '" stroke-width="1.3" stroke-linecap="round" opacity=".38">' + FRAME.map(([d]) => {
      const pts = d.match(/-?[\d.]+/g).map(Number), segs = [];
      for (let k = 0; k + 3 < pts.length; k += 2) { const [x1, y1, x2, y2] = pts.slice(k, k + 4), L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, e = 42; segs.push(`M${x1 - ux * e} ${y1 - uy * e} L${x2 + ux * e} ${y2 + uy * e}`); }
      return `<path class="fxE-c" pathLength="1" d="${segs.join(' ')}"/>`;
    }).join('') + '</g>' +
    // 鉛筆筆尖：跟著正在畫的那一筆走
    '<circle class="fxE-tip" r="6" fill="#5F6670" opacity="0"/>';
  la.after(paper, draw);
  const frameStrokes = [...draw.querySelectorAll('.fxE-m')], dimStrokes = [...draw.querySelectorAll('.fxE-d')], buildStrokes = [...draw.querySelectorAll('.fxE-c')], tip = draw.querySelector('.fxE-tip');
  /* 零件筆尖（在零件座標裡，跟著輪子繞圈或沿零件走） */
  const ptip = D.createElement('i'); ptip.className = 'fx-ptip'; stage.appendChild(ptip);
  /* 掃描線、藍圖覆蓋層 */
  const scan = D.createElement('div'); scan.className = 'fx-scan'; stage.appendChild(scan);
  const bp = D.createElement('div'); bp.className = 'fx-bp'; bp.innerHTML = '<img alt="" src="' + new URL('../../custom-studio/img/parts-bg/blueprint-2880.jpg', BASE).href + '">'; stage.insertBefore(bp, stage.firstChild);

  /* 引線（B 用） */
  const leaders = D.createElementNS(NS, 'svg'); leaders.setAttribute('class', 'fx-svg'); leaders.style.left = '0'; leaders.style.top = '0'; leaders.style.width = '100%'; leaders.style.height = '100%'; stage.appendChild(leaders);

  let cycle, running = [];
  function reset() {
    running.forEach(a => a.kill && a.kill()); running = [];
    clearInterval(cycle);
    sec.classList.remove('parts-ready', 'fx-dark');
    items.forEach(it => { it.classList.remove('hov'); gsap.set(it, {x: 0, y: 0, scale: 1, opacity: 1}); gsap.set(it, {clearProps: 'opacity'}); gsap.set(photo(it), {clearProps: 'opacity,clipPath'}); photo(it).style.clipPath = ''; gsap.set(sketch(it), {opacity: 0, clipPath: 'none'}); });
    gsap.set([rear, la], {clearProps: 'opacity,clipPath,scale,transform'}); gsap.set(rearSk, {opacity: 0, clipPath: 'none'});
    placeOverlay(svg);
    gsap.set(svg, {opacity: 0}); drawables('path,line,circle').forEach(p => { if (!p.closest('#fxWheels')) p.style.strokeDashoffset = p.dataset.len; });
    gsap.set(drawables('#fxWheels circle'), {opacity: 0});
    [paper, draw].forEach(el => { placeOverlay(el); el.style.objectFit = getComputedStyle(la).objectFit; }); gsap.set([paper, draw], {opacity: 0});
    frameStrokes.concat(dimStrokes, buildStrokes).forEach(p => { p.style.strokeDasharray = '1 1'; p.style.strokeDashoffset = '1'; }); gsap.set(draw.querySelector('#fxEall'), {opacity: 0}); gsap.set(tip, {opacity: 0}); gsap.set(ptip, {opacity: 0});
    [rearSk].concat(items.map(sketch)).forEach(el => { el.classList.remove('fx-conic', 'fx-lin'); el.style.removeProperty('--a'); el.style.removeProperty('--p'); });
    gsap.set(scan, {opacity: 0, x: 0}); gsap.set(bp, {opacity: 0}); leaders.innerHTML = '';
    const r = la.getBoundingClientRect(), s = stage.getBoundingClientRect(), img = bp.querySelector('img');
    Object.assign(img.style, {left: (r.left - s.left) + 'px', top: (r.top - s.top) + 'px', width: r.width + 'px', height: r.height + 'px', objectFit: getComputedStyle(la).objectFit});
  }
  function finish(t) {
    t.call(() => {
      sec.classList.add('parts-ready');
      let i = 0; const show = () => items.forEach((it, k) => it.classList.toggle('hov', k === i));
      show(); cycle = setInterval(() => { i = (i + 1) % items.length; show(); }, 2200);
    });
  }
  /* 零件出場順序：後輪、前輪、大齒盤、飛輪、坐墊、豎桿、把手 */
  const ORDER = () => [{el: rear, sk: rearSk, ph: rear}].concat(['p-wheel', 'p-crank-ring', 'p-cassette', 'p-saddle', 'p-stem', 'p-bar-drop'].map(c => { const it = byCls(c); return {el: it, sk: sketch(it), ph: photo(it)}; }));

  const V = {};
  /* A. 藍圖手繪：尺寸線 → 車架描線 → 線稿淡入 → 每個零件先速寫、再上實物 */
  V.A = () => {
    const t = gsap.timeline();
    t.set(la, {opacity: 0}).set([rear], {opacity: 0}).set(items.map(photo), {opacity: 0}).set(svg, {opacity: 1});
    t.to(drawables('#fxDims line'), {strokeDashoffset: 0, duration: .5, stagger: .07, ease: 'power2.inOut'}, 0);
    t.to(drawables('#fxWheels circle'), {opacity: 1, duration: .4, stagger: .1}, .25);
    t.to(drawables('#fxFrame path,#fxFrame circle'), {strokeDashoffset: 0, duration: .32, stagger: .1, ease: 'power1.inOut'}, .35);
    t.to(la, {opacity: 1, duration: .6, ease: 'power1.out'}, 1.45);
    t.to(svg, {opacity: 0, duration: .5}, 1.65);
    ORDER().forEach((o, i) => {
      const at = 1.55 + i * .17;
      t.fromTo(o.sk, {opacity: 1, clipPath: 'inset(0 100% 0 0)'}, {clipPath: 'inset(0 0% 0 0)', duration: .42, ease: 'power1.inOut'}, at);
      t.to(o.ph, {opacity: 1, duration: .4, ease: 'power1.out'}, at + .34);
      t.to(o.sk, {opacity: 0, duration: .35}, at + .6);
    });
    finish(t); return t;
  };
  /* B. 爆炸圖組裝：零件停在旁邊，虛線指向安裝位置，依序滑進去 */
  V.B = () => {
    const t = gsap.timeline(), S = stage.getBoundingClientRect();
    const list = ORDER().map(o => {
      const it = o.el, dx = it === rear ? -1 : +it.dataset.ox, dy = it === rear ? -.2 : +it.dataset.oy, n = Math.hypot(dx, dy) || 1;
      const off = it.classList && (it.classList.contains('p-wheel') || it === rear) ? 110 : 90;
      const r = it.getBoundingClientRect(), cx = r.left + r.width / 2 - S.left, cy = r.top + r.height / 2 - S.top;
      const x = dx / n * off, y = dy / n * off;
      const ln = D.createElementNS(NS, 'line');
      Object.entries({x1: cx + x, y1: cy + y, x2: cx, y2: cy, stroke: '#1F4FE0', 'stroke-width': 1.4, 'stroke-dasharray': '5 6', opacity: 0}).forEach(([k, v]) => ln.setAttribute(k, v));
      leaders.appendChild(ln);
      return {it, x, y, ln};
    });
    list.forEach((o, i) => t.set(o.it, {x: o.x, y: o.y, opacity: 0}, 0));
    list.forEach((o, i) => { t.to(o.ln, {opacity: 1, duration: .3}, .05 + i * .05); t.to(o.it, {opacity: 1, duration: .35}, .15 + i * .05); });
    list.forEach((o, i) => {
      const at = .75 + i * .14;
      t.to(o.it, {x: 0, y: 0, duration: .55, ease: 'back.out(1.6)'}, at);
      t.to(o.ln, {opacity: 0, duration: .3}, at + .2);
    });
    finish(t); return t;
  };
  /* C. 掃描線：零件先是線稿，一道藍光從左掃到右，掃過的地方變成實物 */
  V.C = () => {
    const t = gsap.timeline(), S = stage.getBoundingClientRect();
    const x0 = Math.min(...ORDER().map(o => o.el.getBoundingClientRect().left)) - S.left - 60;
    const x1 = Math.max(...ORDER().map(o => o.el.getBoundingClientRect().right)) - S.left + 60;
    const DUR = 1.7, start = .45;
    ORDER().forEach(o => { t.set(o.ph, {clipPath: 'inset(0 100% 0 0)'}, 0); t.set(o.el, {opacity: 1}, 0); });
    t.to(ORDER().map(o => o.sk), {opacity: 1, duration: .35, stagger: .04}, 0);
    t.set(scan, {x: x0}, 0).to(scan, {opacity: 1, duration: .2}, start - .05).to(scan, {x: x1, duration: DUR, ease: 'none'}, start).to(scan, {opacity: 0, duration: .25}, start + DUR - .1);
    ORDER().forEach(o => {
      const r = o.el.getBoundingClientRect(), L = r.left - S.left, R = r.right - S.left;
      const a = start + (L - x0) / (x1 - x0) * DUR, d = Math.max(.08, (R - L) / (x1 - x0) * DUR);
      t.to(o.ph, {clipPath: 'inset(0 0% 0 0)', duration: d, ease: 'none'}, a);
      t.fromTo(o.sk, {clipPath: 'inset(0 0 0 0%)'}, {clipPath: 'inset(0 0 0 100%)', duration: d, ease: 'none'}, a);
    });
    finish(t); return t;
  };
  /* D. 藍圖翻轉：先是整張深藍工程藍圖，停一下，淡成淺色線稿，零件原位淡入 */
  V.D = () => {
    const t = gsap.timeline();
    t.set(bp, {opacity: 1}, 0).call(() => sec.classList.add('fx-dark'), null, 0);
    t.set([rear].concat(items), {opacity: 0, scale: .97, transformOrigin: '50% 50%'}, 0);
    t.fromTo(bp.querySelector('img'), {opacity: 0, scale: 1.02}, {opacity: 1, scale: 1, duration: .7, ease: 'power2.out'}, 0);
    t.call(() => sec.classList.remove('fx-dark'), null, 1.45);
    t.to(bp, {opacity: 0, duration: .8, ease: 'power1.inOut'}, 1.4);
    ORDER().forEach((o, i) => t.to(o.el, {opacity: 1, scale: 1, duration: .55, ease: 'power2.out'}, 1.6 + i * .07));
    finish(t); return t;
  };

  /* E. 鉛筆藍圖：筆尖照順序畫 → 零件速寫（同畫布對齊）→ 實物淡入 */
  V.E = () => {
    const t = gsap.timeline(), S = stage.getBoundingClientRect();
    t.set(la, {opacity: 0}).set(rear, {opacity: 0}).set(items.map(photo), {opacity: 0}).set(draw, {opacity: 1});
    t.to(paper, {opacity: 1, duration: .4, ease: 'power1.out'}, 0);
    /* 筆尖跟著某一筆走：依 progress 取那一筆上的點 */
    const follow = (path, at, dur, ease) => {
      const L = path.getTotalLength(), o = {p: 0};
      t.set(tip, {opacity: 1}, at);
      t.to(o, {p: 1, duration: dur, ease, onUpdate: () => { const pt = path.getPointAtLength(o.p * L); tip.setAttribute('cx', pt.x); tip.setAttribute('cy', pt.y); }}, at);
      t.to(path, {strokeDashoffset: 0, duration: dur, ease}, at);
    };
    let at = .25;
    follow(dimStrokes[0], at, .45, 'power1.inOut'); at += .5;                       // 地面線
    FRAME.forEach(([d], k) => {                                                       // 車架一筆一筆
      const path = frameStrokes[k], dur = Math.max(.2, path.getTotalLength() / 1350);
      t.to(buildStrokes[k], {strokeDashoffset: 0, duration: dur * .55, ease: 'power1.out'}, at);   // 先拉輔助線
      follow(path, at + dur * .3, dur, 'power1.inOut'); at += dur * 1.3 + .03;                      // 再描正式的線
    });
    t.set(tip, {opacity: 0}, at); t.to(draw.querySelector('#fxEall'), {opacity: 1, duration: .25}, at);
    /* 零件：輪子、飛輪、大齒盤繞圈畫；坐墊、豎桿、把手由左往右畫。畫完實物淡入，速寫退掉 */
    const tipAt = (el, ax, ay) => { const r = el.getBoundingClientRect(); ptip.style.transform = `translate(${r.left - S.left + ax * r.width}px,${r.top - S.top + ay * r.height}px)`; };
    const seq = ORDER();
    seq.forEach((o, k) => {
      const round = o.el === rear || /p-wheel|p-cassette|p-crank-ring/.test(o.el.className);
      const dur = o.el === rear || /p-wheel/.test(o.el.className) ? .55 : .36;
      t.call(() => { o.sk.classList.add(round ? 'fx-conic' : 'fx-lin'); }, null, at);
      t.set(o.sk, {opacity: 1}, at).set(ptip, {opacity: 1}, at);
      const v = {x: 0};
      t.to(v, {x: 1, duration: dur, ease: 'power1.inOut', onUpdate: () => {
        if (round) { const a = v.x * 360; o.sk.style.setProperty('--a', a + 'deg'); const rad = (a - 90) * Math.PI / 180; tipAt(o.el, .5 + .47 * Math.cos(rad), .5 + .47 * Math.sin(rad)); }
        else { o.sk.style.setProperty('--p', (v.x * 106 - 3) + '%'); tipAt(o.el, Math.min(1, v.x), .5); }
      }}, at);
      t.to(o.ph, {opacity: 1, duration: .45, ease: 'power1.out'}, at + dur - .05);
      t.to(o.sk, {opacity: 0, duration: .4}, at + dur + .25);
      at += dur * .85;
    });
    t.set(ptip, {opacity: 0}, at + .1);
    /* 尺寸標註最後補上 */
    dimStrokes.slice(1).forEach((p, k) => t.to(p, {strokeDashoffset: 0, duration: .3, ease: 'power1.inOut'}, at + k * .06));
    t.to(la, {opacity: 1, duration: .7, ease: 'power1.inOut'}, at + .35);
    t.to([draw, paper], {opacity: 0, duration: .7, ease: 'power1.inOut'}, at + .45);
    finish(t); return t;
  };

  W.__partsFx = {
    run(v) { reset(); const t = V[v](); running.push(t); },
    reset
  };
  reset();
})();
