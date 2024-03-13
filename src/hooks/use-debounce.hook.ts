import { useEffect, useState } from "react";

export const useDebounce = <T>(value: T, delay: number, initialValue?: T) => {
  const [state, setState] = useState<T | undefined>(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => setState(value), delay);

    // clear timeout should the value change while already debouncing
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return state;
};
