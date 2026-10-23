/* 「編輯塗裝」入口提案：注入到嵌入的 customized.html。進到自由配色、選 Type 4，再套用 ?ed= 的樣式。 */
(() => {
  const D = document, V = new URL(location.href).searchParams.get('ed') || 'v1';
  const css = D.createElement('style');
  const PICK = '.template-option:has(.paint-card[aria-pressed="true"])';
  css.textContent = {
    /* V1：右上角圖示改成看得到字的深色膠囊 */
    v1: `.card-edit{width:auto!important;height:34px!important;padding:0 14px 0 11px!important;border-radius:999px!important;background:#0E1726!important;color:#fff!important;display:inline-flex!important;align-items:center;gap:6px;font:700 13px/1 "Inter","Noto Sans TC",sans-serif;box-shadow:0 6px 16px rgba(14,23,38,.22)!important;border:0!important}
         .card-edit::after{content:"編輯配色"}
         .card-edit svg{width:15px!important;height:15px!important}
         .card-edit:hover{background:#1C2A40!important}`,
    /* V2：選到的卡片底部多一條操作列，整條都能點 */
    v2: `${PICK} .paint-card{padding-bottom:58px!important}
         ${PICK} .card-edit{left:1px!important;right:1px!important;top:auto!important;bottom:1px!important;width:auto!important;height:46px!important;border-radius:0 0 11px 11px!important;background:#F3F5F7!important;border:0!important;border-top:1px solid #DCE1E7!important;color:#0E1726!important;display:flex!important;align-items:center;justify-content:center;gap:8px;font:700 14px/1 "Inter","Noto Sans TC",sans-serif;box-shadow:none!important}
         ${PICK} .card-edit::after{content:"調整這個配色　→"}
         ${PICK} .card-edit svg{width:16px!important;height:16px!important}
         ${PICK} .card-edit:hover{background:#E8ECF1!important}`,
    /* V3：卡片下方一顆主按鈕，永遠指向目前選的版型；卡片上的鉛筆拿掉 */
    v3: `.card-edit{display:none!important}
         .ed-main{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;height:52px;margin-top:14px;border:0;border-radius:999px;background:#0E1726;color:#fff;font:700 15px/1 "Inter","Noto Sans TC",sans-serif;cursor:pointer}
         .ed-main:hover{background:#1C2A40}.ed-main svg{width:17px;height:17px}
         .ed-note{margin-top:8px;text-align:center;font:500 12.5px/1.5 "Inter","Noto Sans TC",sans-serif;color:#7A8492}`,
    /* V2B：每張卡都有底部列，高度一致；沒選的是淡淡的「選這個配色」，選到的變成「調整這個配色 →」 */
    v2b: `.template-option .paint-card{padding-bottom:56px!important}
         .template-option::after{content:"選這個配色";position:absolute;left:1px;right:1px;bottom:1px;height:44px;display:flex;align-items:center;justify-content:center;border-top:1px solid #E6E9EE;border-radius:0 0 11px 11px;font:600 13px/1 "Inter","Noto Sans TC",sans-serif;color:#9AA4B0;pointer-events:none;transition:color .2s}
         .template-option:hover::after{color:#4A5563}
         ${PICK}::after{display:none}
         ${PICK} .card-edit{left:1px!important;right:1px!important;top:auto!important;bottom:1px!important;width:auto!important;height:44px!important;border-radius:0 0 11px 11px!important;background:#0E1726!important;border:0!important;color:#fff!important;display:flex!important;align-items:center;justify-content:center;gap:8px;font:700 13.5px/1 "Inter","Noto Sans TC",sans-serif;box-shadow:none!important}
         ${PICK} .card-edit::after{content:"調整這個配色　→"}
         ${PICK} .card-edit svg{width:15px!important;height:15px!important}
         ${PICK} .card-edit:hover{background:#1C2A40!important}`,
    /* V2C：不加高度，選到的卡片把色票列變成可點的編輯列（灰底＋鉛筆） */
    v2c: `${PICK} .template-colors{position:relative;display:flex!important;align-items:center;flex-wrap:nowrap;margin:0 -6px -10px;padding:6px 30px 6px 8px;border-radius:8px;background:#EEF1F4;transition:background .2s}
         ${PICK} .template-colors::after{content:"";position:absolute;right:9px;top:50%;width:15px;height:15px;margin-top:-7.5px;background:#0E1726;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 20h9'/%3E%3Cpath d='M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z'/%3E%3C/svg%3E") center/contain no-repeat}
         ${PICK}:has(.card-edit:hover) .template-colors{background:#E0E5EB}
         ${PICK} .card-edit{opacity:0!important;border-radius:8px!important;padding:0!important;border:0!important}`,
    /* V2D：選到的那一列下方展開一條全寬的編輯列，卡片高度不變 */
    v2d: `.paint-grid{grid-auto-rows:auto!important}
         .card-edit{display:none!important}
         .ed-row{grid-column:1/-1;position:relative;display:flex;align-items:center;gap:14px;margin-top:2px;padding:12px 12px 12px 16px;border-radius:12px;background:#F1F3F6;border:1px solid #E1E5EA}
         .ed-row::before{content:"";position:absolute;top:-7px;left:var(--ar,25%);width:12px;height:12px;margin-left:-6px;background:#F1F3F6;border-left:1px solid #E1E5EA;border-top:1px solid #E1E5EA;transform:rotate(45deg)}
         .ed-row div{flex:1;min-width:0}.ed-row b{display:block;font:700 13.5px/1.3 "Inter","Noto Sans TC",sans-serif;color:#141A22}
         .ed-row small{display:block;margin-top:3px;font:500 12px/1.4 "Inter","Noto Sans TC",sans-serif;color:#4A5563;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
         .ed-row button{flex:none;display:inline-flex;align-items:center;gap:7px;height:38px;padding:0 16px;border:0;border-radius:999px;background:#0E1726;color:#fff;font:700 13.5px/1 "Inter","Noto Sans TC",sans-serif;cursor:pointer}
         .ed-row button:hover{background:#1C2A40}.ed-row button svg{width:14px;height:14px}`,
    /* 甲：色票列移到每張卡的底部列；選到的卡片底部列變淡灰底＋鉛筆，整列可點 */
    v2e: `.template-option .template-colors{margin:8px -12px -12px!important;padding:0 12px!important;height:40px;display:flex!important;align-items:center;border-top:1px solid #E6E9EE;border-radius:0 0 11px 11px;transition:background .2s}
         ${PICK} .template-colors{background:#EEF1F4}
         ${PICK}:has(.card-edit:hover) .template-colors{background:#E2E7ED}
         ${PICK} .card-edit{left:1px!important;right:1px!important;top:auto!important;bottom:1px!important;width:auto!important;height:40px!important;border-radius:0 0 11px 11px!important;border:0!important;box-shadow:none!important;background:transparent!important;display:flex!important;align-items:center;justify-content:flex-end;gap:6px;padding:0 12px!important;color:#0E1726!important;font:700 13px/1 "Inter","Noto Sans TC",sans-serif}
         ${PICK} .card-edit svg{width:15px!important;height:15px!important}`,
    /* 甲-2：同甲，但選到時色票只留色點，騰出空間寫「編輯配色」 */
    v2e2: `.template-option .template-colors{margin:8px -12px -12px!important;padding:0 12px!important;height:40px;display:flex!important;align-items:center;border-top:1px solid #E6E9EE;border-radius:0 0 11px 11px;transition:background .2s}
         ${PICK} .template-colors{background:#EEF1F4;gap:5px!important}
         ${PICK} .template-color-item>span:not(.sr-only){display:none!important}
         ${PICK} .template-color-item{gap:0!important}
         ${PICK}:has(.card-edit:hover) .template-colors{background:#E2E7ED}
         ${PICK} .card-edit{left:1px!important;right:1px!important;top:auto!important;bottom:1px!important;width:auto!important;height:40px!important;border-radius:0 0 11px 11px!important;border:0!important;box-shadow:none!important;background:transparent!important;display:flex!important;align-items:center;justify-content:flex-end;gap:6px;padding:0 12px!important;color:#0E1726!important;font:700 13px/1 "Inter","Noto Sans TC",sans-serif}
         ${PICK} .card-edit::after{content:"編輯配色　→"}
         ${PICK} .card-edit svg{width:14px!important;height:14px!important}`,
    /* 乙：價格移到底部列左邊；選到的卡片底部列右邊多藍色「編輯配色 →」（不放鉛筆） */
    v2f: `.template-option .template-card{grid-template-rows:auto!important}
         .template-option .template-card>.part-row-text>strong{grid-column:1/-1!important;grid-row:2!important}
         .template-option .template-card .template-colors{grid-column:1/-1!important;grid-row:3!important;margin-top:6px}
         .template-option .template-card .part-row-price{grid-column:1/-1!important;grid-row:4!important;justify-self:stretch!important;text-align:left!important;margin:8px -12px -12px!important;padding:0 12px!important;height:40px;display:flex!important;align-items:center;border-top:1px solid #E6E9EE;border-radius:0 0 11px 11px;transition:background .2s;font-weight:700}
         ${PICK} .part-row-price{background:#EEF1F4}
         ${PICK}:has(.card-edit:hover) .part-row-price{background:#E2E7ED}
         ${PICK} .card-edit{left:1px!important;right:1px!important;top:auto!important;bottom:1px!important;width:auto!important;height:40px!important;border-radius:0 0 11px 11px!important;border:0!important;box-shadow:none!important;background:transparent!important;display:flex!important;align-items:center;justify-content:flex-end;gap:6px;padding:0 12px!important;color:#0E1726!important;font:700 13px/1 "Inter","Noto Sans TC",sans-serif}
         ${PICK} .card-edit::after{content:"編輯配色　→"}
         ${PICK} .card-edit{color:#1F4FE0!important}
         ${PICK} .card-edit:hover{color:#163BB0!important}
         ${PICK} .card-edit svg{display:none!important}`,
    /* 丙：同 2B，但沒選的底部列不放字，只留分隔線 */
    v2g: `.template-option .paint-card{padding-bottom:56px!important}
         .template-option::after{content:"";position:absolute;left:1px;right:1px;bottom:1px;height:44px;border-top:1px solid #E6E9EE;border-radius:0 0 11px 11px;pointer-events:none}
         ${PICK}::after{display:none}
         ${PICK} .card-edit{left:1px!important;right:1px!important;top:auto!important;bottom:1px!important;width:auto!important;height:44px!important;border-radius:0 0 11px 11px!important;background:#0E1726!important;border:0!important;color:#fff!important;display:flex!important;align-items:center;justify-content:center;gap:8px;font:700 13.5px/1 "Inter","Noto Sans TC",sans-serif;box-shadow:none!important}
         ${PICK} .card-edit::after{content:"調整這個配色　→"}
         ${PICK} .card-edit svg{width:15px!important;height:15px!important}
         ${PICK} .card-edit:hover{background:#1C2A40!important}`,
  }[V];
  D.head.appendChild(css);
  const go = () => {
    const tab = [...D.querySelectorAll('[data-paint-tab]')].find(b => b.dataset.paintTab === 'custom');
    if (!tab) return setTimeout(go, 150);
    if (tab.getAttribute('aria-pressed') !== 'true') tab.click();
    setTimeout(() => { const t = D.querySelector('[data-template="t4"]'); if (t && t.getAttribute('aria-pressed') !== 'true') t.click(); }, 300);
  };
  go();
  if (V === 'v3') {
    const ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
    const place = () => {
      const grid = D.querySelector('.paint-grid'), edit = D.querySelector('.card-edit'); if (!grid) return;
      let btn = D.querySelector('.ed-main');
      if (!edit) { btn && btn.remove(); D.querySelector('.ed-note')?.remove(); return; }
      const name = edit.getAttribute('aria-label').replace(/^編輯 | 塗裝$/g, '');
      if (!btn || btn.previousElementSibling !== grid) { btn && btn.remove(); D.querySelector('.ed-note')?.remove(); grid.insertAdjacentHTML('afterend', '<button type="button" class="ed-main"></button><p class="ed-note">上半、下半、Logo 的顏色與霧／亮面都可以換</p>'); btn = D.querySelector('.ed-main'); btn.onclick = () => D.querySelector('.card-edit')?.click(); }
      const label = ICON + '編輯 ' + name + ' 的配色';
      if (btn.dataset.name !== name) { btn.dataset.name = name; btn.innerHTML = label; }
    };
    new MutationObserver(place).observe(D.body, {childList: true, subtree: true});
    place();
  }
  /* V2C：讓透明的編輯鈕剛好蓋在色票列上 */
  if (V === 'v2c') {
    const fit = () => {
      const e = D.querySelector('.card-edit'), row = e && e.closest('.template-option').querySelector('.template-colors'); if (!row) return;
      const o = e.closest('.template-option').getBoundingClientRect(), r = row.getBoundingClientRect();
      Object.assign(e.style, {left: (r.left - o.left) + 'px', top: (r.top - o.top) + 'px', width: r.width + 'px', height: r.height + 'px', right: 'auto'});
      e.setAttribute('aria-label', e.getAttribute('aria-label') || '編輯塗裝');
    };
    new MutationObserver(fit).observe(D.body, {childList: true, subtree: true}); addEventListener('resize', fit); setInterval(fit, 400);
  }
  /* V2D：在選到的那一列後面插一條全寬編輯列，箭頭指向選到的卡片 */
  if (V === 'v2d') {
    const ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
    const place = () => {
      const grid = D.querySelector('.paint-grid'), e = D.querySelector('.card-edit'); let row = D.querySelector('.ed-row');
      if (!grid || !e) { row && row.remove(); return; }
      const opts = [...grid.querySelectorAll('.template-option')], i = opts.indexOf(e.closest('.template-option')), end = opts[Math.min(opts.length - 1, i | 1)];
      const name = e.getAttribute('aria-label').replace(/^編輯 | 塗裝$/g, '');
      const sum = [...opts[i].querySelectorAll('.template-color-item')].map(x => x.title.replace(/：(.+)（(.+)）/, ' $2 $1')).join('・');
      const key = name + '|' + sum + '|' + i;
      if (row && row.dataset.key === key && row.previousElementSibling === end) return;
      row && row.remove();
      end.insertAdjacentHTML('afterend', `<div class="ed-row" style="--ar:${i % 2 ? 75 : 25}%"><div><b>${name} 的配色</b><small>${sum}</small></div><button type="button">${ICON}調整配色</button></div>`);
      row = D.querySelector('.ed-row'); row.dataset.key = key; row.querySelector('button').onclick = () => D.querySelector('.card-edit')?.click();
    };
    new MutationObserver(place).observe(D.body, {childList: true, subtree: true}); place();
  }
})();
