/* 自由配色卡片「Type 名稱下方配色資訊」提案：注入到嵌入的 customized.html（已是乙：價格在底部列）。
   ?tc=A 色票方塊（亮面有光澤）；B 分段色條＋一行霧亮；C 標題旁疊色點＋一行摘要 */
(() => {
  const D = document, V = new URL(location.href).searchParams.get('tc') || 'A';
  const css = D.createElement('style');
  css.textContent = `
  .template-colors[data-tc]{font-family:"Inter","Noto Sans TC",sans-serif}
  /* A：三格色票，下方「上 霧」小字；亮面色票加一道光澤 */
  .tc-A{display:flex!important;gap:14px;margin-top:8px!important}
  .tc-A .sw{display:flex;flex-direction:column;align-items:center;gap:5px}
  .tc-A .chip{position:relative;width:26px;height:26px;border-radius:7px;box-shadow:inset 0 0 0 1px rgba(20,26,34,.12);overflow:hidden}
  .tc-A .chip.gloss::after{content:"";position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.75) 0%,rgba(255,255,255,.15) 38%,rgba(255,255,255,0) 52%)}
  .tc-A .lb{font-size:11px;line-height:1;color:#4A5563;white-space:nowrap}
  .tc-A .lb em{font-style:normal;color:#9AA4B0;margin-left:2px}
  /* B：一條分段色條（上 45%／下 45%／Logo 10%），下方一行霧亮 */
  .tc-B{display:block!important;margin-top:8px!important}
  .tc-B .bar{display:flex;gap:2px;height:12px;padding:1px;border-radius:999px;overflow:hidden;background:#D5DBE2}
  .tc-B .bar span{height:100%}
  .tc-B .bar span:first-child{border-radius:999px 0 0 999px}.tc-B .bar span:last-child{border-radius:0 999px 999px 0}
  .tc-B .txt{margin-top:7px;font-size:11.5px;color:#4A5563;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .tc-B .txt b{font-weight:600;color:#141A22}
  /* C：色點疊在標題右邊，下方一行摘要（同一列不再放色票） */
  .template-card:has(.tc-C)>.part-row-text>strong{grid-column:1!important}
  .tc-C{display:contents!important}
  .tc-C .stack{grid-row:2;grid-column:2;justify-self:end;align-self:center;display:flex}
  .tc-C .stack i{width:20px;height:20px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px rgba(20,26,34,.12);margin-left:-7px}
  .tc-C .stack i:first-child{margin-left:0}
  .tc-C .sum{grid-row:3;grid-column:1/-1;margin-top:6px;font-size:12px;color:#4A5563;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  `;
  D.head.appendChild(css);

  const go = () => {
    const tab = [...D.querySelectorAll('[data-paint-tab]')].find(b => b.dataset.paintTab === 'custom');
    if (!tab) return setTimeout(go, 150);
    if (tab.getAttribute('aria-pressed') !== 'true') tab.click();
    setTimeout(() => { const t = D.querySelector('[data-template="t1"]'); if (t && t.getAttribute('aria-pressed') !== 'true') t.click(); }, 300);
  };
  go();

  const read = box => [...box.querySelectorAll('.template-color-item')].map(it => {
    const m = (it.title || '').match(/^(.+?)：(.+)（(.+)）$/) || [];
    return {zone: m[1] || '', name: m[2] || '', finish: m[3] || '', short: (m[3] || '').replace('面', ''), bg: it.querySelector('i')?.style.background || '#ccc'};
  });
  const summary = z => {
    const [u, l, g] = z, body = u.finish === l.finish ? `${u.finish}車身` : `上${u.short}・下${l.short}`;
    return `${body}・Logo ${g.finish}`;
  };
  function apply() {
    D.querySelectorAll('.template-colors:not([data-tc])').forEach(box => {
      const z = read(box); if (z.length < 3) return;
      box.dataset.tc = V; box.classList.add('tc-' + V);
      const names = z.map(x => `${x.zone}：${x.name}（${x.finish}）`).join('　');
      box.title = names;
      if (V === 'A') box.innerHTML = z.map(x => `<span class="sw" title="${x.zone}：${x.name}（${x.finish}）"><span class="chip${x.short === '亮' ? ' gloss' : ''}" style="background:${x.bg}"></span><span class="lb">${x.zone}<em>${x.short}</em></span></span>`).join('');
      if (V === 'B') box.innerHTML = `<span class="bar">${z.map((x, k) => `<span style="flex:${k === 2 ? 1 : 4.5};background:${x.bg}"></span>`).join('')}</span><span class="txt">${z.map(x => `${x.zone} <b>${x.short}</b>`).join('　')}</span>`;
      if (V === 'C') box.innerHTML = `<span class="stack">${z.map(x => `<i style="background:${x.bg}" title="${x.zone}：${x.name}"></i>`).join('')}</span><span class="sum">${summary(z)}</span>`;
    });
  }
  new MutationObserver(apply).observe(D.body, {childList: true, subtree: true});
  apply();
})();
