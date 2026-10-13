# 煙の極み首頁母版｜前端設計交付 v1.0.0

設計交付編號：TJP-HOME-20261014-master-001。此編號為美工自建交付識別，不冒充coordinator正式開發task。來源：用戶2026-10-14要求依19534.jpeg製成可交付狀態。

## 直接預覽
打開 preview.html：CSS、JavaScript、原始母版圖像全部內嵌，無網絡依賴。
開發入口 index.html：與 styles.css/app.js/assets/ 同目錄打開。review.html 可切換393/1120 CSS px iframe佈局；它不是手機設備仿真或部署測試。

## 交付範圍
HTML/CSS/JS首頁與原創線性SVG圖標；母版素材視窗；本地演示搜索、品牌入口、領券、收藏、購物車增減、詳情與會員說明。保留當前母版內容順序、深藍、富士櫻花banner、5品牌、3服務、1推薦商品與4導航。未添加未提供的商品或廣告。

此版本是可交付的設計原型，不是可直接覆蓋OpenCart的正式主題，也不代表真實業務已實現或驗收。正式站維持既有功能，coordinator需核對接口/路由/資料與修改scope，再安排實施。已批准的品牌快篩提案e848ba87b4ab115f8ad349ea61548fbc82200def不在本次修改範圍。

## 文件
- DESIGN_SPEC.md：母版映射、色彩、尺寸及响应式。
- INTEGRATION.md：前端接入與後端數據/業務確認項。
- ASSETS.md：素材來源、精確viewport、品質限制。
- PROTOTYPE_TEST.md：實際檢查及not_tested。
- SHA256SUMS.json：交付文件校驗。

純原型無依賴、無安裝、不改正式商城。瀏覽器原生dialog；目標现代Chrome/Safari，iOS實機尚未測試。
