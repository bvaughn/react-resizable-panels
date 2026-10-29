import { getOwnerWindow } from "../../utils/getOwnerWindow";

export function convertVwToPixels(element: Element, value: number) {
  return (value / 100) * getOwnerWindow(element).innerWidth;
}
