# GIANT Riding Experience Prototype

2026-09-18 更新：城市通勤／公路旅遊／山路挑戰入口 → 選車與需求排序 → 30 秒數位試騎 → 騎乘報告與門市預約示範。

入口 index.html 內嵌 CSS 與 JavaScript，無須 build。

## 本版互動

- 只使用已去背的 Trance X 1、Talon E+、Revolt Advanced SL 0、Faith 24 產品照片；名稱、參考價格與五軸能力圖顯示於卡片。Faith 24 尺寸與價格待門市確認。
- 選車侧欄包含可調整的需求五軸與 GIANT 選車顧問、固定 Selected Bike、可捲動 Recommended Bikes；需求與文字輸入會平順重新排序。
- 出發 → 一次路口二選一 → 終點，共 30 秒；選擇、暫停、AI 對話與背景分頁不計時。
- video/Landscape-A.mp4 用於入口至路口；選擇碎石路後使用 video/Landscape-B.mp4。影片靜音播放，隨暫停與顧問對話一起暫停。其他情境使用圖片。
- 淺色毛玻璃儀表顯示車款、價格、能力、時間、模擬速度與心率；右上角統一尺寸的暫停／換車／顧問按鈕。
- 選路後顧問以聊天泡泡提問，再依關注問題推荐可收藏的相關車款。暫停只提供繼續或離開；換車優先推薦收藏，重新開始體驗。
- 報告呈現路段、車款資訊、能力與適配；提供配件加購示意、優惠示意、門市預約示範及再次試騎。

## 限制與驗證

AI 為本機需求解析与預設情境建議，未連接 LLM。能力、適配、速度、心率與評論均為提案示意，非官方量測或真實用戶統計。預約不會傳送聯絡資料或成立真實預約。音樂不播放。供應與實際價格依官方及門市為準。

已驗證圖片路徑、JavaScript 語法、30 秒精確終點與暫停排除；瀏覽器驗證需求排序、換車、顧問推薦、收藏、影片靜音與暫停，以及換車計時重置。

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
