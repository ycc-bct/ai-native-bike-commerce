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
    {k: 'stores', t: '門市專區', href: '#'}
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
      "<a href=\"#\" aria-label=\"會員\" title=\"David Robinson\"><span class=\"member-initial\">D</span></a>" +
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
  /* data-ai="tip"：這頁沒有對話框，但右上角一樣放顧問頭像；點了跳出說明卡（文案用 data-ai-title／data-ai-text） */
  if (host.dataset.ai === 'tip') {
    if (!document.querySelector('link[href*="advisor.css"]')) {
      var tcs = document.createElement('style'); tcs.textContent = "/* orb \u4e0b\u65b9\u7684\u4e3b\u52d5\u63d0\u793a\u5361 */\n.orb-callout{position:absolute;isolation:isolate;z-index:60;top:calc(100% + 14px);right:-12px;width:300px;padding:16px 18px 14px;border-radius:12px;background:#fff;border:1px solid var(--line);box-shadow:0 0 0 1px rgba(79,141,255,.18),0 0 18px rgba(79,141,255,.34),0 0 40px rgba(79,141,255,.22),0 18px 44px rgba(20,26,34,.18);text-align:left;opacity:0;transform:translateY(-6px);transition:opacity .35s var(--ease),transform .35s var(--ease)}\n.orb-callout.on{opacity:1;transform:none}\n.orb-callout[hidden]{display:none}\n.orb-callout .tip{position:absolute;z-index:3;right:22px;top:-6px;width:11px;height:11px;transform:rotate(45deg);background:#fff;border-left:1px solid var(--line);border-top:1px solid var(--line)}\n.orb-callout p{font-size:13.5px;line-height:1.75;color:var(--ink-70)}\n.orb-callout b{display:block;font-size:15px;color:var(--ink);margin-bottom:4px}\n/* \u63d0\u793a\u6846\u5916\u6846\u8dd1\u4e00\u689d\u85cd\u5149\uff08\u8207 header \u9867\u554f\u6309\u9215\u540c\u4e00\u5957 beam\uff09 */\n.orb-callout::after{content:\"\";position:absolute;z-index:1;inset:-1px;padding:1px;border-radius:inherit;pointer-events:none;\n  background:conic-gradient(from var(--beam-angle),transparent 0% 30%,rgba(79,141,255,.08) 45%,rgba(79,141,255,.35) 60%,rgba(120,180,255,.85) 70%,#BFE0FF 73%,rgba(120,180,255,.85) 76%,rgba(79,141,255,.35) 86%,rgba(79,141,255,.08) 100%);\n  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;\n  mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;\n  animation:beam-spin 4s linear infinite}\n.orb-callout p,.orb-callout .acts{position:relative;z-index:2}\n@media (prefers-reduced-motion:reduce){.orb-callout::after{animation:none}}\n/* \u300c\u597d\uff0c\u804a\u804a\u770b\u300d\u653e\u53f3\u908a */\n.orb-callout .acts{display:flex;gap:8px;margin-top:12px}\n.orb-callout .yes{order:2}\n.orb-callout .no{order:1;margin-right:auto}\n.orb-callout button{height:34px;padding:0 14px;border-radius:6px;font-size:13px;font-weight:700}\n.orb-callout .yes{background:var(--navy);color:#fff}\n.orb-callout .no{border:1px solid #C5CCD5;color:var(--ink-70)}\n"; document.head.appendChild(tcs);
    }
    var torb = document.getElementById('aiOrb'), tco = document.getElementById('orbCallout');
    var tshow = function () {
      document.getElementById('calloutTitle').textContent = host.dataset.aiTitle || 'GIANT 選車顧問';
      document.getElementById('calloutText').textContent = host.dataset.aiText || '';
      document.getElementById('calloutYes').textContent = '知道了';
      tco.hidden = false; requestAnimationFrame(function () { tco.classList.add('on'); });
    };
    var thide = function () { tco.classList.remove('on'); setTimeout(function () { tco.hidden = true; }, 350); };
    document.getElementById('calloutNo').style.display = 'none'; document.getElementById('calloutYes').style.marginLeft = 'auto';
    document.getElementById('calloutYes').onclick = thide;
    torb.onclick = function () { tco.hidden ? tshow() : thide(); };
    document.addEventListener('click', function (e) { if (!tco.hidden && !e.target.closest('.orb-wrap')) thide(); });
  }
  /* 顧問角色頭像（眨眼、看游標、換表情）；ai 關掉的頁面不載入 */
  if (host.dataset.ai !== 'off' && !document.querySelector('script[src*="buddy.js"]')) {
    var bs = document.createElement('script'); bs.src = ROOT + 'js/buddy.js?v=9'; document.head.appendChild(bs);
  }
})();
