// Polyfill localStorage for Node.js 26+ environment compatibility in Vitest
if (typeof globalThis.localStorage === "undefined" || Object.getOwnPropertyDescriptor(globalThis, "localStorage")?.get) {
  const store: Record<string, string> = {};
  const mockLocalStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const key of Object.keys(store)) {
        delete store[key];
      }
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null
  };

  Object.defineProperty(globalThis, "localStorage", {
    value: mockLocalStorage,
    writable: true,
    configurable: true
  });
}
