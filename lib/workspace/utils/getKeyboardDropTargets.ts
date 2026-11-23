import { getModelIndex } from "../models/getModelIndex";
import { isAtWorkspaceEdge } from "../models/isAtWorkspaceEdge";
import type {
  TabDropTarget,
  WorkspaceDropEdge,
  WorkspaceModel
} from "../types";
import type { TabsetElementRegistry } from "./createTabsetElementRegistry";
import { toModelDropTarget } from "./toModelDropTarget";

const sides: WorkspaceDropEdge[] = ["left", "right", "top", "bottom"];

export function getKeyboardDropTargets(
  model: WorkspaceModel,
  tabId: string,
  tabsetElements: TabsetElementRegistry,
  isRightToLeft: boolean
): TabDropTarget[] {
  const index = getModelIndex(model);
  const source = index.tabsetsByTabId.get(tabId);
  if (!source) return [];

  const centers: TabDropTarget[] = [];
  const regions: TabDropTarget[] = [];
  for (const tabset of index.tabsetsById.values()) {
    if (
      !tabsetElements.get(tabset.id)?.tabset ||
      (model.maximizedTabsetId !== undefined &&
        model.maximizedTabsetId !== tabset.id &&
        !index.floatingTabsetIds.has(tabset.id))
    )
      continue;

    if (tabset !== source) {
      centers.push({ tabsetId: tabset.id, region: "center" });
    }
    if (
      !tabset.collapsed &&
      !index.floatingTabsetIds.has(tabset.id) &&
      (tabset.tabs.length > 0 || tabset.keepWhenEmpty) &&
      (tabset !== source || source.tabs.length > 1 || source.keepWhenEmpty)
    ) {
      for (const region of sides) regions.push({ tabsetId: tabset.id, region });
    }
  }

  if (model.root.type === "split" && model.maximizedTabsetId === undefined) {
    for (const edge of sides) {
      const target = toModelDropTarget({ edge }, isRightToLeft);
      if (
        source.tabs.length > 1 ||
        source.keepWhenEmpty ||
        !("edge" in target) ||
        !isAtWorkspaceEdge(model.root, source, target.edge)
      )
        regions.push({ edge });
    }
  }

  return [...centers, ...regions];
}
