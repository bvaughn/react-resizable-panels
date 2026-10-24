import { useContext } from "react";
import { ParentGridContext } from "./ParentGridContext";
import type { ParentGrid } from "./types";

/**
 * Returns the nearest ancestor Grid (or null if the component is not rendered within a Grid).
 *
 * ℹ️ The returned value includes the Grid's imperative API; it does not change when the Grid's layout changes.
 */
export function useParentGrid(): ParentGrid | null {
  return useContext(ParentGridContext);
}
