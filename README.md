#📝 客戶對帳單產生器 (Customer Statement Generator)
一款現代化的網頁應用程式，專為快速、準確地生成客戶對帳單而設計，並提供高品質的 PDF 匯出功能。

***

###✨ 線上預覽 (Live Demo)
您可以透過以下連結直接體驗最新版本：
  > <https://[TBC]>

***

## 核心功能
* 雙業務類別處理: 可獨立管理以台幣 (TWD) 計價的「紡織助劑」與以日幣 (JPY) 計價的「設備零組件」兩類帳務。
* 即時金額計算: 自動計算稅金、小計與總計，並根據匯率即時換算日幣金額。所有計算結果皆四捨五入至整數。
* 智慧匯率獲取: 可一鍵從外部 API 獲取最新匯率，並具備備用 API 的 Fallback 機制。
* 數據本地持久化: 所有輸入的資料都會自動儲存於瀏覽器的 Local Storage，關閉分頁也不會遺失。
* 專業 PDF 匯出: 整合 @react-pdf/renderer，確保匯出的 PDF 文件樣式固定、字型清晰，並會自動隱藏金額為零的區塊。
* 靈活的品項管理: 提供預設品項列表，並支援使用者「自行輸入」客製化項目。

***
  
##📂 專案檔案結構<p>
<br>
customer-statement-generator/<br>
├── public/　　　　　　　　　  # 公用資源與 index.html<br>
├── src/<br>
│　　├── components/　　　　　　# React UI 元件<br>
│　　│　　├── CustomerStatementGenerator.tsx  # 主要應用程式元件<br>
│　　│　　├── CustomerInfo.tsx　　　　　　# 客戶資訊區塊<br>
│　　│　　├── MileslinesSection.tsx　　　　# 紡織助劑品項區塊<br>
│　　│　　├── ToshinSection.tsx　　　　　　 # 設備零組件品項區塊<br>
│　　│　　├── StatementPDF.tsx　　　　　　# PDF 文件結構定義<br>
│　　│　　└── ...　　　　　　　　　　　　  # 其他輔助元件<br>
│　　│<br>
│　　├── hooks/　　　　　　　　　　 # 自定義 React Hooks<br>
│　　│　　├── useExchangeRate.ts　　  # 處理匯率 API 邏輯<br>
│　　│　　└── useLocalStorage.ts　　  # 處理本地儲存邏輯<br>
│　　│<br>
│　　├── App.tsx　　　　　　　　　　# 應用程式進入點<br>
│　　├── data.ts　　　　　　　　　　# 靜態資料 (客戶、產品列表)<br>
│　　├── statementReducer.ts　　# 核心狀態管理 Reducer<br>
│　　└── types.ts　　　　　　　　  # TypeScript 型別定義<br>
│<br>
├── .github/　　　　　　　　　　 # GitHub Actions CI/CD 設定<br>
├── package.json<br>
└── README.md<br>

***

#🚀 架構設計
  - 本專案採用 useReducer 進行集中的狀態管理，實現了清晰的單向資料流。
　　 - statementReducer.ts: 定義了整個應用程式的 state shape 以及所有可以改變 state 的 actions，是所有業務邏輯的核心。
　　 - src/hooks/:
　　　　- useLocalStorage.ts: 一個通用的 Hook，用於將 state 同步到 localStorage。
　　　　- useExchangeRate.ts: 封裝了所有與外部匯率 API 互動的邏輯，包含 loading、error 等狀態。
　　　　- 資料流: 主元件 CustomerStatementGenerator 初始化 reducer，並將 state 和 dispatch 函式向下傳遞。子元件透過讀取 state 渲染 UI，並呼叫dispatch 來觸發狀態更新。

🛠️ 技術堆疊
  - 框架: React ^18.2.0 + TypeScript ^4.9.5
  - 狀態管理: React Hooks (useReducer)
  - 樣式: Tailwind CSS ^3.4.1
  - PDF 產生: @react-pdf/renderer ^3.1.9
  - 工具: dayjs, lucide-react
  - 部署: GitHub Pages

***


快速開始
1. 取得專案原始碼
  <pre><code> git clone <https://github.com/daniel-yfc/customer-statement-generator.git></code></pre>
  <pre><code>cd customer-statement-generator </code></pre>

2. 安裝依賴項
  <pre><code> npm install　</code></pre>

3. 設定環境變數：在專案根目錄建立一個 .env 檔案，從 <https://www.exchangerate-api.com> 取得 API Key。

  .env
  <pre><code>REACT_APP_EXCHANGE_API_KEY=YOUR_API_KEY_HERE</code></pre>
  注意：若未提供 API Key，系統將自動使用備用 API。

4. 啟動開發環境<br>
  <pre><code> npm start </code></pre>
  應用程式將會運行在 http://localhost:3000。

5. 部署至 GitHub Pages
  <pre><code> npm run deploy </code></pre>

 此指令會自動建置專案並將 build 資料夾的內容部署到 gh-pages 分支。

授權條款
本專案採用 MIT License 授權。
