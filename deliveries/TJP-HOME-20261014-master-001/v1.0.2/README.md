# 龍吟首頁 HTML 原型 r03

狀態：工作草稿，等待人類美工確認視覺；未正式交付、未獲採用、未授權商城開發。此版修正橫幅 CTA 與背景圖內既有按鈕字樣重疊問題。

首頁的頁首、搜尋框、法規提示、優惠券、品牌卡、服務承諾、推薦商品卡、價格和底部導覽都是 HTML/CSS/JS 元素。橫幅、品牌 Logo 和商品照片作為獨立圖片素材，通過相對路徑載入。

## 預覽方式

GitHub 瀏覽器預覽（HTML/CSS/JS 實際渲染）：

`https://htmlpreview.github.io/?https://raw.githubusercontent.com/y5000/tabakojp-design-bridge/preview/longyin-html-r02/deliveries/TJP-HOME-20261014-master-001/v1.0.2/index.html`

本地運行：在本資料夾執行 `python3 -m http.server 8000`，再打開 `http://localhost:8000/`。保留 `assets/` 目錄與 `index.html` 的相對位置。

## 原型交互

- 搜尋欄提交後顯示演示搜尋提示並定位推薦商品。
- 優惠券按鈕可切換為已領取。
- 加入購物車按鈕會增加演示購物車數量；購物車按鈕開啟演示抽屜。
- 收藏按鈕可切換收藏狀態。
- 品牌卡和底部導覽可以操作並定位頁面。

搜尋結果、優惠券領取、購物車資料、收藏狀態均為前端演示，尚未連接 OpenCart API；不建立真實訂單或改變商城資料。

## 測試狀態

- PC 寬視口：Work Chrome 已實際打開 HTML 預覽，確認網頁元素和三張獨立素材可見；已操作一張優惠券，按鈕切換為「已領取」並顯示提示。測試日期：2026-10-16（Asia/Shanghai）。
- 393×852 手機視口與 iPhone Safari：`not_tested`。當前瀏覽器操控介面未提供 viewport 設定；本地伺服器 URL 與雲端瀏覽器網絡隔離。
- 購物車、收藏、搜尋、底部導覽等其他交互：已實作，尚未在瀏覽器逐項操作驗證。

待確認視覺後再按規則提交正式交付版本。
