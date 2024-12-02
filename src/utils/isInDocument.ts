export function isInDocument(element: Element) {
  let e = element;
  while (e.parentNode) {
    e = e.parentNode as Element;
    if (e === document.body) {
      return true;
    }
  }
}
