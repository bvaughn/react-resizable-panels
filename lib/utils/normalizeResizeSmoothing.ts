import type { GroupProps } from "../components/group/types";

const DEFAULT_RESIZE_SMOOTHING = 0.2;

export function normalizeResizeSmoothing(value: GroupProps["resizeSmoothing"]) {
  if (value === true) {
    return DEFAULT_RESIZE_SMOOTHING;
  }

  if (value === false || value === undefined || value === null || value === 0) {
    return 0;
  }

  if (typeof value !== "number" || Number.isNaN(value)) {
    console.warn(
      `resizeSmoothing must be a number between 0 and 1; received "${value}".`
    );
    return 0;
  }

  const clamped = Math.min(1, Math.max(0, value));
  if (clamped !== value) {
    console.warn(
      `resizeSmoothing must be a number between 0 and 1; received "${value}". Clamping to "${clamped}".`
    );
  }

  return clamped;
}
