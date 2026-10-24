/* 「六大零件規格」背景速寫擺放提案：注入 custom-studio/index.html。左：坐墊、飛輪、大齒盤；右：車把（俯視）、豎桿、輪組。
   都是背景，不加文字。物件大小統一放進差不多的方框裡。車架線條與方格紙不動。
   ?sk=1 兩側直欄對齊　?sk=2 錯落擺放（略帶旋轉）　?sk=3 靠近各自零件的高度 */
(() => {
  const D = document, V = new URL(location.href).searchParams.get('sk') || '1';
  const SRC = {
    saddle: new URL('img/parts-draw/saddle-34.webp', location.href).href,
    cassette: new URL('../docs/parts-views/cassette-simple.webp', location.href).href,
    crank: new URL('../docs/parts-views/crank-34.webp', location.href).href,
    bar: new URL('../docs/parts-views/bar-top-clean.webp', location.href).href,
    stem: new URL('../docs/parts-views/stem-34.webp', location.href).href,
    wheel: new URL('../docs/parts-views/wheel-34.webp', location.href).href};
  /* [x, y, w, h, 旋轉角度]，座標＝線稿 2000×1250 */
  const LAYOUT = {
    1: {saddle: [100, 240, 230, 190], cassette: [100, 490, 230, 190], crank: [100, 740, 230, 190],
        bar: [1680, 240, 230, 190], stem: [1680, 490, 230, 190], wheel: [1680, 740, 230, 190]},
    2: {saddle: [150, 230, 230, 180, -6], cassette: [50, 470, 210, 200, 4], crank: [215, 740, 220, 190, -3],
        bar: [1630, 230, 240, 180, 5], stem: [1780, 470, 200, 190, -5], wheel: [1660, 735, 220, 210, 3]},
    3: {saddle: [440, 205, 210, 160], cassette: [180, 600, 210, 190], crank: [220, 805, 210, 180],
        bar: [1490, 180, 220, 160], stem: [1720, 420, 210, 180], wheel: [1700, 690, 220, 230]}};
  const go = () => {
    const sec = D.getElementById('parts'), svg = sec.querySelector('svg.pd-ov'), tl = window.__timelines && window.__timelines.parts;
    if (!svg || !tl || tl.progress() < 1) return setTimeout(go, 200);
    svg.querySelectorAll('.pd-xi').forEach(i => i.style.display = 'none');   // 換成這組新的
    const NS = 'http://www.w3.org/2000/svg', g = D.createElementNS(NS, 'g');
    g.innerHTML = Object.entries(LAYOUT[V]).map(([k, [x, y, w, h, r = 0]], i) =>
      `<image href="${SRC[k]}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" transform="rotate(${r} ${x + w / 2} ${y + h / 2})" style="opacity:0;transition:opacity .7s ease ${(i * .1).toFixed(1)}s"/>`).join('');
    svg.appendChild(g);
    requestAnimationFrame(() => requestAnimationFrame(() => g.querySelectorAll('image').forEach(im => im.style.opacity = '.62')));
  };
  go();
})();
