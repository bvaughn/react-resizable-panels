import { warnOnce } from "../../shared/utils/warnOnce";
import { createId } from "../models/createId";
import { hasConflictingIds } from "../models/hasConflictingIds";
import type {
  DragNode,
  TabDropTarget,
  TabNode,
  TabsetNode,
  WorkspaceModel
} from "../types";

export type CopyTab = (
  tab: TabNode,
  target: TabDropTarget
) => TabNode | null | undefined;

export type CopyTabset = (
  tabset: TabsetNode,
  copyTab: (tab: TabNode) => TabNode,
  target: TabDropTarget
) => TabsetNode | null | undefined;

/**
 * The copy of a dragged tab (or tabset) to drop (see the Workspace's `copyTab` and `copyTabset` props), or `undefined` if it shouldn't be copied
 * (the application returned `null`, or a copy that can't be added, e.g. one with ids that are already in use), in which case it's moved instead.
 */
export function createCopiedNode({
  copyTab,
  copyTabset,
  model,
  node,
  target
}: {
  copyTab: CopyTab | undefined;
  copyTabset: CopyTabset | undefined;
  model: WorkspaceModel;
  node: DragNode;
  target: TabDropTarget;
}): DragNode | undefined {
  let copy: DragNode;
  if (node.type === "tab") {
    const tab = copyTab?.(node.tab, target);
    if (!tab) {
      return undefined;
    }
    if (!isTab(tab)) {
      if (process.env.NODE_ENV !== "production") {
        warnOnce("copyTab must return a tab (with an id) or null");
      }
      return undefined;
    }

    copy = { tab, type: "tab" };
  } else {
    const tabset = copyTabset?.(
      node.tabset,
      (tab) => copyTab?.(tab, target) ?? { ...tab, id: createId() },
      target
    );
    if (!tabset) {
      return undefined;
    }
    if (
      tabset.type !== "tabset" ||
      typeof tabset.id !== "string" ||
      !Array.isArray(tabset.tabs) ||
      !tabset.tabs.every(isTab)
    ) {
      if (process.env.NODE_ENV !== "production") {
        warnOnce(
          "copyTabset must return a tabset (with an id and tabs) or null"
        );
      }
      return undefined;
    }

    // The copy's tabs must be distinct from each other too
    const ids = new Set([tabset.id, ...tabset.tabs.map(({ id }) => id)]);
    if (ids.size !== tabset.tabs.length + 1) {
      if (process.env.NODE_ENV !== "production") {
        warnOnce("copyTabset returned a tabset with duplicate ids");
      }
      return undefined;
    }

    copy = {
      tabset: { ...tabset, selectedId: getSelectedId(node.tabset, tabset) },
      type: "tabset"
    };
  }

  if (hasConflictingIds(model, copy, target)) {
    if (process.env.NODE_ENV !== "production") {
      warnOnce(
        node.type === "tab"
          ? "copyTab returned a tab with an id that's already in use"
          : "copyTabset returned a tabset with an id that's already in use"
      );
    }
    return undefined;
  }

  return copy;
}

function isTab(tab: TabNode | null | undefined): tab is TabNode {
  return !!tab && typeof tab === "object" && typeof tab.id === "string";
}

// The copy of the dragged tabset's selected tab (matched by position), unless the copy selects one of its own tabs
function getSelectedId(original: TabsetNode, copy: TabsetNode) {
  if (copy.tabs.some(({ id }) => id === copy.selectedId)) {
    return copy.selectedId;
  }

  const index = original.tabs.findIndex(({ id }) => id === original.selectedId);

  return copy.tabs[index]?.id ?? copy.tabs[0]?.id;
}
