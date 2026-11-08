import type { RegisteredResizeAxis } from "../types";
import { getClientScale } from "./getClientScale";

/**
 * The space (in layout pixels) that an axis' items share.
 *
 * ℹ️ Items' sizes are measured exactly (with `getBoundingClientRect`), rather than as their `offsetWidth` (or `offsetHeight`), which is rounded:
 * items usually have fractional sizes, so the sum of their rounded sizes can be off by a pixel (and changes as their sizes change),
 * which would look like the axis being resized (e.g. resizing items with `groupResizeBehavior: "preserve-pixel-size"`; see #804).
 *
 * The unit is decided once per axis, from the axis' scale (e.g. an ancestor's CSS `zoom` or scale transform; see getClientScale),
 * so that small items aren't mistaken for unscaled ones (scales that are small enough to be mistaken for rounding are deliberately ignored).
 * Each item's exact size (converted to layout pixels) is only used when it agrees with the offset size (which ignores transforms);
 * otherwise (e.g. rotated or skewed ancestors, where bounding rects don't reflect layout sizes) the (rounded) offset size is used.
 */
export function calculateAvailableAxisSize({
  axis
}: {
  axis: RegisteredResizeAxis;
}) {
  const { element, layoutStrategy, orientation, items } = axis;

  if (layoutStrategy) {
    return layoutStrategy.calculateAvailableSize();
  }

  const scale = getClientScale(element, orientation);

  return items.reduce((totalSize, item) => {
    const rect = item.element.getBoundingClientRect();
    const exactSize =
      (orientation === "horizontal" ? rect.width : rect.height) / scale;
    const offsetSize =
      orientation === "horizontal"
        ? item.element.offsetWidth
        : item.element.offsetHeight;

    totalSize += Math.abs(exactSize - offsetSize) < 1 ? exactSize : offsetSize;

    return totalSize;
  }, 0);
}
