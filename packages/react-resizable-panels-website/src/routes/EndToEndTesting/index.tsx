import { ChangeEvent, useRef, useState } from "react";
import {
  ImperativePanelGroupHandle,
  ImperativePanelHandle,
} from "react-resizable-panels";

import { urlToUrlData, PanelGroupForUrlData } from "../../utils/UrlData";

import DebugLog, { ImperativeDebugLogHandle } from "../examples/DebugLog";

import "./styles.css";
import styles from "./styles.module.css";
import {
  assertImperativePanelGroupHandle,
  assertImperativePanelHandle,
} from "../../../tests/utils/assert";
import { useLayoutEffect } from "react";
import { Metadata } from "../../../tests/utils/url";

// Special route that can be configured via URL parameters.

export default function EndToEndTesting() {
  const [metadata, setMetadata] = useState<Metadata | null>(() => {
    const url = new URL(
      typeof window !== undefined ? window.location.href : ""
    );
    const metadata = url.searchParams.get("metadata");

    return metadata ? JSON.parse(metadata) : null;
  });

  const [urlPanelGroup, setUrlPanelGroup] = useState(() => {
    const url = new URL(
      typeof window !== undefined ? window.location.href : ""
    );

    return urlToUrlData(url);
  });

  useLayoutEffect(() => {
    window.addEventListener("popstate", (event) => {
      const url = new URL(
        typeof window !== undefined ? window.location.href : ""
      );

      setUrlPanelGroup(urlToUrlData(url));

      const metadata = url.searchParams.get("metadata");
      setMetadata(metadata ? JSON.parse(metadata) : null);
    });
  }, []);

  useLayoutEffect(() => {
    const observer = new MutationObserver((mutationRecords) => {
      mutationRecords.forEach((mutationRecord) => {
        const panelElement = mutationRecord.target as HTMLElement;
        if (panelElement.childNodes.length > 0) {
          return;
        }

        const panelSize = parseFloat(panelElement.style.flexGrow);

        const panelGroupElement = panelElement.parentElement!;
        const groupId = panelGroupElement.getAttribute("data-panel-group-id");
        const direction = panelGroupElement.getAttribute(
          "data-panel-group-direction"
        );
        const resizeHandles = Array.from(
          panelGroupElement.querySelectorAll(
            `[data-panel-resize-handle-id][data-panel-group-id="${groupId}"]`
          )
        ) as HTMLElement[];

        let panelGroupPixels =
          direction === "horizontal"
            ? panelGroupElement.offsetWidth
            : panelGroupElement.offsetHeight;
        if (direction === "horizontal") {
          panelGroupPixels -= resizeHandles.reduce((accumulated, handle) => {
            return accumulated + handle.offsetWidth;
          }, 0);
        } else {
          panelGroupPixels -= resizeHandles.reduce((accumulated, handle) => {
            return accumulated + handle.offsetHeight;
          }, 0);
        }

        panelElement.textContent = `${panelSize.toFixed(1)}%\n${(
          (panelSize / 100) *
          panelGroupPixels
        ).toFixed(1)}px`;
      });
    });

    const elements = document.querySelectorAll("[data-panel]");
    Array.from(elements).forEach((element) => {
      observer.observe(element, {
        attributes: true,
      });
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const [panelId, setPanelId] = useState("");
  const [panelGroupId, setPanelGroupId] = useState("");
  const [size, setSize] = useState(0);
  const [layoutString, setLayoutString] = useState("");

  const debugLogRef = useRef<ImperativeDebugLogHandle>(null);
  const idToRefMapRef = useRef<
    Map<string, ImperativePanelHandle | ImperativePanelGroupHandle>
  >(new Map());

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
      <div className={styles.Children}>
        {urlPanelGroup && (
          <PanelGroupForUrlData
            debugLogRef={debugLogRef}
            idToRefMapRef={idToRefMapRef}
            metadata={metadata}
            urlPanelGroup={urlPanelGroup}
          />
        )}
      </div>
      <DebugLog apiRef={debugLogRef} />
    </div>
  );
}
