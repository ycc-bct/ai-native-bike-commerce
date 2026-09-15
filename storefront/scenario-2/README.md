# storefront / 情境 2（預留位置）

新版官網（`storefront/`）的下一個情境放這裡，之後會和首頁、產品頁串起來。

- 預覽網址：https://ycc-bct.github.io/ai-native-bike-commerce/storefront/scenario-2/
- 目前是佔位頁，做好後直接用自己的 `index.html` 取代。

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
