import { createElement } from "react";
import {
  DEFAULT_STORAGE_KEY_PREFIX,
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

  console.log("PersistScript loaded", p);

  let layout = null;
  if (p && typeof p === "object") {
    const keys = Object.keys(p);
    if (keys.length > 0) {
      const firstKey = keys[0];
      const stateData = p[firstKey];
      if (stateData && typeof stateData === "object" && "layout" in stateData) {
        layout = stateData.layout;
      }
    }
  }

  console.log("Extracted layout:", layout);

  // // find element with data attribute
  // const panelGroupElement = document.querySelector(
  //   `[${v}="${i}"]`
  // ) as HTMLElement | null;

  // console.log("Found panel group element:", panelGroupElement);

  // // find immediate children with data-panel attributes
  // const panelElements = panelGroupElement?.querySelectorAll(
  //   `:scope > [${w}=""]`
  // ) as NodeListOf<HTMLElement>;

  // console.log("Found panel elements:", panelElements);

  // // go through panelElements and add css variable --panel-size
  // if (panelElements && layout && Array.isArray(layout)) {
  //   panelElements.forEach((el, index) => {
  //     const size = layout ? layout[index] : null;
  //     if (size != null) {
  //       el.style.setProperty("--panel-size", `${size}%`);
  //       console.log(
  //         `Set --panel-size for panel ${index} to ${size}%`,
  //         el,
  //         size
  //       );
  //     }
  //   });
  // }

  // find the panel with the panelId
  const panel = document.querySelector(
    `[data-panel-id="${x}"]`
  ) as HTMLElement | null;

  console.log("Found panel element:", panel);

  // set the --panel-size css variable on the panel
  if (panel && layout) {
    panel.style.setProperty("--panel-size-x", `${layout}%`);
    console.log(`Set --panel-size for panel ${x} to ${layout}%`, panel);
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
