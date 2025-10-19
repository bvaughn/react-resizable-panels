import { createElement } from "react";
import {
  DEFAULT_STORAGE_KEY_PREFIX,
  PanelLayoutItem,
  SerializedPanelGroupState,
} from "./utils/serialization";
import { DATA_ATTRIBUTES } from "./constants";
import { panelSizeCssVar } from "./utils/computePanelFlexBoxStyle";

function persist(
  autoSaveId: string | null,
  storageKeyPrefix: string,
  panelIdDataAttributeName: string,
  panelOrderDataAttributeName: string,
  panelId: string,
  panelSizeCssVar: string
) {
  let state: SerializedPanelGroupState | null = null;
  try {
    const rawState =
      autoSaveId && localStorage.getItem(`${storageKeyPrefix}:${autoSaveId}`);
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
    `[${panelIdDataAttributeName}="${panelId}"]`
  ) as HTMLElement | null;

  if (panel && layout) {
    const panelOrderAttr = panel.getAttribute(
      panelOrderDataAttributeName || ""
    );
    if (panelOrderAttr) {
      const panelOrder = parseInt(panelOrderAttr, 10);
      const item = layout.find((item) => item.order === panelOrder);
      if (item) {
        panel.style.setProperty(panelSizeCssVar, `${item.size}`);
      }
    }
  }
}

const PERSIST_STR = persist.toString();

export interface PersistScriptProps {
  panelId: string;
  autoSaveId: string | null;
  storageKeyPrefix?: string;
  nonce?: string;
}

export const PersistScript = ({
  nonce,
  autoSaveId,
  storageKeyPrefix = DEFAULT_STORAGE_KEY_PREFIX,
  panelId,
}: PersistScriptProps) => {
  const scriptArgs = JSON.stringify([
    autoSaveId,
    storageKeyPrefix,
    DATA_ATTRIBUTES.panelId,
    DATA_ATTRIBUTES.panelOrder,
    panelId,
    panelSizeCssVar,
  ]).slice(1, -1);

  return createElement("script", {
    suppressHydrationWarning: true,
    dangerouslySetInnerHTML: {
      __html: `(${PERSIST_STR})(${scriptArgs})`,
    },
    nonce,
  });
};
