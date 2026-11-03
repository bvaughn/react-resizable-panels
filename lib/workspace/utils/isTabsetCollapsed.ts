import type { TabsetNode } from "../types";

// Whether a tabset is shown collapsed. It's usually shown as the model has it, but it may be shown differently (see the Workspace's collapseOverrides):
// - While a split is being resized, its tabsets are shown as they'll be when the resize ends (see SplitView), which the model only reflects once it does
// - When a split's tabsets don't fit (e.g. the workspace is narrower than their minimum sizes), its Group may collapse some of them,
//   which the model doesn't reflect (so they're shown expanded again once they fit)
export function isTabsetCollapsed(
  tabset: TabsetNode,
  collapseOverrides: { [tabsetId: string]: boolean }
) {
  return collapseOverrides[tabset.id] ?? !!tabset.collapsed;
}
