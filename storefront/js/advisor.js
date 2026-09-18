/* 選車顧問共用：仿 macOS Genie 的開關動畫
   a：對話框元素；log：訊息捲動區；target：縮進去的那顆 orb；dir：'in' 縮小／'out' 打開 */
function advisorGenie(a, log, target, dir, done){
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { done(); return; }
  const pr = a.getBoundingClientRect(), tr = target.getBoundingClientRect();
  const N = 48, W = pr.width, H = pr.height, sh = H / N, pcx = pr.left + W / 2;
  const tx = tr.left + tr.width / 2, ty = tr.bottom < 0 ? -20 : tr.top + tr.height / 2, tw = Math.max(18, tr.width * .8);
  const layer = document.createElement('div');
  layer.className = 'genie';
  const logTop = log.scrollTop, strips = [];
  for (let i = 0; i < N; i++) {
    const st = document.createElement('div');
    st.className = 'genie-strip';
    st.style.cssText = 'left:' + pr.left + 'px;top:' + (pr.top + i * sh) + 'px;width:' + W + 'px;height:' + (Math.ceil(sh) + 1) + 'px';
    const c = a.cloneNode(true);
    c.removeAttribute('id'); c.removeAttribute('hidden');
    c.querySelectorAll('[id]').forEach(e => e.removeAttribute('id'));
    c.classList.add('on');
    c.style.cssText = 'position:absolute;left:0;top:' + (-i * sh) + 'px;right:auto;width:' + W + 'px;height:' + H + 'px;transform:none;transition:none;visibility:visible;opacity:1';
    st.appendChild(c);
    layer.appendChild(st);
    strips.push({el:st, v:(i + .5) / N, log:c.querySelector('.adv-log')});
  }
  document.body.appendChild(layer);
  strips.forEach(x => { if (x.log) x.log.scrollTop = logTop; });
  a.style.visibility = 'hidden';
  const ss = (e0, e1, x) => { const k = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return k * k * (3 - 2 * k); };
  const dur = 620, t0 = performance.now();
  (function frame(now){
    const p = Math.min(1, (now - t0) / dur), t = dir === 'in' ? p : 1 - p;
    const pinch = ss(0, .5, t), slide = ss(.18, 1, t);
    for (const x of strips) {
      const y0 = pr.top + x.v * H;
      const y = ty + (y0 - ty) * (1 - slide);                                   /* 整片往 orb 收 */
      const f = ss(0, 1, Math.pow(Math.min(1, Math.max(0, (y - ty) / (pr.bottom - ty))), .75));
      const w = W + ((tw + (W - tw) * f) - W) * pinch;                           /* 越靠近 orb 越窄 */
      const cx = pcx + ((tx + (pcx - tx) * f) - pcx) * pinch;
      x.el.style.transform = 'translate(' + (cx - pcx) + 'px,' + (y - y0) + 'px) scale(' + (w / W) + ',' + Math.max(.001, 1 - slide) + ')';
      x.el.style.opacity = t > .9 ? String((1 - t) / .1) : '1';
    }
    if (p < 1) requestAnimationFrame(frame);
    else { layer.remove(); a.style.visibility = ''; done(); }
  })(t0);
}


/* ---------- 對話框 input 上方的快捷 chip：我的尺寸／商品比較 ----------
   advSizer(sizes, h)        產生身高滑桿＋建議尺寸的訊息內容
   advBindSizer(m, sizes, cb) 綁定滑桿；按「就用這個尺寸」時回呼 cb(h, sizeName)
   advQuickSet(key, text)    把 chip 文字改成「我的尺寸 M」這種已設定狀態
   sizes 格式：[['XS',155,166], ...]，身高落在多個範圍時取較大的那個 */
var ADV_H_KEY = 'giant-storefront-height';
function advSizeFor(sizes, h){
  var hit = sizes.filter(function (x) { return h >= x[1] && h <= x[2]; });
  return hit.length ? hit[hit.length - 1] : null;
}
function advSizer(sizes, h){
  h = h || 172;
  return '<div class="adv-sizer"><p class="sz-h"><b>' + h + '</b><span>cm</span><button class="adv-chip sz-ok" type="button">就用這個尺寸</button></p>' +
    '<input class="sz-range" type="range" min="150" max="200" step="1" value="' + h + '" aria-label="身高">' +
    '<p class="sz-res"></p></div>';
}
function advBindSizer(m, sizes, cb){
  var box = m.querySelector('.adv-sizer'), r = box.querySelector('.sz-range'), num = box.querySelector('.sz-h b'), res = box.querySelector('.sz-res');
  function paint(){
    var h = +r.value, s = advSizeFor(sizes, h);
    num.textContent = h;
    r.style.setProperty('--p', ((h - 150) / 50 * 100) + '%');
    res.innerHTML = s ? '建議尺寸 <b>' + s[0] + '</b>（' + s[1] + '–' + s[2] + ' cm）'
                      : (h < sizes[0][1] ? '低於建議範圍，建議到門市評估' : '高於建議範圍，建議到門市評估');
  }
  r.oninput = paint; paint();
  box.querySelector('.sz-ok').onclick = function () {
    var h = +r.value, s = advSizeFor(sizes, h);
    r.disabled = true; box.classList.add('done'); this.disabled = true;
    try { localStorage.setItem(ADV_H_KEY, h); } catch (e) {}
    if (s) advQuickSet('size', '我的尺寸 ' + s[0]);
    cb(h, s ? s[0] : null);
  };
}
function advQuickSet(key, text){
  var b = document.querySelector('.adv-quick [data-q="' + key + '"]');
  if (!b) return;
  b.textContent = text; b.classList.add('set');
}
/* 之前設定過就直接顯示 */
addEventListener('DOMContentLoaded', function () {
  var sizes = window.ADV_SIZES;                 /* 各頁的行內腳本會在這之前設好 */
  try {
    var h = +localStorage.getItem(ADV_H_KEY);
    if (h && sizes) { var s = advSizeFor(sizes, h); if (s) advQuickSet('size', '我的尺寸 ' + s[0]); }
  } catch (e) {}
});
