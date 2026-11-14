import { findSplit } from "../models/findSplit";
import { isLengthWithUnit } from "./isLengthWithUnit";
import { getSplitAxisSize } from "./getSplitAxisSize";
import { sizeToPixels } from "./sizeToPixels";
import type { WorkspaceModel } from "../types";

/**
 * Converts the sizes that resizeSplit sets that have other units (e.g. "250px") to percentages of the split's current length (its width, or its height if it's vertical).
 * The split is measured as it's currently rendered, by its Group's id (which is unique within the page, see SplitView).
 *
 * ℹ️ Other sizes (and sizes that can't be measured, e.g. before the workspace is mounted, or for a split that doesn't exist) are returned as they are.
 */
export function measureSplitSizes(
  model: WorkspaceModel<unknown, unknown>,
  splitId: string,
  sizes: { [childId: string]: number | string },
  layoutElement: HTMLElement | null,
  workspaceId: string
): { [childId: string]: number | string } {
  const split = findSplit(model.root, splitId);
  const element = layoutElement?.ownerDocument.getElementById(
    `${workspaceId}-${splitId}`
  );
  // Percentages are relative to the space the children share (not the split's element, which includes separators and gaps)
  const length = split && element && getSplitAxisSize(element.id);
  if (!length) {
    return sizes;
  }

  const measured: { [childId: string]: number | string } = {};
  for (const childId of Object.keys(sizes)) {
    const size = sizes[childId];
    const pixels = isLengthWithUnit(size)
      ? sizeToPixels(size, element)
      : undefined;
    measured[childId] = pixels !== undefined ? (pixels / length) * 100 : size;
  }

  return measured;
}
