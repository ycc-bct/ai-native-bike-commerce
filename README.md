# GIANT 沈浸式選車 · 提案原型

捷安特（GIANT）「沈浸式選車」的兩個提案方向。皆為單一 HTML 檔，無 build、無框架。

- **提案總覽**：https://ycc-bct.github.io/ai-native-bike-commerce/
- **01 選車現場 · 展廳視角**：https://ycc-bct.github.io/ai-native-bike-commerce/showroom/
- **02 選車現場 · 聚光燈視角**：https://ycc-bct.github.io/ai-native-bike-commerce/integrated/
- **03 選車顧問 · 左右分割**：https://ycc-bct.github.io/ai-native-bike-commerce/mia/

## 01 選車現場 · 展廳視角（`showroom/`）

打開先是官網版首頁與分類頁（含篩選、清單、逛一陣子後店員走近的「幫我整理／先自己逛」與「你的路線」）。右上「開始搜尋」或「你想騎去哪裡？」下方的「進入選車現場」進到展廳；展廳右上「結束」回首頁。右下角「Tips」列出可以體驗的功能，每條有 Try it。

展廳把門市人員搬進來：畫面是一間車店，左中右三個展區各放一組車。底部的球是門市人員，點它才會開口介紹目前展區；平常讓你自己逛。

- 用說的或打字告訴它用途，它會換到對應展區、指出一台車。
- **我的尺寸**：輸入身高一次，之後進「車架幾何」頁直接看建議尺寸（cm／feet 切換）。
- **車款比較**：目前展區三台車的價格與適合情境並排。
- 尺寸區間目前是通用示意值，等接上 GIANT 官方 Size Guide 再逐車系換。

## 02 選車現場 · 聚光燈視角（`integrated/`）

首頁、分類頁與選車現場整合在同一份 HTML。選車現場是暗場聚光視角，一次專注一台車；上方分類列切換車種，右側可直接輸入或用語音描述需求，另有「我適合的尺寸」與「比較車款」。

## 03 選車顧問 · 左右分割（`mia/`）

左側情境主視覺輪播、右側常駐對話。從主視覺按「探索更多」時，畫面裡正在被騎乘的那台車會飛進車系頁成為主打車款（同一張去背圖接手，落點對齊）；車系頁下方六張卡可切換主打，右側對話同步換成該車介紹。

- 車款名稱、價格取自 giant-bicycles.com/tw；畫面中的活動價與贈品為示範內容。
- 素材：情境合成圖（背景／騎士／車三層）與各車系去背圖。

## 本機執行

```bash
python3 -m http.server 8000
# 開 http://localhost:8000/
```

## 結構

```
index.html      提案總覽
showroom/       01 展廳視角（index.html + Bikes/ + bg/）
integrated/     02 聚光燈視角（index.html + Bikes/ + bg/ + icons/）
mia/            03 左右分割（index.html + assets/ + uploads/）
_thumbs/        總覽頁縮圖
```

## 說明

兩個原型皆為提案討論用，非正式產品。版型、車款名稱、價格與規格分類取自 giant-bicycles.com/tw 公開頁面；活動價、贈品為示範內容，不代表實際銷售條件。尺寸建議為通用示意值，正式版需接官方 Size Guide。
