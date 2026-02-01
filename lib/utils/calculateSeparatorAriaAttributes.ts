import type { Layout } from "../components/group/types";
import type {
  ScaledPanelConstraints,
  SeparatorAriaAttributes
} from "../state/types";
import { adjustLayoutByDelta } from "./adjustLayoutByDelta";
import { validatePanelGroupLayout } from "./validatePanelGroupLayout";

export function calculateSeparatorAriaAttributes({
  panelConstraints,
  layout,
  panelId,
  panelIndex
}: {
  panelConstraints: ScaledPanelConstraints[];
  layout: Layout;
  panelId: string;
  panelIndex: number;
}): SeparatorAriaAttributes {
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
    ariaControls: panelId,
    ariaValueMax: valueMax,
    ariaValueMin: valueMin,
    ariaValueNow: panelSize
  };
}
