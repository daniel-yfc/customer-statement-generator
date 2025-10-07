// src/components/CustomerStatementGenerator.tsx
import React, { useMemo, useCallback } from 'react';
import { statementReducer, initialState } from '../state/statementReducer';
import { usePersistentReducer } from '../hooks/usePersistentReducer';
import CustomerInfo from './CustomerInfo';
import MileslinesSection from './MileslinesSection';
import ToshinSection from './ToshinSection';
import ToshinItemsModal from './ToshinItemsModal';
import StatementDownloader from './StatementDownloader';
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
    timeNextUpdate, isLoading, remarks
  } = state;

  const fetchExchangeRate = useCallback(async () => {
    if (isLoading) return;
    dispatch({ type: 'SET_LOADING', payload: true });

    const now = dayjs().unix();
    if (now < timeNextUpdate) {
      alert(`匯率資料仍有效，無需更新。下次更新時間：${dayjs.unix(timeNextUpdate).local().format('YYYY-MM-DD HH:mm')}`);
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    try {
      const response = await fetch(EXCHANGE_RATE_API_URL);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.result !== 'success') throw new Error(data['error-type'] || 'API error');

      const { TWD, JPY } = data.rates;
      const newRate = (TWD && JPY) ? TWD / JPY : 0;

      if (newRate > 0) {
        const rate = parseFloat(newRate.toFixed(4));
        const nextUpdate = data.time_next_update_unix || dayjs().add(24, 'hour').unix();
        dispatch({ type: 'UPDATE_EXCHANGE_RATE', payload: { rate, nextUpdate } });
        
        const localTime = dayjs.utc(data.time_last_update_utc).local().format('YYYY-MM-DD HH:mm');
        alert(`✅ 匯率更新成功！\n新匯率: ${rate}\n數據時間: ${localTime}`);
      } else {
        throw new Error('Invalid rate received');
      }
    } catch (error) {
      console.error(`Fetch from ${EXCHANGE_RATE_API_URL} failed:`, error);
      alert('❌ 無法取得即時匯率，請檢查網路連線或手動輸入。');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isLoading, timeNextUpdate, dispatch]);

  const handleClearData = useCallback(() => {
    if (window.confirm('確定要清除所有已輸入的資料嗎？這個操作無法復原。')) {
      dispatch({ type: 'CLEAR_DATA' });
    }
  }, [dispatch]);

  // --- Calculations ---
  const formatNumber = (num: number): string => new Intl.NumberFormat('zh-TW').format(Math.round(num));
  const mileslinesSubtotal = useMemo(() => showMileslines ? mileslinesItems.reduce((sum, item) => sum + item.quantity * item.price, 0) : 0, [mileslinesItems, showMileslines]);
  const tax = useMemo(() => Math.round(mileslinesSubtotal * 0.05), [mileslinesSubtotal]);
  const mileslinesTotal = useMemo(() => mileslinesSubtotal + tax, [mileslinesSubtotal, tax]);
  const toshinTotalTWD = useMemo(() => showToshin ? toshinItems.reduce((sum, item) => sum + Math.round((item.isShipping ? item.priceJPY : item.quantity * item.priceJPY) * exchangeRate), 0) : 0, [toshinItems, showToshin, exchangeRate]);
  const grandTotal = useMemo(() => mileslinesTotal + toshinTotalTWD, [mileslinesTotal, toshinTotalTWD]);
  const billingPeriodText = useMemo(() => dayjs(statementDate).format('YYYY 年 M 月'), [statementDate]);

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 print:bg-white">
      <div className="no-print mb-6 p-4 bg-white rounded-lg shadow-md flex flex-wrap justify-between items-center gap-4 max-w-6xl mx-auto">
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
        <div className="flex items-center gap-4">
          <StatementDownloader {...state} {...{ mileslinesTotal, mileslinesSubtotal, tax, toshinTotalTWD, grandTotal, billingPeriodText, remarks }} />
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

        <CustomerInfo 
          customerList={customerList} 
          selectedCustomerName={selectedCustomerName} 
          customerData={customerData} 
          isEditable={selectedCustomerName === '自行輸入'} 
          onCustomerChange={(name) => dispatch({ type: 'SET_CUSTOMER', payload: name })} 
          onCustomerDataChange={(field, value) => dispatch({ type: 'UPDATE_CUSTOMER_DATA', payload: { field, value }})}
        />
        
        {showMileslines && <MileslinesSection 
          items={mileslinesItems} 
          products={mileslinesProducts} 
          onAddItem={() => dispatch({ type: 'ADD_MILESLINES_ITEM' })}
          onUpdateItem={(index, field, value) => dispatch({ type: 'UPDATE_MILESLINES_ITEM', payload: { index, field, value }})}
          onRemoveItem={(index) => dispatch({ type: 'REMOVE_MILESLINES_ITEM', payload: index })}
          onDescriptionChange={(index, description) => dispatch({ type: 'UPDATE_MILESLINES_DESCRIPTION', payload: { index, description } })}
          formatNumber={formatNumber} 
        />}
        
        {showToshin && <ToshinSection 
          items={toshinItems} 
          exchangeRate={exchangeRate} 
          services={toshinServices} 
          onAddItem={() => dispatch({ type: 'ADD_TOSHIN_ITEM' })}
          onUpdateItem={(index, field, value) => dispatch({ type: 'UPDATE_TOSHIN_ITEM', payload: { index, field, value }})}
          onRemoveItem={(index) => dispatch({ type: 'REMOVE_TOSHIN_ITEM', payload: index })}
          onDescriptionChange={(index, description) => dispatch({ type: 'UPDATE_TOSHIN_DESCRIPTION', payload: { index, description } })}
          onShowModal={() => dispatch({ type: 'SET_FIELD', payload: { field: 'showModal', value: true }})}
          formatNumber={formatNumber} 
          showTopBorder={showMileslines && mileslinesItems.length > 0} 
        />}
        
        <div className="mt-8 flex justify-end">
            <div className="w-full md:w-1/2 lg:w-2/5 space-y-2 text-base">
                {showMileslines && (
                  <>
                    <div className="flex justify-between items-center py-1">
                        <span className="text-gray-600">紡織助劑</span>
                        <CurrencyDisplay currency="$" amount={formatNumber(mileslinesSubtotal)} formatNumber={formatNumber} />
                    </div>
                    <div className="flex justify-between items-center py-1">
                        <span className="text-gray-600">營業稅</span>
                        <CurrencyDisplay currency="$" amount={formatNumber(tax)} formatNumber={formatNumber} />
                    </div>
                    <div className="flex justify-between items-center py-1 border-t font-semibold">
                        <span className="text-gray-800">紡織助劑合計</span>
                        <CurrencyDisplay currency="$" amount={formatNumber(mileslinesTotal)} formatNumber={formatNumber} />
                    </div>
                  </>
                )}
                 {showToshin && (
                    <div className="flex justify-between items-center py-1 pt-4 font-semibold">
                        <span className="text-gray-800">設備零組件</span>
                         <CurrencyDisplay currency="$" amount={formatNumber(toshinTotalTWD)} formatNumber={formatNumber} />
                    </div>
                 )}
                 <div className="flex justify-between items-center py-2 border-t-2 border-gray-400 mt-4">
                    <span className="text-xl font-bold text-gray-900">本期帳款</span>
                    <span className="text-xl font-bold text-gray-900">{`$ ${formatNumber(grandTotal)}`}</span>
                 </div>
            </div>
        </div>

        <div className="mt-6">
            <h4 className="font-semibold text-gray-700 mb-2">備註：</h4>
            <div className='space-y-1'>
              {remarks.map((remark, index) => (
                <input
                  key={index}
                  type="text"
                  className="no-print bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg p-1 w-full border"
                  value={remark}
                  onChange={(e) => dispatch({ type: 'UPDATE_REMARK', payload: { index, value: e.target.value } })}
                  placeholder={index === remarks.length - 1 ? '新增備註...' : `備註事項 ${index + 1}`}
                />
              ))}
            </div>
             <div className="hidden print-block text-sm text-gray-600">
                {remarks.filter(r => r.trim() !== '').map((remark, index) => (
                    <p key={index}>{`${index + 1}. ${remark}`}</p>
                ))}
            </div>
        </div>
      </div>

      <ToshinItemsModal show={showModal} onClose={() => dispatch({ type: 'SET_FIELD', payload: { field: 'showModal', value: false }})} services={toshinServices} />
    </div>
  );
};

export default CustomerStatementGenerator;

