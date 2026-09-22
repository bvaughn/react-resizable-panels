import type { GridAxis } from "../../components/grid/types";

function parsePixels(value: string | undefined | null) {
  const parsed = parseFloat(value ?? "");
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Measures the size (in pixels) of each track along one Grid axis.
 *
 * Browsers resolve `grid-template-columns` (and rows) to pixel values for the computed style,
 * which accounts for gaps, padding, and separator gutters.
 * If the resolved values are not available (e.g. environments that don't implement CSS Grid, like jsdom)
 * the available size is approximated from the element's size and the Grid's layout.
 *
 * ℹ️ When separators are present, the Grid interleaves "gutter" tracks between its content tracks.
 */
export function measureGridAxis({
  axis,
  element,
  gutterSizes,
  hasGutters,
  layout,
  trackIds
}: {
  axis: GridAxis;
  element: HTMLElement;
  gutterSizes: number[];
  hasGutters: boolean;
  layout: { [trackId: string]: number } | undefined;
  trackIds: string[];
}): { availableSize: number; trackSizes: number[] } {
  const trackCount = trackIds.length;
  const cssTrackCount = hasGutters ? trackCount * 2 - 1 : trackCount;

  const style = element.ownerDocument.defaultView?.getComputedStyle(element);

  const template =
    axis === "column" ? style?.gridTemplateColumns : style?.gridTemplateRows;
  if (template) {
    const tokens = template.trim().split(/\s+/);
    if (
      tokens.length === cssTrackCount &&
      tokens.every((token) => /^-?[\d.]+px$/.test(token))
    ) {
      const trackSizes = trackIds.map((_, index) =>
        parsePixels(tokens[hasGutters ? index * 2 : index])
      );

      return {
        availableSize: trackSizes.reduce((total, size) => total + size, 0),
        trackSizes
      };
    }
  }

  const outerSize =
    axis === "column" ? element.offsetWidth : element.offsetHeight;
  const padding =
    axis === "column"
      ? parsePixels(style?.paddingLeft) +
        parsePixels(style?.paddingRight) +
        parsePixels(style?.borderLeftWidth) +
        parsePixels(style?.borderRightWidth)
      : parsePixels(style?.paddingTop) +
        parsePixels(style?.paddingBottom) +
        parsePixels(style?.borderTopWidth) +
        parsePixels(style?.borderBottomWidth);
  const gap = parsePixels(axis === "column" ? style?.columnGap : style?.rowGap);
  const gutters = gutterSizes.reduce((total, size) => total + size, 0);

  const availableSize = Math.max(
    0,
    outerSize - padding - gap * Math.max(0, cssTrackCount - 1) - gutters
  );

  return {
    availableSize,
    trackSizes: trackIds.map((trackId) =>
      layout && layout[trackId] !== undefined
        ? (layout[trackId] / 100) * availableSize
        : availableSize / trackCount
    )
  };
}
