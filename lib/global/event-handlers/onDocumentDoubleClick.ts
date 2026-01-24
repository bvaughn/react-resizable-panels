import type { RegisteredGroup } from "../../components/group/types";
import type { RegisteredPanel } from "../../components/panel/types";
import { read } from "../mutableState";
import { findMatchingHitRegions } from "../utils/findMatchingHitRegions";
import { getImperativePanelMethods } from "../utils/getImperativePanelMethods";

export function onDocumentDoubleClick(event: MouseEvent) {
  if (event.defaultPrevented) {
    return;
  }

  const { mountedGroups } = read();

  const hitRegions = findMatchingHitRegions(event, mountedGroups);

  const groups = new Set<RegisteredGroup>();
  const panels = new Set<RegisteredPanel>();

  hitRegions.forEach((current) => {
    groups.add(current.group);
    current.panels.forEach((panel) => {
      panels.add(panel);
    });

    if (current.separator) {
      const primaryPanel = current.panels[0];
      if (primaryPanel.panelConstraints.defaultSize !== undefined) {
        const api = getImperativePanelMethods({
          groupId: current.group.id,
          panelId: primaryPanel.id
        });
        if (api) {
          api.resize(primaryPanel.panelConstraints.defaultSize);

          event.preventDefault();
        }
      }
    }
  });
}
