# 可運行原型

直接打開 index.html（與 app.js/model.js 同目錄），不需安裝或網絡。不連接tabakojp.com，不改商城。也可在本地以 python3 -m http.server 8080 服務此目錄，再訪問 http://localhost:8080/index.html。

預覽：PC1363×936、手機393×852。自行瀏覽器設備模式可查看響應式；design-pc.svg/design-mobile.svg只是視覺示意。全部商品/品牌/數量為虛構fixture；詳情只打開本地dialog，底部導航為上下文示意、無站外連結。沒有加購或支付。

試用：日本香煙→品牌B→清除→下一頁；名稱反序；不存在→查看全部；測試面板接口失敗→重試；慢速模式快速切品牌；重新打開含hash的URL。node model.test.cjs驗證資料模型。

素材全部為本提案原創CSS/SVG文字幾何，無外部品牌Logo、商品照片、字體或第三方依賴。網站調研截圖來自公开测试网站，仅用于基线证据，不代表取得商標/素材再利用授权。所有源码使用MIT（见LICENSE）。

本目录是隔离的设计交付，绝不复制未授权商城源码。提交SHA以实际Git记录为准，coordinator审核反馈记入最终完整SHA。
