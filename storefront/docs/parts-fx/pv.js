/* 「六大零件規格」旁邊留白提案：注入 custom-studio/index.html。等進場畫完，再在鉛筆圖層上補畫。
   ?pv=1 補線條（座墊／車把水平線與落差箭頭、軸心與五通鉛直線、Stack／Reach、座管角與頭管角）
   ?pv=2 小視角速寫（後視、正視、上視）＋弧形箭頭
   ?pv=3 兩者合併
   ?pv=S 坐墊俯視、?pv=D 座管斷面（左上一張＋右側車把俯視，坐墊旁不畫線） */
(() => {
  const D = document, V = new URL(location.href).searchParams.get('pv') || '3';
  const IMG = new URL('../docs/parts-views/', location.href).href;
  const PENCIL = '#8A9099';
  const head = (x, y, dx, dy, s = 16) => {   // 開口箭頭
    const L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, a = .45;
    const p = (r) => [x - s * (ux * Math.cos(r) - uy * Math.sin(r)), y - s * (uy * Math.cos(r) + ux * Math.sin(r))];
    const [x1, y1] = p(a), [x2, y2] = p(-a);
    return `M${x1.toFixed(1)} ${y1.toFixed(1)} L${x} ${y} L${x2.toFixed(1)} ${y2.toFixed(1)}`;
  };
  const dimV = (x, y1, y2) => [`M${x} ${y1} L${x} ${y2}`, head(x, y1, 0, -1), head(x, y2, 0, 1)];
  const dimH = (y, x1, x2) => [`M${x1} ${y} L${x2} ${y}`, head(x1, y, -1, 0), head(x2, y, 1, 0)];
  /* 線稿座標（2000×1250）：五通 (940,775)、後軸 (652,728)、前軸 (1336,730)、頭管上 (1222,393)、頭管下 (1248,492)、座墊頂 y≈282、車把頂 y≈352、地面 955 */
  const LINES = [
    'M630 282 L1470 282', 'M1080 352 L1480 352', ...dimV(1462, 286, 348),                       // 座墊與車把的落差
    'M940 250 L940 975', 'M652 470 L652 975', 'M1336 470 L1336 975', 'M380 729 L1610 729',     // 五通、前後軸鉛直線與軸心水平線
    ...dimV(905, 400, 770), ...dimH(372, 944, 1218),                                           // Stack／Reach
    'M850 775 A90 90 0 0 1 916.6 688.1', 'M1328 492 A80 80 0 0 1 1268.4 569.6'                // 座管角、頭管角
  ];
  const VIEWS = [
    {f: 'rear', box: [96, 330, 230, 400], arrow: 'M440 650 C410 612 382 600 348 598', tip: [348, 598, -1, -.05]},
    {f: 'front', box: [1700, 280, 240, 410], arrow: 'M1418 402 C1500 352 1600 372 1684 444', tip: [1684, 444, .76, .65]},
    {f: 'top', box: [1690, 760, 240, 176], arrow: 'M1912 700 C1952 722 1950 760 1912 790', tip: [1912, 790, -.75, .66]}
  ];
  /* ?pv=S 坐墊俯視／?pv=D 座管斷面：拿掉坐墊旁的線與箭頭，只留軸心／五通線與角度弧；右側只留車把俯視，左上放新速寫 */
  const KEEP = ['M940 540 L940 975', 'M652 470 L652 975', 'M1336 470 L1336 975', 'M380 729 L1610 729',
    'M850 775 A90 90 0 0 1 916.6 688.1', 'M1328 492 A80 80 0 0 1 1268.4 569.6'];
  const TOPV = {f: 'top', box: [1690, 540, 250, 190], arrow: 'M1420 404 C1520 356 1640 410 1706 520', tip: [1706, 520, .5, .87]};
  const LEFT = {
    S: {f: 'saddle-top', box: [130, 250, 360, 250], arrow: 'M700 312 C640 300 560 330 500 372', tip: [500, 372, -.82, .57]},
    D: {f: 'seatpost-d', box: [130, 240, 360, 260], arrow: 'M806 420 C720 380 600 380 500 400', tip: [500, 400, -.98, .2]}};
  if (LEFT[V]) { LINES.length = 0; LINES.push(...KEEP); VIEWS.length = 0; VIEWS.push(LEFT[V], TOPV); }
  const css = D.createElement('style');
  css.textContent = `
  .pv-g path{fill:none;stroke:${PENCIL};stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1 1;stroke-dashoffset:1;transition:stroke-dashoffset .55s cubic-bezier(.4,0,.2,1)}
  .pv-g.on path{stroke-dashoffset:0}
  .pv-g image{opacity:0;transition:opacity .7s ease}
  .pv-g.on image{opacity:.62}`;
  D.head.appendChild(css);

  const go = () => {
    const svg = D.querySelector('#parts svg.pd-ov'), tl = window.__timelines && window.__timelines.parts;
    if (!svg || !tl || tl.progress() < 1) return setTimeout(go, 200);
    const NS = 'http://www.w3.org/2000/svg', g = D.createElementNS(NS, 'g'); g.setAttribute('class', 'pv-g'); g.setAttribute('filter', 'url(#pdGrain)');
    let html = '', k = 0;
    const path = (d, w, o) => `<path pathLength="1" d="${d}" stroke-width="${w}" opacity="${o}" style="transition-delay:${(k++ * .04).toFixed(2)}s"/>`;
    if (V === '1' || V === '3' || LEFT[V]) LINES.forEach(d => { html += path(d, 1.7, .55); html += `<path pathLength="1" d="${d}" stroke-width="1.1" opacity=".2" transform="translate(1.2 -1.2)" style="transition-delay:${(k * .04 + .08).toFixed(2)}s"/>`; });
    if (V === '2' || V === '3' || LEFT[V]) VIEWS.forEach(v => {
      const [x, y, w, h] = v.box;
      html += `<image href="${IMG}${v.f}.webp" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" style="transition-delay:${(.25 + k * .04).toFixed(2)}s"/>`;
      html += path(v.arrow, 1.8, .5); html += path(head(...v.tip.slice(0, 2), ...v.tip.slice(2), 18), 1.8, .5);
    });
    g.innerHTML = html; svg.appendChild(g);
    requestAnimationFrame(() => requestAnimationFrame(() => g.classList.add('on')));
  };
  go();
})();
