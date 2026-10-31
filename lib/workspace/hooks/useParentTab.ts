import { useContext } from "react";
import { ParentTabContext } from "../contexts/ParentTabContext";
import type { ParentTab } from "../types";

/**
 * Returns the nearest ancestor tab (or null if the component is not rendered within a tab (see `renderTab`) or the content of a tab).
 *
 * ℹ️ The returned value does not change for the life of the tab, so it is safe to use as an effect dependency.
 * Use `useParentTabState` for values that should trigger a re-render.
 */
export function useParentTab(): ParentTab | null {
  return useContext(ParentTabContext);
}
