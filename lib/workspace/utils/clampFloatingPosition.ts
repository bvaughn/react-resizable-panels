export type FloatingHeaderBox = {
  height: number;
  // Relative to the floating tabset
  left: number;
  top: number;
  width: number;
};

/**
 * The position at which a floating tabset is shown, so that its header is within the layout (so it can always be dragged back);
 * the rest of it may be outside of the layout (e.g. moved mostly out of the way, below the bottom of the workspace).
 *
 * ℹ️ Positions aren't changed while the layout hasn't been measured (e.g. while server rendering).
 * If the header is larger than the layout, its start (e.g. its first tab) is kept within the layout.
 */
export function clampFloatingPosition(
  position: { x: number; y: number },
  header: FloatingHeaderBox,
  layout: { height: number; width: number }
): { x: number; y: number } {
  if (layout.width <= 0 || layout.height <= 0) {
    return position;
  }

  return {
    x: clampAxis(position.x, header.left, header.width, layout.width),
    y: clampAxis(position.y, header.top, header.height, layout.height)
  };
}

// The header spans [start + offset, start + offset + length], which stays within [0, size]
function clampAxis(
  start: number,
  offset: number,
  length: number,
  size: number
) {
  // (0 - offset, rather than -offset, so that a header at the tabset's edge gives 0 rather than -0)
  return Math.max(0 - offset, Math.min(start, size - length - offset));
}
