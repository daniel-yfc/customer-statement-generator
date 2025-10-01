// src/components/ToshinSection.tsx
import React from 'react';
import { Trash2, Plus, BookOpen } from 'lucide-react';
import { ToshinItem, ToshinService } from '../types';
import { CurrencyDisplay } from './CurrencyDisplay';

type ToshinItemField = keyof ToshinItem;
type ToshinItemValue = ToshinItem[ToshinItemField];

interface Props {
  items: ToshinItem[];
  exchangeRate: number;
  services: ToshinService[];
  onAddItem: () => void;
  onUpdateItem: (index: number, field: ToshinItemField, value: ToshinItemValue) => void;
  onRemoveItem: (index: number) => void;
  onDescriptionChange: (index: number, description: string) => void;
  onShowModal: () => void;
  formatNumber: (num: number) => string;
  showTopBorder?: boolean;
}

const ToshinSection: React.FC<Props> = ({ items, exchangeRate, services, onAddItem, onUpdateItem, onRemoveItem, onDescriptionChange, onShowModal, formatNumber, showTopBorder }) => {
  const productOptions = React.useMemo(() => {
    const categories: Record<string, string[]> = {};
    services.forEach(s => {
      if (!s.category) return;
      if (!categories[s.category]) categories[s.category] = [];
      const description = (s.category === '特殊項目') ? (s.description || '') : `${s.subCategory} > ${s.item}`;
      if (description && !categories[s.category].includes(description)) {
        categories[s.category].push(description);
      }
    });
    return Object.entries(categories).map(([category, descriptions]) => (
      <optgroup label={category} key={category}>
        {descriptions.map(desc => <option key={desc} value={desc}>{desc}</option>)}
      </optgroup>
    ));
  }, [services]);

  return (
    <div className={`pt-4 mt-4 ${showTopBorder ? 'border-t-2 border-gray-200' : ''}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800">設備零組件</h3>
        <button onClick={onShowModal} className="no-print bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm font-bold py-1 px-3 rounded-lg flex items-center gap-1">
          <BookOpen size={14}/> 查看品項參考
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse mb-4 print-table">
          <thead className="bg-gray-100 border-b-2 border-gray-300">
            <tr>
              <th className="p-2 text-s font-semibold text-gray-700 w-[15%]">日期</th>
              <th className="p-2 text-s font-semibold text-gray-700 w-[31%]">品項 / 說明</th>
              <th className="p-2 text-s font-semibold text-gray-700 text-right w-[10%]">數量(PCS)</th>
              <th className="p-2 text-s font-semibold text-gray-700 text-right w-[22%]">單價 (JPY)</th>
              <th className="p-2 text-s font-semibold text-gray-700 text-right w-[22%]">小計 (TWD)</th>
              <th className="p-2 w-10 no-print"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const subtotalTWD = item.isShipping ? (item.priceJPY * exchangeRate) : (item.quantity * item.priceJPY * exchangeRate);
              return (
                <tr key={index} className="border-b border-gray-200 text-base hover:bg-gray-50 align-top">
                  <td className="py-1 px-2"><input type="date" className="bg-gray-50 border-gray-300 text-gray-900 text-base rounded-lg p-1 w-full border" value={item.date} onChange={(e) => onUpdateItem(index, 'date', e.target.value)} /></td>
                  <td className="py-1 px-2">
                    <div className="space-y-1 no-print">
                      <select className="bg-gray-50 border-gray-300 text-gray-900 text-base rounded-lg p-1 w-full border" value={item.description} onChange={(e) => onDescriptionChange(index, e.target.value)}>{productOptions}</select>
                      {item.isCustom && <input type="text" className="bg-gray-50 border-gray-300 text-gray-900 text-base rounded-lg p-1 w-full border" placeholder="請輸入自訂品項" value={item.customDesc} onChange={(e) => onUpdateItem(index, 'customDesc', e.target.value)} />}
                      {!item.isShipping && !item.isCustom && <input type="text" className="bg-gray-50 border-gray-300 text-gray-900 text-base rounded-lg p-1 w-full border" placeholder="型號/規格" value={item.model} onChange={(e) => onUpdateItem(index, 'model', e.target.value)} />}
                    </div>
                    <div className="hidden print-block">
                        <p>{item.isCustom ? item.customDesc : item.description}</p>
                        {item.model && <p className="text-xs text-gray-600">({item.model})</p>}
                    </div>
                  </td>
                  <td className="py-1 px-2 text-right">{!item.isShipping && <input type="number" min="0" className="bg-gray-50 border-gray-300 text-gray-900 text-base rounded-lg p-1 w-full text-right border" value={item.quantity} onChange={(e) => onUpdateItem(index, 'quantity', Math.max(0, parseInt(e.target.value, 10) || 0))} />}</td>
                  <td className="py-1 px-2 text-right"><CurrencyDisplay currency="¥" isInput={true} value={item.priceJPY} onChange={(value) => onUpdateItem(index, 'priceJPY', value)} formatNumber={formatNumber} /></td>
                  <td className="py-1 px-2 text-right">
    <CurrencyDisplay 
        currency="$" 
        amount={formatNumber(subtotalTWD)} 
        formatNumber={formatNumber} 
    />
</td>
                  <td className="py-1 px-2 text-center no-print"><button className="text-red-500 hover:text-red-700" onClick={() => onRemoveItem(index)}><Trash2 size={16} /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button className="no-print bg-purple-500 hover:bg-purple-600 text-white font-bold py-1 px-3 rounded-lg flex items-center gap-1" onClick={onAddItem}><Plus size={16} /> 新增一行設備零組件</button>
    </div>
  );
};

export default React.memo(ToshinSection);