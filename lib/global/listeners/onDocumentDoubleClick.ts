import { setPanelSize } from "../../components/panel/utils/setPanelSize";
import { groups } from "../../state/Root";
import { findMatchingHitRegions } from "../../utils/findMatchingHitRegions";

export function onDocumentDoubleClick(event: MouseEvent) {
  if (event.defaultPrevented) {
    return;
  }

  const hitRegions = findMatchingHitRegions(event, groups);
  hitRegions.forEach((current) => {
    if (current.separator) {
      const panelWithDefaultSize = current.panels.find(
        (panel) => panel.defaultSize !== undefined
      );
      if (panelWithDefaultSize) {
        const defaultSize = panelWithDefaultSize.defaultSize;
        if (defaultSize !== undefined) {
          setPanelSize(panelWithDefaultSize, defaultSize);

          event.preventDefault();
        }
      }
    }
  });
}
