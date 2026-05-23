export function convertRemToPixels(element: Element, value: number) {
  const style = getComputedStyle(element.ownerDocument.documentElement);
  const fontSize = parseFloat(style.fontSize);

  return value * fontSize;
}
