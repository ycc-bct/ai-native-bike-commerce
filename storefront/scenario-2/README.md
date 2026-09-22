# GIANT 騎乘體驗 Prototype

2026-09-18 更新。`index.html` 內嵌 CSS/JS，不需要 build。

- 選車側欄依序顯示可拖拉五軸圖、需求輸入、體驗車款名稱、推薦車款卡片。
- 照片使用最大 1280px WebP，保留透明去背；兩段影片為 720p H.264、無音軌、faststart MP4。
- 入口影片 `video/Landscape-A.mp4`；碎石路影片 `video/Landscape-B.mp4` 播完直接進入報告，不循環。
- 選路與暫停不計時；顧問聊天不暫停影片。換車重新開始。
- AI、能力分數、配件優惠與預約為提案示範，未建立真實預約或付款。
- 入口影片播完才出現岔路，選路時畫面停在影片最後一格；「連續陡坡」只能 hover 預覽、不能點。
- 騎乘畫面下方不加暗化；騎乘中的 AI 對話只留泡泡（標題、訊息、輸入框），不鋪面板背景，高度依內容。
- 左下角共用 Tips（`../js/tips.js`、`../css/tips.css`），「線上騎乘體驗」分頁的三個 Try it 直接在這頁執行。

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
