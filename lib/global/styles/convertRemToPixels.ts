export function convertRemToPixels(element: Element, value: number) {
  const style = getComputedStyle(element.ownerDocument.body);
  const fontSize = parseFloat(style.fontSize);

  return value * fontSize;
}
