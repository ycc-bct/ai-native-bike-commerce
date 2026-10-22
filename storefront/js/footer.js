/* 全站 footer（storefront 共用）
   用法：頁面最後放一個空的 <footer class="foot" id="siteFooter"></footer>，緊接著 <script src="js/footer.js"></script>，
   並在 <head> 引用 css/footer.css。欄位文字與連結集中在下面的 COLS；路徑以這支腳本所在的 storefront 根目錄為準。
   連結只接我們做過的頁，其餘是 "#"（hover 有效果、不跳頁）。說明見 storefront/docs/header.md。 */
(function () {
  var script = document.currentScript || document.querySelector('script[src*="footer.js"]');
  var ROOT = script ? script.src.replace(/js\/footer\.js.*$/, '') : '';
  var host = document.getElementById('siteFooter') || document.querySelector('footer.foot:empty');
  if (!host) return;
  var R = function (p) { return /^(https?:)?\/\//.test(p) ? p : ROOT + p; };
  var COLS = [
    {t: '車款',     items: ['公路自行車', '登山車', ['越野 & 礫石公路', 'gravel.html'], 'E-Bike 電動輔助自行車', '童車 & 青少年車', ['客製化自行車', '../customized.html#series']]},
    {t: '精品配件', items: ['人身商品', '車身商品', '維修商品', '自行車零件']},
    {t: '探索',     items: [['情境式問卷', 'ride.html'], '最新消息', '活動賽事', '贊助車隊與選手', '關於 Giant']},
    {t: '支援',     items: ['門市專區', '客服中心', '保固聲明', '常見問題', '產品使用說明書']}
  ];
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[c]; }); };
  var link = function (it) { var t = Array.isArray(it) ? it[0] : it, h = Array.isArray(it) ? R(it[1]) : '#'; return '<a href="' + h + '"' + (h === '#' ? ' data-soft' : '') + '>' + esc(t) + '</a>'; };
  host.innerHTML =
    '<div class="foot-in">' +
      '<div class="foot-brand">' + "<svg viewBox=\"35 6 113 16\" fill=\"currentColor\" aria-hidden=\"true\"><path d=\"M124.059 7.36985H147.59L141.381 10.9245H135.512L129.796 21.5918H122.687L128.403 10.9245H122.155L124.059 7.36985Z\"/><path d=\"M66.9978 7.36985L59.3743 21.5918H65.8164L73.4399 7.36985H66.9978Z\"/><path d=\"M73.433 10.9245C74.4858 8.96126 76.932 7.36985 78.8952 7.36985H98.8574L91.2304 21.5918H83.6277L85.4276 18.2352H77.7242L81.6159 15.9767H86.6473L89.4548 10.7264H82.078C81.9147 10.7334 80.6221 10.8133 80.0835 11.7827L76.7096 18.0789C75.6776 20.0212 73.2662 21.5918 71.3273 21.5918H67.7136L73.433 10.9245Z\"/><path d=\"M119.546 7.36985H100.807L93.2213 21.5918H100.331L106.123 10.7264H112.568C112.568 10.7264 114.212 10.7264 113.5 12.0398L108.406 21.5918H115.515L121.203 10.9245C122.252 8.96126 121.509 7.36985 119.546 7.36985Z\"/><path d=\"M53.8183 12.839H62.0638L59.277 18.0789C58.2451 20.0212 55.8336 21.5918 53.8947 21.5918H35.5796L41.3129 10.9245C42.3657 8.96126 44.8154 7.36985 46.7786 7.36985H65.3404L59.496 10.7264H49.4228C49.4228 10.7264 48.5472 10.7229 48.092 11.5395L44.4957 18.2352H51.9628L53.1859 15.9767H48.4117L53.8183 12.839Z\"/></svg>" + '<p>Ride Life. Ride Giant.</p></div>' +
      COLS.map(function (c) { return '<div class="foot-col"><b>' + esc(c.t) + '</b>' + c.items.map(link).join('') + '</div>'; }).join('') +
      '<div class="foot-sub"><b>訂閱最新消息</b>' + "<form class=\"sub-form\" onsubmit=\"return false\"><input type=\"email\" placeholder=\"輸入你的 Email\" aria-label=\"Email\"><button type=\"submit\" aria-label=\"訂閱\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12h14M13 6l6 6-6 6\"/></svg></button></form>" + "<div class=\"social\">\n        <a href=\"#\" aria-label=\"Instagram\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"5\"/><circle cx=\"12\" cy=\"12\" r=\"4\"/><circle cx=\"17.3\" cy=\"6.7\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/></svg></a>\n        <a href=\"#\" aria-label=\"Facebook\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linejoin=\"round\"><path d=\"M14 8h2.5V4.5H14A3.5 3.5 0 0 0 10.5 8v2.5H8V14h2.5v6H14v-6h2.5l.5-3.5h-3V8.5c0-.3.2-.5.5-.5z\"/></svg></a>\n        <a href=\"#\" aria-label=\"YouTube\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linejoin=\"round\"><path d=\"M3 8.5C3 6.6 4.6 5 6.5 5h11C19.4 5 21 6.6 21 8.5v7c0 1.9-1.6 3.5-3.5 3.5h-11C4.6 19 3 17.4 3 15.5z\"/><path d=\"M10 9l5 3-5 3z\" fill=\"currentColor\" stroke=\"none\"/></svg></a>\n      </div>" + '</div>' +
    '</div>' +
    '<div class="foot-bar">' +
      '<span>© ' + new Date().getFullYear() + ' Giant Manufacturing Co., Ltd. All rights reserved.</span>' +
      '<span class="legal"><a href="#" data-soft>隱私權政策</a><a href="#" data-soft>使用條款</a><a href="#" data-soft>Cookie 設定</a></span>' +
      '<span class="region">Taiwan（繁體中文）</span>' +
    '</div>';
  host.addEventListener('click', function (e) { var a = e.target.closest('a[data-soft]'); if (a) e.preventDefault(); });
  window.GiantFooter = {cols: COLS};
})();
