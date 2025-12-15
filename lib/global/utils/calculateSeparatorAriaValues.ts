import type { Layout } from "../../components/group/types";
import type { PanelConstraints } from "../../components/panel/types";
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
    const minSize = (valueMin = constraints.collapsible
      ? constraints.collapsedSize
      : constraints.minSize);

    const pivotIndices = [panelIndex, panelIndex + 1];

    const minSizeLayout = validatePanelGroupLayout({
      layout: adjustLayoutByDelta({
        delta: minSize - panelSize,
        initialLayout: layout,
        panelConstraints,
        pivotIndices,
        prevLayout: layout,
        trigger: "keyboard"
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
        prevLayout: layout,
        trigger: "keyboard"
      }),
      panelConstraints
    });

    valueMax = maxSizeLayout[panelId];
  }

  return {
    valueMax,
    valueMin,
    valueNow: panelSize
  };
}
