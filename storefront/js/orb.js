/* 全站 header 的 AI orb。
   用 thinking-orbs 的 engine（不含 React），自己接 canvas 尺寸與動畫迴圈。
   用法：<button data-orb="breathing" data-orb-size="20" data-orb-dark="1"></button>
   之後可以用 Orb.set(el, 'searching') 換狀態。 */
(function () {
  var E = window.ThinkingOrbsEngine;
  if (!E) { console.warn('[orb] thinking-orbs engine 未載入'); return; }

  var REDUCE = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var list = [], raf = 0;

  function paint(o, t) {
    var c = o.ctx;
    c.setTransform(o.dpr, 0, 0, o.dpr, 0, 0);
    c.clearRect(0, 0, o.size, o.size);
    E.MODE_DRAWS[o.mode](c, o.size, t, o.dark, o.opts);
  }
  /* 所有 orb 共用一個時鐘，換狀態不會跳格 */
  function tick() {
    var now = performance.now() / 1000, live = false;
    for (var i = 0; i < list.length; i++) {
      var o = list[i];
      if (o.paused || !o.visible || document.visibilityState === 'hidden') continue;
      live = true; paint(o, now * o.speed);
    }
    raf = live ? requestAnimationFrame(tick) : 0;
  }
  function wake() { if (!raf && !REDUCE) raf = requestAnimationFrame(tick); }

  function setState(o, state) {
    var r = E.resolvePreset(state, o.preset);
    o.state = state; o.mode = r.mode; o.speed = r.speed * o.speedMul; o.opts = r.opts;
    if (REDUCE) paint(o, 0.6 * o.speed); else wake();       /* 減少動態：畫一張代表格 */
  }

  function mount(el) {
    if (el.__orb) return el.__orb;
    var size = +(el.getAttribute('data-orb-size') || 26);        /* 實際畫出來的 px */
    var preset = +(el.getAttribute('data-orb-preset') || (size <= 32 ? 20 : 64));  /* 套件只調過 20 與 64 兩種設計 */
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var cv = document.createElement('canvas');
    cv.width = Math.round(size * dpr); cv.height = Math.round(size * dpr);
    cv.style.width = cv.style.height = size + 'px';
    cv.setAttribute('role', 'img');
    cv.setAttribute('aria-hidden', 'true');
    el.appendChild(cv);

    var o = {
      el: el, ctx: cv.getContext('2d'), size: size, dpr: dpr,
      preset: preset,
      dark: el.getAttribute('data-orb-dark') === '1',
      speedMul: +(el.getAttribute('data-orb-speed') || 1),
      paused: false, visible: true
    };
    list.push(o);
    setState(o, el.getAttribute('data-orb') || 'breathing');

    if (window.IntersectionObserver) {
      new IntersectionObserver(function (e) { o.visible = e[0].isIntersecting; wake(); }).observe(cv);
    }
    el.__orb = o;
    return o;
  }

  function mountAll(root) {
    (root || document).querySelectorAll('[data-orb]').forEach(mount);
  }

  document.addEventListener('visibilitychange', wake);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mountAll(); });
  else mountAll();

  window.Orb = {
    mountAll: mountAll,
    set: function (el, state) {
      var t = typeof el === 'string' ? document.querySelector(el) : el;
      if (t && t.__orb && t.__orb.state !== state) setState(t.__orb, state);
    },
    pause: function (el, v) { var t = typeof el === 'string' ? document.querySelector(el) : el; if (t && t.__orb) { t.__orb.paused = !!v; wake(); } }
  };
})();
