import type { MutablePanel } from "../../../state/MutablePanel";
import { adjustLayoutByDelta } from "../../../utils/adjustLayoutByDelta";
import { layoutsEqual } from "../../../utils/layoutsEqual";
import { scalePanelDimensions } from "../../../utils/scalePanelDimensions";
import { validatePanelGroupLayout } from "../../../utils/validatePanelGroupLayout";
import { getPanelSize } from "./getPanelSize";

export function setPanelSize(panel: MutablePanel, nextSize: number) {
  const prevSize = getPanelSize(panel);
  if (nextSize === prevSize) {
    return;
  }

  const { group } = panel;
  const { groupSize, layout: prevLayout, panels } = group;

  const index = group.panels.findIndex((current) => current.id === panel.id);
  const isLastPanel = index === group.panels.length - 1;

  const scaledConstraints = scalePanelDimensions({
    groupSize,
    panels
  });

  const unsafeLayout = adjustLayoutByDelta({
    delta: isLastPanel ? prevSize - nextSize : nextSize - prevSize,
    initialLayout: prevLayout,
    panelConstraints: scaledConstraints,
    pivotIndices: isLastPanel ? [index - 1, index] : [index, index + 1],
    prevLayout,
    trigger: "imperative-api"
  });

  const nextLayout = validatePanelGroupLayout({
    layout: unsafeLayout,
    panelConstraints: scaledConstraints
  });
  if (!layoutsEqual(prevLayout, nextLayout)) {
    group.startLayoutTransaction().proposedUpdate(nextLayout).endTransaction();
  }
}
