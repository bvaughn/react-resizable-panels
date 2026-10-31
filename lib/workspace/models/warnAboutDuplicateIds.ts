import { warnOnce } from "../../shared/utils/warnOnce";
import type { WorkspaceNode } from "../types";

export function warnAboutDuplicateIds(root: WorkspaceNode) {
  const ids = new Set<string>();

  const visit = (id: string) => {
    if (ids.has(id)) {
      warnOnce(`Duplicate id found in workspace model: "${id}"`);
    }
    ids.add(id);
  };

  const visitNode = (node: WorkspaceNode) => {
    visit(node.id);

    if (node.type === "split") {
      node.children.forEach(visitNode);
    } else {
      node.tabs.forEach(({ id }) => visit(id));
    }
  };

  visitNode(root);
}
