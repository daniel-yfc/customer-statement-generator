import { Customer, MileslinesItem, ToshinItem } from '../types';
import { customerList } from '../data';
import dayjs from 'dayjs';

// 1. 定義 State 的形狀
export interface StatementState {
  exchangeRate: number;
  statementDate: string;
  showMileslines: boolean;
  showToshin: boolean;
  showModal: boolean;
  customerData: Customer;
  selectedCustomerName: string;
  mileslinesItems: MileslinesItem[];
  toshinItems: ToshinItem[];
  timeNextUpdate: number;
  isLoading: boolean;
  remarks: string[];
}

// 2. 定義 Actions 的類型
type Action =
  | { type: 'SET_FIELD'; payload: { field: keyof StatementState; value: any } }
  | { type: 'SET_CUSTOMER'; payload: string }
  | { type: 'UPDATE_CUSTOMER_DATA'; payload: { field: keyof Customer; value: string } }
  | { type: 'ADD_MILESLINES_ITEM' }
  | { type: 'UPDATE_MILESLINES_ITEM'; payload: { index: number; field: keyof MileslinesItem; value: any } }
  | { type: 'REMOVE_MILESLINES_ITEM'; payload: number }
  | { type: 'ADD_TOSHIN_ITEM' }
  | { type: 'UPDATE_TOSHIN_ITEM'; payload: { index: number; field: keyof ToshinItem; value: any } }
  | { type: 'REMOVE_TOSHIN_ITEM'; payload: number }
  | { type: 'UPDATE_EXCHANGE_RATE'; payload: { rate: number; nextUpdate: number } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_DATA' };

// 3. 初始狀態
export const initialState: StatementState = {
  exchangeRate: 0.208,
  statementDate: new Date().toISOString().split('T')[0],
  showMileslines: true,
  showToshin: true,
  showModal: false,
  customerData: customerList[0],
  selectedCustomerName: customerList[0].name,
  mileslinesItems: [],
  toshinItems: [],
  timeNextUpdate: 0,
  isLoading: false,
  remarks: [],
};

// 4. Reducer 函數
export const statementReducer = (state: StatementState, action: Action): StatementState => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.payload.field]: action.payload.value };

    case 'SET_CUSTOMER': {
      const customerName = action.payload;
      const customer = customerList.find(c => c.name === customerName) || customerList[customerList.length - 1];
      return {
        ...state,
        selectedCustomerName: customerName,
        customerData: customer,
      };
    }

    case 'UPDATE_CUSTOMER_DATA':
      return {
        ...state,
        customerData: {
          ...state.customerData,
          [action.payload.field]: action.payload.value,
        },
      };

    case 'ADD_MILESLINES_ITEM':
      return {
        ...state,
        mileslinesItems: [
          ...state.mileslinesItems,
          { date: new Date().toISOString().split('T')[0], description: '酒石酸', quantity: 1, price: 0, isCustom: false, customDesc: '' }
        ],
      };

    case 'UPDATE_MILESLINES_ITEM':
      return {
        ...state,
        mileslinesItems: state.mileslinesItems.map((item, index) =>
          index === action.payload.index ? { ...item, [action.payload.field]: action.payload.value } : item
        ),
      };

    case 'REMOVE_MILESLINES_ITEM':
      return {
        ...state,
        mileslinesItems: state.mileslinesItems.filter((_, index) => index !== action.payload),
      };

    case 'ADD_TOSHIN_ITEM':
      return {
        ...state,
        toshinItems: [
          ...state.toshinItems,
          { date: new Date().toISOString().split('T')[0], description: '', quantity: 1, priceJPY: 0, isCustom: false, isShipping: false, customDesc: '', model: '', shippingCarrier: '' }
        ],
      };

    case 'UPDATE_TOSHIN_ITEM':
      return {
        ...state,
        toshinItems: state.toshinItems.map((item, index) =>
          index === action.payload.index ? { ...item, [action.payload.field]: action.payload.value } : item
        ),
      };

    case 'REMOVE_TOSHIN_ITEM':
      return {
        ...state,
        toshinItems: state.toshinItems.filter((_, index) => index !== action.payload),
      };

    case 'UPDATE_EXCHANGE_RATE':
      return {
        ...state,
        exchangeRate: action.payload.rate,
        timeNextUpdate: action.payload.nextUpdate,
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'CLEAR_DATA':
      // 清除 localStorage 的操作由 usePersistentReducer Hook 處理
      return { ...initialState };

    default:
      return state;
  }
};

