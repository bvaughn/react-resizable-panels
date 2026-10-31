import { createContext } from "react";
import type { Orientation } from "../../global/types";

/**
 * Orientation of the tab list being rendered (used by its tabs for keyboard navigation).
 */
export const TabListContext = createContext<Orientation>("horizontal");
