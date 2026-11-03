import type { SplitNode, TabsetNode } from "../types";

// A tabset can be collapsed if it's collapsible and some other child of its split stays expanded
// (the root tabset has no split; expanded children fill the split's space)
export function canCollapseTabset(
  parent: SplitNode | undefined,
  tabset: TabsetNode
) {
  return (
    !!tabset.collapsible &&
    !!parent &&
    parent.children.some(
      (child) =>
        child.id !== tabset.id && !(child.type === "tabset" && child.collapsed)
    )
  );
}
