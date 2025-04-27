import { DATA_ATTRIBUTES } from "../../constants";

export function getResizeHandleElement(
  id: string,
  scope: ParentNode | HTMLElement = document
): HTMLElement | null {
  const element = scope.querySelector(
    `[${DATA_ATTRIBUTES.resizeHandleId}="${id}"]`
  );
  if (element) {
    return element as HTMLElement;
  }
  return null;
}
