/* 「六大零件規格」構圖提案：注入 custom-studio/index.html，等進場畫完後調整。車架線條與方格紙都不動。
   ?ly=1 兩張速寫同高、左右對稱（加小字視圖名稱）
   ?ly=2 右側視圖欄：坐墊／車把俯視／輪框斷面三格鉛筆框（像參考圖），車子整組往左一點
   ?ly=3 對稱速寫＋尺寸線上的小字標註＋右下角製圖標題欄 */
(() => {
  const D = document, V = new URL(location.href).searchParams.get('ly') || '1';
  const IMG = new URL('img/parts-draw/', location.href).href, VIEWS = new URL('../docs/parts-views/', location.href).href;
  const NS = 'http://www.w3.org/2000/svg', PENCIL = '#8A9099';
  const T = (x, y, s, size = 17, anchor = 'start', extra = '') => `<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" ${extra}>${s}</text>`;
  const box = (x, y, w, h) => `<path d="M${x - 7} ${y} L${x + w + 9} ${y} M${x + w} ${y - 7} L${x + w} ${y + h + 9} M${x + w + 7} ${y + h} L${x - 9} ${y + h} M${x} ${y + h + 7} L${x} ${y - 9}"/>`;
  const go = () => {
    const sec = D.getElementById('parts'), svg = sec.querySelector('svg.pd-ov'), tl = window.__timelines && window.__timelines.parts;
    if (!svg || !tl || tl.progress() < 1) return setTimeout(go, 200);
    const [saddle, bar] = svg.querySelectorAll('.pd-xi');
    const place = (el, x, y, w, h) => { el.setAttribute('x', x); el.setAttribute('y', y); el.setAttribute('width', w); el.setAttribute('height', h); };
    const g = D.createElementNS(NS, 'g'); g.setAttribute('class', 'ly-g'); g.setAttribute('filter', 'url(#pdGrain)');
    g.setAttribute('style', `fill:none;stroke:${PENCIL};stroke-width:1.6;stroke-linecap:round;opacity:0;transition:opacity .6s ease`);
    const txt = s => `<g style="fill:${PENCIL};stroke:none;font-family:Inter,'Noto Sans TC',sans-serif;font-weight:600;letter-spacing:.08em">${s}</g>`;
    let html = '';
    if (V === '1' || V === '3') {
      place(saddle, 150, 300, 280, 190); place(bar, 1665, 300, 280, 190);
      html += txt(T(290, 530, 'SADDLE · 3/4 VIEW', 16, 'middle') + T(1805, 530, 'HANDLEBAR · TOP VIEW', 16, 'middle'));
      html += `<path d="M200 512 L380 512 M1700 512 L1910 512" stroke-width="1.2" opacity=".6"/>`;
    }
    if (V === '2') {
      const P = [[1690, 236, 'SADDLE · 3/4', saddle], [1690, 486, 'HANDLEBAR · TOP', bar], [1690, 736, 'RIM · SECTION', null]];
      P.forEach(([x, y, t, el]) => {
        html += box(x, y, 270, 220) + txt(T(x + 135, y + 34, t, 15, 'middle'));
        if (el) place(el, x + 24, y + 52, 222, 150);
        else html += `<image href="${VIEWS}rim-section.webp" x="${x + 24}" y="${y + 52}" width="222" height="150" preserveAspectRatio="xMidYMid meet" opacity=".62"/>`;
      });
      /* 車子整組往左，讓出右側視圖欄 */
      const wrap = sec.querySelector('.pd-stage'), strip = sec.querySelector('.pd-strip'), k = wrap.getBoundingClientRect().width / 1440, dx = Math.round(120 * k);
      wrap.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)'; wrap.style.transform = `translateX(-${dx}px) ${wrap.style.transform}`;
      if (strip && strip.style.left) strip.style.left = (parseFloat(strip.style.left) - dx) + 'px';
    }
    if (V === '3') {
      html += txt(
        T(991, 1048, '軸距 WHEELBASE', 18, 'middle') +
        `<g transform="translate(1662 726) rotate(-90)">${T(0, 0, '車高 HEIGHT', 18, 'middle')}</g>` +
        T(652, 996, 'REAR AXLE', 14, 'middle') + T(1336, 996, 'FRONT AXLE', 14, 'middle'));
      /* 右下角製圖標題欄 */
      const x = 1690, y = 960, w = 290, rows = [['專案', 'GIANT 客製化自行車'], ['車系', 'On-Road 碳纖維車架'], ['視圖', '側視 SIDE VIEW'], ['單位', 'mm・依車架尺寸而定']];
      html += box(x, y, w, rows.length * 34) + rows.map((_, i) => i ? `<path d="M${x} ${y + i * 34} L${x + w} ${y + i * 34}" stroke-width="1.1"/>` : '').join('') + `<path d="M${x + 78} ${y} L${x + 78} ${y + rows.length * 34}" stroke-width="1.1"/>`;
      html += txt(rows.map(([a, b], i) => T(x + 14, y + 23 + i * 34, a, 14) + T(x + 94, y + 23 + i * 34, b, 14)).join(''));
    }
    g.innerHTML = html; svg.appendChild(g);
    requestAnimationFrame(() => requestAnimationFrame(() => { g.style.opacity = '.85'; }));
  };
  go();
})();
