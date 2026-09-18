/* Tips：示範用的情境說明，固定在左下角（首頁、清單頁、詳細頁共用）
   上方分頁依網站流程排列；每一項的 Try it：
   - 就在目前這一頁 → 直接執行該頁用 Tips.register(key, fn) 註冊的動作
   - 在別的頁面     → 跳過去並帶 ?try=key，到了之後自動執行 */
(function () {
  var TABS = [
    {id: 'home',    t: '首頁',         page: 'index.html', items: [
      {key: 'callout', h: 'AI 主動出現 → 需要幫忙挑車嗎？', d: '逛一陣子後，右上角的顧問會主動問「需要幫忙挑車嗎？」，按「好，聊聊看」直接開始對話，不想理它就「先自己逛」。'},
      {key: 'jump',    h: '說出車款 → AI 直接帶路', d: '不用翻選單，跟顧問打「Revolt Advanced SL 0」，它就直接帶你到那台車的詳細頁。'}
    ]},
    {id: 'list',    t: '商品清單',     page: 'gravel.html', items: [
      {key: 'pair',    h: '逛一陣子 → AI 主動提示', d: '針對來回瀏覽的車款，AI 幫忙標註並在右上角說有想法；打開後直接給予更深入建議。'},
      {key: 'curate',  h: 'AI 幫我整理 → 頁面秀出推薦', d: '根據需求，AI 整理清單，並給予針對個人專屬建議，每張卡片列出挑它的理由。'},
      {key: 'compare', h: '勾選比較 → 比較表', d: '卡片勾「比較」最多三台，按「開始比較」後，比較表出現在對話框左邊。'}
    ]},
    {id: 'detail',  t: '詳細頁',       page: 'product.html', items: [
      {key: 'use',  h: '說用途 → 頁面個人化', d: '跟顧問說「我喜歡戶外冒險」，主視覺只留下探索未知這段路，配件也換成戶外用的。'},
      {key: 'size', h: 'AI 問尺寸 → 幾何表直接標亮', d: '跟顧問說身高，頁面捲到車架幾何，左欄尺寸自動釘選，表格對應的那一列和圖上的字母一起亮起來。'}
    ]},
    {id: 'ride',    t: '線上騎乘體驗', page: 'scenario-2/index.html', items: []},
    {id: 'checkout', t: '結帳',        page: '', items: []}
  ];
  var here = (location.pathname.split('/').pop() || 'index.html');
  var cur = TABS.filter(function (x) { return x.page === here; })[0] || TABS[0];
  var FN = {};

  var pill = document.createElement('button');
  pill.className = 'tips-pill'; pill.type = 'button'; pill.textContent = 'Tips';
  pill.setAttribute('aria-controls', 'tipsPanel');
  var box = document.createElement('aside');
  box.className = 'tips'; box.id = 'tipsPanel'; box.hidden = true; box.setAttribute('aria-label', 'Tips');
  box.innerHTML =
    '<div class="tips-head"><b>TIPS</b><button class="tips-close" type="button" aria-label="關閉 Tips">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>' +
    '<div class="tips-tabs" role="tablist">' + TABS.map(function (x) {
      return '<button type="button" role="tab" data-tab="' + x.id + '">' + x.t + '</button>';
    }).join('') + '</div>' +
    '<div class="tips-body"></div>';
  document.body.appendChild(pill);
  document.body.appendChild(box);

  function show(id) {
    var tab = TABS.filter(function (x) { return x.id === id; })[0];
    box.querySelectorAll('.tips-tabs button').forEach(function (b) {
      var on = b.dataset.tab === id;
      b.classList.toggle('on', on); b.setAttribute('aria-selected', on);
    });
    var body = box.querySelector('.tips-body');
    if (!tab.items.length) {
      body.innerHTML = '<p class="tips-empty">這一頁的功能整理中 coming soooon</p>';
      return;
    }
    body.innerHTML = '<ol>' + tab.items.map(function (it, i) {
      return '<li><span class="n">' + (i + 1) + '</span><div><b>' + it.h + '</b><p>' + it.d + '</p></div>' +
        '<button class="try" type="button" data-key="' + it.key + '" data-page="' + tab.page + '">Try it</button></li>';
    }).join('') + '</ol>';
    body.querySelectorAll('.try').forEach(function (b) {
      b.onclick = function () {
        var key = b.dataset.key, page = b.dataset.page;
        if (page && page !== here) { location.href = page + '?try=' + key; return; }
        close();
        if (FN[key]) FN[key]();
      };
    });
  }
  function open() { box.hidden = false; pill.hidden = true; show(cur.id); }
  function close() { box.hidden = true; pill.hidden = false; }
  pill.onclick = open;
  box.querySelector('.tips-close').onclick = close;
  box.querySelectorAll('.tips-tabs button').forEach(function (b) {
    b.onclick = function () {
      var tab = TABS.filter(function (x) { return x.id === b.dataset.tab; })[0];
      if (tab.items.length && tab.page && tab.page !== here) { location.href = tab.page + '?tips=1'; return; }   /* 選別頁就直接跳過去，到了會自動打開 Tips */
      show(tab.id);                                        /* 還沒整理的分頁（線上騎乘體驗、結帳）留在原頁顯示提示 */
    };
  });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !box.hidden) close(); });

  window.Tips = {
    register: function (key, fn) { FN[key] = fn; },
    open: open, close: close
  };
  /* 從別頁的 Try it 跳過來：等頁面腳本註冊完再執行 */
  if (new URLSearchParams(location.search).get('tips')) addEventListener('load', function () {
    open(); history.replaceState(null, '', location.pathname + location.hash);
  });
  var want = new URLSearchParams(location.search).get('try');
  if (want) addEventListener('load', function () {
    setTimeout(function () {
      if (FN[want]) FN[want]();
      history.replaceState(null, '', location.pathname + location.hash);
    }, 500);
  });
})();
