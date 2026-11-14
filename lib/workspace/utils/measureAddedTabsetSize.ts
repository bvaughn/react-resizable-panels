import { findParent } from "../models/findParent";
import { findTabset } from "../models/findTabset";
import { isFloatingTabset } from "../models/isFloatingTabset";
import { isLengthWithUnit } from "./isLengthWithUnit";
import { sizeToPixels } from "./sizeToPixels";
import { toPercentage } from "./toPercentage";
import type { TabDropTarget, WorkspaceModel } from "../types";

/**
 * Converts the size of a tabset that addTab creates (at an edge region of a tabset, or an edge of the workspace) to a percentage of the split it will be in,
 * when it has other units (e.g. "200px"); the model's other sizes are percentages, which it's shared with exactly (see resizeInsertedTabset).
 *
 * The split is measured as it's currently rendered:
 * - An edge of the workspace adds to (or wraps) the root, which fills the layout
 * - A tabset's edge region adds to its parent split, if the split is in the same direction, or else wraps the tabset in a new split that takes its place
 *
 * ℹ️ Other sizes (and sizes that can't be measured, e.g. before the workspace is mounted) are returned as they are.
 */
export function measureAddedTabsetSize(
  model: WorkspaceModel<unknown, unknown>,
  target: TabDropTarget,
  size: number | string | undefined,
  layoutElement: HTMLElement | null,
  workspaceId: string,
  getTabsetElement: (tabsetId: string) => HTMLElement | null | undefined
): number | string | undefined {
  if (
    size === undefined ||
    toPercentage(size) !== undefined ||
    !isLengthWithUnit(size)
  ) {
    // Invalid sizes are left for the model to warn about (see resizeInsertedTabset)
    return size;
  }

  let side: string;
  let splitElement: HTMLElement | null | undefined;
  if ("edge" in target) {
    side = target.edge;
    splitElement = layoutElement;
  } else if ("index" in target || target.region === "center") {
    return size;
  } else {
    side = target.region;

    const destination = findTabset(model, target.tabsetId);
    if (!destination || isFloatingTabset(model, destination)) {
      return size;
    }

    const orientation =
      side === "left" || side === "right" ? "horizontal" : "vertical";
    const parent = findParent(model.root, destination.id);

    if (model.maximizedTabsetId === destination.id) {
      // A maximized tabset isn't rendered in the layout (only in an overlay), but its Panel and its parent's Group still are
      // Ids are unique within the page (see SplitView), unlike the ids of nested workspaces' splits
      const document = layoutElement?.ownerDocument;
      const group =
        parent && document?.getElementById(`${workspaceId}-${parent.id}`);
      const panel = document?.getElementById(
        `${workspaceId}:${destination.id}`
      );

      splitElement = parent
        ? parent.orientation === orientation
          ? group
          : panel
        : layoutElement;
    } else {
      const tabsetElement = getTabsetElement(destination.id);

      splitElement =
        parent && parent.orientation === orientation
          ? findAncestorSplitElement(tabsetElement, parent.id)
          : tabsetElement;
    }
  }

  if (!splitElement) {
    return size;
  }

  const rect = splitElement.getBoundingClientRect();
  const length = side === "left" || side === "right" ? rect.width : rect.height;
  const pixels = sizeToPixels(size, splitElement);

  return pixels !== undefined && length > 0 ? (pixels / length) * 100 : size;
}

// Splits are rendered as Groups with their ids (see SplitView); ancestors are compared rather than queried,
// since ids aren't escaped for selectors (and workspaces nested within tabs may use the same ids)
function findAncestorSplitElement(
  element: HTMLElement | null | undefined,
  splitId: string
): HTMLElement | undefined {
  for (let current = element?.parentElement; current; ) {
    if (current.getAttribute("data-split-id") === splitId) {
      return current;
    }

    current = current.parentElement;
  }

  return undefined;
}
