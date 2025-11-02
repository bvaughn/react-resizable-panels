// This method returns flex styles using CSS variables for panel sizes

import { PANEL_SIZE_CSS_VARIABLE_TEMPLATE } from "../constants";
import { DragState } from "../PanelGroupContext";
import { CSSProperties } from "react";

// Returns flex styles that use CSS variables for panel sizes
export function computePanelFlexBoxStyle({
  dragState,
  order,
  autoSaveId = null,
}: {
  dragState: DragState | null;
  order: number;
  autoSaveId?: string | null;
}): CSSProperties {
  const panelSizeCssVar = PANEL_SIZE_CSS_VARIABLE_TEMPLATE.replace(
    "%s",
    order.toString()
  );
  const panelRootSizeCssVar = PANEL_SIZE_CSS_VARIABLE_TEMPLATE.replace(
    "%s",
    `${autoSaveId}-${order.toString()}`
  );
  const flexGrow = autoSaveId
    ? `var(${panelSizeCssVar}, var(${panelRootSizeCssVar}))`
    : `var(${panelSizeCssVar})`;

  return {
    flexBasis: 0,
    flexGrow,
    flexShrink: 1,

    // Without this, Panel sizes may be unintentionally overridden by their content
    overflow: "hidden",

    // Disable pointer events inside of a panel during resize
    // This avoid edge cases like nested iframes
    pointerEvents: dragState !== null ? "none" : undefined,
  } as CSSProperties;
}
