import type { TabsetNode } from "../types";

// Whether a tabset is shown collapsed: while a split is being resized, its tabsets are shown as they'll be when the resize ends
// (see SplitView), which the model only reflects once it does
export function isTabsetCollapsed(
  tabset: TabsetNode,
  collapsePreview: { [tabsetId: string]: boolean }
) {
  return collapsePreview[tabset.id] ?? !!tabset.collapsed;
}
