// src/components/CurrencyDisplay.tsx
import React, { useState } from 'react';

interface Props {
  currency: string;
  amount?: string | number;
  isInput?: boolean;
  value?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  formatNumber: (num: number) => string;
}

export const CurrencyDisplay: React.FC<Props> = ({ currency, amount, isInput, value, onChange, className = '', formatNumber }) => {
  const [isEditing, setIsEditing] = useState(false);

  if (isInput) {
    if (isEditing) {
      return (
        <span className={`inline-flex items-center whitespace-nowrap ${className}`}>
          <span className="text-gray-700 mr-1">{currency}</span>
          <input
            type="number"
            className="bg-gray-50 border-gray-300 text-gray-900 text-base rounded-lg p-1 w-full text-right border"
            value={value}
            onChange={onChange}
            onBlur={() => setIsEditing(false)}
            autoFocus
          />
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center whitespace-nowrap cursor-pointer p-1 rounded-lg hover:bg-gray-100 ${className}`}
        onClick={() => setIsEditing(true)}
        onFocus={() => setIsEditing(true)}
        tabIndex={0}
        role="button"
      >
        <span className="text-gray-700 mr-1">{currency}</span>
        <span className="font-medium text-gray-800">{formatNumber(value || 0)}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center whitespace-nowrap ${className}`}>
      <span className="text-gray-700 mr-1">{currency}</span>
      <span className="font-medium text-gray-800">{amount}</span>
    </span>
  );
};