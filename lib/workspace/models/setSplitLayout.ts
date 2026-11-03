import type { Layout } from "../../global/types";
import { copyModel } from "./copyModel";
import { findSplit } from "./findSplit";
import { normalizeModel } from "./normalizeModel";
import type { WorkspaceModel } from "../types";

// Applies a split's layout (e.g. after the user resizes it);
// a resize can also collapse or expand tabsets (when collapsedIds is provided), like collapsible Panels.
// The layout must have a size for each of the split's children (and no others); otherwise it was measured for a different model
// (e.g. one that has since been replaced with setModel), and isn't applied.
export function setSplitLayout<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  splitId: string,
  layout: Layout,
  collapsedIds?: Set<string>
): WorkspaceModel<TabData, TabsetData> {
  const target = findSplit(model.root, splitId);
  if (
    !target ||
    target.children.length !== Object.keys(layout).length ||
    target.children.some(({ id }) => layout[id] === undefined)
  ) {
    return model;
  }

  const next = copyModel(model);
  const split = findSplit(next.root, splitId);
  if (!split) {
    return model;
  }

  let isCollapsedChanged = false;
  for (const child of split.children) {
    const isCollapsed =
      child.type === "tabset" &&
      (collapsedIds ? collapsedIds.has(child.id) : !!child.collapsed);

    if (child.type === "tabset" && isCollapsed !== !!child.collapsed) {
      isCollapsedChanged = true;
      if (isCollapsed) {
        child.collapsed = true;
      } else {
        delete child.collapsed;
      }
    }

    // Collapsed tabsets keep the sizes they expand to
    if (!isCollapsed) {
      child.size = layout[child.id] ?? child.size;
    }
  }

  // Expanded children fill the split (see normalizeModel)
  return isCollapsedChanged ||
    split.children.some((child) => child.type === "tabset" && child.collapsed)
    ? normalizeModel(next)
    : next;
}
