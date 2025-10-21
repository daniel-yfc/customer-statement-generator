// src/hooks/useStatementTotals.ts
import { useMemo } from 'react';
import { StatementState } from '../state/statementReducer';
import dayjs from 'dayjs';

// 我們僅傳入需要的 state 部分，以優化 memoization
type UseStatementTotalsProps = {
  showMileslines: StatementState['showMileslines'];
  mileslinesItems: StatementState['mileslinesItems'];
  showToshin: StatementState['showToshin'];
  toshinItems: StatementState['toshinItems'];
  exchangeRate: StatementState['exchangeRate'];
  statementDate: StatementState['statementDate'];
};

/**
 * [Suggestion #5]
 * 一個自定義 Hook，用於封裝所有關於帳單總計的計算邏輯。
 * 這能讓 CustomerStatementGenerator 主組件保持簡潔。
 */
export const useStatementTotals = ({
  showMileslines,
  mileslinesItems,
  showToshin,
  toshinItems,
  exchangeRate,
  statementDate,
}: UseStatementTotalsProps) => {
  
  const mileslinesSubtotal = useMemo(() => {
    return showMileslines 
      ? mileslinesItems.reduce((sum, item) => sum + item.quantity * item.price, 0) 
      : 0;
  }, [mileslinesItems, showMileslines]);

  const tax = useMemo(() => {
    return Math.round(mileslinesSubtotal * 0.05);
  }, [mileslinesSubtotal]);

  const mileslinesTotal = useMemo(() => {
    return mileslinesSubtotal + tax;
  }, [mileslinesSubtotal, tax]);

  // 計算日幣總額 (轉換前)
  const toshinTotalJPY = useMemo(() => {
    return showToshin
      ? toshinItems.reduce((sum, item) => sum + (item.isShipping ? item.priceJPY : item.quantity * item.priceJPY), 0)
      : 0;
  }, [toshinItems, showToshin]);

  // 計算台幣總額 (轉換後)
  // 保持原始邏輯：單獨計算每個品項的台幣金額（四捨五入）然後再相加，以避免浮點數誤差
  const toshinTotalTWD = useMemo(() => {
    return showToshin 
      ? toshinItems.reduce((sum, item) => {
          const itemJPY = item.isShipping ? item.priceJPY : item.quantity * item.priceJPY;
          return sum + Math.round(itemJPY * exchangeRate);
        }, 0)
      : 0;
  }, [toshinItems, showToshin, exchangeRate]);

  const grandTotal = useMemo(() => {
    return mileslinesTotal + toshinTotalTWD;
  }, [mileslinesTotal, toshinTotalTWD]);

  const billingPeriodText = useMemo(() => {
    return dayjs(statementDate).format('YYYY 年 M 月');
  }, [statementDate]);

  return {
    mileslinesSubtotal,
    tax,
    mileslinesTotal,
    toshinTotalJPY, // 也導出日幣總額，以備將來使用
    toshinTotalTWD,
    grandTotal,
    billingPeriodText,
  };
};
