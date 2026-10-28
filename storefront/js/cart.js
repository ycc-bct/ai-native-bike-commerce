/* 全站共用的購物車：存在 localStorage，換頁、上一頁、別的分頁都同步。由 header.js 自動載入。
   GiantCart.add(item, {open}) / remove(id) / setQty(id, n) / list() / count() / total() / clear() / open() / close()
     item = {id, kind:'bike'|'acc'|'custom', name, price, img, qty?, meta:{size?, paint?, note?}, edit?}
     kind 'custom' 是客製車：結帳時只能選客製化自行車服務門市，不需付訂金；edit 是回到編輯頁的網址。
   購物車分兩區：客製車、車款與配件（groupName()：只有配件叫「配件」、只有整車叫「車款」）。一次只結一區（mode()）：客製車整區一起，車款與配件每件可單獨勾（item.off）。
   selected() / selTotal() 是這次要結帳的商品；clearSelected() 結帳完成後只移除這些。
   改變時在 document 發出 'cart:change'。header 右上角購物車圖示：顯示件數，點了打開右側購物車。 */
(function () {
  var KEY = 'giant-cart', MODE = 'giant-cart-mode';
  var script = document.currentScript || document.querySelector('script[src*="cart.js"]');
  var ROOT = script ? script.src.replace(/js\/cart\.js.*$/, '') : '';          /* …/storefront/ */
  function read() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function emit() { document.dispatchEvent(new CustomEvent('cart:change', {detail: read()})); }
  function write(l) { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch (e) {} emit(); }
  var money = function (n) { return 'NT$ ' + Math.round(n).toLocaleString('en-US'); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]; }); };
  /* 圖片路徑：data:／http／絕對路徑照用；其他是相對 storefront/ 的路徑 */
  var src = function (p) { return !p ? '' : /^(data:|https?:|\/)/.test(p) ? p : ROOT + p; };

  var isC = function (x) { return x.kind === 'custom'; };
  function mode() {
    var l = read(), m; try { m = localStorage.getItem(MODE); } catch (e) {}
    var hasC = l.some(isC), hasO = l.some(function (x) { return !isC(x); });
    if (m === 'custom' && hasC || m === 'other' && hasO) return m;
    return hasC ? 'custom' : 'other';
  }
  function setMode(m) { try { localStorage.setItem(MODE, m); } catch (e) {} }
  function selected() { var m = mode(); return read().filter(function (x) { return m === 'custom' ? isC(x) : !isC(x) && !x.off; }); }

  /* 非客製那一區的名稱跟著內容變 */
  function groupName(l) {
    var os = l.filter(function (x) { return !isC(x); }), acc = os.filter(function (x) { return x.kind === 'acc'; }).length;
    return !os.length || (acc && acc < os.length) ? '車款與配件' : acc ? '配件' : '車款';
  }

  var recent = [];

  /* 空狀態的兩個入口（購物車、我的最愛共用）：GIANT 選車顧問、情境式問卷 */
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
  function avatarHtml() {
    var orb = document.getElementById('aiOrb'), img = orb && orb.querySelector('img');
    if (img) { var box = img.parentNode.cloneNode(true); box.querySelectorAll('.tip-new,.orb-dot').forEach(function (x) { x.remove(); }); return box.tagName === 'BUTTON' ? box.innerHTML : box.outerHTML; }
    var c = 'g'; try { c = localStorage.getItem('giant-buddy') || 'g'; } catch (e) {}
    return '<img src="' + ROOT + 'img/buddy/' + (/^[ad]$/.test(c) ? c + '.webp?v=3' : 'g-sm.svg?v=2') + '" alt="">';
  }
  function entries() {
    return '<div class="ge-rows">' +
      '<button type="button" class="ge-row" data-entry="advisor"><span class="ge-ic ge-av" aria-hidden="true">' + avatarHtml() + '</span><span><b>問 GIANT 選車顧問</b><small>說說你想怎麼騎，<span class="nb">幫你挑一台。</span></small></span>' + CHEV + '</button>' +
      '<button type="button" class="ge-row" data-entry="quiz"><span class="ge-ic" aria-hidden="true"><img src="' + ROOT + 'img/quiz/river-straight.webp" alt=""></span><span><b>情境式問卷</b><small>騎一段路，3 分鐘<span class="nb">找到適合你的車。</span></small></span>' + CHEV + '</button></div>';
  }
  /* 問顧問：這頁有顧問對話就直接打開，沒有就到首頁打開 */
  function goEntry(kind, done) {
    if (done) done();
    if (kind === 'quiz') { location.href = ROOT + 'ride.html'; return; }
    setTimeout(function () {
      if (window.GiantChat && GiantChat.open) GiantChat.open();
      else if (typeof window.openAdvisor === 'function' && document.getElementById('advisor')) { if (document.getElementById('advisor').hidden) window.openAdvisor(false); }
      else location.href = ROOT + 'index.html?ai=1';
    }, 260);
  }   /* 最近加入的商品：一次加好幾件（例如建議配件）時，小卡片合在一起顯示 */

  var api = {
    list: read,
    count: function () { return read().reduce(function (s, x) { return s + (x.qty || 1); }, 0); },
    total: function () { return read().reduce(function (s, x) { return s + x.price * (x.qty || 1); }, 0); },
    hasCustom: function () { return read().some(isC); },
    mode: mode,
    groupName: function (list) { return groupName(list || read()); },
    emptyEntries: function () { return entries(); },
    goEntry: goEntry,
    selected: selected,
    selTotal: function () { return selected().reduce(function (s, x) { return s + x.price * (x.qty || 1); }, 0); },
    /* 勾選：'custom' 整區；'other' 其他商品全選／全不選；商品 id 單件切換。勾了其他區就取消另一區 */
    check: function (what) {
      var l = read(), m = mode();
      if (what === 'custom') { setMode('custom'); return write(l); }
      var others = l.filter(function (x) { return !isC(x); });
      if (what === 'other') {
        var all = m === 'other' && others.every(function (x) { return !x.off; });
        others.forEach(function (x) { x.off = all; });
        setMode('other');
      } else {
        var it = others.filter(function (x) { return x.id === what; })[0]; if (!it) return;
        if (m !== 'other') { others.forEach(function (x) { x.off = x !== it; }); } else it.off = !it.off;
        setMode('other');
      }
      write(l);
    },
    clearSelected: function () { var ids = selected().map(function (x) { return x.id; }); write(read().filter(function (x) { return ids.indexOf(x.id) < 0; })); },
    add: function (item, opts) {
      var l = read(), same = l.filter(function (x) { return x.id === item.id; })[0];
      if (same) { if (!isC(same)) same.qty = (same.qty || 1) + (item.qty || 1); same.off = false; } else { item.qty = isC(item) ? 1 : item.qty || 1; l.push(item); }
      setMode(isC(item) ? 'custom' : 'other');
      write(l);
      recent.push({item: item, t: Date.now()});
      if (opts && opts.open === false) return;
      if (isC(item)) api.open(item.id); else pop();   /* 客製車打開購物車；其他商品只在購物車圖示下彈出小卡片 */
    },
    remove: function (id) { write(read().filter(function (x) { return x.id !== id; })); },
    setQty: function (id, n) { var l = read(); l.forEach(function (x) { if (x.id === id) x.qty = Math.max(1, Math.min(9, n)); }); write(l); },
    clear: function () { write([]); },
    url: function (p) { return src(p); },
    money: money
  };

  /* ---------- 右側購物車 ---------- */
  var css = document.createElement('style');
  css.textContent =
    '.gc-scrim{position:fixed;inset:0;z-index:90;background:rgba(14,23,38,.32);opacity:0;transition:opacity .3s}.gc-scrim.on{opacity:1}' +
    '.gc-drawer{position:fixed;z-index:91;top:0;right:0;bottom:0;width:min(440px,100vw);display:flex;flex-direction:column;background:#fff;box-shadow:-24px 0 60px rgba(20,26,34,.16);transform:translateX(100%);transition:transform .45s cubic-bezier(.16,1,.3,1);font-family:"Inter","Noto Sans TC",-apple-system,"PingFang TC",sans-serif;color:#141A22}' +
    '.gc-drawer:focus{outline:none}.gc-drawer.on{transform:none}.gc-drawer[hidden],.gc-scrim[hidden]{display:none}' +
    '.gc-drawer *{box-sizing:border-box}.gc-drawer button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}' +
    '.gc-drawer :focus-visible{outline:3px solid #64748b;outline-offset:3px}' +
    '.gc-hd{display:flex;align-items:center;gap:12px;padding:22px 24px 18px;border-bottom:1px solid #DCE1E7}.gc-hd h2{margin:0;font-size:20px;font-weight:800}.gc-hd span{font-size:13px;color:#7A8492}' +
    '.gc-x{margin-left:auto;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;color:#4A5563}.gc-x:hover{background:#F1F3F5}.gc-x svg{width:20px;height:20px}' +
    '.gc-body{flex:1;overflow-y:auto;padding:8px 24px 16px}' +
    '.gc-sec{display:flex;align-items:center;gap:12px;padding:18px 0 4px;cursor:pointer}.gc-sec+.gc-item{border-top:0}' +
    '.gc-sec b{font-size:15px;font-weight:800}.gc-sec small{margin-left:auto;font-size:12.5px;color:#4A5563;font-variant-numeric:tabular-nums}' +
    '.gc-block+.gc-block{margin:8px -24px 0;padding:0 24px;border-top:8px solid #F3F5F7}.gc-block>.gc-item:last-child{border-bottom:0}.gc-block.dim .gc-item{opacity:.55}.gc-block.dim .gc-item:hover{opacity:.8}' +
    '.gc-drawer input[type=checkbox]{flex:none;width:18px;height:18px;margin:0;accent-color:#0E1726;cursor:pointer}' +
    '.gc-item{display:grid;grid-template-columns:18px 92px 1fr;gap:14px;align-items:start;padding:16px 0;border-bottom:1px solid #EEF1F4}.gc-item>input{margin-top:26px!important}' +
    '.gc-price small{display:block;font-size:11.5px;font-weight:600;color:#7A8492}' +
    '.gc-go[aria-disabled=true]{background:#C9CFD6;pointer-events:none}' +
    '.gc-top{display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:12px;align-items:start}.gc-top .gc-price{grid-row:1;grid-column:2}' +
    '.gc-item.new{animation:gcIn .6s cubic-bezier(.16,1,.3,1)}@keyframes gcIn{from{background:#EEF3FF}to{background:transparent}}' +
    '.gc-ph{width:92px;height:70px;border-radius:8px;background:#F3F5F7;display:grid;place-items:center;overflow:hidden}.gc-ph img{width:92%;height:92%;object-fit:contain;mix-blend-mode:multiply}' +
    '.gc-name{font-size:14px;font-weight:700;line-height:1.4}.gc-meta{margin-top:2px;font-size:12.5px;color:#4A5563;line-height:1.55}' +
    '.gc-tag{display:inline-block;margin-top:6px;padding:2px 8px;border-radius:999px;background:#EEF3FF;color:#1F4FE0;font-size:11.5px;font-weight:700}' +
    '.gc-row{display:flex;align-items:center;gap:14px;margin-top:10px;flex-wrap:wrap}.gc-row>*{white-space:nowrap}' +
    '.gc-qty{display:inline-flex;align-items:center;border:1px solid #DCE1E7;border-radius:999px;height:30px}.gc-qty button{width:30px;height:28px;font-size:16px;color:#4A5563}.gc-qty button:disabled{opacity:.3;cursor:default}.gc-qty b{min-width:22px;text-align:center;font-size:13px;font-variant-numeric:tabular-nums}' +
    '.gc-link{font-size:12.5px;font-weight:600;color:#4A5563;text-decoration:underline;text-underline-offset:3px}.gc-link:hover{color:#141A22}' +
    '.gc-price{font-size:14px;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap;text-align:right}.gc-price.ask{font-size:12.5px;font-weight:600;color:#4A5563}' +
    '.gc-empty{padding:44px 0 0;text-align:center;color:#4A5563;font-size:14px;line-height:1.75}.gc-empty b{display:block;font-size:16px;color:#141A22;margin-bottom:6px}.gc-empty .nb{display:inline-block}' +
    '.ge-rows{display:grid;gap:10px;margin-top:26px;text-align:left}' +
    '.ge-row{display:grid!important;grid-template-columns:52px minmax(0,1fr) 16px;gap:14px;align-items:center;width:100%;padding:14px 14px 14px 12px!important;border:1px solid #DCE1E7!important;border-radius:12px;background:#fff!important;text-align:left;cursor:pointer;font-family:inherit;color:#141A22;transition:border-color .2s}' +
    '.ge-row:hover{border-color:#7A8492!important}.ge-row:focus-visible{outline:3px solid #64748b;outline-offset:3px}' +
    '.ge-ic{position:relative;width:52px;height:52px;border-radius:12px;overflow:hidden;display:grid;place-items:center;background:#EEF3FF}' +
    '.ge-ic>img{width:100%;height:100%;object-fit:cover}.ge-av>*{width:40px!important;height:40px!important;position:relative!important;inset:auto!important;margin:0!important;display:block}' +
    '.ge-av .bd img,.ge-av .bd svg{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}.ge-av .bd .happy{display:none}' +
    '.ge-row b{display:block;font-size:15px;font-weight:700}.ge-row small{display:block;margin-top:3px;font-size:13px;line-height:1.55;color:#4A5563}.ge-row small .nb{display:inline-block}' +
    '.ge-row>svg{width:16px;height:16px;color:#7A8492}' +
    '.gc-ft{padding:18px 24px 22px;border-top:1px solid #DCE1E7;background:#fff}' +
    '.gc-sum{display:flex;justify-content:space-between;align-items:baseline;font-size:14px}.gc-sum strong{font-size:22px;font-weight:800;font-variant-numeric:tabular-nums}' +
    '.gc-note{margin:6px 0 0;font-size:12.5px;color:#7A8492;line-height:1.6}.gc-drawer .nb{display:inline-block}' +
    '.gc-go{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:14px;height:48px;border-radius:8px;background:#0E1726;color:#fff!important;font-size:15px;font-weight:700;text-decoration:none}.gc-go:hover{background:#1C2A40}' +
    '.gc-more{display:block;width:100%;margin-top:10px;height:40px;font-size:13.5px;font-weight:600;color:#4A5563!important}' +
    '.gc-pop{position:fixed;z-index:92;width:min(340px,calc(100vw - 32px));padding:16px;border-radius:14px;background:#fff;border:1px solid #DCE1E7;box-shadow:0 18px 44px rgba(20,26,34,.18);font-family:"Inter","Noto Sans TC",-apple-system,"PingFang TC",sans-serif;color:#141A22;transform-origin:top right;animation:gcPop .32s cubic-bezier(.16,1,.3,1)}' +
    '.gc-pop.out{opacity:0;transform:translateY(-6px);transition:opacity .2s,transform .2s}' +
    '@keyframes gcPop{from{opacity:0;transform:translateY(-8px) scale(.97)}}' +
    '.gc-pop *{box-sizing:border-box}.gc-pop button,.gc-pop a{font:inherit}' +
    '.gc-pop-hd{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700}.gc-pop-hd i{width:20px;height:20px;border-radius:50%;background:#E8F5EC;color:#1E7A43;display:grid;place-items:center;font-style:normal;font-size:12px}' +
    '.gc-pop-x{margin-left:auto;width:28px;height:28px;border:0;background:none;border-radius:50%;color:#7A8492;cursor:pointer;display:grid;place-items:center}.gc-pop-x:hover{background:#F1F3F5;color:#141A22}.gc-pop-x svg{width:16px;height:16px}' +
    '.gc-pop-it{display:grid;grid-template-columns:64px minmax(0,1fr);gap:12px;align-items:center;margin:12px 0 14px}' +
    '.gc-pop-ph{width:64px;height:48px;border-radius:8px;background:#F3F5F7;display:grid;place-items:center;overflow:hidden}.gc-pop-ph img{width:90%;height:90%;object-fit:contain;mix-blend-mode:multiply}' +
    '.gc-pop-nm{font-size:13.5px;font-weight:700;line-height:1.4;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.gc-pop-pr{margin-top:2px;font-size:13px;color:#4A5563;font-variant-numeric:tabular-nums}' +
    '.gc-pop-acts{display:grid;grid-template-columns:1fr 1fr;gap:8px}' +
    '.gc-pop-acts>*{display:flex;align-items:center;justify-content:center;height:40px;border-radius:8px;font-size:13.5px;font-weight:700;text-decoration:none;cursor:pointer}' +
    '.gc-pop-view{border:1px solid #DCE1E7;background:#fff;color:#141A22}.gc-pop-view:hover{border-color:#7A8492}.gc-pop-go{border:0;background:#0E1726;color:#fff!important}.gc-pop-go:hover{background:#1C2A40}' +
    '.gc-badge.bump{animation:gcBump .5s cubic-bezier(.16,1,.3,1)}@keyframes gcBump{30%{transform:scale(1.35)}}' +
    '@media (prefers-reduced-motion:reduce){.gc-pop,.gc-badge.bump{animation:none}}' +
    '.gc-badge{position:absolute;right:-8px;top:-6px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#1F4FE0;color:#fff;font:700 11px/18px "Inter",sans-serif;text-align:center}' +
    '@media (prefers-reduced-motion:reduce){.gc-drawer,.gc-scrim{transition:none}.gc-item.new{animation:none}}';
  document.head.appendChild(css);

  var X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var scrim = document.createElement('div'); scrim.className = 'gc-scrim'; scrim.hidden = true;
  var dr = document.createElement('aside'); dr.className = 'gc-drawer'; dr.hidden = true; dr.setAttribute('role', 'dialog'); dr.tabIndex = -1; dr.setAttribute('aria-label', '購物車');
  dr.innerHTML = '<div class="gc-hd"><h2>購物車</h2><span id="gcN"></span><button class="gc-x" type="button" aria-label="關閉購物車">' + X + '</button></div><div class="gc-body" id="gcBody"></div><div class="gc-ft" id="gcFt"></div>';
  function mount() { if (!scrim.isConnected) { document.body.appendChild(scrim); document.body.appendChild(dr); } }

  var fresh = null;
  /* 價格 0 的商品（價格請洽門市）不算進小計 */
  function price(x) { return x.price ? '<span class="gc-price">' + money(x.price * (x.qty || 1)) + '</span>' : '<span class="gc-price ask">價格請洽門市</span>'; }
  function askN() { return read().filter(function (x) { return !x.price; }).length; }
  function render() {
    var l = read(), body = dr.querySelector('#gcBody'), ft = dr.querySelector('#gcFt');
    dr.querySelector('#gcN').textContent = l.length ? api.count() + ' 件' : '';
    if (!l.length) {
      body.innerHTML = '<div class="gc-empty"><b>購物車是空的</b>還沒決定要哪一台？<span class="nb">從這裡開始找。</span></div>' + entries();
      ft.innerHTML = ''; ft.hidden = true;
      return;
    }
    var m = mode(), cs = l.filter(isC), os = l.filter(function (x) { return !isC(x); });
    var osOn = os.filter(function (x) { return m === 'other' && !x.off; });
    function block(kind, list, head) { return list.length ? '<section class="gc-block' + (m === kind ? '' : ' dim') + '">' + head + list.map(row).join('') + '</section>' : ''; }
    ft.hidden = false;
    body.innerHTML =
      block('custom', cs, '<label class="gc-sec"><input type="checkbox" data-check="custom"' + (m === 'custom' ? ' checked' : '') + '><b>客製車</b><small>到店確認後付款</small></label>') +
      block('other', os, '<label class="gc-sec"><input type="checkbox" data-check="other"' + (osOn.length ? ' checked' : '') + ' data-mixed="' + (osOn.length && osOn.length < os.length ? 1 : '') + '"><b>' + groupName(l) + '</b><small>' + (osOn.length ? '已選 ' + osOn.length + ' 件' : '') + '</small></label>');
    body.querySelectorAll('[data-mixed="1"]').forEach(function (c) { c.indeterminate = true; });
    function row(x) {
      var meta = [x.meta && x.meta.paint, x.meta && x.meta.size ? '尺寸 ' + x.meta.size : '', x.meta && x.meta.note].filter(Boolean).map(esc).join('・');
      var q = x.qty || 1, c = isC(x);
      return '<article class="gc-item' + (x.id === fresh ? ' new' : '') + '" data-id="' + esc(x.id) + '">' +
        (c ? '<span></span>' : '<input type="checkbox" data-check="' + esc(x.id) + '" aria-label="結帳 ' + esc(x.name) + '"' + (m === 'other' && !x.off ? ' checked' : '') + '>') + '<div class="gc-ph">' + (x.img ? '<img src="' + esc(src(x.img)) + '" alt="">' : '') + '</div><div>' +
        '<div class="gc-top"><div><div class="gc-name">' + esc(x.name) + '</div>' + (meta ? '<div class="gc-meta">' + meta + '</div>' : '') + '</div>' + (c ? '<span class="gc-price"><small>預估</small>' + money(x.price) + '</span>' : price(x)) + '</div>' +
        '<div class="gc-row">' + (c ? '' : '<span class="gc-qty"><button type="button" data-q="-1" aria-label="減少"' + (q <= 1 ? ' disabled' : '') + '>−</button><b>' + q + '</b><button type="button" data-q="1" aria-label="增加">+</button></span>') +
        (x.edit ? '<a class="gc-link" href="' + esc(src(x.edit)) + '">回到編輯</a>' : '') +
        '<button class="gc-link" type="button" data-rm>移除</button></div></div></article>';
    }
    var sel = selected(), ask = sel.filter(function (x) { return !x.price; }).length;
    var left = m === 'custom' ? os.length : cs.length;
    var keep = left ? (m === 'custom' ? groupName(l) : '客製車') + '會留在購物車，<span class="nb">之後再結帳。</span>' : '';
    ft.innerHTML = m === 'custom'
      ? '<div class="gc-sum"><span>客製車 ' + cs.length + ' 台・預估</span><strong>' + money(api.selTotal()) + '</strong></div>' +
        '<p class="gc-note">不需付訂金。到客製化自行車服務門市，由技師<span class="nb">確認尺寸與工單後再付款。</span>' + keep + '</p>' +
        '<a class="gc-go" href="' + ROOT + 'checkout.html">預約門市確認</a>'
      : '<div class="gc-sum"><span>小計（' + sel.reduce(function (s, x) { return s + (x.qty || 1); }, 0) + ' 件）</span><strong>' + money(api.selTotal()) + '</strong></div>' +
        '<p class="gc-note">' + (ask ? '另有 ' + ask + ' 件價格請洽門市，不含在小計。' : '') + (sel.length ? (sel.some(function (x) { return x.kind !== 'acc'; }) ? '下一步選擇取貨門市與到店時間。' : '下一步選擇取貨方式。') : '') + keep + '</p>' +
        '<a class="gc-go" href="' + ROOT + 'checkout.html"' + (sel.length ? '' : ' aria-disabled="true"') + '>' + (sel.length ? '前往結帳' : '請勾選要結帳的商品') + '</a>';
    fresh = null;
  }
  var lastFocus = null;
  api.open = function (justAdded) {
    hidePop();
    mount(); fresh = justAdded || null; render(); lastFocus = document.activeElement;
    scrim.hidden = false; dr.hidden = false;
    requestAnimationFrame(function () { scrim.classList.add('on'); dr.classList.add('on'); dr.focus({preventScroll: true}); });
    if (window.GiantChat && GiantChat.close) GiantChat.close();
  };
  api.close = function () {
    scrim.classList.remove('on'); dr.classList.remove('on');
    setTimeout(function () { if (!dr.classList.contains('on')) { scrim.hidden = true; dr.hidden = true; } }, 400);
    if (lastFocus && lastFocus.focus) lastFocus.focus({preventScroll: true});
  };
  scrim.onclick = api.close;
  dr.addEventListener('click', function (e) {
    var it = e.target.closest('.gc-item'), id = it && it.dataset.id;
    if (e.target.closest('.gc-x') || e.target.closest('[data-close]')) return api.close();
    var en = e.target.closest('[data-entry]');
    if (en) { goEntry(en.dataset.entry, api.close); return; }
    var ck = e.target.closest('[data-check]');
    if (ck) { api.check(ck.dataset.check); return; }
    var q = e.target.closest('[data-q]');
    if (q && id) { var cur = read().filter(function (x) { return x.id === id; })[0]; api.setQty(id, (cur.qty || 1) + (+q.dataset.q)); return; }
    if (e.target.closest('[data-rm]') && id) api.remove(id);
  });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !dr.hidden) api.close(); });
  document.addEventListener('cart:change', function () { if (!dr.hidden) render(); badge(); });
  addEventListener('storage', function (e) { if (e.key === KEY) emit(); });
  addEventListener('pageshow', function (e) { if (e.persisted) emit(); });

  /* ---------- 加入購物車的小卡片：從 header 購物車圖示下方彈出，3 秒後自己收起（滑鼠移上去或聚焦時暫停） ---------- */
  var popEl = null, popTimer = null;
  function hidePop() {
    clearTimeout(popTimer); if (!popEl) return;
    var el = popEl; popEl = null; el.classList.add('out'); setTimeout(function () { el.remove(); }, 220);
  }
  function armPop() { clearTimeout(popTimer); popTimer = setTimeout(hidePop, 3000); }
  function pop() {
    var now = Date.now(), batch = recent.filter(function (r) { return now - r.t < 600; }).map(function (r) { return r.item; });
    recent = [];
    if (!batch.length) return;
    if (popEl) { popEl.remove(); popEl = null; }
    var first = batch[0], n = batch.reduce(function (s, x) { return s + (x.qty || 1); }, 0), sum = batch.reduce(function (s, x) { return s + (x.price || 0) * (x.qty || 1); }, 0);
    var el = document.createElement('div'); el.className = 'gc-pop'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
    el.innerHTML = '<div class="gc-pop-hd"><i aria-hidden="true">✓</i>已加入購物車<button class="gc-pop-x" type="button" aria-label="關閉">' + X + '</button></div>' +
      '<div class="gc-pop-it"><div class="gc-pop-ph">' + (first.img ? '<img src="' + esc(src(first.img)) + '" alt="">' : '') + '</div><div style="min-width:0">' +
      '<div class="gc-pop-nm">' + (batch.length > 1 ? '已加入 ' + n + ' 項商品' : esc(first.name)) + '</div>' +
      '<div class="gc-pop-pr">' + (batch.length > 1 ? esc(first.name) + ' 等・' : '') + (sum ? money(sum) : '價格請洽門市') + '</div></div></div>' +
      '<div class="gc-pop-acts"><button class="gc-pop-view" type="button">查看購物車</button><a class="gc-pop-go" href="' + ROOT + 'checkout.html">前往結帳</a></div>';
    document.body.appendChild(el); popEl = el;
    var a = cartIcon(), r = a && a.getBoundingClientRect();
    if (r && r.width) { el.style.top = Math.round(r.bottom + 10) + 'px'; el.style.right = Math.max(16, Math.round(innerWidth - r.right - 12)) + 'px'; }
    else { el.style.top = '80px'; el.style.right = '16px'; }
    el.querySelector('.gc-pop-x').onclick = hidePop;
    el.querySelector('.gc-pop-view').onclick = function () { hidePop(); api.open(); };
    el.addEventListener('mouseenter', function () { clearTimeout(popTimer); });
    el.addEventListener('mouseleave', armPop);
    el.addEventListener('focusin', function () { clearTimeout(popTimer); });
    el.addEventListener('focusout', function (e) { if (!el.contains(e.relatedTarget)) armPop(); });
    armPop();
  }
  document.addEventListener('pointerdown', function (e) { if (popEl && !popEl.contains(e.target) && !e.target.closest('[aria-label^="購物車"]')) hidePop(); }, true);
  addEventListener('keydown', function (e) { if (e.key === 'Escape') hidePop(); });
  addEventListener('scroll', function () { if (popEl) { var a = cartIcon(), r = a && a.getBoundingClientRect(); if (r && r.width) popEl.style.top = Math.round(r.bottom + 10) + 'px'; } }, {passive: true});

  /* ---------- header 購物車圖示：件數＋點了打開 ---------- */
  function cartIcon() { return document.querySelector('#siteHeader [aria-label^="購物車"], header.site-nav [aria-label^="購物車"]'); }
  function badge() {
    var a = cartIcon(); if (!a) return;
    var n = api.count(), b = a.querySelector('.gc-badge');
    if (!b) { b = document.createElement('span'); b.className = 'gc-badge'; a.style.position = 'relative'; a.appendChild(b); }
    a.querySelectorAll('.cart-n,#cartCount,#cartN').forEach(function (o) { o.style.display = 'none'; });   /* 各頁舊的數字收起來，統一用這個 */
    if (b.textContent && +b.textContent < n) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }   /* 數字變多時跳一下 */
    b.textContent = n; b.style.display = n ? '' : 'none';
    a.setAttribute('aria-label', n ? '購物車，' + n + ' 件商品' : '購物車');
  }
  function bind() {
    var a = cartIcon(); if (!a || a._gc) return; a._gc = true;
    a.style.cursor = 'pointer'; a.removeAttribute('role');
    a.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); api.open(); }, true);
    badge();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();
  setTimeout(bind, 600);

  window.GiantCart = api;
})();
