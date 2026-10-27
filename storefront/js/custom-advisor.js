/* 客製化頁（custom-studio、customized.html）的選車顧問對話。
   沿用 css/advisor.css 的對話框樣式與 js/advisor.js 的 Genie 開關動畫；回答只用客製化流程已有的資訊（車系、等級、塗裝、尺寸、門市流程）。
   跟 header.js 的 data-ai="tip" 搭配：點頭像開關對話框；說明卡的「好，聊聊看」打開對話框並接著這一步說明。
   API：window.GiantChat = {open, close, toggle, quiet} */
(function () {
  var script = document.currentScript || document.querySelector('script[src*="custom-advisor.js"]');
  var ROOT = script ? script.src.replace(/js\/custom-advisor\.js.*$/, '') : '';      /* …/storefront/ */
  var CUSTOM = ROOT + '../customized.html';
  var $ = function (id) { return document.getElementById(id); };
  var onConfigurator = typeof window.routeTo === 'function' && typeof window.GiantCfg === 'function';
  var cfg = function () { return onConfigurator ? window.GiantCfg() : {}; };   /* customized.html 的狀態（let 變數不在 window 上，由頁面提供） */

  /* ---------- 資料：四個車系 ---------- */
  var SER = [
    {id: 'propel', n: 'PROPEL', tag: '空力公路車', line: '平路與衝刺最快', img: 'propel-sl1', ride: '平路速度、衝刺'},
    {id: 'tcr', n: 'TCR', tag: '競賽公路車', line: '輕量全能，爬坡衝刺都強', img: 'tcr-sl0red', ride: '比賽、爬坡'},
    {id: 'defy', n: 'DEFY', tag: '耐力公路車', line: '長距離最舒適', img: 'defy-pro0', ride: '長途、舒適'},
    {id: 'trinity', n: 'TRINITY', tag: '三鐵計時車', line: '長時間維持低風阻', img: 'trinity-sl1', ride: '三鐵、計時賽'}
  ];
  var byId = function (id) { return SER.filter(function (x) { return x.id === id; })[0]; };

  /* ---------- 樣式與 Genie 動畫 ---------- */
  if (!document.querySelector('link[href*="advisor.css"]')) {
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = ROOT + 'css/advisor.css?v=hdr1023'; document.head.appendChild(l);
  }
  var css = document.createElement('style');
  css.textContent =
    ':where(#advisor) button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}' +
    ':where(#advisor) input{font:inherit}' +
    '#advisor{--line:#DCE1E7;--ink:#141A22;--ink-70:#4A5563;--ink-50:#7A8492;--navy:#0E1726;--ease:cubic-bezier(.16,1,.3,1);font-family:"Inter","Noto Sans TC",sans-serif}' +
    '.cx-series{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px}' +
    '.cx-series a{display:grid;padding:6px 8px 8px;border:1px solid #DCE1E7;border-radius:10px;background:#fff;text-decoration:none;color:#141A22;transition:border-color .2s}' +
    '.cx-series a:hover{border-color:#141A22}.cx-series img{width:100%;height:48px;object-fit:contain}.cx-series b{font-size:12.5px;font-weight:800}.cx-series small{font-size:11.5px;color:#7A8492}' +
    '.cx-go{display:inline-flex;align-items:center;gap:6px;margin-top:10px;height:36px;padding:0 14px;border-radius:999px;background:#0E1726;color:#fff!important;font-size:13px;font-weight:700;text-decoration:none}' +
    '.am .cx-ctx ul{margin:8px 0 0;padding:0;list-style:none;display:grid;gap:6px}.am .cx-ctx li{display:grid;grid-template-columns:1fr auto;column-gap:10px}' +
    '.am .cx-ctx li b{font-size:13px}.am .cx-ctx li span{font-size:12px;color:#4A5563;white-space:nowrap}.am .cx-ctx li small{grid-column:1/-1;font-size:12px;color:#7A8492;line-height:1.5}' +
    '.am .cx-ctx li a{display:contents;color:inherit;text-decoration:none}.am .cx-ctx .tip-note{margin:6px 0 0;font-size:12px;color:#7A8492}' +
    '.am .cx-ctx h4{margin:0 0 2px;font-size:14px}.am .cx-ctx p{margin:0}' +
    '.cx-typing{display:inline-flex;gap:4px;padding:4px 2px}.cx-typing i{width:6px;height:6px;border-radius:50%;background:#B8C0CA;animation:cxDot 1s infinite}.cx-typing i:nth-child(2){animation-delay:.15s}.cx-typing i:nth-child(3){animation-delay:.3s}' +
    '@keyframes cxDot{50%{opacity:.3;transform:translateY(-2px)}}' +
    /* 客製化編輯頁：開對話框時，選車系／選車款／已儲存頁往左讓出位置（跟首頁、詳細頁一樣不被蓋住） */
    '@media(min-width:1100px){body.adv-open .pick-page,body.adv-open .fav-page{padding-right:424px;transition:padding .45s cubic-bezier(.16,1,.3,1)}body.adv-open #configPage{padding-right:424px}body.adv-open .levels-grid{grid-template-columns:repeat(3,minmax(0,1fr))}body.adv-open .pick-shell{width:calc(100% - 72px)}body.adv-open #configPage .intro{grid-template-columns:minmax(0,1fr);grid-template-areas:"title" "steps";row-gap:0}body.adv-open #configPage .intro .steps{margin-top:10px}}' +
    '.pick-page,.fav-page{transition:padding .45s cubic-bezier(.16,1,.3,1)}';
  document.head.appendChild(css);
  if (typeof window.advisorGenie !== 'function') {
    var s = document.createElement('script'); s.src = ROOT + 'js/advisor.js?v=hdr1023'; document.head.appendChild(s);
  }

  /* ---------- 對話框 ---------- */
  var V = '<svg viewBox="0 0 22 28" fill="currentColor" aria-hidden="true"><path d="M7.29 6.33 10.7 15.23c.04.09.16.12.24.05l7.14-6.79c.11-.1.29.01.23.16l-7.4 19.27c-.05.12-.22.12-.27 0L.01.19C-.03.1.04 0 .14 0h21.28c.1 0 .17.1.14.19l-2.25 5.85a.15.15 0 0 1-.14.09H7.42c-.1 0-.17.1-.13.2Z"/></svg>';
  var box = document.createElement('aside');
  box.className = 'advisor'; box.id = 'advisor'; box.hidden = true; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'GIANT 選車顧問');
  box.innerHTML = '<header class="adv-hd"><span class="adv-av">' + V + '</span><div class="adv-who"><b>GIANT 選車顧問</b><small><i></i>線上・通常幾秒內回覆</small></div>' +
    '<button class="adv-x" id="advClose" type="button" aria-label="關閉"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></header>' +
    '<div class="adv-log" id="advLog" aria-live="polite"></div>' +
    '<div class="adv-quick" id="advQuick"><button type="button" data-v="series">幫我選車系</button><button type="button" data-v="tiers">等級差在哪</button><button type="button" data-v="paint">塗裝怎麼選</button><button type="button" data-v="size">尺寸怎麼選</button></div>' +
    '<form class="adv-in" id="advForm" autocomplete="off"><input id="advInput" type="text" placeholder="問車系、塗裝、尺寸或門市流程…" aria-label="與選車顧問對話">' +
    '<button class="adv-send" type="submit" aria-label="送出"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></form>';
  document.body.appendChild(box);
  /* 頭像換成目前選的顧問角色（buddy.js 會處理 .adv-av） */
  setTimeout(function () { if (window.Buddy && Buddy.use) { try { Buddy.use(localStorage.getItem('giant-buddy') || 'g'); } catch (e) {} } }, 600);

  var log = $('advLog'), anim = false, started = false, lastCtx = '';
  var mood = function (m, ms) { if (window.Buddy && Buddy.mood) Buddy.mood(m, ms); };
  function bubble(html, who) {
    var d = document.createElement('div'); d.className = 'am ' + (who || 'ai'); d.innerHTML = html;
    log.appendChild(d); log.scrollTop = log.scrollHeight; return d;
  }
  /* 顧問說話：先顯示「輸入中」，再出現內容；chips 是 [[值, 文字], …] */
  function say(html, chips, delay) {
    var t = bubble('<span class="cx-typing"><i></i><i></i><i></i></span>');
    mood('think');
    setTimeout(function () {
      t.innerHTML = html + (chips && chips.length ? '<div class="adv-chips">' + chips.map(function (c) { return '<button class="adv-chip" type="button" data-v="' + c[0] + '">' + c[1] + '</button>'; }).join('') + '</div>' : '');
      log.scrollTop = log.scrollHeight; mood('talk', 1200);
    }, delay || 650);
  }
  function me(text) { var d = bubble('', 'me'); d.textContent = text; }

  /* ---------- 目前在哪一步（給開場與「等級差在哪」用） ---------- */
  function ctx() {
    var c = typeof window.GiantTipContent === 'function' ? window.GiantTipContent() : null;
    if (c) return c;
    var host = $('siteHeader');
    return {title: host && host.dataset.aiTitle, text: host && host.dataset.aiText, html: seriesCards()};
  }
  function ctxKey() { var c = cfg(); return onConfigurator ? [c.view, c.series, c.page, c.paintTab, c.partsTab].join('|') : 'studio'; }
  function ctxHtml() {
    var c = ctx(); if (!c || !c.title) return '';
    return '<div class="cx-ctx"><h4>' + c.title + '</h4><p>' + (c.text || '') + '</p>' + (c.html || '') + '</div>';
  }
  function seriesCards() {
    return '<div class="cx-series">' + SER.map(function (x) {
      return '<a href="' + CUSTOM + '#levels/' + x.id + '" data-series="' + x.id + '"><img src="' + ROOT + 'custom-studio/img/' + x.img + '.webp" alt=""><b>' + x.n + '</b><small>' + x.tag + '</small></a>';
    }).join('') + '</div>';
  }
  function go(series) {          /* 到某個車系的「選擇你的 ○○ 車款」 */
    if (onConfigurator) { window.routeTo('#levels/' + series); return true; }
    location.href = CUSTOM + '#levels/' + series; return true;
  }

  /* ---------- 回答 ---------- */
  function answer(v) {
    var C = cfg(), cur = onConfigurator && C.series && byId(C.series);
    switch (v) {
      case 'series':
        return say('先跟我說你最常怎麼騎：', SER.map(function (x) { return ['pick-' + x.id, x.ride]; }));
      case 'tiers': {
        if (onConfigurator && (C.view === 'levels' || C.view === 'config') && cur) {
          if (C.view === 'levels') return say(ctxHtml());
          return say('這台是 ' + cur.n + ' 車系。想比較同車系的其他等級，可以回到「選擇你的 ' + cur.n + ' 車款」：', [['goto-' + cur.id, '看 ' + cur.n + ' 的所有車款']]);
        }
        return say('每個車系都分三種車架等級：<br><b>Advanced SL</b> 最輕的頂級碳纖車架<br><b>Advanced Pro</b> 高剛性碳纖，比賽與訓練兼顧<br><b>Advanced</b> 入門碳纖，最划算<br>先挑車系，我再幫你看這個車系各等級的價格。', [['series', '幫我選車系']]);
      }
      case 'paint':
        return say('塗裝有兩種做法：<br><b>特仕塗裝</b>：GIANT 設計好的整組配色，選一個就完成。<br><b>自由配色</b>：選一個版型，再分別設定上半車架、下半車架和 GIANT Logo 的顏色與漆面，部分顏色會加價。<br>另外還可以在上管加上你的專屬簽名。');
      case 'size':
        return say('在編輯頁第 2 步「尺寸與配備」輸入身高，我會依身高建議車架尺寸。介於兩個尺寸之間時，可以看「尺寸指南」，或到門市由技師量測確認。',
          onConfigurator && C.view === 'config' ? [['to-size', '帶我去尺寸']] : []);
      case 'store':
        return say('在網站上完成配置後加入購物車，接著到全台門市，由技師確認尺寸與零件搭配，再簽訂工單完成訂購。交車時間依車款與塗裝而定，門市會在下單前跟你確認。');
      case 'to-size':
        if (typeof window.navigate === 'function') window.navigate('parts');
        return say('幫你切到「尺寸與配備」了，在右邊輸入身高就會看到建議尺寸。');
    }
    if (/^pick-/.test(v)) {
      var x = byId(v.slice(5));
      return say('建議先看 <b>' + x.n + '</b>（' + x.tag + '）：' + x.line + '。', [['goto-' + x.id, '看 ' + x.n + ' 車款 →'], ['series', '換一個騎法']]);
    }
    if (/^goto-/.test(v)) { go(v.slice(5)); return say('帶你過去了，挑一台就能開始配置。'); }
  }
  function route(text) {
    if (/車系|哪一台|哪台|適合我|選車|推薦/.test(text)) return answer('series');
    if (/等級|差別|差在哪|SL|Pro|價格|多少錢/.test(text)) return answer('tiers');
    if (/塗裝|顏色|配色|漆|簽名/.test(text)) return answer('paint');
    if (/尺寸|身高|多高|幾號|size/i.test(text)) return answer('size');
    if (/門市|交車|多久|取車|訂購|付款|工單/.test(text)) return answer('store');
    for (var i = 0; i < SER.length; i++) if (text.toUpperCase().indexOf(SER[i].n) >= 0) return answer('pick-' + SER[i].id);
    return say('我可以幫你選車系、說明等級差別、塗裝和尺寸怎麼選，或是門市訂購的流程。', [['series', '幫我選車系'], ['paint', '塗裝怎麼選'], ['store', '門市流程']]);
  }

  /* ---------- 開關 ---------- */
  function greet() {
    var key = ctxKey(), body = ctxHtml();
    if (!started) {
      started = true; lastCtx = key;
      say('嗨，我是 GIANT 選車顧問 👋 ' + (body ? '你現在在這一步：' + body : '想打造一台自己的車，我可以幫你一步一步選。'), [['series', '幫我選車系'], ['tiers', '等級差在哪']], 500);
    } else if (key !== lastCtx && body) {
      lastCtx = key; say(body, null, 450);
    }
  }
  function open() {
    if (anim || !box.hidden) { if (!box.hidden) greet(); return; }
    if (window.Tips && Tips.close) Tips.close();
    if (window.GiantTip) GiantTip.hide();
    box.hidden = false; box.classList.add('on'); document.body.classList.add('adv-open');
    var orb = $('aiOrb'), done = function () { anim = false; greet(); $('advInput').focus({preventScroll: true}); };
    anim = true;
    if (typeof window.advisorGenie === 'function' && orb) window.advisorGenie(box, log, orb, 'out', done); else done();
  }
  function close() {
    if (anim || box.hidden) return;
    anim = true; document.body.classList.remove('adv-open');
    var orb = $('aiOrb'), done = function () { box.classList.remove('on'); box.hidden = true; anim = false; };
    if (typeof window.advisorGenie === 'function' && orb) window.advisorGenie(box, log, orb, 'in', done); else done();
  }
  var quietUntil = 0;
  function contextChanged() { if (box.hidden || !started) return false; greet(); return true; }
  window.GiantChat = {contextChanged: contextChanged, open: open, close: close, toggle: function () { box.hidden ? open() : close(); }, quiet: function () { quietUntil = 1; }, isQuiet: function () { return !!quietUntil; }};

  $('advClose').onclick = close;
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !box.hidden) close(); });
  box.addEventListener('click', function (e) {
    var c = e.target.closest('[data-v]');
    if (c) { me(c.textContent.trim()); answer(c.dataset.v); return; }
    var a = e.target.closest('a[data-series]');
    if (a && onConfigurator) { e.preventDefault(); go(a.dataset.series); }
    var r = e.target.closest('.cx-ctx a[href^="#levels/"]');
    if (r && onConfigurator) { e.preventDefault(); window.routeTo(r.getAttribute('href')); }
  });
  $('advForm').addEventListener('submit', function (e) {
    e.preventDefault(); var i = $('advInput'), v = i.value.trim(); if (!v) return;
    me(v); i.value = ''; route(v);
  });

  /* 跟首頁一樣：進頁一下子後，主動跳出這一步的說明卡（「先自己逛」之後這次就不再主動跳） */
  setTimeout(function () { if (!quietUntil && box.hidden && window.GiantTip && GiantTip.show) GiantTip.show(); }, 1800);
})();
