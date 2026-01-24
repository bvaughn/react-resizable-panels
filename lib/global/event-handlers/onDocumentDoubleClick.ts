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
      const panelWithDefaultSize = current.panels.find(
        (panel) => panel.panelConstraints.defaultSize !== undefined
      );
      if (panelWithDefaultSize) {
        const defaultSize = panelWithDefaultSize.panelConstraints.defaultSize;
        const api = getImperativePanelMethods({
          groupId: current.group.id,
          panelId: panelWithDefaultSize.id
        });
        if (api && defaultSize !== undefined) {
          api.resize(defaultSize);

          event.preventDefault();
        }
      }
    }
  });
}
