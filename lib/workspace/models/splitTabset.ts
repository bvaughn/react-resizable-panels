import { createId } from "./createId";
import { findParent } from "./findParent";
import type {
  SplitNode,
  TabDropRegion,
  TabsetNode,
  WorkspaceNode
} from "../types";

// Returns the new root (which changes if the root tabset is split)
export function splitTabset<Node extends WorkspaceNode>(
  root: Node,
  target: TabsetNode,
  inserted: TabsetNode,
  region: Exclude<TabDropRegion, "center">
): Node {
  const orientation =
    region === "left" || region === "right" ? "horizontal" : "vertical";
  const insertBefore = region === "left" || region === "top";

  const parent = findParent(root, target.id);
  if (parent && parent.orientation === orientation) {
    // Share the target's space with the new tabset (when it can be calculated)
    const index = parent.children.indexOf(target);
    if (typeof target.size === "number") {
      target.size /= 2;
      inserted.size = target.size;
    } else {
      inserted.size = undefined;
    }
    parent.children.splice(insertBefore ? index : index + 1, 0, inserted);

    return root;
  }

  // Wrap the target in a new split in the other direction
  const split: SplitNode = {
    children: insertBefore ? [inserted, target] : [target, inserted],
    id: createId(),
    orientation,
    size: target.size,
    type: "split"
  };
  target.size = 50;
  inserted.size = 50;

  if (parent) {
    parent.children[parent.children.indexOf(target)] = split;

    return root;
  }

  return split as Node;
}
