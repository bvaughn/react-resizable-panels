import type { MutablePanel } from "../state/MutablePanel";
import type {
  ScaledPanelConstraints,
  ScalePanelConstraintFunction
} from "../state/types";

export function calculateScaledPanelConstraints(
  groupSize: number,
  panel: MutablePanel,
  scalePanelConstraintFunction: ScalePanelConstraintFunction
): ScaledPanelConstraints {
  return {
    collapsedSize:
      panel.collapsedSize !== undefined
        ? scalePanelConstraintFunction(
            panel.collapsedSize,
            panel.collapsedUnit,
            groupSize
          )
        : 0,
    collapsible: panel.collapsible === true,
    defaultSize:
      panel.defaultSize !== undefined
        ? scalePanelConstraintFunction(
            panel.defaultSize,
            panel.defaultUnit,
            groupSize
          )
        : undefined,
    maxSize:
      panel.maxSize !== undefined
        ? scalePanelConstraintFunction(panel.maxSize, panel.maxUnit, groupSize)
        : 0,
    minSize:
      panel.minSize !== undefined
        ? scalePanelConstraintFunction(panel.minSize, panel.minUnit, groupSize)
        : 0,
    panelId: panel.id
  };
}
