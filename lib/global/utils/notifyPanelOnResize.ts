import type { RegisteredGroup } from "../../components/group/types";
import { calculateAvailableGroupSize } from "../dom/calculateAvailableGroupSize";
import { formatLayoutNumber } from "./formatLayoutNumber";

export function notifyPanelOnResize(
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

  const prevSize = panel.mutableValues.prevSize;
  const nextSize = {
    asPercentage: formatLayoutNumber(
      (resizeObserverSize.inlineSize / groupSize) * 100
    ),
    inPixels: resizeObserverSize.inlineSize
  };
  panel.mutableValues.prevSize = nextSize;

  panel.onResize(nextSize, panel.id, prevSize);
}
