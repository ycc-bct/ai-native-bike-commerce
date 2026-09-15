# storefront / 情境 2 · GIANT Ride Prototype

依 Flow 1–5 製作的情境選車 Prototype，之後可與新版官網首頁、產品頁串接。

- 預覽網址：https://ycc-bct.github.io/ai-native-bike-commerce/storefront/scenario-2/
- 入口為 `index.html`，CSS 與程式皆已內嵌；不需安裝套件或執行 build。

## 本版體驗

選路線 → 入口選車與價格 → 第一視角騎乘 → 碎石／陡坡 → 輕量推薦 → 展開比較、同路段換騎與收藏 → 門市預約示範。

- 六款車可選；方向鍵控制轉向與速度，空白鍵暫停。另有手機按鈕。
- 寫實場景為生成照片的動態視差；「3D」按鈕切至可操控的動態路面。不是實拍影片或實車性能測試。
- 音景為本機合成音樂／風聲；AI 為本機關鍵字與偏好排序示範，未串接 LLM。
- 能力圖與比較比例明示為示意資料。預約表單不送出至真實門市，聯絡資料僅存在當次頁面記憶體；收藏使用 localStorage。
- 預約完成頁可下載標示「未預約」的個人行事曆計畫，並連至官方門市資訊。
- 新素材在 `img/`，10 張 WebP 皆不超過 1440px。車款圖片為本版相應年款的官方照片，與現有共用車圖不一定是相同配置。
- Three.js r169（MIT）內嵌於 HTML；保留授權標頭。外部連線僅 Google Fonts，使用者點擊時才開啟官方門市頁。
- 建議透過下方 HTTP 伺服器預覽；直接使用 file:// 開啟時，瀏覽器可能限制 WebGL 紋理讀取。

已於 repository 子路徑驗證選車、騎乘與推薦面板，瀏覽器無程式錯誤。原版本也已驗證收藏、換車、表單必填與預約示範完成頁。

### 產品來源（參考價格以門市為準）

- https://www.giant-bicycles.com/tw/talon-0
- https://www.giant-bicycles.com/tw/talon-3
- https://www.giant-bicycles.com/tw/talon-eplus
- https://www.giant-bicycles.com/tw/revolt-advanced-pro-1
- https://www.giant-bicycles.com/tw/fastroad-ar-2-2027
- https://www.giant-bicycles.com/tw/tcr-advanced-2--kom--2026

## 放檔案的規則

1. **只動這個資料夾。** 這個情境的所有檔案都放在 `storefront/scenario-2/`。請不要改 `storefront/index.html`、`storefront/product.html`，串接時再統一處理。
2. **入口是 `index.html`**，單一 HTML、不用 build、不用框架。外部資源目前只用 Google Fonts。
3. **連結寫完整檔名**：回首頁用 `../index.html`、產品頁用 `../product.html`。不要寫 `./` 或 `../`，直接雙擊打開本機檔案時會失效。
4. **素材**
   - 共用素材可直接引用，不要複製一份：
     - `../img/hero.webp`（首頁主視覺）
     - `../img/scenes/*.webp`（城市、公路、碎石、越野、電輔情境照）
     - `../img/bikes/*.webp`（去背車圖）
     - `../img/pdp/*.webp`（產品頁情境照與官網配件圖）
   - 自己的新素材放 `scenario-2/img/`，請轉成 WebP，寬度 1440px 以內。
5. **車款資料以 giant-bicycles.com/tw 為準。** 02 提案沿用下來的價格有過期的（例如 Revolt Advanced SL 0 官網已是 2027 年款 NT$308,000）。示範用的活動、評論請標清楚「示意」。

## 設計語彙（和首頁、產品頁一致）

| 項目 | 值 |
|---|---|
| 字體 | Inter + Noto Sans TC（Google Fonts） |
| 首頁暗色底 | `#0A111C` |
| 產品頁淺色底 | `#F3F5F7`，文字 `#141A22` |
| GIANT 品牌藍 | `#06038D` |
| AI 小幫手藍 | `#1F4FE0` / `#4B86FF` |
| 主要檢視寬度 | Chrome 桌機，約 1440px |

## 上傳

- 已是 repo 協作者：可以直接 push 到 `main`（只動這個資料夾），或開分支發 Pull Request。
- 還不是協作者：請 repo 管理員到 GitHub → Settings → Collaborators 加入。
- push 後約 1–2 分鐘 GitHub Pages 會更新預覽網址。

## 本機預覽

```bash
python3 -m http.server 8000
```

然後開 http://localhost:8000/storefront/scenario-2/
