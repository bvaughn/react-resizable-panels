import { getAllTabsets } from "./getAllTabsets";
import { normalizeFloatingTabset } from "./normalizeFloatingTabset";
import { normalizeNode } from "./normalizeNode";
import type { FloatingTabsetNode, TabsetNode, WorkspaceModel } from "../types";

/**
 * Tidies a model whose tree (and floating tabsets) have already been copied (e.g. by copyModel) and have ids, changing the copy in place;
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

  // Emptied floating tabsets are removed (like tabsets in the layout); models without floating tabsets don't have the field
  const floating = (model.floating ?? []).flatMap((tabset) => {
    const normalized = normalizeFloatingTabset(tabset);
    return normalized ? [normalized] : [];
  }) satisfies FloatingTabsetNode<TabData, TabsetData>[];
  if (floating.length > 0) {
    next.floating = floating;
  }

  if (
    model.maximizedTabsetId !== undefined &&
    // A root tabset is the only tabset, so it can't be maximized (e.g. after the other tabsets are closed);
    // nor can a floating tabset
    root.type === "split" &&
    getAllTabsets(root).some(({ id }) => id === model.maximizedTabsetId)
  ) {
    next.maximizedTabsetId = model.maximizedTabsetId;
  }

  return next;
}
