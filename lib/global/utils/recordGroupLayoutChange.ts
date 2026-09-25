import type { Layout, RegisteredGroup } from "../../components/group/types";
import type { PanelConstraints } from "../../components/panel/types";
import { layoutNumbersEqual } from "./layoutNumbersEqual";

/**
 * Updates the in-memory bookkeeping a Group needs to restore previous layouts:
 * - Cache the layout (keyed by panel ids) so it persists when the panel configuration changes.
 *   This improves UX for conditionally rendered panels without requiring defaultLayout.
 * - Record the pre-collapse size of any collapsible panel that was just collapsed,
 *   so that it can be restored when the panel is expanded (e.g. via the keyboard)
 */
export function recordGroupLayoutChange({
  derivedPanelConstraints,
  group,
  layout,
  prevLayout
}: {
  derivedPanelConstraints: PanelConstraints[];
  group: RegisteredGroup;
  layout: Layout;
  prevLayout: Layout | undefined;
}) {
  const panelIdsKey = group.panels.map(({ id }) => id).join(",");
  group.mutableState.layouts[panelIdsKey] = layout;

  if (prevLayout) {
    derivedPanelConstraints.forEach((constraints) => {
      if (constraints.collapsible) {
        const isCollapsed = layoutNumbersEqual(
          constraints.collapsedSize,
          layout[constraints.panelId]
        );
        const wasCollapsed = layoutNumbersEqual(
          constraints.collapsedSize,
          prevLayout[constraints.panelId]
        );
        if (isCollapsed && !wasCollapsed) {
          group.mutableState.expandedPanelSizes[constraints.panelId] =
            prevLayout[constraints.panelId];
        }
      }
    });
  }
}
