/* 「車款客製化塗裝」底部選色與按鈕的間距提案：注入 custom-studio/index.html。
   ?ab=1 圓弧放大、整組往上　2 按鈕移到左側三重點下方　3 縮圖收進弧線裡　4 按鈕改成文字連結 */
(() => {
  const D = document, V = new URL(location.href).searchParams.get('ab') || '1';
  const css = D.createElement('style');
  css.textContent = {
    1: `.tpl9.arc-showroom .tabs9{translate:0 -40px;scale:1.14;transform-origin:50% 0}
        .tpl9.arc-showroom .tray9{translate:0 -34px}`,
    2: `.tpl9.arc-showroom .showroom-motion .paint-start{left:calc((100vw - var(--shell)) / 2)!important;bottom:auto!important;top:500px!important;translate:none!important}
        @media(max-width:1199px){.tpl9.arc-showroom .showroom-motion .paint-start{left:50%!important;top:auto!important;bottom:18px!important;translate:-50% 0!important}}`,
    3: `.tpl9.arc-showroom .tray9{translate:0 -44px}`,
    4: `.tpl9.arc-showroom .showroom-motion .paint-start{background:none!important;box-shadow:none!important;color:#141A22!important;height:auto!important;padding:4px 2px!important;bottom:14px!important;border-radius:0!important;border-bottom:1.5px solid #141A22!important}
        .tpl9.arc-showroom .paint-start:hover{color:#1F4FE0!important;border-color:#1F4FE0!important}`
  }[V];
  D.head.appendChild(css);
  D.getElementById('templates').scrollIntoView({block: 'start'});
})();
