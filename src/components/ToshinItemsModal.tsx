// src/components/ToshinItemsModal.tsx
import React from 'react';
import { X } from 'lucide-react';
import { ToshinService } from '../types';

interface Props {
  show: boolean;
  onClose: () => void;
  services: ToshinService[];
}

const ToshinItemsModal: React.FC<Props> = ({ show, onClose, services }) => {
  if (!show) return null;

  const grouped = services.reduce<Record<string, Record<string, ToshinService[]>>>((acc, item) => {
    if (item.category === '特殊項目' || !item.subCategory) return acc;
    if (!acc[item.category]) acc[item.category] = {};
    if (!acc[item.category][item.subCategory]) acc[item.category][item.subCategory] = [];
    acc[item.category][item.subCategory].push(item);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 no-print">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">東伸零組件品項參考</h2>
          <button className="text-gray-500 hover:text-gray-800 text-2xl" onClick={onClose}><X size={24} /></button>
        </div>
        <div className="p-6">
          {Object.entries(grouped).map(([category, subCategories]) => (
            <div key={category} className="mb-4">
              <h3 className="text-lg font-bold text-purple-700 mb-2">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                {Object.entries(subCategories).map(([subCategory, items]) => (
                  <div key={subCategory}>
                    <h4 className="font-semibold text-gray-800">{subCategory}</h4>
                    <ul className="list-disc list-inside text-gray-600 text-xs">
                      {items.map((item, index) => (
                        <li key={index}>{item.item}{item.examples && item.examples.length > 0 && ` (${item.examples.join(', ')})`}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ToshinItemsModal);