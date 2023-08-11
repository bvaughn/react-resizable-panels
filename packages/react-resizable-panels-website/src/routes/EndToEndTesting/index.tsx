import {
  ChangeEvent,
  Component,
  ErrorInfo,
  PropsWithChildren,
  useRef,
  useState,
} from "react";
import {
  ImperativePanelGroupHandle,
  ImperativePanelHandle,
  getAvailableGroupSizePixels,
} from "react-resizable-panels";

import { urlPanelGroupToPanelGroup, urlToUrlData } from "../../utils/UrlData";

import DebugLog, { ImperativeDebugLogHandle } from "../examples/DebugLog";

import { useLayoutEffect } from "react";
import {
  assertImperativePanelGroupHandle,
  assertImperativePanelHandle,
} from "../../../tests/utils/assert";
import Icon from "../../components/Icon";
import "./styles.css";
import styles from "./styles.module.css";

// Special route that can be configured via URL parameters.

class ErrorBoundary extends Component<PropsWithChildren> {
  state = {
    didError: false,
  };

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(error);
  }

  render() {
    return this.state.didError ? null : this.props.children;
  }
}

function EndToEndTesting() {
  const [urlData, setUrlData] = useState(() => {
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

      setUrlData(urlToUrlData(url));
    });
  }, []);

  useLayoutEffect(() => {
    const calculatePanelSize = (panelElement: HTMLElement) => {
      if (panelElement.childElementCount > 0) {
        return; // Don't override nested groups
      }

      const panelSize = parseFloat(panelElement.style.flexGrow);

      const panelGroupElement = panelElement.parentElement!;
      const groupId = panelGroupElement.getAttribute("data-panel-group-id")!;
      const panelGroupPixels = getAvailableGroupSizePixels(groupId);

      panelElement.textContent = `${panelSize.toFixed(1)}%\n${(
        (panelSize / 100) *
        panelGroupPixels
      ).toFixed(1)}px`;
    };

    const observer = new MutationObserver((mutationRecords) => {
      mutationRecords.forEach((mutationRecord) => {
        calculatePanelSize(mutationRecord.target as HTMLElement);
      });
    });

    const elements = document.querySelectorAll("[data-panel]");
    Array.from(elements).forEach((element) => {
      observer.observe(element, {
        attributes: true,
      });

      calculatePanelSize(element as HTMLElement);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const [panelId, setPanelId] = useState("");
  const [panelGroupId, setPanelGroupId] = useState("");
  const [size, setSize] = useState(0);
  const [units, setUnits] = useState("");
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

  const onUnitsInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    setUnits(value);
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
      panel.resize(size, (units as any) || undefined);
    }
  };

  const onSetLayoutButton = () => {
    const idToRefMap = idToRefMapRef.current;
    const panelGroup = idToRefMap.get(panelGroupId);
    if (panelGroup && assertImperativePanelGroupHandle(panelGroup)) {
      panelGroup.setLayout(
        JSON.parse(layoutString),
        (units as any) || undefined
      );
    }
  };

  return (
    <div className={styles.Container}>
      <div className={styles.FormRow}>
        <div className={styles.FormColumn}>
          <input
            className={styles.Input}
            id="panelIdInput"
            onChange={onPanelIdInputChange}
            placeholder="Panel id"
            type="string"
          />
          <button
            id="collapseButton"
            onClick={onCollapseButtonClick}
            title="Collapse panel"
          >
            <Icon type="collapse" />
          </button>
          <button
            id="expandButton"
            onClick={onExpandButtonClick}
            title="Expand panel"
          >
            <Icon type="expand" />
          </button>
          <input
            className={styles.Input}
            id="sizeInput"
            max={100}
            min={0}
            onChange={onSizeInputChange}
            placeholder="Size"
            type="number"
          />
          <button
            id="resizeButton"
            onClick={onResizeButtonClick}
            title="Resize panel"
          >
            <Icon type="resize" />
          </button>
        </div>
        <div className={styles.FormColumn}>
          <input
            className={styles.Input}
            id="unitsInput"
            onChange={onUnitsInputChange}
            placeholder="Units"
            type="string"
          />
        </div>
        <div className={styles.FormColumn}>
          <input
            className={styles.Input}
            id="panelGroupIdInput"
            onChange={onPanelGroupIdInputChange}
            placeholder="Group id"
            type="string"
          />
          <input
            className={styles.Input}
            id="layoutInput"
            onChange={onLayoutInputChange}
            placeholder="Layout"
            type="string"
          />
          <button
            id="setLayoutButton"
            onClick={onSetLayoutButton}
            title="Set layout"
          >
            <Icon type="resize" />
          </button>
        </div>
      </div>
      <div className={styles.Children}>{children}</div>
      <DebugLog apiRef={debugLogRef} />
    </div>
  );
}

export default function Page() {
  return (
    <ErrorBoundary>
      <EndToEndTesting />
    </ErrorBoundary>
  );
}
