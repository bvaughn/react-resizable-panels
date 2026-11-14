import { warnOnce } from "../../shared/utils/warnOnce";
import { isLengthWithUnit } from "../utils/isLengthWithUnit";
import { toPercentage } from "../utils/toPercentage";
import { normalizeCopiedModel } from "./normalizeCopiedModel";
import { findParent } from "./findParent";
import type { TabsetNode, WorkspaceModel } from "../types";

/**
 * Gives a new tabset (in a normalized model that hasn't been shared yet) its requested share of its split.
 * - Percentages (numbers, or strings without other units) are exact, when the split's sizes are all percentages:
 *   a tabset that was split (splitTabsetId) gives up the space, if it has enough, so that its siblings keep their sizes;
 *   otherwise the new tabset's expanded siblings share the rest in proportion to their sizes
 * - Sizes with other units (e.g. "200px") are used as they are (see TabsetNode.size);
 *   the Workspace converts them to percentages first when the split can be measured
 */
export function resizeInsertedTabset<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>,
  tabsetId: string,
  size: number | string | undefined,
  splitTabsetId?: string
): WorkspaceModel<TabData, TabsetData> {
  if (size === undefined) {
    return model;
  }

  const parent = findParent(model.root, tabsetId);
  const inserted = parent?.children.find(({ id }) => id === tabsetId) as
    | TabsetNode<TabData, TabsetData>
    | undefined;
  if (!parent || !inserted) {
    return model;
  }

  const percentage = toPercentage(size);
  if (percentage === undefined) {
    if (isLengthWithUnit(size)) {
      inserted.size = size;
    } else if (process.env.NODE_ENV !== "production") {
      warnOnce(
        `Workspace tabset sizes must be percentages (numbers) or strings with units (px, em, rem, vh, or vw); received ${JSON.stringify(size)}`
      );
    }

    return model;
  }

  // Collapsed tabsets' sizes are the sizes they expand to, so only expanded siblings fill the split (see normalizeNode)
  const siblings = parent.children.filter(
    (child) =>
      child !== inserted && !(child.type === "tabset" && child.collapsed)
  );
  if (
    typeof inserted.size === "number" &&
    siblings.every(({ size }) => typeof size === "number")
  ) {
    // The tabset that was split shared its space with the new tabset (see splitTabset)
    const split = siblings.find(({ id }) => id === splitTabsetId);
    if (split) {
      const shared = (split.size as number) + inserted.size;
      if (shared >= percentage) {
        split.size = shared - percentage;
        inserted.size = percentage;

        return normalizeCopiedModel(model);
      }
    }

    const total = siblings.reduce((sum, { size }) => sum + (size as number), 0);
    if (total > 0) {
      for (const sibling of siblings) {
        sibling.size = ((sibling.size as number) / total) * (100 - percentage);
      }
    }
  }

  inserted.size = percentage;

  return normalizeCopiedModel(model);
}
