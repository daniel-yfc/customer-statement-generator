// src/components/MileslinesSection.tsx
import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { MileslinesItem, MileslinesProduct } from '../types';
import { CurrencyDisplay } from './CurrencyDisplay';

interface Props {
  items: MileslinesItem[];
  products: MileslinesProduct[];
  onAddItem: () => void;
  onUpdateItem: (index: number, field: keyof MileslinesItem, value: any) => void;
  onRemoveItem: (index: number) => void;
  onDescriptionChange: (index: number, description: string) => void;
  subtotal: number;
  tax: number;
  total: number;
  formatNumber: (num: number) => string;
}

const MileslinesSection: React.FC<Props> = ({ items, products, onAddItem, onUpdateItem, onRemoveItem, onDescriptionChange, subtotal, tax, total, formatNumber }) => {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">紡織助劑</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse mb-4 print-table">
          <thead className="bg-gray-100 border-b-2 border-gray-300">
            <tr>
              <th className="p-2 text-s font-semibold text-gray-700 w-[15%]">日期</th>
              <th className="p-2 text-s font-semibold text-gray-700 w-[31%]">品項 / 說明</th>
              <th className="p-2 text-s font-semibold text-gray-700 text-right w-[10%]">數量(KG)</th>
              <th className="p-2 text-s font-semibold text-gray-700 text-right w-[22%]">單價 (NT$)</th>
              <th className="p-2 text-s font-semibold text-gray-700 text-right w-[22%]">小計 (NT$)</th>
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
                        {products.map((p) => (<option key={p.description} value={p.description}>{p.description}</option>))}
                      </select>
                      {item.isCustom && <input type="text" className="bg-gray-50 border-gray-300 text-gray-900 text-base rounded-lg p-1 w-full border" placeholder="請輸入自訂品項" value={item.customDesc} onChange={(e) => onUpdateItem(index, 'customDesc', e.target.value)} />}
                    </div>
                  </td>
                  <td className="py-1 px-2 align-top text-right"><input type="number" className="bg-gray-50 border-gray-300 text-gray-900 text-base rounded-lg p-1 w-full text-right border" value={item.quantity} onChange={(e) => onUpdateItem(index, 'quantity', parseFloat(e.target.value) || 0)} /></td>
                  <td className="py-1 px-2 align-top text-right">
                     <CurrencyDisplay currency="$" isInput={true} value={item.price} onChange={(e) => onUpdateItem(index, 'price', parseFloat(e.target.value) || 0)} formatNumber={formatNumber}/>
                  </td>
                  <td className="py-1 px-2 align-top text-right"><CurrencyDisplay currency="$" amount={formatNumber(item.quantity * item.price)} formatNumber={formatNumber} /></td>
                  <td className="py-1 px-2 align-top text-center no-print"><button className="text-red-500 hover:text-red-700 font-bold" onClick={() => onRemoveItem(index)}><Trash2 size={16} /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button className="no-print bg-green-500 hover:bg-green-600 text-white text-base font-bold py-1 px-3 rounded-lg flex items-center gap-1" onClick={onAddItem}><Plus size={16} /> 新增一行紡織助劑</button>
      <div className="flex justify-end mt-2">
        <div className="grid grid-cols-[auto_auto] gap-x-4 text-base">
            <div className="space-y-1 text-right">
              <div className="text-gray-700">紡織助劑 小計</div>
              <div className="text-gray-700">+ 營業稅(5%)</div>
              <div className="font-semibold pt-1">紡織助劑　合計</div>
            </div>
            <div className="space-y-1">
              <div><CurrencyDisplay currency="$" amount={formatNumber(subtotal)} formatNumber={formatNumber}/></div>
              <div><CurrencyDisplay currency="$" amount={formatNumber(tax)} formatNumber={formatNumber}/></div>
              <div className="font-semibold pt-1"><CurrencyDisplay currency="$" amount={formatNumber(total)} formatNumber={formatNumber}/></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MileslinesSection);