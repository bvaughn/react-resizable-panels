import type { Orientation } from "../../global/types";
import type { WorkspaceModel, WorkspaceNode } from "../types";
import { isLengthSize } from "../utils/isLengthSize";
import { copyModel } from "./copyModel";

/**
 * Gives each row (or column) of a workspace that grows along an orientation (see the `growDirection` prop) a length as its size, if it doesn't have one:
 * the root split's children when its orientation matches, or otherwise the root itself (the only row).
 *
 * @param getSize Returns the size for a row without one (e.g. measured from where it was before the change)
 */
export function assignGrowSizes<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  orientation: Orientation,
  getSize: (node: WorkspaceNode<TabData, TabsetData>) => string
): WorkspaceModel<TabData, TabsetData> {
  const { root } = model;
  const isSplit = root.type === "split" && root.orientation === orientation;
  const rows = isSplit ? root.children : [root];
  if (rows.every(({ size }) => isLengthSize(size))) {
    return model;
  }

  const next = copyModel(model);
  const nextRows =
    isSplit && next.root.type === "split" ? next.root.children : [next.root];
  for (const row of nextRows) {
    if (!isLengthSize(row.size)) {
      row.size = getSize(row);
    }
  }

  return next;
}
