import { createElement } from "react";
import {
  DEFAULT_STORAGE_KEY_PREFIX,
  PanelLayoutItem,
  SerializedPanelGroupState,
} from "./utils/serialization";
import { DATA_ATTRIBUTES } from "./constants";

function persist(
  /**
   * autoSaveId
   */
  i: string | null,
  /**
   * storageKeyPrefix
   */
  k?: string,
  /**
   * autoSaveId data attribute
   */
  v?: string,
  /**
   * panel data attribute
   */
  w?: string,
  /**
   * panelId
   */
  x?: string
) {
  let p: SerializedPanelGroupState | null = null;
  try {
    const r = i && localStorage.getItem(`${k}:${i}`);
    if (r) {
      const d = JSON.parse(r);
      if (typeof d === "object" && d != null) {
        p = d as SerializedPanelGroupState;
      }
    }
  } catch (error) {}

  let layout: PanelLayoutItem[] | null = null;
  if (p && typeof p === "object") {
    const keys = Object.keys(p);
    if (keys.length > 0) {
      const firstKey = keys[0];
      const stateData = firstKey ? p[firstKey] : null;
      if (stateData && typeof stateData === "object" && "layout" in stateData) {
        layout = stateData.layout;
      }
    }
  }

  const panel = document.querySelector(
    `[data-panel-id="${x}"]`
  ) as HTMLElement | null;

  if (panel && layout) {
    const panelOrderAttr = panel.getAttribute("data-panel-order");
    if (panelOrderAttr) {
      const panelOrder = parseInt(panelOrderAttr, 10);
      const item = layout.find((item) => item.order === panelOrder);
      if (item) {
        panel.style.setProperty("--panel-size", `${item.size}`);
      }
    }
  }
}

const PERSIST_STR = persist.toString();

export interface PersistScriptProps {
  nonce?: string;
  autoSaveId?: string | null;
  storageKeyPrefix?: string;
  panelId?: string;
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
    DATA_ATTRIBUTES.autoSaveId,
    DATA_ATTRIBUTES.panel,
    panelId,
  ]).slice(1, -1);

  return createElement("script", {
    suppressHydrationWarning: true,
    dangerouslySetInnerHTML: {
      __html: `(${PERSIST_STR})(${scriptArgs})`,
    },
    nonce,
  });
};
