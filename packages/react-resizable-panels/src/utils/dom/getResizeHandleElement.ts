import { RESIZE_HANDLE_ATTRIBUTES } from "../../constants";

export function getResizeHandleElement(
  id: string,
  scope: ParentNode | HTMLElement = document
): HTMLElement | null {
  const element = scope.querySelector(
    `[${RESIZE_HANDLE_ATTRIBUTES.id}="${id}"]`
  );
  if (element) {
    return element as HTMLElement;
  }
  return null;
}
