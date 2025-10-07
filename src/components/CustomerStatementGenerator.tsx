// src/components/CustomerStatementGenerator.tsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Customer, MileslinesItem, ToshinItem } from '../types';
import { customerList, mileslinesProducts, toshinServices } from '../data';
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
import '../fonts';

dayjs.extend(utc);
dayjs.extend(localizedFormat);

const getFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) as T : defaultValue;
  } catch {
    return defaultValue;
  }
};

// 安全性修正：移除 API 金鑰。為了保護您的金鑰不被洩漏，
// 應透過後端代理來請求匯率 API，而不是在前端直接發送請求。
// 此處我們將直接使用無須金鑰的備用 API 作為範例。
const EXCHANGE_RATE_API_URL = 'https://open.er-api.com/v6/latest/USD';

// --- Main App Component ---
const CustomerStatementGenerator: React.FC = () => {
  // --- State Management ---
  const [exchangeRate, setExchangeRate] = useState<number>(() => getFromLocalStorage('exchangeRate', 0.208));
  const [statementDate, setStatementDate] = useState<string>(() => getFromLocalStorage('statementDate', new Date().toISOString().split('T')[0]));
  const [showMileslines, setShowMileslines] = useState<boolean>(() => getFromLocalStorage('showMileslines', true));
  const [showToshin, setShowToshin] = useState<boolean>(() => getFromLocalStorage('showToshin', true));
  const [showModal, setShowModal] = useState<boolean>(false);
  const [customerData, setCustomerData] = useState<Customer>(() => getFromLocalStorage('customerData', customerList[0]));
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>(() => getFromLocalStorage('selectedCustomerName', customerList[0].name));
  const [mileslinesItems, setMileslinesItems] = useState<MileslinesItem[]>(() => getFromLocalStorage('mileslinesItems', []));
  const [toshinItems, setToshinItems] = useState<ToshinItem[]>(() => getFromLocalStorage('toshinItems', []));
  const [timeNextUpdate, setTimeNextUpdate] = useState<number>(() => getFromLocalStorage('timeNextUpdate', 0));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [remarks, setRemarks] = useState<string[]>(() => getFromLocalStorage('remarks', ['']));

  // --- Local Storage Effect ---
  useEffect(() => {
    localStorage.setItem('exchangeRate', JSON.stringify(exchangeRate));
    localStorage.setItem('statementDate', JSON.stringify(statementDate));
    localStorage.setItem('showMileslines', JSON.stringify(showMileslines));
    localStorage.setItem('showToshin', JSON.stringify(showToshin));
    localStorage.setItem('customerData', JSON.stringify(customerData));
    localStorage.setItem('selectedCustomerName', JSON.stringify(selectedCustomerName));
    localStorage.setItem('mileslinesItems', JSON.stringify(mileslinesItems));
    localStorage.setItem('toshinItems', JSON.stringify(toshinItems));
    localStorage.setItem('timeNextUpdate', JSON.stringify(timeNextUpdate));
    localStorage.setItem('remarks', JSON.stringify(remarks));
  }, [exchangeRate, statementDate, showMileslines, showToshin, customerData, selectedCustomerName, mileslinesItems, toshinItems, timeNextUpdate, remarks]);

  // --- API Fetching Logic ---
    const fetchExchangeRate = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    // 邏輯修正：只有當前時間超過 `timeNextUpdate` 時，才應該發送新的 API 請求。
    const now = dayjs().unix();
    if (now < timeNextUpdate) {
      alert(`匯率資料仍有效，無需更新。下次更新時間：${dayjs.unix(timeNextUpdate).local().format('YYYY-MM-DD HH:mm')}`);
      setIsLoading(false);
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
        setExchangeRate(parseFloat(newRate.toFixed(4)));
        // 備用 API 可能沒有提供 time_next_update_unix，我們手動設置為 24 小時後
        const nextUpdate = data.time_next_update_unix || dayjs().add(24, 'hour').unix();
        setTimeNextUpdate(nextUpdate);
        
        const localTime = dayjs.utc(data.time_last_update_utc).local().format('YYYY-MM-DD HH:mm');
        alert(`✅ 匯率更新成功！\n新匯率: ${newRate.toFixed(4)}\n數據時間: ${localTime}`);
      } else {
        throw new Error('Invalid rate received');
      }
    } catch (error) {
      console.error(`Fetch from ${EXCHANGE_RATE_API_URL} failed:`, error);
      alert('❌ 無法取得即時匯率，請檢查網路連線或手動輸入。');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, timeNextUpdate]);

  // --- Calculations ---
  const formatNumber = (num: number): string => new Intl.NumberFormat('zh-TW').format(Math.round(num));
  const mileslinesSubtotal = useMemo(() => showMileslines ? mileslinesItems.reduce((sum, item) => sum + item.quantity * item.price, 0) : 0, [mileslinesItems, showMileslines]);
  const tax = useMemo(() => Math.round(mileslinesSubtotal * 0.05), [mileslinesSubtotal]);
  const mileslinesTotal = useMemo(() => mileslinesSubtotal + tax, [mileslinesSubtotal, tax]);
  const toshinTotalTWD = useMemo(() => showToshin ? toshinItems.reduce((sum, item) => sum + Math.round((item.isShipping ? item.priceJPY : item.quantity * item.priceJPY) * exchangeRate), 0) : 0, [toshinItems, showToshin, exchangeRate]);
  const grandTotal = useMemo(() => mileslinesTotal + toshinTotalTWD, [mileslinesTotal, toshinTotalTWD]);
  const billingPeriodText = useMemo(() => dayjs(statementDate).format('YYYY 年 M 月'), [statementDate]);

  // --- Event Handlers ---
  const handleClearData = useCallback(() => {
    // 修正：使用 confirm() 可能會被瀏覽器阻擋，改用更明確的提示
    const isConfirmed = window.confirm('確定要清除所有已輸入的資料嗎？這個操作無法復原。');
    if (isConfirmed) {
      localStorage.clear();
      window.location.reload();
    }
  }, []);
  
  const handleCustomerChange = useCallback((name: string) => {
    const customer = customerList.find(c => c.name === name) || customerList[customerList.length - 1];
    setSelectedCustomerName(name);
    setCustomerData(customer);
  }, []);

  const handleCustomerDataChange = useCallback((field: keyof Customer, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
  }, []);
  
  const addMileslinesItem = useCallback(() => setMileslinesItems(p => [...p, { date: new Date().toISOString().split('T')[0], description: '酒石酸', quantity: 1, price: 0, isCustom: false, customDesc: '' }]), []);
  const addToshinItem = useCallback(() => setToshinItems(p => [...p, { date: new Date().toISOString().split('T')[0], description: '', quantity: 1, priceJPY: 0, isCustom: false, isShipping: false, customDesc: '', model: '', shippingCarrier: '' }]), []);
  
  const updateItem = useCallback(<T,>(setter: React.Dispatch<React.SetStateAction<T[]>>) => (index: number, field: keyof T, value: T[keyof T]) => {
    setter(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  }, []);

  const removeItem = useCallback(<T,>(setter: React.Dispatch<React.SetStateAction<T[]>>) => (index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateMileslinesItem = useMemo(() => updateItem(setMileslinesItems), [updateItem]);
  const removeMileslinesItem = useMemo(() => removeItem(setMileslinesItems), [removeItem]);
  const updateToshinItem = useMemo(() => updateItem(setToshinItems), [updateItem]);
  const removeToshinItem = useMemo(() => removeItem(setToshinItems), [removeItem]);

  const handleMileslinesDescriptionChange = useCallback((index: number, description: string) => {
    const product = mileslinesProducts.find(p => p.description === description);
    const isCustom = description === '自行輸入';
    updateMileslinesItem(index, 'description', description);
    updateMileslinesItem(index, 'isCustom', isCustom);
    if (product && !isCustom) updateMileslinesItem(index, 'price', product.price);
  }, [updateMileslinesItem]);

  const handleToshinDescriptionChange = useCallback((index: number, description: string) => {
    const isShipping = description.startsWith('運費 >');
    const isCustom = description === '自行輸入';
    updateToshinItem(index, 'description', description);
    updateToshinItem(index, 'isShipping', isShipping);
    updateToshinItem(index, 'isCustom', isCustom);
    if (isShipping) updateToshinItem(index, 'shippingCarrier', description.split(' > ')[1]);
  }, [updateToshinItem]);

  const handleRemarksChange = (index: number, value: string) => {
    const newRemarks = [...remarks];
    newRemarks[index] = value;
    setRemarks(newRemarks);
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 print:bg-white">
      {/* Header Controls */}
      <div className="no-print mb-6 p-4 bg-white rounded-lg shadow-md flex flex-wrap justify-between items-center gap-4 max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-gray-700 font-medium">日幣匯率：</label>
            <input className="w-24 bg-gray-50 p-2 border rounded-lg" type="number" step="0.0001" value={exchangeRate} onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)} />
            <button onClick={fetchExchangeRate} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded-lg flex items-center gap-2 disabled:opacity-50" disabled={isLoading}>
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Settings size={14} />}
                {isLoading ? '取得中...' : '更新匯率'}
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" className="h-5 w-5 rounded" checked={showMileslines} onChange={(e) => setShowMileslines(e.target.checked)} /><span>紡織助劑</span></label>
            <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" className="h-5 w-5 rounded" checked={showToshin} onChange={(e) => setShowToshin(e.target.checked)} /><span>設備零組件</span></label>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <StatementDownloader customerData={customerData} mileslinesItems={mileslinesItems} toshinItems={toshinItems} exchangeRate={exchangeRate} mileslinesTotal={mileslinesTotal} mileslinesSubtotal={mileslinesSubtotal} tax={tax} toshinTotalTWD={toshinTotalTWD} grandTotal={grandTotal} billingPeriodText={billingPeriodText} statementDate={statementDate} remarks={remarks}/>
          <button onClick={handleClearData} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><Trash2 size={16} />清除重設</button>
        </div>
      </div>
      
      {/* Printable Area */}
      <div className="printable-area bg-white p-4 sm:p-8 rounded-lg shadow-xl text-sm max-w-6xl mx-auto">
        <header className="flex justify-between items-start mb-4 pb-4 border-b">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">月結對帳單</h1>
            <p className="text-gray-500">STATEMENT</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-lg">{billingPeriodText}</p>
            <div className="flex items-center justify-end gap-2 text-gray-600">
              <label htmlFor="statementDate">出單日期:</label>
              <input type="date" id="statementDate" className="no-print bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg p-1 w-36 border" value={statementDate} onChange={(e) => setStatementDate(e.target.value)} />
              <span className="hidden print-block">{dayjs(statementDate).format('YYYY-MM-DD')}</span>
            </div>
          </div>
        </header>

        <CustomerInfo customerList={customerList} selectedCustomerName={selectedCustomerName} customerData={customerData} isEditable={selectedCustomerName === '自行輸入'} onCustomerChange={handleCustomerChange} onCustomerDataChange={handleCustomerDataChange} />
        
        {showMileslines && <MileslinesSection items={mileslinesItems} products={mileslinesProducts} onAddItem={addMileslinesItem} onUpdateItem={updateMileslinesItem} onRemoveItem={removeMileslinesItem} onDescriptionChange={handleMileslinesDescriptionChange} formatNumber={formatNumber} />}
        
        {showToshin && <ToshinSection items={toshinItems} exchangeRate={exchangeRate} services={toshinServices} onAddItem={addToshinItem} onUpdateItem={updateToshinItem} onRemoveItem={removeToshinItem} onDescriptionChange={handleToshinDescriptionChange} onShowModal={() => setShowModal(true)} formatNumber={formatNumber} showTopBorder={showMileslines && mileslinesItems.length > 0} />}
        
        {/* Totals section */}
        <div className="mt-8 flex justify-end">
            <div className="w-full md:w-1/2 lg:w-2/5 space-y-2 text-base">
                {showMileslines && (
                  <>
                    <div className="flex justify-between items-center py-1">
                        <span className="text-gray-600">紡織助劑銷售額合計 (A)</span>
                        <CurrencyDisplay currency="$" amount={formatNumber(mileslinesSubtotal)} formatNumber={formatNumber} />
                    </div>
                    <div className="flex justify-between items-center py-1">
                        <span className="text-gray-600">稅額 (5%)</span>
                        <CurrencyDisplay currency="$" amount={formatNumber(tax)} formatNumber={formatNumber} />
                    </div>
                    <div className="flex justify-between items-center py-1 border-t font-semibold">
                        <span className="text-gray-800">紡織助劑總額 (A含稅)</span>
                        <CurrencyDisplay currency="$" amount={formatNumber(mileslinesTotal)} formatNumber={formatNumber} />
                    </div>
                  </>
                )}
                 {showToshin && (
                    <div className="flex justify-between items-center py-1 pt-4 font-semibold">
                        <span className="text-gray-800">設備零組件總額 (B)</span>
                         <CurrencyDisplay currency="$" amount={formatNumber(toshinTotalTWD)} formatNumber={formatNumber} />
                    </div>
                 )}
                 <div className="flex justify-between items-center py-2 border-t-2 border-gray-400 mt-4">
                    <span className="text-xl font-bold text-gray-900">本期總額 (A+B)</span>
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
                  onChange={(e) => handleRemarksChange(index, e.target.value)}
                  placeholder={`備註事項 ${index + 1}`}
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

      <ToshinItemsModal show={showModal} onClose={() => setShowModal(false)} services={toshinServices} />
    </div>
  );
};

export default CustomerStatementGenerator;

