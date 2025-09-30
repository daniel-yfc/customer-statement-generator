# 客戶對帳單產生器 (Customer Statement Generator)

這是一個基於 React 和 TypeScript 開發的網頁應用程式，旨在提供一個高效率、高客製化的客戶對帳單製作工具。使用者可以透過簡單的介面操作，動態產生包含不同業務類型（紡織助劑、設備零組件）的對帳單，並產出專業、適合列印的 A4 格式文件。

## 功能特色 (Features)

- **動態客戶管理**：支援從預設列表中選擇客戶，或手動輸入新客戶資料。
- **雙業務模組**：可同時處理「紡織助劑」與「設備零組件」兩類不同計價方式（台幣、日幣）的項目。
- **即時匯率換算**：支援日幣 (JPY) 至台幣 (TWD) 的匯率換算，並即時更新總額。
- **自動化計算**：自動計算各項目的小計、稅金（營業稅 5%）、區塊合計與最終總額。
- **互動式表格**：使用者可以動態新增、編輯、刪除對帳單中的每一個項目。
- **友善的金額輸入**：所有金額欄位（單價、運費）在平時會以帶有千分位的格式顯示，點擊後即可進入純數字編輯模式。
- **資料本地保存**：利用 `localStorage` 自動儲存所有輸入的資料。關閉或刷新頁面後，資料會被保留並自動載入。
- **專業列印優化**：
    - 輸出樣式針對 A4 紙張進行了優化。
    - 列印時相同日期的項目會自動群組，隱藏重複日期與分隔線，使版面更緊湊。
    - 根據客戶名稱與帳單月份，自動產生語意化的檔案名稱（例如 `客戶A - 2025年9月 對帳單.pdf`）。
- **可訪問性 (Accessibility)**：對表單、按鈕等互動元件進行了語意化優化，提升了對輔助工具（如螢幕閱讀器）的支援。

## 技術棧 (Tech Stack)

- **React**: 核心前端框架。
- **TypeScript**: 提供靜態型別檢查，提升程式碼的健壯性。
- **Tailwind CSS**: 用於快速建構響應式且客製化的使用者介面。
- **Lucide React**: 提供輕量且一致的圖示庫。

## 安裝與啟動 (Installation & Setup)

1.  **安裝依賴套件**:
    ```bash
    npm install
    ```
2.  **啟動開發伺服器**:
    ```bash
    npm start
    ```
    應用程式將會在本機的 `http://localhost:3000` 上啟動。

## 檔案結構 (Project File Structure)

```
customer-statement-generator/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/
│       ├── CurrencyDisplay.tsx             # 貨幣顯示元件
│       ├── CustomerInfo.tsx                # 客戶資訊區塊元件
│       ├── CustomerStatementGenerator.tsx  # 主頁面與核心邏輯元件
│       ├── MileslinesSection.tsx           # 紡織助劑區塊元件
│       ├── ToshinItemsModal.tsx            # 零組件品項參考彈出視窗元件
│       └── ToshinSection.tsx               # 設備零組件區塊元件
├── .github/
│   └── workflows/
│       └── deploy.yml
├── package.json
├── tsconfig.json
└── README.md
├── data.ts                                 # 預設客戶與產品資料
└── types.ts                                # 全域 TypeScript 型別定義
## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/customer-statement-generator.git
cd customer-statement-generator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Deployment to GitHub Pages

### Method 1: Automatic Deployment (GitHub Actions)

1. Push your code to the `main` branch
2. GitHub Actions will automatically build and deploy your app
3. Your app will be available at `https://YOUR_USERNAME.github.io/customer-statement-generator`

### Method 2: Manual Deployment

1. Update the `homepage` field in `package.json`:
```json
"homepage": "https://YOUR_USERNAME.github.io/customer-statement-generator"
```

2. Deploy:
```bash
npm run deploy
```

## License
This project is licensed under the MIT License.

© 2025 Daniel Chen 
