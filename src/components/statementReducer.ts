import { Customer, MileslinesItem, ToshinItem } from '../types';
import { customerList, mileslinesProducts } from '../data';

// --- STATE SHAPE ---
export interface State {
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

// --- INITIAL STATE ---
export const initialState: State = {
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
  remarks: [''],
};

// --- ACTION TYPES ---
type Action =
  | { type: 'SET_FIELD'; payload: { field: keyof State; value: any } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_EXCHANGE_RATE'; payload: { rate: number; nextUpdate: number } }
  | { type: 'SET_CUSTOMER'; payload: string }
  | { type: 'UPDATE_CUSTOMER_DATA'; payload: { field: keyof Customer; value: string } }
  | { type: 'ADD_MILESLINES_ITEM' }
  | { type: 'UPDATE_MILESLINES_ITEM'; payload: { index: number; field: keyof MileslinesItem; value: any } }
  | { type: 'UPDATE_MILESLINES_DESCRIPTION'; payload: { index: number; description: string } }
  | { type: 'REMOVE_MILESLINES_ITEM'; payload: number }
  | { type: 'ADD_TOSHIN_ITEM' }
  | { type: 'UPDATE_TOSHIN_ITEM'; payload: { index: number; field: keyof ToshinItem; value: any } }
  | { type: 'UPDATE_TOSHIN_DESCRIPTION'; payload: { index: number; description: string } }
  | { type: 'REMOVE_TOSHIN_ITEM'; payload: number }
  | { type: 'UPDATE_REMARK'; payload: { index: number; value: string } }
  | { type: 'CLEAR_DATA' };

// --- REDUCER ---
export function statementReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.payload.field]: action.payload.value };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'UPDATE_EXCHANGE_RATE':
      return { ...state, exchangeRate: action.payload.rate, timeNextUpdate: action.payload.nextUpdate };

    case 'SET_CUSTOMER': {
      const name = action.payload;
      const customer = customerList.find(c => c.name === name) || customerList[customerList.length - 1];
      return { ...state, selectedCustomerName: name, customerData: customer };
    }

    case 'UPDATE_CUSTOMER_DATA':
      return { ...state, customerData: { ...state.customerData, [action.payload.field]: action.payload.value } };

    case 'ADD_MILESLINES_ITEM':
      return { ...state, mileslinesItems: [...state.mileslinesItems, { date: new Date().toISOString().split('T')[0], description: '酒石酸', quantity: 1, price: 0, isCustom: false, customDesc: '' }] };
    
    case 'UPDATE_MILESLINES_ITEM':
      return { ...state, mileslinesItems: state.mileslinesItems.map((item, i) => i === action.payload.index ? { ...item, [action.payload.field]: action.payload.value } : item) };
    
    case 'UPDATE_MILESLINES_DESCRIPTION': {
      const { index, description } = action.payload;
      const product = mileslinesProducts.find(p => p.description === description);
      const isCustom = description === '自行輸入';
      const price = (product && !isCustom) ? product.price : state.mileslinesItems[index].price;
      return { ...state, mileslinesItems: state.mileslinesItems.map((item, i) => i === index ? { ...item, description, isCustom, price } : item) };
    }
      
    case 'REMOVE_MILESLINES_ITEM':
      return { ...state, mileslinesItems: state.mileslinesItems.filter((_, i) => i !== action.payload) };

    case 'ADD_TOSHIN_ITEM':
      return { ...state, toshinItems: [...state.toshinItems, { date: new Date().toISOString().split('T')[0], description: '', quantity: 1, priceJPY: 0, isCustom: false, isShipping: false, customDesc: '', model: '', shippingCarrier: '' }] };

    case 'UPDATE_TOSHIN_ITEM':
      return { ...state, toshinItems: state.toshinItems.map((item, i) => i === action.payload.index ? { ...item, [action.payload.field]: action.payload.value } : item) };

    case 'UPDATE_TOSHIN_DESCRIPTION': {
      const { index, description } = action.payload;
      const isShipping = description.startsWith('運費 >');
      const isCustom = description === '自行輸入';
      const shippingCarrier = isShipping ? description.split(' > ')[1] : '';
      return { ...state, toshinItems: state.toshinItems.map((item, i) => i === index ? { ...item, description, isShipping, isCustom, shippingCarrier } : item) };
    }

    case 'REMOVE_TOSHIN_ITEM':
      return { ...state, toshinItems: state.toshinItems.filter((_, i) => i !== action.payload) };

    case 'UPDATE_REMARK': {
        const newRemarks = [...state.remarks];
        newRemarks[action.payload.index] = action.payload.value;
        // If the last remark is being edited, add a new empty one
        if (action.payload.index === state.remarks.length - 1 && action.payload.value !== '') {
            newRemarks.push('');
        }
        return { ...state, remarks: newRemarks };
    }

    case 'CLEAR_DATA':
        localStorage.removeItem('statementState');
        return initialState;

    default:
      return state;
  }
}
