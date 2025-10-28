// src/state/statementReducer.ts
import { Customer, MileslinesItem, ToshinItem } from '../types';
import { customerList, mileslinesProducts } from '../data';

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
  // [Warning #4] 新增 API 狀態欄位
  apiError: string | null;
  apiSuccess: string | null;
}

// [Warning #3] (Typescript pro)
// 為了實現類型安全的 reducer，我們使用「映射類型 (Mapped Types)」
// 來創建可辨識的聯合類型 (Discriminated Union)

type SetFieldAction = {
  [K in keyof StatementState]: {
    type: 'SET_FIELD';
    payload: { field: K; value: StatementState[K] };
  };
}[keyof StatementState]; // 將映射類型轉換為聯合類型

type UpdateCustomerDataAction = {
  type: 'UPDATE_CUSTOMER_DATA';
  payload: {
    field: keyof Customer;
    value: Customer[keyof Customer]; // 這將被推論為 'string'
  };
};

type UpdateMileslinesItemAction = {
  type: 'UPDATE_MILESLINES_ITEM';
  payload: {
    index: number;
    field: keyof MileslinesItem;
    value: MileslinesItem[keyof MileslinesItem]; // 這將是 'string' | 'number' | 'boolean'
  };
};

type UpdateToshinItemAction = {
  type: 'UPDATE_TOSHIN_ITEM';
  payload: {
    index: number;
    field: keyof ToshinItem;
    value: ToshinItem[keyof ToshinItem]; // 這將是 'string' | 'number' | 'boolean'
  };
};


// 2. 定義 Actions 的類型 (現在完全類型安全)
export type StatementAction =
  | SetFieldAction
  | UpdateCustomerDataAction
  | UpdateMileslinesItemAction
  | UpdateToshinItemAction
  | { type: 'SET_CUSTOMER'; payload: string }
  | { type: 'ADD_MILESLINES_ITEM' }
  | { type: 'REMOVE_MILESLINES_ITEM'; payload: number }
  | { type: 'ADD_TOSHIN_ITEM' }
  | { type: 'REMOVE_TOSHIN_ITEM'; payload: number }
  | { type: 'UPDATE_EXCHANGE_RATE'; payload: { rate: number; nextUpdate: number } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_DATA' }
  // 來自 "Critical" 修復的 Actions
  | { type: 'UPDATE_MILESLINES_DESCRIPTION'; payload: { index: number; description: string } }
  | { type: 'UPDATE_TOSHIN_DESCRIPTION'; payload: { index: number; description: string } }
  // [Warning #4] 新增 API 狀態 Actions
  | { type: 'SET_API_STATUS'; payload: { error?: string | null; success?: string | null } }
  | { type: 'CLEAR_API_STATUS' };


// 3. 初始狀態
export const initialState: StatementState = {
  exchangeRate: 0.208, // 將由 API 更新
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
  // [Warning #4] 初始化 API 狀態
  apiError: null,
  apiSuccess: null,
};

// 4. Reducer 函數
export const statementReducer = (state: StatementState, action: StatementAction): StatementState => {
  switch (action.type) {
    case 'SET_FIELD':
      // [Warning #3] 完全類型安全
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

    // "Critical" 修復的邏輯
    case 'UPDATE_MILESLINES_DESCRIPTION': {
      const { index, description } = action.payload;
      const product = mileslinesProducts.find(p => p.description === description);
      const isCustom = description === '自行輸入';
      const price = (product && !isCustom) ? product.price : state.mileslinesItems[index].price;
      return { ...state, mileslinesItems: state.mileslinesItems.map((item, i) => i === index ? { ...item, description, isCustom, price } : item) };
    }
    
    case 'UPDATE_TOSHIN_DESCRIPTION': {
      const { index, description } = action.payload;
      const isShipping = description.startsWith('運費 >');
      const isCustom = description === '自行輸入';
      const shippingCarrier = isShipping ? description.split(' > ')[1] : '';
      return { ...state, toshinItems: state.toshinItems.map((item, i) => i === index ? { ...item, description, isShipping, isCustom, shippingCarrier } : item) };
    }

    case 'UPDATE_EXCHANGE_RATE':
      return {
        ...state,
        exchangeRate: action.payload.rate,
        timeNextUpdate: action.payload.nextUpdate,
      };

    case 'SET_LOADING':
      // [Warning #4] 開始加載時，清除舊的狀態訊息
      return { 
        ...state, 
        isLoading: action.payload, 
        apiError: null, 
        apiSuccess: null 
      };

    case 'CLEAR_DATA':
      // [修復] 實現註解的意圖：保留當前 state 中的日期
      return { ...initialState, statementDate: state.statementDate }; // 保留日期
      
    // [Warning #4] 新增 Reducer Cases
    case 'SET_API_STATUS':
      return {
        ...state,
        isLoading: false, // 設置狀態時，總是停止加載
        apiError: action.payload.error || null,
        apiSuccess: action.payload.success || null,
      };
    
    case 'CLEAR_API_STATUS':
      return {
        ...state,
        apiError: null,
        apiSuccess: null,
      };

    default:
      return state;
  }
};



