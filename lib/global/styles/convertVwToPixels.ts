export function convertVwToPixels(element: Element, value: number) {
  const ownerWindow = element.ownerDocument.defaultView ?? window;

  return (value / 100) * ownerWindow.innerWidth;
}
