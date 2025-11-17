import type { RegisteredGroup } from "../../components/group/types";
import { calculateAvailableGroupSize } from "../dom/calculateAvailableGroupSize";

export function notifyResizeHandler(
  group: RegisteredGroup,
  element: HTMLElement,
  borderBoxSize: readonly ResizeObserverSize[]
) {
  const resizeObserverSize = borderBoxSize[0];
  if (!resizeObserverSize) {
    return;
  }

  const panel = group.panels.find((current) => current.element === element);
  if (!panel || !panel.onResize) {
    return;
  }

  const groupSize = calculateAvailableGroupSize({ group });

  panel.onResize({
    asPercentage: resizeObserverSize.inlineSize / groupSize,
    inPixels: resizeObserverSize.inlineSize
  });
}
