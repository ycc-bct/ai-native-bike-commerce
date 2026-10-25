/* GIANT 選車顧問的角色頭像。由 header.js 自動載入，全站共用。
   三個角色，各有個性：
   A 深藍光澤球＝冷靜的教練：發光眼＋眉毛、沒有嘴；眨眼慢；招牌是挑眉、眼睛掃描。
   G 玻璃波浪球＝溫柔害羞的夥伴：小眼睛＋小微笑、會臉紅；常往旁邊瞄；招牌是臉紅、被點會像水球晃、漾開漣漪。
   D 安全帽＝活潑的騎友：大眼睛＋露齒笑；眨眼快、偶爾眨單眼；招牌是跳起來、眨眼、安全帽彈一下。
   另可切回原本的 V 標誌。底圖是沒有五官的角色圖（img/buddy/*.webp），五官用 SVG 疊上。
   表情（data-mood）：idle 閒置／greet 主動提示時／happy 打開對話、剛選這個角色／think 思考中／talk 回覆中；
     對話框標題的頭像另有 hover（滑過）／ack（點一下）／spam（連點 5 下的彩蛋）。
   觸發：#orbCallout 出現 → greet；#advisor 打開 → happy；Orb.set('connecting') → think、'working' → talk。
   出現位置：header 右上角、商品頁第二顆、首頁顧問卡片、各頁對話框標題，同步換角色與表情。
   Tips 首頁第一則（avatar）放角色切換；選擇存在 localStorage。
   API：Buddy.use('a'|'g'|'d'|'v')、Buddy.mood(name, ms) */
(function () {
  var script = document.currentScript || document.querySelector('script[src*="buddy.js"]');
  var ROOT = script ? script.src.replace(/js\/buddy\.js.*$/, '') : '';
  var KEY = 'giant-buddy';
  /* ex／ey：左眼位置；gap：兩眼距離；blink：眨眼間隔（毫秒）[最短, 隨機加多少] */
  var CHARS = {
    a: {name: '深藍光澤球', ex: 39, ey: 49, gap: 22, blink: [6000, 2500]},
    g: {name: '玻璃波浪球', ex: 40, ey: 37, gap: 20, mouth: 45, blink: [3500, 2500]},
    d: {name: '安全帽', ex: 40, ey: 66, gap: 20, mouth: 75, blink: [2500, 2000]}
  };
  var REDUCE = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cur = 'g';
  try { cur = localStorage.getItem(KEY) || 'g'; } catch (e) {}

  var css = document.createElement('style');
  css.textContent = [
    '.has-buddy{position:relative;background:none!important;border:0!important;box-shadow:none!important;overflow:visible}',
    '.has-buddy>svg,.has-buddy>.vmark,.has-buddy>.beam-ring,.has-buddy>.beam-glow{display:none!important}',
    '.bd{position:absolute;inset:-2px;pointer-events:none;transform-origin:50% 70%;animation:bd-breathe 4.6s ease-in-out infinite}',
    '.bd img{position:absolute;inset:0;width:100%;height:100%;filter:drop-shadow(0 2px 4px rgba(14,23,38,.18))}',
    '.adv-av.has-buddy{cursor:pointer}',
    '.adv-av.has-buddy .bd{inset:2px}',   /* 對話框標題：角色頭像小一點（40px 框裡約 36px） */
    '.has-buddy .bd>svg{position:absolute;inset:0;width:100%!important;height:100%!important;margin:0!important;overflow:visible}',   /* header 有 svg{20px} 的通用規則，這裡要蓋過 */
    '.bd .eyes{transition:transform .25s cubic-bezier(.16,1,.3,1)}',
    '.bd .eye,.bd .mo{transform-box:fill-box;transform-origin:center;transition:transform .25s cubic-bezier(.16,1,.3,1),opacity .2s}',
    '.bd.blink .eye{transform:scaleY(.12)}.bd.wink .eye-r{transform:scaleY(.12)}',
    /* 預設隱藏的備用五官 */
    '.bd .happy,.bd .dots,.bd .flat,.bd .spiral,.bd .mo-o,.bd .mo-talk,.bd .mo-hey,.bd .mo-pout,.bd .cheek{opacity:0}',
    '.bd .open-eyes,.bd .happy,.bd .dots,.bd .flat,.bd .spiral,.bd .cheek{transition:opacity .2s}',
    '.bd[data-mood=happy] .open-eyes{opacity:0}.bd[data-mood=happy] .happy{opacity:1}',
    '.bd[data-mood=talk] .mo-base{opacity:0}.bd[data-mood=talk] .mo-talk{opacity:1}',
    '.bd .mo-talk{animation:bd-talk .26s ease-in-out infinite alternate}',
    '.bd[data-mood=think] .eyes{transform:translate(2.5px,-3px)}',

    /* ---------- A 冷靜教練：眉毛是主要表情 ---------- */
    '.bd[data-c=a][data-mood=greet]{animation:bd-tilt 1.4s ease-in-out 1,bd-breathe 4.6s ease-in-out 1.4s infinite}',
    '.bd[data-c=a][data-mood=think] .open-eyes{opacity:0}.bd[data-c=a][data-mood=think] .dots{opacity:1}',
    '.bd[data-c=a] .dots circle{animation:bd-dot 1s ease-in-out infinite}.bd[data-c=a] .dots circle:nth-child(2){animation-delay:.15s}.bd[data-c=a] .dots circle:nth-child(3){animation-delay:.3s}',
    '.bd[data-c=a][data-mood=talk] .eye{animation:bd-glow .3s ease-in-out infinite alternate}',
    '.bd[data-c=a][data-mood=ack] .eyes{animation:bd-scan .75s ease-in-out 1}',
    '.bd[data-c=a][data-mood=ack] img{animation:bd-flash .6s ease-out 1}',
    '.bd[data-c=a][data-mood=spam] .open-eyes{opacity:0}.bd[data-c=a][data-mood=spam] .flat{opacity:1}',

    /* ---------- G 溫柔夥伴：臉紅、往旁邊瞄、像水球 ---------- */
    '.bd[data-c=g] .cheek{transition:opacity .35s}',
    '.bd[data-c=g][data-mood=greet] .cheek,.bd[data-c=g][data-mood=hover] .cheek,.bd[data-c=g][data-mood=happy] .cheek{opacity:.75}',
    '.bd[data-c=g][data-mood=greet] .eyes,.bd[data-c=g][data-mood=hover] .eyes{transform:translate(-3px,1.5px)!important}',
    '.bd[data-c=g][data-mood=greet]{animation:bd-shy 1.8s ease-in-out 1,bd-breathe 4.6s ease-in-out 1.8s infinite}',
    '.bd[data-c=g][data-mood=hover]{animation:bd-sway .9s ease-in-out 1}',
    '.bd[data-c=g][data-mood=ack] .open-eyes{opacity:0}.bd[data-c=g][data-mood=ack] .happy{opacity:1}.bd[data-c=g][data-mood=ack] .cheek{opacity:.6}',
    '.bd[data-c=g][data-mood=ack]{animation:bd-jelly .7s cubic-bezier(.34,1.56,.64,1) 1}',
    '.bd[data-c=g][data-mood=spam] .open-eyes{opacity:0}.bd[data-c=g][data-mood=spam] .spiral{opacity:1}',
    '.bd[data-c=g][data-mood=spam]{animation:bd-spin 1.1s cubic-bezier(.45,0,.25,1) 1}',
    '.bd[data-c=g] .spiral{transform-box:fill-box;transform-origin:center;animation:bd-rot 1s linear infinite}',
    '.bd[data-c=g].glance .eyes{transform:translate(3px,0)!important}',
    '.bd .ripple{position:absolute;width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:50%;border:1.5px solid rgba(120,170,255,.9);animation:bd-ripple .7s ease-out forwards}',
    /* G：玻璃裡的波浪慢慢流（光帶掃過），思考時變快 */
    '.bd[data-c=g]::after{content:"";position:absolute;left:14%;right:14%;top:52%;bottom:16%;border-radius:50%;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.75) 50%,transparent 70%) -120% 0/60% 100% no-repeat;mix-blend-mode:screen;animation:bd-flow 5.5s ease-in-out infinite}',
    '.bd[data-c=g][data-mood=think]::after{animation-duration:1.4s}',

    /* ---------- D 活潑騎友：大笑、跳、眨單眼 ---------- */
    '.bd[data-c=d][data-mood=greet] .mo-base{opacity:0}.bd[data-c=d][data-mood=greet] .mo-hey{opacity:1}.bd[data-c=d][data-mood=greet] .eye{transform:scale(1.25)}',
    '.bd[data-c=d][data-mood=greet]{animation:bd-hop2 1.1s cubic-bezier(.34,1.56,.64,1) 1,bd-breathe 4.6s ease-in-out 1.1s infinite}',
    '.bd[data-c=d][data-mood=happy]{animation:bd-hop .5s cubic-bezier(.34,1.56,.64,1) 1,bd-breathe 4.6s ease-in-out .5s infinite}',
    '.bd[data-c=d][data-mood=think]{rotate:-9deg;transition:rotate .3s}.bd[data-c=d][data-mood=think] .mo-base{opacity:0}.bd[data-c=d][data-mood=think] .mo-pout{opacity:1}',
    '.bd[data-c=d]{transition:rotate .3s,translate .3s}',
    '.bd[data-c=d][data-mood=hover] .eye{transform:scale(1.2)}.bd[data-c=d][data-mood=hover] .mo-base{transform:scale(1.15)}',
    '.bd[data-c=d][data-mood=ack]{animation:bd-hop .55s cubic-bezier(.34,1.56,.64,1) 1}.bd[data-c=d][data-mood=ack] .eye-r{transform:scaleY(.12)}',
    '.bd[data-c=d][data-mood=ack] img{animation:bd-helmet .55s cubic-bezier(.34,1.56,.64,1) 1}',
    '.bd[data-c=d][data-mood=spam]{animation:bd-spin 1s cubic-bezier(.45,0,.25,1) 1}.bd[data-c=d][data-mood=spam] .mo-base{opacity:0}.bd[data-c=d][data-mood=spam] .mo-hey{opacity:1}',
    '.bd-bubble{position:absolute;left:calc(100% - 10px);top:calc(100% - 14px);translate:0 0;padding:4px 9px;border-radius:999px;background:#141A22;color:#fff;font:700 12px/1.2 "Inter","Noto Sans TC",sans-serif;white-space:nowrap;pointer-events:none;animation:bd-pop 1.4s ease forwards;z-index:5}',

    '@keyframes bd-breathe{0%,100%{scale:1}50%{scale:1.025}}',
    '@keyframes bd-tilt{0%,100%{rotate:0}30%,70%{rotate:-6deg}}',
    '@keyframes bd-shy{0%,100%{rotate:0;scale:1}25%{rotate:5deg;scale:.97}55%{rotate:-3deg}80%{rotate:2deg}}',
    '@keyframes bd-sway{0%,100%{rotate:0}35%{rotate:-5deg}70%{rotate:3deg}}',
    '@keyframes bd-jelly{0%{scale:1}30%{scale:1.12 .9}55%{scale:.94 1.06}80%{scale:1.03 .98}100%{scale:1}}',
    '@keyframes bd-spin{0%{rotate:0}100%{rotate:360deg}}',
    '@keyframes bd-rot{to{transform:rotate(360deg)}}',
    '@keyframes bd-hop{0%{translate:0 0}40%{translate:0 -4px}100%{translate:0 0}}',
    '@keyframes bd-hop2{0%,100%{translate:0 0}20%{translate:0 -6px}40%{translate:0 0}60%{translate:0 -4px}80%{translate:0 0}}',
    '@keyframes bd-helmet{0%,100%{translate:0 0}40%{translate:0 -3px}}',
    '@keyframes bd-scan{0%{transform:translate(0,0)}30%{transform:translate(-4px,0)}65%{transform:translate(4px,0)}100%{transform:translate(0,0)}}',
    '@keyframes bd-flash{0%{filter:drop-shadow(0 2px 4px rgba(14,23,38,.18)) brightness(1.35)}100%{filter:drop-shadow(0 2px 4px rgba(14,23,38,.18)) brightness(1)}}',
    '@keyframes bd-dot{0%,100%{opacity:.35}50%{opacity:1}}',
    '@keyframes bd-talk{from{transform:scaleY(.35)}to{transform:scaleY(1)}}',
    '@keyframes bd-glow{from{opacity:.75}to{opacity:1}}',
    '@keyframes bd-flow{0%{background-position:-120% 0}60%,100%{background-position:220% 0}}',
    '@keyframes bd-ripple{to{transform:scale(4.2);opacity:0}}',
    '@keyframes bd-pop{0%{opacity:0;translate:-4px 4px;scale:.8}15%,75%{opacity:1;translate:0 0;scale:1}100%{opacity:0;translate:0 -4px;scale:1}}',
    '@media (prefers-reduced-motion:reduce){.bd,.bd::after,.bd *,.bd-bubble{animation:none!important;transition:none!important}}',
    /* Tips 裡的角色切換 */
    '.tips .bd-pick{display:flex;gap:8px;margin-top:10px}',
    '.tips .bd-pick button{display:grid;justify-items:center;gap:4px;width:64px;padding:6px 0 7px;border:1px solid #DCE1E7;border-radius:12px;background:#fff;font:600 11.5px/1.2 "Inter","Noto Sans TC",sans-serif;color:#4A5563;cursor:pointer}',
    '.tips .bd-pick button[aria-pressed=true]{border-color:#141A22;box-shadow:inset 0 0 0 1px #141A22;color:#141A22}',
    '.tips .bd-pick .bdp,.tips .bd-pick .v{position:relative;width:34px;height:34px}',
    '.tips .bd-pick .bdp img,.tips .bd-pick .bdp svg{position:absolute;inset:0;width:100%;height:100%}',
    '.tips .bd-pick .bdp .happy,.tips .bd-pick .bdp .dots,.tips .bd-pick .bdp .flat,.tips .bd-pick .bdp .spiral,.tips .bd-pick .bdp .mo-o,.tips .bd-pick .bdp .mo-talk,.tips .bd-pick .bdp .mo-hey,.tips .bd-pick .bdp .mo-pout,.tips .bd-pick .bdp .cheek{display:none}',
    '.tips .bd-pick .v{display:grid;place-items:center;border-radius:50%;background:#fff;box-shadow:0 0 0 1px #DCE1E7;color:#1F4FE0}',
    '.tips .bd-pick .v svg{width:12px;height:16px}'
  ].join('\n');
  document.head.appendChild(css);

  var NAVY = '#14234A';
  var arcs = function (L, R, y, w, h, stroke, sw, extra) {   // 開心的彎月眼
    return '<path d="M' + (L - w) + ' ' + (y + h * .3) + ' Q' + L + ' ' + (y - h) + ' ' + (L + w) + ' ' + (y + h * .3) + ' M' + (R - w) + ' ' + (y + h * .3) + ' Q' + R + ' ' + (y - h) + ' ' + (R + w) + ' ' + (y + h * .3) + '" stroke="' + stroke + '" stroke-width="' + sw + '" stroke-linecap="round" fill="none"' + (extra || '') + '/>';
  };
  function face(c) {
    var C = CHARS[c], L = C.ex, R = C.ex + C.gap, y = C.ey, mx = L + C.gap / 2, glow = ' filter="url(#bdg' + c + ')"', s = '';
    if (c === 'a') {
      s = '<g class="eyes"><g class="open-eyes"><ellipse class="eye" cx="' + L + '" cy="' + y + '" rx="4.4" ry="7" fill="#fff"' + glow + '/><ellipse class="eye eye-r" cx="' + R + '" cy="' + y + '" rx="4.4" ry="7" fill="#fff"' + glow + '/></g>' +
        '<g class="happy">' + arcs(L, R, y, 5, 6, '#fff', 3.2, glow) + '</g>' +
        '<g class="dots" fill="#fff"' + glow + '><circle cx="' + (L + 1) + '" cy="' + y + '" r="2.8"/><circle cx="' + mx + '" cy="' + y + '" r="2.8"/><circle cx="' + (R - 1) + '" cy="' + y + '" r="2.8"/></g>' +
        '<g class="flat" stroke="#fff" stroke-width="3" stroke-linecap="round"' + glow + '><path d="M' + (L - 4.5) + ' ' + y + 'h9M' + (R - 4.5) + ' ' + y + 'h9"/></g></g>';
    } else {
      var big = c === 'd', r = big ? 4.3 : 3.6, m = C.mouth;
      s = '<g class="eyes"><g class="open-eyes"><circle class="eye" cx="' + L + '" cy="' + y + '" r="' + r + '" fill="' + NAVY + '"/><circle class="eye eye-r" cx="' + R + '" cy="' + y + '" r="' + r + '" fill="' + NAVY + '"/>' +
        '<circle cx="' + (L + 1.3) + '" cy="' + (y - 1.4) + '" r="' + (big ? 1.3 : 1) + '" fill="#fff"/><circle cx="' + (R + 1.3) + '" cy="' + (y - 1.4) + '" r="' + (big ? 1.3 : 1) + '" fill="#fff"/></g>' +
        '<g class="happy">' + arcs(L, R, y, 4, 4.5, NAVY, 2.6) + '</g>' +
        (c === 'g' ? '<g class="spiral" fill="none" stroke="' + NAVY + '" stroke-width="1.6" stroke-linecap="round"><path d="M' + L + ' ' + y + 'm0 0a1 1 0 0 1 2 0a2 2 0 0 1-4 0a3 3 0 0 1 6 0"/><path d="M' + R + ' ' + y + 'm0 0a1 1 0 0 1 2 0a2 2 0 0 1-4 0a3 3 0 0 1 6 0"/></g>' : '') + '</g>';
      if (c === 'g') {
        s += '<g class="cheek" fill="#FF8FB1"><ellipse cx="' + (L - 4) + '" cy="' + (y + 6) + '" rx="3.6" ry="2.2"/><ellipse cx="' + (R + 4) + '" cy="' + (y + 6) + '" rx="3.6" ry="2.2"/></g>' +
          '<path class="mo mo-base" d="M' + (mx - 4.5) + ' ' + m + ' Q' + mx + ' ' + (m + 4) + ' ' + (mx + 4.5) + ' ' + m + '" stroke="' + NAVY + '" stroke-width="2" stroke-linecap="round" fill="none"/>' +
          '<ellipse class="mo mo-talk" cx="' + mx + '" cy="' + (m + 1.5) + '" rx="3" ry="2.4" fill="' + NAVY + '"/>';
      } else {
        /* D：平常就是露齒大笑；打招呼時嘴巴張大喊「嘿」；思考時嘟嘴 */
        s += '<path class="mo mo-base" d="M' + (mx - 6) + ' ' + (m - 1) + ' Q' + mx + ' ' + (m - .5) + ' ' + (mx + 6) + ' ' + (m - 1) + ' Q' + (mx + 5) + ' ' + (m + 6) + ' ' + mx + ' ' + (m + 6) + ' Q' + (mx - 5) + ' ' + (m + 6) + ' ' + (mx - 6) + ' ' + (m - 1) + 'Z" fill="' + NAVY + '"/>' +
          '<path class="mo mo-base" d="M' + (mx - 4) + ' ' + (m - .4) + 'h8" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>' +
          '<ellipse class="mo mo-hey" cx="' + mx + '" cy="' + (m + 2) + '" rx="4.6" ry="5.4" fill="' + NAVY + '"/>' +
          '<ellipse class="mo mo-pout" cx="' + (mx + 1.5) + '" cy="' + (m + 1.5) + '" rx="2" ry="1.8" fill="' + NAVY + '"/>' +
          '<ellipse class="mo mo-talk" cx="' + mx + '" cy="' + (m + 2) + '" rx="4.2" ry="3.4" fill="' + NAVY + '"/>';
      }
    }
    return '<svg viewBox="0 0 100 100" aria-hidden="true"><defs><filter id="bdg' + c + '" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' + s + '</svg>';
  }

  /* 頭像出現的地方：header 右上角、商品頁第二顆、首頁「不知道從哪台開始？」卡片、各頁對話框標題 */
  var HOSTS = '#aiOrb, #aiOrb2, .ac-mark, .adv-av';
  var els = [], moodTimer, blinkTimer, quirkTimer, base = 'idle', mo = 'idle';
  function render() {
    els.forEach(function (e) { e.remove(); }); els = [];
    document.querySelectorAll(HOSTS).forEach(function (h) {
      h.classList.toggle('has-buddy', cur !== 'v');
      if (cur === 'v') return;
      var e = document.createElement('span');
      e.className = 'bd'; e.dataset.c = cur; e.dataset.mood = mo;
      e.innerHTML = '<img src="' + ROOT + 'img/buddy/' + cur + '.webp?v=2" alt="">' + face(cur);
      h.appendChild(e); els.push(e);
    });
  }
  function each(fn) { els.forEach(fn); }
  function mood(name, ms) {
    clearTimeout(moodTimer);
    mo = name; each(function (e) { if (!e._local) e.dataset.mood = name; });
    if (ms) moodTimer = setTimeout(function () { mo = base; each(function (e) { if (!e._local) e.dataset.mood = base; }); }, ms);
  }
  function setBase(name) { base = name; mood(name); }
  /* 只改一顆頭像的表情（對話框標題的 hover／點擊），結束後回到大家共同的表情 */
  function local(e, name, ms) {
    clearTimeout(e._lt); e._local = name; e.dataset.mood = name;
    if (ms) e._lt = setTimeout(function () { e._local = null; e.dataset.mood = mo; }, ms);
  }
  /* 眨眼：每個角色節奏不同；A 很少眨、D 常眨 */
  function flag(cls, ms) { each(function (e) { e.classList.add(cls); }); setTimeout(function () { each(function (e) { e.classList.remove(cls); }); }, ms); }
  function blink() {
    clearTimeout(blinkTimer);
    var b = (CHARS[cur] || CHARS.g).blink;
    blinkTimer = setTimeout(function () {
      if (els.length && !REDUCE && mo !== 'happy' && mo !== 'spam') { flag('blink', 130); if (cur === 'd' && Math.random() < .3) setTimeout(function () { flag('blink', 120); }, 260); }
      blink();
    }, b[0] + Math.random() * b[1]);
  }
  /* 小習慣：G 偶爾往旁邊瞄、D 偶爾眨單眼（A 不做小動作，比較沉穩） */
  function quirk() {
    clearTimeout(quirkTimer);
    quirkTimer = setTimeout(function () {
      if (els.length && !REDUCE && mo === 'idle') { if (cur === 'g') flag('glance', 1300); else if (cur === 'd') flag('wink', 260); }
      quirk();
    }, 7000 + Math.random() * 5000);
  }
  /* 眼睛看向游標（每顆頭像看自己到游標的方向） */
  addEventListener('pointermove', function (ev) {
    if (REDUCE || mo === 'think') return;
    each(function (e) {
      var r = e.getBoundingClientRect(); if (!r.width) return;
      var dx = ev.clientX - (r.left + r.width / 2), dy = ev.clientY - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260);
      var g = e.querySelector('.eyes'); if (g) g.style.transform = 'translate(' + (dx / d * 3.5 * k).toFixed(2) + 'px,' + (dy / d * 2.6 * k).toFixed(2) + 'px)';
    });
  }, {passive: true});

  /* 對話框標題頭像：滑過、點一下、連點 5 下的彩蛋（不打斷思考／回覆中） */
  function bindAdvisorAvatar() {
    document.querySelectorAll('.adv-av').forEach(function (h) {
      if (h._bd) return; h._bd = true;
      var busy = function () { return mo === 'think' || mo === 'talk'; };
      h.addEventListener('pointerenter', function () { var e = h.querySelector('.bd'); if (e && !busy() && !e._local) local(e, 'hover'); });
      h.addEventListener('pointerleave', function () { var e = h.querySelector('.bd'); if (e && e._local === 'hover') { e._local = null; e.dataset.mood = mo; } });
      h.addEventListener('click', function (ev) {
        var e = h.querySelector('.bd'); if (!e || busy()) return;
        var now = Date.now(); h._clicks = (h._clicks || []).filter(function (t) { return now - t < 3000; }); h._clicks.push(now);
        if (e._local === 'spam') return;
        if (h._clicks.length >= 5) {
          h._clicks = [];
          local(e, 'spam', 1400);
          if (cur === 'd') { var bb = document.createElement('span'); bb.className = 'bd-bubble'; bb.textContent = '出發！'; h.appendChild(bb); setTimeout(function () { bb.remove(); }, 1500); }
          return;
        }
        local(e, 'ack', cur === 'a' ? 900 : 750);
        if (cur === 'g' && !REDUCE) {   // 點的位置漾開一圈漣漪
          var r = e.getBoundingClientRect(), rp = document.createElement('span');
          rp.className = 'ripple'; rp.style.left = (ev.clientX - r.left) + 'px'; rp.style.top = (ev.clientY - r.top) + 'px';
          e.appendChild(rp); setTimeout(function () { rp.remove(); }, 750);
        }
      });
    });
  }

  function use(c) {
    if (!CHARS[c] && c !== 'v') return;
    cur = c;
    try { localStorage.setItem(KEY, c); } catch (e) {}
    render(); bindAdvisorAvatar(); blink(); quirk();
    if (els.length) mood('greet', 1500);   // 被選中時用自己的招牌動作打招呼
    document.querySelectorAll('.bd-pick button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.c === c)); });
  }

  function hook() {
    render(); bindAdvisorAvatar(); blink(); quirk();
    /* 主動提示出現 → 打招呼；提示關掉 → 回到閒置 */
    var co = document.getElementById('orbCallout');
    if (co) new MutationObserver(function () {
      var on = !co.hidden && co.classList.contains('on');
      if (on && base !== 'greet') setBase('greet'); else if (!on && base === 'greet') setBase('idle');
    }).observe(co, {attributes: true, attributeFilter: ['class', 'hidden']});
    /* 對話框打開 → 開心一下 */
    var adv = document.getElementById('advisor');
    if (adv) new MutationObserver(function () { if (!adv.hidden) { setBase('idle'); mood('happy', 1400); } }).observe(adv, {attributes: true, attributeFilter: ['hidden']});
    /* 思考／回覆 */
    var wrap = function () {
      if (!window.Orb || window.Orb.__bd) return;
      var set = window.Orb.set; window.Orb.__bd = true;
      window.Orb.set = function (target, state) {
        var t = typeof target === 'string' ? document.querySelector(target) : target;
        if (t && /^aiOrb2?$/.test(t.id)) { if (state === 'connecting' || state === 'searching') mood('think'); else if (state === 'working') mood('talk', 1300); }
        return set.apply(this, arguments);
      };
    };
    wrap(); setTimeout(wrap, 800);
  }

  /* Tips 第一則（切換 AI 顧問頭像）放角色選擇；Try it 讓頭像打個招呼 */
  var V = '<svg viewBox="0 0 22 28" fill="currentColor"><path d="M7.29 6.33 10.7 15.23c.04.09.16.12.24.05l7.14-6.79c.11-.1.29.01.23.16l-7.4 19.27c-.05.12-.22.12-.27 0L.01.19C-.03.1.04 0 .14 0h21.28c.1 0 .17.1.14.19l-2.25 5.85a.15.15 0 0 1-.14.09H7.42c-.1 0-.17.1-.13.2Z"/></svg>';
  document.addEventListener('tips:render', function (e) {
    var b = e.detail && e.detail.querySelector('.try[data-key="avatar"]');
    if (!b || b.parentNode.querySelector('.bd-pick')) return;
    var box = document.createElement('div'); box.className = 'bd-pick'; box.setAttribute('role', 'group'); box.setAttribute('aria-label', '顧問角色');
    box.innerHTML = ['a', 'g', 'd'].map(function (c) {
      return '<button type="button" data-c="' + c + '" aria-pressed="' + (cur === c) + '"><span class="bdp"><img src="' + ROOT + 'img/buddy/' + c + '.webp?v=2" alt="">' + face(c) + '</span>' + CHARS[c].name + '</button>';
    }).join('') + '<button type="button" data-c="v" aria-pressed="' + (cur === 'v') + '"><span class="v">' + V + '</span>原本</button>';
    box.addEventListener('click', function (ev) { var t = ev.target.closest('button'); if (t) use(t.dataset.c); });
    var host = b.previousElementSibling; (host || b.parentNode).appendChild(box);
  });

  /* 回到頁面時重新讀取選擇：瀏覽器上一頁／下一頁會直接還原舊畫面（bfcache），
     別的分頁換了角色也要跟著換（storage 事件），不然頭像會停在舊的 */
  function sync() {
    var c = cur; try { c = localStorage.getItem(KEY) || 'g'; } catch (e) {}
    if (c !== cur && (CHARS[c] || c === 'v')) {
      cur = c; render(); bindAdvisorAvatar(); blink(); quirk();
      document.querySelectorAll('.bd-pick button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.c === c)); });
    }
  }
  addEventListener('pageshow', function (e) { if (e.persisted) sync(); });
  addEventListener('storage', function (e) { if (e.key === KEY) sync(); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) sync(); });

  (function reg(n) { if (window.Tips && Tips.register) Tips.register('avatar', function () { mood('greet', 1700); setTimeout(function () { mood('happy', 1200); }, 1800); }); else if (n < 30) setTimeout(function () { reg(n + 1); }, 200); })(0);
  window.Buddy = {use: use, mood: mood, chars: CHARS};
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hook); else hook();
})();
