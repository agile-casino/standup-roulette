export async function waitFor<T>(action: () => T | null, maxWaitMilliseconds = 5000): Promise<T> {
  return await new Promise((resolve, reject) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const result = action();
      if (result) {
        clearInterval(interval);
        resolve(result);
      } else {
        const currentTime = Date.now();
        if (currentTime - startTime > maxWaitMilliseconds) {
          reject(new Error("Timed out."));
        }
      }
    }, 100);
  });
}

export async function waitForElement(parent: HTMLElement, selector: string, maxWaitMilliseconds = 5000): Promise<Element> {
  return await new Promise((resolve, reject) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const element = parent.querySelector(selector);
      if (element) {
        clearInterval(interval);
        resolve(element);
      } else {
        const currentTime = Date.now();
        if (currentTime - startTime > maxWaitMilliseconds) {
          reject(new Error(`Could not find element for selector ${selector} in ${maxWaitMilliseconds} milliseconds.`));
        }
      }
    }, 100);
  });
}
