import type { Layout } from "../../global/types";
import { copyModel } from "./copyModel";
import { findSplit } from "./findSplit";
import type { WorkspaceModel } from "../types";

export function setSplitLayout<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  splitId: string,
  layout: Layout
): WorkspaceModel<TabData, TabsetData> {
  if (!findSplit(model.root, splitId)) {
    return model;
  }

  const next = copyModel(model);
  const split = findSplit(next.root, splitId);
  if (split) {
    for (const child of split.children) {
      child.size = layout[child.id] ?? child.size;
    }
  }

  return next;
}
