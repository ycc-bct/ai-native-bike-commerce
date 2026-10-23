/* 「六大零件規格」說明位置提案：注入到嵌入的 custom-studio/index.html。
   共同：標籤一律維持膠囊、不再展開成小卡（選到時變深色膠囊）；規格與說明移到不會擋住零件的位置。
   ?pd=A 標題下方固定說明卡；B 就近留白放置；C 底部說明列 */
(() => {
  const D = document, V = new URL(location.href).searchParams.get('pd') || 'A';
  const sec = D.getElementById('parts'), stage = sec.querySelector('.in'), items = [...sec.querySelectorAll('.pp10')];
  const tl = window.__timelines && window.__timelines.parts;
  if (tl) tl.progress(1);
  sec.classList.add('parts-ready');

  const css = D.createElement('style');
  css.textContent = `
  /* ---- 共同：膠囊不展開；選到的膠囊變深色 ---- */
  .parts10 .pp10 .dc .chips,.parts10 .pp10 .pd-desc{display:none!important}
  .parts10 .pp10.hov .dc{padding:9px 17px!important;border-radius:20px!important;background:#0E1726!important;box-shadow:0 6px 18px rgba(14,23,38,.22)!important}
  .parts10 .pp10.hov .dc b{color:#fff!important}
  .parts10 .pp10 .dc{transition:background .25s ease,box-shadow .25s ease!important}
  .parts10 .pp10 .dc b{transition:color .25s ease!important}
  /* ---- 說明卡 ---- */
  .pv{position:absolute;z-index:40;pointer-events:none;background:#fff;border-radius:16px;box-shadow:0 2px 4px rgba(20,26,34,.05),0 14px 32px rgba(20,26,34,.1);font-family:"Inter","Noto Sans TC",sans-serif;color:#141A22;opacity:0;transition:opacity .3s ease,transform .45s cubic-bezier(.16,1,.3,1),left .45s cubic-bezier(.16,1,.3,1),top .45s cubic-bezier(.16,1,.3,1)}
  .pv.on{opacity:1}
  .pv .no{font:600 12px/1 "Inter",sans-serif;letter-spacing:.08em;color:#9AA4B0}
  .pv .nm{margin-top:6px;font-size:17px;font-weight:700}
  .pv .sp{margin-top:6px;font-size:13px;font-weight:600;color:#4A5563}
  .pv .ds{margin-top:8px;font-size:13px;line-height:1.65;color:#4A5563}
  .pv .in-swap{transition:opacity .2s ease}
  /* A：標題下方固定 */
  .pv.A{width:320px;padding:18px 20px 20px}
  /* B：就近留白 */
  .pv.B{width:270px;padding:16px 18px 18px}
  /* C：底部說明列（一列排開） */
  .pv.C{display:grid;grid-template-columns:auto auto 1fr;align-items:center;column-gap:22px;width:860px;padding:16px 24px;border-radius:999px}
  .pv.C .nm{margin:0;font-size:16px;white-space:nowrap}.pv.C .no{white-space:nowrap}
  .pv.C .txt{display:flex;flex-direction:column;gap:2px;border-left:1px solid #E3E7EC;padding-left:22px}
  .pv.C .sp{margin:0}.pv.C .ds{margin:0;line-height:1.5}
  `;
  D.head.appendChild(css);

  const card = D.createElement('div'); card.className = 'pv ' + V; stage.appendChild(card);
  const info = it => {
    const b = it.querySelector('.dc b'), name = b ? b.childNodes[0].textContent.trim() : '';
    return {no: String(items.indexOf(it) + 1).padStart(2, '0') + ' / ' + String(items.length).padStart(2, '0'), name,
      spec: [...it.querySelectorAll('.dc .chip')].map(c => c.textContent.trim()).join('・'), desc: (it.querySelector('.pd-desc') || {}).textContent || ''};
  };
  const R = el => { const S = stage.getBoundingClientRect(), r = el.getBoundingClientRect(); return {l: r.left - S.left, t: r.top - S.top, r: r.right - S.left, b: r.bottom - S.top, w: r.width, h: r.height}; };
  const part = c => items.find(x => x.classList.contains(c));
  function place(it) {
    if (V === 'A') { const h = R(sec.querySelector('.phd9')); return {l: h.l, t: h.b + 28}; }
    if (V === 'C') { const S = stage.getBoundingClientRect(), la = R(sec.querySelector('.la')); return {l: S.width / 2 - 430, t: Math.min(la.b, S.height) - 104}; }
    /* B：每個零件旁邊最近的留白 */
    const W = 270, k = [...it.classList].find(c => c.startsWith('p-')), rear = R(sec.querySelector('.rear-wheel:not(.pd-sk)'));
    const p = R(it);
    switch (k) {
      case 'p-saddle': return {l: p.l - W - 28, t: p.t - 46};
      case 'p-stem': case 'p-bar-drop': { const bar = R(part('p-bar-drop')); return {l: bar.r + 28, t: bar.t - 120}; }
      case 'p-cassette': return {l: Math.max(16, rear.l - W - 16), t: p.t - 40};
      case 'p-crank-ring': return {l: p.l + p.w / 2 - W / 2, t: p.b + 92};
      case 'p-wheel': return {l: Math.min(stage.getBoundingClientRect().width - W - 36, p.r + 16), t: p.t + 24};
    }
    return {l: p.r + 20, t: p.t};
  }
  let cur;
  function update() {
    const it = items.find(x => x.classList.contains('hov')) || null;
    if (it === cur) return; cur = it;
    if (!it) {
      if (V === 'B') { card.classList.remove('on'); return; }
      /* A、C 位置固定：沒選零件時顯示提示 */
      const pos = place(items[0]); card.style.left = pos.l + 'px'; card.style.top = pos.t + 'px';
      card.innerHTML = V === 'C' ? '<span class="no">06 個零件</span><span class="nm">六大零件</span><span class="txt"><span class="ds">滑到或點選零件，看規格與說明</span></span>' : '<div class="no">06 個零件</div><div class="ds" style="margin-top:6px">滑到或點選零件，看規格與說明</div>';
      card.classList.add('on'); return;
    }
    const d = info(it), pos = place(it);
    const html = V === 'C'
      ? `<span class="no">${d.no}</span><span class="nm">${d.name}</span><span class="txt"><span class="sp">${d.spec}</span><span class="ds">${d.desc}</span></span>`
      : `<div class="no">${d.no}</div><div class="nm">${d.name}</div><div class="sp">${d.spec}</div><div class="ds">${d.desc}</div>`;
    card.style.left = pos.l + 'px'; card.style.top = pos.t + 'px';
    card.innerHTML = html; card.classList.add('on');
  }
  new MutationObserver(update).observe(sec, {attributes: true, subtree: true, attributeFilter: ['class']});
  update();
})();
