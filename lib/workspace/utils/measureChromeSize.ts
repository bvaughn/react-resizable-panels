import { getClientScale } from "../../global/dom/getClientScale";
import type { MinimumSize } from "../types";

/**
 * Size of a tabset's "chrome" (everything other than its TabPanels), in layout pixels.
 *
 * ℹ️ This is measured from exact (fractional) sizes rather than the difference of offset sizes;
 * offset sizes are rounded, so their difference can change by a pixel as the tabset is resized,
 * which would change the tabset's minimum size and re-register its Panel (interrupting a drag that is resizing it).
 */
export function measureChromeSize(
  tabsetElement: HTMLElement,
  panelsElement: HTMLElement
): MinimumSize {
  const tabsetRect = tabsetElement.getBoundingClientRect();
  const panelsRect = panelsElement.getBoundingClientRect();

  // Converted to layout pixels, since minimum sizes are applied in layout pixels,
  // which differ from client pixels when an ancestor has CSS zoom or a scale transform
  // (rounded, so that a scale computed from rounded offset sizes doesn't make the result fluctuate)
  return {
    height: Math.max(
      0,
      Math.round(
        (tabsetRect.height - panelsRect.height) /
          getClientScale(tabsetElement, "vertical")
      )
    ),
    width: Math.max(
      0,
      Math.round(
        (tabsetRect.width - panelsRect.width) /
          getClientScale(tabsetElement, "horizontal")
      )
    )
  };
}
