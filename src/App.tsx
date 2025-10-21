// src/App.tsx
import React from 'react'; // 移除 useMemo
import './App.css';
import CustomerStatementGenerator from './components/CustomerStatementGenerator';
import StatementDownloader from './components/StatementDownloader';
import { usePersistentReducer } from './hooks/usePersistentReducer';
import { statementReducer, initialState } from './state/statementReducer';
// [Suggestion #5] 導入 Hook
import { useStatementTotals } from './hooks/useStatementTotals';
// [Suggestion #6] 導入工具
import { formatNumber } from './utils/format';

function App() {
  const [state] = usePersistentReducer(statementReducer, initialState, 'statementState');

  // [Suggestion #6] 移除本地的 formatNumber
  // const formatNumber = (num: number): string => new Intl.NumberFormat('zh-TW').format(Math.round(num));

  // [Suggestion #5] 使用 Hook
  const {
    mileslinesSubtotal,
    tax,
    mileslinesTotal,
    toshinTotalTWD,
    toshinTotalJPY,
    grandTotal,
    billingPeriodText,
  } = useStatementTotals({
    showMileslines: state.showMileslines,
    mileslinesItems: state.mileslinesItems,
    showToshin: state.showToshin,
    toshinItems: state.toshinItems,
    exchangeRate: state.exchangeRate,
    statementDate: state.statementDate,
  });
  
  // [Suggestion #5] 移除所有重複的 useMemo hooks
  // const mileslinesSubtotal = useMemo(...); // <-- 移除
  // const tax = useMemo(...); // <-- 移除
  // const mileslinesTotal = useMemo(...); // <-- 移除
  // const toshinTotalTWD = useMemo(...); // <-- 移除
  // const grandTotal = useMemo(...); // <-- 移除
  // const billingPeriodText = useMemo(...); // <-- 移除

  return (
    <div className="App">
      <CustomerStatementGenerator />

      {/* [Code Reviewer]：這是一個奇怪的架構。
        StatementDownloader 應該在 CustomerStatementGenerator 內部，
        而不是在 App.tsx 中並排。
        但我們將修復當前的程式碼。
      */}

      <div style={{ display: 'none' }}>
        <StatementDownloader
          customerData={state.customerData}
          statementDate={state.statementDate}
          mileslinesItems={state.mileslinesItems}
          toshinItems={state.toshinItems}
          remarks={state.remarks}
          exchangeRate={state.exchangeRate}
          // 傳遞由 Hook 計算出的值
          mileslinesTotal={mileslinesTotal}
          mileslinesSubtotal={mileslinesSubtotal}
          tax={tax}
          toshinTotalTWD={toshinTotalTWD}
          toshinTotalJPY={toshinTotalJPY}
          grandTotal={grandTotal}
          billingPeriodText={billingPeriodText}
          // [Suggestion #6] 傳遞導入的 formatNumber
          formatNumber={formatNumber}
        />
      </div>
    </div>
  );
}

export default App;
