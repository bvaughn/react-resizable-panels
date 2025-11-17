export function convertEmToPixels(element: Element, value: number) {
  const style = getComputedStyle(element);
  const fontSize = parseFloat(style.fontSize);

  return value * fontSize;
}
