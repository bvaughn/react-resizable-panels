import { findParent } from "./findParent";
import { findTabset } from "./findTabset";
import type { WorkspaceModel } from "../types";

/**
 * Expands a collapsed tabset within a model whose tree has already been copied (see copyModel), changing the copy in place;
 * returns false if the tabset isn't collapsed (or doesn't exist).
 *
 * ℹ️ The model should be normalized afterward (see normalizeCopiedModel).
 */
export function expandCopiedTabset(model: WorkspaceModel, tabsetId: string) {
  const tabset = findTabset(model, tabsetId);
  if (!tabset?.collapsed) {
    return false;
  }

  delete tabset.collapsed;

  // The expanded siblings fill the split (see normalizeModel), so they shrink to make room for the tabset's size
  // (when the sizes are percentages)
  const size = tabset.size;
  const expandedSiblings =
    findParent(model.root, tabsetId)?.children.filter(
      (child) =>
        child !== tabset && !(child.type === "tabset" && child.collapsed)
    ) ?? [];
  if (
    typeof size === "number" &&
    size < 100 &&
    expandedSiblings.every((child) => typeof child.size === "number")
  ) {
    for (const child of expandedSiblings) {
      child.size = ((child.size as number) * (100 - size)) / 100;
    }
  }

  return true;
}
