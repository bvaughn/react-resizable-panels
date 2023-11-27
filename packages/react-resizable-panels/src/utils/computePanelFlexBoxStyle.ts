// This method returns a number between 1 and 100 representing

import { PanelData } from "../Panel";
import { DragState } from "../PanelGroupContext";
import { CSSProperties } from "../vendor/react";

// the % of the group's overall space this panel should occupy.
export function computePanelFlexBoxStyle({
  dragState,
  layout,
  panelData,
  panelIndex,
  precision = 3,
}: {
  layout: number[];
  dragState: DragState | null;
  panelData: PanelData[];
  panelIndex: number;
  precision?: number;
}): CSSProperties {
  const size = layout[panelIndex];

  let flexGrow;
  if (panelData.length === 1) {
    flexGrow = "1";
  } else if (size == null) {
    // Initial render (before panels have registered themselves)
    flexGrow = "1";
  } else {
    flexGrow = size.toPrecision(precision);
  }

  return {
    flexBasis: 0,
    flexGrow,
    flexShrink: 1,

    // Without this, Panel sizes may be unintentionally overridden by their content
    overflow: "hidden",

    // Disable pointer events inside of a panel during resize
    // This avoid edge cases like nested iframes
    pointerEvents: dragState !== null ? "none" : undefined,
  };
}
