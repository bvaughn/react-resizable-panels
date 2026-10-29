import { getOwnerWindow } from "../../utils/getOwnerWindow";

export function convertVhToPixels(element: Element, value: number) {
  return (value / 100) * getOwnerWindow(element).innerHeight;
}
