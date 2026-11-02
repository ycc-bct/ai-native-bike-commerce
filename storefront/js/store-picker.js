/* 全站共用的門市選擇器：真實街道地圖（MapLibre＋OpenFreeMap，免金鑰）＋搜尋＋地區篩選＋「離我最近」，地圖和清單連動。
   樣式跟客製化介紹頁的「客製化自行車服務門市」一樣；資料是 custom-studio/stores.json（全台 130 間服務門市）。

   const p = GiantStorePicker.mount(el, {
     mode: 'select' | 'browse',   // select：可以選一間（結帳、試騎預約）；browse：只瀏覽
     layout: 'auto' | 'side' | 'stack',   // side：左地圖右清單；stack：地圖在上、清單在下；auto（預設）：依寬度自動
     selected: '18998',           // 預設選取的門市 id
     tags: {'18998': '上次來過'},  // 門市名稱旁的小標籤
     onSelect: store => {}        // 選了某間門市（store = {id, name, addr, tel, region, lat, lng}）
   });
   p.select(id) / p.selected() / p.resize() / p.el（同一個元素可以搬到別的位置，地圖不用重建）

   地圖載不到（離線、file://、不支援 WebGL）就只顯示清單，功能照常。 */
(function () {
  var script = document.currentScript || document.querySelector('script[src*="store-picker.js"]');
  var ROOT = script ? script.src.replace(/js\/store-picker\.js.*$/, '') : '';
  var GL_JS = 'https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.js', GL_CSS = 'https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.css';
  var GL_STYLE = 'https://tiles.openfreemap.org/styles/positron';
  var REGIONS = ['全部', '北部', '中部', '南部', '東部', '離島'];
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]; }); };
  var norm = function (s) { return String(s).replace(/臺/g, '台').replace(/\s+/g, '').toLowerCase(); };
  var street = function (s) { return String(s.addr || '').replace(/^\d+\s*/, ''); };
  var reduced = function () { return matchMedia('(prefers-reduced-motion: reduce)').matches; };
  var km = function (a, b) { var R = 6371, r = Math.PI / 180, dLa = (b.lat - a.lat) * r, dLn = (b.lng - a.lng) * r, x = Math.sin(dLa / 2) * Math.sin(dLa / 2) + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLn / 2) * Math.sin(dLn / 2); return 2 * R * Math.asin(Math.sqrt(x)); };
  var ICON = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    near: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>'
  };

  var css = document.createElement('style');
  css.textContent = [
    '.sp{--sp-ink:#141A22;--sp-ink70:#4A5563;--sp-ink50:#7A8492;--sp-line:#DCE1E7;--sp-ai:#1F4FE0;--sp-navy:#0E1726;display:grid;gap:16px;font-family:inherit;color:var(--sp-ink)}',
    '.sp *{box-sizing:border-box}.sp button{font-family:inherit;line-height:1.2;color:inherit;cursor:pointer}',
    '.sp-side{grid-template-columns:minmax(0,1fr) minmax(0,1fr);height:var(--sp-h,480px)}',
    '.sp-stack{grid-template-columns:1fr}',
    '.sp-map{position:relative;min-height:0;border-radius:16px;overflow:hidden;background:#EEF1F4}',
    '.sp-stack .sp-map{height:var(--sp-map-h,220px)}',
    '.sp.sp-nomap{grid-template-columns:1fr;height:auto}.sp.sp-nomap .sp-map{display:none}',
    '.sp-map .sp-gl{position:absolute;inset:0;opacity:0;transition:opacity .5s ease}.sp-map.on .sp-gl{opacity:1}',
    '.sp-wait{position:absolute;inset:0;display:grid;place-items:center;font-size:13px;color:var(--sp-ink50)}.sp-map.on .sp-wait{display:none}',
    '.sp-gl .maplibregl-canvas{outline:none}.sp-gl .maplibregl-ctrl-attrib{font-size:10.5px;background:rgba(255,255,255,.8)}.sp-gl .maplibregl-ctrl-bottom-left{margin:0 0 6px 6px}',
    '.sp-zoom{position:absolute;right:12px;bottom:12px;z-index:4;display:flex;flex-direction:column;border-radius:12px;background:#fff;box-shadow:0 1px 2px rgba(20,26,34,.06),0 6px 18px rgba(20,26,34,.1);overflow:hidden}',
    '.sp-zoom button{display:grid;place-items:center;width:36px;height:36px;border:0;background:none}.sp-zoom button+button{border-top:1px solid #E6E9EE}.sp-zoom button:hover:not(:disabled){background:#F3F5F7}.sp-zoom button:disabled{color:#C3CAD3;cursor:default}.sp-zoom svg{width:16px;height:16px}',
    '.sp-mk{position:relative;width:20px;height:20px}.sp-mk i{position:absolute;inset:0;border-radius:50%;background:var(--sp-ai);border:3px solid #fff;box-shadow:0 2px 8px rgba(31,79,224,.35)}',
    '.sp-mk::before{content:"";position:absolute;inset:0;border-radius:50%;background:var(--sp-ai);opacity:0;animation:sp-pulse 1.8s ease-out .6s infinite}',
    '.sp-mk-tag{position:absolute;left:50%;bottom:calc(100% + 10px);transform:translateX(-50%);padding:7px 12px 8px;border-radius:12px;background:#fff;box-shadow:0 1px 2px rgba(20,26,34,.06),0 8px 22px rgba(20,26,34,.12);white-space:nowrap;pointer-events:none;opacity:0;animation:sp-tag .3s ease .6s forwards}',
    '.sp-mk-tag b{display:block;font-size:13.5px;font-weight:700}.sp-mk-tag span{display:block;margin-top:2px;font-size:12px;color:var(--sp-ink50)}',
    '.sp-me{width:16px;height:16px;border-radius:50%;background:#14B8A6;border:3px solid #fff;box-shadow:0 0 0 6px rgba(20,184,166,.18)}',
    '@keyframes sp-pulse{0%{opacity:.35;transform:scale(1)}100%{opacity:0;transform:scale(3.2)}}@keyframes sp-tag{from{opacity:0;transform:translate(-50%,4px)}to{opacity:1;transform:translateX(-50%)}}',
    '.sp-list{display:flex;flex-direction:column;min-height:0;padding:18px 18px 6px;border:1px solid var(--sp-line);border-radius:16px;background:#fff}',
    '.sp-tools{display:flex;gap:8px;flex:none}',
    '.sp-q{flex:1;min-width:0;display:flex;align-items:center;gap:10px;height:44px;padding:0 16px;border:1px solid #C9D0D8;border-radius:999px;font-size:14.5px;font-weight:600}.sp-q:focus-within{border-color:var(--sp-ink)}',
    '.sp-q svg{flex:none;width:17px;height:17px;color:var(--sp-ink70)}.sp-q input{flex:1;min-width:0;height:100%;border:0;outline:0;background:none;font:inherit;color:var(--sp-ink)}.sp-q input::placeholder{color:#9AA4B0;font-weight:500}',
    '.sp-near{flex:none;display:inline-flex;align-items:center;gap:6px;height:44px;padding:0 14px;border:1px solid #C9D0D8;border-radius:999px;background:#fff;font-size:13.5px;font-weight:700;white-space:nowrap}.sp-near svg{width:16px;height:16px}.sp-near:hover{border-color:var(--sp-ink)}',
    '.sp-near.on{background:#E6F6F4;border-color:#14B8A6;color:#0F766E}.sp-near[aria-busy=true]{opacity:.6;cursor:wait}',
    '.sp-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;flex:none}',
    '.sp-chip{height:34px;padding:0 13px;border:1px solid var(--sp-line);border-radius:999px;background:#fff;font-size:13px;font-weight:600;color:var(--sp-ink70);font-variant-numeric:tabular-nums;transition:background .2s,color .2s,border-color .2s}',
    '.sp-chip:hover:not(.on){border-color:var(--sp-ink)}.sp-chip.on{background:var(--sp-navy);border-color:var(--sp-navy);color:#fff}',
    '.sp-cnt{flex:none;margin:12px 0 0;font-size:12.5px;font-weight:700;color:var(--sp-ink70)}.sp-cnt:empty{display:none}',
    '.sp-list ul{flex:1;min-height:0;overflow-y:auto;list-style:none;margin:6px 0 0;padding:0 4px 0 0;scrollbar-width:thin;scrollbar-color:#C9D0D8 transparent}',
    '.sp-stack .sp-list ul{max-height:var(--sp-list-h,300px)}',
    '.sp-list li{display:flex;align-items:center;gap:12px;margin:0 -8px;padding:12px 8px;border-top:1px solid var(--sp-line);border-radius:10px;cursor:pointer;transition:background .2s}',
    '.sp-list li:first-child{border-top-color:transparent}.sp-list li.hl{background:#F3F5F7}.sp-list li.sel{background:#EEF3FF}.sp-list li.sel b{color:var(--sp-ai)}',
    '.sp-list li:focus-visible{outline:2px solid var(--sp-ai);outline-offset:-2px}',
    '.sp-radio{flex:none;width:18px;height:18px;border-radius:50%;border:1.5px solid #9AA4B0;background:#fff}.sp-list li.sel .sp-radio{border:5px solid var(--sp-navy)}',
    '.sp-browse .sp-radio{display:none}',
    '.sp-txt{flex:1;min-width:0}.sp-txt b{display:block;font-size:14.5px;font-weight:700}.sp-txt span{display:block;margin-top:3px;font-size:12.5px;color:var(--sp-ink70);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.sp-tag{display:inline-block;margin-left:8px;padding:1px 8px;border-radius:999px;background:#FFF4E5;color:#B45309;font-size:11.5px;font-weight:700;vertical-align:2px}',
    '.sp-end{flex:none;text-align:right;font-size:13px;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap}.sp-end small{display:block;margin-top:3px;font-size:12px;font-weight:600;color:#0F766E}',
    '.sp-end a{color:var(--sp-ink);text-decoration:none}.sp-end a:hover{text-decoration:underline}',
    '.sp-empty{display:block!important;padding:28px 0!important;text-align:center;color:var(--sp-ink50);font-size:14px;border-top:0!important;cursor:default!important}',
    '.sp-picked{grid-column:1/-1;margin:0;padding:12px 16px;border-radius:12px;background:#F3F5F7;font-size:13.5px;line-height:1.6;color:var(--sp-ink70)}.sp-picked b{color:var(--sp-ink)}.sp-picked:empty{display:none}',
    '.sp-msg{flex:none;margin:8px 0 0;font-size:12.5px;color:#B23932}.sp-msg:empty{display:none}',
    '@media(max-width:760px){.sp-side{grid-template-columns:1fr;height:auto}.sp-side .sp-map{height:240px}.sp-side .sp-list ul{max-height:320px}}',
    '@media(prefers-reduced-motion:reduce){.sp-mk::before{animation:none}.sp-mk-tag{animation:none;opacity:1}}'
  ].join('');
  document.head.appendChild(css);

  var dataP = null;
  // Offline snapshot generated from custom-studio/stores.json; refresh together with that file.
  var STORE_SNAPSHOT = [{"id":"17761","lat":23.56848494,"lng":119.5680729,"name":"新賽風腳踏車行","addr":"880 澎湖縣馬公市光復路33之29號","city":"880 澎湖縣馬公市, tw","tel":"06-9275769","region":"離島"},{"id":"21300","lat":23.04125232,"lng":120.19822754,"name":"堉峯單車戶外休閒館","addr":"709 台南市安南區安中路一段613號一樓","city":"709 臺南市安南區, tw","tel":"0908-815672","region":"南部"},{"id":"18992","lat":22.98226,"lng":120.18625,"name":"台南店","addr":"702 台南市南區健康路二段416號","city":"702 臺南市南區, tw","tel":"06-2638597","region":"南部"},{"id":"17813","lat":22.990461,"lng":120.20025159,"name":"元章自行車行","addr":"700 台南市中西區福安里永福路2段11號之1","city":"700 臺南市中西區, tw","tel":"06-2280089","region":"南部"},{"id":"22176","lat":23.00789317,"lng":120.2071154,"name":"台南西門店","addr":"704 台南市北區小北里西門路4段88號","city":"704 臺南市北區, tw","tel":"06-2820177","region":"南部"},{"id":"17714","lat":24.11113197,"lng":120.49168251,"name":"菘捷單車生活館","addr":"508 彰化縣和美鎮和西里道周路641號1樓","city":"508 彰化縣和美鎮, tw","tel":"04-7555339","region":"中部"},{"id":"19008","lat":23.03625,"lng":120.23113,"name":"台南永康店","addr":"710 台南市永康區鹽洲里中正南路577號","city":"710 臺南市永康區, tw","tel":"06-2438421","region":"南部"},{"id":"20757","lat":23.0174502,"lng":120.2344863,"name":"南路客單車","addr":"710 台南市永康區東橋里東橋一路89號1樓","city":"710 臺南市永康區, tw","tel":"06-2035547","region":"南部"},{"id":"17804","lat":22.9794896,"lng":120.2282222,"name":"牛仔運動器材有限公司","addr":"701 台南市東區中華東路三段71號","city":"701 臺南市東區, tw","tel":"06-2609388","region":"南部"},{"id":"18640","lat":24.26952696,"lng":120.57491939,"name":"林清月車行","addr":"436 台中市清水區南寧里清水街47號1樓","city":"436 臺中市清水區, tw","tel":"04-26221748","region":"中部"},{"id":"17699","lat":24.23677889,"lng":120.56839417,"name":"今日自轉車店","addr":"433 台中市沙鹿區中山路135之8號","city":"433 臺中市沙鹿區, tw","tel":"04-26624077","region":"中部"},{"id":"17719","lat":24.06147664,"lng":120.5357423,"name":"黑皮環化單車館","addr":"500 彰化縣彰化市南興里中山路一段372號1、2樓","city":"500 彰化縣彰化市, tw","tel":"04-7114188","region":"中部"},{"id":"17801","lat":22.97073861,"lng":120.2584254,"name":"永丞單車有限公司","addr":"717 台南市仁德區仁義村中山路345號","city":"717 臺南市仁德區, tw","tel":"06-2498681","region":"南部"},{"id":"21047","lat":24.35010525,"lng":120.617302,"name":"名品單車生活館","addr":"437 台中市大甲區平安里經國路482號","city":"437 臺中市大甲區, tw","tel":"04-26765915","region":"中部"},{"id":"17794","lat":23.43013368,"lng":120.4022081,"name":"佳德單車休閒館","addr":"608 嘉義縣水上鄉水頭村中興路263號1樓","city":"608 嘉義縣水上鄉, tw","tel":"05-2603638","region":"南部"},{"id":"22403","lat":24.19203925,"lng":120.61709242,"name":"中科店","addr":"407 台中市西屯區永安里福林路407號(A棟A2店鋪)","city":"407 臺中市西屯區, tw","tel":"04-26817232","region":"中部"},{"id":"19003","lat":23.483194,"lng":120.44572,"name":"嘉義店","addr":"600 嘉義市西區國華里林森西路298號1樓","city":"600 嘉義市西區, tw","tel":"05-2250923","region":"南部"},{"id":"17720","lat":23.95616468,"lng":120.57594539,"name":"英久易行","addr":"510 彰化縣員林市東和里萬年路二段127.129號","city":"510 彰化縣員林市, tw","tel":"04-8391280","region":"中部"},{"id":"17741","lat":24.16262986,"lng":120.63113934,"name":"錸客單車生活館","addr":"407 台中市西屯區市政路682號1樓","city":"407 臺中市西屯區, tw","tel":"04-22512245","region":"中部"},{"id":"17678","lat":24.22521733,"lng":120.64886799,"name":"天華車行","addr":"428 台中市大雅區大雅村學府路319號","city":"428 臺中市大雅區, tw","tel":"04-25683256","region":"中部"},{"id":"21532","lat":24.21712925,"lng":120.6489366,"name":"大雅店","addr":"428 台中市大雅區四德里中清路3段915號","city":"428 臺中市大雅區, tw","tel":"04-25602948","region":"中部"},{"id":"26739","lat":24.1489174,"lng":120.63097786,"name":"飛祿單車有限公司","addr":"408 台中市南屯區文心南五路三段398號1F","city":"408 臺中市南屯區, tw","tel":"04-23230699","region":"中部"},{"id":"17725","lat":23.47411408,"lng":120.4557316,"name":"鐵人一號單車生活館","addr":"600 嘉義市東區垂楊路213號1樓","city":"600 嘉義市東區, tw","tel":"05-2257158","region":"南部"},{"id":"17798","lat":22.79420039,"lng":120.29556043,"name":"日昇自行車有限公司","addr":"820 高雄市岡山區平安里岡山路273號1樓","city":"820 高雄市岡山區, tw","tel":"07-6225798","region":"南部"},{"id":"20028","lat":24.1762369,"lng":120.6533693,"name":"GKR客製化門市","addr":"西屯區河南二段117號","city":"407 台中市, tw","tel":"","region":"中部"},{"id":"20029","lat":24.1762369,"lng":120.6533693,"name":"GJ客製化門市","addr":"西屯區河南二段117號","city":"407 台中市, tw","tel":"","region":"中部"},{"id":"17717","lat":23.70140219,"lng":120.53027272,"name":"玩家單車生活館","addr":"640 雲林縣斗六市雲林路二段297號","city":"640 雲林縣斗六市, tw","tel":"05-5378283","region":"中部"},{"id":"17731","lat":24.14029813,"lng":120.64562529,"name":"領豐單車館","addr":"408 台中市南屯區田心里五權西路二段390號1樓","city":"408 臺中市南屯區, tw","tel":"04-24711387","region":"中部"},{"id":"18984","lat":24.17603,"lng":120.6553,"name":"台中旗艦店","addr":"407 台中市西屯區大河里河南路2段117號1-2樓","city":"407 臺中市西屯區, tw","tel":"04-23159436","region":"中部"},{"id":"19454","lat":22.72778,"lng":120.29074,"name":"捷安特萬家福楠梓店","addr":"811 高雄市楠梓區藍田路288號2F","city":"811 高雄市楠梓區, tw","tel":"07-3643142","region":"南部"},{"id":"17704","lat":23.71246054,"lng":120.5434516,"name":"玩家單車專賣店","addr":"640 雲林縣斗六市信義里民生路196號1樓","city":"640 雲林縣斗六市, tw","tel":"05-5339163","region":"中部"},{"id":"17796","lat":22.71551953,"lng":120.29797903,"name":"華興單車館","addr":"811 高雄市楠梓區加昌路620號","city":"811 高雄市楠梓區, tw","tel":"07-3660843","region":"南部"},{"id":"17716","lat":24.13135808,"lng":120.66732782,"name":"捷安單車生活館","addr":"403 台中市西區公館里三民西路29號1樓","city":"403 臺中市西區, tw","tel":"04-23731928","region":"中部"},{"id":"18988","lat":22.65339,"lng":120.29175,"name":"高雄女性旗艦店","addr":"804 高雄市鼓山區中華一路2218號","city":"804 高雄市鼓山區, tw","tel":"07-5531412","region":"南部"},{"id":"26653","lat":22.62122,"lng":120.28868,"name":"飛鳶單車","addr":"803 高雄市鹽埕區五福四路16號1、2樓","city":"803 高雄市鹽埕區, tw","tel":"07-5218512","region":"南部"},{"id":"17703","lat":24.1456583,"lng":120.68206116,"name":"飛泓車行","addr":"400 台中市中區三民路三段47號","city":"400 臺中市中區, tw","tel":"04-22279508","region":"中部"},{"id":"19447","lat":24.12433,"lng":120.67646,"name":"興大站","addr":"402 台中市南區積善里興大路200號1樓","city":"402 臺中市南區, tw","tel":"04-22851540","region":"中部"},{"id":"22854","lat":22.68578,"lng":120.31093,"name":"騎宏車業","addr":"813 高雄市左營區華夏路1297號1樓","city":"813 高雄市左營區, tw","tel":"07-3460329","region":"南部"},{"id":"17729","lat":24.21896777,"lng":120.7058212,"name":"奇益自行車店","addr":"427 台中市潭子區中山路二段603號","city":"427 臺中市潭子區, tw","tel":"04-25311258","region":"中部"},{"id":"17795","lat":22.67305382,"lng":120.31178622,"name":"騎格車行","addr":"813 高雄市左營區自由三路256號","city":"813 高雄市左營區, tw","tel":"07-3416972","region":"南部"},{"id":"18994","lat":22.64127,"lng":120.30479,"name":"高雄九如店","addr":"807 高雄市三民區九如二路278、280號1-4樓","city":"807 高雄市三民區, tw","tel":"07-3223267","region":"南部"},{"id":"26472","lat":24.16623575,"lng":120.69529582,"name":"馳展單車有限公司","addr":"406 台中市北屯區北屯路198之13號1樓","city":"406 臺中市北屯區, tw","tel":"04-22334769","region":"中部"},{"id":"19000","lat":22.73158,"lng":120.32972,"name":"楠梓店","addr":"811 高雄市楠梓區東寧里旗楠路46號1樓、48號1樓","city":"811 高雄市楠梓區, tw","tel":"07-3520149","region":"南部"},{"id":"17735","lat":24.24872853,"lng":120.71933917,"name":"大衛單車","addr":"420 台中市豐原區陽明里博愛街128號","city":"420 臺中市豐原區, tw","tel":"04-25280269","region":"中部"},{"id":"17797","lat":22.63691448,"lng":120.30847653,"name":"歐亞單車行","addr":"807 高雄市三民區復興一路149號","city":"807 高雄市三民區, tw","tel":"07-2361071","region":"南部"},{"id":"17779","lat":22.65985659,"lng":120.31883838,"name":"太成車行","addr":"807 高雄市三民區明誠一路585號","city":"807 高雄市三民區, tw","tel":"07-3855836","region":"南部"},{"id":"17499","lat":22.6482963,"lng":120.31735649,"name":"源成車行","addr":"807 高雄市三民區建工路830號","city":"807 高雄市三民區, tw","tel":"07-3849157","region":"南部"},{"id":"19006","lat":24.253121,"lng":120.72951,"name":"豐原圓環店","addr":"420 台中市豐原區南村里圓環東路725號","city":"420 臺中市豐原區, tw","tel":"04-25230887","region":"中部"},{"id":"19005","lat":22.61659,"lng":120.31195,"name":"高雄三多復興店","addr":"802 高雄市苓雅區普照里三多三路78號","city":"802 高雄市苓雅區, tw","tel":"07-7210618","region":"南部"},{"id":"19001","lat":24.09043495,"lng":120.69284728,"name":"大里店","addr":"412 臺中市大里區東湖里中興路一段213之1號1樓","city":"412 臺中市大里區, tw","tel":"04-24820599","region":"中部"},{"id":"21786","lat":22.6123876,"lng":120.32292787,"name":"亞聖運動事業有限公司","addr":"806 高雄市前鎮區二聖一路176號1樓","city":"806 高雄市前鎮區, tw","tel":"07-7167018","region":"南部"},{"id":"21041","lat":22.67604295,"lng":120.33891384,"name":"自由鳶自行車店","addr":"814 高雄市仁武區仁雄路203號","city":"814 高雄市仁武區, tw","tel":"07-3720226","region":"南部"},{"id":"18120","lat":24.14719933,"lng":120.71551242,"name":"詠倫自行車有限公司","addr":"411 台中市太平區宜昌里宜昌路546號1樓","city":"411 臺中市太平區, tw","tel":"04-22778563","region":"中部"},{"id":"17730","lat":24.17212203,"lng":120.72464282,"name":"捷崴單車精品有限公司","addr":"406 台中市北屯區建和路二段126-1號","city":"406 臺中市北屯區, tw","tel":"04-24364690","region":"中部"},{"id":"17780","lat":22.63957592,"lng":120.339073,"name":"東元車行","addr":"807 高雄市三民區寶華里覺民路229號","city":"807 高雄市三民區, tw","tel":"07-3838204","region":"南部"},{"id":"18997","lat":24.68733,"lng":120.86994,"name":"竹南店","addr":"350 苗栗縣竹南鎮中華里19鄰環市路2段160號","city":"350 苗栗縣竹南鎮, tw","tel":"03-7461456","region":"中部"},{"id":"21046","lat":23.91331929,"lng":120.68399504,"name":"南投拜客生活館","addr":"540 南投縣南投市康壽里南陽路339號1~2樓","city":"540 南投縣南投市, tw","tel":"049-2202300","region":"中部"},{"id":"22125","lat":24.69445698,"lng":120.90555227,"name":"斯朗查運動精品有限公司","addr":"351 苗栗縣頭份市信東路355號","city":"351 苗栗縣頭份市, tw","tel":"03-7672949","region":"中部"},{"id":"24533","lat":22.5889799,"lng":120.36297174,"name":"久大成自行車","addr":"830 高雄市鳳山區過勇路172號","city":"830 高雄市鳳山區, tw","tel":"07-7929028","region":"南部"},{"id":"21902","lat":24.86721335,"lng":120.9930922,"name":"山崎單車行","addr":"304 新竹縣新豐鄉松林村新興路147號","city":"304 新竹縣新豐鄉, tw","tel":"03-5595580","region":"北部"},{"id":"17727","lat":24.79685999,"lng":120.97561923,"name":"羿成單車生活館","addr":"300 新竹市東區頂竹里食品路202號一樓","city":"300 新竹市東區, tw","tel":"03-5610976","region":"北部"},{"id":"18999","lat":24.81647,"lng":120.99349,"name":"新竹中華店","addr":"300 新竹市東區前溪里9鄰中華路一段124、126號1樓","city":"300 新竹市東區, tw","tel":"03-5353398","region":"北部"},{"id":"17536","lat":24.83328673,"lng":121.00399873,"name":"阿診休閒自行車店","addr":"302 新竹縣竹北市新崙里中華路305之15號1樓","city":"302 新竹縣竹北市, tw","tel":"03-5512907","region":"北部"},{"id":"21667","lat":24.78666261,"lng":121.01853647,"name":"竹臨有限公司","addr":"300 新竹市東區關新里關新北路16號","city":"300 新竹市東區, tw","tel":"03-5797673","region":"北部"},{"id":"17528","lat":24.809749,"lng":121.025233,"name":"鐵騎車業行","addr":"302新竹縣竹北市東平里六家五路一段119號1樓","city":"302 新竹縣竹北市, tw","tel":"03-6582881","region":"北部"},{"id":"17805","lat":22.68368671,"lng":120.48459065,"name":"飛馬自行車有限公司","addr":"900 屏東縣屏東市中山路168號1樓","city":"900 屏東縣屏東市, tw","tel":"08-7321652","region":"南部"},{"id":"18987","lat":22.66949743,"lng":120.49345147,"name":"屏東二店","addr":"900 屏東縣屏東市金泉里民生路225、227號","city":"900 屏東縣屏東市, tw","tel":"08-7327959","region":"南部"},{"id":"17527","lat":24.90815544,"lng":121.16968275,"name":"安閎自行車行","addr":"326 桃園市楊梅區金溪里中山北路2段95號1樓","city":"326 桃園市楊梅區, tw","tel":"03-4814558","region":"北部"},{"id":"19446","lat":23.86635,"lng":120.91081,"name":"日月潭站","addr":"555 南投縣魚池鄉水社村中山路163號1樓","city":"555 南投縣魚池鄉, tw","tel":"049-2856713","region":"中部"},{"id":"17518","lat":24.94373754,"lng":121.22794138,"name":"奇軒車行","addr":"320 桃園市中壢區環中東路二段728號","city":"320 桃園市中壢區, tw","tel":"03-4281269","region":"北部"},{"id":"17548","lat":24.96640456,"lng":121.24149853,"name":"吉興欣業有限公司","addr":"320 桃園市中壢區中華路二段102號","city":"320 桃園市中壢區, tw","tel":"03-4626846","region":"北部"},{"id":"19451","lat":24.9726,"lng":121.2536,"name":"捷安特萬家福內壢店","addr":"320 桃園市中壢區中華路一段450號","city":"320 桃園縣中壢區, tw","tel":"03-4514975","region":"北部"},{"id":"18989","lat":25.04615,"lng":121.2953584,"name":"桃園南崁店","addr":"338 桃園市蘆竹區南崁路116號1、2樓","city":"338 桃園市蘆竹區, tw","tel":"03-3213782","region":"北部"},{"id":"18990","lat":25.02591,"lng":121.3012,"name":"桃園二店","addr":"330 桃園市桃園區莊敬路一段128號1樓","city":"330 桃園市桃園區, tw","tel":"03-3468016","region":"北部"},{"id":"17660","lat":24.96577653,"lng":121.30081402,"name":"黑貓自行車行","addr":"334 桃園市八德區大榮里介壽路一段679號1樓","city":"334 桃園縣八德區, tw","tel":"03-3761558","region":"北部"},{"id":"17650","lat":25.05616908,"lng":121.36801344,"name":"百客威企業社","addr":"333 桃園市龜山區文化村文化二路63號1樓","city":"333 桃園市龜山區, tw","tel":"03-3183800","region":"北部"},{"id":"17545","lat":25.07509745,"lng":121.3772685,"name":"鉅輪國際有限公司","addr":"244 新北市林口區仁愛路二段490號","city":"244 新北市林口區, tw","tel":"02-26083328","region":"北部"},{"id":"19452","lat":25.18797,"lng":121.4436,"name":"捷安特萬家福淡新店","addr":"251 新北市淡水區中山北路二段383號","city":"251 新北市淡水區, tw","tel":"02-26230917","region":"北部"},{"id":"20756","lat":24.93720366,"lng":121.37297521,"name":"北大鉅崙單車行","addr":"237 新北市三峽區復興路63號1樓","city":"237 新北市三峽區, tw","tel":"02-26746035","region":"北部"},{"id":"17525","lat":25.02075265,"lng":121.41025176,"name":"力羽自行車行","addr":"333 桃園市龜山區萬壽路一段15號","city":"333 桃園市龜山區, tw","tel":"02-82098105","region":"北部"},{"id":"17533","lat":25.01908475,"lng":121.42711712,"name":"輝詠自行車行","addr":"242 新北市新莊區民安西路89號","city":"242 新北市新莊區, tw","tel":"02-22063837","region":"北部"},{"id":"18986","lat":24.98815845,"lng":121.42158984,"name":"台北樹林店","addr":"238 新北市樹林區育英里中山路1段185-2號1樓","city":"238 新北市樹林區, tw","tel":"02-86849639","region":"北部"},{"id":"20685","lat":25.09001,"lng":121.4597,"name":"蘆洲店","addr":"247 新北市蘆洲區長榮路518號","city":"247 新北市蘆洲區, tw","tel":"02-82869719","region":"北部"},{"id":"19004","lat":25.04252,"lng":121.46026,"name":"台北新莊店","addr":"242 新北市新莊區思源路38號1樓","city":"242 新北市新莊區, tw","tel":"02-29942655","region":"北部"},{"id":"17655","lat":25.02472142,"lng":121.46091191,"name":"大車輪單車店","addr":"220 新北市板橋區英士路60號1樓","city":"220 新北市板橋區, tw","tel":"02-22518163","region":"北部"},{"id":"17495","lat":25.06866304,"lng":121.47852126,"name":"順天自行車行","addr":"241 新北市三重區三民街293號1樓","city":"241 新北市三重區, tw","tel":"02-29834482","region":"北部"},{"id":"17648","lat":25.00416454,"lng":121.460098,"name":"家禾自行車有限公司","addr":"220 新北市板橋區四川路一段155號","city":"220 新北市板橋區, tw","tel":"02-29648992","region":"北部"},{"id":"17521","lat":24.99301946,"lng":121.45776405,"name":"捷華單車店","addr":"220 新北市板橋區信義路88號","city":"220 新北市板橋區, tw","tel":"02-29554226","region":"北部"},{"id":"17516","lat":25.13519445,"lng":121.49914915,"name":"北投車行-分店","addr":"112 台北市北投區中央北路一段124號","city":"112 臺北市北投區, tw","tel":"02-28940634","region":"北部"},{"id":"17529","lat":25.03041422,"lng":121.47296796,"name":"騎蜂單車運動休閒館","addr":"220 新北市板橋區文化路二段344號","city":"220 新北市板橋區, tw","tel":"02-22531796","region":"北部"},{"id":"17553","lat":25.08933137,"lng":121.4900183,"name":"禾昇自行車行","addr":"241 新北市三重區集賢路125號","city":"241 新北市三重區, tw","tel":"02-82878127","region":"北部"},{"id":"17517","lat":25.11034696,"lng":121.51473796,"name":"北投車行","addr":"112 台北市北投區致遠一路1段133號1樓","city":"112 臺北市北投區, tw","tel":"02-28214620","region":"北部"},{"id":"17544","lat":25.05678432,"lng":121.50848262,"name":"跨越單車精品店","addr":"103 台北市大同區民生西路432號1樓","city":"103 臺北市大同區, tw","tel":"02-25567630","region":"北部"},{"id":"17484","lat":25.02235725,"lng":121.50241515,"name":"立新車行","addr":"108 台北市萬華區青年路132號1樓","city":"108 臺北市萬華區, tw","tel":"02-23098548","region":"北部"},{"id":"17539","lat":25.10405668,"lng":121.5267854,"name":"高菖國際企業有限公司","addr":"111 台北市士林區忠誠路一段21號","city":"111 臺北市士林區, tw","tel":"02-28352101","region":"北部"},{"id":"17541","lat":25.00056205,"lng":121.4985145,"name":"煜達運動用品有限公司","addr":"235 新北市中和區景平路648號","city":"235 新北市中和區, tw","tel":"02-22470708","region":"北部"},{"id":"17486","lat":25.10822763,"lng":121.52948286,"name":"內吉車業有限公司","addr":"111 台北市士林區德行東路145號1樓","city":"111 臺北市士林區, tw","tel":"02-28344954","region":"北部"},{"id":"17543","lat":25.08188418,"lng":121.5232731,"name":"樂活式單車館","addr":"111 台北市士林區承德路四段69號","city":"111 臺北市士林區, tw","tel":"02-28852172","region":"北部"},{"id":"18162","lat":25.04924,"lng":121.51715,"name":"台北京站店","addr":"103 台北市大同區承德路一段1號3樓","city":"103 臺北市大同區, tw","tel":"02-25527543","region":"北部"},{"id":"17508","lat":25.01046015,"lng":121.51332695,"name":"風禓單車生活館","addr":"234 新北市永和區中山路一段31號","city":"234 新北市永和區, tw","tel":"02-29225739","region":"北部"},{"id":"17510","lat":24.98708883,"lng":121.50800866,"name":"南信自行車行","addr":"235 新北市中和區南山路531號","city":"235 新北市中和區, tw","tel":"02-29428329","region":"北部"},{"id":"17652","lat":25.00336158,"lng":121.51341191,"name":"亦禾工作室","addr":"235 新北市中和區中安街10號","city":"235 新北市中和區, tw","tel":"02-22326281","region":"北部"},{"id":"21230","lat":25.02430929,"lng":121.5344139,"name":"新生樂活單車行","addr":"106 台北市大安區新生南路3段20號","city":"106 臺北市大安區, tw","tel":"02-23681906","region":"北部"},{"id":"17519","lat":24.99616549,"lng":121.52675077,"name":"德昇分店","addr":"234 新北市永和區成功路二段199號","city":"234 新北市永和區, tw","tel":"02-29404505","region":"北部"},{"id":"17537","lat":25.04353605,"lng":121.54219672,"name":"旅行者單車精品館","addr":"106 台北市大安區忠孝東路3段251巷11弄10號","city":"106 臺北市大安區, tw","tel":"02-27818450","region":"北部"},{"id":"18998","lat":25.05159,"lng":121.54561,"name":"台北南京店","addr":"105 台北市松山區中正里南京東路3段278號1樓","city":"105 臺北市松山區, tw","tel":"02-87714045","region":"北部"},{"id":"28289","lat":25.03314796,"lng":121.54070777,"name":"台北信義店","addr":"106 台北市大安區龍圖里信義路3段150號1樓","city":"106 臺北市大安區, tw","tel":"02-27001300","region":"北部"},{"id":"18993","lat":25.06006,"lng":121.55055,"name":"台北女性旗艦店","addr":"105 台北市松山區敦化北路345、347號一樓","city":"105 臺北市松山區, tw","tel":"02-27160421","region":"北部"},{"id":"17489","lat":25.05858037,"lng":121.55675756,"name":"民昇自行車行","addr":"105 台北市松山區民生東路五段35號1樓","city":"105 臺北市松山區, tw","tel":"02-27669501","region":"北部"},{"id":"17532","lat":25.07829785,"lng":121.56449362,"name":"哥倫布戶外生活館","addr":"104 台北市中山區堤頂大道2段296號","city":"104 臺北市中山區, tw","tel":"02-85020138","region":"北部"},{"id":"17549","lat":24.9901272,"lng":121.53947971,"name":"蛙不廷有限公司","addr":"116 台北市文山區羅斯福路6段320號","city":"116 臺北市文山區, tw","tel":"02-29329313","region":"北部"},{"id":"24474","lat":25.03806055,"lng":121.55628576,"name":"樂活式單車館有限公司","addr":"106 台北市大安區仁愛路四段419號","city":"106 臺北市大安區, tw","tel":"02-27752101","region":"北部"},{"id":"17662","lat":24.98640356,"lng":121.54221872,"name":"捷客單車有限公司","addr":"231 新北市新店區中興路三段328號","city":"231 新北市新店區, tw","tel":"02-86658698","region":"北部"},{"id":"17488","lat":25.08095744,"lng":121.57349466,"name":"世明車行","addr":"114 台北市內湖區內湖路一段597號一樓","city":"114 臺北市內湖區, tw","tel":"02-27986196","region":"北部"},{"id":"19453","lat":24.9766,"lng":121.54631,"name":"捷安特萬家福新店店","addr":"231 新北市新店區中興路三段1號2F","city":"231 新北市新店區, tw","tel":"02-89145424","region":"北部"},{"id":"17506","lat":24.98873925,"lng":121.55704966,"name":"捷登自行車行","addr":"116 台北市文山區木柵路一段331之2號","city":"116 臺北市文山區, tw","tel":"02-29382168","region":"北部"},{"id":"17496","lat":24.9883334,"lng":121.56547937,"name":"順天自行車行","addr":"116 台北市文山區木柵路三段33號一樓","city":"116 臺北市文山區, tw","tel":"02-29388187","region":"北部"},{"id":"17546","lat":25.03811622,"lng":121.58404561,"name":"聖保羅單車店","addr":"110 台北市信義區福德街185號","city":"110 臺北市信義區, tw","tel":"02-27272861","region":"北部"},{"id":"17653","lat":25.06904055,"lng":121.59476152,"name":"忠明自行車行","addr":"114 台北市內湖區民權東路6段151-2號","city":"114 臺北市內湖區, tw","tel":"02-27940838","region":"北部"},{"id":"20126","lat":24.99029094,"lng":121.5789521,"name":"鑫順天自行車行","addr":"116 台北市文山區永安街22巷38號1樓","city":"116 臺北市文山區, tw","tel":"02-29381919","region":"北部"},{"id":"17507","lat":25.06799874,"lng":121.61206487,"name":"捷信運動器材行","addr":"114 台北市內湖區康寧路三段219巷2號1樓","city":"114 臺北市內湖區, tw","tel":"02-26324261","region":"北部"},{"id":"17530","lat":25.05302121,"lng":121.61312077,"name":"捷勁自行車行","addr":"115 台北市南港區忠孝東路7段543號","city":"115 臺北市南港區, tw","tel":"02-27829230","region":"北部"},{"id":"19449","lat":22.7608,"lng":121.1453,"name":"台東站","addr":"950 台東市民生里更生路310號","city":"950 台東縣台東市, tw","tel":"089-337800","region":"東部"},{"id":"17806","lat":22.75401737,"lng":121.15306765,"name":"藍天二輪生活館","addr":"950 台東縣台東市中正里中華路1段377號1F","city":"950 台東縣台東市, tw","tel":"089-347416","region":"東部"},{"id":"17640","lat":24.750138,"lng":121.75356075,"name":"一成車行","addr":"260 宜蘭縣宜蘭市民權里中山路2段185號","city":"260 宜蘭縣宜蘭市, tw","tel":"03-9325096","region":"北部"},{"id":"18996","lat":24.67418,"lng":121.76345,"name":"宜蘭羅東店","addr":"265 宜蘭縣羅東鎮漢民里中山路四段1號1-3樓","city":"265 宜蘭縣羅東鎮, tw","tel":"03-9612127","region":"北部"},{"id":"17552","lat":24.67839816,"lng":121.77800091,"name":"偉展車行","addr":"265 宜蘭縣羅東鎮東安里光榮路330號一樓","city":"265 宜蘭縣羅東鎮, tw","tel":"03-9605504","region":"北部"},{"id":"17792","lat":23.97396495,"lng":121.58862669,"name":"名捷自行車有限公司","addr":"970 花蓮縣花蓮市主權里中華路491號","city":"970 花蓮縣花蓮市, tw","tel":"038-525717","region":"東部"},{"id":"19448","lat":23.99054,"lng":121.60199,"name":"花蓮站","addr":"970 花蓮縣花蓮市國聯里國聯一路127號","city":"970 花蓮縣花蓮市, tw","tel":"038-336761","region":"東部"},{"id":"17769","lat":23.97772298,"lng":121.61081633,"name":"名捷車行","addr":"970 花蓮縣花蓮市民生里三民街5-6號1樓","city":"970 花蓮縣花蓮市, tw","tel":"038-357427","region":"東部"}];
  function validStores(d) {
    return Array.isArray(d) && d.length > 0 && d.every(function (s) {
      return s && s.id != null && typeof s.name === 'string' && typeof s.addr === 'string' && typeof s.tel === 'string' && REGIONS.indexOf(s.region) > 0 && Number.isFinite(s.lat) && Number.isFinite(s.lng);
    });
  }
  function data() {
    if (dataP) return dataP;
    var offline = function () { return STORE_SNAPSHOT.map(function (s) { return Object.assign({}, s); }); };
    if (location.protocol === 'file:') return (dataP = Promise.resolve(offline()));
    dataP = (async function () {
      var controller = new AbortController(), timer = setTimeout(function () { controller.abort(); }, 8000);
      try {
        var response = await fetch(ROOT + 'custom-studio/stores.json', {signal: controller.signal});
        if (!response.ok) throw new Error('Store data HTTP ' + response.status);
        var d = await response.json();
        if (!validStores(d)) throw new Error('Invalid store data');
        return d;
      } catch (error) {
        console.warn('[GiantStorePicker] 使用內附門市資料：', error.message);
        return offline();
      } finally { clearTimeout(timer); }
    })();
    return dataP;
  }
  var glP = null;
  function hasWebGL() { try { var c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } }
  function loadGL() {
    if (glP) return glP;
    glP = new Promise(function (ok, no) {
      if (!/^https?:$/.test(location.protocol) || !hasWebGL()) return no();
      if (window.maplibregl) return ok(window.maplibregl);
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = GL_CSS; document.head.appendChild(l);
      var s = document.createElement('script'); s.src = GL_JS; s.async = true;
      s.onload = function () { window.maplibregl ? ok(window.maplibregl) : no(); }; s.onerror = no;
      document.head.appendChild(s);
    });
    return glP;
  }

  function mount(host, o) {
    o = o || {};
    var mode = o.mode || 'select', tags = o.tags || {};
    var el = document.createElement('div');
    var layout = o.layout || 'auto';
    el.className = 'sp sp-' + (layout === 'auto' ? 'side' : layout) + (mode === 'browse' ? ' sp-browse' : '');
    el.innerHTML = '<div class="sp-map"><div class="sp-wait">地圖載入中…</div><div class="sp-zoom"><button type="button" data-z="1" aria-label="放大地圖">' + ICON.plus + '</button><button type="button" data-z="-1" aria-label="縮小地圖">' + ICON.minus + '</button></div></div>' +
      '<div class="sp-list"><div class="sp-tools"><label class="sp-q">' + ICON.search + '<input type="search" placeholder="搜尋門市、縣市或地址" aria-label="搜尋門市" autocomplete="off"></label>' +
      '<button type="button" class="sp-near" aria-pressed="false">' + ICON.near + '離我最近</button></div>' +
      '<p class="sp-msg" role="status"></p><div class="sp-chips" role="group" aria-label="地區"></div><p class="sp-cnt"></p><ul role="listbox" aria-label="門市"></ul></div>' +
      (mode === 'select' ? '<p class="sp-picked" aria-live="polite"></p>' : '');
    host.appendChild(el);
    /* layout 'auto'：寬度夠（≥ 720px）左地圖右清單，不夠就地圖在上、清單在下 */
    if (layout === 'auto' && window.ResizeObserver) new ResizeObserver(function () { var w = el.getBoundingClientRect().width; if (!w) return; var side = w >= 720; if (el.classList.contains('sp-side') !== side) { el.classList.toggle('sp-side', side); el.classList.toggle('sp-stack', !side); if (map) map.resize(); } }).observe(el);
    var mapc = el.querySelector('.sp-map'), ul = el.querySelector('ul'), input = el.querySelector('input'), chipsBox = el.querySelector('.sp-chips'),
      cnt = el.querySelector('.sp-cnt'), nearBtn = el.querySelector('.sp-near'), msg = el.querySelector('.sp-msg'), picked = el.querySelector('.sp-picked');
    var stores = [], sorted = [], hits = [], region = '全部', query = '', sel = null, hov = null, me = null, map = null;

    var api = {el: el, select: function (id) { var s = stores.filter(function (x) { return x.id === String(id); })[0]; if (s) choose(s.i, true); }, selected: function () { return sel == null ? null : stores[sel]; }, resize: function () { map && map.resize(); }};

    data().then(function (d) {
      stores = d.map(function (s, i) { return Object.assign({}, s, {i: i, zip: parseInt(s.addr, 10) || 999, key: norm(s.name + s.addr + s.city)}); });
      sorted = stores.slice().sort(function (a, b) { return REGIONS.indexOf(a.region) - REGIONS.indexOf(b.region) || a.zip - b.zip; });
      chipsBox.innerHTML = REGIONS.map(function (r) { return '<button type="button" class="sp-chip" data-r="' + r + '" aria-pressed="false">' + r + ' ' + (r === '全部' ? stores.length : stores.filter(function (s) { return s.region === r; }).length) + '</button>'; }).join('');
      var pre = o.selected != null ? stores.filter(function (x) { return x.id === String(o.selected); })[0] : null;
      if (pre) sel = pre.i;
      render();
      if (pre) { scrollTo(pre.i); }
      new IntersectionObserver(function (es, io) { if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); startMap(); } }, {rootMargin: '600px 0px'}).observe(el);
    }).catch(function () { ul.innerHTML = '<li class="sp-empty">門市資料載入失敗，請重新整理再試一次。</li>'; el.classList.add('sp-nomap'); });

    /* ---------- 清單 ---------- */
    function render() {
      var qn = norm(query);
      hits = stores.map(function (s) { return (region === '全部' || s.region === region) && (!qn || s.key.indexOf(qn) >= 0); });
      var rows = (me ? stores.slice().sort(function (a, b) { return a.km - b.km; }) : sorted).filter(function (s) { return hits[s.i]; });
      ul.innerHTML = rows.length ? rows.map(function (s) {
        return '<li role="option" tabindex="0" data-i="' + s.i + '" aria-selected="' + (s.i === sel) + '"' + (s.i === sel ? ' class="sel"' : '') + '><span class="sp-radio" aria-hidden="true"></span><div class="sp-txt"><b>' + esc(s.name) + (tags[s.id] ? '<em class="sp-tag">' + esc(tags[s.id]) + '</em>' : '') + '</b><span title="' + esc(s.addr) + '">' + esc(street(s)) + '</span></div>' +
          '<div class="sp-end"><a href="tel:' + esc(String(s.tel).replace(/[^\d+]/g, '')) + '">' + esc(s.tel) + '</a>' + (me ? '<small>' + (s.km < 10 ? s.km.toFixed(1) : Math.round(s.km)) + ' 公里</small>' : '') + '</div></li>';
      }).join('') : '<li class="sp-empty">找不到符合的門市，換個關鍵字或地區試試。</li>';
      cnt.textContent = query ? '搜尋「' + query + '」' + (region === '全部' ? '' : '（' + region + '）') + '，共 ' + rows.length + ' 筆' : '';
      chipsBox.querySelectorAll('.sp-chip').forEach(function (c) { var on = c.dataset.r === region; c.classList.toggle('on', on); c.setAttribute('aria-pressed', on); });
      showPicked();
      if (map) map.filter();
    }
    function showPicked() {
      if (!picked) return;
      var s = sel == null ? null : stores[sel];
      picked.innerHTML = s ? '已選：<b>' + esc(s.name) + '</b>・' + esc(s.addr) + '・' + esc(s.tel) : '';
    }
    function scrollTo(i) { var li = ul.querySelector('li[data-i="' + i + '"]'); if (li) ul.scrollTo({top: li.offsetTop - ul.offsetTop - 8, behavior: reduced() ? 'auto' : 'smooth'}); }
    function highlight(i) { ul.querySelectorAll('li.hl').forEach(function (li) { li.classList.remove('hl'); }); hov = i; if (map) map.hover(i); if (i == null) return; var li = ul.querySelector('li[data-i="' + i + '"]'); if (li) li.classList.add('hl'); }
    function choose(i, scroll) {
      if (mode === 'browse' && sel === i) { sel = null; render(); if (map) map.unselect(); return; }
      if (!hits[i]) { query = ''; input.value = ''; region = '全部'; }
      sel = i; render(); if (scroll) scrollTo(i);
      if (map) map.select(i);
      if (mode === 'select' && o.onSelect) o.onSelect(stores[i]);
    }

    var typing;
    input.addEventListener('input', function () { clearTimeout(typing); typing = setTimeout(function () { query = input.value.trim(); render(); if (map) map.fitTo(); }, 120); });
    chipsBox.addEventListener('click', function (e) { var c = e.target.closest('.sp-chip'); if (!c) return; region = c.dataset.r; render(); if (map) map.fitTo(); });
    ul.addEventListener('pointerover', function (e) { var li = e.target.closest('li[data-i]'); if (li) highlight(+li.dataset.i); });
    ul.addEventListener('pointerleave', function () { highlight(null); });
    ul.addEventListener('click', function (e) { var li = e.target.closest('li[data-i]'); if (!li || e.target.closest('a')) return; choose(+li.dataset.i); });
    ul.addEventListener('keydown', function (e) { var li = e.target.closest('li[data-i]'); if (li && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); choose(+li.dataset.i); } });

    /* 離我最近：取得位置後依距離排序，地圖拉到最近的幾間；再按一次回到依地區排序 */
    nearBtn.addEventListener('click', function () {
      if (me) { me = null; nearBtn.classList.remove('on'); nearBtn.setAttribute('aria-pressed', 'false'); msg.textContent = ''; render(); if (map) { map.me(null); map.fitTo(); } return; }
      if (!navigator.geolocation) { msg.textContent = '這個瀏覽器無法取得位置，請用搜尋或地區篩選。'; return; }
      nearBtn.setAttribute('aria-busy', 'true'); msg.textContent = '';
      navigator.geolocation.getCurrentPosition(function (pos) {
        nearBtn.removeAttribute('aria-busy');
        me = {lat: pos.coords.latitude, lng: pos.coords.longitude};
        stores.forEach(function (s) { s.km = km(me, s); });
        region = '全部'; query = ''; input.value = '';
        nearBtn.classList.add('on'); nearBtn.setAttribute('aria-pressed', 'true');
        render(); ul.scrollTop = 0;
        if (map) { map.me(me); map.near(); }
      }, function () { nearBtn.removeAttribute('aria-busy'); msg.textContent = '沒有取得你的位置（可能沒有允許定位），請用搜尋或地區篩選。'; }, {timeout: 10000, maximumAge: 600000});
    });

    /* ---------- 地圖 ---------- */
    function startMap() {
      loadGL().then(function (ml) {
        var c = document.createElement('div'); c.className = 'sp-gl'; mapc.prepend(c);
        var lngs = stores.map(function (s) { return s.lng; }), lats = stores.map(function (s) { return s.lat; });
        var ALL = [[Math.min.apply(null, lngs), Math.min.apply(null, lats)], [Math.max.apply(null, lngs), Math.max.apply(null, lats)]], PAD = 28, ZSEL = 15, ZMAX = 18;
        var m, ready = false, cur = null, hv = null, mk = null, meMk = null, fullZoom = 7;
        try {
          m = new ml.Map({container: c, style: GL_STYLE, bounds: ALL, fitBoundsOptions: {padding: PAD}, maxZoom: ZMAX, minZoom: 5, attributionControl: false, dragRotate: false, pitchWithRotate: false, touchPitch: false, scrollZoom: false,
            cooperativeGestures: matchMedia('(pointer: coarse)').matches, localIdeographFontFamily: '"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif'});
        } catch (e) { c.remove(); el.classList.add('sp-nomap'); return; }
        m.touchZoomRotate.disableRotation(); m.keyboard.disableRotation();
        m.addControl(new ml.AttributionControl({compact: true}), 'bottom-left');   /* 地圖來源標註依授權必須保留，預設收成 ⓘ */
        var collapse = function () { var a = c.querySelector('.maplibregl-ctrl-attrib.maplibregl-compact-show'); if (a) a.classList.remove('maplibregl-compact-show'); };
        m.once('load', collapse); m.once('idle', collapse);
        var failT = setTimeout(function () { if (!ready) { m.remove(); c.remove(); el.classList.add('sp-nomap'); } }, 9000);
        var fs = function (i, st) { m.setFeatureState({source: 'sp', id: i}, st); };
        var zin = mapc.querySelector('[data-z="1"]'), zout = mapc.querySelector('[data-z="-1"]');
        var zs = function () { var z = m.getZoom(); zout.disabled = z <= fullZoom + .25; zin.disabled = z >= ZMAX - .01; };
        zin.onclick = function () { m.zoomIn({duration: 300}); }; zout.onclick = function () { m.zoomOut({duration: 300}); };
        m.on('load', function () {
          m.getStyle().layers.forEach(function (l) {
            if (l.type === 'symbol' && l.layout && JSON.stringify(l.layout['text-field'] || '').indexOf('name') >= 0) m.setLayoutProperty(l.id, 'text-field', ['coalesce', ['get', 'name:zh-Hant'], ['get', 'name:zh'], ['get', 'name']]);
            if (l.id === 'background') m.setPaintProperty(l.id, 'background-color', '#EEF1F4');
            if (l.id === 'water') m.setPaintProperty(l.id, 'fill-color', '#D6DEE8');
            if (l.id === 'park' || /landcover_wood/.test(l.id)) m.setPaintProperty(l.id, 'fill-color', '#E4EAE4');
          });
          m.addSource('sp', {type: 'geojson', data: {type: 'FeatureCollection', features: stores.map(function (s) { return {type: 'Feature', id: s.i, properties: {}, geometry: {type: 'Point', coordinates: [s.lng, s.lat]}}; })}});
          var r = function (a, b) { return ['case', ['boolean', ['feature-state', 'hl'], false], b, a]; };
          m.addLayer({id: 'sp-pins', type: 'circle', source: 'sp', paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, r(4, 7), 11, r(6, 9), 16, r(8, 11)],
            'circle-color': '#1F4FE0', 'circle-stroke-color': '#fff', 'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 6, 1.2, 14, 2],
            'circle-opacity': ['case', ['boolean', ['feature-state', 'off'], false], .14, ['boolean', ['feature-state', 'sel'], false], 0, 1],
            'circle-stroke-opacity': ['case', ['boolean', ['feature-state', 'off'], false], .14, ['boolean', ['feature-state', 'sel'], false], 0, 1]}});
          m.on('mouseenter', 'sp-pins', function () { m.getCanvas().style.cursor = 'pointer'; });
          m.on('mouseleave', 'sp-pins', function () { m.getCanvas().style.cursor = ''; });
          m.on('click', function (e) { var f = m.queryRenderedFeatures(e.point, {layers: ['sp-pins']}).filter(function (f) { return !f.state.off; })[0]; if (f) choose(f.id, true); });
          m.on('zoomend', zs); m.on('moveend', zs);
          fullZoom = m.cameraForBounds(ALL, {padding: PAD}).zoom;
          m.once('idle', function () {
            ready = true; clearTimeout(failT); mapc.classList.add('on'); zs();
            map.filter(); if (me) map.me(me); if (sel != null) map.select(sel); else if (me) map.near(); else map.fitTo();
          });
        });
        var cam = function (ll, z) { return {center: ll, zoom: z, duration: reduced() ? 0 : 900, essential: true, offset: [0, 24]}; };
        map = {
          filter: function () { if (ready) stores.forEach(function (s) { fs(s.i, {off: !hits[s.i]}); }); },
          hover: function (i) { if (!ready) return; if (hv != null) fs(hv, {hl: false}); hv = i; if (i != null) fs(i, {hl: true}); },
          select: function (i) {
            if (!ready) return; var s = stores[i];
            if (cur != null) fs(cur, {sel: false}); cur = i; fs(i, {sel: true});
            if (mk) mk.remove();
            var d = document.createElement('div'); d.className = 'sp-mk'; d.innerHTML = '<i></i><div class="sp-mk-tag"><b>' + esc(s.name) + '</b><span>' + esc(street(s)) + '</span></div>';
            mk = new ml.Marker({element: d, anchor: 'center'}).setLngLat([s.lng, s.lat]).addTo(m);
            m.flyTo(cam([s.lng, s.lat], Math.max(m.getZoom(), ZSEL)));
          },
          unselect: function () { if (!ready) return; if (cur != null) fs(cur, {sel: false}); cur = null; if (mk) mk.remove(); mk = null; },
          fitTo: function () {
            if (!ready) return;
            var idx = stores.filter(function (s) { return hits[s.i]; });
            if (!idx.length || idx.length === stores.length) return m.fitBounds(ALL, {padding: PAD, duration: reduced() ? 0 : 800});
            var ln = idx.map(function (s) { return s.lng; }), la = idx.map(function (s) { return s.lat; });
            m.fitBounds([[Math.min.apply(null, ln), Math.min.apply(null, la)], [Math.max.apply(null, ln), Math.max.apply(null, la)]], {padding: 48, maxZoom: 14, duration: reduced() ? 0 : 800});
          },
          me: function (p) {
            if (!ready) return; if (meMk) { meMk.remove(); meMk = null; } if (!p) return;
            var d = document.createElement('div'); d.className = 'sp-me'; d.title = '你的位置';
            meMk = new ml.Marker({element: d}).setLngLat([p.lng, p.lat]).addTo(m);
          },
          /* 拉到「你的位置＋最近的 5 間」 */
          near: function () {
            if (!ready || !me) return;
            var pts = stores.slice().sort(function (a, b) { return a.km - b.km; }).slice(0, 5).concat([me]);
            var ln = pts.map(function (s) { return s.lng; }), la = pts.map(function (s) { return s.lat; });
            m.fitBounds([[Math.min.apply(null, ln), Math.min.apply(null, la)], [Math.max.apply(null, ln), Math.max.apply(null, la)]], {padding: 56, maxZoom: 14, duration: reduced() ? 0 : 900});
          },
          resize: function () { m.resize(); }
        };
      }, function () { el.classList.add('sp-nomap'); });
    }
    return api;
  }

  window.GiantStorePicker = {mount: mount, data: data};
})();
