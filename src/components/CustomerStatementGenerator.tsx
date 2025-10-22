pm// src/components/CustomerStatementGenerator.tsx
import React, { useCallback, useEffect } from 'react';
import { statementReducer, initialState } from '../state/statementReducer';
import { usePersistentReducer } from '../hooks/usePersistentReducer';
import { useStatementTotals } from '../hooks/useStatementTotals';
import { formatNumber } from '../utils/format'; 
import CustomerInfo from './CustomerInfo';
import MileslinesSection from './MileslinesSection';
import ToshinSection from './ToshinSection';
import ToshinItemsModal from './ToshinItemsModal';
import { CurrencyDisplay } from './CurrencyDisplay';
import { Trash2, Loader2, Settings } from 'lucide-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { customerList, mileslinesProducts, toshinServices } from '../data';
import '../fonts';

dayjs.extend(utc);
dayjs.extend(localizedFormat);

const EXCHANGE_RATE_API_URL = 'https://open.er-api.com/v6/latest/USD';

const CustomerStatementGenerator: React.FC = () => {
  const [state, dispatch] = usePersistentReducer(statementReducer, initialState, 'statementState');
  const {
    exchangeRate, statementDate, showMileslines, showToshin, showModal,
    customerData, selectedCustomerName, mileslinesItems, toshinItems,
    timeNextUpdate, isLoading, remarks,
    apiError, apiSuccess
  } = state;

  const fetchExchangeRate = useCallback(async () => {
    if (isLoading) return;
    dispatch({ type: 'SET_LOADING', payload: true });

    const now = dayjs().unix();
    if (now < timeNextUpdate) {
      const nextUpdateTime = dayjs.unix(timeNextUpdate).local().format('YYYY-MM-DD HH:mm');
      dispatch({ 
        type: 'SET_API_STATUS', 
        payload: { success: `匯率資料仍有效。下次更新：${nextUpdateTime}` } 
      });
      return;
    }

    try {
      const response = await fetch(EXCHANGE_RATE_API_URL);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.result !== 'success') throw new Error(data['error-type'] || 'API error');

      const { TWD, JPY } = data.rates;
      if (!TWD || !JPY) throw new Error('API data missing TWD or JPY rates');
      
      const newRate = TWD / JPY;

      if (newRate > 0) {
        const rate = parseFloat(newRate.toFixed(4));
        const nextUpdate = data.time_next_update_unix || dayjs().add(24, 'hour').unix();
        dispatch({ type: 'UPDATE_EXCHANGE_RATE', payload: { rate, nextUpdate } });
        
        const localTime = dayjs.utc(data.time_last_update_utc).local().format('YYYY-MM-DD HH:mm');
        dispatch({ 
          type: 'SET_API_STATUS', 
          payload: { success: `✅ 匯率更新成功！(${localTime})` } 
        });
      } else {
        throw new Error('Invalid rate received');
      }
    } catch (error) {
      console.error(`Fetch from ${EXCHANGE_RATE_API_URL} failed:`, error);
      dispatch({ 
        type: 'SET_API_STATUS', 
        payload: { error: '❌ 無法取得即時匯率，請稍後再試或手動輸入。' } 
      });
    }
  }, [isLoading, timeNextUpdate, dispatch]);

  useEffect(() => {
    if (apiError || apiSuccess) {
      const timer = setTimeout(() => {
        dispatch({ type: 'CLEAR_API_STATUS' });
      }, 4000); 
      return () => clearTimeout(timer);
    }
  }, [apiError, apiSuccess, dispatch]);

  const handleClearData = useCallback(() => {
    if (window.confirm('確定要清除所有已輸入的資料嗎？這個操作無法復原。')) {
      dispatch({ type: 'CLEAR_DATA' });
    }
  }, [dispatch]);

  const handleMileslinesDescriptionChange = useCallback((index: number, description: string) => {
    dispatch({ type: 'UPDATE_MILESLINES_DESCRIPTION', payload: { index, description } });
  }, [dispatch]);

  const handleToshinDescriptionChange = useCallback((index: number, description: string) => {
    dispatch({ type: 'UPDATE_TOSHIN_DESCRIPTION', payload: { index, description } });
  }, [dispatch]);

  const {
    mileslinesSubtotal,
    tax,
    mileslinesTotal,
    toshinTotalTWD,
    toshinTotalJPY, 
    grandTotal,
    billingPeriodText,
  } = useStatementTotals({
    showMileslines,
    mileslinesItems,
    showToshin,
    toshinItems,
    exchangeRate,
    statementDate,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 print:bg-white">
       <div className="no-print mb-6 p-4 bg-white rounded-lg shadow-md flex flex-wrap justify-between items-center gap-4 max-w-6xl mx-auto">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-gray-700 font-medium">日幣匯率：</label>
              <input className="w-24 bg-gray-50 p-2 border rounded-lg" type="number" step="0.0001" value={exchangeRate} onChange={(e) => dispatch({ type: 'SET_FIELD', payload: { field: 'exchangeRate', value: parseFloat(e.target.value) || 0 }})} />
              <button onClick={fetchExchangeRate} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded-lg flex items-center gap-2 disabled:opacity-50" disabled={isLoading}>
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Settings size={14} />}
                {isLoading ? '取得中...' : '更新匯率'}
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="h-5 w-5 rounded" checked={showMileslines} onChange={(e) => dispatch({ type: 'SET_FIELD', payload: { field: 'showMileslines', value: e.target.checked }})} />
                <span>紡織助劑</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="h-5 w-5 rounded" checked={showToshin} onChange={(e) => dispatch({ type: 'SET_FIELD', payload: { field: 'showToshin', value: e.target.checked }})} />
                <span>設備零組件</span>
              </label>
            </div>
          </div>
          <div className="h-5"> 
            {apiError && (
              <p className="text-sm text-red-600 font-medium">
                {apiError}
              </p>
            )}
            {apiSuccess && (
              <p className="text-sm text-green-600 font-medium">
                {apiSuccess}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleClearData} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><Trash2 size={16} />清除重設</button>
        </div>
      </div>
      
      <div className="printable-area bg-white p-4 sm:p-8 rounded-lg shadow-xl text-sm max-w-6xl mx-auto">
        <header className="flex justify-between items-start mb-4 pb-4 border-b">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">客戶對帳單</h1>
            <p className="text-gray-500">STATEMENT</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-lg">{billingPeriodText}</p>
            <div className="flex items-center justify-end gap-2 text-gray-600">
              <label htmlFor="statementDate">對帳單日期：</label>
              <input type="date" id="statementDate" className="no-print bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg p-1 w-36 border" value={statementDate} onChange={(e) => dispatch({ type: 'SET_FIELD', payload: { field: 'statementDate', value: e.target.value }})} />
              <span className="hidden print-block">{dayjs(statementDate).format('YYYY-MM-DD')}</span>
            </div>
          </div>
        </header>
// src/components/CustomerStatementGenerator.tsx (Fixed)
        <CustomerInfo 
          customerList={customerList} 
          selectedCustomerName={selectedCustomerName} 
          customerData={customerData} 
          isEditable={selectedCustomerName === '自行輸入'} 
          onCustomerChange={(name) => dispatch({ type: 'SET_CUSTOMER', payload: name })} 
          // 註解：onCustomerDataChange 回調是類型安全的。
          // 'field' (keyof Customer) 和 'value' (string)
          // 與 'UPDATE_CUSTOMER_DATA' action 的 payload 類型匹配。
          // 移除導致 TS2367 錯誤的多餘 if 判斷。
          onCustomerDataChange={(field, value) => {
            dispatch({ type: 'UPDATE_CUSTOMER_DATA', payload: { field, value } });
          }}
        />

        
        {showMileslines && (
          <MileslinesSection
            items={mileslinesItems}
            products={mileslinesProducts}
            onAddItem={() => dispatch({ type: 'ADD_MILESLINES_ITEM' })}
            onUpdateItem={(index, field, value) => dispatch({ type: 'UPDATE_MILESLINES_ITEM', payload: { index, field, value } })}
            onRemoveItem={(index) => dispatch({ type: 'REMOVE_MILESLINES_ITEM', payload: index })}
            onDescriptionChange={handleMileslinesDescriptionChange}
            formatNumber={formatNumber}
          />
        )}

        {showToshin && (
          <ToshinSection
            items={toshinItems}
            exchangeRate={exchangeRate}
            services={toshinServices}
            onAddItem={() => dispatch({ type: 'ADD_TOSHIN_ITEM' })}
            onUpdateItem={(index, field, value) => dispatch({ type: 'UPDATE_TOSHIN_ITEM', payload: { index, field, value } })}
            onRemoveItem={(index) => dispatch({ type: 'REMOVE_TOSHIN_ITEM', payload: index })}
            onDescriptionChange={handleToshinDescriptionChange}
            onShowModal={() => dispatch({ type: 'SET_FIELD', payload: { field: 'showModal', value: true } })}
            formatNumber={formatNumber}
            showTopBorder={showMileslines}
            toshinTotalJPY={toshinTotalJPY}
          />
        )}
        
        <div className="mt-8 flex justify-end">
          <div className="w-full md:w-1/2 lg:w-2/5">
            {showMileslines && (
              <>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-gray-600">紡織助劑 小計</span>
                  <CurrencyDisplay currency="$" amount={mileslinesSubtotal} />
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-gray-600">營業稅 (5%)</span>
                  <CurrencyDisplay currency="$" amount={tax} />
                </div>
                <div className="flex justify-between py-1 font-semibold">
                  <span className="text-gray-800">紡織助劑 合計</span>
                  <CurrencyDisplay currency="$" amount={mileslinesTotal} />
                </div>
              </>
            )}
            {showToshin && (
              <div className={`flex justify-between py-1 font-semibold ${showMileslines ? 'mt-2' : ''}`}>
                <span className="text-gray-800">設備零組件 合計</span>
                <CurrencyDisplay currency="$" amount={toshinTotalTWD} />
              </div>
            )}
            <div className="flex justify-between py-2 border-t-2 border-gray-800 mt-2">
              <span className="text-xl font-bold text-gray-900">總計</span>
              <CurrencyDisplay currency="$" amount={grandTotal} className="text-xl font-bold" />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-md font-semibold text-gray-700 mb-2">備註</h4>
          <textarea 
            className="no-print w-full p-2 border rounded-lg bg-gray-50"
            rows={3} 
            value={remarks.join('\n')}
            onChange={(e) => dispatch({ type: 'SET_FIELD', payload: { field: 'remarks', value: e.target.value.split('\n') }})}
            placeholder="請輸入品項說明或注意事項..."
          />
          <div className="hidden print-block whitespace-pre-wrap text-xs">
            {remarks.join('\n')}
          </div>
        </div>
      </div>

      <ToshinItemsModal 
        show={showModal} 
        onClose={() => dispatch({ type: 'SET_FIELD', payload: { field: 'showModal', value: false } })} 
        services={toshinServices} 
      />
    </div>
  );
};

export default CustomerStatementGenerator;



