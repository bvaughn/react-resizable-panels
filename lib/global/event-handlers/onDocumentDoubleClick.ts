import { getMountedGroups } from "../mutable-state/groups";
import { findMatchingHitRegions } from "../utils/findMatchingHitRegions";
import { getImperativePanelMethods } from "../utils/getImperativePanelMethods";

export function onDocumentDoubleClick(event: MouseEvent) {
  if (event.defaultPrevented) {
    return;
  }

  const mountedGroups = getMountedGroups();
  const hitRegions = findMatchingHitRegions(event, mountedGroups);
  hitRegions.forEach((current) => {
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
