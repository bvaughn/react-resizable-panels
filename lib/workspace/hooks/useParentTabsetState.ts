import { useContext } from "react";
import { ParentTabsetContext } from "../contexts/ParentTabsetContext";
import type { ParentTabsetState } from "../types";
import { getTabsetState } from "../utils/getTabsetState";
import { useWorkspaceStoreSelector } from "./useWorkspaceStoreSelector";

/**
 * Returns the state of the nearest ancestor tabset (or null if the component is not rendered within a tabset or the content of a tab).
 *
 * ℹ️ Components that use this hook only re-render when the tabset's state changes.
 */
export function useParentTabsetState(): ParentTabsetState | null {
  const parentTabset = useContext(ParentTabsetContext);
  const tabsetId = parentTabset?.id;

  return useWorkspaceStoreSelector((state) => {
    const tabset =
      tabsetId !== undefined
        ? state.modelIndex.tabsetsById.get(tabsetId)
        : undefined;

    return tabset ? getTabsetState(state, tabset) : null;
  });
}
