/* 我的最愛（全站共用）
   收藏狀態存在 localStorage['giant-v2-saved']，跟選車現場（scenario-2）用同一把鑰匙，
   所以在選車現場按的收藏、在商品頁按的愛心，看到的是同一份清單。
   車款資料對齊 scenario-2 的 mt 陣列；圖片路徑以 storefront 根目錄為準。 */
(function () {
  const KEY = 'giant-v2-saved';

  const BIKES = {
    sl0:       { name: 'Revolt Advanced SL 0',  price: 308000, img: 'scenario-2/img/revolt-sl0.webp',   href: 'product.html' },
    pro1:      { name: 'Revolt Advanced Pro 1', price: 128000, img: 'img/bikes/revolt-lg.webp' },
    trance:    { name: 'Trance X 1',            price: 108000, img: 'img/bikes/trance.webp' },
    advanced1: { name: 'Revolt Advanced 1',     price:  88000, img: 'img/bikes/revolt.webp' },
    ebike:     { name: 'Talon E+',              price:  79800, img: 'scenario-2/img/ebike.webp' },
    advanced2: { name: 'Revolt Advanced 2',     price:  68800, img: 'img/bikes/revolt.webp' },
    talon:     { name: 'Talon 0',               price:  26800, img: 'img/bikes/talon.webp' },
    fast:      { name: 'FastRoad AR 2',         price:  23800, img: 'img/bikes/fastroad.webp' },
    faith:     { name: 'Faith 24',              price:  18800, img: 'scenario-2/img/product-faith.webp' }
  };

  const money = n => 'NT$ ' + n.toLocaleString('en-US');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // 私密視窗或封鎖 site data 時 localStorage 會丟例外，一律吞掉走空清單
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
  const write = v => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {} };

  const Fav = {
    bikes: BIKES,
    // 只回傳認得的 id；不認得的不寫回去，免得清掉 scenario-2 之後新增的車款
    list: () => read().filter(id => BIKES[id]),
    has: id => read().indexOf(id) > -1,
    toggle(id) {
      const s = read(), i = s.indexOf(id);
      if (i > -1) s.splice(i, 1); else s.push(id);
      write(s);
      changed();
      return i < 0;
    },
    remove(id) { const s = read().filter(x => x !== id); write(s); changed(); },
    open() { setOpen(true); },
    close() { setOpen(false); }
  };
  window.GiantFav = Fav;

  function changed() {
    syncBadge();
    if (panel && !panel.hidden) renderList();
    dispatchEvent(new CustomEvent('giant-fav-change', { detail: { list: Fav.list() } }));
  }

  /* ---------- header 入口 ---------- */
  let badge = null;
  function syncBadge() {
    if (!badge) return;
    const n = Fav.list().length;
    badge.textContent = n;
    badge.hidden = !n;
  }

  /* ---------- 面板 ---------- */
  let panel = null, scrim = null, lastFocus = null;

  function build() {
    scrim = document.createElement('div');
    scrim.className = 'fav-scrim';
    scrim.hidden = true;
    scrim.addEventListener('click', () => setOpen(false));

    panel = document.createElement('aside');
    panel.className = 'fav-panel';
    panel.id = 'favPanel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', '我的最愛');
    panel.innerHTML =
      '<header class="fav-hd"><h2>我的最愛</h2>' +
      '<button type="button" class="fav-close" aria-label="關閉">&times;</button></header>' +
      '<div class="fav-body"></div>';
    panel.querySelector('.fav-close').addEventListener('click', () => setOpen(false));
    panel.addEventListener('click', e => {
      const rm = e.target.closest('[data-fav-remove]');
      if (rm) Fav.remove(rm.dataset.favRemove);
    });

    document.body.append(scrim, panel);
  }

  function renderList() {
    const ids = Fav.list();
    const body = panel.querySelector('.fav-body');
    if (!ids.length) {
      body.innerHTML =
        '<div class="fav-empty"><p>還沒有收藏任何車款。</p>' +
        '<p>在選車現場看到想再比較的車，按一下愛心就會留在這裡。</p>' +
        '<a class="fav-cta" href="' + base() + 'scenario-2/index.html">進入選車現場</a></div>';
      return;
    }
    body.innerHTML = '<ul class="fav-list">' + ids.map(id => {
      const b = BIKES[id];
      const href = base() + (b.href || ('scenario-2/index.html?bike=' + id));
      return '<li><a class="fav-item" href="' + href + '">' +
        '<img src="' + base() + b.img + '" alt="">' +
        '<span><b>' + esc(b.name) + '</b><small>' + money(b.price) + '</small></span></a>' +
        '<button type="button" class="fav-rm" data-fav-remove="' + id + '" aria-label="移除 ' + esc(b.name) + '">&times;</button>' +
        '</li>';
    }).join('') + '</ul>';
  }

  // 這支 js 也被 scenario-2/ 底下的頁面載入時，相對路徑要往上一層
  function base() {
    return /\/scenario-2\//.test(location.pathname) ? '../' : '';
  }

  function setOpen(on) {
    if (!panel) return;
    if (on) {
      lastFocus = document.activeElement;
      // 顧問的主動提示卡在 header 裡，層級比面板高，開面板前先用它自己的關閉鈕收掉
      const no = document.getElementById('calloutNo');
      const callout = document.getElementById('orbCallout');
      if (no && callout && !callout.hidden) no.click();
      renderList();
      scrim.hidden = false; panel.hidden = false;
      requestAnimationFrame(() => { scrim.classList.add('on'); panel.classList.add('on'); });
      panel.querySelector('.fav-close').focus({ preventScroll: true });
    } else {
      scrim.classList.remove('on'); panel.classList.remove('on');
      setTimeout(() => { if (!panel.classList.contains('on')) { scrim.hidden = true; panel.hidden = true; } }, 280);
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    }
  }

  addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel && !panel.hidden) setOpen(false);
  });

  // 另一個分頁改了收藏，這頁的數字也要跟著動
  addEventListener('storage', e => { if (e.key === KEY) { syncBadge(); if (panel && !panel.hidden) renderList(); } });

  function init() {
    build();
    const btn = document.getElementById('openFav');
    if (btn) {
      badge = btn.querySelector('.fav-n');
      btn.addEventListener('click', () => setOpen(true));
    }
    syncBadge();
  }

  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', init);
  else init();
})();
