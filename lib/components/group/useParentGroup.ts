import { useContext } from "react";
import { ParentGroupContext } from "./ParentGroupContext";
import type { ParentGroup } from "./types";

/**
 * Returns the nearest ancestor Group (or null if the component is not rendered within a Group).
 *
 * ℹ️ The returned value includes the Group's imperative API; it does not change when the Group's layout changes.
 */
export function useParentGroup(): ParentGroup | null {
  return useContext(ParentGroupContext);
}
