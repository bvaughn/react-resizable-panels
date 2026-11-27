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

  const measuredSize = items.reduce((totalSize, item) => {
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

  // Flex-grow values are fractions of the group, so items whose values add up to less than 1 only fill that fraction of it.
  // That's the case when an item has been removed but the others haven't been resized yet (e.g. while a CSS transition on flex-grow runs),
  // so scale the measured size up to the whole group (computed values include the current state of any transition).
  const fillFraction = getFlexGrowSum(items);
  if (measuredSize > 0 && fillFraction > 0 && fillFraction < 1) {
    return measuredSize / fillFraction;
  }

  return measuredSize;
}

function getFlexGrowSum(items: RegisteredResizeAxis["items"]) {
  let sum = 0;
  for (const item of items) {
    const view = item.element.ownerDocument.defaultView;
    const style = view?.getComputedStyle(item.element);
    const flexGrow = parseFloat(style?.flexGrow ?? "");
    // Only items with no flex-basis are sized purely by flex-grow
    // (e.g. not panels that are sized by their default sizes before their group has registered)
    const flexBasis = parseFloat(style?.flexBasis ?? "");
    if (!Number.isFinite(flexGrow) || flexBasis !== 0) {
      return 0;
    }
    sum += flexGrow;
  }
  return sum;
}
