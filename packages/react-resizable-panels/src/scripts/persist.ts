/**
 * The persist function that gets inlined in server-rendered HTML.
 * This function restores panel sizes from localStorage before React hydration.
 *
 * This file is the source of truth for the persist logic.
 * It gets minified and transformed by minify-persist.ts during the build.
 */

import type {
  PanelLayoutItem,
  SerializedPanelGroupState,
} from "../utils/serialization";

/**
 * Persist function that runs in the browser before React hydration.
 * Restores panel sizes from localStorage to prevent layout shift.
 */
function persist(
  storageKeyPrefix: string,
  panelSizeCssVariableTemplate: string,
  precision = 3
): void {
  const cssRules: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(storageKeyPrefix + ":")) {
      continue;
    }

    const autoSaveId = key.substring(storageKeyPrefix.length + 1);
    if (!autoSaveId) {
      continue;
    }

    let state: SerializedPanelGroupState | null = null;
    try {
      const rawState = localStorage.getItem(key);
      if (rawState) {
        const parsedState = JSON.parse(rawState);
        if (typeof parsedState === "object" && parsedState != null) {
          state = parsedState as SerializedPanelGroupState;
        }
      }
    } catch (error) {
      continue;
    }

    if (!state) {
      continue;
    }

    let layout: PanelLayoutItem[] | null = null;
    if (state && typeof state === "object") {
      const keys = Object.keys(state);
      if (keys.length > 0) {
        const firstKey = keys[0];
        const stateData = firstKey ? state[firstKey] : null;
        if (
          stateData &&
          typeof stateData === "object" &&
          "layout" in stateData
        ) {
          layout = stateData.layout as PanelLayoutItem[];
        }
      }
    }

    if (layout) {
      layout.forEach((item) => {
        const cssVarName = panelSizeCssVariableTemplate.replace(
          "%s",
          `${autoSaveId}-${item.order.toString()}`
        );
        cssRules.push(`${cssVarName}: ${item.size.toFixed(precision)};`);
      });
    }
  }

  if (cssRules.length > 0) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(`:root { ${cssRules.join(" ")} }`);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  }
}

export { persist };
