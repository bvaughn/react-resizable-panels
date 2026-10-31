import { getOwnerWindow } from "../../shared/utils/getOwnerWindow";

export function convertEmToPixels(element: Element, value: number) {
  const style = getOwnerWindow(element).getComputedStyle(element);
  const fontSize = parseFloat(style.fontSize);

  return value * fontSize;
}
