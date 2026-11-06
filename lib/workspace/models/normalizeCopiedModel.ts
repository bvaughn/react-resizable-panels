import { findTabset } from "./findTabset";
import { normalizeNode } from "./normalizeNode";
import type { TabsetNode, WorkspaceModel } from "../types";

/**
 * Tidies a model whose tree has already been copied (e.g. by copyModel) and has ids, changing the copy in place;
 * see normalizeModel, which also copies (and assigns ids to) models from outside of the workspace.
 *
 * ℹ️ Nodes may be replaced (e.g. merged splits), so nodes found before normalizing should be found again afterward.
 */
export function normalizeCopiedModel<TabData, TabsetData>(
  model: WorkspaceModel<TabData, TabsetData>
): WorkspaceModel<TabData, TabsetData> {
  // If nothing is left, fall back to an empty tabset;
  // its id comes from the model (rather than being generated randomly) so that it matches when server rendering and hydrating
  const root =
    normalizeNode(model.root, true) ??
    ({
      id: model.root.id,
      tabs: [],
      type: "tabset"
    } satisfies TabsetNode<TabData, TabsetData>);

  // The root tabset fills the workspace, so it can't be collapsed
  if (root.type === "tabset") {
    delete root.collapsed;
  }

  const next: WorkspaceModel<TabData, TabsetData> = { root, version: 1 };
  if (
    model.maximizedTabsetId !== undefined &&
    // A root tabset is the only tabset, so it can't be maximized (e.g. after the other tabsets are closed)
    root.type === "split" &&
    findTabset(next, model.maximizedTabsetId)
  ) {
    next.maximizedTabsetId = model.maximizedTabsetId;
  }

  return next;
}
