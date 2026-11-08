import { warnOnce } from "../../shared/utils/warnOnce";
import { copyAndAssignFloatingIds } from "./copyAndAssignFloatingIds";
import { copyAndAssignIds } from "./copyAndAssignIds";
import { normalizeCopiedModel } from "./normalizeCopiedModel";
import { warnAboutDuplicateIds } from "./warnAboutDuplicateIds";
import type { WorkspaceModel, WorkspaceModelInput } from "../types";

/**
 * Validates a model from outside of the workspace (e.g. the `defaultModel` prop) and tidies it:
 * - Assigns ids to splits and tabsets that don't have them
 * - Removes empty tabsets (other than an empty root tabset, and tabsets with the `keepWhenEmpty` flag), including floating tabsets
 * - Replaces splits with a single child with that child
 * - Merges splits into parent splits with the same orientation
 * - Scales sizes so they add up to 100 (when all siblings have percentage sizes)
 * - Fixes selections of tabs that no longer exist
 * - Expands tabsets that can't be collapsed (the root tabset, tabsets that aren't collapsible, and the last child of a split whose children are all collapsed)
 * - Forgets recently selected tabs that no longer exist (see updateRecentTabIds)
 * - Clears the maximized tabset if it no longer exists (or is the only tabset, or is floating)
 * - Removes floating tabsets' sizes and collapsed states, and fixes their invalid positions and sizes (see normalizeFloatingTabset)
 *
 * ℹ️ Operations on the workspace's own model copy it themselves, and tidy the copy with normalizeCopiedModel instead.
 */
export function normalizeModel<TabData, TabsetData>(
  model: WorkspaceModelInput<TabData, TabsetData>
): WorkspaceModel<TabData, TabsetData> {
  if (model.version !== 1) {
    if (process.env.NODE_ENV !== "production") {
      warnOnce(`Unsupported workspace model version: ${model.version}`);
    }
  }

  const root = copyAndAssignIds(model.root);
  const next = normalizeCopiedModel({
    floating: Array.isArray(model.floating)
      ? copyAndAssignFloatingIds(model.floating, root)
      : undefined,
    maximizedTabsetId: model.maximizedTabsetId,
    root,
    version: 1
  });

  if (process.env.NODE_ENV !== "production") {
    warnAboutDuplicateIds(next);
  }

  return next;
}
