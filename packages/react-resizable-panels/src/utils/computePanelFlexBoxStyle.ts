// This method returns flex styles using CSS variables for panel sizes

import { DragState } from "../PanelGroupContext";
import { CSSProperties } from "react";

export const panelSizeCssVar = "--panel-size";

// Returns flex styles that use CSS variables for panel sizes
export function computePanelFlexBoxStyle({
  dragState,
  order,
}: {
  dragState: DragState | null;
  order: number;
}): CSSProperties {
  return {
    flexBasis: 0,
    flexGrow: `var(--panel-${order}-size)`,
    flexShrink: 1,

    // Without this, Panel sizes may be unintentionally overridden by their content
    overflow: "hidden",

    // Disable pointer events inside of a panel during resize
    // This avoid edge cases like nested iframes
    pointerEvents: dragState !== null ? "none" : undefined,
  } as CSSProperties;
}
