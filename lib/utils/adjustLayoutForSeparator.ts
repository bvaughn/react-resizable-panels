import { adjustLayoutByDelta } from "./adjustLayoutByDelta";
import { findHitRegionForSeparatorElement } from "./findHitRegionForSeparatorElement";
import { layoutsEqual } from "./layoutsEqual";
import { scalePanelDimensions } from "./scalePanelDimensions";
import { validatePanelGroupLayout } from "./validatePanelGroupLayout";

export function adjustLayoutForSeparator(
  separatorElement: HTMLElement,
  delta: number
) {
  const { group, panels } = findHitRegionForSeparatorElement(separatorElement);

  const pivotIndices = panels.map((panel) => group.panels.indexOf(panel));

  const scaledConstraints = scalePanelDimensions({
    groupSize: group.groupSize,
    panels: group.panels
  });

  const unsafeLayout = adjustLayoutByDelta({
    delta,
    initialLayout: group.layout,
    panelConstraints: scaledConstraints,
    pivotIndices,
    prevLayout: group.layout,
    trigger: "keyboard"
  });

  const nextLayout = validatePanelGroupLayout({
    layout: unsafeLayout,
    panelConstraints: scaledConstraints
  });

  if (!layoutsEqual(group.layout, nextLayout)) {
    group.startLayoutTransaction().proposedUpdate(nextLayout).endTransaction();
  }
}
