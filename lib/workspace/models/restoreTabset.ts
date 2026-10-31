import type { WorkspaceModel } from "../types";

export function restoreTabset<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>
): WorkspaceModel<TabData, TabsetData> {
  if (model.maximizedTabsetId === undefined) {
    return model;
  }

  const next = { ...model };
  delete next.maximizedTabsetId;

  return next;
}
