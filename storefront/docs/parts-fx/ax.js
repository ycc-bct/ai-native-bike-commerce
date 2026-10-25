/* 「車款客製化塗裝」底部弧線選單進場提案：注入 custom-studio/index.html。
   ?ax=1 弧線描繪＋依序出現　?ax=2 轉盤轉入。window.__play() 可以重播。 */
(() => {
  const D = document, V = new URL(location.href).searchParams.get('ax') || '1';
  try { CSS.registerProperty({name: '--sweep', syntax: '<angle>', inherits: true, initialValue: '360deg'}); } catch (e) {}
  const css = D.createElement('style');
  css.textContent = `
  .tpl9.arc-showroom .tabs9.ax-draw::before,.tpl9.arc-showroom .tabs9.ax-draw::after{
    -webkit-mask:conic-gradient(from 270deg at 50% 50%,#000 var(--sweep),transparent 0);mask:conic-gradient(from 270deg at 50% 50%,#000 var(--sweep),transparent 0)}
  .tpl9.arc-showroom .tabs9.ax-draw::after{-webkit-mask:conic-gradient(from 270deg at 50% 50%,#000 calc(var(--sweep) - 14deg),transparent 0);mask:conic-gradient(from 270deg at 50% 50%,#000 calc(var(--sweep) - 14deg),transparent 0)}`;
  D.head.appendChild(css);
  const sec = D.getElementById('templates');
  const E = 'cubic-bezier(.16,1,.3,1)';
  const play = () => {
    const motion = sec.querySelector('.showroom-motion'), bike = sec.querySelector('.paint-display'), arc = sec.querySelector('.tabs9'),
      tabs = [...sec.querySelectorAll('.tab9')], sw = [...sec.querySelectorAll('.tray9 .th9')], link = sec.querySelector('.paint-start'), title = sec.querySelector('.sh9');
    [motion, bike, arc, link, title, ...tabs, ...sw].forEach(el => el && el.getAnimations().forEach(a => a.cancel()));
    const anim = (el, kf, o) => el && el.animate(kf, {fill: 'both', easing: E, ...o});
    anim(title, [{opacity: 0, translate: '0 24px'}, {opacity: 1, translate: '0 0'}], {duration: 600});
    anim(bike, [{opacity: 0, translate: '0 28px'}, {opacity: 1, translate: '0 0'}], {duration: 750, delay: 80});
    if (V === '1') {
      /* 弧線從左（TCR 那端）往右畫出；車款名稱與圓點在弧線經過時依序出現；色票由小變大跳出；最後才是「開始客製」 */
      arc.classList.add('ax-draw');
      const draw = arc.animate([{'--sweep': '0deg'}, {'--sweep': '180deg'}], {duration: 900, delay: 300, easing: 'cubic-bezier(.45,0,.2,1)', fill: 'both'});
      draw.finished.then(() => { arc.classList.remove('ax-draw'); draw.cancel(); }).catch(() => {});
      tabs.forEach((t, i) => anim(t, [{opacity: 0, translate: '0 10px'}, {opacity: 1, translate: '0 0'}], {duration: 450, delay: 380 + i * 190}));
      sw.forEach((b, i) => anim(b, [{opacity: 0, scale: .55}, {opacity: 1, scale: 1}], {duration: 420, delay: 1050 + i * 70, easing: 'cubic-bezier(.34,1.56,.64,1)'}));
      anim(link, [{opacity: 0, translate: '-50% 8px'}, {opacity: 1, translate: '-50% 0'}], {duration: 450, delay: 1400});
    } else {
      /* 弧線＋車款名稱當成一個轉盤，從右邊轉 28 度回到定位；色票與連結接著淡入 */
      const R = arc.offsetWidth / 2;
      arc.style.transformOrigin = `50% ${R}px`;
      anim(arc, [{opacity: 0, rotate: '28deg'}, {opacity: 1, rotate: '6deg', offset: .45}, {opacity: 1, rotate: '0deg'}], {duration: 1200, delay: 250, easing: 'cubic-bezier(.22,1,.36,1)'});
      sw.forEach((b, i) => anim(b, [{opacity: 0, translate: '0 8px'}, {opacity: 1, translate: '0 0'}], {duration: 420, delay: 1050 + i * 60}));
      anim(link, [{opacity: 0, translate: '-50% 8px'}, {opacity: 1, translate: '-50% 0'}], {duration: 450, delay: 1350});
    }
  };
  window.__play = play;
  sec.scrollIntoView({block: 'start'});
  setTimeout(play, 500);   // 等原本的進場觸發後再取消，換成提案的動態
})();
