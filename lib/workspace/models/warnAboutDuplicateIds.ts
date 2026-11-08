import { warnOnce } from "../../shared/utils/warnOnce";
import type { TabsetNode, WorkspaceModel, WorkspaceNode } from "../types";

// Ids are unique across the layout and its floating tabsets
export function warnAboutDuplicateIds(model: WorkspaceModel) {
  const ids = new Set<string>();

  const visit = (id: string) => {
    if (ids.has(id)) {
      if (process.env.NODE_ENV !== "production") {
        warnOnce(`Duplicate id found in workspace model: "${id}"`);
      }
    }
    ids.add(id);
  };

  const visitNode = (node: WorkspaceNode | TabsetNode) => {
    visit(node.id);

    if (node.type === "split") {
      node.children.forEach(visitNode);
    } else {
      node.tabs.forEach(({ id }) => visit(id));
    }
  };

  visitNode(model.root);
  model.floating?.forEach(visitNode);
}
