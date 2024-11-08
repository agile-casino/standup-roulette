export function getLocalStorage<T>(key: string, defaultValue: T): T {
  const serialised = localStorage.getItem(key);
  if (serialised) {
    return JSON.parse(serialised) as T;
  }
  return defaultValue;
}

export function setLocalStorage<T>(key: string, value: T | undefined, exclude?: string[]) {
  if (value !== undefined) {
    const filter = (key: string, val: unknown) => (exclude?.includes(key) ? undefined : val);
    const serialised = JSON.stringify(value, filter);
    localStorage.setItem(key, serialised);
  }
  else {
    localStorage.removeItem(key);
  }
}
