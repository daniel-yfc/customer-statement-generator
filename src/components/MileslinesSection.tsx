// src/components/MileslinesSection.tsx
import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { MileslinesItem, MileslinesProduct } from '../types';
import { CurrencyDisplay } from './CurrencyDisplay';

type MileslinesItemField = keyof MileslinesItem;
type MileslinesItemValue = MileslinesItem[MileslinesItemField];

interface Props {
  items: MileslinesItem[];
  products: MileslinesProduct[];
  onAddItem: () => void;
  onUpdateItem: (index: number, field: MileslinesItemField, value: MileslinesItemValue) => void;
  onRemoveItem: (index: number) => void;
  onDescriptionChange: (index: number, description: string) => void;
  formatNumber: (num: number) => string;
}

const MileslinesSection: React.FC<Props> = ({ items, products, onAddItem, onUpdateItem, onRemoveItem, onDescriptionChange, formatNumber }) => {
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
            {items.map((item, index) => (
              <tr key={index} className="border-b border-gray-200 text-base hover:bg-gray-50 align-top">
                <td className="py-1 px-2"><input type="date" className="bg-gray-50 border-gray-300 text-gray-900 text-base rounded-lg p-1 w-full border" value={item.date} onChange={(e) => onUpdateItem(index, 'date', e.target.value)} /></td>
                <td className="py-1 px-2">
                  <div className="space-y-1 no-print">
                    <select className="bg-gray-50 border-gray-300 text-gray-900 text-base rounded-lg p-1 w-full border" value={item.description} onChange={(e) => onDescriptionChange(index, e.target.value)}>
                      {products.map((p) => (<option key={p.description} value={p.description}>{p.description}</option>))}
                    </select>
                    {item.isCustom && <input type="text" className="bg-gray-50 border-gray-300 text-gray-900 text-base rounded-lg p-1 w-full border" placeholder="請輸入自訂品項" value={item.customDesc} onChange={(e) => onUpdateItem(index, 'customDesc', e.target.value)} />}
                  </div>
                  <div className="hidden print-block">{item.isCustom ? item.customDesc : item.description}</div>
                </td>
                <td className="py-1 px-2 text-right"><input type="number" min="0" className="bg-gray-50 border-gray-300 text-gray-900 text-base rounded-lg p-1 w-full text-right border" value={item.quantity} onChange={(e) => onUpdateItem(index, 'quantity', Math.max(0, parseInt(e.target.value, 10) || 0))} /></td>
                <td className="py-1 px-2 text-right"><CurrencyDisplay currency="$" isInput={true} value={item.price} onChange={(value) => onUpdateItem(index, 'price', value)} formatNumber={formatNumber} /></td>
                <td className="py-1 px-2 text-right"><CurrencyDisplay currency="$" amount={formatNumber(item.quantity * item.price)} formatNumber={formatNumber}/></td>
                <td className="py-1 px-2 text-center no-print"><button className="text-red-500 hover:text-red-700" onClick={() => onRemoveItem(index)}><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="no-print bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded-lg flex items-center gap-1" onClick={onAddItem}><Plus size={16} /> 新增一行紡織助劑</button>
    </div>
  );
};

export default React.memo(MileslinesSection);