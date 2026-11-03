import type { Layout } from "../../global/types";
import { findSplit } from "./findSplit";
import { getSplitLayoutSignature } from "./getSplitLayoutSignature";
import { setSplitLayout } from "./setSplitLayout";
import type { WorkspaceModel } from "../types";

/**
 * Applies a layout that a split's Group changed itself (see SplitView), if the split hasn't changed since the layout was measured.
 *
 * ℹ️ The layout is applied later than it's measured (see the Workspace's queueLayoutUpdate),
 * and the model may have changed in between (e.g. replaced with setModel, which may have the same children with different sizes);
 * a layout measured for a different version of the split isn't applied, since the new version's layout is applied (and measured) again.
 */
export function setMeasuredSplitLayout<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  splitId: string,
  measuredSignature: string,
  layout: Layout,
  collapsedIds: Set<string>
): WorkspaceModel<TabData, TabsetData> {
  const split = findSplit(model.root, splitId);
  if (!split || getSplitLayoutSignature(split) !== measuredSignature) {
    return model;
  }

  return setSplitLayout(model, splitId, layout, collapsedIds);
}
