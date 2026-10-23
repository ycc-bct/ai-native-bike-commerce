/* 「六大零件規格」hover 與標籤提案：注入到嵌入的 custom-studio/index.html。
   共同規則：滑到零件圖片「或」文字都會高亮；點一下鎖定（再點一次或點空白處解除）；
   沒在操作時每 2.2 秒自動輪播；拿掉藍色描邊光與投影。 */
(() => {
  const W = window, D = document, gsap = W.gsap;
  const BASE = new URL('.', D.currentScript.src).href;
  const VAR = new URL(location.href).searchParams.get('hv') || 'p1';
  const sec = D.getElementById('parts'), stage = sec.querySelector('.in');
  const items = [...sec.querySelectorAll('.pp10')], rear = sec.querySelector('.rear-wheel');
  const SK = {'p-saddle':'saddle','p-cassette':'cassette','p-crank-ring':'crank','p-stem':'stem','p-bar-drop':'bar','p-wheel':'wheel'};

  /* 直接停在完成畫面：停掉原本進場，零件歸位，標籤出現 */
  const tl = W.__timelines && W.__timelines.parts;
  if (tl) { tl.clear(); tl.to({}, {duration: 1e5}); }
  items.forEach(it => gsap.set(it, {x: 0, y: 0, scale: 1, opacity: 1}));
  sec.classList.add('parts-ready', 'hvx', 'hv-' + VAR);
  items.forEach((it, i) => { const b = it.querySelector('.dc b'); if (b) b.dataset.no = String(i + 1).padStart(2, '0'); });

  const css = D.createElement('style');
  css.textContent = `
  .orb-callout{display:none!important}
  /* ---- 共同：拿掉藍色描邊光、投影與 116% 放大；文字也能 hover／點 ---- */
  .parts10.hvx .pp10 img{filter:none!important;transition:opacity .28s ease,filter .28s ease,transform .35s cubic-bezier(.16,1,.3,1)!important}
  .parts10.hvx.parts-ready .pp10{opacity:1!important;filter:none!important;scale:1!important}
  .parts10.hvx.parts-ready .pp10.hov{z-index:20!important}
  .parts10.hvx .pp10 .dc{pointer-events:auto!important;cursor:pointer;text-shadow:none!important}
  .parts10.hvx .rear-wheel{transition:opacity .28s ease,filter .28s ease}
  .parts10.hvx .parts-live-detail strong{color:#141A22}
  .parts10.hvx .parts-live-detail{border-top-color:#DCE1E7}
  .parts10.hvx .parts-live-detail p{color:#4A5563}

  /* ---- P1 聚焦＋墨色標籤 ---- */
  .hv-p1.has-hov .pp10:not(.hov) img,.hv-p1.has-hov:not(.wheel-on) .rear-wheel{opacity:.28;filter:grayscale(1)!important}
  .hv-p1 .pp10.hov img{transform:scale(1.05)}
  .hv-p1 .pp10 .dc b{color:#141A22!important;font-size:16px!important;font-weight:700}
  .hv-p1 .pp10 .dc .chip{color:#4A5563!important}
  .hv-p1 .pp10 .dc .chip + .chip::before{color:#9AA4B0!important}
  .hv-p1 .pp10 .dc::before{border-top-color:#C3CAD3!important;transition:border-color .25s,width .3s}
  .hv-p1.has-hov .pp10:not(.hov) .dc{opacity:.38!important}
  .hv-p1 .pp10.hov .dc::before{border-top-color:#141A22!important}
  .hv-p1 .pp10.hov .dc b{text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:6px}

  /* ---- P2 白底片＋膠囊標籤 ---- */
  .hv-p2 .pp10::after{content:"";position:absolute;inset:-12px;border-radius:16px;background:#fff;border:1px solid #DCE1E7;opacity:0;transform:scale(.96);transition:opacity .25s ease,transform .3s cubic-bezier(.16,1,.3,1);z-index:-1}
  .hv-p2 .pp10.p-wheel::after{inset:-8px;border-radius:50%}
  .hv-p2 .pp10.hov::after{opacity:1;transform:none}
  .hv-p2 .pp10 .dc{padding:0!important}
  .hv-p2 .pp10 .dc b{display:inline-flex!important;align-items:center;height:30px;padding:0 13px;border-radius:999px;background:#fff;border:1px solid #DCE1E7;color:#141A22!important;font-size:13.5px!important;font-weight:700;transition:background .2s,color .2s,border-color .2s}
  .hv-p2 .pp10.hov .dc b{background:#0E1726;border-color:#0E1726;color:#fff!important}
  .hv-p2 .pp10 .dc .chip{color:#4A5563!important}
  .hv-p2 .pp10 .dc::before{top:15px!important;border-top-color:#C3CAD3!important}
  .hv-p2 .pp10.hov .dc::before{border-top-color:#0E1726!important}

  /* ---- P3 藍圖描線＋規格標籤（藍色只當重點色） ---- */
  .hv-p3 .pp10 .hv-sk{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none;opacity:0;transition:opacity .3s ease}
  .hv-p3 .pp10.hov .hv-sk{opacity:.95}
  .hv-p3 .pp10.hov img:not(.hv-sk){opacity:.55}
  .hv-p3.has-hov .pp10:not(.hov) img:not(.hv-sk),.hv-p3.has-hov:not(.wheel-on) .rear-wheel{opacity:.5}
  .hv-p3 .pp10 .dc b::before{content:attr(data-no);display:inline-block;margin-right:8px;font:600 12px/1 "Inter",sans-serif;letter-spacing:.06em;color:#9AA4B0;transition:color .2s}
  .hv-p3 .pp10 .dc b{color:#141A22!important;font-size:15px!important;font-weight:700}
  .hv-p3 .pp10 .dc .chip{color:#4A5563!important}
  .hv-p3 .pp10 .dc::before{border-top:1px dashed #9AA4B0!important}
  .hv-p3 .pp10.hov .dc b::before{color:#1F4FE0}
  .hv-p3 .pp10.hov .dc::before{border-top:1px solid #1F4FE0!important}
  `;
  D.head.appendChild(css);
  if (VAR === 'p3') items.forEach(it => { const k = Object.keys(SK).find(c => it.classList.contains(c)); const s = D.createElement('img'); s.className = 'hv-sk'; s.alt = ''; s.src = BASE + SK[k] + '-sketch.png'; it.appendChild(s); });

  /* ---- 互動：hover 圖片或文字 → 高亮；點 → 鎖定；閒置 → 輪播 ---- */
  let idx = 0, pinned = null, timer, resume;
  function show(it) {
    items.forEach(x => x.classList.toggle('hov', x === it));
    sec.classList.toggle('has-hov', !!it);
    sec.classList.toggle('wheel-on', !!it && it.classList.contains('p-wheel'));
  }
  function startCycle() { clearInterval(timer); timer = setInterval(() => { idx = (idx + 1) % items.length; show(items[idx]); }, 2200); }
  function stopCycle() { clearInterval(timer); clearTimeout(resume); }
  /* 原頁在每個零件上綁了 pointerenter／leave／focus／blur，會重開它自己的輪播。示意裡在 capture 階段攔下 */
  ['pointerenter', 'pointerleave', 'focus', 'blur'].forEach(type => D.addEventListener(type, e => {
    const it = e.target; if (!(it instanceof W.Element) || !it.classList.contains('pp10')) return;
    e.stopImmediatePropagation(); e.stopPropagation(); it.dispatchEvent(new CustomEvent('hv-' + type));
  }, true));
  items.forEach((it, i) => {
    it.addEventListener('hv-pointerenter', () => { stopCycle(); idx = i; if (!pinned) show(it); });
    it.addEventListener('hv-pointerleave', () => { if (pinned) return; clearTimeout(resume); resume = setTimeout(() => { show(items[idx]); startCycle(); }, 1400); });
    it.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); stopCycle(); if (pinned === it) { pinned = null; it.classList.remove('pinned'); resume = setTimeout(startCycle, 1400); } else { pinned && pinned.classList.remove('pinned'); pinned = it; it.classList.add('pinned'); idx = i; show(it); } });
  });
  stage.addEventListener('click', () => { if (pinned) { pinned.classList.remove('pinned'); pinned = null; resume = setTimeout(startCycle, 1400); } });
  show(items[0]); startCycle();
  W.__partsHv = {show: i => { stopCycle(); show(items[i]); }};
})();
