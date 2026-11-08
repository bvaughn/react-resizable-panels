import { getAllTabsets } from "./getAllTabsets";
import type { TabsetNode, WorkspaceModel } from "../types";

/**
 * All of a model's tabsets: those in its layout (in tree order), followed by its floating tabsets (in stacking order).
 */
export function getModelTabsets<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>
): TabsetNode<TabData, TabsetData>[] {
  const tabsets = getAllTabsets(model.root);

  return model.floating ? [...tabsets, ...model.floating] : tabsets;
}
