import { useContext } from "react";
import { ParentPanelContext } from "./ParentPanelContext";
import type { ParentPanel } from "./types";

/**
 * Returns the nearest ancestor Panel (or null if the component is not rendered within a Panel).
 *
 * ℹ️ The returned value includes the Panel's imperative API; it does not change when the Panel is resized.
 */
export function useParentPanel(): ParentPanel | null {
  return useContext(ParentPanelContext);
}
