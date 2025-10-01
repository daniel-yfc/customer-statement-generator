// src/components/CustomerStatementGenerator.tsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Customer, MileslinesItem, ToshinItem } from '../types';
import { customerList, mileslinesProducts, toshinServices } from '../data';
import CustomerInfo from './CustomerInfo';
import MileslinesSection from './MileslinesSection';
import ToshinSection from './ToshinSection';
import ToshinItemsModal from './ToshinItemsModal';
import StatementDownloader from './StatementDownloader';
import { Trash2, Download, Loader2, Settings } from 'lucide-react';
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

const API_KEY = process.env.REACT_APP_EXCHANGE_API_KEY || '';
const PRIMARY_API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/JPY`;
const FALLBACK_API_URL = 'https://open.er-api.com/v6/latest/USD';

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
  }, [exchangeRate, statementDate, showMileslines, showToshin, customerData, selectedCustomerName, mileslinesItems, toshinItems, timeNextUpdate]);

  // --- API Fetching Logic ---
  const fetchExchangeRate = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    const now = dayjs().unix();
    const useFallback = timeNextUpdate > now;

    const performFetch = async (url: string, isFallback: boolean): Promise<void> => {
      try {
        if (!API_KEY && !isFallback) throw new Error('API Key is missing');
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.result !== 'success') throw new Error(data['error-type'] || 'API error');

        let newRate = 0;
        if (isFallback) {
          const { TWD, JPY } = data.rates;
          newRate = (TWD && JPY) ? TWD / JPY : 0;
        } else {
          newRate = data.conversion_rates.TWD || 0;
        }

        if (newRate > 0) {
          setExchangeRate(parseFloat(newRate.toFixed(4)));
          setTimeNextUpdate(data.time_next_update_unix);
          const localTime = dayjs.utc(data.time_last_update_utc).local().format('YYYY-MM-DD HH:mm');
          alert(`✅ 匯率更新成功 (${isFallback ? '備用' : '主要'} API)！\n新匯率: ${newRate.toFixed(4)}\n數據時間: ${localTime}`);
        } else {
          throw new Error('Invalid rate received');
        }
      } catch (error) {
        console.error(`Fetch from ${url} failed:`, error);
        if (!isFallback) await performFetch(FALLBACK_API_URL, true);
        else alert('❌ 無法取得即時匯率，請檢查網路連線或手動輸入。');
      }
    };
    await performFetch(useFallback ? FALLBACK_API_URL : PRIMARY_API_URL, useFallback);
    setIsLoading(false);
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
    if (window.confirm('確定要清除所有已輸入的資料嗎？')) {
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

  // --- Render ---
  return (
    <div className="min-h-screen p-4">
      {/* Header Controls */}
      <div className="no-print mb-6 p-4 bg-white rounded-lg shadow-md flex flex-wrap justify-between items-center gap-4 max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-gray-700 font-medium">日幣匯率：</label>
            <input className="w-24 bg-gray-50 p-2 border rounded-lg" type="number" step="0.0001" value={exchangeRate} onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)} />
            <button onClick={fetchExchangeRate} className="bg-blue-500 text-white font-bold py-2 px-3 rounded-lg flex items-center gap-2 disabled:opacity-50" disabled={isLoading}>
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Settings size={14} />}
                {isLoading ? '取得中...' : '更新匯率'}
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" className="h-5 w-5" checked={showMileslines} onChange={(e) => setShowMileslines(e.target.checked)} /><span>紡織助劑</span></label>
            <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" className="h-5 w-5" checked={showToshin} onChange={(e) => setShowToshin(e.target.checked)} /><span>設備零組件</span></label>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <StatementDownloader customerData={customerData} mileslinesItems={mileslinesItems} toshinItems={toshinItems} exchangeRate={exchangeRate} mileslinesTotal={mileslinesTotal} mileslinesSubtotal={mileslinesSubtotal} tax={tax} toshinTotalTWD={toshinTotalTWD} grandTotal={grandTotal} billingPeriodText={billingPeriodText} statementDate={statementDate} remarks={[]}/>
          <button onClick={handleClearData} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><Trash2 size={16} />清除重設</button>
        </div>
      </div>
      
      {/* Printable Area */}
      <div className="printable-area bg-white p-8 rounded-lg shadow-xl text-sm max-w-6xl mx-auto">
        {/* ... Header, Customer Info, Sections, Totals ... */}
        <CustomerInfo customerList={customerList} selectedCustomerName={selectedCustomerName} customerData={customerData} isEditable={selectedCustomerName === '自行輸入'} onCustomerChange={handleCustomerChange} onCustomerDataChange={handleCustomerDataChange} />
        {showMileslines && <MileslinesSection items={mileslinesItems} products={mileslinesProducts} onAddItem={addMileslinesItem} onUpdateItem={updateMileslinesItem} onRemoveItem={removeMileslinesItem} onDescriptionChange={handleMileslinesDescriptionChange} formatNumber={formatNumber} />}
        {showToshin && <ToshinSection items={toshinItems} exchangeRate={exchangeRate} services={toshinServices} onAddItem={addToshinItem} onUpdateItem={updateToshinItem} onRemoveItem={removeToshinItem} onDescriptionChange={handleToshinDescriptionChange} onShowModal={() => setShowModal(true)} formatNumber={formatNumber} showTopBorder={showMileslines} />}
        {/* ... Totals section ... */}
      </div>

      <ToshinItemsModal show={showModal} onClose={() => setShowModal(false)} services={toshinServices} />
    </div>
  );
};

export default CustomerStatementGenerator;