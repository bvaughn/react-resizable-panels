import type { TabListOverflowOptions } from "../types";
import type { TabListOverflowState } from "./measureTabListOverflow";

/**
 * The ids of a tab list's tabs that are out of view (see `useTabListOverflow`), from its measured state.
 *
 * ℹ️ The same array is returned until the tabs out of view change (see `measureTabListOverflow`).
 */
export function getHiddenTabIds(
  state: TabListOverflowState | undefined,
  options: TabListOverflowOptions | undefined
): string[] | undefined {
  return options?.includePartiallyVisible
    ? state?.hiddenOrClipped
    : state?.hidden;
}
