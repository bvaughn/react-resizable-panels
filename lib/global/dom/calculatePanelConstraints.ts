import type { RegisteredGroup } from "../../components/group/types";
import type { PanelConstraints } from "../../components/panel/types";
import { sizeStyleToPixels } from "../styles/sizeStyleToPixels";
import { formatLayoutNumber } from "../utils/formatLayoutNumber";
import { calculateAvailableGroupSize } from "./calculateAvailableGroupSize";

export function calculatePanelConstraints(group: RegisteredGroup) {
  const { panels } = group;

  const groupSize = calculateAvailableGroupSize({ group });
  if (groupSize === 0) {
    // Can't calculate anything meaningful if the group has a width/height of 0
    // (This could indicate that it's within a hidden subtree)
    return panels.map((current) => ({
      collapsedSize: 0,
      collapsible: current.panelConstraints.collapsible === true,
      defaultSize: undefined,
      disabled: current.panelConstraints.disabled,
      minSize: 0,
      maxSize: 100,
      panelId: current.id
    }));
  }

  return panels.map<PanelConstraints>((panel) => {
    const { element, panelConstraints } = panel;

    let collapsedSize = 0;
    if (panelConstraints.collapsedSize !== undefined) {
      const pixels = sizeStyleToPixels({
        groupSize,
        panelElement: element,
        styleProp: panelConstraints.collapsedSize
      });

      collapsedSize = formatLayoutNumber((pixels / groupSize) * 100);
    }

    let defaultSize: number | undefined = undefined;
    if (panelConstraints.defaultSize !== undefined) {
      const pixels = sizeStyleToPixels({
        groupSize,
        panelElement: element,
        styleProp: panelConstraints.defaultSize
      });

      defaultSize = formatLayoutNumber((pixels / groupSize) * 100);
    }

    let minSize = 0;
    if (panelConstraints.minSize !== undefined) {
      const pixels = sizeStyleToPixels({
        groupSize,
        panelElement: element,
        styleProp: panelConstraints.minSize
      });

      minSize = formatLayoutNumber((pixels / groupSize) * 100);
    }

    let maxSize = 100;
    if (panelConstraints.maxSize !== undefined) {
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
      disabled: panelConstraints.disabled,
      minSize,
      maxSize,
      panelId: panel.id
    };
  });
}
