import { createContext } from "react";
import type { Orientation } from "../../global/types";

/**
 * State of the tab list being rendered (used by its tabs for keyboard navigation and touch dragging).
 */
export const TabListContext = createContext<{
  // The list's tabs don't all fit, so it can be scrolled
  isOverflowing: boolean;
  orientation: Orientation;
}>({ isOverflowing: false, orientation: "horizontal" });
