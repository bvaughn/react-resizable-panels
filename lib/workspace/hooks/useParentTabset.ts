import { useContext } from "react";
import { ParentTabsetContext } from "../contexts/ParentTabsetContext";
import type { ParentTabset } from "../types";

/**
 * Returns the nearest ancestor tabset (or null if the component is not rendered within a tabset or the content of a tab).
 *
 * ℹ️ The returned value does not change for the life of the tabset, so it is safe to use as an effect dependency.
 * Use `useParentTabsetState` for values that should trigger a re-render.
 */
export function useParentTabset<
  TabData = unknown
>(): ParentTabset<TabData> | null {
  return useContext(ParentTabsetContext) as ParentTabset<TabData> | null;
}
