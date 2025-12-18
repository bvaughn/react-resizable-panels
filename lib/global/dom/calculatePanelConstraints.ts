import type { RegisteredGroup } from "../../components/group/types";
import type { PanelConstraints } from "../../components/panel/types";
import { sizeStyleToPixels } from "../styles/sizeStyleToPixels";
import { formatLayoutNumber } from "../utils/formatLayoutNumber";
import { calculateAvailableGroupSize } from "./calculateAvailableGroupSize";

export function calculatePanelConstraints(group: RegisteredGroup) {
  const { element, panels } = group;

  if (
    typeof element.checkVisibility === "function" &&
    !element.checkVisibility()
  ) {
    // Can't calculate anything meaningful if we're within an offscreen tree
    return panels.map((current) => ({
      collapsedSize: 0,
      collapsible: current.panelConstraints.collapsible === true,
      defaultSize: undefined,
      minSize: 0,
      maxSize: 100,
      panelId: current.id
    }));
  }

  const groupSize = calculateAvailableGroupSize({ group });

  return panels.map<PanelConstraints>((panel) => {
    const { element, panelConstraints } = panel;

    let collapsedSize = 0;
    if (panelConstraints.collapsedSize) {
      const pixels = sizeStyleToPixels({
        groupSize,
        panelElement: element,
        styleProp: panelConstraints.collapsedSize
      });

      collapsedSize = formatLayoutNumber((pixels / groupSize) * 100);
    }

    let defaultSize: number | undefined = undefined;
    if (panelConstraints.defaultSize) {
      const pixels = sizeStyleToPixels({
        groupSize,
        panelElement: element,
        styleProp: panelConstraints.defaultSize
      });

      defaultSize = formatLayoutNumber((pixels / groupSize) * 100);
    }

    let minSize = 0;
    if (panelConstraints.minSize) {
      const pixels = sizeStyleToPixels({
        groupSize,
        panelElement: element,
        styleProp: panelConstraints.minSize
      });

      minSize = formatLayoutNumber((pixels / groupSize) * 100);
    }

    let maxSize = 100;
    if (panelConstraints.maxSize) {
      const pixels = sizeStyleToPixels({
        groupSize,
        panelElement: element,
        styleProp: panelConstraints.maxSize
      });

      maxSize = formatLayoutNumber((pixels / groupSize) * 100);
    }

    return {
      collapsedSize,
      collapsible: panelConstraints.collapsible === true,
      defaultSize,
      minSize,
      maxSize,
      panelId: panel.id
    };
  });
}
