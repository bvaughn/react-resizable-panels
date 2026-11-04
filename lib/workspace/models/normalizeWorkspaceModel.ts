import { isValidModelInput } from "./isValidModelInput";
import { normalizeModel } from "./normalizeModel";
import type {
  TabNode,
  WorkspaceModel,
  WorkspaceModelInput,
  WorkspaceNodeInput
} from "../types";

/**
 * Validates a model (e.g. one saved from `onModelChanged` and loaded from storage) and tidies it,
 * the same way the `defaultModel` prop and the `setModel` method do:
 * - Removes empty tabsets (other than an empty root tabset, and tabsets with the `keepWhenEmpty` flag)
 * - Replaces splits with a single child with that child, and merges splits into parent splits with the same orientation
 * - Scales sizes so they add up to 100 (when all siblings have percentage sizes)
 * - Fixes selections (and recently selected tabs) of tabs that no longer exist
 * - Expands tabsets that can't be collapsed (e.g. the only tabset in the workspace)
 * - Clears the maximized tabset if it no longer exists
 * - Assigns ids to splits and tabsets that don't have them
 *
 * ℹ️ The optional `mapTab` function is called for each tab before the model is tidied,
 * e.g. to refresh a saved tab's title and flags from code; tabs it returns `null` for are removed.
 *
 * @returns The tidied model, or `null` if the value isn't a model (e.g. saved data that's corrupt, or saved by an unsupported version)
 */
export function normalizeWorkspaceModel<
  TabData = unknown,
  TabsetData = unknown
>(
  value: unknown,
  {
    mapTab
  }: {
    mapTab?: ((tab: TabNode<TabData>) => TabNode<TabData> | null) | undefined;
  } = {}
): WorkspaceModel<TabData, TabsetData> | null {
  if (!isValidModelInput<TabData, TabsetData>(value) || value.version !== 1) {
    return null;
  }

  if (!mapTab) {
    return normalizeModel(value);
  }

  const mapNode = (
    node: WorkspaceNodeInput<TabData, TabsetData>
  ): WorkspaceNodeInput<TabData, TabsetData> =>
    node.type === "split"
      ? { ...node, children: node.children.map(mapNode) }
      : {
          ...node,
          tabs: node.tabs.flatMap((tab) => {
            const mapped = mapTab(tab);
            return mapped ? [mapped] : [];
          })
        };

  const mapped: WorkspaceModelInput<TabData, TabsetData> = {
    ...value,
    root: mapNode(value.root)
  };

  return normalizeModel(mapped);
}
