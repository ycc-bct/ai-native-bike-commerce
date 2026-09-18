# Tips 導覽面板：接到你的頁面

`storefront/` 全站共用的示範導覽。左下角一顆 **Tips** 藥丸，打開後上方是五個分頁（首頁／商品清單／詳細頁／線上騎乘體驗／體驗報告與結帳），每個分頁列出該頁可以試的情境，每一項有 **Try it**。

程式只有兩個檔案，**不要複製到自己的資料夾**，直接引用共用檔即可，這樣所有頁面的分頁與文案會一起更新：

- `storefront/css/tips.css`
- `storefront/js/tips.js`

## 1. 引用（兩行）

放在 `</head>` 前（CSS）與 `</body>` 前（JS）。路徑相對於你的頁面：

```html
<!-- storefront 根目錄的頁面（例如 report.html） -->
<link rel="stylesheet" href="css/tips.css?v=b9e4e03">
<script src="js/tips.js?v=b9e4e03"></script>

<!-- 子資料夾的頁面（例如 scenario-2/index.html） -->
<link rel="stylesheet" href="../css/tips.css?v=b9e4e03">
<script src="../js/tips.js?v=b9e4e03"></script>
```

- `?v=` 是快取版本號（GitHub Pages 對 JS/CSS 只給 10 分鐘快取，瀏覽器常會留更久）。共用檔有改時，三頁會一起換成當時的 commit 短碼；你引用時抄目前 `index.html` 裡的值就好。
- 腳本會自己算出 `storefront/` 的根目錄（依 `tips.js` 的位置），所以放在子資料夾也能正確跳到其他頁。
- 不需要任何 HTML 標記，藥丸與面板由腳本自己塞進 `<body>`。
- 頁面若已經載入 `Inter` / `Noto Sans TC` 字型會最一致；沒有也能用。

## 2. 它會自動做的事

| 情境 | 行為 |
|---|---|
| 打開面板 | 停在「目前這一頁」的分頁（用網址對照：`index.html`、`gravel.html`、`product.html`、`scenario-2/`、`report.html`）。 |
| 點別的分頁 | 有多個項目的分頁 → 跳到該頁並自動打開 Tips；只有單一項目且有 `href` 的分頁（體驗報告與結帳）→ 直接前往該連結。 |
| Try it（項目有 `href`） | 直接前往該連結。 |
| Try it（在目前頁） | 執行該頁用 `Tips.register(key, fn)` 註冊的動作。 |
| Try it（在別頁） | 跳到 `該頁?try=key`，載入後自動執行對應動作。 |
| `?tips=1` 進頁 | 載入後自動打開面板。 |
| 對話框打開時 | 各頁會呼叫 `Tips.close()` 收起面板（避免擋住示範）。 |

## 3. 在自己的頁面加「Try it」動作

在你的頁面腳本裡註冊，key 要對應 `js/tips.js` 裡該項目的 `key`：

```html
<script src="../js/tips.js?v=b9e4e03"></script>
<script>
  // 例：線上騎乘體驗頁，Try it 直接開始一段示範騎乘
  Tips.register('ride', function () {
    startRide('sl0');          // 換成你頁面實際的函式
  });
</script>
```

- 註冊要在 `tips.js` 之後執行。
- 從別頁帶 `?try=ride` 進來時，腳本會在 `load` 後 500ms 呼叫同一個函式，並把網址上的 `?try=` 清掉。
- 「線上騎乘體驗」已接上共用檔，三個 Try it 都在 scenario-2 頁內示範（`ride-pick`、`ride-go`、`ride-ai`，註冊在 scenario-2 的 app 原始碼）。目前「體驗報告與結帳」的項目仍用 `href` 直接連結（見下表）；如果你的頁面已經接上共用檔並註冊了動作，把該項目的 `href` 拿掉、改填 `page`，Try it 就會改成在頁內示範。

其他可用 API：`Tips.open()`、`Tips.close()`。

## 4. 修改分頁與文案

只改 `js/tips.js` 最上面的 `TABS` 陣列：

```js
{id: 'ride', t: '線上騎乘體驗', page: 'scenario-2/', items: [
  {key: 'ride', h: '線上騎乘體驗 → 120 秒數位試乘',
   d: '選一段風景、挑一台車就出發：中途遇到岔路自己選、想換車隨時換，騎完 AI 會整理成你的騎乘報告。',
   href: 'https://ycc-bct.github.io/ai-native-bike-commerce/storefront/scenario-2/'}
]}
```

| 欄位 | 說明 |
|---|---|
| `id` | 分頁代號，唯一即可。 |
| `t` | 分頁名稱（五個分頁要維持一行，名稱盡量 ≤ 8 字）。 |
| `page` | 相對 `storefront/` 的路徑，用來判斷「目前在哪一頁」與跨頁跳轉；子資料夾用 `scenario-2/`。 |
| `items[].key` | Try it 的動作代號，對應 `Tips.register(key, fn)`。 |
| `items[].h` | 標題，格式「觸發 → 結果」，例如「說用途 → 頁面個人化」。 |
| `items[].d` | 一到兩句說明，寫給第一次看的人：怎麼觸發、會看到什麼。 |
| `items[].href` | （選用）Try it 直接前往的網址；有 `href` 就不會執行 `register` 的動作。 |

- 只有一個項目的分頁不顯示編號；兩個以上會顯示 1、2、3。
- 分頁順序依網站流程排列：首頁 → 商品清單 → 詳細頁 → 線上騎乘體驗 → 體驗報告與結帳。

## 5. 目前的分頁內容（2026-09-18）

| 分頁 | 項目 | Try it |
|---|---|---|
| 首頁 `index.html` | AI 主動出現 → 需要幫忙挑車嗎？ / 說出車款 → AI 直接帶路 | 頁內示範 |
| 商品清單 `gravel.html` | 逛一陣子 → AI 主動提示 / AI 幫我整理 → 頁面秀出推薦 / 勾選比較 → 比較表 | 頁內示範 |
| 詳細頁 `product.html` | 說用途 → 頁面個人化 / AI 問尺寸 → 幾何表直接標亮 | 頁內示範 |
| 線上騎乘體驗 `scenario-2/` | 選一段風景 → 挑車出發 / 騎到岔路 → 自己選路 / 騎乘中問 AI → 換一台試試 | 頁內示範 |
| 體驗報告與結帳 `report.html` | 線上騎乘報告 → 配件建議與結帳 | 連到 report.html#equipment（htmlpreview） |

## 6. 接上後的檢查

1. 頁面右下不會被藥丸擋到重要按鈕（藥丸在左下 24px；若你的頁面左下有東西，可用 CSS `.tips-pill{bottom:…}` 微調）。
2. 打開 Tips 應停在你那頁的分頁；點「首頁」會跳到 `index.html?tips=1` 並自動打開。
3. 若有註冊動作，從首頁 Tips 切到你的分頁按 Try it，應跳到你的頁面並自動執行。
4. 主控台沒有錯誤；`Tips` 是全域物件（`typeof Tips === 'object'`）。
