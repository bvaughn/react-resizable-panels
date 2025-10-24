/**
 * The persist function that gets inlined in server-rendered HTML.
 * This function restores panel sizes from localStorage before React hydration.
 *
 * This file is the source of truth for the persist logic.
 * It gets minified and transformed by minify-persist.ts during the build.
 */

import {
  PanelLayoutItem,
  SerializedPanelGroupState,
} from "../utils/serialization";

/**
 * Persist function that runs in the browser before React hydration.
 * Restores panel sizes from localStorage to prevent layout shift.
 */
function persist(
  autoSaveId: string | null,
  storageKeyPrefix: string,
  panelIdDataAttributeName: string,
  panelOrderDataAttributeName: string,
  panelId: string,
  panelSizeCssVar: string
): void {
  let state: SerializedPanelGroupState | null = null;
  try {
    const rawState =
      autoSaveId && localStorage.getItem(storageKeyPrefix + ":" + autoSaveId);
    if (rawState) {
      const parsedState = JSON.parse(rawState);
      if (typeof parsedState === "object" && parsedState != null) {
        state = parsedState as SerializedPanelGroupState;
      }
    }
  } catch (error) {}

  if (!state) {
    return;
  }

  let layout: PanelLayoutItem[] | null = null;
  if (state && typeof state === "object") {
    const keys = Object.keys(state);
    if (keys.length > 0) {
      const firstKey = keys[0];
      const stateData = firstKey ? state[firstKey] : null;
      if (stateData && typeof stateData === "object" && "layout" in stateData) {
        layout = stateData.layout;
      }
    }
  }

  const panel = document.querySelector(
    "[" + panelIdDataAttributeName + '="' + panelId + '"]'
  ) as HTMLElement | null;

  if (panel && layout) {
    const panelOrderAttr = panel.getAttribute(
      panelOrderDataAttributeName || ""
    );
    if (panelOrderAttr) {
      const panelOrder = parseInt(panelOrderAttr, 10);
      const item = layout.find(function (item) {
        return item.order === panelOrder;
      });
      if (item) {
        panel.style.setProperty(panelSizeCssVar, String(item.size));
      }
    }
  }
}

export { persist };
