# 全站 Header／Footer：接到你的頁面

`storefront/` 共用的 header（logo、主選單＋下拉、右側工具列：搜尋／我的最愛／購物車／會員／選車顧問）。
程式只有兩個檔案，**不要複製到自己的資料夾**，直接引用共用檔，這樣選單文字、連結、樣式全站一起改：

- `storefront/css/header.css`
- `storefront/js/header.js`

## 1. 引用（三行）

```html
<!-- </head> 前 -->
<link rel="stylesheet" href="css/header.css?v=hdr1023">

<!-- <body> 裡原本放 header 的位置：一個空的 header，緊接著載入 header.js -->
<header class="nav site-nav" id="siteHeader" data-page="report"></header>
<script src="js/header.js?v=hdr1023"></script>

<!-- 子資料夾的頁面（例如 scenario-2/index.html）路徑往上一層 -->
<link rel="stylesheet" href="../css/header.css?v=hdr1023">
<script src="../js/header.js?v=hdr1023"></script>
```

- `header.js` 一定要放在**空 header 之後、你頁面自己的腳本之前**：它會同步把內容塞進去，之後 `favorites.js`、`advisor.js` 和你的程式才找得到 `#openFav`、`#aiOrb`、`#orbCallout`。
- 原本頁面上整段 `<header class="nav site-nav">…</header>` 刪掉換成上面那一行。原本針對 `.site-nav` 寫的 CSS（透明、白字、捲動後變底色）都還有效，class 名稱沒變。
- `?v=` 是快取版本號，抄目前 `index.html` 裡的值就好。

## 2. 可以設的屬性

| 屬性 | 值 | 說明 |
|---|---|---|
| `data-page` | `home` / `gravel` / `product` / `ride` / `quiz` / `result` / `report` / `custom` | 對應的第一層會標成目前頁（底線＋粗體）。`gravel`、`product` 都會標在「越野 & 礫石」。 |
| `data-ai` | `off` | 這頁沒有對話框時用，右上角就不放選車顧問按鈕（情境式問卷的 ride / quiz 就是這樣）。 |
| `data-cart` | 連結 | 購物車圖示要連去哪，預設 `#`（報告頁可以設 `#checkout`）。 |

## 3. 選單結構（照官網 tw 的分法）

第一層：公路／登山／越野 & 礫石／E-Bike／童車 ｜ 精品配件／客製化／門市專區。

- 五個車種各有一條下拉：車種大圖＋「看全部」、第三層（文字取自官網），內容左緣對齊主選單第一個字。
- 精品配件一條下拉四欄：人身／車身／維修／零件。
- 連結只接我們做過的頁：越野 & 礫石 → `gravel.html`、Revolt SL 0 → `product.html`、Talon E+ → `ride.html?bike=ebike`、客製化 → `custom-studio/index.html`（介紹頁）。其他是 `#`，hover 有效果但不跳頁（示範原則：不連官網）。
- 要改文字或連結：只改 `js/header.js` 最上面的 `BIKES` / `GEAR` / `MORE`。

## 4. 「問顧問」的掛勾（目前下拉裡沒有放這顆按鈕，先保留接口）

任何帶 `data-ask="road"` 的元素被點到時，會呼叫頁面上的 `window.GiantHeaderAsk(cat, name)`；沒有定義就跳回首頁打開顧問。
你的頁面如果有對話框，定義一個就好：

```js
window.GiantHeaderAsk = function (cat, name) {   // cat: road / mtb / gravel / ebike / kids，name: 車種全名
  openAdvisor(false);
  say('你在看<b>' + name + '</b>，想找哪種路線用的？…');
};
```

其他可用：`GiantHeader.open('gravel')`、`GiantHeader.close()`、`GiantHeader.nav`（選單資料）。

## 5. 行為

- hover 第一層停 120ms 才展開、滑出 160ms 才收，掃過去不會閃；觸控裝置改點擊切換；Esc 或捲動會收起。
- 下拉打開時整條 header 變白底黑字（深色主視覺頁也一樣），主動跳出的顧問氣泡會先讓開。
- 手機版抽屜還沒做（目前全站 `min-width:1200px`），選單資料已經是一份，之後直接長出來。

## 6. 接上後的檢查

1. 頁面載入沒有主控台錯誤；`typeof GiantHeader === 'object'`。
2. 右上角愛心的數字跟其他頁一致（favorites.js 有找到 `#openFav`）。
3. 有對話框的頁：V 按鈕能打開。
4. 你那頁對應的第一層有底線（`data-page` 設對）。

## 7. Footer 一樣的接法

```html
<!-- </head> 前 -->
<link rel="stylesheet" href="css/footer.css?v=hdr1023b">

<!-- 頁面最後、原本 footer 的位置 -->
<footer class="foot" id="siteFooter"></footer>
<script src="js/footer.js?v=hdr1023b"></script>
```

- 四欄（車款／精品配件／探索／支援）＋訂閱＋社群＋版權列，文字和連結集中在 `js/footer.js` 的 `COLS`。
- 寬度跟著你頁面 `:root` 的 `--shell`；沒有定義就用預設 `min(1368px, calc(100vw - 72px))`。
- 跟 footer 的距離由你的頁面決定（例如 `.foot{margin-top:90px}`）。
- 對話框打開時 footer 要跟著變窄的話，沿用你頁面原本的 `body.adv-open .foot-in, body.adv-open .foot-bar{…}` 規則即可。
