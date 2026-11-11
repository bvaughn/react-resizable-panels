import type { PointerEvent as ReactPointerEvent } from "react";

/**
 * The pointer that starts a drag, and the element it pressed (e.g. a tab).
 */
export type PointerPress = {
  clientX: number;
  clientY: number;
  // SVG elements can be pressed too (for new tabs), since only their style, document and pointer capture are used
  element: HTMLElement | SVGElement;
  pointerId: number;
  pointerType: string;
};

export function toPointerPress(
  event: ReactPointerEvent<HTMLElement>
): PointerPress {
  return {
    clientX: event.clientX,
    clientY: event.clientY,
    element: event.currentTarget,
    pointerId: event.pointerId,
    pointerType: event.pointerType
  };
}
