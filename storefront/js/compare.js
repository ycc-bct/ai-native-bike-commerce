/* 全站共用的車款比較清單（最多三台），存在 localStorage，換頁、上一頁、別的分頁都會同步。
   GiantCompare.list() / has(k) / add(item) / remove(k) / clear() / toggle(item) / setList(list)
     item = {k, n, img, pr}；k 跟 gravel.html 車款清單的 key 一致（例如 'revolt-sl-0'）。
   改變時在 document 發出 'compare:change'（detail 是目前的清單）。
   GiantCompare.bar()：在頁面底部放比較列（詳細頁用；商品清單頁有自己的比較列，只同步清單）。 */
(function () {
  var KEY = 'giant-compare', MAX = 3;
  var script = document.currentScript || document.querySelector('script[src*="compare.js"]');
  var ROOT = script ? script.src.replace(/js\/compare\.js.*$/, '') : '';
  function read() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function emit(l) { document.dispatchEvent(new CustomEvent('compare:change', {detail: l})); }
  function write(l) { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch (e) {} emit(l); }

  var api = {
    max: MAX,
    list: read,
    has: function (k) { return read().some(function (x) { return x.k === k; }); },
    add: function (item) {
      var l = read();
      if (l.some(function (x) { return x.k === item.k; })) return true;
      if (l.length >= MAX) return false;
      l.push(item); write(l); return true;
    },
    remove: function (k) { write(read().filter(function (x) { return x.k !== k; })); },
    clear: function () { write([]); },
    setList: function (l) {
      if (JSON.stringify(l.slice(0, MAX)) === JSON.stringify(read())) return;
      write(l.slice(0, MAX));
    },
    toggle: function (item) { if (api.has(item.k)) { api.remove(item.k); return false; } return api.add(item); }
  };
  addEventListener('storage', function (e) { if (e.key === KEY) emit(read()); });
  addEventListener('pageshow', function (e) { if (e.persisted) emit(read()); });

  /* 底部比較列：清單有車才出現；可以移除單台、清除、前往比較 */
  var X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  api.bar = function () {
    if (document.getElementById('gcBar')) return;
    var css = document.createElement('style');
    css.textContent =
      '.gc-bar{position:fixed;z-index:62;left:50%;bottom:24px;display:flex;align-items:center;gap:14px;padding:12px 14px 12px 16px;max-width:calc(100vw - 48px);white-space:nowrap;border-radius:14px;background:#fff;border:1px solid #DCE1E7;box-shadow:0 18px 44px rgba(20,26,34,.2);font-family:inherit;transform:translate(-50%,0);transition:transform .45s cubic-bezier(.16,1,.3,1),opacity .3s}' +
      '.gc-bar.off{transform:translate(-50%,calc(100% + 40px));opacity:0;pointer-events:none}' +
      'body.adv-open .gc-bar{left:calc((100vw - 424px) / 2)}' +
      '.gc-n{flex:none;font-size:13px;font-weight:700;color:#141A22}.gc-n span{font-weight:500;color:#7A8492}' +
      '.gc-picks{display:flex;gap:6px}' +
      '.gc-picks button{display:inline-flex;align-items:center;gap:8px;height:34px;padding:0 10px 0 4px;border-radius:999px;background:#F1F4F8;font-size:12px;font-weight:600;color:#4A5563;border:0;cursor:pointer}' +
      '.gc-picks button:hover{color:#141A22}.gc-picks img{width:40px;height:26px;object-fit:contain;mix-blend-mode:multiply}.gc-picks svg{width:11px;height:11px}' +
      '.gc-clear{font-size:12.5px;color:#7A8492;text-decoration:underline;text-underline-offset:3px;background:none;border:0;cursor:pointer}.gc-clear:hover{color:#141A22}' +
      '.gc-go{flex:none;display:inline-flex;align-items:center;height:40px;padding:0 18px;border-radius:8px;background:#0E1726;color:#fff;font-size:13.5px;font-weight:700;text-decoration:none}' +
      '.gc-go:hover{background:#1c2638}' +
      '@media (prefers-reduced-motion:reduce){.gc-bar{transition:none}}';
    document.head.appendChild(css);
    var bar = document.createElement('div');
    bar.className = 'gc-bar off'; bar.id = 'gcBar'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', '比較清單');
    document.body.appendChild(bar);
    function render() {
      var l = read();
      bar.classList.toggle('off', !l.length);
      if (!l.length) return;
      var hint = l.length < 2 ? '・再選一台' : l.length < MAX ? '・還可以再加一台' : '・已達上限';
      bar.innerHTML = '<span class="gc-n">比較 ' + l.length + '/' + MAX + '<span>' + hint + '</span></span>' +
        '<div class="gc-picks">' + l.map(function (b) { return '<button type="button" data-k="' + b.k + '" aria-label="從比較移除 ' + b.n + '">' + (b.img ? '<img src="' + ROOT + b.img + '" alt="">' : '') + b.n + X + '</button>'; }).join('') + '</div>' +
        '<button class="gc-clear" type="button">清除</button>' +
        '<a class="gc-go" href="' + ROOT + 'gravel.html?cmp=1">' + (l.length < 2 ? '選其他車款比較' : '開始比較') + '</a>';
      bar.querySelectorAll('.gc-picks button').forEach(function (b) { b.onclick = function () { api.remove(b.dataset.k); }; });
      bar.querySelector('.gc-clear').onclick = api.clear;
    }
    document.addEventListener('compare:change', render);
    render();
  };

  window.GiantCompare = api;
})();
