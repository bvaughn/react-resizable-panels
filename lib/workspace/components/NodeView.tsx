import type { WorkspaceNode } from "../types";
import { SplitView } from "./SplitView";
import { TabsetSlot } from "./TabsetSlot";

function NodeViewComponent({ node }: { node: WorkspaceNode }) {
  return node.type === "split" ? (
    <SplitView split={node} />
  ) : (
    <TabsetSlot tabset={node} />
  );
}

/**
 * Renders a node of the model: a split or a tabset.
 */
export const NodeView = /* @__PURE__ */ Object.assign(NodeViewComponent, {
  displayName: "Workspace.NodeView"
});
