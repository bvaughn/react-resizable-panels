import { ChangeEvent, useRef, useState } from "react";
import {
  ImperativePanelGroupHandle,
  ImperativePanelHandle,
} from "react-resizable-panels";

import { urlToUrlData, urlPanelGroupToPanelGroup } from "../../utils/UrlData";

import DebugLog, { ImperativeDebugLogHandle } from "../examples/DebugLog";

import "./styles.css";
import styles from "./styles.module.css";
import {
  assertImperativePanelGroupHandle,
  assertImperativePanelHandle,
} from "../../../tests/utils/assert";

// Special route that can be configured via URL parameters.

export default function EndToEndTesting() {
  const url = new URL(typeof window !== undefined ? window.location.href : "");
  const urlData = urlToUrlData(url);

  const [panelId, setPanelId] = useState("");
  const [panelGroupId, setPanelGroupId] = useState("");
  const [size, setSize] = useState(0);
  const [layoutString, setLayoutString] = useState("");

  const debugLogRef = useRef<ImperativeDebugLogHandle>(null);
  const idToRefMapRef = useRef<
    Map<string, ImperativePanelHandle | ImperativePanelGroupHandle>
  >(new Map());

  const children = urlData
    ? urlPanelGroupToPanelGroup(urlData, debugLogRef, idToRefMapRef)
    : null;

  const onLayoutInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    setLayoutString(value);
  };

  const onPanelIdInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    setPanelId(value);
  };

  const onPanelGroupIdInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    setPanelGroupId(value);
  };

  const onSizeInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    setSize(parseFloat(value));
  };

  const onCollapseButtonClick = () => {
    const idToRefMap = idToRefMapRef.current;
    const panel = idToRefMap.get(panelId);
    if (panel && assertImperativePanelHandle(panel)) {
      panel.collapse();
    }
  };

  const onExpandButtonClick = () => {
    const idToRefMap = idToRefMapRef.current;
    const panel = idToRefMap.get(panelId);
    if (panel && assertImperativePanelHandle(panel)) {
      panel.expand();
    }
  };

  const onResizeButtonClick = () => {
    const idToRefMap = idToRefMapRef.current;
    const panel = idToRefMap.get(panelId);
    if (panel && assertImperativePanelHandle(panel)) {
      panel.resize(size);
    }
  };

  const onSetLayoutButton = () => {
    const idToRefMap = idToRefMapRef.current;
    const panelGroup = idToRefMap.get(panelGroupId);
    if (panelGroup && assertImperativePanelGroupHandle(panelGroup)) {
      panelGroup.setLayout(JSON.parse(layoutString));
    }
  };

  return (
    <div className={styles.Container}>
      <div className={styles.FormRow}>
        <div className={styles.FormColumn}>
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
        <div className={styles.FormColumn}>
          <input
            id="panelGroupIdInput"
            onChange={onPanelGroupIdInputChange}
            type="string"
          />
          <input
            id="layoutInput"
            onChange={onLayoutInputChange}
            type="string"
          />
          <button id="setLayoutButton" onClick={onSetLayoutButton}>
            set layout
          </button>
        </div>
      </div>
      <div className={styles.Children}>{children}</div>
      <DebugLog apiRef={debugLogRef} />
    </div>
  );
}
