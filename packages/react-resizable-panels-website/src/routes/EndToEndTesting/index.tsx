import { ChangeEvent, useRef, useState } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";

import { urlToUrlData, urlPanelGroupToPanelGroup } from "../../utils/UrlData";

import DebugLog, { ImperativeDebugLogHandle } from "../examples/DebugLog";

import "./styles.css";
import styles from "./styles.module.css";

// Special route that can be configured via URL parameters.

export default function EndToEndTesting() {
  const url = new URL(typeof window !== undefined ? window.location.href : "");
  const urlData = urlToUrlData(url);

  const [panelId, setPanelId] = useState("");
  const [size, setSize] = useState(0);

  const debugLogRef = useRef<ImperativeDebugLogHandle>(null);
  const idToPanelMapRef = useRef<Map<string, ImperativePanelHandle>>(new Map());

  const children = urlData
    ? urlPanelGroupToPanelGroup(urlData, debugLogRef, idToPanelMapRef)
    : null;

  const onPanelIdInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    setPanelId(value);
  };

  const onSizeInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    setSize(parseFloat(value));
  };

  const onCollapseButtonClick = () => {
    const idToPanelMap = idToPanelMapRef.current;
    const panel = idToPanelMap.get(panelId);
    if (panel) {
      panel.collapse();
    }
  };

  const onExpandButtonClick = () => {
    const idToPanelMap = idToPanelMapRef.current;
    const panel = idToPanelMap.get(panelId);
    if (panel) {
      panel.expand();
    }
  };

  const onResizeButtonClick = () => {
    const idToPanelMap = idToPanelMapRef.current;
    const panel = idToPanelMap.get(panelId);
    if (panel) {
      panel.resize(size);
    }
  };

  return (
    <div className={styles.Container}>
      <div className={styles.FormRow}>
        <input
          id="panelIdInput"
          onChange={onPanelIdInputChange}
          type="string"
        />
        <button id="collapseButton" onClick={onCollapseButtonClick}>
          collapse
        </button>
        <button id="expandButton" onClick={onExpandButtonClick}>
          expand
        </button>
        <button id="resizeButton" onClick={onResizeButtonClick}>
          resize
        </button>
        <input
          id="sizeInput"
          max={100}
          min={0}
          onChange={onSizeInputChange}
          type="number"
        />
      </div>
      <div className={styles.Children}>{children}</div>
      <DebugLog apiRef={debugLogRef} />
    </div>
  );
}
