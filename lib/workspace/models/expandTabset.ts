import { copyModel } from "./copyModel";
import { findParent } from "./findParent";
import { findTabset } from "./findTabset";
import { normalizeModel } from "./normalizeModel";
import type { WorkspaceModel } from "../types";

export function expandTabset<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  tabsetId: string
): WorkspaceModel<TabData, TabsetData> {
  if (!findTabset(model, tabsetId)?.collapsed) {
    return model;
  }

  const next = copyModel(model);
  const tabset = findTabset(next, tabsetId);
  if (!tabset) {
    return model;
  }

  delete tabset.collapsed;

  // The expanded siblings fill the split (see normalizeModel), so they shrink to make room for the tabset's size
  // (when the sizes are percentages)
  const size = tabset.size;
  const expandedSiblings =
    findParent(next.root, tabsetId)?.children.filter(
      (child) =>
        child !== tabset && !(child.type === "tabset" && child.collapsed)
    ) ?? [];
  if (
    typeof size === "number" &&
    size < 100 &&
    expandedSiblings.every((child) => typeof child.size === "number")
  ) {
    for (const child of expandedSiblings) {
      child.size = ((child.size as number) * (100 - size)) / 100;
    }
  }

  return normalizeModel(next);
}
