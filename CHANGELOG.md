# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 建立對帳單產生器基礎功能，包含客戶資訊、品項列表、總計等區塊。
- 新增「紡織助劑」與「設備零組件」兩個獨立的業務區塊。
- 實現 JPY 至 TWD 的匯率換算功能。
- 實現互動式表格，支援動態新增、刪除、修改品項。
- 新增 `localStorage` 功能，可自動保存與載入使用者輸入的所有資料。
- 新增列印時動態產生標題的功能，格式為 `[客戶簡稱] - [年月] 對帳單`。
- 新增基礎可訪問性 (Accessibility) 功能，如 `role="button"` 和 `<label>`。
- 新增 `ToshinItemsModal` 元件，提供零組件品項參考清單。
- 新增 SVG Logo 並對其路徑資料進行了優化。

### Changed
- **架構重構**：將單一巨型元件重構為多個職責單一的子元件 (`CustomerInfo`, `MileslinesSection`, etc.)，並使用 `React.memo` 進行效能優化。
- **資料外部化**：將硬編碼的客戶與產品列表移至獨立的 `data.ts` 檔案。
- **UI/UX 優化**：
    - 實作 `CurrencyDisplay` 元件，提供「點擊進入編輯模式」的千分位金額輸入體驗。
    - 全面調整版面，統一表格欄位寬度、對齊方式、字體大小與間距。
    - 移除所有不必要的分隔線與背景色，使版面更簡潔。
    - 調整頁首與客戶資訊區塊為更專業的雙欄式對齊佈局。
    - 調整合計與總額區塊的排版，使標籤與金額更緊湊。
- **列印樣式優化**：
    - 針對 A4 格式進行了全面的樣式優化。
    - 實現相同日期項目的自動群組化，隱藏重複日期與分隔線，並收緊了行距。
    - 修正了列印時數字輸入框的對齊問題。
    - 確保合計區塊的版面在列印時與螢幕呈現一致。

### Fixed
- 修正開發過程中出現的多個 TypeScript 型別錯誤。
- 修正 JSX 中的語法解析錯誤 (例如 `>`)。
- 修正多項由使用者回報的版面錯位與對齊問題。