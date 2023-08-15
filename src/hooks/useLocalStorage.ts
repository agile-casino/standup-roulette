import { Dispatch, SetStateAction, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    const serialised = localStorage.getItem(key);
    if (serialised) {
      const deserialised = JSON.parse(serialised) as T;
      setValue(deserialised);
    }
  }, []);

  useEffect(() => {
    const serialised = JSON.stringify(value);
    localStorage.setItem(key, serialised);
  }, [value]);

  return [value, setValue];
}
