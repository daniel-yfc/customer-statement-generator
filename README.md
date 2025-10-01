📝 客戶對帳單產生器 (Customer Statement Generator)
🌟 專案概述
「客戶對帳單產生器」是一個現代化的前端網頁應用程式，專為快速且準確地生成客戶對帳單而設計。它能同時處理以台幣 (TWD) 計價的「紡織助劑」和以日幣 (JPY) 計價的「設備零組件」兩大業務類別，並提供專業的 PDF 匯出功能，解決傳統列印跑版問題。
✨ 主要功能
雙類別帳單處理 (Mileslines & Toshin): 可獨立管理紡織助劑與設備零組件兩類帳務，支援自由切換顯示。
即時金額計算:
紡織助劑：自動計算小計、營業稅 (5%) 與合計。
設備零組件：根據輸入的日幣匯率，將日幣總價轉換為台幣。
資料完整性: 所有數量及金額輸入強制要求為整數；所有涉及匯率或稅金的最終計算結果將自動四捨五入至整數。
智能匯率獲取: 點擊按鈕可呼叫外部 API 獲取最新的 JPY-TWD 匯率，並實作了配額檢查和備用 API Fallback 機制。
數據持久化: 所有輸入數據皆會即時儲存於瀏覽器 Local Storage，確保資料不會遺失。
專業 PDF 匯出 (v1.3): 整合 @react-pdf/renderer，產生固定樣式的高品質 PDF 對帳單，確保中日文字型正確顯示，並自動隱藏金額為零的區塊。
客戶資料管理: 提供預設客戶列表和「自行輸入」選項。
🛠️ 技術堆疊 (Tech Stack)
類別
技術
版本
用途
框架/語言
React
^18.2.0
UI Library


TypeScript
^4.9.5
Static Typing
樣式
Tailwind CSS
^3.4.1
Utility-first Styling
PDF 處理
@react-pdf/renderer
^3.1.9
高品質 PDF 文件產生
工具/函式庫
dayjs
^1.11.10
日期與時間格式化 (UTC 轉換)


lucide-react
^0.309.0
矢量圖標 (Icons)
部署
gh-pages
^4.0.0
部署至 GitHub Pages

🚀 專案啟動與部署
1. 安裝依賴項
請在專案根目錄執行以下指令安裝所有必要的依賴：
npm install


2. 環境變數設定
為了讓匯率 API 正常運作，您需要在專案根目錄建立一個 .env 檔案，並填入您的主要 API Key：
.env
# 從 exchangerate-api.com 取得
REACT_APP_EXCHANGE_API_KEY=YOUR_API_KEY_HERE


注意： 如果未提供有效的 API Key，系統將在嘗試呼叫主要 API 失敗後，自動切換至備用 API。
3. 開發模式
啟動開發伺服器：
npm start
# 伺服器通常運行於 http://localhost:3000


4. 部署至 GitHub Pages
使用 gh-pages 進行部署：
npm run deploy


提示： 此指令會先執行 npm run build 產生 production optimized 的程式碼。
