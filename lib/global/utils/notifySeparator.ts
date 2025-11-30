import type { RegisteredGroup } from "../../components/group/types";
import { calculateAvailableGroupSize } from "../dom/calculateAvailableGroupSize";
import { formatLayoutNumber } from "./formatLayoutNumber";

export function notifySeparator(
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
    asPercentage: formatLayoutNumber(
      (resizeObserverSize.inlineSize / groupSize) * 100
    ),
    inPixels: resizeObserverSize.inlineSize
  });
}
