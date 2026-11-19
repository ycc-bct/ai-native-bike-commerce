# 變更紀錄

`storefront/` 與客製車編輯頁 `customized.html` 每次更新的項目，**由新到舊**。

- 每筆開頭的【】是影響範圍：【客製車】＝`customized.html`；【客製介紹】＝`storefront/custom-studio/index.html`；【全站】＝所有 storefront 頁面或共用元件。
- 有 PR 的附 PR 連結；直接推到 `main` 的附 commit 編號（可用 `git show <編號>` 查看）。
- 2026-10-20 以前是其他提案（展廳、聚光燈、左右分割），不在這份範圍，請查 `git log`。

**自動記錄**：任何人推到 `main`（合併 PR 或直接 push），GitHub Actions 會在幾十秒內把這次的提交加到最上面（規則見 `.github/scripts/changelog.py`）。自動紀錄用的是 commit 標題，影響範圍依改到的檔案判斷；想寫得更清楚，可以之後直接改那一行，已經寫過的 PR 或 commit 不會再被加一次。機器人會在 `main` 上提交，直接 push 前請先 pull。

手寫的寫法：在最上面加一段日期，每項一行，寫「改了什麼、在哪裡」，不寫怎麼改。

---

## 2026-11-19

- [#33](https://github.com/ycc-bct/ai-native-bike-commerce/pull/33)【全站】Ride report on phones: give the accessory tag even padding
- [#31](https://github.com/ycc-bct/ai-native-bike-commerce/pull/31)【選車、騎乘中、騎乘報告】手機版：「換幾台看看」的圖示補上跟文字一樣的陰影；換車改成重新整理圖示、圖示沒有外框，黑框留在整顆按鈕；選了門市就捲到選時間，配件標籤上移不再擋住商品照片。桌機不變。

## 2026-11-16

- [#29](https://github.com/ycc-bct/ai-native-bike-commerce/pull/29)【選車、騎乘中、騎乘報告】手機版：選車標題那段天空改淺、車距收近，選車分析與適用地形改成 15px；目前騎的和車名同一行，換車改成圖示，電輔選項高度跟其他選項一樣；選了門市（含進頁就已選好）才出現選時間，配件改成橫向滑動。桌機不變。
- [#28](https://github.com/ycc-bct/ai-native-bike-commerce/pull/28)【文件】Changelog: use commit or PR titles for merged PRs
- [#27](https://github.com/ycc-bct/ai-native-bike-commerce/pull/27)【文件】CHANGELOG 改為自動記錄：任何人推到 `main` 都會由 GitHub Actions 加進這份紀錄。
- [#26](https://github.com/ycc-bct/ai-native-bike-commerce/pull/26)【文件】規範拆成兩份：`customized.md`（客製車編輯頁，給廠商開發）與 `design.md`（其餘頁面與全站共用）；新增這份 `CHANGELOG.md`。
- [#26](https://github.com/ycc-bct/ai-native-bike-commerce/pull/26)【文件】設定頁標題列高度改記為 `--cfg-title: 48px`；補上「升級合計」手機 14px、768px 以上 16px。

## 2026-11-12

- [#25](https://github.com/ycc-bct/ai-native-bike-commerce/pull/25)【首頁】Explore Your Ride 手機版改成五條上下堆疊的長方形橫條（間距 1px），補回說明文字；五張照片以騎士頭部對齊在右側同一點。
- [#24](https://github.com/ycc-bct/ai-native-bike-commerce/pull/24)【商品頁】手機與平板的幾何區順序改成：幾何圖 → 幾何表 → 我適合的尺寸。
- [#23](https://github.com/ycc-bct/ai-native-bike-commerce/pull/23)【全站】修正 iPhone 開關顧問面板後「此網頁重複發生問題」：手機、平板、觸控裝置改用輕量動畫，不再複製 48 份面板。
- [#22](https://github.com/ycc-bct/ai-native-bike-commerce/pull/22)【商品頁】相關車款的車名改回 ink 色。
- [#21](https://github.com/ycc-bct/ai-native-bike-commerce/pull/21)【列表頁、商品頁】手機比較列的陰影縮小，不再在 iOS Safari 網址列上方染出灰帶。
- [#20](https://github.com/ycc-bct/ai-native-bike-commerce/pull/20)【列表頁】比較表手機版第一欄與項目名稱對齊；數值不同的項目名稱不再用強調藍。
- [#19](https://github.com/ycc-bct/ai-native-bike-commerce/pull/19)【全站】標題字級統一成一套（`css/type.css`：H1 40／32、H2 30／26、H3 20／18、H4 16），只有首頁主視覺用展示大字；不是標題的小標籤改成一般文字。【列表頁】手機最多比較兩台、「比較車款」維持置右、Tips 不再移動。【商品頁】subnav 緊貼 header。
- [#18](https://github.com/ycc-bct/ai-native-bike-commerce/pull/18)【首頁、列表頁、商品頁、顧問】手機上比較列與購買列不再蓋住對話框輸入框；顧問不再說「右邊亮起來」，手機多一顆「收起對話」；平板顧問按鈕 40px、輸入框 16px；輸入框點擊範圍撐滿；手機照片放大檢視的圖變大；商品頁平板留白 36px；列表頁副標斷行、篩選面板可按 Esc 關閉。

## 2026-11-05

- [#17](https://github.com/ycc-bct/ai-native-bike-commerce/pull/17)【客製車】塗裝步驟：「下一步」依序經過特仕塗裝、自由配色、專屬簽名，按鈕寫出下一站名稱；切 tab 不改車圖與價格，點選項才套用；自由配色選項預設不選取；名稱下方顯示「類型・顏色」；塗裝方式卡片顯示完整金額（3,380／6,380）。

## 2026-11-04

- `e2e10ae`（Ginny）【全站】所有頁面拿掉 1200px 鎖定做成 RWD；報告頁接上共用 header、footer；header 固定 64px，我的最愛收進會員選單；footer 各頁等寬；手機選單的「看全部」改成藍色連結；Tips 手機隱藏。
- [#16](https://github.com/ycc-bct/ai-native-bike-commerce/pull/16)、[#15](https://github.com/ycc-bct/ai-native-bike-commerce/pull/15)、[#14](https://github.com/ycc-bct/ai-native-bike-commerce/pull/14)【客製車】「升級合計」字級，最後定為手機 14px、768px 以上 16px。
- [#13](https://github.com/ycc-bct/ai-native-bike-commerce/pull/13)【全站】7 頁開啟手機抽屜選單；首頁、結帳頁完成手機版；`rwd.md` 併入 `design.md`；主要動作按鈕改膠囊形、手機 44px；手機 logo 100px。【客製介紹】footer 改回單欄。【客製車】切換步驟時面板位置固定、車圖上下 16px、換背景移到步驟列右側、配件圖不被價格壓到、分享卡間距收緊。
- `2d9cf94`、`55207cf`、`f292dd1`（Ginny）【客製介紹】CTA 碳纖車架圖的大小與對齊。
- `f168569`（Ginny）【客製介紹】手機選單與互動、零件改為點選切換。
- `1e07090`、`00a4f2f`（Ginny）【結帳】門市列內距被裁切；客製車預約隱藏日期與時間。
- [#12](https://github.com/ycc-bct/ai-native-bike-commerce/pull/12)【客製車】專屬簽名車圖放大上車架；騎乘配備依選到的配件自動聚焦；桌機單項頁 panel-head 間距。

## 2026-11-03

- [#11](https://github.com/ycc-bct/ai-native-bike-commerce/pull/11)【全站】購物車抽屜與加入購物車小卡改用設計系統字級，內距桌機 28px、手機 16px。
- `151065d`、`15f7260`（Ginny）【結帳】客製車預約預填門市、日期、時間；結帳按鈕保持在畫面內；門市地圖載入修正。
- `1c17d9c`（Ginny）【全站】次要文字對比提高。

## 2026-11-02

- [#10](https://github.com/ycc-bct/ai-native-bike-commerce/pull/10)【客製車】手機 header、footer 套用當時的手機規範。
- [#9](https://github.com/ycc-bct/ai-native-bike-commerce/pull/9)【客製車】車系頁 Liv 標誌手機尺寸；桌機車圖最高 360px。
- [#8](https://github.com/ycc-bct/ai-native-bike-commerce/pull/8)【客製車】編輯頁手機與平板 RWD。
- `cc8ec36`、`f344e87`（Ginny）【客製車】變速套件依品牌升級並顯示價差、官方 mm 幾何；Dura-Ace 縮圖壓縮。
- `4a05ecf`、`2c9cb89`、`100eb7f`、`6071c18`、`d52c69c`、`856625d`、`f9b02dc`（Ginny）【客製介紹】手機零件區、導覽、塗裝選取與間距多項修正。

## 2026-10-30

- `14b5bab`、`032d4ce`（Ginny）【客製介紹】手機版面、車款卡滑動、顯示完整碳纖車架。

## 2026-10-28

- `4d844a0`、`f5eca24`、`99ab40d`、`fadfc77`、`b5332e0`（Ginny）【全站】全站購物車與結帳、車系選擇、變速預設、共用門市選擇器；購物車與我的最愛共用抽屜；會員選單、訂單明細；顧問頭像；門市專區不再連到首頁。

## 2026-10-27

- `37f492d`、`d127d40`、`082229f`、`17e67ba`、`bedaa95`（Ginny）【客製車】依頁面情境的顧問提示與對話；零件速寫預載。【全站】分頁標題統一。【商品頁】共用比較列；單一礫石情境、可選配件群組、直接進入騎乘。

## 2026-10-25

- `7d502be`、`a34a8be`、`ab4f9a8`、`9f19467`（Ginny）【客製車】車款卡縮圖固定顯示預設塗裝、轉場、頭像統一。【商品頁】原地相簿。【客製介紹】GIANT Buddy 頭像、弧線進場、CTA 車架展開。

## 2026-10-24

- `94d5b6b`（Ginny）【客製車】預覽背景、零件速寫。【全站】字級與返回連結統一。

## 2026-10-23

- [#7](https://github.com/ycc-bct/ai-native-bike-commerce/pull/7)【客製介紹】hero 影片壓縮（約減少一半）。
- [#6](https://github.com/ycc-bct/ai-native-bike-commerce/pull/6)【客製介紹】hero 改為精品風格影片、滾筒標題、透明 header。
- [#5](https://github.com/ycc-bct/ai-native-bike-commerce/pull/5)【客製車】車圖壓縮；PROPEL 固定平面預覽、TCR 固定 3D；配件第二層改版。
- [#4](https://github.com/ycc-bct/ai-native-bike-commerce/pull/4)【客製車】車系、車款頁改版，騎出轉場，PROPEL 3D 修正。
- `0cdf039`、`1b100e3`、`914e209`、`6b89c0b`、`ac591a0`、`68af0f1`、`c5589c6`（Ginny）【客製介紹】零件鉛筆進場、即時門市地圖、滿版 CTA、塗裝選擇與展間背景、文案與間距。

## 2026-10-22

- [#2](https://github.com/ycc-bct/ai-native-bike-commerce/pull/2)、[#3](https://github.com/ycc-bct/ai-native-bike-commerce/pull/3)【客製車】編輯器版面與文案一致化。
- `73da203`、`62ab238`、`014b654`、`3f8bf97`（Ginny）【全站】header、footer 抽成共用元件（中文主選單＋下拉），header 加入客製化連結；結果頁顧問打開時 footer 跟著變窄。【客製介紹】展間比例與分頁。

## 2026-10-21

- `77e48b3`（Ginny）【客製介紹】頁面初版發布。

## 2026-10-20

- [#1](https://github.com/ycc-bct/ai-native-bike-commerce/pull/1)【客製車】新增客製車原型 `customized.html`（DEFY Advanced SL 客製流程：塗裝、尺寸與配備、確認配置）。
