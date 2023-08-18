export function getLocalStorage<T>(key: string, defaultValue: T): T {
  const serialised = localStorage.getItem(key);
  if (serialised) {
    return JSON.parse(serialised) as T;
  }
  return defaultValue;
}

export function setLocalStorage<T>(key: string, value: T) {
  const serialised = JSON.stringify(value);
  localStorage.setItem(key, serialised);
}
