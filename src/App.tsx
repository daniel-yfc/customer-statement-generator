// src/App.tsx
import React from 'react';
import './App.css';
import CustomerStatementGenerator from './components/CustomerStatementGenerator';
import StatementDownloader from './components/StatementDownloader';
import { usePersistentReducer } from './hooks/usePersistentReducer';
import { statementReducer, initialState } from './state/statementReducer';
import { useStatementTotals } from './hooks/useStatementTotals';
import { formatNumber } from './utils/format';

function App() {
  const [state] = usePersistentReducer(statementReducer, initialState, 'statementState');

  // 使用 Hook
  const {
    mileslinesSubtotal,
    tax,
    mileslinesTotal,
    toshinTotalTWD,
    toshinTotalJPY, // 獲取 JPY 總額 (ToshinSection 需要)
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

  return (
    <div className="App">
      <CustomerStatementGenerator />

      <div style={{ display: 'none' }}>
        {/* [FIX] 使用 {...state} 傳遞完整的 state 物件 */}
        <StatementDownloader
          {...state} 
          
          // 傳遞由 Hook 計算出的值
          mileslinesTotal={mileslinesTotal}
          mileslinesSubtotal={mileslinesSubtotal}
          tax={tax}
          toshinTotalTWD={toshinTotalTWD}
          grandTotal={grandTotal}
          billingPeriodText={billingPeriodText}
          
          // 傳遞導入的 formatNumber
          formatNumber={formatNumber}
        />
      </div>
    </div>
  );
}

export default App;
