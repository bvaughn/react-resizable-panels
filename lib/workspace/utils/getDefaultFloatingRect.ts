import { getClientScale } from "../../global/dom/getClientScale";
import {
  DEFAULT_FLOATING_TABSET_HEIGHT,
  DEFAULT_FLOATING_TABSET_WIDTH
} from "../models/normalizeFloatingTabset";
import type { FloatingTabsetRect } from "../types";

// A new floating tabset is offset from where its tabset was, so that it's clearly floating
export const FLOATING_TABSET_OFFSET = 24;

/**
 * Where a tab (or tabset) floated with the imperative API is shown, if its position and size aren't specified:
 * the size and position of its tabset (in the layout's pixels; a collapsed tabset's size isn't used), offset slightly down and to the right, and moved to fit within the layout (if it fits).
 * Parts of the rect that are specified are used as they are.
 *
 * ℹ️ Without elements to measure (e.g. before the workspace has rendered), a default size is used, offset from the layout's top left corner.
 */
export function getDefaultFloatingRect(
  layoutElement: HTMLElement | null,
  tabsetElement: HTMLElement | null | undefined,
  rect: Partial<FloatingTabsetRect> = {}
): FloatingTabsetRect {
  let defaults: FloatingTabsetRect = {
    height: DEFAULT_FLOATING_TABSET_HEIGHT,
    width: DEFAULT_FLOATING_TABSET_WIDTH,
    x: FLOATING_TABSET_OFFSET,
    y: FLOATING_TABSET_OFFSET
  };

  if (layoutElement) {
    const layoutWidth = layoutElement.offsetWidth;
    const layoutHeight = layoutElement.offsetHeight;

    if (tabsetElement) {
      const scaleX = getClientScale(layoutElement, "horizontal");
      const scaleY = getClientScale(layoutElement, "vertical");
      const layoutRect = layoutElement.getBoundingClientRect();
      const tabsetRect = tabsetElement.getBoundingClientRect();
      if (tabsetRect.width > 0 && tabsetRect.height > 0) {
        // A collapsed tabset is only as large as its header, which is far too small to float (below its minimum size),
        // so only its position is used
        const isCollapsed = tabsetElement.hasAttribute("data-tabset-collapsed");
        defaults = {
          height: isCollapsed ? defaults.height : tabsetRect.height / scaleY,
          width: isCollapsed ? defaults.width : tabsetRect.width / scaleX,
          x:
            (tabsetRect.left - layoutRect.left) / scaleX +
            FLOATING_TABSET_OFFSET,
          y: (tabsetRect.top - layoutRect.top) / scaleY + FLOATING_TABSET_OFFSET
        };
      }
    }

    // The size is used to fit the position (even if it's specified), but isn't changed
    const width =
      rect.width ?? Math.min(defaults.width, layoutWidth || defaults.width);
    const height =
      rect.height ?? Math.min(defaults.height, layoutHeight || defaults.height);
    if (layoutWidth > 0 && layoutHeight > 0) {
      defaults = {
        height,
        width,
        x: Math.max(0, Math.min(defaults.x, layoutWidth - width)),
        y: Math.max(0, Math.min(defaults.y, layoutHeight - height))
      };
    }
  }

  return { ...defaults, ...definedFields(rect) };
}

// Fields explicitly set to undefined use their defaults
function definedFields(rect: Partial<FloatingTabsetRect>) {
  const fields: Partial<FloatingTabsetRect> = {};
  for (const key of ["height", "width", "x", "y"] as const) {
    if (typeof rect[key] === "number") {
      fields[key] = rect[key];
    }
  }

  return fields;
}
