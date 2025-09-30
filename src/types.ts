// src/types.ts
export interface Customer {
  name: string;
  address: string;
  taxId: string;
  phone: string;
}

export interface MileslinesProduct {
  description: string;
  price: number;
}

export interface MileslinesItem {
  date: string;
  description: string;
  quantity: number;
  price: number;
  isCustom: boolean;
  customDesc: string;
}

export interface ToshinService {
  category: string;
  subCategory?: string;
  item?: string;
  examples?: string[];
  description?: string;
  priceJPY?: number;
}

export interface ToshinItem {
  date: string;
  description: string;
  quantity: number;
  priceJPY: number;
  isCustom: boolean;
  isShipping: boolean;
  customDesc: string;
  model: string;
  shippingCarrier: string;
}