import type { RegisteredGroup } from "../../components/group/types";
import type { PanelConstraints } from "../../components/panel/types";
import { sizeStyleToPixels } from "../styles/sizeStyleToPixels";
import { formatLayoutNumber } from "../utils/formatLayout";
import { calculateAvailableGroupSize } from "./calculateAvailableGroupSize";

export function calculatePanelConstraints(group: RegisteredGroup) {
  const { panels } = group;

  const groupSize = calculateAvailableGroupSize({ group });

  return panels.map<PanelConstraints>((panel) => {
    const { element, panelConstraints } = panel;

    let collapsedSize: number | undefined = undefined;
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

    let minSize: number | undefined = undefined;
    if (panelConstraints.minSize) {
      const pixels = sizeStyleToPixels({
        groupSize,
        panelElement: element,
        styleProp: panelConstraints.minSize
      });

      minSize = formatLayoutNumber((pixels / groupSize) * 100);
    }

    let maxSize: number | undefined = undefined;
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
      collapsible: panelConstraints.collapsible,
      defaultSize,
      minSize,
      maxSize,
      panelId: panel.id
    };
  });
}
