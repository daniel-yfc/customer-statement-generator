import { useReducer, useEffect, Reducer } from 'react';

// Helper function to get initial state from localStorage
function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      // Merge saved data with default value to ensure all keys are present
      const parsed = JSON.parse(saved);
      return { ...defaultValue, ...parsed };
    }
    return defaultValue;
  } catch {
    return defaultValue;
  }
}

// Custom hook that combines useReducer with localStorage persistence
export function usePersistentReducer<S, A>(
  reducer: Reducer<S, A>,
  initialState: S,
  storageKey: string
): [S, React.Dispatch<A>] {
  
  const [state, dispatch] = useReducer(
    reducer,
    initialState,
    (defaultState) => getFromLocalStorage(storageKey, defaultState)
  );

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      console.error(`Failed to save state to localStorage for key "${storageKey}":`, error);
    }
  }, [state, storageKey]);

  return [state, dispatch];
}
