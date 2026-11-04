import { parseSizeAndUnit } from "../../global/styles/parseSizeAndUnit";
import { sizeStyleToPixels } from "../../global/styles/sizeStyleToPixels";
import { warnOnce } from "../../shared/utils/warnOnce";

/**
 * Converts a tabset's minimum or maximum width or height (e.g. "200px", "12rem") to pixels,
 * or undefined if there isn't one (or it can't be converted).
 *
 * ℹ️ Only absolute units are supported; units that require an element (em, rem, vh, vw) are undefined until the element is available.
 */
export function sizeToPixels(
  value: string | undefined,
  element: HTMLElement | null
): number | undefined {
  if (value === undefined) {
    return undefined;
  } else if (typeof value !== "string") {
    warnOnce(
      `Workspace tabset sizes (e.g. minWidth or maxWidth) must be strings with units (e.g. "200px"); received ${value}`
    );
    return undefined;
  }

  const [size, unit] = parseSizeAndUnit(value);
  switch (unit) {
    case "%": {
      warnOnce(
        `Workspace tabset sizes (e.g. minWidth or maxWidth) must use absolute units (px, em, rem, vh, or vw); received "${value}". Use "vw" or "vh" for sizes relative to the viewport.`
      );
      return undefined;
    }
    case "px": {
      return size;
    }
    default: {
      return element
        ? sizeStyleToPixels({
            axisSize: 0,
            itemElement: element,
            styleProp: value
          })
        : undefined;
    }
  }
}
