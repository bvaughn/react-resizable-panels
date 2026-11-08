import type { FloatingTabsetNode, TabsetNode, WorkspaceModel } from "../types";

/**
 * Removes a floating tabset from a model whose tree has already been copied (see copyModel), so that it can be inserted into the layout;
 * returns the tabset without its position and size, or `undefined` if it isn't floating.
 */
export function detachFloatingTabset<TabData, TabsetData>(
  next: WorkspaceModel<TabData, TabsetData>,
  tabset: TabsetNode<TabData, TabsetData>
): TabsetNode<TabData, TabsetData> | undefined {
  const index =
    next.floating?.indexOf(tabset as FloatingTabsetNode<TabData, TabsetData>) ??
    -1;
  if (!next.floating || index < 0) {
    return undefined;
  }

  const [floating] = next.floating.splice(index, 1);
  const { height: _h, width: _w, x: _x, y: _y, ...rest } = floating;

  return rest;
}
