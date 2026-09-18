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
