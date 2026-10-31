import { parseSizeAndUnit } from "../../global/styles/parseSizeAndUnit";
import { sizeStyleToPixels } from "../../global/styles/sizeStyleToPixels";
import { warnOnce } from "../../shared/utils/warnOnce";

/**
 * Converts a minimum width or height (e.g. "200px", "12rem") to pixels.
 *
 * ℹ️ Only absolute units are supported; units that require an element (em, rem, vh, vw) are 0 until the element is available.
 */
export function minimumSizeToPixels(
  value: string | undefined,
  element: HTMLElement | null
): number {
  if (value === undefined) {
    return 0;
  } else if (typeof value !== "string") {
    warnOnce(
      `Workspace minimum sizes must be strings with units (e.g. "200px"); received ${value}`
    );
    return 0;
  }

  const [size, unit] = parseSizeAndUnit(value);
  switch (unit) {
    case "%": {
      warnOnce(
        `Workspace minimum sizes must use absolute units (px, em, rem, vh, or vw); received "${value}". Use "vw" or "vh" for sizes relative to the viewport.`
      );
      return 0;
    }
    case "px": {
      return size;
    }
    default: {
      return element
        ? (sizeStyleToPixels({
            axisSize: 0,
            itemElement: element,
            styleProp: value
          }) ?? 0)
        : 0;
    }
  }
}
