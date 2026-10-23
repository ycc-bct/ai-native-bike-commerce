/* 「從碳纖維車架開始」滿版後的留白提案：注入 custom-studio/index.html。
   ?cf=1 車架拉近文字（圖片放大並往左）；2 文字下方加三個重點數字；3 兩者合併 */
(() => {
  const D = document, V = new URL(location.href).searchParams.get('cf') || '1';
  const cta = D.querySelector('#cta .cta'), tx = cta.querySelector('.tx');
  const css = D.createElement('style');
  /* 照片高度＝區塊高度（整台車架都看得到），車架左端固定在文字欄右側約 100px；照片右緣淡出到底色 */
  const pull = `#cta .cta{--h:clamp(420px,34vw,520px);--iw:calc(var(--h) * 2.3346);--sl:calc((100vw - var(--shell)) / 2);--ix:calc(var(--sl) + 540px - var(--iw) * .4983);
    background:linear-gradient(90deg,rgba(4,6,10,.94) 0,rgba(4,6,10,.72) calc(var(--sl) + 400px),rgba(4,6,10,0) calc(var(--sl) + 560px)),
      linear-gradient(90deg,rgba(6,7,9,0) calc(var(--ix) + var(--iw) - 200px),#060709 calc(var(--ix) + var(--iw) - 4px)),
      #060709 url('img/cta/carbon-frame-studio.jpg') var(--ix) center/auto 100% no-repeat!important}`;
  const stats = `#cta .cf-stats{display:flex;margin-top:40px;padding-top:24px;border-top:1px solid rgba(255,255,255,.14)}
    #cta .cf-stats div{padding-right:32px;margin-right:32px;border-right:1px solid rgba(255,255,255,.14)}
    #cta .cf-stats div:last-child{border-right:0;margin-right:0;padding-right:0}
    #cta .cf-stats b{display:block;font:800 30px/1 "Inter",sans-serif;color:#fff;letter-spacing:-.01em}
    #cta .cf-stats b small{font-size:15px;font-weight:700;margin-left:3px}
    #cta .cf-stats span{display:block;margin-top:8px;font-size:13px;color:#AEB7C4}`;
  css.textContent = (V === '1' || V === '3' ? pull : '') + (V === '2' || V === '3' ? stats : '');
  D.head.appendChild(css);
  if (V === '2' || V === '3') tx.insertAdjacentHTML('beforeend', '<div class="cf-stats"><div><b>130<small>家</small></b><span>全台服務門市</span></div><div><b>6<small>大</small></b><span>零件規格可選</span></div><div><b>4<small>款</small></b><span>On-Road 車款</span></div></div>');
  D.getElementById('cta').scrollIntoView({block: 'center'});
})();
