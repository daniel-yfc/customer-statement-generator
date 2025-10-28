// src/components/CurrencyDisplay.tsx
import React, { useState } from 'react';

interface Props {
  currency: number;
  amount?: number;
  isInput?: boolean;
  value?: number;
  onChange?: (value: number) => void;
  className?: string;
  formatNumber: (num: number) => string;
}

export const CurrencyDisplay: React.FC<Props> = React.memo(({ currency, amount, isInput, value = 0, onChange, className = '', formatNumber }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10) || 0;
    if (onChange) {
      onChange(Math.max(0, newValue));
    }
  };

  if (isInput) {
    if (isEditing) {
      return (
        <div className={`grid grid-cols-[min-content_1fr] gap-x-1 items-baseline text-right w-full ${className}`}>
          <span className="text-gray-700">{currency}</span>
          <input
            type="number"
            min="0"
            step="1"
            className="bg-gray-50 border-gray-300 text-gray-900 text-base rounded-lg p-1 w-full text-right border"
            value={value}
            onChange={handleInputChange}
            onBlur={() => setIsEditing(false)}
            autoFocus
          />
        </div>
      );
    }
    return (
      <div
        className={`grid grid-cols-[min-content_1fr] gap-x-1 items-baseline text-right w-full cursor-pointer p-1 rounded-lg hover:bg-gray-100 ${className}`}
        onClick={() => setIsEditing(true)}
      >
        <span className="text-gray-700">{currency}</span>
        <span className="font-medium text-gray-800">{formatNumber(value)}</span>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-[min-content_1fr] gap-x-1 items-baseline text-right w-full ${className}`}>
      <span className="text-gray-700">{currency}</span>
      {/* [修復] 使用 formatNumber 函數來格式化 number 類型的 amount */}
      <span className="font-medium text-gray-800">{formatNumber(amount ?? 0)}</span>
    </div>
  );

});

