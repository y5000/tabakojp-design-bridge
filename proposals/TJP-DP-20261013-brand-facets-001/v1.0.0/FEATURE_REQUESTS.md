# F01｜搜索品牌快篩（提案，不是開發命令）

關聯：TJP-DP-20261013-brand-facets-001 v1.0.0；正式接口能力 unknown，需coordinator核查。

## 候選契約 v1（未批准/未實現）
優先擴充既有匿名商品列表回應，不固定新URL。候選GET參數：search（trim後最多100字符）、manufacturer_id（單品牌可選）、page（正整數）、limit（既有允許值）、sort/order（既有白名單）。保留既有category/language/store上下文，不從客戶端信任可見性或價格權限。
回應：contract_version、applied_filters、products（既有字段）、total、page、limit、brand_facets:[{manufacturer_id,name,count}]、unfiltered_total。品牌件數是搜尋+分類+store/language可見範圍、未加當前品牌條件、未分頁之前的distinct商品數。沒有品牌的商品計入全部數量，省略品牌按鈕；facet之和可能小於全部數量，不得強行湊齊。不包含庫存、內部商品/用戶字段，不提供真實交易能力。

搜尋是按現有站語義（可能包含組合商品）；不擅自決定父商品/變體/組合成員計數，要先確定一致的product_id去重口徑。一個回應或相同查詢快照應包含卡片/總數/facets，避免前端多次拼接不一致數據。

錯誤：非法品牌/參數400 + INVALID_FILTER，返回可公開信息；空結果200且products/facets空；服務錯誤5xx可重試。後端參數校验、既有匿名可見範圍和防濫用策略沿用；不擴權。無數據變更，因此不需求DB migration。可選短TTL缓存必须包含完整搜尋+分類+store/language鍵，不能跨可見性範圍。

前端採用伺服器回傳applied_filters，不從當頁計算facets；切換品牌重置page，保留排序；請求序號/AbortController避免競態。關閉feature flag或接口失敗時保留現有列表，不能使搜尋壞掉。

## 模擬邊界
model.js只是7條虛構商品fixture的本地查詢模型，不代表生產全文搜尋、API、權限、緩存已實現。app.js模擬延遲和錯誤，沒有fetch或私有接口。候選contract正式联调未测。

## 分工與聯調門檻
coordinator：確認此功能尚未提供或可改進的證據，後端合理職責、精確scope、依賴與用戶批准來源。
backend：復用/調整現有read-only列表能力，提供真實契約、测试数据和回退证据；未批准前不執行。
frontend：元件整合、URL/響應式/無障礙/競態與降級；backend reviewed後才真實聯調。
Work美工：批准前只提案；批准後保持基線；收到進入美工復核許可後按部署版本實測並提交deliveries/SITE_REVIEW，問題由coordinator分派。
