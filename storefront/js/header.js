/* 全站 header（storefront 共用）
   用法：頁面放一個空的 <header class="nav site-nav" id="siteHeader" data-page="home"></header>，
   緊接著 <script src="js/header.js"></script>（要在頁面自己的腳本之前，因為它們會找 #aiOrb、#openFav）。
   說明與選項見 storefront/docs/header.md。
   data-page   目前頁面：home / gravel / product / ride / quiz / result / custom / report / 其他 → 對應的第一層會標成 current
   data-ai     "off" 就不放右上角的選車顧問按鈕（那一頁沒有對話框時用）
   data-cart   購物車圖示的連結，預設 "#"
   選單文字與連結全部集中在下面的 NAV；路徑以這支腳本所在的 storefront 根目錄為準，子資料夾的頁面也能用。 */
(function () {
  var script = document.currentScript || document.querySelector('script[src*="header.js"]');
  var ROOT = script ? script.src.replace(/js\/header\.js.*$/, '') : '';
  var host = document.getElementById('siteHeader') || document.querySelector('header.site-nav:empty');
  if (!host) return;
  var page = host.dataset.page || '';
  var R = function (p) { return p && /^(https?:)?\/\//.test(p) ? p : ROOT + p; };

  /* ---------- 選單資料（第一層照官網 tw 的分法；第二層文字取自官網；連結只接我們做過的頁） ---------- */
  var BIKES = [
    {k: 'road',   t: '公路',        full: '公路自行車',               en: 'Road',            img: 'img/scenes/lifestyle.webp',
     sub: ['公路競賽', '鐵人三項競賽用車', '平把運動公路自行車', '運動通勤車款', '折疊自行車款', 'E+ 公路自行車'],
     feat: {n: 'Propel Advanced SL 1 Force 特仕車', pr: 'NT$ 258,000', img: 'img/home/bike-propel-sl1.webp', tag: 'NEW · 2027', href: ''}},
    {k: 'mtb',    t: '登山',        full: '登山車',                   en: 'Mountain',        img: 'img/scenes/mtb-road.webp',
     sub: ['雙避震登山車', '單避震登山車', '登山車 29"', '登山車 27.5"', '登山車 26"', 'E+ 越野登山車'],
     feat: {n: 'Trance X 1', pr: 'NT$ 108,000', img: 'img/bikes/trance.webp', tag: 'TRAIL', href: ''}},
    {k: 'gravel', t: '越野 & 礫石', full: '越野 & 礫石公路 跨界自行車', en: 'Gravel & X-Road', img: 'img/scenes/gravel-field.webp', href: 'gravel.html',
     sub: [['礫石公路自行車', 'gravel.html'], '跨界多功自行車', 'E+ 混合路面車'],
     feat: {n: 'Revolt Advanced SL 0', pr: 'NT$ 308,000', img: 'img/list/revolt-sl-0.webp', tag: 'NEW · 2027', href: 'product.html'}},
    {k: 'ebike',  t: 'E-Bike',      full: 'E-Bike 電動輔助自行車',    en: 'E-Bike',          img: 'img/scenes/ebike-park.webp',
     sub: ['E+ 公路車', 'E+ 越野登山車', 'E+ 混合路面車'],
     feat: {n: 'Talon E+', pr: 'NT$ 79,800', img: 'scenario-2/img/product-ebike.webp', tag: 'E+', href: 'ride.html?bike=ebike'}},
    {k: 'kids',   t: '童車',        full: '童車 & 青少年車',           en: 'Kids & Youth',    img: 'img/scenes/kids-trail.webp',
     sub: ['兒童滑步車', '兒童自行車 12"–16"', '20"（身高 115–135cm）', '24"（身高 130–150cm）', '10–16 歲（26–27.5"）'],
     feat: {n: 'Faith 24', pr: 'NT$ 18,800', img: 'scenario-2/img/product-faith.webp', tag: 'KIDS', href: ''}}
  ];
  var GEAR = [
    {t: '人身商品', sub: ['安全帽', '太陽眼鏡', '自行車衣', '自行車褲', '自行車鞋', '手套', '內著衣', '風雨衣、防風背心', '袖腿套']},
    {t: '車身商品', sub: ['車燈', '碼表、雷達', '水壺、壺架', '車袋', '鎖具', '打氣筒']},
    {t: '維修商品', sub: ['補胎液', '內胎、外胎', '鏈條油、清潔', '工具']},
    {t: '自行車零件', sub: ['輪組', '座墊、座管', '把手、龍頭', '踏板']}
  ];
  var MORE = [
    {k: 'gear',   t: '精品配件', dd: true},
    {k: 'custom', t: '客製化',   href: 'custom-studio/index.html'},
    {k: 'stores', t: '門市專區'}
  ];
  var CURRENT = {home: '', gravel: 'gravel', product: 'gravel', custom: 'custom'}[page] || '';

  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[c]; }); };
  var link = function (item) { var t = Array.isArray(item) ? item[0] : item, h = Array.isArray(item) ? R(item[1]) : '#'; return '<li><a href="' + h + '"' + (h === '#' ? ' class="soft"' : '') + '>' + esc(t) + '</a></li>'; };
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var VMARK = "<svg class=\"vmark\" viewBox=\"0 0 22 28\" fill=\"currentColor\" aria-hidden=\"true\"><path d=\"M7.28856 6.32744L10.7042 15.2261L10.7077 15.2227C10.7424 15.3165 10.8675 15.3443 10.9405 15.2748L18.081 8.48522C18.1922 8.38098 18.3694 8.49912 18.3138 8.64159L10.9161 27.9088C10.871 28.0304 10.6973 28.0304 10.6486 27.9088L0.0090577 0.194582C-0.0256893 0.100765 0.0438098 0 0.144576 0H21.4236C21.5244 0 21.5939 0.100765 21.5592 0.194582L19.3145 6.03903C19.2937 6.09462 19.2381 6.13285 19.179 6.13285H7.42408C7.32331 6.13285 7.25381 6.23362 7.28856 6.32744Z\"/></svg>";

  function bikePanel(c) {
    return '<div class="dd" data-dd="' + c.k + '" hidden><div class="dd-in">' +
      '<a class="dd-kv" href="' + (c.href ? R(c.href) : '#') + '"' + (c.href ? '' : ' data-soft') + '><img src="' + R(c.img) + '" alt=""><span><b>' + esc(c.full) + '</b><small>看全部 ' + esc(c.en) + ' ' + ARROW + '</small></span></a>' +
      '<ul class="dd-list">' + c.sub.map(link).join('') + '</ul>' +
      '</div></div>';
  }
  function gearPanel() {
    return '<div class="dd dd-gear" data-dd="gear" hidden><div class="dd-in">' +
      GEAR.map(function (g) { return '<div class="dd-col"><h4>' + esc(g.t) + '</h4><ul class="dd-list one">' + g.sub.map(link).join('') + '</ul></div>'; }).join('') +
      '</div></div>';
  }

  var cartHref = host.dataset.cart || '#';
  host.innerHTML =
    '<a class="logo" href="' + R('index.html') + '" aria-label="GIANT">' + "<svg viewBox=\"35 6 113 16\" fill=\"currentColor\" aria-hidden=\"true\"><path d=\"M124.059 7.36985H147.59L141.381 10.9245H135.512L129.796 21.5918H122.687L128.403 10.9245H122.155L124.059 7.36985Z\"/><path d=\"M66.9978 7.36985L59.3743 21.5918H65.8164L73.4399 7.36985H66.9978Z\"/><path d=\"M73.433 10.9245C74.4858 8.96126 76.932 7.36985 78.8952 7.36985H98.8574L91.2304 21.5918H83.6277L85.4276 18.2352H77.7242L81.6159 15.9767H86.6473L89.4548 10.7264H82.078C81.9147 10.7334 80.6221 10.8133 80.0835 11.7827L76.7096 18.0789C75.6776 20.0212 73.2662 21.5918 71.3273 21.5918H67.7136L73.433 10.9245Z\"/><path d=\"M119.546 7.36985H100.807L93.2213 21.5918H100.331L106.123 10.7264H112.568C112.568 10.7264 114.212 10.7264 113.5 12.0398L108.406 21.5918H115.515L121.203 10.9245C122.252 8.96126 121.509 7.36985 119.546 7.36985Z\"/><path d=\"M53.8183 12.839H62.0638L59.277 18.0789C58.2451 20.0212 55.8336 21.5918 53.8947 21.5918H35.5796L41.3129 10.9245C42.3657 8.96126 44.8154 7.36985 46.7786 7.36985H65.3404L59.496 10.7264H49.4228C49.4228 10.7264 48.5472 10.7229 48.092 11.5395L44.4957 18.2352H51.9628L53.1859 15.9767H48.4117L53.8183 12.839Z\"/></svg>" + '</a>' +
    '<nav class="links" aria-label="主選單">' +
      BIKES.map(function (c) { return '<a href="' + (c.href ? R(c.href) : '#') + '" class="top' + (CURRENT === c.k ? ' cur' : '') + '" data-top="' + c.k + '"' + (c.href ? '' : ' data-soft') + '>' + esc(c.t) + '</a>'; }).join('') +
      '<span class="sep" aria-hidden="true"></span>' +
      MORE.map(function (m) { return '<a href="' + (m.href ? R(m.href) : '#') + '" class="top aux' + (CURRENT === m.k ? ' cur' : '') + '" data-top="' + m.k + '"' + (m.href ? '' : ' data-soft') + '>' + esc(m.t) + '</a>'; }).join('') +
    '</nav>' +
    '<div class="icons">' +
      '<button type="button" class="icon-btn" aria-label="搜尋" title="搜尋">' + "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\"><circle cx=\"11\" cy=\"11\" r=\"6.5\"/><path d=\"M20 20l-4.2-4.2\"/></svg>" + '</button>' +
      "<button type=\"button\" class=\"icon-btn\" id=\"openFav\" aria-label=\"我的最愛\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linejoin=\"round\"><path d=\"M12 20.3S3.5 15.1 3.5 9.1A4.6 4.6 0 0 1 12 6.6a4.6 4.6 0 0 1 8.5 2.5c0 6-8.5 11.2-8.5 11.2z\"/></svg><span class=\"fav-n\" hidden>0</span></button>" +
      "<a href=\"#\" aria-label=\"購物車\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2.5 4h2.6l2.3 11.2a1.6 1.6 0 0 0 1.6 1.3h9.1a1.6 1.6 0 0 0 1.6-1.2L21.5 8H6\"/><circle cx=\"9.5\" cy=\"20\" r=\"1.2\"/><circle cx=\"18\" cy=\"20\" r=\"1.2\"/></svg></a>".replace('href="#"', 'href="' + esc(cartHref) + '"') +
      "<a href=\"#\" aria-label=\"會員\" title=\"David Robinson\" aria-haspopup=\"menu\" aria-expanded=\"false\"><span class=\"member-initial\">D</span></a>" +
      (host.dataset.ai === 'off' ? '' : "<span class=\"orb-wrap\">\n        <button class=\"orb-btn vbtn\" id=\"aiOrb\" type=\"button\" aria-label=\"GIANT 選車顧問\" title=\"GIANT 選車顧問｜依你的騎乘情境給建議\"><span class=\"beam-glow\"></span><span class=\"beam-ring\"></span><svg class=\"vmark\" viewBox=\"0 0 22 28\" fill=\"currentColor\" aria-hidden=\"true\"><path d=\"M7.28856 6.32744L10.7042 15.2261L10.7077 15.2227C10.7424 15.3165 10.8675 15.3443 10.9405 15.2748L18.081 8.48522C18.1922 8.38098 18.3694 8.49912 18.3138 8.64159L10.9161 27.9088C10.871 28.0304 10.6973 28.0304 10.6486 27.9088L0.0090577 0.194582C-0.0256893 0.100765 0.0438098 0 0.144576 0H21.4236C21.5244 0 21.5939 0.100765 21.5592 0.194582L19.3145 6.03903C19.2937 6.09462 19.2381 6.13285 19.179 6.13285H7.42408C7.32331 6.13285 7.25381 6.23362 7.28856 6.32744Z\"/></svg></button>\n        <div class=\"orb-callout\" id=\"orbCallout\" role=\"status\" hidden><i class=\"tip\"></i>\n          <p><b id=\"calloutTitle\"></b><span id=\"calloutText\"></span></p>\n          <div class=\"acts\"><button class=\"yes\" id=\"calloutYes\" type=\"button\">好，聊聊看</button><button class=\"no\" id=\"calloutNo\" type=\"button\">先自己逛</button></div>\n        </div>\n      </span>") +
    '</div>' +
    '<div class="dd-wrap">' + BIKES.map(bikePanel).join('') + gearPanel() + '</div>';

  /* 「#」的連結只做 hover，不跳頁（示範原則：不連官網） */
  host.addEventListener('click', function (e) { var a = e.target.closest('a[data-soft], a.soft'); if (a) e.preventDefault(); });

  /* ---------- 下拉：hover 停 120ms 才開、離開 160ms 才關；點擊也可切換（觸控） ---------- */
  var tops = host.querySelectorAll('.links .top'), panels = host.querySelectorAll('.dd'), tIn, tOut, cur = null;
  function open(k) {
    clearTimeout(tOut);
    if (!host.querySelector('.dd[data-dd="' + k + '"]')) { close(); return; }
    cur = k; host.classList.add('open'); host.dataset.open = k;
    panels.forEach(function (p) { p.hidden = p.dataset.dd !== k; });
    tops.forEach(function (a) { a.classList.toggle('on', a.dataset.top === k); });
  }
  function close() {
    cur = null; host.classList.remove('open'); delete host.dataset.open;
    panels.forEach(function (p) { p.hidden = true; });
    tops.forEach(function (a) { a.classList.remove('on'); });
  }
  tops.forEach(function (a) {
    a.addEventListener('mouseenter', function () { clearTimeout(tIn); clearTimeout(tOut); tIn = setTimeout(function () { open(a.dataset.top); }, cur ? 40 : 120); });
    a.addEventListener('mouseleave', function () { clearTimeout(tIn); });
    a.addEventListener('click', function (e) { if (matchMedia('(hover:none)').matches && host.querySelector('.dd[data-dd="' + a.dataset.top + '"]')) { e.preventDefault(); cur === a.dataset.top ? close() : open(a.dataset.top); } });
  });
  host.addEventListener('mouseleave', function () { clearTimeout(tIn); tOut = setTimeout(close, 160); });
  host.addEventListener('mouseenter', function () { clearTimeout(tOut); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  addEventListener('scroll', function () { if (cur) close(); }, {passive: true});

  /* ---------- 問顧問：頁面有定義 GiantHeaderAsk(cat, name) 就交給它（打開對話框、帶車種進去）；沒有就回首頁開顧問 ---------- */
  host.addEventListener('click', function (e) {
    var b = e.target.closest('[data-ask]'); if (!b) return;
    close();
    if (typeof window.GiantHeaderAsk === 'function') window.GiantHeaderAsk(b.dataset.ask, b.dataset.askName);
    else location.href = R('index.html') + '?ai=1&cat=' + b.dataset.ask;
  });

  window.GiantHeader = {open: open, close: close, nav: {bikes: BIKES, gear: GEAR, more: MORE}};

  /* ---------- 手機主選單（≤ 900px，header 加 data-mobile-nav 的頁面才有）：漢堡在最左、滿版展開。
     車系與精品配件都換到自己的一頁（車系頁上方放分類主視覺）；客製化、門市專區直接連。搜尋與會員留在 header，我的最愛收進會員選單。 ---------- */
  if (host.hasAttribute('data-mobile-nav')) (function () {
    var css = document.createElement('style');
    css.textContent =
      '.gn-toggle,.gn-panel,.gm-menu .gm-fav{display:none}' +
      '@media (max-width:900px){' +
        '#siteHeader .gn-toggle{display:grid;place-items:center;position:absolute;left:8px;top:10px;width:44px;height:44px;padding:0;border:0;background:none;color:inherit;cursor:pointer}' +
        '#siteHeader .gn-toggle svg{width:24px;height:24px}' +
        '#siteHeader .gn-toggle .x,#siteHeader.gn-open .gn-toggle .bars{display:none}#siteHeader.gn-open .gn-toggle .x{display:block}' +
        '#siteHeader #openFav{display:none!important}' +
        '#siteHeader.gn-open{background:#fff!important;color:#141A22!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;transform:none!important;box-shadow:inset 0 -1px 0 #DCE1E7}' +
        '.gn-panel:not([hidden]){display:block;position:fixed;left:0;right:0;top:64px;bottom:0;overflow:hidden;background:#fff;color:#141A22;font-family:"Inter","Noto Sans TC",-apple-system,"PingFang TC",sans-serif;text-align:left}' +
        '.gn-page{position:absolute;inset:0;overflow-y:auto;overscroll-behavior:contain;padding:8px 0 calc(32px + env(safe-area-inset-bottom));background:#fff;will-change:transform;backface-visibility:hidden;' +
          'transition:transform .5s cubic-bezier(.16,1,.3,1),opacity .5s cubic-bezier(.16,1,.3,1),visibility 0s linear .5s}' +
        '.gn-page:not([data-p=main]){transform:translate3d(100%,0,0);visibility:hidden}' +
        '.gn-panel.sub .gn-page[data-p=main]{transform:translate3d(-24%,0,0);opacity:0;visibility:hidden}' +
        '.gn-page.on,.gn-panel:not(.sub) .gn-page[data-p=main]{transform:none;opacity:1;visibility:visible;transition-delay:0s}' +
        '.gn-panel *{box-sizing:border-box}' +
        '.gn-row{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;min-height:48px;padding:0 16px;border:0;background:none;font:inherit;font-size:16px;font-weight:600;line-height:1.4;color:#141A22;text-align:left;text-decoration:none;cursor:pointer;list-style:none}' +
        '.gn-row[aria-current=page]{color:#1F4FE0}' +
        '.gn-row svg{flex:none;width:20px;height:20px;color:#4A5563}' +
        '.gn-back{justify-content:flex-start}.gn-back svg{order:-1}' +
        '.gn-kv{position:relative;display:block;margin:4px 16px 8px;aspect-ratio:16/9;border-radius:10px;overflow:hidden;background:#F3F5F7;color:#fff;text-decoration:none}' +
        '.gn-kv img{display:block;width:100%;height:100%;object-fit:cover}' +
        '.gn-kv span{position:absolute;left:0;right:0;bottom:0;padding:40px 16px 14px;background:linear-gradient(rgba(14,23,38,0),rgba(14,23,38,.62))}' +
        '.gn-kv b{display:block;font-size:16px;font-weight:700;line-height:1.4}.gn-kv small{display:flex;align-items:center;gap:6px;margin-top:2px;font-size:14px;line-height:1.5}.gn-kv small svg{width:16px;height:16px;color:inherit}' +
        '.gn-sub{padding:0 0 8px}' +
        '.gn-sub a{display:flex;align-items:center;min-height:44px;padding:0 16px;font-size:14px;line-height:1.5;color:#4A5563;text-decoration:none}' +
        '.gn-group{padding:8px 0 0}.gn-group h3{margin:0;padding:12px 16px 4px;font-size:14px;font-weight:700;color:#141A22}' +
        '.gn-row:focus-visible,.gn-sub a:focus-visible,.gn-kv:focus-visible,#siteHeader .gn-toggle:focus-visible{outline:3px solid #64748b;outline-offset:-3px}' +
        '.gm-menu .gm-fav{display:flex}' +
      '}' +
      'html.gn-lock,html.gn-lock body{overflow:hidden}' +
      '@media (prefers-reduced-motion:reduce){.gn-page{transition:none!important}}';
    document.head.appendChild(css);
    var I = function (d, c) { return '<svg' + (c ? ' class="' + c + '"' : '') + ' viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>'; };
    var ARR = I('M5 12h14M13 6l6 6-6 6'), RIGHT = I('m9 6 6 6-6 6'), LEFT = I('m15 6-6 6 6 6');
    var href = function (h) { return h ? R(h) : '#'; };
    var sub = function (item) { var t = Array.isArray(item) ? item[0] : item, h = Array.isArray(item) ? R(item[1]) : '#'; return '<a href="' + h + '"' + (h === '#' ? ' data-soft' : '') + '>' + esc(t) + '</a>'; };
    var stores = document.getElementById('stores') ? '#stores' : '#';
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'gn-toggle'; btn.setAttribute('aria-label', '開啟主選單'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'gnPanel');
    btn.innerHTML = I('M4 6h16M4 12h16M4 18h16', 'bars') + I('M6 6l12 12M18 6 6 18', 'x');
    var panel = document.createElement('nav');
    panel.className = 'gn-panel'; panel.id = 'gnPanel'; panel.setAttribute('aria-label', '主選單'); panel.hidden = true;
    panel.innerHTML =
      '<div class="gn-page" data-p="main">' +
        BIKES.map(function (c) { return '<button type="button" class="gn-row" data-go="' + c.k + '">' + esc(c.t) + RIGHT + '</button>'; }).join('') +
        '<button type="button" class="gn-row" data-go="gear">精品配件' + RIGHT + '</button>' +
        '<a class="gn-row" href="' + R('custom-studio/index.html') + '"' + (CURRENT === 'custom' ? ' aria-current="page"' : '') + '>客製化</a>' +
        '<a class="gn-row" href="' + stores + '"' + (stores === '#' ? ' data-soft' : '') + '>門市專區</a>' +
      '</div>' +
      BIKES.map(function (c) {   /* 車系頁：分類主視覺（同桌機下拉的大圖）＋子分類；圖片第一次打開選單才載入 */
        return '<div class="gn-page" data-p="' + c.k + '" aria-label="' + esc(c.t) + '">' +
          '<button type="button" class="gn-row gn-back" data-go="main">' + esc(c.t) + LEFT + '</button>' +
          '<a class="gn-kv" href="' + href(c.href) + '"' + (c.href ? '' : ' data-soft') + '><img data-src="' + R(c.img) + '" alt=""><span><b>' + esc(c.full) + '</b><small>看全部 ' + esc(c.en) + ARR + '</small></span></a>' +
          '<div class="gn-sub">' + c.sub.map(sub).join('') + '</div></div>';
      }).join('') +
      '<div class="gn-page" data-p="gear" aria-label="精品配件">' +
        '<button type="button" class="gn-row gn-back" data-go="main">精品配件' + LEFT + '</button>' +
        GEAR.map(function (g) { return '<div class="gn-group gn-sub"><h3>' + esc(g.t) + '</h3>' + g.sub.map(sub).join('') + '</div>'; }).join('') +
      '</div>';
    host.prepend(btn); host.append(panel);
    var mq = matchMedia('(max-width:900px)');
    /* 換頁只動 transform／opacity；焦點等滑完才移，避免動畫途中重排 */
    function page(p, kb) {
      var to = panel.querySelector('.gn-page[data-p="' + p + '"]');
      panel.querySelectorAll('.gn-page.on').forEach(function (x) { if (x !== to) x.classList.remove('on'); });
      if (p !== 'main') { to.scrollTop = 0; to.classList.add('on'); }
      panel.classList.toggle('sub', p !== 'main');
      if (kb) setTimeout(function () { var f = to.querySelector('.gn-row'); if (f && !panel.hidden) f.focus({preventScroll: true}); }, 500);   /* 鍵盤操作才移焦點 */
    }
    function set(on) {
      panel.hidden = !on; host.classList.toggle('gn-open', on); document.documentElement.classList.toggle('gn-lock', on);
      btn.setAttribute('aria-expanded', String(on)); btn.setAttribute('aria-label', on ? '關閉主選單' : '開啟主選單');
      if (on) {
        close(); panel.classList.remove('sub'); panel.querySelectorAll('.gn-page.on').forEach(function (x) { x.classList.remove('on'); });
        panel.querySelectorAll('img[data-src]').forEach(function (im) { im.src = im.dataset.src; im.removeAttribute('data-src'); });
      }
    }
    btn.addEventListener('click', function (e) { e.stopPropagation(); set(panel.hidden); });
    panel.addEventListener('click', function (e) {
      var g = e.target.closest('[data-go]'); if (g) { page(g.dataset.go, e.detail === 0); return; }
      var a = e.target.closest('a'); if (a && !a.hasAttribute('data-soft')) set(false);
    });
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { set(false); btn.focus(); } });
    var off = function () { if (!mq.matches && !panel.hidden) set(false); };
    mq.addEventListener ? mq.addEventListener('change', off) : mq.addListener(off);
  })();
  /* data-ai="tip"：這頁沒有對話框，但右上角一樣放顧問頭像；點了跳出說明卡（文案用 data-ai-title／data-ai-text） */
  if (host.dataset.ai === 'tip') {
    if (!document.querySelector('link[href*="advisor.css"]')) {
      var tcs = document.createElement('style'); tcs.textContent = "/* orb \u4e0b\u65b9\u7684\u4e3b\u52d5\u63d0\u793a\u5361 */\n.orb-callout{position:absolute;isolation:isolate;z-index:60;top:calc(100% + 14px);right:-12px;width:300px;padding:16px 18px 14px;border-radius:12px;background:#fff;border:1px solid var(--line);box-shadow:0 0 0 1px rgba(79,141,255,.18),0 0 18px rgba(79,141,255,.34),0 0 40px rgba(79,141,255,.22),0 18px 44px rgba(20,26,34,.18);text-align:left;opacity:0;transform:translateY(-6px);transition:opacity .35s var(--ease),transform .35s var(--ease)}\n.orb-callout.on{opacity:1;transform:none}\n.orb-callout[hidden]{display:none}\n.orb-callout .tip{position:absolute;z-index:3;right:22px;top:-6px;width:11px;height:11px;transform:rotate(45deg);background:#fff;border-left:1px solid var(--line);border-top:1px solid var(--line)}\n.orb-callout p{font-size:13.5px;line-height:1.75;color:var(--ink-70)}\n.orb-callout b{display:block;font-size:15px;color:var(--ink);margin-bottom:4px}\n/* \u63d0\u793a\u6846\u5916\u6846\u8dd1\u4e00\u689d\u85cd\u5149\uff08\u8207 header \u9867\u554f\u6309\u9215\u540c\u4e00\u5957 beam\uff09 */\n.orb-callout::after{content:\"\";position:absolute;z-index:1;inset:-1px;padding:1px;border-radius:inherit;pointer-events:none;\n  background:conic-gradient(from var(--beam-angle),transparent 0% 30%,rgba(79,141,255,.08) 45%,rgba(79,141,255,.35) 60%,rgba(120,180,255,.85) 70%,#BFE0FF 73%,rgba(120,180,255,.85) 76%,rgba(79,141,255,.35) 86%,rgba(79,141,255,.08) 100%);\n  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;\n  mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;\n  animation:beam-spin 4s linear infinite}\n.orb-callout p,.orb-callout .acts{position:relative;z-index:2}\n@media (prefers-reduced-motion:reduce){.orb-callout::after{animation:none}}\n/* \u300c\u597d\uff0c\u804a\u804a\u770b\u300d\u653e\u53f3\u908a */\n.orb-callout .acts{display:flex;gap:8px;margin-top:12px}\n.orb-callout .yes{order:2}\n.orb-callout .no{order:1;margin-right:auto}\n.orb-callout button{height:34px;padding:0 14px;border-radius:6px;font-size:13px;font-weight:700}\n.orb-callout .yes{background:var(--navy);color:#fff}\n.orb-callout .no{border:1px solid #C5CCD5;color:var(--ink-70)}\n" + "#aiOrb.tip-new::after{content:\"\";position:absolute;z-index:3;right:-2px;top:-2px;width:10px;height:10px;border-radius:50%;background:#1F4FE0;border:2px solid #fff;animation:tipDot 1.6s ease-in-out infinite}@keyframes tipDot{50%{transform:scale(1.25)}}.tip-extra ul{grid-column:1/-1;margin:0;padding:0;list-style:none;display:grid;gap:8px}.tip-extra li,.tip-extra a.tip-row{display:grid;grid-template-columns:1fr auto;align-items:baseline;column-gap:10px;row-gap:1px;text-align:left}.tip-extra a.tip-row{width:100%;padding:8px 12px;border:1px solid #DCE1E7;border-radius:8px;background:#fff;grid-template-rows:none}.tip-extra a.tip-row:hover{border-color:#141A22;transform:none}.tip-extra a.tip-row>*{justify-self:start;text-align:left;margin:0}.tip-extra a.tip-row>span{justify-self:end}.tip-extra li b{font-size:13.5px;color:#141A22;font-weight:800;margin:0}.tip-extra li span{font-size:12.5px;color:#4A5563;font-weight:600;white-space:nowrap}.tip-extra li small{grid-column:1/-1;font-size:12.5px;color:#667080;line-height:1.55}.tip-extra .tip-note{grid-column:1/-1;margin:2px 0 0;font-size:12px;color:#667080;line-height:1.6}.orb-callout.has-extra{width:356px}.tip-extra{position:relative;z-index:2;margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:8px}.tip-extra:empty{display:none}.tip-extra a{display:grid;grid-template-rows:auto auto auto;padding:8px 10px 10px;border:1px solid var(--line,#DCE1E7);border-radius:10px;background:#fff;text-decoration:none;color:inherit;transition:border-color .2s,transform .2s}.tip-extra a:hover{border-color:#141A22;transform:translateY(-1px)}.tip-extra img{width:100%;height:58px;object-fit:contain}.tip-extra b{margin-top:4px;font-size:13px;font-weight:800;letter-spacing:.02em;color:#141A22}.tip-extra small{font-size:11.5px;color:#667080}.orb-callout .tip-link{align-self:center;margin-right:auto;font-size:13px;font-weight:700;color:#4A5563;text-decoration:underline;text-underline-offset:3px;height:auto;padding:0}.orb-callout .tip-link:hover{color:#141A22}.orb-callout .tip-link[hidden]{display:none}"; document.head.appendChild(tcs);
    }
    var torb = document.getElementById('aiOrb'), tco = document.getElementById('orbCallout');
    var tshow = function () {
      /* 內容依頁面目前的狀態：window.GiantTipContent() 回傳 {title, text, html, link}（例如客製化頁依步驟換）；沒有就用 data-ai-title／data-ai-text */
      var c = typeof window.GiantTipContent === 'function' ? window.GiantTipContent() : null;
      document.getElementById('calloutTitle').textContent = c && c.title || host.dataset.aiTitle || 'GIANT 選車顧問';
      document.getElementById('calloutText').innerHTML = c && c.text || host.dataset.aiText || '';   // 文案可以帶 <span> 避免斷字
      /* 頁面有顧問對話（window.GiantChat）時：「先自己逛／好，聊聊看」；沒有就只有「知道了」 */
      var chat = !!window.GiantChat;
      document.getElementById('calloutYes').textContent = chat ? '好，聊聊看' : '知道了';
      document.getElementById('calloutNo').textContent = '先自己逛';
      document.getElementById('calloutNo').style.display = chat ? '' : 'none';
      document.getElementById('calloutYes').style.marginLeft = chat ? '' : 'auto';
      torb.classList.remove('tip-new');
      /* 頁面可以加入口：window.GiantTipExtra() 回傳 {html, link:{t, href}}，html 放在文案下方、link 放在按鈕左邊 */
      var ex = tco.querySelector('.tip-extra'), lk = tco.querySelector('.tip-link'), x = c ? c : typeof window.GiantTipExtra === 'function' ? window.GiantTipExtra() : null;
      if (!ex) { ex = document.createElement('div'); ex.className = 'tip-extra'; tco.querySelector('.acts').before(ex); }
      if (!lk) { lk = document.createElement('a'); lk.className = 'tip-link'; tco.querySelector('.acts').prepend(lk); }
      ex.innerHTML = x && x.html || ''; tco.classList.toggle('has-extra', !!(x && x.html));
      if (x && x.link) { lk.textContent = x.link.t; lk.href = x.link.href; lk.hidden = false; } else lk.hidden = true;
      tco.hidden = false; requestAnimationFrame(function () { tco.classList.add('on'); });
    };
    var thide = function () { tco.classList.remove('on'); setTimeout(function () { tco.hidden = true; }, 350); };
    document.getElementById('calloutNo').style.display = 'none'; document.getElementById('calloutYes').style.marginLeft = 'auto';
    document.getElementById('calloutYes').onclick = function () { thide(); if (window.GiantChat) window.GiantChat.open(); };
    document.getElementById('calloutNo').onclick = function () { thide(); if (window.GiantChat) window.GiantChat.quiet(); };
    /* 有顧問對話的頁面：點頭像直接開關對話框（跟首頁一樣）；沒有的頁面：開關說明卡 */
    torb.onclick = function () { if (window.GiantChat) { thide(); window.GiantChat.toggle(); } else tco.hidden ? tshow() : thide(); };
    /* 頁面內容換了（例如換到下一步）：頭像上亮一個小藍點，提示這裡有這一步的說明；說明卡開著就直接更新 */
    window.GiantTip = {ping: function () { if (window.GiantChat && window.GiantChat.contextChanged && window.GiantChat.contextChanged()) return; if (!tco.hidden) tshow(); else torb.classList.add('tip-new'); }, show: tshow, hide: thide};
    document.addEventListener('click', function (e) { if (!tco.hidden && !e.target.closest('.orb-wrap')) thide(); });
  }
  /* 全站 header 行為跟首頁一樣：固定在最上方，往下捲 40px 後加上霧面底色與底線（.scrolled，樣式在 header.css） */
  var navTone = function () { host.classList.toggle('scrolled', scrollY > 40); };
  addEventListener('scroll', navTone, {passive: true}); navTone();
  /* 全站購物車（右側抽屜＋右上角件數），每一頁都載入 */
  if (!document.querySelector('script[src*="js/cart.js"]')) {
    var cs = document.createElement('script'); cs.src = ROOT + 'js/cart.js?v=ds1103b'; document.head.appendChild(cs);
  }
  /* 會員選單：點右上角 D 打開（客製編輯頁有自己的會員選單，會把這顆換成 #openMember，這裡就不處理）。只放點了有作用的項目 */
  (function () {
    var css = document.createElement('style');
    css.textContent = '.gm-menu{position:fixed;z-index:70;width:290px;padding:6px;border-radius:12px;background:#fff;border:1px solid #DCE1E7;box-shadow:0 18px 40px rgba(20,26,34,.14);font-family:"Inter","Noto Sans TC",-apple-system,"PingFang TC",sans-serif;color:#141A22;text-align:left;opacity:0;transform:translateY(-6px);transition:opacity .2s,transform .2s}' +
      '.gm-menu.on{opacity:1;transform:none}.gm-menu[hidden]{display:none}' +
      '.gm-head{display:flex;align-items:center;gap:12px;padding:12px 12px 14px;border-bottom:1px solid #DCE1E7;margin-bottom:4px}.gm-head .member-initial{flex:none;width:44px;height:44px;border-radius:50%;background:#0E1726;color:#fff;display:grid;place-items:center;font-size:17px;font-weight:700;box-shadow:none}.gm-head strong{display:block;font-size:15px}.gm-head small{display:block;margin-top:2px;font-size:12.5px;color:#667080}' +
      '.gm-menu button,.gm-menu a.gm-row{display:flex;align-items:center;gap:10px;width:100%;padding:12px;border:0;border-radius:8px;background:none;font:inherit;font-size:14px;color:#141A22;text-align:left;text-decoration:none;cursor:pointer}' +
      '.gm-menu button:hover,.gm-menu a.gm-row:hover,.gm-menu button:focus-visible,.gm-menu a.gm-row:focus-visible{background:#F3F5F7;outline:none}' +
      '.gm-menu svg{width:20px;height:20px;flex:none;color:#4A5563}' +
      '.gm-sec{padding:10px 12px 8px;border-top:1px solid #DCE1E7;margin-top:4px}.gm-sec b{display:block;font-size:12.5px;color:#667080;font-weight:600;margin-bottom:6px}' +
      '.gm-sec{padding:10px 6px 4px}.gm-sec b{padding:0 6px}.gm-order{display:flex;align-items:center;gap:8px;margin:0;padding:8px 6px;border-radius:8px;font-size:13px;line-height:1.5;color:#4A5563;text-decoration:none}.gm-order:hover,.gm-order:focus-visible{background:#F3F5F7;outline:none}.gm-order span{flex:1;min-width:0}.gm-menu .gm-chev{width:16px;height:16px;color:#667080}.gm-empty{padding:0 6px 6px}.gm-order strong{display:block;font-size:13.5px;color:#141A22;font-variant-numeric:tabular-nums}.gm-empty{font-size:13px;color:#667080}' +
      '@media (prefers-reduced-motion:reduce){.gm-menu{transition:none}}';
    document.head.appendChild(css);
    var I = function (d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; };
    var IC = {bike: I('<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-8h5l3 8M10 8l2.5 8H6M14 6h3"/>'), heart: I('<path d="M12 20.3S3.5 15.1 3.5 9.1A4.6 4.6 0 0 1 12 6.6a4.6 4.6 0 0 1 8.5 2.5c0 6-8.5 11.2-8.5 11.2z"/>')};
    var CHEV = '<svg class="gm-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
    var menu = null;
    var read = function (k) { try { return JSON.parse(localStorage.getItem(k)) || []; } catch (e) { return []; } };
    var esc = function (v) { return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]; }); };
    function render() {
      var orders = read('giant-orders').slice(0, 3);
      menu.innerHTML = '<div class="gm-head"><span class="member-initial">D</span><div><strong>David Robinson</strong><small>GIANT 會員</small></div></div>' +
        (document.getElementById('openFav') ? '<button type="button" class="gm-fav" role="menuitem" data-fav>' + IC.heart + '<span>我的最愛</span></button>' : '') +   /* 手機上 header 的愛心收進這裡 */
        '<a class="gm-row" role="menuitem" href="' + ROOT + '../customized.html#favorites">' + IC.bike + '<span>已儲存的客製車</span></a>' +
        '<div class="gm-sec"><b>最近的訂單與預約</b>' + (orders.length ? orders.map(function (o) {
          return '<a class="gm-order" role="menuitem" href="' + ROOT + 'checkout.html?order=' + encodeURIComponent(o.no) + '"><span><strong>' + esc(o.no) + (o.custom ? '・客製車預約' : '') + '</strong>' + esc([o.date ? o.date.slice(5).replace('-', '/') + ' ' + (o.slot || '') : o.way === 'home' ? '宅配' : '', o.total ? 'NT$ ' + Math.round(o.total).toLocaleString('en-US') : ''].filter(Boolean).join('・')) + '</span>' + CHEV + '</a>'; }).join('') : '<div class="gm-empty">還沒有訂單或預約。</div>') + '</div>';
    }
    function place(a) { var r = a.getBoundingClientRect(); menu.style.top = Math.round(r.bottom + 12) + 'px'; menu.style.right = Math.max(12, Math.round(innerWidth - r.right - 60)) + 'px'; }
    function open(a) {
      if (!menu) { menu = document.createElement('div'); menu.className = 'gm-menu'; menu.setAttribute('role', 'menu'); menu.setAttribute('aria-label', '會員選單'); menu.hidden = true; document.body.appendChild(menu); }
      render(); place(a); menu.hidden = false; a.setAttribute('aria-expanded', 'true');
      requestAnimationFrame(function () { menu.classList.add('on'); });
    }
    function close() { if (!menu || menu.hidden) return; menu.classList.remove('on'); var a = document.querySelector('#siteHeader a[aria-label="會員"]'); if (a) a.setAttribute('aria-expanded', 'false'); setTimeout(function () { if (!menu.classList.contains('on')) menu.hidden = true; }, 200); }
    document.addEventListener('click', function (e) {
      var a = e.target.closest('#siteHeader a[aria-label="會員"]');
      if (a) { e.preventDefault(); menu && !menu.hidden ? close() : open(a); return; }
      if (e.target.closest('.gm-menu [data-fav]')) { close(); document.getElementById('openFav').click(); return; }
      if (menu && !menu.hidden && !e.target.closest('.gm-menu')) close();
    });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    addEventListener('scroll', function () { var a = document.querySelector('#siteHeader a[aria-label="會員"]'); if (menu && !menu.hidden && a) place(a); }, {passive: true});
  })();
  /* 顧問角色頭像（眨眼、看游標、換表情）；ai 關掉的頁面不載入 */
  if (host.dataset.ai !== 'off' && !document.querySelector('script[src*="buddy.js"]')) {
    var bs = document.createElement('script'); bs.src = ROOT + 'js/buddy.js?v=16'; document.head.appendChild(bs);
  }
})();
