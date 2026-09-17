# GIANT Mountain Ride Prototype

2026-09-16 修訂。Revolt 產品頁 → 山路挑戰同系列選車 → 120 秒數位體驗 → 騎乘報告 → 官方車款／門市預約示範。

入口 `index.html` 已內嵌 CSS/JS，不需要 build。

預覽：https://ycc-bct.github.io/ai-native-bike-commerce/storefront/scenario-2/

原始碼計時模組測試已通過：涵蓋四種路線組合、選擇與暫停不計時、同段換車紀錄、最後 8 秒與精確 120 秒終點。

## 互動

- 預設 Revolt Advanced 2；也支援 `?bike=advanced1` 或 `?bike=pro1` 產品入口。入口車款置頂並預選。
- 山路入口直接陳列同系列車款；點選後才開啟可拖曳旋轉的 Three.js 車體示意與示範心得。Hover 不顯示心得。照片為官方素材；模型不是原廠 CAD。
- 12 秒暖身 → 碎石／陡坡二選一 → 累計 60 秒時泥濘／樹根二選一 → 112 秒起減速 → 120 秒停下並呈現報告。
- 選路、暫停、背景分頁不計時。暫停展開同系列推薦，可以收藏、換車並延續同一段路。
- 報告記錄實際體驗的路段、車款與時間；情境適配以本地示意模型估算，非性能量測。
- 聯絡資料只保存在當次記憶體；預約是示範，不傳送資料、不建立實際門市預約。正式購買和聯繫門市使用官方連結。

## 音樂

CORTIS〈JoyRide〉僅為視覺示意。開始體驗才顯示曲名與狀態，選路及暫停時切換圖示；不載入 Spotify、不請求或播放任何音訊。

## 素材與限制

2026-09-16 核對 Giant 台灣官網參考售價：
- https://www.giant-bicycles.com/tw/revolt-advanced-2 — 2022，NT$68,800
- https://www.giant-bicycles.com/tw/revolt-advanced-1 — 2023，NT$88,000
- https://www.giant-bicycles.com/tw/revolt-advanced-pro-1 — 2026，NT$128,000

供應與實際規格需門市確認。試乘人數、心得及適配分數均標示示意。AI 情境建議為預設內容，未串接 LLM。背景為靜態 AI 圖片，無騎乘影片；輕微縮放營造前進感。Three.js r169（MIT）；Google Fonts Inter / Noto Sans TC。

## 2026-09-16 毛玻璃版

- 全景山路入口、選中車款光圈、點選才顯示心得。
- 兩次選路均使用真正左右岔路構圖的照片：左碎石／右陡坡，左泥濘／右樹根。
- 白色 Logo SVG 路徑來自 https://www.giant-bicycles.com/global ，以白色呈現；Header 無底色。
- 報告加入前燈、上管包、打氣筒示意加購，體驗限定九折。所有名稱、價格與折扣清楚標為提案示意。
- 門市預約直接嵌入報告；勾選配件同步反映在預約摘要與完成頁，無付款或真實預約。

新增場景使用內建 ImageGen 生成，檔案：`img/fork1.webp`、`img/fork2.webp`。Prompt 摘要：16:9 台灣山區午後寫實 Y 字岔路，第一張左碎石右柏油陡坡，第二張左泥濘右樹根；無人物、車子、文字或 UI。

## 2026-09-17 三場景選車版

- 移除產品介紹首頁，改為城市通勤、公路旅遊、山路挑戰三個入口。
- 主推預選 Revolt Advanced SL 0 2027，2026-09-17 官網價 NT$308,000；來源 https://www.giant-bicycles.com/tw/revolt-advanced-sl-0-2027 。產品照片從官網取得，3D 仍是非原廠通用車體示意。
- 各入口推薦車含名稱、價格、五軸能力示意與優點；點車身切換，選中車放大並自動旋轉，下方可開始體驗。
- 全頁更多車款提供目前提案資料中的 8 款，非完整 GIANT 庫存。文字搜尋跨車系，切換不同適用場景先提示確認。
- 五軸可滑鼠／觸控拖曳、方向鍵或滑桿操作。AI 對話為本機需求解析示範，支援五軸關鍵字、數字萬元預算、取消預算、完整車名；未連接 LLM。
- 五軸分數為提案權重，非官方量測；排名為能力與需求比重加權。
- 右上角音樂區塊已移除，全程不播放音訊。
- 三場景共 12 種路況組合測試通過（`route-clock.test.mjs`），120 秒不含選擇／暫停；Report、加購與預約示範保留。
- 瀏覽器驗證：場景入口、TCR 搜尋、跨場景確認、八萬元排序、雷達拖曳與鍵盤操作、SL 0 開始體驗。


## 放檔案的規則

1. **只動這個資料夾。** 這個情境的所有檔案都放在 `storefront/scenario-2/`。請不要改 `storefront/index.html`、`storefront/product.html`，串接時再統一處理。
2. **入口是 `index.html`**，單一 HTML、不用 build、不用框架。外部資源使用 Google Fonts。音樂僅為無聲視覺示意，不載入第三方播放器。
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
