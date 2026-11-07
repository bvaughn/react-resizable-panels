import type { WorkspaceModel } from "../types";

// Brings a floating tabset to the front (the end of WorkspaceModel.floating); other models are returned unchanged
export function raiseFloatingTabset<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  tabsetId: string
): WorkspaceModel<TabData, TabsetData> {
  const floating = model.floating;
  const index = floating?.findIndex(({ id }) => id === tabsetId) ?? -1;
  if (!floating || index < 0 || index === floating.length - 1) {
    return model;
  }

  return {
    ...model,
    floating: [
      ...floating.slice(0, index),
      ...floating.slice(index + 1),
      floating[index]
    ]
  };
}
