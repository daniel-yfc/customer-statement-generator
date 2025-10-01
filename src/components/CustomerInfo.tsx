// src/components/CustomerInfo.tsx
import React from 'react';
import { Customer } from '../types';

interface Props {
  customerList: Customer[];
  selectedCustomerName: string;
  customerData: Customer;
  isEditable: boolean;
  onCustomerChange: (name: string) => void;
  onCustomerDataChange: (field: keyof Customer, value: string) => void;
}

const CustomerInfoField: React.FC<{ label: string; value: string; isEditable: boolean; onChange: (value: string) => void; }> = ({ label, value, isEditable, onChange }) => (
    isEditable ? (
        <input
            type="text"
            className="bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-lg p-1 w-full border"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label={label}
        />
    ) : (
        <>{value}</>
    )
);

const CustomerInfo: React.FC<Props> = ({ customerList, selectedCustomerName, customerData, isEditable, onCustomerChange, onCustomerDataChange }) => {
  return (
    <div className="mt-6 mb-6 ml-4">
      <div className="no-print text-sm py-2">↓ 請從下方選單選擇開單客戶，或選擇「自行輸入」↓</div>
      <select
        className="no-print bg-blue-100 border-cyan-300 text-sky-700 text-base rounded-lg p-2 w-full mb-4 border"
        value={selectedCustomerName}
        onChange={(e) => onCustomerChange(e.target.value)}
        aria-label="選擇客戶"
      >
        {customerList.map((customer) => (
          <option key={customer.name} value={customer.name}>{customer.name}</option>
        ))}
      </select>

      <div className="border rounded-lg p-4 grid grid-cols-[2fr_3fr] gap-x-8 items-start">
        <div className="text-lg font-bold">
          <CustomerInfoField label="客戶名稱" value={customerData.name} isEditable={isEditable} onChange={(val) => onCustomerDataChange('name', val)} />
        </div>
        <div>
          <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-0 items-center text-sm">
            <span className="font-medium text-gray-500 whitespace-nowrap">帳單地址：</span>
            <div className="text-gray-800"><CustomerInfoField label="帳單地址" value={customerData.address} isEditable={isEditable} onChange={(val) => onCustomerDataChange('address', val)} /></div>
            <span className="font-medium text-gray-500 whitespace-nowrap">統一編號：</span>
            <div className="text-gray-800"><CustomerInfoField label="統一編號" value={customerData.taxId} isEditable={isEditable} onChange={(val) => onCustomerDataChange('taxId', val)} /></div>
            <span className="font-medium text-gray-500 whitespace-nowrap">連絡電話：</span>
            <div className="text-gray-800"><CustomerInfoField label="連絡電話" value={customerData.phone} isEditable={isEditable} onChange={(val) => onCustomerDataChange('phone', val)} /></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CustomerInfo);