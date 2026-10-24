/* 「車款客製化塗裝」左側三重點＋右側提案：注入 custom-studio/index.html（不放漆面特寫小卡）。
   ?pc=1 右側留白、三重點與車子垂直置中　2 右側「這個樣板的配色」　3 車架質感照淡淡融進背景　4 三重點可以點開 */
(() => {
  const D = document, V = new URL(location.href).searchParams.get('pc') || '1';
  const sec = D.querySelector('#templates'), host = sec.querySelector('.in');
  const GI = 'https://images2.giant-bicycles.com/b_white%2Cc_pad%2Ch_1000%2Cq_85%2Cw_1500/';
  const CHIPS = new URL('../docs/paint-chips/', location.href).href;
  const POINTS = [['手工遮罩分色', '上半、下半與 Logo 分層遮罩，邊界俐落不暈染'], ['霧面／亮面可選', '每個部位都能各自選擇漆面質感'], ['出廠前逐台檢驗', '膜厚與色差逐台量測，與色票一致']];
  const st = D.createElement('style');
  st.textContent = `
  .pc-points{position:absolute;left:36px;top:${V === '1' ? 290 : 236}px;z-index:6;width:300px;margin:0;padding:0;font-family:"Inter","Noto Sans TC",sans-serif}
  .pc-points li{list-style:none;display:grid;grid-template-columns:28px 1fr;column-gap:10px;padding:14px 0;border-top:1px solid rgba(20,26,34,.1)}
  .pc-points li:first-child{border-top:0;padding-top:0}
  .pc-points i{font:700 12px/22px "Inter",sans-serif;font-style:normal;color:#9AA4B0}
  .pc-points b{display:block;font-size:15px;color:#141A22}
  .pc-points span{display:block;margin-top:4px;font-size:13px;line-height:1.6;color:#4A5563}
  /* 2 樣板配色 */
  .pc-colors{position:absolute;right:36px;top:236px;z-index:6;width:250px;font-family:"Inter","Noto Sans TC",sans-serif}
  .pc-colors h4{margin:0;font-size:13px;font-weight:700;letter-spacing:.06em;color:#7A8492}
  .pc-colors .nm{margin-top:4px;font-size:17px;font-weight:800;color:#141A22}
  .pc-colors ul{margin:14px 0 0;padding:0}
  .pc-colors li{list-style:none;display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid rgba(20,26,34,.1)}
  .pc-colors li em{width:30px;height:30px;border-radius:8px;flex:none;box-shadow:inset 0 0 0 1px rgba(20,26,34,.12)}
  .pc-colors li b{font-size:14px;color:#141A22}.pc-colors li small{display:block;font-size:12px;color:#7A8492}
  .pc-colors p{margin-top:12px;font-size:11.5px;color:#9AA4B0}
  /* 3 質感照融進背景 */
  .pc-ghost{position:absolute;right:-60px;top:170px;width:520px;height:380px;z-index:0;pointer-events:none;opacity:.08;mix-blend-mode:multiply;
    -webkit-mask:radial-gradient(closest-side,#000 45%,transparent 100%);mask:radial-gradient(closest-side,#000 45%,transparent 100%)}
  .pc-ghost img{width:100%;height:100%;object-fit:contain;filter:grayscale(.2)}
  /* 4 可點開 */
  .pc-points.click li{cursor:pointer}
  .pc-points.click b::after{content:" +";color:#9AA4B0;font-weight:600}
  .pc-points.click li.on b::after{content:" −"}
  .pc-more{display:grid;grid-template-rows:0fr;transition:grid-template-rows .35s ease}
  .pc-points li.on .pc-more{grid-template-rows:1fr}
  .pc-more>div{overflow:hidden}
  .pc-more .row{display:flex;gap:10px;padding-top:12px}
  .pc-more figure{margin:0;text-align:center;font-size:11.5px;color:#7A8492}
  .pc-more figure div{width:56px;height:56px;border-radius:10px;background-size:200% 100%;box-shadow:inset 0 0 0 1px rgba(20,26,34,.1);margin-bottom:6px}
  .pc-more .bar{display:flex;height:14px;width:200px;border-radius:999px;overflow:hidden;gap:2px;margin-top:12px}
  `;
  D.head.appendChild(st);
  host.insertAdjacentHTML('beforeend', `<ul class="pc-points${V === '4' ? ' click' : ''}">${POINTS.map(([b, t], i) => `<li><i>0${i + 1}</i><div><b>${b}</b><span>${t}</span>${V === '4' ? `<div class="pc-more"><div>${[
    `<div class="bar"><span style="flex:4.5;background:#0E3A7A"></span><span style="flex:4.5;background:#C8CDD3"></span><span style="flex:1;background:#E1352B"></span></div>`,
    `<div class="row"><figure><div style="background-image:url(${CHIPS}RD-002.webp);background-position:0 0"></div>霧面</figure><figure><div style="background-image:url(${CHIPS}RD-002.webp);background-position:100% 0"></div>亮面</figure><figure><div style="background-image:url(${CHIPS}BU-002.webp);background-position:0 0"></div>霧面</figure><figure><div style="background-image:url(${CHIPS}BU-002.webp);background-position:100% 0"></div>亮面</figure></div>`,
    `<div class="row" style="font-size:12.5px;color:#4A5563;line-height:1.6">每一台在出廠前，都會以色票為基準比對色差。</div>`][i]}</div></div>` : ''}</div></li>`).join('')}</ul>`);
  const fam = () => (sec.querySelector('.tab9.on')?.textContent || 'tcr').trim();
  if (V === '4') host.querySelector('.pc-points').addEventListener('click', e => { const li = e.target.closest('li'); if (li) li.classList.toggle('on'); });

  if (V === '2') {
    host.insertAdjacentHTML('beforeend', '<aside class="pc-colors"><h4>這個樣板的配色</h4><div class="nm"></div><ul></ul><p>示意：顏色由樣板圖自動取色，實際部位色號以樣板資料為準</p></aside>');
    const box = host.querySelector('.pc-colors'), bike = sec.querySelector('.bk9');
    const name = c => { const [r, g, b] = c, l = (r + g + b) / 3, mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      if (mx - mn < 24) return l > 200 ? '白' : l > 120 ? '銀灰' : l > 60 ? '鐵灰' : '黑';
      const h = (() => { const d = mx - mn; let x = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return (x * 60 + 360) % 360; })();
      return h < 18 || h >= 340 ? '紅' : h < 45 ? '橘' : h < 70 ? '黃' : h < 165 ? '綠' : h < 200 ? '青' : h < 255 ? '藍' : h < 300 ? '紫' : '粉'; };
    const pick = () => {
      const c = D.createElement('canvas'), W = 160, H = Math.round(160 * bike.naturalHeight / bike.naturalWidth || 100); c.width = W; c.height = H;
      const x = c.getContext('2d', {willReadFrequently: true}); try { x.drawImage(bike, 0, 0, W, H); } catch (e) { return; }
      let data; try { data = x.getImageData(0, 0, W, H).data; } catch (e) { return; }
      const bins = new Map();
      for (let i = 0; i < data.length; i += 4) { if (data[i + 3] < 220) continue; const r = data[i], g = data[i + 1], b = data[i + 2]; const l = (r + g + b) / 3; if (l < 38 || (Math.max(r, g, b) - Math.min(r, g, b) < 24 && l < 95)) continue;   // 略過輪組、輪胎的深灰
        const k = [r >> 5, g >> 5, b >> 5].join(','); const v = bins.get(k) || [0, 0, 0, 0]; v[0] += r; v[1] += g; v[2] += b; v[3]++; bins.set(k, v); }
      const top = [...bins.values()].sort((a, b) => b[3] - a[3]).map(v => [v[0] / v[3], v[1] / v[3], v[2] / v[3]].map(Math.round))
        .filter((c, i, arr) => arr.findIndex(d => Math.abs(d[0] - c[0]) + Math.abs(d[1] - c[1]) + Math.abs(d[2] - c[2]) < 120) === i).slice(0, 3);
      const label = ['主色', '輔色', '點綴'];
      box.querySelector('.nm').textContent = `${fam()} ${bike.alt.replace(/^\S+\s*/, '') || ''}`.trim();
      box.querySelector('ul').innerHTML = top.map((c, i) => `<li><em style="background:rgb(${c})"></em><div><b>${label[i]}・${name(c)}</b><small>霧面／亮面可選</small></div></li>`).join('');
    };
    bike.crossOrigin = bike.crossOrigin || null;
    new MutationObserver(() => bike.complete ? pick() : bike.addEventListener('load', pick, {once: true})).observe(bike, {attributes: true, attributeFilter: ['src']});
    bike.complete ? pick() : bike.addEventListener('load', pick, {once: true});
  }
  if (V === '3') {
    const MAP = {propel: 'iibwmi8tphyqcpsq0pf7/MY24-Propel-Advanced-SL-FF_Color-B-Blue-Dragonfly.jpg', tcr: 'h3skbnvjeooxbcfukxn1/MY24-TCR-Advanced-Pro-Disc-FF-B_Color-B-Carbon.jpg', defy: 'ntyhhwww6021sqfkeacf/MY24-Defy-Advanced-SL-FF_Color-A-Digital-Blurple.png', trinity: 'h3skbnvjeooxbcfukxn1/MY24-TCR-Advanced-Pro-Disc-FF-B_Color-B-Carbon.jpg'};
    host.insertAdjacentHTML('afterbegin', '<div class="pc-ghost"><img alt=""></div>');
    const im = host.querySelector('.pc-ghost img'), set = () => { im.src = GI + MAP[fam().toLowerCase()]; };
    new MutationObserver(set).observe(sec.querySelector('.tabs9'), {attributes: true, subtree: true, attributeFilter: ['class']}); set();
  }
  sec.scrollIntoView({block: 'start'});
})();
