export function convertVhToPixels(element: Element, value: number) {
  const ownerWindow = element.ownerDocument.defaultView ?? window;

  return (value / 100) * ownerWindow.innerHeight;
}
