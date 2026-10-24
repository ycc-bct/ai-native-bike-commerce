/* 「車款客製化塗裝」提案：注入 custom-studio/index.html。
   ?ps=A 真實色票牆（官方色票照片，左霧右亮）；B 近看工藝（官方車架棚拍照）；C 樣板縮圖換成官方封面圖 */
(() => {
  const D = document, V = new URL(location.href).searchParams.get('ps') || 'A';
  const tpl = D.getElementById('templates');
  const CHIPS = new URL('../docs/paint-chips/', location.href).href;
  const GI = 'https://images2.giant-bicycles.com/';
  const css = D.createElement('style');
  css.textContent = `
  .ps-sec{position:relative;background:#F3F5F7;padding:96px 0 104px;font-family:"Inter","Noto Sans TC",sans-serif;color:#141A22}
  .ps-in{width:var(--shell);margin:0 auto}
  .ps-hd h2{font-size:32px;font-weight:800;letter-spacing:.01em}
  .ps-hd p{margin-top:10px;font-size:15px;color:#4A5563;line-height:1.7}
  /* ---- A 色票牆 ---- */
  .ps-wall{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:40px;margin-top:40px;align-items:start}
  .ps-group+.ps-group{margin-top:30px}
  .ps-gh{display:flex;align-items:baseline;gap:12px;margin-bottom:14px}
  .ps-gh b{font-size:16px;font-weight:700}
  .ps-gh span{font-size:13px;color:#4A5563}
  .ps-gh em{font-style:normal;margin-left:auto;font-size:13px;font-weight:700;color:#141A22;background:#fff;border:1px solid #E3E7EC;border-radius:999px;padding:4px 12px}
  .ps-chips{display:flex;flex-wrap:wrap;gap:12px}
  .ps-chip{position:relative;width:64px;height:64px;padding:0;border:0;border-radius:12px;overflow:hidden;cursor:pointer;background:#ddd;box-shadow:0 1px 2px rgba(20,26,34,.08),0 4px 12px rgba(20,26,34,.08);transition:transform .2s ease,box-shadow .2s ease}
  .ps-chip img{width:100%;height:100%;object-fit:cover;display:block}
  .ps-chip:hover{transform:translateY(-3px);box-shadow:0 2px 4px rgba(20,26,34,.1),0 10px 22px rgba(20,26,34,.16)}
  .ps-chip.on{box-shadow:0 0 0 3px #F3F5F7,0 0 0 5px #141A22}
  .ps-card{position:sticky;top:96px;background:#fff;border-radius:20px;padding:20px;box-shadow:0 2px 4px rgba(20,26,34,.05),0 14px 32px rgba(20,26,34,.08)}
  .ps-card .big{position:relative;aspect-ratio:1/1;border-radius:14px;overflow:hidden}
  .ps-card .big img{width:100%;height:100%;object-fit:cover}
  .ps-card .big i{position:absolute;bottom:10px;font:600 11px/1 "Inter","Noto Sans TC",sans-serif;color:#fff;background:rgba(14,23,38,.55);padding:5px 9px;border-radius:999px;font-style:normal}
  .ps-card .big i.l{left:10px}.ps-card .big i.r{right:10px}
  .ps-card .nm{margin-top:16px;font-size:20px;font-weight:800}
  .ps-card .cd{margin-top:4px;font:600 13px/1 "Inter",sans-serif;letter-spacing:.06em;color:#7A8492}
  .ps-card .pr{margin-top:12px;font-size:13.5px;color:#4A5563;line-height:1.6}
  .ps-card a{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:18px;height:46px;border-radius:999px;background:#0E1726;color:#fff;font-size:14.5px;font-weight:700;text-decoration:none}
  .ps-note{margin-top:28px;font-size:12px;color:#9AA4B0}
  /* ---- B 近看工藝 ---- */
  .ps-craft{display:grid;grid-template-columns:1.35fr 1fr;grid-template-rows:250px 250px;gap:16px;margin-top:40px}
  .ps-craft figure{position:relative;margin:0;background:#fff;border-radius:20px;overflow:hidden}
  .ps-craft figure:first-child{grid-row:1/3}
  .ps-craft img{display:block;width:100%;height:100%;object-fit:contain;padding:20px 24px 44px}
  .ps-craft figcaption{position:absolute;left:20px;bottom:18px;font-size:13px;color:#4A5563}
  .ps-craft figcaption b{display:block;margin-bottom:4px;font-size:17px;color:#141A22}
  .ps-points{display:flex;gap:40px;margin-top:32px}
  .ps-points div{flex:1;padding-top:16px;border-top:1px solid #DCE1E7}
  .ps-points b{display:block;font-size:15px}
  .ps-points span{display:block;margin-top:6px;font-size:13.5px;line-height:1.65;color:#4A5563}
  /* ---- C 官方封面縮圖 ---- */
  .tpl9.arc-showroom.ps-c button.th9{width:96px!important;height:72px!important;flex:0 0 96px!important;border-radius:12px!important;border:2px solid #fff!important;background:#fff!important;box-shadow:0 1px 2px rgba(20,26,34,.08),0 4px 12px rgba(20,26,34,.1)!important}
  .tpl9.arc-showroom.ps-c button.th9 img{width:100%!important;height:100%!important;object-fit:cover!important;transform:none!important;left:0!important;top:0!important;position:static!important}
  .tpl9.arc-showroom.ps-c button.th9.on{box-shadow:0 0 0 3px #f3f3f1,0 0 0 5px #17202b!important}
  .tpl9.arc-showroom.ps-c .tray9{top:668px!important}
  `;
  D.head.appendChild(css);

  if (V === 'A') {
    fetch(CHIPS + 'chips.json').then(r => r.json()).then(list => {
      const G = [
        {k: '經典塗裝', s: '25 色・整車可選消光與亮光', p: '漸層 +NT$ 3,000／色', f: c => /^(WT|BK|YL|GY|RD|BU|GN|PP|OG)/.test(c.code)},
        {k: '手工亂紋 SD', s: '每一台紋路都不一樣', p: '+NT$ 3,000／色', f: c => c.code.startsWith('SD')},
        {k: '變色龍 CL', s: '隨角度變換顏色', p: '+NT$ 3,000／色', f: c => c.code.startsWith('CL')},
        {k: '電鍍 EP', s: '截色版本不可使用', p: '+NT$ 6,000／色', f: c => c.code.startsWith('EP')}];
      const sec = D.createElement('section'); sec.className = 'ps-sec'; sec.id = 'ps';
      sec.innerHTML = `<div class="ps-in"><div class="ps-hd"><h2>色票與漆面</h2><p>每一格都是實際噴塗的漆面樣本：左半是霧面、右半是亮面。挑好顏色，再到客製頁搭配上半、下半與 Logo。</p></div>
        <div class="ps-wall"><div>${G.map(g => `<div class="ps-group"><div class="ps-gh"><b>${g.k}</b><span>${g.s}</span><em>${g.p}</em></div><div class="ps-chips">${list.filter(g.f).map(c => `<button class="ps-chip" type="button" data-code="${c.code}" data-name="${c.name}" data-group="${g.k}" data-price="${g.p}" title="${c.name} ${c.code}"><img src="${CHIPS}${c.code}.webp" alt="${c.name}"></button>`).join('')}</div></div>`).join('')}
        <p class="ps-note">色票圖片取自官網客製化頁的色票表；名稱與代碼依原圖轉寫，正式上線需請 GIANT 提供高解析原檔核對。</p></div>
        <aside class="ps-card" aria-live="polite"></aside></div></div>`;
      tpl.after(sec);
      const card = sec.querySelector('.ps-card');
      const pick = b => {
        sec.querySelectorAll('.ps-chip.on').forEach(x => x.classList.remove('on')); b.classList.add('on');
        card.innerHTML = `<div class="big"><img src="${CHIPS}${b.dataset.code}.webp" alt=""><i class="l">霧面</i><i class="r">亮面</i></div><div class="nm">${b.dataset.name}</div><div class="cd">${b.dataset.code}</div><div class="pr">${b.dataset.group}・${b.dataset.price}</div><a href="../../customized.html#series">用這個顏色開始客製 →</a>`;
      };
      sec.addEventListener('click', e => { const b = e.target.closest('.ps-chip'); if (b) pick(b); });
      sec.addEventListener('pointerover', e => { const b = e.target.closest('.ps-chip'); if (b) pick(b); });
      pick(sec.querySelector('[data-code="RD-002"]'));
      sec.scrollIntoView({block: 'start'});
    });
  }

  if (V === 'B') {
    const img = p => `${GI}b_white%2Cc_pad%2Ch_1000%2Cq_85%2Cw_1500/${p}`;
    const sec = D.createElement('section'); sec.className = 'ps-sec'; sec.id = 'ps';
    sec.innerHTML = `<div class="ps-in"><div class="ps-hd"><h2>近看每一道漆</h2><p>Advanced 碳纖維車架在工廠逐層遮罩、噴塗與拋光。客製的每一台都從裸車架開始上色。</p></div>
      <div class="ps-craft">
        <figure><img src="${img('iibwmi8tphyqcpsq0pf7/MY24-Propel-Advanced-SL-FF_Color-B-Blue-Dragonfly.jpg')}" alt=""><figcaption><b>Propel Advanced SL</b>漸層與珠光，轉角處依然均勻</figcaption></figure>
        <figure><img src="${img('ntyhhwww6021sqfkeacf/MY24-Defy-Advanced-SL-FF_Color-A-Digital-Blurple.png')}" alt=""><figcaption><b>Defy Advanced SL</b>多層透明漆，亮面深邃</figcaption></figure>
        <figure><img src="${img('h3skbnvjeooxbcfukxn1/MY24-TCR-Advanced-Pro-Disc-FF-B_Color-B-Carbon.jpg')}" alt=""><figcaption><b>TCR Advanced Pro</b>保留碳纖紋理的霧面</figcaption></figure>
      </div>
      <div class="ps-points"><div><b>手工遮罩分色</b><span>上半、下半與 Logo 分層遮罩，邊界俐落不暈染。</span></div><div><b>霧面／亮面可選</b><span>每個部位都能各自選擇漆面質感。</span></div><div><b>出廠前逐台檢驗</b><span>膜厚與色差逐台量測，確保與色票一致。</span></div></div>
      <p class="ps-note">照片為美國官網的量產車架配色，只用來呈現漆面質感，不代表可訂購的客製顏色。</p></div>`;
    tpl.after(sec);
    sec.scrollIntoView({block: 'start'});
  }

  if (V === 'C') {
    const sec = D.querySelector('#templates'); sec.classList.add('ps-c');
    const COVER = {
      propel: ['twwk8hcpi63y938vnmut/%E5%B0%81%E9%9D%A2%E8%BB%8A%E6%AC%BE_Propeltype1.jpg', 'r9kyy8wstyicj5ipdyvu/%E5%B0%81%E9%9D%A2%E8%BB%8A%E6%AC%BE_Propeltype2.jpg', 'lbirjudljtqcry62ath0/%E5%B0%81%E9%9D%A2%E8%BB%8A%E6%AC%BE_Propeltype3.jpg'],
      tcr: ['m5cqakwxr6l38b8bc6tv/%E5%B0%81%E9%9D%A2%E8%BB%8A%E6%AC%BE_TCRtype1.jpg', 's0afw7xwvxrvloq8hkff/%E5%B0%81%E9%9D%A2%E8%BB%8A%E6%AC%BE_TCRtype2.jpg', 'jusgvqv6swrxuydn4luf/%E5%B0%81%E9%9D%A2%E8%BB%8A%E6%AC%BE_TCRtype3.jpg'],
      defy: ['zyvw2vno5ycycvxgmx7g/%E5%B0%81%E9%9D%A2%E8%BB%8A%E6%AC%BE_Defytype1.jpg'],
      trinity: ['juef0yttomckuuwowxjq/%E5%B0%81%E9%9D%A2%E8%BB%8A%E6%AC%BE_Trinitytype1.jpg', 'cwxexd102igvilmpnb42/%E5%B0%81%E9%9D%A2%E8%BB%8A%E6%AC%BE_Trinitytype2.jpg', 'm4mlhsyhpui4ajg0nmzq/%E5%B0%81%E9%9D%A2%E8%BB%8A%E6%AC%BE_Trinitytype3.jpg']};
    const tray = sec.querySelector('.trayin');
    const apply = () => {
      const fam = (sec.querySelector('.tab9.on')?.textContent || '').trim().toLowerCase(), list = COVER[fam] || [];
      tray.querySelectorAll('button.th9').forEach((b, i) => { const im = b.querySelector('img'); if (!im || !list[i] || im.dataset.cover) return; im.dataset.cover = '1'; im.src = `${GI}b_white%2Cc_pad%2Ch_300%2Cq_85%2Cw_400/${list[i]}`; });
    };
    new MutationObserver(apply).observe(tray, {childList: true}); apply();
    sec.scrollIntoView({block: 'start'});
  }

  /* ===== B 拆開放進「車款客製化塗裝」：B1 左文右圖、B2 看樣板／看質感切換、B3 點車子看漆面特寫 ===== */
  if (/^B\d$/.test(V)) {
    const sec = D.querySelector('#templates');
    const big = p => `${GI}b_white%2Cc_pad%2Ch_1000%2Cq_85%2Cw_1500/${p}`;
    const FRAME = {
      propel: {img: 'iibwmi8tphyqcpsq0pf7/MY24-Propel-Advanced-SL-FF_Color-B-Blue-Dragonfly.jpg', t: 'Propel Advanced SL 車架', d: '漸層與珠光，轉角處依然均勻'},
      tcr: {img: 'h3skbnvjeooxbcfukxn1/MY24-TCR-Advanced-Pro-Disc-FF-B_Color-B-Carbon.jpg', t: 'TCR Advanced 車架', d: '保留碳纖紋理的霧面'},
      defy: {img: 'ntyhhwww6021sqfkeacf/MY24-Defy-Advanced-SL-FF_Color-A-Digital-Blurple.png', t: 'Defy Advanced SL 車架', d: '多層透明漆，亮面深邃'},
      trinity: {img: 'h3skbnvjeooxbcfukxn1/MY24-TCR-Advanced-Pro-Disc-FF-B_Color-B-Carbon.jpg', t: 'Advanced 碳纖維車架', d: 'TRINITY 車架照待補，先以碳纖維質感示意'}};
    const POINTS = [['手工遮罩分色', '上半、下半與 Logo 分層遮罩，邊界俐落不暈染'], ['霧面／亮面可選', '每個部位都能各自選擇漆面質感'], ['出廠前逐台檢驗', '膜厚與色差逐台量測，與色票一致']];
    const fam = () => (sec.querySelector('.tab9.on')?.textContent || 'tcr').trim().toLowerCase();
    const st = D.createElement('style');
    st.textContent = `
    .bx-points{position:absolute;left:var(--bx-l,36px);top:236px;z-index:6;width:300px;font-family:"Inter","Noto Sans TC",sans-serif}
    .bx-points li{list-style:none;display:grid;grid-template-columns:28px 1fr;column-gap:10px;padding:14px 0;border-top:1px solid rgba(20,26,34,.1)}
    .bx-points li:first-child{border-top:0;padding-top:0}
    .bx-points i{font:700 12px/22px "Inter",sans-serif;font-style:normal;color:#9AA4B0}
    .bx-points b{display:block;font-size:15px;color:#141A22}
    .bx-points span{display:block;margin-top:4px;font-size:13px;line-height:1.6;color:#4A5563}
    .bx-card{position:absolute;right:var(--bx-l,36px);top:200px;z-index:6;width:320px;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 2px 4px rgba(20,26,34,.05),0 14px 32px rgba(20,26,34,.1);font-family:"Inter","Noto Sans TC",sans-serif;transition:opacity .3s ease}
    .bx-card .ph{aspect-ratio:3/2;padding:14px 18px 0}
    .bx-card .ph img{width:100%;height:100%;object-fit:contain}
    .bx-card .tx{padding:6px 18px 16px}
    .bx-card small{display:block;font-size:11px;font-weight:700;letter-spacing:.08em;color:#9AA4B0}
    .bx-card b{display:block;margin-top:4px;font-size:15px;color:#141A22}
    .bx-card span{display:block;margin-top:3px;font-size:12.5px;color:#4A5563}
    .bx-card em{display:block;margin-top:10px;font-style:normal;font-size:11px;color:#9AA4B0}
    /* B2 切換 */
    .bx-switch{position:absolute;right:var(--bx-l,36px);top:104px;z-index:7;display:flex;padding:4px;border-radius:999px;background:#fff;box-shadow:0 1px 2px rgba(20,26,34,.06),0 6px 18px rgba(20,26,34,.08);font-family:"Inter","Noto Sans TC",sans-serif}
    .bx-switch button{height:38px;padding:0 18px;border:0;border-radius:999px;background:none;font:inherit;font-size:14px;font-weight:700;color:#4A5563;cursor:pointer}
    .bx-switch button.on{background:#0E1726;color:#fff}
    .bx-view{position:absolute;inset:180px 36px 40px;z-index:6;display:grid;grid-template-columns:1.5fr 1fr;gap:40px;align-items:center;opacity:0;pointer-events:none;transition:opacity .4s ease;font-family:"Inter","Noto Sans TC",sans-serif}
    .bx-view .ph{height:100%;background:#fff;border-radius:24px;padding:28px;display:grid;place-items:center;box-shadow:0 14px 32px rgba(20,26,34,.08)}
    .bx-view .ph img{max-width:100%;max-height:100%;object-fit:contain}
    .bx-view h3{font-size:24px;font-weight:800;color:#141A22}
    .bx-view .sub{margin-top:8px;font-size:14px;color:#4A5563}
    .bx-view ul{margin-top:24px}
    .tpl9.bx-craft .bx-view{opacity:1;pointer-events:auto}
    .tpl9.bx-craft .showroom-motion{opacity:0;pointer-events:none;transition:opacity .3s ease}
    .tpl9 .showroom-motion{transition:opacity .3s ease}
    /* B3 點車子看特寫 */
    .tpl9.bx-zoomable .paint-display{cursor:zoom-in}
    .bx-hint{position:absolute;left:50%;top:146px;z-index:7;translate:-50% 0;display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 16px;border-radius:999px;background:#fff;box-shadow:0 1px 2px rgba(20,26,34,.06),0 6px 18px rgba(20,26,34,.1);font:700 13px/1 "Inter","Noto Sans TC",sans-serif;color:#141A22;pointer-events:none;opacity:0;transition:opacity .25s ease}
    .tpl9.bx-zoomable:has(.paint-display:hover) .bx-hint{opacity:1}
    .bx-modal{position:absolute;inset:24px;z-index:20;display:grid;grid-template-columns:1.6fr 1fr;gap:40px;align-items:center;padding:40px 48px;border-radius:28px;background:rgba(255,255,255,.96);backdrop-filter:blur(10px);box-shadow:0 30px 60px rgba(20,26,34,.18);opacity:0;pointer-events:none;transform:scale(.97);transition:opacity .3s ease,transform .35s cubic-bezier(.16,1,.3,1);font-family:"Inter","Noto Sans TC",sans-serif}
    .bx-modal.on{opacity:1;pointer-events:auto;transform:none}
    .bx-modal .ph{height:100%;display:grid;place-items:center}.bx-modal .ph img{max-width:100%;max-height:100%;object-fit:contain}
    .bx-modal h3{font-size:24px;font-weight:800;color:#141A22}.bx-modal .sub{margin-top:8px;font-size:14px;color:#4A5563}.bx-modal ul{margin-top:24px}
    .bx-modal .x{position:absolute;right:20px;top:20px;width:44px;height:44px;border:0;border-radius:50%;background:#F3F5F7;font-size:20px;cursor:pointer}
    .bx-view li,.bx-modal li{list-style:none;padding:14px 0;border-top:1px solid rgba(20,26,34,.1)}
    .bx-view li b,.bx-modal li b{display:block;font-size:15px;color:#141A22}.bx-view li span,.bx-modal li span{display:block;margin-top:4px;font-size:13px;color:#4A5563}
    `;
    D.head.appendChild(st);
    const host = sec.querySelector('.in');
    const pts = `<ul>${POINTS.map(([b, t]) => `<li><b>${b}</b><span>${t}</span></li>`).join('')}</ul>`;
    let render = () => {};
    if (V === 'B1') {
      host.insertAdjacentHTML('beforeend', `<ul class="bx-points">${POINTS.map(([b, t], i) => `<li><i>0${i + 1}</i><div><b>${b}</b><span>${t}</span></div></li>`).join('')}</ul><aside class="bx-card"><div class="ph"><img alt=""></div><div class="tx"><small>漆面特寫</small><b></b><span></span><em>車架質感示意，顏色以實際樣板為準</em></div></aside>`);
      const card = host.querySelector('.bx-card');
      render = () => { const f = FRAME[fam()]; card.querySelector('img').src = big(f.img); card.querySelector('b').textContent = f.t; card.querySelector('span').textContent = f.d; };
    }
    if (V === 'B2') {
      host.insertAdjacentHTML('beforeend', `<div class="bx-switch" role="tablist"><button type="button" class="on" data-v="tpl">看樣板</button><button type="button" data-v="craft">看質感</button></div><div class="bx-view"><div class="ph"><img alt=""></div><div><h3></h3><p class="sub"></p>${pts}</div></div>`);
      host.querySelector('.bx-switch').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; host.querySelectorAll('.bx-switch button').forEach(x => x.classList.toggle('on', x === b)); sec.classList.toggle('bx-craft', b.dataset.v === 'craft'); });
      render = () => { const f = FRAME[fam()]; host.querySelector('.bx-view img').src = big(f.img); host.querySelector('.bx-view h3').textContent = f.t; host.querySelector('.bx-view .sub').textContent = f.d + '。車架質感示意，顏色以實際樣板為準。'; };
    }
    if (V === 'B3') {
      sec.classList.add('bx-zoomable');
      host.insertAdjacentHTML('beforeend', `<span class="bx-hint">＋ 點車子，近看漆面</span><div class="bx-modal" role="dialog" aria-label="漆面特寫"><button class="x" type="button" aria-label="關閉">✕</button><div class="ph"><img alt=""></div><div><h3></h3><p class="sub"></p>${pts}</div></div>`);
      const modal = host.querySelector('.bx-modal');
      sec.querySelector('.paint-display').addEventListener('click', () => { render(); modal.classList.add('on'); });
      modal.querySelector('.x').addEventListener('click', () => modal.classList.remove('on'));
      render = () => { const f = FRAME[fam()]; modal.querySelector('img').src = big(f.img); modal.querySelector('h3').textContent = f.t; modal.querySelector('.sub').textContent = f.d + '。車架質感示意，顏色以實際樣板為準。'; };
    }
    new MutationObserver(render).observe(sec.querySelector('.tabs9'), {attributes: true, subtree: true, attributeFilter: ['class']});
    render();
    sec.scrollIntoView({block: 'start'});
  }
})();
