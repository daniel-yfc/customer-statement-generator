// src/components/CustomerStatementGenerator.tsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Customer, MileslinesItem, ToshinItem } from '../types';
import { customerList, mileslinesProducts, toshinServices } from '../data';
import CustomerInfo from './CustomerInfo';
import MileslinesSection from './MileslinesSection';
import ToshinSection from './ToshinSection';
import ToshinItemsModal from './ToshinItemsModal';
import { CurrencyDisplay } from './CurrencyDisplay';

const getFromLocalStorage = (key: string, defaultValue: any) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) { console.error(`Failed to parse ${key} from localStorage`, error); return defaultValue; }
};

const CustomerStatementGenerator: React.FC = () => {
  const [exchangeRate, setExchangeRate] = useState<number>(() => getFromLocalStorage('exchangeRate', 0.208));
  const [statementDate, setStatementDate] = useState<string>(() => getFromLocalStorage('statementDate', new Date().toISOString().split('T')[0]));
  const [showMileslines, setShowMileslines] = useState<boolean>(() => getFromLocalStorage('showMileslines', true));
  const [showToshin, setShowToshin] = useState<boolean>(() => getFromLocalStorage('showToshin', true));
  const [showModal, setShowModal] = useState<boolean>(false);
  const [customerData, setCustomerData] = useState<Customer>(() => getFromLocalStorage('customerData', customerList[0]));
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(() => { const savedName = getFromLocalStorage('selectedCustomerName', customerList[0].name); return customerList.find(c => c.name === savedName) || customerList[0]; });
  const [mileslinesItems, setMileslinesItems] = useState<MileslinesItem[]>(() => getFromLocalStorage('mileslinesItems', [ { date: new Date().toISOString().split('T')[0], description: '酒石酸', quantity: 1, price: 0, isCustom: false, customDesc: '' } ]));
  const [toshinItems, setToshinItems] = useState<ToshinItem[]>(() => getFromLocalStorage('toshinItems', [ { date: new Date().toISOString().split('T')[0], description: '運動結構 > 軸承與滑軌', quantity: 50, priceJPY: 3000, isCustom: false, isShipping: false, customDesc: '', model: '剎車片 (Break Piece)', shippingCarrier: 'EMS' }, { date: new Date().toISOString().split('T')[0], description: '運動結構 > 軸承與滑軌', quantity: 4, priceJPY: 8000, isCustom: false, isShipping: false, customDesc: '', model: '刮刀乘載部滑軌 (43-0871)', shippingCarrier: 'EMS' }, { date: new Date().toISOString().split('T')[0], description: '運費', quantity: 1, priceJPY: 3900, isCustom: false, isShipping: true, customDesc: '', model: '', shippingCarrier: 'EMS' } ]));
  useEffect(() => { localStorage.setItem('exchangeRate', JSON.stringify(exchangeRate)); }, [exchangeRate]);
  useEffect(() => { localStorage.setItem('statementDate', JSON.stringify(statementDate)); }, [statementDate]);
  useEffect(() => { localStorage.setItem('showMileslines', JSON.stringify(showMileslines)); }, [showMileslines]);
  useEffect(() => { localStorage.setItem('showToshin', JSON.stringify(showToshin)); }, [showToshin]);
  useEffect(() => { localStorage.setItem('customerData', JSON.stringify(customerData)); }, [customerData]);
  useEffect(() => { localStorage.setItem('selectedCustomerName', JSON.stringify(selectedCustomer.name)); }, [selectedCustomer]);
  useEffect(() => { localStorage.setItem('mileslinesItems', JSON.stringify(mileslinesItems)); }, [mileslinesItems]);
  useEffect(() => { localStorage.setItem('toshinItems', JSON.stringify(toshinItems)); }, [toshinItems]);
  const formatNumber = (num: number): string => new Intl.NumberFormat('zh-TW').format(Math.round(num));
  const mileslinesSubtotal = useMemo(() => showMileslines ? mileslinesItems.reduce((sum, item) => sum + (item.quantity * item.price), 0) : 0, [mileslinesItems, showMileslines]);
  const tax = useMemo(() => Math.round(mileslinesSubtotal * 0.05), [mileslinesSubtotal]);
  const mileslinesTotal = useMemo(() => mileslinesSubtotal + tax, [mileslinesSubtotal, tax]);
  const toshinTotalTWD = useMemo(() => showToshin ? toshinItems.reduce((sum, item) => { const itemPrice = item.isShipping ? (item.priceJPY || 0) : (item.quantity * item.priceJPY); return sum + Math.round(itemPrice * exchangeRate); }, 0) : 0, [toshinItems, showToshin, exchangeRate]);
  const grandTotal = useMemo(() => mileslinesTotal + toshinTotalTWD, [mileslinesTotal, toshinTotalTWD]);
  const billingPeriodText = useMemo(() => { const date = new Date(statementDate + 'T00:00:00'); return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月`; }, [statementDate]);
  useEffect(() => { const originalTitle = document.title; const handleBeforePrint = () => { const customerName = customerData.name || '客戶'; const shortName = customerName.replace(/股份有限公司|有限公司/g, ''); document.title = `${shortName} - ${billingPeriodText} 對帳單`; }; const handleAfterPrint = () => { document.title = originalTitle; }; window.addEventListener('beforeprint', handleBeforePrint); window.addEventListener('afterprint', handleAfterPrint); return () => { window.removeEventListener('beforeprint', handleBeforePrint); window.removeEventListener('afterprint', handleAfterPrint); }; }, [customerData.name, billingPeriodText]);
  const handleCustomerChange = useCallback((customerName: string): void => { const customer = customerList.find((c) => c.name === customerName); if (customer) { setSelectedCustomer(customer); setCustomerData(customer); } }, []);
  const handleCustomerDataChange = useCallback((field: keyof Customer, value: string): void => { setCustomerData((prev) => ({ ...prev, [field]: value })); }, []);
  const addMileslinesItem = useCallback((): void => { setMileslinesItems(prev => [...prev, { date: new Date().toISOString().split('T')[0], description: '酒石酸', quantity: 1, price: 70, isCustom: false, customDesc: '' }]); }, []);
  const updateMileslinesItem = useCallback((index: number, field: keyof MileslinesItem, value: string | number | boolean): void => { setMileslinesItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item)); }, []);
  const removeMileslinesItem = useCallback((index: number): void => { setMileslinesItems(prev => prev.filter((_, i) => i !== index)); }, []);
  const handleMileslinesDescriptionChange = useCallback((index: number, description: string): void => { const product = mileslinesProducts.find((p) => p.description === description); const isCustom = description === '自行輸入'; setMileslinesItems(prev => prev.map((item, i) => { if (i === index) { return { ...item, description, isCustom, price: (product && !isCustom) ? product.price : (isCustom ? 0 : item.price), }; } return item; })); }, []);
  const addToshinItem = useCallback((): void => { setToshinItems(prev => [...prev, { date: new Date().toISOString().split('T')[0], description: '控制元件 > 控制器(PLC)', quantity: 1, priceJPY: 0, isCustom: false, isShipping: false, customDesc: '', model: '', shippingCarrier: 'EMS' }]); }, []);
  const updateToshinItem = useCallback((index: number, field: keyof ToshinItem, value: string | number | boolean): void => { setToshinItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item)); }, []);
  const removeToshinItem = useCallback((index: number): void => { setToshinItems(prev => prev.filter((_, i) => i !== index)); }, []);
  const handleToshinDescriptionChange = useCallback((index: number, description: string): void => { const isShipping = description === '運費'; const isCustom = description === '自行輸入'; setToshinItems(prev => prev.map((item, i) => { if (i === index) { return { ...item, description, isShipping, isCustom, quantity: isShipping ? 1 : item.quantity, priceJPY: isCustom ? 0 : item.priceJPY }; } return item; })); }, []);
  const remarks = useMemo((): string[] => { const baseRemarks = ['※收到對帳單請儘速查對。如對金額、品項或備註內容有所疑義，請聯繫本公司確認。']; if (showToshin) baseRemarks.push('※設備零組件款：請以「陳奕甫」為受款人開立支票。零組件於輸入時已由海關即依《營業稅法》第41條代徵營業稅，貴公司憑稅費收據得扣抵進項稅額。'); if (showMileslines) baseRemarks.push('※紡織助劑款：支票請以「明聯股份有限公司」為受款人開立。'); return baseRemarks; }, [showToshin, showMileslines]);
  const isCustomerEditable = selectedCustomer?.name === '自行輸入';

  return (
    <div className="min-h-screen p-4">
      <div className="no-print mb-6 p-4 bg-white rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 flex-wrap max-w-6xl mx-auto">
        <div className="flex items-center space-x-2"><label className="text-gray-700 font-medium whitespace-nowrap">日幣匯率 (JPY → TWD)：</label><input className="w-28 bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg p-2 border" type="number" step="0.001" min="0" value={exchangeRate} onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)} /></div>
        <div className="flex items-center space-x-4"><label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" className="h-5 w-5 text-blue-600 rounded" checked={showMileslines} onChange={(e) => setShowMileslines(e.target.checked)} /><span className="text-gray-700">本期有紡織助劑</span></label><label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" className="h-5 w-5 text-purple-600 rounded" checked={showToshin} onChange={(e) => setShowToshin(e.target.checked)} /><span className="text-gray-700">本期有設備零組件</span></label></div>
      </div>
      <div className="printable-area bg-white p-6 sm:p-8 rounded-lg shadow-xl text-sm max-w-6xl mx-auto">
        <header className="pb-6 border-b"><div className="flex justify-between items-end"><div className="flex items-center space-x-4"><svg width="50" height="50" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg"><path d="m217.5 156.6c-9.8 9.2-19.4 18.1-29 27-2.2 2-4.1 1.4-6.2-.6-13-12.4-25-26.2-39.4-36.6-16-11.6-34-20.7-53.7-25.3-8.5-2-17.4-2.6-26.1-3.6-6.8-.8-13.7-1.4-20.6-2-4.1-.4-4.2-2.7-2.3-5.4C90 61.4 97.8 61.1 105.5 61c13.3-.2 26 2.9 38.3 7.3 8.6 3.1 17.1 6.1 25.6 9.4 11.8 4.7 22.3 11.6 31.7 20 8.9 7.9 17.4 16.1 23.3 26.8 2.2 4.2 2 7.3-.4 10.9-3.8 5.5-7.6 11-11.7 16.7z" fill="#0A17FF"/><path d="m172.1 198.2c-.2 5.9-3.8 9.4-9.1 9.9-11.7 1-21.6-3.9-31.4-9.2-15.8-8.5-29.5-19.8-41.3-33.3-7.8-9-14.9-18.7-21.9-27.6-2.3 8.5-2.5 8.6 4.6 22.5 3.5 6.8 7.8 13.1 12.2 20.4-8.4 8-17.2 16.2-25.9 24.6-5.5 5.3-10.8 10.8-16.3 16.2-3.6 3.6-8.8 3.6-12-.3-9.5-11.4-17.3-23.8-22.7-37.6-2.6-6.5-4.8-13.8-4.9-20.7-.1-15.3 7-26.8 23.5-32 12.7-4.1 25.6-2.4 38 .3 19.5 4.2 38.8 9.8 56.2 19.9 11.2 6.5 21.7 14.5 32 22.5 5.6 4.5 10.2 10.3 14.9 15.9 1.9 2.2 2.8 5.4 4.1 8.6z" fill="#0A17FF"/><path d="m143.4 60c-12.3 5.4-26.1 4-20.3-2.6 21-45.2 73.6-46 93.4-41.5 19.8 4.5 8.2 2.2 12.3 3.6l-85.4 40.5z" fill="#FF0101"/></svg><div><h1 className="text-2xl font-bold text-gray-800">明聯股份有限公司</h1><p className="text-gray-600 font-semibold">MILES LINES CORPORATION</p><div>106415 臺北市大安區敦化南路二段59號18樓</div><div>統一編號：20779196</div><div>電話：(02)2708-2300　傳真：(02)2709-0777</div><div>電郵：Thickener@mileslines.ml</div></div></div><div className="text-right space-y-1"><h2 className="text-2xl font-bold text-gray-800 tracking-wider">客戶對帳單</h2><p className="text-lg text-gray-500 mt-2">{billingPeriodText}</p><div className="pt-4"><label htmlFor="statementDate" className="font-bold text-gray-800 text-base">對帳單日期：</label><input id="statementDate" type="date" className="text-left bg-gray-50 border-gray-300 text-gray-900 text-base rounded-lg p-1 border" value={statementDate} onChange={(e) => setStatementDate(e.target.value)} /></div></div></div></header>
        <CustomerInfo customerList={customerList} selectedCustomerName={selectedCustomer.name} customerData={customerData} isEditable={isCustomerEditable} onCustomerChange={handleCustomerChange} onCustomerDataChange={handleCustomerDataChange} />
        {showMileslines && <MileslinesSection items={mileslinesItems} products={mileslinesProducts} onAddItem={addMileslinesItem} onUpdateItem={updateMileslinesItem} onRemoveItem={removeMileslinesItem} onDescriptionChange={handleMileslinesDescriptionChange} subtotal={mileslinesSubtotal} tax={tax} total={mileslinesTotal} formatNumber={formatNumber} />}
        {showToshin && <ToshinSection items={toshinItems} exchangeRate={exchangeRate} onAddItem={addToshinItem} onUpdateItem={updateToshinItem} onRemoveItem={removeToshinItem} onDescriptionChange={handleToshinDescriptionChange} onShowModal={() => setShowModal(true)} totalTWD={toshinTotalTWD} formatNumber={formatNumber} showTopBorder={showMileslines} />}
        
        <div className="flex justify-end mt-4">
          <div className="w-full max-w-sm text-base pt-2 border-t-2 border-gray-800">
            <div className="grid grid-cols-2 font-bold">
                <span className="text-gray-800">本期帳款總額</span>
                <div className="text-right text-red-600">
                  <CurrencyDisplay currency="$" amount={formatNumber(grandTotal)} className="!font-bold" formatNumber={formatNumber}/>
                </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-base text-gray-600">
          <h3 className="font-bold text-gray-700 mb-2">備註事項</h3>
          <div className="p-2 border rounded-md min-h-[80px]">{remarks.map((remark, index) => (<p key={index} className="mb-2 text-base last:mb-0" style={{ paddingLeft: remark.includes('設備零組件款') ? '2em' : '0', textIndent: remark.includes('設備零組件款') ? '-2em' : '0' }}>{remark}</p>))}</div>
        </div>
        <div className="mt-16 grid grid-cols-3 gap-8 text-center text-s">
          <div><div className="border-t-2 border-gray-400 pt-2">製表 Prepared by</div></div><div><div className="border-t-2 border-gray-400 pt-2">確認 Confirmed by</div></div><div><div className="border-t-2 border-gray-400 pt-2">核准 Approved by</div></div>
        </div>
      </div>
      <ToshinItemsModal show={showModal} onClose={() => setShowModal(false)} services={toshinServices} />
      <style>{`
        .print-table { table-layout: fixed; width: 100%; }
        .print-break-words { word-break: break-word; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .printable-area { box-shadow: none !important; border: none !important; font-size: 11pt; zoom: 0.85; }
          input, select { border-color: transparent !important; background-color: transparent !important; -webkit-appearance: none; -moz-appearance: none; appearance: none; padding: 1px; }
          input[type="date"]::-webkit-calendar-picker-indicator { display: none; }
          .summary-row { display: flex !important; justify-content: flex-end !important; align-items: center !important; }
          tbody tr:last-child { border-bottom-color: transparent !important; }
          .print-group-middle .date-cell-content,
          .print-group-end .date-cell-content { visibility: hidden; }
          .print-group-start,
          .print-group-middle { border-bottom-color: transparent !important; }
          .print-group-middle > td,
          .print-group-end > td { padding-top: 0px !important; padding-bottom: 0px !important; line-height: 1 !important; }
          input[type=number]::-webkit-inner-spin-button, 
          input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
          input[type=number] { -moz-appearance: textfield; }
        }
        @page { size: A4; margin: 2cm; }
      `}</style>
    </div>
  );
};

export default CustomerStatementGenerator;