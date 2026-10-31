import type { DragPoint } from "../types";

export function positionPreview(element: HTMLElement | null, point: DragPoint) {
  if (element) {
    element.style.transform = `translate(${point.clientX}px, ${point.clientY}px)`;
  }
}
