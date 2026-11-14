import { warnOnce } from "../../shared/utils/warnOnce";
import { layoutNumbersEqual } from "../../global/utils/layoutNumbersEqual";
import { isLengthWithUnit } from "../utils/isLengthWithUnit";
import { toPercentage } from "../utils/toPercentage";
import { copyModel } from "./copyModel";
import { findSplit } from "./findSplit";
import { normalizeCopiedModel } from "./normalizeCopiedModel";
import type { WorkspaceModel, WorkspaceNode } from "../types";

/**
 * Sets the sizes of a split's children (see WorkspaceImperativeHandle.resizeSplit), by child id:
 * - Percentages (numbers, or strings without other units) and sizes with units (e.g. "250px") are set as they are (see TabsetNode.size)
 * - Children without sizes share the rest of the split (100, less the percentages given to expanded children) in proportion to their current sizes
 *
 * Collapsed tabsets' sizes are the sizes they expand to, so they don't count towards the rest; expanded children that are all percentages fill the split (see normalizeNode).
 * Invalid sizes (and sizes for splits, or for children that aren't in the split) are ignored, with a warning in development.
 */
export function resizeSplit<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  splitId: string,
  sizes: { [childId: string]: number | string }
): WorkspaceModel<TabData, TabsetData> {
  const target = findSplit(model.root, splitId);
  if (!target) {
    if (process.env.NODE_ENV !== "production") {
      warnOnce(`Split "${splitId}" not found in workspace model`);
    }

    return model;
  }

  if (process.env.NODE_ENV !== "production") {
    for (const childId of Object.keys(sizes)) {
      if (!target.children.some((child) => child.id === childId)) {
        warnOnce(`Split "${splitId}" has no child "${childId}"`);
      }
    }
  }

  const next = copyModel(model);
  const split = findSplit(next.root, splitId)!;

  const isCollapsed = (child: WorkspaceNode) =>
    child.type === "tabset" && !!child.collapsed;

  // Expanded children with percentages that share the rest of the split
  const shared: WorkspaceNode[] = [];
  let given = 0;
  split.children.forEach((child) => {
    const size = Object.prototype.hasOwnProperty.call(sizes, child.id)
      ? sizes[child.id]
      : undefined;
    if (size === undefined) {
      if (!isCollapsed(child) && typeof child.size === "number") {
        shared.push(child);
      }
      return;
    }

    const percentage = toPercentage(size);
    if (percentage !== undefined) {
      child.size = percentage;
      if (!isCollapsed(child)) {
        given += percentage;
      }
    } else if (isLengthWithUnit(size)) {
      child.size = size;
    } else if (process.env.NODE_ENV !== "production") {
      warnOnce(
        `Workspace sizes must be percentages (numbers) or strings with units (px, em, rem, vh, or vw); received ${JSON.stringify(size)}`
      );
    }
  });

  const rest = Math.max(0, 100 - given);
  const total = shared.reduce((sum, { size }) => sum + (size as number), 0);
  // Children that already fill the rest are left alone (rescaling them would only add rounding errors)
  for (const child of layoutNumbersEqual(total, rest) ? [] : shared) {
    child.size =
      total > 0
        ? ((child.size as number) / total) * rest
        : rest / shared.length;
  }

  const normalized = normalizeCopiedModel(next);

  // Nothing changes if every child already had its size
  const normalizedSplit = findSplit(normalized.root, splitId);

  return normalizedSplit &&
    normalizedSplit.children.length === target.children.length &&
    normalizedSplit.children.every((child, index) =>
      sizesEqual(child.size, target.children[index].size)
    )
    ? model
    : normalized;
}

// Numbers are compared as layouts are (so rounding errors aren't changes)
function sizesEqual(
  a: number | string | undefined,
  b: number | string | undefined
) {
  return typeof a === "number" && typeof b === "number"
    ? layoutNumbersEqual(a, b)
    : a === b;
}
