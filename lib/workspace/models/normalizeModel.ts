import { isDevelopment } from "../../shared/utils/isDevelopment";
import { warnOnce } from "../../shared/utils/warnOnce";
import { copyAndAssignIds } from "./copyAndAssignIds";
import { getAllTabsets } from "./getAllTabsets";
import { normalizeNode } from "./normalizeNode";
import { warnAboutDuplicateIds } from "./warnAboutDuplicateIds";
import type { TabsetNode, WorkspaceModel, WorkspaceModelInput } from "../types";

/**
 * Validates a model and tidies it:
 * - Removes empty tabsets (other than an empty root tabset, and tabsets with the `keepWhenEmpty` flag)
 * - Replaces splits with a single child with that child
 * - Merges splits into parent splits with the same orientation
 * - Scales sizes so they add up to 100 (when all siblings have percentage sizes)
 * - Fixes selections of tabs that no longer exist
 * - Clears the maximized tabset if it no longer exists (or is the only tabset)
 */
export function normalizeModel<TabData, TabsetData>(
  model: WorkspaceModelInput<TabData, TabsetData>
): WorkspaceModel<TabData, TabsetData> {
  if (model.version !== 1) {
    warnOnce(`Unsupported workspace model version: ${model.version}`);
  }

  const copiedRoot = copyAndAssignIds(model.root);

  // If nothing is left, fall back to an empty tabset;
  // its id comes from the model (rather than being generated randomly) so that it matches when server rendering and hydrating
  const root =
    normalizeNode(copiedRoot, true) ??
    ({
      id: copiedRoot.id,
      tabs: [],
      type: "tabset"
    } satisfies TabsetNode<TabData, TabsetData>);

  if (isDevelopment()) {
    warnAboutDuplicateIds(root);
  }

  const next: WorkspaceModel<TabData, TabsetData> = { root, version: 1 };
  if (
    model.maximizedTabsetId !== undefined &&
    // A root tabset is the only tabset, so it can't be maximized (e.g. after the other tabsets are closed)
    root.type === "split" &&
    getAllTabsets(root).some(({ id }) => id === model.maximizedTabsetId)
  ) {
    next.maximizedTabsetId = model.maximizedTabsetId;
  }

  return next;
}
