import type { MutablePanel } from "../state/MutablePanel";
import type { ScaledPanelConstraints } from "../state/types";
import { applyScaledPanelConstraints } from "./applyScaledPanelConstraints";

export function scalePanelDimensions({
  groupSize,
  panels
}: {
  groupSize: number;
  panels: MutablePanel[];
}) {
  if (groupSize === 0) {
    // Can't calculate anything meaningful if the group has a width/height of 0
    // (This could indicate that it's within a hidden subtree)
    return panels.map((panel) => ({
      collapsedSize: 0,
      collapsible: panel.collapsible === true,
      defaultSize: undefined,
      minSize: 0,
      maxSize: 100,
      panelId: panel.id
    }));
  }

  return panels.map<ScaledPanelConstraints>((panel) => {
    return {
      collapsedSize:
        panel.collapsedSize !== undefined
          ? applyScaledPanelConstraints({
              groupSize,
              panelDOMElementInterface: panel.elementInterface,
              size: panel.collapsedSize,
              unit: panel.collapsedUnit
            })
          : 0,
      collapsible: panel.collapsible === true,
      defaultSize:
        panel.defaultSize !== undefined
          ? applyScaledPanelConstraints({
              groupSize,
              panelDOMElementInterface: panel.elementInterface,
              size: panel.defaultSize,
              unit: panel.defaultUnit
            })
          : undefined,
      maxSize:
        panel.maxSize !== undefined
          ? applyScaledPanelConstraints({
              groupSize,
              panelDOMElementInterface: panel.elementInterface,
              size: panel.maxSize,
              unit: panel.maxUnit
            })
          : 0,
      minSize:
        panel.minSize !== undefined
          ? applyScaledPanelConstraints({
              groupSize,
              panelDOMElementInterface: panel.elementInterface,
              size: panel.minSize,
              unit: panel.minUnit
            })
          : 0,
      panelId: panel.id
    };
  });
}
