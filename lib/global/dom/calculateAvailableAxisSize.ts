import type { RegisteredResizeAxis } from "../types";

export function calculateAvailableAxisSize({
  axis
}: {
  axis: RegisteredResizeAxis;
}) {
  const { layoutStrategy, orientation, items } = axis;

  if (layoutStrategy) {
    return layoutStrategy.calculateAvailableSize();
  }

  return items.reduce((totalSize, item) => {
    totalSize +=
      orientation === "horizontal"
        ? item.element.offsetWidth
        : item.element.offsetHeight;
    return totalSize;
  }, 0);
}
