// src/components/ToshinSection.tsx
import React from 'react';
import { Trash2, Plus, Eye } from 'lucide-react';
import { ToshinItem } from '../types';
import { CurrencyDisplay } from './CurrencyDisplay';

interface Props {
  items: ToshinItem[];
  exchangeRate: number;
  onAddItem: () => void;
  onUpdateItem: (index: number, field: keyof ToshinItem, value: any) => void;
  onRemoveItem: (index: number) => void;
  onDescriptionChange: (index: number, description: string) => void;
  onShowModal: () => void;
  totalTWD: number;
  formatNumber: (num: number) => string;
  showTopBorder: boolean;
}

const ToshinSection: React.FC<Props> = ({ items, exchangeRate, onAddItem, onUpdateItem, onRemoveItem, onDescriptionChange, onShowModal, totalTWD, formatNumber, showTopBorder }) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-end mb-3">
        <h3 className="text-lg font-semibold text-gray-800">設備零組件</h3>
        <div className="flex items-center space-x-4">
           <button className="no-print text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 py-1 px-3 rounded-lg flex items-center gap-1" onClick={onShowModal}><Eye size={12} /> 點此查看設備零組件過往品項清單</button>
           <div className="text-sm text-gray-600"><span className="font-medium">結帳匯率：</span> 1 JPY = <span className="font-semibold text-purple-700">{exchangeRate}</span> TWD</div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse mb-4 print-table">
          <thead className="bg-gray-100 border-b-2 border-gray-300">
            <tr>
              <th className="p-2 text-s font-semibold text-gray-700 w-[15%]">日期</th>
              <th className="p-2 text-s font-semibold text-gray-700 w-[31%]">品項 / 說明</th>
              <th className="p-2 text-s font-semibold text-gray-700 text-right w-[10%]">數量</th>
              <th className="p-2 text-s font-semibold text-gray-700 text-right w-[14%]">單價 (JP¥)</th>
              <th className="p-2 text-s font-semibold text-gray-700 text-right w-[14%]">小計 (JP¥)</th>
              <th className="p-2 text-s font-semibold text-gray-700 text-right w-[16%]">小計 (NT$)</th>
              <th className="p-2 w-10 no-print"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const prevDate = index > 0 ? items[index - 1].date : null;
              const nextDate = index < items.length - 1 ? items[index + 1].date : null;
              let printGroupClass = '';
              if (item.date === nextDate && item.date !== prevDate) printGroupClass = 'print-group-start';
              else if (item.date === nextDate && item.date === prevDate) printGroupClass = 'print-group-middle';
              else if (item.date !== nextDate && item.date === prevDate) printGroupClass = 'print-group-end';

              return (
                <tr key={index} className={`border-b border-gray-200 text-base hover:bg-gray-50 ${printGroupClass}`}>
                  <td className="py-1 px-2 align-top"><input type="date" className="date-cell-content bg-gray-50 border-gray-300 text-gray-900 text-base rounded-lg p-1 w-full border" value={item.date} onChange={(e) => onUpdateItem(index, 'date', e.target.value)} /></td>
                  <td className="py-1 px-2 align-top print-break-words">
                    <div className="space-y-1">
                      <select className="bg-gray-50 border-gray-300 text-gray-900 text-base rounded-lg p-1 w-full border" value={item.description} onChange={(e) => onDescriptionChange(index, e.target.value)}>
                        <optgroup label="自動化控制"><option value="控制元件 > 控制器">控制元件 &gt; 控制器(PLC)</option><option value="控制元件 > 伺服馬達">控制元件 &gt; 伺服馬達(Servopack)</option><option value="控制元件 > 人機介面">控制元件 &gt; 人機介面(HMI)</option><option value="控制元件 > 操作開關">控制元件 &gt; 操作開關</option><option value="控制元件 > 電力控制">控制元件 &gt; 電力控制</option><option value="控制元件 > 其他">控制元件 &gt; 其他</option><option value="感測元件 > 感測器">感測元件 &gt; 感測器</option><option value="感測元件 > 其他">感測元件 &gt; 其他</option></optgroup>
                        <optgroup label="機械傳動"><option value="運動結構 > 軸承滑軌">運動結構 &gt; 軸承與滑軌</option><option value="運動結構 > 滾輪皮帶">運動結構 &gt; 滾輪與皮帶</option><option value="運動結構 > 其他">運動結構 &gt; 其他</option><option value="運動輔助 > 氣壓元件">運動輔助 &gt; 氣壓元件</option><option value="運動輔助 > 油壓元件">運動輔助 &gt; 油壓元件</option><option value="運動輔助 > 其他">運動輔助 &gt; 其他</option></optgroup>
                        <optgroup label="耗材"><option value="耗材 > 墨水">耗材 &gt; 墨水</option><option value="耗材 > 網布">耗材 &gt; 網布</option><option value="耗材 > 清潔用品">耗材 &gt; 清潔用品</option><option value="耗材 > 其他">耗材 &gt; 其他</option></optgroup>
                        <option value="運費">運費</option><option value="自行輸入">自行輸入</option>
                      </select>
                      {!item.isShipping && item.model && <input type="text" className="bg-gray-50 border-gray-300 text-gray-900 text-base rounded-lg p-1 w-full border" placeholder="請輸入型號/規格" value={item.model} onChange={(e) => onUpdateItem(index, 'model', e.target.value)} />}
                      {item.isShipping && (<select className="bg-gray-50 border-gray-300 text-gray-900 text-base rounded-lg p-1 w-full border" value={item.shippingCarrier} onChange={(e) => onUpdateItem(index, 'shippingCarrier', e.target.value)}><option value="EMS">EMS</option><option value="OCS">OCS</option><option value="UPS">UPS</option><option value="Fedex">Fedex</option><option value="DHL">DHL</option></select>)}
                      {item.isCustom && <input type="text" className="bg-gray-50 border-gray-300 text-gray-900 text-base rounded-lg p-1 w-full border" placeholder="請輸入自訂品項" value={item.customDesc} onChange={(e) => onUpdateItem(index, 'customDesc', e.target.value)} />}
                    </div>
                  </td>
                  {item.isShipping ? (
                    <>
                      <td className="py-1 px-2 align-top"></td>
                      <td className="py-1 px-2 align-top text-right">
                        <CurrencyDisplay currency="¥" isInput={true} value={item.priceJPY} onChange={(e) => onUpdateItem(index, 'priceJPY', parseFloat(e.target.value) || 0)} formatNumber={formatNumber}/>
                      </td>
                      <td className="py-1 px-2 align-top"></td>
                    </>
                  ) : (
                    <>
                      <td className="py-1 px-2 align-top text-right"><input type="number" className="bg-gray-50 border-gray-300 text-gray-900 text-base rounded-lg p-1 w-full text-right border" value={item.quantity} onChange={(e) => onUpdateItem(index, 'quantity', parseFloat(e.target.value) || 0)} /></td>
                      <td className="py-1 px-2 align-top text-right">
                        <CurrencyDisplay currency="¥" isInput={true} value={item.priceJPY} onChange={(e) => onUpdateItem(index, 'priceJPY', parseFloat(e.target.value) || 0)} formatNumber={formatNumber}/>
                      </td>
                      <td className="py-1 px-2 align-top text-right"><CurrencyDisplay currency="¥" amount={formatNumber(item.quantity * item.priceJPY)} formatNumber={formatNumber} /></td>
                    </>
                  )}
                  <td className="py-1 px-2 align-top text-right"><CurrencyDisplay currency="$" amount={formatNumber((item.isShipping ? item.priceJPY : item.quantity * item.priceJPY) * exchangeRate)} formatNumber={formatNumber}/></td>
                  <td className="py-1 px-2 align-top text-center no-print"><button className="text-red-500 hover:text-red-700 font-bold" onClick={() => onRemoveItem(index)}><Trash2 size={16} /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button className="no-print bg-green-500 hover:bg-green-600 text-white text-base font-bold py-1 px-3 rounded-lg flex items-center gap-1" onClick={onAddItem}><Plus size={16} /> 新增一行設備零組件</button>
      <div className="flex justify-end mt-2">
        <div className={`w-full max-w-sm text-base pt-1 ${showTopBorder ? 'border-t' : ''}`}>
          <div className="grid grid-cols-2 font-semibold">
            <span>設備零組件　合計</span>
            <div className="text-right">
              <CurrencyDisplay currency="$" amount={formatNumber(totalTWD)} formatNumber={formatNumber}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ToshinSection);