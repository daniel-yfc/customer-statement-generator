import { useReducer, useEffect, Dispatch } from 'react';

// 這個自定義 Hook 結合了 useReducer 和 localStorage
export const usePersistentReducer = <S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S,
  storageKey: string
): [S, Dispatch<A>] => {
  
  // 惰性初始化：只在第一次渲染時從 localStorage 讀取狀態
  const initializer = (): S => {
    try {
      const storedState = localStorage.getItem(storageKey);
      return storedState ? JSON.parse(storedState) : initialState;
    } catch (error) {
      console.error("Failed to parse state from localStorage:", error);
      return initialState;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState, initializer);

  // 使用 useEffect 將狀態的任何變更同步到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save state to localStorage:", error);
    }
  }, [state, storageKey]);
  
  // 特別處理清除 action
  const enhancedDispatch: Dispatch<A> = (action: A) => {
    if ((action as any).type === 'CLEAR_DATA') {
      localStorage.removeItem(storageKey);
      // 直接 dispatch action 來重置 state，而不是重新載入頁面
      dispatch(action);
    } else {
      dispatch(action);
    }
  };

  return [state, enhancedDispatch];
};

