import type { Layout } from "../components/group/types";
import type { PanelConstraints } from "../components/panel/types";
import { adjustLayoutByDelta } from "./adjustLayoutByDelta";
import { validatePanelGroupLayout } from "./validatePanelGroupLayout";

export function calculateSeparatorAriaValues({
  layout,
  panelConstraints,
  panelId,
  panelIndex
}: {
  layout: Layout;
  panelConstraints: PanelConstraints[];
  panelId: string;
  panelIndex: number;
}): {
  valueControls: string | undefined;
  valueMax: number | undefined;
  valueMin: number | undefined;
  valueNow: number | undefined;
} {
  let valueMax: number | undefined = undefined;
  let valueMin: number | undefined = undefined;

  const panelSize = layout[panelId];

  const constraints = panelConstraints.find(
    (current) => current.panelId === panelId
  );
  if (constraints) {
    const maxSize = constraints.maxSize;
    const minSize = constraints.collapsible
      ? constraints.collapsedSize
      : constraints.minSize;

    const pivotIndices = [panelIndex, panelIndex + 1];

    const minSizeLayout = validatePanelGroupLayout({
      layout: adjustLayoutByDelta({
        delta: minSize - panelSize,
        initialLayout: layout,
        panelConstraints,
        pivotIndices,
        prevLayout: layout
      }),
      panelConstraints
    });

    valueMin = minSizeLayout[panelId];

    const maxSizeLayout = validatePanelGroupLayout({
      layout: adjustLayoutByDelta({
        delta: maxSize - panelSize,
        initialLayout: layout,
        panelConstraints,
        pivotIndices,
        prevLayout: layout
      }),
      panelConstraints
    });

    valueMax = maxSizeLayout[panelId];
  }

  return {
    valueControls: panelId,
    valueMax,
    valueMin,
    valueNow: panelSize
  };
}
